using Application.Constants;
using Application.DTOs.Auth;
using FluentValidation;

namespace Application.Validators
{
    public class ForgotPasswordValidator : AbstractValidator<ForgotPasswordRequestDto>
    {
        public ForgotPasswordValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage(ValidationMessageConstant.EmailRequired)
                .EmailAddress().WithMessage(ValidationMessageConstant.EmailInvalidFormat);
        }
    }
}
