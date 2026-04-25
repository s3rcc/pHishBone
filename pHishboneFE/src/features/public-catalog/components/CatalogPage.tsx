import React, { useState, Suspense, useCallback, useMemo } from 'react';
import { Container, Typography, Box, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../hooks/useDebounce';
import { SpeciesGrid } from './SpeciesGrid';
import { SpeciesGridSkeleton } from './SpeciesGridSkeleton';
import { CatalogFilterPanel } from './CatalogFilterPanel';
import type { PublicCatalogFilter } from '../types';

// ─── Default filter — only active species shown in public catalog ─────────────
const DEFAULT_FILTER: PublicCatalogFilter = {
    page: 1,
    size: 12,
    sortBy: 'CommonName',
    isAscending: true,
};

export const CatalogPage: React.FC = () => {
    const { t } = useTranslation();
    const [filter, setFilter] = useState<PublicCatalogFilter>(DEFAULT_FILTER);
    const [totalCount, setTotalCount] = useState<number | null>(null);

    // Debounce search term and origin (free-text fields) — other filters apply instantly
    const debouncedSearchTerm = useDebounce(filter.searchTerm, 400);
    const debouncedOrigin = useDebounce(filter.origin, 400);

    // Build the query filter — swap instant fields with debounced text fields
    const queryFilter = useMemo<PublicCatalogFilter>(
        () => ({
            ...filter,
            searchTerm: debouncedSearchTerm || undefined,
            origin: debouncedOrigin || undefined,
        }),
        [filter, debouncedSearchTerm, debouncedOrigin],
    );

    const handleFilterChange = useCallback((updated: Partial<PublicCatalogFilter>) => {
        setFilter((prev) => ({ ...prev, ...updated, page: 1 }));
    }, []);

    const handleClear = useCallback(() => {
        setFilter(DEFAULT_FILTER);
    }, []);

    const handleTotalChange = useCallback((total: number) => {
        setTotalCount(total);
    }, []);

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
            {/* ── Page Title ──────────────────────────────────────────────── */}
            <Box sx={{ mb: { xs: 4, md: 5 } }}>
                <Typography
                    variant="h3"
                    fontWeight={800}
                    sx={{
                        mb: 1,
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
                    sx={{ maxWidth: 560, lineHeight: 1.6 }}
                >
                    {t('PublicCatalog.subtitle')}
                </Typography>
            </Box>

            {/* ── Two-column layout ───────────────────────────────────────── */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="flex-start">
                {/* Left: Filter Panel */}
                <Suspense fallback={null}>
                    <CatalogFilterPanel
                        filter={filter}
                        onChange={handleFilterChange}
                        onClear={handleClear}
                    />
                </Suspense>

                {/* Right: Results */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Result count header */}
                    {totalCount !== null && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2.5, fontStyle: 'italic' }}
                        >
                            {t('PublicCatalog.showingCount', { count: totalCount })}
                        </Typography>
                    )}

                    <Suspense fallback={<SpeciesGridSkeleton />}>
                        <SpeciesGrid
                            filter={queryFilter}
                            onTotalChange={handleTotalChange}
                        />
                    </Suspense>
                </Box>
            </Stack>
        </Container>
    );
};

export default CatalogPage;

