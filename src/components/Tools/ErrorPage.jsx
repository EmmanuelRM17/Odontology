import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  useTheme,
  SvgIcon,
  Grid,
  Chip,
  Backdrop,
  CircularProgress,
  Divider
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Refresh, 
  Home, 
  ReportProblem, 
  BugReport, 
  Security, 
  NotInterested,
  WifiOff,
  Help,
  ContactSupport,
  ArrowBack
} from "@mui/icons-material";
import { useThemeContext } from '../../components/Tools/ThemeContext';

/**
 * Componente ErrorPage - Página de error responsiva y estilizada
 * 
 * Características:
 * - Diferentes estilos y acciones según el código de error
 * - Animaciones de entrada y elementos animados
 * - Compatibilidad con temas claro/oscuro
 * - Manejo automático de estados online/offline
 * - Iconografía contextual según el tipo de error
 */

// Componente de icono dental personalizado
const ToothIcon = (props) => {
  const { isDarkTheme } = useThemeContext();

  return (
    <SvgIcon
      {...props}
      viewBox="0 0 512 512"
      sx={{
        width: '120px',
        height: '120px',
        fill: isDarkTheme ? '#ffffff' : '#000000',
        transition: 'fill 0.3s ease',
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
        ...props.sx
      }}
    >
      <path d="M256 0c-62.4 0-115.4 21.9-157.6 64C56.2 106.1 34.3 159.1 34.3 221.5c0 35.2 5.3 66.8 15.8 94.9 10.5 28.1 23.8 52.5 39.7 73.2 15.9 20.7 32.2 39.5 48.9 56.3 16.7 16.8 31.8 33.5 45.3 50 13.5 16.5 24 34.4 31.5 53.6 2.9 7.5 6.5 11.2 10.7 11.2 4.2 0 7.7-3.7 10.7-11.2 7.5-19.2 18-37 31.5-53.6 13.5-16.5 28.6-33.2 45.3-50 16.7-16.8 33-35.6 48.9-56.3 15.9-20.7 29.2-45.1 39.7-73.2 10.5-28.1 15.8-59.7 15.8-94.9 0-62.4-21.9-115.4-64-157.6C371.4 21.9 318.4 0 256 0zm0 384c-44.2 0-81.6-15.6-112.2-46.2C113.2 307.2 97.6 269.8 97.6 225.6c0-44.2 15.6-81.6 46.2-112.2C174.4 82.8 211.8 67.2 256 67.2c44.2 0 81.6 15.6 112.2 46.2 30.6 30.6 46.2 68 46.2 112.2 0 44.2-15.6 81.6-46.2 112.2C337.6 368.4 300.2 384 256 384z" />
    </SvgIcon>
  );
};

