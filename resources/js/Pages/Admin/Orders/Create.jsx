import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Alert,
    Autocomplete,
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
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';

const TYPE_COLORS = { refill: 'info', container: 'success', accessory: 'warning', bundle: 'secondary' };

// ── Price resolution (mirrors backend logic) ─────────────────────────────────
function resolvePrice(product, customerType = 'regular') {
    const now = new Date();
    const rules = (product.pricing ?? [])
        .filter(r => r.is_active && r.min_qty <= 1)
        .filter(r => !r.starts_at || new Date(r.starts_at) <= now)
        .filter(r => !r.ends_at   || new Date(r.ends_at)   >= now)
        .filter(r => r.customer_type === 'all' || r.customer_type === customerType)
        .sort((a, b) => b.min_qty - a.min_qty || parseFloat(a.price) - parseFloat(b.price));
    return rules.length > 0 ? parseFloat(rules[0].price) : parseFloat(product.selling_price);
}

// ── Small product card ────────────────────────────────────────────────────────
function ProductCard({ product, customerType, onAdd }) {
    const price = resolvePrice(product, customerType);
    const outOfStock = product.track_stock && product.stock_qty <= 0;

    return (
        <Paper
            variant="outlined"
            onClick={() => !outOfStock && onAdd(product)}
            sx={{
                p: 1.5,
                cursor: outOfStock ? 'not-allowed' : 'pointer',
                opacity: outOfStock ? 0.5 : 1,
                transition: 'box-shadow 0.15s',
                '&:hover': !outOfStock ? { boxShadow: 3 } : {},
                userSelect: 'none',
            }}
        >
            <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ mb: 0.5 }}>
                <Chip
                    label={product.type}
                    size="small"
                    color={TYPE_COLORS[product.type] ?? 'default'}
                    variant="outlined"
                    sx={{ fontSize: 9, height: 18 }}
                />
                {product.includes_free_refill && (
                    <Chip label="+Free Refill" size="small" color="secondary" sx={{ fontSize: 9, height: 18 }} />
                )}
            </Stack>
            <Typography variant="body2" fontWeight={600} noWrap>{product.name}</Typography>
            {product.size && (
                <Typography variant="caption" color="text.secondary">{product.size} · {product.unit}</Typography>
            )}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
                <Typography variant="body2" fontWeight={700} color="primary.main">
                    ₱{price.toFixed(2)}
                </Typography>
                {product.track_stock && (
                    <Typography variant="caption" color={product.stock_qty <= 10 ? 'error.main' : 'text.secondary'}>
                        {product.stock_qty} left
                    </Typography>
                )}
            </Stack>
        </Paper>
    );
}

