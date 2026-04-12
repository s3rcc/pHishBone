import { useCallback } from 'react';
import type { ChangeEvent, ReactElement } from 'react';
import { InputAdornment, Stack, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { TankDimensions, TankSceneDimensionsProps } from '../../types';

const numberInputSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 3,
    },
};

export function TankDimensionInputs({
    dimensions,
    onSetDimensions,
}: TankSceneDimensionsProps): ReactElement {
    const { t } = useTranslation();

    const handleInputChange = useCallback(
        (field: keyof TankDimensions) => (event: ChangeEvent<HTMLInputElement>) => {
            const nextValue = Number(event.target.value);

            if (Number.isFinite(nextValue) && nextValue > 0) {
                onSetDimensions({ [field]: nextValue });
            }
        },
        [onSetDimensions],
    );

    return (
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
            <TextField
                label={t('TankBuilder.length')}
                value={dimensions.length}
                type="number"
                onChange={handleInputChange('length')}
                InputProps={{
                    endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                }}
                sx={numberInputSx}
            />
            <TextField
                label={t('TankBuilder.width')}
                value={dimensions.width}
                type="number"
                onChange={handleInputChange('width')}
                InputProps={{
                    endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                }}
                sx={numberInputSx}
            />
            <TextField
                label={t('TankBuilder.height')}
                value={dimensions.height}
                type="number"
                onChange={handleInputChange('height')}
                InputProps={{
                    endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                }}
                sx={numberInputSx}
            />
        </Stack>
    );
}

export default TankDimensionInputs;
