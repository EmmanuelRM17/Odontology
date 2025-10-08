import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import { LocalHospital } from '@mui/icons-material';

// Animación de los puntos
const blink = keyframes`
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
`;

// Pantalla de carga inicial de la aplicación
const LoadingScreen = ({ tituloPagina = "Cargando" }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#03427C',
        zIndex: 9999,
      }}
    >
      {/* Icono */}
      <LocalHospital
        sx={{
          fontSize: { xs: 80, sm: 100, md: 120 },
          color: '#fff',
          mb: 3,
        }}
      />

      {/* Título */}
      <Typography
        variant="h4"
        sx={{
          color: '#fff',
          fontWeight: 600,
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
          textAlign: 'center',
          mb: 2,
        }}
      >
        {tituloPagina}
      </Typography>

      {/* Tres puntos animados */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#fff',
              animation: `${blink} 1.4s infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default LoadingScreen;