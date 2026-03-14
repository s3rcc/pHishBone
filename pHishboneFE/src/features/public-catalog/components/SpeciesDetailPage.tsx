import React, { Suspense, useCallback, useMemo } from 'react';
import {
    Container,
    Typography,
    Paper,
    Chip,
    Stack,
    Box,
    Skeleton,
    Button,
    Grid,
    Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HeightIcon from '@mui/icons-material/Height';
import GroupsIcon from '@mui/icons-material/Groups';
import PublicIcon from '@mui/icons-material/Public';
import { useNavigate } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { publicCatalogApi } from '../api/publicCatalogApi';
import { SpeciesHero } from './SpeciesDetail/SpeciesHero';
import { EnvMetrics } from './SpeciesDetail/EnvMetrics';
import { ImageGallery } from './SpeciesDetail/ImageGallery';
import type { SpeciesDetailDto } from '../../catalog-management/types';

interface SpeciesDetailPageProps {
    slug: string;
}

const SWIM_LEVEL_MAP: Record<number, string> = { 0: 'Top', 1: 'Middle', 2: 'Bottom', 3: 'All' };
const DIET_TYPE_MAP: Record<number, string> = { 0: 'Carnivore', 1: 'Herbivore', 2: 'Omnivore' };

export const SpeciesDetailPage: React.FC<SpeciesDetailPageProps> = ({ slug }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { data: species } = useSuspenseQuery<SpeciesDetailDto>({
        queryKey: ['public-catalog', 'species', slug],
        queryFn: () => publicCatalogApi.getSpeciesBySlug(slug),
    });

    const handleBack = useCallback(() => {
        void navigate({ to: '/explore' });
    }, [navigate]);

    const dietLabel = useMemo(() => {
        if (!species.profile) return '';
        return (
            DIET_TYPE_MAP[species.profile.dietType] ??
            t(`Catalog.dietType.${species.profile.dietType}`)
        );
    }, [species.profile, t]);

    const swimLabel = useMemo(() => {
        if (!species.profile) return '';
        return (
            SWIM_LEVEL_MAP[species.profile.swimLevel] ??
            t(`Catalog.swimLevel.${species.profile.swimLevel}`)
        );
    }, [species.profile, t]);

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
            {/* ── Back Button ─────────────────────────────────────── */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                sx={{
                    mb: 3,
                    color: 'text.secondary',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { color: 'primary.main' },
                }}
            >
                {t('PublicCatalog.backToCatalog')}
            </Button>

            {/* ── Hero Section ────────────────────────────────────── */}
            <SpeciesHero species={species} />

            {/* ── Content Grid ────────────────────────────────────── */}
            <Grid container spacing={3}>
                {/* Left Column: Environment + Profile */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={3}>
                        {/* ── Environment Metrics ─────────────────── */}
                        {species.environment && (
                            <EnvMetrics environment={species.environment} />
                        )}

                        {/* ── Profile & Behavior ─────────────────── */}
                        {species.profile && (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5 }}>
                                    {t('PublicCatalog.Detail.profileTitle')}
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <Stack alignItems="center" spacing={0.5}>
                                            <RestaurantIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                                            <Typography variant="caption" color="text.secondary">
                                                {t('PublicCatalog.Detail.diet')}
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {dietLabel}
                                            </Typography>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <Stack alignItems="center" spacing={0.5}>
                                            <HeightIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                                            <Typography variant="caption" color="text.secondary">
                                                {t('PublicCatalog.Detail.swimLevel')}
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {swimLabel}
                                            </Typography>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <Stack alignItems="center" spacing={0.5}>
                                            <GroupsIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                                            <Typography variant="caption" color="text.secondary">
                                                {t('PublicCatalog.Detail.schooling')}
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {species.profile.isSchooling
                                                    ? `${t('PublicCatalog.Detail.yes')} (${species.profile.minGroupSize}+)`
                                                    : t('PublicCatalog.Detail.no')}
                                            </Typography>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <Stack alignItems="center" spacing={0.5}>
                                            <PublicIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                                            <Typography variant="caption" color="text.secondary">
                                                {t('PublicCatalog.Detail.origin')}
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600} textAlign="center">
                                                {species.profile.origin || '—'}
                                            </Typography>
                                        </Stack>
                                    </Grid>
                                </Grid>

                                {/* Preferred food */}
                                {species.profile.preferredFood && (
                                    <>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            {t('PublicCatalog.Detail.preferredFood')}
                                        </Typography>
                                        <Typography variant="body1">
                                            {species.profile.preferredFood}
                                        </Typography>
                                    </>
                                )}

                                {/* Description / Keeper Notes */}
                                {species.profile.description && (
                                    <>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            {t('PublicCatalog.Detail.description')}
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}
                                        >
                                            {species.profile.description}
                                        </Typography>
                                    </>
                                )}
                            </Paper>
                        )}
                    </Stack>
                </Grid>

                {/* Right Column: Tags + Quick Info */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3}>
                        {/* ── Tags ────────────────────────────────── */}
                        {species.tags && species.tags.length > 0 && (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                                    {t('PublicCatalog.Detail.tagsTitle')}
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {species.tags.map((tag) => (
                                        <Chip
                                            key={tag.id}
                                            label={tag.name}
                                            size="small"
                                            sx={{
                                                borderRadius: 2,
                                                fontWeight: 500,
                                                backgroundColor: 'primary.main',
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: 'primary.dark',
                                                },
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Paper>
                        )}
                    </Stack>
                </Grid>
            </Grid>

            {/* ── Image Gallery (full width, below content) ────── */}
            <Box sx={{ mt: 3 }}>
                <Suspense
                    fallback={
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                            <Skeleton variant="text" width={120} height={28} sx={{ mb: 2 }} />
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} variant="rounded" width="25%" height={160} sx={{ borderRadius: 2 }} />
                                ))}
                            </Box>
                        </Paper>
                    }
                >
                    <ImageGallery speciesId={species.id} />
                </Suspense>
            </Box>
        </Container>
    );
};

export default SpeciesDetailPage;
