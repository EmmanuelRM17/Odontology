import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Divider,
  Avatar,
  Chip,
  useMediaQuery,
  Container,
  Skeleton,
  Alert
} from '@mui/material';
import {
  CalendarToday,
  Healing,
  History,
  AccessTime,
  ArrowForward,
  Notifications,
  Person,
  HealthAndSafety,
  InsertDriveFile,
  CreditCard,
  EventAvailable,
  EventNote
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import { useAuth } from '../../../components/Tools/AuthContext';

/**
 * Componente Principal del Portal del Paciente con próxima cita dinámica
 */
const Principal = () => {
  const navigate = useNavigate();
  const { isDarkTheme } = useThemeContext();
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm'));
  const { user } = useAuth(); // Obtener usuario del contexto de autenticación

  // Estados para manejar la próxima cita
  const [proximaCita, setProximaCita] = useState(null);
  const [citaLoading, setCitaLoading] = useState(true);
  const [citaError, setCitaError] = useState(null);
  const [tieneProximaCita, setTieneProximaCita] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Obtener ID del paciente desde el contexto de autenticación
  const pacienteId = user?.id;

  // Efecto para cargar la próxima cita del paciente
  useEffect(() => {
    const fetchProximaCita = async () => {
      if (!pacienteId) {
        setCitaLoading(false);
        return;
      }

      try {
        setCitaLoading(true);
        setCitaError(null);

        const response = await fetch(`https://back-end-4803.onrender.com/api/citas/paciente/${pacienteId}/proxima`);

        if (response.status === 404) {
          setTieneProximaCita(false);
          setProximaCita(null);
          setCitaLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error('Error al obtener la próxima cita');
        }

        const data = await response.json();

        if (data.tiene_proxima_cita) {
          setProximaCita(data.cita);
          setTieneProximaCita(true);
        } else {
          setTieneProximaCita(false);
          setProximaCita(null);
        }

      } catch (error) {
        console.error('Error al cargar próxima cita:', error);
        setCitaError(error.message);
        setTieneProximaCita(false);
        setProximaCita(null);
      } finally {
        setCitaLoading(false);
      }
    };

    fetchProximaCita();
  }, [pacienteId, refreshTrigger]);

  // Función para refrescar los datos de la cita
  const refrescarCita = () => {
    if (pacienteId) {
      setCitaLoading(true);
      setCitaError(null);

      const fetchProximaCita = async () => {
        try {
          const response = await fetch(`https://back-end-4803.onrender.com/api/citas/paciente/${pacienteId}/proxima`);

          if (response.status === 404) {
            setTieneProximaCita(false);
            setProximaCita(null);
            setCitaLoading(false);
            return;
          }

          if (!response.ok) {
            throw new Error('Error al obtener la próxima cita');
          }

          const data = await response.json();

          if (data.tiene_proxima_cita) {
            setProximaCita(data.cita);
            setTieneProximaCita(true);
          } else {
            setTieneProximaCita(false);
            setProximaCita(null);
          }

        } catch (error) {
          console.error('Error al cargar próxima cita:', error);
          setCitaError(error.message);
          setTieneProximaCita(false);
          setProximaCita(null);
        } finally {
          setCitaLoading(false);
        }
      };

      fetchProximaCita();
    }
  };

  useEffect(() => {
    const handleRefreshCitas = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('refreshCitas', handleRefreshCitas);

    return () => {
      window.removeEventListener('refreshCitas', handleRefreshCitas);
    };
  }, []);


  // Colores según el modo del sistema
  const colors = {
    background: isDarkTheme ? '#121F2F' : '#F9FDFF',
    primary: isDarkTheme ? '#3B82F6' : '#0557A5',
    primaryLight: isDarkTheme ? '#60A5FA' : '#3B82F6',
    secondary: isDarkTheme ? '#4ADE80' : '#10B981',
    accent: isDarkTheme ? '#F59E0B' : '#F59E0B',
    text: isDarkTheme ? '#FFFFFF' : '#1F2937',
    subtext: isDarkTheme ? '#D1D5DB' : '#4B5563',
    cardBg: isDarkTheme ? '#1E2A42' : '#FFFFFF',
    cardBorder: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    gradientStart: isDarkTheme ? '#1E3A8A' : '#DBEAFE',
    gradientEnd: isDarkTheme ? '#1E40AF' : '#EFF6FF',
    chipBg: isDarkTheme ? 'rgba(79, 70, 229, 0.2)' : 'rgba(79, 70, 229, 0.1)',
    chipText: isDarkTheme ? '#A5B4FC' : '#4F46E5',
    shadow: isDarkTheme ? '0 10px 15px -3px rgba(0,0,0,0.4)' : '0 10px 15px -3px rgba(0,0,0,0.1)',
    error: isDarkTheme ? '#EF4444' : '#DC2626',
    success: isDarkTheme ? '#10B981' : '#059669'
  };

  // Módulos principales del portal
  const mainModules = [
    {
      title: "Citas",
      description: "Agenda, visualiza o reprograma tus citas dentales",
      icon: <CalendarToday sx={{ fontSize: 48, color: colors.primary }} />,
      path: "/Paciente/citas",
      color: colors.primary
    },
    {
      title: "Tratamientos",
      description: "Revisa tus tratamientos activos y su progreso",
      icon: <Healing sx={{ fontSize: 48, color: colors.secondary }} />,
      path: "/Paciente/tratamientos",
      color: colors.secondary
    },
    {
      title: "Historial Médico",
      description: "Consulta tu historial clínico completo",
      icon: <History sx={{ fontSize: 48, color: colors.accent }} />,
      path: "/Paciente/historial",
      color: colors.accent
    }
  ];

  // Módulos secundarios con acceso rápido
  const quickAccessModules = [
    { title: "Mi Perfil", icon: <Person fontSize="small" />, path: "/Paciente/perfil" },
    { title: "Recetas", icon: <InsertDriveFile fontSize="small" />, path: "/Paciente/recetas" },
    { title: "Pagos", icon: <CreditCard fontSize="small" />, path: "/Paciente/pagos" },
    { title: "Notificaciones", icon: <Notifications fontSize="small" />, path: "/Paciente/notificaciones" }
  ];

  // Componente para la tarjeta de próxima cita
  const ProximaCitaCard = () => {
    if (citaLoading) {
      return (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 4,
            borderRadius: 2,
            border: `1px solid ${colors.cardBorder}`,
            bgcolor: colors.cardBg,
            boxShadow: colors.shadow
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1.5 }} />
            <Skeleton variant="text" width={150} height={32} />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Grid item xs={12} md={2.4} key={item}>
                <Skeleton variant="text" width="100%" height={24} />
                <Skeleton variant="text" width="80%" height={20} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      );
    }

    if (citaError) {
      return (
        <Alert
          severity="warning"
          sx={{ mb: 4 }}
          action={
            <Button color="inherit" size="small" onClick={refrescarCita}>
              Reintentar
            </Button>
          }
        >
          Error al cargar tu próxima cita: {citaError}
        </Alert>
      );
    }

    if (!tieneProximaCita) {
      return (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            borderRadius: 2,
            border: `1px solid ${colors.cardBorder}`,
            bgcolor: colors.cardBg,
            boxShadow: colors.shadow,
            textAlign: 'center'
          }}
        >
          <EventNote sx={{ fontSize: 48, color: colors.subtext, mb: 2 }} />
          <Typography variant="h6" color={colors.text} gutterBottom>
            No tienes citas próximas programadas
          </Typography>
          <Typography variant="body2" color={colors.subtext} sx={{ mb: 3 }}>
            ¡Es un buen momento para agendar tu próxima consulta dental!
          </Typography>
        </Paper>
      );
    }

    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 4,
          borderRadius: 2,
          border: `1px solid ${colors.cardBorder}`,
          bgcolor: colors.cardBg,
          boxShadow: colors.shadow
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccessTime sx={{ color: colors.accent, mr: 1.5 }} />
          <Typography variant="h6" fontWeight={600} color={colors.text}>
            Tu próxima cita
          </Typography>
          {proximaCita?.es_tratamiento && (
            <Chip
              label={`Tratamiento - Cita #${proximaCita.numero_cita_tratamiento}`}
              size="small"
              sx={{
                ml: 2,
                bgcolor: colors.chipBg,
                color: colors.chipText,
                fontWeight: 500
              }}
            />
          )}
          <Chip
            label={proximaCita?.estado || 'Pendiente'}
            size="small"
            sx={{
              ml: 1,
              bgcolor: proximaCita?.estado === 'Confirmada' ? colors.secondary : colors.accent,
              color: 'white',
              fontWeight: 500
            }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarToday sx={{ color: colors.primary, mr: 1.5, fontSize: 20 }} />
              <Typography variant="body1" color={colors.text} fontWeight={500}>
                {proximaCita?.fecha}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ color: colors.primary, mr: 1.5, fontSize: 20 }} />
              <Typography variant="body1" color={colors.text} fontWeight={500}>
                {proximaCita?.hora}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="body1" color={colors.text}>
              <b>Dentista:</b> {proximaCita?.doctor}
            </Typography>
          </Grid>

          <Grid item xs={12} md={2}>
            <Chip
              label={proximaCita?.tipo}
              size="small"
              sx={{
                bgcolor: isDarkTheme ? 'rgba(79, 209, 197, 0.15)' : 'rgba(79, 209, 197, 0.1)',
                color: isDarkTheme ? '#4FD1C5' : '#319795',
                fontWeight: 500
              }}
            />
          </Grid>

          <Grid item xs={12} md={2} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button
              variant="outlined"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/Paciente/citas')}
              sx={{
                borderColor: colors.primary,
                color: colors.primary,
                '&:hover': {
                  borderColor: colors.primary,
                  bgcolor: isDarkTheme ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)'
                }
              }}
            >
              Detalles
            </Button>
          </Grid>
        </Grid>

        {proximaCita?.notas && (
          <Box sx={{ mt: 2, p: 2, bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
            <Typography variant="caption" color={colors.subtext}>
              <b>Notas:</b> {proximaCita.notas}
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Bienvenida personalizada */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientEnd} 100%)`,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'center', md: 'flex-start' },
          gap: 3
        }}
      >
        <Avatar
          sx={{
            width: { xs: 80, md: 100 },
            height: { xs: 80, md: 100 },
            bgcolor: isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(59,130,246,0.1)',
            color: colors.primary,
            border: `3px solid ${colors.primary}`
          }}
        >
          <Person sx={{ fontSize: { xs: 40, md: 50 } }} />
        </Avatar>

        <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: isDarkTheme ? 'white' : colors.primary,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
            }}
          >
            Bienvenido{user?.nombre ? `, ${user.nombre}` : ''} a tu Portal Dental
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              mt: 1,
              mb: 2,
              color: isDarkTheme ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
              maxWidth: { md: '80%' }
            }}
          >
            Gestiona tu salud dental y mantente al día con tus tratamientos, citas y récord médico.
          </Typography>

          <Chip
            icon={<HealthAndSafety />}
            label="Tu salud dental, nuestra prioridad"
            sx={{
              bgcolor: colors.chipBg,
              color: colors.chipText,
              fontWeight: 500,
              py: 0.5,
              mb: { xs: 2, md: 0 }
            }}
          />
        </Box>
      </Paper>

      {/* Tarjeta de próxima cita - Ahora dinámica */}
      <ProximaCitaCard />

      {/* Módulos principales */}
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: 600,
          color: colors.text,
          pl: 1
        }}
      >
        Servicios principales
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {mainModules.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${colors.cardBorder}`,
                bgcolor: colors.cardBg,
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: colors.shadow,
                  '& .hover-gradient': {
                    opacity: 0.05
                  }
                }
              }}
            >
              <Box
                className="hover-gradient"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${module.color} 0%, transparent 80%)`,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  zIndex: 0
                }}
              />

              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                    }}
                  >
                    {module.icon}
                  </Box>
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 1.5,
                    color: colors.text
                  }}
                >
                  {module.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: colors.subtext,
                    mb: 3,
                    minHeight: '40px'
                  }}
                >
                  {module.description}
                </Typography>
              </CardContent>

              <CardActions sx={{ p: 3, pt: 0 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate(module.path)}
                  sx={{
                    bgcolor: module.color,
                    color: '#FFFFFF',
                    py: 1.2,
                    fontWeight: 500,
                    textTransform: 'none',
                    borderRadius: 1.5,
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: module.color,
                      filter: 'brightness(90%)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  Acceder
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Accesos rápidos */}
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: 600,
          color: colors.text,
          pl: 1
        }}
      >
        Accesos rápidos
      </Typography>

      <Grid container spacing={2}>
        {quickAccessModules.map((module, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Paper
              elevation={0}
              onClick={() => navigate(module.path)}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${colors.cardBorder}`,
                bgcolor: colors.cardBg,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                height: '100%',
                minHeight: 120,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  bgcolor: isDarkTheme ? 'rgba(255,255,255,0.03)' : 'rgba(59,130,246,0.03)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  mb: 1.5,
                  borderRadius: '50%',
                  bgcolor: isDarkTheme ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.08)',
                  color: colors.primary
                }}
              >
                {module.icon}
              </Box>
              <Typography
                variant="body1"
                align="center"
                sx={{
                  fontWeight: 500,
                  color: colors.text
                }}
              >
                {module.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Principal;