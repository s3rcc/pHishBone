import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
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
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SearchIcon from '@mui/icons-material/Search';
import { SuspenseLoader } from '../../../components/layout/SuspenseLoader';
import { useMuiSnackbar } from '../../../hooks/useMuiSnackbar';
import { useAdminUsers, useUpdateAdminUserRole } from '../hooks/useAiManagement';
import type { AdminUserDto, AppRole, UpdateUserRolePayload } from '../types';

type UserSortKey = 'username' | 'email' | 'role';

interface UserTableProps {
    page: number;
    rowsPerPage: number;
    searchTerm: string;
    sortBy: UserSortKey;
    isAscending: boolean;
    onEdit: (user: AdminUserDto) => void;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (size: number) => void;
    onSortChange: (key: UserSortKey) => void;
}

interface RoleFormValues {
    role: AppRole;
}

const ROLE_COLORS: Record<AppRole, 'default' | 'info' | 'error'> = {
    Member: 'default',
    KnowledgeManager: 'info',
    Admin: 'error',
};

function UsersTable({
    page,
    rowsPerPage,
    searchTerm,
    sortBy,
    isAscending,
    onEdit,
    onPageChange,
    onRowsPerPageChange,
    onSortChange,
}: UserTableProps) {
    const { t } = useTranslation();
    const { data: users } = useAdminUsers();

    const roleLabels = useMemo<Record<AppRole, string>>(
        () => ({
            Admin: t('AiManagement.Users.roles.Admin'),
            KnowledgeManager: t('AiManagement.Users.roles.KnowledgeManager'),
            Member: t('AiManagement.Users.roles.Member'),
        }),
        [t],
    );

    const filteredUsers = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        const nextUsers = normalizedSearch
            ? users.filter((user) =>
                user.username.toLowerCase().includes(normalizedSearch)
                || user.email.toLowerCase().includes(normalizedSearch)
                || roleLabels[user.role].toLowerCase().includes(normalizedSearch))
            : users.slice();

        nextUsers.sort((left, right) => {
            const leftValue = sortBy === 'role' ? roleLabels[left.role] : left[sortBy];
            const rightValue = sortBy === 'role' ? roleLabels[right.role] : right[sortBy];
            const comparison = leftValue.localeCompare(rightValue, undefined, { sensitivity: 'base' });
            return isAscending ? comparison : -comparison;
        });

        return nextUsers;
    }, [isAscending, roleLabels, searchTerm, sortBy, users]);

    const paginatedUsers = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredUsers, page, rowsPerPage]);

    return (
        <>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell sx={{ width: 72 }}>{t('AiManagement.Users.colAvatar')}</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortBy === 'username'}
                                    direction={isAscending ? 'asc' : 'desc'}
                                    onClick={() => onSortChange('username')}
                                >
                                    {t('AiManagement.Users.colUsername')}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortBy === 'email'}
                                    direction={isAscending ? 'asc' : 'desc'}
                                    onClick={() => onSortChange('email')}
                                >
                                    {t('AiManagement.Users.colEmail')}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ width: 180 }}>
                                <TableSortLabel
                                    active={sortBy === 'role'}
                                    direction={isAscending ? 'asc' : 'desc'}
                                    onClick={() => onSortChange('role')}
                                >
                                    {t('AiManagement.Users.colRole')}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ width: 170 }}>{t('AiManagement.Users.colUserId')}</TableCell>
                            <TableCell align="right" sx={{ width: 100 }}>{t('AiManagement.Users.colActions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedUsers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('AiManagement.Users.noResults')}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                        {paginatedUsers.map((user) => (
                            <TableRow key={user.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                <TableCell>
                                    <Avatar
                                        src={user.avatarUrl ?? undefined}
                                        alt={user.username}
                                        sx={{ width: 34, height: 34, fontSize: '0.85rem', bgcolor: 'primary.dark' }}
                                    >
                                        {user.username.slice(0, 1).toUpperCase()}
                                    </Avatar>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={600}>
                                        {user.username}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {user.email}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={roleLabels[user.role]}
                                        size="small"
                                        color={ROLE_COLORS[user.role]}
                                        variant={user.role === 'Member' ? 'outlined' : 'filled'}
                                        sx={{ fontSize: '0.72rem', fontWeight: 600 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ fontFamily: 'monospace', fontSize: '0.76rem' }}
                                    >
                                        {user.id}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title={t('AiManagement.Users.editTooltip')}>
                                        <IconButton size="small" onClick={() => onEdit(user)}>
                                            <ManageAccountsIcon fontSize="small" />
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
                count={filteredUsers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, nextPage) => onPageChange(nextPage)}
                onRowsPerPageChange={(event) => onRowsPerPageChange(Number(event.target.value))}
            />
        </>
    );
}

interface RoleDialogProps {
    open: boolean;
    target: AdminUserDto | null;
    onClose: () => void;
}

