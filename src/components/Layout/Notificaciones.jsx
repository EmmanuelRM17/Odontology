import React, { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { LocalHospital } from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

// Animaciones keyframes
const slideIn = keyframes`
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
`;

// Estilos personalizados para el Alert con animaciones
const StyledAlert = styled(Alert)(({ theme, severity, open }) => ({
  alignItems: 'center',
  borderRadius: '10px',
  boxShadow: theme.shadows[3],
  padding: '10px 16px',
  animation: `${open ? slideIn : slideOut} 0.5s ease-in-out`,
  '& .MuiAlert-icon': {
    opacity: 0.9,
    padding: '0px',
    fontSize: '28px',
  },
  '& .MuiAlert-message': {
    padding: '8px 0',
    fontSize: '0.95rem',
  },
  '& .MuiAlert-action': {
    padding: '0 0 0 16px',
  },
  // Estilos específicos por tipo de alerta
  ...(severity === 'success' && {
    background: 'linear-gradient(45deg, #43a047 30%, #4caf50 90%)',
    color: '#fff',
  }),
  ...(severity === 'error' && {
    background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
    color: '#fff',
  }),
  ...(severity === 'info' && {
    background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
    color: '#fff',
  }),
  ...(severity === 'warning' && {
    background: 'linear-gradient(45deg, #ffa000 30%, #ffb300 90%)',
    color: '#fff',
  }),
  // Añadir un efecto de hover suave
  '&:hover': {
    transform: 'scale(1.02)',
    transition: 'transform 0.2s ease-in-out',
  },
}));

// Ícono dental personalizado con animación
const DentalIcon = styled(LocalHospital)(({ theme }) => ({
  marginRight: theme.spacing(1),
  fontSize: '20px',
  animation: `${slideIn} 0.5s ease-in-out`,
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
    },
    '50%': {
      transform: 'scale(1.1)',
    },
    '100%': {
      transform: 'scale(1)',
    },
  },
  '&:hover': {
    animation: 'pulse 1s infinite',
  },
}));

const Notificaciones = ({ open, message, type, handleClose }) => {
  // Estado local para manejar la visibilidad de forma segura
  const [isVisible, setIsVisible] = useState(open);
  
  // Sincronizar el estado local con la prop open
  useEffect(() => {
    setIsVisible(open);
  }, [open]);
  
  // Función segura para manejar el cierre
  const handleSafeClose = (event, reason) => {
    // Ignorar clics fuera de la notificación para evitar cierres no deseados
    if (reason === 'clickaway') return;
    
    // Primero actualizar el estado local
    setIsVisible(false);
    
    // Dar tiempo para la animación de salida antes de llamar al handleClose del padre
    setTimeout(() => {
      if (handleClose) {
        // Usar un reason personalizado para evitar errores de timeout
        handleClose(event, 'customClose');
      }
    }, 400); // Ligeramente menor que la duración de la animación (500ms)
  };
  
  // Manejar el cierre automático después de 3 segundos
  useEffect(() => {
    let timer;
    if (isVisible) {
      timer = setTimeout(() => {
        handleSafeClose(null, 'customTimeout');
      }, 3000);
    }
    
    // Limpiar el temporizador si el componente se desmonta o cambia el estado
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible]);

  return (
    <Snackbar
      open={isVisible}
      onClose={handleSafeClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        '& .MuiSnackbar-root': {
          maxWidth: { xs: '90%', sm: '400px' },
        },
        mb: 2,
      }}
      TransitionProps={{
        timeout: 500,
      }}
    >
      <StyledAlert
        onClose={handleSafeClose}
        severity={type}
        icon={<DentalIcon />}
        open={isVisible}
        sx={{
          minWidth: { xs: '280px', sm: '344px' },
          maxWidth: { xs: '90vw', sm: '400px' },
          transform: 'translateZ(0)',
        }}
      >
        {message}
      </StyledAlert>
    </Snackbar>
  );
};

export default Notificaciones;