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
                border: '1px solid rgba(52, 228, 234, 0.08)',
                background: 'linear-gradient(180deg, rgba(14, 31, 36, 0.96) 0%, rgba(10, 23, 27, 0.99) 100%)',
                transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 8px 22px rgba(0, 0, 0, 0.14)',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: 'rgba(52, 228, 234, 0.28)',
                    boxShadow: '0 18px 30px rgba(0, 0, 0, 0.24)',
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
                        height: 228,
                        objectFit: 'cover',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        filter: 'saturate(0.9)',
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
                            height: 26,
                            borderRadius: 1.5,
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            color: 'primary.main',
                            backgroundColor: 'rgba(4, 18, 22, 0.84)',
                            border: '1px solid rgba(52, 228, 234, 0.24)',
                        }}
                    />
                )}
            </Box>

            <CardContent
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.25,
                    p: 2.25,
                }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 760,
                                lineHeight: 1.1,
                                letterSpacing: '-0.03em',
                                mb: 0.4,
                            }}
                        >
                            {species.commonName}
                        </Typography>
                        {species.scientificName && (
                            <Typography
                                variant="body2"
                                noWrap
                                sx={{
                                    color: 'text.secondary',
                                    fontStyle: 'italic',
                                }}
                            >
                                {species.scientificName}
                            </Typography>
                        )}
                    </Box>
                    <ArrowOutwardRoundedIcon sx={{ color: 'primary.main', fontSize: 18, mt: 0.25, flexShrink: 0 }} />
                </Stack>

                <Box
                    sx={{
                        mt: 'auto',
                        pt: 1.25,
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: species.isActive ? 'primary.main' : 'text.disabled',
                            letterSpacing: '0.1em',
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
