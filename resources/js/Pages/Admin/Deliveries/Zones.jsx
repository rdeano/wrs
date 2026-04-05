import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, FormControlLabel, Grid,
    InputAdornment, Paper, Stack, Switch, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, TextField,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useState } from 'react';

const EMPTY = { name: '', fee: '0', min_order: '0', is_active: true, notes: '' };

function ZoneDialog({ open, onClose, initial, onSubmit, processing, errors, title }) {
    const { data, setData } = useForm(initial);

    // sync when initial changes (edit mode)
    const handleOpen = () => {};

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <Box component="form" onSubmit={(e) => { e.preventDefault(); onSubmit(data); }}>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Zone Name" value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                fullWidth size="small" required
                                error={Boolean(errors.name)} helperText={errors.name}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label="Delivery Fee" type="number" value={data.fee}
                                onChange={(e) => setData('fee', e.target.value)}
                                fullWidth size="small" required
                                slotProps={{ input: { startAdornment: <InputAdornment position="start">₱</InputAdornment>, inputProps: { min: 0, step: '0.01' } }}}
                                error={Boolean(errors.fee)} helperText={errors.fee}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label="Min Order" type="number" value={data.min_order}
                                onChange={(e) => setData('min_order', e.target.value)}
                                fullWidth size="small" required
                                slotProps={{ input: { startAdornment: <InputAdornment position="start">₱</InputAdornment>, inputProps: { min: 0, step: '0.01' } }}}
                                error={Boolean(errors.min_order)} helperText={errors.min_order}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Notes" value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                fullWidth size="small" multiline rows={2}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControlLabel
                                label="Active"
                                control={<Switch checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />}
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

export default function DeliveryZones({ zones }) {
    const { flash } = usePage().props;
    const [addOpen,    setAddOpen]    = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [errors,     setErrors]     = useState({});
    const [processing, setProcessing] = useState(false);

    const handleAdd = (data) => {
        setProcessing(true);
        router.post(route('admin.delivery-zones.store'), data, {
            onError:   (e) => setErrors(e),
            onSuccess: () => { setAddOpen(false); setErrors({}); },
            onFinish:  () => setProcessing(false),
        });
    };

    const handleEdit = (data) => {
        setProcessing(true);
        router.put(route('admin.delivery-zones.update', editTarget.id), data, {
            onError:   (e) => setErrors(e),
            onSuccess: () => { setEditTarget(null); setErrors({}); },
            onFinish:  () => setProcessing(false),
        });
    };

    const handleDelete = () => {
        router.delete(route('admin.delivery-zones.destroy', deleteTarget.id), {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>Delivery Zones</Typography>
                    <Stack direction="row" spacing={1}>
                        <Button component={Link} href={route('admin.delivery-slots.index')} variant="outlined" size="small">
                            Slots
                        </Button>
                        <Button
                            variant="contained" size="small"
                            startIcon={<AddIcon />}
                            onClick={() => setAddOpen(true)}
                        >
                            Add Zone
                        </Button>
                    </Stack>
                </Stack>
            }
        >
            <Head title="Delivery Zones" />

            <Box>
                {flash?.success && <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>}
                {flash?.error   && <Alert severity="error"   sx={{ mb: 2 }}>{flash.error}</Alert>}

                <Paper variant="outlined">
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                                    <TableCell>Name</TableCell>
                                    <TableCell align="right">Fee</TableCell>
                                    <TableCell align="right">Min Order</TableCell>
                                    <TableCell align="center">Deliveries</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {zones.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No zones yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {zones.map((zone) => (
                                    <TableRow key={zone.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={500}>{zone.name}</Typography>
                                            {zone.notes && (
                                                <Typography variant="caption" color="text.secondary">{zone.notes}</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2">₱{parseFloat(zone.fee).toFixed(2)}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2">₱{parseFloat(zone.min_order).toFixed(2)}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2">{zone.deliveries_count}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={zone.is_active ? 'Active' : 'Inactive'}
                                                size="small"
                                                color={zone.is_active ? 'success' : 'default'}
                                                variant={zone.is_active ? 'filled' : 'outlined'}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                <Button size="small" startIcon={<EditIcon fontSize="small" />}
                                                    onClick={() => { setErrors({}); setEditTarget(zone); }}>
                                                    Edit
                                                </Button>
                                                <Button size="small" color="error"
                                                    startIcon={<DeleteOutlineIcon fontSize="small" />}
                                                    onClick={() => setDeleteTarget(zone)}>
                                                    Delete
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

            {/* Add dialog */}
            <ZoneDialog
                open={addOpen}
                onClose={() => { setAddOpen(false); setErrors({}); }}
                initial={EMPTY}
                onSubmit={handleAdd}
                processing={processing}
                errors={errors}
                title="Add Zone"
            />

            {/* Edit dialog */}
            {editTarget && (
                <ZoneDialog
                    open={Boolean(editTarget)}
                    onClose={() => { setEditTarget(null); setErrors({}); }}
                    initial={{
                        name: editTarget.name, fee: editTarget.fee,
                        min_order: editTarget.min_order, is_active: editTarget.is_active,
                        notes: editTarget.notes ?? '',
                    }}
                    onSubmit={handleEdit}
                    processing={processing}
                    errors={errors}
                    title="Edit Zone"
                />
            )}

            {/* Delete confirm */}
            <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Delete Zone?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        "{deleteTarget?.name}" will be deleted. Existing deliveries will retain their zone snapshot.
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
