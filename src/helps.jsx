import React, { useState, useCallback, useEffect, useMemo, memo } from 'react';
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

// Extraer estilos de mapa para evitar recalcularlos en cada renderizado
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

// Información de la clínica - Constante para evitar recreación
const CLINIC_INFO = {
  nombre: "Clínica Dental Carol",
  direccion: "Ixcatlan, Huejutla de Reyes, Hidalgo, México",
  telefono: "+52 789 123 4567",
  horario: "Lunes a Viernes: 9:00 - 19:00, Sábados: 9:00 - 14:00",
  indicaciones: "A una cuadra de la Plaza Principal, edificio con fachada azul",
  reseñas: "4.8/5 basado en 45 reseñas"
};

// Centro del mapa (coordenadas de la clínica) - constante
const MAP_CENTER = {
  lat: 21.081734,
  lng: -98.536002
};

// Enlaces predefinidos como constantes
const STREET_VIEW_LINK = `https://www.google.com/maps/@21.0816681,-98.5359763,19.64z`;
const DIRECTIONS_LINK = `https://www.google.com/maps/search/?api=1&query=${MAP_CENTER.lat},${MAP_CENTER.lng}`;

// Predefinir variantes de animación para evitar recrearlas
const pageAnimationVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      when: "beforeChildren",
      staggerChildren: 0.1 // Reducido para mejorar rendimiento
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 } // Reducido para mejorar rendimiento
  }
};

const titleAnimationVariants = {
  hidden: { opacity: 0, y: -20 }, // Reducido el desplazamiento
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 70, // Reducido para mejorar rendimiento
      damping: 10,
      duration: 0.5
    }
  }
};

const mapContainerVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 }, // Ajustados los valores
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 40, // Reducido para mejor rendimiento
      damping: 10,
      duration: 0.6
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, x: 20, scale: 0.97 }, // Reducido el desplazamiento
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 40,
      damping: 10,
      duration: 0.6
    }
  },
  hover: {
    scale: 1.01, // Reducido para mejor rendimiento
    boxShadow: "0px 8px 20px rgba(0,0,0,0.15)", // Menos intenso
    transition: { duration: 0.2 }
  }
};

const buttonVariants = {
  hover: { scale: 1.03, transition: { duration: 0.15 } }, // Valores reducidos
  tap: { scale: 0.97 }
};

const staggerItemVariants = {
  hidden: { opacity: 0, y: 10 }, // Reducido el desplazamiento
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 70,
      damping: 10
    }
  }
};

