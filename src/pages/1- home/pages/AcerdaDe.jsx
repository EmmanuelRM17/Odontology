import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  useMediaQuery, 
  useTheme,
  Link as MuiLink,
  Button,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Email, 
  LocationOn,
  OpenInNew,
  MedicalServices,
  Star,
  Assistant
} from '@mui/icons-material';

const AboutPage = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // System Theme Detection
  useEffect(() => {
    const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    setIsDarkTheme(matchDarkTheme.matches);
  
    const handleThemeChange = (e) => {
      setIsDarkTheme(e.matches);
    };
  
    matchDarkTheme.addEventListener('change', handleThemeChange);
  
    return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
  }, []);
  

  const backgroundStyle = {
    background: isDarkTheme 
      ? 'linear-gradient(135deg, #1a2a3a, #2c3e50)' 
      : 'linear-gradient(135deg, #e6f2ff, #ffffff)',
    minHeight: '100vh',
    color: isDarkTheme ? '#ffffff' : '#333333',
    transition: 'all 0.3s ease'
  };

  const cardStyle = {
    background: isDarkTheme ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.9)',
    borderRadius: 3,
    boxShadow: isDarkTheme 
      ? '0 4px 6px rgba(0,0,0,0.5)' 
      : '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    border: isDarkTheme 
      ? '1px solid rgba(255,255,255,0.1)' 
      : '1px solid rgba(0,0,0,0.05)'
  };

  // Google Maps Street View link with precise coordinates
  const streetViewLink = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=21.081734,-98.536002`;

  const clinicServices = [
    {
      icon: <MedicalServices color="primary" />,
      title: 'Servicio Integrale',
      description: 'Ofrecemos una amplia gama de tratamientos dentales, desde limpiezas hasta otros procedimientos.'
    },
    {
      icon: <Star color="secondary" />,
      title: 'Servicio de Calidad',
      description: 'Utilizamos tecnología de vanguardia y técnicas modernas para garantizar la mejor atención.'
    },
    {
      icon: <Assistant color="error" />,
      title: 'Atención Personalizada',
      description: 'Cada paciente es único. Diseñamos tratamientos individualizados con el máximo cuidado.'
    }
  ];

  return (
    <Box sx={backgroundStyle}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography 
            variant={isSmallScreen ? 'h4' : 'h3'} 
            align="center" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              mb: 4,
              background: isDarkTheme 
                ? 'linear-gradient(45deg, #00bcd4, #2196f3)' 
                : 'linear-gradient(45deg, #0066cc, #00bcd4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Acerca de 
          </Typography>
        </motion.div>

        {/* Nuestra Historia */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card elevation={0} sx={cardStyle} style={{ marginBottom: 24 }}>
            <CardContent style={{background: 'powderblue'}}>
              <Typography variant="h5" gutterBottom>
                Nuestra Historia
              </Typography>
              <Typography variant="body1" paragraph>
                La Clínica Dental Carol nace de la pasión del Dr. Hugo Gómez Ramírez por 
                brindar atención dental de la más alta calidad. Con años de experiencia 
                y un compromiso inquebrantable con la salud bucal, hemos construido 
                una clínica que va más allá de un simple consultorio: somos un equipo 
                dedicado a transformar sonrisas y mejorar la calidad de vida de nuestros pacientes.
              </Typography>
            </CardContent>
          </Card>
        </motion.div>

        <Grid container spacing={4}>
          {/* Información de Contacto */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card 
                elevation={0} 
                sx={cardStyle}
              >
                <CardContent style={{background: 'powderblue'}}>
                  <Typography variant="h6" gutterBottom>
                    Dr. Hugo Gómez Ramírez
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Phone sx={{ mr: 2, color: 'primary.main' }} />
                    <MuiLink 
                      href="tel:7713339456" 
                      color="inherit" 
                      underline="hover"
                    >
                      771 333 9456
                    </MuiLink>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Email sx={{ mr: 2, color: 'error.main' }} />
                    <MuiLink 
                      href="mailto:e_gr@hotmail.com" 
                      color="inherit" 
                      underline="hover"
                    >
                      e_gr@hotmail.com
                    </MuiLink>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn sx={{ mr: 2, color: 'success.main' }} />
                    <Typography variant="body2">
                      Ixcatlán, Huejutla de Reyes, Hidalgo, México
                      <br />
                      CP: 43002
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="primary"
                    href={streetViewLink}
                    target="_blank"
                    startIcon={<OpenInNew />}
                    sx={{ mt: 2 }}
                  >
                     Abrir en Google Maps
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Servicios */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card 
                elevation={0} 
                sx={{
                  ...cardStyle,
                  height: '100%'
                }}
              >
                <CardContent style={{background: 'powderblue'}}>
                  <Typography variant="h6" gutterBottom>
                    Nuestros Servicios
                  </Typography>
                  {clinicServices.map((service, index) => (
                    <Box key={service.title} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {service.icon}
                        <Typography variant="subtitle1" sx={{ ml: 2, fontWeight: 'bold' }}>
                          {service.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {service.description}
                      </Typography>
                      {index < clinicServices.length - 1 && <Divider sx={{ my: 1 }} />}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Misión y Visión */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={cardStyle}>
                <CardContent style={{background: 'powderblue'}}>
                  <Typography variant="h5" gutterBottom>
                    Misión
                  </Typography>
                  <Typography variant="body1">
                    Brindar servicios odontológicos de alta calidad, 
                    utilizando tecnología de vanguardia y un enfoque 
                    personalizado para garantizar la salud y bienestar 
                    bucal de nuestros pacientes.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={cardStyle}>
                <CardContent style={{background: 'powderblue'}}>
                  <Typography variant="h5" gutterBottom>
                    Visión
                  </Typography>
                  <Typography variant="body1">
                    Ser reconocidos como el referente en atención 
                    odontológica integral en Ixcatlán y la región, 
                    destacando por nuestra excelencia, compromiso 
                    y cuidado personalizado.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default AboutPage;