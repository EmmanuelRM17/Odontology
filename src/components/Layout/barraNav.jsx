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
  Skeleton
} from '@mui/material';
import { FaSignInAlt, FaCalendarAlt } from 'react-icons/fa';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const LoadingNavBar = ({ isDarkTheme }) => (
  <AppBar
    position="static"
    sx={{
      backgroundColor: isDarkTheme ? '#2A3A4A' : '#f0f0f0',
      boxShadow: 'none',
      borderBottom: `1px solid ${isDarkTheme ? '#3A4A5A' : '#e0e0e0'}`,
    }}
  >
    <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width={200} sx={{ ml: 2, display: { xs: 'none', sm: 'block' } }} />
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
        <Skeleton variant="text" width={60} />
        <Skeleton variant="text" width={80} />
        <Skeleton variant="rectangular" width={140} height={36} />
        <Skeleton variant="rectangular" width={120} height={36} />
      </Box>
      <Skeleton 
        variant="circular" 
        width={40} 
        height={40} 
        sx={{ display: { xs: 'block', md: 'none' } }}
      />
    </Toolbar>
  </AppBar>
);

const BarraNav = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logo, setLogo] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  
  const navigate = useNavigate();

  const fetchTitleAndLogo = async (retries = 3) => {
    try {
      const response = await axios.get('https://back-end-4803.onrender.com/api/perfilEmpresa/getTitleAndLogo', {
        timeout: 5000, // ⏳ Tiempo máximo de espera (5 segundos)
      });
  
      const { nombre_empresa, logo } = response.data;
  
      if (nombre_empresa) {
        document.title = nombre_empresa;
        setCompanyName(nombre_empresa);
      }
  
      if (logo) {
        setLogo(`data:image/png;base64,${logo}`);
      }
  
      setLoading(false);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.warn("La petición fue cancelada:", error.message);
      } else if (error.code === 'ECONNABORTED') {
        console.error("⏳ Timeout: El servidor tardó demasiado en responder.");
      } else {
        console.error("Error al obtener logo y título:", error.message);
      }
  
      if (retries > 0) {
        await new Promise((res) => setTimeout(res, 1000));
        fetchTitleAndLogo(retries - 1);
      } else {
        setError("No se pudo cargar la configuración de la empresa.");
        setLoading(false);
      }
    }
  };
  
  // Detectar el tema del sistema
  useEffect(() => {
    setIsDarkTheme(false);

    const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');

    if (matchDarkTheme.matches) {
      setIsDarkTheme(true);
    }

    const handleThemeChange = (e) => {
      setIsDarkTheme(e.matches);
    };

    matchDarkTheme.addEventListener('change', handleThemeChange);

    fetchTitleAndLogo();

    return () => {
      matchDarkTheme.removeEventListener('change', handleThemeChange);
    };
  }, []);

  // Función para abrir/cerrar el Drawer
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  // Lista de enlaces en el Drawer
  const drawerList = (
    <Box
      sx={{
        width: '80vw',
        backgroundColor: isDarkTheme ? '#2A3A4A' : '#f0f0f0',
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
        borderBottom: `1px solid ${isDarkTheme ? '#3A4A5A' : '#e0e0e0'}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {logo && (
            <img
              src={logo}
              alt="Logo"
              style={{
                marginRight: '10px',
                width: '40px',
                height: '40px',
                borderRadius: '50%'
              }}
            />
          )}
          <Typography
            variant="h6"
            sx={{
              color: isDarkTheme ? 'white' : '#333',
              fontWeight: 600
            }}
          >
            {companyName || 'Odontología Carol'}
          </Typography>
        </Box>
        <IconButton onClick={toggleDrawer(false)}>
          <CloseIcon sx={{ color: isDarkTheme ? 'white' : '#333' }} />
        </IconButton>
      </Box>

      <List>
        <ListItem button component={Link} to="/">
          <ListItemText primary="Inicio" />
        </ListItem>
        <ListItem button component={Link} to="/about">
          <ListItemText primary="Acerca de" />
        </ListItem>
        <ListItem button component={Link} to="/agendar-cita">
          <ListItemText primary="Agenda una Cita" />
        </ListItem>
        <ListItem button component={Link} to="/login">
          <FaSignInAlt style={{ marginRight: '10px', fontSize: '1.5rem' }} />
          <ListItemText primary="Iniciar sesión" />
        </ListItem>
      </List>
    </Box>
  );

  if (loading) {
    return <LoadingNavBar isDarkTheme={isDarkTheme} />;
  }

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: isDarkTheme ? '#2A3A4A' : '#f0f0f0',
          boxShadow: 'none',
          borderBottom: `1px solid ${isDarkTheme ? '#3A4A5A' : '#e0e0e0'}`,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            px: { xs: 2, md: 4 }, // Añadir padding horizontal
          }}
        >
          {/* Logo y nombre de la empresa */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: isDarkTheme ? 'white' : '#333',
              '&:hover': {
                color: isDarkTheme ? '#82B1FF' : '#0066cc',
              },
            }}
          >
            {logo && (
              <img
                src={logo}
                alt="Logo"
                style={{
                  marginRight: '12px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                }}
              />
            )}
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Montserrat", "Roboto", sans-serif',
                fontWeight: 600,
                letterSpacing: '-0.5px',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {companyName || 'Odontología Carol'}
            </Typography>
          </Box>

          {/* Enlaces de navegación para pantallas grandes */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography
                sx={{
                  color: isDarkTheme ? 'white' : '#333',
                  fontFamily: '"Montserrat", sans-serif',
                  '&:hover': { color: '#0066cc' },
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
                  '&:hover': { color: '#0066cc' },
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
                  '&:hover': { color: '#0066cc' },
                }}
              >
                Contactanos
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
                backgroundColor: '#03427C',
                '&:hover': {
                  backgroundColor: '#0052a3',
                },
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
                color: isDarkTheme ? 'white' : '#03427C',
                borderColor: isDarkTheme ? 'white' : '#03427C',
                '&:hover': {
                  backgroundColor: isDarkTheme
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,102,204,0.1)',
                  borderColor: isDarkTheme ? 'white' : '#03427C',
                },
                textTransform: 'none',
              }}
            >
              Iniciar sesión
            </Button>
          </Box>

          {/* Menú en pantallas pequeñas */}
          <IconButton
            edge="end"
            sx={{
              display: { xs: 'block', md: 'none' },
              color: isDarkTheme ? 'white' : '#333',
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
