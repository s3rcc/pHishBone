using Application.Constants;
using Application.DTOs.PBUserDTOs;
using FluentValidation;

namespace Application.Validators
{
    public class ChangeEmailRequestDtoValidator : AbstractValidator<ChangeEmailRequestDto>
    {
        public ChangeEmailRequestDtoValidator()
        {
            RuleFor(x => x.NewEmail)
                .NotEmpty().WithMessage(ValidationMessageConstant.EmailRequired)
                .EmailAddress().WithMessage(ValidationMessageConstant.EmailInvalidFormat);
        }
    }
}
