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
    useTheme, useMediaQuery
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaUserCircle,
    FaCalendarAlt,
    FaSignOutAlt,
    FaHome,
    FaCog,
    FaBell,
    FaTooth,
    FaFileAlt,
    FaPills,
    FaWallet,
    FaChartLine,
    FaComments,
    FaQuestionCircle,
    FaFileMedical
} from 'react-icons/fa';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useAuth } from '../../../components/Tools/AuthContext';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const BarraPaciente = () => {
    const [notificationMessage, setNotificationMessage] = useState('');
    const { isDarkTheme } = useThemeContext();
    const [anchorEl, setAnchorEl] = useState(null);
    const [openNotification, setOpenNotification] = useState(false);
    const [notificationCount, setNotificationCount] = useState(2);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const menuWidth = isMobile ? '100%' : '220px';

    useEffect(() => {
        const updateNotifications = () => {
            setNotificationCount(prevCount => Math.max(0, prevCount));
        };
        updateNotifications();
    }, []);

    const menuItems = [
        { icon: FaHome, text: 'Inicio', path: '/Paciente/principal', divider: false },
        { icon: FaUserCircle, text: 'Mi Perfil', path: '/Paciente/perfil', divider: false },
        { icon: FaCalendarAlt, text: 'Mis Citas', path: '/Paciente/citas', divider: false },
        { icon: FaFileMedical, text: 'Historial Clínico', path: '/Paciente/historial', divider: false },
        { icon: FaPills, text: 'Tratamientos', path: '/Paciente/tratamientos', divider: false },
        { icon: FaFileAlt, text: 'Recetas', path: '/Paciente/recetas', divider: false },
        { icon: FaWallet, text: 'Pagos', path: '/Paciente/pagos', divider: false },
        { icon: FaChartLine, text: 'Progreso', path: '/Paciente/progreso', divider: true },
        { icon: FaComments, text: 'Mensajes', path: '/Paciente/mensajes', divider: false },
        { icon: FaBell, text: 'Notificaciones', path: '/Paciente/notificaciones', divider: false },
        { icon: FaQuestionCircle, text: 'Ayuda', path: '/Paciente/ayuda', divider: true },
        { icon: FaCog, text: 'Configuración', path: '/Paciente/configuracion', divider: true },
        { icon: FaSignOutAlt, text: 'Cerrar Sesión', path: null, divider: false }
    ];

    useEffect(() => {
        if (notificationMessage && notificationMessage !== 'Cerrando sesión...') {
            setOpenNotification(true);
            const timer = setTimeout(() => {
                setNotificationMessage('');
                setOpenNotification(false);
            }, 2000);
    
            return () => clearTimeout(timer);
        }
    }, [notificationMessage]);

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

    // Agregar esta función que falta
    const handleItemClick = (item) => {
        if (item.text === 'Cerrar Sesión') {
            handleLogout();
        } else {
            handleMenuClose();
            if (item.path) {
                navigate(item.path);
            }
        }
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        handleMenuClose();
    
        try {
            console.log('🔄 Cerrando sesión...');
            setNotificationMessage('Cerrando sesión... Redirigiendo...');
            setOpenNotification(true);
    
            // 🕒 Mantiene el mensaje visible durante al menos 3 segundos antes de continuar
            await new Promise(resolve => setTimeout(resolve, 3000));
    
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
    
            console.log('✅ Sesión cerrada exitosamente');
            setNotificationMessage('Sesión cerrada exitosamente');
    
            setTimeout(() => {
                setUser(null);
                navigate('/', { replace: true });
                setTimeout(() => setOpenNotification(false), 1000);
            }, 1000);
    
        } catch (error) {
            console.error('❌ Error en logout:', error.message);
            setNotificationMessage('Error al cerrar sesión. Intente nuevamente.');
        } finally {
            setIsLoggingOut(false);
        }
    };
    
    return (
        <>
            <AppBar
                position="fixed"
                sx={{
                    backgroundColor: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
                    color: isDarkTheme ? '#fff' : '#03427c',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
            >
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FaTooth style={{
                            fontSize: isMobile ? 24 : 32,
                            color: '#03427c',
                            filter: isDarkTheme ? 'brightness(1.5)' : 'none'
                        }} />
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 'bold',
                                letterSpacing: 1,
                                color: isDarkTheme ? '#fff' : '#03427c',
                                display: { xs: 'none', sm: 'block' }
                            }}
                        >
                            Odontología Carol
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                            size="large"
                            color="inherit"
                            sx={{ '&:hover': { color: '#0066cc' } }}
                        >
                            <Badge badgeContent={notificationCount} color="error">
                                <FaBell />
                            </Badge>
                        </IconButton>

                        <IconButton
                            edge="end"
                            onClick={handleMenuOpen}
                            sx={{
                                '&:hover': { transform: 'scale(1.05)' },
                                transition: 'transform 0.2s'
                            }}
                        >
                            <Avatar
                                sx={{
                                    bgcolor: '#03427c',
                                    width: 40,
                                    height: 40,
                                }}
                            >
                                <FaUserCircle />
                            </Avatar>
                        </IconButton>
                    </Box>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                            sx: {
                                backgroundColor: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
                                color: isDarkTheme ? '#fff' : '#03427c',
                                width: menuWidth,
                                borderRadius: 2,
                                mt: 1,
                            }
                        }}
                    >
                        {menuItems.map((item, index) => (
                            <React.Fragment key={index}>
                                <MenuItem
                                    component={item.path ? Link : 'button'}
                                    to={item.path}
                                    onClick={() => handleItemClick(item)}
                                    sx={{
                                        py: 1.6,
                                        '&:hover': {
                                            backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(3,66,124,0.1)',
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                                        <item.icon size={20} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontSize: '0.9rem',
                                            fontWeight: 500
                                        }}
                                    />
                                </MenuItem>
                                {item.divider && <Divider sx={{ my: 1 }} />}
                            </React.Fragment>
                        ))}
                    </Menu>
                </Toolbar>
            </AppBar>
            <Toolbar />

            <Notificaciones
                open={openNotification}
                message={notificationMessage}
                type="info"
                handleClose={() => setOpenNotification(false)}
            />
        </>
    );
}
export default BarraPaciente;