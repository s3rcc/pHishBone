import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
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
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
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
    useAiModelsPaginated,
    useCreateAiModel,
    useUpdateAiModel,
    useDeleteAiModel,
} from '../hooks/useAiManagement';
import type {
    AiModelConfigDto,
    AiModelConfigFilter,
    AiProvider,
    CreateAiModelConfigPayload,
    UpdateAiModelConfigPayload,
} from '../types';
import { AiProviderLabels } from '../types';

// ─── Form types ───────────────────────────────────────────────────────────────

interface ModelFormValues {
    displayName: string;
    provider: AiProvider;
    providerModelId: string;
    isEnabled: boolean;
    maxOutputTokens: string;
    temperature: string;
    timeoutSeconds: string;
    description: string;
}

// ─── Models Table (Suspense inner) ────────────────────────────────────────────

interface ModelsTableProps {
    filter: AiModelConfigFilter;
    onEdit: (row: AiModelConfigDto) => void;
    onDelete: (row: AiModelConfigDto) => void;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (size: number) => void;
    sortBy: string;
    isAscending: boolean;
    onSortChange: (col: string) => void;
}

function ModelsTable({
    filter,
    onEdit,
    onDelete,
    onPageChange,
    onRowsPerPageChange,
    sortBy,
    isAscending,
    onSortChange,
}: ModelsTableProps) {
    const { t } = useTranslation();
    const { data } = useAiModelsPaginated(filter);

    return (
        <>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell>
                                <TableSortLabel
                                    active={sortBy === 'DisplayName'}
                                    direction={isAscending ? 'asc' : 'desc'}
                                    onClick={() => onSortChange('DisplayName')}
                                >
                                    {t('AiManagement.Models.colDisplayName')}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ width: 130 }}>{t('AiManagement.Models.colProvider')}</TableCell>
                            <TableCell>{t('AiManagement.Models.colModelId')}</TableCell>
                            <TableCell sx={{ width: 90 }} align="center">{t('AiManagement.Models.colEnabled')}</TableCell>
                            <TableCell sx={{ width: 100 }}>{t('AiManagement.Models.colTemperature')}</TableCell>
                            <TableCell sx={{ width: 100 }}>{t('AiManagement.Models.colTimeout')}</TableCell>
                            <TableCell sx={{ width: 140 }}>
                                <TableSortLabel
                                    active={sortBy === 'CreatedTime'}
                                    direction={isAscending ? 'asc' : 'desc'}
                                    onClick={() => onSortChange('CreatedTime')}
                                >
                                    {t('AiManagement.Models.colCreatedAt')}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right" sx={{ width: 100 }}>{t('AiManagement.Models.colActions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('AiManagement.Models.noResults')}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                        {data.items.map((row) => (
                            <TableRow key={row.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={500}>
                                        {row.displayName}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={AiProviderLabels[row.provider]}
                                        size="small"
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: '0.72rem',
                                            bgcolor: row.provider === 0 ? 'info.main' : 'warning.main',
                                            color: '#fff',
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography
                                        variant="body2"
                                        sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'text.secondary' }}
                                    >
                                        {row.providerModelId}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={row.isEnabled ? t('AiManagement.enabled') : t('AiManagement.disabled')}
                                        size="small"
                                        color={row.isEnabled ? 'success' : 'default'}
                                        variant={row.isEnabled ? 'filled' : 'outlined'}
                                        sx={{ fontSize: '0.7rem' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption" color="text.secondary">
                                        {row.temperature !== null ? row.temperature : '—'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption" color="text.secondary">
                                        {row.timeoutSeconds}s
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
                                    <Tooltip title={t('AiManagement.Models.editTooltip')}>
                                        <IconButton size="small" onClick={() => onEdit(row)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('AiManagement.Models.deleteTooltip')}>
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

interface ModelDialogProps {
    open: boolean;
    editTarget: AiModelConfigDto | null;
    onClose: () => void;
}

function ModelDialog({ open, editTarget, onClose }: ModelDialogProps) {
    const { t } = useTranslation();
    const isEdit = editTarget !== null;

    const { mutateAsync: createModel, isPending: isCreating } = useCreateAiModel();
    const { mutateAsync: updateModel, isPending: isUpdating } = useUpdateAiModel();
    const isPending = isCreating || isUpdating;

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
        setError,
    } = useForm<ModelFormValues>({
        defaultValues: {
            displayName: editTarget?.displayName ?? '',
            provider: editTarget?.provider ?? 0,
            providerModelId: editTarget?.providerModelId ?? '',
            isEnabled: editTarget?.isEnabled ?? true,
            maxOutputTokens: editTarget?.maxOutputTokens?.toString() ?? '',
            temperature: editTarget?.temperature?.toString() ?? '',
            timeoutSeconds: editTarget?.timeoutSeconds?.toString() ?? '60',
            description: editTarget?.description ?? '',
        },
    });

    React.useEffect(() => {
        reset({
            displayName: editTarget?.displayName ?? '',
            provider: editTarget?.provider ?? 0,
            providerModelId: editTarget?.providerModelId ?? '',
            isEnabled: editTarget?.isEnabled ?? true,
            maxOutputTokens: editTarget?.maxOutputTokens?.toString() ?? '',
            temperature: editTarget?.temperature?.toString() ?? '',
            timeoutSeconds: editTarget?.timeoutSeconds?.toString() ?? '60',
            description: editTarget?.description ?? '',
        });
    }, [editTarget, reset]);

    const onSubmit = handleSubmit(async (values) => {
        try {
            const base = {
                displayName: values.displayName,
                provider: values.provider,
                providerModelId: values.providerModelId,
                isEnabled: values.isEnabled,
                maxOutputTokens: values.maxOutputTokens ? Number(values.maxOutputTokens) : null,
                temperature: values.temperature ? Number(values.temperature) : null,
                timeoutSeconds: Number(values.timeoutSeconds),
                description: values.description || null,
            };
            if (isEdit && editTarget) {
                const payload: UpdateAiModelConfigPayload = base;
                await updateModel({ id: editTarget.id, payload });
            } else {
                const payload: CreateAiModelConfigPayload = base;
                await createModel(payload);
            }
            onClose();
        } catch (err: unknown) {
            setError('root', {
                message: err instanceof Error ? err.message : t('AiManagement.errorUnexpected'),
            });
        }
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontSize: '1rem', fontWeight: 600 }}>
                {isEdit ? t('AiManagement.Models.dialogEditTitle') : t('AiManagement.Models.dialogCreateTitle')}
            </DialogTitle>
            <Box component="form" onSubmit={onSubmit} noValidate>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    {errors.root && (
                        <Alert severity="error" sx={{ mb: 1 }}>
                            {errors.root.message}
                        </Alert>
                    )}

                    <TextField
                        {...register('displayName', { required: t('AiManagement.Models.fieldDisplayNameRequired') })}
                        label={t('AiManagement.Models.fieldDisplayName')}
                        size="small"
                        fullWidth
                        autoFocus
                        error={!!errors.displayName}
                        helperText={errors.displayName?.message}
                        inputProps={{ id: 'field-model-display-name' }}
                    />

                    <Controller
                        name="provider"
                        control={control}
                        render={({ field }) => (
                            <FormControl size="small" fullWidth>
                                <InputLabel id="provider-label">{t('AiManagement.Models.fieldProvider')}</InputLabel>
                                <Select
                                    {...field}
                                    labelId="provider-label"
                                    label={t('AiManagement.Models.fieldProvider')}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                >
                                    <MenuItem value={0}>{AiProviderLabels[0]}</MenuItem>
                                    <MenuItem value={1}>{AiProviderLabels[1]}</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    />

                    <TextField
                        {...register('providerModelId', { required: t('AiManagement.Models.fieldModelIdRequired') })}
                        label={t('AiManagement.Models.fieldModelId')}
                        size="small"
                        fullWidth
                        error={!!errors.providerModelId}
                        helperText={errors.providerModelId?.message ?? t('AiManagement.Models.fieldModelIdHint')}
                        inputProps={{ id: 'field-model-provider-id', spellCheck: false }}
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            {...register('temperature', {
                                validate: (v) =>
                                    !v || (!isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 2) || t('AiManagement.Models.temperatureRange'),
                            })}
                            label={t('AiManagement.Models.fieldTemperature')}
                            size="small"
                            type="number"
                            sx={{ flex: 1 }}
                            error={!!errors.temperature}
                            helperText={errors.temperature?.message ?? '0 – 2'}
                            inputProps={{ id: 'field-model-temperature', step: 0.1, min: 0, max: 2 }}
                        />
                        <TextField
                            {...register('timeoutSeconds', {
                                required: t('AiManagement.Models.fieldTimeoutRequired'),
                                validate: (v) =>
                                    (!isNaN(Number(v)) && Number(v) > 0) || t('AiManagement.Models.timeoutPositive'),
                            })}
                            label={t('AiManagement.Models.fieldTimeout')}
                            size="small"
                            type="number"
                            sx={{ flex: 1 }}
                            error={!!errors.timeoutSeconds}
                            helperText={errors.timeoutSeconds?.message}
                            inputProps={{ id: 'field-model-timeout', min: 1 }}
                        />
                    </Box>

                    <TextField
                        {...register('maxOutputTokens', {
                            validate: (v) =>
                                !v || (!isNaN(Number(v)) && Number(v) > 0) || t('AiManagement.Models.tokensPositive'),
                        })}
                        label={t('AiManagement.Models.fieldMaxTokens')}
                        size="small"
                        type="number"
                        fullWidth
                        error={!!errors.maxOutputTokens}
                        helperText={errors.maxOutputTokens?.message}
                        inputProps={{ id: 'field-model-max-tokens', min: 1 }}
                    />

                    <TextField
                        {...register('description')}
                        label={t('AiManagement.Models.fieldDescription')}
                        size="small"
                        fullWidth
                        multiline
                        minRows={2}
                        inputProps={{ id: 'field-model-description' }}
                    />

                    <Controller
                        name="isEnabled"
                        control={control}
                        render={({ field }) => (
                            <FormControlLabel
                                control={<Switch {...field} checked={field.value} />}
                                label={t('AiManagement.Models.fieldEnabled')}
                            />
                        )}
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
                        {isPending ? t('AiManagement.saving') : t('AiManagement.save')}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────

interface DeleteDialogProps {
    target: AiModelConfigDto | null;
    onClose: () => void;
}

function DeleteDialog({ target, onClose }: DeleteDialogProps) {
    const { t } = useTranslation();
    const { mutateAsync: deleteModel, isPending } = useDeleteAiModel();
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!target) return;
        setError(null);
        try {
            await deleteModel(target.id);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('AiManagement.errorUnexpected'));
        }
    };

    return (
        <Dialog open={!!target} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontSize: '1rem' }}>{t('AiManagement.Models.deleteTitle')}</DialogTitle>
            <DialogContent>
                <DialogContentText variant="body2">
                    {t('AiManagement.Models.deleteConfirm', { name: target?.displayName })}
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
                    {isPending ? t('AiManagement.deleting') : t('AiManagement.deleteButton')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export const AiModelsPage: React.FC = () => {
    const { t } = useTranslation();

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(25);
    const [sortBy, setSortBy] = useState('DisplayName');
    const [isAscending, setIsAscending] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<AiModelConfigDto | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AiModelConfigDto | null>(null);

    const filter = useMemo<AiModelConfigFilter>(
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

    const handleOpenEdit = useCallback((row: AiModelConfigDto) => {
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
                        {t('AiManagement.Models.pageTitle')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {t('AiManagement.Models.pageSubtitle')}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{ bgcolor: 'primary.dark', '&:hover': { bgcolor: 'primary.main' }, borderRadius: '4px' }}
                >
                    {t('AiManagement.Models.newEntry')}
                </Button>
            </Box>

            {/* Contextual info note */}
            <Alert
                severity="info"
                variant="outlined"
                sx={{ mb: 2, borderRadius: '4px', fontSize: '0.78rem', py: 0.5 }}
            >
                {t('AiManagement.info.models')}
            </Alert>

            {/* Search */}
            <Box sx={{ mb: 2 }}>
                <TextField
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder={t('AiManagement.Models.searchPlaceholder')}
                    size="small"
                    sx={{ minWidth: 280 }}
                    inputProps={{ id: 'search-ai-models' }}
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
                    <ModelsTable
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
            <ModelDialog
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

export default AiModelsPage;
