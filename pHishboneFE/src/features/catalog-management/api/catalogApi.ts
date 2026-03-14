import { axiosInstance } from '../../../lib/axiosInstance';
import type {
    ApiResponse,
    CreateSpeciesPayload,
    CreateTagPayload,
    CreateTypePayload,
    PaginationResponse,
    SpeciesDetailDto,
    SpeciesDto,
    SpeciesFilter,
    TagDto,
    TagFilter,
    SpeciesTypeDto,
    TypeFilter,
    UpdateSpeciesPayload,
    UpdateTagPayload,
    UpdateTypePayload,
} from '../types';

// ─── Species ─────────────────────────────────────────────────────────────────

export const speciesApi = {
    getList: async (): Promise<SpeciesDto[]> => {
        const { data } = await axiosInstance.get<ApiResponse<SpeciesDto[]>>('/api/catalog/species');
        return data.data;
    },

    getPaginated: async (filter: SpeciesFilter): Promise<PaginationResponse<SpeciesDto>> => {
        const { data } = await axiosInstance.get<ApiResponse<PaginationResponse<SpeciesDto>>>(
            '/api/catalog/species/paginated',
            { params: filter },
        );
        return data.data;
    },

    getById: async (id: string): Promise<SpeciesDto> => {
        const { data } = await axiosInstance.get<ApiResponse<SpeciesDto>>(
            `/api/catalog/species/${id}`,
        );
        return data.data;
    },

    getDetailById: async (id: string): Promise<SpeciesDetailDto> => {
        const { data } = await axiosInstance.get<ApiResponse<SpeciesDetailDto>>(
            `/api/catalog/species/${id}/detail`,
        );
        return data.data;
    },

    search: async (q: string): Promise<SpeciesDto[]> => {
        const { data } = await axiosInstance.get<ApiResponse<PaginationResponse<SpeciesDto>>>(
            '/api/catalog/species/search',
            { params: { q } },
        );
        return data.data.items;
    },

    create: async (payload: CreateSpeciesPayload): Promise<SpeciesDetailDto> => {
        const { data } = await axiosInstance.post<ApiResponse<SpeciesDetailDto>>(
            '/api/catalog/species',
            payload,
        );
        return data.data;
    },

    update: async (id: string, payload: UpdateSpeciesPayload): Promise<SpeciesDetailDto> => {
        const { data } = await axiosInstance.put<ApiResponse<SpeciesDetailDto>>(
            `/api/catalog/species/${id}`,
            payload,
        );
        return data.data;
    },

    delete: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/api/catalog/species/${id}`);
    },
};

// ─── Tags ─────────────────────────────────────────────────────────────────────

export const tagsApi = {
    getList: async (): Promise<TagDto[]> => {
        const { data } = await axiosInstance.get<ApiResponse<TagDto[]>>('/api/catalog/tags');
        return data.data;
    },

    getPaginated: async (filter: TagFilter): Promise<PaginationResponse<TagDto>> => {
        const { data } = await axiosInstance.get<ApiResponse<PaginationResponse<TagDto>>>(
            '/api/catalog/tags/paginated',
            { params: filter },
        );
        return data.data;
    },

    getById: async (id: string): Promise<TagDto> => {
        const { data } = await axiosInstance.get<ApiResponse<TagDto>>(
            `/api/catalog/tags/${id}`,
        );
        return data.data;
    },

    create: async (payload: CreateTagPayload): Promise<TagDto> => {
        const { data } = await axiosInstance.post<ApiResponse<TagDto>>(
            '/api/catalog/tags',
            payload,
        );
        return data.data;
    },

    update: async (id: string, payload: UpdateTagPayload): Promise<TagDto> => {
        const { data } = await axiosInstance.put<ApiResponse<TagDto>>(
            `/api/catalog/tags/${id}`,
            payload,
        );
        return data.data;
    },

    delete: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/api/catalog/tags/${id}`);
    },
};

// ─── Types ───────────────────────────────────────────────────────────────────

