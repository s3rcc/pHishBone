import { Suspense, useCallback, useRef, useState } from 'react';
import { useNavigate, Outlet } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Toolbar from '@mui/material/Toolbar';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LanguageIcon from '@mui/icons-material/Language';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import WavesIcon from '@mui/icons-material/Waves';

import { ErrorBoundary } from '../ErrorBoundary';
import { useCurrentUser, useLogout, AUTH_ME_KEY, authApi } from '../../features/auth';
import { useThemeMode } from '../../context/ThemeContext';

const LOCALES = ['en', 'vi'] as const;
type Locale = (typeof LOCALES)[number];

// ─── Auth-aware nav section (wrapped in its own Suspense) ───────────────────
function NavAuthSection() {
    const { t, i18n } = useTranslation();
    const user = useCurrentUser();
    const { mutate: logout, isPending } = useLogout();
    const navigate = useNavigate();
    const { mode, toggleTheme } = useThemeMode();

    const anchorRef = useRef<HTMLDivElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const isLight = mode === 'light';

    // Normalise language code — browser may return 'en-US', we only want 'en'
    const current = (i18n.language?.split('-')[0] ?? 'en') as Locale;
    const activeLocale: Locale = LOCALES.includes(current) ? current : 'en';

    const handleMenuOpen = useCallback(() => setMenuOpen(true), []);
    const handleMenuClose = useCallback(() => setMenuOpen(false), []);

    const handleLogout = useCallback(() => {
        handleMenuClose();
        logout(undefined, {
            onSuccess: () => navigate({ to: '/' }),
        });
    }, [logout, navigate, handleMenuClose]);

    const handleNavigateProfile = useCallback(() => {
        handleMenuClose();
        navigate({ to: '/profile' });
    }, [navigate, handleMenuClose]);

    const handleLanguageChange = useCallback(
        (_: React.MouseEvent<HTMLElement>, value: Locale | null) => {
            if (value) i18n.changeLanguage(value);
        },
        [i18n],
    );

    if (user) {
        return (
            <>
                {/* Avatar chip — acts as the dropdown trigger */}
                <Box
                    ref={anchorRef}
                    onClick={handleMenuOpen}
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
                        userSelect: 'none',
                    }}
                    aria-haspopup="true"
                    aria-expanded={menuOpen}
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
                    <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ display: { xs: 'none', sm: 'block' } }}
                    >
                        {user.username}
                    </Typography>
                    <KeyboardArrowDownIcon
                        fontSize="small"
                        sx={{
                            color: 'text.secondary',
                            transition: 'transform 0.2s',
                            transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            display: { xs: 'none', sm: 'block' },
                        }}
                    />
                </Box>

                {/* ── Dropdown Menu ─────────────────────────────────────── */}
                <Menu
                    anchorEl={anchorRef.current}
                    open={menuOpen}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    slotProps={{
                        paper: {
                            elevation: 0,
                            sx: {
                                mt: 1,
                                minWidth: 240,
                                overflow: 'visible',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                backdropFilter: 'blur(12px)',
                                bgcolor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(13,33,55,0.97)'
                                        : 'rgba(250,253,255,0.97)',
                                '&::before': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    right: 18,
                                    width: 10,
                                    height: 10,
                                    bgcolor: 'background.paper',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    borderLeft: '1px solid',
                                    borderTop: '1px solid',
                                    borderColor: 'divider',
                                    zIndex: 0,
                                },
                            },
                        },
                    }}
                >
                    {/* User identity header */}
                    <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                            src={user.avatarUrl ?? undefined}
                            alt={user.username}
                            sx={{
                                width: 40,
                                height: 40,
                                bgcolor: 'primary.main',
                                fontWeight: 700,
                                boxShadow: '0 2px 8px rgba(0,188,212,0.35)',
                            }}
                        >
                            {!user.avatarUrl && user.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight={700} noWrap>
                                {user.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {user.email}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider />

                    {/* Settings */}
                    <MenuItem onClick={handleNavigateProfile} sx={{ py: 1.25 }}>
                        <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={t('Navigation.settings')} />
                    </MenuItem>

                    {/* Appearance — theme toggle */}
                    <MenuItem
                        onClick={toggleTheme}
                        sx={{ py: 1.25 }}
                        disableRipple={false}
                    >
                        <ListItemIcon>
                            {isLight ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText
                            primary={t('Navigation.appearance')}
                            secondary={isLight ? t('Navigation.lightMode') : t('Navigation.darkMode')}
                            secondaryTypographyProps={{ variant: 'caption' }}
                        />
                        <Switch
                            checked={!isLight}
                            size="small"
                            onClick={(e) => e.stopPropagation()}
                            onChange={toggleTheme}
                            color="primary"
                            sx={{ ml: 1 }}
                        />
                    </MenuItem>

                    {/* Language toggle */}
                    <MenuItem disableRipple sx={{ py: 1.25, '&:hover': { bgcolor: 'transparent' } }}>
                        <ListItemIcon>
                            <LanguageIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={t('Navigation.language')} />
                        <Tooltip title={t('Navigation.switchLanguage')}>
                            <ToggleButtonGroup
                                value={activeLocale}
                                exclusive
                                onChange={handleLanguageChange}
                                size="small"
                                onClick={(e) => e.stopPropagation()}
                                sx={{
                                    height: 28,
                                    border: '1px solid rgba(0, 188, 212, 0.3)',
                                    borderRadius: 1.5,
                                    overflow: 'hidden',
                                    '& .MuiToggleButtonGroup-grouped': {
                                        border: 'none',
                                        borderRadius: 0,
                                        px: 1.25,
                                        py: 0.5,
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        letterSpacing: 0.5,
                                        color: 'text.secondary',
                                        '&.Mui-selected': {
                                            color: 'primary.light',
                                            bgcolor: 'rgba(0, 188, 212, 0.15)',
                                        },
                                        '&:hover': {
                                            bgcolor: 'rgba(0, 188, 212, 0.08)',
                                        },
                                    },
                                }}
                            >
                                <ToggleButton value="en">EN</ToggleButton>
                                <ToggleButton value="vi">VI</ToggleButton>
                            </ToggleButtonGroup>
                        </Tooltip>
                    </MenuItem>

                    <Divider />

                    {/* Logout */}
                    <MenuItem
                        onClick={handleLogout}
                        disabled={isPending}
                        sx={{
                            py: 1.25,
                            color: 'error.main',
                            '& .MuiListItemIcon-root': { color: 'error.main' },
                            '&:hover': { bgcolor: 'error.main', color: '#fff', '& .MuiListItemIcon-root': { color: '#fff' } },
                            transition: 'all 0.15s',
                        }}
                    >
                        <ListItemIcon>
                            <LogoutIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={t('Navigation.logout')} />
                    </MenuItem>
                </Menu>
            </>
        );
    }

    return (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </Box>
            <Button variant="contained" onClick={() => navigate({ to: '/register' })} sx={{ bgcolor: '#00d4ff', color: '#000', fontWeight: 600, px: 3, borderRadius: '4px', textTransform: 'none', '&:hover': { bgcolor: '#33ddff' } }}>
                Get Started
            </Button>
        </Box>
    );
}

