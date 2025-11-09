import React, { useEffect, useCallback, memo } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CheckCircle, Error, Info, Warning } from '@mui/icons-material';
import { useThemeContext } from '../Tools/ThemeContext';

// Contenedor principal con responsividad mobile-first
const NotificationContainer = styled(Box)(({ isdarkmode }) => ({
  position: 'fixed',
  bottom: '16px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 2000,
  padding: '12px 16px',
  borderRadius: '8px',
  boxShadow: isdarkmode 
    ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
    : '0 4px 16px rgba(0, 0, 0, 0.1)',
  backgroundColor: isdarkmode ? '#2a2a2a' : '#ffffff',
  border: `1px solid ${isdarkmode ? '#3a3a3a' : '#e5e5e5'}`,
  minWidth: '280px',
  maxWidth: 'calc(100vw - 32px)',
  width: '90%',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  
  '@keyframes slideUp': {
    '0%': {
      opacity: 0,
      transform: 'translate(-50%, 20px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translate(-50%, 0)',
    }
  },
  
  '@keyframes slideDown': {
    '0%': {
      opacity: 1,
      transform: 'translate(-50%, 0)',
    },
    '100%': {
      opacity: 0,
      transform: 'translate(-50%, 20px)',
    }
  },
  
  '&.entering': {
    animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
  },
  
  '&.exiting': {
    animation: 'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
  },
  
  '@media (min-width: 480px)': {
    bottom: '24px',
    padding: '14px 18px',
    minWidth: '320px',
    width: 'auto',
  },
  
  '@media (min-width: 768px)': {
    bottom: '30px',
    padding: '16px 20px',
    minWidth: '380px',
    maxWidth: '500px',
  },
}));

// Icono optimizado para mobile
const IconContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  
  '& .MuiSvgIcon-root': {
    fontSize: '24px',
  },
  
  '@media (min-width: 768px)': {
    '& .MuiSvgIcon-root': {
      fontSize: '28px',
    },
  },
});

// Botón de cerrar con área táctil amplia
const CloseButton = styled('button')(({ isdarkmode }) => ({
  position: 'absolute',
  top: '8px',
  right: '8px',
  minWidth: '32px',
  minHeight: '32px',
  width: '32px',
  height: '32px',
  padding: 0,
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  opacity: 0.5,
  transition: 'opacity 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  
  '&:hover': {
    opacity: 0.8,
    backgroundColor: isdarkmode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  
  '&:active': {
    opacity: 1,
    backgroundColor: isdarkmode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    width: '14px',
    height: '2px',
    backgroundColor: isdarkmode ? '#e0e0e0' : '#666',
    borderRadius: '1px',
  },
  
  '&::before': {
    transform: 'rotate(45deg)',
  },
  
  '&::after': {
    transform: 'rotate(-45deg)',
  },
  
  '@media (min-width: 768px)': {
    top: '12px',
    right: '12px',
    minWidth: '28px',
    minHeight: '28px',
    width: '28px',
    height: '28px',
    
    '&::before, &::after': {
      width: '16px',
    },
  },
}));

// Barra de progreso
const ProgressBar = styled('div')({
  position: 'absolute',
  bottom: 0,
  left: 0,
  height: '3px',
  width: '100%',
  borderRadius: '0 0 8px 8px',
  
  '@keyframes shrink': {
    '0%': { width: '100%' },
    '100%': { width: '0%' }
  },
  
  animation: 'shrink 3s linear forwards',
});

// Obtener colores según tipo
const getTypeColors = (type, isDarkMode) => {
  const colors = {
    success: {
      main: isDarkMode ? '#4caf50' : '#43a047',
      progress: '#4caf50'
    },
    error: {
      main: isDarkMode ? '#f44336' : '#e53935',
      progress: '#f44336'
    },
    warning: {
      main: isDarkMode ? '#ff9800' : '#fb8c00',
      progress: '#ff9800'
    },
    info: {
      main: isDarkMode ? '#4B9FFF' : '#1976d2',
      progress: '#4B9FFF'
    }
  };
  
  return colors[type] || colors.info;
};

// Componente principal de notificaciones
const Notificaciones = memo(({ open, message, type = 'info', handleClose, onClose }) => {
  const { isDarkTheme = false } = useThemeContext() || {};
  
  // Manejar cierre de notificación
  const closeNotification = useCallback(() => {
    if (handleClose) handleClose();
    if (onClose) onClose();
  }, [handleClose, onClose]);
  
  // Auto-cierre después de 3 segundos
  useEffect(() => {
    if (!open) return;
    
    const timer = setTimeout(closeNotification, 3000);
    return () => clearTimeout(timer);
  }, [open, closeNotification]);
  
  if (!open) return null;
  
  const IconComponent = {
    success: CheckCircle,
    error: Error,
    warning: Warning,
    info: Info
  }[type] || Info;
  
  const typeColor = getTypeColors(type, isDarkTheme);
  
  return (
    <NotificationContainer 
      className={open ? "entering" : "exiting"} 
      isdarkmode={isDarkTheme} 
      role="alert"
      aria-live="polite"
    >
      <IconContainer sx={{ color: typeColor.main }}>
        <IconComponent />
      </IconContainer>
      
      <Box sx={{ 
        flex: 1, 
        paddingRight: { xs: '32px', sm: '36px' },
        minWidth: 0
      }}>
        <Typography 
          variant="body2"
          sx={{ 
            fontWeight: 500, 
            fontSize: { xs: '14px', sm: '15px', md: '16px' },
            lineHeight: 1.4,
            color: isDarkTheme ? '#f0f0f0' : '#333',
            wordBreak: 'break-word'
          }}
        >
          {message}
        </Typography>
      </Box>
      
      <CloseButton 
        onClick={closeNotification} 
        isdarkmode={isDarkTheme} 
        aria-label="Cerrar notificación"
      />
      
      <ProgressBar style={{ backgroundColor: typeColor.progress }} />
    </NotificationContainer>
  );
});

Notificaciones.displayName = 'Notificaciones';

export default Notificaciones;