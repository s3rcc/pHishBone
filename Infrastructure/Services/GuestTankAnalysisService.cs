using Application.Constants;
using Application.DTOs.ProjectDTOs;
using Application.Services;
using Domain.Entities.Catalog;
using Domain.Enums;
using Domain.Exceptions;
using Domain.Services.TankAnalysis;
using Infrastructure.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services
{
    /// <summary>
    /// Service implementation for guest tank analysis operations.
    /// </summary>
    public class GuestTankAnalysisService : IGuestTankAnalysisService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly TankEcosystemAnalyzer _analyzer;

        public GuestTankAnalysisService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _analyzer = new TankEcosystemAnalyzer();
        }

        public async Task<TankAnalysisReportDto> AnalyzeGuestTankAsync(
            GuestTankAnalysisRequestDto dto,
            CancellationToken cancellationToken = default)
        {
            var speciesInputs = new List<SpeciesAnalysisInput>();
            var ruleInputs = new List<CompatibilityRuleInput>();

            if (dto.Items.Count > 0)
            {
                var speciesIds = dto.Items
                    .Select(i => i.SpeciesId)
                    .Distinct()
                    .ToList();

                var speciesList = await _unitOfWork.Repository<Species>().GetListAsync(
                    predicate: s => speciesIds.Contains(s.Id) && s.DeletedTime == null,
                    include: q => q
                        .Include(s => s.SpeciesEnvironment)
                        .Include(s => s.SpeciesProfile)
                        .Include(s => s.SpeciesTags)
                            .ThenInclude(st => st.Tag),
                    tracking: false
                );

                if (speciesList.Count != speciesIds.Count)
                {
                    throw new CustomErrorException(
                        StatusCodes.Status404NotFound,
                        ErrorCode.NOT_FOUND,
                        ProjectErrorMessageConstant.SpeciesNotFoundInCatalog
                    );
                }

                var quantityBySpecies = dto.Items
                    .GroupBy(i => i.SpeciesId)
                    .ToDictionary(g => g.Key, g => g.Sum(x => x.Quantity));

                foreach (var species in speciesList)
                {
                    var environment = species.SpeciesEnvironment;
                    var profile = species.SpeciesProfile;

                    if (environment == null || profile == null)
                    {
                        throw new CustomErrorException(
                            StatusCodes.Status400BadRequest,
                            ErrorCode.VALIDATION_ERROR,
                            ProjectErrorMessageConstant.SpeciesDataIncompleteForAnalysis
                        );
                    }

                    var quantity = quantityBySpecies.TryGetValue(species.Id, out var count) ? count : 0;
                    var tagIds = species.SpeciesTags.Select(st => st.TagId).Distinct().ToList();

                    speciesInputs.Add(new SpeciesAnalysisInput(
                        species.Id,
                        species.CommonName,
                        profile.AdultSize,
                        profile.BioLoadFactor,
                        quantity,
                        environment.PhMin,
                        environment.PhMax,
                        environment.TempMin,
                        environment.TempMax,
                        environment.MinTankVolume,
                        profile.IsSchooling,
                        profile.MinGroupSize,
                        tagIds
                    ));
                }

                var allTagIds = speciesInputs
                    .SelectMany(s => s.TagIds)
                    .Distinct()
                    .ToList();

                if (allTagIds.Count > 0)
                {
                    var rules = await _unitOfWork.Repository<CompatibilityRule>().GetListAsync(
                        predicate: r => allTagIds.Contains(r.SubjectTagId) &&
                                        allTagIds.Contains(r.ObjectTagId) &&
                                        r.DeletedTime == null,
                        tracking: false
                    );

                    ruleInputs = rules
                        .Select(r => new CompatibilityRuleInput(
                            r.SubjectTagId,
                            r.ObjectTagId,
                            r.Severity,
                            r.Message))
                        .ToList();
                }
            }

            var report = _analyzer.Analyze(
                new TankDimensions(dto.Width, dto.Height, dto.Depth),
                speciesInputs,
                ruleInputs);

            return MapReport(report);
        }

        private static TankAnalysisReportDto MapReport(TankAnalysisReport report)
        {
            var phRange = report.PhRange == null
                ? null
                : new DecimalRangeDto(report.PhRange.Min, report.PhRange.Max);

            var tempRange = report.TempRange == null
                ? null
                : new IntRangeDto(report.TempRange.Min, report.TempRange.Max);

            var bioLoadItems = report.BioLoadItems
                .Select(item => new BioLoadItemDto(
                    item.SpeciesId,
                    item.SpeciesName,
                    item.AdultSize,
                    item.BioLoadFactor,
                    item.Quantity,
                    item.BioLoad))
                .ToList();

            var alerts = report.Alerts
                .Select(alert => new TankAlertDto(
                    alert.Code,
                    alert.Severity,
                    alert.Message,
                    alert.SpeciesIds.ToList(),
                    alert.SpeciesNames.ToList(),
                    alert.TagIds.ToList()))
                .ToList();

            return new TankAnalysisReportDto(
                report.VolumeLiters,
                report.VolumeGallons,
                report.RequiredVolumeLiters,
                report.TotalBioLoad,
                report.CapacityPercentage,
                phRange,
                tempRange,
                bioLoadItems,
                alerts
            );
        }
    }
}
