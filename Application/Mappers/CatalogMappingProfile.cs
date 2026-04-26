using Application.DTOs.CatalogDTOs;
using AutoMapper;
using Domain.Entities.Catalog;

namespace Application.Mappers
{
    public class CatalogMappingProfile : Profile
    {
        public CatalogMappingProfile()
        {
            // Tag mappings
            CreateMap<Tag, TagDto>();
            CreateMap<CreateTagDto, Tag>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedBy, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedTime, opt => opt.Ignore())
                .ForMember(dest => dest.SpeciesTags, opt => opt.Ignore())
                .ForMember(dest => dest.SubjectRules, opt => opt.Ignore())
                .ForMember(dest => dest.ObjectRules, opt => opt.Ignore());

            CreateMap<UpdateTagDto, Tag>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedBy, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedTime, opt => opt.Ignore())
                .ForMember(dest => dest.SpeciesTags, opt => opt.Ignore())
                .ForMember(dest => dest.SubjectRules, opt => opt.Ignore())
                .ForMember(dest => dest.ObjectRules, opt => opt.Ignore());

            // Type mappings
            CreateMap<Domain.Entities.Catalog.Type, TypeDto>();
            CreateMap<CreateTypeDto, Domain.Entities.Catalog.Type>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedBy, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedTime, opt => opt.Ignore())
                .ForMember(dest => dest.Species, opt => opt.Ignore());

            CreateMap<UpdateTypeDto, Domain.Entities.Catalog.Type>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedBy, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedTime, opt => opt.Ignore())
                .ForMember(dest => dest.Species, opt => opt.Ignore());

            // Species mappings
            // SpeciesEnvironment mappings
            CreateMap<SpeciesEnvironment, SpeciesEnvironmentDto>();
            CreateMap<CreateSpeciesDto.EnvironmentDto, SpeciesEnvironment>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedBy, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedTime, opt => opt.Ignore())
                .ForMember(dest => dest.Species, opt => opt.Ignore());
            
            CreateMap<UpdateSpeciesDto.EnvironmentDto, SpeciesEnvironment>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedBy, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedTime, opt => opt.Ignore())
                .ForMember(dest => dest.Species, opt => opt.Ignore());

            // SpeciesProfile mappings
            CreateMap<SpeciesProfile, SpeciesProfileDto>();
            CreateMap<CreateSpeciesDto.ProfileDto, SpeciesProfile>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedBy, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedTime, opt => opt.Ignore())
                .ForMember(dest => dest.Species, opt => opt.Ignore());

            CreateMap<UpdateSpeciesDto.ProfileDto, SpeciesProfile>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedBy, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedTime, opt => opt.Ignore())
                .ForMember(dest => dest.Species, opt => opt.Ignore());

            // Species entity mappings
            CreateMap<Species, SpeciesDto>()
                .ForMember(dest => dest.TypeName, opt => opt.MapFrom(s => s.Type.Name));

            CreateMap<Species, SpeciesDetailDto>()
                .ForMember(dest => dest.TypeName, opt => opt.MapFrom(s => s.Type.Name))
                .ForMember(dest => dest.Environment, opt => opt.MapFrom(s => s.SpeciesEnvironment))
                .ForMember(dest => dest.Profile, opt => opt.MapFrom(s => s.SpeciesProfile))
                .ForMember(dest => dest.Tags, opt => opt.MapFrom(s => s.SpeciesTags.Select(st => st.Tag)));

            CreateMap<Species, RelatedSpeciesDto>()
                .ForMember(dest => dest.TypeName, opt => opt.MapFrom(s => s.Type.Name))
                .ForMember(dest => dest.Score, opt => opt.Ignore())
                .ForMember(dest => dest.MatchReasons, opt => opt.Ignore());

            CreateMap<CreateSpeciesDto, Species>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Slug, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedBy, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedTime, opt => opt.Ignore())
                .ForMember(dest => dest.Type, opt => opt.Ignore())
                .ForMember(dest => dest.SpeciesEnvironment, opt => opt.Ignore())
                .ForMember(dest => dest.SpeciesProfile, opt => opt.Ignore())
                .ForMember(dest => dest.SpeciesTags, opt => opt.Ignore())
                .ForMember(dest => dest.SpeciesImages, opt => opt.Ignore())
                .ForMember(dest => dest.ThumbnailPublicId, opt => opt.Ignore());

            CreateMap<UpdateSpeciesDto, Species>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Slug, opt => opt.Ignore()) // Immutable!
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedBy, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedTime, opt => opt.Ignore())
                .ForMember(dest => dest.Type, opt => opt.Ignore())
                .ForMember(dest => dest.SpeciesEnvironment, opt => opt.Ignore())
                .ForMember(dest => dest.SpeciesProfile, opt => opt.Ignore())
                .ForMember(dest => dest.SpeciesTags, opt => opt.Ignore())
                .ForMember(dest => dest.SpeciesImages, opt => opt.Ignore())
                .ForMember(dest => dest.ThumbnailPublicId, opt => opt.Ignore());

            // SpeciesImage mappings
            CreateMap<SpeciesImage, DTOs.ImageDTOs.ImageResponseDto>();

            // CompatibilityRule mappings
            CreateMap<CompatibilityRule, CompatibilityRuleDto>()
                .ForMember(dest => dest.SubjectTagName, opt => opt.MapFrom(src => src.SubjectTag.Name))
                .ForMember(dest => dest.ObjectTagName, opt => opt.MapFrom(src => src.ObjectTag.Name))
                .ForMember(dest => dest.Severity, opt => opt.MapFrom(src => src.Severity.ToString()));

            CreateMap<CreateCompatibilityRuleDto, CompatibilityRule>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedTime, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedBy, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedTime, opt => opt.Ignore())
                .ForMember(dest => dest.SubjectTag, opt => opt.Ignore())
                .ForMember(dest => dest.ObjectTag, opt => opt.Ignore());
        }
    }
}

