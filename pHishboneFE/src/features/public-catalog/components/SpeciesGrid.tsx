import React, { useEffect, useMemo } from 'react';
import { Box, Grid, Stack, Typography } from '@mui/material';
import WaterRoundedIcon from '@mui/icons-material/WaterRounded';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { publicCatalogApi } from '../api/publicCatalogApi';
import { SpeciesCard } from './SpeciesCard';
import type { PublicCatalogFilter } from '../types';

interface SpeciesGridMeta {
    total: number;
    totalPages: number;
    page: number;
    size: number;
}

interface SpeciesGridProps {
    filter: PublicCatalogFilter;
    onMetaChange?: (meta: SpeciesGridMeta) => void;
}

export const SpeciesGrid: React.FC<SpeciesGridProps> = ({ filter, onMetaChange }) => {
    const { t } = useTranslation();

    const { data } = useSuspenseQuery({
        queryKey: ['public-catalog', 'search', filter],
        queryFn: () => publicCatalogApi.searchSpecies(filter),
        staleTime: 30_000,
    });

    const species = data.items;

    const meta = useMemo<SpeciesGridMeta>(() => ({
        total: data.total ?? data.totalItems ?? data.items.length,
        totalPages: data.totalPages || 1,
        page: data.page ?? data.currentPage ?? filter.page ?? 1,
        size: data.size ?? data.pageSize ?? filter.size ?? data.items.length,
    }), [data, filter.page, filter.size]);

    useEffect(() => {
        onMetaChange?.(meta);
    }, [meta, onMetaChange]);

    if (!species.length) {
        return (
            <Box
                sx={{
                    display: 'grid',
                    placeItems: 'center',
                    minHeight: 280,
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    textAlign: 'center',
                    px: 3,
                }}
            >
                <Stack spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 1.5,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: 'rgba(0, 188, 212, 0.10)',
                            color: 'primary.main',
                        }}
                    >
                        <WaterRoundedIcon />
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                        {t('PublicCatalog.noResultsTitle')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
                        {t('PublicCatalog.noResults')}
                    </Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <Grid container spacing={2}>
            {species.map((candidate) => (
                <Grid key={candidate.id} size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
                    <SpeciesCard species={candidate} />
                </Grid>
            ))}
        </Grid>
    );
};

export default SpeciesGrid;
