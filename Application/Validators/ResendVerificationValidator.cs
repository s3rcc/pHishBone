using Application.Constants;
using Application.DTOs.Auth;
using FluentValidation;

namespace Application.Validators
{
    public class ResendVerificationValidator : AbstractValidator<ResendVerificationRequestDto>
    {
        public ResendVerificationValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage(ValidationMessageConstant.EmailRequired)
                .EmailAddress().WithMessage(ValidationMessageConstant.EmailInvalidFormat);
        }
    }
}
