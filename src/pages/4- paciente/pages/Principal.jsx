import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button,
} from '@mui/material';
import { 
  CalendarToday, 
  Healing, 
  History,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Principal = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detectar modo oscuro del sistema
  useEffect(() => {
    const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(matchDarkTheme.matches);

    const handleThemeChange = (e) => {
      setIsDarkMode(e.matches);
    };

    matchDarkTheme.addEventListener('change', handleThemeChange);
    return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
  }, []);

  // Colores según el modo del sistema con mejor contraste
  const colors = {
    background: isDarkMode ? '#1B2A3A' : '#F9FDFF',
    primary: '#03427c',
    primaryLight: isDarkMode ? '#4B88CD' : '#03427c',
    text: isDarkMode ? '#FFFFFF' : '#424242',
    subtext: isDarkMode ? '#E0E0E0' : '#757575',
    cardBg: isDarkMode ? '#2C3E50' : '#ffffff',
    cardHoverBg: isDarkMode ? '#34495E' : '#ffffff',
    buttonHover: isDarkMode ? '#0557A5' : '#03427c',
  };

  return (
    <Box
      sx={{
        backgroundColor: colors.background,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: { xs: '20px', sm: '40px' },
        transition: 'all 0.3s ease',
      }}
    >
      {/* Título y descripción */}
      <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 6 }, maxWidth: '800px' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            mb: 2,
            color: colors.primaryLight,
            letterSpacing: 1,
            fontSize: { xs: '1.8rem', sm: '2.4rem' },
          }}
        >
          Bienvenido a Odontología Carol
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: colors.subtext,
            mb: { xs: 4, sm: 6 },
            fontSize: { xs: '1rem', sm: '1.1rem' },
            lineHeight: 1.6
          }}
        >
          Aquí puedes gestionar tus citas, ver tus tratamientos y consultar tu historial médico.
        </Typography>
      </Box>

      {/* Grid de tarjetas */}
      <Grid container spacing={4} justifyContent="center" maxWidth="lg">
        {/* Tarjeta de Citas */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              backgroundColor: colors.cardBg,
              boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.3)' : 3,
              borderRadius: '16px',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                backgroundColor: colors.cardHoverBg,
                boxShadow: isDarkMode ? '0 8px 24px rgba(0,0,0,0.4)' : 6,
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <CalendarToday sx={{ fontSize: 56, color: colors.primaryLight, mb: 2 }} />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 2, 
                  color: colors.text,
                  fontSize: { xs: '1.2rem', md: '1.5rem' }
                }}
              >
                Citas
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: colors.subtext,
                  fontSize: '0.95rem',
                  minHeight: '40px'
                }}
              >
                Gestiona tus próximas citas con facilidad.
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/Usuarios/Paciente/citas')}
                sx={{
                  backgroundColor: colors.primaryLight,
                  color: isDarkMode ? '#FFFFFF' : '#FFFFFF',
                  '&:hover': {
                    backgroundColor: colors.buttonHover,
                  },
                  borderRadius: '8px',
                  py: 1.2,
                  fontWeight: 500,
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                Ver Citas
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Tarjeta de Tratamientos */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              backgroundColor: colors.cardBg,
              boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.3)' : 3,
              borderRadius: '16px',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                backgroundColor: colors.cardHoverBg,
                boxShadow: isDarkMode ? '0 8px 24px rgba(0,0,0,0.4)' : 6,
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Healing sx={{ fontSize: 56, color: colors.primaryLight, mb: 2 }} />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 2, 
                  color: colors.text,
                  fontSize: { xs: '1.2rem', md: '1.5rem' }
                }}
              >
                Tratamientos
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: colors.subtext,
                  fontSize: '0.95rem',
                  minHeight: '40px'
                }}
              >
                Consulta tus tratamientos actuales y pasados.
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/Usuarios/Paciente/tratamientos')}
                sx={{
                  backgroundColor: colors.primaryLight,
                  color: isDarkMode ? '#FFFFFF' : '#FFFFFF',
                  '&:hover': {
                    backgroundColor: colors.buttonHover,
                  },
                  borderRadius: '8px',
                  py: 1.2,
                  fontWeight: 500,
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                Ver Tratamientos
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Tarjeta de Historial Médico */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              backgroundColor: colors.cardBg,
              boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.3)' : 3,
              borderRadius: '16px',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                backgroundColor: colors.cardHoverBg,
                boxShadow: isDarkMode ? '0 8px 24px rgba(0,0,0,0.4)' : 6,
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <History sx={{ fontSize: 56, color: colors.primaryLight, mb: 2 }} />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 2, 
                  color: colors.text,
                  fontSize: { xs: '1.2rem', md: '1.5rem' }
                }}
              >
                Historial Médico
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: colors.subtext,
                  fontSize: '0.95rem',
                  minHeight: '40px'
                }}
              >
                Consulta tu historial médico y documentos.
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/Usuarios/Paciente/historial')}
                sx={{
                  backgroundColor: colors.primaryLight,
                  color: isDarkMode ? '#FFFFFF' : '#FFFFFF',
                  '&:hover': {
                    backgroundColor: colors.buttonHover,
                  },
                  borderRadius: '8px',
                  py: 1.2,
                  fontWeight: 500,
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                Ver Historial
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Principal;