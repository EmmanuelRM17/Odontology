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
  Paper
} from '@mui/material';
import { Phone, Email, LocationOn, WhatsApp, OpenInNew } from '@mui/icons-material';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import Notificaciones from '../../../components/Layout/Notificaciones';
import CustomRecaptcha from '../../../components/Tools/Captcha';
import { useThemeContext } from '../../../components/Tools/ThemeContext'; // Asegúrate de usar la ruta correcta
const ContactoIlustracion = '/assets/svg/contact.svg';

const Contacto = () => {
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const { isDarkTheme } = useThemeContext(); // ✅ Correcto
  const [empresa, setEmpresa] = useState({
    nombre_empresa: 'Nombre de la Empresa',
    slogan: 'Slogan de la empresa',
    telefono: 'Teléfono',
    correo_electronico: 'correo@ejemplo.com',
    direccion: 'Dirección'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'info',
  });
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

  // Obtener datos de la empresa
  useEffect(() => {
    const fetchEmpresaData = async () => {
      try {
        const response = await fetch('https://back-end-4803.onrender.com/api/perfilEmpresa/empresa');
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
    // Limpiar el error del campo que se edita
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'Por favor, ingresa tu nombre.';
    if (!emailRegex.test(formData.email)) newErrors.email = 'Introduce un correo válido.';
    if (!phoneRegex.test(formData.telefono)) newErrors.telefono = 'El teléfono debe tener entre 10 y 15 dígitos.';
    if (formData.mensaje.trim().length < 10) newErrors.mensaje = 'Tu mensaje debe tener al menos 10 caracteres.';
    if (!captchaVerified) newErrors.captcha = '⚠️ Por favor, completa la verificación de seguridad.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setNotification({
        open: true,
        message: '❌ Revisa los campos en rojo antes de enviar.',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://back-end-4803.onrender.com/api/contacto/msj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setNotification({
          open: true,
          message: '📨 Hemos recibido su mensaje. Esté pendiente, le responderemos lo antes posible.',
          type: 'success'
        });
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          mensaje: ''
        });
        setCaptchaVerified(false); // Reiniciar captcha
      } else {
        setNotification({
          open: true,
          message: '⚠️ Hubo un problema al enviar tu mensaje. Intenta de nuevo.',
          type: 'warning'
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: '❌ Error al enviar el mensaje, intenta más tarde.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const commonStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: isDarkTheme ? '#1B2A3A' : '#ffffff',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      '& fieldset': {
        borderColor: isDarkTheme ? '#475569' : '#e0e0e0',
        borderWidth: '2px',
      },
      '&:hover fieldset': {
        borderColor: '#0052A3',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#0052A3',
        borderWidth: '2px',
      },
      '& input, & textarea': {
        color: isDarkTheme ? '#ffffff' : '#000000',
      },
    },
    '& .MuiInputLabel-root': {
      color: isDarkTheme ? '#94A3B8' : '#666666',
      '&.Mui-focused': {
        color: '#0052A3',
      },
    },
    mb: 3,
  };

  const fields = [
    { name: 'nombre', label: 'Nombre', icon: '👤' },
    { name: 'email', label: 'Email', type: 'email', icon: '📧' },
    { name: 'telefono', label: 'Teléfono', icon: '📱' }
  ];

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
        bgcolor: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 4 },
            bgcolor: isDarkTheme ? '#2A3648' : '#ffffff',
            borderRadius: 2
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            align="center"
            sx={{
              color: isDarkTheme ? '#ffffff' : '#0052A3',
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
              color: isDarkTheme ? '#94A3B8' : '#666',
              textAlign: 'center'
            }}
          >
            Nos encantará atenderte y resolver cualquier duda que puedas tener.
          </Typography>

          <Grid container spacing={4}>
            {/* Lado Izquierdo */}
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
                      bgcolor: isDarkTheme ? '#1B2A3A' : '#f5f5f5',
                      borderRadius: 1,
                      color: isDarkTheme ? '#94A3B8' : 'inherit'
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
                    color: isDarkTheme ? '#94A3B8' : '#666',
                    textAlign: 'center'
                  }}
                >
                  Si deseas contactarnos mándanos un WhatsApp y te mandaremos la información que necesites.
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
                    color: isDarkTheme ? '#94A3B8' : '#666',
                    textAlign: 'center'
                  }}
                >
                  O si lo prefieres, puedes escribirnos a través del siguiente formulario de contacto:
                </Typography>

                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{
                    p: 4,
                    bgcolor: isDarkTheme ? '#1B2A3A' : '#ffffff',
                    borderRadius: '16px',
                    boxShadow: isDarkTheme
                      ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.24)'
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    '& > *:not(:last-child)': {
                      mb: 2.5,
                    },
                  }}
                >
                  {fields.map((field) => (
                    <TextField
                      key={field.name}
                      fullWidth
                      required
                      margin="normal"
                      name={field.name}
                      label={`${field.icon} ${field.label}`}
                      type={field.type || 'text'}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      error={!!errors[field.name]}
                      helperText={errors[field.name]}
                      variant="outlined"
                      sx={commonStyles}
                    />
                  ))}

                  <TextField
                    fullWidth
                    required
                    margin="normal"
                    name="mensaje"
                    label="✍️ Mensaje"
                    multiline
                    rows={4}
                    value={formData.mensaje}
                    onChange={handleInputChange}
                    error={!!errors.mensaje}
                    helperText={errors.mensaje}
                    variant="outlined"
                    sx={{
                      ...commonStyles,
                      '& .MuiOutlinedInput-root': {
                        ...commonStyles['& .MuiOutlinedInput-root'],
                        borderRadius: '16px',
                      },
                    }}
                  />

                  {errors.captcha && (
                    <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                      {errors.captcha}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      my: 3,
                    }}
                  >
                    <CustomRecaptcha onCaptchaChange={setCaptchaVerified} isDarkTheme={isDarkTheme} />
                  </Box>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isLoading}
                    sx={{
                      bgcolor: isLoading ? '#B0BEC5' : '#0052A3',
                      '&:hover': {
                        bgcolor: isLoading ? '#B0BEC5' : '#003d7a',
                        transform: isLoading ? 'none' : 'translateY(-2px)',
                      },
                      py: 2,
                      borderRadius: '12px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 500,
                      transition: 'background-color 0.3s ease, transform 0.3s ease',
                      '&:hover': {
                        bgcolor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,82,163,0.1)',
                        transform: 'scale(1.05)'
                      },
                      boxShadow: '0 4px 6px -1px rgba(0, 82, 163, 0.2)',
                    }}
                  >
                    {isLoading ? '📨 Enviando...' : '✉️ Enviar Mensaje'}
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Lado Derecho: Mapa */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: { xs: 'none', md: 'block' }
              }}
            >
              <Box
                sx={{
                  height: { xs: '400px' },
                  minHeight: { md: '600px' },
                  width: '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: 3
                }}
              >
                {!isLoaded ? (
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: isDarkTheme ? '#2A3648' : '#f5f5f5'
                    }}
                  >
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
                      styles: isDarkTheme
                        ? [
                          {
                            elementType: 'geometry',
                            stylers: [{ color: '#242f3e' }]
                          },
                          {
                            elementType: 'labels.text.stroke',
                            stylers: [{ color: '#242f3e' }]
                          },
                          {
                            elementType: 'labels.text.fill',
                            stylers: [{ color: '#746855' }]
                          }
                        ]
                        : []
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
              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  gap: 2,
                  flexDirection: { xs: 'column', sm: 'row' }
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<OpenInNew />}
                  sx={{
                    flex: 1,
                    color: isDarkTheme ? '#ffffff' : '#0052A3',
                    borderColor: isDarkTheme ? '#ffffff' : '#0052A3',
                    '&:hover': {
                      borderColor: isDarkTheme ? '#ffffff' : '#0052A3',
                      bgcolor: isDarkTheme
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,82,163,0.1)'
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
                    color: isDarkTheme ? '#ffffff' : '#0052A3',
                    borderColor: isDarkTheme ? '#ffffff' : '#0052A3',
                    '&:hover': {
                      borderColor: isDarkTheme ? '#ffffff' : '#0052A3',
                      bgcolor: isDarkTheme
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,82,163,0.1)'
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
              {/* SVG Debajo del Mapa */}
              <Grid
                item
                xs={12}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  minHeight: '54vh' // Asegura que ocupe toda la altura de la pantalla
                }}
              >
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <Box
                    component="img"
                    src={ContactoIlustracion}
                    alt="Ilustración de contacto"
                    sx={{
                      width: '100%',
                      maxHeight: '180px',
                      objectFit: 'contain',
                      mt: 'auto', // Empuja el SVG hacia el fondo
                      transform: 'scaleX(-1)', // Voltear la imagen horizontalmente
                      display: 'block',
                      marginLeft: 'auto',
                      marginRight: 'auto'
                    }}
                  />
                </motion.div>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        handleClose={() => setNotification({ ...notification, open: false })}
        autoHideDuration={5000}
      />
    </Box>
  );
};

export default Contacto;