// Configuración de tipos de error con estilos y acciones personalizadas
const errorTypes = {
  400: {
    title: 'Bad Request',
    description: 'Lo sentimos, la solicitud no pudo ser procesada correctamente.',
    color: '#FF9800', // Naranja
    icon: <ReportProblem fontSize="large" />,
    gradient: 'linear-gradient(45deg, #FF9800, #FFC107)',
    actions: [
      { label: 'Reintentar', icon: <Refresh />, to: window.location.pathname, primary: true },
      { label: 'Volver', icon: <ArrowBack />, to: '/', primary: false }
    ]
  },
  401: {
    title: 'No Autorizado',
    description: 'No tienes permiso para acceder a esta página. Inicia sesión para continuar.',
    color: '#E91E63', // Rosa
    icon: <Security fontSize="large" />,
    gradient: 'linear-gradient(45deg, #E91E63, #F48FB1)',
    actions: [
      { label: 'Iniciar Sesión', icon: <Security />, to: '/login', primary: true },
      { label: 'Inicio', icon: <Home />, to: '/', primary: false }
    ]
  },
  403: {
    title: 'Acceso Prohibido',
    description: 'No tienes los permisos necesarios para acceder a este recurso.',
    color: '#F44336', // Rojo
    icon: <NotInterested fontSize="large" />,
    gradient: 'linear-gradient(45deg, #F44336, #FF5252)',
    actions: [
      { label: 'Solicitar Acceso', icon: <ContactSupport />, to: '/Contact', primary: true },
      { label: 'Inicio', icon: <Home />, to: '/', primary: false }
    ]
  },
  404: {
    title: 'Página No Encontrada',
    description: 'La página que buscas no existe o ha sido movida.',
    color: '#3F51B5', // Índigo
    icon: <Help fontSize="large" />,
    gradient: 'linear-gradient(45deg, #3F51B5, #7986CB)',
    actions: [
      { label: 'Ir a Inicio', icon: <Home />, to: '/', primary: true },
      { label: 'Ayuda', icon: <ContactSupport />, to: '/help', primary: false }
    ]
  },
  500: {
    title: 'Error del Servidor',
    description: 'Ocurrió un error interno en el servidor. Por favor, inténtalo más tarde.',
    color: '#795548', // Marrón
    icon: <BugReport fontSize="large" />,
    gradient: 'linear-gradient(45deg, #795548, #A1887F)',
    actions: [
      { label: 'Reintentar', icon: <Refresh />, to: window.location.pathname, primary: true },
      { label: 'Reportar Error', icon: <BugReport />, to: '/Contact', primary: false },
      { label: 'Inicio', icon: <Home />, to: '/', primary: false }
    ]
  },
  502: {
    title: 'Error de Conexión',
    description: 'No se pudo establecer conexión con el servidor. La página se actualizará automáticamente cuando se restablezca la conexión.',
    color: '#F44336', // Rojo
    icon: <WifiOff fontSize="large" />,
    gradient: 'linear-gradient(45deg, #F44336, #D32F2F)',
    actions: [
      { label: 'Reintentar', icon: <Refresh />, onClick: () => window.location.reload(), primary: true }
    ]
  }
};

