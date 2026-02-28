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
import EditIcon from '@mui/icons-material/Edit';
import { useUpdateProfileMutation } from '../hooks/useProfile';

interface UpdateUsernameFormProps {
    currentUsername: string;
}

export const UpdateUsernameForm: React.FC<UpdateUsernameFormProps> = ({ currentUsername }) => {
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

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            updateProfile(username, {
                onSuccess: (res) => {
                    setSnackbar({ open: true, message: res.message ?? t('Profile.Username.successMessage'), severity: 'success' });
                },
                onError: (err: unknown) => {
                    const msg =
                        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                        t('Profile.Username.errorMessage');
                    setSnackbar({ open: true, message: msg, severity: 'error' });
                },
            });
        },
        [updateProfile, username],
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <EditIcon fontSize="small" sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle1" fontWeight={700}>
                        {t('Profile.Username.sectionTitle')}
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <TextField
                        label={t('Profile.Username.fieldLabel')}
                        value={username}
                        onChange={handleChange}
                        size="small"
                        fullWidth
                        inputProps={{ minLength: 3, maxLength: 50 }}
                        helperText={t('Profile.Username.helperText')}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isPending || username === currentUsername}
                        sx={{ whiteSpace: 'nowrap', minWidth: 110 }}
                    >
                        {isPending ? <CircularProgress size={20} color="inherit" /> : t('Profile.Username.submitButton')}
                    </Button>
                </Box>
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
