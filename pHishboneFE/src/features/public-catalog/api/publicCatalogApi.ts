import { axiosInstance } from '../../../lib/axiosInstance';
import type {
    ApiResponse,
    SpeciesDto,
    SpeciesDetailDto,
    ImageResponseDto,
    PaginationResponse,
} from '../../catalog-management/types';

// ─── Public Catalog API (Read-Only) ──────────────────────────────────────────

export const publicCatalogApi = {
    /**
     * Bilingual hybrid search (FTS + Trigram). Returns up to 20 results ranked by relevance.
     * When query is empty, returns top 20 species ordered by common name.
     */
    searchSpecies: async (q: string): Promise<SpeciesDto[]> => {
        const { data } = await axiosInstance.get<ApiResponse<PaginationResponse<SpeciesDto>>>(
            '/api/catalog/species/search',
            { params: { q } },
        );
        return data.data.items;
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
};
