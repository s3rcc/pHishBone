using Application.Constants;
using FluentValidation;

namespace Application.Validators.Image
{
    /// <summary>
    /// Validator for CreateImageDto (file-based upload).
    /// </summary>
    public class CreateImageDtoValidator : AbstractValidator<DTOs.ImageDTOs.CreateImageDto>
    {
        public CreateImageDtoValidator()
        {
            RuleFor(x => x.File)
                .NotNull().WithMessage(CatalogErrorMessageConstant.FileRequired);

            RuleFor(x => x.Caption)
                .MaximumLength(255).WithMessage(CatalogErrorMessageConstant.CaptionTooLong);

            RuleFor(x => x.SortOrder)
                .GreaterThanOrEqualTo(0);
        }
    }

    /// <summary>
    /// Validator for SetThumbnailDto (file-based upload).
    /// </summary>
    public class SetThumbnailDtoValidator : AbstractValidator<DTOs.ImageDTOs.SetThumbnailDto>
    {
        public SetThumbnailDtoValidator()
        {
            RuleFor(x => x.File)
                .NotNull().WithMessage(CatalogErrorMessageConstant.FileRequired);
        }
    }
}
