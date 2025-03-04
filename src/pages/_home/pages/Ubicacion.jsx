import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Divider,
  Card,
  CardContent,
  Chip,
  Tooltip,
  useMediaQuery,
  useTheme,
  IconButton
} from '@mui/material';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  OpenInNew,
  LocationOn,
  AccessTime,
  Phone,
  Info,
  Navigation,
  Share,
  Map,
  Satellite,
  ZoomIn,
  ZoomOut,
  DirectionsWalk,
  LocationCity,
  Star
} from '@mui/icons-material';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const Ubicacion = () => {
  const { isDarkTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [map, setMap] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [mapView, setMapView] = useState('roadmap');
  const [isHovering, setIsHovering] = useState(false);
  const [mapZoom, setMapZoom] = useState(17);
  const [showPage, setShowPage] = useState(false);

  // Mostrar la página después de un breve retraso para la animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPage(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Información de la clínica
  const clinicInfo = {
    nombre: "Clínica Dental Carol",
    direccion: "Ixcatlan, Huejutla de Reyes, Hidalgo, México",
    telefono: "+52 789 123 4567",
    horario: "Lunes a Viernes: 9:00 - 19:00, Sábados: 9:00 - 14:00",
    indicaciones: "A una cuadra de la Plaza Principal, edificio con fachada azul",
    reseñas: "4.8/5 basado en 45 reseñas"
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
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
    { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
  ];

  // Estilos para el modo claro
  const lightMapStyle = [
    { featureType: "poi.medical", elementType: "labels", stylers: [{ visibility: "on", color: "#e74c3c" }] },
    { featureType: "poi.business", stylers: [{ visibility: "on" }] },
    { featureType: "poi.attraction", stylers: [{ visibility: "simplified" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#a0d6f7" }] },
    { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f2f2f2" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ lightness: 100 }] },
    { featureType: "road", elementType: "labels", stylers: [{ visibility: "simplified" }] },
    { featureType: "transit.line", stylers: [{ visibility: "on", lightness: 700 }] },
  ];

  // Colores dinámicos basados en el tema
  const colors = {
    cardBackground: isDarkTheme ? '#0A1929' : '#ffffff',
    primaryText: isDarkTheme ? '#ffffff' : '#0A1929',
    secondaryText: isDarkTheme ? '#A0AEC0' : '#546E7A',
    primaryColor: isDarkTheme ? '#4FC3F7' : '#0052CC',
    secondaryColor: isDarkTheme ? '#FF4081' : '#FF5252',
    accentColor: isDarkTheme ? '#FFC107' : '#FF9800',
    gradientStart: isDarkTheme ? '#0A1929' : '#F8FDFF',
    gradientEnd: isDarkTheme ? '#0F2942' : '#DDF4FF',
    cardShadow: isDarkTheme ? '0 10px 30px rgba(0, 0, 0, 0.5)' : '0 10px 30px rgba(0, 82, 204, 0.15)',
    buttonHover: isDarkTheme ? 'rgba(79, 195, 247, 0.15)' : 'rgba(0, 82, 204, 0.08)',
    divider: isDarkTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    chipBackground: isDarkTheme ? 'rgba(79, 195, 247, 0.15)' : 'rgba(0, 82, 204, 0.08)',
    backgroundPattern: isDarkTheme
      ? 'radial-gradient(circle at 30% 30%, rgba(25, 118, 210, 0.1) 0%, transparent 12%), radial-gradient(circle at 70% 60%, rgba(25, 118, 210, 0.08) 0%, transparent 10%)'
      : 'radial-gradient(circle at 30% 30%, rgba(25, 118, 210, 0.05) 0%, transparent 12%), radial-gradient(circle at 70% 60%, rgba(25, 118, 210, 0.03) 0%, transparent 10%)'
  };

  // Estilos del mapa
  const mapStyles = {
    height: "450px",
    width: "100%",
    borderRadius: "16px",
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

  // Funciones de control del mapa
  const toggleMapView = () => {
    setMapView(mapView === 'roadmap' ? 'satellite' : 'roadmap');
  };

  const zoomIn = () => {
    if (map && mapZoom < 20) {
      const newZoom = mapZoom + 1;
      map.setZoom(newZoom);
      setMapZoom(newZoom);
    }
  };

  const zoomOut = () => {
    if (map && mapZoom > 10) {
      const newZoom = mapZoom - 1;
      map.setZoom(newZoom);
      setMapZoom(newZoom);
    }
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
  const pageAnimationVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.4 }
    }
  };

  const titleAnimationVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        duration: 0.7
      }
    }
  };

  const mapContainerVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 12,
        duration: 0.8
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 12,
        duration: 0.8
      }
    },
    hover: {
      scale: 1.02,
      boxShadow: "0px 12px 30px rgba(0,0,0,0.2)",
      transition: { duration: 0.3 }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  const staggerItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const floatingIconVariants = {
    initial: { y: 0 },
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Renderizado de pantalla de carga
  if (!isLoaded) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="600px"
        sx={{
          background: isDarkTheme
            ? "linear-gradient(90deg, #1C2A38 0%, #2C3E50 100%)"
            : "linear-gradient(90deg, #ffffff 0%, #E5F3FD 100%)",
          backgroundSize: "cover",
          borderRadius: '16px',
          boxShadow: colors.cardShadow,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: colors.backgroundPattern,
            opacity: 0.6,
            zIndex: 0
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ zIndex: 1, textAlign: 'center' }}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 0, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <CircularProgress
              size={80}
              thickness={4}
              sx={{
                color: colors.primaryColor,
                mb: 4
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Typography
              variant="h4"
              sx={{
                color: colors.primaryText,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                textAlign: 'center',
                mb: 2
              }}
            >
              Cargando mapa
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: colors.secondaryText,
                fontFamily: 'Roboto, sans-serif',
                mt: 1,
                textAlign: 'center',
                maxWidth: '80%',
                mx: 'auto'
              }}
            >
              Estamos preparando la ubicación de Clínica Dental Carol para que puedas encontrarnos fácilmente.
            </Typography>

            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ marginTop: '24px' }}
            >
              <Typography variant="body2" color={colors.primaryColor}>
                Por favor, espera un momento...
              </Typography>
            </motion.div>
          </motion.div>
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
          background: isDarkTheme
            ? "linear-gradient(90deg, #1C2A38 0%, #2C3E50 100%)"
            : "linear-gradient(90deg, #ffffff 0%, #E5F3FD 100%)",
          borderRadius: '16px',
          boxShadow: colors.cardShadow,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            color="error"
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 600, mb: 3 }}
          >
            Error al cargar el mapa
          </Typography>

          <Typography
            color={colors.secondaryText}
            variant="body1"
            sx={{ mb: 3, maxWidth: '600px', mx: 'auto' }}
          >
            No se pudo cargar Google Maps. Por favor, verifica tu conexión a internet o intenta nuevamente más tarde.
          </Typography>

          <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
            <Button
              variant="contained"
              size="large"
              onClick={() => window.location.reload()}
              sx={{
                mt: 3,
                bgcolor: colors.primaryColor,
                boxShadow: '0 4px 15px rgba(79, 195, 247, 0.3)',
                px: 4,
                py: 1.5,
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: isDarkTheme ? '#29B6F6' : '#0039CB',
                }
              }}
            >
              Reintentar
            </Button>
          </motion.div>
        </motion.div>
      </Box>
    );
  }

  // Componente principal
  return (
    <AnimatePresence>
      {showPage && (
        <motion.div
          key="ubicacion-page"
          variants={pageAnimationVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            background: isDarkTheme
              ? "linear-gradient(90deg, #1C2A38 0%, #2C3E50 100%)"
              : "linear-gradient(90deg, #ffffff 0%, #E5F3FD 100%)",
            backgroundSize: "cover",
            backgroundAttachment: "fixed",
            minHeight: '90vh',
            width: '100%',
            padding: '2rem 1rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Fondo con patrón decorativo */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: colors.backgroundPattern,
              opacity: 0.6,
              top: 0,
              left: 0,
              zIndex: 0
            }}
          />

          <Box
            component="section"
            sx={{
              maxWidth: '1200px',
              width: '100%',
              margin: '0 auto',
              py: 4,
              px: { xs: 2, sm: 3, md: 4 },
              position: 'relative',
              zIndex: 1
            }}
          >
            {/* Título principal animado */}
            <motion.div variants={titleAnimationVariants}>
              <Typography
                variant={isMobile ? "h4" : "h3"}
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: colors.primaryText,
                  fontFamily: '"Montserrat", sans-serif',
                  letterSpacing: '0.5px',
                  textAlign: 'center',
                  mb: 4,
                  position: 'relative',
                  display: 'inline-block',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-10px',
                    left: '0',
                    width: '100%',
                    height: '4px',
                    background: `linear-gradient(90deg, ${colors.primaryColor}, ${colors.secondaryColor})`,
                    borderRadius: '2px',
                  }
                }}
              >
                Encuéntranos
                <motion.span
                  variants={floatingIconVariants}
                  initial="initial"
                  animate="animate"
                  style={{
                    display: 'inline-flex',
                    marginLeft: '8px',
                    verticalAlign: 'middle'
                  }}
                >
                  <LocationOn sx={{ color: colors.secondaryColor, fontSize: isMobile ? 32 : 36 }} />
                </motion.span>
              </Typography>
            </motion.div>

            <Grid container spacing={4} sx={{ mt: 1 }}>
              {/* Columna izquierda - Mapa */}
              <Grid item xs={12} md={8}>
                <motion.div variants={mapContainerVariants}>
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
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <LocationCity sx={{ color: colors.primaryColor }} />
                      Nuestra ubicación
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Acercar">
                        <IconButton
                          size="small"
                          onClick={zoomIn}
                          sx={{
                            color: colors.primaryColor,
                            bgcolor: colors.chipBackground,
                            '&:hover': {
                              bgcolor: colors.buttonHover
                            }
                          }}
                        >
                          <ZoomIn />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Alejar">
                        <IconButton
                          size="small"
                          onClick={zoomOut}
                          sx={{
                            color: colors.primaryColor,
                            bgcolor: colors.chipBackground,
                            '&:hover': {
                              bgcolor: colors.buttonHover
                            }
                          }}
                        >
                          <ZoomOut />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={mapView === 'roadmap' ? 'Ver satélite' : 'Ver mapa'}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={toggleMapView}
                          startIcon={mapView === 'roadmap' ? <Satellite /> : <Map />}
                          sx={{
                            borderColor: colors.primaryColor,
                            color: colors.primaryColor,
                            textTransform: 'none',
                            fontWeight: 500,
                            borderRadius: '8px',
                            ml: 1,
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
                    whileHover={{ boxShadow: "0 12px 40px rgba(0,0,0,0.15)" }}
                  >
                    {isLoaded && (
                      <GoogleMap
                        mapContainerStyle={{
                          ...mapStyles,
                          boxShadow: isHovering ?
                            `0 15px 35px rgba(${isDarkTheme ? '0,0,0,0.6' : '0,82,204,0.3'})`
                            : mapStyles.boxShadow
                        }}
                        zoom={mapZoom}
                        center={center}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                        options={{
                          zoomControl: false,
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
                          icon={{
                            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                            fillColor: colors.secondaryColor,
                            fillOpacity: 1,
                            strokeWeight: 1,
                            strokeColor: '#ffffff',
                            scale: 2,
                            anchor: new window.google.maps.Point(12, 22),
                          }}
                        />

                        {/* Ventana de información */}
                        {showInfoWindow && (
                          <InfoWindow
                            position={center}
                            onCloseClick={() => setShowInfoWindow(false)}
                            options={{
                              pixelOffset: new window.google.maps.Size(0, -35),
                              maxWidth: 300
                            }}
                          >
                            <Box sx={{ p: 1, maxWidth: 280 }}>
                              <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                sx={{
                                  mb: 1,
                                  color: "#0A1929",
                                  borderBottom: "2px solid #0052CC",
                                  pb: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}
                              >
                                <LocationCity fontSize="small" sx={{ color: "#0052CC" }} />
                                {clinicInfo.nombre}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  mb: 1,
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: 1
                                }}
                              >
                                <LocationOn sx={{ fontSize: 18, color: "#FF5252", mt: 0.3 }} />
                                <span>{clinicInfo.direccion}</span>
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  mb: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}
                              >
                                <AccessTime sx={{ fontSize: 16, color: "#4CAF50" }} />
                                <span style={{ color: "#4CAF50", fontWeight: 500 }}>Abierto ahora</span>
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  mb: 2,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}
                              >
                                <Star sx={{ fontSize: 16, color: "#FFC107" }} />
                                <span>{clinicInfo.reseñas}</span>
                              </Typography>
                
                            </Box>
                          </InfoWindow>
                        )}
                      </GoogleMap>
                    )}
                  </motion.div>

                  {/* Botones debajo del mapa */}
                  <motion.div
                    variants={staggerItemVariants}
                    style={{ marginTop: '24px' }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 2,
                        justifyContent: { xs: 'center', sm: 'flex-start' }
                      }}
                    >

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
                            borderRadius: '10px',
                            px: 3,
                            py: 1.2,
                            '&:hover': {
                              borderColor: colors.primaryColor,
                              backgroundColor: colors.buttonHover,
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 15px rgba(79, 195, 247, 0.15)',
                            },
                            fontFamily: 'Roboto, sans-serif',
                            fontWeight: 500
                          }}
                        >
                          Street View
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
                            borderRadius: '10px',
                            px: 3,
                            py: 1.2,
                            '&:hover': {
                              borderColor: colors.primaryColor,
                              backgroundColor: colors.buttonHover,
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 15px rgba(79, 195, 247, 0.15)',
                            },
                            fontFamily: 'Roboto, sans-serif',
                            fontWeight: 500
                          }}
                        >
                          Compartir
                        </Button>
                      </motion.div>
                    </Box>
                  </motion.div>
                </motion.div>
              </Grid>

              {/* Columna derecha - Información de contacto */}
              <Grid item xs={12} md={4}>
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <Card
                    elevation={0}
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
                        background: `linear-gradient(90deg, ${colors.primaryColor}, ${colors.secondaryColor})`,
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <motion.div variants={staggerItemVariants}>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: colors.primaryText,
                            fontFamily: '"Montserrat", sans-serif',
                            mb: 3,
                            pt: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          <Info sx={{ color: colors.primaryColor }} />
                          Información de Contacto
                        </Typography>
                      </motion.div>

                      <motion.div variants={staggerItemVariants}>
                        <Box sx={{ mb: 3 }}>
                          <Chip
                            label="Abierto ahora"
                            size="small"
                            color="success"
                            sx={{
                              fontWeight: 600,
                              mb: 2,
                              borderRadius: '6px'
                            }}
                          />

                          <Box
                            sx={{
                              p: 2,
                              borderRadius: '12px',
                              bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,82,204,0.03)',
                              mb: 3,
                              transition: 'transform 0.2s ease',
                              '&:hover': {
                                transform: 'translateX(5px)',
                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,82,204,0.05)',
                              }
                            }}
                          >
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
                                pl: 3.5
                              }}
                            >
                              {clinicInfo.direccion}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              p: 2,
                              borderRadius: '12px',
                              bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,82,204,0.03)',
                              mb: 3,
                              transition: 'transform 0.2s ease',
                              '&:hover': {
                                transform: 'translateX(5px)',
                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,82,204,0.05)',
                              }
                            }}
                          >
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
                                pl: 3.5,
                                textDecoration: 'none',
                                display: 'block',
                                fontWeight: 500,
                                '&:hover': {
                                  textDecoration: 'underline'
                                }
                              }}
                            >
                              {clinicInfo.telefono}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              p: 2,
                              borderRadius: '12px',
                              bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,82,204,0.03)',
                              mb: 3,
                              transition: 'transform 0.2s ease',
                              '&:hover': {
                                transform: 'translateX(5px)',
                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,82,204,0.05)',
                              }
                            }}
                          >
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
                                pl: 3.5
                              }}
                            >
                              {clinicInfo.horario}
                            </Typography>
                          </Box>
                        </Box>
                      </motion.div>

                      <Divider sx={{ my: 2, borderColor: colors.divider }} />

                      <motion.div variants={staggerItemVariants} style={{ marginTop: '24px' }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: '12px',
                            background: `linear-gradient(135deg, ${isDarkTheme ? 'rgba(79, 195, 247, 0.1)' : 'rgba(0, 82, 204, 0.05)'} 0%, ${isDarkTheme ? 'rgba(79, 195, 247, 0.05)' : 'rgba(0, 82, 204, 0.02)'} 100%)`,
                            border: `1px solid ${isDarkTheme ? 'rgba(79, 195, 247, 0.2)' : 'rgba(0, 82, 204, 0.1)'}`,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                          }}
                        >
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
                              lineHeight: 1.6
                            }}
                          >
                            {clinicInfo.indicaciones}
                          </Typography>

                          <motion.div
                            whileHover="hover"
                            whileTap="tap"
                            variants={buttonVariants}
                            style={{ marginTop: '16px', textAlign: 'center' }}
                          >
                            <Button
                              variant="contained"
                              size="medium"
                              startIcon={<Navigation />}
                              href={directionsLink}
                              target="_blank"
                              sx={{
                                textTransform: 'none',
                                bgcolor: isDarkTheme ? 'rgba(79, 195, 247, 0.9)' : colors.primaryColor,
                                color: '#fff',
                                fontWeight: 500,
                                borderRadius: '8px',
                                '&:hover': {
                                  bgcolor: isDarkTheme ? 'rgba(79, 195, 247, 1)' : '#003D9C',
                                }
                              }}
                            >
                              Obtener indicaciones
                            </Button>
                          </motion.div>
                        </Box>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(Ubicacion);