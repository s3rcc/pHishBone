import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import unauthorizedSvg from '@/assets/images/errors/401.svg';

/**
 * CSS filter that converts black SVG → cyan/teal to match the dark aquarium theme.
 */
const SVG_THEME_FILTER =
    'invert(1) sepia(1) saturate(5) hue-rotate(175deg) brightness(0.85)';

export function UnauthorizedPage(): React.JSX.Element {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - 64px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Animated background orbs */}
            <Box
                sx={{
                    position: 'absolute',
                    width: 600,
                    height: 600,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0,188,212,0.10) 0%, transparent 70%)',
                    top: '-15%',
                    right: '-8%',
                    pointerEvents: 'none',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(29,233,182,0.07) 0%, transparent 70%)',
                    bottom: '5%',
                    left: '-8%',
                    pointerEvents: 'none',
                }}
            />

            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <Stack alignItems="center" spacing={3}>
                    {/* SVG illustration */}
                    <Box
                        component="img"
                        src={unauthorizedSvg}
                        alt="401"
                        sx={{
                            width: { xs: 220, sm: 300, md: 360 },
                            height: 'auto',
                            filter: SVG_THEME_FILTER,
                            opacity: 0.9,
                            userSelect: 'none',
                            pointerEvents: 'none',
                        }}
                    />

                    <Typography variant="h4" fontWeight={700} color="text.primary">
                        {t('Errors.Unauthorized.title')}
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ maxWidth: 400, lineHeight: 1.7 }}
                    >
                        {t('Errors.Unauthorized.subtitle')}
                    </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate({ to: '/login' })}
                            sx={{
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                                background: 'linear-gradient(135deg, #00BCD4, #1DE9B6)',
                                boxShadow: '0 8px 32px rgba(0,188,212,0.35)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #0097A7, #00BFA5)',
                                    boxShadow: '0 12px 40px rgba(0,188,212,0.5)',
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.25s ease',
                            }}
                        >
                            {t('Errors.Unauthorized.loginButton')}
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate({ to: '/' })}
                            sx={{
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                                borderColor: 'rgba(0,188,212,0.5)',
                                color: 'primary.light',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    backgroundColor: 'rgba(0,188,212,0.08)',
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.25s ease',
                            }}
                        >
                            {t('Errors.goHome')}
                        </Button>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}

export default UnauthorizedPage;
