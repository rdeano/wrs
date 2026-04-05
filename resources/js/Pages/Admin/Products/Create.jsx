import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import { usePage } from '@inertiajs/react';
import ProductForm from './Partials/ProductForm';

const EMPTY_FORM = {
    name:                 '',
    description:          '',
    type:                 'refill',
    size:                 '',
    unit:                 'piece',
    capital_cost:         '',
    selling_price:        '',
    stock_qty:            0,
    track_stock:          true,
    includes_free_refill: false,
    is_bundle:            false,
    is_active:            true,
    sort_order:           0,
    notes:                '',
    bundle_items:         [],
    pricing_rules:        [],
};

export default function Create({ availableProducts }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm(EMPTY_FORM);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.products.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>New Product</Typography>
                    <Button component={Link} href={route('admin.products.index')} variant="text" size="small">
                        ← Back to Products
                    </Button>
                </Stack>
            }
        >
            <Head title="New Product" />

            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
                {flash?.error && <Alert severity="error" sx={{ mb: 2 }}>{flash.error}</Alert>}

                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Box component="form" onSubmit={handleSubmit}>
                        <ProductForm
                            data={data}
                            setData={(key, value) => {
                                if (typeof key === 'string') setData(key, value);
                                else setData(key); // object form
                            }}
                            errors={errors}
                            availableProducts={availableProducts}
                            processing={processing}
                        />

                        <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button component={Link} href={route('admin.products.index')} variant="outlined" disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" disabled={processing}>
                                {processing ? 'Saving…' : 'Create Product'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </AuthenticatedLayout>
    );
}
