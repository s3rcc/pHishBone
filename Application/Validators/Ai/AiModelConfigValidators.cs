using Application.Constants;
using Application.DTOs.AiDTOs;
using FluentValidation;

namespace Application.Validators.Ai
{
    public class CreateAiModelConfigDtoValidator : AbstractValidator<CreateAiModelConfigDto>
    {
        public CreateAiModelConfigDtoValidator()
        {
            RuleFor(x => x.DisplayName)
                .NotEmpty().WithMessage(AiErrorMessageConstant.AiModelDisplayNameRequired)
                .MaximumLength(150);

            RuleFor(x => x.ProviderModelId)
                .NotEmpty().WithMessage(AiErrorMessageConstant.AiProviderModelIdRequired)
                .MaximumLength(200);

            RuleFor(x => x.TimeoutSeconds)
                .InclusiveBetween(5, 300);

            RuleFor(x => x.MaxOutputTokens)
                .GreaterThan(0)
                .When(x => x.MaxOutputTokens.HasValue);

            RuleFor(x => x.Temperature)
                .InclusiveBetween(0m, 2m)
                .When(x => x.Temperature.HasValue);

            RuleFor(x => x.Description)
                .MaximumLength(1000)
                .WithMessage(AiErrorMessageConstant.AiModelDescriptionTooLong);

            RuleFor(x => x.IsEnabled)
                .Equal(true)
                .When(x => x.IsDefault)
                .WithMessage(AiErrorMessageConstant.AiDefaultModelMustBeEnabled);
        }
    }

    public class UpdateAiModelConfigDtoValidator : AbstractValidator<UpdateAiModelConfigDto>
    {
        public UpdateAiModelConfigDtoValidator()
        {
            RuleFor(x => x.DisplayName)
                .NotEmpty().WithMessage(AiErrorMessageConstant.AiModelDisplayNameRequired)
                .MaximumLength(150);

            RuleFor(x => x.ProviderModelId)
                .NotEmpty().WithMessage(AiErrorMessageConstant.AiProviderModelIdRequired)
                .MaximumLength(200);

            RuleFor(x => x.TimeoutSeconds)
                .InclusiveBetween(5, 300);

            RuleFor(x => x.MaxOutputTokens)
                .GreaterThan(0)
                .When(x => x.MaxOutputTokens.HasValue);

            RuleFor(x => x.Temperature)
                .InclusiveBetween(0m, 2m)
                .When(x => x.Temperature.HasValue);

            RuleFor(x => x.Description)
                .MaximumLength(1000)
                .WithMessage(AiErrorMessageConstant.AiModelDescriptionTooLong);

            RuleFor(x => x.IsEnabled)
                .Equal(true)
                .When(x => x.IsDefault)
                .WithMessage(AiErrorMessageConstant.AiDefaultModelMustBeEnabled);
        }
    }
}
