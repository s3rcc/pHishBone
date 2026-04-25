import React, { Suspense, useCallback, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
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
import { useCreateSpecies } from '../hooks/useCatalog';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CreateSpeciesDialogProps {
    open: boolean;
    onClose: () => void;
}

// ─── Inner form ───────────────────────────────────────────────────────────────

function CreateSpeciesFormInner({ onClose }: { onClose: () => void }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { showSnackbar } = useMuiSnackbar();

    const [commonName, setCommonName] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { mutateAsync: createSpecies, isPending: isCreating } = useCreateSpecies();

    const handleSubmit = useCallback(async () => {
        // Client-side quick validation — only commonName is required for a draft
        const newErrors: Record<string, string> = {};
        if (!commonName.trim()) newErrors.commonName = t('Catalog.form.required', { field: t('Catalog.form.fieldCommonName') });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        try {
            const result = await createSpecies({
                commonName: commonName.trim(),
                // scientificName and typeId are intentionally omitted — draft-first flow
                isActive: false,
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
                    // Backend validates MinGroupSize >= 1 even when not schooling.
                    minGroupSize: 1,
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
    }, [commonName, createSpecies, navigate, onClose, showSnackbar, t]);

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
                    helperText={errors.commonName ?? t('Catalog.Species.draftHint')}
                    autoFocus
                    inputProps={{ id: 'draft-commonName' }}
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button size="small" onClick={onClose} disabled={isCreating}>
                    {t('Common.cancel')}
                </Button>
                <Button
                    size="small"
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isCreating}
                    sx={{ bgcolor: 'primary.dark', '&:hover': { bgcolor: 'primary.main' }, borderRadius: '4px' }}
                >
                    {isCreating ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : t('Catalog.Species.createDraft')}
                </Button>
            </DialogActions>
        </>
    );
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export const CreateSpeciesDialog: React.FC<CreateSpeciesDialogProps> = ({ open, onClose }) => {
    const { t } = useTranslation();
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
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