function RoleDialog({ open, target, onClose }: RoleDialogProps) {
    const { t } = useTranslation();
    const { showSnackbar } = useMuiSnackbar();
    const { mutateAsync: updateRole, isPending } = useUpdateAdminUserRole();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
        setError,
    } = useForm<RoleFormValues>({
        defaultValues: {
            role: target?.role ?? 'Member',
        },
    });

    React.useEffect(() => {
        reset({
            role: target?.role ?? 'Member',
        });
    }, [reset, target]);

    const handleDialogClose = useCallback(() => {
        if (!isPending) {
            onClose();
        }
    }, [isPending, onClose]);

    const onSubmit = handleSubmit(async (values) => {
        if (!target) {
            return;
        }

        try {
            const payload: UpdateUserRolePayload = { role: values.role };
            await updateRole({ id: target.id, payload });
            showSnackbar(t('AiManagement.Users.updateSuccess', { name: target.username }), 'success');
            onClose();
        } catch (err: unknown) {
            setError('root', {
                message: err instanceof Error ? err.message : t('AiManagement.errorUnexpected'),
            });
        }
    });

    return (
        <Dialog open={open} onClose={handleDialogClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontSize: '1rem', fontWeight: 600 }}>
                {t('AiManagement.Users.dialogTitle')}
            </DialogTitle>
            <Box component="form" onSubmit={onSubmit} noValidate>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <DialogContentText variant="body2">
                        {t('AiManagement.Users.dialogSubtitle')}
                    </DialogContentText>

                    {errors.root && (
                        <Alert severity="error">
                            {errors.root.message}
                        </Alert>
                    )}

                    <Box
                        sx={{
                            p: 1.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: '4px',
                            bgcolor: 'background.default',
                        }}
                    >
                        <Typography variant="body2" fontWeight={600}>
                            {target?.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {target?.email}
                        </Typography>
                    </Box>

                    <Controller
                        name="role"
                        control={control}
                        render={({ field }) => (
                            <FormControl size="small" fullWidth>
                                <InputLabel id="user-role-label">{t('AiManagement.Users.fieldRole')}</InputLabel>
                                <Select
                                    {...field}
                                    labelId="user-role-label"
                                    label={t('AiManagement.Users.fieldRole')}
                                >
                                    <MenuItem value="Member">{t('AiManagement.Users.roles.Member')}</MenuItem>
                                    <MenuItem value="KnowledgeManager">{t('AiManagement.Users.roles.KnowledgeManager')}</MenuItem>
                                    <MenuItem value="Admin">{t('AiManagement.Users.roles.Admin')}</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    />

                    <Alert severity="info" variant="outlined" sx={{ fontSize: '0.78rem' }}>
                        {t('AiManagement.Users.roleHint')}
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button size="small" onClick={handleDialogClose} disabled={isPending}>
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

export const AdminUsersPage: React.FC = () => {
    const { t } = useTranslation();

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortBy, setSortBy] = useState<UserSortKey>('username');
    const [isAscending, setIsAscending] = useState(true);
    const [editTarget, setEditTarget] = useState<AdminUserDto | null>(null);

    const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(0);
    }, []);

    const handleSortChange = useCallback((key: UserSortKey) => {
        if (sortBy === key) {
            setIsAscending((prev) => !prev);
        } else {
            setSortBy(key);
            setIsAscending(true);
        }
        setPage(0);
    }, [sortBy]);

    const handleRowsPerPageChange = useCallback((size: number) => {
        setRowsPerPage(size);
        setPage(0);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setEditTarget(null);
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                        {t('AiManagement.Users.pageTitle')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {t('AiManagement.Users.pageSubtitle')}
                    </Typography>
                </Box>
            </Box>

            <Alert
                severity="info"
                variant="outlined"
                sx={{ mb: 2, borderRadius: '4px', fontSize: '0.78rem', py: 0.5 }}
            >
                {t('AiManagement.info.users')}
            </Alert>

            <Box sx={{ mb: 2 }}>
                <TextField
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder={t('AiManagement.Users.searchPlaceholder')}
                    size="small"
                    sx={{ minWidth: 320 }}
                    inputProps={{ id: 'search-admin-users' }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            <Paper
                elevation={0}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '4px', bgcolor: 'background.paper' }}
            >
                <Suspense
                    fallback={
                        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                            <SuspenseLoader />
                        </Box>
                    }
                >
                    <UsersTable
                        page={page}
                        rowsPerPage={rowsPerPage}
                        searchTerm={searchTerm}
                        sortBy={sortBy}
                        isAscending={isAscending}
                        onEdit={setEditTarget}
                        onPageChange={setPage}
                        onRowsPerPageChange={handleRowsPerPageChange}
                        onSortChange={handleSortChange}
                    />
                </Suspense>
            </Paper>

            <RoleDialog
                open={editTarget !== null}
                target={editTarget}
                onClose={handleCloseDialog}
            />
        </Box>
    );
};

export default AdminUsersPage;
