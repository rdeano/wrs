import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Box, Button, Divider, Grid, Paper,
    Stack, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography,
} from '@mui/material';
import ArrowUpwardIcon      from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon    from '@mui/icons-material/ArrowDownward';
import TrendingUpIcon       from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon     from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon    from '@mui/icons-material/LocalShipping';
import PeopleIcon           from '@mui/icons-material/People';
import ReceiptLongIcon      from '@mui/icons-material/ReceiptLong';
import WarningAmberIcon     from '@mui/icons-material/WarningAmber';
import AddIcon              from '@mui/icons-material/Add';
import ErrorOutlineIcon     from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

/* ─── helpers ─────────────────────────────────────────────────── */
const peso = (v) =>
    '₱' + parseFloat(v ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });

const pct = (a, b) => {
    if (!b) return null;
    const d = ((a - b) / b) * 100;
    return { value: Math.abs(d).toFixed(1), up: d >= 0 };
};

const STATUS_LABEL = {
    pending:   { label: 'Pending',   color: '#92400e', bg: '#fef3c7' },
    confirmed: { label: 'Confirmed', color: '#1e40af', bg: '#dbeafe' },
    completed: { label: 'Completed', color: '#166534', bg: '#dcfce7' },
    voided:    { label: 'Voided',    color: '#991b1b', bg: '#fee2e2' },
    delivered: { label: 'Delivered', color: '#166534', bg: '#dcfce7' },
};
const PAY_LABEL = {
    paid:    { label: 'Paid',    color: '#166534', bg: '#dcfce7' },
    partial: { label: 'Partial', color: '#92400e', bg: '#fef3c7' },
    unpaid:  { label: 'Unpaid',  color: '#991b1b', bg: '#fee2e2' },
    credit:  { label: 'Credit',  color: '#5b21b6', bg: '#ede9fe' },
};

function Badge({ map, value }) {
    const c = map[value] ?? { label: value, color: '#3f3f46', bg: '#f4f4f5' };
    return (
        <Box component="span" sx={{
            display: 'inline-block', px: '7px', py: '2px',
            borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
            color: c.color, bgcolor: c.bg, whiteSpace: 'nowrap', lineHeight: '18px',
        }}>
            {c.label}
        </Box>
    );
}

/* ─── KPI card — fixed height, accent left border ──────────────── */
function KpiCard({ label, value, sub, trend, icon, accent = '#e2e8f0', href }) {
    const Tag = href ? Link : 'div';
    return (
        <Paper
            component={Tag}
            href={href}
            sx={{
                height: 120,
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: 'inherit',
                borderLeft: `3px solid ${accent}`,
                position: 'relative',
                overflow: 'hidden',
                ...(href && {
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                    '&:hover': { bgcolor: '#f7fafc' },
                }),
            }}
        >
            {/* ghost icon */}
            <Box sx={{
                position: 'absolute', right: 14, top: 14,
                color: accent, opacity: 0.12, lineHeight: 0,
            }}>
                {icon}
            </Box>

            {/* label */}
            <Typography sx={{
                fontSize: '0.68rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.07em',
                color: 'text.disabled',
            }}>
                {label}
            </Typography>

            {/* value */}
            <Typography sx={{
                fontSize: '1.45rem', fontWeight: 700,
                letterSpacing: '-0.03em', lineHeight: 1,
                color: 'text.primary',
            }}>
                {value}
            </Typography>

            {/* sub + trend */}
            <Stack direction="row" alignItems="center" spacing={0.75}>
                {trend && (
                    <Stack direction="row" alignItems="center" spacing={0.25}
                        sx={{ color: trend.up ? '#16a34a' : '#dc2626' }}>
                        {trend.up
                            ? <ArrowUpwardIcon sx={{ fontSize: 11 }} />
                            : <ArrowDownwardIcon sx={{ fontSize: 11 }} />}
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'inherit' }}>
                            {trend.value}%
                        </Typography>
                    </Stack>
                )}
                <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>{sub}</Typography>
            </Stack>
        </Paper>
    );
}

