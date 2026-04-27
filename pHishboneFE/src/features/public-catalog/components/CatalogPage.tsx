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
                background: (theme) => theme.palette.mode === 'dark'
                    ? 'radial-gradient(circle at top, rgba(0, 188, 212, 0.10) 0%, rgba(10, 22, 40, 0) 32%), linear-gradient(180deg, #0A1628 0%, #0C1B30 100%)'
                    : 'radial-gradient(circle at top, rgba(0, 188, 212, 0.08) 0%, rgba(240, 250, 252, 0) 32%), linear-gradient(180deg, #F0FAFC 0%, #E8F7FB 100%)',
            }}
        >
            <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 }, py: { xs: 2.5, md: 4 } }}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: '288px minmax(0, 1fr)' },
                        gap: { xs: 2.5, lg: 3 },
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
                        <Box sx={{ mb: 2.5 }}>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontSize: { xs: '2rem', md: '2.7rem' },
                                    lineHeight: 1,
                                    letterSpacing: '-0.04em',
                                    fontWeight: 800,
                                    mb: 0.75,
                                }}
                            >
                                {t('PublicCatalog.resultsTitle')}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
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
                            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                                <Pagination
                                    page={filter.page ?? 1}
                                    count={meta.totalPages}
                                    onChange={handlePageChange}
                                    shape="rounded"
                                    siblingCount={1}
                                    boundaryCount={1}
                                    sx={{
                                        '& .MuiPaginationItem-root': {
                                            minWidth: 36,
                                            height: 36,
                                            borderRadius: 1,
                                            color: 'text.secondary',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            backgroundColor: 'background.paper',
                                        },
                                        '& .Mui-selected': {
                                            color: 'primary.main',
                                            borderColor: 'primary.main',
                                            backgroundColor: 'rgba(0, 188, 212, 0.10)',
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
