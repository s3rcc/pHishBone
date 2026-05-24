using Application.Constants;
using Application.DTOs.ProjectDTOs;
using Application.Services;
using Domain.Entities.Catalog;
using Domain.Entities.Project;
using Domain.Enums;
using Domain.Exceptions;
using Domain.Services.TankAnalysis;
using Infrastructure.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    /// <summary>
    /// Projection-based tank analysis service optimized for read-heavy analysis requests.
    /// </summary>
    public class TankAnalysisV2Service : ITankAnalysisV2Service
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly TankEcosystemAnalyzer _analyzer;
        private readonly ILogger<TankAnalysisV2Service> _logger;

        public TankAnalysisV2Service(
            IUnitOfWork unitOfWork,
            ILogger<TankAnalysisV2Service> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _analyzer = new TankEcosystemAnalyzer();
        }

        public async Task<TankAnalysisReportDto> GetTankAnalysisV2Async(
            string tankId,
            string userId,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Running tank analysis v2 for TankId: {TankId}", tankId);

            var tankProjection = await _unitOfWork.Repository<Tank>()
                .GetQueryable(tracking: false)
                .Where(tank => tank.Id == tankId && tank.DeletedTime == null)
                .Select(tank => new TankAnalysisTankProjection(
                    tank.Id,
                    tank.UserId,
                    tank.Width,
                    tank.Height,
                    tank.Depth))
                .FirstOrDefaultAsync(cancellationToken);

            if (tankProjection == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    ProjectErrorMessageConstant.TankNotFound
                );
            }

            if (tankProjection.UserId != userId)
            {
                throw new CustomErrorException(
                    StatusCodes.Status403Forbidden,
                    ErrorCode.FORBIDDEN,
                    ProjectErrorMessageConstant.UnauthorizedAccess
                );
            }

            var speciesQuantities = await _unitOfWork.Repository<TankItem>()
                .GetQueryable(tracking: false)
                .Where(item =>
                    item.TankId == tankId &&
                    item.DeletedTime == null &&
                    item.ItemType == ItemType.Species)
                .GroupBy(item => item.ReferenceId)
                .Select(group => new TankSpeciesQuantityProjection(
                    group.Key,
                    group.Sum(item => item.Quantity)))
                .ToListAsync(cancellationToken);

            var speciesInputs = new List<SpeciesAnalysisInput>();
            var ruleInputs = new List<CompatibilityRuleInput>();

            if (speciesQuantities.Count > 0)
            {
                var speciesIds = speciesQuantities
                    .Select(item => item.SpeciesId)
                    .Distinct()
                    .ToList();

                var speciesProjections = await _unitOfWork.Repository<Species>()
                    .GetQueryable(tracking: false)
                    .Where(species => speciesIds.Contains(species.Id) && species.DeletedTime == null)
                    .Select(species => new SpeciesAnalysisProjection(
                        species.Id,
                        species.CommonName,
                        species.SpeciesProfile != null ? species.SpeciesProfile.AdultSize : null,
                        species.SpeciesProfile != null ? species.SpeciesProfile.BioLoadFactor : null,
                        species.SpeciesEnvironment != null ? species.SpeciesEnvironment.PhMin : null,
                        species.SpeciesEnvironment != null ? species.SpeciesEnvironment.PhMax : null,
                        species.SpeciesEnvironment != null ? species.SpeciesEnvironment.TempMin : null,
                        species.SpeciesEnvironment != null ? species.SpeciesEnvironment.TempMax : null,
                        species.SpeciesEnvironment != null ? species.SpeciesEnvironment.MinTankVolume : null,
                        species.SpeciesProfile != null ? species.SpeciesProfile.IsSchooling : null,
                        species.SpeciesProfile != null ? species.SpeciesProfile.MinGroupSize : null))
                    .ToListAsync(cancellationToken);

                if (speciesProjections.Count != speciesIds.Count)
                {
                    throw new CustomErrorException(
                        StatusCodes.Status404NotFound,
                        ErrorCode.NOT_FOUND,
                        ProjectErrorMessageConstant.SpeciesNotFoundInCatalog
                    );
                }

                var speciesTagRows = await _unitOfWork.Repository<SpeciesTag>()
                    .GetQueryable(tracking: false)
                    .Where(tag => speciesIds.Contains(tag.SpeciesId) && tag.DeletedTime == null)
                    .Select(tag => new SpeciesTagProjection(tag.SpeciesId, tag.TagId))
                    .ToListAsync(cancellationToken);

                var quantityBySpecies = speciesQuantities.ToDictionary(item => item.SpeciesId, item => item.Quantity);
                var tagIdsBySpecies = speciesTagRows
                    .GroupBy(tag => tag.SpeciesId)
                    .ToDictionary(
                        group => group.Key,
                        group => group.Select(tag => tag.TagId).Distinct().ToList());

                foreach (var species in speciesProjections)
                {
                    if (species.AdultSize == null ||
                        species.BioLoadFactor == null ||
                        species.PhMin == null ||
                        species.PhMax == null ||
                        species.TempMin == null ||
                        species.TempMax == null ||
                        species.MinTankVolume == null ||
                        species.IsSchooling == null ||
                        species.MinGroupSize == null)
                    {
                        throw new CustomErrorException(
                            StatusCodes.Status400BadRequest,
                            ErrorCode.VALIDATION_ERROR,
                            ProjectErrorMessageConstant.SpeciesDataIncompleteForAnalysis
                        );
                    }

                    tagIdsBySpecies.TryGetValue(species.Id, out var tagIds);
                    quantityBySpecies.TryGetValue(species.Id, out var quantity);

                    speciesInputs.Add(new SpeciesAnalysisInput(
                        species.Id,
                        species.CommonName,
                        species.AdultSize.Value,
                        species.BioLoadFactor.Value,
                        quantity,
                        species.PhMin.Value,
                        species.PhMax.Value,
                        species.TempMin.Value,
                        species.TempMax.Value,
                        species.MinTankVolume.Value,
                        species.IsSchooling.Value,
                        species.MinGroupSize.Value,
                        tagIds ?? []));
                }

                var allTagIds = speciesInputs
                    .SelectMany(input => input.TagIds)
                    .Distinct()
                    .ToList();

                if (allTagIds.Count > 0)
                {
                    var ruleProjections = await _unitOfWork.Repository<CompatibilityRule>()
                        .GetQueryable(tracking: false)
                        .Where(rule =>
                            allTagIds.Contains(rule.SubjectTagId) &&
                            allTagIds.Contains(rule.ObjectTagId) &&
                            rule.DeletedTime == null)
                        .Select(rule => new CompatibilityRuleProjection(
                            rule.SubjectTagId,
                            rule.ObjectTagId,
                            rule.Severity,
                            rule.Message))
                        .ToListAsync(cancellationToken);

                    ruleInputs = ruleProjections
                        .Select(rule => new CompatibilityRuleInput(
                            rule.SubjectTagId,
                            rule.ObjectTagId,
                            rule.Severity,
                            rule.Message))
                        .ToList();
                }
            }

            var report = _analyzer.Analyze(
                new TankDimensions(tankProjection.Width, tankProjection.Height, tankProjection.Depth),
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
                alerts);
        }

        private sealed record TankAnalysisTankProjection(
            string Id,
            string UserId,
            int Width,
            int Height,
            int Depth);

        private sealed record TankSpeciesQuantityProjection(
            string SpeciesId,
            int Quantity);

        private sealed record SpeciesAnalysisProjection(
            string Id,
            string CommonName,
            decimal? AdultSize,
            decimal? BioLoadFactor,
            decimal? PhMin,
            decimal? PhMax,
            int? TempMin,
            int? TempMax,
            int? MinTankVolume,
            bool? IsSchooling,
            int? MinGroupSize);

        private sealed record SpeciesTagProjection(
            string SpeciesId,
            string TagId);

        private sealed record CompatibilityRuleProjection(
            string SubjectTagId,
            string ObjectTagId,
            Severity Severity,
            string Message);
    }
}
