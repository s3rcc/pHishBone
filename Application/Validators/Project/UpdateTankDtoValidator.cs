using Application.Constants;
using Application.DTOs.ProjectDTOs;
using FluentValidation;

namespace Application.Validators.Project
{
    /// <summary>
    /// Validator for UpdateTankDto.
    /// </summary>
    public class UpdateTankDtoValidator : AbstractValidator<UpdateTankDto>
    {
        public UpdateTankDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage(ProjectErrorMessageConstant.TankNameRequired)
                .MaximumLength(100).WithMessage(ProjectErrorMessageConstant.TankNameTooLong);

            RuleFor(x => x.Width)
                .GreaterThan(0).WithMessage(ProjectErrorMessageConstant.InvalidDimensions);

            RuleFor(x => x.Height)
                .GreaterThan(0).WithMessage(ProjectErrorMessageConstant.InvalidDimensions);

            RuleFor(x => x.Depth)
                .GreaterThan(0).WithMessage(ProjectErrorMessageConstant.InvalidDimensions);

            RuleFor(x => x.WaterVolume)
                .GreaterThan(0).WithMessage(ProjectErrorMessageConstant.InvalidWaterVolume);

            RuleFor(x => x.WaterType)
                .IsInEnum().WithMessage("Invalid water type.");

            RuleFor(x => x.Status)
                .IsInEnum().WithMessage("Invalid tank status.");
        }
    }
}
