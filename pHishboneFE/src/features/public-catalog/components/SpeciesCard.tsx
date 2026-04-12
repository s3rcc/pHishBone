import React, { useCallback, useMemo } from 'react';
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
import type { SpeciesDto } from '../../catalog-management/types';

interface SpeciesCardProps {
    species: SpeciesDto;
    /** Pre-resolved tags to display on the card (max 3) */
    tags?: string[];
}

const PLACEHOLDER_IMG = 'https://placehold.co/400x280/0A1628/00BCD4?text=No+Image';

export const SpeciesCard: React.FC<SpeciesCardProps> = ({ species, tags }) => {
    const navigate = useNavigate();

    const handleClick = useCallback(() => {
        void navigate({ to: '/explore/$slug', params: { slug: species.slug } });
    }, [navigate, species.slug]);

    const displayTags = useMemo(() => (tags ?? []).slice(0, 3), [tags]);

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
            }}
        >
            <CardMedia
                component="img"
                loading="lazy"
                height={200}
                image={species.thumbnailUrl || PLACEHOLDER_IMG}
                alt={species.commonName}
                sx={{
                    objectFit: 'cover',
                }}
            />
            <CardContent
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    p: 2,
                    '&:last-child': { pb: 2 },
                }}
            >
                <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    noWrap
                    sx={{ lineHeight: 1.3 }}
                >
                    {species.commonName}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={{ fontStyle: 'italic', mb: 1 }}
                >
                    {species.scientificName}
                </Typography>

                {displayTags.length > 0 && (
                    <Box sx={{ mt: 'auto' }}>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                            {displayTags.map((tag) => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        borderRadius: 2,
                                        fontSize: '0.7rem',
                                        height: 24,
                                        borderColor: 'primary.light',
                                        color: 'primary.dark',
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default SpeciesCard;
