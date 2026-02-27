import React from 'react';
import Avatar from '@mui/material/Avatar';
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

export const ProfilePage: React.FC = () => {
    const user = useCurrentUser();

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
                            My Profile
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage your account settings
                        </Typography>
                    </Box>
                </Box>

                {/* ── User Summary Banner ──────────────────────────────── */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2.5,
                        mb: 4,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        background: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'rgba(0,188,212,0.06)'
                                : 'rgba(0,188,212,0.04)',
                    }}
                >
                    <Avatar
                        src={user.avatarUrl ?? undefined}
                        alt={user.username}
                        sx={{
                            width: 56,
                            height: 56,
                            bgcolor: 'primary.main',
                            fontWeight: 700,
                            fontSize: '1.5rem',
                            boxShadow: '0 4px 14px rgba(0,188,212,0.3)',
                        }}
                    >
                        {!user.avatarUrl && user.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                            {user.username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {user.email}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                bgcolor: 'primary.main',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '0.65rem',
                                textTransform: 'uppercase',
                            }}
                        >
                            {user.role}
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

                    {/* Right column: email settings + divider + role info */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={3}>
                            <ChangeEmailForm />

                            <Divider />

                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                    ACCOUNT INFO
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Role:</strong>&nbsp;{user.role}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    <strong>User ID:</strong>&nbsp;
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
