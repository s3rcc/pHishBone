import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { aiModelApi, aiPromptApi } from '../api/aiManagementApi';
import type {
    AiModelConfigFilter,
    AiPromptTemplateFilter,
    CreateAiModelConfigPayload,
    CreateAiPromptTemplatePayload,
    UpdateAiModelConfigPayload,
    UpdateAiPromptTemplatePayload,
} from '../types';

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const AI_MGMT_KEYS = {
    modelsPaginated: (filter: AiModelConfigFilter) => ['admin', 'ai-models', 'paginated', filter] as const,
    promptsPaginated: (filter: AiPromptTemplateFilter) => ['admin', 'ai-prompts', 'paginated', filter] as const,
} as const;

// ─── AI Model Queries ────────────────────────────────────────────────────────

export function useAiModelsPaginated(filter: AiModelConfigFilter) {
    return useSuspenseQuery({
        queryKey: AI_MGMT_KEYS.modelsPaginated(filter),
        queryFn: () => aiModelApi.getPaginated(filter),
    });
}

// ─── AI Model Mutations ──────────────────────────────────────────────────────

export function useCreateAiModel() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateAiModelConfigPayload) => aiModelApi.create(payload),
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin', 'ai-models'] }); },
    });
}

export function useUpdateAiModel() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateAiModelConfigPayload }) =>
            aiModelApi.update(id, payload),
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin', 'ai-models'] }); },
    });
}

export function useDeleteAiModel() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => aiModelApi.delete(id),
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin', 'ai-models'] }); },
    });
}

// ─── AI Prompt Queries ───────────────────────────────────────────────────────

export function useAiPromptsPaginated(filter: AiPromptTemplateFilter) {
    return useSuspenseQuery({
        queryKey: AI_MGMT_KEYS.promptsPaginated(filter),
        queryFn: () => aiPromptApi.getPaginated(filter),
    });
}

// ─── AI Prompt Mutations ─────────────────────────────────────────────────────

export function useCreateAiPrompt() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateAiPromptTemplatePayload) => aiPromptApi.create(payload),
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin', 'ai-prompts'] }); },
    });
}

export function useUpdateAiPrompt() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateAiPromptTemplatePayload }) =>
            aiPromptApi.update(id, payload),
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin', 'ai-prompts'] }); },
    });
}

export function useDeleteAiPrompt() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => aiPromptApi.delete(id),
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin', 'ai-prompts'] }); },
    });
}
