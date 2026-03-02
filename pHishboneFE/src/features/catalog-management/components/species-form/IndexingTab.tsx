import React, { Suspense, useCallback } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { SuspenseLoader } from '../../../../components/layout/SuspenseLoader';
import { useTagsList } from '../../hooks/useCatalog';
import type { SpeciesFormValues, TagDto } from '../../types';

function TagsAutocompleteInner() {
    const { t } = useTranslation();
    const { data: allTags } = useTagsList();
    const { control } = useFormContext<SpeciesFormValues>();

    const { field } = useController({
        name: 'tagIds',
        control,
    });

    const selectedTags = (allTags ?? []).filter((tag) => field.value.includes(tag.id));

    const handleChange = useCallback(
        (_: React.SyntheticEvent, newValue: TagDto[]) => {
            field.onChange(newValue.map((tag) => tag.id));
        },
        [field],
    );

    return (
        <Autocomplete
            multiple
            id="field-tagIds"
            options={allTags ?? []}
            value={selectedTags}
            onChange={handleChange}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
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
                />
            )}
        />
    );
}

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
            </Suspense>
        </Box>
    );
};

export default IndexingTab;
