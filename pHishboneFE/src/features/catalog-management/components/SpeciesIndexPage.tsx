import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import { useMuiSnackbar } from '../../../hooks/useMuiSnackbar';
import { speciesApi } from '../api/catalogApi';
import { useCreateSpecies, useDeleteSpecies, useSpeciesPaginated, useTypesList } from '../hooks/useCatalog';
import { CreateSpeciesDialog } from './CreateSpeciesDialog';
import type { DietType, SpeciesDto, SpeciesFilter, SpeciesProfilePayload, SwimLevel } from '../types';

// ─── Species Table (Suspense boundary) ───────────────────────────────────────

interface SpeciesTableProps {
    filter: SpeciesFilter;
    onEdit: (id: string) => void;
    onDelete: (species: SpeciesDto) => void;
    onClone: (species: SpeciesDto) => void;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (size: number) => void;
    sortBy: string;
    isAscending: boolean;
    onSortChange: (col: string) => void;
}

function SpeciesTable({
    filter,
    onEdit,
    onDelete,
    onClone,
    onPageChange,
    onRowsPerPageChange,
    sortBy,
    isAscending,
    onSortChange,
}: SpeciesTableProps) {
    const { t } = useTranslation();
    const { data } = useSpeciesPaginated(filter);

    return (
        <>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell sx={{ width: 56 }}>{t('Catalog.Species.colImage')}</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortBy === 'CommonName'}
                                    direction={isAscending ? 'asc' : 'desc'}
                                    onClick={() => onSortChange('CommonName')}
                                >
                                    {t('Catalog.Species.colCommonName')}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortBy === 'ScientificName'}
                                    direction={isAscending ? 'asc' : 'desc'}
                                    onClick={() => onSortChange('ScientificName')}
                                >
                                    {t('Catalog.Species.colScientificName')}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>{t('Catalog.Species.colType')}</TableCell>
                            <TableCell sx={{ width: 100 }}>{t('Catalog.Species.colStatus')}</TableCell>
                            <TableCell align="right" sx={{ width: 100 }}>{t('Catalog.Species.colActions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('Catalog.Species.noResults')}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                        {data.items.map((species) => {
                            const isActive = species.isActive === true;
                            return (
                                <TableRow
                                    key={species.id}
                                    hover
                                    sx={{
                                        '&:last-child td': { border: 0 },
                                        ...(isActive && {
                                            bgcolor: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(76, 175, 80, 0.08)'
                                                    : 'rgba(76, 175, 80, 0.05)',
                                            '&:hover': {
                                                bgcolor: (theme) =>
                                                    theme.palette.mode === 'dark'
                                                        ? 'rgba(76, 175, 80, 0.14)'
                                                        : 'rgba(76, 175, 80, 0.10)',
                                            },
                                        }),
                                    }}
                                >
                                    <TableCell sx={{ p: 1 }}>
                                        {species.thumbnailUrl ? (
                                            <Box
                                                component="img"
                                                src={species.thumbnailUrl}
                                                alt={species.commonName}
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    objectFit: 'cover',
                                                    borderRadius: '4px',
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                }}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: '4px',
                                                    bgcolor: 'action.hover',
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                }}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={500}>
                                            {species.commonName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                            {species.scientificName ?? '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{species.typeName ?? '—'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        {isActive ? (
                                            <Chip
                                                id={`status-active-${species.id}`}
                                                icon={<CheckCircleIcon sx={{ fontSize: '0.9rem !important' }} />}
                                                label={t('Catalog.Species.statusActive')}
                                                size="small"
                                                color="success"
                                                variant="outlined"
                                                sx={{ fontSize: '0.72rem', height: 22 }}
                                            />
                                        ) : (
                                            <Chip
                                                id={`status-inactive-${species.id}`}
                                                icon={<PauseCircleOutlineIcon sx={{ fontSize: '0.9rem !important' }} />}
                                                label={t('Catalog.Species.statusInactive')}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontSize: '0.72rem', height: 22, color: 'text.disabled', borderColor: 'divider' }}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title={t('Catalog.Species.editTooltip')}>
                                            <IconButton size="small" onClick={() => onEdit(species.id)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('Catalog.Species.cloneTooltip')}>
                                            <IconButton size="small" onClick={() => onClone(species)}>
                                                <ContentCopyIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('Catalog.Species.deleteTooltip')}>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => onDelete(species)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={data.totalItems}
                rowsPerPage={filter.size ?? 25}
                page={(filter.page ?? 1) - 1}
                onPageChange={(_, p) => onPageChange(p + 1)}
                onRowsPerPageChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            />
        </>
    );
}

