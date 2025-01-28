import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import BarraNav from './barraNav';
import PieDePagina from './Footer';

const LayoutConEncabezado = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detectar el tema del sistema
  useEffect(() => {
    const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(matchDarkTheme.matches);

    const handleThemeChange = (e) => {
      setIsDarkMode(e.matches);
    };

    matchDarkTheme.addEventListener('change', handleThemeChange);

    return () => {
      matchDarkTheme.removeEventListener('change', handleThemeChange);
    };
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh', // Asegura que ocupe toda la altura de la pantalla
      }}
    >
      <Box component="header">
        <BarraNav />
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1, // Hace que el main ocupe todo el espacio disponible
          p: 3, // Espaciado alrededor del contenido
          backgroundColor: isDarkMode ? '#1d2a38' : '#ffffff', // Cambia el color del padding según el tema
        }}
      >
        {children}
      </Box>

      <Box
        component="footer"
        sx={{
          backgroundColor: isDarkMode ? '#0d1b2a' : '#03427C', // Cambia el color del footer según el tema
          color: '#ffffff',
          p: 2, // Padding para el footer
          textAlign: 'center',
        }}
      >
        <PieDePagina />
      </Box>
    </Box>
  );
};

export default LayoutConEncabezado;
