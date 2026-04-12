import React, { Suspense, useCallback, useMemo } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { SuspenseLoader } from '../../../../components/layout/SuspenseLoader';
import { useMuiSnackbar } from '../../../../hooks/useMuiSnackbar';
import { useCreateTag, useTagsList } from '../../hooks/useCatalog';
import type { SpeciesFormValues, TagDto } from '../../types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TagOption extends TagDto {
    inputValue?: string;
    isNew?: boolean;
}

const tagFilter = createFilterOptions<TagOption>();

/** Generate a tag code from a display name: "High Light" → "HIGH_LIGHT" */
function toTagCode(name: string): string {
    return name
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, '_')
        .replace(/[^A-Z0-9_]/g, '');
}

// ─── Creatable Tags Autocomplete ──────────────────────────────────────────────

function TagsAutocompleteInner() {
    const { t } = useTranslation();
    const { showSnackbar } = useMuiSnackbar();
    const { data: allTags } = useTagsList();
    const { control } = useFormContext<SpeciesFormValues>();

    const { field } = useController({ name: 'tagIds', control });
    const { mutateAsync: createTag, isPending: isCreatingTag } = useCreateTag();

    const tagOptions: TagOption[] = useMemo(
        () => (allTags ?? []).map((tag) => ({ ...tag })),
        [allTags],
    );
    const selectedTags = useMemo(
        () => tagOptions.filter((tag) => field.value.includes(tag.id)),
        [tagOptions, field.value],
    );

    const handleChange = useCallback(
        async (_: React.SyntheticEvent, newValue: (TagOption | string)[]) => {
            const ids: string[] = [];
            for (const item of newValue) {
                if (typeof item === 'string') continue;
                if (item.isNew && item.inputValue) {
                    try {
                        const code = toTagCode(item.inputValue);
                        const created = await createTag({ code, name: item.inputValue });
                        ids.push(created.id);
                        showSnackbar(t('Catalog.Species.tagCreated', { name: created.name }), 'success');
                    } catch {
                        showSnackbar(t('Catalog.form.errorUnexpected'), 'error');
                    }
                } else {
                    ids.push(item.id);
                }
            }
            field.onChange(ids);
        },
        [field, createTag, showSnackbar, t],
    );

    return (
        <Autocomplete<TagOption, true, false, true>
            multiple
            freeSolo
            id="field-tagIds"
            options={tagOptions}
            value={selectedTags}
            onChange={handleChange}
            getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                if (option.isNew) return option.inputValue ?? '';
                return option.name;
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            filterOptions={(options, params) => {
                const filtered = tagFilter(options, params);
                const { inputValue } = params;
                const exists = options.some((o) => o.name.toLowerCase() === inputValue.toLowerCase());
                if (inputValue !== '' && !exists) {
                    filtered.push({
                        inputValue,
                        isNew: true,
                        id: '',
                        code: toTagCode(inputValue),
                        name: t('Catalog.form.addTag', { name: inputValue }),
                        createdTime: '',
                    });
                }
                return filtered;
            }}
            renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                    <Box component="li" key={key} {...rest} sx={{ fontStyle: option.isNew ? 'italic' : 'normal' }}>
                        {option.isNew ? t('Catalog.form.addTag', { name: option.inputValue }) : option.name}
                    </Box>
                );
            }}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                    const { key, ...chipProps } = getTagProps({ index });
                    return (
                        <Chip
                            key={key}
                            label={option.name}
                            size="small"
                            variant="outlined"
                            {...chipProps}
                        />
                    );
                })
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={t('Catalog.form.fieldTags')}
                    size="small"
                    placeholder={selectedTags.length === 0 ? t('Catalog.Species.tagsPlaceholder') : ''}
                    helperText={t('Catalog.Species.tagsHelperText')}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {isCreatingTag ? <CircularProgress size={18} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
            loading={isCreatingTag}
        />
    );
}

// ─── Compatibility Preview ────────────────────────────────────────────────────

function CompatibilityPreview() {
    const { t } = useTranslation();
    const { data: allTags } = useTagsList();
    const { control } = useFormContext<SpeciesFormValues>();
    const { field } = useController({ name: 'tagIds', control });

    const selectedTags = useMemo(
        () => (allTags ?? []).filter((tag) => field.value.includes(tag.id)),
        [allTags, field.value],
    );

    if (selectedTags.length === 0) return null;

    const tagNames = selectedTags.map((t) => `#${t.code}`).join(', ');

    return (
        <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: '4px', bgcolor: 'action.hover' }}>
            <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                {t('Catalog.Tags.compatibilityTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                {t('Catalog.Tags.compatibilityNote', { tags: tagNames })}
            </Typography>
        </Paper>
    );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export const IndexingTab: React.FC = () => {
    const { t } = useTranslation();
    return (
        <Box sx={{ pt: 2 }}>
            <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                letterSpacing={0.6}
                sx={{ textTransform: 'uppercase', mb: 2, display: 'block' }}
            >
                {t('Catalog.form.sectionIndexing')}
            </Typography>
            <Suspense fallback={<SuspenseLoader />}>
                <TagsAutocompleteInner />
                <CompatibilityPreview />
            </Suspense>
        </Box>
    );
};

export default IndexingTab;
