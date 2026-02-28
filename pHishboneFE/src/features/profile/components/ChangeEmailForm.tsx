import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import EmailIcon from '@mui/icons-material/Email';
import InfoIcon from '@mui/icons-material/Info';
import { useChangeEmailMutation } from '../hooks/useProfile';

export const ChangeEmailForm: React.FC = () => {
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

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            changeEmail(newEmail, {
                onSuccess: (res) => {
                    // Backend returns a confirmation message, not an updated user
                    setSnackbar({
                        open: true,
                        message: res.message ?? t('Profile.Email.successMessage'),
                        severity: 'info',
                    });
                    setNewEmail('');
                },
                onError: (err: unknown) => {
                    const msg =
                        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                        t('Profile.Email.errorMessage');
                    setSnackbar({ open: true, message: msg, severity: 'error' });
                },
            });
        },
        [changeEmail, newEmail],
    );

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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <EmailIcon fontSize="small" sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle1" fontWeight={700}>
                        {t('Profile.Email.sectionTitle')}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2 }}>
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
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isPending || !newEmail}
                        sx={{ whiteSpace: 'nowrap', minWidth: 110 }}
                    >
                        {isPending ? <CircularProgress size={20} color="inherit" /> : t('Profile.Email.submitButton')}
                    </Button>
                </Box>
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
