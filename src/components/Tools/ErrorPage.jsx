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
  Divider,
  useMediaQuery
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

// Componente de icono dental personalizado
const ToothIcon = (props) => {
  const { isDarkTheme } = useThemeContext();
  
  return (
    <SvgIcon
      {...props}
      viewBox="0 0 512 512"
      sx={{
        width: props.size || '100px',
        height: props.size || '100px',
        fill: props.color || (isDarkTheme ? '#ffffff' : '#000000'),
        opacity: props.opacity || 1,
        filter: props.shadow ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' : 'none',
        transition: 'all 0.5s ease',
        ...props.sx
      }}
    >
      <path d="M256 0c-62.4 0-115.4 21.9-157.6 64C56.2 106.1 34.3 159.1 34.3 221.5c0 35.2 5.3 66.8 15.8 94.9 10.5 28.1 23.8 52.5 39.7 73.2 15.9 20.7 32.2 39.5 48.9 56.3 16.7 16.8 31.8 33.5 45.3 50 13.5 16.5 24 34.4 31.5 53.6 2.9 7.5 6.5 11.2 10.7 11.2 4.2 0 7.7-3.7 10.7-11.2 7.5-19.2 18-37 31.5-53.6 13.5-16.5 28.6-33.2 45.3-50 16.7-16.8 33-35.6 48.9-56.3 15.9-20.7 29.2-45.1 39.7-73.2 10.5-28.1 15.8-59.7 15.8-94.9 0-62.4-21.9-115.4-64-157.6C371.4 21.9 318.4 0 256 0zm0 384c-44.2 0-81.6-15.6-112.2-46.2C113.2 307.2 97.6 269.8 97.6 225.6c0-44.2 15.6-81.6 46.2-112.2C174.4 82.8 211.8 67.2 256 67.2c44.2 0 81.6 15.6 112.2 46.2 30.6 30.6 46.2 68 46.2 112.2 0 44.2-15.6 81.6-46.2 112.2C337.6 368.4 300.2 384 256 384z" />
    </SvgIcon>
  );
};

// Configuración de tipos de error con estilos y acciones
const errorTypes = {
  400: {
    title: 'Bad Request',
    description: 'Lo sentimos, la solicitud no pudo ser procesada correctamente.',
    color: '#FF9800',
    icon: <ReportProblem />,
    gradient: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
    actions: [
      { label: 'Reintentar', icon: <Refresh />, to: window.location.pathname, primary: true },
      { label: 'Volver', icon: <ArrowBack />, to: '/', primary: false }
    ]
  },
  401: {
    title: 'No Autorizado',
    description: 'No tienes permiso para acceder a esta página. Inicia sesión para continuar.',
    color: '#E91E63',
    icon: <Security />,
    gradient: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
    actions: [
      { label: 'Iniciar Sesión', icon: <Security />, to: '/login', primary: true },
      { label: 'Inicio', icon: <Home />, to: '/', primary: false }
    ]
  },
  403: {
    title: 'Acceso Prohibido',
    description: 'No tienes los permisos necesarios para acceder a este recurso.',
    color: '#F44336',
    icon: <NotInterested />,
    gradient: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
    actions: [
      { label: 'Solicitar Acceso', icon: <ContactSupport />, to: '/Contact', primary: true },
      { label: 'Inicio', icon: <Home />, to: '/', primary: false }
    ]
  },
  404: {
    title: 'Página No Encontrada',
    description: 'La página que buscas no existe o ha sido movida.',
    color: '#3F51B5',
    icon: <Help />,
    gradient: 'linear-gradient(135deg, #3F51B5 0%, #2196F3 100%)',
    actions: [
      { label: 'Ir a Inicio', icon: <Home />, to: '/', primary: true },
      { label: 'Ayuda', icon: <ContactSupport />, to: '/help', primary: false }
    ]
  },
  500: {
    title: 'Error del Servidor',
    description: 'Ocurrió un error interno en el servidor. Por favor, inténtalo más tarde.',
    color: '#795548',
    icon: <BugReport />,
    gradient: 'linear-gradient(135deg, #795548 0%, #5D4037 100%)',
    actions: [
      { label: 'Reintentar', icon: <Refresh />, to: window.location.pathname, primary: true },
      { label: 'Reportar Error', icon: <BugReport />, to: '/Contact', primary: false },
      { label: 'Inicio', icon: <Home />, to: '/', primary: false }
    ]
  },
  502: {
    title: 'Error de Conexión',
    description: 'No se pudo establecer conexión con el servidor. La página se actualizará automáticamente cuando se restablezca la conexión.',
    color: '#F44336',
    icon: <WifiOff />,
    gradient: 'linear-gradient(135deg, #F44336 0%, #B71C1C 100%)',
    actions: [
      { label: 'Reintentar', icon: <Refresh />, onClick: () => window.location.reload(), primary: true }
    ]
  }
};

