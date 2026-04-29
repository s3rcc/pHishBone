import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useMuiSnackbar } from '../../../hooks/useMuiSnackbar';
import { publicCatalogApi } from '../api/publicCatalogApi';
import { EnvMetrics } from './SpeciesDetail/EnvMetrics';
import { ImageGallery } from './SpeciesDetail/ImageGallery';
import { RelatedSpeciesSection } from './SpeciesDetail/RelatedSpeciesSection';
import { SpeciesHero } from './SpeciesDetail/SpeciesHero';
import type { SpeciesDetailPageDto } from '../types';

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

function getStoredRecentlyViewedIds(): string[] {
    if (typeof window === 'undefined') {
        return [];
    }

    const rawValue = window.sessionStorage.getItem(RECENT_VIEWED_STORAGE_KEY);
    if (!rawValue) {
        return [];
    }

    try {
        const parsed = JSON.parse(rawValue) as string[];
        return parsed.filter((value): value is string => typeof value === 'string').slice(0, 6);
    } catch {
        return [];
    }
}

export const SpeciesDetailPage: React.FC<SpeciesDetailPageProps> = ({ slug }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showSnackbar } = useMuiSnackbar();
    const relatedSectionRef = useRef<HTMLDivElement | null>(null);
    const recentlyViewedIds = useMemo(() => getStoredRecentlyViewedIds(), [slug]);
    const [shouldLoadRelatedSpecies, setShouldLoadRelatedSpecies] = useState(false);
    const detailPageQueryKey = ['public-catalog', 'species-page', slug] as const;

    const { data: pageData } = useSuspenseQuery<SpeciesDetailPageDto>({
        queryKey: detailPageQueryKey,
        queryFn: () => publicCatalogApi.getSpeciesDetailPageBySlug(slug),
    });
    const { species, images, bookmarkStatus = null } = pageData;
    const isAuthenticated = bookmarkStatus !== null;

    const { data: relatedSpecies = [], isLoading: isRelatedSpeciesLoading } = useQuery({
        queryKey: ['public-catalog', 'related', species.id, recentlyViewedIds],
        queryFn: () => publicCatalogApi.getRelatedSpecies(species.id, {
            size: 4,
            recentlyViewedIds,
            seed: 'detail-session',
        }),
        enabled: shouldLoadRelatedSpecies && Boolean(species.id),
        staleTime: 5 * 60_000,
    });

    useEffect(() => {
        setShouldLoadRelatedSpecies(false);
    }, [slug]);

    useEffect(() => {
        if (shouldLoadRelatedSpecies) {
            return;
        }

        const sectionElement = relatedSectionRef.current;
        if (!sectionElement) {
            return;
        }

        if (typeof IntersectionObserver === 'undefined') {
            setShouldLoadRelatedSpecies(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const hasIntersectingEntry = entries.some((entry) => entry.isIntersecting);

                if (!hasIntersectingEntry) {
                    return;
                }

                setShouldLoadRelatedSpecies(true);
                observer.disconnect();
            },
            {
                rootMargin: '200px 0px',
            },
        );

        observer.observe(sectionElement);

        return () => {
            observer.disconnect();
        };
    }, [shouldLoadRelatedSpecies]);

    useEffect(() => {
        window.sessionStorage.setItem(
            RECENT_VIEWED_STORAGE_KEY,
            JSON.stringify([species.id, ...recentlyViewedIds.filter((id) => id !== species.id)].slice(0, 8)),
        );
    }, [recentlyViewedIds, species.id]);

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
            queryClient.setQueryData<SpeciesDetailPageDto>(detailPageQueryKey, (current) => {
                if (!current) {
                    return current;
                }

                return {
                    ...current,
                    bookmarkStatus: {
                        speciesId: species.id,
                        isBookmarked: isNowBookmarked,
                        bookmarkedTime: isNowBookmarked ? new Date().toISOString() : null,
                    },
                };
            });
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
        if (!isAuthenticated) {
            showSnackbar(t('PublicCatalog.Detail.bookmarkLoginRequired'), 'info');
            void navigate({ to: '/login' });
            return;
        }

        bookmarkMutation.mutate();
    }, [bookmarkMutation, isAuthenticated, navigate, showSnackbar, t]);

    return (
        <Box
            sx={{
                minHeight: '100%',
                background: (theme) => theme.palette.mode === 'dark'
                    ? 'radial-gradient(circle at top, rgba(0, 188, 212, 0.10) 0%, rgba(10, 22, 40, 0) 34%), linear-gradient(180deg, #0A1628 0%, #0C1B30 100%)'
                    : 'radial-gradient(circle at top, rgba(0, 188, 212, 0.07) 0%, rgba(240, 250, 252, 0) 34%), linear-gradient(180deg, #F0FAFC 0%, #E8F7FB 100%)',
            }}
        >
            <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 }, py: { xs: 2.5, md: 4 } }}>
                <Button
                    startIcon={<ArrowBackRoundedIcon />}
                    onClick={handleBack}
                    sx={{
                        mb: 2.5,
                        px: 0,
                        color: 'text.secondary',
                        fontWeight: 600,
                        fontSize: '0.85rem',
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

                <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Stack spacing={2.5}>
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
                                    p: { xs: 2, md: 2.25 },
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    backgroundColor: 'background.paper',
                                }}
                            >
                                <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '-0.03em', mb: 1.25 }}>
                                    {t('PublicCatalog.Detail.overviewTitle')}
                                </Typography>
                                <Box sx={{ width: '100%', height: 1, bgcolor: 'divider', mb: 1.75 }} />

                                <Stack spacing={2.25}>
                                    <Typography variant="body2" sx={{ lineHeight: 1.75, color: 'text.primary' }}>
                                        {overviewText}
                                    </Typography>

                                    <Box>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                            <PublicRoundedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                                            <Typography variant="subtitle1" fontWeight={700}>
                                                {t('PublicCatalog.Detail.habitatTitle')}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
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
                                            <Typography variant="subtitle1" fontWeight={700}>
                                                {t('PublicCatalog.Detail.dietSectionTitle')}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
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
                                            <Typography variant="subtitle1" fontWeight={700}>
                                                {t('PublicCatalog.Detail.compatibilityTitle')}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
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
                        <Stack spacing={2}>
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
                                        p: 2,
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        backgroundColor: 'background.paper',
                                    }}
                                >
                                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                                        {t('PublicCatalog.Detail.profileTitle')}
                                    </Typography>

                                    <Grid container spacing={1.75}>
                                        <Grid size={{ xs: 6 }}>
                                            <Stack spacing={0.45}>
                                                <StraightenRoundedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    {t('PublicCatalog.Detail.maxSize')}
                                                </Typography>
                                                <Typography variant="body2" fontWeight={700}>
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
                                                <Typography variant="body2" fontWeight={700}>
                                                    {species.profile.bioLoadFactor.toFixed(2)}
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Stack spacing={0.45}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {t('PublicCatalog.Detail.swimLevel')}
                                                </Typography>
                                                <Typography variant="body2" fontWeight={700}>
                                                    {swimLabel}
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Stack spacing={0.45}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {t('PublicCatalog.Detail.diet')}
                                                </Typography>
                                                <Typography variant="body2" fontWeight={700}>
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
                                    p: 2,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    backgroundColor: 'background.paper',
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.25 }}>
                                    {t('PublicCatalog.Detail.traitsTitle')}
                                </Typography>
                                <Stack direction="row" flexWrap="wrap" useFlexGap gap={0.75}>
                                    {behaviorTraits.map((trait) => (
                                        <Chip
                                            key={trait}
                                            label={trait}
                                            size="small"
                                            sx={{
                                                borderRadius: 1,
                                                color: 'text.secondary',
                                                backgroundColor: 'action.hover',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid>
                </Grid>
                <Box ref={relatedSectionRef} sx={{ minHeight: 1 }} />
                {(shouldLoadRelatedSpecies || relatedSpecies.length > 0) && (
                    <RelatedSpeciesSection species={relatedSpecies} isLoading={isRelatedSpeciesLoading} />
                )}
            </Container>
        </Box>
    );
};

export default SpeciesDetailPage;
