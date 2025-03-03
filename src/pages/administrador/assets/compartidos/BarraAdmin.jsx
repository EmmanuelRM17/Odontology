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
    FaHome, FaUsers, FaCalendarAlt, FaChartLine, FaMoneyBillWave, FaCalendarCheck,
    FaClock, FaBell, FaCog, FaSignOutAlt, FaFileAlt, FaTooth, FaUserCircle
} from 'react-icons/fa';
import Notificaciones from '../../../../components/Layout/Notificaciones';
import { useAuth } from '../../../../components/Tools/AuthContext';
import { useThemeContext } from '../../../../components/Tools/ThemeContext';

const BarraAdmin = () => {
    const [notificationMessage, setNotificationMessage] = useState('');
    const { isDarkTheme } = useThemeContext();
    const [anchorEl, setAnchorEl] = useState(null);
    const [openNotification, setOpenNotification] = useState(false);
    const [pendingNotifications, setPendingNotifications] = useState(3);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { setUser } = useAuth();

    const colors = {
        background: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
        primary: isDarkTheme ? '#4B9FFF' : '#03427c', // Color primario más claro para modo oscuro
        text: isDarkTheme ? '#E8F1FF' : '#333333', // Texto más claro para modo oscuro
        secondaryText: isDarkTheme ? '#B8C7D9' : '#666666',
        hover: isDarkTheme ? 'rgba(75,159,255,0.15)' : 'rgba(3,66,124,0.1)',
        menuBg: isDarkTheme ? '#243447' : '#FFFFFF',
        iconColor: isDarkTheme ? '#E8F1FF' : '#03427c',
    };

    const menuWidth = isMobile ? '100%' : '200px';

    const menuItems = [
        { icon: FaHome, text: 'Panel Principal', path: '/Administrador/principal', divider: false },
        { icon: FaUsers, text: 'Gestión de Pacientes', path: '/Administrador/pacientes', divider: false },
        { icon: FaTooth, text: 'Gestión de Servicios', path: '/Administrador/servicios', divider: false },
        { icon: FaCalendarCheck, text: 'Gestión de Citas', path: '/Administrador/citas', divider: false },
        { icon: FaCalendarAlt, text: 'Agenda', path: '/Administrador/agenda', divider: false },
        { icon: FaChartLine, text: 'Estadísticas', path: '/Administrador/estadisticas', divider: false },
        { icon: FaFileAlt, text: 'Reportes', path: '/Administrador/reportes', divider: false },
        { icon: FaMoneyBillWave, text: 'Finanzas', path: '/Administrador/finanzas', divider: false },
        { icon: FaClock, text: 'Historial', path: '/Administrador/historial', divider: true },
        { icon: FaBell, text: 'Notificaciones', path: '/Administrador/notificaciones', divider: false },
        { icon: FaCog, text: 'Configuración', path: '/Administrador/configuracion', divider: true },
        { icon: FaSignOutAlt, text: 'Cerrar Sesión', path: null, divider: false }
    ];

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await fetch('https://back-end-4803.onrender.com/api/users/check-auth', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error("Usuario no autenticado");
                }

                const data = await response.json();
                if (data.authenticated && data.user) {
                    setUser(data.user); // ✅ Guarda el usuario en el contexto de `useAuth()`
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Error al verificar autenticación:", error);
                setUser(null);
            }
        };

        checkAuthStatus();
    }, []);

    const handleItemClick = (item) => {
        handleMenuClose();
        if (item.text === 'Cerrar Sesión') {
            handleLogout();
        } else if (item.path) {
            navigate(item.path);
        }
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        handleMenuClose();

        try {
            // Primera notificación
            setNotificationMessage('Cerrando sesión... Redirigiendo...');
            setOpenNotification(true);

            // Primera espera
            await new Promise(resolve => setTimeout(resolve, 2000));

            const response = await fetch('https://back-end-4803.onrender.com/api/users/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Error en logout: ${response.status}`);
            }

            // Segunda notificación
            setNotificationMessage('Sesión cerrada exitosamente');

            // Segunda espera antes de redirigir
            await new Promise(resolve => setTimeout(resolve, 1500));

            setUser(null);
            setOpenNotification(false);
            navigate('/', { replace: true });

        } catch (error) {
            console.error('❌ Error en logout:', error.message);
            setNotificationMessage('Error al cerrar sesión. Intente nuevamente.');
            setOpenNotification(true);
            await new Promise(resolve => setTimeout(resolve, 2000));
            setOpenNotification(false);
        } finally {
            setIsLoggingOut(false);
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
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>

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
                        <FaTooth style={{ fontSize: isMobile ? 24 : 32, color: colors.primary }} />

                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 'bold',
                                letterSpacing: 1,
                                color: colors.text,
                                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.2rem' }
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
                            <Avatar sx={{ bgcolor: colors.primary, width: 32, height: 32 }}>

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
                message={notificationMessage}  // Usar el mensaje dinámico en lugar del estático
                type="info"
                handleClose={() => setOpenNotification(false)}
            />
        </>
    );
}

export default BarraAdmin;