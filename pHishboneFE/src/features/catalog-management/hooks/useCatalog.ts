import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { compatibilityRuleApi, speciesApi, speciesImageApi, tagsApi, typesApi } from '../api/catalogApi';
import type {
    CompatibilityRuleFilter,
    CreateCompatibilityRulePayload,
    CreateSpeciesPayload,
    CreateTagPayload,
    CreateTypePayload,
    GenerateFishInformationPayload,
    SpeciesFilter,
    TagFilter,
    TypeFilter,
    UpdateCompatibilityRulePayload,
    UpdateSpeciesPayload,
    UpdateTagPayload,
    UpdateTypePayload,
} from '../types';

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const CATALOG_KEYS = {
    speciesPaginated: (filter: SpeciesFilter) => ['catalog', 'species', 'paginated', filter] as const,
    speciesDetail: (id: string) => ['catalog', 'species', 'detail', id] as const,
    speciesImages: (id: string) => ['catalog', 'species', 'images', id] as const,
    typesList: ['catalog', 'types', 'list'] as const,
    typesPaginated: (filter: TypeFilter) => ['catalog', 'types', 'paginated', filter] as const,
    tagsList: ['catalog', 'tags', 'list'] as const,
    tagsPaginated: (filter: TagFilter) => ['catalog', 'tags', 'paginated', filter] as const,
    rulesPaginated: (filter: CompatibilityRuleFilter) => ['catalog', 'rules', 'paginated', filter] as const,
} as const;

// ─── Species Queries ──────────────────────────────────────────────────────────

export function useSpeciesPaginated(filter: SpeciesFilter) {
    return useSuspenseQuery({
        queryKey: CATALOG_KEYS.speciesPaginated(filter),
        queryFn: () => speciesApi.getPaginated(filter),
    });
}

export function useSpeciesDetail(id: string) {
    return useSuspenseQuery({
        queryKey: CATALOG_KEYS.speciesDetail(id),
        queryFn: () => speciesApi.getDetailById(id),
    });
}

// ─── Species Images Query ─────────────────────────────────────────────────────

export function useSpeciesImages(speciesId: string) {
    return useSuspenseQuery({
        queryKey: CATALOG_KEYS.speciesImages(speciesId),
        queryFn: () => speciesImageApi.getAll(speciesId),
    });
}

// ─── Type Queries ─────────────────────────────────────────────────────────────

export function useTypesList() {
    return useSuspenseQuery({
        queryKey: CATALOG_KEYS.typesList,
        queryFn: typesApi.getList,
        staleTime: 5 * 60 * 1000,
    });
}

export function useTypesPaginated(filter: TypeFilter) {
    return useSuspenseQuery({
        queryKey: CATALOG_KEYS.typesPaginated(filter),
        queryFn: () => typesApi.getPaginated(filter),
    });
}

// ─── Tag Queries ──────────────────────────────────────────────────────────────

export function useTagsList() {
    return useSuspenseQuery({
        queryKey: CATALOG_KEYS.tagsList,
        queryFn: tagsApi.getList,
        staleTime: 5 * 60 * 1000,
    });
}

export function useTagsPaginated(filter: TagFilter) {
    return useSuspenseQuery({
        queryKey: CATALOG_KEYS.tagsPaginated(filter),
        queryFn: () => tagsApi.getPaginated(filter),
    });
}

// ─── Species Mutations ────────────────────────────────────────────────────────

export function useCreateSpecies() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateSpeciesPayload) => speciesApi.create(payload),
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['catalog', 'species'] }); },
    });
}

export function useUpdateSpecies() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateSpeciesPayload }) =>
            speciesApi.update(id, payload),
        onSuccess: (_data, { id }) => {
            void qc.invalidateQueries({ queryKey: ['catalog', 'species'] });
            void qc.invalidateQueries({ queryKey: CATALOG_KEYS.speciesDetail(id) });
        },
    });
}

export function useDeleteSpecies() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => speciesApi.delete(id),
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['catalog', 'species'] }); },
    });
}

