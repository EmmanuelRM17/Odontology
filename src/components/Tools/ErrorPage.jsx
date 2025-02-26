import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  useTheme,
  SvgIcon
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Refresh, Home } from "@mui/icons-material";
import { useThemeContext } from '../../components/Tools/ThemeContext';

// Dental Tooth Icon component
// Dental Tooth Icon component
const ToothIcon = (props) => {
  const { isDarkTheme } = useThemeContext();

  return (
    <SvgIcon
      {...props}
      viewBox="0 0 512 512"
      sx={{
        width: '120px',
        height: '120px',
        fill: isDarkTheme ? '#000' : '#000', // Cambia dinámicamente según el tema
        transition: 'fill 0.3s ease', // Suaviza la transición de color
      }}
    >
      <path d="M256 0c-62.4 0-115.4 21.9-157.6 64C56.2 106.1 34.3 159.1 34.3 221.5c0 35.2 5.3 66.8 15.8 94.9 10.5 28.1 23.8 52.5 39.7 73.2 15.9 20.7 32.2 39.5 48.9 56.3 16.7 16.8 31.8 33.5 45.3 50 13.5 16.5 24 34.4 31.5 53.6 2.9 7.5 6.5 11.2 10.7 11.2 4.2 0 7.7-3.7 10.7-11.2 7.5-19.2 18-37 31.5-53.6 13.5-16.5 28.6-33.2 45.3-50 16.7-16.8 33-35.6 48.9-56.3 15.9-20.7 29.2-45.1 39.7-73.2 10.5-28.1 15.8-59.7 15.8-94.9 0-62.4-21.9-115.4-64-157.6C371.4 21.9 318.4 0 256 0zm0 384c-44.2 0-81.6-15.6-112.2-46.2C113.2 307.2 97.6 269.8 97.6 225.6c0-44.2 15.6-81.6 46.2-112.2C174.4 82.8 211.8 67.2 256 67.2c44.2 0 81.6 15.6 112.2 46.2 30.6 30.6 46.2 68 46.2 112.2 0 44.2-15.6 81.6-46.2 112.2C337.6 368.4 300.2 384 256 384z" />
    </SvgIcon>
  );
};

const errorTypes = {
  400: {
    title: 'Bad Request',
    description: 'Lo sentimos, la solicitud no pudo ser procesada.',
    color: '#FF9800' // Naranja para advertencias de formato
  },
  401: {
    title: 'No Autorizado',
    description: 'No tienes permiso para acceder a esta página.',
    color: '#E91E63' // Rosa/Rojo para errores de autorización
  },
  403: {
    title: 'Acceso Prohibido',
    description: 'No tienes los permisos necesarios para acceder a este recurso.',
    color: '#F44336' // Rojo para prohibiciones
  },
  404: {
    title: 'Página No Encontrada',
    description: 'La página que buscas no existe o ha sido movida.',
    color: '#3F51B5' // Índigo para errores de navegación
  },
  500: {
    title: 'Error del Servidor',
    description: 'Ocurrió un error interno en el servidor. Por favor, inténtalo más tarde.',
    color: '#795548' // Marrón para errores del servidor
  },
  502: {
    title: 'Error de Conexión',
    description: 'No se pudo establecer conexión con el servidor. La página se actualizará automáticamente cuando se restablezca la conexión.',
    color: '#F44336' // Usando rojo para indicar un problema crítico de conexión
  }
};

const ErrorPage = () => {
  const theme = useTheme();
  const { isDarkTheme } = useThemeContext();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const errorCode = !isOnline ? 502 : location.state?.errorCode || 404;
  const errorMessage = location.state?.errorMessage || errorTypes[errorCode].description;
  const errorInfo = errorTypes[errorCode] || errorTypes[404];
  useEffect(() => {
    const handleOnline = () => window.location.reload();
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const numberVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    initial: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <Container maxWidth="md">
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
          elevation={3}
          sx={{
            p: 6,
            borderRadius: 4,
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background Tooth Icons */}
          <Box
            component={motion.div}
            variants={iconVariants}
            initial="initial"
            animate="animate"
            sx={{
              position: 'absolute',
              top: -60,
              right: -60,
              opacity: isDarkTheme ? 0.2 : 0.1, // Más opaco en tema oscuro
              color: isDarkTheme ? '#FFFFFF' : '#B0B0B0' // Blanco en oscuro, gris en claro
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
              opacity: isDarkTheme ? 0.2 : 0.1,
              transform: 'rotate(180deg)',
              color: isDarkTheme ? '#FFFFFF' : '#B0B0B0'
            }}
          >
            <ToothIcon />
          </Box>

          {/* Error Content */}
          <motion.div variants={numberVariants}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '6rem', sm: '8rem', md: '10rem' },
                fontWeight: 900,
                color: errorInfo.color,
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                mb: 2
              }}
            >
              {errorCode}
            </Typography>
          </motion.div>

          <Typography
            variant="h4"
            sx={{
              mb: 1,
              color: isDarkTheme ? '#000000' : '#B0B0B0', // Color claro para el tema oscuro y azul para el tema claro
              fontWeight: 700
            }}
          >
            {errorInfo.title}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: isDarkTheme ? '#000000' : '#B0B0B0', // Color claro para el tema oscuro y azul para el tema claro
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            {errorMessage || errorInfo.description}
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            {errorCode === 502 ? (
              <Button
                variant="contained"
                onClick={() => window.location.reload()}
                sx={{
                  bgcolor: errorInfo.color,
                  color: "white",
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  fontSize: "1.5rem",
                  transition: "all 0.3s ease",
                  "&:hover": { filter: "brightness(90%)", transform: "scale(1.05)" },
                  minWidth: "60px", // Asegurar que el botón no sea muy pequeño
                }}
              >
                <Refresh fontSize="large" />
              </Button>
            ) : (
              <Button
                component={Link}
                to="/"
                variant="contained"
                sx={{
                  bgcolor: errorInfo.color,
                  color: "white",
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  fontSize: "1.5rem",
                  transition: "all 0.3s ease",
                  "&:hover": { filter: "brightness(90%)", transform: "scale(1.05)" },
                  minWidth: "60px",
                }}
              >
                <Home fontSize="large" />
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ErrorPage;