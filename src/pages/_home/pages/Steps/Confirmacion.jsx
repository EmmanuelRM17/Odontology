import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Container, 
  Grid, 
  Fade, 
  Zoom,
  CircularProgress,
  Divider,
  Avatar,
  Backdrop
} from '@mui/material';
import { 
  CheckCircleOutline, 
  AccessTime, 
  CalendarMonth, 
  Home, 
  Notifications,
  MedicalServices,
  ArrowForward
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useThemeContext} from '../../../../components/Tools/ThemeContext';

// Animación de pulso para el ícono principal
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

// Animación de movimiento de fondo
const gradientMove = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Animación para los rayos de éxito
const successRays = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0;
    transform: scale(1.3);
  }
`;

// Componente estilizado para el ícono principal con animación
const AnimatedIcon = styled(Box)(({ isDarkTheme }) => ({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 auto',
  marginBottom: '32px', // Reemplazar por un valor fijo en píxeles
  '& .icon': {
    fontSize: '80px',
    color: isDarkTheme ? '#FFFFFF' : '#03427c',
    animation: `${pulse} 2s infinite ease-in-out`,
    zIndex: 2,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${isDarkTheme ? '#CCCCCC44' : '#03427c44'} 0%, transparent 70%)`,
    animation: `${successRays} 3s infinite ease-in-out`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: `2px solid ${isDarkTheme ? '#CCCCCC' : '#03427c'}`,
    animation: `${successRays} 3s infinite ease-in-out 0.5s`,
  }
}));

// Componente de Avatar estilizado para los íconos de información
const InfoIconAvatar = styled(Avatar)(({ isDarkTheme }) => ({
  backgroundColor: isDarkTheme ? '#555555' : '#03427c',
  color: isDarkTheme ? '#FFFFFF' : '#FFFFFF',
  marginRight: '16px', // En lugar de isDarkTheme.spacing(2)  
  boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
}));

// Componente estilizado para las filas de información
const InfoRow = styled(Box)(({ isDarkTheme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '16px', // En lugar de isDarkTheme.spacing(2)
  padding: '12px', // En lugar de isDarkTheme.spacing(1.5)
  borderRadius: '8px',
  backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
    transform: 'translateX(5px)',
  },
}));

