import type { ReactElement } from 'react';
import { Box, Chip, Stack, Switch, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import ThreeDRotationRoundedIcon from '@mui/icons-material/ThreeDRotationRounded';
import ViewInArRoundedIcon from '@mui/icons-material/ViewInArRounded';
import ViewWeekRoundedIcon from '@mui/icons-material/ViewWeekRounded';
import BubbleChartRoundedIcon from '@mui/icons-material/BubbleChartRounded';
import { useTranslation } from 'react-i18next';
import type { TankSceneToolbarProps, TankSceneViewMode } from '../../types';

export function TankSceneToolbar({
    viewMode,
    volumeLiters,
    showSceneBubbles,
    onChangeViewMode,
    onToggleSceneBubbles,
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

                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                        px: 1.25,
                        py: 0.35,
                        borderRadius: 999,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                    }}
                >
                    <BubbleChartRoundedIcon color="primary" fontSize="small" />
                    <Typography variant="caption" fontWeight={700}>
                        {t('TankBuilder.bubbles')}
                    </Typography>
                    <Switch
                        size="small"
                        checked={showSceneBubbles}
                        onChange={(event) => onToggleSceneBubbles(event.target.checked)}
                        inputProps={{ 'aria-label': t('TankBuilder.toggleBubbles') }}
                    />
                </Stack>
            </Stack>
        </Stack>
    );
}

export default TankSceneToolbar;
