import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { ImageCropperDialog } from '~components/ui/ImageCropper';
import { useUploadAvatarMutation } from '../hooks/useProfile';

interface UploadAvatarCardProps {
    currentUsername: string;
    currentAvatarUrl?: string | null;
}

export const UploadAvatarCard: React.FC<UploadAvatarCardProps> = ({ currentUsername, currentAvatarUrl }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Raw image selected by the user — fed into the cropper dialog
    const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
    const [cropperOpen, setCropperOpen] = useState(false);

    // The confirmed, cropped preview URL (displayed optimistically while uploading)
    const [preview, setPreview] = useState<string | null>(null);

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const { mutate: uploadAvatar, isPending } = useUploadAvatarMutation();
    const { t } = useTranslation();

    const handleCloseSnackbar = useCallback(() => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    }, []);

    /** Step 1: user picks a file → open cropper */
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Reset the input value so the same file can be re-selected
        e.target.value = '';

        const objectUrl = URL.createObjectURL(file);
        setRawImageSrc(objectUrl);
        setCropperOpen(true);
    }, []);

    /** Step 2: user confirms crop → upload the cropped File */
    const handleCropComplete = useCallback(
        (croppedFile: File) => {
            // Show optimistic preview from the cropped file
            const previewUrl = URL.createObjectURL(croppedFile);
            setPreview(previewUrl);

            uploadAvatar(croppedFile, {
                onSuccess: (res) => {
                    setSnackbar({ open: true, message: res.message ?? t('Profile.Avatar.successMessage'), severity: 'success' });
                },
                onError: (err: unknown) => {
                    const msg =
                        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                        t('Profile.Avatar.errorMessage');
                    setSnackbar({ open: true, message: msg, severity: 'error' });
                    setPreview(null); // revert optimistic preview on error
                },
            });
        },
        [uploadAvatar],
    );

    /** Step 2 (cancel): user closes cropper without confirming */
    const handleCropperClose = useCallback(() => {
        setCropperOpen(false);
        if (rawImageSrc) {
            URL.revokeObjectURL(rawImageSrc);
            setRawImageSrc(null);
        }
    }, [rawImageSrc]);

    const avatarSrc = preview ?? currentAvatarUrl ?? undefined;

    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                    <PhotoCameraIcon fontSize="small" sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle1" fontWeight={700}>
                        {t('Profile.Avatar.sectionTitle')}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    {/* Avatar preview with upload spinner overlay */}
                    <Box sx={{ position: 'relative' }}>
                        <Avatar
                            src={avatarSrc}
                            alt={currentUsername}
                            sx={{
                                width: 80,
                                height: 80,
                                fontSize: '2rem',
                                fontWeight: 700,
                                bgcolor: 'primary.main',
                                boxShadow: '0 4px 14px rgba(0,188,212,0.35)',
                            }}
                        >
                            {!avatarSrc && currentUsername.charAt(0).toUpperCase()}
                        </Avatar>
                        {isPending && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(0,0,0,0.45)',
                                }}
                            >
                                <CircularProgress size={28} sx={{ color: '#fff' }} />
                            </Box>
                        )}
                    </Box>

                    {/* File picker trigger */}
                    <Box>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <Button
                            variant="outlined"
                            size="small"
                            disabled={isPending}
                            onClick={() => fileInputRef.current?.click()}
                            startIcon={<PhotoCameraIcon />}
                        >
                            {isPending ? t('Profile.Avatar.uploading') : t('Profile.Avatar.changePhoto')}
                        </Button>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.75 }}>
                            {t('Profile.Avatar.hint')}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Crop dialog — only mounted when a file has been picked */}
            {rawImageSrc && (
                <ImageCropperDialog
                    open={cropperOpen}
                    imageSrc={rawImageSrc}
                    onCropComplete={handleCropComplete}
                    onClose={handleCropperClose}
                    aspect={1}
                    outputSize={{ width: 400, height: 400 }}
                    title={t('Profile.Avatar.cropTitle')}
                />
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default UploadAvatarCard;
