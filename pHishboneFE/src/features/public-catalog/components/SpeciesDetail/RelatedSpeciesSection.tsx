import React, { useCallback } from 'react';
import {
    Box,
    ButtonBase,
    Chip,
    Grid,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { RelatedSpeciesDto } from '../../types';

interface RelatedSpeciesSectionProps {
    species: RelatedSpeciesDto[];
}

const PLACEHOLDER_IMAGE = 'https://placehold.co/640x420/08171C/34E4EA?text=Species';

export const RelatedSpeciesSection: React.FC<RelatedSpeciesSectionProps> = ({ species }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleNavigate = useCallback((slug: string) => {
        void navigate({ to: '/explore/$slug', params: { slug } });
    }, [navigate]);

    if (!species.length) {
        return null;
    }

    return (
        <Box sx={{ mt: { xs: 4.5, md: 5.5 } }}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1.5}
                sx={{ mb: 2 }}
            >
                <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.03em' }}>
                        {t('PublicCatalog.Detail.relatedTitle')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('PublicCatalog.Detail.relatedSubtitle')}
                    </Typography>
                </Box>
            </Stack>

            <Grid container spacing={2}>
                {species.map((candidate) => (
                    <Grid key={candidate.id} size={{ xs: 12, sm: 6, lg: 3 }}>
                        <ButtonBase
                            onClick={() => handleNavigate(candidate.slug)}
                            sx={{
                                width: '100%',
                                display: 'block',
                                textAlign: 'left',
                                borderRadius: 2,
                            }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    overflow: 'hidden',
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    backgroundColor: 'background.paper',
                                    transition: 'transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease',
                                    '&:hover': {
                                        transform: 'translateY(-3px)',
                                        borderColor: 'rgba(0, 188, 212, 0.35)',
                                        boxShadow: (theme) => theme.palette.mode === 'dark'
                                            ? '0 14px 28px rgba(0, 0, 0, 0.18)'
                                            : '0 12px 22px rgba(10, 22, 40, 0.10)',
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'relative',
                                        aspectRatio: '1.5 / 1',
                                        overflow: 'hidden',
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={candidate.thumbnailUrl || PLACEHOLDER_IMAGE}
                                        alt={candidate.commonName}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block',
                                            filter: 'saturate(0.82)',
                                        }}
                                    />
                                    {candidate.typeName && (
                                        <Chip
                                            label={candidate.typeName}
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: 12,
                                                left: 12,
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

                                <Stack spacing={1.2} sx={{ p: 1.5 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="subtitle2" fontWeight={700} noWrap>
                                                {candidate.commonName}
                                            </Typography>
                                            {candidate.scientificName && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    noWrap
                                                    sx={{ fontStyle: 'italic', fontSize: '0.78rem' }}
                                                >
                                                    {candidate.scientificName}
                                                </Typography>
                                            )}
                                        </Box>
                                        <ArrowOutwardRoundedIcon sx={{ color: 'primary.main', fontSize: 18, mt: 0.25 }} />
                                    </Stack>

                                    <Stack direction="row" flexWrap="wrap" useFlexGap gap={0.75}>
                                        {candidate.matchReasons.slice(0, 3).map((reason) => (
                                            <Chip
                                                key={reason}
                                                label={reason}
                                                size="small"
                                                sx={{
                                                    height: 22,
                                                    borderRadius: 1,
                                                    fontSize: '0.66rem',
                                                    color: 'text.secondary',
                                                    backgroundColor: 'action.hover',
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                }}
                                            />
                                        ))}
                                    </Stack>
                                </Stack>
                            </Paper>
                        </ButtonBase>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default RelatedSpeciesSection;
