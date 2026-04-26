import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Chip,
    Container,
    Grid,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import WaterRoundedIcon from '@mui/icons-material/WaterRounded';
import StraightenRoundedIcon from '@mui/icons-material/StraightenRounded';
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded';
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { AUTH_ME_KEY, authApi } from '../../auth';
import { useMuiSnackbar } from '../../../hooks/useMuiSnackbar';
import { publicCatalogApi } from '../api/publicCatalogApi';
import { EnvMetrics } from './SpeciesDetail/EnvMetrics';
import { ImageGallery } from './SpeciesDetail/ImageGallery';
import { RelatedSpeciesSection } from './SpeciesDetail/RelatedSpeciesSection';
import { SpeciesHero } from './SpeciesDetail/SpeciesHero';
import type { SpeciesDetailDto } from '../../catalog-management/types';
import type { RelatedSpeciesDto } from '../types';

interface SpeciesDetailPageProps {
    slug: string;
}

const RECENT_VIEWED_STORAGE_KEY = 'public-catalog-recently-viewed';

const SWIM_LEVEL_MAP: Record<number, string> = {
    0: 'Top',
    1: 'Middle',
    2: 'Bottom',
    3: 'All',
};

const DIET_TYPE_MAP: Record<number, string> = {
    0: 'Carnivore',
    1: 'Herbivore',
    2: 'Omnivore',
};

const WATER_TYPE_MAP: Record<number, string> = {
    0: 'Fresh',
    1: 'Brackish',
    2: 'Salt',
};

