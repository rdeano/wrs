import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
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
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';

const TYPE_COLORS = {
    regular:  'default',
    suki:     'info',
    bulk:     'warning',
    business: 'success',
};

const TX_COLORS = {
    charge:     'error',
    payment:    'success',
    partial:    'success',
    writeoff:   'warning',
    adjustment: 'info',
};

function InfoRow({ label, value }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" fontWeight={500}>{value}</Typography>
        </Box>
    );
}

export default function Show({ customer, transactions }) {
    const { flash } = usePage().props;
    const [creditDialog, setCreditDialog]     = useState(false);
    const [limitDialog,  setLimitDialog]      = useState(false);

    // Credit adjustment form
    const creditForm = useForm({
        type:           'payment',
        amount:         '',
        payment_method: '',
        notes:          '',
    });

    // Credit limit form
    const limitForm = useForm({
        credit_limit: customer.credit_limit ?? '',
    });

    const submitCredit = (e) => {
        e.preventDefault();
        creditForm.post(route('admin.customers.credit-adjust', customer.id), {
            onSuccess: () => {
                setCreditDialog(false);
                creditForm.reset();
            },
        });
    };

    const submitLimit = (e) => {
        e.preventDefault();
        limitForm.post(route('admin.customers.credit-limit', customer.id), {
            onSuccess: () => setLimitDialog(false),
        });
    };

    const handlePageChange = (_, page) => {
        router.get(route('admin.customers.show', customer.id), { page }, { preserveState: true });
    };

    const balance = parseFloat(customer.outstanding_balance);
    const limit   = customer.credit_limit ? parseFloat(customer.credit_limit) : null;

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="h6" fontWeight={600}>{customer.name}</Typography>
                        <Chip
                            label={customer.type}
                            size="small"
                            color={TYPE_COLORS[customer.type] ?? 'default'}
                            variant="outlined"
                        />
                    </Stack>
                    <Stack direction="row" spacing={1}>
                        <Button
                            component={Link}
                            href={route('admin.customers.edit', customer.id)}
                            size="small"
                            startIcon={<EditIcon fontSize="small" />}
                            variant="outlined"
                        >
                            Edit
                        </Button>
                        <Button component={Link} href={route('admin.customers.index')} variant="text" size="small">
                            ← Back
                        </Button>
                    </Stack>
                </Stack>
            }
        >
            <Head title={`Ledger — ${customer.name}`} />

            <Box>
                {flash?.success && <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>}
                {flash?.error   && <Alert severity="error"   sx={{ mb: 2 }}>{flash.error}</Alert>}

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {/* Customer info card */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                            <Typography variant="subtitle2" color="text.secondary"
                                sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                                Customer Info
                            </Typography>
                            <Divider sx={{ mb: 1.5 }} />
                            <InfoRow label="Phone"    value={customer.phone   ?? '—'} />
                            <InfoRow label="Email"    value={customer.email   ?? '—'} />
                            <InfoRow label="Zone"     value={customer.delivery_zone?.name ?? '—'} />
                            <InfoRow label="Status"   value={
                                <Chip
                                    label={customer.is_active ? 'Active' : 'Inactive'}
                                    size="small"
                                    color={customer.is_active ? 'success' : 'default'}
                                />
                            } />
                            {customer.address && (
                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="caption" color="text.secondary">Address</Typography>
                                    <Typography variant="body2">{customer.address}</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Credit summary card */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                            <Typography variant="subtitle2" color="text.secondary"
                                sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                                Credit Summary
                            </Typography>
                            <Divider sx={{ mb: 1.5 }} />
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">Outstanding Balance</Typography>
                                <Typography variant="h5" fontWeight={700} color={balance > 0 ? 'error.main' : 'success.main'}>
                                    ₱{balance.toFixed(2)}
                                </Typography>
                            </Box>
                            <InfoRow
                                label="Credit Limit"
                                value={limit !== null ? `₱${limit.toFixed(2)}` : 'System default'}
                            />
                            {limit !== null && (
                                <InfoRow
                                    label="Available"
                                    value={
                                        <Typography variant="body2" fontWeight={500}
                                            color={limit - balance > 0 ? 'success.dark' : 'error.main'}>
                                            ₱{Math.max(0, limit - balance).toFixed(2)}
                                        </Typography>
                                    }
                                />
                            )}
                            <Stack spacing={1} sx={{ mt: 2 }}>
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => setCreditDialog(true)}
                                    fullWidth
                                >
                                    Record Transaction
                                </Button>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => setLimitDialog(true)}
                                    fullWidth
                                >
                                    Update Credit Limit
                                </Button>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Notes */}
                    {customer.notes && (
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                                <Typography variant="subtitle2" color="text.secondary"
                                    sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                                    Notes
                                </Typography>
                                <Divider sx={{ mb: 1.5 }} />
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                    {customer.notes}
                                </Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>

                {/* Credit transactions table */}
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                    Credit Ledger
                </Typography>

                <Paper variant="outlined">
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell align="right">Balance After</TableCell>
                                    <TableCell>Method</TableCell>
                                    <TableCell>By</TableCell>
                                    <TableCell>Notes</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transactions.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No transactions yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {transactions.data.map((tx) => (
                                    <TableRow key={tx.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(tx.created_at).toLocaleDateString('en-PH', {
                                                    month: 'short', day: 'numeric', year: 'numeric',
                                                })}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={tx.type}
                                                size="small"
                                                color={TX_COLORS[tx.type] ?? 'default'}
                                                variant="outlined"
                                                sx={{ fontSize: 10, height: 20 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight={500}
                                                color={['payment','partial','writeoff'].includes(tx.type) ? 'success.dark' : 'error.main'}>
                                                ₱{parseFloat(tx.amount).toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2">
                                                ₱{parseFloat(tx.balance_after).toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {tx.payment_method ?? '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {tx.approved_by?.name ?? '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary"
                                                sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {tx.notes ?? '—'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {transactions.last_page > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <Pagination
                                count={transactions.last_page}
                                page={transactions.current_page}
                                onChange={handlePageChange}
                                color="primary"
                                size="small"
                            />
                        </Box>
                    )}
                </Paper>
            </Box>

            {/* ── Record Credit Transaction Dialog ── */}
            <Dialog open={creditDialog} onClose={() => setCreditDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Record Credit Transaction</DialogTitle>
                <Box component="form" onSubmit={submitCredit}>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 0.5 }}>
                            <FormControl fullWidth size="small" required>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    label="Type"
                                    value={creditForm.data.type}
                                    onChange={(e) => creditForm.setData('type', e.target.value)}
                                >
                                    <MenuItem value="payment">Payment — reduce balance</MenuItem>
                                    <MenuItem value="adjustment">Adjustment — set balance to amount</MenuItem>
                                    <MenuItem value="writeoff">Write-off — clear balance</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label={creditForm.data.type === 'adjustment' ? 'New Balance' : 'Amount'}
                                type="number"
                                value={creditForm.data.amount}
                                onChange={(e) => creditForm.setData('amount', e.target.value)}
                                fullWidth size="small" required
                                slotProps={{ input: {
                                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                                    inputProps: { min: 0, step: '0.01' },
                                }}}
                                error={Boolean(creditForm.errors.amount)}
                                helperText={creditForm.errors.amount}
                            />
                            <TextField
                                label="Payment Method (optional)"
                                value={creditForm.data.payment_method}
                                onChange={(e) => creditForm.setData('payment_method', e.target.value)}
                                fullWidth size="small"
                                placeholder="Cash, GCash, Maya…"
                            />
                            <TextField
                                label="Notes (optional)"
                                value={creditForm.data.notes}
                                onChange={(e) => creditForm.setData('notes', e.target.value)}
                                fullWidth size="small" multiline rows={2}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCreditDialog(false)}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={creditForm.processing}>
                            {creditForm.processing ? 'Saving…' : 'Save'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* ── Update Credit Limit Dialog ── */}
            <Dialog open={limitDialog} onClose={() => setLimitDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Update Credit Limit</DialogTitle>
                <Box component="form" onSubmit={submitLimit}>
                    <DialogContent>
                        <TextField
                            label="Credit Limit"
                            type="number"
                            value={limitForm.data.credit_limit}
                            onChange={(e) => limitForm.setData('credit_limit', e.target.value)}
                            fullWidth size="small" required sx={{ mt: 0.5 }}
                            slotProps={{ input: {
                                startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                                inputProps: { min: 0, step: '0.01' },
                            }}}
                            error={Boolean(limitForm.errors.credit_limit)}
                            helperText={limitForm.errors.credit_limit ?? 'Set to 0 to use the system default'}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setLimitDialog(false)}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={limitForm.processing}>
                            {limitForm.processing ? 'Saving…' : 'Update'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </AuthenticatedLayout>
    );
}
