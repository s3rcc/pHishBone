using Application.Constants;
using Application.DTOs.ProjectDTOs;
using FluentValidation;

namespace Application.Validators.Project
{
    /// <summary>
    /// Validator for AddTankItemDto.
    /// </summary>
    public class AddTankItemDtoValidator : AbstractValidator<AddTankItemDto>
    {
        public AddTankItemDtoValidator()
        {
            RuleFor(x => x.ItemType)
                .IsInEnum().WithMessage(ProjectErrorMessageConstant.ItemTypeRequired);

            RuleFor(x => x.ReferenceId)
                .NotEmpty().WithMessage(ProjectErrorMessageConstant.ReferenceIdRequired);

            RuleFor(x => x.Quantity)
                .GreaterThan(0).WithMessage(ProjectErrorMessageConstant.InvalidQuantity);

            RuleFor(x => x.Note)
                .MaximumLength(255).WithMessage(ProjectErrorMessageConstant.NoteTooLong);
        }
    }
}
