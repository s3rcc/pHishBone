import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
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
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import {
    useCompatibilityRulesPaginated,
    useCreateCompatibilityRule,
    useDeleteCompatibilityRule,
    useTagsList,
    useUpdateCompatibilityRule,
} from '../hooks/useCatalog';
import type {
    CompatibilitySeverity,
    CompatibilityRuleDto,
    CompatibilityRuleFilter,
    TagDto,
} from '../types';

// ─── Severity helpers ─────────────────────────────────────────────────────────

const SEVERITY_OPTIONS: ReadonlyArray<{ value: CompatibilitySeverity; label: string }> = [
    { value: 0, label: 'Info' },
    { value: 1, label: 'Warning' },
    { value: 2, label: 'Danger' },
];

function severityLabelToValue(severity: string | undefined): CompatibilitySeverity {
    switch (severity) {
        case 'Danger':
            return 2;
        case 'Warning':
            return 1;
        case 'Info':
            return 0;
        default:
            return 1;
    }
}

function severityChipColor(severity: string): 'default' | 'warning' | 'error' {
    switch (severity) {
        case 'Warning': return 'warning';
        case 'Danger': return 'error';
        default: return 'default';
    }
}

// ─── Form types ───────────────────────────────────────────────────────────────

interface RuleFormValues {
    subjectTagId: string;
    objectTagId: string;
    severity: CompatibilitySeverity;
    message: string;
}

function getRuleFormDefaults(editTarget: CompatibilityRuleDto | null): RuleFormValues {
    return {
        subjectTagId: editTarget?.subjectTagId ?? '',
        objectTagId: editTarget?.objectTagId ?? '',
        severity: severityLabelToValue(editTarget?.severity ?? 'Warning'),
        message: editTarget?.message ?? '',
    };
}

// ─── Rules Table (Suspense inner) ─────────────────────────────────────────────

interface RulesTableProps {
    filter: CompatibilityRuleFilter;
    onEdit: (row: CompatibilityRuleDto) => void;
    onDelete: (row: CompatibilityRuleDto) => void;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (size: number) => void;
}

