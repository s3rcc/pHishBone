import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
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
import {
    useCreateType,
    useDeleteType,
    useTypesPaginated,
    useUpdateType,
} from '../hooks/useCatalog';
import type { CreateTypePayload, SpeciesTypeDto, TypeFilter, UpdateTypePayload } from '../types';

// ─── Form types ───────────────────────────────────────────────────────────────

interface TypeFormValues {
    name: string;
    description: string;
}

// ─── Types Table (Suspense inner) ─────────────────────────────────────────────

interface TypesTableProps {
    filter: TypeFilter;
    onEdit: (row: SpeciesTypeDto) => void;
    onDelete: (row: SpeciesTypeDto) => void;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (size: number) => void;
    sortBy: string;
    isAscending: boolean;
    onSortChange: (col: string) => void;
}

function TypesTable({
    filter,
    onEdit,
    onDelete,
    onPageChange,
    onRowsPerPageChange,
    sortBy,
    isAscending,
    onSortChange,
}: TypesTableProps) {
    const { t } = useTranslation();
    const { data } = useTypesPaginated(filter);

    return (
        <>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell>
                                <TableSortLabel
                                    active={sortBy === 'Name'}
                                    direction={isAscending ? 'asc' : 'desc'}
                                    onClick={() => onSortChange('Name')}
                                >
                                    {t('Catalog.Types.colName')}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>{t('Catalog.Types.colDescription')}</TableCell>
                            <TableCell sx={{ width: 140 }}>{t('Catalog.Types.colCreatedAt')}</TableCell>
                            <TableCell align="right" sx={{ width: 100 }}>{t('Catalog.Types.colActions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('Catalog.Types.noResults')}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                        {data.items.map((row) => (
                            <TableRow key={row.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={600}>
                                        {row.name}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            maxWidth: 400,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {row.description ?? '—'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption" color="text.secondary">
                                        {row.createdTime
                                            ? new Date(row.createdTime).toLocaleDateString()
                                            : '—'}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title={t('Catalog.Types.editTooltip')}>
                                        <IconButton size="small" onClick={() => onEdit(row)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('Catalog.Types.deleteTooltip')}>
                                        <IconButton size="small" color="error" onClick={() => onDelete(row)}>
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

// ─── Create / Edit Dialog ─────────────────────────────────────────────────────

interface TypeDialogProps {
    open: boolean;
    editTarget: SpeciesTypeDto | null; // null = create mode
    onClose: () => void;
}

function TypeDialog({ open, editTarget, onClose }: TypeDialogProps) {
    const { t } = useTranslation();
    const isEdit = editTarget !== null;

    const { mutateAsync: createType, isPending: isCreating } = useCreateType();
    const { mutateAsync: updateType, isPending: isUpdating } = useUpdateType();
    const isPending = isCreating || isUpdating;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setError,
    } = useForm<TypeFormValues>({
        defaultValues: { name: editTarget?.name ?? '', description: editTarget?.description ?? '' },
    });

    // Sync form values when editTarget changes
    React.useEffect(() => {
        reset({
            name: editTarget?.name ?? '',
            description: editTarget?.description ?? '',
        });
    }, [editTarget, reset]);

    const onSubmit = handleSubmit(async (values) => {
        try {
            if (isEdit && editTarget) {
                const payload: UpdateTypePayload = { name: values.name, description: values.description || undefined };
                await updateType({ id: editTarget.id, payload });
            } else {
                const payload: CreateTypePayload = { name: values.name, description: values.description || undefined };
                await createType(payload);
            }
            onClose();
        } catch (err: unknown) {
            setError('root', {
                message: err instanceof Error ? err.message : t('Catalog.form.errorUnexpected'),
            });
        }
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontSize: '1rem', fontWeight: 600 }}>
                {isEdit ? t('Catalog.Types.dialogEditTitle') : t('Catalog.Types.dialogCreateTitle')}
            </DialogTitle>
            <Box component="form" onSubmit={onSubmit} noValidate>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    {errors.root && (
                        <Alert severity="error" sx={{ mb: 1 }}>
                            {errors.root.message}
                        </Alert>
                    )}
                    <TextField
                        {...register('name', { required: t('Catalog.Types.fieldNameRequired') })}
                        label={t('Catalog.Types.fieldName')}
                        size="small"
                        fullWidth
                        autoFocus
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        inputProps={{ id: 'field-type-name' }}
                    />
                    <TextField
                        {...register('description')}
                        label={t('Catalog.Types.fieldDescription')}
                        size="small"
                        fullWidth
                        multiline
                        minRows={3}
                        inputProps={{ id: 'field-type-description' }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button size="small" onClick={onClose} disabled={isPending}>
                        {t('Common.cancel')}
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        size="small"
                        disabled={isPending}
                        sx={{ bgcolor: 'primary.dark', '&:hover': { bgcolor: 'primary.main' }, borderRadius: '4px' }}
                    >
                        {isPending ? t('Catalog.Types.saving') : t('Catalog.Types.save')}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────

interface DeleteDialogProps {
    target: SpeciesTypeDto | null;
    onClose: () => void;
}

function DeleteDialog({ target, onClose }: DeleteDialogProps) {
    const { t } = useTranslation();
    const { mutateAsync: deleteType, isPending } = useDeleteType();
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!target) return;
        setError(null);
        try {
            await deleteType(target.id);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('Catalog.form.errorUnexpected'));
        }
    };

    return (
        <Dialog open={!!target} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontSize: '1rem' }}>{t('Catalog.Types.deleteTitle')}</DialogTitle>
            <DialogContent>
                <DialogContentText variant="body2">
                    {t('Catalog.Types.deleteConfirm', { name: target?.name })}
                </DialogContentText>
                {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
            </DialogContent>
            <DialogActions>
                <Button size="small" onClick={onClose} disabled={isPending}>
                    {t('Common.cancel')}
                </Button>
                <Button
                    size="small"
                    color="error"
                    variant="contained"
                    onClick={handleDelete}
                    disabled={isPending}
                    sx={{ borderRadius: '4px' }}
                >
                    {isPending ? t('Catalog.Types.deleting') : t('Catalog.Types.deleteButton')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export const TypesPage: React.FC = () => {
    const { t } = useTranslation();

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(25);
    const [sortBy, setSortBy] = useState('Name');
    const [isAscending, setIsAscending] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<SpeciesTypeDto | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<SpeciesTypeDto | null>(null);

    const filter = useMemo<TypeFilter>(
        () => ({ page, size, searchTerm: searchTerm || undefined, sortBy, isAscending }),
        [page, size, searchTerm, sortBy, isAscending],
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

    const handleOpenCreate = useCallback(() => {
        setEditTarget(null);
        setDialogOpen(true);
    }, []);

    const handleOpenEdit = useCallback((row: SpeciesTypeDto) => {
        setEditTarget(row);
        setDialogOpen(true);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setDialogOpen(false);
        setEditTarget(null);
    }, []);

    const handleCloseDelete = useCallback(() => {
        setDeleteTarget(null);
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                        {t('Catalog.Types.pageTitle')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {t('Catalog.Types.pageSubtitle')}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{ bgcolor: 'primary.dark', '&:hover': { bgcolor: 'primary.main' }, borderRadius: '4px' }}
                >
                    {t('Catalog.Types.newEntry')}
                </Button>
            </Box>

            {/* Contextual info note */}
            <Alert
                severity="info"
                variant="outlined"
                sx={{ mb: 2, borderRadius: '4px', fontSize: '0.78rem', py: 0.5 }}
            >
                {t('Catalog.info.types')}
            </Alert>

            {/* Search */}
            <Box sx={{ mb: 2 }}>
                <TextField
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder={t('Catalog.Types.searchPlaceholder')}
                    size="small"
                    sx={{ minWidth: 280 }}
                    inputProps={{ id: 'search-types' }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                            </InputAdornment>
                        ),
                    }}
                />
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
                    <TypesTable
                        filter={filter}
                        onEdit={handleOpenEdit}
                        onDelete={setDeleteTarget}
                        onPageChange={setPage}
                        onRowsPerPageChange={(s) => { setSize(s); setPage(1); }}
                        sortBy={sortBy}
                        isAscending={isAscending}
                        onSortChange={handleSort}
                    />
                </Suspense>
            </Paper>

            {/* Create / Edit dialog */}
            <TypeDialog
                open={dialogOpen}
                editTarget={editTarget}
                onClose={handleCloseDialog}
            />

            {/* Delete confirmation */}
            <DeleteDialog
                target={deleteTarget}
                onClose={handleCloseDelete}
            />
        </Box>
    );
};

export default TypesPage;