/* ─── Stat pill — small secondary metric ───────────────────────── */
function StatPill({ label, value, icon, color = '#3f3f46', bg = '#f4f4f5', href }) {
    const Tag = href ? Link : 'div';
    return (
        <Paper
            component={Tag}
            href={href}
            sx={{
                p: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 1.5,
                textDecoration: 'none', color: 'inherit',
                ...(href && {
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f7fafc' },
                    transition: 'background 0.15s',
                }),
            }}
        >
            <Box sx={{
                width: 34, height: 34, borderRadius: 1.5,
                bgcolor: bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
            }}>
                {React.cloneElement(icon, { sx: { fontSize: 17, color } })}
            </Box>
            <Box>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'text.disabled' }}>
                    {label}
                </Typography>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
                    {value}
                </Typography>
            </Box>
        </Paper>
    );
}

/* ─── Mini bar chart ─────────────────────────────────────────────── */
function BarChart({ data }) {
    const max = Math.max(...data.map(d => d.total), 1);
    const today = new Date().toISOString().slice(0, 10);
    return (
        <Stack direction="row" alignItems="flex-end" spacing={1} sx={{ height: 110 }}>
            {data.map((d) => {
                const isToday = d.date === today;
                const pct = d.total / max;
                return (
                    <Stack key={d.date} alignItems="center" sx={{ flex: 1, height: '100%' }} spacing={0.5}>
                        <Stack sx={{ flex: 1, width: '100%', justifyContent: 'flex-end' }}>
                            {d.total > 0 && (
                                <Typography sx={{
                                    fontSize: '0.6rem', color: isToday ? 'text.secondary' : 'text.disabled',
                                    textAlign: 'center', mb: 0.5, whiteSpace: 'nowrap',
                                    fontWeight: isToday ? 600 : 400,
                                }}>
                                    {peso(d.total)}
                                </Typography>
                            )}
                            <Box sx={{
                                width: '100%',
                                height: Math.max(pct * 72, d.total > 0 ? 4 : 2),
                                bgcolor: isToday ? '#1565c0' : '#bee3f8',
                                borderRadius: '3px 3px 0 0',
                            }} />
                        </Stack>
                        <Typography sx={{
                            fontSize: '0.65rem',
                            color: isToday ? 'text.primary' : 'text.disabled',
                            fontWeight: isToday ? 600 : 400,
                        }}>
                            {d.label}
                        </Typography>
                    </Stack>
                );
            })}
        </Stack>
    );
}

/* ─── Page ───────────────────────────────────────────────────────── */
import React from 'react';

