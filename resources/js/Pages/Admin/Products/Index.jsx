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
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Pagination,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';

const TYPE_COLORS = {
    refill:    'info',
    container: 'success',
    accessory: 'warning',
    bundle:    'secondary',
};

function StockCell({ product }) {
    if (!product.track_stock) {
        return <Typography variant="body2" color="text.secondary">—</Typography>;
    }
    const low = product.stock_qty <= 10;
    return (
        <Chip
            label={product.stock_qty}
            size="small"
            color={low ? 'error' : 'default'}
            variant={low ? 'filled' : 'outlined'}
        />
    );
}

export default function ProductsIndex({ products, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [type,   setType]   = useState(filters.type   ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [deleteTarget, setDeleteTarget] = useState(null);

    const applyFilters = useCallback(
        debounce((params) => {
            router.get(route('admin.products.index'), params, { preserveState: true, replace: true });
        }, 350),
        [],
    );

    const handleSearch = (value) => {
        setSearch(value);
        applyFilters({ search: value, type, status });
    };

    const handleType = (value) => {
        setType(value);
        applyFilters({ search, type: value, status });
    };

    const handleStatus = (value) => {
        setStatus(value);
        applyFilters({ search, type, status: value });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(route('admin.products.destroy', deleteTarget.id), {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const handlePageChange = (_, page) => {
        router.get(route('admin.products.index'), { ...filters, page }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>Products</Typography>
                    <Button
                        component={Link}
                        href={route('admin.products.create')}
                        variant="contained"
                        startIcon={<AddIcon />}
                        size="small"
                    >
                        New Product
                    </Button>
                </Stack>
            }
        >
            <Head title="Products" />

            <Box>
                {flash?.success && <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>}
                {flash?.error   && <Alert severity="error"   sx={{ mb: 2 }}>{flash.error}</Alert>}

                {/* Filters */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
                    <TextField
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search products…"
                        size="small"
                        sx={{ minWidth: 220 }}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
                    />
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Type</InputLabel>
                        <Select label="Type" value={type} onChange={(e) => handleType(e.target.value)}>
                            <MenuItem value="">All types</MenuItem>
                            <MenuItem value="refill">Refill</MenuItem>
                            <MenuItem value="container">Container</MenuItem>
                            <MenuItem value="accessory">Accessory</MenuItem>
                            <MenuItem value="bundle">Bundle</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Status</InputLabel>
                        <Select label="Status" value={status} onChange={(e) => handleStatus(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                <Paper variant="outlined">
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Size / Unit</TableCell>
                                    <TableCell align="right">Capital</TableCell>
                                    <TableCell align="right">Price</TableCell>
                                    <TableCell align="right">Margin</TableCell>
                                    <TableCell align="center">Stock</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No products found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {products.data.map((product) => {
                                    const profit = parseFloat(product.selling_price) - parseFloat(product.capital_cost);
                                    const margin = parseFloat(product.selling_price) > 0
                                        ? ((profit / parseFloat(product.selling_price)) * 100).toFixed(0)
                                        : 0;

                                    return (
                                        <TableRow key={product.id} hover>
                                            <TableCell>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Chip
                                                        label={product.type}
                                                        size="small"
                                                        color={TYPE_COLORS[product.type] ?? 'default'}
                                                        variant="outlined"
                                                        sx={{ fontSize: 10, height: 20 }}
                                                    />
                                                    <Typography variant="body2">{product.name}</Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {[product.size, product.unit].filter(Boolean).join(' · ')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2">₱{parseFloat(product.capital_cost).toFixed(2)}</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" fontWeight={500}>₱{parseFloat(product.selling_price).toFixed(2)}</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" color={profit >= 0 ? 'success.dark' : 'error.main'}>
                                                    {margin}%
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <StockCell product={product} />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={product.is_active ? 'Active' : 'Inactive'}
                                                    size="small"
                                                    color={product.is_active ? 'success' : 'default'}
                                                    variant={product.is_active ? 'filled' : 'outlined'}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                    <Tooltip title="Edit">
                                                        <Button
                                                            component={Link}
                                                            href={route('admin.products.edit', product.id)}
                                                            size="small"
                                                            startIcon={<EditIcon fontSize="small" />}
                                                        >
                                                            Edit
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            startIcon={<DeleteOutlineIcon fontSize="small" />}
                                                            onClick={() => setDeleteTarget(product)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {products.last_page > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <Pagination
                                count={products.last_page}
                                page={products.current_page}
                                onChange={handlePageChange}
                                color="primary"
                                size="small"
                            />
                        </Box>
                    )}
                </Paper>
            </Box>

            {/* Delete confirmation */}
            <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Delete Product?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        "{deleteTarget?.name}" will be soft-deleted and hidden from the POS.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
