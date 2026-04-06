import { axiosInstance } from '../../../lib/axiosInstance';
import type {
    ApiResponse,
    LoginRequestDto,
    LoginResponseDto,
    RegisterRequestDto,
    UserDto,
} from '../types';

export const authApi = {
    login: async (dto: LoginRequestDto): Promise<ApiResponse<LoginResponseDto>> => {
        const { data } = await axiosInstance.post<ApiResponse<LoginResponseDto>>(
            '/api/auth/login',
            dto,
        );

        return data;
    },

    register: async (dto: RegisterRequestDto): Promise<ApiResponse<LoginResponseDto>> => {
        const { data } = await axiosInstance.post<ApiResponse<LoginResponseDto>>(
            '/api/auth/register',
            dto,
        );

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
        await axiosInstance.post('/api/auth/logout');
    },
};
