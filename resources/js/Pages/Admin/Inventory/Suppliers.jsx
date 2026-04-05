import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
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

const EMPTY = { name: '', contact_person: '', phone: '', email: '', address: '', is_active: true, notes: '' };

function SupplierDialog({ open, onClose, initial, onSubmit, processing, errors, title }) {
    const [data, setData] = useState(initial);
    const f = (k) => (e) => setData(p => ({ ...p, [k]: e.target.value }));

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <Box component="form" onSubmit={(e) => { e.preventDefault(); onSubmit(data); }}>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        <Grid size={{ xs: 12, sm: 8 }}>
                            <TextField label="Supplier Name" value={data.name} onChange={f('name')}
                                fullWidth size="small" required
                                error={Boolean(errors.name)} helperText={errors.name} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
                            <FormControlLabel label="Active"
                                control={<Switch checked={data.is_active} onChange={(e) => setData(p => ({ ...p, is_active: e.target.checked }))} />} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField label="Contact Person" value={data.contact_person} onChange={f('contact_person')} fullWidth size="small" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField label="Phone" value={data.phone} onChange={f('phone')} fullWidth size="small" />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField label="Email" type="email" value={data.email} onChange={f('email')}
                                fullWidth size="small" error={Boolean(errors.email)} helperText={errors.email} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField label="Address" value={data.address} onChange={f('address')}
                                fullWidth size="small" multiline rows={2} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField label="Notes" value={data.notes} onChange={f('notes')}
                                fullWidth size="small" multiline rows={2} />
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

export default function Suppliers({ suppliers }) {
    const { flash } = usePage().props;
    const [addOpen,      setAddOpen]      = useState(false);
    const [editTarget,   setEditTarget]   = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [errors,       setErrors]       = useState({});
    const [processing,   setProcessing]   = useState(false);

    const handleAdd = (data) => {
        setProcessing(true);
        router.post(route('admin.suppliers.store'), data, {
            onError:   (e) => { setErrors(e); setProcessing(false); },
            onSuccess: () => { setAddOpen(false); setErrors({}); setProcessing(false); },
        });
    };

    const handleEdit = (data) => {
        setProcessing(true);
        router.put(route('admin.suppliers.update', editTarget.id), data, {
            onError:   (e) => { setErrors(e); setProcessing(false); },
            onSuccess: () => { setEditTarget(null); setErrors({}); setProcessing(false); },
        });
    };

    const handleDelete = () => {
        router.delete(route('admin.suppliers.destroy', deleteTarget.id), {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>Suppliers</Typography>
                    <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
                        Add Supplier
                    </Button>
                </Stack>
            }
        >
            <Head title="Suppliers" />

            <Box>
                {flash?.success && <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>}
                {flash?.error   && <Alert severity="error"   sx={{ mb: 2 }}>{flash.error}</Alert>}

                <Paper variant="outlined">
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Contact</TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell align="center">Restocks</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {suppliers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No suppliers yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {suppliers.map((s) => (
                                    <TableRow key={s.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={500}>{s.name}</Typography>
                                            {s.notes && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                    {s.notes}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">{s.contact_person ?? '—'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">{s.phone ?? '—'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">{s.email ?? '—'}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2">{s.stock_logs_count}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip label={s.is_active ? 'Active' : 'Inactive'} size="small"
                                                color={s.is_active ? 'success' : 'default'}
                                                variant={s.is_active ? 'filled' : 'outlined'} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                <Button size="small" startIcon={<EditIcon fontSize="small" />}
                                                    onClick={() => { setErrors({}); setEditTarget(s); }}>Edit</Button>
                                                <Button size="small" color="error" startIcon={<DeleteOutlineIcon fontSize="small" />}
                                                    onClick={() => setDeleteTarget(s)}>Delete</Button>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            <SupplierDialog open={addOpen} onClose={() => { setAddOpen(false); setErrors({}); }}
                initial={EMPTY} onSubmit={handleAdd} processing={processing} errors={errors} title="Add Supplier" />

            {editTarget && (
                <SupplierDialog
                    open={Boolean(editTarget)}
                    onClose={() => { setEditTarget(null); setErrors({}); }}
                    initial={{ name: editTarget.name, contact_person: editTarget.contact_person ?? '',
                        phone: editTarget.phone ?? '', email: editTarget.email ?? '',
                        address: editTarget.address ?? '', is_active: editTarget.is_active, notes: editTarget.notes ?? '' }}
                    onSubmit={handleEdit} processing={processing} errors={errors} title="Edit Supplier"
                />
            )}

            <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Delete Supplier?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        "{deleteTarget?.name}" will be soft-deleted. Stock log history will be preserved.
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
