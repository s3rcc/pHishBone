namespace Infrastructure.Settings
{
    /// <summary>
    /// Bound from appsettings.json "AiProviders" section.
    /// </summary>
    public class AiProviderSettings
    {
        public OpenRouterSettings OpenRouter { get; set; } = new();
    }

    public class OpenRouterSettings
    {
        public string BaseUrl { get; set; } = "https://openrouter.ai/api/v1";
        public string ApiKey { get; set; } = string.Empty;
        public string? AppName { get; set; }
        public string? SiteUrl { get; set; }
    }
}
