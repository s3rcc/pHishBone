import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCurrentUser } from '../../auth';
import { ChangeEmailForm } from './ChangeEmailForm';
import { ChangePasswordForm } from './ChangePasswordForm';
import { UpdateUsernameForm } from './UpdateUsernameForm';
import { UploadAvatarCard } from './UploadAvatarCard';

export const ProfileSettingsSection: React.FC = () => {
    const user = useCurrentUser();
    const { t } = useTranslation();

    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={3}>
                    <UploadAvatarCard
                        currentUsername={user.username}
                        currentAvatarUrl={user.avatarUrl}
                    />
                    <UpdateUsernameForm currentUsername={user.username} />
                </Stack>
            </Grid>

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
    );
};

export default ProfileSettingsSection;
