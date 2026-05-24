import { useCallback, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useMuiSnackbar } from '../../../hooks/useMuiSnackbar';
import type { SpeciesDetailDto, SpeciesDto } from '../../catalog-management/types';
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

interface OptimisticTankMutationContext {
    previousItems?: TankItemResponseDto[];
    previousTankDetail?: TankResponseDto;
    previousUserTanks?: TankListItemDto[];
    speciesDetailsKey?: readonly unknown[];
    previousSpeciesDetails?: SpeciesDetailDto[];
}

interface AddTankItemMutationArgs {
    tankId: string;
    payload: AddTankItemPayload;
    optimisticSpecies?: SpeciesDto;
    skipOptimistic?: boolean;
}

interface UpdateTankItemMutationArgs {
    tankId: string;
    itemId: string;
    payload: UpdateTankItemPayload;
    skipOptimistic?: boolean;
}

interface DeleteTankItemMutationArgs {
    tankId: string;
    itemId: string;
    skipOptimistic?: boolean;
}

interface BufferedSpeciesSyncEntry {
    baselineItemId?: string;
    baselineQuantity: number;
    targetQuantity: number;
    note?: string;
    optimisticSpecies?: SpeciesDto;
    isFlushing: boolean;
}

const BUFFER_FLUSH_DELAY_MS = 450;

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

function buildOptimisticSpeciesDetail(species: SpeciesDto): SpeciesDetailDto {
    return {
        ...species,
        tags: [],
    };
}

