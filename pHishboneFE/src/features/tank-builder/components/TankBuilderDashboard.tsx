import { useCallback, useEffect } from 'react';
import type { ReactElement } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Box, Container, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMuiSnackbar } from '../../../hooks/useMuiSnackbar';
import type { SpeciesDto } from '../../catalog-management/types';
import { tankApi } from '../api/tankApi';
import BuilderAnalysisPanel from './BuilderAnalysisPanel';
import BuilderScene from './BuilderScene';
import BuilderSidebar from './BuilderSidebar';
import { useGuestTankAnalysis } from '../hooks/useGuestTankAnalysis';
import { useTankStore } from '../store/useTankStore';
import { buildTankDraft } from '../types';

export function TankBuilderDashboard(): ReactElement {
    const { t } = useTranslation();
    const { showSnackbar } = useMuiSnackbar();
    const queryClient = useQueryClient();

    const dimensions = useTankStore((state) => state.dimensions);
    const inventory = useTankStore((state) => state.inventory);
    const sceneFish = useTankStore((state) => state.sceneFish);
    const viewMode = useTankStore((state) => state.viewMode);
    const showSceneBubbles = useTankStore((state) => state.showSceneBubbles);
    const selectedSpeciesId = useTankStore((state) => state.selectedSpeciesId);
    const setDimensions = useTankStore((state) => state.setDimensions);
    const upsertSpecies = useTankStore((state) => state.upsertSpecies);
    const incrementSpecies = useTankStore((state) => state.incrementSpecies);
    const decrementSpecies = useTankStore((state) => state.decrementSpecies);
    const removeSpecies = useTankStore((state) => state.removeSpecies);
    const selectSpecies = useTankStore((state) => state.selectSpecies);
    const setViewMode = useTankStore((state) => state.setViewMode);
    const setShowSceneBubbles = useTankStore((state) => state.setShowSceneBubbles);
    const syncSceneFish = useTankStore((state) => state.syncSceneFish);
    const clearDraft = useTankStore((state) => state.clearDraft);

    const analysisQuery = useGuestTankAnalysis({
        dimensions,
        inventory,
    });

    useEffect(() => {
        // Persisted drafts rehydrate after mount, so keep the scene instances reconciled
        // whenever the restored inventory or tank dimensions change.
        syncSceneFish();
    }, [dimensions, inventory, syncSceneFish]);

    const handleAddSpecies = useCallback(
        async (species: SpeciesDto) => {
            try {
                const detail = await queryClient.fetchQuery({
                    queryKey: ['tank-builder', 'species-detail', species.slug],
                    queryFn: () => tankApi.getSpeciesDetailBySlug(species.slug),
                    staleTime: 1000 * 60 * 10,
                });

                upsertSpecies(buildTankDraft(species, detail));
            } catch (_error) {
                showSnackbar(t('TankBuilder.addSpeciesError'), 'error');
            }
        },
        [queryClient, showSnackbar, t, upsertSpecies],
    );

    const handleClearDraft = useCallback(() => {
        clearDraft();
        showSnackbar(t('TankBuilder.clearedDraftMessage'), 'success');
    }, [clearDraft, showSnackbar, t]);

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
                            inventory={inventory}
                            selectedSpeciesId={selectedSpeciesId}
                            onAddSpecies={handleAddSpecies}
                            onIncrementSpecies={incrementSpecies}
                            onDecrementSpecies={decrementSpecies}
                            onRemoveSpecies={removeSpecies}
                            onSelectSpecies={selectSpecies}
                            onClearDraft={handleClearDraft}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, lg: 6 }}>
                        <BuilderScene
                            dimensions={dimensions}
                            inventory={inventory}
                            sceneFish={sceneFish}
                            selectedSpeciesId={selectedSpeciesId}
                            viewMode={viewMode}
                            showSceneBubbles={showSceneBubbles}
                            onChangeViewMode={setViewMode}
                            onToggleSceneBubbles={setShowSceneBubbles}
                            onSelectSpecies={selectSpecies}
                            onSetDimensions={setDimensions}
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

export default TankBuilderDashboard;
