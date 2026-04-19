using Application.Constants;
using Application.DTOs.CatalogDTOs;
using FluentValidation;

namespace Application.Validators.Catalog
{
    public class CreateSpeciesDtoValidator : AbstractValidator<CreateSpeciesDto>
    {
        public CreateSpeciesDtoValidator()
        {
            // Basic fields validation
            RuleFor(x => x.CommonName)
                .NotEmpty().WithMessage(CatalogErrorMessageConstant.SpeciesCommonNameRequired)
                .MaximumLength(200).WithMessage("Common name cannot exceed 200 characters");

            // RuleFor(x => x.ScientificName)
            //     .NotEmpty().WithMessage(CatalogErrorMessageConstant.SpeciesScientificNameRequired)
            //     .MaximumLength(200).WithMessage("Scientific name cannot exceed 200 characters");

            // RuleFor(x => x.TypeId)
            //     .NotEmpty().WithMessage(CatalogErrorMessageConstant.SpeciesTypeIdRequired)
            //     .Must(BeValidGuid).WithMessage("Type ID must be a valid GUID");

            RuleFor(x => x.ThumbnailUrl)
                .MaximumLength(500).WithMessage("Thumbnail URL cannot exceed 500 characters")
                .When(x => !string.IsNullOrEmpty(x.ThumbnailUrl));

            // Environment validation - Business Rule #1
            RuleFor(x => x.Environment.PhMin)
                .LessThan(x => x.Environment.PhMax)
                .WithMessage("PhMin must be less than PhMax");

            RuleFor(x => x.Environment.TempMin)
                .LessThan(x => x.Environment.TempMax)
                .WithMessage("TempMin must be less than TempMax");

            RuleFor(x => x.Environment.MinTankVolume)
                .GreaterThan(0).WithMessage("Minimum tank volume must be greater than 0");

            // Profile validation - Business Rule #1
            RuleFor(x => x.Profile.AdultSize)
                .GreaterThan(0).WithMessage(CatalogErrorMessageConstant.SpeciesInvalidAdultSize);

            RuleFor(x => x.Profile.BioLoadFactor)
                .GreaterThanOrEqualTo(0).WithMessage("Bio load factor must be greater than or equal to 0");

            RuleFor(x => x.Profile.MinGroupSize)
                .GreaterThanOrEqualTo(0).WithMessage("Minimum group size must be at least 1");

            // TagIds validation
            RuleForEach(x => x.TagIds)
                .Must(BeValidGuid).WithMessage("Each Tag ID must be a valid GUID");
        }

        private bool BeValidGuid(string value)
        {
            return Guid.TryParse(value, out _);
        }
    }
}
