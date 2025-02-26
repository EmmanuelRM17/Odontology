import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import BarraNav from './barraNav';
import PieDePagina from './Footer';
import { useThemeContext } from '../Tools/ThemeContext'; // Asegúrate de usar la ruta correcta

const LayoutConEncabezado = ({ children }) => {
  const { isDarkTheme  } = useThemeContext();

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
          p: .5, // Espaciado alrededor del contenido
          backgroundColor: isDarkTheme ? '#1d2a38' : '#ffffff', // Cambia el color del padding según el tema
        }}
      >
        {children}
      </Box>

      <Box
        component="footer"
        sx={{
          backgroundColor: isDarkTheme ? '#0D1B2A' : '#03427C',
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
