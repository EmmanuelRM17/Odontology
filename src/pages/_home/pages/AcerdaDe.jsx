import {
  ArrowForward,
  Email,
  LocationOn,
  OpenInNew,
  Phone
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Link as MuiLink,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
const AboutIlustracion = process.env.PUBLIC_URL + '/assets/svg/acerca.svg';

const AboutPage = () => {
  const { isDarkTheme } = useThemeContext();
  const [info, setInfo] = useState({
    historia: "",
    mision: "",
    vision: ""
  });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "info"
  });

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await fetch("https://back-end-4803.onrender.com/api/preguntas/acerca-de");
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();
        const historia = data.find(item => item.tipo === "Historia")?.descripcion || "No disponible";
        const mision = data.find(item => item.tipo === "Misión")?.descripcion || "No disponible";
        const vision = data.find(item => item.tipo === "Visión")?.descripcion || "No disponible";

        setInfo({ historia, mision, vision });
      } catch (error) {
        showNotification("Error al obtener la información", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  const showNotification = (message, type = "info", duration = 3000) => {
    setNotification({ open: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, open: false }));
    }, duration);
  };

  const backgroundStyle = {
    background: isDarkTheme
      ? 'linear-gradient(135deg, #003366, #001a33)'
      : 'linear-gradient(135deg, #e6f2ff, #ffffff)',
    minHeight: '100vh',
    color: isDarkTheme ? '#ffffff' : '#333333',
    transition: 'all 0.3s ease',
    position: 'relative',
  };

  const cardStyle = {
    background: isDarkTheme ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.9)',
    borderRadius: 3,
    boxShadow: isDarkTheme ? '0 4px 6px rgba(0,0,0,0.5)' : '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
    backdropFilter: 'blur(10px)',
    border: isDarkTheme ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
  };

  const streetViewLink = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=21.081734,-98.536002`;

  return (
    <Box sx={backgroundStyle}>
      <Container maxWidth="lg" sx={{ py: 5, position: 'relative' }}>
        {/* Título principal con animación de zoom */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        >

          <Typography
            variant={isSmallScreen ? 'h4' : 'h3'}
            align="center"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              mb: 4,
              background: `linear-gradient(45deg, #0052A3, #007FFF)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Acerca de
          </Typography>
        </motion.div>

        {/* Historia - Animación desde la izquierda */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >


          <Card elevation={0} sx={cardStyle} style={{ marginBottom: 24 }}>
            <CardContent sx={{ background: '#0052A3', color: 'white' }}>
              <Typography variant="h5" gutterBottom>
                Nuestra Historia
              </Typography>
              <Typography variant="body1">
                {loading ? "Cargando..." : info.historia}
              </Typography>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contacto - Animación desde la derecha */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >

          <Grid container spacing={4}>
            {/* Contacto */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={cardStyle}>
                <CardContent sx={{ background: '#0052A3', color: 'white' }}>
                  <Typography variant="h6">Dr. Hugo Gómez Ramírez</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Phone sx={{ mr: 2, color: '#FF5252' }} />
                    <MuiLink href="tel:7713339456" sx={{ color: '#fff' }} underline="hover">
                      771 333 9456
                    </MuiLink>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Email sx={{ mr: 2, color: '#4CAF50' }} />
                    <MuiLink href="mailto:e_gr@hotmail.com" sx={{ color: '#fff' }} underline="hover">
                      e_gr@hotmail.com
                    </MuiLink>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn sx={{ mr: 2, color: '#FFC107' }} />
                    <Typography variant="body2">
                      Ixcatlán, Huejutla de Reyes, Hidalgo, México
                      <br />CP: 43002
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    href={streetViewLink}
                    target="_blank"
                    startIcon={<OpenInNew sx={{ color: '#0052A3' }} />}
                    sx={{
                      bgcolor: 'white',
                      color: '#0052A3',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.9)'
                      }
                    }}
                  >
                    Abrir en Google Maps
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Explorar Servicios con fondo transparente */}
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{
                  background: 'transparent',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  boxShadow: 'none',
                }}
              >
                <CardContent>
                  <Grid
                    container
                    direction="column"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={2}
                    sx={{ height: '100%' }}
                  >
                    {/* Título */}
                    <Grid item>
                      <Typography
                        variant="h5"
                        sx={{
                          color: isDarkTheme ? '#fff' : '#0052A3',
                          mb: 2,
                          fontWeight: 'bold',
                          fontSize: { xs: '1.2rem', sm: '1.5rem' },
                        }}
                      >
                        ¿Quieres conocer nuestros servicios?
                      </Typography>
                    </Grid>

                    {/* SVG animado arriba del botón */}
                    <Grid item>
                      <motion.img
                        src={`${process.env.PUBLIC_URL}/assets/svg/acerca.svg`}
                        alt="Decoración"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                        style={{
                          marginBottom: '16px',
                          width: '120px',
                          opacity: 0.9,
                        }}
                      />
                    </Grid>

                    {/* Botón centrado */}
                    <Grid item>
                      <Button
                        component={Link}
                        to="/servicios"
                        variant="contained"
                        size="medium"
                        endIcon={<ArrowForward />}
                        sx={{
                          bgcolor: '#0052A3',
                          color: 'white',
                          padding: '8px 20px',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          transition:
                            'background-color 0.3s ease-in-out, transform 0.2s ease-in-out',
                          '&:hover': {
                            bgcolor: '#003d7a',
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        Explorar Servicios
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </motion.div>
        {/* Misión y Visión - Animaciones desde abajo */}
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >


              <Card elevation={0} sx={cardStyle}>
                <CardContent sx={{ background: '#0052A3', color: 'white' }}>
                  <Typography variant="h5">Misión</Typography>
                  <Typography variant="body1">
                    {loading ? "Cargando..." : info.mision}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >

              <Card elevation={0} sx={cardStyle}>
                <CardContent sx={{ background: '#0052A3', color: 'white' }}>
                  <Typography variant="h5">Visión</Typography>
                  <Typography variant="body1">
                    {loading ? "Cargando..." : info.vision}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </Box>
  );
};

export default AboutPage;