function RulesTable({
    filter,
    onEdit,
    onDelete,
    onPageChange,
    onRowsPerPageChange,
}: RulesTableProps) {
    const { t } = useTranslation();
    const { data } = useCompatibilityRulesPaginated(filter);

    return (
        <>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell>{t('Catalog.Rules.colSubject')}</TableCell>
                            <TableCell sx={{ width: 40, textAlign: 'center' }}></TableCell>
                            <TableCell>{t('Catalog.Rules.colObject')}</TableCell>
                            <TableCell sx={{ width: 120 }}>{t('Catalog.Rules.colSeverity')}</TableCell>
                            <TableCell>{t('Catalog.Rules.colMessage')}</TableCell>
                            <TableCell align="right" sx={{ width: 100 }}>{t('Catalog.Rules.colActions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('Catalog.Rules.noResults')}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                        {data.items.map((row) => (
                            <TableRow key={row.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                <TableCell>
                                    <Chip
                                        label={row.subjectTagName}
                                        size="small"
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                            bgcolor: 'action.selected',
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>
                                    <ArrowForwardIcon
                                        sx={{ fontSize: 16, color: 'text.disabled', verticalAlign: 'middle' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={row.objectTagName}
                                        size="small"
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                            bgcolor: 'action.selected',
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={t(`Catalog.Rules.severity${row.severity}`)}
                                        size="small"
                                        color={severityChipColor(row.severity)}
                                        variant="filled"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Tooltip title={row.message} placement="top-start">
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
                                            {row.message}
                                        </Typography>
                                    </Tooltip>
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title={t('Catalog.Rules.editTooltip')}>
                                        <IconButton size="small" onClick={() => onEdit(row)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('Catalog.Rules.deleteTooltip')}>
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

// ─── Tag Autocomplete options loader (Suspense inner) ─────────────────────────

function TagOptions({ children }: { children: (tags: TagDto[]) => React.ReactNode }) {
    const { data: tags } = useTagsList();
    return <>{children(tags as TagDto[])}</>;
}

// ─── Rule Editor Dialog ───────────────────────────────────────────────────────

interface RuleEditorDialogProps {
    open: boolean;
    editTarget: CompatibilityRuleDto | null;
    onClose: () => void;
}

function RuleEditorDialog({ open, editTarget, onClose }: RuleEditorDialogProps) {
    const { t } = useTranslation();
    const isEdit = editTarget !== null;

    const { mutateAsync: createRule, isPending: isCreating } = useCreateCompatibilityRule();
    const { mutateAsync: updateRule, isPending: isUpdating } = useUpdateCompatibilityRule();
    const isPending = isCreating || isUpdating;

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
        setError,
    } = useForm<RuleFormValues>({
        defaultValues: getRuleFormDefaults(editTarget),
    });

    React.useEffect(() => {
        if (!open) {
            return;
        }

        reset(getRuleFormDefaults(editTarget));
    }, [editTarget, open, reset]);

    const subjectTagId = watch('subjectTagId');
    const objectTagId = watch('objectTagId');
    const isSelfReference = subjectTagId !== '' && objectTagId !== '' && subjectTagId === objectTagId;

    const onSubmit = handleSubmit(async (values) => {
        try {
            if (isEdit && editTarget) {
                await updateRule({
                    id: editTarget.id,
                    payload: { severity: values.severity, message: values.message },
                });
            } else {
                await createRule({
                    subjectTagId: values.subjectTagId,
                    objectTagId: values.objectTagId,
                    severity: values.severity,
                    message: values.message,
                });
            }
            onClose();
        } catch (err: unknown) {
            setError('root', {
                message: err instanceof Error ? err.message : t('Catalog.form.errorUnexpected'),
            });
        }
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontSize: '1rem', fontWeight: 600 }}>
                {isEdit ? t('Catalog.Rules.dialogEditTitle') : t('Catalog.Rules.dialogCreateTitle')}
            </DialogTitle>
            <Box component="form" onSubmit={onSubmit} noValidate>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    {errors.root && (
                        <Alert severity="error" sx={{ mb: 1 }}>
                            {errors.root.message}
                        </Alert>
                    )}

                    {/* Natural language row: [Subject] + [Severity] + [Object] */}
                    <Suspense fallback={<CircularProgress size={20} />}>
                        <TagOptions>
                            {(tags) => (
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    {/* Subject Tag */}
                                    <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                                        <Controller
                                            name="subjectTagId"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <Autocomplete
                                                    options={tags}
                                                    getOptionLabel={(o) => o.name}
                                                    value={tags.find((t) => t.id === field.value) ?? null}
                                                    onChange={(_, v) => field.onChange(v?.id ?? '')}
                                                    disabled={isEdit}
                                                    size="small"
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label={t('Catalog.Rules.fieldSubjectTag')}
                                                            error={!!errors.subjectTagId}
                                                        />
                                                    )}
                                                />
                                            )}
                                        />
                                    </Box>

                                    {/* Severity */}
                                    <Box sx={{ flex: '0 0 160px', minWidth: 140 }}>
                                        <Controller
                                            name="severity"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <TextField
                                                    select
                                                    value={field.value}
                                                    onChange={(event) =>
                                                        field.onChange(Number(event.target.value) as CompatibilitySeverity)
                                                    }
                                                    label={t('Catalog.Rules.fieldSeverity')}
                                                    size="small"
                                                    fullWidth
                                                    error={!!errors.severity}
                                                >
                                                    {SEVERITY_OPTIONS.map((severityOption) => (
                                                        <MenuItem
                                                            key={severityOption.value}
                                                            value={severityOption.value}
                                                        >
                                                            <Chip
                                                                label={t(`Catalog.Rules.severity${severityOption.label}`)}
                                                                size="small"
                                                                color={severityChipColor(severityOption.label)}
                                                                variant="filled"
                                                                sx={{ pointerEvents: 'none' }}
                                                            />
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            )}
                                        />
                                    </Box>

                                    {/* Object Tag */}
                                    <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                                        <Controller
                                            name="objectTagId"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <Autocomplete
                                                    options={tags}
                                                    getOptionLabel={(o) => o.name}
                                                    value={tags.find((t) => t.id === field.value) ?? null}
                                                    onChange={(_, v) => field.onChange(v?.id ?? '')}
                                                    disabled={isEdit}
                                                    size="small"
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label={t('Catalog.Rules.fieldObjectTag')}
                                                            error={!!errors.objectTagId || isSelfReference}
                                                        />
                                                    )}
                                                />
                                            )}
                                        />
                                    </Box>
                                </Box>
                            )}
                        </TagOptions>
                    </Suspense>

                    {/* Self-reference error */}
                    {isSelfReference && (
                        <Alert severity="error" sx={{ py: 0.5 }}>
                            {t('Catalog.Rules.selfReferenceError')}
                        </Alert>
                    )}

                    {/* Tags disabled hint */}
                    {isEdit && (
                        <Typography variant="caption" color="text.disabled" sx={{ mt: -1 }}>
                            {t('Catalog.Rules.tagsDisabledHint')}
                        </Typography>
                    )}

                    {/* Message */}
                    <Controller
                        name="message"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label={t('Catalog.Rules.fieldMessage')}
                                placeholder={t('Catalog.Rules.fieldMessagePlaceholder')}
                                size="small"
                                fullWidth
                                multiline
                                minRows={2}
                                maxRows={5}
                                error={!!errors.message}
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
                        disabled={isPending || isSelfReference}
                        sx={{ bgcolor: 'primary.dark', '&:hover': { bgcolor: 'primary.main' }, borderRadius: '4px' }}
                    >
                        {isPending ? t('Catalog.Rules.saving') : t('Catalog.Rules.save')}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────

