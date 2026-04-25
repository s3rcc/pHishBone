using Application.DTOs.ProjectDTOs;
using AutoMapper;
using Domain.Entities.Project;

namespace Application.Mappers
{
    /// <summary>
    /// AutoMapper profile for Project module entities and DTOs.
    /// </summary>
    public class TankMappingProfile : Profile
    {
        public TankMappingProfile()
        {
            // Tank mappings
            CreateMap<CreateTankDto, Tank>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => Domain.Enums.TankStatus.Draft));

            CreateMap<UpdateTankDto, Tank>();

            CreateMap<Tank, TankResponseDto>()
                .ForCtorParam(nameof(TankResponseDto.Id), opt => opt.MapFrom(src => src.Id))
                .ForCtorParam(nameof(TankResponseDto.UserId), opt => opt.MapFrom(src => src.UserId))
                .ForCtorParam(nameof(TankResponseDto.Name), opt => opt.MapFrom(src => src.Name))
                .ForCtorParam(nameof(TankResponseDto.Width), opt => opt.MapFrom(src => src.Width))
                .ForCtorParam(nameof(TankResponseDto.Height), opt => opt.MapFrom(src => src.Height))
                .ForCtorParam(nameof(TankResponseDto.Depth), opt => opt.MapFrom(src => src.Depth))
                .ForCtorParam(nameof(TankResponseDto.WaterVolume), opt => opt.MapFrom(src => src.WaterVolume))
                .ForCtorParam(nameof(TankResponseDto.WaterType), opt => opt.MapFrom(src => src.WaterType))
                .ForCtorParam(nameof(TankResponseDto.Status), opt => opt.MapFrom(src => src.Status))
                .ForCtorParam(nameof(TankResponseDto.ItemCount), opt => opt.MapFrom(src => src.TankItems.Count))
                .ForCtorParam(nameof(TankResponseDto.CreatedTime), opt => opt.MapFrom(src => src.CreatedTime))
                .ForCtorParam(nameof(TankResponseDto.LastUpdatedTime), opt => opt.MapFrom(src => src.LastUpdatedTime));

            CreateMap<Tank, TankListItemDto>()
                .ForCtorParam(nameof(TankListItemDto.Id), opt => opt.MapFrom(src => src.Id))
                .ForCtorParam(nameof(TankListItemDto.Name), opt => opt.MapFrom(src => src.Name))
                .ForCtorParam(nameof(TankListItemDto.WaterVolume), opt => opt.MapFrom(src => src.WaterVolume))
                .ForCtorParam(nameof(TankListItemDto.WaterType), opt => opt.MapFrom(src => src.WaterType))
                .ForCtorParam(nameof(TankListItemDto.Status), opt => opt.MapFrom(src => src.Status))
                .ForCtorParam(nameof(TankListItemDto.ItemCount), opt => opt.MapFrom(src => src.TankItems.Count))
                .ForCtorParam(nameof(TankListItemDto.CreatedTime), opt => opt.MapFrom(src => src.CreatedTime));

            // TankItem mappings
            CreateMap<AddTankItemDto, TankItem>();
            CreateMap<UpdateTankItemDto, TankItem>();
            CreateMap<TankItem, TankItemResponseDto>();

            // TankSnapshot mappings
            CreateMap<TankSnapshot, TankSnapshotResponseDto>();

            // TankImage mappings
            CreateMap<TankImage, DTOs.ImageDTOs.ImageResponseDto>();
        }
    }
}

