// ─── Enums (mirror Domain.Enums on the backend) ─────────────────────────────

export type AiProvider = 0 | 1; // OpenRouter = 0, Groq = 1
export const AiProviderLabels: Record<AiProvider, string> = {
    0: 'OpenRouter',
    1: 'Groq',
};

export type AiPromptUseCase = 0; // FishInformation = 0
export const AiPromptUseCaseLabels: Record<AiPromptUseCase, string> = {
    0: 'Fish Information',
};

// ─── Common (re-export from catalog-management for consistency) ──────────────

export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

export interface PaginationResponse<T> {
    items: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

// ─── AI Model Config DTOs ────────────────────────────────────────────────────

export interface AiModelConfigDto {
    id: string;
    displayName: string;
    provider: AiProvider;
    providerModelId: string;
    isEnabled: boolean;
    isDefault: boolean;
    maxOutputTokens: number | null;
    temperature: number | null;
    timeoutSeconds: number;
    description: string | null;
    createdTime: string;
    lastUpdatedTime: string | null;
}

export interface AiModelConfigFilter {
    page?: number;
    size?: number;
    searchTerm?: string;
    provider?: AiProvider;
    isEnabled?: boolean;
    sortBy?: string;
    isAscending?: boolean;
}

export interface CreateAiModelConfigPayload {
    displayName: string;
    provider: AiProvider;
    providerModelId: string;
    isEnabled: boolean;
    isDefault: boolean;
    maxOutputTokens?: number | null;
    temperature?: number | null;
    timeoutSeconds: number;
    description?: string | null;
}

export interface UpdateAiModelConfigPayload {
    displayName: string;
    provider: AiProvider;
    providerModelId: string;
    isEnabled: boolean;
    isDefault: boolean;
    maxOutputTokens?: number | null;
    temperature?: number | null;
    timeoutSeconds: number;
    description?: string | null;
}

// ─── AI Prompt Template DTOs ─────────────────────────────────────────────────

export interface AiPromptTemplateDto {
    id: string;
    name: string;
    useCase: AiPromptUseCase;
    systemPrompt: string;
    isEnabled: boolean;
    isActive: boolean;
    description: string | null;
    versionLabel: string | null;
    createdTime: string;
    lastUpdatedTime: string | null;
}

export interface AiPromptTemplateFilter {
    page?: number;
    size?: number;
    searchTerm?: string;
    useCase?: AiPromptUseCase;
    isEnabled?: boolean;
    isActive?: boolean;
    sortBy?: string;
    isAscending?: boolean;
}

export interface CreateAiPromptTemplatePayload {
    name: string;
    useCase: AiPromptUseCase;
    systemPrompt: string;
    isEnabled: boolean;
    isActive: boolean;
    description?: string | null;
    versionLabel?: string | null;
}

export interface UpdateAiPromptTemplatePayload {
    name: string;
    useCase: AiPromptUseCase;
    systemPrompt: string;
    isEnabled: boolean;
    isActive: boolean;
    description?: string | null;
    versionLabel?: string | null;
}
