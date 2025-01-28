// Notificaciones.jsx
import React from 'react';
import { Alert, Snackbar } from '@mui/material';

const Notificaciones = ({ open, message, type, handleClose }) => {
  return (
    <Snackbar open={open} autoHideDuration={7000} onClose={handleClose}>
      <Alert onClose={handleClose} severity={type} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notificaciones;
