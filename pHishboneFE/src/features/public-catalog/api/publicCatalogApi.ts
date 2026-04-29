import { axiosInstance } from '../../../lib/axiosInstance';
import type {
    ApiResponse,
    PaginationResponse,
    SpeciesDto,
    SpeciesDetailDto,
    ImageResponseDto,
    SpeciesTypeDto,
    TagDto,
} from '../../catalog-management/types';
import type {
    BookmarkedSpeciesDto,
    PublicCatalogFilter,
    RelatedSpeciesDto,
    SpeciesDetailPageDto,
    SpeciesBookmarkStatusDto,
} from '../types';

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
     * Get the full species detail page payload in a single request.
     */
    getSpeciesDetailPageBySlug: async (
        slug: string,
        params?: {
            size?: number;
            excludeIds?: string[];
            recentlyViewedIds?: string[];
            seed?: string;
        },
    ): Promise<SpeciesDetailPageDto> => {
        const { data } = await axiosInstance.get<ApiResponse<SpeciesDetailPageDto>>(
            `/api/catalog/species/by-slug/${slug}/page`,
            { params },
        );
        return data.data;
    },

    /**
     * Get related species for a detail page.
     */
    getRelatedSpecies: async (
        speciesId: string,
        params?: {
            size?: number;
            excludeIds?: string[];
            recentlyViewedIds?: string[];
            seed?: string;
        },
    ): Promise<RelatedSpeciesDto[]> => {
        const { data } = await axiosInstance.get<ApiResponse<RelatedSpeciesDto[]>>(
            `/api/catalog/species/${speciesId}/related`,
            { params },
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

    /**
     * Get bookmark status for the current user and species.
     */
    getBookmarkStatus: async (speciesId: string): Promise<SpeciesBookmarkStatusDto> => {
        const { data } = await axiosInstance.get<ApiResponse<SpeciesBookmarkStatusDto>>(
            `/api/auth/me/bookmarks/${speciesId}/status`,
        );
        return data.data;
    },

    /**
     * Bookmark a species for the current user.
     */
    addBookmark: async (speciesId: string): Promise<BookmarkedSpeciesDto> => {
        const { data } = await axiosInstance.post<ApiResponse<BookmarkedSpeciesDto>>(
            `/api/auth/me/bookmarks/${speciesId}`,
        );
        return data.data;
    },

    /**
     * Remove a species bookmark for the current user.
     */
    removeBookmark: async (speciesId: string): Promise<void> => {
        await axiosInstance.delete(`/api/auth/me/bookmarks/${speciesId}`);
    },
};

