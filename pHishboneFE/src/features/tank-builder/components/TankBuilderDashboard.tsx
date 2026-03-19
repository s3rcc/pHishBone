import React, { useState } from 'react';
import { Box, Container, Grid, Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TankDimensions } from './Setup/TankDimensions';
import { TankItemList } from './Ecosystem/TankItemList';
import { SpeciesSearchModal } from './Ecosystem/SpeciesSearchModal';
import { BioLoadGauge } from './Analysis/BioLoadGauge';
import { EnvironmentRange } from './Analysis/EnvironmentRange';
import { CompatibilityAlerts } from './Analysis/CompatibilityAlerts';
import { useTankStore } from '../store/useTankStore';
import { useQuery } from '@tanstack/react-query';
import { tankApi } from '../api/tankApi';
import { useEffect } from 'react';

// Simple useDebounce
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export const TankBuilderDashboard: React.FC = () => {
    const { t } = useTranslation('TankBuilder');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Get reactive state from Zustand needed for the snapshot
    const volumeLiters = useTankStore((state) => state.getVolumeLiters());
    const items = useTankStore((state) => state.items);

    // Prepare JSON payload for API and debounce it
    const snapshotPayload = {
        volumeLiters,
        items: items.map(i => ({ speciesId: i.speciesId, quantity: i.quantity }))
    };
    
    // We only want to analyze when there are actually bugs/insects (debounce to prevent spam)
    const debouncedPayload = useDebounce(snapshotPayload, 500);
    const hasItems = debouncedPayload.items.length > 0;

    // Notice we use useQuery (not Suspense since this updates in background as the user types)
    const { data: analysis, isFetching } = useQuery({
        queryKey: ['tankSnapshot', debouncedPayload],
        queryFn: () => tankApi.analyzeSnapshot(debouncedPayload),
        enabled: hasItems, // Only run if there is at least one species in the tank
    });

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                {t('title', 'Tank Builder')}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
                {t('subtitle', 'Design and simulate your aquatic ecosystem.')}
            </Typography>

            <Grid container spacing={3}>
                {/* Left Panel: Setup & Ecosystem List */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                {t('dimensionsSection', '1. Setup Dimensions')}
                            </Typography>
                            <TankDimensions />
                        </Paper>

                        <Paper sx={{ p: 3, flexGrow: 1, minHeight: 400 }}>
                            <Typography variant="h6" gutterBottom>
                                {t('speciesSection', '2. Build Ecosystem')}
                            </Typography>
                            <TankItemList onOpenSearch={() => setIsSearchOpen(true)} />
                            <SpeciesSearchModal 
                                open={isSearchOpen} 
                                onClose={() => setIsSearchOpen(false)} 
                            />
                        </Paper>
                    </Box>
                </Grid>

                {/* Right Panel: Analysis Dashboard */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper 
                        sx={{ 
                            p: 3, 
                            position: { md: 'sticky' }, 
                            top: { md: 24 },
                            minHeight: 500,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            {t('analysisSection', 'Analysis')}
                        </Typography>
                        
                        {!hasItems ? (
                            <Typography color="text.secondary">
                                {t('addSpeciesToAnalyze', 'Add species to the tank to see analysis.')}
                            </Typography>
                        ) : (
                            <>
                                <BioLoadGauge 
                                    capacityPercentage={analysis?.capacityPercentage || 0} 
                                    isLoading={isFetching && !analysis} 
                                />
                                <EnvironmentRange 
                                    overlap={analysis?.environmentOverlap || null} 
                                    isLoading={isFetching && !analysis} 
                                />
                                <CompatibilityAlerts 
                                    alerts={analysis?.alerts || []} 
                                    isLoading={isFetching && !analysis} 
                                />
                            </>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};
