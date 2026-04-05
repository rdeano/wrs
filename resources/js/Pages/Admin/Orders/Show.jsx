import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Grid,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import { useState } from 'react';

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

function InfoRow({ label, value }) {
    return (
        <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" fontWeight={500}>{value}</Typography>
        </Stack>
    );
}

export default function OrderShow({ order, allowVoid }) {
    const { flash } = usePage().props;
    const [voidOpen, setVoidOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const subtotal    = parseFloat(order.subtotal);
    const discount    = parseFloat(order.discount);
    const deliveryFee = parseFloat(order.delivery_fee);
    const total       = parseFloat(order.total);
    const amountPaid  = parseFloat(order.amount_paid);
    const changeGiven = parseFloat(order.change_given);
    const creditOwed  = Math.max(0, total - amountPaid);

    const handleVoid = () => {
        setProcessing(true);
        router.post(route('admin.orders.void', order.id), {}, {
            onFinish: () => { setProcessing(false); setVoidOpen(false); },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Typography variant="h6" fontWeight={600}>Order #{order.id}</Typography>
                        <Chip
                            label={order.status}
                            size="small"
                            color={STATUS_COLOR[order.status] ?? 'default'}
                        />
                        <Chip
                            label={order.payment_status}
                            size="small"
                            color={PAYMENT_STATUS_COLOR[order.payment_status] ?? 'default'}
                            variant="outlined"
                        />
                    </Stack>
                    <Stack direction="row" spacing={1}>
                        {allowVoid && order.status !== 'voided' && (
                            <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                startIcon={<BlockIcon fontSize="small" />}
                                onClick={() => setVoidOpen(true)}
                            >
                                Void
                            </Button>
                        )}
                        <Button component={Link} href={route('admin.orders.index')} variant="text" size="small">
                            ← Orders
                        </Button>
                    </Stack>
                </Stack>
            }
        >
            <Head title={`Order #${order.id}`} />

            <Box>
                {flash?.success && <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>}
                {flash?.error   && <Alert severity="error"   sx={{ mb: 2 }}>{flash.error}</Alert>}

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {/* Order meta */}
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary"
                                sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                                Order Info
                            </Typography>
                            <Divider sx={{ mb: 1.5 }} />
                            <InfoRow
                                label="Date"
                                value={new Date(order.created_at).toLocaleString('en-PH', {
                                    month: 'short', day: 'numeric', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                })}
                            />
                            <InfoRow label="Type"     value={<Chip label={order.type} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />} />
                            <InfoRow label="Served by" value={order.served_by?.name ?? '—'} />
                            {order.notes && (
                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="caption" color="text.secondary">Notes</Typography>
                                    <Typography variant="body2">{order.notes}</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Customer */}
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary"
                                sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                                Customer
                            </Typography>
                            <Divider sx={{ mb: 1.5 }} />
                            {order.customer ? (
                                <>
                                    <InfoRow label="Name"  value={order.customer.name} />
                                    <InfoRow label="Phone" value={order.customer.phone ?? '—'} />
                                    <InfoRow label="Type"  value={<Chip label={order.customer.type} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />} />
                                    <Box sx={{ mt: 1.5 }}>
                                        <Button
                                            component={Link}
                                            href={route('admin.customers.show', order.customer.id)}
                                            size="small"
                                            variant="outlined"
                                        >
                                            View Ledger
                                        </Button>
                                    </Box>
                                </>
                            ) : (
                                <Typography variant="body2" color="text.secondary">Walk-in (no customer)</Typography>
                            )}
                        </Paper>
                    </Grid>

                    {/* Payment summary */}
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary"
                                sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                                Payment Summary
                            </Typography>
                            <Divider sx={{ mb: 1.5 }} />
                            <InfoRow label="Subtotal" value={`₱${subtotal.toFixed(2)}`} />
                            {discount > 0 && (
                                <InfoRow
                                    label="Discount"
                                    value={<Typography variant="body2" color="error.main">−₱{discount.toFixed(2)}</Typography>}
                                />
                            )}
                            {deliveryFee > 0 && (
                                <InfoRow label="Delivery Fee" value={`₱${deliveryFee.toFixed(2)}`} />
                            )}
                            <Divider sx={{ my: 0.5 }} />
                            <InfoRow
                                label="Total"
                                value={<Typography variant="body2" fontWeight={700} color="primary.main">₱{total.toFixed(2)}</Typography>}
                            />
                            <InfoRow label="Amount Paid" value={`₱${amountPaid.toFixed(2)}`} />
                            {changeGiven > 0 && (
                                <InfoRow
                                    label="Change"
                                    value={<Typography variant="body2" color="success.main">₱{changeGiven.toFixed(2)}</Typography>}
                                />
                            )}
                            {creditOwed > 0 && (
                                <InfoRow
                                    label="Credit Charged"
                                    value={<Typography variant="body2" color="warning.main">₱{creditOwed.toFixed(2)}</Typography>}
                                />
                            )}
                        </Paper>
                    </Grid>
                </Grid>

                {/* Items */}
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>Items</Typography>
                <Paper variant="outlined" sx={{ mb: 3 }}>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                                    <TableCell>Product</TableCell>
                                    <TableCell align="center">Qty</TableCell>
                                    <TableCell align="right">Unit Price</TableCell>
                                    <TableCell align="right">Subtotal</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {order.items.map((item) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Typography variant="body2">{item.product_name}</Typography>
                                                {item.is_free_refill && (
                                                    <Chip label="FREE" size="small" color="success" sx={{ fontSize: 9, height: 18 }} />
                                                )}
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2">{item.quantity}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2">
                                                {item.is_free_refill ? '—' : `₱${parseFloat(item.unit_price).toFixed(2)}`}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight={500}>
                                                ₱{parseFloat(item.subtotal).toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* Payments */}
                {order.payments.length > 0 && (
                    <>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>Payments</Typography>
                        <Paper variant="outlined">
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                                            <TableCell>Method</TableCell>
                                            <TableCell align="right">Amount</TableCell>
                                            <TableCell>Reference</TableCell>
                                            <TableCell>Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {order.payments.map((payment) => (
                                            <TableRow key={payment.id} hover>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {payment.payment_method?.name ?? '—'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight={500}>
                                                        ₱{parseFloat(payment.amount).toFixed(2)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {payment.reference_no ?? '—'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {payment.paid_at
                                                            ? new Date(payment.paid_at).toLocaleString('en-PH', {
                                                                month: 'short', day: 'numeric',
                                                                hour: '2-digit', minute: '2-digit',
                                                            })
                                                            : '—'}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </>
                )}
            </Box>

            {/* Void confirmation */}
            <Dialog open={voidOpen} onClose={() => !processing && setVoidOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Void Order #{order.id}?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This will mark the order as voided, restore any stock, and reverse any credit charges. This cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setVoidOpen(false)} disabled={processing}>Cancel</Button>
                    <Button onClick={handleVoid} color="error" variant="contained" disabled={processing}>
                        {processing ? 'Voiding…' : 'Void Order'}
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
