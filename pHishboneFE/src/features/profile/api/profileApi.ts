import { axiosInstance } from '../../../lib/axiosInstance';
import type { ApiResponse, UserDto } from '../types';

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
};
