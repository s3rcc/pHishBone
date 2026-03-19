import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface BioLoadGaugeProps {
    capacityPercentage: number;
    isLoading?: boolean;
}

export const BioLoadGauge: React.FC<BioLoadGaugeProps> = ({ capacityPercentage, isLoading }) => {
    const { t } = useTranslation('TankBuilder');

    const getColor = (percent: number) => {
        if (percent <= 80) return 'success';
        if (percent <= 100) return 'warning';
        return 'error';
    };

    const statusTextKey = 
        capacityPercentage <= 80 ? 'statusSafe' : 
        capacityPercentage <= 100 ? 'statusWarning' : 
        'statusOverstocked';

    const defaultStatusText = 
        capacityPercentage <= 80 ? 'Safe Baseline' : 
        capacityPercentage <= 100 ? 'Nearing Capacity' : 
        'Overstocked!';

    // Ensure the progress bar doesn't visually exceed 100% (even if the number goes higher)
    const normalizedProgress = Math.min(Math.max(capacityPercentage, 0), 100);

    return (
        <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                    {t('bioLoadCapacity', 'BioLoad Capacity')}
                </Typography>
                <Typography variant="body2" color={`${getColor(capacityPercentage)}.main`} fontWeight="bold">
                    {t(statusTextKey, defaultStatusText)} ({capacityPercentage.toFixed(1)}%)
                </Typography>
            </Box>
            
            {isLoading ? (
                <LinearProgress />
            ) : (
                <LinearProgress 
                    variant="determinate" 
                    value={normalizedProgress} 
                    color={getColor(capacityPercentage)}
                    sx={{ height: 10, borderRadius: 5 }}
                />
            )}
        </Box>
    );
};