export const SpeciesDetailPage: React.FC<SpeciesDetailPageProps> = ({ slug }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showSnackbar } = useMuiSnackbar();
    const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);

    const { data: species } = useSuspenseQuery<SpeciesDetailDto>({
        queryKey: ['public-catalog', 'species', slug],
        queryFn: () => publicCatalogApi.getSpeciesBySlug(slug),
    });

    const { data: images = [] } = useSuspenseQuery({
        queryKey: ['public-catalog', 'images', species.id],
        queryFn: () => publicCatalogApi.getSpeciesImages(species.id),
    });

    const { data: relatedSpecies = [] } = useSuspenseQuery<RelatedSpeciesDto[]>({
        queryKey: ['public-catalog', 'related', species.id, recentlyViewedIds],
        queryFn: () => publicCatalogApi.getRelatedSpecies(species.id, {
            size: 4,
            recentlyViewedIds,
            seed: 'detail-session',
        }),
    });

    const { data: currentUser } = useQuery({
        queryKey: AUTH_ME_KEY,
        queryFn: authApi.getMe,
        retry: false,
        staleTime: 60_000,
    });

    const { data: bookmarkStatus } = useQuery({
        queryKey: ['public-catalog', 'bookmark-status', species.id],
        queryFn: () => publicCatalogApi.getBookmarkStatus(species.id),
        enabled: Boolean(currentUser),
        retry: false,
        staleTime: 30_000,
    });

    useEffect(() => {
        const rawValue = window.sessionStorage.getItem(RECENT_VIEWED_STORAGE_KEY);
        const parsed = rawValue ? JSON.parse(rawValue) as string[] : [];
        const filtered = parsed.filter((id) => id !== species.id);

        setRecentlyViewedIds(filtered.slice(0, 6));
        window.sessionStorage.setItem(
            RECENT_VIEWED_STORAGE_KEY,
            JSON.stringify([species.id, ...filtered].slice(0, 8)),
        );
    }, [species.id]);

    const bookmarkMutation = useMutation({
        mutationFn: useCallback(async () => {
            if (bookmarkStatus?.isBookmarked) {
                await publicCatalogApi.removeBookmark(species.id);
                return false;
            }

            await publicCatalogApi.addBookmark(species.id);
            return true;
        }, [bookmarkStatus?.isBookmarked, species.id]),
        onSuccess: (isNowBookmarked) => {
            queryClient.invalidateQueries({ queryKey: ['public-catalog', 'bookmark-status', species.id] });
            showSnackbar(
                isNowBookmarked
                    ? t('PublicCatalog.Detail.saveSuccess')
                    : t('PublicCatalog.Detail.removeSaveSuccess'),
                'success',
            );
        },
        onError: () => {
            showSnackbar(t('PublicCatalog.Detail.saveError'), 'error');
        },
    });

    const dietLabel = useMemo(() => {
        if (!species.profile) {
            return t('PublicCatalog.Detail.notAvailable');
        }

        return DIET_TYPE_MAP[species.profile.dietType]
            ?? t(`Catalog.dietType.${species.profile.dietType}`);
    }, [species.profile, t]);

    const swimLabel = useMemo(() => {
        if (!species.profile) {
            return t('PublicCatalog.Detail.notAvailable');
        }

        return SWIM_LEVEL_MAP[species.profile.swimLevel]
            ?? t(`Catalog.swimLevel.${species.profile.swimLevel}`);
    }, [species.profile, t]);

    const waterTypeLabel = useMemo(() => {
        if (!species.environment) {
            return t('PublicCatalog.Detail.notAvailable');
        }

        return WATER_TYPE_MAP[species.environment.waterType]
            ?? t(`Catalog.waterType.${species.environment.waterType}`);
    }, [species.environment, t]);

    const overviewText = species.profile?.description || t('PublicCatalog.Detail.overviewFallback');

    const behaviorTraits = useMemo(() => {
        const traits = new Set<string>();

        species.tags.forEach((tag) => traits.add(tag.name));

        if (species.profile?.isSchooling) {
            traits.add(t('PublicCatalog.Detail.schoolingTrait'));
        }

        if (species.profile?.swimLevel !== undefined) {
            traits.add(swimLabel);
        }

        return Array.from(traits).slice(0, 8);
    }, [species.profile?.isSchooling, species.profile?.swimLevel, species.tags, swimLabel, t]);

    const handleBack = useCallback(() => {
        void navigate({ to: '/explore' });
    }, [navigate]);

    const handleAddToTank = useCallback(() => {
        void navigate({ to: '/tank-builder' });
    }, [navigate]);

    const handleToggleBookmark = useCallback(() => {
        if (!currentUser) {
            showSnackbar(t('PublicCatalog.Detail.bookmarkLoginRequired'), 'info');
            void navigate({ to: '/login' });
            return;
        }

        bookmarkMutation.mutate();
    }, [bookmarkMutation, currentUser, navigate, showSnackbar, t]);

    return (
        <Box
            sx={{
                minHeight: '100%',
                background: 'radial-gradient(circle at top center, rgba(52, 228, 234, 0.07) 0%, rgba(6, 18, 22, 0) 36%), linear-gradient(180deg, #07161A 0%, #051014 100%)',
            }}
        >
            <Container maxWidth={false} sx={{ px: { xs: 2, md: 4, xl: 6 }, py: { xs: 3, md: 5 } }}>
                <Button
                    startIcon={<ArrowBackRoundedIcon />}
                    onClick={handleBack}
                    sx={{
                        mb: 3,
                        px: 0,
                        color: 'text.secondary',
                        fontWeight: 600,
                        '&:hover': {
                            color: 'text.primary',
                            backgroundColor: 'transparent',
                        },
                    }}
                >
                    {t('PublicCatalog.backToCatalog')}
                </Button>

                <SpeciesHero
                    species={species}
                    isBookmarked={bookmarkStatus?.isBookmarked === true}
                    isBookmarkPending={bookmarkMutation.isPending}
                    onToggleBookmark={handleToggleBookmark}
                    onAddToTank={handleAddToTank}
                />

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Stack spacing={3}>
                            <ImageGallery
                                commonName={species.commonName}
                                primaryImage={species.thumbnailUrl}
                                images={images}
                                title={t('PublicCatalog.Detail.galleryTitle')}
                                emptyStateLabel={t('PublicCatalog.Detail.galleryEmpty')}
                                expandLabel={t('PublicCatalog.Detail.expandView')}
                                viewAllLabel={t('PublicCatalog.Detail.viewAll')}
                            />

                            <Paper
                                elevation={0}
                                sx={{
                                    p: { xs: 2.25, md: 2.75 },
                                    borderRadius: 2,
                                    border: '1px solid rgba(52, 228, 234, 0.1)',
                                    background: 'linear-gradient(180deg, rgba(14, 31, 36, 0.96) 0%, rgba(9, 24, 28, 0.99) 100%)',
                                }}
                            >
                                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '-0.04em', mb: 1.75 }}>
                                    {t('PublicCatalog.Detail.overviewTitle')}
                                </Typography>
                                <Box sx={{ width: '100%', height: 1, bgcolor: 'rgba(52, 228, 234, 0.22)', mb: 2.25 }} />

                                <Stack spacing={3}>
                                    <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.primary' }}>
                                        {overviewText}
                                    </Typography>

                                    <Box>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                            <PublicRoundedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                                            <Typography variant="h6" fontWeight={750}>
                                                {t('PublicCatalog.Detail.habitatTitle')}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9 }}>
                                            {species.profile?.origin
                                                ? t('PublicCatalog.Detail.habitatSummary', {
                                                    origin: species.profile.origin,
                                                    waterType: waterTypeLabel,
                                                    volume: species.environment?.minTankVolume ?? 0,
                                                })
                                                : t('PublicCatalog.Detail.habitatFallback', {
                                                    waterType: waterTypeLabel,
                                                    volume: species.environment?.minTankVolume ?? 0,
                                                })}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                            <RestaurantRoundedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                                            <Typography variant="h6" fontWeight={750}>
                                                {t('PublicCatalog.Detail.dietSectionTitle')}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9 }}>
                                            {species.profile?.preferredFood
                                                ? t('PublicCatalog.Detail.dietSummary', {
                                                    diet: dietLabel,
                                                    food: species.profile.preferredFood,
                                                })
                                                : t('PublicCatalog.Detail.dietFallback', {
                                                    diet: dietLabel,
                                                })}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                            <Diversity3RoundedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                                            <Typography variant="h6" fontWeight={750}>
                                                {t('PublicCatalog.Detail.compatibilityTitle')}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9 }}>
                                            {behaviorTraits.length
                                                ? t('PublicCatalog.Detail.compatibilitySummary', {
                                                    traits: behaviorTraits.slice(0, 3).join(', '),
                                                })
                                                : t('PublicCatalog.Detail.compatibilityFallback')}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Stack spacing={2.5}>
                            {species.environment && (
                                <EnvMetrics
                                    environment={species.environment}
                                    title={t('PublicCatalog.Detail.envTitle')}
                                    phLabel={t('PublicCatalog.Detail.phRange')}
                                    tempLabel={t('PublicCatalog.Detail.tempRange')}
                                    tankVolumeLabel={t('PublicCatalog.Detail.minTankVolume')}
                                />
                            )}

                            {species.profile && (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2.25,
                                        borderRadius: 2,
                                        border: '1px solid rgba(52, 228, 234, 0.1)',
                                        background: 'linear-gradient(180deg, rgba(14, 31, 36, 0.96) 0%, rgba(9, 24, 28, 0.99) 100%)',
                                    }}
                                >
                                    <Typography variant="subtitle1" fontWeight={750} sx={{ mb: 2 }}>
                                        {t('PublicCatalog.Detail.profileTitle')}
                                    </Typography>

                                    <Grid container spacing={2.2}>
                                        <Grid size={{ xs: 6 }}>
                                            <Stack spacing={0.45}>
                                                <StraightenRoundedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    {t('PublicCatalog.Detail.maxSize')}
                                                </Typography>
                                                <Typography variant="body1" fontWeight={700}>
                                                    {species.profile.adultSize} cm
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Stack spacing={0.45}>
                                                <WaterRoundedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    {t('PublicCatalog.Detail.bioLoad')}
                                                </Typography>
                                                <Typography variant="body1" fontWeight={700}>
                                                    {species.profile.bioLoadFactor.toFixed(2)}
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Stack spacing={0.45}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {t('PublicCatalog.Detail.swimLevel')}
                                                </Typography>
                                                <Typography variant="body1" fontWeight={700}>
                                                    {swimLabel}
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Stack spacing={0.45}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {t('PublicCatalog.Detail.diet')}
                                                </Typography>
                                                <Typography variant="body1" fontWeight={700}>
                                                    {dietLabel}
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            )}

                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.25,
                                    borderRadius: 2,
                                    border: '1px solid rgba(52, 228, 234, 0.1)',
                                    background: 'linear-gradient(180deg, rgba(14, 31, 36, 0.96) 0%, rgba(9, 24, 28, 0.99) 100%)',
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight={750} sx={{ mb: 1.5 }}>
                                    {t('PublicCatalog.Detail.traitsTitle')}
                                </Typography>
                                <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
                                    {behaviorTraits.map((trait) => (
                                        <Chip
                                            key={trait}
                                            label={trait}
                                            size="small"
                                            sx={{
                                                borderRadius: 1.5,
                                                color: 'text.secondary',
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid>
                </Grid>

                <RelatedSpeciesSection species={relatedSpecies} />
            </Container>
        </Box>
    );
};

export default SpeciesDetailPage;
