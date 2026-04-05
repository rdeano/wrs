import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import CustomerForm from './Partials/CustomerForm';

export default function Edit({ customer, deliveryZones }) {
    const { flash } = usePage().props;
    const { data, setData, put, processing, errors } = useForm({
        name:             customer.name,
        phone:            customer.phone ?? '',
        email:            customer.email ?? '',
        address:          customer.address ?? '',
        type:             customer.type,
        delivery_zone_id: customer.delivery_zone_id ?? null,
        credit_limit:     customer.credit_limit ?? '',
        is_active:        customer.is_active,
        notes:            customer.notes ?? '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.customers.update', customer.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>Edit Customer</Typography>
                    <Stack direction="row" spacing={1}>
                        <Button component={Link} href={route('admin.customers.show', customer.id)} variant="text" size="small">
                            View Ledger
                        </Button>
                        <Button component={Link} href={route('admin.customers.index')} variant="text" size="small">
                            ← Back
                        </Button>
                    </Stack>
                </Stack>
            }
        >
            <Head title={`Edit — ${customer.name}`} />

            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                {flash?.success && <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>}
                {flash?.error   && <Alert severity="error"   sx={{ mb: 2 }}>{flash.error}</Alert>}

                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Box component="form" onSubmit={handleSubmit}>
                        <CustomerForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            deliveryZones={deliveryZones}
                        />

                        <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button component={Link} href={route('admin.customers.index')} variant="outlined" disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" disabled={processing}>
                                {processing ? 'Saving…' : 'Save Changes'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </AuthenticatedLayout>
    );
}
