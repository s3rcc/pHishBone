import React, { Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SuspenseLoader } from '../../../../components/layout/SuspenseLoader';
import { useMuiSnackbar } from '../../../../hooks/useMuiSnackbar';
import { parseValidationErrors, getValidationSummary } from '../../../../lib/parseValidationErrors';
import { useCreateSpecies, useUpdateSpecies, useUploadSpeciesImageBatch } from '../../hooks/useCatalog';
import type { CreateSpeciesPayload, SpeciesDetailDto, SpeciesFormValues, UpdateSpeciesPayload } from '../../types';
import { TaxonomyTab } from './TaxonomyTab';
import { EnvironmentTab } from './EnvironmentTab';
import { ProfileTab } from './ProfileTab';
import { IndexingTab } from './IndexingTab';
import { GalleryTab } from './GalleryTab';

// ─── Props ────────────────────────────────────────────────────────────────────

interface SpeciesFormProps {
    mode: 'create' | 'edit';
    speciesId?: string;
    defaultValues?: SpeciesDetailDto;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildDefaultValues(detail?: SpeciesDetailDto): SpeciesFormValues {
    return {
        commonName: detail?.commonName ?? '',
        scientificName: detail?.scientificName ?? '',
        typeId: detail?.typeId ?? '',
        thumbnailUrl: detail?.thumbnailUrl ?? '',
        phMin: detail?.environment?.phMin ?? 6.5,
        phMax: detail?.environment?.phMax ?? 7.5,
        tempMin: detail?.environment?.tempMin ?? 22,
        tempMax: detail?.environment?.tempMax ?? 28,
        minTankVolume: detail?.environment?.minTankVolume ?? 40,
        waterType: detail?.environment?.waterType ?? 0,
        adultSize: detail?.profile?.adultSize ?? 5,
        bioLoadFactor: detail?.profile?.bioLoadFactor ?? 1,
        swimLevel: detail?.profile?.swimLevel ?? 1,
        dietType: detail?.profile?.dietType ?? 2,
        preferredFood: detail?.profile?.preferredFood ?? '',
        isSchooling: detail?.profile?.isSchooling ?? false,
        minGroupSize: detail?.profile?.minGroupSize ?? 0,
        origin: detail?.profile?.origin ?? '',
        description: detail?.profile?.description ?? '',
        tagIds: detail?.tags?.map((tag) => tag.id) ?? [],
    };
}

function toPayload(values: SpeciesFormValues): CreateSpeciesPayload {
    return {
        commonName: values.commonName,
        scientificName: values.scientificName,
        typeId: values.typeId,
        thumbnailUrl: values.thumbnailUrl || undefined,
        environment: {
            phMin: values.phMin,
            phMax: values.phMax,
            tempMin: values.tempMin,
            tempMax: values.tempMax,
            minTankVolume: values.minTankVolume,
            waterType: values.waterType,
        },
        profile: {
            adultSize: values.adultSize,
            bioLoadFactor: values.bioLoadFactor,
            swimLevel: values.swimLevel,
            dietType: values.dietType,
            preferredFood: values.preferredFood || undefined,
            isSchooling: values.isSchooling,
            minGroupSize: values.isSchooling ? values.minGroupSize : 0,
            origin: values.origin || undefined,
            description: values.description || undefined,
        },
        tagIds: values.tagIds,
    };
}

// ─── Tab panel helper ─────────────────────────────────────────────────────────

interface TabPanelProps {
    value: number;
    index: number;
    children: React.ReactNode;
}

const TabPanel: React.FC<TabPanelProps> = ({ value, index, children }) => (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 2 }}>
        {value === index && children}
    </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const SpeciesForm: React.FC<SpeciesFormProps> = ({ mode, speciesId, defaultValues }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { showSnackbar } = useMuiSnackbar();
    const [activeTab, setActiveTab] = useState(0);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const stagedFilesRef = useRef<File[]>([]);

    const { mutateAsync: createSpecies, isPending: isCreating } = useCreateSpecies();
    const { mutateAsync: updateSpecies, isPending: isUpdating } = useUpdateSpecies();
    const { mutateAsync: uploadBatch, isPending: isUploading } = useUploadSpeciesImageBatch();
    const isPending = isCreating || isUpdating || isUploading;

    const TAB_LABELS = [
        t('Catalog.form.tabTaxonomy'),
        t('Catalog.form.tabEnvironment'),
        t('Catalog.form.tabProfile'),
        t('Catalog.form.tabTags'),
        t('Catalog.form.tabGallery'),
    ];

    const methods = useForm<SpeciesFormValues>({
        defaultValues: useMemo(() => buildDefaultValues(defaultValues), [defaultValues]),
        mode: 'onTouched',
    });

    const { isDirty } = methods.formState;
    const currentThumbnailUrl = methods.watch('thumbnailUrl');

    const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    }, []);

    const handleThumbnailUrlChange = useCallback((thumbnailUrl: string) => {
        methods.setValue('thumbnailUrl', thumbnailUrl, {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: false,
        });
    }, [methods]);

    const handleStagedFilesChange = useCallback((files: File[]) => {
        stagedFilesRef.current = files;
    }, []);

    const handleSubmit = methods.handleSubmit(async (values) => {
        setSubmitError(null);
        try {
            const payload: CreateSpeciesPayload | UpdateSpeciesPayload = toPayload(values);
            let resultId = speciesId;

            if (mode === 'create') {
                const result = await createSpecies(payload);
                resultId = result.id;
            } else if (speciesId) {
                await updateSpecies({ id: speciesId, payload });
            }

            // Upload staged gallery files if any
            if (resultId && stagedFilesRef.current.length > 0) {
                try {
                    await uploadBatch({ speciesId: resultId, files: stagedFilesRef.current });
                    stagedFilesRef.current = [];
                } catch {
                    showSnackbar(t('Catalog.Gallery.uploadError'), 'warning');
                }
            }

            showSnackbar(t('Catalog.Snackbar.saved'), 'success');

            if (mode === 'create' && resultId) {
                // Navigate to edit page for the newly created species
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                void navigate({ to: '/catalog/species/$id' as any, params: { id: resultId } as any });
            } else {
                methods.reset(values);
            }
        } catch (err: unknown) {
            // Parse backend validation errors and set them on individual fields
            const fieldErrors = parseValidationErrors(err);
            if (fieldErrors) {
                for (const [fieldName, message] of Object.entries(fieldErrors)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    methods.setError(fieldName as any, { type: 'server', message });
                }
                setSubmitError(t('Catalog.Species.validationFailed'));
            } else {
                const msg = getValidationSummary(err, t('Catalog.form.errorUnexpected'));
                setSubmitError(msg);
            }
        }
    });

    return (
        <FormProvider {...methods}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
                {/* Sticky header / save bar */}
                <Box
                    sx={{
                        px: 3,
                        py: 1.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        bgcolor: 'background.paper',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                    }}
                >
                    <Button
                        variant="text"
                        size="small"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => void navigate({ to: '/catalog/species' as any })} // eslint-disable-line @typescript-eslint/no-explicit-any
                        sx={{ color: 'text.secondary' }}
                    >
                        {t('Catalog.Species.backToList')}
                    </Button>
                    <Divider orientation="vertical" flexItem />
                    <Typography variant="subtitle2" fontWeight={600}>
                        {mode === 'create' ? t('Catalog.Species.newEntry') : t('Catalog.Species.editEntry')}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    {(isDirty || stagedFilesRef.current.length > 0) && (
                        <Typography variant="caption" color="warning.main" sx={{ mr: 1 }}>
                            {t('Catalog.Species.unsavedChanges')}
                        </Typography>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        size="small"
                        startIcon={<SaveIcon />}
                        disabled={isPending}
                        sx={{
                            bgcolor: 'primary.dark',
                            '&:hover': { bgcolor: 'primary.main' },
                            borderRadius: '4px',
                        }}
                    >
                        {isPending ? t('Catalog.Species.saving') : t('Catalog.Species.saveEntry')}
                    </Button>
                </Box>

                {/* Error banner */}
                {submitError && (
                    <Alert severity="error" sx={{ mx: 3, mt: 2 }} onClose={() => setSubmitError(null)}>
                        {submitError}
                    </Alert>
                )}

                {/* Tabs nav */}
                <Box sx={{ px: 3, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        textColor="inherit"
                        indicatorColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        {TAB_LABELS.map((label, i) => (
                            <Tab
                                key={label}
                                label={label}
                                id={`species-tab-${i}`}
                                aria-controls={`species-tabpanel-${i}`}
                                sx={{ fontSize: '0.8rem', textTransform: 'none', minHeight: 44 }}
                            />
                        ))}
                    </Tabs>
                </Box>

                {/* Tab panels */}
                <Paper
                    elevation={0}
                    sx={{
                        mx: 3,
                        my: 2,
                        p: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '4px',
                        bgcolor: 'background.paper',
                    }}
                >
                    <TabPanel value={activeTab} index={0}>
                        <Suspense fallback={<SuspenseLoader />}>
                            <TaxonomyTab />
                        </Suspense>
                    </TabPanel>
                    <TabPanel value={activeTab} index={1}>
                        <EnvironmentTab />
                    </TabPanel>
                    <TabPanel value={activeTab} index={2}>
                        <ProfileTab />
                    </TabPanel>
                    <TabPanel value={activeTab} index={3}>
                        <Suspense fallback={<SuspenseLoader />}>
                            <IndexingTab />
                        </Suspense>
                    </TabPanel>
                    <TabPanel value={activeTab} index={4}>
                        <Suspense fallback={<SuspenseLoader />}>
                            <GalleryTab
                                speciesId={speciesId}
                                currentThumbnailUrl={currentThumbnailUrl}
                                onStagedFilesChange={handleStagedFilesChange}
                                onThumbnailUrlChange={handleThumbnailUrlChange}
                            />
                        </Suspense>
                    </TabPanel>
                </Paper>
            </Box>
        </FormProvider>
    );
};

export default SpeciesForm;
