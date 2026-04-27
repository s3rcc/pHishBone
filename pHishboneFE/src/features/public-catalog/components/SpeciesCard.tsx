import React, { useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Stack,
    Typography,
} from '@mui/material';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { SpeciesDto } from '../../catalog-management/types';

interface SpeciesCardProps {
    species: SpeciesDto;
}

const PLACEHOLDER_IMG = 'https://placehold.co/640x420/08171C/34E4EA?text=Species';

export const SpeciesCard: React.FC<SpeciesCardProps> = ({ species }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleClick = useCallback(() => {
        void navigate({ to: '/explore/$slug', params: { slug: species.slug } });
    }, [navigate, species.slug]);

    return (
        <Card
            onClick={handleClick}
            sx={{
                cursor: 'pointer',
                borderRadius: 2,
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? '0 8px 24px rgba(0, 0, 0, 0.14)'
                    : '0 8px 20px rgba(10, 22, 40, 0.08)',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    borderColor: 'rgba(0, 188, 212, 0.35)',
                    boxShadow: (theme) => theme.palette.mode === 'dark'
                        ? '0 14px 28px rgba(0, 0, 0, 0.2)'
                        : '0 12px 24px rgba(10, 22, 40, 0.12)',
                },
            }}
        >
            <Box sx={{ position: 'relative' }}>
                <CardMedia
                    component="img"
                    loading="lazy"
                    image={species.thumbnailUrl || PLACEHOLDER_IMG}
                    alt={species.commonName}
                    sx={{
                        height: 176,
                        objectFit: 'cover',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        filter: 'saturate(0.94)',
                    }}
                />

                {species.typeName && (
                    <Chip
                        label={species.typeName}
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 14,
                            left: 14,
                            height: 24,
                            borderRadius: 1,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: 'primary.main',
                            backgroundColor: 'rgba(0, 188, 212, 0.10)',
                            border: '1px solid rgba(0, 188, 212, 0.18)',
                        }}
                    />
                )}
            </Box>

            <CardContent
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    p: 1.75,
                }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 700,
                                lineHeight: 1.2,
                                letterSpacing: '-0.02em',
                                mb: 0.25,
                            }}
                        >
                            {species.commonName}
                        </Typography>
                        {species.scientificName && (
                            <Typography
                                variant="caption"
                                noWrap
                                sx={{
                                    color: 'text.secondary',
                                    fontStyle: 'italic',
                                    fontSize: '0.78rem',
                                }}
                            >
                                {species.scientificName}
                            </Typography>
                        )}
                    </Box>
                    <ArrowOutwardRoundedIcon sx={{ color: 'primary.main', fontSize: 17, mt: 0.25, flexShrink: 0 }} />
                </Stack>

                <Box
                    sx={{
                        mt: 'auto',
                        pt: 1,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: species.isActive ? 'primary.main' : 'text.disabled',
                            letterSpacing: '0.08em',
                            fontWeight: 700,
                        }}
                    >
                        {species.isActive
                            ? t('PublicCatalog.cardActive')
                            : t('PublicCatalog.cardInactive')}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default SpeciesCard;
