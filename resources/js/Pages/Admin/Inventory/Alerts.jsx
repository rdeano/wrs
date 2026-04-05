import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Alert, Box, Button, Checkbox, Chip, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle, FormControl,
    FormControlLabel, FormGroup, FormHelperText, FormLabel,
    Grid, InputLabel, MenuItem, Paper, Select, Stack, Switch,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useState } from 'react';

const ALL_ROLES = ['admin', 'manager', 'cashier'];

const EMPTY = { product_id: '', min_qty: '10', notify_roles: ['admin', 'manager'], is_active: true };

function AlertDialog({ open, onClose, initial, onSubmit, processing, errors, title, products, editMode }) {
    const [data, setData] = useState(initial);

    const toggleRole = (role) => {
        setData(p => ({
            ...p,
            notify_roles: p.notify_roles.includes(role)
                ? p.notify_roles.filter(r => r !== role)
                : [...p.notify_roles, role],
        }));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <Box component="form" onSubmit={(e) => { e.preventDefault(); onSubmit(data); }}>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        {!editMode && (
                            <Grid size={{ xs: 12 }}>
                                <FormControl fullWidth size="small" required error={Boolean(errors.product_id)}>
                                    <InputLabel>Product</InputLabel>
                                    <Select
                                        label="Product"
                                        value={data.product_id}
                                        onChange={(e) => setData(p => ({ ...p, product_id: e.target.value }))}
                                    >
                                        {products.map(p => (
                                            <MenuItem key={p.id} value={p.id}>
                                                {p.name} <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                    ({p.type})
                                                </Typography>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.product_id && <FormHelperText>{errors.product_id}</FormHelperText>}
                                </FormControl>
                            </Grid>
                        )}
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Alert When Stock Falls Below" type="number"
                                value={data.min_qty}
                                onChange={(e) => setData(p => ({ ...p, min_qty: e.target.value }))}
                                fullWidth size="small" required
                                slotProps={{ input: { inputProps: { min: 0 } }}}
                                error={Boolean(errors.min_qty)} helperText={errors.min_qty}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControl component="fieldset" error={Boolean(errors.notify_roles)}>
                                <FormLabel component="legend" sx={{ fontSize: 12 }}>Notify Roles</FormLabel>
                                <FormGroup row>
                                    {ALL_ROLES.map(role => (
                                        <FormControlLabel
                                            key={role}
                                            label={role}
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    checked={data.notify_roles.includes(role)}
                                                    onChange={() => toggleRole(role)}
                                                />
                                            }
                                        />
                                    ))}
                                </FormGroup>
                                {errors.notify_roles && <FormHelperText>{errors.notify_roles}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControlLabel
                                label="Alert active"
                                control={
                                    <Switch
                                        checked={data.is_active}
                                        onChange={(e) => setData(p => ({ ...p, is_active: e.target.checked }))}
                                    />
                                }
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={processing}>
                        {processing ? 'Saving…' : 'Save'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default function StockAlerts({ alerts, products }) {
    const { flash } = usePage().props;
    const [addOpen,      setAddOpen]      = useState(false);
    const [editTarget,   setEditTarget]   = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [errors,       setErrors]       = useState({});
    const [processing,   setProcessing]   = useState(false);

    const handleAdd = (data) => {
        setProcessing(true);
        router.post(route('admin.stock-alerts.store'), data, {
            onError:   (e) => { setErrors(e); setProcessing(false); },
            onSuccess: () => { setAddOpen(false); setErrors({}); setProcessing(false); },
        });
    };

    const handleEdit = (data) => {
        setProcessing(true);
        router.put(route('admin.stock-alerts.update', editTarget.id), { ...data, product_id: editTarget.product_id }, {
            onError:   (e) => { setErrors(e); setProcessing(false); },
            onSuccess: () => { setEditTarget(null); setErrors({}); setProcessing(false); },
        });
    };

    const handleDelete = () => {
        router.delete(route('admin.stock-alerts.destroy', deleteTarget.id), {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>Stock Alerts</Typography>
                    <Stack direction="row" spacing={1}>
                        <Button component={Link} href={route('admin.inventory.index')} variant="text" size="small">
                            ← Inventory
                        </Button>
                        <Button
                            variant="contained" size="small" startIcon={<AddIcon />}
                            onClick={() => setAddOpen(true)}
                            disabled={products.length === 0}
                        >
                            Add Alert
                        </Button>
                    </Stack>
                </Stack>
            }
        >
            <Head title="Stock Alerts" />

            <Box>
                {flash?.success && <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>}
                {flash?.error   && <Alert severity="error"   sx={{ mb: 2 }}>{flash.error}</Alert>}

                {products.length === 0 && alerts.length === 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        All tracked products already have alerts configured.
                    </Alert>
                )}

                <Paper variant="outlined">
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                                    <TableCell>Product</TableCell>
                                    <TableCell align="right">Current Stock</TableCell>
                                    <TableCell align="right">Alert Below</TableCell>
                                    <TableCell>Notify Roles</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {alerts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No alerts configured. Add one to get notified when stock runs low.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {alerts.map((alert) => {
                                    const isLow = alert.product && alert.product.stock_qty <= alert.min_qty;
                                    return (
                                        <TableRow key={alert.id} hover
                                            sx={{ bgcolor: isLow && alert.is_active ? 'warning.50' : 'transparent' }}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {alert.product?.name ?? '—'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {alert.product?.type} · {alert.product?.unit}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2"
                                                    fontWeight={isLow ? 700 : 400}
                                                    color={isLow ? 'warning.main' : 'text.primary'}>
                                                    {alert.product?.stock_qty ?? '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2">{alert.min_qty}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                                    {(alert.notify_roles ?? []).map(role => (
                                                        <Chip key={role} label={role} size="small" variant="outlined"
                                                            sx={{ fontSize: 10, height: 18 }} />
                                                    ))}
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={alert.is_active ? 'Active' : 'Inactive'}
                                                    size="small"
                                                    color={alert.is_active ? 'success' : 'default'}
                                                    variant={alert.is_active ? 'filled' : 'outlined'}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                    <Button size="small" startIcon={<EditIcon fontSize="small" />}
                                                        onClick={() => { setErrors({}); setEditTarget(alert); }}>Edit</Button>
                                                    <Button size="small" color="error"
                                                        startIcon={<DeleteOutlineIcon fontSize="small" />}
                                                        onClick={() => setDeleteTarget(alert)}>Delete</Button>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            <AlertDialog
                open={addOpen}
                onClose={() => { setAddOpen(false); setErrors({}); }}
                initial={EMPTY}
                onSubmit={handleAdd}
                processing={processing}
                errors={errors}
                title="Add Stock Alert"
                products={products}
                editMode={false}
            />

            {editTarget && (
                <AlertDialog
                    open={Boolean(editTarget)}
                    onClose={() => { setEditTarget(null); setErrors({}); }}
                    initial={{
                        product_id:   editTarget.product_id,
                        min_qty:      String(editTarget.min_qty),
                        notify_roles: editTarget.notify_roles ?? ['admin'],
                        is_active:    editTarget.is_active,
                    }}
                    onSubmit={handleEdit}
                    processing={processing}
                    errors={errors}
                    title={`Edit Alert — ${editTarget.product?.name}`}
                    products={products}
                    editMode={true}
                />
            )}

            <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Delete Alert?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Remove the stock alert for "{deleteTarget?.product?.name}"?
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
