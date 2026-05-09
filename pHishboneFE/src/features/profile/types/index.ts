import type { ApiResponse, UserDto } from '../../auth/types';
import type { PaginationResponse, SpeciesDto } from '../../catalog-management/types';

// ─── Request DTOs (mirror the backend's Application/DTOs/PBUserDTOs) ──────────

/** PUT /api/auth/me — only username is updatable at the moment */
export interface UpdateProfileRequestDto {
    username?: string;
}

/** POST /api/auth/change-email */
export interface ChangeEmailRequestDto {
    newEmail: string;
}

export type SpeciesBookmarkSortBy =
    | 'bookmarkedTime'
    | 'commonName'
    | 'scientificName'
    | 'createdTime';

export interface SpeciesBookmarkFilterDto {
    page?: number;
    size?: number;
    searchTerm?: string;
    sortBy?: SpeciesBookmarkSortBy;
    isAscending?: boolean;
}

export interface BookmarkedSpeciesDto extends SpeciesDto {
    bookmarkedTime: string;
}

// Re-export shared types so consumers only need to import from profile
export type { ApiResponse, PaginationResponse, UserDto };
