import React from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { SignalWifiOff } from '@mui/icons-material';
import { useThemeContext } from './ThemeContext';

// Banner offline responsivo con colores del proyecto
const OfflineBanner = ({ message = 'Sin conexión - Mostrando contenido cacheado' }) => {
  const { isDarkTheme } = useThemeContext();
  const isMobile = useMediaQuery('(max-width:600px)');

  const colors = {
    background: isDarkTheme ? '#945e01ff' : '#6516afff',
    text: '#FFFFFF',
    icon: '#FFFFFF',
    shadow: isDarkTheme 
      ? '0 4px 12px rgba(245, 158, 11, 0.3)' 
      : '0 4px 12px rgba(245, 158, 11, 0.2)'
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: colors.background,
        color: colors.text,
        padding: isMobile ? '10px 16px' : '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isMobile ? 1 : 1.5,
        zIndex: 9999,
        boxShadow: colors.shadow,
        borderBottom: `1px solid rgba(255,255,255,0.2)`
      }}
    >
      <SignalWifiOff 
        sx={{ 
          fontSize: isMobile ? '18px' : '20px',
          color: colors.icon 
        }} 
      />
      <Typography
        sx={{
          fontSize: isMobile ? '13px' : '14px',
          fontWeight: 500,
          letterSpacing: '0.3px'
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default OfflineBanner;