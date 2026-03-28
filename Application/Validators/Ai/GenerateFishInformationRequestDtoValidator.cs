using Application.Constants;
using Application.DTOs.AiDTOs;
using FluentValidation;

namespace Application.Validators.Ai
{
    public class GenerateFishInformationRequestDtoValidator : AbstractValidator<GenerateFishInformationRequestDto>
    {
        public GenerateFishInformationRequestDtoValidator()
        {
            RuleFor(x => x.FishName)
                .NotEmpty().WithMessage(AiErrorMessageConstant.FishNameRequired)
                .MaximumLength(200);

            RuleFor(x => x.ModelConfigId)
                .NotEmpty().WithMessage(AiErrorMessageConstant.ModelConfigIdRequired)
                .Must(BeValidGuid)
                .WithMessage("Model configuration ID must be a valid GUID");
        }

        private static bool BeValidGuid(string value)
        {
            return Guid.TryParse(value, out _);
        }
    }
}
