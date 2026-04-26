import React, { Suspense, useCallback, useMemo, useState } from 'react';
import {
    Box,
    Container,
    Pagination,
    Stack,
    Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../hooks/useDebounce';
import { CatalogFilterPanel } from './CatalogFilterPanel';
import { SpeciesGrid } from './SpeciesGrid';
import { SpeciesGridSkeleton } from './SpeciesGridSkeleton';
import type { PublicCatalogFilter } from '../types';

const DEFAULT_FILTER: PublicCatalogFilter = {
    page: 1,
    size: 12,
    sortBy: 'CommonName',
    isAscending: true,
};

interface CatalogMetaState {
    total: number;
    totalPages: number;
    page: number;
    size: number;
}

export const CatalogPage: React.FC = () => {
    const { t } = useTranslation();
    const [filter, setFilter] = useState<PublicCatalogFilter>(DEFAULT_FILTER);
    const [meta, setMeta] = useState<CatalogMetaState>({
        total: 0,
        totalPages: 1,
        page: 1,
        size: 12,
    });

    const debouncedSearchTerm = useDebounce(filter.searchTerm, 400);
    const debouncedOrigin = useDebounce(filter.origin, 400);

    const queryFilter = useMemo<PublicCatalogFilter>(() => ({
        ...filter,
        searchTerm: debouncedSearchTerm || undefined,
        origin: debouncedOrigin || undefined,
    }), [debouncedOrigin, debouncedSearchTerm, filter]);

    const rangeLabel = useMemo(() => {
        if (!meta.total) {
            return t('PublicCatalog.resultsEmpty');
        }

        const start = ((meta.page - 1) * meta.size) + 1;
        const end = Math.min(meta.page * meta.size, meta.total);

        return t('PublicCatalog.resultsRange', {
            start,
            end,
            total: meta.total,
        });
    }, [meta.page, meta.size, meta.total, t]);

    const handleFilterChange = useCallback((updated: Partial<PublicCatalogFilter>) => {
        setFilter((previous) => ({ ...previous, ...updated, page: 1 }));
    }, []);

    const handleClear = useCallback(() => {
        setFilter(DEFAULT_FILTER);
    }, []);

    const handleMetaChange = useCallback((next: CatalogMetaState) => {
        setMeta(next);
    }, []);

    const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, page: number) => {
        setFilter((previous) => ({ ...previous, page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <Box
            sx={{
                minHeight: '100%',
                background: 'radial-gradient(circle at top center, rgba(52, 228, 234, 0.07) 0%, rgba(6, 18, 22, 0) 36%), linear-gradient(180deg, #07161A 0%, #051014 100%)',
            }}
        >
            <Container maxWidth={false} sx={{ px: { xs: 2, md: 4, xl: 6 }, py: { xs: 3, md: 5 } }}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: '320px minmax(0, 1fr)' },
                        gap: { xs: 3, lg: 4 },
                        alignItems: 'start',
                    }}
                >
                    <Suspense fallback={null}>
                        <CatalogFilterPanel
                            filter={filter}
                            onChange={handleFilterChange}
                            onClear={handleClear}
                        />
                    </Suspense>

                    <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ mb: 3.5 }}>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontSize: { xs: '2.5rem', md: '4rem' },
                                    lineHeight: 0.95,
                                    letterSpacing: '-0.06em',
                                    fontWeight: 800,
                                    mb: 1,
                                }}
                            >
                                {t('PublicCatalog.resultsTitle')}
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                                {rangeLabel}
                            </Typography>
                        </Box>

                        <Suspense fallback={<SpeciesGridSkeleton />}>
                            <SpeciesGrid
                                filter={queryFilter}
                                onMetaChange={handleMetaChange}
                            />
                        </Suspense>

                        {meta.totalPages > 1 && (
                            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 4 }}>
                                <Pagination
                                    page={filter.page ?? 1}
                                    count={meta.totalPages}
                                    onChange={handlePageChange}
                                    shape="rounded"
                                    siblingCount={1}
                                    boundaryCount={1}
                                    sx={{
                                        '& .MuiPaginationItem-root': {
                                            minWidth: 40,
                                            height: 40,
                                            borderRadius: 1.5,
                                            color: 'text.secondary',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            backgroundColor: 'rgba(255,255,255,0.03)',
                                        },
                                        '& .Mui-selected': {
                                            color: 'primary.main',
                                            borderColor: 'rgba(52, 228, 234, 0.4)',
                                            backgroundColor: 'rgba(52, 228, 234, 0.1)',
                                        },
                                    }}
                                />
                            </Stack>
                        )}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default CatalogPage;
