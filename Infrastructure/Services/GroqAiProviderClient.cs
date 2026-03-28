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
using System.Text.Json.Serialization.Metadata;
using MicrosoftChatMessage = Microsoft.Extensions.AI.ChatMessage;
using MicrosoftChatRole = Microsoft.Extensions.AI.ChatRole;
using OpenAiChatClient = OpenAI.Chat.ChatClient;

namespace Infrastructure.Services
{
    public class GroqAiProviderClient : IAiProviderClient
    {
        private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web)
        {
            PropertyNameCaseInsensitive = true,
            TypeInfoResolver = new DefaultJsonTypeInfoResolver()
        };

        private readonly AiProviderSettings _settings;
        private readonly ILogger<GroqAiProviderClient> _logger;

        public GroqAiProviderClient(
            IOptions<AiProviderSettings> settings,
            ILogger<GroqAiProviderClient> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public AiProvider Provider => AiProvider.Groq;

        public async Task<T> GenerateStructuredOutputAsync<T>(
            string modelId,
            string systemPrompt,
            string userPrompt,
            int? maxOutputTokens,
            decimal? temperature,
            int timeoutSeconds,
            CancellationToken cancellationToken = default)
        {
            var groq = _settings.Groq;
            if (string.IsNullOrWhiteSpace(groq.ApiKey) || string.IsNullOrWhiteSpace(groq.BaseUrl))
            {
                throw new CustomErrorException(
                    StatusCodes.Status500InternalServerError,
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    AiErrorMessageConstant.AiProviderNotConfigured
                );
            }

            try
            {
                var client = CreateChatClient(groq, modelId);
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

                var response = await GetStructuredResponseAsync<T>(
                    client,
                    messages,
                    options,
                    linkedCts.Token);

                return response.Result;
            }
            catch (OperationCanceledException ex) when (!cancellationToken.IsCancellationRequested)
            {
                _logger.LogError(ex, "Groq request timed out for model {ModelId}", modelId);
                throw new CustomErrorException(
                    StatusCodes.Status504GatewayTimeout,
                    ErrorCode.FAILED,
                    AiErrorMessageConstant.AiRequestTimedOut
                );
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Groq returned malformed structured output for model {ModelId}", modelId);
                throw new CustomErrorException(
                    StatusCodes.Status502BadGateway,
                    ErrorCode.FAILED,
                    AiErrorMessageConstant.AiResponseMalformed
                );
            }
            catch (ClientResultException ex) when (ex.Status == 404)
            {
                _logger.LogError(ex, "Groq could not find model {ModelId} at base URL {BaseUrl}", modelId, groq.BaseUrl);
                throw new CustomErrorException(
                    StatusCodes.Status502BadGateway,
                    ErrorCode.FAILED,
                    AiErrorMessageConstant.AiProviderModelUnavailable
                );
            }
            catch (ClientResultException ex)
            {
                _logger.LogError(ex, "Groq request failed for model {ModelId} with status code {StatusCode}", modelId, ex.Status);
                throw new CustomErrorException(
                    StatusCodes.Status502BadGateway,
                    ErrorCode.FAILED,
                    AiErrorMessageConstant.AiProviderRequestFailed
                );
            }
            catch (CustomErrorException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Groq request failed for model {ModelId}", modelId);
                throw new CustomErrorException(
                    StatusCodes.Status502BadGateway,
                    ErrorCode.FAILED,
                    AiErrorMessageConstant.AiResponseMalformed
                );
            }
        }

        private static IChatClient CreateChatClient(GroqSettings settings, string modelId)
        {
            var options = new OpenAIClientOptions
            {
                Endpoint = new Uri(settings.BaseUrl.TrimEnd('/') + "/")
            };

            OpenAiChatClient chatClient = new(modelId, new ApiKeyCredential(settings.ApiKey), options);
            return chatClient.AsIChatClient();
        }

        private async Task<ChatResponse<T>> GetStructuredResponseAsync<T>(
            IChatClient client,
            IEnumerable<MicrosoftChatMessage> messages,
            ChatOptions options,
            CancellationToken cancellationToken)
        {
            try
            {
                return await client.GetResponseAsync<T>(
                    messages,
                    SerializerOptions,
                    options,
                    useJsonSchemaResponseFormat: true,
                    cancellationToken: cancellationToken);
            }
            catch (ClientResultException ex) when (ex.Status is 400 or 422)
            {
                _logger.LogWarning(ex, "Groq rejected JSON schema response format. Falling back to non-schema structured output mode.");

                return await client.GetResponseAsync<T>(
                    messages,
                    SerializerOptions,
                    options,
                    useJsonSchemaResponseFormat: false,
                    cancellationToken: cancellationToken);
            }
        }
    }
}
