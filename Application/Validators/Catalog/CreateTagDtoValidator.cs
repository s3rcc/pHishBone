using Application.Constants;
using Application.DTOs.CatalogDTOs;
using FluentValidation;

namespace Application.Validators.Catalog
{
    public class CreateTagDtoValidator : AbstractValidator<CreateTagDto>
    {
        public CreateTagDtoValidator()
        {
            // Code is normalized in the service layer (TRIM → UPPER → _ separators).
            // The validator runs on the raw user input:
            // • Must not be pure whitespace / empty (service will catch blank after trim)
            // • Raw input may only contain ASCII letters, digits, spaces, hyphens, or underscores
            //   — any other special chars make invalid tags
            RuleFor(x => x.Code)
                .NotEmpty().WithMessage(CatalogErrorMessageConstant.TagCodeRequired)
                .MaximumLength(100).WithMessage("Tag code input cannot exceed 100 characters")
                .Matches(@"^[A-Za-z][A-Za-z0-9 _\-]*$")
                    .WithMessage("Tag code may only contain English letters, digits, spaces, hyphens, or underscores and must start with a letter. It will be saved as SCREAMING_SNAKE_CASE (e.g. 'high light' → 'HIGH_LIGHT').");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage(CatalogErrorMessageConstant.TagNameRequired)
                .MaximumLength(100).WithMessage("Tag name cannot exceed 100 characters");

            RuleFor(x => x.Description)
                .MaximumLength(255).WithMessage("Description cannot exceed 255 characters")
                .When(x => !string.IsNullOrEmpty(x.Description));
        }
    }
}