const floatingIconVariants = {
  initial: { y: 0 },
  animate: {
    y: [-3, 3, -3], // Reducido el rango de animación
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Componente principal
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

  // Reducir retrasos de animaciones para mejorar la percepción de velocidad
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPage(true);
    }, 200); // Reducido de 300ms

    return () => clearTimeout(timer);
  }, []);

  // Memoizar objetos de colores para evitar recálculos innecesarios
  const colors = useMemo(() => ({
    cardBackground: isDarkTheme ? '#0A1929' : '#ffffff',
    primaryText: isDarkTheme ? '#ffffff' : '#0A1929',
    secondaryText: isDarkTheme ? '#A0AEC0' : '#546E7A',
    primaryColor: isDarkTheme ? '#4FC3F7' : '#0052CC',
    secondaryColor: isDarkTheme ? '#FF4081' : '#FF5252',
    accentColor: isDarkTheme ? '#FFC107' : '#FF9800',
    gradientStart: isDarkTheme ? '#0A1929' : '#F8FDFF',
    gradientEnd: isDarkTheme ? '#0F2942' : '#DDF4FF',
    cardShadow: isDarkTheme ? '0 8px 20px rgba(0, 0, 0, 0.4)' : '0 8px 20px rgba(0, 82, 204, 0.12)',
    buttonHover: isDarkTheme ? 'rgba(79, 195, 247, 0.15)' : 'rgba(0, 82, 204, 0.08)',
    divider: isDarkTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    chipBackground: isDarkTheme ? 'rgba(79, 195, 247, 0.15)' : 'rgba(0, 82, 204, 0.08)',
    backgroundPattern: isDarkTheme
      ? 'radial-gradient(circle at 30% 30%, rgba(25, 118, 210, 0.08) 0%, transparent 10%), radial-gradient(circle at 70% 60%, rgba(25, 118, 210, 0.06) 0%, transparent 8%)'
      : 'radial-gradient(circle at 30% 30%, rgba(25, 118, 210, 0.04) 0%, transparent 10%), radial-gradient(circle at 70% 60%, rgba(25, 118, 210, 0.02) 0%, transparent 8%)'
  }), [isDarkTheme]);

  // Memoizar estilos del mapa para evitar recreación
  const mapStyles = useMemo(() => ({
    height: "450px",
    width: "100%",
    borderRadius: "16px",
    marginTop: "20px",
    boxShadow: colors.cardShadow,
    border: `2px solid ${colors.primaryColor}`,
  }), [colors.cardShadow, colors.primaryColor]);

  // Cargar la API de Google Maps con opciones de retención
  const { isLoaded, loadError: apiLoadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCjYgHzkG53-aSTcHJkAPYu98TIkGZ2d-w",
    timeout: 10000,
    retries: 2,
    onError: (error) => {
      console.error('Error cargando Google Maps:', error);
      setLoadError(error);
    }
  });

  // Callbacks optimizados para el mapa
  const onLoad = useCallback((map) => {
    setMap(map);
    // Animar con menos intensidad
    map.setZoom(16);
    setTimeout(() => map.setZoom(17), 500);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Funciones de control del mapa
  const toggleMapView = useCallback(() => {
    setMapView(prev => prev === 'roadmap' ? 'satellite' : 'roadmap');
  }, []);

  const zoomIn = useCallback(() => {
    if (map && mapZoom < 20) {
      const newZoom = mapZoom + 1;
      map.setZoom(newZoom);
      setMapZoom(newZoom);
    }
  }, [map, mapZoom]);

  const zoomOut = useCallback(() => {
    if (map && mapZoom > 10) {
      const newZoom = mapZoom - 1;
      map.setZoom(newZoom);
      setMapZoom(newZoom);
    }
  }, [map, mapZoom]);

  // Compartir ubicación optimizado
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: CLINIC_INFO.nombre,
          text: `Ubicación de ${CLINIC_INFO.nombre}: ${CLINIC_INFO.direccion}`,
          url: DIRECTIONS_LINK,
        });
      } catch (error) {
        navigator.clipboard.writeText(DIRECTIONS_LINK);
        alert('¡Enlace copiado al portapapeles!');
      }
    } else {
      navigator.clipboard.writeText(DIRECTIONS_LINK);
      alert('¡Enlace copiado al portapapeles!');
    }
  }, []);

  // Memoizar opciones del mapa para evitar recreación
  const mapOptions = useMemo(() => ({
    zoomControl: false,
    streetViewControl: true,
    mapTypeControl: false,
    fullscreenControl: true,
    styles: isDarkTheme ? darkMapStyle : lightMapStyle,
    backgroundColor: isDarkTheme ? '#242f3e' : '#ffffff',
    mapTypeId: mapView,
    gestureHandling: 'cooperative',
    // Desactivar elementos innecesarios para mejorar rendimiento
    disableDefaultUI: false,
    clickableIcons: false,
  }), [isDarkTheme, mapView]);

  // Renderizado de pantalla de carga optimizado
  if (!isLoaded) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="500px" // Reducido para mejorar rendimiento
        sx={{
          background: isDarkTheme
            ? "linear-gradient(90deg, #1C2A38 0%, #2C3E50 100%)"
            : "linear-gradient(90deg, #ffffff 0%, #E5F3FD 100%)",
          borderRadius: '16px',
          boxShadow: colors.cardShadow,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <CircularProgress
          size={60} // Reducido para mejor rendimiento
          thickness={4}
          sx={{ color: colors.primaryColor, mb: 3 }}
        />

        <Typography
          variant="h5"
          sx={{
            color: colors.primaryText,
            fontWeight: 600,
            textAlign: 'center',
            mb: 1
          }}
        >
          Cargando mapa
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: colors.secondaryText,
            mt: 1,
            textAlign: 'center',
            maxWidth: '80%',
            mx: 'auto'
          }}
        >
          Estamos preparando la ubicación de Clínica Dental Carol.
        </Typography>
      </Box>
    );
  }

  // Renderizado de pantalla de error simplificado
  if (loadError || apiLoadError) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: 'center',
          background: isDarkTheme
            ? "linear-gradient(90deg, #1C2A38 0%, #2C3E50 100%)"
            : "linear-gradient(90deg, #ffffff 0%, #E5F3FD 100%)",
          borderRadius: '16px',
          boxShadow: colors.cardShadow,
        }}
      >
        <Typography
          color="error"
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 600, mb: 2 }}
        >
          Error al cargar el mapa
        </Typography>

        <Typography
          color={colors.secondaryText}
          variant="body1"
          sx={{ mb: 2, maxWidth: '600px', mx: 'auto' }}
        >
          No se pudo cargar Google Maps. Verifica tu conexión a internet.
        </Typography>

        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          sx={{
            mt: 2,
            bgcolor: colors.primaryColor,
            px: 3,
            py: 1,
            borderRadius: '8px',
            '&:hover': {
              bgcolor: isDarkTheme ? '#29B6F6' : '#0039CB',
            }
          }}
        >
          Reintentar
        </Button>
      </Box>
    );
  }

  // Componente principal con optimizaciones de rendimiento
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
            minHeight: '90vh',
            width: '100%',
            padding: isMobile ? '1.5rem 1rem' : '2rem 1rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Fondo simplificado con menos elementos decorativos */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: colors.backgroundPattern,
              opacity: 0.5,
              top: 0,
              left: 0,
              zIndex: 0,
              pointerEvents: 'none', // Mejora de rendimiento
            }}
          />

          <Box
            component="section"
            sx={{
              maxWidth: '1200px',
              width: '100%',
              margin: '0 auto',
              py: isMobile ? 2 : 3,
              px: { xs: 1.5, sm: 2, md: 3 },
              position: 'relative',
              zIndex: 1
            }}
          >
            {/* Título principal con animaciones más ligeras */}
            <motion.div variants={titleAnimationVariants}>
              <Typography
                variant={isMobile ? "h4" : "h3"}
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: colors.primaryText,
                  letterSpacing: '0.5px',
                  textAlign: 'center',
                  mb: 3,
                  position: 'relative',
                  display: 'inline-block',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-8px',
                    left: '0',
                    width: '100%',
                    height: '3px',
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
                  <LocationOn sx={{ color: colors.secondaryColor, fontSize: isMobile ? 30 : 34 }} />
                </motion.span>
              </Typography>
            </motion.div>

            <Grid container spacing={isMobile ? 3 : 4} sx={{ mt: 1 }}>
              {/* Columna izquierda - Mapa con menos elementos UI */}
              <Grid item xs={12} md={8}>
                <motion.div variants={mapContainerVariants}>
                  {/* Panel de controles del mapa simplificado */}
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
                          }}
                        >
                          <ZoomOut />
                        </IconButton>
                      </Tooltip>

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={toggleMapView}
                        startIcon={mapView === 'roadmap' ? <Satellite /> : <Map />}
                        sx={{
                          borderColor: colors.primaryColor,
                          color: colors.primaryColor,
                          textTransform: 'none',
                          borderRadius: '8px',
                          ml: 1
                        }}
                      >
                        {mapView === 'roadmap' ? 'Satélite' : 'Mapa'}
                      </Button>
                    </Box>
                  </Box>

                  {/* Contenedor del mapa con animación simplificada */}
                  <motion.div
                    onHoverStart={() => setIsHovering(true)}
                    onHoverEnd={() => setIsHovering(false)}
                    animate={isHovering ? { scale: 1.005 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isLoaded && (
                      <GoogleMap
                        mapContainerStyle={{
                          ...mapStyles,
                          boxShadow: isHovering ?
                            `0 12px 25px rgba(${isDarkTheme ? '0,0,0,0.5' : '0,82,204,0.2'})`
                            : mapStyles.boxShadow
                        }}
                        zoom={mapZoom}
                        center={MAP_CENTER}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                        options={mapOptions}
                      >
                        <Marker
                          position={MAP_CENTER}
                          title={CLINIC_INFO.nombre}
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

                        {/* Ventana de información simplificada */}
                        {showInfoWindow && (
                          <InfoWindow
                            position={MAP_CENTER}
                            onCloseClick={() => setShowInfoWindow(false)}
                            options={{
                              pixelOffset: new window.google.maps.Size(0, -35),
                              maxWidth: 280
                            }}>
                            <Box sx={{ p: 1, maxWidth: 270 }}>
                              <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                sx={{
                                  mb: 1,
                                  color: "#0A1929",
                                  borderBottom: "2px solid #0052CC",
                                  pb: 0.5,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}
                              >
                                <LocationCity fontSize="small" sx={{ color: "#0052CC" }} />
                                {CLINIC_INFO.nombre}
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
                                <span>{CLINIC_INFO.direccion}</span>
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
                              <Button
                                size="small"
                                variant="contained"
                                fullWidth
                                href={DIRECTIONS_LINK}
                                target="_blank"
                                startIcon={<DirectionsWalk />}
                                sx={{
                                  textTransform: 'none',
                                  bgcolor: "#0052CC",
                                  borderRadius: '8px',
                                  mt: 1,
                                  '&:hover': {
                                    bgcolor: "#003D9C"
                                  }
                                }}
                              >
                                Cómo llegar
                              </Button>
                            </Box>
                          </InfoWindow>
                        )}
                      </GoogleMap>
                    )}
                  </motion.div>

                  {/* Botones debajo del mapa simplificados */}
                  <motion.div
                    variants={staggerItemVariants}
                    style={{ marginTop: '20px' }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 2,
                        justifyContent: { xs: 'center', sm: 'flex-start' }
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        href={DIRECTIONS_LINK}
                        target="_blank"
                        startIcon={<Navigation />}
                        sx={{
                          textTransform: 'none',
                          backgroundColor: colors.primaryColor,
                          fontWeight: 500,
                          borderRadius: '10px',
                          px: 3,
                          py: 1,
                          '&:hover': {
                            backgroundColor: isDarkTheme ? '#29B6F6' : '#0039CB',
                          }
                        }}
                      >
                        Cómo Llegar
                      </Button>

                      <Button
                        variant="outlined"
                        color="primary"
                        href={STREET_VIEW_LINK}
                        target="_blank"
                        startIcon={<OpenInNew />}
                        sx={{
                          textTransform: 'none',
                          borderColor: colors.primaryColor,
                          color: colors.primaryColor,
                          borderRadius: '10px',
                          px: 3,
                          py: 1,
                        }}
                      >
                        Street View
                      </Button>

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
                          py: 1,
                        }}
                      >
                        Compartir
                      </Button>
                    </Box>
                  </motion.div>
                </motion.div>
              </Grid>

              {/* Columna derecha - Información de contacto simplificada */}
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
                        height: '5px',
                        background: `linear-gradient(90deg, ${colors.primaryColor}, ${colors.secondaryColor})`,
                      }
                    }}
                  >
                    <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                      <motion.div variants={staggerItemVariants}>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: colors.primaryText,
                            mb: 2,
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
                        <Box sx={{ mb: 2 }}>
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

                          {/* Dirección - simplificado */}
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: '12px',
                              bgcolor: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(0,82,204,0.03)',
                              mb: 2,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateX(4px)',
                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,82,204,0.05)',
                              }
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 600,
                                color: colors.primaryText,
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
                                pl: 3.5
                              }}
                            >
                              {CLINIC_INFO.direccion}
                            </Typography>
                          </Box>

                          {/* Teléfono - simplificado */}
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: '12px',
                              bgcolor: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(0,82,204,0.03)',
                              mb: 2,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateX(4px)',
                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,82,204,0.05)',
                              }
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 600,
                                color: colors.primaryText,
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
                              href={`tel:${CLINIC_INFO.telefono}`}
                              sx={{
                                color: colors.primaryColor,
                                pl: 3.5,
                                textDecoration: 'none',
                                display: 'block',
                                fontWeight: 500,
                                '&:hover': {
                                  textDecoration: 'underline'
                                }
                              }}
                            >
                              {CLINIC_INFO.telefono}
                            </Typography>
                          </Box>

                          {/* Horario - simplificado */}
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: '12px',
                              bgcolor: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(0,82,204,0.03)',
                              mb: 2,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateX(4px)',
                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,82,204,0.05)',
                              }
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 600,
                                color: colors.primaryText,
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
                                pl: 3.5
                              }}
                            >
                              {CLINIC_INFO.horario}
                            </Typography>
                          </Box>
                        </Box>
                      </motion.div>

                      <Divider sx={{ my: 2, borderColor: colors.divider }} />

                      {/* Sección de "Cómo encontrarnos" simplificada */}
                      <motion.div variants={staggerItemVariants} style={{ marginTop: '16px' }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: '12px',
                            background: `linear-gradient(135deg, ${isDarkTheme ? 'rgba(79, 195, 247, 0.08)' : 'rgba(0, 82, 204, 0.04)'} 0%, ${isDarkTheme ? 'rgba(79, 195, 247, 0.04)' : 'rgba(0, 82, 204, 0.02)'} 100%)`,
                            border: `1px solid ${isDarkTheme ? 'rgba(79, 195, 247, 0.15)' : 'rgba(0, 82, 204, 0.08)'}`,
                            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.03)'
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              color: colors.primaryText,
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
                              lineHeight: 1.5
                            }}
                          >
                            {CLINIC_INFO.indicaciones}
                          </Typography>

                          <Button
                            variant="contained"
                            size="medium"
                            startIcon={<Navigation />}
                            href={DIRECTIONS_LINK}
                            target="_blank"
                            sx={{
                              textTransform: 'none',
                              bgcolor: isDarkTheme ? 'rgba(79, 195, 247, 0.9)' : colors.primaryColor,
                              color: '#fff',
                              fontWeight: 500,
                              borderRadius: '8px',
                              mt: 2,
                              '&:hover': {
                                bgcolor: isDarkTheme ? 'rgba(79, 195, 247, 1)' : '#003D9C',
                              }
                            }}
                          >
                            Obtener indicaciones
                          </Button>
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

// Exportar componente memorizando para evitar renderizados innecesarios
export default memo(Ubicacion);