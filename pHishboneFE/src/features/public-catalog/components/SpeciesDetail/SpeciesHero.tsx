import React from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import StraightenIcon from '@mui/icons-material/Straighten';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AquariumIcon from '@mui/icons-material/Pool';
import type { SpeciesDetailDto } from '../../../catalog-management/types';

interface SpeciesHeroProps {
    species: SpeciesDetailDto;
}

const PLACEHOLDER_IMG = 'https://placehold.co/800x400/0A1628/00BCD4?text=No+Image';

const WATER_TYPE_MAP: Record<number, string> = { 0: 'Fresh', 1: 'Brackish', 2: 'Salt' };

export const SpeciesHero: React.FC<SpeciesHeroProps> = ({ species }) => {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                position: 'relative',
                borderRadius: 4,
                overflow: 'hidden',
                mb: 4,
            }}
        >
            {/* ── Background Image ────────────────────────────────── */}
            <Box
                component="img"
                loading="lazy"
                src={species.thumbnailUrl || PLACEHOLDER_IMG}
                alt={species.commonName}
                sx={{
                    width: '100%',
                    height: { xs: 280, md: 400 },
                    objectFit: 'cover',
                    display: 'block',
                }}
            />

            {/* ── Gradient Overlay ────────────────────────────────── */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background:
                        'linear-gradient(to top, rgba(10,22,40,0.92) 0%, rgba(10,22,40,0.5) 50%, transparent 100%)',
                    px: { xs: 3, md: 5 },
                    py: { xs: 3, md: 4 },
                }}
            >
                <Chip
                    label={species.typeName}
                    size="small"
                    sx={{
                        mb: 1.5,
                        backgroundColor: 'rgba(0,188,212,0.2)',
                        color: '#4DD0E1',
                        fontWeight: 600,
                        borderRadius: 2,
                    }}
                />

                <Typography
                    variant="h3"
                    fontWeight={800}
                    sx={{ color: '#fff', lineHeight: 1.2, mb: 0.5 }}
                >
                    {species.commonName}
                </Typography>

                <Typography
                    variant="h6"
                    sx={{
                        color: 'rgba(255,255,255,0.7)',
                        fontStyle: 'italic',
                        fontWeight: 400,
                        mb: 2,
                    }}
                >
                    {species.scientificName}
                </Typography>

                {/* ── Quick Stats ─────────────────────────────────── */}
                {species.profile && (
                    <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                            <StraightenIcon sx={{ color: '#1DE9B6', fontSize: 20 }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                                {species.profile.adultSize} cm
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={0.75} alignItems="center">
                            <WaterDropIcon sx={{ color: '#4DD0E1', fontSize: 20 }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                                {t('PublicCatalog.Detail.bioLoad')}: {species.profile.bioLoadFactor}
                            </Typography>
                        </Stack>

                        {species.environment && (
                            <Stack direction="row" spacing={0.75} alignItems="center">
                                <AquariumIcon sx={{ color: '#64FFDA', fontSize: 20 }} />
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                                    {species.environment.minTankVolume}L &middot;{' '}
                                    {WATER_TYPE_MAP[species.environment.waterType] ??
                                        t(`Catalog.waterType.${species.environment.waterType}`)}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>
                )}
            </Box>
        </Box>
    );
};

export default SpeciesHero;
