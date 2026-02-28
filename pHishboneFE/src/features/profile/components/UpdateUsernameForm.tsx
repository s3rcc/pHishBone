import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import { useUpdateProfileMutation } from '../hooks/useProfile';

interface UpdateUsernameFormProps {
    currentUsername: string;
}

export const UpdateUsernameForm: React.FC<UpdateUsernameFormProps> = ({ currentUsername }) => {
    const [editing, setEditing] = useState(false);
    const [username, setUsername] = useState(currentUsername);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const { mutate: updateProfile, isPending } = useUpdateProfileMutation();
    const { t } = useTranslation();

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    }, []);

    const handleCloseSnackbar = useCallback(() => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    }, []);

    const handleCancel = useCallback(() => {
        setUsername(currentUsername);
        setEditing(false);
    }, [currentUsername]);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            updateProfile(username, {
                onSuccess: (res) => {
                    setSnackbar({ open: true, message: res.message ?? t('Profile.Username.successMessage'), severity: 'success' });
                    setEditing(false);
                },
                onError: (err: unknown) => {
                    const msg =
                        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                        t('Profile.Username.errorMessage');
                    setSnackbar({ open: true, message: msg, severity: 'error' });
                },
            });
        },
        [updateProfile, username, t],
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
                    <PersonIcon fontSize="small" sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle1" fontWeight={700} sx={{ flexGrow: 1 }}>
                        {t('Profile.Username.sectionTitle')}
                    </Typography>
                    <Tooltip title={editing ? '' : t('Common.save')}>
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

                {/* Read-only display */}
                <Collapse in={!editing}>
                    <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5, color: 'text.primary' }}>
                        {currentUsername}
                    </Typography>
                </Collapse>

                {/* Editable form */}
                <Collapse in={editing}>
                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <TextField
                            label={t('Profile.Username.fieldLabel')}
                            value={username}
                            onChange={handleChange}
                            size="small"
                            fullWidth
                            autoFocus
                            inputProps={{ minLength: 3, maxLength: 50 }}
                            helperText={t('Profile.Username.helperText')}
                        />
                        <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="small"
                                disabled={isPending || username === currentUsername}
                                sx={{ whiteSpace: 'nowrap', minWidth: 80 }}
                            >
                                {isPending ? <CircularProgress size={18} color="inherit" /> : t('Profile.Username.submitButton')}
                            </Button>
                            <Button
                                variant="text"
                                size="small"
                                onClick={handleCancel}
                                disabled={isPending}
                                sx={{ whiteSpace: 'nowrap' }}
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

export default UpdateUsernameForm;