// Función principal para manejo de errores y estados
const ErrorPage = () => {
  const theme = useTheme();
  const { isDarkTheme } = useThemeContext();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Determinar el código de error actual
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

  // Animación para elementos principales
  const mainContainerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren", 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        damping: 30,
        stiffness: 400
      }
    }
  };

  const codeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        damping: 20,
        stiffness: 300,
        delay: 0.2 
      }
    }
  };

  const floatVariants = {
    initial: { y: 0 },
    animate: { 
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: isDarkTheme 
          ? 'radial-gradient(circle at 30% 100%, rgba(30, 144, 255, 0.08), transparent 25%), radial-gradient(circle at 80% 20%, rgba(138, 43, 226, 0.08), transparent 25%)'
          : 'radial-gradient(circle at 30% 100%, rgba(30, 144, 255, 0.05), transparent 25%), radial-gradient(circle at 80% 20%, rgba(138, 43, 226, 0.05), transparent 25%)',
        background: isDarkTheme ? '#121212' : '#f8f9fa',
        transition: 'background 0.3s ease'
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={mainContainerVariants}
        >
          <Paper
            elevation={isDarkTheme ? 0 : 3}
            sx={{
              overflow: 'hidden',
              borderRadius: { xs: 3, md: 4 },
              backgroundColor: isDarkTheme ? 'rgba(30, 30, 34, 0.7)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: isDarkTheme ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
              boxShadow: isDarkTheme 
                ? '0 10px 40px -10px rgba(0, 0, 0, 0.3)' 
                : '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              py: { xs: 4, md: 6 },
              px: { xs: 3, md: 5 }
            }}
          >
            {/* Elementos decorativos */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 }}>
              {/* Círculos decorativos */}
              <Box
                sx={{
                  position: 'absolute',
                  width: '300px',
                  height: '300px',
                  borderRadius: '50%',
                  background: errorInfo.gradient,
                  top: '-200px',
                  right: '-100px',
                  opacity: 0.05,
                  filter: 'blur(40px)'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: isDarkTheme ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  bottom: '-100px',
                  left: '-50px',
                  filter: 'blur(40px)'
                }}
              />
              
              {/* Iconos decorativos */}
              <Box
                component={motion.div}
                variants={floatVariants}
                initial="initial"
                animate="animate"
                sx={{
                  position: 'absolute',
                  top: '10%',
                  right: '5%',
                  opacity: 0.07
                }}
              >
                <ToothIcon size="60px" color={errorInfo.color} />
              </Box>
              
              <Box
                component={motion.div}
                variants={floatVariants}
                initial="initial"
                animate="animate"
                sx={{
                  position: 'absolute',
                  bottom: '10%',
                  left: '5%',
                  opacity: 0.07
                }}
              >
                <ToothIcon size="80px" color={errorInfo.color} />
              </Box>
            </Box>

            {/* Contenido principal */}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Grid container spacing={4} alignItems="center">
                {/* Código de error */}
                <Grid item xs={12} md={5} sx={{ 
                  order: { xs: 1, md: 1 },
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Box sx={{ position: 'relative', textAlign: 'center' }}>
                    <motion.div variants={codeVariants}>
                      {/* Badge de error type */}
                      <Chip
                        size="small"
                        icon={React.cloneElement(errorInfo.icon, { 
                          style: { fontSize: 16, color: '#fff' } 
                        })}
                        label={`Error ${errorCode}`}
                        sx={{
                          background: errorInfo.gradient,
                          color: 'white',
                          fontWeight: 500,
                          position: 'absolute',
                          top: '-20px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          py: 0.5,
                          boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                          border: '2px solid',
                          borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
                          '& .MuiChip-icon': {
                            color: 'white'
                          }
                        }}
                      />
                      
                      {/* Código de error */}
                      <Typography
                        variant="h1"
                        sx={{
                          fontSize: { xs: '6rem', sm: '7rem', md: '8rem' },
                          fontWeight: 700,
                          lineHeight: 0.8,
                          background: errorInfo.gradient,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          textShadow: isDarkTheme ? '0 5px 10px rgba(0,0,0,0.5)' : '0 5px 10px rgba(0,0,0,0.1)',
                          mb: 1,
                          mt: 2,
                          letterSpacing: '-0.05em'
                        }}
                      >
                        {errorCode}
                      </Typography>
                      
                      {/* Iluminación bajo el número */}
                      <Box
                        sx={{
                          width: '150px',
                          height: '25px',
                          borderRadius: '50%',
                          background: errorInfo.gradient,
                          position: 'absolute',
                          bottom: '-10px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          filter: 'blur(20px)',
                          opacity: 0.4
                        }}
                      />
                    </motion.div>
                  </Box>
                </Grid>

                {/* Texto y acciones */}
                <Grid item xs={12} md={7} sx={{ 
                  order: { xs: 2, md: 2 }, 
                  textAlign: { xs: 'center', md: 'left' }
                }}>
                  <Box>
                    <motion.div variants={itemVariants}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          mb: 2,
                          color: isDarkTheme ? '#fff' : theme.palette.text.primary,
                          letterSpacing: '-0.01em'
                        }}
                      >
                        {errorInfo.title}
                      </Typography>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Typography
                        variant="body1"
                        sx={{
                          mb: 4,
                          color: isDarkTheme ? 'rgba(255,255,255,0.7)' : theme.palette.text.secondary,
                          fontSize: '1.1rem',
                          lineHeight: 1.5,
                          maxWidth: { xs: '100%', md: '450px' },
                          mx: { xs: 'auto', md: 0 }
                        }}
                      >
                        {errorMessage || errorInfo.description}
                      </Typography>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Divider 
                        sx={{ 
                          mb: 3, 
                          opacity: 0.08,
                          maxWidth: { xs: '100%', md: '450px' }
                        }} 
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          flexWrap: 'wrap',
                          gap: 2,
                          justifyContent: { xs: 'center', md: 'flex-start' }
                        }}
                      >
                        {errorInfo.actions.map((action, index) => (
                          <Button
                            key={index}
                            component={action.to ? Link : 'button'}
                            to={action.to}
                            onClick={() => handleButtonClick(action)}
                            variant={action.primary ? 'contained' : 'outlined'}
                            color="primary"
                            startIcon={action.icon}
                            size={isMobile ? 'medium' : 'large'}
                            disableElevation={!action.primary}
                            sx={{
                              borderRadius: '10px',
                              background: action.primary ? errorInfo.gradient : 'transparent',
                              color: action.primary ? '#fff' : errorInfo.color,
                              borderColor: action.primary ? 'transparent' : errorInfo.color,
                              fontWeight: 500,
                              px: { xs: 2, md: 3 },
                              py: { xs: 1, md: 1.2 },
                              boxShadow: action.primary ? '0 4px 15px rgba(0,0,0,0.1)' : 'none',
                              textTransform: 'none',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: action.primary ? errorInfo.gradient : `${errorInfo.color}15`,
                                borderColor: action.primary ? 'transparent' : errorInfo.color,
                                transform: 'translateY(-2px)',
                                boxShadow: action.primary ? '0 6px 20px rgba(0,0,0,0.15)' : '0 6px 20px rgba(0,0,0,0.05)'
                              }
                            }}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </Box>
                    </motion.div>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </motion.div>
      </Container>

      {/* Overlay de carga */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: theme.zIndex.drawer + 1,
          backdropFilter: 'blur(8px)',
          flexDirection: 'column',
          gap: 2
        }}
        open={isLoading}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CircularProgress 
            size={60}
            thickness={4}
            sx={{ 
              color: '#fff',
              boxShadow: '0 0 20px rgba(255,255,255,0.3)'
            }} 
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Typography variant="h6">{loadingMessage}</Typography>
        </motion.div>
      </Backdrop>
    </Box>
  );
};

export default ErrorPage;