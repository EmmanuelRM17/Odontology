import React, { useState, useEffect } from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { SignalWifiOff, Wifi } from '@mui/icons-material';
import { useThemeContext } from './ThemeContext';

// Banner offline automático y persistente
const OfflineBanner = () => {
  const { isDarkTheme } = useThemeContext();
  const isMobile = useMediaQuery('(max-width:600px)');
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('[Network] Conexión restaurada');
      setIsOnline(true);
      
      if (hasBeenOffline) {
        setShowReconnected(true);
        setTimeout(() => {
          setShowReconnected(false);
          setHasBeenOffline(false);
        }, 3000);
      }
    };

    const handleOffline = () => {
      console.log('[Network] Sin conexión');
      setIsOnline(false);
      setHasBeenOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasBeenOffline]);

  const offlineColors = {
    background: isDarkTheme ? '#945e01ff' : '#6516afff',
    text: '#FFFFFF',
    icon: '#FFFFFF',
    shadow: isDarkTheme 
      ? '0 4px 12px rgba(245, 158, 11, 0.3)' 
      : '0 4px 12px rgba(245, 158, 11, 0.2)'
  };

  const onlineColors = {
    background: isDarkTheme ? '#059669' : '#10b981',
    text: '#FFFFFF',
    icon: '#FFFFFF',
    shadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  };

  // No mostrar nada si está online y nunca estuvo offline
  if (isOnline && !showReconnected) {
    return null;
  }

  const colors = showReconnected ? onlineColors : offlineColors;
  const Icon = showReconnected ? Wifi : SignalWifiOff;
  const message = showReconnected 
    ? 'Conexión restaurada' 
    : 'Sin conexión - Mostrando contenido cacheado';

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
        borderBottom: `1px solid rgba(255,255,255,0.2)`,
        animation: 'slideDown 0.3s ease-out',
        '@keyframes slideDown': {
          from: {
            transform: 'translateY(-100%)',
            opacity: 0
          },
          to: {
            transform: 'translateY(0)',
            opacity: 1
          }
        }
      }}
    >
      <Icon 
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