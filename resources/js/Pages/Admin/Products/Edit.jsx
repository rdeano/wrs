import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import {
    Alert, Box, Button, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, Paper, Stack, Typography,
} from '@mui/material';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import ProductForm from './Partials/ProductForm';

export default function Edit({ product, availableProducts }) {
    const { flash } = usePage().props;
    const [deleteOpen, setDeleteOpen] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        name:                 product.name,
        description:          product.description ?? '',
        type:                 product.type,
        size:                 product.size ?? '',
        unit:                 product.unit,
        capital_cost:         product.capital_cost,
        selling_price:        product.selling_price,
        stock_qty:            product.stock_qty,
        track_stock:          product.track_stock,
        includes_free_refill: product.includes_free_refill,
        is_bundle:            product.is_bundle,
        is_active:            product.is_active,
        sort_order:           product.sort_order,
        notes:                product.notes ?? '',
        bundle_items: (product.bundle_items ?? []).map((bi) => ({
            product_id:     bi.product_id,
            quantity:       bi.quantity,
            override_price: bi.override_price ?? '',
        })),
        pricing_rules: (product.pricing ?? []).map((pr) => ({
            label:         pr.label ?? '',
            customer_type: pr.customer_type ?? 'all',
            min_qty:       pr.min_qty,
            price:         pr.price,
            starts_at:     pr.starts_at ? pr.starts_at.substring(0, 10) : '',
            ends_at:       pr.ends_at   ? pr.ends_at.substring(0, 10)   : '',
            is_active:     pr.is_active,
        })),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.products.update', product.id));
    };

    const handleDelete = () => {
        router.delete(route('admin.products.destroy', product.id), {
            onSuccess: () => setDeleteOpen(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>Edit Product</Typography>
                    <Button component={Link} href={route('admin.products.index')} variant="text" size="small">
                        ← Back to Products
                    </Button>
                </Stack>
            }
        >
            <Head title={`Edit — ${product.name}`} />

            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
                {flash?.success && <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>}
                {flash?.error   && <Alert severity="error"   sx={{ mb: 2 }}>{flash.error}</Alert>}

                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Box component="form" onSubmit={handleSubmit}>
                        <ProductForm
                            data={data}
                            setData={(key, value) => {
                                if (typeof key === 'string') setData(key, value);
                                else setData(key);
                            }}
                            errors={errors}
                            availableProducts={availableProducts}
                            processing={processing}
                        />

                        <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => setDeleteOpen(true)}
                                disabled={processing}
                            >
                                Delete Product
                            </Button>
                            <Stack direction="row" spacing={1}>
                                <Button component={Link} href={route('admin.products.index')} variant="outlined" disabled={processing}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="contained" disabled={processing}>
                                    {processing ? 'Saving…' : 'Save Changes'}
                                </Button>
                            </Stack>
                        </Box>
                    </Box>
                </Paper>
            </Box>

            {/* Delete confirmation dialog */}
            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Delete Product?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        "{product.name}" will be soft-deleted and hidden from the POS. This can be reversed from the database.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
