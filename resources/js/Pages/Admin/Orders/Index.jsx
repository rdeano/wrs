import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Alert,
    Box,
    Button,
    Chip,
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
    Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';

const PAYMENT_STATUS_COLOR = {
    paid:    'success',
    partial: 'warning',
    credit:  'info',
    unpaid:  'error',
};

const STATUS_COLOR = {
    completed: 'success',
    voided:    'error',
    pending:   'warning',
};

export default function OrdersIndex({ orders, filters }) {
    const { flash } = usePage().props;
    const [search,         setSearch]         = useState(filters.search         ?? '');
    const [status,         setStatus]         = useState(filters.status         ?? '');
    const [paymentStatus,  setPaymentStatus]  = useState(filters.payment_status ?? '');
    const [dateFrom,       setDateFrom]       = useState(filters.date_from      ?? '');
    const [dateTo,         setDateTo]         = useState(filters.date_to        ?? '');

    const applyFilters = useCallback(
        debounce((params) => {
            router.get(route('admin.orders.index'), params, { preserveState: true, replace: true });
        }, 350),
        [],
    );

    const handleSearch = (value) => {
        setSearch(value);
        applyFilters({ search: value, status, payment_status: paymentStatus, date_from: dateFrom, date_to: dateTo });
    };

    const handleFilter = (key, value, setter) => {
        setter(value);
        applyFilters({
            search,
            status:         key === 'status'         ? value : status,
            payment_status: key === 'payment_status' ? value : paymentStatus,
            date_from:      key === 'date_from'      ? value : dateFrom,
            date_to:        key === 'date_to'        ? value : dateTo,
        });
    };

    const handlePageChange = (_, page) => {
        router.get(route('admin.orders.index'), { ...filters, page }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>Orders</Typography>
                    <Button
                        component={Link}
                        href={route('admin.orders.create')}
                        variant="contained"
                        startIcon={<AddIcon />}
                        size="small"
                    >
                        New Order (POS)
                    </Button>
                </Stack>
            }
        >
            <Head title="Orders" />

            <Box>
                {flash?.success && <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>}
                {flash?.error   && <Alert severity="error"   sx={{ mb: 2 }}>{flash.error}</Alert>}

                {/* Filters */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" sx={{ mb: 2 }}>
                    <TextField
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search customer…"
                        size="small"
                        sx={{ minWidth: 200 }}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
                    />
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Status</InputLabel>
                        <Select label="Status" value={status} onChange={(e) => handleFilter('status', e.target.value, setStatus)}>
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="voided">Voided</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Payment</InputLabel>
                        <Select label="Payment" value={paymentStatus} onChange={(e) => handleFilter('payment_status', e.target.value, setPaymentStatus)}>
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="paid">Paid</MenuItem>
                            <MenuItem value="partial">Partial</MenuItem>
                            <MenuItem value="credit">Credit</MenuItem>
                            <MenuItem value="unpaid">Unpaid</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        type="date"
                        label="From"
                        value={dateFrom}
                        onChange={(e) => handleFilter('date_from', e.target.value, setDateFrom)}
                        size="small"
                        sx={{ minWidth: 150 }}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                        type="date"
                        label="To"
                        value={dateTo}
                        onChange={(e) => handleFilter('date_to', e.target.value, setDateTo)}
                        size="small"
                        sx={{ minWidth: 150 }}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                </Stack>

                <Paper variant="outlined">
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                                    <TableCell>#</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell align="center">Items</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="center">Payment</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No orders found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {orders.data.map((order) => (
                                    <TableRow key={order.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                                                #{order.id}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {new Date(order.created_at).toLocaleDateString('en-PH', {
                                                    month: 'short', day: 'numeric', year: 'numeric',
                                                })}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(order.created_at).toLocaleTimeString('en-PH', {
                                                    hour: '2-digit', minute: '2-digit',
                                                })}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {order.customer?.name ?? <Typography component="span" variant="body2" color="text.secondary">Walk-in</Typography>}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={order.type} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2">{order.items_count}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight={600}>
                                                ₱{parseFloat(order.total).toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={order.status}
                                                size="small"
                                                color={STATUS_COLOR[order.status] ?? 'default'}
                                                variant={order.status === 'voided' ? 'outlined' : 'filled'}
                                                sx={{ fontSize: 10, height: 20 }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={order.payment_status}
                                                size="small"
                                                color={PAYMENT_STATUS_COLOR[order.payment_status] ?? 'default'}
                                                variant="outlined"
                                                sx={{ fontSize: 10, height: 20 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                component={Link}
                                                href={route('admin.orders.show', order.id)}
                                                size="small"
                                                startIcon={<ReceiptIcon fontSize="small" />}
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {orders.last_page > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <Pagination
                                count={orders.last_page}
                                page={orders.current_page}
                                onChange={handlePageChange}
                                color="primary"
                                size="small"
                            />
                        </Box>
                    )}
                </Paper>
            </Box>
        </AuthenticatedLayout>
    );
}
