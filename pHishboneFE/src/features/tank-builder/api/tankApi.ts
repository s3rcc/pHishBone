import { axiosInstance } from '../../../lib/axiosInstance';
import { speciesApi } from '../../catalog-management/api/catalogApi';
import { publicCatalogApi } from '../../public-catalog/api/publicCatalogApi';
import type { ApiResponse, SpeciesDetailDto, SpeciesDto } from '../../catalog-management/types';
import type {
    AddTankItemPayload,
    CreateTankPayload,
    GuestTankAnalysisRequest,
    TankAnalysisReportDto,
    TankItemResponseDto,
    TankListItemDto,
    TankResponseDto,
    UpdateTankItemPayload,
    UpdateTankPayload,
} from '../types';

export const tankApi = {
    analyzeGuestTank: async (request: GuestTankAnalysisRequest): Promise<TankAnalysisReportDto> => {
        const { data } = await axiosInstance.post<ApiResponse<TankAnalysisReportDto>>(
            '/api/guest/tanks/analysis',
            request,
        );

        return data.data;
    },

    searchSpecies: async (query: string): Promise<SpeciesDto[]> => {
        const response = await publicCatalogApi.searchSpecies({ searchTerm: query });
        return response.items;
    },

    getSpeciesDetailBySlug: async (slug: string): Promise<SpeciesDetailDto> => {
        return publicCatalogApi.getSpeciesBySlug(slug);
    },

    getSpeciesDetailById: async (speciesId: string): Promise<SpeciesDetailDto> => {
        return speciesApi.getDetailById(speciesId);
    },

    getUserTanks: async (): Promise<TankListItemDto[]> => {
        const { data } = await axiosInstance.get<ApiResponse<TankListItemDto[]>>('/api/tanks');
        return data.data;
    },

    getTankById: async (tankId: string): Promise<TankResponseDto> => {
        const { data } = await axiosInstance.get<ApiResponse<TankResponseDto>>(`/api/tanks/${tankId}`);
        return data.data;
    },

    createTank: async (payload: CreateTankPayload): Promise<TankResponseDto> => {
        const { data } = await axiosInstance.post<ApiResponse<TankResponseDto>>('/api/tanks', payload);
        return data.data;
    },

    updateTank: async (tankId: string, payload: UpdateTankPayload): Promise<TankResponseDto> => {
        const { data } = await axiosInstance.put<ApiResponse<TankResponseDto>>(`/api/tanks/${tankId}`, payload);
        return data.data;
    },

    deleteTank: async (tankId: string): Promise<void> => {
        await axiosInstance.delete(`/api/tanks/${tankId}`);
    },

    getTankItems: async (tankId: string): Promise<TankItemResponseDto[]> => {
        const { data } = await axiosInstance.get<ApiResponse<TankItemResponseDto[]>>(`/api/tanks/${tankId}/items`);
        return data.data;
    },

    addTankItem: async (tankId: string, payload: AddTankItemPayload): Promise<TankItemResponseDto> => {
        const { data } = await axiosInstance.post<ApiResponse<TankItemResponseDto>>(
            `/api/tanks/${tankId}/items`,
            payload,
        );
        return data.data;
    },

    updateTankItem: async (
        tankId: string,
        itemId: string,
        payload: UpdateTankItemPayload,
    ): Promise<TankItemResponseDto> => {
        const { data } = await axiosInstance.put<ApiResponse<TankItemResponseDto>>(
            `/api/tanks/${tankId}/items/${itemId}`,
            payload,
        );
        return data.data;
    },

    deleteTankItem: async (tankId: string, itemId: string): Promise<void> => {
        await axiosInstance.delete(`/api/tanks/${tankId}/items/${itemId}`);
    },

    getTankAnalysis: async (tankId: string): Promise<TankAnalysisReportDto> => {
        const { data } = await axiosInstance.get<ApiResponse<TankAnalysisReportDto>>(`/api/tanks/${tankId}/analysis`);
        return data.data;
    },
};
