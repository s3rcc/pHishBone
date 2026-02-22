import { axiosInstance } from '../../../lib/axiosInstance';
import type {
    ApiResponse,
    LoginRequestDto,
    LoginResponseDto,
    RegisterRequestDto,
    UserDto,
} from '../types';

function storeTokens(data: LoginResponseDto): void {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
}

function clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
}

export const authApi = {
    login: async (dto: LoginRequestDto): Promise<ApiResponse<LoginResponseDto>> => {
        const { data } = await axiosInstance.post<ApiResponse<LoginResponseDto>>(
            '/api/auth/login',
            dto,
        );
        if (data.data) {
            storeTokens(data.data);
        }
        return data;
    },

    register: async (dto: RegisterRequestDto): Promise<ApiResponse<LoginResponseDto>> => {
        const { data } = await axiosInstance.post<ApiResponse<LoginResponseDto>>(
            '/api/auth/register',
            dto,
        );
        if (data.data) {
            storeTokens(data.data);
        }
        return data;
    },

    getMe: async (): Promise<UserDto> => {
        const { data } = await axiosInstance.get<ApiResponse<UserDto>>('/api/auth/me');
        if (!data.data) {
            throw new Error(data.message ?? 'Unauthorized');
        }
        return data.data;
    },

    logout: async (): Promise<void> => {
        try {
            await axiosInstance.post('/api/auth/logout');
        } finally {
            clearTokens();
        }
    },
};
