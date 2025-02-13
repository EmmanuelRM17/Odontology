import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Container,
  Grid,
  CircularProgress,
  useTheme,
  Paper,
  IconButton
} from '@mui/material';
import { Phone, Email, LocationOn, WhatsApp, ArrowBack, OpenInNew } from '@mui/icons-material';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Contacto = () => {
  const theme = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [empresa, setEmpresa] = useState({
    nombre_empresa: 'Nombre de la Empresa',
    slogan: 'Slogan de la empresa',
    telefono: 'Teléfono',
    correo_electronico: 'correo@ejemplo.com',
    direccion: 'Dirección'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });
  const [errors, setErrors] = useState({});
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook|yahoo|live|uthh\.edu)\.(com|mx)$/;
  const phoneRegex = /^\d{10,15}$/;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCjYgHzkG53-aSTcHJkAPYu98TIkGZ2d-w"
  });

  const center = {
    lat: 21.081734,
    lng: -98.536002
  };

  // Detectar el tema
  useEffect(() => {
    const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(matchDarkTheme.matches);

    const handleThemeChange = (e) => {
      setIsDarkMode(e.matches);
    };

    matchDarkTheme.addEventListener('change', handleThemeChange);
    return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
  }, []);

  // Obtener datos de la empresa
  useEffect(() => {
    const fetchEmpresaData = async () => {
      try {
        const response = await fetch(
          'https://back-end-4803.onrender.com/api/perfilEmpresa/empresa'
        );
        if (!response.ok) {
          throw new Error('Error al obtener los datos de la empresa');
        }
        const data = await response.json();
        setEmpresa(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmpresaData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    // Limpiar el error del campo que el usuario está editando
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    let newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio.';
    if (!emailRegex.test(formData.email)) newErrors.email = 'Correo inválido. Usa @gmail, @hotmail, @outlook, etc.';
    if (!phoneRegex.test(formData.telefono)) newErrors.telefono = 'El teléfono debe tener entre 10 y 15 números.';
    if (formData.mensaje.trim().length < 10) newErrors.mensaje = 'El mensaje debe tener al menos 10 caracteres.';

    // Si hay errores, detener el envío y mostrarlos
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // ❌ Evita continuar con la petición si hay errores
    }

    setIsLoading(true); // ✅ Activar el estado de carga solo si la validación pasa

    try {
      const response = await fetch('https://back-end-4803.onrender.com/api/contacto/msj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Mensaje enviado correctamente');
        setFormData({ nombre: '', email: '', telefono: '', mensaje: '' }); // Limpia el formulario
        setErrors({}); // Limpia errores después del envío exitoso
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Error al enviar el mensaje, intenta más tarde.');
      console.error('Error al enviar el formulario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDarkMode ? '#1B2A3A' : '#F9FDFF',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 4 },
            bgcolor: isDarkMode ? '#2A3648' : '#ffffff',
            borderRadius: 2
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            align="center"
            sx={{
              color: isDarkMode ? '#ffffff' : '#0052A3',
              fontWeight: 'bold',
              mb: 4,
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            Contáctanos
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              color: isDarkMode ? '#94A3B8' : '#666',
              textAlign: 'center'
            }}
          >
            Nos encantará atenderte y resolver cualquier duda que puedas tener.
          </Typography>


          <Grid container spacing={4}>
            {/* Lado Izquierdo: Información y Formulario */}
            <Grid item xs={12} md={6}>
              <Box>
                {[
                  { icon: <Phone />, text: empresa.telefono },
                  { icon: <Email />, text: empresa.correo_electronico },
                  { icon: <LocationOn />, text: empresa.direccion }
                ].map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      p: 2,
                      bgcolor: isDarkMode ? '#1B2A3A' : '#f5f5f5',
                      borderRadius: 1,
                      color: isDarkMode ? '#94A3B8' : 'inherit'
                    }}
                  >
                    <Box sx={{ color: '#0052A3' }}>{item.icon}</Box>
                    <Typography sx={{ ml: 2 }}>{item.text}</Typography>
                  </Box>
                ))}
                <Typography
                  variant="body1"
                  sx={{
                    mb: 3,
                    color: isDarkMode ? '#94A3B8' : '#666',
                    textAlign: 'center'
                  }}
                >
                  Si deseas contactarnos mandanos un WhatsApp y te mandaremos la informacion que necesites.
                </Typography>

                <Button
                  variant="contained"
                  startIcon={<WhatsApp />}
                  fullWidth
                  sx={{
                    bgcolor: '#25D366',
                    '&:hover': { bgcolor: '#128C7E' },
                    mb: 4,
                    py: 1.5
                  }}
                  href={`https://wa.me/${empresa.telefono.replace(/\D/g, '')}`}
                  target="_blank"
                >
                  Contactar por WhatsApp
                </Button>

                <Typography
                  variant="body1"
                  sx={{
                    mb: 3,
                    color: isDarkMode ? '#94A3B8' : '#666',
                    textAlign: 'center'
                  }}
                >
                  O si lo prefieres, puedes escribirnos a través del siguiente formulario de contacto:
                </Typography>
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{
                    p: 3,
                    bgcolor: isDarkMode ? '#1B2A3A' : '#ffffff',
                    borderRadius: 2,
                    boxShadow: 1
                  }}
                >
                  {[
                    { name: 'nombre', label: 'Nombre' },
                    { name: 'email', label: 'Email', type: 'email' },
                    { name: 'telefono', label: 'Teléfono' }
                  ].map((field) => (
                    <TextField
                      key={field.name}
                      fullWidth
                      required
                      margin="normal"
                      name={field.name}
                      label={field.label}
                      type={field.type || 'text'}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      error={!!errors[field.name]} // ✅ Muestra error si existe
                      helperText={errors[field.name]} // ✅ Muestra mensaje de error
                      variant="outlined"
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: isDarkMode ? '#1B2A3A' : '#ffffff',
                          '& fieldset': {
                            borderColor: isDarkMode ? '#475569' : '#e0e0e0',
                          },
                          '&:hover fieldset': {
                            borderColor: '#0052A3',
                          },
                          '& input': {
                            color: isDarkMode ? '#ffffff' : '#000000',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: isDarkMode ? '#94A3B8' : '#666666',
                        },
                      }}
                    />
                  ))}
                  <TextField
                    fullWidth
                    required
                    margin="normal"
                    name="mensaje"
                    label="Mensaje"
                    multiline
                    rows={4}
                    value={formData.mensaje}
                    onChange={handleInputChange}
                    error={!!errors.mensaje} // ✅ Muestra error si existe
                    helperText={errors.mensaje} // ✅ Muestra mensaje de error
                    variant="outlined"
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: isDarkMode ? '#1B2A3A' : '#ffffff',
                        '& fieldset': {
                          borderColor: isDarkMode ? '#475569' : '#e0e0e0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#0052A3',
                        },
                        '& textarea': {
                          color: isDarkMode ? '#ffffff' : '#000000',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: isDarkMode ? '#94A3B8' : '#666666',
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isLoading} // ✅ Deshabilita mientras se envía el formulario
                    sx={{
                      bgcolor: isLoading ? '#A0A0A0' : '#0052A3',
                      '&:hover': { bgcolor: isLoading ? '#A0A0A0' : '#003d7a' },
                      py: 1.5,
                      cursor: isLoading ? 'not-allowed' : 'pointer' // ✅ Mejora accesibilidad
                    }}
                  >
                    {isLoading ? 'Enviando...' : 'Enviar Mensaje'}
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Lado Derecho: Mapa */}
            <Grid item xs={12} md={6}>
              <Box sx={{
                height: { xs: '400px' },
                minHeight: { md: '600px' },
                width: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3
              }}>
                {!isLoaded ? (
                  <Box sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isDarkMode ? '#2A3648' : '#f5f5f5'
                  }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <GoogleMap
                    mapContainerStyle={{ height: '100%', width: '100%' }}
                    center={center}
                    zoom={15}
                    options={{
                      zoomControl: true,
                      streetViewControl: true,
                      mapTypeControl: true,
                      fullscreenControl: true,
                      styles: isDarkMode ? [
                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                      ] : []
                    }}
                  >
                    <Marker
                      position={center}
                      title="Clínica Dental Carol"
                      animation={window.google.maps.Animation.DROP}
                    />
                  </GoogleMap>
                )}
              </Box>

              {/* Botones de acción */}
              <Box sx={{
                mt: 2,
                display: 'flex',
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                <Button
                  variant="outlined"
                  startIcon={<OpenInNew />}
                  sx={{
                    flex: 1,
                    color: isDarkMode ? '#ffffff' : '#0052A3',
                    borderColor: isDarkMode ? '#ffffff' : '#0052A3',
                    '&:hover': {
                      borderColor: isDarkMode ? '#ffffff' : '#0052A3',
                      bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,82,163,0.1)'
                    }
                  }}
                  href="https://www.google.com/maps/@21.0816681,-98.5359763,19.64z"
                  target="_blank"
                >
                  Ver en Google Maps
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<LocationOn />}
                  sx={{
                    flex: 1,
                    color: isDarkMode ? '#ffffff' : '#0052A3',
                    borderColor: isDarkMode ? '#ffffff' : '#0052A3',
                    '&:hover': {
                      borderColor: isDarkMode ? '#ffffff' : '#0052A3',
                      bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,82,163,0.1)'
                    }
                  }}
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`;
                    window.open(url, '_blank');
                  }}
                >
                  Cómo Llegar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default Contacto;