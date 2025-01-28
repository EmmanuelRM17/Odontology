import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import { Settings, Assessment, Business } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Principal = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(matchDarkTheme.matches);

    const handleThemeChange = (e) => {
      setIsDarkMode(e.matches);
    };

    matchDarkTheme.addEventListener('change', handleThemeChange);
    return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
  }, []);

  const colors = {
    background: isDarkMode 
      ? 'linear-gradient(135deg, #1B2A3A 0%, #2C3E50 100%)'
      : 'linear-gradient(135deg, #03427c 0%, #0557A5 100%)',
    cardBg: isDarkMode ? '#243447' : '#ffffff',
    text: isDarkMode ? '#FFFFFF' : '#424242',
    subtext: isDarkMode ? '#B0B0B0' : '#757575',
    primary: '#03427c'
  };

  return (
    <Box
      sx={{
        background: colors.background,
        minHeight: '80vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: { xs: '20px', sm: '40px' },
      }}
    >
      <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 8 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            mb: 2,
            color: '#FFFFFF',
            letterSpacing: 1,
            fontSize: { xs: '1.6rem', sm: '2.2rem', md: '2.4rem' },
          }}
        >
          Panel Administrativo de Odontología Carol
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: isDarkMode ? '#E0E0E0' : '#e3f2fd', 
            mb: { xs: 4, sm: 6 } 
          }}
        >
          Accede a las distintas funcionalidades de la plataforma.
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {[
          {
            title: 'Configuración',
            description: 'Modifica las configuraciones generales del sistema.',
            icon: Settings,
            path: '/Administrador/configuracion',
            buttonText: 'Ir a Configuración'
          },
          {
            title: 'Reportes',
            description: 'Consulta los reportes de actividad y rendimiento.',
            icon: Assessment,
            path: '/Administrador/reportes',
            buttonText: 'Ver Reportes'
          },
          {
            title: 'Perfil de Empresa',
            description: 'Gestiona la información y el perfil de tu empresa.',
            icon: Business,
            path: '/Administrador/PerfilEmpresa',
            buttonText: 'Ver Perfil'
          }
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.3)' : 6,
                borderRadius: '16px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  boxShadow: isDarkMode ? '0 8px 24px rgba(0,0,0,0.4)' : 10,
                  transform: 'scale(1.05)',
                },
                backgroundColor: colors.cardBg,
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <item.icon
                  sx={{
                    fontSize: { xs: 40, sm: 50, md: 60 },
                    color: colors.primary,
                    mb: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      opacity: 0.8,
                      transform: item.title === 'Configuración' ? 'rotate(90deg)' : 'scale(1.1)' 
                    },
                  }}
                />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 2, 
                    color: colors.text, 
                    fontSize: { xs: '1.2rem', sm: '1.4rem' } 
                  }}
                >
                  {item.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: colors.subtext, 
                    fontSize: { xs: '0.8rem', sm: '0.9rem' } 
                  }}
                >
                  {item.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ 
                    fontWeight: 'bold', 
                    borderRadius: '0 0 16px 16px', 
                    fontSize: { xs: '0.85rem', sm: '1rem' },
                    bgcolor: colors.primary,
                    '&:hover': {
                      bgcolor: '#0557A5'
                    }
                  }}
                  onClick={() => navigate(item.path)}
                >
                  {item.buttonText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Principal;