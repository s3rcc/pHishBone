using Domain.Enums;

namespace Domain.Services.TankAnalysis
{
    public record TankDimensions(int Width, int Height, int Depth);

    public record SpeciesAnalysisInput(
        string SpeciesId,
        string SpeciesName,
        decimal AdultSize,
        decimal BioLoadFactor,
        int Quantity,
        decimal PhMin,
        decimal PhMax,
        int TempMin,
        int TempMax,
        int MinTankVolume,
        bool IsSchooling,
        int MinGroupSize,
        IReadOnlyCollection<string> TagIds
    );

    public record CompatibilityRuleInput(
        string SubjectTagId,
        string ObjectTagId,
        Severity Severity,
        string Message
    );

    public record BioLoadItemResult(
        string SpeciesId,
        string SpeciesName,
        decimal AdultSize,
        decimal BioLoadFactor,
        int Quantity,
        decimal BioLoad
    );

    public record Range<T>(T Min, T Max);

    public record TankAlert(
        string Code,
        Severity Severity,
        string Message,
        IReadOnlyCollection<string> SpeciesIds,
        IReadOnlyCollection<string> SpeciesNames,
        IReadOnlyCollection<string> TagIds
    );

    public class TankAnalysisReport
    {
        public decimal VolumeLiters { get; init; }
        public decimal VolumeGallons { get; init; }
        public int RequiredVolumeLiters { get; init; }
        public decimal TotalBioLoad { get; init; }
        public decimal CapacityPercentage { get; init; }
        public Range<decimal>? PhRange { get; init; }
        public Range<int>? TempRange { get; init; }
        public IReadOnlyList<BioLoadItemResult> BioLoadItems { get; init; } = new List<BioLoadItemResult>();
        public IReadOnlyList<TankAlert> Alerts { get; init; } = new List<TankAlert>();
    }
}
