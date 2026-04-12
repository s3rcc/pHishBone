using Domain.Constants;
using Domain.Enums;

namespace Domain.Services.TankAnalysis
{
    /// <summary>
    /// Pure domain service that calculates tank ecosystem compatibility and bio-load.
    /// </summary>
    public class TankEcosystemAnalyzer
    {
        private const decimal GallonsPerLiter = 0.264172m;

        public TankAnalysisReport Analyze(
            TankDimensions dimensions,
            IReadOnlyList<SpeciesAnalysisInput> speciesInputs,
            IReadOnlyList<CompatibilityRuleInput> compatibilityRules)
        {
            var alerts = new List<TankAlert>();
            var bioLoadItems = new List<BioLoadItemResult>();

            var volumeLiters = CalculateVolumeLiters(dimensions);
            var volumeGallons = volumeLiters * GallonsPerLiter;

            var requiredVolume = speciesInputs.Count == 0
                ? 0
                : speciesInputs.Max(s => s.MinTankVolume);

            if (volumeLiters < requiredVolume)
            {
                alerts.Add(new TankAlert(
                    TankAnalysisAlertCodeConstant.TankTooSmall,
                    Severity.Danger,
                    "Tank volume is below the minimum required for the most demanding species.",
                    Array.Empty<string>(),
                    Array.Empty<string>(),
                    Array.Empty<string>()));
            }

            decimal totalBioLoad = 0m;
            foreach (var species in speciesInputs)
            {
                var bioLoad = species.AdultSize * species.BioLoadFactor * species.Quantity;
                totalBioLoad += bioLoad;
                bioLoadItems.Add(new BioLoadItemResult(
                    species.SpeciesId,
                    species.SpeciesName,
                    species.AdultSize,
                    species.BioLoadFactor,
                    species.Quantity,
                    bioLoad));
            }

            var capacityPercentage = volumeLiters > 0m
                ? (totalBioLoad / volumeLiters) * 100m
                : 0m;

            if (capacityPercentage > 100m)
            {
                alerts.Add(new TankAlert(
                    TankAnalysisAlertCodeConstant.Overstocked,
                    Severity.Danger,
                    "Bio-load exceeds 100% of tank capacity.",
                    Array.Empty<string>(),
                    Array.Empty<string>(),
                    Array.Empty<string>()));
            }
            else if (capacityPercentage >= 80m)
            {
                alerts.Add(new TankAlert(
                    TankAnalysisAlertCodeConstant.FullyStocked,
                    Severity.Warning,
                    "Tank is fully stocked (80% - 100% bio-load).",
                    Array.Empty<string>(),
                    Array.Empty<string>(),
                    Array.Empty<string>()));
            }

            Range<decimal>? phRange = null;
            Range<int>? tempRange = null;

            if (speciesInputs.Count > 0)
            {
                var maxOfMinsPh = speciesInputs.Max(s => s.PhMin);
                var minOfMaxesPh = speciesInputs.Min(s => s.PhMax);

                if (maxOfMinsPh <= minOfMaxesPh)
                {
                    phRange = new Range<decimal>(maxOfMinsPh, minOfMaxesPh);
                }
                else
                {
                    alerts.Add(new TankAlert(
                        TankAnalysisAlertCodeConstant.EnvConflictPh,
                        Severity.Danger,
                        "pH requirements do not overlap across all species.",
                        Array.Empty<string>(),
                        Array.Empty<string>(),
                        Array.Empty<string>()));
                }

                var maxOfMinsTemp = speciesInputs.Max(s => s.TempMin);
                var minOfMaxesTemp = speciesInputs.Min(s => s.TempMax);

                if (maxOfMinsTemp <= minOfMaxesTemp)
                {
                    tempRange = new Range<int>(maxOfMinsTemp, minOfMaxesTemp);
                }
                else
                {
                    alerts.Add(new TankAlert(
                        TankAnalysisAlertCodeConstant.EnvConflictTemp,
                        Severity.Danger,
                        "Temperature requirements do not overlap across all species.",
                        Array.Empty<string>(),
                        Array.Empty<string>(),
                        Array.Empty<string>()));
                }
            }

            foreach (var species in speciesInputs)
            {
                if (species.IsSchooling && species.Quantity < species.MinGroupSize)
                {
                    alerts.Add(new TankAlert(
                        TankAnalysisAlertCodeConstant.SchoolingInsufficient,
                        Severity.Warning,
                        $"{species.SpeciesName} needs a larger group to prevent stress.",
                        new[] { species.SpeciesId },
                        new[] { species.SpeciesName },
                        species.TagIds));
                }
            }

            AppendCompatibilityAlerts(compatibilityRules, speciesInputs, alerts);

            return new TankAnalysisReport
            {
                VolumeLiters = volumeLiters,
                VolumeGallons = volumeGallons,
                RequiredVolumeLiters = requiredVolume,
                TotalBioLoad = totalBioLoad,
                CapacityPercentage = capacityPercentage,
                PhRange = phRange,
                TempRange = tempRange,
                BioLoadItems = bioLoadItems,
                Alerts = alerts
            };
        }

        private static decimal CalculateVolumeLiters(TankDimensions dimensions)
        {
            return (dimensions.Width * dimensions.Height * dimensions.Depth) / 1000m;
        }

        private static void AppendCompatibilityAlerts(
            IReadOnlyList<CompatibilityRuleInput> compatibilityRules,
            IReadOnlyList<SpeciesAnalysisInput> speciesInputs,
            List<TankAlert> alerts)
        {
            if (compatibilityRules.Count == 0 || speciesInputs.Count == 0)
            {
                return;
            }

            var tagToSpecies = new Dictionary<string, List<SpeciesAnalysisInput>>();
            foreach (var species in speciesInputs)
            {
                foreach (var tagId in species.TagIds.Distinct())
                {
                    if (!tagToSpecies.TryGetValue(tagId, out var list))
                    {
                        list = new List<SpeciesAnalysisInput>();
                        tagToSpecies[tagId] = list;
                    }

                    list.Add(species);
                }
            }

            var emitted = new HashSet<string>();

            foreach (var rule in compatibilityRules)
            {
                if (!tagToSpecies.TryGetValue(rule.SubjectTagId, out var subjects) ||
                    !tagToSpecies.TryGetValue(rule.ObjectTagId, out var objects))
                {
                    continue;
                }

                foreach (var subject in subjects)
                {
                    foreach (var obj in objects)
                    {
                        if (subject.SpeciesId == obj.SpeciesId)
                        {
                            continue;
                        }

                        var key = $"{rule.SubjectTagId}:{rule.ObjectTagId}:{subject.SpeciesId}:{obj.SpeciesId}";
                        if (!emitted.Add(key))
                        {
                            continue;
                        }

                        var baseMessage = $"{subject.SpeciesName} is incompatible with {obj.SpeciesName}.";
                        var message = string.IsNullOrWhiteSpace(rule.Message)
                            ? baseMessage
                            : $"{baseMessage} {rule.Message}";

                        alerts.Add(new TankAlert(
                            TankAnalysisAlertCodeConstant.TagIncompatibility,
                            rule.Severity,
                            message,
                            new[] { subject.SpeciesId, obj.SpeciesId },
                            new[] { subject.SpeciesName, obj.SpeciesName },
                            new[] { rule.SubjectTagId, rule.ObjectTagId }));
                    }
                }
            }
        }
    }
}
