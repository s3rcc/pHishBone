import React, { useCallback } from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Chip,
    Box,
    Stack,
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { SpeciesDto } from '../../catalog-management/types';

interface SpeciesCardProps {
    species: SpeciesDto;
}

const PLACEHOLDER_IMG = 'https://placehold.co/400x280/0A1628/00BCD4?text=No+Image';

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
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 28px rgba(0,188,212,0.18)',
                },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
            }}
        >
            {/* Active indicator dot */}
            {species.isActive === true && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: '#1DE9B6',
                        boxShadow: '0 0 6px #1DE9B6',
                        zIndex: 1,
                    }}
                />
            )}

            <CardMedia
                component="img"
                loading="lazy"
                height={190}
                image={species.thumbnailUrl || PLACEHOLDER_IMG}
                alt={species.commonName}
                sx={{ objectFit: 'cover' }}
            />

            <CardContent
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    p: 2,
                    pb: '12px !important',
                }}
            >
                {/* Type badge */}
                {species.typeName && (
                    <Chip
                        label={species.typeName}
                        size="small"
                        sx={{
                            alignSelf: 'flex-start',
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            borderRadius: 1,
                            bgcolor: 'rgba(0,188,212,0.12)',
                            color: 'primary.main',
                            mb: 0.5,
                        }}
                    />
                )}

                <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    noWrap
                    sx={{ lineHeight: 1.35 }}
                >
                    {species.commonName}
                </Typography>

                {species.scientificName && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ fontStyle: 'italic', fontSize: '0.78rem' }}
                    >
                        {species.scientificName}
                    </Typography>
                )}

                <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{ mt: 'auto', pt: 1 }}
                >
                    <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ fontSize: '0.68rem' }}
                    >
                        {t('PublicCatalog.type')}:{' '}
                        <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            {species.typeName ?? '—'}
                        </Box>
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default SpeciesCard;

