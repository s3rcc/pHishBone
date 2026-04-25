import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useTranslation } from 'react-i18next';
import { useMuiSnackbar } from '../../../hooks/useMuiSnackbar';
import { useDebounce } from '../../public-catalog/hooks/useDebounce';
import type { WaterType } from '../../catalog-management/types';
import type { SpeciesDto, SpeciesDetailDto } from '../../catalog-management/types';
import BuilderAnalysisPanel from './BuilderAnalysisPanel';
import BuilderScene from './BuilderScene';
import BuilderSidebar from './BuilderSidebar';
import {
    clampSceneFishToDimensions,
    reconcileSceneFish,
} from '../helpers/scene';
import {
    useAddTankItem,
    useCreateTank,
    useDeleteTank,
    useDeleteTankItem,
    useTankDetail,
    useTankItems,
    useTankSpeciesDetails,
    useUpdateTank,
    useUpdateTankItem,
    useUserTankAnalysis,
    useUserTanks,
} from '../hooks/useTankManagement';
import type {
    TankDimensions,
    TankItemResponseDto,
    TankResponseDto,
    TankSceneFishInstance,
    TankSceneViewMode,
    TankSpeciesDraft,
    UpdateTankPayload,
} from '../types';
import { buildTankDraftFromDetail } from '../types';

const DEFAULT_TANK_DIMENSIONS: TankDimensions = {
    length: 90,
    width: 45,
    height: 45,
};

const DEFAULT_WATER_TYPE: WaterType = 0;

function mapTankToDimensions(tank: TankResponseDto): TankDimensions {
    return {
        length: tank.width,
        width: tank.depth,
        height: tank.height,
    };
}

function normalizeDimension(value: number): number {
    return Math.max(1, Math.round(value));
}

function computeWaterVolume(dimensions: TankDimensions): number {
    const volume = (dimensions.length * dimensions.width * dimensions.height) / 1000;
    return Math.max(1, Math.round(volume));
}

function buildUpdateTankPayload(
    tank: TankResponseDto,
    tankName: string,
    dimensions: TankDimensions,
): UpdateTankPayload {
    return {
        name: tankName.trim(),
        width: normalizeDimension(dimensions.length),
        height: normalizeDimension(dimensions.height),
        depth: normalizeDimension(dimensions.width),
        waterVolume: computeWaterVolume(dimensions),
        waterType: tank.waterType,
        status: tank.status,
    };
}

function buildInventory(
    items: TankItemResponseDto[],
    speciesDetails: SpeciesDetailDto[],
): TankSpeciesDraft[] {
    const detailMap = new Map(speciesDetails.map((detail) => [detail.id, detail]));

    return items
        .filter((item) => item.itemType === 1)
        .map((item) => {
            const detail = detailMap.get(item.referenceId);

            if (!detail) {
                return null;
            }

            return buildTankDraftFromDetail(detail, item.quantity);
        })
        .filter((item): item is TankSpeciesDraft => item !== null);
}

function areDimensionsEqual(left: TankDimensions, right: TankDimensions): boolean {
    return left.length === right.length && left.width === right.width && left.height === right.height;
}

function getSpeciesReferenceIds(items: TankItemResponseDto[]): string[] {
    return Array.from(
        new Set(
            items
                .filter((item) => item.itemType === 1)
                .map((item) => item.referenceId),
        ),
    ).sort();
}

interface UserTankWorkspaceContentProps {
    selectedTankId: string;
    onSelectTank: (tankId: string) => void;
    onCreateTank: () => Promise<void>;
    onDeleteTank: () => Promise<void>;
    isTankMutating: boolean;
}

