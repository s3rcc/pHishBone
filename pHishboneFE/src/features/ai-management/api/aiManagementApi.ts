import { axiosInstance } from '../../../lib/axiosInstance';
import type {
    AiModelConfigDto,
    AiModelConfigFilter,
    AiPromptTemplateDto,
    AiPromptTemplateFilter,
    ApiResponse,
    CreateAiModelConfigPayload,
    CreateAiPromptTemplatePayload,
    PaginationResponse,
    UpdateAiModelConfigPayload,
    UpdateAiPromptTemplatePayload,
} from '../types';

// ─── AI Model Configs ────────────────────────────────────────────────────────

export const aiModelApi = {
    getPaginated: async (filter: AiModelConfigFilter): Promise<PaginationResponse<AiModelConfigDto>> => {
        const { data } = await axiosInstance.get<ApiResponse<PaginationResponse<AiModelConfigDto>>>(
            '/api/admin/ai/models/paginated',
            { params: filter },
        );
        return data.data;
    },

    getById: async (id: string): Promise<AiModelConfigDto> => {
        const { data } = await axiosInstance.get<ApiResponse<AiModelConfigDto>>(
            `/api/admin/ai/models/${id}`,
        );
        return data.data;
    },

    create: async (payload: CreateAiModelConfigPayload): Promise<AiModelConfigDto> => {
        const { data } = await axiosInstance.post<ApiResponse<AiModelConfigDto>>(
            '/api/admin/ai/models',
            payload,
        );
        return data.data;
    },

    update: async (id: string, payload: UpdateAiModelConfigPayload): Promise<AiModelConfigDto> => {
        const { data } = await axiosInstance.put<ApiResponse<AiModelConfigDto>>(
            `/api/admin/ai/models/${id}`,
            payload,
        );
        return data.data;
    },

    delete: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/api/admin/ai/models/${id}`);
    },
};

// ─── AI Prompt Templates ─────────────────────────────────────────────────────

export const aiPromptApi = {
    getPaginated: async (filter: AiPromptTemplateFilter): Promise<PaginationResponse<AiPromptTemplateDto>> => {
        const { data } = await axiosInstance.get<ApiResponse<PaginationResponse<AiPromptTemplateDto>>>(
            '/api/admin/ai/prompts/paginated',
            { params: filter },
        );
        return data.data;
    },

    getById: async (id: string): Promise<AiPromptTemplateDto> => {
        const { data } = await axiosInstance.get<ApiResponse<AiPromptTemplateDto>>(
            `/api/admin/ai/prompts/${id}`,
        );
        return data.data;
    },

    create: async (payload: CreateAiPromptTemplatePayload): Promise<AiPromptTemplateDto> => {
        const { data } = await axiosInstance.post<ApiResponse<AiPromptTemplateDto>>(
            '/api/admin/ai/prompts',
            payload,
        );
        return data.data;
    },

    update: async (id: string, payload: UpdateAiPromptTemplatePayload): Promise<AiPromptTemplateDto> => {
        const { data } = await axiosInstance.put<ApiResponse<AiPromptTemplateDto>>(
            `/api/admin/ai/prompts/${id}`,
            payload,
        );
        return data.data;
    },

    delete: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/api/admin/ai/prompts/${id}`);
    },
};