// ─── Main Layout ─────────────────────────────────────────────────────────────
export function MainLayout() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Non-suspending observer used solely to derive a resetKey for ErrorBoundary.
    const { data: meData } = useQuery({
        queryKey: AUTH_ME_KEY,
        queryFn: authApi.getMe,
        retry: false,
    });
    const resetKey = meData ? 'auth' : 'guest';
    const { mode } = useThemeMode();
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
                            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', mr: 4 }}
                            onClick={() => navigate({ to: '/' })}
                        >
                            <WavesIcon sx={{ color: '#00d4ff', fontSize: 28 }} />
                            <Typography
                                variant="h6"
                                fontWeight={800}
                                sx={{
                                    color: '#fff',
                                    letterSpacing: '-0.5px',
                                }}
                            >
                                AquaScaper
                            </Typography>
                        </Box>

                        {/* DESKTOP NAVIGATION LINKS */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, flexGrow: 1, alignItems: 'center' }}>
                            <Typography onClick={() => navigate({ to: '/explore' })} sx={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#00d4ff', borderBottom: '2px solid #00d4ff', pb: 0.5 }}>
                                Catalog
                            </Typography>
                            {['Algorithms', 'Community', 'Pro'].map((item) => (
                                <Typography key={item} sx={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
                                    {item}
                                </Typography>
                            ))}
                        </Box>

                        {/* Auth section – ErrorBoundary catches 401/network errors and shows unauthenticated UI */}
                        <ErrorBoundary
                            resetKey={resetKey}
                            fallback={
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button variant="text" onClick={() => navigate({ to: '/login' })}>
                                        {t('Navigation.login')}
                                    </Button>
                                    <Button variant="contained" onClick={() => navigate({ to: '/register' })}>
                                        {t('Navigation.register')}
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
