import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { publicCatalogApi } from '../api/publicCatalogApi';
import { SpeciesCard } from './SpeciesCard';
import type { PublicCatalogFilter } from '../types';

interface SpeciesGridProps {
    filter: PublicCatalogFilter;
    onTotalChange?: (total: number) => void;
}

export const SpeciesGrid: React.FC<SpeciesGridProps> = ({ filter, onTotalChange }) => {
    const { t } = useTranslation();

    const { data } = useSuspenseQuery({
        queryKey: ['public-catalog', 'search', filter],
        queryFn: async () => {
            const result = await publicCatalogApi.searchSpecies(filter);
            onTotalChange?.(result.totalItems ?? result.items.length);
            return result;
        },
        staleTime: 30_000,
    });

    const species = data.items;

    if (!species.length) {
        return (
            <Box
                sx={{
                    textAlign: 'center',
                    py: 10,
                }}
            >
                <Typography variant="h5" sx={{ mb: 1 }}>
                    🐠
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {t('PublicCatalog.noResults')}
                </Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={3}>
            {species.map((s) => (
                <Grid key={s.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <SpeciesCard species={s} />
                </Grid>
            ))}
        </Grid>
    );
};

export default SpeciesGrid;

