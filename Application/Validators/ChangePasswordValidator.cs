using Application.Constants;
using Application.DTOs.Auth;
using FluentValidation;

namespace Application.Validators
{
    public class ChangePasswordValidator : AbstractValidator<ChangePasswordRequestDto>
    {
        public ChangePasswordValidator()
        {
            RuleFor(x => x.CurrentPassword)
                .NotEmpty().WithMessage(ValidationMessageConstant.CurrentPasswordRequired);

            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage(ValidationMessageConstant.NewPasswordRequired)
                .MinimumLength(6).WithMessage(ValidationMessageConstant.PasswordMinLength);
        }
    }
}
