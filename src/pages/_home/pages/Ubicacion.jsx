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
  IconButton,
  Paper,
  Container
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
  Star,
  WhatsApp,
  CalendarMonth
} from '@mui/icons-material';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const UbicacionHorarios = () => {
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
  const [activeTab, setActiveTab] = useState('ubicacion');

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
    whatsapp: "+52 789 123 4567",
    indicaciones: "A una cuadra de la Plaza Principal, edificio con fachada azul",
    reseñas: "4.8/5 basado en 45 reseñas"
  };

  // Información de horarios
  const horarios = [
    { dia: "Lunes a Viernes", horas: "9:00 AM - 7:00 PM", estado: "abierto" },
    { dia: "Sábados", horas: "9:00 AM - 2:00 PM", estado: "abierto" },
    { dia: "Domingos", horas: "Cerrado", estado: "cerrado" }
  ];

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

  // Colores dinámicos basados en el tema (sin morados)
  const colors = {
    background: isDarkTheme
      ? "linear-gradient(90deg, #1C2A38 0%, #2C3E50 100%)"
      : "linear-gradient(90deg, #ffffff 0%, #E5F3FD 100%)",
    cardBackground: isDarkTheme ? '#0F1923' : '#ffffff',
    primaryText: isDarkTheme ? '#F1F5F9' : '#1E3A5F',
    secondaryText: isDarkTheme ? '#A0AEC0' : '#546E7A',
    primaryColor: isDarkTheme ? '#3B82F6' : '#2563EB',
    secondaryColor: isDarkTheme ? '#10B981' : '#059669',
    accentColor: isDarkTheme ? '#FFA726' : '#FF9800',
    gradientStart: isDarkTheme ? '#1E293B' : '#F8FDFF',
    gradientEnd: isDarkTheme ? '#0F172A' : '#DDF4FF',
    cardShadow: isDarkTheme ? '0 10px 30px rgba(0, 0, 0, 0.5)' : '0 10px 30px rgba(37, 99, 235, 0.15)',
    buttonHover: isDarkTheme ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.08)',
    divider: isDarkTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    chipBackground: isDarkTheme ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.08)',
    accentGradient: isDarkTheme
      ? "linear-gradient(90deg, #3B82F6, #60A5FA)"
      : "linear-gradient(90deg, #2563EB, #3B82F6)",
    success: isDarkTheme ? '#10B981' : '#059669',
    error: isDarkTheme ? '#F43F5E' : '#EF4444',
    mapBorder: isDarkTheme ? '#3B82F6' : '#2563EB',
    tabActive: isDarkTheme ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)',
    tabHover: isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.05)',
    backgroundPattern: isDarkTheme
      ? "radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 12%), radial-gradient(circle at 70% 60%, rgba(59, 130, 246, 0.08) 0%, transparent 10%)"
      : "radial-gradient(circle at 30% 30%, rgba(37, 99, 235, 0.05) 0%, transparent 12%), radial-gradient(circle at 70% 60%, rgba(37, 99, 235, 0.03) 0%, transparent 10%)"
  };

  // Estilos del mapa
  const mapStyles = {
    height: "450px",
    width: "100%",
    borderRadius: "16px",
    marginTop: "20px",
    boxShadow: colors.cardShadow,
    border: `2px solid ${colors.mapBorder}`,
  };

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

  // Estilos para el mapa en modo claro
  const lightMapStyle = [
    { featureType: "poi.medical", elementType: "labels", stylers: [{ visibility: "on", color: "#2563EB" }] },
    { featureType: "poi.business", stylers: [{ visibility: "on" }] },
    { featureType: "poi.attraction", stylers: [{ visibility: "simplified" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#a0d6f7" }] },
    { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f2f2f2" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ lightness: 100 }] },
    { featureType: "road", elementType: "labels", stylers: [{ visibility: "simplified" }] },
    { featureType: "transit.line", stylers: [{ visibility: "on", lightness: 700 }] },
  ];

  // Enlaces externos
  const streetViewLink = `https://www.google.com/maps/@21.0816681,-98.5359763,19.64z`;
  const directionsLink = `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`;
  const whatsappLink = `https://wa.me/${clinicInfo.whatsapp.replace(/\D/g, '')}`;

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

  const contentAnimationVariants = {
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
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
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

  const tabItemVariants = {
    inactive: {
      color: colors.secondaryText,
      backgroundColor: 'transparent'
    },
    active: {
      color: colors.primaryColor,
      backgroundColor: colors.tabActive
    },
    hover: {
      backgroundColor: colors.tabHover,
      scale: 1.05
    }
  };

  // Formateador de números telefónicos
  const formatPhoneLink = (phone) => {
    return `tel:${phone.replace(/\D/g, '')}`;
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
          background: colors.background,
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
          background: colors.background,
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
                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
                px: 4,
                py: 1.5,
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: isDarkTheme ? '#60A5FA' : '#1E40AF',
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
          key="ubicacion-horarios-page"
          variants={pageAnimationVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            background: colors.background,
            backgroundSize: "cover",
            minHeight: '90vh',
            width: '100%',
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

          <Container maxWidth="lg" sx={{ py: 5, position: 'relative', zIndex: 1 }}>
            {/* Título principal animado */}
            <motion.div variants={titleAnimationVariants}>
              <Typography
                variant={isMobile ? "h4" : "h3"}
                component="h1"
                align="center"
                sx={{
                  fontWeight: 800,
                  color: colors.primaryText,
                  letterSpacing: '-0.02em',
                  mb: 1,
                  position: 'relative',
                  display: 'inline-block',
                  left: '50%',
                  transform: 'translateX(-50%)'
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

              <Typography
                variant="subtitle1"
                align="center"
                sx={{
                  color: colors.secondaryText,
                  maxWidth: '700px',
                  mx: 'auto',
                  mb: 5,
                  fontSize: '1.1rem'
                }}
              >
                Te facilitamos toda la información para que puedas visitarnos y recibir nuestra atención dental de calidad
              </Typography>
            </motion.div>

            {/* Tabs para cambiar entre Ubicación y Horarios en móvil */}
            {isMobile && (
              <motion.div variants={staggerItemVariants}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 4,
                    borderRadius: '12px',
                    backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    p: 0.7
                  }}
                >
                  <motion.div
                    animate={activeTab === 'ubicacion' ? 'active' : 'inactive'}
                    whileHover="hover"
                    variants={tabItemVariants}
                    style={{
                      borderRadius: '10px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      flex: 1,
                      textAlign: 'center'
                    }}
                    onClick={() => setActiveTab('ubicacion')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <LocationOn fontSize="small" />
                      <Typography variant="button" fontWeight={600}>
                        Ubicación
                      </Typography>
                    </Box>
                  </motion.div>

                  <motion.div
                    animate={activeTab === 'horarios' ? 'active' : 'inactive'}
                    whileHover="hover"
                    variants={tabItemVariants}
                    style={{
                      borderRadius: '10px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      flex: 1,
                      textAlign: 'center'
                    }}
                    onClick={() => setActiveTab('horarios')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <CalendarMonth fontSize="small" />
                      <Typography variant="button" fontWeight={600}>
                        Horarios
                      </Typography>
                    </Box>
                  </motion.div>
                </Box>
              </motion.div>
            )}

            {/* PRIMERA SECCIÓN: MAPA E INFO DE CONTACTO */}
            {(!isMobile || activeTab === 'ubicacion') && (
              <Grid container spacing={4}>
                {/* Mapa */}
                <Grid item xs={12} md={8}>
                  <motion.div variants={contentAnimationVariants}>
                    <Card
                      elevation={0}
                      sx={{
                        backgroundColor: colors.cardBackground,
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: colors.cardShadow,
                        border: `1px solid ${colors.divider}`,
                        height: '100%',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '5px',
                          background: colors.accentGradient
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        {/* Título del mapa */}
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 3
                          }}
                        >
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 700,
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
                          <GoogleMap
                            mapContainerStyle={{
                              ...mapStyles,
                              boxShadow: isHovering ?
                                `0 15px 35px rgba(${isDarkTheme ? '0,0,0,0.6' : '37,99,235,0.3'})`
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
                                      color: "#1E3A5F",
                                      borderBottom: "2px solid #2563EB",
                                      pb: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1
                                    }}
                                  >
                                    <LocationCity fontSize="small" sx={{ color: "#2563EB" }} />
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
                                    <LocationOn sx={{ fontSize: 18, color: "#059669", mt: 0.3 }} />
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
                                    <AccessTime sx={{ fontSize: 16, color: "#059669" }} />
                                    <span style={{ color: "#059669", fontWeight: 500 }}>Abierto ahora</span>
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
                                    <Star sx={{ fontSize: 16, color: "#FF9800" }} />
                                    <span>{clinicInfo.reseñas}</span>
                                  </Typography>
                                </Box>
                              </InfoWindow>
                            )}
                          </GoogleMap>
                        </motion.div>

                        {/* Acciones del mapa */}
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
                                  boxShadow: '0 6px 15px rgba(37, 99, 235, 0.15)',
                                },
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
                                  boxShadow: '0 6px 15px rgba(37, 99, 235, 0.15)',
                                },
                                fontWeight: 500
                              }}
                            >
                              Compartir
                            </Button>
                          </motion.div>

                          <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                            <Button
                              variant="contained"
                              color="primary"
                              href={directionsLink}
                              target="_blank"
                              startIcon={<Navigation />}
                              sx={{
                                textTransform: 'none',
                                background: colors.accentGradient,
                                color: 'white',
                                borderRadius: '10px',
                                px: 3,
                                py: 1.2,
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 6px 15px rgba(37, 99, 235, 0.25)',
                                },
                                fontWeight: 500
                              }}
                            >
                              Cómo llegar
                            </Button>
                          </motion.div>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>

                {/* Información de contacto */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ mb: 4 }}>
                    <motion.div variants={cardVariants} whileHover="hover">
                      <Card
                        elevation={0}
                        sx={{
                          backgroundColor: colors.cardBackground,
                          borderRadius: '16px',
                          overflow: 'hidden',
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
                            background: colors.accentGradient
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
                                sx={{
                                  fontWeight: 600,
                                  mb: 2,
                                  borderRadius: '6px',
                                  backgroundColor: colors.success,
                                  color: 'white'
                                }}
                              />

                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: '12px',
                                  bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(37,99,235,0.03)',
                                  mb: 3,
                                  transition: 'transform 0.2s ease',
                                  '&:hover': {
                                    transform: 'translateX(5px)',
                                    bgcolor: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(37,99,235,0.05)',
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
                                  {clinicInfo.direccion}
                                </Typography>
                              </Box>

                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: '12px',
                                  bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(37,99,235,0.03)',
                                  mb: 3,
                                  transition: 'transform 0.2s ease',
                                  '&:hover': {
                                    transform: 'translateX(5px)',
                                    bgcolor: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(37,99,235,0.05)',
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
                                  <Navigation color="primary" fontSize="small" />
                                  Cómo llegar
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    color: colors.secondaryText,
                                    pl: 3.5,
                                    lineHeight: 1.6
                                  }}
                                >
                                  Ubicados frente a la tienda de abarrotes "La Esperanza", a una cuadra de la Plaza Principal. Edificio con fachada azul y puerta blanca.
                                </Typography>
                              </Box>
                            </Box>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Box>
                </Grid>
              </Grid>
            )}

            {/* SEGUNDA SECCIÓN: SECCIÓN DE HORARIOS SIEMPRE DEBAJO */}
            <Grid container sx={{ mt: 4 }}>
              <Grid item xs={12}>
                {(!isMobile || activeTab === 'horarios') && (
                  <motion.div variants={contentAnimationVariants}>
                    <Card
                      elevation={0}
                      sx={{
                        backgroundColor: colors.cardBackground,
                        borderRadius: '16px',
                        overflow: 'hidden',
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
                          background: colors.accentGradient
                        }
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <motion.div variants={titleAnimationVariants}>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 700,
                              color: colors.primaryText,
                              mb: 4,
                              pt: 1,
                              textAlign: 'center',
                              position: 'relative',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: '-12px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '80px',
                                height: '3px',
                                background: colors.accentGradient,
                                borderRadius: '2px',
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
                              <AccessTime sx={{ color: colors.primaryColor }} />
                              Calendario de Atención
                            </Box>
                          </Typography>
                        </motion.div>

                        {/* Diseño mejorado para horarios horizontales */}
                        <motion.div variants={staggerItemVariants}>
                          <Box
                            sx={{
                              maxWidth: '900px',
                              mx: 'auto',
                              mb: 3,
                              px: 2
                            }}
                          >
                            <Grid container spacing={3} justifyContent="center">
                              {horarios.map((item, index) => (
                                <Grid item xs={12} sm={4} key={index}>
                                  <motion.div
                                    whileHover={{ y: -8, boxShadow: "0 12px 25px rgba(0,0,0,0.1)" }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <Paper
                                      elevation={0}
                                      sx={{
                                        height: '100%',
                                        p: 3,
                                        borderRadius: '14px',
                                        border: `1px solid ${colors.divider}`,
                                        transition: 'all 0.2s ease',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        boxShadow: isDarkTheme ? '0 6px 15px rgba(0,0,0,0.2)' : '0 6px 15px rgba(37,99,235,0.08)',
                                        background: item.estado === 'abierto'
                                          ? (isDarkTheme ? 'linear-gradient(145deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.02) 100%)' : 'linear-gradient(145deg, rgba(16, 185, 129, 0.03) 0%, rgba(5, 150, 105, 0.01) 100%)')
                                          : (isDarkTheme ? 'linear-gradient(145deg, rgba(244, 63, 94, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%)' : 'linear-gradient(145deg, rgba(244, 63, 94, 0.03) 0%, rgba(239, 68, 68, 0.01) 100%)'),
                                        '&::before': {
                                          content: '""',
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          width: '100%',
                                          height: '5px',
                                          background: item.estado === 'abierto'
                                            ? (isDarkTheme ? 'linear-gradient(90deg, #10B981, #059669)' : 'linear-gradient(90deg, #059669, #10B981)')
                                            : (isDarkTheme ? 'linear-gradient(90deg, #F43F5E, #EF4444)' : 'linear-gradient(90deg, #EF4444, #F43F5E)')
                                        }
                                      }}
                                    >
                                      {/* Día de la semana con ícono */}
                                      <Box sx={{ mb: 3, textAlign: 'center' }}>
                                        <Typography
                                          variant="h5"
                                          sx={{
                                            fontWeight: 700,
                                            color: colors.primaryText,
                                            mb: 1
                                          }}
                                        >
                                          {item.dia}
                                        </Typography>

                                        <Chip
                                          label={item.estado === 'abierto' ? 'Abierto' : 'Cerrado'}
                                          size="small"
                                          sx={{
                                            fontWeight: 600,
                                            backgroundColor: item.estado === 'abierto'
                                              ? 'rgba(5, 150, 105, 0.15)'
                                              : 'rgba(239, 68, 68, 0.15)',
                                            color: item.estado === 'abierto' ? colors.success : colors.error,
                                            fontSize: '0.75rem',
                                            height: 24,
                                            px: 1
                                          }}
                                        />
                                      </Box>

                                      {/* Horario con animación */}
                                      <Box
                                        sx={{
                                          width: '100%',
                                          py: 2,
                                          px: 3,
                                          borderRadius: '10px',
                                          background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(37,99,235,0.05)',
                                          textAlign: 'center',
                                          position: 'relative',
                                          overflow: 'hidden'
                                        }}
                                      >
                                        {/* Indicador pulsante para horario abierto */}
                                        {item.estado === 'abierto' && (
                                          <motion.div
                                            style={{
                                              position: 'absolute',
                                              top: 10,
                                              right: 10,
                                              width: 8,
                                              height: 8,
                                              borderRadius: '50%',
                                              background: colors.success
                                            }}
                                            animate={{
                                              scale: [1, 1.5, 1],
                                              opacity: [0.7, 1, 0.7]
                                            }}
                                            transition={{
                                              duration: 2,
                                              repeat: Infinity,
                                              ease: "easeInOut"
                                            }}
                                          />
                                        )}

                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                                          <AccessTime
                                            sx={{
                                              color: item.estado === 'abierto' ? colors.success : colors.error,
                                              fontSize: '1.5rem'
                                            }}
                                          />
                                          <Typography
                                            variant="h6"
                                            sx={{
                                              fontWeight: 600,
                                              color: colors.primaryText,
                                              fontSize: '1.1rem'
                                            }}
                                          >
                                            {item.horas}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </Paper>
                                  </motion.div>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        </motion.div>

                        {/* Información para pacientes */}
                        <motion.div variants={staggerItemVariants}>
                          <Box
                            sx={{
                              p: 3,
                              borderRadius: '12px',
                              background: `linear-gradient(to right, ${isDarkTheme ? 'rgba(59, 130, 246, 0.08)' : 'rgba(37, 99, 235, 0.03)'} 0%, ${isDarkTheme ? 'rgba(59, 130, 246, 0.03)' : 'rgba(37, 99, 235, 0.01)'} 100%)`,
                              border: `1px solid ${isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.05)'}`,
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 2,
                              maxWidth: '900px',
                              mx: 'auto'
                            }}
                          >
                            <Info color="primary" sx={{ fontSize: 22, mt: 0.3 }} />
                            <Box>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 600,
                                  color: colors.primaryText,
                                  mb: 0.5
                                }}
                              >
                                Información para pacientes
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: colors.secondaryText,
                                  lineHeight: 1.6
                                }}
                              >
                                Para una mejor atención, recomendamos agendar cita con anticipación. En caso de urgencias, por favor llame directamente al consultorio.
                              </Typography>
                            </Box>
                          </Box>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </Grid>
            </Grid>
          </Container>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(UbicacionHorarios);