export function useGenerateFishInformation() {
    return useMutation({
        mutationFn: (payload: GenerateFishInformationPayload) => speciesApi.generateFishInformation(payload),
    });
}

// ─── Species Image Mutations ──────────────────────────────────────────────────

export function useUploadSpeciesImage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ speciesId, file, caption, sortOrder }: {
            speciesId: string; file: File; caption?: string; sortOrder?: number;
        }) => speciesImageApi.upload(speciesId, file, caption, sortOrder),
        onSuccess: (_data, { speciesId }) => {
            void qc.invalidateQueries({ queryKey: CATALOG_KEYS.speciesImages(speciesId) });
        },
    });
}

export function useUploadSpeciesImageBatch() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ speciesId, files }: { speciesId: string; files: File[] }) =>
            speciesImageApi.uploadBatch(speciesId, files),
        onSuccess: (_data, { speciesId }) => {
            void qc.invalidateQueries({ queryKey: CATALOG_KEYS.speciesImages(speciesId) });
        },
    });
}

export function useRemoveSpeciesImage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ speciesId, imageId }: { speciesId: string; imageId: string }) =>
            speciesImageApi.remove(speciesId, imageId),
        onSuccess: (_data, { speciesId }) => {
            void qc.invalidateQueries({ queryKey: CATALOG_KEYS.speciesImages(speciesId) });
            void qc.invalidateQueries({ queryKey: CATALOG_KEYS.speciesDetail(speciesId) });
            void qc.invalidateQueries({ queryKey: ['catalog', 'species'] });
        },
    });
}

export function useSetSpeciesThumbnail() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ speciesId, imageId }: { speciesId: string; imageId: string }) =>
            speciesImageApi.setThumbnail(speciesId, imageId),
        onSuccess: (_data, { speciesId }) => {
            void qc.invalidateQueries({ queryKey: CATALOG_KEYS.speciesImages(speciesId) });
            void qc.invalidateQueries({ queryKey: CATALOG_KEYS.speciesDetail(speciesId) });
            void qc.invalidateQueries({ queryKey: ['catalog', 'species'] });
        },
    });
}

// ─── Types Mutations ──────────────────────────────────────────────────────────

export function useCreateType() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateTypePayload) => typesApi.create(payload),
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['catalog', 'types'] }); },
    });
}

export function useUpdateType() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateTypePayload }) =>
            typesApi.update(id, payload),
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['catalog', 'types'] }); },
    });
}

export function useDeleteType() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => typesApi.delete(id),
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['catalog', 'types'] }); },
    });
}

// ─── Tags Mutations ───────────────────────────────────────────────────────────

export function useCreateTag() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateTagPayload) => tagsApi.create(payload),
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['catalog', 'tags'] }); },
    });
}

export function useUpdateTag() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateTagPayload }) =>
            tagsApi.update(id, payload),
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['catalog', 'tags'] }); },
    });
}

export function useDeleteTag() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => tagsApi.delete(id),
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['catalog', 'tags'] }); },
    });
}

// ─── Compatibility Rule Queries ───────────────────────────────────────────────

export function useCompatibilityRulesPaginated(filter: CompatibilityRuleFilter) {
    return useSuspenseQuery({
        queryKey: CATALOG_KEYS.rulesPaginated(filter),
        queryFn: () => compatibilityRuleApi.getPaginated(filter),
    });
}

// ─── Compatibility Rule Mutations ─────────────────────────────────────────────

export function useCreateCompatibilityRule() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateCompatibilityRulePayload) => compatibilityRuleApi.create(payload),
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['catalog', 'rules'] }); },
    });
}

export function useUpdateCompatibilityRule() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateCompatibilityRulePayload }) =>
            compatibilityRuleApi.update(id, payload),
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['catalog', 'rules'] }); },
    });
}

export function useDeleteCompatibilityRule() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => compatibilityRuleApi.delete(id),
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['catalog', 'rules'] }); },
    });
}
