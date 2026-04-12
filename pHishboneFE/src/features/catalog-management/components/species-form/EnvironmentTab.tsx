import React, { useCallback } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { SpeciesFormValues, WaterType } from '../../types';

// ─── Range slider + synced inputs ─────────────────────────────────────────────

interface RangeSliderFieldProps {
    nameMin: 'phMin' | 'tempMin';
    nameMax: 'phMax' | 'tempMax';
    labelMin: string;
    labelMax: string;
    rangeLabel: string;
    min: number;
    max: number;
    step: number;
}

const RangeSliderField: React.FC<RangeSliderFieldProps> = ({
    nameMin,
    nameMax,
    labelMin,
    labelMax,
    rangeLabel,
    min,
    max,
    step,
}) => {
    const { control, formState: { errors } } = useFormContext<SpeciesFormValues>();
    const { field: fieldMin } = useController({ name: nameMin, control });
    const { field: fieldMax } = useController({ name: nameMax, control });

    const handleSliderChange = useCallback(
        (_: Event, newValue: number | number[]) => {
            if (Array.isArray(newValue)) {
                fieldMin.onChange(newValue[0]);
                fieldMax.onChange(newValue[1]);
            }
        },
        [fieldMin, fieldMax],
    );

    const handleMinInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) fieldMin.onChange(val);
        },
        [fieldMin],
    );

    const handleMaxInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) fieldMax.onChange(val);
        },
        [fieldMax],
    );

    const minError = errors[nameMin];
    const maxError = errors[nameMax];

    return (
        <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                {rangeLabel}
            </Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 3 }}>
                    <TextField
                        label={labelMin}
                        type="number"
                        size="small"
                        fullWidth
                        value={fieldMin.value}
                        onChange={handleMinInput}
                        error={!!minError}
                        helperText={minError?.message as string}
                        inputProps={{ id: `field-${nameMin}`, step, min, max }}
                    />
                </Grid>
                <Grid size={{ xs: 6 }}>
                    <Slider
                        value={[Number(fieldMin.value), Number(fieldMax.value)]}
                        onChange={handleSliderChange}
                        min={min}
                        max={max}
                        step={step}
                        valueLabelDisplay="auto"
                        disableSwap
                        sx={{ mx: 1 }}
                    />
                </Grid>
                <Grid size={{ xs: 3 }}>
                    <TextField
                        label={labelMax}
                        type="number"
                        size="small"
                        fullWidth
                        value={fieldMax.value}
                        onChange={handleMaxInput}
                        error={!!maxError}
                        helperText={maxError?.message as string}
                        inputProps={{ id: `field-${nameMax}`, step, min, max }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export const EnvironmentTab: React.FC = () => {
    const { t } = useTranslation();
    const {
        register,
        formState: { errors },
    } = useFormContext<SpeciesFormValues>();

    const waterTypes: { value: WaterType; label: string }[] = [
        { value: 0, label: t('Catalog.waterType.0') },
        { value: 1, label: t('Catalog.waterType.1') },
        { value: 2, label: t('Catalog.waterType.2') },
    ];

    return (
        <Box sx={{ pt: 2 }}>
            <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                letterSpacing={0.6}
                sx={{ textTransform: 'uppercase', mb: 2, display: 'block' }}
            >
                {t('Catalog.form.sectionWater')}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* pH Range */}
                <RangeSliderField
                    nameMin="phMin"
                    nameMax="phMax"
                    labelMin={t('Catalog.form.fieldPhMin')}
                    labelMax={t('Catalog.form.fieldPhMax')}
                    rangeLabel={t('Catalog.form.phRange')}
                    min={0}
                    max={14}
                    step={0.1}
                />

                {/* Temperature Range */}
                <RangeSliderField
                    nameMin="tempMin"
                    nameMax="tempMax"
                    labelMin={t('Catalog.form.fieldTempMin')}
                    labelMax={t('Catalog.form.fieldTempMax')}
                    rangeLabel={t('Catalog.form.tempRange')}
                    min={0}
                    max={50}
                    step={1}
                />

                {/* Min Tank Volume + Water Type */}
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            {...register('minTankVolume', { required: true, valueAsNumber: true })}
                            label={t('Catalog.form.fieldMinTankVolume')}
                            type="number"
                            size="small"
                            fullWidth
                            error={!!errors.minTankVolume}
                            helperText={errors.minTankVolume?.message as string}
                            inputProps={{ id: 'field-minTankVolume', min: 0 }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            {...register('waterType', { valueAsNumber: true })}
                            select
                            label={t('Catalog.form.fieldWaterType')}
                            size="small"
                            fullWidth
                            defaultValue={0}
                            inputProps={{ id: 'field-waterType' }}
                        >
                            {waterTypes.map(({ value, label }) => (
                                <MenuItem key={value} value={value}>
                                    {label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default EnvironmentTab;
