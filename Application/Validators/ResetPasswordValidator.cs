using Application.Constants;
using Application.DTOs.Auth;
using FluentValidation;

namespace Application.Validators
{
    public class ResetPasswordValidator : AbstractValidator<ResetPasswordRequestDto>
    {
        public ResetPasswordValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage(ValidationMessageConstant.EmailRequired)
                .EmailAddress().WithMessage(ValidationMessageConstant.EmailInvalidFormat);

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage(ValidationMessageConstant.PasswordRequired)
                .MinimumLength(6).WithMessage(ValidationMessageConstant.PasswordMinLength);

            RuleFor(x => x.Code)
                .NotEmpty().WithMessage(ValidationMessageConstant.ResetCodeRequired);
        }
    }
}