export const typesApi = {
    getList: async (): Promise<SpeciesTypeDto[]> => {
        const { data } = await axiosInstance.get<ApiResponse<SpeciesTypeDto[]>>('/api/catalog/types');
        return data.data;
    },

    getPaginated: async (filter: TypeFilter): Promise<PaginationResponse<SpeciesTypeDto>> => {
        const { data } = await axiosInstance.get<ApiResponse<PaginationResponse<SpeciesTypeDto>>>(
            '/api/catalog/types/paginated',
            { params: filter },
        );
        return data.data;
    },

    getById: async (id: string): Promise<SpeciesTypeDto> => {
        const { data } = await axiosInstance.get<ApiResponse<SpeciesTypeDto>>(
            `/api/catalog/types/${id}`,
        );
        return data.data;
    },

    create: async (payload: CreateTypePayload): Promise<SpeciesTypeDto> => {
        const { data } = await axiosInstance.post<ApiResponse<SpeciesTypeDto>>(
            '/api/catalog/types',
            payload,
        );
        return data.data;
    },

    update: async (id: string, payload: UpdateTypePayload): Promise<SpeciesTypeDto> => {
        const { data } = await axiosInstance.put<ApiResponse<SpeciesTypeDto>>(
            `/api/catalog/types/${id}`,
            payload,
        );
        return data.data;
    },

    delete: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/api/catalog/types/${id}`);
    },
};

// ─── Species Images ──────────────────────────────────────────────────────────

import type { ImageResponseDto } from '../types';

export const speciesImageApi = {
    getAll: async (speciesId: string): Promise<ImageResponseDto[]> => {
        const { data } = await axiosInstance.get<ApiResponse<ImageResponseDto[]>>(
            `/api/catalog/species/${speciesId}/images`,
        );
        return data.data;
    },

    upload: async (
        speciesId: string,
        file: File,
        caption?: string,
        sortOrder?: number,
    ): Promise<ImageResponseDto> => {
        const formData = new FormData();
        formData.append('File', file);
        if (caption) formData.append('Caption', caption);
        if (sortOrder !== undefined) formData.append('SortOrder', String(sortOrder));
        const { data } = await axiosInstance.post<ApiResponse<ImageResponseDto>>(
            `/api/catalog/species/${speciesId}/images`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        return data.data;
    },

    uploadBatch: async (speciesId: string, files: File[]): Promise<ImageResponseDto[]> => {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));
        const { data } = await axiosInstance.post<ApiResponse<ImageResponseDto[]>>(
            `/api/catalog/species/${speciesId}/images/batch`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        return data.data;
    },

    remove: async (speciesId: string, imageId: string): Promise<void> => {
        await axiosInstance.delete(`/api/catalog/species/${speciesId}/images/${imageId}`);
    },

    setThumbnail: async (speciesId: string, file: File): Promise<void> => {
        const formData = new FormData();
        formData.append('File', file);
        await axiosInstance.patch(
            `/api/catalog/species/${speciesId}/set-thumbnail`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } },
        );
    },
};

// ─── Compatibility Rules ─────────────────────────────────────────────────────

import type {
    CompatibilityRuleDto,
    CompatibilityRuleFilter,
    CreateCompatibilityRulePayload,
    UpdateCompatibilityRulePayload,
} from '../types';

export const compatibilityRuleApi = {
    getPaginated: async (filter: CompatibilityRuleFilter): Promise<PaginationResponse<CompatibilityRuleDto>> => {
        const { data } = await axiosInstance.get<ApiResponse<PaginationResponse<CompatibilityRuleDto>>>(
            '/api/catalog/compatibility-rules/paginated',
            { params: filter },
        );
        return data.data;
    },

    getById: async (id: string): Promise<CompatibilityRuleDto> => {
        const { data } = await axiosInstance.get<ApiResponse<CompatibilityRuleDto>>(
            `/api/catalog/compatibility-rules/${id}`,
        );
        return data.data;
    },

    create: async (payload: CreateCompatibilityRulePayload): Promise<CompatibilityRuleDto> => {
        const { data } = await axiosInstance.post<ApiResponse<CompatibilityRuleDto>>(
            '/api/catalog/compatibility-rules',
            payload,
        );
        return data.data;
    },

    update: async (id: string, payload: UpdateCompatibilityRulePayload): Promise<CompatibilityRuleDto> => {
        const { data } = await axiosInstance.put<ApiResponse<CompatibilityRuleDto>>(
            `/api/catalog/compatibility-rules/${id}`,
            payload,
        );
        return data.data;
    },

    delete: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/api/catalog/compatibility-rules/${id}`);
    },
};
