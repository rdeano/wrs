import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, FormControl, FormControlLabel,
    Grid, InputLabel, MenuItem, Paper, Select, Stack, Switch,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useState } from 'react';

const TYPE_LABEL = { fixed: 'Fixed', variable: 'Variable', 'one-time': 'One-time' };
const TYPE_COLOR = { fixed: 'primary', variable: 'default', 'one-time': 'secondary' };

const EMPTY = { name: '', type: 'variable', is_active: true, sort_order: 0, notes: '' };

function CategoryDialog({ open, onClose, initial, onSubmit, processing, errors, title }) {
    const [data, setData] = useState(initial);
    const f = (k) => (e) => setData(p => ({ ...p, [k]: e.target.value }));

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <Box component="form" onSubmit={(e) => { e.preventDefault(); onSubmit(data); }}>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        <Grid size={{ xs: 12 }}>
                            <TextField label="Category Name" value={data.name} onChange={f('name')}
                                fullWidth size="small" required
                                error={Boolean(errors.name)} helperText={errors.name} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth size="small" required>
                                <InputLabel>Type</InputLabel>
                                <Select label="Type" value={data.type} onChange={f('type')}>
                                    <MenuItem value="fixed">Fixed</MenuItem>
                                    <MenuItem value="variable">Variable</MenuItem>
                                    <MenuItem value="one-time">One-time</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField label="Sort Order" type="number" value={data.sort_order}
                                onChange={f('sort_order')} fullWidth size="small"
                                slotProps={{ input: { inputProps: { min: 0 } }}} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControlLabel label="Active"
                                control={<Switch checked={data.is_active}
                                    onChange={(e) => setData(p => ({ ...p, is_active: e.target.checked }))} />} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField label="Notes (optional)" value={data.notes} onChange={f('notes')}
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

export default function ExpenseCategories({ categories }) {
    const { flash } = usePage().props;
    const [addOpen,      setAddOpen]      = useState(false);
    const [editTarget,   setEditTarget]   = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [errors,       setErrors]       = useState({});
    const [processing,   setProcessing]   = useState(false);

    const handleAdd = (data) => {
        setProcessing(true);
        router.post(route('admin.expense-categories.store'), data, {
            onError:   (e) => { setErrors(e); setProcessing(false); },
            onSuccess: () => { setAddOpen(false); setErrors({}); setProcessing(false); },
        });
    };

    const handleEdit = (data) => {
        setProcessing(true);
        router.put(route('admin.expense-categories.update', editTarget.id), data, {
            onError:   (e) => { setErrors(e); setProcessing(false); },
            onSuccess: () => { setEditTarget(null); setErrors({}); setProcessing(false); },
        });
    };

    const handleDelete = () => {
        router.delete(route('admin.expense-categories.destroy', deleteTarget.id), {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>Expense Categories</Typography>
                    <Stack direction="row" spacing={1}>
                        <Button component={Link} href={route('admin.expenses.index')} variant="text" size="small">
                            ← Expenses
                        </Button>
                        <Button variant="contained" size="small" startIcon={<AddIcon />}
                            onClick={() => setAddOpen(true)}>
                            Add Category
                        </Button>
                    </Stack>
                </Stack>
            }
        >
            <Head title="Expense Categories" />

            <Box>
                {flash?.success && <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>}
                {flash?.error   && <Alert severity="error"   sx={{ mb: 2 }}>{flash.error}</Alert>}

                <Paper variant="outlined">
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell align="center">Expenses</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {categories.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No categories yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {categories.map((cat) => (
                                    <TableRow key={cat.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={500}>{cat.name}</Typography>
                                            {cat.notes && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                    {cat.notes}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={TYPE_LABEL[cat.type] ?? cat.type} size="small"
                                                color={TYPE_COLOR[cat.type] ?? 'default'} variant="outlined" />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2">{cat.expenses_count}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip label={cat.is_active ? 'Active' : 'Inactive'} size="small"
                                                color={cat.is_active ? 'success' : 'default'}
                                                variant={cat.is_active ? 'filled' : 'outlined'} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                <Button size="small" startIcon={<EditIcon fontSize="small" />}
                                                    onClick={() => { setErrors({}); setEditTarget(cat); }}>Edit</Button>
                                                <Button size="small" color="error"
                                                    startIcon={<DeleteOutlineIcon fontSize="small" />}
                                                    onClick={() => setDeleteTarget(cat)}>Delete</Button>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            <CategoryDialog open={addOpen} onClose={() => { setAddOpen(false); setErrors({}); }}
                initial={EMPTY} onSubmit={handleAdd} processing={processing} errors={errors}
                title="Add Category" />

            {editTarget && (
                <CategoryDialog
                    open={Boolean(editTarget)}
                    onClose={() => { setEditTarget(null); setErrors({}); }}
                    initial={{
                        name:       editTarget.name,
                        type:       editTarget.type,
                        is_active:  editTarget.is_active,
                        sort_order: editTarget.sort_order,
                        notes:      editTarget.notes ?? '',
                    }}
                    onSubmit={handleEdit} processing={processing} errors={errors}
                    title="Edit Category"
                />
            )}

            <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Delete Category?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Delete "{deleteTarget?.name}"? This will fail if it has associated expenses.
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
