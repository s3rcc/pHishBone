using Application.Constants;
using FluentValidation;

namespace Application.Validators.Image
{
    /// <summary>
    /// Validator for CreateImageDto.
    /// </summary>
    public class CreateImageDtoValidator : AbstractValidator<DTOs.ImageDTOs.CreateImageDto>
    {
        public CreateImageDtoValidator()
        {
            RuleFor(x => x.ImageUrl)
                .NotEmpty().WithMessage(CatalogErrorMessageConstant.ImageUrlRequired)
                .MaximumLength(500).WithMessage(CatalogErrorMessageConstant.ImageUrlTooLong)
                .Must(BeAValidUrl).WithMessage(CatalogErrorMessageConstant.InvalidImageUrl);

            RuleFor(x => x.Caption)
                .MaximumLength(255).WithMessage(CatalogErrorMessageConstant.CaptionTooLong);

            RuleFor(x => x.SortOrder)
                .GreaterThanOrEqualTo(0);
        }

        private static bool BeAValidUrl(string url)
        {
            return Uri.TryCreate(url, UriKind.Absolute, out var result) 
                   && (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps);
        }
    }

    /// <summary>
    /// Validator for SetThumbnailDto.
    /// </summary>
    public class SetThumbnailDtoValidator : AbstractValidator<DTOs.ImageDTOs.SetThumbnailDto>
    {
        public SetThumbnailDtoValidator()
        {
            RuleFor(x => x.ImageUrl)
                .NotEmpty().WithMessage(CatalogErrorMessageConstant.ImageUrlRequired)
                .MaximumLength(500).WithMessage(CatalogErrorMessageConstant.ImageUrlTooLong)
                .Must(BeAValidUrl).WithMessage(CatalogErrorMessageConstant.InvalidImageUrl);
        }

        private static bool BeAValidUrl(string url)
        {
            return Uri.TryCreate(url, UriKind.Absolute, out var result)
                   && (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps);
        }
    }
}
