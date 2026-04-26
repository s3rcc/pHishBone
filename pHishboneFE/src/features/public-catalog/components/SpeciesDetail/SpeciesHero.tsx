import React from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import WaterRoundedIcon from '@mui/icons-material/WaterRounded';
import { useTranslation } from 'react-i18next';
import type { SpeciesDetailDto } from '../../../catalog-management/types';

interface SpeciesHeroProps {
    species: SpeciesDetailDto;
    isBookmarked: boolean;
    isBookmarkPending: boolean;
    onToggleBookmark: () => void;
    onAddToTank: () => void;
}

export const SpeciesHero: React.FC<SpeciesHeroProps> = ({
    species,
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
            spacing={3}
            sx={{ mb: { xs: 3, md: 4 } }}
        >
            <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ mb: 2 }}>
                    {species.tags.slice(0, 2).map((tag) => (
                        <Chip
                            key={tag.id}
                            label={tag.name}
                            size="small"
                            sx={{
                                height: 26,
                                borderRadius: 1.5,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                color: 'primary.main',
                                backgroundColor: 'rgba(52, 228, 234, 0.08)',
                                border: '1px solid rgba(52, 228, 234, 0.18)',
                            }}
                        />
                    ))}
                    {species.profile && (
                        <Chip
                            label={t(`Catalog.dietType.${species.profile.dietType}`)}
                            size="small"
                            sx={{
                                height: 26,
                                borderRadius: 1.5,
                                fontSize: '0.7rem',
                                color: 'text.secondary',
                                backgroundColor: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}
                        />
                    )}
                </Stack>

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
                    {species.commonName}
                </Typography>

                {species.scientificName && (
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'primary.main',
                            fontWeight: 500,
                            letterSpacing: '-0.02em',
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
                        minWidth: 150,
                        borderRadius: 1.5,
                        px: 2.75,
                        py: 1.35,
                        bgcolor: 'primary.main',
                        color: '#041216',
                        letterSpacing: '0.08em',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        '&:hover': {
                            bgcolor: 'primary.light',
                        },
                    }}
                >
                    {t('PublicCatalog.Detail.addToTank')}
                </Button>
                <Button
                    variant="outlined"
                    startIcon={isBookmarked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
                    onClick={onToggleBookmark}
                    disabled={isBookmarkPending}
                    sx={{
                        minWidth: 132,
                        borderRadius: 1.5,
                        px: 2.25,
                        py: 1.35,
                        borderColor: isBookmarked ? 'rgba(52, 228, 234, 0.4)' : 'rgba(255,255,255,0.14)',
                        color: isBookmarked ? 'primary.main' : 'text.primary',
                        backgroundColor: isBookmarked ? 'rgba(52, 228, 234, 0.08)' : 'rgba(255,255,255,0.035)',
                        letterSpacing: '0.08em',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: 'rgba(52, 228, 234, 0.12)',
                        },
                    }}
                >
                    {isBookmarked ? t('PublicCatalog.Detail.saved') : t('PublicCatalog.Detail.saveAction')}
                </Button>
            </Stack>
        </Stack>
    );
};

export default SpeciesHero;