function findSpeciesItem(items: TankItemResponseDto[], speciesId: string): TankItemResponseDto | undefined {
    return items.find((item) => item.itemType === 1 && item.referenceId === speciesId);
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

function buildOptimisticItem(
    tankId: string,
    payload: AddTankItemPayload,
): TankItemResponseDto {
    return {
        id: `optimistic:${tankId}:${payload.referenceId}`,
        tankId,
        itemType: payload.itemType,
        referenceId: payload.referenceId,
        quantity: payload.quantity,
        note: payload.note ?? null,
        createdTime: new Date().toISOString(),
    };
}

function buildSpeciesDetailsKey(items: TankItemResponseDto[]) {
    const speciesIds = Array.from(
        new Set(
            items
                .filter((item) => item.itemType === 1)
                .map((item) => item.referenceId),
        ),
    ).sort();

    return TANK_BUILDER_KEYS.tankSpeciesDetails(speciesIds);
}

function restoreOptimisticTankMutation(
    queryClient: ReturnType<typeof useQueryClient>,
    tankId: string,
    context?: OptimisticTankMutationContext,
) {
    if (!context) {
        return;
    }

    if (context.previousItems) {
        queryClient.setQueryData(TANK_BUILDER_KEYS.tankItems(tankId), context.previousItems);
    }

    if (context.previousTankDetail) {
        queryClient.setQueryData(TANK_BUILDER_KEYS.tankDetail(tankId), context.previousTankDetail);
    }

    if (context.previousUserTanks) {
        queryClient.setQueryData(TANK_BUILDER_KEYS.userTanks, context.previousUserTanks);
    }

    if (context.speciesDetailsKey) {
        queryClient.setQueryData(context.speciesDetailsKey, context.previousSpeciesDetails ?? []);
    }
}

function applyOptimisticAddMutation(
    queryClient: ReturnType<typeof useQueryClient>,
    tankId: string,
    payload: AddTankItemPayload,
    optimisticSpecies?: SpeciesDto,
): OptimisticTankMutationContext {
    const previousItems = queryClient.getQueryData<TankItemResponseDto[]>(TANK_BUILDER_KEYS.tankItems(tankId));
    const previousTankDetail = queryClient.getQueryData<TankResponseDto>(TANK_BUILDER_KEYS.tankDetail(tankId));
    const previousUserTanks = queryClient.getQueryData<TankListItemDto[]>(TANK_BUILDER_KEYS.userTanks);

    const optimisticItem = buildOptimisticItem(tankId, payload);
    const currentItems = previousItems ?? [];
    const existingItem = currentItems.find((item) =>
        item.referenceId === payload.referenceId && item.itemType === payload.itemType);

    const nextItems = existingItem
        ? currentItems.map((item) => (
            item.id === existingItem.id
                ? {
                    ...item,
                    quantity: item.quantity + payload.quantity,
                    note: payload.note ?? item.note,
                }
                : item
        ))
        : [optimisticItem, ...currentItems];

    queryClient.setQueryData(TANK_BUILDER_KEYS.tankItems(tankId), nextItems);

    updateTankCaches(queryClient, tankId, {
        itemCountDelta: existingItem ? 0 : 1,
        status: 0,
        lastUpdatedTime: new Date().toISOString(),
    });

    let speciesDetailsKey: readonly unknown[] | undefined;
    let previousSpeciesDetails: SpeciesDetailDto[] | undefined;

    if (!existingItem && optimisticSpecies && optimisticItem.itemType === 1) {
        speciesDetailsKey = buildSpeciesDetailsKey(nextItems);
        previousSpeciesDetails = queryClient.getQueryData<SpeciesDetailDto[]>(speciesDetailsKey);

        const optimisticDetail = buildOptimisticSpeciesDetail(optimisticSpecies);
        const mergedDetails = [...(previousSpeciesDetails ?? [])];
        if (!mergedDetails.some((detail) => detail.id === optimisticDetail.id)) {
            mergedDetails.push(optimisticDetail);
        }

        queryClient.setQueryData(speciesDetailsKey, mergedDetails);
        void queryClient.invalidateQueries({ queryKey: speciesDetailsKey });
    }

    return {
        previousItems,
        previousTankDetail,
        previousUserTanks,
        speciesDetailsKey,
        previousSpeciesDetails,
    };
}

function applyOptimisticUpdateMutation(
    queryClient: ReturnType<typeof useQueryClient>,
    tankId: string,
    itemId: string,
    payload: UpdateTankItemPayload,
): OptimisticTankMutationContext {
    const previousItems = queryClient.getQueryData<TankItemResponseDto[]>(TANK_BUILDER_KEYS.tankItems(tankId));
    const previousTankDetail = queryClient.getQueryData<TankResponseDto>(TANK_BUILDER_KEYS.tankDetail(tankId));
    const previousUserTanks = queryClient.getQueryData<TankListItemDto[]>(TANK_BUILDER_KEYS.userTanks);

    queryClient.setQueryData<TankItemResponseDto[]>(
        TANK_BUILDER_KEYS.tankItems(tankId),
        (items = []) => items.map((item) => (
            item.id === itemId
                ? {
                    ...item,
                    quantity: payload.quantity,
                    note: payload.note ?? item.note,
                }
                : item
        )),
    );

    updateTankCaches(queryClient, tankId, {
        status: 0,
        lastUpdatedTime: new Date().toISOString(),
    });

    return {
        previousItems,
        previousTankDetail,
        previousUserTanks,
    };
}

function applyOptimisticDeleteMutation(
    queryClient: ReturnType<typeof useQueryClient>,
    tankId: string,
    itemId: string,
): OptimisticTankMutationContext {
    const previousItems = queryClient.getQueryData<TankItemResponseDto[]>(TANK_BUILDER_KEYS.tankItems(tankId));
    const previousTankDetail = queryClient.getQueryData<TankResponseDto>(TANK_BUILDER_KEYS.tankDetail(tankId));
    const previousUserTanks = queryClient.getQueryData<TankListItemDto[]>(TANK_BUILDER_KEYS.userTanks);

    const removedItem = previousItems?.find((item) => item.id === itemId);

    queryClient.setQueryData<TankItemResponseDto[]>(
        TANK_BUILDER_KEYS.tankItems(tankId),
        (items = []) => items.filter((item) => item.id !== itemId),
    );

    updateTankCaches(queryClient, tankId, {
        itemCountDelta: removedItem ? -1 : 0,
        status: 0,
        lastUpdatedTime: new Date().toISOString(),
    });

    return {
        previousItems,
        previousTankDetail,
        previousUserTanks,
    };
}

function reapplyOptimisticSpeciesQuantity(
    queryClient: ReturnType<typeof useQueryClient>,
    tankId: string,
    speciesId: string,
    targetQuantity: number,
    optimisticSpecies?: SpeciesDto,
) {
    const items = queryClient.getQueryData<TankItemResponseDto[]>(TANK_BUILDER_KEYS.tankItems(tankId)) ?? [];
    const existingItem = findSpeciesItem(items, speciesId);
    const currentQuantity = existingItem?.quantity ?? 0;

    if (currentQuantity === targetQuantity) {
        return;
    }

    if (currentQuantity === 0 && targetQuantity > 0) {
        applyOptimisticAddMutation(queryClient, tankId, {
            itemType: 1,
            referenceId: speciesId,
            quantity: targetQuantity,
        }, optimisticSpecies);
        return;
    }

    if (targetQuantity === 0 && existingItem) {
        applyOptimisticDeleteMutation(queryClient, tankId, existingItem.id);
        return;
    }

    if (existingItem) {
        applyOptimisticUpdateMutation(queryClient, tankId, existingItem.id, {
            quantity: targetQuantity,
            note: existingItem.note ?? undefined,
        });
    }
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
        mutationFn: ({ tankId, payload }: AddTankItemMutationArgs) =>
            tankApi.addTankItem(tankId, payload),
        onMutate: async ({ tankId, payload, optimisticSpecies, skipOptimistic }) => {
            if (skipOptimistic) {
                return undefined;
            }

            await Promise.all([
                queryClient.cancelQueries({ queryKey: TANK_BUILDER_KEYS.tankItems(tankId) }),
                queryClient.cancelQueries({ queryKey: TANK_BUILDER_KEYS.tankDetail(tankId) }),
                queryClient.cancelQueries({ queryKey: TANK_BUILDER_KEYS.userTanks }),
            ]);

            return applyOptimisticAddMutation(queryClient, tankId, payload, optimisticSpecies);
        },
        onError: (_error, { tankId }, context) => {
            restoreOptimisticTankMutation(queryClient, tankId, context);
        },
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
        mutationFn: ({ tankId, itemId, payload }: UpdateTankItemMutationArgs) =>
            tankApi.updateTankItem(tankId, itemId, payload),
        onMutate: async ({ tankId, itemId, payload, skipOptimistic }) => {
            if (skipOptimistic) {
                return undefined;
            }

            await Promise.all([
                queryClient.cancelQueries({ queryKey: TANK_BUILDER_KEYS.tankItems(tankId) }),
                queryClient.cancelQueries({ queryKey: TANK_BUILDER_KEYS.tankDetail(tankId) }),
                queryClient.cancelQueries({ queryKey: TANK_BUILDER_KEYS.userTanks }),
            ]);

            return applyOptimisticUpdateMutation(queryClient, tankId, itemId, payload);
        },
        onError: (_error, { tankId }, context) => {
            restoreOptimisticTankMutation(queryClient, tankId, context);
        },
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
        mutationFn: ({ tankId, itemId }: DeleteTankItemMutationArgs) =>
            tankApi.deleteTankItem(tankId, itemId),
        onMutate: async ({ tankId, itemId, skipOptimistic }) => {
            if (skipOptimistic) {
                return undefined;
            }

            await Promise.all([
                queryClient.cancelQueries({ queryKey: TANK_BUILDER_KEYS.tankItems(tankId) }),
                queryClient.cancelQueries({ queryKey: TANK_BUILDER_KEYS.tankDetail(tankId) }),
                queryClient.cancelQueries({ queryKey: TANK_BUILDER_KEYS.userTanks }),
            ]);

            return applyOptimisticDeleteMutation(queryClient, tankId, itemId);
        },
        onError: (_error, { tankId }, context) => {
            restoreOptimisticTankMutation(queryClient, tankId, context);
        },
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

export function useBufferedTankSpeciesSync(tankId: string) {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    const { showSnackbar } = useMuiSnackbar();
    const addTankItem = useAddTankItem();
    const updateTankItem = useUpdateTankItem();
    const deleteTankItem = useDeleteTankItem();
    const pendingRef = useRef<Map<string, BufferedSpeciesSyncEntry>>(new Map());
    const timerRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const clearSpeciesTimer = useCallback((speciesId: string) => {
        const existingTimer = timerRef.current.get(speciesId);
        if (existingTimer) {
            clearTimeout(existingTimer);
            timerRef.current.delete(speciesId);
        }
    }, []);

    const flushSpeciesSync = useCallback(async (speciesId: string) => {
        const entry = pendingRef.current.get(speciesId);
        if (!entry || entry.isFlushing) {
            return;
        }

        clearSpeciesTimer(speciesId);
        entry.isFlushing = true;
        const requestTargetQuantity = entry.targetQuantity;

        try {
            let response: TankItemMutationResponseDto | null = null;

            if (entry.baselineQuantity <= 0 && requestTargetQuantity > 0) {
                response = await addTankItem.mutateAsync({
                    tankId,
                    payload: {
                        itemType: 1,
                        referenceId: speciesId,
                        quantity: requestTargetQuantity,
                        note: entry.note,
                    },
                    optimisticSpecies: entry.optimisticSpecies,
                    skipOptimistic: true,
                });
            } else if (entry.baselineItemId && requestTargetQuantity <= 0) {
                response = await deleteTankItem.mutateAsync({
                    tankId,
                    itemId: entry.baselineItemId,
                    skipOptimistic: true,
                });
            } else if (entry.baselineItemId && requestTargetQuantity > 0 && requestTargetQuantity !== entry.baselineQuantity) {
                response = await updateTankItem.mutateAsync({
                    tankId,
                    itemId: entry.baselineItemId,
                    payload: {
                        quantity: requestTargetQuantity,
                        note: entry.note,
                    },
                    skipOptimistic: true,
                });
            }

            const latestEntry = pendingRef.current.get(speciesId);
            if (!latestEntry) {
                return;
            }

            if (latestEntry.targetQuantity !== requestTargetQuantity) {
                latestEntry.baselineQuantity = requestTargetQuantity;
                latestEntry.baselineItemId = requestTargetQuantity > 0
                    ? (response?.item?.id ?? latestEntry.baselineItemId)
                    : undefined;
                latestEntry.isFlushing = false;
                reapplyOptimisticSpeciesQuantity(
                    queryClient,
                    tankId,
                    speciesId,
                    latestEntry.targetQuantity,
                    latestEntry.optimisticSpecies,
                );
                const timer = setTimeout(() => {
                    void flushSpeciesSync(speciesId);
                }, BUFFER_FLUSH_DELAY_MS);
                timerRef.current.set(speciesId, timer);
                return;
            }

            pendingRef.current.delete(speciesId);
        } catch (_error) {
            pendingRef.current.delete(speciesId);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: TANK_BUILDER_KEYS.tankItems(tankId) }),
                queryClient.invalidateQueries({ queryKey: TANK_BUILDER_KEYS.tankDetail(tankId) }),
                queryClient.invalidateQueries({ queryKey: TANK_BUILDER_KEYS.userTanks }),
                queryClient.invalidateQueries({ queryKey: TANK_BUILDER_KEYS.tankAnalysis(tankId) }),
            ]);
            showSnackbar(t('TankBuilder.updateTankError'), 'error');
        }
    }, [
        addTankItem,
        clearSpeciesTimer,
        deleteTankItem,
        queryClient,
        showSnackbar,
        t,
        tankId,
        updateTankItem,
    ]);

    const scheduleSpeciesFlush = useCallback((speciesId: string) => {
        clearSpeciesTimer(speciesId);
        const timer = setTimeout(() => {
            void flushSpeciesSync(speciesId);
        }, BUFFER_FLUSH_DELAY_MS);
        timerRef.current.set(speciesId, timer);
    }, [clearSpeciesTimer, flushSpeciesSync]);

    const queueAddSpecies = useCallback((species: SpeciesDto) => {
        const currentItems = queryClient.getQueryData<TankItemResponseDto[]>(TANK_BUILDER_KEYS.tankItems(tankId)) ?? [];
        const existingItem = findSpeciesItem(currentItems, species.id);
        const existingEntry = pendingRef.current.get(species.id);

        applyOptimisticAddMutation(queryClient, tankId, {
            itemType: 1,
            referenceId: species.id,
            quantity: 1,
        }, species);

        if (existingEntry) {
            existingEntry.targetQuantity += 1;
            if (!existingEntry.optimisticSpecies) {
                existingEntry.optimisticSpecies = species;
            }
        } else {
            pendingRef.current.set(species.id, {
                baselineItemId: existingItem && !existingItem.id.startsWith('optimistic:') ? existingItem.id : undefined,
                baselineQuantity: existingItem?.quantity ?? 0,
                targetQuantity: (existingItem?.quantity ?? 0) + 1,
                note: existingItem?.note ?? undefined,
                optimisticSpecies: species,
                isFlushing: false,
            });
        }

        scheduleSpeciesFlush(species.id);
    }, [queryClient, scheduleSpeciesFlush, tankId]);

    const queueSetSpeciesQuantity = useCallback((
        speciesId: string,
        targetQuantity: number,
        optimisticSpecies?: SpeciesDto,
    ) => {
        const currentItems = queryClient.getQueryData<TankItemResponseDto[]>(TANK_BUILDER_KEYS.tankItems(tankId)) ?? [];
        const existingItem = findSpeciesItem(currentItems, speciesId);
        const existingEntry = pendingRef.current.get(speciesId);
        const nextQuantity = Math.max(0, targetQuantity);

        if (nextQuantity === 0 && existingItem) {
            applyOptimisticDeleteMutation(queryClient, tankId, existingItem.id);
        } else if (existingItem) {
            applyOptimisticUpdateMutation(queryClient, tankId, existingItem.id, {
                quantity: nextQuantity,
                note: existingItem.note ?? undefined,
            });
        } else if (nextQuantity > 0) {
            applyOptimisticAddMutation(queryClient, tankId, {
                itemType: 1,
                referenceId: speciesId,
                quantity: nextQuantity,
            }, optimisticSpecies);
        }

        if (existingEntry) {
            existingEntry.targetQuantity = nextQuantity;
            if (optimisticSpecies && !existingEntry.optimisticSpecies) {
                existingEntry.optimisticSpecies = optimisticSpecies;
            }
        } else {
            pendingRef.current.set(speciesId, {
                baselineItemId: existingItem && !existingItem.id.startsWith('optimistic:') ? existingItem.id : undefined,
                baselineQuantity: existingItem?.quantity ?? 0,
                targetQuantity: nextQuantity,
                note: existingItem?.note ?? undefined,
                optimisticSpecies,
                isFlushing: false,
            });
        }

        scheduleSpeciesFlush(speciesId);
    }, [queryClient, scheduleSpeciesFlush, tankId]);

    useEffect(() => () => {
        timerRef.current.forEach((timer) => clearTimeout(timer));
        timerRef.current.clear();
        pendingRef.current.clear();
    }, []);

    return {
        queueAddSpecies,
        queueSetSpeciesQuantity,
        isSyncing:
            addTankItem.isPending ||
            updateTankItem.isPending ||
            deleteTankItem.isPending ||
            pendingRef.current.size > 0,
    };
}
