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
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaChartLine,
  FaMoneyBillWave,
  FaCalendarCheck,
  FaClock,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaFileAlt,
  FaTooth,
  FaUserCircle,
  FaAngleDown,
  FaBars,
  FaQuestionCircle,
  FaCloudUploadAlt,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import Notificaciones from '../../../../components/Layout/Notificaciones';
import { useAuth } from '../../../../components/Tools/AuthContext';
import { useThemeContext } from '../../../../components/Tools/ThemeContext';

const MenuToggleButton = ({ isOpen, onClick, color }) => (
  <IconButton
    onClick={onClick}
    sx={{
      color: color,
      width: 32,
      height: 32,
      '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
    }}
  >
    {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
  </IconButton>
);

const BarraAdmin = ({ onDrawerChange }) => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [openNotification, setOpenNotification] = useState(false);
  const [pendingNotifications, setPendingNotifications] = useState(3);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isDarkTheme } = useThemeContext();
  const { setUser, user } = useAuth();

  // Estados para los submenús tipo acordeón
  const [expandedGroups, setExpandedGroups] = useState({
    gestion: false,
    reportes: false,
    configuracion: false
  });

  const colors = {
    background: isDarkTheme ? '#1A1F2C' : '#FFFFFF',
    primary: isDarkTheme ? '#3B82F6' : '#2563EB',
    secondary: isDarkTheme ? '#4ADE80' : '#10B981',
    text: isDarkTheme ? '#F3F4F6' : '#1F2937',
    secondaryText: isDarkTheme ? '#94A3B8' : '#64748B',
    hover: isDarkTheme ? 'rgba(59,130,246,0.15)' : 'rgba(37,99,235,0.08)',
    menuBg: isDarkTheme ? '#111827' : '#F9FAFB',
    sidebarHeader: isDarkTheme ? '#0F172A' : '#EFF6FF',
    iconColor: isDarkTheme ? '#E5E7EB' : '#4B5563',
    activeItem: isDarkTheme ? 'rgba(59,130,246,0.2)' : 'rgba(37,99,235,0.1)',
    divider: isDarkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    error: isDarkTheme ? '#F87171' : '#EF4444',
    boxShadow: isDarkTheme ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)'
  };

  const menuGroups = [
    {
      id: 'gestion',
      title: 'Gestión',
      items: [
        { icon: FaUsers, text: 'Gestión de Pacientes', path: '/Administrador/pacientes' },
        { icon: FaTooth, text: 'Gestión de Servicios', path: '/Administrador/servicios' },
        { icon: FaCalendarCheck, text: 'Gestión de Citas', path: '/Administrador/citas' },
        { icon: FaCalendarCheck, text: 'Gestión de Tratamientos', path: '/Administrador/tratamientos' },
        { icon: FaMoneyBillWave, text: 'Finanzas', path: '/Administrador/finanzas' },
        { icon: FaCalendarAlt, text: 'Gestión de Horarios', path: '/Administrador/horarios' },
        { icon: FaCloudUploadAlt, text: 'Subida de Imágenes', path: '/Administrador/imagenes' }
      ]
    },
    {
      id: 'reportes',
      title: 'Informes y Análisis',
      items: [
        { icon: FaChartLine, text: 'Estadísticas', path: '/Administrador/Estadisticas' },
        { icon: FaFileAlt, text: 'Reportes', path: '/Administrador/reportes' },
        { icon: FaClock, text: 'Historial', path: '/Administrador/historial' }
      ]
    },
    {
      id: 'configuracion',
      title: 'Sistema',
      items: [
        { icon: FaBell, text: 'Notificaciones', path: '/Administrador/notificaciones' },
        { icon: FaCog, text: 'Configuración', path: '/Administrador/configuracion' }
      ]
    }
  ];

  // En móvil inicia el drawer cerrado; en escritorio, abierto
  useEffect(() => {
    setDrawerOpen(!isMobile);
    if (onDrawerChange) onDrawerChange(!isMobile);
  }, [isMobile, onDrawerChange]);

  // Notifica al padre cada vez que cambia el estado
  useEffect(() => {
    if (onDrawerChange) onDrawerChange(drawerOpen);
  }, [drawerOpen, onDrawerChange]);

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => {
      const newState = Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {});
      newState[groupId] = !prev[groupId];
      return newState;
    });
  };

  // Verificar autenticación (igual a tu código)
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('https://back-end-4803.onrender.com/api/users/check-auth', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error("Usuario no autenticado");
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

  const handleItemClick = (item) => {
    if (item.text === 'Cerrar Sesión') {
      handleLogout();
    } else if (item.path) {
      navigate(item.path);
      if (isMobile) setDrawerOpen(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      setNotificationMessage('Cerrando sesión... Redirigiendo...');
      setOpenNotification(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const response = await fetch('https://back-end-4803.onrender.com/api/users/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Error en logout: ${response.status}`);
      setNotificationMessage('Sesión cerrada exitosamente');
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setUser(null);
      setOpenNotification(false);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error en logout:', error.message);
      setNotificationMessage('Error al cerrar sesión. Intente nuevamente.');
      setOpenNotification(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setOpenNotification(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawerWidth = drawerOpen ? (isMobile ? '85%' : 280) : 0;

  const renderDrawer = () => (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
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
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          zIndex: theme.zIndex.drawer,
          display: 'flex',
          flexDirection: 'column',
          transform: !drawerOpen && !isMobile ? 'translateX(-100%)' : 'translateX(0)',
          visibility: drawerOpen || isMobile ? 'visible' : 'hidden'
        }
      }}
      elevation={0}
    >
      {/* Cabecera del Drawer */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.sidebarHeader,
          p: 2,
          height: 64,
          borderBottom: `1px solid ${colors.divider}`
        }}
      >
        <Box
          component={Link}
          to="/Administrador/principal"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: colors.text,
            overflow: 'hidden'
          }}
        >
          <FaTooth
            style={{
              fontSize: 26,
              color: colors.primary,
              flexShrink: 0,
              marginRight: drawerOpen ? 12 : 0
            }}
          />
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
        {/* En escritorio se muestra el botón de contraer/expandir */}
        {!isMobile && (
          <MenuToggleButton isOpen={drawerOpen} onClick={toggleDrawer} color={colors.iconColor} />
        )}
      </Box>

      {/* Área de usuario (solo si el drawer está abierto) */}
      {drawerOpen && (
        <Box
          sx={{
            py: 2,
            px: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderBottom: `1px solid ${colors.divider}`
          }}
        >
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
            {user?.nombre || 'Admin'}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: colors.secondaryText, fontWeight: 'medium', mb: 0.5 }}
          >
            Administrador
          </Typography>
          <Typography variant="body2" color={colors.secondaryText}>
            {user?.email || 'admin@odontologiacarol.com'}
          </Typography>
        </Box>
      )}

      {/* Contenido del menú */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100% - 200px)',
          flexGrow: 1,
          overflow: 'hidden'
        }}
      >
        <List
          sx={{
            px: 1.5,
            py: 2,
            flexGrow: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            '::-webkit-scrollbar': { width: '6px' },
            '::-webkit-scrollbar-thumb': { backgroundColor: colors.divider, borderRadius: '6px' }
          }}
        >
          {/* Panel Principal */}
          <Paper
            elevation={0}
            sx={{
              backgroundColor:
                location.pathname === '/Administrador/principal'
                  ? colors.activeItem
                  : 'transparent',
              borderRadius: 1.5,
              overflow: 'hidden',
              transition: 'background-color 0.2s ease',
              mb: 1.5,
              '&:hover': {
                backgroundColor:
                  location.pathname === '/Administrador/principal'
                    ? colors.activeItem
                    : colors.hover
              }
            }}
          >
            <ListItem
              button
              onClick={() => navigate('/Administrador/principal')}
              disableRipple
              sx={{
                py: 1.5,
                px: drawerOpen ? 1.5 : 1
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === '/Administrador/principal'
                      ? colors.primary
                      : colors.iconColor,
                  minWidth: drawerOpen ? 36 : 'auto'
                }}
              >
                <FaHome size={18} />
              </ListItemIcon>
              {drawerOpen && (
                <ListItemText
                  primary="Panel Principal"
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight:
                      location.pathname === '/Administrador/principal' ? 600 : 500,
                    color:
                      location.pathname === '/Administrador/principal'
                        ? colors.primary
                        : colors.text
                  }}
                />
              )}
            </ListItem>
          </Paper>
          {drawerOpen && <Divider sx={{ my: 1.5, borderColor: colors.divider }} />}
          {menuGroups.map((group) => (
            <React.Fragment key={group.id}>
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
                  <Box
                    sx={{
                      color: colors.secondaryText,
                      transition: 'transform 0.2s',
                      transform: expandedGroups[group.id]
                        ? 'rotate(0deg)'
                        : 'rotate(-90deg)'
                    }}
                  >
                    <FaAngleDown size={14} />
                  </Box>
                </ListItem>
              )}
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
                            backgroundColor: isActive ? colors.activeItem : colors.hover
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
                            pr: 1
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              color: isActive ? colors.primary : colors.iconColor,
                              minWidth: drawerOpen ? 36 : 'auto'
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
          {drawerOpen && (
            <Paper
              elevation={0}
              sx={{
                backgroundColor:
                  location.pathname === '/Administrador/ayuda'
                    ? colors.activeItem
                    : 'transparent',
                borderRadius: 1.5,
                overflow: 'hidden',
                transition: 'background-color 0.2s ease',
                mb: 0.5,
                mt: 1,
                '&:hover': {
                  backgroundColor:
                    location.pathname === '/Administrador/ayuda'
                      ? colors.activeItem
                      : colors.hover
                }
              }}
            >
              <ListItem
                button
                onClick={() => navigate('/Administrador/ayuda')}
                disableRipple
                sx={{
                  py: 1.2,
                  px: 1.5
                }}
              >
                <ListItemIcon
                  sx={{
                    color:
                      location.pathname === '/Administrador/ayuda'
                        ? colors.primary
                        : colors.iconColor,
                    minWidth: 36
                  }}
                >
                  <FaQuestionCircle size={16} />
                </ListItemIcon>
                {drawerOpen && (
                  <ListItemText
                    primary="Ayuda"
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: location.pathname === '/Administrador/ayuda' ? 600 : 400,
                      color:
                        location.pathname === '/Administrador/ayuda'
                          ? colors.primary
                          : colors.text
                    }}
                  />
                )}
              </ListItem>
            </Paper>
          )}
        </List>
      </Box>
      {/* Cerrar sesión */}
      <Box
        sx={{
          p: 1.5,
          borderTop: `1px solid ${colors.divider}`,
          backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
          mt: 'auto'
        }}
      >
        <Paper
          elevation={0}
          sx={{
            backgroundColor: 'transparent',
            borderRadius: 1.5,
            overflow: 'hidden',
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: isDarkTheme
                ? 'rgba(239,68,68,0.1)'
                : 'rgba(239,68,68,0.05)'
            }
          }}
        >
          <ListItem
            button
            onClick={handleLogout}
            disableRipple
            sx={{ py: 1.2, px: 1.5 }}
          >
            <ListItemIcon
              sx={{
                color: colors.error,
                minWidth: drawerOpen ? 36 : 'auto'
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
    </Drawer>
  );

  // Botón flotante para expandir el menú en escritorio cuando está contraído
  const renderExpandButton = () => {
    if (drawerOpen || isMobile) return null;
    return (
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: theme.zIndex.drawer - 1,
          backgroundColor: colors.primary,
          borderRadius: '0 4px 4px 0',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
          opacity: 0.9,
          '&:hover': { opacity: 1 },
          transition: 'opacity 0.2s'
        }}
      >
        <IconButton onClick={toggleDrawer} sx={{ color: '#fff', p: 0.8 }}>
          <FaChevronRight size={18} />
        </IconButton>
      </Box>
    );
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: colors.background,
          color: colors.text,
          boxShadow: colors.boxShadow,
          zIndex: theme.zIndex.drawer + 1,
          width: '100%',
          borderBottom: `1px solid ${colors.divider}`
        }}
        elevation={0}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Ícono hamburguesa solo en móvil */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={() => setDrawerOpen(true)}
                edge="start"
                sx={{
                  color: colors.iconColor,
                  mr: 2,
                  '&:hover': { backgroundColor: colors.hover }
                }}
              >
                <FaBars />
              </IconButton>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FaTooth
                style={{
                  fontSize: 22,
                  color: colors.primary,
                  marginRight: 10
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  color: colors.text,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              >
                Panel Administrativo
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              size="medium"
              sx={{
                color: colors.iconColor,
                borderRadius: 1.5,
                padding: 1,
                '&:hover': { color: colors.primary, backgroundColor: colors.hover }
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
            <IconButton
              component={Link}
              to="/Administrador/CalendarioCita"
              sx={{
                color:
                  location.pathname === '/Administrador/CalendarioCita'
                    ? colors.primary
                    : colors.iconColor,
                '&:hover': { color: colors.primary, backgroundColor: colors.hover }
              }}
            >
              <FaCalendarAlt size={18} />
            </IconButton>
            <IconButton
              component={Link}
              to="/Administrador/principal"
              sx={{
                color:
                  location.pathname === '/Administrador/principal'
                    ? colors.primary
                    : colors.iconColor,
                '&:hover': { color: colors.primary, backgroundColor: colors.hover }
              }}
            >
              <FaHome size={18} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderDrawer()}
      {renderExpandButton()}
      <Notificaciones
        open={openNotification}
        message={notificationMessage}
        type="info"
        handleClose={() => setOpenNotification(false)}
      />
    </>
  );
};

export default BarraAdmin;
