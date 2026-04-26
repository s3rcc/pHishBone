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
        <Box sx={{ mt: { xs: 6, md: 8 } }}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1.5}
                sx={{ mb: 2.5 }}
            >
                <Box>
                    <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.04em' }}>
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
                                    borderColor: 'rgba(52, 228, 234, 0.12)',
                                    background: 'linear-gradient(180deg, rgba(13, 30, 35, 0.96) 0%, rgba(9, 23, 27, 0.98) 100%)',
                                    transition: 'transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease',
                                    '&:hover': {
                                        transform: 'translateY(-3px)',
                                        borderColor: 'rgba(52, 228, 234, 0.35)',
                                        boxShadow: '0 18px 34px rgba(0, 0, 0, 0.26)',
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'relative',
                                        aspectRatio: '1.35 / 1',
                                        overflow: 'hidden',
                                        borderBottom: '1px solid rgba(52, 228, 234, 0.08)',
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
                                                borderRadius: 1.5,
                                                fontSize: '0.68rem',
                                                fontWeight: 700,
                                                letterSpacing: '0.08em',
                                                color: '#69F6FC',
                                                backgroundColor: 'rgba(3, 18, 22, 0.84)',
                                                border: '1px solid rgba(52, 228, 234, 0.24)',
                                            }}
                                        />
                                    )}
                                </Box>

                                <Stack spacing={1.5} sx={{ p: 2 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="subtitle1" fontWeight={750} noWrap>
                                                {candidate.commonName}
                                            </Typography>
                                            {candidate.scientificName && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    noWrap
                                                    sx={{ fontStyle: 'italic' }}
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
                                                    height: 24,
                                                    borderRadius: 1.5,
                                                    fontSize: '0.68rem',
                                                    color: 'text.secondary',
                                                    backgroundColor: 'rgba(255,255,255,0.035)',
                                                    border: '1px solid rgba(255,255,255,0.06)',
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
