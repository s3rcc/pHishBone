import { axiosInstance } from '../../../lib/axiosInstance';
import { publicCatalogApi } from '../../public-catalog/api/publicCatalogApi';
import type { ApiResponse, SpeciesDetailDto, SpeciesDto } from '../../catalog-management/types';
import type { GuestTankAnalysisRequest, TankAnalysisReportDto } from '../types';

export const tankApi = {
    analyzeGuestTank: async (request: GuestTankAnalysisRequest): Promise<TankAnalysisReportDto> => {
        const { data } = await axiosInstance.post<ApiResponse<TankAnalysisReportDto>>(
            '/api/guest/tanks/analysis',
            request,
        );

        return data.data;
    },

    searchSpecies: async (query: string): Promise<SpeciesDto[]> => {
        return publicCatalogApi.searchSpecies(query);
    },

    getSpeciesDetailBySlug: async (slug: string): Promise<SpeciesDetailDto> => {
        return publicCatalogApi.getSpeciesBySlug(slug);
    },
};
