using Application.DTOs.AiDTOs;

namespace Application.Common.Interfaces
{
    public interface IAiFishInformationService
    {
        Task<AiFishInformationResponseDto> GenerateFishInformationAsync(GenerateFishInformationRequestDto dto, CancellationToken cancellationToken = default);
    }
}
