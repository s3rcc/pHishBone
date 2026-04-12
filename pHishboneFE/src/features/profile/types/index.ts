import type { ApiResponse, UserDto } from '../../auth/types';

// ─── Request DTOs (mirror the backend's Application/DTOs/PBUserDTOs) ──────────

/** PUT /api/auth/me — only username is updatable at the moment */
export interface UpdateProfileRequestDto {
    username?: string;
}

/** POST /api/auth/change-email */
export interface ChangeEmailRequestDto {
    newEmail: string;
}

// Re-export shared types so consumers only need to import from profile
export type { ApiResponse, UserDto };
