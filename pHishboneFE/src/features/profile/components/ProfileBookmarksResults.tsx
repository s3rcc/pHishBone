import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMuiSnackbar } from '../../../hooks/useMuiSnackbar';
import { useProfileBookmarksQuery, useRemoveBookmarkMutation } from '../hooks/useProfile';
import type { SpeciesBookmarkFilterDto } from '../types';

interface ProfileBookmarksResultsProps {
    filter: SpeciesBookmarkFilterDto;
    page: number;
    onPageChange: (page: number) => void;
}

const PLACEHOLDER_IMG = 'https://placehold.co/640x420/08171C/34E4EA?text=Bookmark';

export const ProfileBookmarksResults: React.FC<ProfileBookmarksResultsProps> = ({
    filter,
    page,
    onPageChange,
}) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { showSnackbar } = useMuiSnackbar();
    const { data } = useProfileBookmarksQuery(filter);
    const removeBookmarkMutation = useRemoveBookmarkMutation();
    const [pendingSpeciesId, setPendingSpeciesId] = useState<string | null>(null);

    const currentPage = data.page ?? data.currentPage ?? filter.page ?? 1;
    const totalItems = data.total ?? data.totalItems ?? data.items.length;
    const totalPages = data.totalPages ?? 1;
    const formatter = useMemo(
        () =>
            new Intl.DateTimeFormat(i18n.language, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }),
        [i18n.language],
    );

    useEffect(() => {
        if (page > totalPages && totalPages > 0) {
            onPageChange(totalPages);
        }
    }, [onPageChange, page, totalPages]);

    const handleExploreSpecies = useCallback(() => {
        void navigate({ to: '/explore' });
    }, [navigate]);

    const handleOpenSpecies = useCallback(
        (slug: string) => {
            void navigate({ to: '/explore/$slug', params: { slug } });
        },
        [navigate],
    );

    const handleRemoveBookmark = useCallback(
        (speciesId: string) => {
            setPendingSpeciesId(speciesId);
            removeBookmarkMutation.mutate(speciesId, {
                onSuccess: () => {
                    showSnackbar(t('Profile.Bookmarks.removeSuccess'), 'success');
                },
                onError: () => {
                    showSnackbar(t('Profile.Bookmarks.removeError'), 'error');
                },
                onSettled: () => {
                    setPendingSpeciesId(null);
                },
            });
        },
        [removeBookmarkMutation, showSnackbar, t],
    );

    if (data.items.length === 0) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center',
                }}
            >
                <Stack spacing={2} alignItems="center">
                    <Box
                        sx={{
                            width: 68,
                            height: 68,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: 'rgba(0, 188, 212, 0.10)',
                            color: 'primary.main',
                        }}
                    >
                        <FavoriteRoundedIcon fontSize="large" />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={800} gutterBottom>
                            {t('Profile.Bookmarks.emptyTitle')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('Profile.Bookmarks.emptySubtitle')}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        onClick={handleExploreSpecies}
                        startIcon={<AutoAwesomeRoundedIcon />}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    >
                        {t('Profile.Bookmarks.exploreButton')}
                    </Button>
                </Stack>
            </Paper>
        );
    }

    return (
        <Stack spacing={3}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
                <Typography variant="body2" color="text.secondary">
                    {t('Profile.Bookmarks.resultsLabel', { count: totalItems })}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {currentPage} / {totalPages}
                </Typography>
            </Stack>

            <Grid container spacing={2.5}>
                {data.items.map((species) => (
                    <Grid key={species.id} size={{ xs: 12, md: 6 }}>
                        <Card
                            sx={{
                                height: '100%',
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                backgroundColor: 'background.paper',
                                boxShadow: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? '0 10px 30px rgba(0, 0, 0, 0.16)'
                                        : '0 12px 28px rgba(10, 22, 40, 0.08)',
                            }}
                        >
                            <Grid container sx={{ height: '100%' }}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <CardMedia
                                        component="img"
                                        image={species.thumbnailUrl || PLACEHOLDER_IMG}
                                        alt={species.commonName}
                                        sx={{
                                            height: { xs: 200, sm: '100%' },
                                            minHeight: { sm: '100%' },
                                            objectFit: 'cover',
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 8 }}>
                                    <CardContent
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1.5,
                                            p: 2.25,
                                        }}
                                    >
                                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                            {species.typeName && (
                                                <Chip
                                                    label={species.typeName}
                                                    size="small"
                                                    sx={{
                                                        color: 'primary.main',
                                                        backgroundColor: 'rgba(0, 188, 212, 0.10)',
                                                        border: '1px solid rgba(0, 188, 212, 0.18)',
                                                    }}
                                                />
                                            )}
                                            {species.isActive === false && (
                                                <Chip
                                                    label={t('Profile.Bookmarks.inactiveBadge')}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                        </Stack>

                                        <Box>
                                            <Typography variant="h6" fontWeight={800} letterSpacing="-0.03em">
                                                {species.commonName}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ fontStyle: 'italic' }}
                                            >
                                                {species.scientificName || t('Profile.Bookmarks.unknownScientificName')}
                                            </Typography>
                                        </Box>

                                        <Typography variant="caption" color="text.secondary">
                                            {t('Profile.Bookmarks.bookmarkedOn', {
                                                date: formatter.format(new Date(species.bookmarkedTime)),
                                            })}
                                        </Typography>

                                        <Box sx={{ flexGrow: 1 }} />

                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<LaunchRoundedIcon />}
                                                onClick={() => handleOpenSpecies(species.slug)}
                                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                                            >
                                                {t('Profile.Bookmarks.viewSpecies')}
                                            </Button>
                                            <Button
                                                variant="text"
                                                color="error"
                                                startIcon={<DeleteOutlineRoundedIcon />}
                                                onClick={() => handleRemoveBookmark(species.id)}
                                                disabled={pendingSpeciesId === species.id}
                                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                                            >
                                                {t('Profile.Bookmarks.removeAction')}
                                            </Button>
                                        </Stack>
                                    </CardContent>
                                </Grid>
                            </Grid>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
                    <Pagination
                        page={currentPage}
                        count={totalPages}
                        color="primary"
                        onChange={(_, nextPage) => onPageChange(nextPage)}
                        sx={{
                            '& .MuiPaginationItem-root': {
                                fontWeight: 700,
                            },
                        }}
                    />
                </Box>
            )}
        </Stack>
    );
};

export default ProfileBookmarksResults;
