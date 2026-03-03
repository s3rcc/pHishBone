import React, { Suspense, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { SuspenseLoader } from '../../../../components/layout/SuspenseLoader';
import {
    useRemoveSpeciesImage,
    useSetSpeciesThumbnail,
    useSpeciesImages,
    useUploadSpeciesImageBatch,
} from '../../hooks/useCatalog';
import type { ImageResponseDto } from '../../types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface GalleryTabProps {
    speciesId: string;
    currentThumbnailUrl?: string;
}

// ─── Image Grid (Suspense inner) ──────────────────────────────────────────────

function ImageGrid({
    speciesId,
    currentThumbnailUrl,
    onDelete,
    onSetThumbnail,
    isThumbnailPending,
}: {
    speciesId: string;
    currentThumbnailUrl?: string;
    onDelete: (img: ImageResponseDto) => void;
    onSetThumbnail: (img: ImageResponseDto) => void;
    isThumbnailPending: boolean;
}) {
    const { t } = useTranslation();
    const { data: images } = useSpeciesImages(speciesId);

    if (images.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                {t('Catalog.Gallery.noImages')}
            </Typography>
        );
    }

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 2,
            }}
        >
            {images.map((img) => {
                const isThumbnail = currentThumbnailUrl === img.imageUrl;
                return (
                    <Box
                        key={img.id}
                        sx={{
                            position: 'relative',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: isThumbnail ? 'primary.main' : 'divider',
                            bgcolor: 'background.paper',
                            transition: 'border-color 0.2s',
                            '&:hover .gallery-overlay': { opacity: 1 },
                        }}
                    >
                        <Box
                            component="img"
                            src={img.imageUrl}
                            alt={img.caption ?? 'Species image'}
                            loading="lazy"
                            sx={{
                                width: '100%',
                                aspectRatio: '4 / 3',
                                objectFit: 'cover',
                                display: 'block',
                            }}
                        />

                        {/* Thumbnail badge */}
                        {isThumbnail && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 6,
                                    left: 6,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    px: 0.75,
                                    py: 0.25,
                                    borderRadius: '4px',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    lineHeight: 1.4,
                                }}
                            >
                                <StarIcon sx={{ fontSize: '0.8rem' }} />
                                {t('Catalog.Gallery.thumbnailCurrent')}
                            </Box>
                        )}

                        {/* Hover overlay */}
                        <Box
                            className="gallery-overlay"
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                bgcolor: 'rgba(0,0,0,0.55)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                opacity: 0,
                                transition: 'opacity 0.2s',
                            }}
                        >
                            {!isThumbnail && (
                                <Tooltip title={t('Catalog.Gallery.thumbnailTooltip')}>
                                    <IconButton
                                        size="small"
                                        onClick={() => onSetThumbnail(img)}
                                        disabled={isThumbnailPending}
                                        sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                                    >
                                        <StarBorderIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <Tooltip title={t('Catalog.Gallery.deleteTooltip')}>
                                <IconButton
                                    size="small"
                                    onClick={() => onDelete(img)}
                                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'error.main' } }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        {/* Caption */}
                        {img.caption && (
                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'block',
                                    px: 1,
                                    py: 0.5,
                                    color: 'text.secondary',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {img.caption}
                            </Typography>
                        )}
                    </Box>
                );
            })}
        </Box>
    );
}

// ─── Main Gallery Tab ─────────────────────────────────────────────────────────

