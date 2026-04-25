using Application.Constants;
using Application.DTOs.PBUserDTOs;
using FluentValidation;

namespace Application.Validators
{
    public class UpdateUserRoleRequestDtoValidator : AbstractValidator<UpdateUserRoleRequestDto>
    {
        public UpdateUserRoleRequestDtoValidator()
        {
            RuleFor(x => x.Role)
                .IsInEnum()
                .WithMessage(ValidationMessageConstant.RoleInvalid);
        }
    }
}
