import { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    AppBar,
    Avatar,
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    Toolbar,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import MenuIcon             from '@mui/icons-material/Menu';
import DashboardIcon        from '@mui/icons-material/Dashboard';
import ShoppingCartIcon     from '@mui/icons-material/ShoppingCart';
import PeopleIcon           from '@mui/icons-material/People';
import InventoryIcon        from '@mui/icons-material/Inventory';
import LocalShippingIcon    from '@mui/icons-material/LocalShipping';
import ReceiptLongIcon      from '@mui/icons-material/ReceiptLong';
import CategoryIcon         from '@mui/icons-material/Category';
import SettingsIcon         from '@mui/icons-material/Settings';
import BarChartIcon         from '@mui/icons-material/BarChart';
import AccountCircleIcon    from '@mui/icons-material/AccountCircle';
import LogoutIcon           from '@mui/icons-material/Logout';
import WaterDropIcon        from '@mui/icons-material/WaterDrop';
import BadgeIcon            from '@mui/icons-material/Badge';

const DRAWER_EXPANDED  = 220;
const DRAWER_COLLAPSED = 64;

const NAV_ITEMS = [
    { label: 'Dashboard',    icon: <DashboardIcon fontSize="small" />,     routeName: 'dashboard',           href: '/dashboard' },
    { divider: true, label: 'Sales' },
    { label: 'Orders / POS', icon: <ShoppingCartIcon fontSize="small" />,  routeName: 'admin.orders.*',      href: '/admin/orders',    permission: 'order-list' },
    { label: 'Customers',    icon: <PeopleIcon fontSize="small" />,         routeName: 'admin.customers.*',   href: '/admin/customers', permission: 'customer-list' },
    { label: 'Deliveries',   icon: <LocalShippingIcon fontSize="small" />,  routeName: 'admin.deliveries.*',  href: '/admin/deliveries',permission: 'delivery-list' },
    { divider: true, label: 'Operations' },
    { label: 'Products',     icon: <CategoryIcon fontSize="small" />,       routeName: 'admin.products.*',    href: '/admin/products',  permission: 'product-list' },
    { label: 'Inventory',    icon: <InventoryIcon fontSize="small" />,      routeName: 'admin.inventory.*',   href: '/admin/inventory', permission: 'inventory-list' },
    { label: 'Expenses',     icon: <ReceiptLongIcon fontSize="small" />,    routeName: 'admin.expenses.*',    href: '/admin/expenses',  permission: 'expense-list' },
    { divider: true, label: 'System' },
    { label: 'Reports',      icon: <BarChartIcon fontSize="small" />,       routeName: 'admin.reports.*',     href: '/admin/reports',   permission: 'report-view' },
    { label: 'Staff',        icon: <BadgeIcon fontSize="small" />,          routeName: 'admin.users.*',       href: '/admin/users',     permission: 'user-list' },
    { label: 'Settings',     icon: <SettingsIcon fontSize="small" />,       routeName: 'admin.settings.*',    href: '/admin/settings',  permission: 'setting-manage' },
];

function SidebarContent({ collapsed, onToggle, onItemClick }) {
    const { url, props: { auth } } = usePage();
    const permissions = auth.permissions ?? [];

    const visibleItems = NAV_ITEMS.filter((item) => {
        if (item.divider) return true;
        if (!item.permission) return true;
        return permissions.includes(item.permission);
    });

    // Remove dividers that have no visible items after them
    const filteredItems = visibleItems.filter((item, idx) => {
        if (!item.divider) return true;
        const next = visibleItems[idx + 1];
        return next && !next.divider;
    });

    const isActive = (item) => {
        if (!item.routeName) return false;
        try {
            return route().current(item.routeName) || url.startsWith(item.href);
        } catch {
            return url.startsWith(item.href);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {/* Logo + burger toggle */}
            <Box sx={{
                px: collapsed ? 1 : 2,
                py: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between',
                borderBottom: '1px solid #e2e8f0',
                minHeight: 56,
                gap: 1,
            }}>
                {/* Logo */}
                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
                    <Box sx={{
                        width: 30, height: 30, borderRadius: 1.5,
                        bgcolor: 'primary.main', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <WaterDropIcon sx={{ color: 'white', fontSize: 16 }} />
                    </Box>
                    {!collapsed && (
                        <Box sx={{ overflow: 'hidden', minWidth: 0 }}>
                            <Typography variant="subtitle2" noWrap sx={{ lineHeight: 1.2, color: 'primary.main', fontWeight: 700 }}>
                                Water Refilling
                            </Typography>
                            <Typography variant="caption" noWrap color="text.secondary" sx={{ lineHeight: 1, fontSize: '0.68rem' }}>
                                Station System
                            </Typography>
                        </Box>
                    )}
                </Stack>

                {/* Burger toggle */}
                <Tooltip title={collapsed ? 'Expand' : 'Collapse'} placement="right">
                    <IconButton
                        onClick={onToggle}
                        size="small"
                        sx={{
                            flexShrink: 0,
                            color: 'text.secondary',
                            borderRadius: 1,
                            width: 30,
                            height: 30,
                            '&:hover': { bgcolor: 'action.hover', color: 'primary.main' },
                        }}
                    >
                        <MenuIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Nav items */}
            <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1.5, px: collapsed ? 1 : 1.5 }}>
                <List dense disablePadding>
                    {filteredItems.map((item, idx) => {
                        if (item.divider) {
                            return collapsed ? (
                                <Box key={`div-${idx}`} sx={{ my: 1 }}>
                                    <Divider sx={{ borderColor: '#e2e8f0' }} />
                                </Box>
                            ) : (
                                <Box key={`div-${idx}`} sx={{ px: 1, pt: 2, pb: 0.5 }}>
                                    <Typography sx={{
                                        textTransform: 'uppercase', letterSpacing: '0.07em',
                                        fontWeight: 500, color: 'text.disabled', fontSize: '0.68rem',
                                    }}>
                                        {item.label}
                                    </Typography>
                                </Box>
                            );
                        }

                        const active = isActive(item);
                        const btn = (
                            <ListItem key={item.href} disablePadding sx={{ mb: 0.25 }}>
                                <ListItemButton
                                    component={Link}
                                    href={item.href}
                                    onClick={onItemClick}
                                    selected={active}
                                    sx={{
                                        borderRadius: 1,
                                        py: 0.75,
                                        px: collapsed ? 1 : 1.25,
                                        minHeight: 36,
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        '&.Mui-selected': {
                                            bgcolor: 'primary.main',
                                            '& .MuiListItemIcon-root': { color: '#ffffff' },
                                            '&:hover': { bgcolor: 'primary.dark' },
                                        },
                                        '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                >
                                    <ListItemIcon sx={{
                                        minWidth: collapsed ? 0 : 30,
                                        color: active ? '#ffffff' : 'text.disabled',
                                        justifyContent: 'center',
                                    }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    {!collapsed && (
                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{
                                                fontSize: '0.83rem',
                                                fontWeight: active ? 600 : 400,
                                                color: active ? '#ffffff' : 'text.secondary',
                                                noWrap: true,
                                            }}
                                        />
                                    )}
                                </ListItemButton>
                            </ListItem>
                        );

                        return collapsed ? (
                            <Tooltip key={item.href} title={item.label} placement="right" arrow>
                                {btn}
                            </Tooltip>
                        ) : btn;
                    })}
                </List>
            </Box>

        </Box>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [mobileOpen,  setMobileOpen]  = useState(false);
    const [collapsed,   setCollapsed]   = useState(false);
    const [anchorEl,    setAnchorEl]    = useState(null);

    const drawerWidth = collapsed ? DRAWER_COLLAPSED : DRAWER_EXPANDED;

    const handleLogout = () => router.post(route('logout'));

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>

            {/* Desktop permanent sidebar */}
            {!isMobile && (
                <Box sx={{ position: 'relative', flexShrink: 0, width: drawerWidth, transition: 'width 0.2s ease' }}>
                    <Drawer
                        variant="permanent"
                        sx={{
                            width: drawerWidth,
                            flexShrink: 0,
                            transition: 'width 0.2s ease',
                            '& .MuiDrawer-paper': {
                                width: drawerWidth,
                                boxSizing: 'border-box',
                                borderRight: '1px solid #e2e8f0',
                                bgcolor: '#ffffff',
                                boxShadow: 'none',
                                overflow: 'hidden',
                                transition: 'width 0.2s ease',
                            },
                        }}
                    >
                        <SidebarContent
                            collapsed={collapsed}
                            onToggle={() => setCollapsed(c => !c)}
                        />
                    </Drawer>
                </Box>
            )}

            {/* Mobile temporary drawer */}
            {isMobile && (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: DRAWER_EXPANDED,
                            boxSizing: 'border-box',
                        },
                    }}
                >
                    <SidebarContent onItemClick={() => setMobileOpen(false)} collapsed={false} />
                </Drawer>
            )}

            {/* Main content */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

                {/* AppBar */}
                <AppBar position="sticky" elevation={0} sx={{
                    bgcolor: '#ffffff',
                    borderBottom: '1px solid #e2e8f0',
                    color: 'text.primary',
                }}>
                    <Toolbar sx={{ gap: 1.5, minHeight: { xs: 52, sm: 56 }, px: { xs: 2, sm: 2.5 } }}>
                        {isMobile && (
                            <IconButton edge="start" onClick={() => setMobileOpen(true)}
                                size="small" sx={{ color: 'text.secondary', mr: 0.5 }}>
                                <MenuIcon fontSize="small" />
                            </IconButton>
                        )}

                        <Box sx={{ flex: 1 }}>
                            {header && (
                                typeof header === 'string'
                                    ? <Typography variant="subtitle1" fontWeight={600}>{header}</Typography>
                                    : header
                            )}
                        </Box>

                        {/* User trigger */}
                        <Stack direction="row" alignItems="center" spacing={1}
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            sx={{
                                cursor: 'pointer', borderRadius: 1.5, px: 1, py: 0.5,
                                border: '1px solid transparent',
                                '&:hover': { bgcolor: '#f7fafc', borderColor: '#e2e8f0' },
                            }}
                        >
                            <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.7rem', fontWeight: 600 }}>
                                {initials}
                            </Avatar>
                            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                <Typography variant="body2" fontWeight={500} lineHeight={1.2}>{user.name}</Typography>
                                <Typography variant="caption" color="text.disabled" lineHeight={1} sx={{ fontSize: '0.7rem' }}>
                                    {user.roles?.[0]?.name ?? 'user'}
                                </Typography>
                            </Box>
                        </Stack>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => setAnchorEl(null)}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            PaperProps={{ elevation: 0, sx: {
                                mt: 0.75, minWidth: 200,
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                                borderRadius: 1.5,
                            }}}
                        >
                            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e2e8f0' }}>
                                <Typography variant="body2" fontWeight={500}>{user.name}</Typography>
                                <Typography variant="caption" color="text.disabled">{user.email}</Typography>
                            </Box>
                            <MenuItem component={Link} href={route('profile.edit')}
                                onClick={() => setAnchorEl(null)}
                                sx={{ gap: 1.5, py: 1, fontSize: '0.85rem' }}>
                                <AccountCircleIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                                Profile
                            </MenuItem>
                            <MenuItem onClick={() => { setAnchorEl(null); handleLogout(); }}
                                sx={{ gap: 1.5, py: 1, fontSize: '0.85rem', color: 'error.main' }}>
                                <LogoutIcon sx={{ fontSize: 16 }} />
                                Log Out
                            </MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>

                {/* Page content */}
                <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
