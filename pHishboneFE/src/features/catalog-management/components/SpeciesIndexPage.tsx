import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { useDeleteSpecies, useSpeciesPaginated, useTypesList } from '../hooks/useCatalog';
import type { SpeciesDto, SpeciesFilter } from '../types';

// ─── Species Table (Suspense boundary) ───────────────────────────────────────

interface SpeciesTableProps {
    filter: SpeciesFilter;
    onEdit: (id: string) => void;
    onDelete: (species: SpeciesDto) => void;
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
                            <TableCell sx={{ width: 200 }}>{t('Catalog.Species.colTags')}</TableCell>
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
                        {data.items.map((species) => (
                            <TableRow
                                key={species.id}
                                hover
                                sx={{ '&:last-child td': { border: 0 } }}
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
                                        {species.scientificName}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{species.typeName}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption" color="text.secondary">—</Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title={t('Catalog.Species.editTooltip')}>
                                        <IconButton size="small" onClick={() => onEdit(species.id)}>
                                            <EditIcon fontSize="small" />
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
                        ))}
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

    const [searchTerm, setSearchTerm] = useState('');
    const [typeId, setTypeId] = useState('');
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(25);
    const [sortBy, setSortBy] = useState('CommonName');
    const [isAscending, setIsAscending] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<SpeciesDto | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const { mutateAsync: deleteSpecies, isPending: isDeleting } = useDeleteSpecies();

    const filter = useMemo<SpeciesFilter>(
        () => ({ page, size, searchTerm: searchTerm || undefined, typeId: typeId || undefined, sortBy, isAscending }),
        [page, size, searchTerm, typeId, sortBy, isAscending],
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onClick={() => void navigate({ to: '/catalog/species/create' as any })}
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
                            scientific: deleteTarget?.scientificName,
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
        </Box>
    );
};

export default SpeciesIndexPage;