const ErrorPage = () => {
  const theme = useTheme();
  const { isDarkTheme } = useThemeContext();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Determinar el código de error y la información relacionada
  const errorCode = !isOnline ? 502 : location.state?.errorCode || 404;
  const errorMessage = location.state?.errorMessage || errorTypes[errorCode].description;
  const errorInfo = errorTypes[errorCode] || errorTypes[404];
  
  // Monitoreo de estado de conexión
  useEffect(() => {
    const handleOnline = () => {
      setLoadingMessage('Reconectando...');
      setIsLoading(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Variantes de animación principal del contenedor
  const containerVariants = {
    initial: { opacity: 0, y: 40 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] // CustomEaseOut
      }
    }
  };

  // Variantes de animación para el código de error
  const numberVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.2
      }
    }
  };

  // Variantes de animación para el icono decorativo
  const iconVariants = {
    initial: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: {
        duration: 40,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  // Variantes para los botones con stagger effect
  const buttonsVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.6
      }
    }
  };

  const buttonVariant = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  const handleButtonClick = (action) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.to && action.to !== window.location.pathname) {
      setLoadingMessage('Redirigiendo...');
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }
  };

  // Determinar el esquema de colores según el tema
  const getBackgroundColor = () => {
    return isDarkTheme 
      ? 'rgba(30, 30, 40, 0.9)' 
      : 'rgba(255, 255, 255, 0.9)';
  };

  const getTextColor = () => {
    return isDarkTheme 
      ? '#FFFFFF' 
      : theme.palette.text.primary;
  };

  const getSecondaryTextColor = () => {
    return isDarkTheme 
      ? 'rgba(255, 255, 255, 0.7)' 
      : theme.palette.text.secondary;
  };

  return (
    <Container maxWidth="lg">
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          background: theme.palette.background.default
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 4,
            textAlign: 'center',
            backgroundColor: getBackgroundColor(),
            backdropFilter: 'blur(15px)',
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            maxWidth: '700px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            border: isDarkTheme ? '1px solid rgba(255,255,255,0.1)' : 'none'
          }}
        >
          {/* Elementos decorativos de fondo */}
          <Box
            component={motion.div}
            variants={iconVariants}
            initial="initial"
            animate="animate"
            sx={{
              position: 'absolute',
              top: -60,
              right: -60,
              opacity: 0.07,
              color: errorInfo.color,
              transform: 'scale(1.2)'
            }}
          >
            <ToothIcon />
          </Box>
          
          <Box
            component={motion.div}
            variants={iconVariants}
            initial="initial"
            animate="animate"
            sx={{
              position: 'absolute',
              bottom: -60,
              left: -60,
              opacity: 0.07,
              color: errorInfo.color,
              transform: 'scale(1.2) rotate(180deg)'
            }}
          >
            <ToothIcon />
          </Box>

          {/* Indicador de tipo de error */}
          <Chip 
            icon={errorInfo.icon} 
            label={`Error ${errorCode}`}
            variant="filled"
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: errorInfo.gradient,
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              '& .MuiChip-icon': {
                color: 'white'
              }
            }}
          />

          {/* Contenido del error */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Box sx={{ position: 'relative' }}>
                <motion.div 
                  variants={numberVariants}
                  sx={{
                    position: 'relative',
                    zIndex: 2
                  }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '6rem', sm: '8rem', md: '8rem' },
                      fontWeight: 900,
                      background: errorInfo.gradient,
                      backgroundClip: 'text',
                      textFillColor: 'transparent',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 10px 20px rgba(0,0,0,0.15)',
                      lineHeight: 1,
                      mb: 2,
                      position: 'relative'
                    }}
                  >
                    {errorCode}
                  </Typography>
                </motion.div>
                <Box
                  component={motion.div}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    transition: { delay: 0.3, duration: 0.8 }
                  }}
                  sx={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: errorInfo.gradient,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1,
                    opacity: 0.2,
                    filter: 'blur(30px)'
                  }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={7} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 0.4, duration: 0.6 }
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    mb: 1,
                    color: getTextColor(),
                    fontWeight: 700
                  }}
                >
                  {errorInfo.title}
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    color: getSecondaryTextColor(),
                    maxWidth: '500px',
                    mx: { xs: 'auto', md: 0 },
                    fontWeight: 'normal'
                  }}
                >
                  {errorMessage || errorInfo.description}
                </Typography>
              </motion.div>

              <Divider sx={{ 
                mb: 3, 
                opacity: 0.2,
                background: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' 
              }} />

              <Box 
                component={motion.div}
                variants={buttonsVariants}
                initial="initial"
                animate="animate"
                sx={{ 
                  display: "flex", 
                  justifyContent: { xs: "center", md: "flex-start" },
                  flexWrap: "wrap",
                  gap: 2
                }}
              >
                {errorInfo.actions.map((action, index) => (
                  <motion.div key={index} variants={buttonVariant}>
                    <Button
                      component={action.to ? Link : 'button'}
                      to={action.to}
                      onClick={() => handleButtonClick(action)}
                      variant={action.primary ? "contained" : "outlined"}
                      startIcon={action.icon}
                      size="large"
                      sx={{
                        bgcolor: action.primary ? errorInfo.color : 'transparent',
                        color: action.primary ? "white" : errorInfo.color,
                        borderColor: action.primary ? 'transparent' : errorInfo.color,
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        transition: "all 0.3s ease",
                        "&:hover": { 
                          bgcolor: action.primary ? errorInfo.color : `${errorInfo.color}22`,
                          transform: "translateY(-3px)",
                          boxShadow: action.primary ? '0 5px 15px rgba(0,0,0,0.2)' : 'none'
                        },
                      }}
                    >
                      {action.label}
                    </Button>
                  </motion.div>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Backdrop de carga para transiciones */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2
        }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6">{loadingMessage}</Typography>
      </Backdrop>
    </Container>
  );
};

export default ErrorPage;