function UserTankWorkspaceContent({
    selectedTankId,
    onSelectTank,
    onCreateTank,
    onDeleteTank,
    isTankMutating,
}: UserTankWorkspaceContentProps): ReactElement {
    const { t } = useTranslation();
    const { showSnackbar } = useMuiSnackbar();

    const { data: tanks } = useUserTanks();
    const { data: tank } = useTankDetail(selectedTankId);
    const { data: items } = useTankItems(selectedTankId);
    const { data: speciesDetails = [] } = useTankSpeciesDetails(items);

    const [tankName, setTankName] = useState(tank.name);
    const [dimensions, setDimensions] = useState<TankDimensions>(() => mapTankToDimensions(tank));
    const [inventory, setInventory] = useState<TankSpeciesDraft[]>(() => buildInventory(items, speciesDetails));
    const [sceneFish, setSceneFish] = useState<TankSceneFishInstance[]>([]);
    const [viewMode, setViewMode] = useState<TankSceneViewMode>('3d');
    const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(null);

    const addTankItem = useAddTankItem();
    const updateTankItem = useUpdateTankItem();
    const deleteTankItem = useDeleteTankItem();
    const updateTank = useUpdateTank();

    const debouncedTankName = useDebounce(tankName, 450);
    const debouncedDimensions = useDebounce(dimensions, 450);

    const analysisQuery = useUserTankAnalysis(selectedTankId, inventory.length > 0);
    const expectedSpeciesIds = useMemo(() => getSpeciesReferenceIds(items), [items]);
    const hasAllSpeciesDetails =
        expectedSpeciesIds.length === 0
        || expectedSpeciesIds.every((speciesId) => speciesDetails.some((detail) => detail.id === speciesId));

    const speciesItemMap = useMemo(
        () =>
            new Map(
                items
                    .filter((item) => item.itemType === 1)
                    .map((item) => [item.referenceId, item]),
            ),
        [items],
    );

    useEffect(() => {
        const nextDimensions = mapTankToDimensions(tank);

        setTankName(tank.name);
        setDimensions(nextDimensions);

        if (!hasAllSpeciesDetails) {
            return;
        }

        const nextInventory = buildInventory(items, speciesDetails);
        setInventory(nextInventory);
        setSceneFish((previousFish) => reconcileSceneFish(previousFish, nextInventory, nextDimensions));
        setSelectedSpeciesId((current) =>
            nextInventory.some((item) => item.speciesId === current)
                ? current
                : (nextInventory[0]?.speciesId ?? null),
        );
    }, [hasAllSpeciesDetails, items, speciesDetails, tank]);

    useEffect(() => {
        const currentDimensions = mapTankToDimensions(tank);
        const nextName = debouncedTankName.trim();

        if (!nextName || (nextName === tank.name && areDimensionsEqual(debouncedDimensions, currentDimensions))) {
            return;
        }

        void updateTank.mutateAsync({
            tankId: selectedTankId,
            payload: buildUpdateTankPayload(tank, nextName, debouncedDimensions),
        }).catch(() => {
            showSnackbar(t('TankBuilder.updateTankError'), 'error');
        });
    }, [
        debouncedDimensions,
        debouncedTankName,
        selectedTankId,
        showSnackbar,
        t,
        tank,
        updateTank,
    ]);

    const handleSetDimensions = useCallback(
        (nextDimensions: Partial<TankDimensions>) => {
            setDimensions((previousDimensions) => {
                const mergedDimensions = {
                    ...previousDimensions,
                    ...nextDimensions,
                };

                setSceneFish((previousFish) =>
                    previousFish.map((entry) => {
                        const species = inventory.find((item) => item.speciesId === entry.speciesId);

                        return species
                            ? clampSceneFishToDimensions(entry, species.swimLevel, mergedDimensions)
                            : entry;
                    }),
                );

                return mergedDimensions;
            });
        },
        [inventory],
    );

    const handleAddSpecies = useCallback(
        async (species: SpeciesDto) => {
            const existingItem = speciesItemMap.get(species.id);

            try {
                if (existingItem) {
                    await updateTankItem.mutateAsync({
                        tankId: selectedTankId,
                        itemId: existingItem.id,
                        payload: {
                            quantity: existingItem.quantity + 1,
                            note: existingItem.note ?? undefined,
                        },
                    });
                    return;
                }

                await addTankItem.mutateAsync({
                    tankId: selectedTankId,
                    payload: {
                        itemType: 1,
                        referenceId: species.id,
                        quantity: 1,
                    },
                });
            } catch (_error) {
                showSnackbar(t('TankBuilder.addSpeciesError'), 'error');
            }
        },
        [addTankItem, selectedTankId, showSnackbar, speciesItemMap, t, updateTankItem],
    );

    const handleIncrementSpecies = useCallback(
        async (speciesId: string) => {
            const item = speciesItemMap.get(speciesId);

            if (!item) {
                return;
            }

            try {
                await updateTankItem.mutateAsync({
                    tankId: selectedTankId,
                    itemId: item.id,
                    payload: {
                        quantity: item.quantity + 1,
                        note: item.note ?? undefined,
                    },
                });
            } catch (_error) {
                showSnackbar(t('TankBuilder.updateTankError'), 'error');
            }
        },
        [selectedTankId, showSnackbar, speciesItemMap, t, updateTankItem],
    );

    const handleDecrementSpecies = useCallback(
        async (speciesId: string) => {
            const item = speciesItemMap.get(speciesId);

            if (!item) {
                return;
            }

            try {
                if (item.quantity <= 1) {
                    await deleteTankItem.mutateAsync({
                        tankId: selectedTankId,
                        itemId: item.id,
                    });
                    return;
                }

                await updateTankItem.mutateAsync({
                    tankId: selectedTankId,
                    itemId: item.id,
                    payload: {
                        quantity: item.quantity - 1,
                        note: item.note ?? undefined,
                    },
                });
            } catch (_error) {
                showSnackbar(t('TankBuilder.updateTankError'), 'error');
            }
        },
        [deleteTankItem, selectedTankId, showSnackbar, speciesItemMap, t, updateTankItem],
    );

    const handleRemoveSpecies = useCallback(
        async (speciesId: string) => {
            const item = speciesItemMap.get(speciesId);

            if (!item) {
                return;
            }

            try {
                await deleteTankItem.mutateAsync({
                    tankId: selectedTankId,
                    itemId: item.id,
                });
            } catch (_error) {
                showSnackbar(t('TankBuilder.updateTankError'), 'error');
            }
        },
        [deleteTankItem, selectedTankId, showSnackbar, speciesItemMap, t],
    );

    const handleClearInventory = useCallback(async () => {
        try {
            await Promise.all(
                items
                    .filter((item) => item.itemType === 1)
                    .map((item) =>
                        deleteTankItem.mutateAsync({
                            tankId: selectedTankId,
                            itemId: item.id,
                        }),
                    ),
            );

            showSnackbar(t('TankBuilder.clearedTankMessage'), 'success');
        } catch (_error) {
            showSnackbar(t('TankBuilder.updateTankError'), 'error');
        }
    }, [deleteTankItem, items, selectedTankId, showSnackbar, t]);

    const isSidebarSyncing =
        isTankMutating
        || updateTank.isPending
        || addTankItem.isPending
        || updateTankItem.isPending
        || deleteTankItem.isPending;

    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - 64px)',
                background:
                    'radial-gradient(circle at 10% 10%, rgba(0,188,212,0.09), transparent 24%), radial-gradient(circle at 90% 15%, rgba(29,233,182,0.10), transparent 20%)',
                py: { xs: 3, md: 4 },
            }}
        >
            <Container maxWidth={false} sx={{ px: { xs: 2, md: 3, xl: 4 } }}>
                <Grid container spacing={2.5} alignItems="stretch">
                    <Grid size={{ xs: 12, lg: 3 }}>
                        <BuilderSidebar
                            mode="user"
                            inventory={inventory}
                            selectedSpeciesId={selectedSpeciesId}
                            onAddSpecies={handleAddSpecies}
                            onIncrementSpecies={(speciesId) => void handleIncrementSpecies(speciesId)}
                            onDecrementSpecies={(speciesId) => void handleDecrementSpecies(speciesId)}
                            onRemoveSpecies={(speciesId) => void handleRemoveSpecies(speciesId)}
                            onSelectSpecies={setSelectedSpeciesId}
                            onClearInventory={() => void handleClearInventory()}
                            tankName={tankName}
                            tankOptions={tanks}
                            selectedTankId={selectedTankId}
                            onTankNameChange={setTankName}
                            onSelectTank={onSelectTank}
                            onCreateTank={onCreateTank}
                            onDeleteTank={onDeleteTank}
                            isTankMutating={isSidebarSyncing}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, lg: 6 }}>
                        <BuilderScene
                            dimensions={dimensions}
                            inventory={inventory}
                            sceneFish={sceneFish}
                            selectedSpeciesId={selectedSpeciesId}
                            viewMode={viewMode}
                            onChangeViewMode={setViewMode}
                            onSelectSpecies={setSelectedSpeciesId}
                            onSetDimensions={handleSetDimensions}
                            onAddSpecies={handleAddSpecies}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, lg: 3 }}>
                        <BuilderAnalysisPanel
                            analysis={analysisQuery.data}
                            isFetching={analysisQuery.isFetching}
                            hasInventory={inventory.length > 0}
                        />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export function UserTankBuilderWorkspace(): ReactElement {
    const { t } = useTranslation();
    const { showSnackbar } = useMuiSnackbar();
    const queryClient = useQueryClient();
    const { data: tanks } = useUserTanks();
    const createTank = useCreateTank();
    const deleteTank = useDeleteTank();

    const [selectedTankId, setSelectedTankId] = useState<string | null>(tanks[0]?.id ?? null);

    useEffect(() => {
        if (!selectedTankId || !tanks.some((tank) => tank.id === selectedTankId)) {
            setSelectedTankId(tanks[0]?.id ?? null);
        }
    }, [selectedTankId, tanks]);

    const handleCreateTank = useCallback(async () => {
        try {
            const createdTank = await createTank.mutateAsync({
                name: t('TankBuilder.defaultTankName', { count: tanks.length + 1 }),
                width: DEFAULT_TANK_DIMENSIONS.length,
                height: DEFAULT_TANK_DIMENSIONS.height,
                depth: DEFAULT_TANK_DIMENSIONS.width,
                waterVolume: computeWaterVolume(DEFAULT_TANK_DIMENSIONS),
                waterType: DEFAULT_WATER_TYPE,
            });

            setSelectedTankId(createdTank.id);
            queryClient.setQueryData(['tank-builder', 'tank-items', createdTank.id], []);
            showSnackbar(t('TankBuilder.createTankSuccess'), 'success');
        } catch (_error) {
            showSnackbar(t('TankBuilder.createTankError'), 'error');
        }
    }, [createTank, queryClient, showSnackbar, t, tanks.length]);

    const handleDeleteTank = useCallback(async () => {
        if (!selectedTankId) {
            return;
        }

        try {
            await deleteTank.mutateAsync(selectedTankId);
            showSnackbar(t('TankBuilder.deleteTankSuccess'), 'success');
        } catch (_error) {
            showSnackbar(t('TankBuilder.deleteTankError'), 'error');
        }
    }, [deleteTank, selectedTankId, showSnackbar, t]);

    const handleNoTankAddSpecies = useCallback(async (_species: SpeciesDto) => {
        showSnackbar(t('TankBuilder.createTankFirstError'), 'warning');
    }, [showSnackbar, t]);

    if (!selectedTankId) {
        return (
            <Box
                sx={{
                    minHeight: 'calc(100vh - 64px)',
                    background:
                        'radial-gradient(circle at 10% 10%, rgba(0,188,212,0.09), transparent 24%), radial-gradient(circle at 90% 15%, rgba(29,233,182,0.10), transparent 20%)',
                    py: { xs: 3, md: 4 },
                }}
            >
                <Container maxWidth={false} sx={{ px: { xs: 2, md: 3, xl: 4 } }}>
                    <Grid container spacing={2.5} alignItems="stretch">
                        <Grid size={{ xs: 12, lg: 3 }}>
                            <BuilderSidebar
                                mode="user"
                                inventory={[]}
                                selectedSpeciesId={null}
                                onAddSpecies={handleNoTankAddSpecies}
                                onIncrementSpecies={() => undefined}
                                onDecrementSpecies={() => undefined}
                                onRemoveSpecies={() => undefined}
                                onSelectSpecies={() => undefined}
                                onClearInventory={() => undefined}
                                tankOptions={tanks}
                                selectedTankId={null}
                                onSelectTank={setSelectedTankId}
                                onCreateTank={handleCreateTank}
                                isTankMutating={createTank.isPending || deleteTank.isPending}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, lg: 6 }}>
                            <Paper
                                sx={{
                                    p: { xs: 3, md: 4 },
                                    minHeight: 520,
                                    borderRadius: 4,
                                    border: '1px solid rgba(0, 188, 212, 0.16)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    gap: 2,
                                    background: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'linear-gradient(180deg, rgba(7,20,32,0.96), rgba(12,35,56,0.96))'
                                            : 'linear-gradient(180deg, rgba(255,255,255,0.99), rgba(234,248,251,0.99))',
                                }}
                            >
                                <Typography variant="h5" fontWeight={800}>
                                    {t('TankBuilder.noUserTanks')}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 420 }}>
                                    {t('TankBuilder.noUserTanksSubtitle')}
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => void handleCreateTank()}
                                    startIcon={<AddRoundedIcon />}
                                >
                                    {t('TankBuilder.createFirstTank')}
                                </Button>
                            </Paper>
                        </Grid>

                        <Grid size={{ xs: 12, lg: 3 }}>
                            <BuilderAnalysisPanel analysis={undefined} isFetching={false} hasInventory={false} />
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        );
    }

    return (
        <UserTankWorkspaceContent
            selectedTankId={selectedTankId}
            onSelectTank={setSelectedTankId}
            onCreateTank={handleCreateTank}
            onDeleteTank={handleDeleteTank}
            isTankMutating={createTank.isPending || deleteTank.isPending}
        />
    );
}

export default UserTankBuilderWorkspace;
