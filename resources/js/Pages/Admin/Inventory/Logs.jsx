import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Alert, Box, Button, Chip, FormControl, InputLabel, MenuItem,
    Pagination, Paper, Select, Stack, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';

const TYPE_COLOR = { in: 'success', out: 'error', adjustment: 'warning' };

export default function InventoryLogs({ logs, products, filters }) {
    const { flash } = usePage().props;
    const [productId, setProductId] = useState(filters.product_id ?? '');
    const [type,      setType]      = useState(filters.type       ?? '');
    const [dateFrom,  setDateFrom]  = useState(filters.date_from  ?? '');
    const [dateTo,    setDateTo]    = useState(filters.date_to    ?? '');

    const applyFilters = useCallback(
        debounce((params) => {
            router.get(route('admin.inventory.logs'), params, { preserveState: true, replace: true });
        }, 300),
        [],
    );

    const handle = (key, value, setter) => {
        setter(value);
        applyFilters({
            product_id: key === 'product_id' ? value : productId,
            type:       key === 'type'       ? value : type,
            date_from:  key === 'date_from'  ? value : dateFrom,
            date_to:    key === 'date_to'    ? value : dateTo,
        });
    };

    const handlePageChange = (_, page) => {
        router.get(route('admin.inventory.logs'), { ...filters, page }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>Stock Logs</Typography>
                    <Button component={Link} href={route('admin.inventory.index')} variant="text" size="small">
                        ← Inventory
                    </Button>
                </Stack>
            }
        >
            <Head title="Stock Logs" />

            <Box>
                {flash?.success && <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>}

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" sx={{ mb: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Product</InputLabel>
                        <Select label="Product" value={productId} onChange={(e) => handle('product_id', e.target.value, setProductId)}>
                            <MenuItem value="">All products</MenuItem>
                            {products.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Type</InputLabel>
                        <Select label="Type" value={type} onChange={(e) => handle('type', e.target.value, setType)}>
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="in">Restock (In)</MenuItem>
                            <MenuItem value="out">Sale (Out)</MenuItem>
                            <MenuItem value="adjustment">Adjustment</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField type="date" label="From" value={dateFrom}
                        onChange={(e) => handle('date_from', e.target.value, setDateFrom)}
                        size="small" sx={{ minWidth: 150 }} slotProps={{ inputLabel: { shrink: true } }} />
                    <TextField type="date" label="To" value={dateTo}
                        onChange={(e) => handle('date_to', e.target.value, setDateTo)}
                        size="small" sx={{ minWidth: 150 }} slotProps={{ inputLabel: { shrink: true } }} />
                </Stack>

                <Paper variant="outlined">
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Product</TableCell>
                                    <TableCell align="center">Type</TableCell>
                                    <TableCell align="right">Qty</TableCell>
                                    <TableCell align="right">Before</TableCell>
                                    <TableCell align="right">After</TableCell>
                                    <TableCell align="right">Cost/Unit</TableCell>
                                    <TableCell>Supplier</TableCell>
                                    <TableCell>By</TableCell>
                                    <TableCell>Notes</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {logs.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No logs found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {logs.data.map((log) => (
                                    <TableRow key={log.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(log.created_at).toLocaleDateString('en-PH', {
                                                    month: 'short', day: 'numeric', year: 'numeric',
                                                })}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{log.product?.name ?? '—'}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={log.type}
                                                size="small"
                                                color={TYPE_COLOR[log.type] ?? 'default'}
                                                variant="outlined"
                                                sx={{ fontSize: 10, height: 20 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight={600}
                                                color={log.quantity > 0 ? 'success.main' : log.quantity < 0 ? 'error.main' : 'text.secondary'}>
                                                {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" color="text.secondary">{log.stock_before}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight={500}>{log.stock_after}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" color="text.secondary">
                                                ₱{parseFloat(log.capital_cost).toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {log.supplier?.name ?? '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {log.logged_by?.name ?? '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary"
                                                sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {log.notes ?? '—'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {logs.last_page > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <Pagination
                                count={logs.last_page}
                                page={logs.current_page}
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
