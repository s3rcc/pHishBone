using Application.Common.Interfaces;
using Application.Constants;
using Domain.Enums;
using Domain.Exceptions;
using Infrastructure.Settings;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OpenAI;
using System.ClientModel;
using System.Text.Json;
using MicrosoftChatMessage = Microsoft.Extensions.AI.ChatMessage;
using MicrosoftChatRole = Microsoft.Extensions.AI.ChatRole;
using OpenAiChatClient = OpenAI.Chat.ChatClient;

namespace Infrastructure.Services
{
    public class OpenRouterAiProviderClient : IAiProviderClient
    {
        private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web)
        {
            PropertyNameCaseInsensitive = true
        };

        private readonly AiProviderSettings _settings;
        private readonly ILogger<OpenRouterAiProviderClient> _logger;

        public OpenRouterAiProviderClient(
            IOptions<AiProviderSettings> settings,
            ILogger<OpenRouterAiProviderClient> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public AiProvider Provider => AiProvider.OpenRouter;

        public async Task<T> GenerateStructuredOutputAsync<T>(
            string modelId,
            string systemPrompt,
            string userPrompt,
            int? maxOutputTokens,
            decimal? temperature,
            int timeoutSeconds,
            CancellationToken cancellationToken = default)
        {
            var openRouter = _settings.OpenRouter;
            if (string.IsNullOrWhiteSpace(openRouter.ApiKey) || string.IsNullOrWhiteSpace(openRouter.BaseUrl))
            {
                throw new CustomErrorException(
                    StatusCodes.Status500InternalServerError,
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    AiErrorMessageConstant.AiProviderNotConfigured
                );
            }

            try
            {
                var client = CreateChatClient(openRouter, modelId);
                var options = new ChatOptions
                {
                    MaxOutputTokens = maxOutputTokens,
                    Temperature = temperature.HasValue ? (float)temperature.Value : null
                };

                var messages = new[]
                {
                    new MicrosoftChatMessage(MicrosoftChatRole.System, systemPrompt),
                    new MicrosoftChatMessage(MicrosoftChatRole.User, userPrompt)
                };

                using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                linkedCts.CancelAfter(TimeSpan.FromSeconds(timeoutSeconds));

                var response = await client.GetResponseAsync<T>(
                    messages,
                    SerializerOptions,
                    options,
                    useJsonSchemaResponseFormat: false,
                    cancellationToken: linkedCts.Token);

                return response.Result;
            }
            catch (OperationCanceledException ex) when (!cancellationToken.IsCancellationRequested)
            {
                _logger.LogError(ex, "OpenRouter request timed out for model {ModelId}", modelId);
                throw new CustomErrorException(
                    StatusCodes.Status504GatewayTimeout,
                    ErrorCode.FAILED,
                    AiErrorMessageConstant.AiRequestTimedOut
                );
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "OpenRouter returned malformed structured output for model {ModelId}", modelId);
                throw new CustomErrorException(
                    StatusCodes.Status502BadGateway,
                    ErrorCode.FAILED,
                    AiErrorMessageConstant.AiResponseMalformed
                );
            }
            catch (CustomErrorException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OpenRouter request failed for model {ModelId}", modelId);
                throw new CustomErrorException(
                    StatusCodes.Status502BadGateway,
                    ErrorCode.FAILED,
                    AiErrorMessageConstant.AiResponseMalformed
                );
            }
        }

        private static IChatClient CreateChatClient(OpenRouterSettings settings, string modelId)
        {
            var options = new OpenAIClientOptions
            {
                Endpoint = new Uri(settings.BaseUrl.TrimEnd('/'))
            };

            var openAiClient = new OpenAIClient(new ApiKeyCredential(settings.ApiKey), options);
            OpenAiChatClient chatClient = openAiClient.GetChatClient(modelId);
            return chatClient.AsIChatClient();
        }
    }
}
