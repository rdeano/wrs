import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Alert,
    Box,
    Button,
    Divider,
    FormControlLabel,
    InputAdornment,
    Paper,
    Stack,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import { useState } from 'react';

const GROUP_LABELS = {
    general:   'General',
    order:     'Orders',
    credit:    'Credit',
    delivery:  'Delivery',
    inventory: 'Inventory',
};

// Human-readable labels and helper text for known settings keys
const SETTING_META = {
    shop_name:               { label: 'Shop Name' },
    shop_address:            { label: 'Shop Address' },
    shop_phone:              { label: 'Shop Phone' },
    shop_logo:               { label: 'Shop Logo URL' },
    allow_walkin_no_customer:{ label: 'Allow Walk-in Without Customer', hint: 'Let cashiers complete a sale without selecting a customer' },
    allow_discount:          { label: 'Allow Discounts', hint: 'Enable per-order discount entry at POS' },
    allow_void_order:        { label: 'Allow Void Orders', hint: 'Let authorized users void a completed order' },
    default_credit_limit:    { label: 'Default Credit Limit (₱)', hint: 'Applied to new customers with no individual limit set' },
    allow_partial_payment:   { label: 'Allow Partial Payments', hint: 'Customers can pay any amount toward their balance' },
    over_limit_behavior:     { label: 'Over-Limit Behavior', hint: '"warn" shows a warning; "block" prevents the transaction' },
    delivery_enabled:        { label: 'Enable Delivery', hint: 'Show delivery features across the app' },
    default_delivery_fee:    { label: 'Default Delivery Fee (₱)' },
    delivery_slot_enabled:   { label: 'Enable Delivery Slots', hint: 'Let riders and customers pick Morning / Afternoon slots' },
    low_stock_threshold:     { label: 'Low-Stock Threshold (units)', hint: 'Alert when stock falls to or below this quantity' },
    notify_low_stock:        { label: 'Notify on Low Stock', hint: 'Send alerts to admin and manager when stock is low' },
};

const humanize = (key) =>
    key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function SettingField({ setting, value, onChange }) {
    const meta = SETTING_META[setting.key] ?? {};
    const label = meta.label ?? humanize(setting.key);
    const hint  = meta.hint ?? null;

    if (setting.type === 'boolean') {
        const checked = value === '1' || value === 'true';
        return (
            <Box>
                <FormControlLabel
                    label={<Typography variant="body2" fontWeight={500}>{label}</Typography>}
                    control={
                        <Switch
                            checked={checked}
                            onChange={(e) => onChange(e.target.checked ? '1' : '0')}
                        />
                    }
                />
                {hint && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 7, mt: -0.5 }}>
                        {hint}
                    </Typography>
                )}
            </Box>
        );
    }

    return (
        <TextField
            label={label}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            type={setting.type === 'integer' ? 'number' : 'text'}
            fullWidth
            size="small"
            helperText={hint}
            slotProps={setting.type === 'integer' ? {
                input: { inputProps: { min: 0 } },
            } : undefined}
        />
    );
}

export default function SettingsIndex({ settings }) {
    const { flash } = usePage().props;
    const groups = Object.keys(settings);
    const [tab, setTab] = useState(0);

    // Flatten all settings into { key: value } for the form
    const initialValues = {};
    Object.values(settings).forEach((group) =>
        group.forEach((s) => { initialValues[s.key] = s.value ?? ''; })
    );

    const { data, setData, put, processing } = useForm({ settings: initialValues });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.settings.update'));
    };

    const handleChange = (key, value) => {
        setData('settings', { ...data.settings, [key]: value });
    };

    const currentGroup    = groups[tab];
    const currentSettings = settings[currentGroup] ?? [];

    return (
        <AuthenticatedLayout
            header={
                <Typography variant="h6" fontWeight={600}>
                    Settings
                </Typography>
            }
        >
            <Head title="Settings" />

            <Box sx={{ maxWidth: 760, mx: 'auto' }}>
                {flash?.success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {flash.success}
                    </Alert>
                )}
                {flash?.error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {flash.error}
                    </Alert>
                )}

                <Paper variant="outlined">
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        {groups.map((g) => (
                            <Tab key={g} label={GROUP_LABELS[g] ?? humanize(g)} />
                        ))}
                    </Tabs>

                    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
                        <Stack spacing={2.5}>
                            {currentSettings.map((setting, i) => (
                                <Box key={setting.key}>
                                    <SettingField
                                        setting={setting}
                                        value={data.settings[setting.key]}
                                        onChange={(v) => handleChange(setting.key, v)}
                                    />
                                    {i < currentSettings.length - 1 && (
                                        <Divider sx={{ mt: 2.5 }} />
                                    )}
                                </Box>
                            ))}
                        </Stack>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={processing}
                            >
                                {processing ? 'Saving…' : 'Save Settings'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </AuthenticatedLayout>
    );
}
