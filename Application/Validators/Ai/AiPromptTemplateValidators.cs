using Application.Constants;
using Application.DTOs.AiDTOs;
using FluentValidation;

namespace Application.Validators.Ai
{
    public class CreateAiPromptTemplateDtoValidator : AbstractValidator<CreateAiPromptTemplateDto>
    {
        public CreateAiPromptTemplateDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage(AiErrorMessageConstant.AiPromptNameRequired)
                .MaximumLength(150);

            RuleFor(x => x.SystemPrompt)
                .NotEmpty().WithMessage(AiErrorMessageConstant.AiPromptBodyRequired)
                .MaximumLength(8000);

            RuleFor(x => x.Description)
                .MaximumLength(1000)
                .WithMessage(AiErrorMessageConstant.AiPromptDescriptionTooLong);

            RuleFor(x => x.VersionLabel)
                .MaximumLength(100)
                .WithMessage(AiErrorMessageConstant.AiPromptVersionTooLong);

            RuleFor(x => x)
                .Must(x => !x.IsActive || x.IsEnabled)
                .WithMessage(AiErrorMessageConstant.AiPromptActiveRequiresEnabled);
        }
    }

    public class UpdateAiPromptTemplateDtoValidator : AbstractValidator<UpdateAiPromptTemplateDto>
    {
        public UpdateAiPromptTemplateDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage(AiErrorMessageConstant.AiPromptNameRequired)
                .MaximumLength(150);

            RuleFor(x => x.SystemPrompt)
                .NotEmpty().WithMessage(AiErrorMessageConstant.AiPromptBodyRequired)
                .MaximumLength(8000);

            RuleFor(x => x.Description)
                .MaximumLength(1000)
                .WithMessage(AiErrorMessageConstant.AiPromptDescriptionTooLong);

            RuleFor(x => x.VersionLabel)
                .MaximumLength(100)
                .WithMessage(AiErrorMessageConstant.AiPromptVersionTooLong);

            RuleFor(x => x)
                .Must(x => !x.IsActive || x.IsEnabled)
                .WithMessage(AiErrorMessageConstant.AiPromptActiveRequiresEnabled);
        }
    }
}
