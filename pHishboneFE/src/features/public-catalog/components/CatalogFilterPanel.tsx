import React, { useCallback, useMemo } from 'react';
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Chip,
    FormControl,
    FormControlLabel,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Slider,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import RotateLeftRoundedIcon from '@mui/icons-material/RotateLeftRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { publicCatalogApi } from '../api/publicCatalogApi';
import type { PublicCatalogFilter } from '../types';
import type { DietType, SwimLevel, TagDto } from '../../catalog-management/types';

interface CatalogFilterPanelProps {
    filter: PublicCatalogFilter;
    onChange: (updated: Partial<PublicCatalogFilter>) => void;
    onClear: () => void;
}

const PH_BOUNDS = [6.0, 9.0] as const;
const TEMP_BOUNDS = [18, 32] as const;

const sectionTitleSx = {
    color: 'text.secondary',
    fontSize: '0.74rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    mb: 1.15,
} as const;

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

    const phValue = useMemo<[number, number]>(() => [
        filter.phMin ?? PH_BOUNDS[0],
        filter.phMax ?? PH_BOUNDS[1],
    ], [filter.phMax, filter.phMin]);

    const tempValue = useMemo<[number, number]>(() => [
        filter.tempMin ?? TEMP_BOUNDS[0],
        filter.tempMax ?? TEMP_BOUNDS[1],
    ], [filter.tempMax, filter.tempMin]);

    const selectedTags = useMemo<TagDto[]>(() => {
        if (!filter.tagIds?.length) {
            return [];
        }

        return tags.filter((tag) => filter.tagIds?.includes(tag.id));
    }, [filter.tagIds, tags]);

    const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ searchTerm: event.target.value || undefined });
    }, [onChange]);

    const handleSort = useCallback((event: SelectChangeEvent) => {
        const value = event.target.value;
        if (value === 'name-asc') {
            onChange({ sortBy: 'CommonName', isAscending: true });
            return;
        }

        if (value === 'name-desc') {
            onChange({ sortBy: 'CommonName', isAscending: false });
            return;
        }

        onChange({ sortBy: 'CreatedTime', isAscending: false });
    }, [onChange]);

    const handleDiet = useCallback((event: SelectChangeEvent) => {
        const value = event.target.value;
        onChange({ dietType: value === '' ? undefined : Number(value) as DietType });
    }, [onChange]);

    const handleType = useCallback((event: SelectChangeEvent) => {
        const value = event.target.value;
        onChange({ typeId: value || undefined });
    }, [onChange]);

    const handleSwimLevel = useCallback((_: React.MouseEvent<HTMLElement>, value: string | null) => {
        if (!value) {
            onChange({ swimLevel: undefined });
            return;
        }

        onChange({ swimLevel: Number(value) as SwimLevel });
    }, [onChange]);

    const handleWaterType = useCallback((_: React.MouseEvent<HTMLElement>, value: string | null) => {
        if (!value) {
            onChange({ waterType: undefined });
            return;
        }

        onChange({ waterType: Number(value) as 0 | 1 | 2 });
    }, [onChange]);

    const handlePh = useCallback((_: Event, value: number | number[]) => {
        const [min, max] = value as [number, number];
        onChange({ phMin: min, phMax: max });
    }, [onChange]);

    const handleTemp = useCallback((_: Event, value: number | number[]) => {
        const [min, max] = value as [number, number];
        onChange({ tempMin: min, tempMax: max });
    }, [onChange]);

    const handleSchooling = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ isSchooling: event.target.checked ? true : undefined });
    }, [onChange]);

    const handleTagChange = useCallback((_: React.SyntheticEvent, value: TagDto[]) => {
        onChange({ tagIds: value.length ? value.map((tag) => tag.id) : undefined });
    }, [onChange]);

    const sortValue = useMemo(() => {
        if (filter.sortBy === 'CreatedTime') {
            return 'newest';
        }

        if (filter.isAscending === false) {
            return 'name-desc';
        }

        return 'name-asc';
    }, [filter.isAscending, filter.sortBy]);

    return (
        <Box
            sx={{
                width: { xs: '100%', lg: 288 },
                flexShrink: 0,
                position: { xs: 'static', lg: 'sticky' },
                top: { lg: 88 },
                alignSelf: 'flex-start',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? '0 10px 28px rgba(0, 0, 0, 0.16)'
                    : '0 10px 24px rgba(10, 22, 40, 0.08)',
                p: { xs: 1.75, md: 2 },
            }}
        >
            <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700}>
                        {t('PublicCatalog.filterTitle')}
                    </Typography>
                    <Button
                        onClick={onClear}
                        startIcon={<RotateLeftRoundedIcon sx={{ fontSize: 16 }} />}
                        sx={{
                            minWidth: 0,
                            px: 0,
                            py: 0,
                            color: 'text.secondary',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            '&:hover': { color: 'text.primary', backgroundColor: 'transparent' },
                        }}
                    >
                        {t('PublicCatalog.clearFilters')}
                    </Button>
                </Stack>

                <Box>
                    <Typography sx={sectionTitleSx}>{t('PublicCatalog.searchLabel')}</Typography>
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
                                        <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                backgroundColor: 'action.hover',
                            },
                        }}
                    />
                </Box>

                <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.15 }}>
                        <Typography sx={{ ...sectionTitleSx, mb: 0 }}>{t('PublicCatalog.sortBy')}</Typography>
                        <SwapVertRoundedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                    </Stack>
                    <FormControl fullWidth size="small">
                        <Select
                            value={sortValue}
                            onChange={handleSort}
                            sx={{
                                borderRadius: 1.5,
                                backgroundColor: 'action.hover',
                            }}
                        >
                            <MenuItem value="name-asc">{t('PublicCatalog.sortNameAsc')}</MenuItem>
                            <MenuItem value="name-desc">{t('PublicCatalog.sortNameDesc')}</MenuItem>
                            <MenuItem value="newest">{t('PublicCatalog.sortNewest')}</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box>
                    <Typography sx={sectionTitleSx}>{t('PublicCatalog.filterType')}</Typography>
                    <FormControl fullWidth size="small">
                        <InputLabel>{t('PublicCatalog.filterType')}</InputLabel>
                        <Select
                            value={filter.typeId ?? ''}
                            label={t('PublicCatalog.filterType')}
                            onChange={handleType}
                            sx={{
                                borderRadius: 1.5,
                                backgroundColor: 'action.hover',
                            }}
                        >
                            <MenuItem value="">{t('PublicCatalog.filterAllTypes')}</MenuItem>
                            {types.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                    {type.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box>
                    <Typography sx={sectionTitleSx}>{t('PublicCatalog.filterWaterType')}</Typography>
                    <ToggleButtonGroup
                        exclusive
                        fullWidth
                        value={filter.waterType?.toString() ?? null}
                        onChange={handleWaterType}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 1,
                            '& .MuiToggleButtonGroup-grouped': {
                                m: 0,
                                minHeight: 36,
                                border: '1px solid',
                                borderColor: (theme) => `${theme.palette.divider} !important`,
                                borderRadius: '8px !important',
                                fontSize: '0.82rem',
                            },
                        }}
                    >
                        <ToggleButton value="0">{t('Catalog.waterType.0')}</ToggleButton>
                        <ToggleButton value="1">{t('Catalog.waterType.1')}</ToggleButton>
                        <ToggleButton value="2">{t('Catalog.waterType.2')}</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Box>
                    <Typography sx={sectionTitleSx}>{t('PublicCatalog.parametersTitle')}</Typography>
                    <Stack spacing={2}>
                        <Box>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                                <Typography variant="body2">{t('PublicCatalog.filterPhRange')}</Typography>
                                <Typography variant="body2" sx={{ color: 'primary.main' }}>
                                    {phValue[0].toFixed(1)} - {phValue[1].toFixed(1)}
                                </Typography>
                            </Stack>
                            <Slider
                                value={phValue}
                                onChange={handlePh}
                                min={PH_BOUNDS[0]}
                                max={PH_BOUNDS[1]}
                                step={0.1}
                                sx={{
                                    color: 'primary.main',
                                    '& .MuiSlider-thumb': { width: 12, height: 12 },
                                }}
                            />
                        </Box>

                        <Box>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                                <Typography variant="body2">{t('PublicCatalog.filterTempRange')}</Typography>
                                <Typography variant="body2" sx={{ color: 'primary.main' }}>
                                    {tempValue[0]} - {tempValue[1]}°C
                                </Typography>
                            </Stack>
                            <Slider
                                value={tempValue}
                                onChange={handleTemp}
                                min={TEMP_BOUNDS[0]}
                                max={TEMP_BOUNDS[1]}
                                step={1}
                                sx={{
                                    color: 'primary.main',
                                    '& .MuiSlider-thumb': { width: 12, height: 12 },
                                }}
                            />
                        </Box>
                    </Stack>
                </Box>

                <Box>
                    <Typography sx={sectionTitleSx}>{t('PublicCatalog.profileTitle')}</Typography>
                    <Stack spacing={1.4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>{t('PublicCatalog.filterDietType')}</InputLabel>
                            <Select
                                value={filter.dietType?.toString() ?? ''}
                                label={t('PublicCatalog.filterDietType')}
                                onChange={handleDiet}
                                sx={{
                                    borderRadius: 1.5,
                                    backgroundColor: 'action.hover',
                                }}
                            >
                                <MenuItem value="">{t('PublicCatalog.filterAllDiets')}</MenuItem>
                                <MenuItem value="0">{t('Catalog.dietType.0')}</MenuItem>
                                <MenuItem value="1">{t('Catalog.dietType.1')}</MenuItem>
                                <MenuItem value="2">{t('Catalog.dietType.2')}</MenuItem>
                            </Select>
                        </FormControl>

                        <Box>
                            <Typography variant="body2" sx={{ mb: 1.1 }}>{t('PublicCatalog.filterSwimLevel')}</Typography>
                            <ToggleButtonGroup
                                exclusive
                                fullWidth
                                value={filter.swimLevel?.toString() ?? null}
                                onChange={handleSwimLevel}
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: 1,
                                    '& .MuiToggleButtonGroup-grouped': {
                                        m: 0,
                                        minHeight: 36,
                                        border: '1px solid',
                                        borderColor: (theme) => `${theme.palette.divider} !important`,
                                        borderRadius: '8px !important',
                                        fontSize: '0.82rem',
                                    },
                                }}
                            >
                                <ToggleButton value="0">{t('Catalog.swimLevel.0')}</ToggleButton>
                                <ToggleButton value="1">{t('Catalog.swimLevel.1')}</ToggleButton>
                                <ToggleButton value="2">{t('Catalog.swimLevel.2')}</ToggleButton>
                                <ToggleButton value="3">{t('Catalog.swimLevel.3')}</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                    </Stack>
                </Box>

                <Box>
                    <Typography sx={sectionTitleSx}>{t('PublicCatalog.filterTags')}</Typography>
                    <Autocomplete
                        multiple
                        size="small"
                        options={tags}
                        value={selectedTags}
                        onChange={handleTagChange}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderTags={(value, getTagProps) => value.map((option, index) => (
                            <Chip
                                {...getTagProps({ index })}
                                key={option.id}
                                label={option.name}
                                size="small"
                                sx={{
                                    borderRadius: 1.5,
                                    bgcolor: 'rgba(0, 188, 212, 0.10)',
                                    color: 'primary.main',
                                }}
                            />
                        ))}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder={t('PublicCatalog.filterTagsPlaceholder')}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1.5,
                                        backgroundColor: 'action.hover',
                                    },
                                }}
                            />
                        )}
                    />
                </Box>

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={filter.isSchooling === true}
                            onChange={handleSchooling}
                            size="small"
                            sx={{ color: 'primary.main' }}
                        />
                    }
                    label={t('PublicCatalog.filterSchooling')}
                    sx={{ m: 0, '& .MuiFormControlLabel-label': { fontSize: '0.92rem' } }}
                />
            </Stack>
        </Box>
    );
};

export default CatalogFilterPanel;
