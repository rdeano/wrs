import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Alert, Box, Button, FormControl, FormHelperText, Grid,
    InputAdornment, InputLabel, MenuItem, Paper, Select,
    Stack, TextField, Typography,
} from '@mui/material';

export default function DeliveryCreate({ orders, riders, zones, slots, settings }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        order_id:     '',
        rider_id:     '',
        zone_id:      '',
        slot_id:      '',
        fee:          '0',
        address:      '',
        scheduled_at: '',
        notes:        '',
    });

    const handleZoneChange = (zoneId) => {
        setData((prev) => {
            const zone = zones.find(z => z.id === parseInt(zoneId));
            return { ...prev, zone_id: zoneId, fee: zone ? zone.fee : prev.fee };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.deliveries.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>New Delivery</Typography>
                    <Button component={Link} href={route('admin.deliveries.index')} variant="text" size="small">
                        ← Back
                    </Button>
                </Stack>
            }
        >
            <Head title="New Delivery" />

            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                {flash?.error && <Alert severity="error" sx={{ mb: 2 }}>{flash.error}</Alert>}

                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Box component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={2}>

                            {/* Order */}
                            <Grid size={{ xs: 12 }}>
                                <FormControl fullWidth size="small" required error={Boolean(errors.order_id)}>
                                    <InputLabel>Order</InputLabel>
                                    <Select
                                        label="Order"
                                        value={data.order_id}
                                        onChange={(e) => setData('order_id', e.target.value)}
                                    >
                                        {orders.map(o => (
                                            <MenuItem key={o.id} value={o.id}>
                                                #{o.id} — {o.customer?.name ?? 'Walk-in'} — ₱{parseFloat(o.total).toFixed(2)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.order_id && <FormHelperText>{errors.order_id}</FormHelperText>}
                                </FormControl>
                            </Grid>

                            {/* Zone → auto-fills fee */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Zone</InputLabel>
                                    <Select
                                        label="Zone"
                                        value={data.zone_id}
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

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Delivery Fee"
                                    type="number"
                                    value={data.fee}
                                    onChange={(e) => setData('fee', e.target.value)}
                                    fullWidth size="small" required
                                    slotProps={{ input: {
                                        startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                                        inputProps: { min: 0, step: '0.01' },
                                    }}}
                                    error={Boolean(errors.fee)}
                                    helperText={errors.fee}
                                />
                            </Grid>

                            {/* Rider */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Assign Rider</InputLabel>
                                    <Select
                                        label="Assign Rider"
                                        value={data.rider_id}
                                        onChange={(e) => setData('rider_id', e.target.value)}
                                    >
                                        <MenuItem value="">Unassigned</MenuItem>
                                        {riders.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Slot */}
                            {settings.slot_enabled && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Delivery Slot</InputLabel>
                                        <Select
                                            label="Delivery Slot"
                                            value={data.slot_id}
                                            onChange={(e) => setData('slot_id', e.target.value)}
                                        >
                                            <MenuItem value="">None</MenuItem>
                                            {slots.map(s => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            {/* Scheduled */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Scheduled Date"
                                    type="date"
                                    value={data.scheduled_at}
                                    onChange={(e) => setData('scheduled_at', e.target.value)}
                                    fullWidth size="small"
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                            </Grid>

                            {/* Address */}
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label="Delivery Address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    fullWidth multiline rows={2} size="small"
                                    placeholder="Snapshot address for this delivery…"
                                />
                            </Grid>

                            {/* Notes */}
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label="Notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    fullWidth multiline rows={2} size="small"
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button component={Link} href={route('admin.deliveries.index')} variant="outlined" disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" disabled={processing}>
                                {processing ? 'Saving…' : 'Create Delivery'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </AuthenticatedLayout>
    );
}
