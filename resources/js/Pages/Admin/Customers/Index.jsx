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
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';

const TYPE_COLORS = {
    regular:  'default',
    suki:     'info',
    bulk:     'warning',
    business: 'success',
};

function BalanceChip({ balance }) {
    const val = parseFloat(balance);
    if (val <= 0) return <Typography variant="body2" color="text.secondary">—</Typography>;
    return (
        <Chip
            label={`₱${val.toFixed(2)}`}
            size="small"
            color="error"
            variant="outlined"
        />
    );
}

export default function CustomersIndex({ customers, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [type,   setType]   = useState(filters.type   ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [deleteTarget, setDeleteTarget] = useState(null);

    const applyFilters = useCallback(
        debounce((params) => {
            router.get(route('admin.customers.index'), params, { preserveState: true, replace: true });
        }, 350),
        [],
    );

    const handleSearch = (value) => {
        setSearch(value);
        applyFilters({ search: value, type, status });
    };

    const handleType = (value) => {
        setType(value);
        applyFilters({ search, type: value, status });
    };

    const handleStatus = (value) => {
        setStatus(value);
        applyFilters({ search, type, status: value });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(route('admin.customers.destroy', deleteTarget.id), {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const handlePageChange = (_, page) => {
        router.get(route('admin.customers.index'), { ...filters, page }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>Customers</Typography>
                    <Button
                        component={Link}
                        href={route('admin.customers.create')}
                        variant="contained"
                        startIcon={<AddIcon />}
                        size="small"
                    >
                        New Customer
                    </Button>
                </Stack>
            }
        >
            <Head title="Customers" />

            <Box>
                {flash?.success && <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>}
                {flash?.error   && <Alert severity="error"   sx={{ mb: 2 }}>{flash.error}</Alert>}

                {/* Filters */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
                    <TextField
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search name, phone, email…"
                        size="small"
                        sx={{ minWidth: 240 }}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
                    />
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Type</InputLabel>
                        <Select label="Type" value={type} onChange={(e) => handleType(e.target.value)}>
                            <MenuItem value="">All types</MenuItem>
                            <MenuItem value="regular">Regular</MenuItem>
                            <MenuItem value="suki">Suki</MenuItem>
                            <MenuItem value="bulk">Bulk</MenuItem>
                            <MenuItem value="business">Business</MenuItem>
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
                                    <TableCell>Contact</TableCell>
                                    <TableCell>Zone</TableCell>
                                    <TableCell align="right">Credit Limit</TableCell>
                                    <TableCell align="right">Balance</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {customers.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No customers found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {customers.data.map((customer) => (
                                    <TableRow key={customer.id} hover>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Chip
                                                    label={customer.type}
                                                    size="small"
                                                    color={TYPE_COLORS[customer.type] ?? 'default'}
                                                    variant="outlined"
                                                    sx={{ fontSize: 10, height: 20 }}
                                                />
                                                <Typography variant="body2" fontWeight={500}>
                                                    {customer.name}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {customer.phone ?? '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {customer.delivery_zone?.name ?? '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2">
                                                {customer.credit_limit
                                                    ? `₱${parseFloat(customer.credit_limit).toFixed(2)}`
                                                    : <Typography component="span" variant="body2" color="text.secondary">Default</Typography>
                                                }
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <BalanceChip balance={customer.outstanding_balance} />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={customer.is_active ? 'Active' : 'Inactive'}
                                                size="small"
                                                color={customer.is_active ? 'success' : 'default'}
                                                variant={customer.is_active ? 'filled' : 'outlined'}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                <Tooltip title="Credit Ledger">
                                                    <Button
                                                        component={Link}
                                                        href={route('admin.customers.show', customer.id)}
                                                        size="small"
                                                        startIcon={<AccountBalanceWalletIcon fontSize="small" />}
                                                    >
                                                        Ledger
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <Button
                                                        component={Link}
                                                        href={route('admin.customers.edit', customer.id)}
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
                                                        onClick={() => setDeleteTarget(customer)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {customers.last_page > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <Pagination
                                count={customers.last_page}
                                page={customers.current_page}
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
                <DialogTitle>Delete Customer?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        "{deleteTarget?.name}" will be soft-deleted. Their order history will be preserved.
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
