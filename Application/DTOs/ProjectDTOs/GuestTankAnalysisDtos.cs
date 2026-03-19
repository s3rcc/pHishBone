namespace Application.DTOs.ProjectDTOs
{
    public record GuestTankItemDto(
        string SpeciesId,
        int Quantity
    );

    public record GuestTankAnalysisRequestDto(
        int Width,
        int Height,
        int Depth,
        List<GuestTankItemDto> Items
    );
}
