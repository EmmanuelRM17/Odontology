import React, { useState, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress, Grid, Divider, Card, CardContent, Chip, Tooltip } from '@mui/material';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { OpenInNew, LocationOn, AccessTime, Phone, Info, Navigation, Share } from '@mui/icons-material';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const Ubicacion = () => {
  const { isDarkTheme } = useThemeContext();
  const [map, setMap] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [mapView, setMapView] = useState('roadmap'); // 'roadmap' o 'satellite'
  const [isHovering, setIsHovering] = useState(false);
  
  // Información de la clínica
  const clinicInfo = {
    nombre: "Clínica Dental Carol",
    direccion: "Ixcatlan, Huejutla de Reyes, Hidalgo, México",
    telefono: "+52 789 123 4567",
    horario: "Lunes a Viernes: 9:00 - 19:00, Sábados: 9:00 - 14:00",
    indicaciones: "A una cuadra de la Plaza Principal, edificio con fachada azul"
  };

  // Centro del mapa (coordenadas de la clínica)
  const center = {
    lat: 21.081734,
    lng: -98.536002
  };

  // Cargar la API de Google Maps
  const { isLoaded, loadError: apiLoadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCjYgHzkG53-aSTcHJkAPYu98TIkGZ2d-w",
    timeout: 10000,
    onError: (error) => {
      console.error('Error cargando Google Maps:', error);
      setLoadError(error);
    }
  });

  // Estilos para el mapa en modo oscuro
  const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }
  ];

  // Estilos para el modo claro - más vibrante que el predeterminado
  const lightMapStyle = [
    { featureType: "poi.medical", elementType: "labels", stylers: [{ visibility: "on", color: "#e74c3c" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#a0d6f7" }] },
    { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f2f2f2" }] }
  ];

  // Colores dinámicos basados en el tema
  const colors = {
    cardBackground: isDarkTheme ? '#0D1B2A' : '#ffffff',
    primaryText: isDarkTheme ? '#ffffff' : '#1a1a1a',
    secondaryText: isDarkTheme ? '#A0AEC0' : '#666666',
    primaryColor: isDarkTheme ? '#00BCD4' : '#1976d2',
    accentColor: isDarkTheme ? '#FF4081' : '#f50057',
    gradientStart: isDarkTheme ? '#1C2A38' : '#f9f9f9',
    gradientEnd: isDarkTheme ? '#2C3E50' : '#E5F3FD',
    cardShadow: isDarkTheme ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 8px 32px rgba(25, 118, 210, 0.15)',
    buttonHover: isDarkTheme ? 'rgba(0, 188, 212, 0.15)' : 'rgba(25, 118, 210, 0.12)',
    divider: isDarkTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    chipBackground: isDarkTheme ? 'rgba(0, 188, 212, 0.2)' : 'rgba(25, 118, 210, 0.1)',
  };

  // Estilos del mapa
  const mapStyles = {
    height: "450px",
    width: "100%",
    borderRadius: "12px",
    marginTop: "20px",
    boxShadow: colors.cardShadow,
    border: `2px solid ${colors.primaryColor}`,
  };

  // Enlaces externos
  const streetViewLink = `https://www.google.com/maps/@21.0816681,-98.5359763,19.64z`;
  const directionsLink = `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`;

  // Callbacks para el mapa
  const onLoad = useCallback((map) => {
    setMap(map);
    
    // Añadir efecto de zoom suave al cargar
    setTimeout(() => {
      map.setZoom(15);
      setTimeout(() => map.setZoom(17), 700);
    }, 500);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Toggle para cambiar entre mapa y satélite
  const toggleMapView = () => {
    setMapView(mapView === 'roadmap' ? 'satellite' : 'roadmap');
  };

  // Compartir ubicación
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: clinicInfo.nombre,
          text: `Ubicación de ${clinicInfo.nombre}: ${clinicInfo.direccion}`,
          url: directionsLink,
        });
      } catch (error) {
        console.error('Error al compartir:', error);
        // Fallback - copiar al portapapeles
        navigator.clipboard.writeText(directionsLink);
        alert('¡Enlace copiado al portapapeles!');
      }
    } else {
      // Navegadores que no soportan Web Share API
      navigator.clipboard.writeText(directionsLink);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  // Animaciones con Framer Motion
  const mapContainerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.7,
        ease: "easeOut"
      } 
    },
    exit: { 
      opacity: 0,
      y: -30,
      transition: { duration: 0.3 } 
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        delay: 0.3, 
        duration: 0.5 
      } 
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        delay: 0.5, 
        duration: 0.4, 
        ease: "easeOut" 
      } 
    },
    hover: {
      scale: 1.02,
      boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
      transition: { duration: 0.3 }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2, yoyo: Infinity, ease: "easeInOut" }
    },
    tap: { scale: 0.95 }
  };

  // Renderizado de pantalla de carga
  if (!isLoaded) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="500px"
        sx={{
          backgroundColor: colors.cardBackground,
          borderRadius: '12px',
          boxShadow: colors.cardShadow,
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CircularProgress
            size={70}
            thickness={4}
            sx={{
              color: colors.primaryColor,
              mb: 3
            }}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Typography
            variant="h5"
            sx={{
              color: colors.primaryText,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500,
              textAlign: 'center'
            }}
          >
            Cargando mapa...
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: colors.secondaryText,
              fontFamily: 'Roboto, sans-serif',
              mt: 1,
              textAlign: 'center'
            }}
          >
            Preparando la ubicación de Clínica Dental Carol
          </Typography>
        </motion.div>
      </Box>
    );
  }

  // Renderizado de pantalla de error
  if (loadError || apiLoadError) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: 'center',
          bgcolor: colors.cardBackground,
          borderRadius: '12px',
          boxShadow: colors.cardShadow,
        }}
      >
        <Typography 
          color="error" 
          variant="h5" 
          gutterBottom
          sx={{ fontWeight: 500 }}
        >
          Error al cargar el mapa
        </Typography>
        <Typography 
          color={colors.secondaryText} 
          variant="body1" 
          sx={{ mb: 3 }}
        >
          No se pudo cargar Google Maps. Por favor, verifica tu conexión a internet.
        </Typography>
        <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
          <Button
            variant="contained"
            size="large"
            onClick={() => window.location.reload()}
            sx={{ 
              mt: 2, 
              bgcolor: colors.primaryColor,
              boxShadow: '0 4px 12px rgba(0, 188, 212, 0.3)',
              '&:hover': {
                bgcolor: isDarkTheme ? '#00ACC1' : '#1565C0',
              }
            }}
          >
            Reintentar
          </Button>
        </motion.div>
      </Box>
    );
  }

  // Componente principal
  return (
    <AnimatePresence>
      <motion.div
        variants={mapContainerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{
          background: isDarkTheme
        ? "linear-gradient(90deg, #1C2A38 0%, #2C3E50 100%)" 
        : "linear-gradient(90deg, #ffffff 0%, #E5F3FD 100%)", 
                transition: 'background 0.5s ease',
          minHeight: '85vh',
          width: '100%',
          padding: '2rem 1rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          component="section"
          sx={{
            maxWidth: '1200px',
            width: '100%',
            margin: '0 auto',
            py: 4,
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          {/* Título animado */}
          <motion.div variants={titleVariants} initial="hidden" animate="visible">
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                color: isDarkTheme ? '#ffffff' : '#03427C',
                fontFamily: '"Montserrat", sans-serif',
                letterSpacing: '0.5px',
                textAlign: 'center',
                mb: 3,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80px',
                  height: '4px',
                  background: `linear-gradient(90deg, ${colors.primaryColor}, ${colors.accentColor})`,
                  borderRadius: '2px',
                }
              }}
            >
              Encuéntranos
            </Typography>
          </motion.div>

          <Grid container spacing={4} sx={{ mt: 2 }}>
            {/* Columna izquierda - Mapa */}
            <Grid item xs={12} md={8}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {/* Panel de controles del mapa */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: colors.primaryText,
                      fontFamily: '"Montserrat", sans-serif',
                    }}
                  >
                    Nuestra ubicación
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title={mapView === 'roadmap' ? 'Ver satélite' : 'Ver mapa'}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={toggleMapView}
                        sx={{
                          borderColor: colors.primaryColor,
                          color: colors.primaryColor,
                          textTransform: 'none',
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: colors.buttonHover,
                            borderColor: colors.primaryColor,
                          }
                        }}
                      >
                        {mapView === 'roadmap' ? 'Satélite' : 'Mapa'}
                      </Button>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Contenedor del mapa con animación al hacer hover */}
                <motion.div
                  onHoverStart={() => setIsHovering(true)}
                  onHoverEnd={() => setIsHovering(false)}
                  animate={isHovering ? { scale: 1.01 } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {isLoaded && (
                    <GoogleMap
                      mapContainerStyle={mapStyles}
                      zoom={17}
                      center={center}
                      onLoad={onLoad}
                      onUnmount={onUnmount}
                      options={{
                        zoomControl: true,
                        streetViewControl: true,
                        mapTypeControl: false,
                        fullscreenControl: true,
                        styles: isDarkTheme ? darkMapStyle : lightMapStyle,
                        backgroundColor: isDarkTheme ? '#242f3e' : '#ffffff',
                        mapTypeId: mapView,
                        gestureHandling: 'cooperative',
                      }}
                    >
                      <Marker
                        position={center}
                        title={clinicInfo.nombre}
                        onClick={() => setShowInfoWindow(!showInfoWindow)}
                        animation={window.google.maps.Animation.DROP}
                      />
                      
                      {/* Ventana de información */}
                      {showInfoWindow && (
                        <InfoWindow
                          position={center}
                          onCloseClick={() => setShowInfoWindow(false)}
                        >
                          <Box sx={{ p: 1, maxWidth: 220 }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                              {clinicInfo.nombre}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {clinicInfo.direccion}
                            </Typography>
                            <Typography variant="body2" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTime sx={{ fontSize: 16 }} />
                              Abierto ahora
                            </Typography>
                            <Button 
                              size="small" 
                              variant="contained" 
                              color="primary"
                              fullWidth
                              href={directionsLink}
                              target="_blank"
                              sx={{ mt: 1.5, textTransform: 'none' }}
                              startIcon={<Navigation />}
                            >
                              Cómo llegar
                            </Button>
                          </Box>
                        </InfoWindow>
                      )}
                    </GoogleMap>
                  )}
                </motion.div>

                {/* Botones debajo del mapa */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      justifyContent: { xs: 'center', sm: 'flex-start' },
                      mt: 3
                    }}
                  >
                    <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                      <Button
                        variant="contained"
                        color="primary"
                        href={directionsLink}
                        target="_blank"
                        startIcon={<Navigation />}
                        sx={{
                          textTransform: 'none',
                          backgroundColor: colors.primaryColor,
                          fontFamily: 'Roboto, sans-serif',
                          fontWeight: 500,
                          boxShadow: '0 4px 12px rgba(0, 188, 212, 0.3)',
                          '&:hover': {
                            backgroundColor: isDarkTheme ? '#00ACC1' : '#1565C0',
                          }
                        }}
                      >
                        Cómo Llegar
                      </Button>
                    </motion.div>

                    <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                      <Button
                        variant="outlined"
                        color="primary"
                        href={streetViewLink}
                        target="_blank"
                        startIcon={<OpenInNew />}
                        sx={{
                          textTransform: 'none',
                          borderColor: colors.primaryColor,
                          color: colors.primaryColor,
                          '&:hover': {
                            borderColor: colors.primaryColor,
                            backgroundColor: colors.buttonHover,
                          },
                          fontFamily: 'Roboto, sans-serif',
                          fontWeight: 500
                        }}
                      >
                        Ver en Street View
                      </Button>
                    </motion.div>

                    <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleShare}
                        startIcon={<Share />}
                        sx={{
                          textTransform: 'none',
                          borderColor: colors.primaryColor,
                          color: colors.primaryColor,
                          '&:hover': {
                            borderColor: colors.primaryColor,
                            backgroundColor: colors.buttonHover,
                          },
                          fontFamily: 'Roboto, sans-serif',
                          fontWeight: 500
                        }}
                      >
                        Compartir Ubicación
                      </Button>
                    </motion.div>
                  </Box>
                </motion.div>
              </motion.div>
            </Grid>

            {/* Columna derecha - Información de contacto */}
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                variants={cardVariants}
                whileHover="hover"
              >
                <Card
                  elevation={5}
                  sx={{
                    backgroundColor: colors.cardBackground,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    height: '100%',
                    boxShadow: colors.cardShadow,
                    border: `1px solid ${colors.divider}`,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '6px',
                      background: `linear-gradient(90deg, ${colors.primaryColor}, ${colors.accentColor})`,
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: colors.primaryText,
                        fontFamily: '"Montserrat", sans-serif',
                        mb: 3,
                        pt: 1
                      }}
                    >
                      Información de Contacto
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Chip
                        label="Abierto ahora"
                        size="small"
                        color="success"
                        sx={{ 
                          fontWeight: 600,
                          mb: 2
                        }}
                      />
                      
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: colors.primaryText,
                          fontFamily: '"Montserrat", sans-serif',
                          mb: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <LocationOn color="primary" fontSize="small" />
                        Dirección
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: colors.secondaryText,
                          fontFamily: 'Roboto, sans-serif',
                          mb: 2,
                          pl: 3.5
                        }}
                      >
                        {clinicInfo.direccion}
                      </Typography>
                      
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: colors.primaryText,
                          fontFamily: '"Montserrat", sans-serif',
                          mb: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <Phone color="primary" fontSize="small" />
                        Teléfono
                      </Typography>
                      <Typography
                        variant="body1"
                        component="a"
                        href={`tel:${clinicInfo.telefono}`}
                        sx={{
                          color: colors.primaryColor,
                          fontFamily: 'Roboto, sans-serif',
                          mb: 2,
                          pl: 3.5,
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        {clinicInfo.telefono}
                      </Typography>
                      
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: colors.primaryText,
                          fontFamily: '"Montserrat", sans-serif',
                          mb: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <AccessTime color="primary" fontSize="small" />
                        Horario de Atención
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: colors.secondaryText,
                          fontFamily: 'Roboto, sans-serif',
                          mb: 2,
                          pl: 3.5
                        }}
                      >
                        {clinicInfo.horario}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2, borderColor: colors.divider }} />
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: colors.primaryText,
                          fontFamily: '"Montserrat", sans-serif',
                          mb: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <Info color="primary" fontSize="small" />
                        Cómo encontrarnos
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: colors.secondaryText,
                          fontFamily: 'Roboto, sans-serif',
                          backgroundColor: colors.chipBackground,
                          p: 2,
                          borderRadius: '8px',
                          borderLeft: `4px solid ${colors.primaryColor}`
                        }}
                      >
                        {clinicInfo.indicaciones}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(Ubicacion);