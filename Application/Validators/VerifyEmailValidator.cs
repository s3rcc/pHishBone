using Application.Constants;
using Application.DTOs.Auth;
using FluentValidation;

namespace Application.Validators
{
    public class VerifyEmailValidator : AbstractValidator<VerifyEmailRequestDto>
    {
        public VerifyEmailValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage(ValidationMessageConstant.EmailRequired)
                .EmailAddress().WithMessage(ValidationMessageConstant.EmailInvalidFormat);

            RuleFor(x => x.Token)
                .NotEmpty().WithMessage(ValidationMessageConstant.VerificationTokenRequired);

            RuleFor(x => x.Type)
                .NotEmpty().WithMessage("Verification type is required");
        }
    }
}
