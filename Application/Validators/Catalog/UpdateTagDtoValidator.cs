using Application.Constants;
using Application.DTOs.CatalogDTOs;
using FluentValidation;

namespace Application.Validators.Catalog
{
    public class UpdateTagDtoValidator : AbstractValidator<UpdateTagDto>
    {
        public UpdateTagDtoValidator()
        {
            RuleFor(x => x.Code)
                .NotEmpty().WithMessage(CatalogErrorMessageConstant.TagCodeRequired)
                .MaximumLength(50).WithMessage("Tag code cannot exceed 50 characters");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage(CatalogErrorMessageConstant.TagNameRequired)
                .MaximumLength(100).WithMessage("Tag name cannot exceed 100 characters");

            RuleFor(x => x.Description)
                .MaximumLength(255).WithMessage("Description cannot exceed 255 characters")
                .When(x => !string.IsNullOrEmpty(x.Description));
        }
    }
}
