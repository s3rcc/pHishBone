import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { DietType, SpeciesFormValues, SwimLevel } from '../../types';

export const BehaviorTab: React.FC = () => {
    const { t } = useTranslation();
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<SpeciesFormValues>();

    const isSchooling = useWatch({ control, name: 'isSchooling' });

    const swimLevels: { value: SwimLevel; label: string }[] = [
        { value: 0, label: t('Catalog.swimLevel.0') },
        { value: 1, label: t('Catalog.swimLevel.1') },
        { value: 2, label: t('Catalog.swimLevel.2') },
        { value: 3, label: t('Catalog.swimLevel.3') },
    ];

    const dietTypes: { value: DietType; label: string }[] = [
        { value: 0, label: t('Catalog.dietType.0') },
        { value: 1, label: t('Catalog.dietType.1') },
        { value: 2, label: t('Catalog.dietType.2') },
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
                {t('Catalog.form.sectionBehavior')}
            </Typography>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        {...register('swimLevel', { valueAsNumber: true })}
                        select
                        label={t('Catalog.form.fieldSwimLevel')}
                        size="small"
                        fullWidth
                        defaultValue={1}
                        inputProps={{ id: 'field-swimLevel' }}
                    >
                        {swimLevels.map(({ value, label }) => (
                            <MenuItem key={value} value={value}>
                                {label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        {...register('dietType', { valueAsNumber: true })}
                        select
                        label={t('Catalog.form.fieldDietType')}
                        size="small"
                        fullWidth
                        defaultValue={2}
                        inputProps={{ id: 'field-dietType' }}
                    >
                        {dietTypes.map(({ value, label }) => (
                            <MenuItem key={value} value={value}>
                                {label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        {...register('preferredFood')}
                        label={t('Catalog.form.fieldPreferredFood')}
                        size="small"
                        fullWidth
                        placeholder={t('Catalog.Species.preferredFoodPlaceholder')}
                        inputProps={{ id: 'field-preferredFood' }}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        {...register('origin')}
                        label={t('Catalog.form.fieldOrigin')}
                        size="small"
                        fullWidth
                        placeholder={t('Catalog.Species.originPlaceholder')}
                        inputProps={{ id: 'field-origin' }}
                    />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                {...register('isSchooling')}
                                size="small"
                                id="field-isSchooling"
                            />
                        }
                        label={
                            <Typography variant="body2">
                                {t('Catalog.Species.schoolingLabel')}
                            </Typography>
                        }
                    />
                </Grid>

                {isSchooling && (
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            {...register('minGroupSize', { valueAsNumber: true, min: 2 })}
                            label={t('Catalog.form.fieldMinGroupSize')}
                            type="number"
                            size="small"
                            fullWidth
                            error={!!errors.minGroupSize}
                            helperText={errors.minGroupSize ? t('Catalog.Species.minGroupSizeError') : undefined}
                            inputProps={{ id: 'field-minGroupSize', min: 2 }}
                        />
                    </Grid>
                )}

                <Grid size={{ xs: 12 }}>
                    <TextField
                        {...register('description')}
                        label={t('Catalog.form.fieldDescription')}
                        size="small"
                        fullWidth
                        multiline
                        minRows={3}
                        placeholder={t('Catalog.Species.descriptionPlaceholder')}
                        inputProps={{ id: 'field-description' }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default BehaviorTab;
