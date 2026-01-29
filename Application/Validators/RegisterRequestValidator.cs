using Application.Constants;
using Application.DTOs.Auth;
using FluentValidation;

namespace Application.Validators
{
    public class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
    {
        public RegisterRequestValidator()
        {
            RuleFor(x => x.Username)
                .NotEmpty().WithMessage(ValidationMessageConstant.UsernameRequired)
                .Length(3, 50).WithMessage(ValidationMessageConstant.UsernameLength);

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage(ValidationMessageConstant.EmailRequired)
                .EmailAddress().WithMessage(ValidationMessageConstant.EmailInvalidFormat);

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage(ValidationMessageConstant.PasswordRequired)
                .MinimumLength(6).WithMessage(ValidationMessageConstant.PasswordMinLength);
        }
    }
}
