import React from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import WaterRoundedIcon from '@mui/icons-material/WaterRounded';
import { useTranslation } from 'react-i18next';
import type { SpeciesDetailDto } from '../../../catalog-management/types';

interface SpeciesHeroProps {
    species: SpeciesDetailDto;
    canBookmark: boolean;
    isBookmarked: boolean;
    isBookmarkPending: boolean;
    onToggleBookmark: () => void;
    onAddToTank: () => void;
}

export const SpeciesHero: React.FC<SpeciesHeroProps> = ({
    species,
    canBookmark,
    isBookmarked,
    isBookmarkPending,
    onToggleBookmark,
    onAddToTank,
}) => {
    const { t } = useTranslation();

    return (
        <Stack
            direction={{ xs: 'column', lg: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', lg: 'flex-end' }}
            spacing={2}
            sx={{ mb: { xs: 2.5, md: 3 } }}
        >
            <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" flexWrap="wrap" useFlexGap gap={0.75} sx={{ mb: 1.5 }}>
                    {species.tags.slice(0, 2).map((tag) => (
                        <Chip
                            key={tag.id}
                            label={tag.name}
                            size="small"
                            sx={{
                                height: 24,
                                borderRadius: 1,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                color: 'primary.main',
                                backgroundColor: 'rgba(0, 188, 212, 0.10)',
                                border: '1px solid rgba(0, 188, 212, 0.18)',
                            }}
                        />
                    ))}
                    {species.profile && (
                        <Chip
                            label={t(`Catalog.dietType.${species.profile.dietType}`)}
                            size="small"
                            sx={{
                                height: 24,
                                borderRadius: 1,
                                fontSize: '0.68rem',
                                color: 'text.secondary',
                                backgroundColor: 'action.hover',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        />
                    )}
                    {species.isActive === false && (
                        <Chip
                            label={t('Catalog.inactive')}
                            size="small"
                            sx={{
                                height: 24,
                                borderRadius: 1,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                color: 'warning.dark',
                                backgroundColor: 'rgba(255, 152, 0, 0.12)',
                                border: '1px solid rgba(255, 152, 0, 0.22)',
                            }}
                        />
                    )}
                </Stack>

                <Typography
                    variant="h3"
                    sx={{
                        fontSize: { xs: '2.15rem', md: '3rem' },
                        lineHeight: 1,
                        letterSpacing: '-0.04em',
                        fontWeight: 800,
                        mb: 0.5,
                    }}
                >
                    {species.commonName}
                </Typography>

                {species.scientificName && (
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 500,
                            letterSpacing: '-0.02em',
                            fontStyle: 'italic',
                        }}
                    >
                        {species.scientificName}
                    </Typography>
                )}
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', lg: 'auto' } }}>
                <Button
                    variant="contained"
                    startIcon={<WaterRoundedIcon />}
                    onClick={onAddToTank}
                    sx={{
                        minWidth: 136,
                        borderRadius: 1,
                        px: 2,
                        py: 1,
                        fontSize: '0.78rem',
                        fontWeight: 700,
                    }}
                >
                    {t('PublicCatalog.Detail.addToTank')}
                </Button>
                <Button
                    variant="outlined"
                    startIcon={isBookmarked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
                    onClick={onToggleBookmark}
                    disabled={isBookmarkPending || !canBookmark}
                    sx={{
                        minWidth: 120,
                        borderRadius: 1,
                        px: 1.75,
                        py: 1,
                        borderColor: isBookmarked ? 'primary.main' : 'divider',
                        color: isBookmarked ? 'primary.main' : 'text.primary',
                        backgroundColor: isBookmarked ? 'rgba(0, 188, 212, 0.08)' : 'background.paper',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: 'rgba(0, 188, 212, 0.12)',
                        },
                    }}
                >
                    {!canBookmark
                        ? t('PublicCatalog.Detail.saveUnavailable')
                        : isBookmarked
                            ? t('PublicCatalog.Detail.saved')
                            : t('PublicCatalog.Detail.saveAction')}
                </Button>
            </Stack>
        </Stack>
    );
};

export default SpeciesHero;
