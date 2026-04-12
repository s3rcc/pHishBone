using Domain.Enums;

namespace Application.Common.Interfaces
{
    public interface IAiProviderClient
    {
        AiProvider Provider { get; }

        Task<T> GenerateStructuredOutputAsync<T>(
            string modelId,
            string systemPrompt,
            string userPrompt,
            int? maxOutputTokens,
            decimal? temperature,
            int timeoutSeconds,
            CancellationToken cancellationToken = default);
    }
}
