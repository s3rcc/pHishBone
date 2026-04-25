import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ScienceIcon from '@mui/icons-material/Science';
import ShieldIcon from '@mui/icons-material/Shield';
import FilterNoneIcon from '@mui/icons-material/FilterNone';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';

import landingBackground from '../assets/images/landing-background.png';

export default function HomePage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const year = new Date().getFullYear();

    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - 64px)',
                bgcolor: 'background.default',
            }}
        >
            {/* HERO SECTION */}
            <Box
                sx={{
                    position: 'relative',
                    pt: { xs: 8, md: 12 },
                    pb: { xs: 10, md: 20 },
                    px: { xs: 2, md: 4 },
                    overflow: 'hidden',
                }}
            >
                {/* Background Image */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url(${landingBackground})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'top center',
                        backgroundRepeat: 'no-repeat',
                        zIndex: 0,
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '40%',
                            background: (theme) =>
                                `linear-gradient(to bottom, ${theme.palette.background.default}cc 0%, transparent 100%)`,
                            zIndex: 1,
                        },
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '70%',
                            background: (theme) =>
                                `linear-gradient(to top, ${theme.palette.background.default} 0%, ${theme.palette.background.default}e6 20%, transparent 100%)`,
                            zIndex: 1,
                        },
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                    <Grid container spacing={{ xs: 6, lg: 8 }} alignItems="center">
                        {/* LEFT COLUMN */}
                        <Grid size={{ xs: 12, md: 7, lg: 6 }}>
                            {/* Badge */}
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 1.5,
                                    py: 0.5,
                                    mb: 4,
                                    borderRadius: '16px',
                                    border: (theme) => `1px solid ${theme.palette.primary.main}33`,
                                    backgroundColor: (theme) => `${theme.palette.primary.main}0d`,
                                    backdropFilter: 'blur(4px)',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        bgcolor: 'primary.main',
                                        boxShadow: (theme) => `0 0 8px ${theme.palette.primary.main}`,
                                    }}
                                />
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'primary.main',
                                        fontWeight: 600,
                                        letterSpacing: 0.5,
                                        textTransform: 'uppercase',
                                        fontSize: '0.65rem',
                                    }}
                                >
                                    {t('Home.badge')}
                                </Typography>
                            </Box>

                            {/* Headline */}
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '3rem', md: '4rem', lg: '4.5rem' },
                                    fontWeight: 700,
                                    lineHeight: 1.1,
                                    letterSpacing: '-1.5px',
                                    mb: 3,
                                    color: 'text.primary',
                                }}
                            >
                                {t('Home.headline').split('\n')[0]}
                                <br />
                                <Box component="span" sx={{ color: 'primary.main' }}>
                                    {t('Home.headline').split('\n')[1]}
                                </Box>
                            </Typography>

                            {/* Subtitle */}
                            <Typography
                                sx={{
                                    mb: 5,
                                    color: 'text.secondary',
                                    fontSize: '1.125rem',
                                    lineHeight: 1.6,
                                    fontWeight: 400,
                                    maxWidth: 480,
                                }}
                            >
                                {t('Home.subtitle')}
                            </Typography>

                            {/* CTAs */}
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate({ to: '/tank-builder' })}
                                    endIcon={<ArrowForwardIcon sx={{ ml: 0.5, fontSize: 18 }} />}
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '0.95rem',
                                        boxShadow: (theme) => `0 8px 24px ${theme.palette.primary.main}40`,
                                        '&:hover': {
                                            boxShadow: (theme) => `0 12px 32px ${theme.palette.primary.main}66`,
                                        },
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    {t('Home.ctaStart')}
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => navigate({ to: '/explore' })}
                                    startIcon={<ScienceIcon sx={{ fontSize: 20 }} />}
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '0.95rem',
                                        backgroundColor: (theme) => `${theme.palette.background.paper}33`,
                                        backdropFilter: 'blur(10px)',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    {t('Home.ctaExplore')}
                                </Button>
                            </Stack>
                        </Grid>

                        {/* RIGHT COLUMN – SYSTEM VALIDATION CARD */}
                        <Grid
                            size={{ xs: 12, md: 5, lg: 6 }}
                            sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}
                        >
                            <Card
                                sx={{
                                    width: '100%',
                                    maxWidth: 440,
                                    backgroundColor: (theme) => `${theme.palette.background.paper}b3`,
                                    backdropFilter: 'blur(16px)',
                                    border: (theme) => `1px solid ${theme.palette.divider}`,
                                    borderRadius: '16px',
                                    p: 3,
                                    pt: 3.5,
                                    boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                    <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '1rem' }}>
                                        {t('Home.systemValidation')}
                                    </Typography>
                                    <VerifiedUserIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                                </Box>

                                <Stack spacing={3.5}>
                                    {/* Validation 1 */}
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Box
                                            sx={{
                                                mt: 0.5,
                                                bgcolor: (theme) => `${theme.palette.primary.main}1a`,
                                                p: 1,
                                                borderRadius: '50%',
                                                width: 36,
                                                height: 36,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <ScienceIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                                        </Box>
                                        <Box>
                                            <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.9rem', mb: 0.5 }}>
                                                {t('Home.validation1Title')}
                                            </Typography>
                                            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                                {t('Home.validation1Desc')}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Validation 2 */}
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Box
                                            sx={{
                                                mt: 0.5,
                                                bgcolor: (theme) => `${theme.palette.secondary.main}1a`,
                                                p: 1,
                                                borderRadius: '50%',
                                                width: 36,
                                                height: 36,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <ShieldIcon sx={{ color: 'secondary.main', fontSize: 18 }} />
                                        </Box>
                                        <Box>
                                            <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.9rem', mb: 0.5 }}>
                                                {t('Home.validation2Title')}
                                            </Typography>
                                            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                                {t('Home.validation2Desc')}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Validation 3 – Community Sharing */}
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Box
                                            sx={{
                                                mt: 0.5,
                                                bgcolor: 'rgba(255, 138, 101, 0.12)',
                                                p: 1,
                                                borderRadius: '50%',
                                                width: 36,
                                                height: 36,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <ShareRoundedIcon sx={{ color: '#ff8a65', fontSize: 18 }} />
                                        </Box>
                                        <Box>
                                            <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.9rem', mb: 0.5 }}>
                                                {t('Home.validation3Title')}
                                            </Typography>
                                            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                                {t('Home.validation3Desc')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Stack>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* ENGINE LOGIC SECTION */}
            <Box sx={{ px: { xs: 2, md: 4 }, pb: 10 }}>
                <Container maxWidth="lg">
                    {/* Section Header */}
                    <Box sx={{ mb: 6, pl: { xs: 0, md: 2 } }}>
                        <Typography
                            variant="h3"
                            sx={{
                                color: 'text.primary',
                                fontSize: { xs: '2rem', md: '2.5rem' },
                                fontWeight: 700,
                                mb: 2,
                            }}
                        >
                            {t('Home.engineLogicTitle')}
                        </Typography>
                        <Typography
                            sx={{
                                color: 'text.secondary',
                                fontSize: '1.05rem',
                                maxWidth: 640,
                                lineHeight: 1.6,
                            }}
                        >
                            {t('Home.engineLogicSubtitle')}
                        </Typography>
                    </Box>

                    {/* Cards Row */}
                    <Grid container spacing={4}>
                        {/* Bio-Load Card */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card
                                sx={{
                                    height: '100%',
                                    bgcolor: (theme) => `${theme.palette.background.paper}80`,
                                    border: (theme) => `1px solid ${theme.palette.divider}`,
                                    borderRadius: '16px',
                                    p: 4,
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <Box
                                    sx={{
                                        bgcolor: (theme) => `${theme.palette.primary.main}1a`,
                                        width: 44,
                                        height: 44,
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 3,
                                    }}
                                >
                                    <ScienceIcon sx={{ color: 'primary.main' }} />
                                </Box>
                                <Typography sx={{ color: 'text.primary', fontSize: '1.25rem', fontWeight: 600, mb: 1.5 }}>
                                    {t('Home.feature1Title')}
                                </Typography>
                                <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.6, mb: 4, flexGrow: 1 }}>
                                    {t('Home.feature1Desc')}
                                </Typography>
                                <Box
                                    sx={{
                                        bgcolor: (theme) => `${theme.palette.background.default}80`,
                                        p: 1.5,
                                        borderRadius: '8px',
                                        border: (theme) => `1px solid ${theme.palette.divider}`,
                                    }}
                                >
                                    <Typography sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.8rem', textAlign: 'center' }}>
                                        {t('Home.feature1Formula')}
                                    </Typography>
                                </Box>
                            </Card>
                        </Grid>

                        {/* Environmental Intersect Card */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card
                                sx={{
                                    height: '100%',
                                    bgcolor: (theme) => `${theme.palette.background.paper}80`,
                                    border: (theme) => `1px solid ${theme.palette.divider}`,
                                    borderRadius: '16px',
                                    p: 4,
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <Box
                                    sx={{
                                        bgcolor: (theme) => `${theme.palette.secondary.main}1a`,
                                        width: 44,
                                        height: 44,
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 3,
                                    }}
                                >
                                    <FilterNoneIcon sx={{ color: 'secondary.main' }} />
                                </Box>
                                <Typography sx={{ color: 'text.primary', fontSize: '1.25rem', fontWeight: 600, mb: 1.5 }}>
                                    {t('Home.feature2Title')}
                                </Typography>
                                <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.6, mb: 4, flexGrow: 1 }}>
                                    {t('Home.feature2Desc')}
                                </Typography>
                                {/* Visual Slider Representation */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ height: 4, bgcolor: 'secondary.main', borderRadius: 2, width: '40%' }} />
                                    <Box sx={{ height: 4, bgcolor: 'primary.main', borderRadius: 2, width: '30%' }} />
                                    <Box sx={{ height: 4, bgcolor: 'divider', borderRadius: 2, flexGrow: 1 }} />
                                    <Typography sx={{ color: 'text.disabled', fontSize: '0.65rem', ml: 1, textTransform: 'uppercase' }}>
                                        {t('Home.feature2SliderLabel')}
                                    </Typography>
                                </Box>
                            </Card>
                        </Grid>

                        {/* Tag-Based Engine Card */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card
                                sx={{
                                    height: '100%',
                                    bgcolor: (theme) => `${theme.palette.background.paper}80`,
                                    border: (theme) => `1px solid ${theme.palette.divider}`,
                                    borderRadius: '16px',
                                    p: 4,
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <Box
                                    sx={{
                                        bgcolor: 'rgba(255, 138, 101, 0.12)',
                                        width: 44,
                                        height: 44,
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 3,
                                    }}
                                >
                                    <LocalOfferIcon sx={{ color: '#ff8a65' }} />
                                </Box>
                                <Typography sx={{ color: 'text.primary', fontSize: '1.25rem', fontWeight: 600, mb: 1.5 }}>
                                    {t('Home.feature3Title')}
                                </Typography>
                                <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.6, mb: 4, flexGrow: 1 }}>
                                    {t('Home.feature3Desc')}
                                </Typography>
                                {/* Tag Badges */}
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Box
                                        sx={{
                                            border: (theme) => `1px solid ${theme.palette.primary.main}4d`,
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: '4px',
                                        }}
                                    >
                                        <Typography sx={{ color: 'primary.main', fontSize: '0.75rem' }}>
                                            {t('Home.feature3Tag1')}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            border: (theme) => `1px solid ${theme.palette.divider}`,
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: '4px',
                                        }}
                                    >
                                        <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                                            {t('Home.feature3Tag2')}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* FOOTER */}
            <Box
                sx={{
                    borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                    py: 4,
                    px: { xs: 2, md: 4 },
                }}
            >
                <Container
                    maxWidth="lg"
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'center', md: 'center' },
                        gap: 3,
                    }}
                >
                    <Typography sx={{ color: 'text.primary', fontWeight: 800, fontSize: '1.25rem' }}>
                        {t('Home.footerBrand')}
                    </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, md: 4 }} alignItems="center">
                        {([
                            t('Home.footerPrivacy'),
                            t('Home.footerTerms'),
                            t('Home.footerApi'),
                            t('Home.footerContact'),
                        ] as string[]).map((text) => (
                            <Typography
                                key={text}
                                sx={{
                                    color: 'text.disabled',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    letterSpacing: 0.5,
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    transition: 'color 0.2s ease',
                                    '&:hover': { color: 'text.primary' },
                                }}
                            >
                                {text}
                            </Typography>
                        ))}
                    </Stack>

                    <Typography sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>
                        {t('Home.footerCopyright', { year })}
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
}