export default function Dashboard({ stats, lowStockAlerts, recentOrders, salesChart }) {
    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const dateStr = now.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    const todayTrend  = pct(stats.today_sales, stats.yesterday_sales);
    const alertCount  = lowStockAlerts.length + stats.out_of_stock;
    const week7total  = salesChart.reduce((s, d) => s + d.total, 0);
    const week7orders = salesChart.reduce((s, d) => s + d.orders, 0);

    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />

            {/* ── Greeting ── */}
            <Stack direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}
                sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={600}>{greeting}</Typography>
                    <Typography variant="body2" color="text.secondary">{dateStr}</Typography>
                </Box>
                <Button component={Link} href={route('admin.orders.create')}
                    variant="contained" startIcon={<AddIcon />}
                    sx={{ mt: { xs: 1.5, sm: 0 }, flexShrink: 0 }}>
                    New Order
                </Button>
            </Stack>

            {/* ── KPI cards — all same height ── */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KpiCard
                        label="Today's Sales"
                        value={peso(stats.today_sales)}
                        sub={`${stats.today_orders} orders today`}
                        trend={todayTrend}
                        icon={<ShoppingCartIcon sx={{ fontSize: 48 }} />}
                        accent="#2563eb"
                        href={route('admin.orders.index')}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KpiCard
                        label="Month Sales"
                        value={peso(stats.month_sales)}
                        sub={`${stats.month_orders} orders this month`}
                        icon={<TrendingUpIcon sx={{ fontSize: 48 }} />}
                        accent="#7c3aed"
                        href={route('admin.orders.index')}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KpiCard
                        label="Net Profit (Month)"
                        value={peso(stats.net_profit)}
                        sub={stats.net_profit >= 0 ? `Expenses: ${peso(stats.month_expenses)}` : 'Operating at loss'}
                        icon={<ReceiptLongIcon sx={{ fontSize: 48 }} />}
                        accent={stats.net_profit >= 0 ? '#16a34a' : '#dc2626'}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KpiCard
                        label="Outstanding Credit"
                        value={peso(stats.total_outstanding)}
                        sub={`${stats.customers_w_balance} customers with balance`}
                        icon={<PeopleIcon sx={{ fontSize: 48 }} />}
                        accent={stats.total_outstanding > 0 ? '#d97706' : '#16a34a'}
                        href={route('admin.customers.index')}
                    />
                </Grid>
            </Grid>

            {/* ── Secondary stat pills ── */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatPill
                        label="Pending Deliveries"
                        value={stats.pending_deliveries > 0 ? `${stats.pending_deliveries} pending` : 'All clear'}
                        icon={<LocalShippingIcon />}
                        color={stats.pending_deliveries > 0 ? '#d97706' : '#16a34a'}
                        bg={stats.pending_deliveries > 0 ? '#fef3c7' : '#dcfce7'}
                        href={route('admin.deliveries.index')}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatPill
                        label="Stock Alerts"
                        value={alertCount > 0 ? `${alertCount} item${alertCount !== 1 ? 's' : ''} need attention` : 'All levels OK'}
                        icon={<WarningAmberIcon />}
                        color={alertCount > 0 ? '#dc2626' : '#16a34a'}
                        bg={alertCount > 0 ? '#fee2e2' : '#dcfce7'}
                        href={route('admin.inventory.index')}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatPill
                        label="Total Customers"
                        value={`${stats.total_customers} registered`}
                        icon={<PeopleIcon />}
                        color="#2563eb"
                        bg="#dbeafe"
                        href={route('admin.customers.index')}
                    />
                </Grid>
            </Grid>

            {/* ── Chart + Alerts ── */}
            <Grid container spacing={2} sx={{ mb: 2 }}>

                {/* Sales chart */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper sx={{ p: 2.5 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2.5 }}>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600}>Sales — Last 7 Days</Typography>
                                <Typography variant="caption" color="text.disabled">
                                    {peso(week7total)} total &nbsp;·&nbsp; {week7orders} orders
                                </Typography>
                            </Box>
                            <Button component={Link} href={route('admin.orders.index')}
                                size="small" variant="text" sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>
                                View all →
                            </Button>
                        </Stack>

                        <BarChart data={salesChart} />

                        <Divider sx={{ my: 2 }} />

                        {/* last 3 days summary */}
                        <Grid container>
                            {salesChart.slice(-3).map((d, i) => (
                                <Grid size={{ xs: 4 }} key={d.date}
                                    sx={{ borderRight: i < 2 ? '1px solid #e2e8f0' : 'none', pr: 2, pl: i > 0 ? 2 : 0 }}>
                                    <Typography sx={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.disabled', fontWeight: 600 }}>
                                        {d.label}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, mt: 0.25, letterSpacing: '-0.01em' }}>
                                        {peso(d.total)}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>
                                        {d.orders} order{d.orders !== 1 ? 's' : ''}
                                    </Typography>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Inventory alerts */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="subtitle2" fontWeight={600}>Inventory Alerts</Typography>
                                {alertCount > 0 && (
                                    <Box sx={{ px: 1, py: '2px', bgcolor: '#fee2e2', borderRadius: 1, fontSize: '0.7rem', fontWeight: 700, color: '#991b1b' }}>
                                        {alertCount}
                                    </Box>
                                )}
                            </Stack>
                            <Button component={Link} href={route('admin.inventory.index')}
                                size="small" variant="text" sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>
                                Inventory →
                            </Button>
                        </Stack>

                        <Box sx={{ flex: 1 }}>
                            {alertCount === 0 ? (
                                <Stack direction="row" alignItems="center" spacing={1.5}
                                    sx={{ py: 2, px: 1.5, bgcolor: '#f0fdf4', borderRadius: 1.5 }}>
                                    <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                                    <Typography sx={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 500 }}>
                                        All stock levels are OK
                                    </Typography>
                                </Stack>
                            ) : (
                                <Stack spacing={1}>
                                    {stats.out_of_stock > 0 && (
                                        <Stack direction="row" alignItems="center" justifyContent="space-between"
                                            sx={{ py: 1.25, px: 1.5, bgcolor: '#fef2f2', borderRadius: 1.5, border: '1px solid #fecaca' }}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <ErrorOutlineIcon sx={{ fontSize: 15, color: '#dc2626' }} />
                                                <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: '#dc2626' }}>
                                                    Out of stock
                                                </Typography>
                                            </Stack>
                                            <Typography sx={{ fontSize: '0.83rem', fontWeight: 700, color: '#dc2626' }}>
                                                {stats.out_of_stock} product{stats.out_of_stock !== 1 ? 's' : ''}
                                            </Typography>
                                        </Stack>
                                    )}
                                    {lowStockAlerts.slice(0, 5).map(a => (
                                        <Stack key={a.product_id} direction="row" alignItems="center" justifyContent="space-between"
                                            sx={{ py: 1.25, px: 1.5, bgcolor: '#fffbeb', borderRadius: 1.5, border: '1px solid #fde68a' }}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <WarningAmberIcon sx={{ fontSize: 15, color: '#d97706' }} />
                                                <Box>
                                                    <Typography sx={{ fontSize: '0.83rem', fontWeight: 600 }}>{a.product_name}</Typography>
                                                    <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>min qty: {a.min_qty}</Typography>
                                                </Box>
                                            </Stack>
                                            <Typography sx={{ fontSize: '0.83rem', fontWeight: 700, color: '#d97706' }}>
                                                {a.stock_qty} {a.unit} left
                                            </Typography>
                                        </Stack>
                                    ))}
                                    {lowStockAlerts.length > 5 && (
                                        <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled', px: 0.5 }}>
                                            +{lowStockAlerts.length - 5} more…
                                        </Typography>
                                    )}
                                </Stack>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* ── Recent Orders ── */}
            <Paper>
                <Stack direction="row" justifyContent="space-between" alignItems="center"
                    sx={{ px: 2.5, py: 1.75, borderBottom: '1px solid #e2e8f0' }}>
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                        <Typography variant="subtitle2" fontWeight={600}>Recent Orders</Typography>
                        <Box sx={{ px: '7px', py: '2px', bgcolor: '#f7fafc', borderRadius: 1, fontSize: '0.7rem', fontWeight: 600, color: 'text.secondary' }}>
                            {recentOrders.length}
                        </Box>
                    </Stack>
                    <Button component={Link} href={route('admin.orders.index')}
                        size="small" variant="text" sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>
                        View all →
                    </Button>
                </Stack>

                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell width={60}>#</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell width={80}>Items</TableCell>
                                <TableCell width={110} align="right">Total</TableCell>
                                <TableCell width={100}>Status</TableCell>
                                <TableCell width={90}>Payment</TableCell>
                                <TableCell width={80}>Time</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {recentOrders.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.disabled' }}>
                                        No orders yet.
                                    </TableCell>
                                </TableRow>
                            )}
                            {recentOrders.map((o) => (
                                <TableRow key={o.id} hover
                                    component={Link} href={route('admin.orders.show', o.id)}
                                    sx={{ cursor: 'pointer', textDecoration: 'none' }}>
                                    <TableCell sx={{ color: 'text.disabled', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                        #{o.id}
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontSize: '0.83rem', fontWeight: 500 }}>{o.customer}</Typography>
                                        <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled', textTransform: 'capitalize' }}>{o.type}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontSize: '0.83rem', color: 'text.secondary' }}>
                                            {o.items_count} item{o.items_count !== 1 ? 's' : ''}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography sx={{ fontSize: '0.83rem', fontWeight: 700 }}>{peso(o.total)}</Typography>
                                    </TableCell>
                                    <TableCell><Badge map={STATUS_LABEL} value={o.status} /></TableCell>
                                    <TableCell><Badge map={PAY_LABEL} value={o.payment_status} /></TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
                                            {new Date(o.created_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </AuthenticatedLayout>
    );
}
