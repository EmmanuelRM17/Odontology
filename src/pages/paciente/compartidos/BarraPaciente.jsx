import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    IconButton,
    Drawer,
    Badge,
    Avatar,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Collapse,
    Divider,
    useTheme,
    useMediaQuery,
    Paper
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    FaHome, FaUserCircle, FaCalendarAlt, FaFileMedical, FaPills, 
    FaFileAlt, FaWallet, FaChartLine, FaComments, FaBell, 
    FaQuestionCircle, FaCog, FaSignOutAlt, FaTooth,
    FaAngleDown, FaAngleRight, FaBars
} from 'react-icons/fa';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useAuth } from '../../../components/Tools/AuthContext';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const BarraPaciente = ({ onDrawerChange }) => {
    const [notificationMessage, setNotificationMessage] = useState('');
    const { isDarkTheme } = useThemeContext();
    const [openNotification, setOpenNotification] = useState(false);
    const [pendingNotifications, setPendingNotifications] = useState(2);
    const [drawerOpen, setDrawerOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { setUser } = useAuth();

    // Estado para manejar los grupos expandidos/colapsados
    const [expandedGroups, setExpandedGroups] = useState({
        personal: true,
        clinico: true,
        comunicacion: true
    });

    // Configuración de colores basados en el tema
    const colors = {
        background: isDarkTheme ? '#1A1F2C' : '#FFFFFF', // Fondo principal
        primary: isDarkTheme ? '#3B82F6' : '#03427c', // Azul principal
        secondary: isDarkTheme ? '#4ADE80' : '#10B981', // Verde para acentos
        text: isDarkTheme ? '#F3F4F6' : '#1F2937',
        secondaryText: isDarkTheme ? '#94A3B8' : '#64748B',
        hover: isDarkTheme ? 'rgba(59,130,246,0.15)' : 'rgba(3,66,124,0.08)',
        menuBg: isDarkTheme ? '#111827' : '#F9FAFB',
        sidebarHeader: isDarkTheme ? '#0F172A' : '#EFF6FF',
        iconColor: isDarkTheme ? '#E5E7EB' : '#4B5563',
        activeItem: isDarkTheme ? 'rgba(59,130,246,0.2)' : 'rgba(3,66,124,0.1)',
        divider: isDarkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        error: isDarkTheme ? '#F87171' : '#EF4444',
        boxShadow: isDarkTheme ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)'
    };

    // Organizamos los menús en grupos lógicos
    const menuGroups = [
        {
            id: 'personal',
            title: 'Personal',
            items: [
                { icon: FaUserCircle, text: 'Mi Perfil', path: '/Paciente/perfil' },
                { icon: FaCalendarAlt, text: 'Mis Citas', path: '/Paciente/citas' }
            ]
        },
        {
            id: 'clinico',
            title: 'Información Clínica',
            items: [
                { icon: FaFileMedical, text: 'Historial Clínico', path: '/Paciente/historial' },
                { icon: FaPills, text: 'Tratamientos', path: '/Paciente/tratamientos' },
                { icon: FaFileAlt, text: 'Recetas', path: '/Paciente/recetas' },
                { icon: FaWallet, text: 'Pagos', path: '/Paciente/pagos' },
                { icon: FaChartLine, text: 'Progreso', path: '/Paciente/progreso' }
            ]
        },
        {
            id: 'comunicacion',
            title: 'Comunicación',
            items: [
                { icon: FaComments, text: 'Mensajes', path: '/Paciente/mensajes' },
                { icon: FaBell, text: 'Notificaciones', path: '/Paciente/notificaciones' }
            ]
        }
    ];

    // Ancho del drawer según estado y dispositivo
    const drawerWidth = drawerOpen ? (isMobile ? '85%' : 280) : (isMobile ? 0 : 68);

    // Notificar al componente padre cuando cambia el estado del drawer
    useEffect(() => {
        if (onDrawerChange) {
            onDrawerChange(drawerOpen);
        }
    }, [drawerOpen, onDrawerChange]);

    // Manejar expansión/colapso de grupos
    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    // Adaptar drawer a tamaño de pantalla
    useEffect(() => {
        // Si es móvil, inicialmente el drawer estará cerrado
        setDrawerOpen(!isMobile);
        // Notificar al componente padre sobre el cambio
        if (onDrawerChange) {
            onDrawerChange(!isMobile);
        }
    }, [isMobile, onDrawerChange]);

    // Verificar autenticación al cargar
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
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Error al verificar autenticación:", error);
                setUser(null);
            }
        };

        checkAuthStatus();
    }, [setUser]);

    // Manejar clic en elementos del menú
    const handleItemClick = (item) => {
        if (item.text === 'Cerrar Sesión') {
            handleLogout();
        } else if (item.path) {
            navigate(item.path);
            if (isMobile) {
                setDrawerOpen(false);
                if (onDrawerChange) {
                    onDrawerChange(false);
                }
            }
        }
    };

    // Manejar cierre de sesión
    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        try {
            setNotificationMessage('Cerrando sesión... Redirigiendo...');
            setOpenNotification(true);

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

            setNotificationMessage('Sesión cerrada exitosamente');
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

    // Renderizado del drawer lateral
    const renderDrawer = () => (
        <Drawer
            variant={isMobile ? "temporary" : "permanent"}
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
                '& .MuiDrawer-paper': {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: drawerWidth,
                    height: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: colors.menuBg,
                    color: colors.text,
                    borderRight: `1px solid ${colors.divider}`,
                    boxShadow: colors.boxShadow,
                    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    zIndex: theme.zIndex.drawer
                }
            }}
            elevation={0}
        >
            {/* Cabecera del Drawer - Logo y Nombre */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.sidebarHeader,
                p: 2,
                height: 64,
                borderBottom: `1px solid ${colors.divider}`
            }}>
                <Box
                    component={Link}
                    to="/Paciente/principal"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        color: colors.text,
                        overflow: 'hidden'
                    }}
                >
                    <FaTooth style={{
                        fontSize: 26,
                        color: colors.primary,
                        flexShrink: 0,
                        marginRight: drawerOpen ? 12 : 0
                    }} />

                    {drawerOpen && (
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 'bold',
                                color: colors.primary,
                                fontSize: '1rem',
                                letterSpacing: 0.5,
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Odontología Carol
                        </Typography>
                    )}
                </Box>

                {drawerOpen && (
                    <IconButton
                        onClick={() => setDrawerOpen(false)}
                        sx={{
                            color: colors.iconColor,
                            width: 32,
                            height: 32,
                            '&:hover': {
                                backgroundColor: colors.hover
                            }
                        }}
                    >
                        <FaAngleLeft />
                    </IconButton>
                )}
            </Box>

            {/* Área de usuario */}
            {drawerOpen && (
                <Box sx={{
                    py: 2,
                    px: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderBottom: `1px solid ${colors.divider}`
                }}>
                    <Avatar
                        sx={{
                            bgcolor: colors.primary,
                            width: 64,
                            height: 64,
                            mb: 1.5
                        }}
                    >
                        <FaUserCircle size={32} />
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Nombre del Paciente
                    </Typography>
                    <Typography variant="body2" color={colors.secondaryText}>
                        paciente@ejemplo.com
                    </Typography>
                </Box>
            )}

            {/* Contenido del Drawer */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                height: drawerOpen ? 'calc(100% - 200px)' : 'calc(100% - 64px)',
            }}>
                {/* Menú de navegación */}
                <List sx={{
                    px: 1.5,
                    py: 2,
                    flexGrow: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    '::-webkit-scrollbar': {
                        width: '6px'
                    },
                    '::-webkit-scrollbar-thumb': {
                        backgroundColor: colors.divider,
                        borderRadius: '6px'
                    }
                }}>
                    {/* Grupos de menú */}
                    {menuGroups.map((group) => (
                        <React.Fragment key={group.id}>
                            {/* Encabezado de Grupo */}
                            {drawerOpen && (
                                <ListItem
                                    button
                                    onClick={() => toggleGroup(group.id)}
                                    disableRipple
                                    sx={{
                                        borderRadius: 1,
                                        mb: 0.5,
                                        py: 1,
                                        '&:hover': { backgroundColor: 'transparent' }
                                    }}
                                >
                                    <ListItemText
                                        primary={group.title}
                                        primaryTypographyProps={{
                                            fontWeight: 'bold',
                                            fontSize: '0.75rem',
                                            letterSpacing: 0.5,
                                            textTransform: 'uppercase',
                                            color: colors.secondaryText
                                        }}
                                    />
                                    <Box sx={{
                                        color: colors.secondaryText,
                                        transition: 'transform 0.2s',
                                        transform: expandedGroups[group.id] ? 'rotate(0deg)' : 'rotate(-90deg)'
                                    }}>
                                        <FaAngleDown size={14} />
                                    </Box>
                                </ListItem>
                            )}

                            {/* Items del grupo */}
                            <Collapse in={expandedGroups[group.id] || !drawerOpen} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {group.items.map((item, index) => {
                                        const isActive = location.pathname === item.path;

                                        return (
                                            <Paper
                                                key={index}
                                                elevation={0}
                                                sx={{
                                                    backgroundColor: isActive ? colors.activeItem : 'transparent',
                                                    borderRadius: 1.5,
                                                    overflow: 'hidden',
                                                    transition: 'background-color 0.2s ease',
                                                    mb: 0.5,
                                                    '&:hover': {
                                                        backgroundColor: isActive ? colors.activeItem : colors.hover,
                                                    }
                                                }}
                                            >
                                                <ListItem
                                                    button
                                                    onClick={() => handleItemClick(item)}
                                                    disableRipple
                                                    sx={{
                                                        py: 1.2,
                                                        pl: drawerOpen ? 2 : 1,
                                                        pr: 1,
                                                    }}
                                                >
                                                    <ListItemIcon
                                                        sx={{
                                                            color: isActive ? colors.primary : colors.iconColor,
                                                            minWidth: drawerOpen ? 36 : 'auto',
                                                        }}
                                                    >
                                                        <item.icon size={16} />
                                                    </ListItemIcon>

                                                    {drawerOpen && (
                                                        <ListItemText
                                                            primary={item.text}
                                                            primaryTypographyProps={{
                                                                fontSize: '0.875rem',
                                                                fontWeight: isActive ? 600 : 400,
                                                                color: isActive ? colors.primary : colors.text
                                                            }}
                                                        />
                                                    )}
                                                </ListItem>
                                            </Paper>
                                        );
                                    })}
                                </List>
                            </Collapse>

                            {drawerOpen && <Divider sx={{ my: 1.5, borderColor: colors.divider }} />}
                        </React.Fragment>
                    ))}

                    {/* Ayuda y Configuración (fuera de grupos) */}
                    <Paper
                        elevation={0}
                        sx={{
                            backgroundColor: location.pathname === '/Paciente/ayuda'
                                ? colors.activeItem
                                : 'transparent',
                            borderRadius: 1.5,
                            overflow: 'hidden',
                            transition: 'background-color 0.2s ease',
                            mb: 0.5,
                            '&:hover': {
                                backgroundColor: location.pathname === '/Paciente/ayuda'
                                    ? colors.activeItem
                                    : colors.hover,
                            }
                        }}
                    >
                        <ListItem
                            button
                            onClick={() => navigate('/Paciente/ayuda')}
                            disableRipple
                            sx={{
                                py: 1.2,
                                pl: drawerOpen ? 2 : 1,
                                pr: 1,
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: location.pathname === '/Paciente/ayuda'
                                        ? colors.primary
                                        : colors.iconColor,
                                    minWidth: drawerOpen ? 36 : 'auto',
                                }}
                            >
                                <FaQuestionCircle size={16} />
                            </ListItemIcon>

                            {drawerOpen && (
                                <ListItemText
                                    primary="Ayuda"
                                    primaryTypographyProps={{
                                        fontSize: '0.875rem',
                                        fontWeight: location.pathname === '/Paciente/ayuda' ? 600 : 400,
                                        color: location.pathname === '/Paciente/ayuda'
                                            ? colors.primary
                                            : colors.text
                                    }}
                                />
                            )}
                        </ListItem>
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            backgroundColor: location.pathname === '/Paciente/configuracion'
                                ? colors.activeItem
                                : 'transparent',
                            borderRadius: 1.5,
                            overflow: 'hidden',
                            transition: 'background-color 0.2s ease',
                            mb: 0.5,
                            '&:hover': {
                                backgroundColor: location.pathname === '/Paciente/configuracion'
                                    ? colors.activeItem
                                    : colors.hover,
                            }
                        }}
                    >
                        <ListItem
                            button
                            onClick={() => navigate('/Paciente/configuracion')}
                            disableRipple
                            sx={{
                                py: 1.2,
                                pl: drawerOpen ? 2 : 1,
                                pr: 1,
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: location.pathname === '/Paciente/configuracion'
                                        ? colors.primary
                                        : colors.iconColor,
                                    minWidth: drawerOpen ? 36 : 'auto',
                                }}
                            >
                                <FaCog size={16} />
                            </ListItemIcon>

                            {drawerOpen && (
                                <ListItemText
                                    primary="Configuración"
                                    primaryTypographyProps={{
                                        fontSize: '0.875rem',
                                        fontWeight: location.pathname === '/Paciente/configuracion' ? 600 : 400,
                                        color: location.pathname === '/Paciente/configuracion'
                                            ? colors.primary
                                            : colors.text
                                    }}
                                />
                            )}
                        </ListItem>
                    </Paper>
                </List>

                {/* Cerrar Sesión (separado al final) */}
                <Box sx={{
                    p: 1.5,
                    mt: 'auto',
                    borderTop: `1px solid ${colors.divider}`,
                    backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
                }}>
                    <Paper
                        elevation={0}
                        sx={{
                            backgroundColor: 'transparent',
                            borderRadius: 1.5,
                            overflow: 'hidden',
                            transition: 'background-color 0.2s ease',
                            '&:hover': {
                                backgroundColor: isDarkTheme ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)',
                            }
                        }}
                    >
                        <ListItem
                            button
                            onClick={handleLogout}
                            disableRipple
                            sx={{
                                py: 1.2,
                                px: 1.5
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: colors.error,
                                    minWidth: drawerOpen ? 36 : 'auto',
                                }}
                            >
                                <FaSignOutAlt size={16} />
                            </ListItemIcon>

                            {drawerOpen && (
                                <ListItemText
                                    primary="Cerrar Sesión"
                                    primaryTypographyProps={{
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: colors.error
                                    }}
                                />
                            )}
                        </ListItem>
                    </Paper>
                </Box>
            </Box>
        </Drawer>
    );

    return (
        <>
            <AppBar
                position="fixed"
                sx={{
                    backgroundColor: colors.background,
                    color: colors.text,
                    boxShadow: colors.boxShadow,
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    width: '100%',
                    borderBottom: `1px solid ${colors.divider}`
                }}
                elevation={0}
            >
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* Botón para mostrar/ocultar menú lateral en móvil o cuando está colapsado */}
                        {(!drawerOpen || isMobile) && (
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                onClick={() => setDrawerOpen(true)}
                                edge="start"
                                sx={{
                                    color: colors.iconColor,
                                    mr: 2,
                                    '&:hover': {
                                        backgroundColor: colors.hover
                                    }
                                }}
                            >
                                <FaBars />
                            </IconButton>
                        )}

                        {/* Título de Página con icono de diente */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FaTooth style={{
                                fontSize: 22,
                                color: colors.primary,
                                marginRight: 10
                            }} />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 500,
                                    color: colors.text,
                                    fontSize: { xs: '0.9rem', sm: '1rem' }
                                }}
                            >
                                Portal del Paciente
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {/* Botón de notificaciones */}
                        <IconButton
                            size="medium"
                            sx={{
                                color: colors.iconColor,
                                borderRadius: 1.5,
                                padding: 1,
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
                                        backgroundColor: colors.error,
                                        color: '#ffffff',
                                        fontWeight: 'bold',
                                        minWidth: 18,
                                        height: 18
                                    }
                                }}
                            >
                                <FaBell size={18} />
                            </Badge>
                        </IconButton>
                        {/* Botón de inicio/casa */}
                        <IconButton
                            component={Link}
                            to="/Paciente/principal"
                            sx={{
                                color: location.pathname === '/Paciente/principal'
                                    ? colors.primary
                                    : colors.iconColor,
                                '&:hover': {
                                    color: colors.primary,
                                    backgroundColor: colors.hover
                                }
                            }}
                        >
                            <FaHome size={18} />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Drawer lateral */}
            {renderDrawer()}

            {/* Componente de notificaciones */}
            <Notificaciones
                open={openNotification}
                message={notificationMessage}
                type="info"
                handleClose={() => setOpenNotification(false)}
            />
        </>
    );
};

// Implementación del icono FaAngleLeft (reutilizando FaAngleRight rotado)
const FaAngleLeft = () => {
    return <FaAngleRight style={{ transform: 'rotate(180deg)' }} />;
};

export default BarraPaciente;