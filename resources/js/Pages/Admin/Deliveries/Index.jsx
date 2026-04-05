import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Alert, Box, Button, Chip, FormControl, InputLabel, MenuItem,
    Pagination, Paper, Select, Stack, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';

const STATUS_COLOR = {
    pending:    'default',
    assigned:   'info',
    in_transit: 'warning',
    delivered:  'success',
    failed:     'error',
};

export default function DeliveriesIndex({ deliveries, riders, zones, filters }) {
    const { flash } = usePage().props;
    const [status,   setStatus]   = useState(filters.status   ?? '');
    const [riderId,  setRiderId]  = useState(filters.rider_id ?? '');
    const [zoneId,   setZoneId]   = useState(filters.zone_id  ?? '');
    const [date,     setDate]     = useState(filters.date     ?? '');

    const applyFilters = useCallback(
        debounce((params) => {
            router.get(route('admin.deliveries.index'), params, { preserveState: true, replace: true });
        }, 300),
        [],
    );

    const handle = (key, value, setter) => {
        setter(value);
        applyFilters({
            status:   key === 'status'   ? value : status,
            rider_id: key === 'rider_id' ? value : riderId,
            zone_id:  key === 'zone_id'  ? value : zoneId,
            date:     key === 'date'     ? value : date,
        });
    };

    const handlePageChange = (_, page) => {
        router.get(route('admin.deliveries.index'), { ...filters, page }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>Deliveries</Typography>
                    <Stack direction="row" spacing={1}>
                        <Button component={Link} href={route('admin.delivery-zones.index')} variant="outlined" size="small">
                            Zones
                        </Button>
                        <Button component={Link} href={route('admin.delivery-slots.index')} variant="outlined" size="small">
                            Slots
                        </Button>
                        <Button
                            component={Link}
                            href={route('admin.deliveries.create')}
                            variant="contained"
                            startIcon={<AddIcon />}
                            size="small"
                        >
                            New Delivery
                        </Button>
                    </Stack>
                </Stack>
            }
        >
            <Head title="Deliveries" />

            <Box>
                {flash?.success && <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>}
                {flash?.error   && <Alert severity="error"   sx={{ mb: 2 }}>{flash.error}</Alert>}

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" sx={{ mb: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Status</InputLabel>
                        <Select label="Status" value={status} onChange={(e) => handle('status', e.target.value, setStatus)}>
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="assigned">Assigned</MenuItem>
                            <MenuItem value="in_transit">In Transit</MenuItem>
                            <MenuItem value="delivered">Delivered</MenuItem>
                            <MenuItem value="failed">Failed</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Rider</InputLabel>
                        <Select label="Rider" value={riderId} onChange={(e) => handle('rider_id', e.target.value, setRiderId)}>
                            <MenuItem value="">All riders</MenuItem>
                            {riders.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Zone</InputLabel>
                        <Select label="Zone" value={zoneId} onChange={(e) => handle('zone_id', e.target.value, setZoneId)}>
                            <MenuItem value="">All zones</MenuItem>
                            {zones.map(z => <MenuItem key={z.id} value={z.id}>{z.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField
                        type="date"
                        label="Scheduled Date"
                        value={date}
                        onChange={(e) => handle('date', e.target.value, setDate)}
                        size="small"
                        sx={{ minWidth: 170 }}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                </Stack>

                <Paper variant="outlined">
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                                    <TableCell>#</TableCell>
                                    <TableCell>Order</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Zone</TableCell>
                                    <TableCell>Slot</TableCell>
                                    <TableCell>Rider</TableCell>
                                    <TableCell>Scheduled</TableCell>
                                    <TableCell align="right">Fee</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {deliveries.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No deliveries found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {deliveries.data.map((d) => (
                                    <TableRow key={d.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                                                #{d.id}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                component={Link}
                                                href={route('admin.orders.show', d.order_id)}
                                                size="small"
                                                variant="text"
                                                sx={{ p: 0, minWidth: 0 }}
                                            >
                                                #{d.order_id}
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {d.order?.customer?.name ?? <Typography component="span" variant="body2" color="text.secondary">Walk-in</Typography>}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {d.zone?.name ?? '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {d.slot?.label ?? '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {d.rider?.name ?? <Typography component="span" variant="body2" color="text.secondary">Unassigned</Typography>}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {d.scheduled_at
                                                    ? new Date(d.scheduled_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
                                                    : '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2">₱{parseFloat(d.fee).toFixed(2)}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={d.status.replace('_', ' ')}
                                                size="small"
                                                color={STATUS_COLOR[d.status] ?? 'default'}
                                                sx={{ fontSize: 10, height: 20 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                component={Link}
                                                href={route('admin.deliveries.show', d.id)}
                                                size="small"
                                                startIcon={<LocalShippingIcon fontSize="small" />}
                                            >
                                                Manage
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {deliveries.last_page > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <Pagination
                                count={deliveries.last_page}
                                page={deliveries.current_page}
                                onChange={handlePageChange}
                                color="primary"
                                size="small"
                            />
                        </Box>
                    )}
                </Paper>
            </Box>
        </AuthenticatedLayout>
    );
}
