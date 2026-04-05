import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Box, Button, Divider, Grid, MenuItem, Paper,
    Select, Stack, Tab, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Tabs, TextField, Typography,
} from '@mui/material';
import { useState } from 'react';
import TrendingUpIcon    from '@mui/icons-material/TrendingUp';
import TrendingDownIcon  from '@mui/icons-material/TrendingDown';
import ShoppingCartIcon  from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptLongIcon   from '@mui/icons-material/ReceiptLong';
import PeopleIcon        from '@mui/icons-material/People';

const peso = (v) => '₱' + parseFloat(v ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });
const pct  = (a, b) => b ? ((a / b) * 100).toFixed(1) : '0.0';

/* ── Bar chart ─────────────────────────────────────────────────── */
function BarChart({ data, valueKey = 'total', labelKey = 'period', height = 140 }) {
    const max = Math.max(...data.map(d => d[valueKey]), 1);
    return (
        <Stack direction="row" alignItems="flex-end" spacing={0.5} sx={{ height, px: 0.5, overflow: 'hidden' }}>
            {data.map((d, i) => {
                const h = Math.max((d[valueKey] / max) * (height - 28), d[valueKey] > 0 ? 3 : 1);
                return (
                    <Stack key={i} alignItems="center" sx={{ flex: 1, height: '100%', justifyContent: 'flex-end' }} spacing={0.5}>
                        <Stack sx={{ flex: 1, width: '100%', justifyContent: 'flex-end' }}>
                            <Box sx={{ width: '100%', height: h, bgcolor: 'primary.main', borderRadius: '3px 3px 0 0', opacity: 0.85 }} />
                        </Stack>
                        <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', whiteSpace: 'nowrap', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {d[labelKey]}
                        </Typography>
                    </Stack>
                );
            })}
        </Stack>
    );
}

/* ── Horizontal bar ────────────────────────────────────────────── */
function HBar({ label, value, max, formatted, sub }) {
    const w = max ? Math.max((value / max) * 100, value > 0 ? 2 : 0) : 0;
    return (
        <Box sx={{ mb: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 500 }} noWrap>{label}</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                    {sub && <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>{sub}</Typography>}
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>{formatted}</Typography>
                </Stack>
            </Stack>
            <Box sx={{ height: 6, bgcolor: '#e2e8f0', borderRadius: 3 }}>
                <Box sx={{ height: '100%', width: `${w}%`, bgcolor: 'primary.main', borderRadius: 3, transition: 'width 0.4s' }} />
            </Box>
        </Box>
    );
}