interface DeleteDialogProps {
    target: CompatibilityRuleDto | null;
    onClose: () => void;
}

function DeleteDialog({ target, onClose }: DeleteDialogProps) {
    const { t } = useTranslation();
    const { mutateAsync: deleteRule, isPending } = useDeleteCompatibilityRule();
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!target) return;
        setError(null);
        try {
            await deleteRule(target.id);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('Catalog.form.errorUnexpected'));
        }
    };

    return (
        <Dialog open={!!target} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontSize: '1rem' }}>{t('Catalog.Rules.deleteTitle')}</DialogTitle>
            <DialogContent>
                <DialogContentText variant="body2">
                    {t('Catalog.Rules.deleteConfirm', {
                        subject: target?.subjectTagName,
                        object: target?.objectTagName,
                    })}
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
                    {isPending ? t('Catalog.Rules.deleting') : t('Catalog.Rules.deleteButton')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export const CompatibilityRulesPage: React.FC = () => {
    const { t } = useTranslation();

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(25);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<CompatibilityRuleDto | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CompatibilityRuleDto | null>(null);

    const filter = useMemo<CompatibilityRuleFilter>(
        () => ({ page, size, searchTerm: searchTerm || undefined }),
        [page, size, searchTerm],
    );

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    }, []);

    const handleOpenCreate = useCallback(() => {
        setEditTarget(null);
        setDialogOpen(true);
    }, []);

    const handleOpenEdit = useCallback((row: CompatibilityRuleDto) => {
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
                        {t('Catalog.Rules.pageTitle')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {t('Catalog.Rules.pageSubtitle')}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{ bgcolor: 'primary.dark', '&:hover': { bgcolor: 'primary.main' }, borderRadius: '4px' }}
                >
                    {t('Catalog.Rules.newRule')}
                </Button>
            </Box>

            {/* Contextual info note */}
            <Alert
                severity="info"
                variant="outlined"
                sx={{ mb: 2, borderRadius: '4px', fontSize: '0.78rem', py: 0.5 }}
            >
                {t('Catalog.info.rules')}
            </Alert>

            {/* Search */}
            <Box sx={{ mb: 2 }}>
                <TextField
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder={t('Catalog.Rules.searchPlaceholder')}
                    size="small"
                    sx={{ minWidth: 320 }}
                    inputProps={{ id: 'search-rules' }}
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
                    <RulesTable
                        filter={filter}
                        onEdit={handleOpenEdit}
                        onDelete={setDeleteTarget}
                        onPageChange={setPage}
                        onRowsPerPageChange={(s) => { setSize(s); setPage(1); }}
                    />
                </Suspense>
            </Paper>

            {/* Editor dialog */}
            <RuleEditorDialog
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

export default CompatibilityRulesPage;
