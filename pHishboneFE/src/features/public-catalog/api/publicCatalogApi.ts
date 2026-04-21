import { axiosInstance } from '../../../lib/axiosInstance';
import type {
    ApiResponse,
    SpeciesDto,
    SpeciesDetailDto,
    ImageResponseDto,
    PaginationResponse,
    SpeciesTypeDto,
    TagDto,
} from '../../catalog-management/types';
import type { PublicCatalogFilter } from '../types';

// ─── Public Catalog API (Read-Only) ──────────────────────────────────────────

export const publicCatalogApi = {
    /**
     * Bilingual hybrid search (FTS + Trigram) with rich filtering.
     * Accepts the full PublicCatalogFilter — all params are optional.
     * Returns a PaginationResponse so the UI can show total count and paginate.
     */
    searchSpecies: async (filter: PublicCatalogFilter): Promise<PaginationResponse<SpeciesDto>> => {
        const { data } = await axiosInstance.get<ApiResponse<PaginationResponse<SpeciesDto>>>(
            '/api/catalog/species/search',
            { params: filter },
        );
        return data.data;
    },

    /**
     * Get full species details by slug for SEO-friendly detail pages.
     */
    getSpeciesBySlug: async (slug: string): Promise<SpeciesDetailDto> => {
        const { data } = await axiosInstance.get<ApiResponse<SpeciesDetailDto>>(
            `/api/catalog/species/by-slug/${slug}`,
        );
        return data.data;
    },

    /**
     * Get all gallery images for a species.
     */
    getSpeciesImages: async (speciesId: string): Promise<ImageResponseDto[]> => {
        const { data } = await axiosInstance.get<ApiResponse<ImageResponseDto[]>>(
            `/api/catalog/species/${speciesId}/images`,
        );
        return data.data;
    },

    /**
     * Get all species types for the filter panel dropdown.
     */
    getTypes: async (): Promise<SpeciesTypeDto[]> => {
        const { data } = await axiosInstance.get<ApiResponse<SpeciesTypeDto[]>>(
            '/api/catalog/types',
        );
        return data.data;
    },

    /**
     * Get all tags for the tag filter panel.
     */
    getTags: async (): Promise<TagDto[]> => {
        const { data } = await axiosInstance.get<ApiResponse<TagDto[]>>(
            '/api/catalog/tags',
        );
        return data.data;
    },
};

