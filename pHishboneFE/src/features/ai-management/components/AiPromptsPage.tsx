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
    useAiPromptsPaginated,
    useCreateAiPrompt,
    useUpdateAiPrompt,
    useDeleteAiPrompt,
} from '../hooks/useAiManagement';
import type {
    AiPromptTemplateDto,
    AiPromptTemplateFilter,
    AiPromptUseCase,
    CreateAiPromptTemplatePayload,
    UpdateAiPromptTemplatePayload,
} from '../types';
import { AiPromptUseCaseLabels } from '../types';

// ─── Form types ───────────────────────────────────────────────────────────────

interface PromptFormValues {
    name: string;
    useCase: AiPromptUseCase;
    systemPrompt: string;
    isEnabled: boolean;
    isActive: boolean;
    description: string;
    versionLabel: string;
}

// ─── Prompts Table (Suspense inner) ───────────────────────────────────────────

interface PromptsTableProps {
    filter: AiPromptTemplateFilter;
    onEdit: (row: AiPromptTemplateDto) => void;
    onDelete: (row: AiPromptTemplateDto) => void;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (size: number) => void;
    sortBy: string;
    isAscending: boolean;
    onSortChange: (col: string) => void;
}

function PromptsTable({
    filter,
    onEdit,
    onDelete,
    onPageChange,
    onRowsPerPageChange,
    sortBy,
    isAscending,
    onSortChange,
}: PromptsTableProps) {
    const { t } = useTranslation();
    const { data } = useAiPromptsPaginated(filter);

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
                                    {t('AiManagement.Prompts.colName')}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ width: 150 }}>{t('AiManagement.Prompts.colUseCase')}</TableCell>
                            <TableCell sx={{ width: 120 }}>{t('AiManagement.Prompts.colVersion')}</TableCell>
                            <TableCell sx={{ width: 90 }} align="center">{t('AiManagement.Prompts.colEnabled')}</TableCell>
                            <TableCell sx={{ width: 90 }} align="center">{t('AiManagement.Prompts.colActive')}</TableCell>
                            <TableCell sx={{ width: 140 }}>
                                <TableSortLabel
                                    active={sortBy === 'CreatedTime'}
                                    direction={isAscending ? 'asc' : 'desc'}
                                    onClick={() => onSortChange('CreatedTime')}
                                >
                                    {t('AiManagement.Prompts.colCreatedAt')}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right" sx={{ width: 100 }}>{t('AiManagement.Prompts.colActions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('AiManagement.Prompts.noResults')}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                        {data.items.map((row) => (
                            <TableRow key={row.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={500}>
                                        {row.name}
                                    </Typography>
                                    {row.description && (
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                                display: 'block',
                                                maxWidth: 300,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {row.description}
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={AiPromptUseCaseLabels[row.useCase]}
                                        size="small"
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: '0.72rem',
                                            bgcolor: 'secondary.dark',
                                            color: '#fff',
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption" color="text.secondary">
                                        {row.versionLabel ?? '—'}
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
                                <TableCell align="center">
                                    <Chip
                                        label={row.isActive ? t('AiManagement.active') : t('AiManagement.inactive')}
                                        size="small"
                                        color={row.isActive ? 'primary' : 'default'}
                                        variant={row.isActive ? 'filled' : 'outlined'}
                                        sx={{ fontSize: '0.7rem' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption" color="text.secondary">
                                        {row.createdTime
                                            ? new Date(row.createdTime).toLocaleDateString()
                                            : '—'}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title={t('AiManagement.Prompts.editTooltip')}>
                                        <IconButton size="small" onClick={() => onEdit(row)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('AiManagement.Prompts.deleteTooltip')}>
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

interface PromptDialogProps {
    open: boolean;
    editTarget: AiPromptTemplateDto | null;
    onClose: () => void;
}

function PromptDialog({ open, editTarget, onClose }: PromptDialogProps) {
    const { t } = useTranslation();
    const isEdit = editTarget !== null;

    const { mutateAsync: createPrompt, isPending: isCreating } = useCreateAiPrompt();
    const { mutateAsync: updatePrompt, isPending: isUpdating } = useUpdateAiPrompt();
    const isPending = isCreating || isUpdating;

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
        setError,
    } = useForm<PromptFormValues>({
        defaultValues: {
            name: editTarget?.name ?? '',
            useCase: editTarget?.useCase ?? 0,
            systemPrompt: editTarget?.systemPrompt ?? '',
            isEnabled: editTarget?.isEnabled ?? true,
            isActive: editTarget?.isActive ?? false,
            description: editTarget?.description ?? '',
            versionLabel: editTarget?.versionLabel ?? '',
        },
    });

    React.useEffect(() => {
        reset({
            name: editTarget?.name ?? '',
            useCase: editTarget?.useCase ?? 0,
            systemPrompt: editTarget?.systemPrompt ?? '',
            isEnabled: editTarget?.isEnabled ?? true,
            isActive: editTarget?.isActive ?? false,
            description: editTarget?.description ?? '',
            versionLabel: editTarget?.versionLabel ?? '',
        });
    }, [editTarget, reset]);

    const onSubmit = handleSubmit(async (values) => {
        try {
            const base = {
                name: values.name,
                useCase: values.useCase,
                systemPrompt: values.systemPrompt,
                isEnabled: values.isEnabled,
                isActive: values.isActive,
                description: values.description || null,
                versionLabel: values.versionLabel || null,
            };
            if (isEdit && editTarget) {
                const payload: UpdateAiPromptTemplatePayload = base;
                await updatePrompt({ id: editTarget.id, payload });
            } else {
                const payload: CreateAiPromptTemplatePayload = base;
                await createPrompt(payload);
            }
            onClose();
        } catch (err: unknown) {
            setError('root', {
                message: err instanceof Error ? err.message : t('AiManagement.errorUnexpected'),
            });
        }
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontSize: '1rem', fontWeight: 600 }}>
                {isEdit ? t('AiManagement.Prompts.dialogEditTitle') : t('AiManagement.Prompts.dialogCreateTitle')}
            </DialogTitle>
            <Box component="form" onSubmit={onSubmit} noValidate>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    {errors.root && (
                        <Alert severity="error" sx={{ mb: 1 }}>
                            {errors.root.message}
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            {...register('name', { required: t('AiManagement.Prompts.fieldNameRequired') })}
                            label={t('AiManagement.Prompts.fieldName')}
                            size="small"
                            autoFocus
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            sx={{ flex: 2 }}
                            inputProps={{ id: 'field-prompt-name' }}
                        />

                        <Controller
                            name="useCase"
                            control={control}
                            render={({ field }) => (
                                <FormControl size="small" sx={{ flex: 1 }}>
                                    <InputLabel id="use-case-label">{t('AiManagement.Prompts.fieldUseCase')}</InputLabel>
                                    <Select
                                        {...field}
                                        labelId="use-case-label"
                                        label={t('AiManagement.Prompts.fieldUseCase')}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    >
                                        <MenuItem value={0}>{AiPromptUseCaseLabels[0]}</MenuItem>
                                    </Select>
                                </FormControl>
                            )}
                        />
                    </Box>

                    <TextField
                        {...register('systemPrompt', { required: t('AiManagement.Prompts.fieldSystemPromptRequired') })}
                        label={t('AiManagement.Prompts.fieldSystemPrompt')}
                        size="small"
                        fullWidth
                        multiline
                        minRows={6}
                        maxRows={16}
                        error={!!errors.systemPrompt}
                        helperText={errors.systemPrompt?.message ?? t('AiManagement.Prompts.fieldSystemPromptHint')}
                        inputProps={{ id: 'field-prompt-system', spellCheck: false }}
                        sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            {...register('versionLabel')}
                            label={t('AiManagement.Prompts.fieldVersion')}
                            size="small"
                            sx={{ flex: 1 }}
                            inputProps={{ id: 'field-prompt-version' }}
                            helperText={t('AiManagement.Prompts.fieldVersionHint')}
                        />
                        <TextField
                            {...register('description')}
                            label={t('AiManagement.Prompts.fieldDescription')}
                            size="small"
                            sx={{ flex: 2 }}
                            inputProps={{ id: 'field-prompt-description' }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 3 }}>
                        <Controller
                            name="isEnabled"
                            control={control}
                            render={({ field }) => (
                                <FormControlLabel
                                    control={<Switch {...field} checked={field.value} />}
                                    label={t('AiManagement.Prompts.fieldEnabled')}
                                />
                            )}
                        />
                        <Controller
                            name="isActive"
                            control={control}
                            render={({ field }) => (
                                <FormControlLabel
                                    control={<Switch {...field} checked={field.value} color="primary" />}
                                    label={t('AiManagement.Prompts.fieldActive')}
                                />
                            )}
                        />
                    </Box>
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
    target: AiPromptTemplateDto | null;
    onClose: () => void;
}

function DeleteDialog({ target, onClose }: DeleteDialogProps) {
    const { t } = useTranslation();
    const { mutateAsync: deletePrompt, isPending } = useDeleteAiPrompt();
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!target) return;
        setError(null);
        try {
            await deletePrompt(target.id);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('AiManagement.errorUnexpected'));
        }
    };

    return (
        <Dialog open={!!target} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontSize: '1rem' }}>{t('AiManagement.Prompts.deleteTitle')}</DialogTitle>
            <DialogContent>
                <DialogContentText variant="body2">
                    {t('AiManagement.Prompts.deleteConfirm', { name: target?.name })}
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

export const AiPromptsPage: React.FC = () => {
    const { t } = useTranslation();

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(25);
    const [sortBy, setSortBy] = useState('Name');
    const [isAscending, setIsAscending] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<AiPromptTemplateDto | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AiPromptTemplateDto | null>(null);

    const filter = useMemo<AiPromptTemplateFilter>(
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

    const handleOpenEdit = useCallback((row: AiPromptTemplateDto) => {
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
                        {t('AiManagement.Prompts.pageTitle')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {t('AiManagement.Prompts.pageSubtitle')}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{ bgcolor: 'primary.dark', '&:hover': { bgcolor: 'primary.main' }, borderRadius: '4px' }}
                >
                    {t('AiManagement.Prompts.newEntry')}
                </Button>
            </Box>

            {/* Contextual info note */}
            <Alert
                severity="info"
                variant="outlined"
                sx={{ mb: 2, borderRadius: '4px', fontSize: '0.78rem', py: 0.5 }}
            >
                {t('AiManagement.info.prompts')}
            </Alert>

            {/* Search */}
            <Box sx={{ mb: 2 }}>
                <TextField
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder={t('AiManagement.Prompts.searchPlaceholder')}
                    size="small"
                    sx={{ minWidth: 280 }}
                    inputProps={{ id: 'search-ai-prompts' }}
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
                    <PromptsTable
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
            <PromptDialog
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

export default AiPromptsPage;
