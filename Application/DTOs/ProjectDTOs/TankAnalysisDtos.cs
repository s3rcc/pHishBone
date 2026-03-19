using Domain.Enums;

namespace Application.DTOs.ProjectDTOs
{
    public record DecimalRangeDto(decimal Min, decimal Max);

    public record IntRangeDto(int Min, int Max);

    public record BioLoadItemDto(
        string SpeciesId,
        string SpeciesName,
        decimal AdultSize,
        decimal BioLoadFactor,
        int Quantity,
        decimal BioLoad
    );

    public record TankAlertDto(
        string Code,
        Severity Severity,
        string Message,
        List<string> SpeciesIds,
        List<string> SpeciesNames,
        List<string> TagIds
    );

    public record TankAnalysisReportDto(
        decimal VolumeLiters,
        decimal VolumeGallons,
        int RequiredVolumeLiters,
        decimal TotalBioLoad,
        decimal CapacityPercentage,
        DecimalRangeDto? PhRange,
        IntRangeDto? TempRange,
        List<BioLoadItemDto> BioLoadItems,
        List<TankAlertDto> Alerts
    );
}
