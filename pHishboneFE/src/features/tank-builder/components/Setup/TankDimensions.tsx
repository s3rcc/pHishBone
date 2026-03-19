import React from 'react';
import { Box, TextField, Typography, InputAdornment } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useTankStore } from '../../store/useTankStore';

export const TankDimensions: React.FC = () => {
    const { t } = useTranslation('TankBuilder');
    const dimensions = useTankStore((state) => state.dimensions);
    const setDimensions = useTankStore((state) => state.setDimensions);
    const volumeLiters = useTankStore((state) => state.getVolumeLiters());

    const handleDimensionChange = (field: keyof typeof dimensions) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val) && val > 0) {
            setDimensions({ [field]: val });
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                <TextField
                    label={t('length', 'Length')}
                    type="number"
                    value={dimensions.length}
                    onChange={handleDimensionChange('length')}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                    }}
                    sx={{ flex: '1 1 120px' }}
                />
                <TextField
                    label={t('width', 'Width')}
                    type="number"
                    value={dimensions.width}
                    onChange={handleDimensionChange('width')}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                    }}
                    sx={{ flex: '1 1 120px' }}
                />
                <TextField
                    label={t('height', 'Height')}
                    type="number"
                    value={dimensions.height}
                    onChange={handleDimensionChange('height')}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                    }}
                    sx={{ flex: '1 1 120px' }}
                />
            </Box>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    {t('totalVolume', 'Total Estimated Volume:')}
                </Typography>
                <Typography variant="h6" color="primary">
                    {volumeLiters.toFixed(1)} {t('liters', 'Liters')}
                </Typography>
            </Box>
        </Box>
    );
};
