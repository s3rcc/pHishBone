import React, { useCallback, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ZoomOutMapRoundedIcon from '@mui/icons-material/ZoomOutMapRounded';
import type { ImageResponseDto } from '../../../catalog-management/types';

interface ImageGalleryProps {
    commonName: string;
    primaryImage?: string;
    images: ImageResponseDto[];
    title: string;
    emptyStateLabel: string;
    expandLabel: string;
    viewAllLabel: string;
}

const PLACEHOLDER_IMAGE = 'https://placehold.co/960x620/08171C/34E4EA?text=No+Image';

export const ImageGallery: React.FC<ImageGalleryProps> = ({
    commonName,
    primaryImage,
    images,
    title,
    emptyStateLabel,
    expandLabel,
    viewAllLabel,
}) => {
    const galleryImages = useMemo(() => {
        const normalized = [...images].sort((left, right) => left.sortOrder - right.sortOrder);
        if (!normalized.length && primaryImage) {
            return [{
                id: 'primary',
                imageUrl: primaryImage,
                sortOrder: 0,
                createdTime: new Date().toISOString(),
            } satisfies ImageResponseDto];
        }

        if (primaryImage && normalized.every((item) => item.imageUrl !== primaryImage)) {
            return [{
                id: 'primary',
                imageUrl: primaryImage,
                sortOrder: -1,
                createdTime: new Date().toISOString(),
            } satisfies ImageResponseDto, ...normalized];
        }

        return normalized;
    }, [images, primaryImage]);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const selectedImage = galleryImages[selectedIndex]?.imageUrl || PLACEHOLDER_IMAGE;

    const handleSelect = useCallback((index: number) => {
        setSelectedIndex(index);
    }, []);

    const handleOpenLightbox = useCallback(() => {
        setLightboxOpen(true);
    }, []);

    const handleCloseLightbox = useCallback(() => {
        setLightboxOpen(false);
    }, []);

    return (
        <>
            <Box>
                <Box
                    sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 2,
                        border: '1px solid rgba(52, 228, 234, 0.1)',
                        backgroundColor: 'rgba(255,255,255,0.02)',
                    }}
                >
                    <Box
                        component="img"
                        src={selectedImage}
                        alt={commonName}
                        sx={{
                            width: '100%',
                            aspectRatio: '1.7 / 1',
                            objectFit: 'cover',
                            display: 'block',
                            filter: galleryImages.length ? 'saturate(0.92)' : 'grayscale(0.15)',
                        }}
                    />

                    <Button
                        size="small"
                        startIcon={<ZoomOutMapRoundedIcon />}
                        onClick={handleOpenLightbox}
                        sx={{
                            position: 'absolute',
                            left: 16,
                            bottom: 16,
                            borderRadius: 999,
                            px: 1.5,
                            py: 0.5,
                            backgroundColor: 'rgba(5, 15, 18, 0.72)',
                            color: 'text.primary',
                            border: '1px solid rgba(255,255,255,0.08)',
                            fontSize: '0.7rem',
                            letterSpacing: '0.05em',
                            '&:hover': {
                                backgroundColor: 'rgba(5, 15, 18, 0.88)',
                            },
                        }}
                    >
                        {expandLabel}
                    </Button>
                </Box>

                <Stack direction="row" spacing={1.25} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
                    {galleryImages.slice(0, 4).map((image, index) => {
                        const active = index === selectedIndex;

                        return (
                            <Box
                                key={image.id}
                                onClick={() => handleSelect(index)}
                                sx={{
                                    width: 86,
                                    height: 64,
                                    borderRadius: 1.5,
                                    overflow: 'hidden',
                                    border: '1px solid',
                                    borderColor: active ? 'primary.main' : 'rgba(255,255,255,0.08)',
                                    boxShadow: active ? '0 0 0 1px rgba(52, 228, 234, 0.16)' : 'none',
                                    cursor: 'pointer',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    transition: 'border-color 0.18s ease, transform 0.18s ease',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                            >
                                <Box
                                    component="img"
                                    src={image.imageUrl}
                                    alt={`${commonName} thumbnail ${index + 1}`}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block',
                                    }}
                                />
                            </Box>
                        );
                    })}

                    {galleryImages.length > 4 && (
                        <Box
                            onClick={handleOpenLightbox}
                            sx={{
                                width: 86,
                                height: 64,
                                borderRadius: 1.5,
                                display: 'grid',
                                placeItems: 'center',
                                border: '1px dashed rgba(255,255,255,0.12)',
                                color: 'text.secondary',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                cursor: 'pointer',
                                px: 1,
                                textAlign: 'center',
                            }}
                        >
                            <Typography variant="caption" sx={{ fontSize: '0.64rem', letterSpacing: '0.06em' }}>
                                {viewAllLabel}
                            </Typography>
                        </Box>
                    )}

                    {!galleryImages.length && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {emptyStateLabel}
                        </Typography>
                    )}
                </Stack>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>
                    {title}
                </Typography>
            </Box>

            <Dialog
                open={lightboxOpen}
                onClose={handleCloseLightbox}
                maxWidth={false}
                slotProps={{
                    paper: {
                        sx: {
                            width: 'min(92vw, 1120px)',
                            backgroundColor: 'rgba(4, 13, 16, 0.98)',
                            borderRadius: 2,
                            overflow: 'hidden',
                        },
                    },
                }}
            >
                <Box sx={{ position: 'relative' }}>
                    <IconButton
                        onClick={handleCloseLightbox}
                        sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            zIndex: 1,
                            color: 'white',
                            backgroundColor: 'rgba(0, 0, 0, 0.35)',
                            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                        }}
                    >
                        <CloseRoundedIcon />
                    </IconButton>
                    <Box
                        component="img"
                        src={selectedImage}
                        alt={commonName}
                        sx={{
                            width: '100%',
                            maxHeight: '84vh',
                            objectFit: 'contain',
                            display: 'block',
                            backgroundColor: '#061216',
                        }}
                    />
                </Box>
            </Dialog>
        </>
    );
};

export default ImageGallery;
