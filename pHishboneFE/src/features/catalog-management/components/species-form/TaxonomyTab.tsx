import React, { Suspense, useCallback } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { SuspenseLoader } from '../../../../components/layout/SuspenseLoader';
import { useMuiSnackbar } from '../../../../hooks/useMuiSnackbar';
import { useCreateType, useTypesList } from '../../hooks/useCatalog';
import type { SpeciesFormValues, SpeciesTypeDto } from '../../types';

// ─── Creatable Type Autocomplete ──────────────────────────────────────────────

interface TypeOption extends SpeciesTypeDto {
    inputValue?: string;
    isNew?: boolean;
}

const typeFilter = createFilterOptions<TypeOption>();

function TypeAutocompleteInner() {
    const { t } = useTranslation();
    const { showSnackbar } = useMuiSnackbar();
    const { control, formState: { errors } } = useFormContext<SpeciesFormValues>();
    const { field } = useController({ name: 'typeId', control, rules: { required: t('Catalog.form.required', { field: t('Catalog.form.fieldType') }) } });

    const { data: types } = useTypesList();
    const { mutateAsync: createType, isPending: isCreatingType } = useCreateType();

    const typeOptions: TypeOption[] = (types ?? []).map((tp) => ({ ...tp }));
    const selectedOption = typeOptions.find((tp) => tp.id === field.value) ?? null;

    const handleChange = useCallback(
        async (_: React.SyntheticEvent, newValue: TypeOption | string | null) => {
            if (typeof newValue === 'string') return;
            if (!newValue) {
                field.onChange('');
                return;
            }

            if (newValue.isNew && newValue.inputValue) {
                try {
                    const created = await createType({ name: newValue.inputValue });
                    field.onChange(created.id);
                    showSnackbar(t('Catalog.Species.typeCreated', { name: created.name }), 'success');
                } catch {
                    showSnackbar(t('Catalog.form.errorUnexpected'), 'error');
                }
                return;
            }

            field.onChange(newValue.id);
        },
        [field, createType, showSnackbar, t],
    );

    return (
        <Autocomplete<TypeOption, false, false, true>
            freeSolo
            id="field-typeId"
            options={typeOptions}
            value={selectedOption}
            onChange={handleChange}
            getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                if (option.isNew) return option.inputValue ?? '';
                return option.name;
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            filterOptions={(options, params) => {
                const filtered = typeFilter(options, params);
                const { inputValue } = params;
                const exists = options.some((o) => o.name.toLowerCase() === inputValue.toLowerCase());
                if (inputValue !== '' && !exists) {
                    filtered.push({
                        inputValue,
                        isNew: true,
                        id: '',
                        name: t('Catalog.form.addType', { name: inputValue }),
                        createdTime: '',
                    });
                }
                return filtered;
            }}
            renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                    <Box component="li" key={key} {...rest} sx={{ fontStyle: option.isNew ? 'italic' : 'normal' }}>
                        {option.isNew ? t('Catalog.form.addType', { name: option.inputValue }) : option.name}
                    </Box>
                );
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={t('Catalog.form.fieldType')}
                    size="small"
                    error={!!errors.typeId}
                    helperText={errors.typeId?.message as string}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {isCreatingType ? <CircularProgress size={18} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
            loading={isCreatingType}
            size="small"
        />
    );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

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
                        <TypeAutocompleteInner />
                    </Suspense>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TaxonomyTab;
