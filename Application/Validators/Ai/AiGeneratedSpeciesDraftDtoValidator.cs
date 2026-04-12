using Application.DTOs.AiDTOs;
using FluentValidation;

namespace Application.Validators.Ai
{
    public class AiGeneratedSpeciesDraftDtoValidator : AbstractValidator<AiGeneratedSpeciesDraftDto>
    {
        public AiGeneratedSpeciesDraftDtoValidator()
        {
            RuleFor(x => x.CommonName)
                .NotEmpty()
                .MaximumLength(200);

            RuleFor(x => x.ScientificName)
                .NotEmpty()
                .MaximumLength(200);

            RuleFor(x => x.TypeName)
                .NotEmpty()
                .MaximumLength(150);

            RuleFor(x => x.TagCodes)
                .NotNull();

            RuleFor(x => x.Environment)
                .NotNull();

            RuleFor(x => x.Profile)
                .NotNull();
        }
    }
}
