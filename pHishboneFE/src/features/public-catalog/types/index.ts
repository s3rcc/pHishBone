import type { DietType, SwimLevel, WaterType } from '../../catalog-management/types';

// ─── Public Catalog Filter ────────────────────────────────────────────────────

/**
 * Full filter params accepted by /api/catalog/species/search.
 * Mirrors SpeciesFilterDto on the backend.
 * IsActive is intentionally omitted — it is admin-only.
 */
export interface PublicCatalogFilter {
    // Pagination
    page?: number;
    size?: number;

    // Sorting
    sortBy?: string;
    isAscending?: boolean;

    // Name search (FTS + trigram hybrid)
    searchTerm?: string;

    // Species filters
    typeId?: string;

    // SpeciesEnvironment filters
    phMin?: number;
    phMax?: number;
    tempMin?: number;
    tempMax?: number;
    waterType?: WaterType;

    // SpeciesProfile filters
    dietType?: DietType;
    swimLevel?: SwimLevel;
    origin?: string;
    isSchooling?: boolean;
    maxAdultSize?: number;

    // Tags (must have ALL selected tags)
    tagIds?: string[];
}

export interface RelatedSpeciesDto {
    id: string;
    typeId?: string | null;
    typeName?: string | null;
    scientificName?: string | null;
    commonName: string;
    thumbnailUrl?: string;
    slug: string;
    isActive?: boolean | null;
    createdTime: string;
    score: number;
    matchReasons: string[];
}

export interface SpeciesBookmarkStatusDto {
    speciesId: string;
    isBookmarked: boolean;
    bookmarkedTime?: string | null;
}

export interface BookmarkedSpeciesDto {
    id: string;
    typeId?: string | null;
    typeName?: string | null;
    scientificName?: string | null;
    commonName: string;
    thumbnailUrl?: string;
    slug: string;
    isActive?: boolean | null;
    createdTime: string;
    bookmarkedTime: string;
}
