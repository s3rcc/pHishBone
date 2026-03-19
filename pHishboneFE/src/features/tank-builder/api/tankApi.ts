import { axiosInstance } from '../../../lib/axiosInstance';
import type { ApiResponse } from '../../catalog-management/types';
import type { TankAnalysisResult, TankSnapshotRequest } from '../types';

export const tankApi = {
    /**
     * Snapshots the current tank state and runs compatibility rules
     * and BioLoad calculations on the backend.
     */
    analyzeSnapshot: async (request: TankSnapshotRequest): Promise<TankAnalysisResult> => {
        const { data } = await axiosInstance.post<ApiResponse<TankAnalysisResult>>(
            '/api/tanks/analyze',
            request,
        );
        return data.data;
    },
};
