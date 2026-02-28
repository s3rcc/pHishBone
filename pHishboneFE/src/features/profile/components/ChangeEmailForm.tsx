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
import EmailIcon from '@mui/icons-material/Email';
import InfoIcon from '@mui/icons-material/Info';
import { useChangeEmailMutation } from '../hooks/useProfile';

interface ChangeEmailFormProps {
    currentEmail: string;
}

export const ChangeEmailForm: React.FC<ChangeEmailFormProps> = ({ currentEmail }) => {
    const [editing, setEditing] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const { mutate: changeEmail, isPending } = useChangeEmailMutation();
    const { t } = useTranslation();

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setNewEmail(e.target.value);
    }, []);

    const handleCloseSnackbar = useCallback(() => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    }, []);

    const handleCancel = useCallback(() => {
        setNewEmail('');
        setEditing(false);
    }, []);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            changeEmail(newEmail, {
                onSuccess: (res) => {
                    const msg = (res as { message?: string })?.message ?? t('Profile.Email.successMessage');
                    setSnackbar({ open: true, message: msg, severity: 'info' });
                    setNewEmail('');
                    setEditing(false);
                },
                onError: (err: unknown) => {
                    const msg =
                        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                        t('Profile.Email.errorMessage');
                    setSnackbar({ open: true, message: msg, severity: 'error' });
                },
            });
        },
        [changeEmail, newEmail, t],
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: editing ? 1 : 0 }}>
                    <EmailIcon fontSize="small" sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle1" fontWeight={700} sx={{ flexGrow: 1 }}>
                        {t('Profile.Email.sectionTitle')}
                    </Typography>
                    <Tooltip title={t('Profile.Email.sectionTitle')}>
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
                        {currentEmail}
                    </Typography>
                </Collapse>

                {/* Editable form */}
                <Collapse in={editing}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5, mt: 0.5 }}>
                        <InfoIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                            {t('Profile.Email.hint')}
                        </Typography>
                    </Box>
                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <TextField
                            label={t('Profile.Email.fieldLabel')}
                            type="email"
                            value={newEmail}
                            onChange={handleChange}
                            size="small"
                            fullWidth
                            autoFocus
                            required
                        />
                        <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="small"
                                disabled={isPending || !newEmail}
                                sx={{ whiteSpace: 'nowrap', minWidth: 90 }}
                            >
                                {isPending ? <CircularProgress size={18} color="inherit" /> : t('Profile.Email.submitButton')}
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
                autoHideDuration={6000}
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

export default ChangeEmailForm;
