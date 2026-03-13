import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, useWatch } from 'react-hook-form';
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
    useCreateTag,
    useDeleteTag,
    useTagsPaginated,
    useUpdateTag,
} from '../hooks/useCatalog';
import type { CreateTagPayload, TagDto, TagFilter, UpdateTagPayload } from '../types';

// ─── Code Normalization (client-side preview) ─────────────────────────────────

/**
 * Mirrors the backend NormalizeCode logic so users see the final value in real time.
 * raw → TRIM → replace non-[A-Za-z0-9] runs with '_' → UPPERCASE → strip leading/trailing _ → collapse __
 */
function normalizeCode(raw: string): string {
    if (!raw.trim()) return '';
    const replaced = raw.trim().replace(/[^A-Za-z0-9]+/g, '_');
    const normalized = replaced.replace(/^_+|_+$/g, '').toUpperCase().replace(/_+/g, '_');
    return normalized;
}

// ─── Form types ───────────────────────────────────────────────────────────────

interface TagFormValues {
    code: string;
    name: string;
    description: string;
}

// ─── Tags Table (Suspense inner) ──────────────────────────────────────────────

interface TagsTableProps {
    filter: TagFilter;
    onEdit: (row: TagDto) => void;
    onDelete: (row: TagDto) => void;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (size: number) => void;
    sortBy: string;
    isAscending: boolean;
    onSortChange: (col: string) => void;
}

