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
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'background.paper',
                    }}
                >
                    <Box
                        component="img"
                        src={selectedImage}
                        alt={commonName}
                        sx={{
                            width: '100%',
                            aspectRatio: '1.85 / 1',
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
                            left: 12,
                            bottom: 12,
                            borderRadius: 1,
                            px: 1.25,
                            py: 0.4,
                            backgroundColor: 'rgba(10, 22, 40, 0.72)',
                            color: 'text.primary',
                            border: '1px solid',
                            borderColor: 'divider',
                            fontSize: '0.68rem',
                            '&:hover': {
                                backgroundColor: 'rgba(10, 22, 40, 0.88)',
                            },
                        }}
                    >
                        {expandLabel}
                    </Button>
                </Box>

                <Stack direction="row" spacing={1} sx={{ mt: 1.25, flexWrap: 'wrap' }}>
                    {galleryImages.slice(0, 4).map((image, index) => {
                        const active = index === selectedIndex;

                        return (
                            <Box
                                key={image.id}
                                onClick={() => handleSelect(index)}
                                sx={{
                                    width: 72,
                                    height: 54,
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    border: '1px solid',
                                    borderColor: active ? 'primary.main' : 'divider',
                                    boxShadow: active ? '0 0 0 1px rgba(0, 188, 212, 0.16)' : 'none',
                                    cursor: 'pointer',
                                    backgroundColor: 'background.paper',
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
                                width: 72,
                                height: 54,
                                borderRadius: 1,
                                display: 'grid',
                                placeItems: 'center',
                                border: '1px dashed',
                                borderColor: 'divider',
                                color: 'text.secondary',
                                backgroundColor: 'background.paper',
                                cursor: 'pointer',
                                px: 1,
                                textAlign: 'center',
                            }}
                        >
                            <Typography variant="caption" sx={{ fontSize: '0.62rem' }}>
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
                            backgroundColor: 'background.paper',
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
                            backgroundColor: 'rgba(10, 22, 40, 0.35)',
                            '&:hover': { backgroundColor: 'rgba(10, 22, 40, 0.5)' },
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
                            backgroundColor: '#0A1628',
                        }}
                    />
                </Box>
            </Dialog>
        </>
    );
};

export default ImageGallery;
