import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    TextField,
    Typography,
} from '@mui/material';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <Typography variant="h5" fontWeight={700} align="center" gutterBottom>
                Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                Sign in to your WRS account
            </Typography>

            {status && (
                <Alert severity="success" sx={{ mb: 2 }}>{status}</Alert>
            )}

            <Box component="form" onSubmit={submit} noValidate>
                <TextField
                    label="Email address"
                    type="email"
                    fullWidth
                    required
                    autoFocus
                    autoComplete="username"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    sx={{ mb: 2 }}
                />

                <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    required
                    autoComplete="current-password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password}
                    sx={{ mb: 1 }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                size="small"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                        }
                        label={<Typography variant="body2">Remember me</Typography>}
                    />
                    {canResetPassword && (
                        <Typography
                            component={Link}
                            href={route('password.request')}
                            variant="body2"
                            color="primary"
                            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                            Forgot password?
                        </Typography>
                    )}
                </Box>

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={processing}
                    sx={{ py: 1.25 }}
                >
                    Sign in
                </Button>
            </Box>
        </GuestLayout>
    );
}
