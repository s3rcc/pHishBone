import { useCallback, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useLoginMutation } from '../hooks/useAuth';
import type { LoginRequestDto } from '../types';

export function LoginForm() {
    const navigate = useNavigate();
    const { mutate: login, isPending } = useLoginMutation();

    const [form, setForm] = useState<LoginRequestDto>({ email: '', password: '' });
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({ open: false, message: '', severity: 'success' });

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        },
        [],
    );

    const handleCloseSnackbar = useCallback(() => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    }, []);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            login(form, {
                onSuccess: (response) => {
                    setSnackbar({ open: true, message: response.message ?? 'Login successful!', severity: 'success' });
                    setTimeout(() => navigate({ to: '/' }), 800);
                },
                onError: (error: unknown) => {
                    const msg =
                        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                        'Login failed. Please try again.';
                    setSnackbar({ open: true, message: msg, severity: 'error' });
                },
            });
        },
        [login, form, navigate],
    );

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
            }}
        >
            <Grid container justifyContent="center">
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                    <Paper elevation={4} sx={{ p: { xs: 3, md: 5 } }}>
                        <Typography variant="h4" gutterBottom sx={{ mb: 1 }}>
                            Welcome back 👋
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Sign in to your pHishbone account
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                fullWidth
                                autoComplete="email"
                            />
                            <TextField
                                label="Password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                fullWidth
                                autoComplete="current-password"
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={isPending}
                                fullWidth
                                sx={{ mt: 1 }}
                            >
                                {isPending ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
                            </Button>
                        </Box>

                        <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }} color="text.secondary">
                            Don't have an account?{' '}
                            <Button variant="text" size="small" onClick={() => navigate({ to: '/register' })}>
                                Register
                            </Button>
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

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
        </Box>
    );
}

export default LoginForm;
