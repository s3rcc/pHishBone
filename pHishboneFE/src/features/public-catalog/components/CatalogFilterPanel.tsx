import React, { useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    Divider,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Slider,
    FormControlLabel,
    Checkbox,
    Button,
    Stack,
    Chip,
    Autocomplete,
    InputAdornment,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { publicCatalogApi } from '../api/publicCatalogApi';
import type { PublicCatalogFilter } from '../types';
import type { DietType, SwimLevel, TagDto } from '../../catalog-management/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CatalogFilterPanelProps {
    filter: PublicCatalogFilter;
    onChange: (updated: Partial<PublicCatalogFilter>) => void;
    onClear: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PH_BOUNDS = [6.0, 9.0] as const;
const TEMP_BOUNDS = [18, 32] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export const CatalogFilterPanel: React.FC<CatalogFilterPanelProps> = ({
    filter,
    onChange,
    onClear,
}) => {
    const { t } = useTranslation();

    const { data: types } = useSuspenseQuery({
        queryKey: ['public-catalog', 'types'],
        queryFn: () => publicCatalogApi.getTypes(),
        staleTime: 5 * 60 * 1000,
    });

    const { data: tags } = useSuspenseQuery({
        queryKey: ['public-catalog', 'tags'],
        queryFn: () => publicCatalogApi.getTags(),
        staleTime: 5 * 60 * 1000,
    });

    // ── Derived ───────────────────────────────────────────────────────────────

    const phValue = useMemo<[number, number]>(() => [
        filter.phMin ?? PH_BOUNDS[0],
        filter.phMax ?? PH_BOUNDS[1],
    ], [filter.phMin, filter.phMax]);

    const tempValue = useMemo<[number, number]>(() => [
        filter.tempMin ?? TEMP_BOUNDS[0],
        filter.tempMax ?? TEMP_BOUNDS[1],
    ], [filter.tempMin, filter.tempMax]);

    const selectedTags = useMemo<TagDto[]>(() => {
        if (!filter.tagIds?.length) return [];
        return tags.filter((t) => filter.tagIds!.includes(t.id));
    }, [filter.tagIds, tags]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) =>
            onChange({ searchTerm: e.target.value || undefined }),
        [onChange],
    );

    const handleType = useCallback(
        (e: SelectChangeEvent<any>) =>
            onChange({ typeId: (e.target.value as string) || undefined }),
        [onChange],
    );

    const handleWaterType = useCallback(
        (e: SelectChangeEvent<any>) => {
            const v = e.target.value;
            onChange({ waterType: v === '' ? undefined : (Number(v) as 0 | 1 | 2) });
        },
        [onChange],
    );

    const handleDiet = useCallback(
        (e: SelectChangeEvent<any>) => {
            const v = e.target.value;
            onChange({ dietType: v === '' ? undefined : (Number(v) as DietType) });
        },
        [onChange],
    );

    const handleSwimLevel = useCallback(
        (e: SelectChangeEvent<any>) => {
            const v = e.target.value;
            onChange({ swimLevel: v === '' ? undefined : (Number(v) as SwimLevel) });
        },
        [onChange],
    );

    const handlePh = useCallback(
        (_: Event, newValue: number | number[]) => {
            const [min, max] = newValue as [number, number];
            onChange({ phMin: min, phMax: max });
        },
        [onChange],
    );

    const handleTemp = useCallback(
        (_: Event, newValue: number | number[]) => {
            const [min, max] = newValue as [number, number];
            onChange({ tempMin: min, tempMax: max });
        },
        [onChange],
    );

    const handleSchooling = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) =>
            onChange({ isSchooling: e.target.checked ? true : undefined }),
        [onChange],
    );

    const handleTagChange = useCallback(
        (_: React.SyntheticEvent, newTags: TagDto[]) =>
            onChange({ tagIds: newTags.length ? newTags.map((t) => t.id) : undefined }),
        [onChange],
    );

    const handleSort = useCallback(
        (e: SelectChangeEvent<any>) => {
            const v = e.target.value as string;
            if (v === 'name-asc') onChange({ sortBy: 'CommonName', isAscending: true });
            else if (v === 'name-desc') onChange({ sortBy: 'CommonName', isAscending: false });
            else if (v === 'newest') onChange({ sortBy: 'CreatedTime', isAscending: false });
        },
        [onChange],
    );

    const sortValue = useMemo(() => {
        if (filter.sortBy === 'CreatedTime') return 'newest';
        if (filter.isAscending === false) return 'name-desc';
        return 'name-asc';
    }, [filter.sortBy, filter.isAscending]);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Box
            sx={{
                width: 280,
                flexShrink: 0,
                position: 'sticky',
                top: 24,
                alignSelf: 'flex-start',
                bgcolor: 'background.paper',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
            }}
        >
            {/* Header */}
            <Typography
                variant="overline"
                fontWeight={700}
                letterSpacing={2}
                sx={{ color: 'primary.main' }}
            >
                {t('PublicCatalog.filterTitle')}
            </Typography>

            {/* Search */}
            <TextField
                fullWidth
                size="small"
                placeholder={t('PublicCatalog.searchPlaceholder')}
                value={filter.searchTerm ?? ''}
                onChange={handleSearch}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                    },
                }}
                sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
            />

            <Divider />

            {/* Sort By */}
            <FormControl fullWidth size="small">
                <InputLabel>{t('PublicCatalog.sortBy')}</InputLabel>
                <Select
                    value={sortValue}
                    label={t('PublicCatalog.sortBy')}
                    onChange={handleSort}
                    sx={{ borderRadius: 2 }}
                >
                    <MenuItem value="name-asc">{t('PublicCatalog.sortNameAsc')}</MenuItem>
                    <MenuItem value="name-desc">{t('PublicCatalog.sortNameDesc')}</MenuItem>
                    <MenuItem value="newest">{t('PublicCatalog.sortNewest')}</MenuItem>
                </Select>
            </FormControl>

            <Divider />

            {/* Type */}
            <FormControl fullWidth size="small">
                <InputLabel>{t('PublicCatalog.filterType')}</InputLabel>
                <Select
                    value={filter.typeId ?? ''}
                    label={t('PublicCatalog.filterType')}
                    onChange={handleType}
                    sx={{ borderRadius: 2 }}
                >
                    <MenuItem value="">{t('PublicCatalog.filterAllTypes')}</MenuItem>
                    {types.map((tp) => (
                        <MenuItem key={tp.id} value={tp.id}>
                            {tp.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Water Type */}
            <FormControl fullWidth size="small">
                <InputLabel>{t('PublicCatalog.filterWaterType')}</InputLabel>
                <Select
                    value={filter.waterType ?? ''}
                    label={t('PublicCatalog.filterWaterType')}
                    onChange={handleWaterType}
                    sx={{ borderRadius: 2 }}
                >
                    <MenuItem value="">{t('PublicCatalog.filterAllWaterTypes')}</MenuItem>
                    <MenuItem value={0}>{t('Catalog.waterType.0')}</MenuItem>
                    <MenuItem value={1}>{t('Catalog.waterType.1')}</MenuItem>
                    <MenuItem value={2}>{t('Catalog.waterType.2')}</MenuItem>
                </Select>
            </FormControl>

            {/* Diet Type */}
            <FormControl fullWidth size="small">
                <InputLabel>{t('PublicCatalog.filterDietType')}</InputLabel>
                <Select
                    value={filter.dietType ?? ''}
                    label={t('PublicCatalog.filterDietType')}
                    onChange={handleDiet}
                    sx={{ borderRadius: 2 }}
                >
                    <MenuItem value="">{t('PublicCatalog.filterAllDiets')}</MenuItem>
                    <MenuItem value={0}>{t('Catalog.dietType.0')}</MenuItem>
                    <MenuItem value={1}>{t('Catalog.dietType.1')}</MenuItem>
                    <MenuItem value={2}>{t('Catalog.dietType.2')}</MenuItem>
                </Select>
            </FormControl>

            {/* Swim Level */}
            <FormControl fullWidth size="small">
                <InputLabel>{t('PublicCatalog.filterSwimLevel')}</InputLabel>
                <Select
                    value={filter.swimLevel ?? ''}
                    label={t('PublicCatalog.filterSwimLevel')}
                    onChange={handleSwimLevel}
                    sx={{ borderRadius: 2 }}
                >
                    <MenuItem value="">{t('PublicCatalog.filterAllSwimLevels')}</MenuItem>
                    <MenuItem value={0}>{t('Catalog.swimLevel.0')}</MenuItem>
                    <MenuItem value={1}>{t('Catalog.swimLevel.1')}</MenuItem>
                    <MenuItem value={2}>{t('Catalog.swimLevel.2')}</MenuItem>
                    <MenuItem value={3}>{t('Catalog.swimLevel.3')}</MenuItem>
                </Select>
            </FormControl>

            <Divider />

            {/* pH Range */}
            <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={1} textTransform="uppercase">
                        {t('PublicCatalog.filterPhRange')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
                        {phValue[0].toFixed(1)} – {phValue[1].toFixed(1)}
                    </Typography>
                </Stack>
                <Slider
                    value={phValue}
                    onChange={handlePh}
                    min={PH_BOUNDS[0]}
                    max={PH_BOUNDS[1]}
                    step={0.1}
                    valueLabelDisplay="auto"
                    sx={{
                        color: 'primary.main',
                        '& .MuiSlider-thumb': { width: 14, height: 14 },
                    }}
                />
            </Box>

            {/* Temperature Range */}
            <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={1} textTransform="uppercase">
                        {t('PublicCatalog.filterTempRange')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
                        {tempValue[0]}° – {tempValue[1]}°C
                    </Typography>
                </Stack>
                <Slider
                    value={tempValue}
                    onChange={handleTemp}
                    min={TEMP_BOUNDS[0]}
                    max={TEMP_BOUNDS[1]}
                    step={1}
                    valueLabelDisplay="auto"
                    sx={{
                        color: 'primary.main',
                        '& .MuiSlider-thumb': { width: 14, height: 14 },
                    }}
                />
            </Box>

            <Divider />

            {/* Tags */}
            <Autocomplete
                multiple
                size="small"
                options={tags}
                value={selectedTags}
                onChange={handleTagChange}
                getOptionLabel={(opt) => opt.name}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                renderTags={(value, getTagProps) =>
                    value.map((opt, index) => (
                        <Chip
                            {...getTagProps({ index })}
                            key={opt.id}
                            label={opt.name}
                            size="small"
                            sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                bgcolor: 'primary.dark',
                                color: 'primary.contrastText',
                                borderRadius: 1.5,
                            }}
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={t('PublicCatalog.filterTags')}
                        placeholder={t('PublicCatalog.filterTagsPlaceholder')}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                )}
            />

            {/* Schooling toggle */}
            <FormControlLabel
                control={
                    <Checkbox
                        checked={filter.isSchooling === true}
                        onChange={handleSchooling}
                        size="small"
                        sx={{ color: 'primary.main' }}
                    />
                }
                label={
                    <Typography variant="body2" color="text.secondary">
                        {t('PublicCatalog.filterSchooling')}
                    </Typography>
                }
            />

            <Divider />

            {/* Clear */}
            <Button
                variant="outlined"
                size="small"
                startIcon={<FilterListOffIcon />}
                onClick={onClear}
                sx={{
                    borderRadius: 2,
                    borderColor: 'divider',
                    color: 'text.secondary',
                    '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
                }}
            >
                {t('PublicCatalog.clearFilters')}
            </Button>
        </Box>
    );
};

export default CatalogFilterPanel;