// ─── Type Filter select (Suspense) ────────────────────────────────────────────

function TypeFilterSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const { t } = useTranslation();
    const { data: types } = useTypesList();
    return (
        <TextField
            select
            label={t('Catalog.Species.filterByType')}
            size="small"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            sx={{ width: 180 }}
            inputProps={{ id: 'filter-typeId' }}
        >
            <MenuItem value="">{t('Catalog.Species.allTypes')}</MenuItem>
            {types.map((tp) => (
                <MenuItem key={tp.id} value={tp.id}>
                    {tp.name}
                </MenuItem>
            ))}
        </TextField>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export const SpeciesIndexPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { showSnackbar } = useMuiSnackbar();

    const [searchTerm, setSearchTerm] = useState('');
    const [typeId, setTypeId] = useState('');
    const [activeFilter, setActiveFilter] = useState<'' | 'active' | 'inactive'>('');
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(25);
    const [sortBy, setSortBy] = useState('CommonName');
    const [isAscending, setIsAscending] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<SpeciesDto | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const { mutateAsync: deleteSpecies, isPending: isDeleting } = useDeleteSpecies();
    const { mutateAsync: createSpecies } = useCreateSpecies();

    const filter = useMemo<SpeciesFilter>(
        () => ({
            page,
            size,
            searchTerm: searchTerm || undefined,
            typeId: typeId || undefined,
            sortBy,
            isAscending,
            isActive: activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined,
        }),
        [page, size, searchTerm, typeId, sortBy, isAscending, activeFilter],
    );

    const handleSort = useCallback(
        (col: string) => {
            if (sortBy === col) {
                setIsAscending((prev) => !prev);
            } else {
                setSortBy(col);
                setIsAscending(true);
            }
            setPage(1);
        },
        [sortBy],
    );

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    }, []);

    const handleTypeChange = useCallback((value: string) => {
        setTypeId(value);
        setPage(1);
    }, []);

    const handleActiveFilterChange = useCallback((value: string) => {
        setActiveFilter(value as '' | 'active' | 'inactive');
        setPage(1);
    }, []);

    const handleEdit = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (id: string) => void navigate({ to: '/catalog/species/$id' as any, params: { id } as any }),
        [navigate],
    );

    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteTarget) return;
        setDeleteError(null);
        try {
            await deleteSpecies(deleteTarget.id);
            setDeleteTarget(null);
        } catch (err: unknown) {
            setDeleteError(err instanceof Error ? err.message : t('Catalog.form.errorUnexpected'));
        }
    }, [deleteTarget, deleteSpecies, t]);

    const handleClone = useCallback(
        async (species: SpeciesDto) => {
            try {
                const detail = await speciesApi.getDetailById(species.id);

                // Normalize older/partial data so we don't re-send an invalid MinGroupSize=0.
                const defaultProfile: SpeciesProfilePayload = {
                    adultSize: 5,
                    bioLoadFactor: 1,
                    swimLevel: 1 as SwimLevel,
                    dietType: 2 as DietType,
                    isSchooling: false,
                    minGroupSize: 1,
                };

                const normalizedProfile: SpeciesProfilePayload = detail.profile
                    ? {
                        ...detail.profile,
                        minGroupSize: detail.profile.isSchooling ? detail.profile.minGroupSize : 1,
                    }
                    : defaultProfile;

                const result = await createSpecies({
                    commonName: `Copy of ${detail.commonName}`,
                    scientificName: detail.scientificName ?? undefined,
                    typeId: detail.typeId ?? undefined,
                    thumbnailUrl: detail.thumbnailUrl,
                    isActive: false, // clones start as inactive drafts
                    environment: detail.environment ?? {
                        phMin: 6.5, phMax: 7.5, tempMin: 22, tempMax: 28,
                        minTankVolume: 40, waterType: 0,
                    },
                    profile: normalizedProfile,
                    tagIds: detail.tags?.map((tag) => tag.id) ?? [],
                });
                showSnackbar(t('Catalog.Species.cloneSuccess'), 'success');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                void navigate({ to: '/catalog/species/$id' as any, params: { id: result.id } as any });
            } catch {
                showSnackbar(t('Catalog.form.errorUnexpected'), 'error');
            }
        },
        [createSpecies, navigate, showSnackbar, t],
    );

    return (
        <Box sx={{ p: 3 }}>
            {/* Page header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                        {t('Catalog.Species.pageTitle')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {t('Catalog.Species.pageSubtitle')}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                    sx={{ bgcolor: 'primary.dark', '&:hover': { bgcolor: 'primary.main' }, borderRadius: '4px' }}
                >
                    {t('Catalog.Species.newEntry')}
                </Button>
            </Box>

            {/* Contextual info note */}
            <Alert
                severity="info"
                variant="outlined"
                sx={{ mb: 2, borderRadius: '4px', fontSize: '0.78rem', py: 0.5 }}
            >
                {t('Catalog.info.species')}
            </Alert>

            {/* Toolbar */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder={t('Catalog.Species.searchPlaceholder')}
                    size="small"
                    sx={{ minWidth: 260 }}
                    inputProps={{ id: 'search-species' }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                            </InputAdornment>
                        ),
                    }}
                />
                <Suspense fallback={<CircularProgress size={24} />}>
                    <TypeFilterSelect value={typeId} onChange={handleTypeChange} />
                </Suspense>
                {/* Active status filter */}
                <TextField
                    select
                    label={t('Catalog.Species.filterByStatus')}
                    size="small"
                    value={activeFilter}
                    onChange={(e) => handleActiveFilterChange(e.target.value)}
                    sx={{ width: 160 }}
                    inputProps={{ id: 'filter-isActive' }}
                >
                    <MenuItem value="">{t('Catalog.Species.allStatuses')}</MenuItem>
                    <MenuItem value="active">{t('Catalog.Species.statusActive')}</MenuItem>
                    <MenuItem value="inactive">{t('Catalog.Species.statusInactive')}</MenuItem>
                </TextField>
            </Box>

            {/* Table */}
            <Paper
                elevation={0}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '4px', bgcolor: 'background.paper' }}
            >
                <Suspense
                    fallback={
                        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={32} />
                        </Box>
                    }
                >
                    <SpeciesTable
                        filter={filter}
                        onEdit={handleEdit}
                        onDelete={setDeleteTarget}
                        onClone={(s) => void handleClone(s)}
                        onPageChange={setPage}
                        onRowsPerPageChange={(s) => { setSize(s); setPage(1); }}
                        sortBy={sortBy}
                        isAscending={isAscending}
                        onSortChange={handleSort}
                    />
                </Suspense>
            </Paper>

            {/* Delete confirmation dialog */}
            <Dialog
                open={!!deleteTarget}
                onClose={() => { setDeleteTarget(null); setDeleteError(null); }}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontSize: '1rem' }}>{t('Catalog.Species.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <DialogContentText variant="body2">
                        {t('Catalog.Species.deleteConfirm', {
                            name: deleteTarget?.commonName,
                            scientific: deleteTarget?.scientificName ?? '—',
                        })}
                    </DialogContentText>
                    {deleteError && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                            {deleteError}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        size="small"
                        onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
                        disabled={isDeleting}
                    >
                        {t('Common.cancel')}
                    </Button>
                    <Button
                        size="small"
                        color="error"
                        variant="contained"
                        onClick={handleDeleteConfirm}
                        disabled={isDeleting}
                        sx={{ borderRadius: '4px' }}
                    >
                        {isDeleting ? t('Catalog.Species.deleting') : t('Catalog.Species.deleteButton')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Draft creation dialog */}
            <CreateSpeciesDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
        </Box>
    );
};

export default SpeciesIndexPage;
