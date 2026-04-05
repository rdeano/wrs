import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import UserForm from './Partials/UserForm';

export default function Edit({ user, roles }) {
    const { flash } = usePage().props;
    const { data, setData, put, processing, errors } = useForm({
        name:                  user.name,
        email:                 user.email,
        password:              '',
        password_confirmation: '',
        role:                  user.role ?? '',
        is_active:             user.is_active,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>Edit Staff Account</Typography>
                    <Button component={Link} href={route('admin.users.index')} variant="text" size="small">
                        ← Back to Staff
                    </Button>
                </Stack>
            }
        >
            <Head title="Edit Staff Account" />

            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                {flash?.error && <Alert severity="error" sx={{ mb: 2 }}>{flash.error}</Alert>}

                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Box component="form" onSubmit={handleSubmit}>
                        <UserForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            roles={roles}
                            isEdit
                        />

                        <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button component={Link} href={route('admin.users.index')} variant="outlined" disabled={processing}>
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
