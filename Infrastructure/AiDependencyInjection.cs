using Application.Common.Interfaces;
using Infrastructure.Settings;
using Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure
{
    public static class AiDependencyInjection
    {
        public static IServiceCollection AddAiInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.Configure<AiProviderSettings>(configuration.GetSection("AiProviders"));

            var aiSettings = configuration.GetSection("AiProviders").Get<AiProviderSettings>() ?? new AiProviderSettings();
            services.AddHttpClient("OpenRouter", client =>
            {
                if (!string.IsNullOrWhiteSpace(aiSettings.OpenRouter.BaseUrl))
                {
                    client.BaseAddress = new Uri(aiSettings.OpenRouter.BaseUrl.TrimEnd('/') + "/");
                }
            });
            services.AddHttpClient("Groq", client =>
            {
                if (!string.IsNullOrWhiteSpace(aiSettings.Groq.BaseUrl))
                {
                    client.BaseAddress = new Uri(aiSettings.Groq.BaseUrl.TrimEnd('/') + "/");
                }
            });

            services.AddScoped<IAiModelConfigService, AiModelConfigService>();
            services.AddScoped<IAiPromptTemplateService, AiPromptTemplateService>();
            services.AddScoped<IAiFishInformationService, AiFishInformationService>();
            services.AddScoped<IAiProviderClient, OpenRouterAiProviderClient>();
            services.AddScoped<IAiProviderClient, GroqAiProviderClient>();

            return services;
        }
    }
}
