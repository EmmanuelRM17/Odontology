import React, { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Skeleton,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  FaSignInAlt,
  FaCalendarAlt,
  FaHome,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaClock
} from 'react-icons/fa';
import MenuIcon from '@mui/icons-material/Menu';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import { WbSunnyRounded, NightsStayRounded } from '@mui/icons-material'; // ✅ Agregado correctamente
import { useThemeContext } from '../Tools/ThemeContext';


const BarraNav = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logo, setLogo] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkTheme, toggleTheme } = useThemeContext();
  const navigate = useNavigate();

  const fetchTitleAndLogo = async (retries = 3) => {
    try {
      const response = await axios.get(
        'https://back-end-4803.onrender.com/api/perfilEmpresa/getTitleAndLogo',
        { timeout: 10000 }
      );
      const { nombre_empresa, logo } = response.data;

      if (nombre_empresa) {
        document.title = nombre_empresa;
        setCompanyName(nombre_empresa);
      }

      if (logo) {
        const formattedLogo = logo.startsWith('data:image')
          ? logo
          : `data:image/jpeg;base64,${logo}`;
        setLogo(formattedLogo);
      }
    } catch (error) {
      console.error('Error al obtener datos:', error.message);
      if (retries > 0) {
        setTimeout(() => fetchTitleAndLogo(retries - 1), 2000);
      } else {
        setError('No se pudo cargar la configuración de la empresa.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTitleAndLogo();
  }, []);

  // Función para abrir/cerrar el Drawer
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  //  Drawer
  const drawerList = (
    <Box
      sx={{
        width: '80vw',
        maxWidth: '360px',
        backgroundColor: isDarkTheme ? '#1a2027' : '#ffffff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        borderBottom: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        backgroundColor: isDarkTheme ? '#2A3A4A' : '#f8f9fa'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {logo && (
            <img
              src={logo}
              alt="Logo"
              style={{
                marginRight: '12px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: `2px solid ${isDarkTheme ? '#3d5afe' : '#1976d2'}`
              }}
            />
          )}
          <Typography
            variant="h6"
            sx={{
              color: isDarkTheme ? '#fff' : '#1a2027',
              fontWeight: 600,
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '1.1rem'
            }}
          >
            {companyName || 'Odontología Carol'}
          </Typography>
        </Box>
        {/* Contenedor para el cambio de tema y el botón de cerrar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Botón de Cambio de Tema */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              toggleTheme();
            }}
            color="inherit"
            sx={{
              color: isDarkTheme ? '#FFC107' : '#5E35B1',
              backgroundColor: isDarkTheme ? 'rgba(255, 193, 7, 0.1)' : 'rgba(94, 53, 177, 0.05)',
              borderRadius: '50%',
              padding: '8px',
              width: '36px',
              height: '36px',
              transition: 'background-color 0.3s ease',
              '&:hover': {
                backgroundColor: isDarkTheme ? 'rgba(255, 193, 7, 0.2)' : 'rgba(94, 53, 177, 0.1)',
              }
            }}
          >
            <motion.div
              animate={{ rotate: isDarkTheme ? 180 : 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              {isDarkTheme ? (
                <WbSunnyRounded sx={{ fontSize: '20px' }} />
              ) : (
                <NightsStayRounded sx={{ fontSize: '20px' }} />
              )}
            </motion.div>
          </IconButton>

          <IconButton
            onClick={toggleDrawer(false)}
            sx={{
              color: isDarkTheme ? '#fff' : '#1a2027',
              '&:hover': {
                backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <List sx={{ flex: 1, pt: 2 }}>
        <ListItem
          button
          component={Link}
          to="/"
          sx={{
            py: 1.5,
            '&:hover': {
              backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
            }
          }}
        >
          <ListItemIcon sx={{ color: isDarkTheme ? '#90caf9' : '#1976d2', minWidth: 40 }}>
            <FaHome size={20} />
          </ListItemIcon>
          <ListItemText
            primary="Inicio"
            primaryTypographyProps={{
              sx: {
                color: isDarkTheme ? '#fff' : '#1a2027',
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 500
              }
            }}
          />
        </ListItem>

        <ListItem
          button
          component={Link}
          to="/about"
          sx={{
            py: 1.5,
            '&:hover': {
              backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
            }
          }}
        >
          <ListItemIcon sx={{ color: isDarkTheme ? '#90caf9' : '#1976d2', minWidth: 40 }}>
            <FaInfoCircle size={20} />
          </ListItemIcon>
          <ListItemText
            primary="Acerca de"
            primaryTypographyProps={{
              sx: {
                color: isDarkTheme ? '#fff' : '#1a2027',
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 500
              }
            }}
          />
        </ListItem>

        <Divider sx={{ my: 2, borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />

        <ListItem
          button
          component={Link}
          to="/agendar-cita"
          sx={{
            py: 1.5,
            backgroundColor: isDarkTheme ? 'rgba(61, 90, 254, 0.1)' : 'rgba(25, 118, 210, 0.08)',
            '&:hover': {
              backgroundColor: isDarkTheme ? 'rgba(61, 90, 254, 0.2)' : 'rgba(25, 118, 210, 0.12)'
            }
          }}
        >
          <ListItemIcon sx={{ color: isDarkTheme ? '#90caf9' : '#1976d2', minWidth: 40 }}>
            <FaCalendarAlt size={20} />
          </ListItemIcon>
          <ListItemText
            primary="Agenda una Cita"
            primaryTypographyProps={{
              sx: {
                color: isDarkTheme ? '#fff' : '#1a2027',
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 600
              }
            }}
          />
        </ListItem>

        <ListItem
          button
          component={Link}
          to="/login"
          sx={{
            py: 1.5,
            mt: 1,
            backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            '&:hover': {
              backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
            }
          }}
        >
          <ListItemIcon sx={{ color: isDarkTheme ? '#90caf9' : '#1976d2', minWidth: 40 }}>
            <FaSignInAlt size={20} />
          </ListItemIcon>
          <ListItemText
            primary="Iniciar sesión"
            primaryTypographyProps={{
              sx: {
                color: isDarkTheme ? '#fff' : '#1a2027',
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 500
              }
            }}
          />
        </ListItem>
      </List>
    </Box>
  )

  return (
    <>
      <Box
        sx={{
          backgroundColor: isDarkTheme ? "#1E293B" : "#03427C", // Azul más oscuro para tema negro
          color: "#FFFFFF",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "12px 16px",
          fontSize: "0.875rem",
          flexWrap: "wrap",
          gap: { xs: 2, sm: 3 },
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
        }}
      >
        {/* 📍 Dirección */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FaMapMarkerAlt
            style={{
              color: isDarkTheme ? "#38BDF8" : "#4FD1C5"  // Azul más brillante para tema oscuro
            }}
            size={16}
          />
          <Typography
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              letterSpacing: "0.3px",
              fontWeight: 500,
              '&:hover': {
                color: isDarkTheme ? "#38BDF8" : "#4FD1C5",
                transition: "color 0.2s ease"
              }
            }}
          >
            Pino Suárez 390, Ixcatlán, Hgo.
          </Typography>
        </Box>

        <Box
          sx={{
            display: { xs: "none", sm: "block" },
            mx: 2,
            opacity: 0.4,
            color: isDarkTheme ? "#94A3B8" : "#FFFFFF"
          }}
        >
          |
        </Box>

        {/* ⏰ Horario */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FaClock
            style={{
              color: isDarkTheme ? "#38BDF8" : "#4FD1C5"
            }}
            size={14}
          />
          <Typography
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              letterSpacing: "0.2px",
              fontWeight: 500
            }}
          >
            Lun - Vie: 9:00 - 19:00
          </Typography>
        </Box>

        <Box
          sx={{
            display: { xs: "none", sm: "block" },
            mx: 2,
            opacity: 0.4,
            color: isDarkTheme ? "#94A3B8" : "#FFFFFF"
          }}
        >
          |
        </Box>

        {/* 📞 Teléfono */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FaPhoneAlt
            style={{
              color: isDarkTheme ? "#38BDF8" : "#4FD1C5"
            }}
            size={14}
          />
          <Typography
            component="a"
            href="tel:7713339456"
            sx={{
              textDecoration: "none",
              color: isDarkTheme ? "#38BDF8" : "#4FD1C5",
              fontWeight: "600",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              transition: "all 0.3s ease",
              "&:hover": {
                color: isDarkTheme ? "#7DD3FC" : "#B2F5EA",
                transform: "scale(1.03)"
              }
            }}
          >
            7713339456
          </Typography>
        </Box>
      </Box>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: isDarkTheme ? '#2A3A4A' : '#ffffff',
          boxShadow: isDarkTheme ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.05)',
          borderBottom: `1px solid ${isDarkTheme ? '#3A4A5A' : '#e8e8e8'}`,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            px: { xs: 2, md: 4 },
            minHeight: '64px',
            py: 0.5,
          }}
        >
          {/* Logo and company name with enhanced styling */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: isDarkTheme ? 'white' : '#333',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              padding: '8px',
              borderRadius: '8px',
              '&:hover': {
                color: isDarkTheme ? '#82B1FF' : '#0066cc',
                transform: 'scale(1.03)',
                backgroundColor: isDarkTheme ? 'rgba(130, 177, 255, 0.08)' : 'rgba(0, 102, 204, 0.05)',
              },
            }}
          >
            {logo && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '14px',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: isDarkTheme ? '#82B1FF' : '#0066cc',
                  overflow: 'hidden',
                  padding: '2px',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '50%',
                    background: isDarkTheme
                      ? 'linear-gradient(135deg, rgba(130, 177, 255, 0.5) 0%, transparent 50%)'
                      : 'linear-gradient(135deg, rgba(0, 102, 204, 0.3) 0%, transparent 50%)',
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                  },
                  '&:hover::after': {
                    opacity: 1,
                  },
                  boxShadow: isDarkTheme
                    ? '0 10px 20px rgba(130, 177, 255, 0.3), inset 0 0 10px rgba(130, 177, 255, 0.2)'
                    : '0 10px 20px rgba(0, 102, 204, 0.15), inset 0 0 10px rgba(0, 102, 204, 0.1)',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      boxShadow: isDarkTheme
                        ? '0 0 0 0 rgba(130, 177, 255, 0.5)'
                        : '0 0 0 0 rgba(0, 102, 204, 0.5)'
                    },
                    '70%': {
                      boxShadow: isDarkTheme
                        ? '0 0 0 8px rgba(130, 177, 255, 0)'
                        : '0 0 0 8px rgba(0, 102, 204, 0)'
                    },
                    '100%': {
                      boxShadow: isDarkTheme
                        ? '0 0 0 0 rgba(130, 177, 255, 0)'
                        : '0 0 0 0 rgba(0, 102, 204, 0)'
                    }
                  }
                }}
              >
                <img
                  src={logo.startsWith('data:image') ? logo : `data:image/png;base64,${logo}`}
                  alt="Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                  }}
                  onError={(e) => {
                    console.error("Error al cargar el logo:", e);
                    e.target.src = '';
                  }}
                />
              </Box>
            )}
            <Box
              sx={{
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Montserrat", "Roboto", sans-serif',
                  fontWeight: 700,
                  letterSpacing: '-0.25px',
                  display: { xs: 'none', sm: 'block' },
                  fontSize: { sm: '1.25rem', md: '1.5rem' },
                  background: isDarkTheme
                    ? 'linear-gradient(90deg, #FFFFFF 0%, #82B1FF 100%)'
                    : 'linear-gradient(90deg, #03427C 0%, #0066cc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginLeft: '4px',
                  position: 'relative',
                  paddingBottom: '2px',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '0%',
                    height: '2px',
                    background: isDarkTheme
                      ? 'linear-gradient(90deg, #FFFFFF 0%, #82B1FF 100%)'
                      : 'linear-gradient(90deg, #03427C 0%, #0066cc 100%)',
                    transition: 'width 0.4s ease',
                  },
                  '$:hover::after': {
                    width: '100%',
                  }
                }}
              >
                {companyName || 'Odontología'}
              </Typography>
            </Box>
          </Box>
          {/* Enlaces de navegación para pantallas grandes */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 2.5 // Reducido el espaciado entre elementos
            }}
          >
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography
                sx={{
                  color: isDarkTheme ? 'white' : '#333',
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  position: 'relative',
                  padding: '4px 0',
                  '&:hover': {
                    color: '#0066cc',
                  },
                  '&:hover:after': {
                    width: '100%',
                    opacity: 1,
                  },
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '0%',
                    height: '2px',
                    backgroundColor: '#0066cc',
                    transition: 'width 0.3s ease, opacity 0.3s ease',
                    opacity: 0,
                  }
                }}
              >
                Inicio
              </Typography>
            </Link>

            <Link to="/about" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography
                sx={{
                  color: isDarkTheme ? 'white' : '#333',
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  position: 'relative',
                  padding: '4px 0',
                  '&:hover': {
                    color: '#0066cc',
                  },
                  '&:hover:after': {
                    width: '100%',
                    opacity: 1,
                  },
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '0%',
                    height: '2px',
                    backgroundColor: '#0066cc',
                    transition: 'width 0.3s ease, opacity 0.3s ease',
                    opacity: 0,
                  }
                }}
              >
                Acerca de
              </Typography>
            </Link>

            <Link to="/Contact" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography
                sx={{
                  color: isDarkTheme ? 'white' : '#333',
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  position: 'relative',
                  padding: '4px 0',
                  '&:hover': {
                    color: '#0066cc',
                  },
                  '&:hover:after': {
                    width: '100%',
                    opacity: 1,
                  },
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '0%',
                    height: '2px',
                    backgroundColor: '#0066cc',
                    transition: 'width 0.3s ease, opacity 0.3s ease',
                    opacity: 0,
                  }
                }}
              >
                Contáctanos
              </Typography>
            </Link>

            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/agendar-cita"
              startIcon={<FaCalendarAlt />}
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 600,
                fontSize: '0.875rem',
                backgroundColor: '#03427C',
                backgroundImage: 'linear-gradient(135deg, #03427C 0%, #0066cc 100%)',
                borderRadius: '24px',
                padding: '6px 16px',
                boxShadow: '0 4px 8px rgba(3, 66, 124, 0.25)',
                height: '36px',
                ml: 1, // Margen izquierdo para separar de los enlaces
                '&:hover': {
                  backgroundImage: 'linear-gradient(135deg, #0052a3 0%, #0074e8 100%)',
                  boxShadow: '0 6px 12px rgba(3, 66, 124, 0.35)',
                  transform: 'translateY(-2px)',
                },
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-image 0.3s ease',
                textTransform: 'none',
              }}
            >
              Agenda una Cita
            </Button>

            <Button
              variant="outlined"
              component={Link}
              to="/login"
              startIcon={<FaSignInAlt />}
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: isDarkTheme ? 'white' : '#03427C',
                borderColor: isDarkTheme ? 'rgba(255,255,255,0.5)' : '#03427C',
                borderWidth: '1px',
                borderRadius: '24px',
                padding: '6px 16px',
                height: '36px',
                ml: 1,
                '&:hover': {
                  backgroundColor: isDarkTheme
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(3,66,124,0.05)',
                  borderColor: isDarkTheme ? 'white' : '#0066cc',
                  transform: 'translateY(-2px)',
                },
                transition: 'transform 0.2s ease, background-color 0.3s ease, border-color 0.3s ease',
                textTransform: 'none',
              }}
            >
              Iniciar sesión
            </Button>

            {/* Botón de Cambio de Tema Mejorado */}
            <IconButton
              onClick={toggleTheme}
              color="inherit"
              sx={{
                color: isDarkTheme ? '#FFC107' : '#5E35B1',
                backgroundColor: isDarkTheme ? 'rgba(255, 193, 7, 0.1)' : 'rgba(94, 53, 177, 0.05)',
                borderRadius: '50%',
                padding: '8px',
                ml: 1,
                width: '36px',
                height: '36px',
                transition: 'background-color 0.3s ease',
                '&:hover': {
                  backgroundColor: isDarkTheme ? 'rgba(255, 193, 7, 0.2)' : 'rgba(94, 53, 177, 0.1)',
                }
              }}
            >
              <motion.div
                animate={{ rotate: isDarkTheme ? 180 : 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                {isDarkTheme ? (
                  <WbSunnyRounded sx={{ fontSize: '20px' }} />
                ) : (
                  <NightsStayRounded sx={{ fontSize: '20px' }} />
                )}
              </motion.div>
            </IconButton>
          </Box>

          {/* Menú en pantallas pequeñas */}
          <IconButton
            edge="end"
            sx={{
              display: { xs: 'block', md: 'none' },
              color: isDarkTheme ? 'white' : '#03427C',
              backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(3,66,124,0.05)',
              borderRadius: '12px',
              padding: '6px',
              '&:hover': {
                backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(3,66,124,0.1)',
              },
            }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {/* Drawer para el menú en pantallas pequeñas */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerList}
      </Drawer>
    </>
  );
};

export default memo(BarraNav);
