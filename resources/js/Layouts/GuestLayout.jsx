import { Box, Paper, Typography } from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';

export default function GuestLayout({ children }) {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f7fafc',
                px: 2,
            }}
        >
            <Box sx={{ width: '100%', maxWidth: 400 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, gap: 1 }}>
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            bgcolor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <WaterDropIcon sx={{ color: 'white', fontSize: 18 }} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                        WRS
                    </Typography>
                </Box>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 3.5 },
                        borderRadius: 1.5,
                        border: '1px solid #e2e8f0',
                    }}
                >
                    {children}
                </Paper>
            </Box>
        </Box>
    );
}
