namespace Infrastructure.Settings
{
    /// <summary>
    /// Typed configuration for Cloudinary API credentials.
    /// Bound from appsettings.json "CloudinarySettings" section.
    /// </summary>
    public class CloudinarySettings
    {
        public string CloudName { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
        public string ApiSecret { get; set; } = string.Empty;
    }
}
