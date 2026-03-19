import React, { useState, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Dialog,
    IconButton,
    ImageList,
    ImageListItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { publicCatalogApi } from '../../api/publicCatalogApi';
import type { ImageResponseDto } from '../../../catalog-management/types';

interface ImageGalleryProps {
    speciesId: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ speciesId }) => {
    const { t } = useTranslation();
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const { data: images } = useSuspenseQuery<ImageResponseDto[]>({
        queryKey: ['public-catalog', 'images', speciesId],
        queryFn: () => publicCatalogApi.getSpeciesImages(speciesId),
    });

    const sortedImages = useMemo(
        () => [...images].sort((a, b) => a.sortOrder - b.sortOrder),
        [images],
    );

    const handleOpen = useCallback((index: number) => {
        setLightboxIndex(index);
    }, []);

    const handleClose = useCallback(() => {
        setLightboxIndex(null);
    }, []);

    const handlePrev = useCallback(() => {
        setLightboxIndex((prev) =>
            prev !== null ? (prev - 1 + sortedImages.length) % sortedImages.length : null,
        );
    }, [sortedImages.length]);

    const handleNext = useCallback(() => {
        setLightboxIndex((prev) =>
            prev !== null ? (prev + 1) % sortedImages.length : null,
        );
    }, [sortedImages.length]);

    // Handle keyboard navigation in lightbox
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handlePrev();
            else if (e.key === 'ArrowRight') handleNext();
            else if (e.key === 'Escape') handleClose();
        },
        [handlePrev, handleNext, handleClose],
    );

    if (!sortedImages.length) {
        return null;
    }

    const currentImage = lightboxIndex !== null ? sortedImages[lightboxIndex] : null;

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                {t('PublicCatalog.Detail.galleryTitle')}
            </Typography>

            {/* ── Thumbnail Grid ───────────────────────────────────── */}
            <ImageList
                cols={4}
                gap={12}
                sx={{
                    m: 0,
                    '& .MuiImageListItem-root': {
                        borderRadius: 2,
                        overflow: 'hidden',
                    },
                }}
            >
                {sortedImages.map((img, index) => (
                    <ImageListItem
                        key={img.id}
                        onClick={() => handleOpen(index)}
                        sx={{
                            cursor: 'pointer',
                            '&:hover img': {
                                transform: 'scale(1.05)',
                            },
                        }}
                    >
                        <Box
                            component="img"
                            loading="lazy"
                            src={img.imageUrl}
                            alt={img.caption || `Image ${index + 1}`}
                            sx={{
                                width: '100%',
                                height: 160,
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease',
                                display: 'block',
                            }}
                        />
                    </ImageListItem>
                ))}
            </ImageList>

            {/* ── Lightbox Dialog ──────────────────────────────────── */}
            <Dialog
                open={lightboxIndex !== null}
                onClose={handleClose}
                maxWidth={false}
                onKeyDown={handleKeyDown}
                slotProps={{
                    paper: {
                        sx: {
                            backgroundColor: 'rgba(0,0,0,0.95)',
                            boxShadow: 'none',
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            borderRadius: 2,
                            overflow: 'hidden',
                            position: 'relative',
                        },
                    },
                }}
            >
                {/* Close button */}
                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: 'white',
                        zIndex: 10,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.2)',
                        },
                    }}
                >
                    <CloseIcon />
                </IconButton>

                {/* Navigation arrows */}
                {sortedImages.length > 1 && (
                    <>
                        <IconButton
                            onClick={handlePrev}
                            sx={{
                                position: 'absolute',
                                left: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'white',
                                zIndex: 10,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                },
                            }}
                        >
                            <ArrowBackIosNewIcon />
                        </IconButton>
                        <IconButton
                            onClick={handleNext}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'white',
                                zIndex: 10,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                },
                            }}
                        >
                            <ArrowForwardIosIcon />
                        </IconButton>
                    </>
                )}

                {/* Main image */}
                {currentImage && (
                    <Box
                        component="img"
                        src={currentImage.imageUrl}
                        alt={currentImage.caption || 'Full size'}
                        sx={{
                            maxWidth: '85vw',
                            maxHeight: '85vh',
                            objectFit: 'contain',
                            display: 'block',
                            mx: 'auto',
                        }}
                    />
                )}

                {/* Caption */}
                {currentImage?.caption && (
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'rgba(255,255,255,0.7)',
                            textAlign: 'center',
                            py: 1.5,
                            px: 2,
                        }}
                    >
                        {currentImage.caption}
                    </Typography>
                )}
            </Dialog>
        </Paper>
    );
};

export default ImageGallery;
