import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '../../public-catalog/hooks/useDebounce';
import { tankApi } from '../api/tankApi';
import type { GuestTankAnalysisRequest, TankSpeciesDraft, TankDimensions } from '../types';

interface UseGuestTankAnalysisArgs {
    dimensions: TankDimensions;
    inventory: TankSpeciesDraft[];
}

function buildRequest(dimensions: TankDimensions, inventory: TankSpeciesDraft[]): GuestTankAnalysisRequest {
    return {
        width: dimensions.length,
        height: dimensions.height,
        depth: dimensions.width,
        items: inventory.map((item) => ({
            speciesId: item.speciesId,
            quantity: item.quantity,
        })),
    };
}

export function useGuestTankAnalysis({ dimensions, inventory }: UseGuestTankAnalysisArgs) {
    const debouncedDimensions = useDebounce(dimensions, 350);
    const debouncedInventory = useDebounce(inventory, 350);
    const request = buildRequest(debouncedDimensions, debouncedInventory);

    return useQuery({
        queryKey: ['tank-builder', 'guest-analysis', request],
        queryFn: () => tankApi.analyzeGuestTank(request),
        enabled: debouncedInventory.length > 0,
        placeholderData: (previousData) => previousData,
    });
}

export default useGuestTankAnalysis;
