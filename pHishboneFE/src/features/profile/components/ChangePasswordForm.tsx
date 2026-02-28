import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useChangePasswordMutation } from '../hooks/useProfile';

export const ChangePasswordForm: React.FC = () => {
    const [editing, setEditing] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const { mutate: changePassword, isPending } = useChangePasswordMutation();
    const { t } = useTranslation();

    const mismatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword !== confirmPassword;

    const handleCloseSnackbar = useCallback(() => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    }, []);

    const handleCancel = useCallback(() => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setEditing(false);
    }, []);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (mismatch) return;
            changePassword(
                { currentPassword, newPassword },
                {
                    onSuccess: () => {
                        setSnackbar({ open: true, message: t('Profile.Password.successMessage'), severity: 'success' });
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setEditing(false);
                    },
                    onError: (err: unknown) => {
                        const msg =
                            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                            t('Profile.Password.errorMessage');
                        setSnackbar({ open: true, message: msg, severity: 'error' });
                    },
                },
            );
        },
        [changePassword, currentPassword, newPassword, mismatch, t],
    );

    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    border: '1px solid',
                    borderColor: editing ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    transition: 'border-color 0.2s',
                }}
            >
                {/* Header row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: editing ? 2 : 0 }}>
                    <LockIcon fontSize="small" sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle1" fontWeight={700} sx={{ flexGrow: 1 }}>
                        {t('Profile.Password.sectionTitle')}
                    </Typography>
                    <Tooltip title={t('Profile.Password.sectionTitle')}>
                        <IconButton
                            size="small"
                            onClick={() => setEditing(true)}
                            sx={{
                                display: editing ? 'none' : 'flex',
                                color: 'text.secondary',
                                '&:hover': { color: 'primary.main' },
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Read-only placeholder */}
                <Collapse in={!editing}>
                    <Typography variant="body1" sx={{ mt: 0.5, letterSpacing: 4, color: 'text.secondary' }}>
                        ••••••••
                    </Typography>
                </Collapse>

                {/* Edit form */}
                <Collapse in={editing}>
                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label={t('Profile.Password.currentLabel')}
                            type={showCurrent ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            size="small"
                            fullWidth
                            autoFocus
                            required
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setShowCurrent((p) => !p)} edge="end">
                                                {showCurrent ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <TextField
                            label={t('Profile.Password.newLabel')}
                            type={showNew ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            size="small"
                            fullWidth
                            required
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setShowNew((p) => !p)} edge="end">
                                                {showNew ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <TextField
                            label={t('Profile.Password.confirmLabel')}
                            type={showConfirm ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            size="small"
                            fullWidth
                            required
                            error={mismatch}
                            helperText={mismatch ? t('Profile.Password.mismatch') : undefined}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setShowConfirm((p) => !p)} edge="end">
                                                {showConfirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="small"
                                disabled={isPending || !currentPassword || !newPassword || !confirmPassword || mismatch}
                                sx={{ whiteSpace: 'nowrap', minWidth: 130 }}
                            >
                                {isPending
                                    ? <CircularProgress size={18} color="inherit" />
                                    : t('Profile.Password.submitButton')}
                            </Button>
                            <Button
                                variant="text"
                                size="small"
                                onClick={handleCancel}
                                disabled={isPending}
                            >
                                {t('Common.cancel')}
                            </Button>
                        </Box>
                    </Box>
                </Collapse>
            </Paper>

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

export default ChangePasswordForm;
