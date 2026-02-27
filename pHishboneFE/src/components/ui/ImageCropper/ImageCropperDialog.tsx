import React, { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import CropIcon from '@mui/icons-material/Crop';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { getCroppedImg } from './canvasUtils';
import type { PixelCrop } from './canvasUtils';

interface ImageCropperDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Object URL of the image to crop (from URL.createObjectURL) */
    imageSrc: string;
    /** Called when the user confirms the crop — returns a compressed File */
    onCropComplete: (croppedFile: File) => void;
    /** Called when the user cancels */
    onClose: () => void;
    /** Aspect ratio of the crop area. Default 1 (square) */
    aspect?: number;
    /** Output size in pixels. Default: 400×400 */
    outputSize?: { width: number; height: number };
    /** Title shown in the dialog */
    title?: string;
}

export const ImageCropperDialog: React.FC<ImageCropperDialogProps> = ({
    open,
    imageSrc,
    onCropComplete,
    onClose,
    aspect = 1,
    outputSize = { width: 400, height: 400 },
    title = 'Crop Image',
}) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCropAreaChange = useCallback((_croppedArea: Area, croppedAreaPx: Area) => {
        setCroppedAreaPixels(croppedAreaPx as PixelCrop);
    }, []);

    const handleConfirm = useCallback(async () => {
        if (!croppedAreaPixels) return;
        setIsProcessing(true);
        try {
            const file = await getCroppedImg(imageSrc, croppedAreaPixels, rotation, outputSize);
            onCropComplete(file);
            onClose();
        } catch (err) {
            console.error('Crop failed:', err);
        } finally {
            setIsProcessing(false);
        }
    }, [imageSrc, croppedAreaPixels, rotation, outputSize, onCropComplete, onClose]);

    const handleClose = useCallback(() => {
        // Reset state on close
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setCroppedAreaPixels(null);
        onClose();
    }, [onClose]);

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, overflow: 'hidden' },
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CropIcon sx={{ color: 'primary.main' }} />
                {title}
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                {/* ── Cropper canvas area ── */}
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        height: 340,
                        bgcolor: '#111',
                    }}
                >
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={handleCropAreaChange}
                    />
                </Box>

                {/* ── Controls ── */}
                <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
                    {/* Zoom */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <ZoomInIcon fontSize="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ width: 44, flexShrink: 0 }}>
                            Zoom
                        </Typography>
                        <Slider
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.01}
                            aria-label="Zoom"
                            onChange={(_e, val) => setZoom(val as number)}
                            sx={{ color: 'primary.main' }}
                        />
                    </Box>

                    {/* Rotation */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <RotateRightIcon fontSize="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ width: 44, flexShrink: 0 }}>
                            Rotate
                        </Typography>
                        <Slider
                            value={rotation}
                            min={-180}
                            max={180}
                            step={1}
                            aria-label="Rotation"
                            onChange={(_e, val) => setRotation(val as number)}
                            sx={{ color: 'primary.main' }}
                        />
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} variant="text" disabled={isProcessing}>
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={isProcessing || !croppedAreaPixels}
                    sx={{
                        background: 'linear-gradient(135deg, #00BCD4, #1DE9B6)',
                        '&:hover': { background: 'linear-gradient(135deg, #0097A7, #00BFA5)' },
                    }}
                >
                    {isProcessing ? 'Applying…' : 'Apply Crop'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImageCropperDialog;
