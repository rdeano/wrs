import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import CustomerForm from './Partials/CustomerForm';

const EMPTY_FORM = {
    name:             '',
    phone:            '',
    email:            '',
    address:          '',
    type:             'regular',
    delivery_zone_id: null,
    credit_limit:     '',
    is_active:        true,
    notes:            '',
};

export default function Create({ deliveryZones }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm(EMPTY_FORM);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.customers.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>New Customer</Typography>
                    <Button component={Link} href={route('admin.customers.index')} variant="text" size="small">
                        ← Back to Customers
                    </Button>
                </Stack>
            }
        >
            <Head title="New Customer" />

            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                {flash?.error && <Alert severity="error" sx={{ mb: 2 }}>{flash.error}</Alert>}

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
                                {processing ? 'Saving…' : 'Create Customer'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </AuthenticatedLayout>
    );
}
