import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
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
} from '../../hooks/useCatalog';
import type { ImageResponseDto } from '../../types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StagedFile {
    file: File;
    preview: string;
}

interface GalleryTabProps {
    speciesId?: string;
    currentThumbnailUrl?: string;
    onStagedFilesChange: (files: File[]) => void;
    onThumbnailUrlChange?: (thumbnailUrl: string) => void;
}

// ─── Image Grid (server images, Suspense inner) ──────────────────────────────

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

    if (images.length === 0) return null;

    return (
        <>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block', textTransform: 'uppercase' }}>
                {t('Catalog.Gallery.title')}
            </Typography>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: 2,
                    mb: 2,
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
                                sx={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' }}
                            />
                            {isThumbnail && (
                                <Box
                                    sx={{
                                        position: 'absolute', top: 6, left: 6,
                                        display: 'flex', alignItems: 'center', gap: 0.5,
                                        bgcolor: 'primary.main', color: 'primary.contrastText',
                                        px: 0.75, py: 0.25, borderRadius: '4px',
                                        fontSize: '0.65rem', fontWeight: 700, lineHeight: 1.4,
                                    }}
                                >
                                    <StarIcon sx={{ fontSize: '0.8rem' }} />
                                    {t('Catalog.Gallery.thumbnailCurrent')}
                                </Box>
                            )}
                            <Box
                                className="gallery-overlay"
                                sx={{
                                    position: 'absolute', inset: 0,
                                    bgcolor: 'rgba(0,0,0,0.55)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                                    opacity: 0, transition: 'opacity 0.2s',
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
                            {img.caption && (
                                <Typography
                                    variant="caption"
                                    sx={{ display: 'block', px: 1, py: 0.5, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                >
                                    {img.caption}
                                </Typography>
                            )}
                        </Box>
                    );
                })}
            </Box>
        </>
    );
}

// ─── Main Gallery Tab ─────────────────────────────────────────────────────────

export const GalleryTab: React.FC<GalleryTabProps> = ({
    speciesId,
    currentThumbnailUrl,
    onStagedFilesChange,
    onThumbnailUrlChange,
}) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [deleteTarget, setDeleteTarget] = useState<ImageResponseDto | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);

    const { mutateAsync: removeImage, isPending: isDeleting } = useRemoveSpeciesImage();
    const { mutateAsync: setThumbnail, isPending: isThumbnailPending } = useSetSpeciesThumbnail();

    // Sync staged files to parent
    useEffect(() => {
        onStagedFilesChange(stagedFiles.map((sf) => sf.file));
    }, [stagedFiles, onStagedFilesChange]);

    // Cleanup object URLs
    useEffect(() => {
        return () => {
            stagedFiles.forEach((sf) => URL.revokeObjectURL(sf.preview));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStageFiles = useCallback((files: FileList | File[]) => {
        const fileArray = Array.from(files).filter((f) =>
            ['image/jpeg', 'image/png', 'image/webp'].includes(f.type),
        );
        if (fileArray.length === 0) return;
        const newStaged = fileArray.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setStagedFiles((prev) => [...prev, ...newStaged]);
    }, []);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
                handleStageFiles(e.target.files);
                e.target.value = '';
            }
        },
        [handleStageFiles],
    );

    const handleRemoveStaged = useCallback((index: number) => {
        setStagedFiles((prev) => {
            const removed = prev[index];
            if (removed) URL.revokeObjectURL(removed.preview);
            return prev.filter((_, i) => i !== index);
        });
    }, []);

    // Drag & drop
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
                handleStageFiles(e.dataTransfer.files);
            }
        },
        [handleStageFiles],
    );

    // Delete server image
    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteTarget || !speciesId) return;
        setDeleteError(null);
        try {
            await removeImage({ speciesId, imageId: deleteTarget.id });
            if (currentThumbnailUrl === deleteTarget.imageUrl) {
                onThumbnailUrlChange?.('');
            }
            setDeleteTarget(null);
        } catch (err: unknown) {
            setDeleteError(err instanceof Error ? err.message : t('Catalog.form.errorUnexpected'));
        }
    }, [currentThumbnailUrl, deleteTarget, onThumbnailUrlChange, removeImage, speciesId, t]);

    // Set thumbnail
    const handleSetThumbnail = useCallback(
        async (img: ImageResponseDto) => {
            if (!speciesId) return;
            try {
                await setThumbnail({ speciesId, imageId: img.id });
                onThumbnailUrlChange?.(img.imageUrl);
            } catch {
                // Silently fail
            }
        },
        [onThumbnailUrlChange, setThumbnail, speciesId],
    );

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
                <CloudUploadIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 0.5 }} />
                <Typography variant="body2" fontWeight={500}>
                    {t('Catalog.Gallery.dropzoneText')}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                    {t('Catalog.Gallery.dropzoneHint')}
                </Typography>
                {hiddenInput}
            </Box>

            {/* Staged (pending) files */}
            {stagedFiles.length > 0 && (
                <>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block', textTransform: 'uppercase' }}>
                        {t('Catalog.Gallery.stagedHint')}
                    </Typography>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: 2,
                            mb: 3,
                        }}
                    >
                        {stagedFiles.map((sf, index) => (
                            <Box
                                key={sf.preview}
                                sx={{
                                    position: 'relative',
                                    borderRadius: '6px',
                                    overflow: 'hidden',
                                    border: '1px dashed',
                                    borderColor: 'warning.main',
                                    bgcolor: 'background.paper',
                                }}
                            >
                                <Box
                                    component="img"
                                    src={sf.preview}
                                    alt={sf.file.name}
                                    sx={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' }}
                                />
                                <Chip
                                    label={t('Catalog.Gallery.pendingBadge')}
                                    size="small"
                                    color="warning"
                                    sx={{ position: 'absolute', top: 6, left: 6, fontSize: '0.65rem', height: 20 }}
                                />
                                <Tooltip title={t('Catalog.Gallery.deleteTooltip')}>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => { e.stopPropagation(); handleRemoveStaged(index); }}
                                        sx={{
                                            position: 'absolute', top: 6, right: 6,
                                            color: 'white', bgcolor: 'rgba(0,0,0,0.5)',
                                            '&:hover': { bgcolor: 'error.main' },
                                        }}
                                    >
                                        <DeleteIcon sx={{ fontSize: '0.9rem' }} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        ))}
                    </Box>
                </>
            )}

            {/* Server images (edit mode only) */}
            {speciesId && (
                <Suspense fallback={<SuspenseLoader />}>
                    <ImageGrid
                        speciesId={speciesId}
                        currentThumbnailUrl={currentThumbnailUrl}
                        onDelete={setDeleteTarget}
                        onSetThumbnail={(img) => void handleSetThumbnail(img)}
                        isThumbnailPending={isThumbnailPending}
                    />
                </Suspense>
            )}

            {/* No speciesId message for create mode */}
            {!speciesId && stagedFiles.length === 0 && (
                <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                    {t('Catalog.Gallery.editModeOnly')}
                </Alert>
            )}

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
