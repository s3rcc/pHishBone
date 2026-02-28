import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ImageCropperDialog } from '~components/ui/ImageCropper';
import { useUploadAvatarMutation } from '../hooks/useProfile';

interface UploadAvatarCardProps {
    currentUsername: string;
    currentAvatarUrl?: string | null;
}

export const UploadAvatarCard: React.FC<UploadAvatarCardProps> = ({ currentUsername, currentAvatarUrl }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const avatarRef = useRef<HTMLDivElement>(null);

    // Avatar context menu
    const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
    // View photo dialog
    const [viewOpen, setViewOpen] = useState(false);
    // Cropper
    const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
    const [cropperOpen, setCropperOpen] = useState(false);
    // Optimistic preview
    const [preview, setPreview] = useState<string | null>(null);

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const { mutate: uploadAvatar, isPending } = useUploadAvatarMutation();
    const { t } = useTranslation();

    const avatarSrc = preview ?? currentAvatarUrl ?? undefined;

    const handleCloseSnackbar = useCallback(() => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    }, []);

    const handleAvatarClick = useCallback(() => setAvatarMenuOpen(true), []);
    const handleMenuClose = useCallback(() => setAvatarMenuOpen(false), []);

    const handleViewPhoto = useCallback(() => {
        handleMenuClose();
        setViewOpen(true);
    }, [handleMenuClose]);

    const handleChangePhoto = useCallback(() => {
        handleMenuClose();
        fileInputRef.current?.click();
    }, [handleMenuClose]);

    /** Step 1: user picks a file → open cropper */
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        const objectUrl = URL.createObjectURL(file);
        setRawImageSrc(objectUrl);
        setCropperOpen(true);
    }, []);

    /** Step 2: user confirms crop → upload the cropped File */
    const handleCropComplete = useCallback(
        (croppedFile: File) => {
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
                    setPreview(null);
                },
            });
        },
        [uploadAvatar, t],
    );

    const handleCropperClose = useCallback(() => {
        setCropperOpen(false);
        if (rawImageSrc) {
            URL.revokeObjectURL(rawImageSrc);
            setRawImageSrc(null);
        }
    }, [rawImageSrc]);

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

                {/* Clickable avatar */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Tooltip title={t('Profile.Avatar.changePhoto')} placement="bottom">
                        <Box
                            ref={avatarRef}
                            onClick={handleAvatarClick}
                            sx={{
                                position: 'relative',
                                cursor: 'pointer',
                                borderRadius: '50%',
                                display: 'inline-flex',
                                '&:hover .avatar-overlay': { opacity: 1 },
                            }}
                        >
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

                            {/* Hover overlay */}
                            <Box
                                className="avatar-overlay"
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(0,0,0,0.45)',
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                {isPending
                                    ? <CircularProgress size={28} sx={{ color: '#fff' }} />
                                    : <PhotoCameraIcon sx={{ color: '#fff', fontSize: 24 }} />}
                            </Box>
                        </Box>
                    </Tooltip>

                    <Box>
                        <Typography variant="body2" fontWeight={600}>
                            {currentUsername}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                            {t('Profile.Avatar.hint')}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* ── Avatar context menu ─────────────────────────────────── */}
            <Menu
                anchorEl={avatarRef.current}
                open={avatarMenuOpen}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            mt: 0.5,
                            minWidth: 180,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                        },
                    },
                }}
            >
                <MenuItem onClick={handleViewPhoto} disabled={!avatarSrc}>
                    <ListItemIcon>
                        <VisibilityIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t('Profile.Avatar.viewPhoto')} />
                </MenuItem>
                <MenuItem onClick={handleChangePhoto} disabled={isPending}>
                    <ListItemIcon>
                        <PhotoCameraIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t('Profile.Avatar.changePhoto')} />
                </MenuItem>
            </Menu>

            {/* ── View photo dialog ───────────────────────────────────── */}
            <Dialog
                open={viewOpen}
                onClose={() => setViewOpen(false)}
                maxWidth="sm"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 3,
                            overflow: 'hidden',
                        },
                    },
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                        {t('Profile.Avatar.viewPhotoTitle')}
                    </Typography>
                    <IconButton size="small" onClick={() => setViewOpen(false)}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', justifyContent: 'center', pb: 3 }}>
                    <Avatar
                        src={avatarSrc}
                        alt={currentUsername}
                        sx={{
                            width: 400,
                            height: 400,
                            fontSize: '5rem',
                            fontWeight: 700,
                            bgcolor: 'primary.main',
                            boxShadow: '0 8px 32px rgba(0,188,212,0.3)',
                        }}
                    >
                        {!avatarSrc && currentUsername.charAt(0).toUpperCase()}
                    </Avatar>
                </DialogContent>
            </Dialog>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {/* Crop dialog */}
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
