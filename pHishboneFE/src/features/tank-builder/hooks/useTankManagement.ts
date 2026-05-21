import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import type { SpeciesDetailDto } from '../../catalog-management/types';
import { tankApi } from '../api/tankApi';
import type {
    AddTankItemPayload,
    CreateTankPayload,
    TankListItemDto,
    TankItemMutationResponseDto,
    TankItemResponseDto,
    TankResponseDto,
    TankStatus,
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

interface TankMutationState {
    itemCount?: number;
    itemCountDelta?: number;
    status?: TankStatus;
    lastUpdatedTime?: string | null;
}

function clampItemCount(value: number): number {
    return Math.max(0, value);
}

function applyTankMutationStateToDetail(
    tank: TankResponseDto,
    state: TankMutationState,
): TankResponseDto {
    return {
        ...tank,
        itemCount: state.itemCount ?? clampItemCount(tank.itemCount + (state.itemCountDelta ?? 0)),
        status: state.status ?? tank.status,
        lastUpdatedTime: state.lastUpdatedTime ?? tank.lastUpdatedTime,
    };
}

function applyTankMutationStateToListItem(
    tank: TankListItemDto,
    state: TankMutationState,
): TankListItemDto {
    return {
        ...tank,
        itemCount: state.itemCount ?? clampItemCount(tank.itemCount + (state.itemCountDelta ?? 0)),
        status: state.status ?? tank.status,
    };
}

function updateTankCaches(
    queryClient: ReturnType<typeof useQueryClient>,
    tankId: string,
    state: TankMutationState,
) {
    queryClient.setQueryData<TankResponseDto | undefined>(
        TANK_BUILDER_KEYS.tankDetail(tankId),
        (tank) => (tank ? applyTankMutationStateToDetail(tank, state) : tank),
    );

    queryClient.setQueryData<TankListItemDto[] | undefined>(
        TANK_BUILDER_KEYS.userTanks,
        (tanks) => tanks?.map((tank) =>
            tank.id === tankId
                ? applyTankMutationStateToListItem(tank, state)
                : tank),
    );
}

function upsertTankItem(items: TankItemResponseDto[], item: TankItemResponseDto): TankItemResponseDto[] {
    const existingIndex = items.findIndex((existingItem) => existingItem.id === item.id);

    if (existingIndex === -1) {
        return [item, ...items];
    }

    return items.map((existingItem, index) => (index === existingIndex ? item : existingItem));
}

function syncAnalysisQuery(
    queryClient: ReturnType<typeof useQueryClient>,
    tankId: string,
    mutation: TankItemMutationResponseDto,
    items: TankItemResponseDto[],
) {
    const hasSpeciesItems = items.some((item) => item.itemType === 1);

    if (!hasSpeciesItems) {
        queryClient.removeQueries({ queryKey: TANK_BUILDER_KEYS.tankAnalysis(tankId) });
        return;
    }

    queryClient.setQueryData(TANK_BUILDER_KEYS.tankAnalysis(tankId), mutation.analysis);
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
            queryClient.setQueryData<TankListItemDto[] | undefined>(
                TANK_BUILDER_KEYS.userTanks,
                (tanks) => tanks?.map((existingTank) => (
                    existingTank.id === tank.id
                        ? {
                            ...existingTank,
                            name: tank.name,
                            waterVolume: tank.waterVolume,
                            waterType: tank.waterType,
                            status: tank.status,
                        }
                        : existingTank
                )),
            );
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
        onSuccess: (mutation, { tankId }) => {
            let nextItems: TankItemResponseDto[] = [];
            let itemAlreadyExisted = false;

            queryClient.setQueryData<TankItemResponseDto[]>(
                TANK_BUILDER_KEYS.tankItems(tankId),
                (items = []) => {
                    if (!mutation.item) {
                        nextItems = items;
                        return nextItems;
                    }

                    const item = mutation.item;
                    itemAlreadyExisted = items.some((existingItem) => existingItem.id === item.id);
                    nextItems = upsertTankItem(items, item);
                    return nextItems;
                },
            );

            updateTankCaches(queryClient, tankId, {
                itemCount: mutation.itemCount,
                itemCountDelta: itemAlreadyExisted ? 0 : 1,
                status: mutation.status,
                lastUpdatedTime: mutation.lastUpdatedTime,
            });

            syncAnalysisQuery(queryClient, tankId, mutation, nextItems);
        },
    });
}

export function useUpdateTankItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ tankId, itemId, payload }: { tankId: string; itemId: string; payload: UpdateTankItemPayload }) =>
            tankApi.updateTankItem(tankId, itemId, payload),
        onSuccess: (mutation, { tankId }) => {
            let nextItems: TankItemResponseDto[] = [];

            queryClient.setQueryData<TankItemResponseDto[]>(
                TANK_BUILDER_KEYS.tankItems(tankId),
                (items = []) => {
                    if (!mutation.item) {
                        nextItems = items;
                        return nextItems;
                    }

                    const item = mutation.item;
                    nextItems = upsertTankItem(items, item);
                    return nextItems;
                },
            );

            updateTankCaches(queryClient, tankId, {
                itemCount: mutation.itemCount,
                status: mutation.status,
                lastUpdatedTime: mutation.lastUpdatedTime,
            });

            syncAnalysisQuery(queryClient, tankId, mutation, nextItems);
        },
    });
}

export function useDeleteTankItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ tankId, itemId }: { tankId: string; itemId: string }) =>
            tankApi.deleteTankItem(tankId, itemId),
        onSuccess: (mutation, { tankId, itemId }) => {
            let removedItemCount = 0;
            let nextItems: TankItemResponseDto[] = [];

            queryClient.setQueryData<TankItemResponseDto[]>(
                TANK_BUILDER_KEYS.tankItems(tankId),
                (items = []) => {
                    removedItemCount = items.some((item) => item.id === itemId) ? 1 : 0;
                    nextItems = items.filter((item) => item.id !== itemId);
                    return nextItems;
                },
            );

            updateTankCaches(queryClient, tankId, {
                itemCount: mutation.itemCount,
                itemCountDelta: removedItemCount === 0 ? 0 : -1,
                status: mutation.status,
                lastUpdatedTime: mutation.lastUpdatedTime,
            });

            syncAnalysisQuery(queryClient, tankId, mutation, nextItems);
        },
    });
}
