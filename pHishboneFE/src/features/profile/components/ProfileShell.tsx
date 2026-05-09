import React, { useCallback } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCurrentUser } from '../../auth';

interface ProfileShellProps {
    children: React.ReactNode;
}

export const ProfileShell: React.FC<ProfileShellProps> = ({ children }) => {
    const user = useCurrentUser();
    const navigate = useNavigate();
    const routerState = useRouterState();
    const currentPath = routerState.location.pathname;
    const { t } = useTranslation();

    const handleNavigateSettings = useCallback(() => {
        void navigate({ to: '/profile' });
    }, [navigate]);

    const handleNavigateBookmarks = useCallback(() => {
        void navigate({ to: '/profile/bookmarks' });
    }, [navigate]);

    const isSettingsActive = currentPath === '/profile';
    const isBookmarksActive = currentPath.startsWith('/profile/bookmarks');

    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - 64px)',
                py: { xs: 4, md: 6 },
                px: 2,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    width: 500,
                    height: 500,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0,188,212,0.08) 0%, transparent 70%)',
                    top: '-10%',
                    right: '-5%',
                    pointerEvents: 'none',
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Stack spacing={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2.25, md: 3 },
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            background: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? 'linear-gradient(135deg, rgba(0,188,212,0.18) 0%, rgba(12,27,48,0.92) 100%)'
                                    : 'linear-gradient(135deg, rgba(0,188,212,0.10) 0%, rgba(255,255,255,0.94) 100%)',
                            boxShadow: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? '0 18px 40px rgba(0, 0, 0, 0.24)'
                                    : '0 18px 36px rgba(10, 22, 40, 0.08)',
                        }}
                    >
                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            spacing={2.5}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', md: 'center' }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar
                                    src={user.avatarUrl ?? undefined}
                                    alt={user.username}
                                    sx={{
                                        width: 68,
                                        height: 68,
                                        bgcolor: 'primary.main',
                                        color: '#06222B',
                                        fontSize: '1.5rem',
                                        fontWeight: 800,
                                        boxShadow: '0 8px 24px rgba(0, 188, 212, 0.28)',
                                    }}
                                >
                                    {!user.avatarUrl && user.username.charAt(0).toUpperCase()}
                                </Avatar>

                                <Box>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                        <AccountCircleIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                                        <Typography variant="h5" fontWeight={800} letterSpacing="-0.03em">
                                            {t('Profile.pageTitle')}
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {t('Profile.pageSubtitle')}
                                    </Typography>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 1.5 }}>
                                        <Typography variant="body2" fontWeight={700}>
                                            {user.username}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {user.email}
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Stack>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ width: { xs: '100%', md: 'auto' } }}>
                                <Button
                                    variant={isSettingsActive ? 'contained' : 'outlined'}
                                    startIcon={<SettingsIcon />}
                                    onClick={handleNavigateSettings}
                                    sx={{
                                        minWidth: { xs: '100%', sm: 148 },
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 700,
                                    }}
                                >
                                    {t('Profile.navigationSettings')}
                                </Button>
                                <Button
                                    variant={isBookmarksActive ? 'contained' : 'outlined'}
                                    startIcon={<FavoriteRoundedIcon />}
                                    onClick={handleNavigateBookmarks}
                                    sx={{
                                        minWidth: { xs: '100%', sm: 148 },
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 700,
                                    }}
                                >
                                    {t('Profile.navigationBookmarks')}
                                </Button>
                            </Stack>
                        </Stack>
                    </Paper>

                    {children}
                </Stack>
            </Container>
        </Box>
    );
};

export default ProfileShell;