/* ── KPI card ──────────────────────────────────────────────────── */
function KpiCard({ label, value, sub, accent = '#e2e8f0', icon }) {
    return (
        <Paper sx={{ p: 2, borderLeft: `3px solid ${accent}`, height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', right: 12, top: 12, color: accent, opacity: 0.15, lineHeight: 0 }}>
                {icon}
            </Box>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'text.disabled' }}>
                {label}
            </Typography>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', mt: 0.5, mb: 0.25 }}>
                {value}
            </Typography>
            {sub && <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>{sub}</Typography>}
        </Paper>
    );
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function ReportsIndex({
    filters, summary, salesChart, topProducts, topCustomers,
    paymentBreakdown, expensesByCategory, deliveryStats, deliveryByZone, ordersByType,
}) {
    const [tab, setTab] = useState(0);
    const [from, setFrom] = useState(filters.from);
    const [to,   setTo]   = useState(filters.to);
    const [group, setGroup] = useState(filters.group);

    const apply = () => router.get(route('admin.reports.index'), { from, to, group }, { preserveState: true, preserveScroll: true });

    const maxProduct  = Math.max(...topProducts.map(p => p.revenue), 1);
    const maxCustomer = Math.max(...topCustomers.map(c => c.total), 1);
    const maxExpense  = Math.max(...expensesByCategory.map(e => e.total), 1);
    const maxZone     = Math.max(...deliveryByZone.map(z => z.count), 1);

    return (
        <AuthenticatedLayout header="Reports">
            <Head title="Reports" />

            {/* ── Filter bar ── */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                    <TextField label="From" type="date" size="small" value={from}
                        onChange={e => setFrom(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 160 }} />
                    <TextField label="To" type="date" size="small" value={to}
                        onChange={e => setTo(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 160 }} />
                    <Select size="small" value={group} onChange={e => setGroup(e.target.value)} sx={{ width: 130 }}>
                        <MenuItem value="day">Daily</MenuItem>
                        <MenuItem value="week">Weekly</MenuItem>
                        <MenuItem value="month">Monthly</MenuItem>
                    </Select>
                    <Button variant="contained" onClick={apply} sx={{ px: 3 }}>Apply</Button>
                    <Box sx={{ flex: 1 }} />
                    <Typography sx={{ fontSize: '0.78rem', color: 'text.disabled' }}>
                        {filters.from} → {filters.to}
                    </Typography>
                </Stack>
            </Paper>

            {/* ── KPI Summary ── */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <KpiCard label="Total Sales" value={peso(summary.total_sales)}
                        sub={`${summary.total_orders} orders`} accent="#2563eb"
                        icon={<ShoppingCartIcon sx={{ fontSize: 44 }} />} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <KpiCard label="Avg Order" value={peso(summary.avg_order)}
                        sub="per transaction" accent="#7c3aed"
                        icon={<ShoppingCartIcon sx={{ fontSize: 44 }} />} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <KpiCard label="Gross Profit" value={peso(summary.gross_profit)}
                        sub={`${pct(summary.gross_profit, summary.total_sales)}% margin`}
                        accent="#16a34a" icon={<TrendingUpIcon sx={{ fontSize: 44 }} />} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <KpiCard label="Expenses" value={peso(summary.total_expenses)}
                        sub="operating costs" accent="#d97706"
                        icon={<ReceiptLongIcon sx={{ fontSize: 44 }} />} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <KpiCard label="Net Profit" value={peso(summary.net_profit)}
                        sub="after expenses"
                        accent={summary.net_profit >= 0 ? '#16a34a' : '#dc2626'}
                        icon={summary.net_profit >= 0
                            ? <TrendingUpIcon sx={{ fontSize: 44 }} />
                            : <TrendingDownIcon sx={{ fontSize: 44 }} />} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <KpiCard label="Deliveries" value={deliveryStats.total}
                        sub={`${deliveryStats.delivered} delivered`} accent="#0097a7"
                        icon={<LocalShippingIcon sx={{ fontSize: 44 }} />} />
                </Grid>
            </Grid>

            {/* ── Tabs ── */}
            <Paper sx={{ mb: 2 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}
                    sx={{ borderBottom: '1px solid #e2e8f0', px: 2 }}>
                    <Tab label="Sales" />
                    <Tab label="Products" />
                    <Tab label="Customers" />
                    <Tab label="Expenses" />
                    <Tab label="Deliveries" />
                </Tabs>

                <Box sx={{ p: 2.5 }}>

                    {/* ── SALES TAB ── */}
                    {tab === 0 && (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                                    Sales Over Time
                                </Typography>
                                {salesChart.length === 0 ? (
                                    <Typography color="text.disabled" sx={{ py: 4, textAlign: 'center' }}>No data for this period.</Typography>
                                ) : (
                                    <>
                                        <BarChart data={salesChart} valueKey="total" labelKey="period" height={160} />
                                        <Divider sx={{ my: 2 }} />
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Period</TableCell>
                                                        <TableCell align="right">Orders</TableCell>
                                                        <TableCell align="right">Sales</TableCell>
                                                        <TableCell align="right">Discount</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {salesChart.map((r, i) => (
                                                        <TableRow key={i} hover>
                                                            <TableCell>{r.period}</TableCell>
                                                            <TableCell align="right">{r.orders}</TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 600 }}>{peso(r.total)}</TableCell>
                                                            <TableCell align="right" sx={{ color: 'error.main' }}>{r.discount > 0 ? `−${peso(r.discount)}` : '—'}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </>
                                )}
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Order Types</Typography>
                                {ordersByType.map(t => (
                                    <HBar key={t.type} label={t.type}
                                        value={t.total}
                                        max={Math.max(...ordersByType.map(x => x.total), 1)}
                                        formatted={peso(t.total)}
                                        sub={`${t.count} orders`} />
                                ))}

                                <Divider sx={{ my: 2 }} />

                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Payment Methods</Typography>
                                {paymentBreakdown.map(p => (
                                    <HBar key={p.method} label={p.method}
                                        value={p.total}
                                        max={Math.max(...paymentBreakdown.map(x => x.total), 1)}
                                        formatted={peso(p.total)}
                                        sub={`${p.count} orders`} />
                                ))}
                                {paymentBreakdown.length === 0 && (
                                    <Typography color="text.disabled" sx={{ fontSize: '0.85rem' }}>No payment data.</Typography>
                                )}
                            </Grid>
                        </Grid>
                    )}

                    {/* ── PRODUCTS TAB ── */}
                    {tab === 1 && (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 5 }}>
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Top Products by Revenue</Typography>
                                {topProducts.length === 0
                                    ? <Typography color="text.disabled">No sales data.</Typography>
                                    : topProducts.map(p => (
                                        <HBar key={p.name} label={p.name}
                                            value={p.revenue} max={maxProduct}
                                            formatted={peso(p.revenue)}
                                            sub={`${p.qty} sold`} />
                                    ))}
                            </Grid>
                            <Grid size={{ xs: 12, md: 7 }}>
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Product Performance</Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Product</TableCell>
                                                <TableCell align="right">Qty Sold</TableCell>
                                                <TableCell align="right">Revenue</TableCell>
                                                <TableCell align="right">Gross Profit</TableCell>
                                                <TableCell align="right">Margin</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {topProducts.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.disabled' }}>No data.</TableCell>
                                                </TableRow>
                                            )}
                                            {topProducts.map((p, i) => (
                                                <TableRow key={i} hover>
                                                    <TableCell sx={{ fontWeight: 500 }}>{p.name}</TableCell>
                                                    <TableCell align="right">{p.qty}</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600 }}>{peso(p.revenue)}</TableCell>
                                                    <TableCell align="right" sx={{ color: p.profit >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                                                        {peso(p.profit)}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Box component="span" sx={{
                                                            px: 1, py: 0.25, borderRadius: 1, fontSize: '0.72rem', fontWeight: 600,
                                                            bgcolor: p.revenue > 0 && p.profit / p.revenue > 0.3 ? '#dcfce7' : '#fef3c7',
                                                            color:   p.revenue > 0 && p.profit / p.revenue > 0.3 ? '#166534' : '#92400e',
                                                        }}>
                                                            {p.revenue > 0 ? pct(p.profit, p.revenue) : '0.0'}%
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>
                    )}

                    {/* ── CUSTOMERS TAB ── */}
                    {tab === 2 && (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 5 }}>
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Top Customers by Spend</Typography>
                                {topCustomers.length === 0
                                    ? <Typography color="text.disabled">No customer data.</Typography>
                                    : topCustomers.map(c => (
                                        <HBar key={c.name} label={c.name}
                                            value={c.total} max={maxCustomer}
                                            formatted={peso(c.total)}
                                            sub={`${c.order_count} orders`} />
                                    ))}
                            </Grid>
                            <Grid size={{ xs: 12, md: 7 }}>
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Customer Details</Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Customer</TableCell>
                                                <TableCell align="right">Orders</TableCell>
                                                <TableCell align="right">Total Spend</TableCell>
                                                <TableCell align="right">Avg Order</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {topCustomers.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.disabled' }}>No data.</TableCell>
                                                </TableRow>
                                            )}
                                            {topCustomers.map((c, i) => (
                                                <TableRow key={i} hover>
                                                    <TableCell sx={{ fontWeight: 500 }}>{c.name}</TableCell>
                                                    <TableCell align="right">{c.order_count}</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600 }}>{peso(c.total)}</TableCell>
                                                    <TableCell align="right" sx={{ color: 'text.secondary' }}>
                                                        {peso(c.order_count > 0 ? c.total / c.order_count : 0)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>
                    )}

                    {/* ── EXPENSES TAB ── */}
                    {tab === 3 && (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 5 }}>
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Expenses by Category</Typography>
                                {expensesByCategory.length === 0
                                    ? <Typography color="text.disabled">No expenses recorded.</Typography>
                                    : expensesByCategory.map(e => (
                                        <HBar key={e.category} label={e.category}
                                            value={e.total} max={maxExpense}
                                            formatted={peso(e.total)}
                                            sub={`${e.count} entries`} />
                                    ))}
                            </Grid>
                            <Grid size={{ xs: 12, md: 7 }}>
                                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                                    <Paper sx={{ p: 2, flex: 1, borderLeft: '3px solid #d97706' }}>
                                        <Typography sx={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'text.disabled', fontWeight: 600 }}>
                                            Total Expenses
                                        </Typography>
                                        <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, mt: 0.5 }}>{peso(summary.total_expenses)}</Typography>
                                    </Paper>
                                    <Paper sx={{ p: 2, flex: 1, borderLeft: '3px solid #16a34a' }}>
                                        <Typography sx={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'text.disabled', fontWeight: 600 }}>
                                            Gross Profit
                                        </Typography>
                                        <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, mt: 0.5 }}>{peso(summary.gross_profit)}</Typography>
                                    </Paper>
                                    <Paper sx={{ p: 2, flex: 1, borderLeft: `3px solid ${summary.net_profit >= 0 ? '#16a34a' : '#dc2626'}` }}>
                                        <Typography sx={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'text.disabled', fontWeight: 600 }}>
                                            Net Profit
                                        </Typography>
                                        <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, mt: 0.5, color: summary.net_profit >= 0 ? 'success.main' : 'error.main' }}>
                                            {peso(summary.net_profit)}
                                        </Typography>
                                    </Paper>
                                </Stack>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Category</TableCell>
                                                <TableCell align="right">Entries</TableCell>
                                                <TableCell align="right">Amount</TableCell>
                                                <TableCell align="right">% of Total</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {expensesByCategory.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.disabled' }}>No expenses.</TableCell>
                                                </TableRow>
                                            )}
                                            {expensesByCategory.map((e, i) => (
                                                <TableRow key={i} hover>
                                                    <TableCell sx={{ fontWeight: 500 }}>{e.category}</TableCell>
                                                    <TableCell align="right">{e.count}</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600 }}>{peso(e.total)}</TableCell>
                                                    <TableCell align="right" sx={{ color: 'text.secondary' }}>
                                                        {pct(e.total, summary.total_expenses)}%
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {expensesByCategory.length > 0 && (
                                                <TableRow sx={{ bgcolor: '#f7fafc' }}>
                                                    <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                        {expensesByCategory.reduce((s, e) => s + e.count, 0)}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700 }}>{peso(summary.total_expenses)}</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700 }}>100%</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>
                    )}

                    {/* ── DELIVERIES TAB ── */}
                    {tab === 4 && (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Delivery Summary</Typography>
                                <Stack spacing={1.5} sx={{ mb: 3 }}>
                                    {[
                                        { label: 'Total',     value: deliveryStats.total,     color: '#2563eb', bg: '#dbeafe' },
                                        { label: 'Delivered', value: deliveryStats.delivered,  color: '#16a34a', bg: '#dcfce7' },
                                        { label: 'Pending',   value: deliveryStats.pending,   color: '#d97706', bg: '#fef3c7' },
                                        { label: 'Failed',    value: deliveryStats.failed,    color: '#dc2626', bg: '#fee2e2' },
                                    ].map(s => (
                                        <Stack key={s.label} direction="row" alignItems="center" justifyContent="space-between"
                                            sx={{ py: 1.25, px: 1.5, bgcolor: s.bg, borderRadius: 1.5 }}>
                                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: s.color }}>{s.label}</Typography>
                                            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: s.color }}>{s.value}</Typography>
                                        </Stack>
                                    ))}
                                </Stack>

                                {deliveryStats.total > 0 && (
                                    <>
                                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Success Rate</Typography>
                                        <Box sx={{ height: 8, bgcolor: '#e2e8f0', borderRadius: 4, mb: 0.5 }}>
                                            <Box sx={{
                                                height: '100%',
                                                width: `${pct(deliveryStats.delivered, deliveryStats.total)}%`,
                                                bgcolor: '#16a34a', borderRadius: 4,
                                            }} />
                                        </Box>
                                        <Typography sx={{ fontSize: '0.78rem', color: 'text.disabled' }}>
                                            {pct(deliveryStats.delivered, deliveryStats.total)}% of deliveries completed
                                        </Typography>
                                    </>
                                )}
                            </Grid>

                            <Grid size={{ xs: 12, md: 8 }}>
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Deliveries by Zone</Typography>
                                {deliveryByZone.length === 0
                                    ? <Typography color="text.disabled">No delivery data.</Typography>
                                    : (
                                        <>
                                            {deliveryByZone.map(z => (
                                                <HBar key={z.zone} label={z.zone}
                                                    value={z.count} max={maxZone}
                                                    formatted={`${z.count} orders`}
                                                    sub={`Fee: ${peso(z.total_fee)}`} />
                                            ))}
                                            <Divider sx={{ my: 2 }} />
                                            <TableContainer>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Zone</TableCell>
                                                            <TableCell align="right">Deliveries</TableCell>
                                                            <TableCell align="right">Total Fees</TableCell>
                                                            <TableCell align="right">Avg Fee</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {deliveryByZone.map((z, i) => (
                                                            <TableRow key={i} hover>
                                                                <TableCell sx={{ fontWeight: 500 }}>{z.zone}</TableCell>
                                                                <TableCell align="right">{z.count}</TableCell>
                                                                <TableCell align="right" sx={{ fontWeight: 600 }}>{peso(z.total_fee)}</TableCell>
                                                                <TableCell align="right" sx={{ color: 'text.secondary' }}>
                                                                    {peso(z.count > 0 ? z.total_fee / z.count : 0)}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </>
                                    )}
                            </Grid>
                        </Grid>
                    )}

                </Box>
            </Paper>
        </AuthenticatedLayout>
    );
}
