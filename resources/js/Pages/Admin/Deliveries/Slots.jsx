import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, FormControlLabel, Grid,
    Paper, Stack, Switch, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useState } from 'react';

const EMPTY = { label: '', start_time: '08:00', end_time: '12:00', is_active: true, sort_order: 0 };

function SlotDialog({ open, onClose, initial, onSubmit, processing, errors, title }) {
    const { data, setData } = useForm(initial);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <Box component="form" onSubmit={(e) => { e.preventDefault(); onSubmit(data); }}>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Label" value={data.label}
                                onChange={(e) => setData('label', e.target.value)}
                                fullWidth size="small" required
                                placeholder="Morning, Afternoon…"
                                error={Boolean(errors.label)} helperText={errors.label}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label="Start Time" type="time" value={data.start_time}
                                onChange={(e) => setData('start_time', e.target.value)}
                                fullWidth size="small" required
                                slotProps={{ inputLabel: { shrink: true } }}
                                error={Boolean(errors.start_time)} helperText={errors.start_time}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label="End Time" type="time" value={data.end_time}
                                onChange={(e) => setData('end_time', e.target.value)}
                                fullWidth size="small" required
                                slotProps={{ inputLabel: { shrink: true } }}
                                error={Boolean(errors.end_time)} helperText={errors.end_time}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label="Sort Order" type="number" value={data.sort_order}
                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                fullWidth size="small"
                                slotProps={{ input: { inputProps: { min: 0 } }}}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
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

export default function DeliverySlots({ slots }) {
    const { flash } = usePage().props;
    const [addOpen,      setAddOpen]      = useState(false);
    const [editTarget,   setEditTarget]   = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [errors,       setErrors]       = useState({});
    const [processing,   setProcessing]   = useState(false);

    const handleAdd = (data) => {
        setProcessing(true);
        router.post(route('admin.delivery-slots.store'), data, {
            onError:   (e) => setErrors(e),
            onSuccess: () => { setAddOpen(false); setErrors({}); },
            onFinish:  () => setProcessing(false),
        });
    };

    const handleEdit = (data) => {
        setProcessing(true);
        router.put(route('admin.delivery-slots.update', editTarget.id), data, {
            onError:   (e) => setErrors(e),
            onSuccess: () => { setEditTarget(null); setErrors({}); },
            onFinish:  () => setProcessing(false),
        });
    };

    const handleDelete = () => {
        router.delete(route('admin.delivery-slots.destroy', deleteTarget.id), {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>Delivery Slots</Typography>
                    <Stack direction="row" spacing={1}>
                        <Button component={Link} href={route('admin.delivery-zones.index')} variant="outlined" size="small">
                            Zones
                        </Button>
                        <Button
                            variant="contained" size="small"
                            startIcon={<AddIcon />}
                            onClick={() => setAddOpen(true)}
                        >
                            Add Slot
                        </Button>
                    </Stack>
                </Stack>
            }
        >
            <Head title="Delivery Slots" />

            <Box>
                {flash?.success && <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>}
                {flash?.error   && <Alert severity="error"   sx={{ mb: 2 }}>{flash.error}</Alert>}

                <Paper variant="outlined">
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                                    <TableCell>Label</TableCell>
                                    <TableCell>Time</TableCell>
                                    <TableCell align="center">Sort</TableCell>
                                    <TableCell align="center">Deliveries</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {slots.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No slots yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {slots.map((slot) => (
                                    <TableRow key={slot.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={500}>{slot.label}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {slot.start_time} – {slot.end_time}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2">{slot.sort_order}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2">{slot.deliveries_count}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={slot.is_active ? 'Active' : 'Inactive'}
                                                size="small"
                                                color={slot.is_active ? 'success' : 'default'}
                                                variant={slot.is_active ? 'filled' : 'outlined'}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                <Button size="small" startIcon={<EditIcon fontSize="small" />}
                                                    onClick={() => { setErrors({}); setEditTarget(slot); }}>
                                                    Edit
                                                </Button>
                                                <Button size="small" color="error"
                                                    startIcon={<DeleteOutlineIcon fontSize="small" />}
                                                    onClick={() => setDeleteTarget(slot)}>
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

            <SlotDialog
                open={addOpen}
                onClose={() => { setAddOpen(false); setErrors({}); }}
                initial={EMPTY}
                onSubmit={handleAdd}
                processing={processing}
                errors={errors}
                title="Add Slot"
            />

            {editTarget && (
                <SlotDialog
                    open={Boolean(editTarget)}
                    onClose={() => { setEditTarget(null); setErrors({}); }}
                    initial={{
                        label: editTarget.label, start_time: editTarget.start_time,
                        end_time: editTarget.end_time, is_active: editTarget.is_active,
                        sort_order: editTarget.sort_order,
                    }}
                    onSubmit={handleEdit}
                    processing={processing}
                    errors={errors}
                    title="Edit Slot"
                />
            )}

            <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Delete Slot?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        "{deleteTarget?.label}" will be deleted.
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
