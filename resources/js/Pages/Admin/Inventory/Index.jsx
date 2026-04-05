import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent,
    DialogTitle, FormControl, Grid, InputAdornment, InputLabel,
    MenuItem, Paper, Select, Stack, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import ListAltIcon from '@mui/icons-material/ListAlt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useState } from 'react';

function StockStatusChip({ stock, threshold, alerts }) {
    const alertMin = alerts?.[0]?.min_qty ?? threshold;
    if (stock <= 0)       return <Chip label="Out of Stock" size="small" color="error" />;
    if (stock <= alertMin) return <Chip label="Low Stock"   size="small" color="warning" />;
    return <Chip label="OK" size="small" color="success" variant="outlined" />;
}

function RestockDialog({ open, onClose, product, suppliers }) {
    const [form, setForm] = useState({ quantity: '', supplier_id: '', capital_cost: '', notes: '' });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('admin.inventory.restock'), {
            product_id:   product.id,
            quantity:     parseInt(form.quantity),
            supplier_id:  form.supplier_id || null,
            capital_cost: form.capital_cost || null,
            notes:        form.notes || null,
        }, {
            onError:   (e) => { setErrors(e); setProcessing(false); },
            onSuccess: () => { onClose(); setForm({ quantity: '', supplier_id: '', capital_cost: '', notes: '' }); setErrors({}); setProcessing(false); },
        });
    };

    if (!product) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Restock — {product.name}</DialogTitle>
            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                            Current stock: <strong>{product.stock_qty}</strong> {product.unit}
                        </Typography>
                        <TextField
                            label="Quantity to Add" type="number" value={form.quantity} required
                            onChange={(e) => setForm(p => ({ ...p, quantity: e.target.value }))}
                            fullWidth size="small"
                            slotProps={{ input: { inputProps: { min: 1 } }}}
                            error={Boolean(errors.quantity)} helperText={errors.quantity}
                        />
                        <FormControl fullWidth size="small">
                            <InputLabel>Supplier (optional)</InputLabel>
                            <Select
                                label="Supplier (optional)"
                                value={form.supplier_id}
                                onChange={(e) => setForm(p => ({ ...p, supplier_id: e.target.value }))}
                            >
                                <MenuItem value="">None</MenuItem>
                                {suppliers.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Capital Cost per Unit (optional)" type="number" value={form.capital_cost}
                            onChange={(e) => setForm(p => ({ ...p, capital_cost: e.target.value }))}
                            fullWidth size="small"
                            slotProps={{ input: { startAdornment: <InputAdornment position="start">₱</InputAdornment>, inputProps: { min: 0, step: '0.01' } }}}
                            helperText={`Default: ₱${parseFloat(product.capital_cost).toFixed(2)}`}
                        />
                        <TextField
                            label="Notes (optional)" value={form.notes}
                            onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
                            fullWidth size="small" multiline rows={2}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={processing}>
                        {processing ? 'Saving…' : 'Restock'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

function AdjustDialog({ open, onClose, product }) {
    const [form, setForm] = useState({ new_qty: '', notes: '' });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('admin.inventory.adjust'), {
            product_id: product.id,
            new_qty:    parseInt(form.new_qty),
            notes:      form.notes || null,
        }, {
            onError:   (e) => { setErrors(e); setProcessing(false); },
            onSuccess: () => { onClose(); setForm({ new_qty: '', notes: '' }); setErrors({}); setProcessing(false); },
        });
    };

    if (!product) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Adjust Stock — {product.name}</DialogTitle>
            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                            Current stock: <strong>{product.stock_qty}</strong> {product.unit}
                        </Typography>
                        <TextField
                            label="Set Stock To" type="number" value={form.new_qty} required
                            onChange={(e) => setForm(p => ({ ...p, new_qty: e.target.value }))}
                            fullWidth size="small"
                            slotProps={{ input: { inputProps: { min: 0 } }}}
                            error={Boolean(errors.new_qty)} helperText={errors.new_qty ?? 'Set the correct current quantity'}
                        />
                        <TextField
                            label="Reason / Notes" value={form.notes}
                            onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
                            fullWidth size="small" multiline rows={2}
                            placeholder="Damage, loss, manual count correction…"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" color="warning" disabled={processing}>
                        {processing ? 'Saving…' : 'Apply Adjustment'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default function InventoryIndex({ products, suppliers, threshold }) {
    const { flash } = usePage().props;
    const [restockProduct, setRestockProduct] = useState(null);
    const [adjustProduct,  setAdjustProduct]  = useState(null);
    const [typeFilter,     setTypeFilter]      = useState('');
    const [statusFilter,   setStatusFilter]    = useState('');

    const filtered = products.filter(p => {
        const alertMin = p.stock_alerts?.[0]?.min_qty ?? threshold;
        const stockStatus = p.stock_qty <= 0 ? 'out' : p.stock_qty <= alertMin ? 'low' : 'ok';
        return (!typeFilter || p.type === typeFilter) && (!statusFilter || stockStatus === statusFilter);
    });

    const lowCount = products.filter(p => {
        const alertMin = p.stock_alerts?.[0]?.min_qty ?? threshold;
        return p.stock_qty > 0 && p.stock_qty <= alertMin;
    }).length;
    const outCount = products.filter(p => p.stock_qty <= 0).length;

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>Inventory</Typography>
                    <Stack direction="row" spacing={1}>
                        <Button component={Link} href={route('admin.stock-alerts.index')} variant="outlined" size="small" startIcon={<WarningAmberIcon />}>
                            Alerts
                        </Button>
                        <Button component={Link} href={route('admin.suppliers.index')} variant="outlined" size="small">
                            Suppliers
                        </Button>
                        <Button component={Link} href={route('admin.inventory.logs')} variant="outlined" size="small" startIcon={<ListAltIcon />}>
                            Logs
                        </Button>
                    </Stack>
                </Stack>
            }
        >
            <Head title="Inventory" />

            <Box>
                {flash?.success && <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>}
                {flash?.error   && <Alert severity="error"   sx={{ mb: 2 }}>{flash.error}</Alert>}

                {/* Summary cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {[
                        { label: 'Tracked Products', value: products.length, color: 'primary.main' },
                        { label: 'Low Stock',  value: lowCount, color: 'warning.main' },
                        { label: 'Out of Stock', value: outCount, color: 'error.main' },
                    ].map(card => (
                        <Grid size={{ xs: 4 }} key={card.label}>
                            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h4" fontWeight={700} color={card.color}>{card.value}</Typography>
                                <Typography variant="caption" color="text.secondary">{card.label}</Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                {/* Filters */}
                <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Type</InputLabel>
                        <Select label="Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="refill">Refill</MenuItem>
                            <MenuItem value="container">Container</MenuItem>
                            <MenuItem value="accessory">Accessory</MenuItem>
                            <MenuItem value="bundle">Bundle</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Stock Status</InputLabel>
                        <Select label="Stock Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="ok">OK</MenuItem>
                            <MenuItem value="low">Low Stock</MenuItem>
                            <MenuItem value="out">Out of Stock</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                <Paper variant="outlined">
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                                    <TableCell>Product</TableCell>
                                    <TableCell>Unit</TableCell>
                                    <TableCell align="right">Stock</TableCell>
                                    <TableCell align="right">Alert At</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No tracked products found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {filtered.map((product) => (
                                    <TableRow key={product.id} hover>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Chip label={product.type} size="small" variant="outlined"
                                                    sx={{ fontSize: 9, height: 18 }} />
                                                <Typography variant="body2" fontWeight={500}>{product.name}</Typography>
                                                {product.size && (
                                                    <Typography variant="caption" color="text.secondary">{product.size}</Typography>
                                                )}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">{product.unit}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight={700}
                                                color={product.stock_qty <= 0 ? 'error.main' : 'text.primary'}>
                                                {product.stock_qty}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" color="text.secondary">
                                                {product.stock_alerts?.[0]?.min_qty ?? threshold}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <StockStatusChip
                                                stock={product.stock_qty}
                                                threshold={threshold}
                                                alerts={product.stock_alerts}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                <Button size="small" variant="contained" startIcon={<AddIcon fontSize="small" />}
                                                    onClick={() => setRestockProduct(product)}>
                                                    Restock
                                                </Button>
                                                <Button size="small" variant="outlined" startIcon={<TuneIcon fontSize="small" />}
                                                    onClick={() => setAdjustProduct(product)}>
                                                    Adjust
                                                </Button>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            <RestockDialog
                open={Boolean(restockProduct)}
                onClose={() => setRestockProduct(null)}
                product={restockProduct}
                suppliers={suppliers}
            />
            <AdjustDialog
                open={Boolean(adjustProduct)}
                onClose={() => setAdjustProduct(null)}
                product={adjustProduct}
            />
        </AuthenticatedLayout>
    );
}
