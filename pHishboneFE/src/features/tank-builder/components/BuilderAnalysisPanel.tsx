import {
    Alert,
    Box,
    Chip,
    Divider,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import type { ReactElement } from 'react';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import WaterRoundedIcon from '@mui/icons-material/WaterRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useTranslation } from 'react-i18next';
import type { AlertColor } from '@mui/material/Alert';
import type { AnalysisSeverity, TankAnalysisReportDto } from '../types';

interface BuilderAnalysisPanelProps {
    analysis: TankAnalysisReportDto | undefined;
    isFetching: boolean;
    hasInventory: boolean;
}

function mapSeverityToAlert(severity: AnalysisSeverity): AlertColor {
    switch (severity) {
        case 2:
        case 'Danger':
            return 'error';
        case 1:
        case 'Warning':
            return 'warning';
        default:
            return 'info';
    }
}

function getCapacityTone(capacityPercentage: number): 'success' | 'warning' | 'error' {
    if (capacityPercentage > 100) {
        return 'error';
    }

    if (capacityPercentage >= 80) {
        return 'warning';
    }

    return 'success';
}

export function BuilderAnalysisPanel({
    analysis,
    isFetching,
    hasInventory,
}: BuilderAnalysisPanelProps): ReactElement {
    const { t } = useTranslation();

    return (
        <Paper
            sx={{
                p: 2.5,
                height: '100%',
                borderRadius: 4,
                border: '1px solid rgba(0, 188, 212, 0.15)',
                background: (theme) =>
                    theme.palette.mode === 'dark'
                        ? 'linear-gradient(180deg, rgba(7, 21, 35, 0.95), rgba(11, 31, 50, 0.95))'
                        : 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,252,255,0.98))',
                backdropFilter: 'blur(12px)',
            }}
        >
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={800}>
                    {t('TankBuilder.analysisTitle')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {t('TankBuilder.analysisSubtitle')}
                </Typography>
            </Box>

            {!hasInventory ? (
                <Box
                    sx={{
                        px: 2,
                        py: 4,
                        borderRadius: 3,
                        border: '1px dashed',
                        borderColor: 'divider',
                        textAlign: 'center',
                        color: 'text.secondary',
                    }}
                >
                    <Typography variant="body2">{t('TankBuilder.addSpeciesToAnalyze')}</Typography>
                </Box>
            ) : null}

            {hasInventory && isFetching && !analysis ? (
                <LinearProgress sx={{ borderRadius: 99, mb: 2 }} />
            ) : null}

            {hasInventory && analysis ? (
                <Stack spacing={2.25}>
                    <Stack spacing={1.25}>
                        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'background.default' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <WaterRoundedIcon color="primary" fontSize="small" />
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        {t('TankBuilder.volumeCard')}
                                    </Typography>
                                </Stack>
                                <Chip label={`${analysis.volumeLiters.toFixed(1)} L`} size="small" />
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                                {analysis.volumeGallons.toFixed(1)} gal
                            </Typography>
                        </Paper>

                        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'background.default' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <BoltRoundedIcon color="primary" fontSize="small" />
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        {t('TankBuilder.bioLoadCapacity')}
                                    </Typography>
                                </Stack>
                                <Chip
                                    label={`${analysis.capacityPercentage.toFixed(1)}%`}
                                    size="small"
                                    color={getCapacityTone(analysis.capacityPercentage)}
                                />
                            </Stack>

                            <LinearProgress
                                variant="determinate"
                                value={Math.min(analysis.capacityPercentage, 100)}
                                color={getCapacityTone(analysis.capacityPercentage)}
                                sx={{ mb: 1.25, height: 9, borderRadius: 99 }}
                            />

                            <Typography variant="body2" color="text.secondary">
                                {t('TankBuilder.totalBioLoad')}: {analysis.totalBioLoad.toFixed(1)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('TankBuilder.requiredVolume')}: {analysis.requiredVolumeLiters} L
                            </Typography>
                        </Paper>
                    </Stack>

                    <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                            {t('TankBuilder.environmentWindow')}
                        </Typography>

                        {analysis.phRange ? (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                                pH: {analysis.phRange.min.toFixed(1)} - {analysis.phRange.max.toFixed(1)}
                            </Typography>
                        ) : null}

                        {analysis.tempRange ? (
                            <Typography variant="body2" color="text.secondary">
                                Temp: {analysis.tempRange.min} - {analysis.tempRange.max} C
                            </Typography>
                        ) : null}

                        {!analysis.phRange && !analysis.tempRange ? (
                            <Typography variant="body2" color="text.secondary">
                                {t('TankBuilder.noEnvironmentOverlap')}
                            </Typography>
                        ) : null}
                    </Paper>

                    <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'background.default' }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                            <WarningAmberRoundedIcon color="warning" fontSize="small" />
                            <Typography variant="subtitle2" fontWeight={700}>
                                {t('TankBuilder.compatibilityIssues')}
                            </Typography>
                        </Stack>

                        {analysis.alerts.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                {t('TankBuilder.noAlerts')}
                            </Typography>
                        ) : (
                            <Stack spacing={1}>
                                {analysis.alerts.map((alert, index) => (
                                    <Alert key={`${alert.code}-${index}`} severity={mapSeverityToAlert(alert.severity)}>
                                        {alert.message}
                                    </Alert>
                                ))}
                            </Stack>
                        )}
                    </Paper>

                    <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                            {t('TankBuilder.speciesBreakdown')}
                        </Typography>

                        <List disablePadding>
                            {analysis.bioLoadItems.map((item, index) => (
                                <Box key={item.speciesId}>
                                    <ListItem disableGutters sx={{ py: 0.75 }}>
                                        <ListItemText
                                            primary={item.speciesName}
                                            secondary={`${item.quantity} x ${item.adultSize} cm x ${item.bioLoadFactor}`}
                                            primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
                                            secondaryTypographyProps={{ variant: 'caption' }}
                                        />
                                        <Chip label={item.bioLoad.toFixed(1)} size="small" />
                                    </ListItem>
                                    {index < analysis.bioLoadItems.length - 1 ? <Divider /> : null}
                                </Box>
                            ))}
                        </List>
                    </Paper>
                </Stack>
            ) : null}
        </Paper>
    );
}

export default BuilderAnalysisPanel;
