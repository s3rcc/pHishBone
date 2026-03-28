namespace Application.Constants
{
    public static class AiErrorMessageConstant
    {
        public const string FishNameRequired = "Fish name is required.";
        public const string ModelConfigIdRequired = "Model configuration ID is required.";
        public const string AiModelDisplayNameRequired = "Model display name is required.";
        public const string AiProviderModelIdRequired = "Provider model ID is required.";
        public const string AiModelDescriptionTooLong = "Model description cannot exceed 1000 characters.";
        public const string AiPromptNameRequired = "Prompt name is required.";
        public const string AiPromptBodyRequired = "System prompt is required.";
        public const string AiPromptDescriptionTooLong = "Prompt description cannot exceed 1000 characters.";
        public const string AiPromptVersionTooLong = "Version label cannot exceed 100 characters.";
        public const string AiModelNotFound = "AI model configuration not found.";
        public const string AiModelDisabled = "The selected AI model is disabled.";
        public const string AiModelDuplicateDisplayName = "An AI model with this display name already exists.";
        public const string AiModelDuplicateProviderModel = "An AI model with this provider/model combination already exists.";
        public const string AiPromptNotFound = "AI prompt template not found.";
        public const string AiPromptDuplicateName = "An AI prompt with this name already exists.";
        public const string AiPromptDisabled = "The active AI prompt for this use case is disabled.";
        public const string AiPromptActiveMissing = "No active AI prompt is configured for this use case.";
        public const string AiPromptActiveRequiresEnabled = "An active prompt must also be enabled.";
        public const string AiProviderNotConfigured = "The AI provider is not configured correctly.";
        public const string AiProviderUnsupported = "The selected AI provider is not supported.";
        public const string AiProviderModelUnavailable = "The selected provider model could not be found or is not available.";
        public const string AiProviderRequestFailed = "The AI provider request failed.";
        public const string AiResponseEmpty = "The AI provider returned an empty response.";
        public const string AiResponseMalformed = "The AI provider returned malformed structured data.";
        public const string AiRequestTimedOut = "The AI provider request timed out.";
    }
}
