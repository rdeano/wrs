import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1565c0',
            light: '#1e88e5',
            dark: '#0d47a1',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#0097a7',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f0f4f8',
            paper: '#ffffff',
        },
        text: {
            primary: '#1a202c',
            secondary: '#4a5568',
            disabled: '#a0aec0',
        },
        divider: '#e2e8f0',
        action: {
            hover: '#f7fafc',
            selected: '#ebf4ff',
        },
        error:   { main: '#dc2626' },
        warning: { main: '#d97706' },
        success: { main: '#16a34a' },
        info:    { main: '#2563eb' },
    },
    typography: {
        fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
        fontSize: 14,
        h5: { fontWeight: 600, letterSpacing: '-0.02em' },
        h6: { fontWeight: 600, letterSpacing: '-0.01em' },
        subtitle1: { fontWeight: 500 },
        subtitle2: { fontWeight: 500 },
        body1: { fontSize: '0.9rem' },
        body2: { fontSize: '0.825rem' },
        caption: { fontSize: '0.75rem', color: '#71717a' },
        button: { textTransform: 'none', fontWeight: 500, letterSpacing: 0 },
    },
    shape: {
        borderRadius: 6,
    },
    shadows: [
        'none',
        '0 1px 2px rgba(0,0,0,0.05)',
        '0 1px 4px rgba(0,0,0,0.06)',
        '0 2px 8px rgba(0,0,0,0.07)',
        '0 4px 12px rgba(0,0,0,0.07)',
        '0 4px 16px rgba(0,0,0,0.08)',
        ...Array(19).fill('0 4px 24px rgba(0,0,0,0.08)'),
    ],
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    fontSize: '0.9rem',
                },
            },
        },
        MuiPaper: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    border: '1px solid #e2e8f0',
                },
                outlined: {
                    border: '1px solid #e2e8f0',
                },
            },
        },
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    fontWeight: 500,
                    borderRadius: 6,
                    fontSize: '0.85rem',
                    padding: '5px 14px',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none', background: '#0d47a1' },
                },
                outlined: {
                    borderColor: '#cbd5e0',
                    '&:hover': { borderColor: '#90cdf4', background: '#f7fafc' },
                },
                sizeSmall: {
                    fontSize: '0.8rem',
                    padding: '3px 10px',
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                },
            },
        },
        MuiTextField: {
            defaultProps: { size: 'small' },
        },
        MuiSelect: {
            defaultProps: { size: 'small' },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontSize: '0.875rem',
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e0',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#90cdf4',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1565c0',
                        borderWidth: 1.5,
                    },
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    fontSize: '0.875rem',
                    '&.Mui-focused': { color: '#1565c0' },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderColor: '#e2e8f0',
                    fontSize: '0.85rem',
                    padding: '10px 14px',
                },
                head: {
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#4a5568',
                    background: '#f7fafc',
                    padding: '8px 14px',
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:last-child td': { borderBottom: 0 },
                    '&.MuiTableRow-hover:hover': { background: '#f7fafc' },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                    borderRadius: 4,
                    fontSize: '0.75rem',
                    height: 22,
                },
                sizeSmall: {
                    height: 20,
                    fontSize: '0.7rem',
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: { borderColor: '#e2e8f0' },
            },
        },
        MuiAlert: {
            defaultProps: { variant: 'outlined' },
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontSize: '0.85rem',
                    padding: '6px 14px',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 8px 32px rgba(14,165,233,0.08)',
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    padding: '16px 20px 12px',
                },
            },
        },
        MuiDialogContent: {
            styleOverrides: {
                root: { padding: '12px 20px' },
            },
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    padding: '12px 20px',
                    borderTop: '1px solid #e2e8f0',
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    minHeight: 40,
                    padding: '6px 16px',
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                indicator: { height: 2 },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    fontSize: '0.75rem',
                    borderRadius: 4,
                    background: '#1a202c',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                },
            },
        },
        MuiAppBar: {
            defaultProps: { elevation: 0 },
        },
    },
});

const appName = import.meta.env.VITE_APP_NAME || 'WRS';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <App {...props} />
            </ThemeProvider>
        );
    },
    progress: {
        color: '#1565c0',
    },
});
