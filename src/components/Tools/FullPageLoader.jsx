import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import { MedicalServices } from '@mui/icons-material';

// Animación para el círculo de carga
const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Animación para el brillo del diente
const pulse = keyframes`
  0% {
    filter: drop-shadow(0 0 3px rgba(0, 183, 255, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 6px rgba(0, 183, 255, 0.6));
  }
  100% {
    filter: drop-shadow(0 0 3px rgba(0, 183, 255, 0.3));
  }
`;

const FullPageLoader = ({ message = "Cargando..." }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        zIndex: 1300
      }}
    >
      {/* Contenedor principal del loader */}
      <Box
        sx={{
          position: 'relative',
          width: '120px',
          height: '120px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Círculo de carga exterior */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#00BCD4',
            borderBottomColor: '#00BCD4',
            animation: `${rotate} 1.5s linear infinite`,
          }}
        />

        {/* Círculo de carga interior */}
        <Box
          sx={{
            position: 'absolute',
            width: '80%',
            height: '80%',
            borderRadius: '50%',
            border: '3px solid transparent',
            borderLeftColor: '#2196F3',
            borderRightColor: '#2196F3',
            animation: `${rotate} 2s linear infinite reverse`,
          }}
        />

        {/* Icono del diente en el centro */}
        <Box
          sx={{
            width: '50px',
            height: '50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            zIndex: 2,
            animation: `${pulse} 2s infinite ease-in-out`,
          }}
        >
          <MedicalServices sx={{ fontSize: 30, color: '#00BCD4' }} />
        </Box>
      </Box>

      {/* Mensaje de carga */}
      <Typography
        variant="h6"
        sx={{
          mt: 4,
          color: '#0288D1',
          fontWeight: '500',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {message}
      </Typography>

      {/* Mensaje adicional */}
      <Typography
        variant="body2"
        sx={{
          mt: 1,
          color: '#546E7A',
          fontWeight: '400',
          opacity: 0.8
        }}
      >
        Preparando su experiencia dental
      </Typography>
    </Box>
  );
};

export default FullPageLoader;