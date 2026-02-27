import { Suspense, useCallback } from 'react';
import { useNavigate, Outlet } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import WavesIcon from '@mui/icons-material/Waves';
import { ErrorBoundary } from '../ErrorBoundary';
import { useCurrentUser, useLogout, AUTH_ME_KEY, authApi } from '../../features/auth';
import { useThemeMode } from '../../context/ThemeContext';


// ─── Auth-aware nav section (wrapped in its own Suspense) ───────────────────
function NavAuthSection() {
    const user = useCurrentUser();
    const { mutate: logout, isPending } = useLogout();
    const navigate = useNavigate();

    const handleLogout = useCallback(() => {
        logout(undefined, {
            onSuccess: () => navigate({ to: '/' }),
        });
    }, [logout, navigate]);

    if (user) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                    onClick={() => navigate({ to: '/profile' })}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        borderRadius: 2,
                        px: 0.75,
                        py: 0.25,
                        '&:hover': { bgcolor: 'action.hover' },
                        transition: 'background 0.2s',
                    }}
                >
                    <Avatar
                        src={user.avatarUrl ?? undefined}
                        alt={user.username}
                        sx={{
                            width: 34,
                            height: 34,
                            bgcolor: 'primary.main',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                        }}
                    >
                        {!user.avatarUrl && user.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600} sx={{ display: { xs: 'none', sm: 'block' } }}>
                        {user.username}
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={handleLogout}
                    disabled={isPending}
                    sx={{ ml: 0.5 }}
                >
                    Logout
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="text" onClick={() => navigate({ to: '/login' })}>
                Login
            </Button>
            <Button variant="contained" onClick={() => navigate({ to: '/register' })}>
                Register
            </Button>
        </Box>
    );
}

// ─── Main Layout ─────────────────────────────────────────────────────────────
export function MainLayout() {
    const navigate = useNavigate();
    const { mode, toggleTheme } = useThemeMode();

    // Non-suspending observer used solely to derive a resetKey for ErrorBoundary.
    // When the user logs in and invalidateQueries refetches /me successfully,
    // `isAuthenticated` flips from false → true, which changes resetKey and
    // forces the ErrorBoundary to reset its hasError state.
    const { data: meData } = useQuery({
        queryKey: AUTH_ME_KEY,
        queryFn: authApi.getMe,
        retry: false,
    });
    const resetKey = meData ? 'auth' : 'guest';
    const isLight = mode === 'light';

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    backdropFilter: 'blur(12px)',
                    backgroundColor: isLight
                        ? 'rgba(240, 250, 252, 0.90)'
                        : 'rgba(13, 33, 55, 0.85)',
                    borderBottom: '1px solid rgba(0, 188, 212, 0.15)',
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ py: 0.5 }}>
                        {/* Logo */}
                        <Box
                            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', flexGrow: 1 }}
                            onClick={() => navigate({ to: '/' })}
                        >
                            <WavesIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                            <Typography
                                variant="h6"
                                fontWeight={800}
                                sx={{
                                    background: 'linear-gradient(90deg, #00BCD4, #1DE9B6)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    letterSpacing: '-0.5px',
                                }}
                            >
                                pHishbone
                            </Typography>
                        </Box>

                        {/* Theme toggle button */}
                        <Tooltip title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}>
                            <IconButton
                                onClick={toggleTheme}
                                size="small"
                                sx={{ mr: 1, color: 'text.primary' }}
                                aria-label="toggle color theme"
                            >
                                {isLight ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                            </IconButton>
                        </Tooltip>

                        {/* Auth section – ErrorBoundary catches 401/network errors and shows unauthenticated UI */}
                        <ErrorBoundary resetKey={resetKey}
                            fallback={
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button variant="text" onClick={() => navigate({ to: '/login' })}>
                                        Login
                                    </Button>
                                    <Button variant="contained" onClick={() => navigate({ to: '/register' })}>
                                        Register
                                    </Button>
                                </Box>
                            }
                        >
                            <Suspense fallback={<Box sx={{ width: 120, height: 36 }} />}>
                                <NavAuthSection />
                            </Suspense>
                        </ErrorBoundary>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Page content */}
            <Box component="main" sx={{ flexGrow: 1 }}>
                <Outlet />
            </Box>
        </Box>
    );
}

export default MainLayout;
