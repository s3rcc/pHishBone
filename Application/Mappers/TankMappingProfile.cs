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
                .ForMember(dest => dest.ItemCount, opt => opt.MapFrom(src => src.TankItems.Count));

            CreateMap<Tank, TankListItemDto>()
                .ForMember(dest => dest.ItemCount, opt => opt.MapFrom(src => src.TankItems.Count));

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

