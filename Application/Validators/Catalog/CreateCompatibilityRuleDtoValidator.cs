using Application.DTOs.CatalogDTOs;
using FluentValidation;

namespace Application.Validators.Catalog
{
    public class CreateCompatibilityRuleDtoValidator : AbstractValidator<CreateCompatibilityRuleDto>
    {
        public CreateCompatibilityRuleDtoValidator()
        {
            RuleFor(x => x.SubjectTagId)
                .NotEmpty().WithMessage("Subject tag ID is required.");

            RuleFor(x => x.ObjectTagId)
                .NotEmpty().WithMessage("Object tag ID is required.");

            RuleFor(x => x.Severity)
                .IsInEnum().WithMessage("Severity must be Info, Warning, or Danger.");

            RuleFor(x => x.Message)
                .NotEmpty().WithMessage("Message is required.")
                .MaximumLength(1000).WithMessage("Message cannot exceed 1000 characters.");
        }
    }
}
