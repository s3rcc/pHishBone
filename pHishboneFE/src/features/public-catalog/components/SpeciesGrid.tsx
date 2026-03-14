import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { publicCatalogApi } from '../api/publicCatalogApi';
import { SpeciesCard } from './SpeciesCard';

interface SpeciesGridProps {
    searchTerm: string;
}

export const SpeciesGrid: React.FC<SpeciesGridProps> = ({ searchTerm }) => {
    const { t } = useTranslation();

    const { data: species } = useSuspenseQuery({
        queryKey: ['public-catalog', 'search', searchTerm],
        queryFn: () => publicCatalogApi.searchSpecies(searchTerm),
    });

    if (!species.length) {
        return (
            <Box
                sx={{
                    textAlign: 'center',
                    py: 8,
                }}
            >
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
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