// Componente estilizado para el contenedor de información
const InfoContainer = styled(Box)(({ isDarkTheme }) => ({
  backgroundColor: isDarkTheme ? '#2C2C2C' : '#FFFFFF',
  padding: '24px', // En lugar de isDarkTheme.spacing(3)
  borderRadius: '16px',
  boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
  border: `1px solid ${isDarkTheme ? '#333333' : '#E0E0E0'}`,
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${isDarkTheme ? '#8A8A8A' : '#03427c'}, ${isDarkTheme ? '#6D6D6D' : '#02305c'})`,
    backgroundSize: '200% 200%',
    animation: `${gradientMove} 3s ease infinite`,
  }
}));

// Componente estilizado para el papel con efecto de degradado
const StyledPaper = styled(Paper)(({ isDarkTheme }) => ({
  padding: '48px', // En lugar de isDarkTheme.spacing(6)
  borderRadius: '16px',
  textAlign: 'center',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
  background: isDarkTheme ? '#2C2C2C' : '#FFFFFF',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '6px',
    background: `linear-gradient(90deg, ${isDarkTheme ? '#8A8A8A' : '#03427c'}, ${isDarkTheme ? '#6D6D6D' : '#02305c'})`,
    zIndex: 1,
  },
}));

// Botón estilizado con animación hover
const AnimatedButton = styled(Button)(({ isDarkTheme }) => ({
  marginTop: '32px', // En lugar de isDarkTheme.spacing(4)
  padding: '10px 24px', // Reemplazar por un valor fijo en píxeles
  borderRadius: '30px',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: isDarkTheme ? '0px 4px 8px rgba(0,0,0,0.2)' : '0px 4px 8px rgba(3, 66, 124, 0.2)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(255,255,255,0.2)',
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s ease',
  },
  '&:hover::after': {
    transform: 'translateX(0)',
  }
}));

const Confirmacion = () => {
  const navigate = useNavigate();
  const { isDarkTheme } =  useThemeContext(); // ✅ Correcto
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openBackdrop, setOpenBackdrop] = useState(false);

  useEffect(() => {
    // Activar animación después de un pequeño retraso para mejor efecto
    const timer = setTimeout(() => {
      setVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleVolver = () => {
    setLoading(true);
    setOpenBackdrop(true);
    
    // Simular tiempo de carga antes de redirigir
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  // Fecha actual formateada para español
  const fechaActual = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Fade in={visible} timeout={1000}>
        <StyledPaper elevation={3}>
          <Zoom in={visible} timeout={1500}>
            <Box>
              <AnimatedIcon>
                <CheckCircleOutline className="icon" />
              </AnimatedIcon>
              
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  mb: 2,
                  background: `linear-gradient(90deg, ${isDarkTheme ? '#FFFFFF' : '#03427c'}, ${isDarkTheme ? '#000000' : '#02305c'})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ¡Cita Agendada con Éxito!
              </Typography>
              
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  mb: 4,
                  maxWidth: '80%',
                  mx: 'auto',
                  color: isDarkTheme ? '#000000' : '#03427c',
                }}
              >
                Gracias por confiar en nuestra clínica dental. Le enviaremos un recordatorio antes de su cita.
              </Typography>
              
              <Divider sx={{ mb: 4, backgroundColor: isDarkTheme ? '#000000' : '#03427c' }} />
              
              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} md={10}>
                  <InfoContainer>
                    <Typography
                      variant="h6"
                      sx={{ 
                        mb: 3, 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        color: isDarkTheme ? '#000000' : '#03427c',
                      }}
                    >
                      <MedicalServices sx={{ mr: 1, color: isDarkTheme ? '#000000' : '#03427c' }} />
                      Información importante
                    </Typography>
                    
                    <InfoRow>
                      <InfoIconAvatar sx={{ backgroundColor: isDarkTheme ? '#555555' : '#03427c' }}>
                        <Notifications />
                      </InfoIconAvatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: isDarkTheme ? '#FFFFFF' : '#000000' }}>
                          Notificaciones
                        </Typography>
                        <Typography variant="body2" sx={{ color: isDarkTheme ? '#000000' : '#666666' }}>
                          Le notificaremos sobre cualquier cambio o recordatorio vía email o SMS.
                        </Typography>
                      </Box>
                    </InfoRow>
                    
                    <InfoRow>
                      <InfoIconAvatar sx={{ backgroundColor: isDarkTheme ? '#555555' : '#03427c' }}>
                        <AccessTime />
                      </InfoIconAvatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: isDarkTheme ? '#FFFFFF' : '#000000' }}>
                          Llegada anticipada
                        </Typography>
                        <Typography variant="body2" sx={{ color: isDarkTheme ? '#000000' : '#666666' }}>
                          Por favor, llegue 15 minutos antes de su hora agendada para el proceso de registro.
                        </Typography>
                      </Box>
                    </InfoRow>
                    
                    <InfoRow>
                      <InfoIconAvatar sx={{ backgroundColor: isDarkTheme ? '#555555' : '#03427c' }}>
                        <CalendarMonth />
                      </InfoIconAvatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: isDarkTheme ? '#FFFFFF' : '#000000' }}>
                          Fecha de solicitud
                        </Typography>
                        <Typography variant="body2" sx={{ color: isDarkTheme ? '#000000' : '#666666' }}>
                          {fechaActual}
                        </Typography>
                      </Box>
                    </InfoRow>
                  </InfoContainer>
                </Grid>
              </Grid>
              
              <AnimatedButton
                variant="contained"
                size="large"
                onClick={handleVolver}
                disabled={loading}
                endIcon={loading ? null : <ArrowForward />}
                sx={{ 
                  mt: 5,
                  backgroundColor: isDarkTheme ? '#8A8A8A' : '#03427c',
                  '&:hover': { backgroundColor: isDarkTheme ? '#6D6D6D' : '#02305c' }
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                    Redirigiendo...
                  </Box>
                ) : (
                  'Volver al inicio'
                )}
              </AnimatedButton>
            </Box>
          </Zoom>
        </StyledPaper>
      </Fade>
      
      <Backdrop
        sx={{ 
          color: '#FFFFFF', 
          zIndex: 1201,
          flexDirection: 'column',
          backgroundColor: isDarkTheme ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)'
        }}
        open={openBackdrop}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6" sx={{ mt: 2, fontWeight: 500 }}>
          Redirigiendo al inicio...
        </Typography>
      </Backdrop>
    </Container>
  );

};

export default Confirmacion;