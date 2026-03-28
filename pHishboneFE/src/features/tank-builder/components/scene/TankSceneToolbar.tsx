import type { ReactElement } from 'react';
import { Box, Chip, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import ThreeDRotationRoundedIcon from '@mui/icons-material/ThreeDRotationRounded';
import ViewInArRoundedIcon from '@mui/icons-material/ViewInArRounded';
import ViewWeekRoundedIcon from '@mui/icons-material/ViewWeekRounded';
import { useTranslation } from 'react-i18next';
import type { TankSceneToolbarProps, TankSceneViewMode } from '../../types';

export function TankSceneToolbar({
    viewMode,
    volumeLiters,
    onChangeViewMode,
}: TankSceneToolbarProps): ReactElement {
    const { t } = useTranslation();

    const handleViewMode = (_event: React.MouseEvent<HTMLElement>, nextMode: TankSceneViewMode | null): void => {
        if (nextMode) {
            onChangeViewMode(nextMode);
        }
    };

    return (
        <Stack
            direction={{ xs: 'column', xl: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', xl: 'center' }}
            spacing={1.5}
            sx={{ mb: 2.5 }}
        >
            <Box>
                <Typography variant="h5" fontWeight={800}>
                    {t('TankBuilder.sceneTitle')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {t('TankBuilder.sceneSubtitle')}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                    {t('TankBuilder.sceneInteractionHint')}
                </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <Chip
                    icon={<ThreeDRotationRoundedIcon />}
                    label={`${volumeLiters.toFixed(1)} ${t('TankBuilder.liters')}`}
                    color="primary"
                    variant="outlined"
                />

                <ToggleButtonGroup
                    color="primary"
                    exclusive
                    value={viewMode}
                    onChange={handleViewMode}
                    size="small"
                    sx={{
                        '& .MuiToggleButton-root': {
                            borderRadius: 999,
                            px: 1.5,
                            py: 0.75,
                        },
                    }}
                >
                    <ToggleButton value="3d">
                        <ViewInArRoundedIcon sx={{ mr: 0.75 }} fontSize="small" />
                        {t('TankBuilder.view3d')}
                    </ToggleButton>
                    <ToggleButton value="2d">
                        <ViewWeekRoundedIcon sx={{ mr: 0.75 }} fontSize="small" />
                        {t('TankBuilder.view2d')}
                    </ToggleButton>
                </ToggleButtonGroup>
            </Stack>
        </Stack>
    );
}

export default TankSceneToolbar;
