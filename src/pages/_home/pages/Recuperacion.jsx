import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Card, CardContent, IconButton, CircularProgress } from '@mui/material';
import { Email, ArrowBack, Lock } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Notificaciones from '../../../components/Layout/Notificaciones'; // Asegúrate de importar el componente de notificaciones

const Recuperacion = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(''); // Para almacenar el código ingresado
  const [emailSent, setEmailSent] = useState(false); // Estado para saber si el email fue enviado
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar la carga
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleTokenChange = (e) => {
    setToken(e.target.value); // Capturar el código de verificación
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Evitar que se envíe múltiples veces
    if (isLoading) return;

    setNotification({ ...notification, open: false }); // Ocultar notificaciones previas

    if (!email) {
      setNotification({
        open: true,
        message: 'Por favor, introduce un correo electrónico válido.',
        type: 'error',
      });
      return;
    }

    try {
      setIsLoading(true); // Iniciar la carga
      const response = await axios.post('https://back-end-4803.onrender.com/api/recuperacion', { email });

      if (response.status === 200) {
        setNotification({
          open: true,
          message: 'Se ha enviado un correo de recuperación. Por favor, revisa tu bandeja de entrada.',
          type: 'success',
        });
        setEmailSent(true); // Cambia el estado para mostrar el campo del código
      }
    } catch (error) {
      setNotification({
        open: true,
        message: error.response?.status === 404
          ? 'Correo no encontrado. Por favor, verifica el correo ingresado.'
          : 'Error de conexión. Inténtalo de nuevo más tarde.',
        type: 'error',
      });
    } finally {
      setIsLoading(false); // Detener la carga
    }
  };

  const handleVerifyToken = async (e) => {
    e.preventDefault();

    // Evitar que se envíe múltiples veces
    if (isLoading) return;

    if (!token) {
      setNotification({
        open: true,
        message: 'Por favor, introduce el código que te fue enviado.',
        type: 'error',
      });
      return;
    }

    try {
      setIsLoading(true); // Iniciar la carga
      // Enviar token y email al backend
      const response = await axios.post('https://back-end-4803.onrender.com/api/verifyTokene', { token, email });

      if (response.status === 200) {
        setNotification({
          open: true,
          message: 'Código verificado correctamente. Ahora puedes restablecer tu contraseña.',
          type: 'success',
        });
        navigate(`/resetContra?token=${encodeURIComponent(token)}`);
      }
    } catch (error) {
      setNotification({
        open: true,
        message: 'Código inválido o expirado. Inténtalo de nuevo.',
        type: 'error',
      });
    } finally {
      setIsLoading(false); // Detener la carga
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#FFFFFF',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        position: 'relative'
      }}
    >
      <IconButton
        sx={{ position: 'absolute', top: 16, left: 16, color: '#00bcd4' }}
        component={Link}
        to="/login" // Ruta para regresar al login
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ArrowBack />
          <Typography
            variant="body2"
            sx={{ color: '#707070', opacity: 0.7, ml: 1 }}
          >
            Atrás
          </Typography>
        </Box>
      </IconButton>

      <Card sx={{ maxWidth: 400, width: '100%', borderRadius: '15px', boxShadow: 3, position: 'relative' }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            {emailSent ? 'Verificar Código' : 'Recuperar Contraseña'}
          </Typography>

          <Typography variant="body2" sx={{ mb: 4 }}>
            {emailSent ? 'Introduce el código que te enviamos por correo electrónico.' : 'Introduce el correo electrónico con el que te registraste para recibir un enlace de recuperación.'}
          </Typography>

          <form onSubmit={emailSent ? handleVerifyToken : handleSubmit}>
            {!emailSent ? (
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <IconButton sx={{ mr: 1 }}>
                        <Email />
                      </IconButton>
                    ),
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Código de Verificación"
                  name="token"
                  value={token}
                  onChange={handleTokenChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <IconButton sx={{ mr: 1 }}>
                        <Lock />
                      </IconButton>
                    ),
                  }}
                />
              </Box>
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#00bcd4',
                '&:hover': { backgroundColor: '#00a3ba' },
                py: 1.5,
                fontSize: '16px',
              }}
              disabled={isLoading} // Deshabilitar el botón mientras está cargando
            >
              {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : emailSent ? 'Verificar Código' : 'Enviar Enlace de Recuperación'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notificaciones */}
      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        handleClose={handleCloseNotification}
      />
    </Box>
  );
};

export default Recuperacion;
