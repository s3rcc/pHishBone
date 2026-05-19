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
            var rankedAlerts = RankAlerts(alerts);

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
                Alerts = rankedAlerts
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

            var speciesById = speciesInputs.ToDictionary(s => s.SpeciesId);
            var pairEvidenceMap = new Dictionary<string, PairCompatibilityEvidence>();

            for (var i = 0; i < speciesInputs.Count; i++)
            {
                for (var j = i + 1; j < speciesInputs.Count; j++)
                {
                    var left = speciesInputs[i];
                    var right = speciesInputs[j];

                    var leftTags = left.TagIds.Distinct().ToHashSet();
                    var rightTags = right.TagIds.Distinct().ToHashSet();

                    foreach (var rule in compatibilityRules)
                    {
                        var leftToRightMatch = leftTags.Contains(rule.SubjectTagId) &&
                                               rightTags.Contains(rule.ObjectTagId);
                        var rightToLeftMatch = leftTags.Contains(rule.ObjectTagId) &&
                                               rightTags.Contains(rule.SubjectTagId);

                        if (!leftToRightMatch && !rightToLeftMatch)
                        {
                            continue;
                        }

                        var pairKey = GetUnorderedPairKey(left.SpeciesId, right.SpeciesId);
                        if (!pairEvidenceMap.TryGetValue(pairKey, out var evidence))
                        {
                            evidence = new PairCompatibilityEvidence(left.SpeciesId, right.SpeciesId);
                            pairEvidenceMap[pairKey] = evidence;
                        }

                        var reason = string.IsNullOrWhiteSpace(rule.Message)
                            ? "Compatibility concern detected from matching behavior tags."
                            : rule.Message.Trim();

                        evidence.Severity = MaxSeverity(evidence.Severity, rule.Severity);
                        evidence.Reasons.Add(reason);
                        evidence.TagIds.Add(rule.SubjectTagId);
                        evidence.TagIds.Add(rule.ObjectTagId);
                    }
                }
            }

            foreach (var evidence in pairEvidenceMap.Values)
            {
                if (!speciesById.TryGetValue(evidence.LeftSpeciesId, out var leftSpecies) ||
                    !speciesById.TryGetValue(evidence.RightSpeciesId, out var rightSpecies))
                {
                    continue;
                }

                var message = BuildPairConflictMessage(
                    leftSpecies.SpeciesName,
                    rightSpecies.SpeciesName,
                    evidence.Reasons);

                alerts.Add(new TankAlert(
                    TankAnalysisAlertCodeConstant.TagIncompatibility,
                    evidence.Severity,
                    message,
                    new[] { leftSpecies.SpeciesId, rightSpecies.SpeciesId },
                    new[] { leftSpecies.SpeciesName, rightSpecies.SpeciesName },
                    evidence.TagIds.OrderBy(tagId => tagId).ToArray()));
            }
        }

        private static string GetUnorderedPairKey(string speciesIdA, string speciesIdB)
        {
            return string.CompareOrdinal(speciesIdA, speciesIdB) <= 0
                ? $"{speciesIdA}:{speciesIdB}"
                : $"{speciesIdB}:{speciesIdA}";
        }

        private static Severity MaxSeverity(Severity current, Severity candidate)
        {
            return candidate > current ? candidate : current;
        }

        private static string BuildPairConflictMessage(
            string leftSpeciesName,
            string rightSpeciesName,
            IEnumerable<string> reasons)
        {
            var distinctReasons = reasons
                .Where(reason => !string.IsNullOrWhiteSpace(reason))
                .Select(NormalizeReason)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (distinctReasons.Count == 0)
            {
                return $"{leftSpeciesName} vs {rightSpeciesName}: compatibility concerns detected.";
            }

            return $"{leftSpeciesName} vs {rightSpeciesName}: {string.Join(", ", distinctReasons)}.";
        }

        private static string NormalizeReason(string reason)
        {
            var trimmed = reason.Trim().TrimEnd('.');
            if (string.IsNullOrWhiteSpace(trimmed))
            {
                return string.Empty;
            }

            return char.ToLowerInvariant(trimmed[0]) + trimmed[1..];
        }

        private static IReadOnlyList<TankAlert> RankAlerts(IEnumerable<TankAlert> alerts)
        {
            return alerts
                .OrderBy(GetAlertPriority)
                .ThenByDescending(alert => alert.Severity)
                .ThenBy(alert => alert.Message, StringComparer.OrdinalIgnoreCase)
                .ToList();
        }

        private static int GetAlertPriority(TankAlert alert)
        {
            return alert.Code switch
            {
                TankAnalysisAlertCodeConstant.TankTooSmall => 0,
                TankAnalysisAlertCodeConstant.EnvConflictPh => 1,
                TankAnalysisAlertCodeConstant.EnvConflictTemp => 2,
                TankAnalysisAlertCodeConstant.Overstocked => 3,
                TankAnalysisAlertCodeConstant.TagIncompatibility when alert.Severity == Severity.Danger => 4,
                TankAnalysisAlertCodeConstant.FullyStocked => 5,
                TankAnalysisAlertCodeConstant.SchoolingInsufficient => 6,
                TankAnalysisAlertCodeConstant.TagIncompatibility => 7,
                _ => 8
            };
        }

        private sealed class PairCompatibilityEvidence
        {
            public PairCompatibilityEvidence(string leftSpeciesId, string rightSpeciesId)
            {
                LeftSpeciesId = leftSpeciesId;
                RightSpeciesId = rightSpeciesId;
            }

            public string LeftSpeciesId { get; }
            public string RightSpeciesId { get; }
            public Severity Severity { get; set; } = Severity.Info;
            public HashSet<string> Reasons { get; } = new(StringComparer.OrdinalIgnoreCase);
            public HashSet<string> TagIds { get; } = new(StringComparer.OrdinalIgnoreCase);
        }
    }
}
