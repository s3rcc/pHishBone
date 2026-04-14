import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { SuspenseLoader } from '../../../../components/layout/SuspenseLoader';
import { useMuiSnackbar } from '../../../../hooks/useMuiSnackbar';
import { getValidationSummary } from '../../../../lib/parseValidationErrors';
import { useAvailableAiModels, useGenerateFishInformation } from '../../hooks/useCatalog';
import type { AiGeneratedSpeciesDraftDto } from '../../types';

interface GenerateSpeciesContentDialogProps {
    open: boolean;
    speciesId: string;
    initialFishName: string;
    onClose: () => void;
    onGeneratedDraft: (draft: AiGeneratedSpeciesDraftDto) => void;
}

interface GenerateSpeciesContentDialogInnerProps {
    speciesId: string;
    initialFishName: string;
    onClose: () => void;
    onGeneratedDraft: (draft: AiGeneratedSpeciesDraftDto) => void;
}

function GenerateSpeciesContentDialogInner({
    speciesId,
    initialFishName,
    onClose,
    onGeneratedDraft,
}: GenerateSpeciesContentDialogInnerProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { showSnackbar } = useMuiSnackbar();
    const { data: availableModels } = useAvailableAiModels();
    const { mutateAsync: generateFishInformation, isPending } = useGenerateFishInformation();
    const [fishName, setFishName] = useState(initialFishName);
    const [selectedModelId, setSelectedModelId] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);

    const modelOptions = useMemo(() => availableModels ?? [], [availableModels]);
    const hasModels = modelOptions.length > 0;

    useEffect(() => {
        setFishName(initialFishName);
        setSubmitError(null);
    }, [initialFishName]);

    useEffect(() => {
        if (!selectedModelId && modelOptions.length > 0) {
            setSelectedModelId(modelOptions[0].id);
        }
    }, [modelOptions, selectedModelId]);

    const handleGenerate = useCallback(async () => {
        if (!fishName.trim()) {
            setSubmitError(t('Catalog.AiGeneration.fishNameRequired'));
            return;
        }

        if (!selectedModelId) {
            setSubmitError(t('Catalog.AiGeneration.modelRequired'));
            return;
        }

        setSubmitError(null);

        try {
            const response = await generateFishInformation({
                fishName: fishName.trim(),
                modelConfigId: selectedModelId,
            });

            if (response.generatedDraft) {
                onGeneratedDraft(response.generatedDraft);
                showSnackbar(t('Catalog.AiGeneration.success'), 'success');
                onClose();
                return;
            }

            if (response.existingSpecies) {
                if (response.existingSpecies.id === speciesId) {
                    setSubmitError(t('Catalog.AiGeneration.currentSpeciesMatched'));
                    return;
                }

                showSnackbar(
                    t('Catalog.AiGeneration.existingSpeciesFound', { name: response.existingSpecies.commonName }),
                    'info',
                );
                onClose();
                void navigate({
                    to: '/catalog/species/$id' as any,
                    params: { id: response.existingSpecies.id } as any,
                });
                return;
            }

            setSubmitError(t('Catalog.AiGeneration.emptyResult'));
        } catch (error: unknown) {
            setSubmitError(getValidationSummary(error, t('Catalog.AiGeneration.errorUnexpected')));
        }
    }, [fishName, generateFishInformation, navigate, onClose, onGeneratedDraft, selectedModelId, showSnackbar, speciesId, t]);

    return (
        <>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    {t('Catalog.AiGeneration.description')}
                </Typography>

                {submitError && <Alert severity="error">{submitError}</Alert>}

                {!hasModels && (
                    <Alert severity="warning">
                        {t('Catalog.AiGeneration.noModels')}
                    </Alert>
                )}

                <TextField
                    label={t('Catalog.AiGeneration.fishNameLabel')}
                    size="small"
                    fullWidth
                    value={fishName}
                    onChange={(event) => setFishName(event.target.value)}
                    helperText={t('Catalog.AiGeneration.fishNameHelper')}
                    disabled={isPending}
                    inputProps={{ id: 'generate-species-fish-name' }}
                />

                <TextField
                    select
                    label={t('Catalog.AiGeneration.modelLabel')}
                    size="small"
                    fullWidth
                    value={selectedModelId}
                    onChange={(event) => setSelectedModelId(event.target.value)}
                    disabled={isPending || !hasModels}
                    inputProps={{ id: 'generate-species-model' }}
                >
                    {modelOptions.map((model) => (
                        <MenuItem key={model.id} value={model.id}>
                            {`${model.displayName} (${model.providerModelId})`}
                        </MenuItem>
                    ))}
                </TextField>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button size="small" onClick={onClose} disabled={isPending}>
                    {t('Common.cancel')}
                </Button>
                <Button
                    size="small"
                    variant="contained"
                    onClick={() => void handleGenerate()}
                    disabled={isPending || !hasModels}
                    sx={{ bgcolor: 'primary.dark', '&:hover': { bgcolor: 'primary.main' }, borderRadius: '4px' }}
                >
                    {isPending ? (
                        <CircularProgress size={18} sx={{ color: 'inherit' }} />
                    ) : (
                        t('Catalog.AiGeneration.generate')
                    )}
                </Button>
            </DialogActions>
        </>
    );
}

export const GenerateSpeciesContentDialog: React.FC<GenerateSpeciesContentDialogProps> = ({
    open,
    speciesId,
    initialFishName,
    onClose,
    onGeneratedDraft,
}) => {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontSize: '1rem', fontWeight: 600, pb: 0 }}>
                {t('Catalog.AiGeneration.title')}
            </DialogTitle>
            <Suspense
                fallback={
                    <DialogContent>
                        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                            <SuspenseLoader />
                        </Box>
                    </DialogContent>
                }
            >
                <GenerateSpeciesContentDialogInner
                    speciesId={speciesId}
                    initialFishName={initialFishName}
                    onClose={onClose}
                    onGeneratedDraft={onGeneratedDraft}
                />
            </Suspense>
        </Dialog>
    );
};

export default GenerateSpeciesContentDialog;
