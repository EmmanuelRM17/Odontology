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
  useTheme,
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
const AnimatedIcon = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 auto',
  marginBottom: theme.spacing(4),
  '& .icon': {
    fontSize: '80px',
    color: theme.palette.primary.main,
    animation: `${pulse} 2s infinite ease-in-out`,
    zIndex: 2,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${theme.palette.primary.light}44 0%, transparent 70%)`,
    animation: `${successRays} 3s infinite ease-in-out`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: `2px solid ${theme.palette.primary.light}`,
    animation: `${successRays} 3s infinite ease-in-out 0.5s`,
  }
}));

// Componente de Avatar estilizado para los íconos de información
const InfoIconAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main + '15',
  color: theme.palette.primary.main,
  marginRight: theme.spacing(2),
  boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
}));

// Componente estilizado para las filas de información
const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: '8px',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    transform: 'translateX(5px)',
  },
}));

// Componente estilizado para el contenedor de información
const InfoContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(3),
  borderRadius: '16px',
  boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
  border: `1px solid ${theme.palette.divider}`,
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
    backgroundSize: '200% 200%',
    animation: `${gradientMove} 3s ease infinite`,
  }
}));

// Componente estilizado para el papel con efecto de degradado
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  borderRadius: '16px',
  textAlign: 'center',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
  background: theme.palette.background.paper,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '6px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    zIndex: 1,
  },
}));

// Botón estilizado con animación hover
const AnimatedButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(1.2, 3),
  borderRadius: '30px',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: theme.shadows[4],
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
  const theme = useTheme();
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
                color="primary"
                sx={{ 
                  fontWeight: 700,
                  mb: 2,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
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
                  color: theme.palette.text.secondary 
                }}
              >
                Gracias por confiar en nuestra clínica dental. Le enviaremos un recordatorio antes de su cita.
              </Typography>
              
              <Divider sx={{ mb: 4 }} />
              
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
                      }}
                    >
                      <MedicalServices sx={{ mr: 1, color: theme.palette.primary.main }} />
                      Información importante
                    </Typography>
                    
                    <InfoRow>
                      <InfoIconAvatar>
                        <Notifications />
                      </InfoIconAvatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          Notificaciones
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Le notificaremos sobre cualquier cambio o recordatorio vía email o SMS.
                        </Typography>
                      </Box>
                    </InfoRow>
                    
                    <InfoRow>
                      <InfoIconAvatar>
                        <AccessTime />
                      </InfoIconAvatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          Llegada anticipada
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Por favor, llegue 15 minutos antes de su hora agendada para el proceso de registro.
                        </Typography>
                      </Box>
                    </InfoRow>
                    
                    <InfoRow>
                      <InfoIconAvatar>
                        <CalendarMonth />
                      </InfoIconAvatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          Fecha de solicitud
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {fechaActual}
                        </Typography>
                      </Box>
                    </InfoRow>
                  </InfoContainer>
                </Grid>
              </Grid>
              
              <AnimatedButton
                variant="contained"
                color="primary"
                size="large"
                onClick={handleVolver}
                disabled={loading}
                endIcon={loading ? null : <ArrowForward />}
                sx={{ mt: 5 }}
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
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column'
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