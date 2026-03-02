import React, { Suspense } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { SuspenseLoader } from '../../../../components/layout/SuspenseLoader';
import { useTypesList } from '../../hooks/useCatalog';
import type { SpeciesFormValues } from '../../types';

function TypeSelectInner() {
    const { t } = useTranslation();
    const { data: types } = useTypesList();
    const {
        register,
        formState: { errors },
    } = useFormContext<SpeciesFormValues>();

    return (
        <TextField
            {...register('typeId', { required: t('Catalog.form.required', { field: t('Catalog.form.fieldType') }) })}
            select
            label={t('Catalog.form.fieldType')}
            size="small"
            fullWidth
            error={!!errors.typeId}
            helperText={errors.typeId?.message}
            defaultValue=""
        >
            {types.map((tp) => (
                <MenuItem key={tp.id} value={tp.id}>
                    {tp.name}
                </MenuItem>
            ))}
        </TextField>
    );
}

export const TaxonomyTab: React.FC = () => {
    const { t } = useTranslation();
    const {
        register,
        formState: { errors },
    } = useFormContext<SpeciesFormValues>();

    return (
        <Box sx={{ pt: 2 }}>
            <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                letterSpacing={0.6}
                sx={{ textTransform: 'uppercase', mb: 2, display: 'block' }}
            >
                {t('Catalog.form.sectionIdentity')}
            </Typography>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        {...register('commonName', {
                            required: t('Catalog.form.required', { field: t('Catalog.form.fieldCommonName') }),
                        })}
                        label={t('Catalog.form.fieldCommonName')}
                        size="small"
                        fullWidth
                        error={!!errors.commonName}
                        helperText={errors.commonName?.message}
                        inputProps={{ id: 'field-commonName' }}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        {...register('scientificName', {
                            required: t('Catalog.form.required', { field: t('Catalog.form.fieldScientificName') }),
                        })}
                        label={t('Catalog.form.fieldScientificName')}
                        size="small"
                        fullWidth
                        error={!!errors.scientificName}
                        helperText={errors.scientificName?.message ?? t('Catalog.Species.scientificNameHint')}
                        inputProps={{
                            id: 'field-scientificName',
                            style: { fontStyle: 'italic' },
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Suspense fallback={<SuspenseLoader />}>
                        <TypeSelectInner />
                    </Suspense>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        {...register('thumbnailUrl')}
                        label={t('Catalog.form.fieldThumbnailUrl')}
                        size="small"
                        fullWidth
                        placeholder={t('Catalog.Species.thumbnailUrlPlaceholder')}
                        inputProps={{ id: 'field-thumbnailUrl' }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default TaxonomyTab;
