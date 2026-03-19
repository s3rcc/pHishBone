import React, { useState, Suspense, useCallback } from 'react';
import { Container, Typography, Box, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../hooks/useDebounce';
import { CatalogSearchBar } from './CatalogSearchBar';
import { SpeciesGrid } from './SpeciesGrid';
import { SpeciesGridSkeleton } from './SpeciesGridSkeleton';

export const CatalogPage: React.FC = () => {
    const { t } = useTranslation();
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 500);

    const handleSearchChange = useCallback((value: string) => {
        setSearchInput(value);
    }, []);

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
            {/* ── Hero Section ─────────────────────────────────────────────── */}
            <Box
                sx={{
                    textAlign: 'center',
                    mb: { xs: 4, md: 6 },
                }}
            >
                <Typography
                    variant="h3"
                    fontWeight={800}
                    sx={{
                        mb: 1.5,
                        background: 'linear-gradient(135deg, #00BCD4 0%, #1DE9B6 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    {t('PublicCatalog.title')}
                </Typography>
                <Typography
                    variant="h6"
                    color="text.secondary"
                    fontWeight={400}
                    sx={{ maxWidth: 520, mx: 'auto', mb: 4, lineHeight: 1.6 }}
                >
                    {t('PublicCatalog.subtitle')}
                </Typography>

                <CatalogSearchBar value={searchInput} onChange={handleSearchChange} />
            </Box>

            {/* ── Species Grid with Suspense ──────────────────────────────── */}
            <Stack spacing={3}>
                <Suspense fallback={<SpeciesGridSkeleton />}>
                    <SpeciesGrid searchTerm={debouncedSearch} />
                </Suspense>
            </Stack>
        </Container>
    );
};

export default CatalogPage;
