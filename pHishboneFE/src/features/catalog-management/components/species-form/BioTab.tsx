import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { SpeciesFormValues, WaterType } from '../../types';

export const BioTab: React.FC = () => {
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
            {/* Environment */}
            <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                letterSpacing={0.6}
                sx={{ textTransform: 'uppercase', mb: 2, display: 'block' }}
            >
                {t('Catalog.form.sectionWater')}
            </Typography>
            <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 3 }}>
                    <TextField
                        {...register('phMin', { required: true, valueAsNumber: true })}
                        label={t('Catalog.form.fieldPhMin')}
                        type="number"
                        size="small"
                        fullWidth
                        error={!!errors.phMin}
                        inputProps={{ id: 'field-phMin', step: '0.1', min: 0, max: 14 }}
                    />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                    <TextField
                        {...register('phMax', { required: true, valueAsNumber: true })}
                        label={t('Catalog.form.fieldPhMax')}
                        type="number"
                        size="small"
                        fullWidth
                        error={!!errors.phMax}
                        inputProps={{ id: 'field-phMax', step: '0.1', min: 0, max: 14 }}
                    />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                    <TextField
                        {...register('tempMin', { required: true, valueAsNumber: true })}
                        label={t('Catalog.form.fieldTempMin')}
                        type="number"
                        size="small"
                        fullWidth
                        error={!!errors.tempMin}
                        inputProps={{ id: 'field-tempMin' }}
                    />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                    <TextField
                        {...register('tempMax', { required: true, valueAsNumber: true })}
                        label={t('Catalog.form.fieldTempMax')}
                        type="number"
                        size="small"
                        fullWidth
                        error={!!errors.tempMax}
                        inputProps={{ id: 'field-tempMax' }}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        {...register('minTankVolume', { required: true, valueAsNumber: true })}
                        label={t('Catalog.form.fieldMinTankVolume')}
                        type="number"
                        size="small"
                        fullWidth
                        error={!!errors.minTankVolume}
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

            <Divider sx={{ my: 3 }} />

            {/* Profile */}
            <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                letterSpacing={0.6}
                sx={{ textTransform: 'uppercase', mb: 2, display: 'block' }}
            >
                {t('Catalog.form.sectionPhysical')}
            </Typography>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        {...register('adultSize', { required: true, valueAsNumber: true })}
                        label={t('Catalog.form.fieldAdultSize')}
                        type="number"
                        size="small"
                        fullWidth
                        error={!!errors.adultSize}
                        inputProps={{ id: 'field-adultSize', step: '0.1', min: 0 }}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        {...register('bioLoadFactor', { required: true, valueAsNumber: true })}
                        label={t('Catalog.form.fieldBioLoad')}
                        type="number"
                        size="small"
                        fullWidth
                        error={!!errors.bioLoadFactor}
                        helperText={t('Catalog.Species.bioLoadHelperText')}
                        inputProps={{ id: 'field-bioLoadFactor', step: '0.1', min: 0 }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default BioTab;
