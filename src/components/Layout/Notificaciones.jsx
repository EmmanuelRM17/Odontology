import React from 'react';
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
  return (
    <Snackbar
      open={open}
      autoHideDuration={null}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Cambiado a bottom-center
      sx={{
        '& .MuiSnackbar-root': {
          maxWidth: { xs: '90%', sm: '400px' },
        },
        mb: 2, // Margen inferior
      }}
      TransitionProps={{
        timeout: 500, // Duración de la transición
      }}
    >
      <StyledAlert
        onClose={handleClose}
        severity={type}
        icon={<DentalIcon />}
        open={open}
        sx={{
          minWidth: { xs: '280px', sm: '344px' },
          maxWidth: { xs: '90vw', sm: '400px' },
          transform: 'translateZ(0)', // Mejora el rendimiento de las animaciones
        }}
      >
        {message}
      </StyledAlert>
    </Snackbar>
  );
};

export default Notificaciones;