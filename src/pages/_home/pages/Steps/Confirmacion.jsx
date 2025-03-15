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
  Backdrop,
  Chip,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { 
  CheckCircleOutline, 
  AccessTime, 
  CalendarMonth, 
  Home, 
  Notifications,
  MedicalServices,
  ArrowForward,
  Person as PersonIcon,
  EventAvailable as EventAvailableIcon,
  Info as InfoIcon,
  VerifiedUser as VerifiedUserIcon,
  HourglassTop as HourglassTopIcon,
  NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeContext } from '../../../../components/Tools/ThemeContext';
import moment from 'moment';
import 'moment/locale/es';

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
  marginBottom: '32px',
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
  marginRight: '16px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
}));

// Componente estilizado para las filas de información
const InfoRow = styled(Box)(({ isDarkTheme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '16px',
  padding: '12px',
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
  padding: '24px',
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
  padding: '48px',
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
  marginTop: '32px',
  padding: '10px 24px',
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
  const location = useLocation();
  const { isDarkTheme } = useThemeContext();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openBackdrop, setOpenBackdrop] = useState(false);
  
  // Obtener datos de location.state o localStorage
  const { state } = location;
  const esTratamiento = state?.esTratamiento || localStorage.getItem('es_tratamiento') === 'true';
  const citaId = state?.citaId || localStorage.getItem('ultima_cita_id');
  const tratamientoId = state?.tratamientoId || localStorage.getItem('ultimo_tratamiento_id');
  const fechaCita = state?.fechaCita || 'No disponible';
  const horaCita = state?.horaCita || 'No disponible';
  const servicio = state?.servicio || 'No disponible';
  const especialista = state?.especialista || 'No disponible';

  useEffect(() => {
    // Activar animación después de un pequeño retraso para mejor efecto
    const timer = setTimeout(() => {
      setVisible(true);
    }, 300);

    // Scroll al inicio cuando se monta el componente
    window.scrollTo(0, 0);

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

  // Formatear fecha de la cita si está disponible
  const formattedDate = fechaCita !== 'No disponible' 
    ? moment(fechaCita).locale('es').format('dddd, D [de] MMMM [de] YYYY')
    : 'Fecha por confirmar';
    
  // Fecha actual formateada para español
  const fechaActual = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Pasos del proceso según tipo (tratamiento o cita)
  const stepsTratamiento = [
    { label: 'Solicitud enviada', icon: CheckCircleOutline, completed: true },
    { label: 'Revisión por odontólogo', icon: HourglassTopIcon, completed: false },
    { label: 'Tratamiento confirmado', icon: VerifiedUserIcon, completed: false },
    { label: 'Primera cita', icon: EventAvailableIcon, completed: false }
  ];

  const stepsCita = [
    { label: 'Cita agendada', icon: CheckCircleOutline, completed: true },
    { label: 'Asistencia a consulta', icon: EventAvailableIcon, completed: false }
  ];

  const pasos = esTratamiento ? stepsTratamiento : stepsCita;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Fade in={visible} timeout={1000}>
        <StyledPaper elevation={3} isDarkTheme={isDarkTheme}>
          <Zoom in={visible} timeout={1500}>
            <Box>
              <AnimatedIcon isDarkTheme={isDarkTheme}>
                <CheckCircleOutline className="icon" />
              </AnimatedIcon>
              
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  mb: 2,
                  background: `linear-gradient(90deg, ${isDarkTheme ? '#FFFFFF' : '#03427c'}, ${isDarkTheme ? '#CCCCCC' : '#02305c'})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {esTratamiento 
                  ? '¡Solicitud de Tratamiento Enviada!' 
                  : '¡Cita Agendada con Éxito!'}
              </Typography>
              
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  mb: 4,
                  maxWidth: '80%',
                  mx: 'auto',
                  color: isDarkTheme ? '#CCCCCC' : '#03427c',
                }}
              >
                {esTratamiento 
                  ? 'Tu solicitud de tratamiento ha sido recibida y será revisada por un odontólogo pronto.' 
                  : 'Gracias por confiar en nuestra clínica dental. Le enviaremos un recordatorio antes de su cita.'}
              </Typography>
              
              <Divider sx={{ mb: 4, backgroundColor: isDarkTheme ? '#CCCCCC' : '#03427c', opacity: 0.3 }} />
              
              {/* Stepper de progreso */}
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2,
                    fontWeight: 600,
                    color: isDarkTheme ? '#FFFFFF' : '#03427c',
                  }}
                >
                  {esTratamiento ? 'Proceso del Tratamiento' : 'Proceso de tu Cita'}
                </Typography>
                
                <Stepper 
                  activeStep={0} 
                  alternativeLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      mt: 1,
                      color: isDarkTheme ? '#CCCCCC' : '#666666'
                    }
                  }}
                >
                  {pasos.map((paso, index) => (
                    <Step key={paso.label}>
                      <StepLabel
                        StepIconComponent={({ active, completed }) => (
                          <Avatar
                            sx={{
                              bgcolor: index === 0 ? '#4caf50' : 'grey.500',
                              width: 40,
                              height: 40
                            }}
                          >
                            <paso.icon sx={{ color: 'white' }} />
                          </Avatar>
                        )}
                      >
                        {paso.label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
              
              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12}>
                  <InfoContainer isDarkTheme={isDarkTheme}>
                    <Typography
                      variant="h6"
                      sx={{ 
                        mb: 3, 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        color: isDarkTheme ? '#FFFFFF' : '#03427c',
                      }}
                    >
                      <MedicalServices sx={{ mr: 1, color: isDarkTheme ? '#FFFFFF' : '#03427c' }} />
                      Información de tu {esTratamiento ? 'Tratamiento' : 'Cita'}
                    </Typography>
                    
                    <InfoRow isDarkTheme={isDarkTheme}>
                      <InfoIconAvatar isDarkTheme={isDarkTheme}>
                        <MedicalServices />
                      </InfoIconAvatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: isDarkTheme ? '#FFFFFF' : '#000000' }}>
                          Servicio
                        </Typography>
                        <Typography variant="body2" sx={{ color: isDarkTheme ? '#CCCCCC' : '#666666' }}>
                          {servicio}
                        </Typography>
                      </Box>
                    </InfoRow>
                    
                    <InfoRow isDarkTheme={isDarkTheme}>
                      <InfoIconAvatar isDarkTheme={isDarkTheme}>
                        <PersonIcon />
                      </InfoIconAvatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: isDarkTheme ? '#FFFFFF' : '#000000' }}>
                          Especialista
                        </Typography>
                        <Typography variant="body2" sx={{ color: isDarkTheme ? '#CCCCCC' : '#666666' }}>
                          {especialista}
                        </Typography>
                      </Box>
                    </InfoRow>
                    
                    <InfoRow isDarkTheme={isDarkTheme}>
                      <InfoIconAvatar isDarkTheme={isDarkTheme}>
                        <CalendarMonth />
                      </InfoIconAvatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: isDarkTheme ? '#FFFFFF' : '#000000' }}>
                          {esTratamiento ? 'Fecha propuesta' : 'Fecha de la cita'}
                          {esTratamiento && (
                            <Chip 
                              size="small" 
                              label="Pendiente" 
                              color="warning"
                              sx={{ ml: 1, height: '20px', fontSize: '0.7rem' }}
                            />
                          )}
                        </Typography>
                        <Typography variant="body2" sx={{ color: isDarkTheme ? '#CCCCCC' : '#666666' }}>
                          {formattedDate}
                        </Typography>
                      </Box>
                    </InfoRow>
                    
                    <InfoRow isDarkTheme={isDarkTheme}>
                      <InfoIconAvatar isDarkTheme={isDarkTheme}>
                        <AccessTime />
                      </InfoIconAvatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: isDarkTheme ? '#FFFFFF' : '#000000' }}>
                          {esTratamiento ? 'Hora propuesta' : 'Hora de la cita'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: isDarkTheme ? '#CCCCCC' : '#666666' }}>
                          {horaCita}
                        </Typography>
                      </Box>
                    </InfoRow>
                    
                    <InfoRow isDarkTheme={isDarkTheme}>
                      <InfoIconAvatar isDarkTheme={isDarkTheme}>
                        <Notifications />
                      </InfoIconAvatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: isDarkTheme ? '#FFFFFF' : '#000000' }}>
                          Notificaciones
                        </Typography>
                        <Typography variant="body2" sx={{ color: isDarkTheme ? '#CCCCCC' : '#666666' }}>
                          {esTratamiento 
                            ? 'Te notificaremos cuando el odontólogo confirme tu tratamiento.' 
                            : 'Te enviaremos un recordatorio antes de tu cita.'}
                        </Typography>
                      </Box>
                    </InfoRow>
                    
                    {esTratamiento && (
                      <Box sx={{ mt: 3, p: 2, bgcolor: isDarkTheme ? 'rgba(255, 193, 7, 0.1)' : '#fff8e1', borderRadius: 2, border: '1px solid #ffb74d' }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 'bold', 
                            display: 'flex', 
                            alignItems: 'center',
                            color: '#f57c00',
                            mb: 1
                          }}
                        >
                          <NotificationsActiveIcon sx={{ mr: 1, fontSize: 20 }} /> 
                          Información importante sobre tu tratamiento
                        </Typography>
                        
                        <Typography variant="body2" sx={{ color: isDarkTheme ? '#CCCCCC' : '#666666' }}>
                          El odontólogo revisará tu solicitud y confirmará el tratamiento próximamente. La fecha y hora 
                          propuestas serán confirmadas o se te ofrecerá una alternativa si es necesario.
                        </Typography>
                      </Box>
                    )}
                  </InfoContainer>
                </Grid>
              </Grid>
              
              {/* Identificadores para referencia */}
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
                {esTratamiento && tratamientoId && (
                  <Chip 
                    label={`ID Tratamiento: ${tratamientoId}`} 
                    variant="outlined"
                    sx={{ 
                      color: isDarkTheme ? '#CCCCCC' : '#03427c',
                      borderColor: isDarkTheme ? '#555555' : '#03427c'
                    }}
                  />
                )}
                
                {citaId && (
                  <Chip 
                    label={`ID Cita: ${citaId}`} 
                    variant="outlined"
                    sx={{ 
                      color: isDarkTheme ? '#CCCCCC' : '#03427c',
                      borderColor: isDarkTheme ? '#555555' : '#03427c'
                    }}
                  />
                )}
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                <AnimatedButton
                  variant="contained"
                  size="large"
                  onClick={handleVolver}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{ 
                    mt: 4,
                    backgroundColor: isDarkTheme ? '#8A8A8A' : '#03427c',
                    '&:hover': { backgroundColor: isDarkTheme ? '#6D6D6D' : '#02305c' }
                  }}
                  isDarkTheme={isDarkTheme}
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