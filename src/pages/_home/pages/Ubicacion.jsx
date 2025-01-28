import React, { useState, useCallback, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { OpenInNew, LocationOn } from '@mui/icons-material';

const Ubicacion = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [map, setMap] = useState(null);
  const [loadError, setLoadError] = useState(null);
  // Theme detection
  useEffect(() => {
    const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(matchDarkTheme.matches);

    const handleThemeChange = (e) => {
      setIsDarkMode(e.matches);
    };

    matchDarkTheme.addEventListener('change', handleThemeChange);
    return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
  }, []);

  const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }
  ];

  const mapOptions = {
    zoomControl: true,
    streetViewControl: true, // Habilitamos el Street View
    mapTypeControl: true,    // Habilitamos el control de tipo de mapa
    fullscreenControl: true, // Habilitamos el control de pantalla completa
    styles: isDarkMode ? darkMapStyle : [],
    backgroundColor: isDarkMode ? '#242f3e' : '#ffffff',
    mapTypeId: 'roadmap',    // Tipo de mapa por defecto
    gestureHandling: 'cooperative', // Mejor control del zoom
    mapTypeControlOptions: {
      style: window.google?.maps?.MapTypeControlStyle?.DROPDOWN_MENU,
      position: window.google?.maps?.ControlPosition?.TOP_RIGHT,
    },
    streetViewControlOptions: {
      position: window.google?.maps?.ControlPosition?.RIGHT_BOTTOM,
    },
    zoomControlOptions: {
      position: window.google?.maps?.ControlPosition?.RIGHT_CENTER,
    },
  }

  const streetViewLink = `https://www.google.com/maps/@21.0816681,-98.5359763,19.64z`;

  const center = {
    lat: 21.081734,
    lng: -98.536002
  };


  const colors = {
    cardBackground: isDarkMode ? '#0D1B2A' : '#ffffff',
    primaryText: isDarkMode ? '#ffffff' : '#1a1a1a',
    secondaryText: isDarkMode ? '#A0AEC0' : '#666666',
    primaryColor: isDarkMode ? '#00BCD4' : '#1976d2',
  };

  // Configuración del mapa
  const mapStyles = {
    height: "400px",
    width: "100%",
    borderRadius: "8px",
    marginTop: "20px"
  };



  const { isLoaded, loadError: apiLoadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCjYgHzkG53-aSTcHJkAPYu98TIkGZ2d-w",
    timeout: 10000,
    onError: (error) => {
      console.error('Error cargando Google Maps:', error);
      setLoadError(error);
    }
  });

  // Callbacks para el mapa
  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const mapContainerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Manejo de errores
  if (loadError || apiLoadError) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: 'center',
          bgcolor: colors.cardBackground,
          borderRadius: '8px',
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography color="error" gutterBottom>
          Error al cargar el mapa. Por favor, verifica tu conexión a internet.
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Reintentar
        </Button>
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="400px"
        sx={{
          backgroundColor: colors.cardBackground,
          borderRadius: '8px',
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: colors.primaryColor,
            mb: 2
          }}
        />
        <Typography
          variant="h6"
          sx={{
            color: colors.secondaryText,
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          Cargando mapa...
        </Typography>
      </Box>
    );
  }

  return (
    <motion.div
      variants={mapContainerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box
        component="section"
        sx={{
          backgroundColor: colors.cardBackground,
          py: 8,
          borderRadius: '16px',
          boxShadow: isDarkMode
            ? '0 4px 20px rgba(0, 0, 0, 0.5)'
            : '0 4px 20px rgba(0, 0, 0, 0.1)',
          mb: 5,
          px: 3,
          transition: 'all 0.3s ease',
        }}
      >
        <GoogleMap
          mapContainerStyle={mapStyles}
          zoom={17}
          center={center}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
        >
          <Marker
            position={center}
            title="Clínica Dental Carol"
            icon={{
              path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
              fillColor: colors.primaryColor,
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#ffffff',
              scale: 2,
              anchor: new window.google.maps.Point(12, 22),
            }}
            animation={window.google.maps.Animation.DROP}
          />
        </GoogleMap>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'center',
            mt: 3
          }}
        >
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
                backgroundColor: isDarkMode ? 'rgba(0, 188, 212, 0.08)' : 'rgba(25, 118, 210, 0.08)',
              },
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 500
            }}
          >
            Ver en Street View
          </Button>

          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              const url = `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`;
              window.open(url, '_blank');
            }}
            startIcon={<LocationOn />}
            sx={{
              textTransform: 'none',
              borderColor: colors.primaryColor,
              color: colors.primaryColor,
              '&:hover': {
                borderColor: colors.primaryColor,
                backgroundColor: isDarkMode ? 'rgba(0, 188, 212, 0.08)' : 'rgba(25, 118, 210, 0.08)',
              },
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 500
            }}
          >
            Como Llegar
          </Button>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 3
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: colors.secondaryText,
              textAlign: 'center',
              fontFamily: 'Roboto, sans-serif',
              transition: 'color 0.3s ease',
              mb: 2
            }}
          >
            <strong style={{ color: colors.primaryText }}>
              Dirección:
            </strong> Ixcatlan, Huejutla de Reyes, Hidalgo, México.
          </Typography>

        </Box>
      </Box>
    </motion.div>
  );
};

export default React.memo(Ubicacion);