function TagsTable({
    filter,
    onEdit,
    onDelete,
    onPageChange,
    onRowsPerPageChange,
    sortBy,
    isAscending,
    onSortChange,
}: TagsTableProps) {
    const { t } = useTranslation();
    const { data } = useTagsPaginated(filter);

    return (
        <>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell sx={{ width: 200 }}>
                                <TableSortLabel
                                    active={sortBy === 'Code'}
                                    direction={isAscending ? 'asc' : 'desc'}
                                    onClick={() => onSortChange('Code')}
                                >
                                    {t('Catalog.Tags.colCode')}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortBy === 'Name'}
                                    direction={isAscending ? 'asc' : 'desc'}
                                    onClick={() => onSortChange('Name')}
                                >
                                    {t('Catalog.Tags.colName')}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>{t('Catalog.Tags.colDescription')}</TableCell>
                            <TableCell sx={{ width: 140 }}>{t('Catalog.Tags.colCreatedAt')}</TableCell>
                            <TableCell align="right" sx={{ width: 100 }}>{t('Catalog.Tags.colActions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('Catalog.Tags.noResults')}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                        {data.items.map((row) => (
                            <TableRow key={row.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                <TableCell>
                                    <Chip
                                        label={row.code}
                                        size="small"
                                        sx={{
                                            fontFamily: 'monospace',
                                            fontWeight: 700,
                                            fontSize: '0.72rem',
                                            bgcolor: 'action.selected',
                                            color: 'primary.light',
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={500}>
                                        {row.name}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            maxWidth: 360,
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
                                    <Tooltip title={t('Catalog.Tags.editTooltip')}>
                                        <IconButton size="small" onClick={() => onEdit(row)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('Catalog.Tags.deleteTooltip')}>
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

interface TagDialogProps {
    open: boolean;
    editTarget: TagDto | null; // null = create mode
    onClose: () => void;
}

function TagDialog({ open, editTarget, onClose }: TagDialogProps) {
    const { t } = useTranslation();
    const isEdit = editTarget !== null;

    const { mutateAsync: createTag, isPending: isCreating } = useCreateTag();
    const { mutateAsync: updateTag, isPending: isUpdating } = useUpdateTag();
    const isPending = isCreating || isUpdating;

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
        setError,
    } = useForm<TagFormValues>({
        defaultValues: {
            code: editTarget?.code ?? '',
            name: editTarget?.name ?? '',
            description: editTarget?.description ?? '',
        },
    });

    // Live preview of normalized code
    const rawCode = useWatch({ control, name: 'code' });
    const preview = normalizeCode(rawCode ?? '');

    React.useEffect(() => {
        reset({
            code: editTarget?.code ?? '',
            name: editTarget?.name ?? '',
            description: editTarget?.description ?? '',
        });
    }, [editTarget, reset]);

    const CODE_PATTERN = /^[A-Za-z][A-Za-z0-9 _\-]*$/;

    const onSubmit = handleSubmit(async (values) => {
        try {
            if (isEdit && editTarget) {
                const payload: UpdateTagPayload = {
                    code: values.code,
                    name: values.name,
                    description: values.description || undefined,
                };
                await updateTag({ id: editTarget.id, payload });
            } else {
                const payload: CreateTagPayload = {
                    code: values.code,
                    name: values.name,
                    description: values.description || undefined,
                };
                await createTag(payload);
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
                {isEdit ? t('Catalog.Tags.dialogEditTitle') : t('Catalog.Tags.dialogCreateTitle')}
            </DialogTitle>
            <Box component="form" onSubmit={onSubmit} noValidate>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    {errors.root && (
                        <Alert severity="error" sx={{ mb: 1 }}>
                            {errors.root.message}
                        </Alert>
                    )}

                    {/* Code field with live preview */}
                    <Box>
                        <TextField
                            {...register('code', {
                                required: t('Catalog.Tags.fieldCodeRequired'),
                                pattern: {
                                    value: CODE_PATTERN,
                                    message: t('Catalog.Tags.fieldCodePattern'),
                                },
                            })}
                            label={t('Catalog.Tags.fieldCode')}
                            size="small"
                            fullWidth
                            autoFocus
                            error={!!errors.code}
                            helperText={errors.code?.message ?? t('Catalog.Tags.fieldCodeHint')}
                            inputProps={{ id: 'field-tag-code', spellCheck: false }}
                        />
                        {/* Live normalized preview */}
                        {preview && (
                            <Box
                                sx={{
                                    mt: 0.75,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    pl: 0.5,
                                }}
                            >
                                <Typography variant="caption" color="text.secondary">
                                    {t('Catalog.Tags.codePreviewLabel')}
                                </Typography>
                                <Chip
                                    label={preview}
                                    size="small"
                                    sx={{
                                        fontFamily: 'monospace',
                                        fontWeight: 700,
                                        fontSize: '0.72rem',
                                        bgcolor: 'action.selected',
                                        color: 'primary.light',
                                    }}
                                />
                            </Box>
                        )}
                    </Box>

                    <TextField
                        {...register('name', { required: t('Catalog.Tags.fieldNameRequired') })}
                        label={t('Catalog.Tags.fieldName')}
                        size="small"
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        inputProps={{ id: 'field-tag-name' }}
                    />
                    <TextField
                        {...register('description')}
                        label={t('Catalog.Tags.fieldDescription')}
                        size="small"
                        fullWidth
                        multiline
                        minRows={2}
                        inputProps={{ id: 'field-tag-description' }}
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
                        {isPending ? t('Catalog.Tags.saving') : t('Catalog.Tags.save')}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────

interface DeleteDialogProps {
    target: TagDto | null;
    onClose: () => void;
}

function DeleteDialog({ target, onClose }: DeleteDialogProps) {
    const { t } = useTranslation();
    const { mutateAsync: deleteTag, isPending } = useDeleteTag();
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!target) return;
        setError(null);
        try {
            await deleteTag(target.id);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('Catalog.form.errorUnexpected'));
        }
    };

    return (
        <Dialog open={!!target} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontSize: '1rem' }}>{t('Catalog.Tags.deleteTitle')}</DialogTitle>
            <DialogContent>
                <DialogContentText variant="body2">
                    {t('Catalog.Tags.deleteConfirm', { code: target?.code })}
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
                    {isPending ? t('Catalog.Tags.deleting') : t('Catalog.Tags.deleteButton')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export const TagsPage: React.FC = () => {
    const { t } = useTranslation();

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(25);
    const [sortBy, setSortBy] = useState('Name');
    const [isAscending, setIsAscending] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<TagDto | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<TagDto | null>(null);

    const filter = useMemo<TagFilter>(
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

    const handleOpenEdit = useCallback((row: TagDto) => {
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
                        {t('Catalog.Tags.pageTitle')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {t('Catalog.Tags.pageSubtitle')}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{ bgcolor: 'primary.dark', '&:hover': { bgcolor: 'primary.main' }, borderRadius: '4px' }}
                >
                    {t('Catalog.Tags.newEntry')}
                </Button>
            </Box>

            {/* Contextual info note */}
            <Alert
                severity="info"
                variant="outlined"
                sx={{ mb: 2, borderRadius: '4px', fontSize: '0.78rem', py: 0.5 }}
            >
                {t('Catalog.info.tags')}
            </Alert>

            {/* Search */}
            <Box sx={{ mb: 2 }}>
                <TextField
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder={t('Catalog.Tags.searchPlaceholder')}
                    size="small"
                    sx={{ minWidth: 280 }}
                    inputProps={{ id: 'search-tags' }}
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
                    <TagsTable
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
            <TagDialog
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

export default TagsPage;
