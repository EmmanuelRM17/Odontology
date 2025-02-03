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
    ListItemText
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

const BarraPaciente = () => {
    const [notificationMessage, setNotificationMessage] = useState('');
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openNotification, setOpenNotification] = useState(false);
    const [notificationCount, setNotificationCount] = useState(2);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    // Detectar tema del sistema
    useEffect(() => {
        const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkTheme(matchDarkTheme.matches);

        const handleThemeChange = (e) => {
            setIsDarkTheme(e.matches);
        };

        matchDarkTheme.addEventListener('change', handleThemeChange);
        return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
    }, []);

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


    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

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


    // useEffect modificado para usar la nueva función
    useEffect(() => {
        checkAuthStatus();
        const interval = setInterval(checkAuthStatus, 300000); // 5 minutos
        return () => clearInterval(interval);
    }, [navigate]);

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
                if (response.status === 401) {
                    console.log('🔴 Sesión no válida o expirada');
                    setIsAuthenticated(false);
                    navigate('/error', { state: { errorCode: 401, errorMessage: 'No autorizado' } });
                    return;
                }
                throw new Error('Error en el servidor');
            }

            const data = await response.json();

            if (data.authenticated && data.user) {
                console.log('✅ Usuario autenticado:', {
                    nombre: data.user.nombre,
                    email: data.user.email,
                    tipo: data.user.tipo,
                    dispositivo: data.user.dispositivo
                });

                if (data.sesionPrevia) {
                    console.log('⚠️ Se cerró sesión en dispositivo anterior:', data.sesionPrevia.dispositivo);
                }

                setIsAuthenticated(true);
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('userName', data.user.nombre);
                localStorage.setItem('userType', data.user.tipo);
                localStorage.setItem('userId', data.user.id);
            } else {
                console.log('❌ Usuario no autenticado');
                setIsAuthenticated(false);
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userName');
                localStorage.removeItem('userType');
                localStorage.removeItem('userId');
                navigate('/error', { state: { errorCode: 403, errorMessage: 'No tienes acceso a esta página.' } });
            }
        } catch (error) {
            console.error('🔴 Error al verificar autenticación:', error);
            setNotificationMessage('Error al verificar la autenticación');
            setOpenNotification(true);
            setIsAuthenticated(false);
            navigate('/error', { state: { errorCode: 500, errorMessage: 'Error en el servidor' } });
        }
    };

    const handleLogout = async () => {
        handleMenuClose();
        try {
            console.log('🔄 Iniciando proceso de logout...');
            const response = await fetch('https://back-end-4803.onrender.com/api/users/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Error al cerrar sesión');
            }

            const data = await response.json();
            console.log('✅ Sesión cerrada exitosamente:', data);

            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('userType');
            localStorage.removeItem('userId');

            setIsAuthenticated(false);
            setNotificationMessage('Sesión cerrada exitosamente');
            setOpenNotification(true);

            setTimeout(() => {
                navigate('/', { replace: true });
            }, 1500);

        } catch (error) {
            console.error('❌ Error en logout:', error);
            setNotificationMessage('Error al cerrar sesión. Intente nuevamente.');
            setOpenNotification(true);
        }
    };

    // Si no hay autenticación, no renderizar la barra
    if (!isAuthenticated) {
        return null;
    }
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
                            fontSize: 32,
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
                                width: 220,
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
            <Toolbar /> {/* Espaciador para el contenido debajo del AppBar fijo */}

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