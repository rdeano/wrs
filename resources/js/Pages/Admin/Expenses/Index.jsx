import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent,
    DialogTitle, FormControl, InputAdornment, InputLabel, MenuItem,
    Pagination, Paper, Select, Stack, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CategoryIcon from '@mui/icons-material/Category';
import { useState, useRef, useCallback } from 'react';
import { debounce } from 'lodash';

const TYPE_COLOR = { fixed: 'primary', variable: 'default', 'one-time': 'secondary' };
const TYPE_LABEL = { fixed: 'Fixed', variable: 'Variable', 'one-time': 'One-time' };

const EMPTY = { category_id: '', amount: '', description: '', date: '', notes: '' };

function ExpenseDialog({ open, onClose, initial, onSubmit, processing, errors, title, categories, existingReceipt }) {
    const [data, setData]         = useState(initial);
    const [file, setFile]         = useState(null);
    const [removeReceipt, setRemoveReceipt] = useState(false);
    const fileRef = useRef();

    const f = (k) => (e) => setData(p => ({ ...p, [k]: e.target.value }));

    const handleFile = (e) => {
        const f = e.target.files?.[0] ?? null;
        setFile(f);
        if (f) setRemoveReceipt(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...data, receipt_photo: file, remove_receipt: removeReceipt ? '1' : '0' });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <Box component="form" onSubmit={handleSubmit} encType="multipart/form-data">
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 0.5 }}>
                        <FormControl fullWidth size="small" required error={Boolean(errors.category_id)}>
                            <InputLabel>Category</InputLabel>
                            <Select label="Category" value={data.category_id} onChange={f('category_id')}>
                                {categories.map(cat => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                            ({TYPE_LABEL[cat.type] ?? cat.type})
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.category_id && (
                                <Typography variant="caption" color="error">{errors.category_id}</Typography>
                            )}
                        </FormControl>

                        <TextField
                            label="Amount" type="number" value={data.amount} onChange={f('amount')}
                            fullWidth size="small" required
                            slotProps={{ input: { startAdornment: <InputAdornment position="start">₱</InputAdornment>, inputProps: { min: 0.01, step: '0.01' } }}}
                            error={Boolean(errors.amount)} helperText={errors.amount}
                        />

                        <TextField
                            label="Date" type="date" value={data.date} onChange={f('date')}
                            fullWidth size="small" required
                            slotProps={{ inputLabel: { shrink: true } }}
                            error={Boolean(errors.date)} helperText={errors.date}
                        />

                        <TextField
                            label="Description (optional)" value={data.description} onChange={f('description')}
                            fullWidth size="small"
                            error={Boolean(errors.description)} helperText={errors.description}
                        />

                        <TextField
                            label="Notes (optional)" value={data.notes} onChange={f('notes')}
                            fullWidth size="small" multiline rows={2}
                        />

                        {/* Receipt photo */}
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                Receipt Photo (optional)
                            </Typography>
                            {existingReceipt && !removeReceipt && !file && (
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                    <Chip
                                        label="Current receipt"
                                        size="small"
                                        icon={<ReceiptLongIcon />}
                                        component="a"
                                        href={`/storage/${existingReceipt}`}
                                        target="_blank"
                                        clickable
                                    />
                                    <Button size="small" color="error" onClick={() => setRemoveReceipt(true)}>
                                        Remove
                                    </Button>
                                </Stack>
                            )}
                            {removeReceipt && (
                                <Alert severity="warning" sx={{ mb: 1 }} action={
                                    <Button size="small" color="inherit" onClick={() => setRemoveReceipt(false)}>Undo</Button>
                                }>
                                    Receipt will be removed on save.
                                </Alert>
                            )}
                            <Button variant="outlined" size="small" onClick={() => fileRef.current?.click()}>
                                {file ? file.name : 'Upload receipt'}
                            </Button>
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                            {errors.receipt_photo && (
                                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                                    {errors.receipt_photo}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
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

export default function ExpensesIndex({ expenses, categories, filters, total }) {
    const { flash } = usePage().props;
    const [categoryId, setCategoryId] = useState(filters.category_id ?? '');
    const [type,       setType]       = useState(filters.type        ?? '');
    const [dateFrom,   setDateFrom]   = useState(filters.date_from   ?? '');
    const [dateTo,     setDateTo]     = useState(filters.date_to     ?? '');

    const [addOpen,      setAddOpen]      = useState(false);
    const [editTarget,   setEditTarget]   = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [errors,       setErrors]       = useState({});
    const [processing,   setProcessing]   = useState(false);

    const applyFilters = useCallback(
        debounce((params) => {
            router.get(route('admin.expenses.index'), params, { preserveState: true, replace: true });
        }, 300),
        [],
    );

    const handle = (key, value, setter) => {
        setter(value);
        applyFilters({
            category_id: key === 'category_id' ? value : categoryId,
            type:        key === 'type'        ? value : type,
            date_from:   key === 'date_from'   ? value : dateFrom,
            date_to:     key === 'date_to'     ? value : dateTo,
        });
    };

    const handlePageChange = (_, page) => {
        router.get(route('admin.expenses.index'), { ...filters, page }, { preserveState: true });
    };

    const submitForm = (url, data, onSuccess) => {
        setProcessing(true);
        const form = new FormData();
        Object.entries(data).forEach(([k, v]) => {
            if (v !== null && v !== undefined) form.append(k, v);
        });
        router.post(url, form, {
            forceFormData: true,
            onError:   (e) => { setErrors(e); setProcessing(false); },
            onSuccess: () => { onSuccess(); setErrors({}); setProcessing(false); },
        });
    };

    const handleAdd = (data) => {
        submitForm(route('admin.expenses.store'), data, () => setAddOpen(false));
    };

    const handleEdit = (data) => {
        submitForm(route('admin.expenses.update', editTarget.id), data, () => setEditTarget(null));
    };

    const handleDelete = () => {
        router.delete(route('admin.expenses.destroy', deleteTarget.id), {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const today = new Date().toISOString().slice(0, 10);

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>Expenses</Typography>
                    <Stack direction="row" spacing={1}>
                        <Button component={Link} href={route('admin.expense-categories.index')}
                            variant="outlined" size="small" startIcon={<CategoryIcon />}>
                            Categories
                        </Button>
                        <Button variant="contained" size="small" startIcon={<AddIcon />}
                            onClick={() => setAddOpen(true)} disabled={categories.length === 0}>
                            Add Expense
                        </Button>
                    </Stack>
                </Stack>
            }
        >
            <Head title="Expenses" />

            <Box>
                {flash?.success && <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>}
                {flash?.error   && <Alert severity="error"   sx={{ mb: 2 }}>{flash.error}</Alert>}

                {categories.length === 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        No expense categories found.{' '}
                        <Link href={route('admin.expense-categories.index')}>Add a category</Link> first.
                    </Alert>
                )}

                {/* Filters */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" sx={{ mb: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Category</InputLabel>
                        <Select label="Category" value={categoryId}
                            onChange={(e) => handle('category_id', e.target.value, setCategoryId)}>
                            <MenuItem value="">All categories</MenuItem>
                            {categories.map(cat => (
                                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Type</InputLabel>
                        <Select label="Type" value={type}
                            onChange={(e) => handle('type', e.target.value, setType)}>
                            <MenuItem value="">All types</MenuItem>
                            <MenuItem value="fixed">Fixed</MenuItem>
                            <MenuItem value="variable">Variable</MenuItem>
                            <MenuItem value="one-time">One-time</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField type="date" label="From" value={dateFrom}
                        onChange={(e) => handle('date_from', e.target.value, setDateFrom)}
                        size="small" sx={{ minWidth: 150 }} slotProps={{ inputLabel: { shrink: true } }} />
                    <TextField type="date" label="To" value={dateTo}
                        onChange={(e) => handle('date_to', e.target.value, setDateTo)}
                        size="small" sx={{ minWidth: 150 }} slotProps={{ inputLabel: { shrink: true } }} />
                </Stack>

                {/* Total summary */}
                <Paper variant="outlined" sx={{ p: 2, mb: 2, display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">Total (filtered):</Typography>
                    <Typography variant="h6" fontWeight={700} color="error.main">
                        ₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </Typography>
                </Paper>

                <Paper variant="outlined">
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell>Logged By</TableCell>
                                    <TableCell align="center">Receipt</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {expenses.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No expenses found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {expenses.data.map((exp) => (
                                    <TableRow key={exp.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(exp.date).toLocaleDateString('en-PH', {
                                                    month: 'short', day: 'numeric', year: 'numeric',
                                                })}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack spacing={0.5}>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {exp.category?.name ?? '—'}
                                                </Typography>
                                                {exp.category && (
                                                    <Chip label={TYPE_LABEL[exp.category.type] ?? exp.category.type}
                                                        size="small" variant="outlined"
                                                        color={TYPE_COLOR[exp.category.type] ?? 'default'}
                                                        sx={{ fontSize: 10, height: 18, width: 'fit-content' }} />
                                                )}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2"
                                                sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {exp.description ?? exp.notes ?? '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight={600} color="error.main">
                                                ₱{parseFloat(exp.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {exp.logged_by?.name ?? '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            {exp.receipt_photo ? (
                                                <Button
                                                    size="small"
                                                    startIcon={<ReceiptLongIcon fontSize="small" />}
                                                    component="a"
                                                    href={`/storage/${exp.receipt_photo}`}
                                                    target="_blank"
                                                >
                                                    View
                                                </Button>
                                            ) : (
                                                <Typography variant="caption" color="text.disabled">—</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                <Button size="small" startIcon={<EditIcon fontSize="small" />}
                                                    onClick={() => { setErrors({}); setEditTarget(exp); }}>Edit</Button>
                                                <Button size="small" color="error"
                                                    startIcon={<DeleteOutlineIcon fontSize="small" />}
                                                    onClick={() => setDeleteTarget(exp)}>Delete</Button>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {expenses.last_page > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <Pagination
                                count={expenses.last_page}
                                page={expenses.current_page}
                                onChange={handlePageChange}
                                color="primary"
                                size="small"
                            />
                        </Box>
                    )}
                </Paper>
            </Box>

            <ExpenseDialog
                open={addOpen}
                onClose={() => { setAddOpen(false); setErrors({}); }}
                initial={{ ...EMPTY, date: today }}
                onSubmit={handleAdd}
                processing={processing}
                errors={errors}
                title="Add Expense"
                categories={categories.filter(c => c.is_active)}
                existingReceipt={null}
            />

            {editTarget && (
                <ExpenseDialog
                    open={Boolean(editTarget)}
                    onClose={() => { setEditTarget(null); setErrors({}); }}
                    initial={{
                        category_id: editTarget.category_id,
                        amount:      editTarget.amount,
                        description: editTarget.description ?? '',
                        date:        editTarget.date ? editTarget.date.slice(0, 10) : '',
                        notes:       editTarget.notes ?? '',
                    }}
                    onSubmit={handleEdit}
                    processing={processing}
                    errors={errors}
                    title="Edit Expense"
                    categories={categories}
                    existingReceipt={editTarget.receipt_photo}
                />
            )}

            <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Delete Expense?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Delete ₱{deleteTarget ? parseFloat(deleteTarget.amount).toFixed(2) : ''} expense
                        ({deleteTarget?.category?.name})? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
