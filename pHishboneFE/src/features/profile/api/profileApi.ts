import { axiosInstance } from '../../../lib/axiosInstance';
import type {
    ApiResponse,
    BookmarkedSpeciesDto,
    PaginationResponse,
    SpeciesBookmarkFilterDto,
    UserDto,
} from '../types';

export const profileApi = {
    /**
     * PUT /api/auth/me — update username
     */
    updateProfile: async (username: string): Promise<ApiResponse<UserDto>> => {
        const { data } = await axiosInstance.put<ApiResponse<UserDto>>('/api/auth/me', { username });
        return data;
    },

    /**
     * POST /api/auth/me/avatar — upload avatar (multipart/form-data)
     */
    uploadAvatar: async (file: File): Promise<ApiResponse<UserDto>> => {
        const form = new FormData();
        form.append('file', file);
        const { data } = await axiosInstance.post<ApiResponse<UserDto>>('/api/auth/me/avatar', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    /**
     * POST /api/auth/change-email — request an email change via Supabase Auth
     */
    changeEmail: async (newEmail: string): Promise<ApiResponse<object>> => {
        const { data } = await axiosInstance.post<ApiResponse<object>>('/api/auth/change-email', { newEmail });
        return data;
    },

    /**
     * POST /api/auth/change-password — change password for authenticated user
     */
    changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<object>> => {
        const { data } = await axiosInstance.post<ApiResponse<object>>('/api/auth/change-password', {
            currentPassword,
            newPassword,
        });
        return data;
    },

    /**
     * GET /api/auth/me/bookmarks - get the current user's bookmarked species.
     */
    getBookmarks: async (
        filter: SpeciesBookmarkFilterDto,
    ): Promise<PaginationResponse<BookmarkedSpeciesDto>> => {
        const { data } = await axiosInstance.get<ApiResponse<PaginationResponse<BookmarkedSpeciesDto>>>(
            '/api/auth/me/bookmarks',
            { params: filter },
        );
        if (!data.data) {
            throw new Error('Bookmark response did not include data.');
        }
        return data.data;
    },

    /**
     * DELETE /api/auth/me/bookmarks/{speciesId} - remove a bookmarked species.
     */
    removeBookmark: async (speciesId: string): Promise<void> => {
        await axiosInstance.delete(`/api/auth/me/bookmarks/${speciesId}`);
    },
};