// ── Main POS component ────────────────────────────────────────────────────────
export default function OrderCreate({ products, customers, paymentMethods, settings, freeRefillProduct }) {
    const { flash } = usePage().props;

    const [customer,     setCustomer]     = useState(null);
    const [cart,         setCart]         = useState([]);
    const [discount,     setDiscount]     = useState('');
    const [notes,        setNotes]        = useState('');
    const [payments,     setPayments]     = useState([{ id: 1, methodId: '', amount: '', refNo: '' }]);
    const [search,       setSearch]       = useState('');
    const [typeFilter,   setTypeFilter]   = useState('');
    const [processing,   setProcessing]   = useState(false);
    const [errors,       setErrors]       = useState({});
    const [confirmOpen,  setConfirmOpen]  = useState(false);

    // Re-price cart when customer changes
    useEffect(() => {
        if (cart.length === 0) return;
        const ct = customer?.type ?? 'regular';
        setCart(prev => prev.map(item => {
            if (item.isFreeRefill) return item;
            const p = products.find(p => p.id === item.productId);
            return p ? { ...item, unitPrice: resolvePrice(p, ct) } : item;
        }));
    }, [customer]);

    const filteredProducts = products.filter(p => {
        const s = search.toLowerCase();
        return (!s || p.name.toLowerCase().includes(s) || (p.size ?? '').toLowerCase().includes(s))
            && (!typeFilter || p.type === typeFilter);
    });

    // ── Cart manipulation ─────────────────────────────────────────────────────
    const addToCart = useCallback((product) => {
        const ct = customer?.type ?? 'regular';
        const existIdx = cart.findIndex(i => i.productId === product.id && !i.isFreeRefill);

        if (existIdx >= 0) {
            setCart(prev => prev.map((item, i) =>
                i === existIdx ? { ...item, quantity: item.quantity + 1 } : item,
            ));
            return;
        }

        const key       = Date.now();
        const unitPrice = resolvePrice(product, ct);

        const newItems = [{
            key,
            productId:           product.id,
            productName:         product.name,
            unitPrice,
            capitalCost:         parseFloat(product.capital_cost),
            quantity:            1,
            isFreeRefill:        false,
            trackStock:          product.track_stock,
            includesFreeRefill:  product.includes_free_refill,
        }];

        if (product.includes_free_refill && settings.new_gallon_free_refill && freeRefillProduct) {
            newItems.push({
                key:          key + 1,
                linkedTo:     key,
                productId:    freeRefillProduct.id,
                productName:  `${freeRefillProduct.name} (Free Refill)`,
                unitPrice:    0,
                capitalCost:  parseFloat(freeRefillProduct.capital_cost),
                quantity:     1,
                isFreeRefill: true,
                trackStock:   freeRefillProduct.track_stock,
            });
        }

        setCart(prev => [...prev, ...newItems]);
    }, [cart, customer, freeRefillProduct, settings]);

    const updateQty = (key, delta) => {
        setCart(prev => prev.map(item => {
            if (item.key !== key) return item;
            const newQty = item.quantity + delta;
            return newQty < 1 ? item : { ...item, quantity: newQty };
        }));
    };

    const removeItem = (key) => {
        setCart(prev => prev.filter(i => i.key !== key && i.linkedTo !== key));
    };

    // ── Payments ──────────────────────────────────────────────────────────────
    const addPaymentRow = () => {
        setPayments(prev => [...prev, { id: Date.now(), methodId: '', amount: '', refNo: '' }]);
    };

    const updatePayment = (id, field, value) => {
        setPayments(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const removePaymentRow = (id) => {
        setPayments(prev => prev.filter(p => p.id !== id));
    };

    // ── Totals ────────────────────────────────────────────────────────────────
    const subtotal    = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const discountAmt = parseFloat(discount) || 0;
    const total       = Math.max(0, subtotal - discountAmt);
    const totalPaid   = payments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    const change      = Math.max(0, totalPaid - total);
    const creditOwed  = Math.max(0, total - totalPaid);

    // Credit limit warning
    const customerLimit   = customer
        ? parseFloat(customer.credit_limit ?? settings.default_credit_limit)
        : 0;
    const customerBalance = customer ? parseFloat(customer.outstanding_balance) : 0;
    const wouldExceed     = customer && creditOwed > 0 && (customerBalance + creditOwed) > customerLimit;
    const creditBlocked   = wouldExceed && settings.over_limit_behavior === 'block';

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        setProcessing(true);
        setErrors({});
        router.post(route('admin.orders.store'), {
            customer_id: customer?.id ?? null,
            type:        'walkin',
            discount:    discountAmt,
            notes,
            items: cart.map(i => ({
                product_id:     i.productId,
                quantity:       i.quantity,
                is_free_refill: i.isFreeRefill,
            })),
            payments: payments
                .filter(p => p.methodId && parseFloat(p.amount) > 0)
                .map(p => ({
                    payment_method_id: p.methodId,
                    amount:            parseFloat(p.amount),
                    reference_no:      p.refNo || null,
                })),
        }, {
            onError:  (e) => { setErrors(e); setProcessing(false); setConfirmOpen(false); },
            onFinish: ()  => setProcessing(false),
        });
    };

    const canSubmit = cart.length > 0 && !creditBlocked && !processing;

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>POS — New Order</Typography>
                    <Button component={Link} href={route('admin.orders.index')} variant="text" size="small">
                        ← Orders
                    </Button>
                </Stack>
            }
        >
            <Head title="POS — New Order" />

            {(flash?.error || errors?.general) && (
                <Alert severity="error" sx={{ mx: 2, mt: 1 }}>{flash?.error ?? errors.general}</Alert>
            )}

            <Grid container sx={{ height: { md: 'calc(100vh - 72px)' } }}>

                {/* ── LEFT: Product Browser ── */}
                <Grid size={{ xs: 12, md: 7 }} sx={{ borderRight: { md: 1 }, borderColor: 'divider', overflow: 'auto', p: 2 }}>
                    {/* Filters */}
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <TextField
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products…"
                            size="small"
                            fullWidth
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
                        />
                        <FormControl size="small" sx={{ minWidth: 130 }}>
                            <InputLabel>Type</InputLabel>
                            <Select label="Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="refill">Refill</MenuItem>
                                <MenuItem value="container">Container</MenuItem>
                                <MenuItem value="accessory">Accessory</MenuItem>
                                <MenuItem value="bundle">Bundle</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>

                    {/* Product grid */}
                    <Grid container spacing={1.5}>
                        {filteredProducts.map(product => (
                            <Grid key={product.id} size={{ xs: 6, sm: 4, lg: 3 }}>
                                <ProductCard
                                    product={product}
                                    customerType={customer?.type ?? 'regular'}
                                    onAdd={addToCart}
                                />
                            </Grid>
                        ))}
                        {filteredProducts.length === 0 && (
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                                    No products found.
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Grid>

                {/* ── RIGHT: Order Panel ── */}
                <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>

                        {/* Customer */}
                        <Typography variant="subtitle2" color="text.secondary"
                            sx={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5, mb: 1 }}>
                            Customer
                        </Typography>
                        <Autocomplete
                            options={customers}
                            getOptionLabel={(c) => `${c.name}${c.phone ? ' · ' + c.phone : ''}`}
                            value={customer}
                            onChange={(_, v) => setCustomer(v)}
                            size="small"
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Walk-in (no customer)"
                                    error={Boolean(errors.customer_id)}
                                    helperText={errors.customer_id}
                                />
                            )}
                            renderOption={(props, c) => (
                                <li {...props} key={c.id}>
                                    <Box>
                                        <Typography variant="body2">{c.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {c.type} · Balance: ₱{parseFloat(c.outstanding_balance).toFixed(2)}
                                        </Typography>
                                    </Box>
                                </li>
                            )}
                            sx={{ mb: 0.5 }}
                        />
                        {customer && (
                            <Typography variant="caption" color={customerBalance > 0 ? 'error.main' : 'text.secondary'}>
                                Balance: ₱{customerBalance.toFixed(2)} · Limit: ₱{customerLimit.toFixed(2)}
                            </Typography>
                        )}

                        <Divider sx={{ my: 2 }} />

                        {/* Cart */}
                        <Typography variant="subtitle2" color="text.secondary"
                            sx={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5, mb: 1 }}>
                            Cart {cart.length > 0 && `(${cart.length} line${cart.length > 1 ? 's' : ''})`}
                        </Typography>

                        {cart.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                                Click products on the left to add them.
                            </Typography>
                        ) : (
                            <Stack spacing={0.5} sx={{ mb: 1 }}>
                                {cart.map((item) => (
                                    <Box key={item.key}
                                        sx={{
                                            display: 'flex', alignItems: 'center', gap: 1,
                                            bgcolor: item.isFreeRefill ? 'success.50' : 'transparent',
                                            borderRadius: 1, px: 1, py: 0.5,
                                        }}
                                    >
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="body2" noWrap>
                                                {item.productName}
                                                {item.isFreeRefill && (
                                                    <Chip label="FREE" size="small" color="success"
                                                        sx={{ ml: 0.5, fontSize: 9, height: 16 }} />
                                                )}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                ₱{item.unitPrice.toFixed(2)} each
                                            </Typography>
                                        </Box>
                                        {!item.isFreeRefill && (
                                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                                <IconButton size="small" onClick={() => updateQty(item.key, -1)} disabled={item.quantity <= 1}>
                                                    <RemoveIcon sx={{ fontSize: 14 }} />
                                                </IconButton>
                                                <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                                                    {item.quantity}
                                                </Typography>
                                                <IconButton size="small" onClick={() => updateQty(item.key, 1)}>
                                                    <AddIcon sx={{ fontSize: 14 }} />
                                                </IconButton>
                                            </Stack>
                                        )}
                                        <Typography variant="body2" fontWeight={600} sx={{ minWidth: 64, textAlign: 'right' }}>
                                            ₱{(item.unitPrice * item.quantity).toFixed(2)}
                                        </Typography>
                                        <Tooltip title="Remove">
                                            <IconButton size="small" color="error" onClick={() => removeItem(item.key)}>
                                                <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                ))}
                            </Stack>
                        )}

                        <Divider sx={{ my: 2 }} />

                        {/* Discount */}
                        {settings.allow_discount && (
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ flex: 1 }}>Discount</Typography>
                                <TextField
                                    type="number"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    size="small"
                                    sx={{ width: 130 }}
                                    slotProps={{ input: {
                                        startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                                        inputProps: { min: 0, step: '0.01' },
                                    }}}
                                />
                            </Stack>
                        )}

                        {/* Totals */}
                        <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
                            <Stack spacing={0.5}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                                    <Typography variant="body2">₱{subtotal.toFixed(2)}</Typography>
                                </Stack>
                                {discountAmt > 0 && (
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Discount</Typography>
                                        <Typography variant="body2" color="error.main">−₱{discountAmt.toFixed(2)}</Typography>
                                    </Stack>
                                )}
                                <Divider />
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body1" fontWeight={700}>Total</Typography>
                                    <Typography variant="body1" fontWeight={700} color="primary.main">
                                        ₱{total.toFixed(2)}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Paid</Typography>
                                    <Typography variant="body2">₱{totalPaid.toFixed(2)}</Typography>
                                </Stack>
                                {change > 0 && (
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="success.main">Change</Typography>
                                        <Typography variant="body2" color="success.main">₱{change.toFixed(2)}</Typography>
                                    </Stack>
                                )}
                                {creditOwed > 0 && (
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color={wouldExceed ? 'error.main' : 'warning.main'}>
                                            Credit Charged
                                        </Typography>
                                        <Typography variant="body2" color={wouldExceed ? 'error.main' : 'warning.main'}>
                                            ₱{creditOwed.toFixed(2)}
                                        </Typography>
                                    </Stack>
                                )}
                            </Stack>
                        </Paper>

                        {wouldExceed && (
                            <Alert severity={creditBlocked ? 'error' : 'warning'} sx={{ mb: 2 }}>
                                {creditBlocked
                                    ? 'Credit limit exceeded — transaction blocked.'
                                    : 'Warning: this will exceed the customer\'s credit limit.'}
                            </Alert>
                        )}

                        {/* Payment rows */}
                        <Typography variant="subtitle2" color="text.secondary"
                            sx={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5, mb: 1 }}>
                            Payment
                        </Typography>
                        <Stack spacing={1} sx={{ mb: 1 }}>
                            {payments.map((p) => (
                                <Stack key={p.id} direction="row" spacing={1} alignItems="flex-start">
                                    <FormControl size="small" sx={{ minWidth: 120 }}
                                        error={Boolean(errors[`payments.${payments.indexOf(p)}.payment_method_id`])}>
                                        <InputLabel>Method</InputLabel>
                                        <Select
                                            label="Method"
                                            value={p.methodId}
                                            onChange={(e) => updatePayment(p.id, 'methodId', e.target.value)}
                                        >
                                            {paymentMethods.map(m => (
                                                <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        label="Amount"
                                        type="number"
                                        value={p.amount}
                                        onChange={(e) => updatePayment(p.id, 'amount', e.target.value)}
                                        size="small"
                                        sx={{ width: 110 }}
                                        slotProps={{ input: {
                                            startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                                            inputProps: { min: 0, step: '0.01' },
                                        }}}
                                    />
                                    <TextField
                                        label="Ref #"
                                        value={p.refNo}
                                        onChange={(e) => updatePayment(p.id, 'refNo', e.target.value)}
                                        size="small"
                                        sx={{ flex: 1 }}
                                        placeholder="GCash/Maya ref"
                                    />
                                    {payments.length > 1 && (
                                        <IconButton size="small" color="error" onClick={() => removePaymentRow(p.id)} sx={{ mt: 0.5 }}>
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Stack>
                            ))}
                        </Stack>
                        <Button size="small" startIcon={<AddIcon />} onClick={addPaymentRow} sx={{ mb: 2 }}>
                            Add Payment Method
                        </Button>

                        {/* Notes */}
                        <TextField
                            label="Order Notes (optional)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            fullWidth
                            multiline
                            rows={2}
                            size="small"
                        />
                    </Box>

                    {/* Confirm button — sticky bottom */}
                    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={!canSubmit}
                            onClick={() => setConfirmOpen(true)}
                        >
                            Confirm Order · ₱{total.toFixed(2)}
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            {/* Confirm dialog */}
            <Dialog open={confirmOpen} onClose={() => !processing && setConfirmOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Confirm Order?</DialogTitle>
                <DialogContent>
                    <Stack spacing={0.5}>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2">Items</Typography>
                            <Typography variant="body2">{cart.length}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" fontWeight={700}>Total</Typography>
                            <Typography variant="body2" fontWeight={700}>₱{total.toFixed(2)}</Typography>
                        </Stack>
                        {creditOwed > 0 && (
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2" color="warning.main">Credit charged</Typography>
                                <Typography variant="body2" color="warning.main">₱{creditOwed.toFixed(2)}</Typography>
                            </Stack>
                        )}
                        {change > 0 && (
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2" color="success.main">Change</Typography>
                                <Typography variant="body2" color="success.main">₱{change.toFixed(2)}</Typography>
                            </Stack>
                        )}
                        {customer && (
                            <Typography variant="caption" color="text.secondary" sx={{ pt: 1 }}>
                                Customer: {customer.name}
                            </Typography>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)} disabled={processing}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={processing}>
                        {processing ? 'Processing…' : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
