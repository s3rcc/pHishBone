// Homepage component (exported as default for lazy loading)
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export default function HomePage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - 64px)',
                display: 'flex',
                alignItems: 'center',
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
                    background: 'radial-gradient(circle, rgba(0,188,212,0.12) 0%, transparent 70%)',
                    top: '-10%',
                    right: '-5%',
                    pointerEvents: 'none',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(29,233,182,0.08) 0%, transparent 70%)',
                    bottom: '5%',
                    left: '-5%',
                    pointerEvents: 'none',
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ maxWidth: 720 }}>
                    {/* Badge */}
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.75,
                            px: 2,
                            py: 0.6,
                            mb: 3,
                            borderRadius: 20,
                            border: '1px solid rgba(0,188,212,0.4)',
                            backgroundColor: 'rgba(0,188,212,0.08)',
                        }}
                    >
                        <Box
                            sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#1DE9B6', animation: 'pulse 2s infinite' }}
                        />
                        <Typography variant="caption" color="primary.light" fontWeight={600} letterSpacing={0.8}>
                            {t('Home.badge')}
                        </Typography>
                    </Box>

                    {/* Headline */}
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: '2.5rem', md: '3.75rem', lg: '4.25rem' },
                            fontWeight: 800,
                            lineHeight: 1.1,
                            letterSpacing: '-1.5px',
                            mb: 2.5,
                            background: 'linear-gradient(135deg, #E8F4F8 0%, #00BCD4 50%, #1DE9B6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        {t('Home.headline')}
                    </Typography>

                    {/* Subtitle */}
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ mb: 5, maxWidth: 560, fontWeight: 400, lineHeight: 1.7 }}
                    >
                        {t('Home.subtitle')}
                    </Typography>

                    {/* CTAs */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate({ to: '/' })}
                            sx={{
                                px: 4,
                                py: 1.75,
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
                            {t('Home.ctaStart')}
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate({ to: '/' })}
                            sx={{
                                px: 4,
                                py: 1.75,
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
                            {t('Home.ctaExplore')}
                        </Button>
                    </Stack>

                    {/* Stats row */}
                    <Stack direction="row" spacing={4} sx={{ mt: 6 }}>
                        {([
                            { value: '500+', labelKey: 'Home.statsFishSpecies' },
                            { value: '99%', labelKey: 'Home.statsAccuracy' },
                            { value: '10k+', labelKey: 'Home.statsAquarists' },
                        ] as const).map((stat) => (
                            <Box key={stat.labelKey}>
                                <Typography variant="h5" fontWeight={800} color="primary.light">
                                    {stat.value}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {t(stat.labelKey)}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </Container>

            {/* Keyframe for the pulse animation */}
            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
        </Box>
    );
}
