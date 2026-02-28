import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useCurrentUser } from '../../auth';
import { UpdateUsernameForm } from './UpdateUsernameForm';
import { UploadAvatarCard } from './UploadAvatarCard';
import { ChangeEmailForm } from './ChangeEmailForm';
import { ChangePasswordForm } from './ChangePasswordForm';

export const ProfilePage: React.FC = () => {
    const user = useCurrentUser();
    const { t } = useTranslation();

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
            {/* Background decorative orbs */}
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

            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                {/* ── Page Header ─────────────────────────────────────── */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                    <AccountCircleIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                    <Box>
                        <Typography variant="h5" fontWeight={800} letterSpacing="-0.5px">
                            {t('Profile.pageTitle')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('Profile.pageSubtitle')}
                        </Typography>
                    </Box>
                </Box>

                {/* ── Settings Sections ────────────────────────────────── */}
                <Grid container spacing={3}>
                    {/* Left column: avatar + username */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={3}>
                            <UploadAvatarCard
                                currentUsername={user.username}
                                currentAvatarUrl={user.avatarUrl}
                            />
                            <UpdateUsernameForm currentUsername={user.username} />
                        </Stack>
                    </Grid>

                    {/* Right column: email + password + account info */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={3}>
                            <ChangeEmailForm currentEmail={user.email} />
                            <ChangePasswordForm />

                            <Divider />

                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                    {t('Profile.accountInfo')}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>{t('Profile.roleLabel')}</strong>&nbsp;{user.role}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    <strong>{t('Profile.userIdLabel')}</strong>&nbsp;
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'text.secondary' }}
                                    >
                                        {user.id}
                                    </Typography>
                                </Typography>
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default ProfilePage;
