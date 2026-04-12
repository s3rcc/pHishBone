using Application.Constants;
using Application.DTOs.ProjectDTOs;
using FluentValidation;

namespace Application.Validators.Project
{
    /// <summary>
    /// Validator for GuestTankAnalysisRequestDto.
    /// </summary>
    public class GuestTankAnalysisRequestDtoValidator : AbstractValidator<GuestTankAnalysisRequestDto>
    {
        public GuestTankAnalysisRequestDtoValidator()
        {
            RuleFor(x => x.Width)
                .GreaterThan(0).WithMessage(ProjectErrorMessageConstant.InvalidDimensions);

            RuleFor(x => x.Height)
                .GreaterThan(0).WithMessage(ProjectErrorMessageConstant.InvalidDimensions);

            RuleFor(x => x.Depth)
                .GreaterThan(0).WithMessage(ProjectErrorMessageConstant.InvalidDimensions);

            RuleFor(x => x.Items)
                .NotNull();

            RuleForEach(x => x.Items)
                .SetValidator(new GuestTankItemDtoValidator());
        }
    }

    public class GuestTankItemDtoValidator : AbstractValidator<GuestTankItemDto>
    {
        public GuestTankItemDtoValidator()
        {
            RuleFor(x => x.SpeciesId)
                .NotEmpty().WithMessage(ProjectErrorMessageConstant.ReferenceIdRequired);

            RuleFor(x => x.Quantity)
                .GreaterThan(0).WithMessage(ProjectErrorMessageConstant.InvalidQuantity);
        }
    }
}
