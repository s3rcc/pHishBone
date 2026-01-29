using Application.Constants;
using Application.DTOs.CatalogDTOs;
using FluentValidation;

namespace Application.Validators.Catalog
{
    public class UpdateTypeDtoValidator : AbstractValidator<UpdateTypeDto>
    {
        public UpdateTypeDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage(CatalogErrorMessageConstant.TypeNameRequired)
                .MaximumLength(50).WithMessage("Type name cannot exceed 50 characters");

            RuleFor(x => x.Description)
                .MaximumLength(255).WithMessage("Description cannot exceed 255 characters")
                .When(x => !string.IsNullOrEmpty(x.Description));
        }
    }
}
