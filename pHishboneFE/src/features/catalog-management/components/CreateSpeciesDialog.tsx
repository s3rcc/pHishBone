import React, { Suspense, useCallback, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { SuspenseLoader } from '../../../components/layout/SuspenseLoader';
import { useMuiSnackbar } from '../../../hooks/useMuiSnackbar';
import { parseValidationErrors, getValidationSummary } from '../../../lib/parseValidationErrors';
import { useCreateSpecies, useCreateType, useTypesList } from '../hooks/useCatalog';
import type { SpeciesTypeDto } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CreateSpeciesDialogProps {
    open: boolean;
    onClose: () => void;
}

interface TypeOption extends SpeciesTypeDto {
    inputValue?: string;
    isNew?: boolean;
}

const typeFilter = createFilterOptions<TypeOption>();

// ─── Inner form (needs Suspense for useTypesList) ─────────────────────────────

function CreateSpeciesFormInner({ onClose }: { onClose: () => void }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { showSnackbar } = useMuiSnackbar();

    const [commonName, setCommonName] = useState('');
    const [scientificName, setScientificName] = useState('');
    const [selectedType, setSelectedType] = useState<TypeOption | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { data: types } = useTypesList();
    const { mutateAsync: createSpecies, isPending: isCreating } = useCreateSpecies();
    const { mutateAsync: createType, isPending: isCreatingType } = useCreateType();

    const isPending = isCreating || isCreatingType;

    const handleTypeChange = useCallback(
        async (_: React.SyntheticEvent, newValue: TypeOption | string | null) => {
            if (typeof newValue === 'string') return;
            if (!newValue) {
                setSelectedType(null);
                return;
            }

            // User picked "Add 'xxx'" → create the type inline
            if (newValue.isNew && newValue.inputValue) {
                try {
                    const created = await createType({ name: newValue.inputValue });
                    setSelectedType({
                        id: created.id,
                        name: created.name,
                        description: created.description,
                        createdTime: created.createdTime,
                    });
                    showSnackbar(t('Catalog.Species.typeCreated', { name: created.name }), 'success');
                } catch {
                    showSnackbar(t('Catalog.form.errorUnexpected'), 'error');
                }
                return;
            }

            setSelectedType(newValue);
        },
        [createType, showSnackbar, t],
    );

    const handleSubmit = useCallback(async () => {
        // Client-side quick validation
        const newErrors: Record<string, string> = {};
        if (!commonName.trim()) newErrors.commonName = t('Catalog.form.required', { field: t('Catalog.form.fieldCommonName') });
        if (!scientificName.trim()) newErrors.scientificName = t('Catalog.form.required', { field: t('Catalog.form.fieldScientificName') });
        if (!selectedType) newErrors.typeId = t('Catalog.form.required', { field: t('Catalog.form.fieldType') });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        try {
            const result = await createSpecies({
                commonName: commonName.trim(),
                scientificName: scientificName.trim(),
                typeId: selectedType!.id,
                environment: {
                    phMin: 6.5,
                    phMax: 7.5,
                    tempMin: 22,
                    tempMax: 28,
                    minTankVolume: 40,
                    waterType: 0,
                },
                profile: {
                    adultSize: 5,
                    bioLoadFactor: 1,
                    swimLevel: 1,
                    dietType: 2,
                    isSchooling: false,
                    minGroupSize: 0,
                },
                tagIds: [],
            });
            showSnackbar(t('Catalog.Species.draftCreated'), 'success');
            onClose();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            void navigate({ to: '/catalog/species/$id' as any, params: { id: result.id } as any });
        } catch (err: unknown) {
            const fieldErrors = parseValidationErrors(err);
            if (fieldErrors) {
                setErrors(fieldErrors);
            } else {
                showSnackbar(getValidationSummary(err, t('Catalog.form.errorUnexpected')), 'error');
            }
        }
    }, [commonName, scientificName, selectedType, createSpecies, navigate, onClose, showSnackbar, t]);

    const typeOptions: TypeOption[] = (types ?? []).map((tp) => ({ ...tp }));

    return (
        <>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                <TextField
                    label={t('Catalog.form.fieldCommonName')}
                    size="small"
                    fullWidth
                    value={commonName}
                    onChange={(e) => setCommonName(e.target.value)}
                    error={!!errors.commonName}
                    helperText={errors.commonName}
                    autoFocus
                    inputProps={{ id: 'draft-commonName' }}
                />
                <TextField
                    label={t('Catalog.form.fieldScientificName')}
                    size="small"
                    fullWidth
                    value={scientificName}
                    onChange={(e) => setScientificName(e.target.value)}
                    error={!!errors.scientificName}
                    helperText={errors.scientificName}
                    inputProps={{ id: 'draft-scientificName', style: { fontStyle: 'italic' } }}
                />
                <Autocomplete<TypeOption, false, false, true>
                    freeSolo
                    id="draft-typeId"
                    options={typeOptions}
                    value={selectedType}
                    onChange={handleTypeChange}
                    getOptionLabel={(option) => {
                        if (typeof option === 'string') return option;
                        if (option.isNew) return option.inputValue ?? '';
                        return option.name;
                    }}
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
                            helperText={errors.typeId}
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
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button size="small" onClick={onClose} disabled={isPending}>
                    {t('Common.cancel')}
                </Button>
                <Button
                    size="small"
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isPending}
                    sx={{ bgcolor: 'primary.dark', '&:hover': { bgcolor: 'primary.main' }, borderRadius: '4px' }}
                >
                    {isPending ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : t('Catalog.Species.createDraft')}
                </Button>
            </DialogActions>
        </>
    );
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export const CreateSpeciesDialog: React.FC<CreateSpeciesDialogProps> = ({ open, onClose }) => {
    const { t } = useTranslation();
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontSize: '1rem', fontWeight: 600, pb: 0 }}>
                {t('Catalog.Species.createDraftTitle')}
            </DialogTitle>
            <Suspense
                fallback={
                    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                        <SuspenseLoader />
                    </Box>
                }
            >
                <CreateSpeciesFormInner onClose={onClose} />
            </Suspense>
        </Dialog>
    );
};

export default CreateSpeciesDialog;
