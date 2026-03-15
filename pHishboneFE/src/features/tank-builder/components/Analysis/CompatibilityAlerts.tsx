import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { CompatibilityAlert } from '../../types';

interface CompatibilityAlertsProps {
    alerts: CompatibilityAlert[];
    isLoading?: boolean;
}

export const CompatibilityAlerts: React.FC<CompatibilityAlertsProps> = ({ alerts, isLoading }) => {
    const { t } = useTranslation('TankBuilder');

    if (isLoading || alerts.length === 0) return null;

    return (
        <Box>
            <Typography variant="subtitle2" gutterBottom>
                {t('compatibilityIssues', 'Compatibility Alerts')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {alerts.map((alert, idx) => (
                    <Alert key={idx} severity={alert.severity}>
                        {alert.message}
                    </Alert>
                ))}
            </Box>
        </Box>
    );
};
