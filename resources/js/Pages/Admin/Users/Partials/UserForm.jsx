import {
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
} from '@mui/material';

const ROLE_LABELS = {
    admin:   'Admin',
    manager: 'Manager',
    cashier: 'Cashier',
};

export default function UserForm({ data, setData, errors, roles, isEdit = false }) {
    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    label="Full Name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={Boolean(errors.name)}
                    helperText={errors.name}
                    fullWidth
                    required
                    size="small"
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    label="Email Address"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={Boolean(errors.email)}
                    helperText={errors.email}
                    fullWidth
                    required
                    size="small"
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    label={isEdit ? 'New Password (leave blank to keep)' : 'Password'}
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={Boolean(errors.password)}
                    helperText={errors.password}
                    fullWidth
                    required={!isEdit}
                    size="small"
                    autoComplete="new-password"
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    label="Confirm Password"
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    error={Boolean(errors.password_confirmation)}
                    helperText={errors.password_confirmation}
                    fullWidth
                    required={!isEdit}
                    size="small"
                    autoComplete="new-password"
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small" error={Boolean(errors.role)} required>
                    <InputLabel>Role</InputLabel>
                    <Select
                        label="Role"
                        value={data.role}
                        onChange={(e) => setData('role', e.target.value)}
                    >
                        {roles.map((role) => (
                            <MenuItem key={role} value={role}>
                                {ROLE_LABELS[role] ?? role}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                        />
                    }
                    label="Active"
                />
            </Grid>
        </Grid>
    );
}
