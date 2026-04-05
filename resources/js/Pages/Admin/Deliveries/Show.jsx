import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Alert, Box, Button, Chip, Divider, FormControl, Grid,
    InputAdornment, InputLabel, MenuItem, Paper, Select,
    Stack, TextField, Typography,
} from '@mui/material';

const STATUS_COLOR = {
    pending:    'default',
    assigned:   'info',
    in_transit: 'warning',
    delivered:  'success',
    failed:     'error',
};

// Ordered pipeline for display
const STATUS_STEPS = ['pending', 'assigned', 'in_transit', 'delivered'];

function InfoRow({ label, value }) {
    return (
        <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" fontWeight={500}>{value ?? '—'}</Typography>
        </Stack>
    );
}

function StatusStepper({ current }) {
    const idx = STATUS_STEPS.indexOf(current);
    return (
        <Stack direction="row" spacing={0.5} alignItems="center">
            {STATUS_STEPS.map((s, i) => (
                <Box key={s} sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <Box sx={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        bgcolor: i <= idx ? 'primary.main' : 'grey.300',
                    }} />
                </Box>
            ))}
        </Stack>
    );
}

export default function DeliveryShow({ delivery, riders, zones, slots, settings }) {
    const { flash } = usePage().props;

    const assignForm = useForm({
        rider_id:     delivery.rider_id ?? '',
        zone_id:      delivery.zone_id  ?? '',
        slot_id:      delivery.slot_id  ?? '',
        fee:          delivery.fee      ?? '0',
        address:      delivery.address  ?? '',
        scheduled_at: delivery.scheduled_at
            ? delivery.scheduled_at.substring(0, 10)
            : '',
        notes: delivery.notes ?? '',
    });

    const handleZoneChange = (zoneId) => {
        const zone = zones.find(z => z.id === parseInt(zoneId));
        assignForm.setData((prev) => ({ ...prev, zone_id: zoneId, fee: zone ? zone.fee : prev.fee }));
    };

    const submitAssign = (e) => {
        e.preventDefault();
        assignForm.post(route('admin.deliveries.assign', delivery.id));
    };

    const setStatus = (status) => {
        router.post(route('admin.deliveries.status', delivery.id), { status });
    };

    const canAdvance = !['delivered', 'failed'].includes(delivery.status);
    const nextStatus = {
        pending:    'assigned',
        assigned:   'in_transit',
        in_transit: 'delivered',
    }[delivery.status];

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Typography variant="h6" fontWeight={600}>Delivery #{delivery.id}</Typography>
                        <Chip
                            label={delivery.status.replace('_', ' ')}
                            color={STATUS_COLOR[delivery.status] ?? 'default'}
                            size="small"
                        />
                    </Stack>
                    <Button component={Link} href={route('admin.deliveries.index')} variant="text" size="small">
                        ← Deliveries
                    </Button>
                </Stack>
            }
        >
            <Head title={`Delivery #${delivery.id}`} />

            <Box>
                {flash?.success && <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>}
                {flash?.error   && <Alert severity="error"   sx={{ mb: 2 }}>{flash.error}</Alert>}

                {/* Status progress */}
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        {STATUS_STEPS.map(s => (
                            <Typography key={s} variant="caption"
                                color={s === delivery.status ? 'primary.main' : 'text.secondary'}
                                fontWeight={s === delivery.status ? 700 : 400}
                                sx={{ textTransform: 'capitalize', fontSize: 10 }}>
                                {s.replace('_', ' ')}
                            </Typography>
                        ))}
                    </Stack>
                    <StatusStepper current={delivery.status} />

                    {/* Status action buttons */}
                    {canAdvance && (
                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                            {nextStatus && (
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => setStatus(nextStatus)}
                                >
                                    Mark as {nextStatus.replace('_', ' ')}
                                </Button>
                            )}
                            {delivery.status !== 'failed' && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => setStatus('failed')}
                                >
                                    Mark Failed
                                </Button>
                            )}
                        </Stack>
                    )}
                    {delivery.delivered_at && (
                        <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                            Delivered on {new Date(delivery.delivered_at).toLocaleString('en-PH', {
                                month: 'short', day: 'numeric', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })}
                        </Typography>
                    )}
                </Paper>

                <Grid container spacing={2}>
                    {/* Left: Order + customer summary */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Stack spacing={2}>
                            {/* Order card */}
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary"
                                    sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                                    Linked Order
                                </Typography>
                                <Divider sx={{ mb: 1.5 }} />
                                <InfoRow
                                    label="Order"
                                    value={
                                        <Button
                                            component={Link}
                                            href={route('admin.orders.show', delivery.order_id)}
                                            size="small"
                                            variant="text"
                                            sx={{ p: 0, minWidth: 0 }}
                                        >
                                            #{delivery.order_id}
                                        </Button>
                                    }
                                />
                                <InfoRow label="Customer" value={delivery.order?.customer?.name ?? 'Walk-in'} />
                                <InfoRow label="Phone"    value={delivery.order?.customer?.phone} />
                                <InfoRow
                                    label="Order Total"
                                    value={delivery.order ? `₱${parseFloat(delivery.order.total).toFixed(2)}` : '—'}
                                />

                                {/* Items summary */}
                                {delivery.order?.items?.length > 0 && (
                                    <Box sx={{ mt: 1.5 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                            Items
                                        </Typography>
                                        {delivery.order.items.map(item => (
                                            <Typography key={item.id} variant="body2" color="text.secondary">
                                                {item.quantity}× {item.product_name}
                                            </Typography>
                                        ))}
                                    </Box>
                                )}
                            </Paper>

                            {/* Delivery info card */}
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary"
                                    sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                                    Delivery Info
                                </Typography>
                                <Divider sx={{ mb: 1.5 }} />
                                <InfoRow label="Zone"      value={delivery.zone?.name} />
                                <InfoRow label="Slot"      value={delivery.slot?.label} />
                                <InfoRow label="Rider"     value={delivery.rider?.name} />
                                <InfoRow label="Fee"       value={`₱${parseFloat(delivery.fee).toFixed(2)}`} />
                                <InfoRow
                                    label="Scheduled"
                                    value={delivery.scheduled_at
                                        ? new Date(delivery.scheduled_at).toLocaleDateString('en-PH', {
                                            month: 'short', day: 'numeric', year: 'numeric',
                                        })
                                        : null}
                                />
                                {delivery.address && (
                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Address</Typography>
                                        <Typography variant="body2">{delivery.address}</Typography>
                                    </Box>
                                )}
                                {delivery.notes && (
                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Notes</Typography>
                                        <Typography variant="body2">{delivery.notes}</Typography>
                                    </Box>
                                )}
                            </Paper>
                        </Stack>
                    </Grid>

                    {/* Right: Assignment form */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary"
                                sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                                Update Assignment
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box component="form" onSubmit={submitAssign}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Rider</InputLabel>
                                            <Select
                                                label="Rider"
                                                value={assignForm.data.rider_id}
                                                onChange={(e) => assignForm.setData('rider_id', e.target.value)}
                                            >
                                                <MenuItem value="">Unassigned</MenuItem>
                                                {riders.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Zone</InputLabel>
                                            <Select
                                                label="Zone"
                                                value={assignForm.data.zone_id}
                                                onChange={(e) => handleZoneChange(e.target.value)}
                                            >
                                                <MenuItem value="">None</MenuItem>
                                                {zones.map(z => (
                                                    <MenuItem key={z.id} value={z.id}>
                                                        {z.name} — ₱{parseFloat(z.fee).toFixed(2)}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {settings.slot_enabled && (
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Slot</InputLabel>
                                                <Select
                                                    label="Slot"
                                                    value={assignForm.data.slot_id}
                                                    onChange={(e) => assignForm.setData('slot_id', e.target.value)}
                                                >
                                                    <MenuItem value="">None</MenuItem>
                                                    {slots.map(s => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    )}

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            label="Delivery Fee"
                                            type="number"
                                            value={assignForm.data.fee}
                                            onChange={(e) => assignForm.setData('fee', e.target.value)}
                                            fullWidth size="small"
                                            slotProps={{ input: {
                                                startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                                                inputProps: { min: 0, step: '0.01' },
                                            }}}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            label="Scheduled Date"
                                            type="date"
                                            value={assignForm.data.scheduled_at}
                                            onChange={(e) => assignForm.setData('scheduled_at', e.target.value)}
                                            fullWidth size="small"
                                            slotProps={{ inputLabel: { shrink: true } }}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            label="Address"
                                            value={assignForm.data.address}
                                            onChange={(e) => assignForm.setData('address', e.target.value)}
                                            fullWidth multiline rows={2} size="small"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            label="Notes"
                                            value={assignForm.data.notes}
                                            onChange={(e) => assignForm.setData('notes', e.target.value)}
                                            fullWidth multiline rows={2} size="small"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <Button type="submit" variant="contained" disabled={assignForm.processing}>
                                            {assignForm.processing ? 'Saving…' : 'Save Changes'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </AuthenticatedLayout>
    );
}
