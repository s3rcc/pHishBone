import React from 'react';
import { Box, Typography, Alert, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { EnvironmentRangeOverlap } from '../../types';

interface EnvironmentRangeProps {
    overlap: EnvironmentRangeOverlap | null;
    isLoading?: boolean;
}

export const EnvironmentRange: React.FC<EnvironmentRangeProps> = ({ overlap, isLoading }) => {
    const { t } = useTranslation('TankBuilder');

    if (isLoading || !overlap) return null;

    if (!overlap.hasOverlap) {
        return (
            <Alert severity="error" sx={{ mb: 3 }}>
                {t('noEnvironmentOverlap', 'CRITICAL: The selected species require conflicting water parameters (pH/Temperature) and cannot co-exist in the same environment.')}
            </Alert>
        );
    }

    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
                {t('safeRanges', 'Target Environment Ranges')}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Paper sx={{ p: 2, flex: 1, bgcolor: 'background.default', textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">pH</Typography>
                    <Typography variant="h6" color="primary">
                        {overlap.phMin.toFixed(1)} - {overlap.phMax.toFixed(1)}
                    </Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: 1, bgcolor: 'background.default', textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Temp (°C)</Typography>
                    <Typography variant="h6" color="primary">
                        {overlap.tempMin.toFixed(1)} - {overlap.tempMax.toFixed(1)}
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};
