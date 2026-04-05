import {
    Box,
    Button,
    Chip,
    Divider,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const PRODUCT_TYPES = [
    { value: 'refill',    label: 'Refill' },
    { value: 'container', label: 'Container' },
    { value: 'accessory', label: 'Accessory' },
    { value: 'bundle',    label: 'Bundle' },
];

const CUSTOMER_TYPES = [
    { value: 'all',      label: 'All customers' },
    { value: 'regular',  label: 'Regular' },
    { value: 'suki',     label: 'Suki' },
    { value: 'bulk',     label: 'Bulk' },
    { value: 'business', label: 'Business' },
];

function Section({ title, children }) {
    return (
        <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 11 }}>
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

export default function ProductForm({ data, setData, errors, availableProducts, processing }) {
    const profit = (parseFloat(data.selling_price) || 0) - (parseFloat(data.capital_cost) || 0);
    const margin = (parseFloat(data.selling_price) || 0) > 0
        ? ((profit / parseFloat(data.selling_price)) * 100).toFixed(1)
        : '0.0';

    const handleTypeChange = (type) => {
        setData({
            ...data,
            type,
            is_bundle: type === 'bundle',
            bundle_items: type !== 'bundle' ? [] : data.bundle_items,
        });
    };

    // ── Bundle items ────────────────────────────────────────────────────────
    const addBundleItem = () => {
        setData('bundle_items', [
            ...data.bundle_items,
            { product_id: '', quantity: 1, override_price: '' },
        ]);
    };

    const updateBundleItem = (i, field, value) => {
        const updated = [...data.bundle_items];
        updated[i] = { ...updated[i], [field]: value };
        setData('bundle_items', updated);
    };

    const removeBundleItem = (i) => {
        setData('bundle_items', data.bundle_items.filter((_, idx) => idx !== i));
    };

    // ── Pricing rules ────────────────────────────────────────────────────────
    const addPricingRule = () => {
        setData('pricing_rules', [
            ...data.pricing_rules,
            { label: '', customer_type: 'all', min_qty: 1, price: '', starts_at: '', ends_at: '', is_active: true },
        ]);
    };

    const updatePricingRule = (i, field, value) => {
        const updated = [...data.pricing_rules];
        updated[i] = { ...updated[i], [field]: value };
        setData('pricing_rules', updated);
    };

    const removePricingRule = (i) => {
        setData('pricing_rules', data.pricing_rules.filter((_, idx) => idx !== i));
    };

    return (
        <Stack spacing={3}>
            {/* ── Basic Info ── */}
            <Section title="Basic Info">
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                        <TextField
                            label="Product Name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            fullWidth
                            required
                            size="small"
                            error={Boolean(fieldError(errors, 'name'))}
                            helperText={fieldError(errors, 'name')}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size="small" required error={Boolean(fieldError(errors, 'type'))}>
                            <InputLabel>Type</InputLabel>
                            <Select label="Type" value={data.type} onChange={(e) => handleTypeChange(e.target.value)}>
                                {PRODUCT_TYPES.map((t) => (
                                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                                ))}
                            </Select>
                            {fieldError(errors, 'type') && <FormHelperText>{fieldError(errors, 'type')}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            label="Description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            fullWidth
                            multiline
                            rows={2}
                            size="small"
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField
                            label="Size"
                            value={data.size}
                            onChange={(e) => setData('size', e.target.value)}
                            fullWidth
                            size="small"
                            placeholder="5gal, 1L…"
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField
                            label="Unit"
                            value={data.unit}
                            onChange={(e) => setData('unit', e.target.value)}
                            fullWidth
                            size="small"
                            required
                            placeholder="gallon, bottle…"
                            error={Boolean(fieldError(errors, 'unit'))}
                            helperText={fieldError(errors, 'unit')}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField
                            label="Sort Order"
                            type="number"
                            value={data.sort_order}
                            onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                            fullWidth
                            size="small"
                            slotProps={{ input: { inputProps: { min: 0 } } }}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Box sx={{ pt: 0.5 }}>
                            <FormControlLabel
                                label="Active"
                                control={
                                    <Switch
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                }
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Section>

            {/* ── Pricing ── */}
            <Section title="Pricing">
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 6, sm: 4 }}>
                        <TextField
                            label="Capital Cost"
                            type="number"
                            value={data.capital_cost}
                            onChange={(e) => setData('capital_cost', e.target.value)}
                            fullWidth
                            size="small"
                            required
                            slotProps={{ input: { startAdornment: <InputAdornment position="start">₱</InputAdornment>, inputProps: { min: 0, step: '0.01' } } }}
                            error={Boolean(fieldError(errors, 'capital_cost'))}
                            helperText={fieldError(errors, 'capital_cost')}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                        <TextField
                            label="Selling Price"
                            type="number"
                            value={data.selling_price}
                            onChange={(e) => setData('selling_price', e.target.value)}
                            fullWidth
                            size="small"
                            required
                            slotProps={{ input: { startAdornment: <InputAdornment position="start">₱</InputAdornment>, inputProps: { min: 0, step: '0.01' } } }}
                            error={Boolean(fieldError(errors, 'selling_price'))}
                            helperText={fieldError(errors, 'selling_price')}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Box sx={{ bgcolor: profit >= 0 ? 'success.50' : 'error.50', border: 1, borderColor: profit >= 0 ? 'success.200' : 'error.200', borderRadius: 1, px: 2, py: 1 }}>
                            <Typography variant="caption" color="text.secondary">Profit / Margin</Typography>
                            <Typography variant="body2" fontWeight={600} color={profit >= 0 ? 'success.dark' : 'error.dark'}>
                                ₱{profit.toFixed(2)} &nbsp;·&nbsp; {margin}%
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Section>

            {/* ── Stock & Flags ── */}
            <Section title="Stock & Options">
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Stack spacing={0.5}>
                            <FormControlLabel
                                label="Track Stock"
                                control={
                                    <Switch
                                        checked={data.track_stock}
                                        onChange={(e) => setData('track_stock', e.target.checked)}
                                    />
                                }
                            />
                            {data.track_stock && (
                                <TextField
                                    label="Stock Quantity"
                                    type="number"
                                    value={data.stock_qty}
                                    onChange={(e) => setData('stock_qty', parseInt(e.target.value) || 0)}
                                    size="small"
                                    sx={{ maxWidth: 180 }}
                                    slotProps={{ input: { inputProps: { min: 0 } } }}
                                    error={Boolean(fieldError(errors, 'stock_qty'))}
                                    helperText={fieldError(errors, 'stock_qty')}
                                />
                            )}
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControlLabel
                            label="Includes Free Refill"
                            control={
                                <Switch
                                    checked={data.includes_free_refill}
                                    onChange={(e) => setData('includes_free_refill', e.target.checked)}
                                />
                            }
                        />
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 7, mt: -0.5 }}>
                            Buying this product includes one free refill
                        </Typography>
                    </Grid>
                </Grid>
            </Section>

            {/* ── Bundle Items (only when type = bundle) ── */}
            {data.is_bundle && (
                <Section title="Bundle Contents">
                    <Stack spacing={1.5}>
                        {data.bundle_items.map((item, i) => (
                            <Grid container spacing={1} key={i} alignItems="center">
                                <Grid size={{ xs: 12, sm: 5 }}>
                                    <FormControl fullWidth size="small" error={Boolean(fieldError(errors, `bundle_items.${i}.product_id`))}>
                                        <InputLabel>Product</InputLabel>
                                        <Select
                                            label="Product"
                                            value={item.product_id}
                                            onChange={(e) => updateBundleItem(i, 'product_id', e.target.value)}
                                        >
                                            {availableProducts.map((p) => (
                                                <MenuItem key={p.id} value={p.id}>
                                                    {p.name} <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>{p.unit}</Typography>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 4, sm: 2 }}>
                                    <TextField
                                        label="Qty"
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateBundleItem(i, 'quantity', parseInt(e.target.value) || 1)}
                                        fullWidth
                                        size="small"
                                        slotProps={{ input: { inputProps: { min: 1 } } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 4 }}>
                                    <TextField
                                        label="Override Price (optional)"
                                        type="number"
                                        value={item.override_price}
                                        onChange={(e) => updateBundleItem(i, 'override_price', e.target.value)}
                                        fullWidth
                                        size="small"
                                        slotProps={{ input: { startAdornment: <InputAdornment position="start">₱</InputAdornment>, inputProps: { min: 0, step: '0.01' } } }}
                                        placeholder="Default price"
                                    />
                                </Grid>
                                <Grid size={{ xs: 2, sm: 1 }} sx={{ textAlign: 'center' }}>
                                    <Tooltip title="Remove">
                                        <IconButton size="small" color="error" onClick={() => removeBundleItem(i)}>
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                            </Grid>
                        ))}
                        <Box>
                            <Button size="small" startIcon={<AddIcon />} onClick={addBundleItem} variant="outlined">
                                Add Product
                            </Button>
                        </Box>
                    </Stack>
                </Section>
            )}

            {/* ── Pricing Rules ── */}
            <Section title="Special Pricing Rules">
                <Stack spacing={1.5}>
                    {data.pricing_rules.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                            No special pricing rules. The selling price above applies to all customers.
                        </Typography>
                    )}
                    {data.pricing_rules.map((rule, i) => (
                        <Paper key={i} variant="outlined" sx={{ p: 1.5 }}>
                            <Grid container spacing={1.5} alignItems="flex-start">
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        label="Label"
                                        value={rule.label}
                                        onChange={(e) => updatePricingRule(i, 'label', e.target.value)}
                                        fullWidth
                                        size="small"
                                        placeholder="e.g. Suki price"
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Customer Type</InputLabel>
                                        <Select
                                            label="Customer Type"
                                            value={rule.customer_type}
                                            onChange={(e) => updatePricingRule(i, 'customer_type', e.target.value)}
                                        >
                                            {CUSTOMER_TYPES.map((t) => (
                                                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 2 }}>
                                    <TextField
                                        label="Min Qty"
                                        type="number"
                                        value={rule.min_qty}
                                        onChange={(e) => updatePricingRule(i, 'min_qty', parseInt(e.target.value) || 1)}
                                        fullWidth
                                        size="small"
                                        slotProps={{ input: { inputProps: { min: 1 } } }}
                                        error={Boolean(fieldError(errors, `pricing_rules.${i}.min_qty`))}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 2 }}>
                                    <TextField
                                        label="Price"
                                        type="number"
                                        value={rule.price}
                                        onChange={(e) => updatePricingRule(i, 'price', e.target.value)}
                                        fullWidth
                                        size="small"
                                        required
                                        slotProps={{ input: { startAdornment: <InputAdornment position="start">₱</InputAdornment>, inputProps: { min: 0, step: '0.01' } } }}
                                        error={Boolean(fieldError(errors, `pricing_rules.${i}.price`))}
                                    />
                                </Grid>
                                <Grid size={{ xs: 1 }} sx={{ pt: '6px !important' }}>
                                    <Tooltip title="Remove rule">
                                        <IconButton size="small" color="error" onClick={() => removePricingRule(i)}>
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <TextField
                                        label="Starts At"
                                        type="date"
                                        value={rule.starts_at ?? ''}
                                        onChange={(e) => updatePricingRule(i, 'starts_at', e.target.value)}
                                        fullWidth
                                        size="small"
                                        slotProps={{ inputLabel: { shrink: true } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <TextField
                                        label="Ends At"
                                        type="date"
                                        value={rule.ends_at ?? ''}
                                        onChange={(e) => updatePricingRule(i, 'ends_at', e.target.value)}
                                        fullWidth
                                        size="small"
                                        slotProps={{ inputLabel: { shrink: true } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 5 }}>
                                    <FormControlLabel
                                        label="Rule is active"
                                        control={
                                            <Switch
                                                size="small"
                                                checked={rule.is_active}
                                                onChange={(e) => updatePricingRule(i, 'is_active', e.target.checked)}
                                            />
                                        }
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                    <Box>
                        <Button size="small" startIcon={<AddIcon />} onClick={addPricingRule} variant="outlined">
                            Add Pricing Rule
                        </Button>
                    </Box>
                </Stack>
            </Section>

            {/* ── Notes ── */}
            <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 11 }}>
                    Notes
                </Typography>
                <TextField
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    placeholder="Internal notes about this product…"
                />
            </Box>
        </Stack>
    );
}