export const GalleryTab: React.FC<GalleryTabProps> = ({ speciesId, currentThumbnailUrl }) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [deleteTarget, setDeleteTarget] = useState<ImageResponseDto | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const { mutateAsync: uploadBatch, isPending: isUploading } = useUploadSpeciesImageBatch();
    const { mutateAsync: removeImage, isPending: isDeleting } = useRemoveSpeciesImage();
    const { mutateAsync: setThumbnail, isPending: isThumbnailPending } = useSetSpeciesThumbnail();

    // ─── Upload handler ──────────────────────────────────────────────────

    const handleUpload = useCallback(
        async (files: FileList | File[]) => {
            const fileArray = Array.from(files).filter((f) =>
                ['image/jpeg', 'image/png', 'image/webp'].includes(f.type),
            );
            if (fileArray.length === 0) return;
            setUploadError(null);
            try {
                await uploadBatch({ speciesId, files: fileArray });
            } catch {
                setUploadError(t('Catalog.Gallery.uploadError'));
            }
        },
        [speciesId, uploadBatch, t],
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
                void handleUpload(e.target.files);
                e.target.value = ''; // reset so same file can be uploaded again
            }
        },
        [handleUpload],
    );

    // ─── Drag & drop ─────────────────────────────────────────────────────

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files.length > 0) {
                void handleUpload(e.dataTransfer.files);
            }
        },
        [handleUpload],
    );

    // ─── Delete handler ──────────────────────────────────────────────────

    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteTarget) return;
        setDeleteError(null);
        try {
            await removeImage({ speciesId, imageId: deleteTarget.id });
            setDeleteTarget(null);
        } catch (err: unknown) {
            setDeleteError(err instanceof Error ? err.message : t('Catalog.form.errorUnexpected'));
        }
    }, [deleteTarget, speciesId, removeImage, t]);

    // ─── Set thumbnail handler ───────────────────────────────────────────

    const handleSetThumbnail = useCallback(
        async (img: ImageResponseDto) => {
            // Download the image, then re-upload as thumbnail
            try {
                const response = await fetch(img.imageUrl);
                const blob = await response.blob();
                const file = new File([blob], 'thumbnail.jpg', { type: blob.type });
                await setThumbnail({ speciesId, file });
            } catch {
                // Silently fail — the user can retry
            }
        },
        [speciesId, setThumbnail],
    );

    // Hidden file input
    const hiddenInput = (
        <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={handleFileChange}
        />
    );

    return (
        <Box>
            {/* Upload dropzone */}
            <Box
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                    border: '2px dashed',
                    borderColor: isDragOver ? 'primary.main' : 'divider',
                    borderRadius: '8px',
                    p: 3,
                    mb: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, background-color 0.2s',
                    bgcolor: isDragOver ? 'action.hover' : 'transparent',
                    '&:hover': { borderColor: 'primary.light', bgcolor: 'action.hover' },
                }}
            >
                {isUploading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <CircularProgress size={20} />
                        <Typography variant="body2" color="text.secondary">
                            {t('Catalog.Gallery.uploading')}
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <CloudUploadIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 0.5 }} />
                        <Typography variant="body2" fontWeight={500}>
                            {t('Catalog.Gallery.dropzoneText')}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            {t('Catalog.Gallery.dropzoneHint')}
                        </Typography>
                    </>
                )}
                {hiddenInput}
            </Box>

            {/* Upload error */}
            {uploadError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUploadError(null)}>
                    {uploadError}
                </Alert>
            )}

            {/* Image grid */}
            <Suspense fallback={<SuspenseLoader />}>
                <ImageGrid
                    speciesId={speciesId}
                    currentThumbnailUrl={currentThumbnailUrl}
                    onDelete={setDeleteTarget}
                    onSetThumbnail={(img) => void handleSetThumbnail(img)}
                    isThumbnailPending={isThumbnailPending}
                />
            </Suspense>

            {/* Delete confirmation dialog */}
            <Dialog
                open={!!deleteTarget}
                onClose={() => { setDeleteTarget(null); setDeleteError(null); }}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontSize: '1rem' }}>{t('Catalog.Gallery.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <DialogContentText variant="body2">
                        {t('Catalog.Gallery.deleteConfirm')}
                    </DialogContentText>
                    {deleteError && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                            {deleteError}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        size="small"
                        onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
                        disabled={isDeleting}
                    >
                        {t('Common.cancel')}
                    </Button>
                    <Button
                        size="small"
                        color="error"
                        variant="contained"
                        onClick={handleDeleteConfirm}
                        disabled={isDeleting}
                        sx={{ borderRadius: '4px' }}
                    >
                        {isDeleting ? t('Catalog.Gallery.deleting') : t('Catalog.Gallery.deleteButton')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GalleryTab;
