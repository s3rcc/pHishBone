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

            services.AddScoped<IAdminAuthorizationService, AdminAuthorizationService>();
            services.AddScoped<IAiModelConfigService, AiModelConfigService>();
            services.AddScoped<IAiPromptTemplateService, AiPromptTemplateService>();
            services.AddScoped<IAiFishInformationService, AiFishInformationService>();
            services.AddScoped<IAiProviderClient, OpenRouterAiProviderClient>();

            return services;
        }
    }
}
