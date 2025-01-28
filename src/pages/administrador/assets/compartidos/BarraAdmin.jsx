import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Divider,
    Badge,
    Avatar,
    ListItemIcon,
    ListItemText,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaHome, FaUsers, FaCalendarAlt, FaChartLine, FaMoneyBillWave,
    FaClock, FaBell, FaCog, FaSignOutAlt, FaFileAlt, FaTooth, FaUserCircle
} from 'react-icons/fa';

import Notificaciones from '../../../../components/Layout/Notificaciones';

const BarraAdmin = () => {
    const [notificationMessage, setNotificationMessage] = useState('');
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openNotification, setOpenNotification] = useState(false);
    const [pendingNotifications, setPendingNotifications] = useState(3);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkTheme(matchDarkTheme.matches);

        const handleThemeChange = (e) => {
            setIsDarkTheme(e.matches);
        };

        matchDarkTheme.addEventListener('change', handleThemeChange);
        return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
    }, []);

    // Colores mejorados para mejor contraste
    const colors = {
        background: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
        primary: isDarkTheme ? '#4B9FFF' : '#03427c', // Color primario más claro para modo oscuro
        text: isDarkTheme ? '#E8F1FF' : '#333333', // Texto más claro para modo oscuro
        secondaryText: isDarkTheme ? '#B8C7D9' : '#666666',
        hover: isDarkTheme ? 'rgba(75,159,255,0.15)' : 'rgba(3,66,124,0.1)',
        menuBg: isDarkTheme ? '#243447' : '#FFFFFF',
        iconColor: isDarkTheme ? '#E8F1FF' : '#03427c',
    };

    // Configuración responsiva del menú
    const menuWidth = isMobile ? '100%' : '220px';

    const menuItems = [
        { icon: FaHome, text: 'Panel Principal', path: '/Administrador/principal', divider: false },
        { icon: FaUsers, text: 'Gestión de Pacientes', path: '/Administrador/pacientes', divider: false },
        { icon: FaCalendarAlt, text: 'Agenda', path: '/Administrador/agenda', divider: false },
        { icon: FaChartLine, text: 'Estadísticas', path: '/Administrador/estadisticas', divider: false },
        { icon: FaFileAlt, text: 'Reportes', path: '/Administrador/reportes', divider: false },
        { icon: FaMoneyBillWave, text: 'Finanzas', path: '/Administrador/finanzas', divider: false },
        { icon: FaClock, text: 'Historial', path: '/Administrador/historial', divider: true },
        { icon: FaBell, text: 'Notificaciones', path: '/Administrador/notificaciones', divider: false },
        { icon: FaCog, text: 'Configuración', path: '/Administrador/configuracion', divider: true },
        { icon: FaSignOutAlt, text: 'Cerrar Sesión', path: '/', divider: false },
    ];

    // Handlers permanecen iguales...
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        // ... código del logout ...
    };

    const handleItemClick = (item) => {
        if (item.text === 'Cerrar Sesión') {
            handleLogout();
        } else {
            handleMenuClose();
        }
    };

    return (
        <>
            <AppBar
                position="fixed"
                sx={{
                    backgroundColor: colors.background,
                    color: colors.text,
                    boxShadow: isDarkTheme ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                }}
            >
                <Toolbar
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: isMobile ? '0.5rem' : '0.5rem 1rem',
                    }}
                >
                    <Box
                        component={Link}
                        to="/Administrador/principal"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            textDecoration: 'none',
                            color: 'inherit',
                            gap: isMobile ? 1 : 2
                        }}
                    >
                        <FaTooth
                            style={{
                                fontSize: isMobile ? 24 : 32,
                                color: colors.primary,
                            }}
                        />
                        <Typography
                            variant={isMobile ? "subtitle1" : "h6"}
                            sx={{
                                fontWeight: 'bold',
                                letterSpacing: 0.5,
                                color: colors.text,
                                display: { xs: 'none', sm: 'block' },
                                fontSize: {
                                    xs: '0.9rem',
                                    sm: '1rem',
                                    md: '1.25rem'
                                }
                            }}
                        >
                            Odontología Carol - Admin
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 2 }}>
                        <IconButton
                            size={isMobile ? "medium" : "large"}
                            sx={{
                                color: colors.iconColor,
                                '&:hover': {
                                    color: colors.primary,
                                    backgroundColor: colors.hover
                                }
                            }}
                        >
                            <Badge
                                badgeContent={pendingNotifications}
                                color="error"
                                sx={{
                                    '& .MuiBadge-badge': {
                                        backgroundColor: isDarkTheme ? '#ff4444' : '#ff0000',
                                        color: '#ffffff'
                                    }
                                }}
                            >
                                <FaBell />
                            </Badge>
                        </IconButton>

                        <IconButton
                            edge="end"
                            onClick={handleMenuOpen}
                            sx={{
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    backgroundColor: colors.hover
                                },
                                transition: 'all 0.2s'
                            }}
                        >
                            <Avatar
                                sx={{
                                    bgcolor: colors.primary,
                                    width: isMobile ? 32 : 40,
                                    height: isMobile ? 32 : 40
                                }}
                            >
                                <FaUserCircle color={isDarkTheme ? '#1B2A3A' : '#ffffff'} />
                            </Avatar>
                        </IconButton>
                    </Box>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                            sx: {
                                backgroundColor: colors.menuBg,
                                color: colors.text,
                                width: menuWidth,
                                maxWidth: '100%',
                                borderRadius: 2,
                                mt: 1,
                                boxShadow: isDarkTheme ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.1)',
                                '& .MuiMenuItem-root': {
                                    minHeight: isMobile ? 48 : 42
                                }
                            }
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        {menuItems.map((item, index) => (
                            <React.Fragment key={index}>
                                <MenuItem
                                    component={item.path ? Link : 'button'}
                                    to={item.path}
                                    onClick={() => handleItemClick(item)}
                                    sx={{
                                        py: isMobile ? 2 : 1.5,
                                        px: isMobile ? 3 : 2,
                                        '&:hover': {
                                            backgroundColor: colors.hover,
                                            color: colors.primary
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            color: colors.iconColor,
                                            minWidth: isMobile ? 40 : 36
                                        }}
                                    >
                                        <item.icon size={isMobile ? 22 : 20} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontSize: isMobile ? '1rem' : '0.9rem',
                                            fontWeight: 500
                                        }}
                                    />
                                </MenuItem>
                                {item.divider && (
                                    <Divider
                                        sx={{
                                            my: 1,
                                            borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                                        }}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </Menu>
                </Toolbar>
            </AppBar>
            <Toolbar />

            <Notificaciones
                open={openNotification}
                message="Has cerrado sesión exitosamente"
                type="info"
                handleClose={() => setOpenNotification(false)}
            />
        </>
    );
}

export default BarraAdmin;