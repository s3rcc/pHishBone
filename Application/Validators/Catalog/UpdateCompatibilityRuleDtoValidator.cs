using Application.DTOs.CatalogDTOs;
using FluentValidation;

namespace Application.Validators.Catalog
{
    public class UpdateCompatibilityRuleDtoValidator : AbstractValidator<UpdateCompatibilityRuleDto>
    {
        public UpdateCompatibilityRuleDtoValidator()
        {
            RuleFor(x => x.Severity)
                .IsInEnum().WithMessage("Severity must be Info, Warning, or Danger.");

            RuleFor(x => x.Message)
                .NotEmpty().WithMessage("Message is required.")
                .MaximumLength(1000).WithMessage("Message cannot exceed 1000 characters.");
        }
    }
}
