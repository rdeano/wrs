import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Pagination,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import SearchIcon      from '@mui/icons-material/Search';
import EditIcon        from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon         from '@mui/icons-material/Add';
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';

const ROLE_COLORS = {
    admin:   'error',
    manager: 'warning',
    cashier: 'info',
};

export default function UsersIndex({ users, filters, roles }) {
    const { flash } = usePage().props;
    const [search, setSearch]   = useState(filters.search ?? '');
    const [role,   setRole]     = useState(filters.role   ?? '');
    const [status, setStatus]   = useState(filters.status ?? '');
    const [deleteTarget, setDeleteTarget] = useState(null);

    const applyFilters = useCallback(
        debounce((params) => {
            router.get(route('admin.users.index'), params, { preserveState: true, replace: true });
        }, 350),
        [],
    );

    const handleSearch = (value) => {
        setSearch(value);
        applyFilters({ search: value, role, status });
    };

    const handleRole = (value) => {
        setRole(value);
        applyFilters({ search, role: value, status });
    };

    const handleStatus = (value) => {
        setStatus(value);
        applyFilters({ search, role, status: value });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(route('admin.users.destroy', deleteTarget.id), {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const handlePageChange = (_, page) => {
        router.get(route('admin.users.index'), { ...filters, page }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>Staff Accounts</Typography>
                    <Button
                        component={Link}
                        href={route('admin.users.create')}
                        variant="contained"
                        startIcon={<AddIcon />}
                        size="small"
                    >
                        New Staff
                    </Button>
                </Stack>
            }
        >
            <Head title="Staff Accounts" />

            <Box>
                {flash?.success && <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>}
                {flash?.error   && <Alert severity="error"   sx={{ mb: 2 }}>{flash.error}</Alert>}

                {/* Filters */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
                    <TextField
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search name or email…"
                        size="small"
                        sx={{ minWidth: 240 }}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
                    />
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Role</InputLabel>
                        <Select label="Role" value={role} onChange={(e) => handleRole(e.target.value)}>
                            <MenuItem value="">All roles</MenuItem>
                            {roles.map((r) => (
                                <MenuItem key={r} value={r} sx={{ textTransform: 'capitalize' }}>{r}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Status</InputLabel>
                        <Select label="Status" value={status} onChange={(e) => handleStatus(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                <Paper variant="outlined">
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell align="center">Role</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell>Last Login</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No staff accounts found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {users.data.map((user) => {
                                    const roleName = user.roles?.[0]?.name;
                                    return (
                                        <TableRow key={user.id} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={500}>{user.name}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                {roleName ? (
                                                    <Chip
                                                        label={roleName}
                                                        size="small"
                                                        color={ROLE_COLORS[roleName] ?? 'default'}
                                                        variant="outlined"
                                                        sx={{ textTransform: 'capitalize', fontSize: 11 }}
                                                    />
                                                ) : (
                                                    <Typography variant="body2" color="text.disabled">—</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={user.is_active ? 'Active' : 'Inactive'}
                                                    size="small"
                                                    color={user.is_active ? 'success' : 'default'}
                                                    variant={user.is_active ? 'filled' : 'outlined'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {user.last_login_at
                                                        ? new Date(user.last_login_at).toLocaleDateString()
                                                        : '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                    <Tooltip title="Edit">
                                                        <Button
                                                            component={Link}
                                                            href={route('admin.users.edit', user.id)}
                                                            size="small"
                                                            startIcon={<EditIcon fontSize="small" />}
                                                        >
                                                            Edit
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            startIcon={<DeleteOutlineIcon fontSize="small" />}
                                                            onClick={() => setDeleteTarget(user)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {users.last_page > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <Pagination
                                count={users.last_page}
                                page={users.current_page}
                                onChange={handlePageChange}
                                color="primary"
                                size="small"
                            />
                        </Box>
                    )}
                </Paper>
            </Box>

            {/* Delete confirmation */}
            <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Delete Staff Account?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        "{deleteTarget?.name}" will be permanently removed. This cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
