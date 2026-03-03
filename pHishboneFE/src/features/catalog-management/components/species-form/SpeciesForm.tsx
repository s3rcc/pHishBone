import React, { Suspense, useCallback, useMemo, useState } from 'react';
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
import { useCreateSpecies, useUpdateSpecies } from '../../hooks/useCatalog';
import type { CreateSpeciesPayload, SpeciesDetailDto, SpeciesFormValues, UpdateSpeciesPayload } from '../../types';
import { TaxonomyTab } from './TaxonomyTab';
import { BioTab } from './BioTab';
import { BehaviorTab } from './BehaviorTab';
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
        minTankVolume: detail?.environment?.minTankVolume ?? 0,
        waterType: detail?.environment?.waterType ?? 0,
        adultSize: detail?.profile?.adultSize ?? 0,
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
    const [activeTab, setActiveTab] = useState(0);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const { mutateAsync: createSpecies, isPending: isCreating } = useCreateSpecies();
    const { mutateAsync: updateSpecies, isPending: isUpdating } = useUpdateSpecies();
    const isPending = isCreating || isUpdating;

    const TAB_LABELS = [
        t('Catalog.form.tabTaxonomy'),
        t('Catalog.form.tabBio'),
        t('Catalog.form.tabBehavior'),
        t('Catalog.form.tabIndexing'),
        ...(mode === 'edit' ? [t('Catalog.form.tabGallery')] : []),
    ];

    const methods = useForm<SpeciesFormValues>({
        defaultValues: useMemo(() => buildDefaultValues(defaultValues), [defaultValues]),
        mode: 'onTouched',
    });

    const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    }, []);

    const handleSubmit = methods.handleSubmit(async (values) => {
        setSubmitError(null);
        try {
            const payload: CreateSpeciesPayload | UpdateSpeciesPayload = toPayload(values);
            if (mode === 'create') {
                await createSpecies(payload);
            } else if (speciesId) {
                await updateSpecies({ id: speciesId, payload });
            }
            void navigate({ to: '/catalog/species' as any }); // eslint-disable-line @typescript-eslint/no-explicit-any
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : t('Catalog.form.errorUnexpected');
            setSubmitError(msg);
        }
    });

    return (
        <FormProvider {...methods}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
                {/* Header */}
                <Box
                    sx={{
                        px: 3,
                        py: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        bgcolor: 'background.paper',
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
                        <BioTab />
                    </TabPanel>
                    <TabPanel value={activeTab} index={2}>
                        <BehaviorTab />
                    </TabPanel>
                    <TabPanel value={activeTab} index={3}>
                        <Suspense fallback={<SuspenseLoader />}>
                            <IndexingTab />
                        </Suspense>
                    </TabPanel>
                    {mode === 'edit' && speciesId && (
                        <TabPanel value={activeTab} index={4}>
                            <Suspense fallback={<SuspenseLoader />}>
                                <GalleryTab
                                    speciesId={speciesId}
                                    currentThumbnailUrl={defaultValues?.thumbnailUrl}
                                />
                            </Suspense>
                        </TabPanel>
                    )}
                </Paper>
            </Box>
        </FormProvider>
    );
};

export default SpeciesForm;
