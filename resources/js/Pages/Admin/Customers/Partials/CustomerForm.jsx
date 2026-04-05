import {
    Box,
    Divider,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    Typography,
} from '@mui/material';

const CUSTOMER_TYPES = [
    { value: 'regular',  label: 'Regular' },
    { value: 'suki',     label: 'Suki' },
    { value: 'bulk',     label: 'Bulk' },
    { value: 'business', label: 'Business' },
];

function Section({ title, children }) {
    return (
        <Box>
            <Typography variant="subtitle2" color="text.secondary"
                sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 11 }}>
                {title}
            </Typography>
            {children}
            <Divider sx={{ mt: 3 }} />
        </Box>
    );
}

function fieldError(errors, key) {
    return errors?.[key] ?? null;
}

export default function CustomerForm({ data, setData, errors, deliveryZones }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* ── Basic Info ── */}
            <Section title="Basic Info">
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                        <TextField
                            label="Full Name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            fullWidth required size="small"
                            error={Boolean(fieldError(errors, 'name'))}
                            helperText={fieldError(errors, 'name')}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size="small" required error={Boolean(fieldError(errors, 'type'))}>
                            <InputLabel>Type</InputLabel>
                            <Select label="Type" value={data.type} onChange={(e) => setData('type', e.target.value)}>
                                {CUSTOMER_TYPES.map((t) => (
                                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                                ))}
                            </Select>
                            {fieldError(errors, 'type') && <FormHelperText>{fieldError(errors, 'type')}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Phone"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            fullWidth size="small"
                            placeholder="09XXXXXXXXX"
                            error={Boolean(fieldError(errors, 'phone'))}
                            helperText={fieldError(errors, 'phone')}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            fullWidth size="small"
                            error={Boolean(fieldError(errors, 'email'))}
                            helperText={fieldError(errors, 'email')}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            label="Address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            fullWidth multiline rows={2} size="small"
                        />
                    </Grid>
                </Grid>
            </Section>

            {/* ── Credit & Delivery ── */}
            <Section title="Credit & Delivery">
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            label="Credit Limit"
                            type="number"
                            value={data.credit_limit}
                            onChange={(e) => setData('credit_limit', e.target.value)}
                            fullWidth size="small"
                            slotProps={{ input: {
                                startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                                inputProps: { min: 0, step: '0.01' },
                            }}}
                            helperText="Leave blank to use system default"
                            error={Boolean(fieldError(errors, 'credit_limit'))}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Delivery Zone</InputLabel>
                            <Select
                                label="Delivery Zone"
                                value={data.delivery_zone_id ?? ''}
                                onChange={(e) => setData('delivery_zone_id', e.target.value || null)}
                            >
                                <MenuItem value="">None</MenuItem>
                                {deliveryZones.map((z) => (
                                    <MenuItem key={z.id} value={z.id}>{z.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormControlLabel
                            label="Active"
                            control={
                                <Switch
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                />
                            }
                        />
                    </Grid>
                </Grid>
            </Section>

            {/* ── Notes ── */}
            <Box>
                <Typography variant="subtitle2" color="text.secondary"
                    sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 11 }}>
                    Notes
                </Typography>
                <TextField
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    fullWidth multiline rows={3} size="small"
                    placeholder="Internal notes about this customer…"
                />
            </Box>
        </Box>
    );
}
