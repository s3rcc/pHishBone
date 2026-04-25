import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import type { SpeciesDetailDto } from '../../catalog-management/types';
import { tankApi } from '../api/tankApi';
import type {
    AddTankItemPayload,
    CreateTankPayload,
    TankItemResponseDto,
    UpdateTankItemPayload,
    UpdateTankPayload,
} from '../types';

export const TANK_BUILDER_KEYS = {
    userTanks: ['tank-builder', 'user-tanks'] as const,
    tankDetail: (tankId: string) => ['tank-builder', 'tank-detail', tankId] as const,
    tankItems: (tankId: string) => ['tank-builder', 'tank-items', tankId] as const,
    tankAnalysis: (tankId: string) => ['tank-builder', 'tank-analysis', tankId] as const,
    tankSpeciesDetails: (speciesIds: string[]) => ['tank-builder', 'tank-species-details', ...speciesIds] as const,
} as const;

function invalidateTankWorkspace(queryClient: ReturnType<typeof useQueryClient>, tankId: string): Promise<unknown[]> {
    return Promise.all([
        queryClient.invalidateQueries({ queryKey: TANK_BUILDER_KEYS.userTanks }),
        queryClient.invalidateQueries({ queryKey: TANK_BUILDER_KEYS.tankDetail(tankId) }),
        queryClient.invalidateQueries({ queryKey: TANK_BUILDER_KEYS.tankItems(tankId) }),
        queryClient.invalidateQueries({ queryKey: TANK_BUILDER_KEYS.tankAnalysis(tankId) }),
    ]);
}

export function useUserTanks() {
    return useSuspenseQuery({
        queryKey: TANK_BUILDER_KEYS.userTanks,
        queryFn: tankApi.getUserTanks,
    });
}

export function useTankDetail(tankId: string) {
    return useSuspenseQuery({
        queryKey: TANK_BUILDER_KEYS.tankDetail(tankId),
        queryFn: () => tankApi.getTankById(tankId),
    });
}

export function useTankItems(tankId: string) {
    return useSuspenseQuery({
        queryKey: TANK_BUILDER_KEYS.tankItems(tankId),
        queryFn: () => tankApi.getTankItems(tankId),
    });
}

export function useTankSpeciesDetails(items: TankItemResponseDto[]) {
    const speciesIds = Array.from(
        new Set(
            items
                .filter((item) => item.itemType === 1)
                .map((item) => item.referenceId),
        ),
    ).sort();

    return useQuery({
        queryKey: TANK_BUILDER_KEYS.tankSpeciesDetails(speciesIds),
        queryFn: async (): Promise<SpeciesDetailDto[]> => {
            if (speciesIds.length === 0) {
                return [];
            }

            return Promise.all(speciesIds.map((speciesId) => tankApi.getSpeciesDetailById(speciesId)));
        },
        placeholderData: (previousData) => previousData ?? [],
        staleTime: 10 * 60 * 1000,
    });
}

export function useUserTankAnalysis(tankId: string, hasInventory: boolean) {
    return useQuery({
        queryKey: TANK_BUILDER_KEYS.tankAnalysis(tankId),
        queryFn: () => tankApi.getTankAnalysis(tankId),
        enabled: hasInventory,
        placeholderData: (previousData) => previousData,
    });
}

export function useCreateTank() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateTankPayload) => tankApi.createTank(payload),
        onSuccess: (tank) => {
            void queryClient.invalidateQueries({ queryKey: TANK_BUILDER_KEYS.userTanks });
            queryClient.setQueryData(TANK_BUILDER_KEYS.tankDetail(tank.id), tank);
        },
    });
}

export function useUpdateTank() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ tankId, payload }: { tankId: string; payload: UpdateTankPayload }) =>
            tankApi.updateTank(tankId, payload),
        onSuccess: (tank) => {
            queryClient.setQueryData(TANK_BUILDER_KEYS.tankDetail(tank.id), tank);
            void queryClient.invalidateQueries({ queryKey: TANK_BUILDER_KEYS.userTanks });
            void queryClient.invalidateQueries({ queryKey: TANK_BUILDER_KEYS.tankAnalysis(tank.id) });
        },
    });
}

export function useDeleteTank() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (tankId: string) => tankApi.deleteTank(tankId),
        onSuccess: (_data, tankId) => {
            void queryClient.invalidateQueries({ queryKey: TANK_BUILDER_KEYS.userTanks });
            queryClient.removeQueries({ queryKey: TANK_BUILDER_KEYS.tankDetail(tankId) });
            queryClient.removeQueries({ queryKey: TANK_BUILDER_KEYS.tankItems(tankId) });
            queryClient.removeQueries({ queryKey: TANK_BUILDER_KEYS.tankAnalysis(tankId) });
        },
    });
}

export function useAddTankItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ tankId, payload }: { tankId: string; payload: AddTankItemPayload }) =>
            tankApi.addTankItem(tankId, payload),
        onSuccess: (_item, { tankId }) => {
            void invalidateTankWorkspace(queryClient, tankId);
        },
    });
}

export function useUpdateTankItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ tankId, itemId, payload }: { tankId: string; itemId: string; payload: UpdateTankItemPayload }) =>
            tankApi.updateTankItem(tankId, itemId, payload),
        onSuccess: (_item, { tankId }) => {
            void invalidateTankWorkspace(queryClient, tankId);
        },
    });
}

export function useDeleteTankItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ tankId, itemId }: { tankId: string; itemId: string }) =>
            tankApi.deleteTankItem(tankId, itemId),
        onSuccess: (_data, { tankId }) => {
            void invalidateTankWorkspace(queryClient, tankId);
        },
    });
}
