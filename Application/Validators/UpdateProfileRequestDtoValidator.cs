using Application.Constants;
using Application.DTOs.PBUserDTOs;
using FluentValidation;

namespace Application.Validators
{
    public class UpdateProfileRequestDtoValidator : AbstractValidator<UpdateProfileRequestDto>
    {
        public UpdateProfileRequestDtoValidator()
        {
            RuleFor(x => x.Username)
                .Length(3, 50).WithMessage(ValidationMessageConstant.UsernameLength)
                .When(x => x.Username != null);
        }
    }
}
