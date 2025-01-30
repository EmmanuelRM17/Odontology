import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Link, useLocation } from 'react-router-dom'; // Usamos useLocation para obtener el estado
import { motion } from 'framer-motion';

const errorTypes = {
  400: {
    title: 'Bad Request',
    description: 'Lo sentimos, la solicitud no pudo ser procesada.',
    color: '#FF9800'
  },
  401: {
    title: 'No Autorizado',
    description: 'No tienes permiso para acceder a esta página.',
    color: '#F44336'
  },
  403: {
    title: 'Acceso Prohibido',
    description: 'No tienes los permisos necesarios para acceder a este recurso.',
    color: '#E91E63'
  },
  404: {
    title: 'Página No Encontrada',
    description: 'La página que buscas no existe o ha sido movida.',
    color: '#2196F3'
  },
  500: {
    title: 'Error del Servidor',
    description: 'Ocurrió un error interno en el servidor. Por favor, inténtalo más tarde.',
    color: '#F44336'
  }
};

const ErrorPage = () => {
  const location = useLocation(); // Usamos useLocation para acceder al estado de la ruta
  const { errorCode = 404, errorMessage } = location.state || {}; // Usamos el estado de la ruta, si existe

  const errorInfo = errorTypes[errorCode] || errorTypes[404]; // Si no hay un errorCode válido, se usará el 404 por defecto
  
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

  const buttonVariants = {
    initial: { scale: 0.9 },
    animate: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
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
          py: 4
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
          <motion.div
            variants={numberVariants}
          >
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
              color: 'text.primary',
              fontWeight: 700
            }}
          >
            {errorInfo.title}
          </Typography>

          <Typography 
            variant="h6" 
            sx={{ 
              mb: 4,
              color: 'text.secondary',
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            {errorMessage || errorInfo.description}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              component={Link}
              to="/"
              variant="contained"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              sx={{
                bgcolor: errorInfo.color,
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: errorInfo.color,
                  filter: 'brightness(90%)'
                }
              }}
            >
              Volver al Inicio
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ErrorPage;
