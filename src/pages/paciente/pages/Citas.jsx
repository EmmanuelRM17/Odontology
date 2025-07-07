import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  IconButton,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  Alert,
  Skeleton,
  Tooltip,
  Badge,
  Stack,
  useMediaQuery,
  Fab,
  Collapse,
  Slide,
  Zoom
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  Person,
  Add,
  FilterList,
  Refresh,
  EventNote,
  ExpandMore,
  ExpandLess,
  Cancel,
  Edit,
  Visibility,
  Phone,
  Email,
  LocationOn,
  HealthAndSafety,
  Schedule,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  MedicalServices,
  TrendingUp,
  History,
  EventAvailable
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import { useAuth } from '../../../components/Tools/AuthContext';
import AgendarCitaDialog from './Nuevacita';

// Componente principal de gestión de citas 
const Citas = () => {
  const navigate = useNavigate();
  const { isDarkTheme } = useThemeContext();
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme => theme.breakpoints.down('md'));
  const { user } = useAuth();
  
  // Estados para datos
  const [citas, setCitas] = useState([]);
  const [citasLoading, setCitasLoading] = useState(true);
  const [citasError, setCitasError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Estados para UI mejorada
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [dialogDetalles, setDialogDetalles] = useState(false);
  const [agendarDialogOpen, setAgendarDialogOpen] = useState(false);
  const [vistaActual, setVistaActual] = useState('grid'); // 'grid' o 'list'
  
  // Obtener ID del paciente
  const pacienteId = user?.id;

  // Configuración de colores profesional
  const colors = {
    background: isDarkTheme ? '#0f172a' : '#f8fafc',
    primary: isDarkTheme ? '#3b82f6' : '#1e40af',
    primaryLight: isDarkTheme ? '#60a5fa' : '#3b82f6',
    secondary: isDarkTheme ? '#10b981' : '#059669',
    accent: isDarkTheme ? '#f59e0b' : '#d97706',
    text: isDarkTheme ? '#f1f5f9' : '#0f172a',
    subtext: isDarkTheme ? '#94a3b8' : '#475569',
    cardBg: isDarkTheme ? '#1e293b' : '#ffffff',
    cardBorder: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    success: isDarkTheme ? '#22c55e' : '#16a34a',
    warning: isDarkTheme ? '#f59e0b' : '#d97706',
    error: isDarkTheme ? '#ef4444' : '#dc2626',
    shadow: isDarkTheme ? '0 10px 15px -3px rgba(0,0,0,0.3)' : '0 10px 15px -3px rgba(0,0,0,0.1)',
    gradientBg: isDarkTheme 
      ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
  };

  // Estados de citas con mejor diseño visual
  const estadosCitas = [
    { 
      valor: 'todas', 
      label: 'Todas', 
      color: colors.primary,
      icon: EventNote,
      description: 'Ver todas las citas'
    },
    { 
      valor: 'Programada', 
      label: 'Programadas', 
      color: colors.secondary,
      icon: EventAvailable,
      description: 'Citas confirmadas'
    },
    { 
      valor: 'Confirmada', 
      label: 'Confirmadas', 
      color: colors.success,
      icon: CheckCircle,
      description: 'Listas para atención'
    },
    { 
      valor: 'En curso', 
      label: 'En Progreso', 
      color: colors.warning,
      icon: TrendingUp,
      description: 'Citas en desarrollo'
    },
    { 
      valor: 'Completada', 
      label: 'Completadas', 
      color: colors.primary,
      icon: CheckCircle,
      description: 'Citas finalizadas'
    },
    { 
      valor: 'Cancelada', 
      label: 'Canceladas', 
      color: colors.error,
      icon: Cancel,
      description: 'Citas canceladas'
    },
    { 
      valor: 'Reprogramada', 
      label: 'Reprogramadas', 
      color: colors.accent,
      icon: Schedule,
      description: 'Citas reagendadas'
    }
  ];

  // Efecto para cargar citas con mejor manejo
  useEffect(() => {
    const fetchCitas = async () => {
      if (!pacienteId) {
        setCitasLoading(false);
        return;
      }

      try {
        setCitasLoading(true);
        setCitasError(null);
        
        const response = await fetch(`https://back-end-4803.onrender.com/api/citas/paciente/${pacienteId}`);
        
        if (!response.ok) {
          throw new Error('Error al obtener las citas');
        }
        
        const data = await response.json();
        
        // Ordenar citas: próximas primero, luego por fecha
        const citasOrdenadas = data.sort((a, b) => {
          const fechaA = new Date(a.fecha_consulta);
          const fechaB = new Date(b.fecha_consulta);
          const ahora = new Date();
          
          // Si ambas son futuras o ambas son pasadas, ordenar por fecha
          if ((fechaA >= ahora && fechaB >= ahora) || (fechaA < ahora && fechaB < ahora)) {
            return fechaA - fechaB;
          }
          
          // Las futuras van primero
          return fechaA >= ahora ? -1 : 1;
        });
        
        setCitas(citasOrdenadas);
        
      } catch (error) {
        console.error('Error al cargar citas:', error);
        setCitasError(error.message);
        setCitas([]);
      } finally {
        setCitasLoading(false);
      }
    };

    fetchCitas();
  }, [pacienteId, refreshTrigger]);

  // Escuchar evento global de refresh
  useEffect(() => {
    const handleRefreshCitas = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('refreshCitas', handleRefreshCitas);
    
    return () => {
      window.removeEventListener('refreshCitas', handleRefreshCitas);
    };
  }, []);

  // Función para refrescar manualmente
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Filtrar citas con búsqueda mejorada
  const citasFiltradas = citas.filter(cita => {
    const cumpleFiltroEstado = filtroEstado === 'todas' || cita.estado === filtroEstado;
    const cumpleBusqueda = !busqueda || 
      cita.servicio_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      cita.odontologo_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      cita.estado?.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleFiltroEstado && cumpleBusqueda;
  });

  // Estadísticas mejoradas
  const estadisticasCitas = estadosCitas.reduce((acc, estado) => {
    if (estado.valor === 'todas') {
      acc[estado.valor] = citas.length;
    } else {
      acc[estado.valor] = citas.filter(cita => cita.estado === estado.valor).length;
    }
    return acc;
  }, {});

  // Obtener próxima cita
  const proximaCita = citas.find(cita => {
    const fechaCita = new Date(cita.fecha_consulta);
    const ahora = new Date();
    return fechaCita >= ahora && cita.estado !== 'Cancelada';
  });

  // Función para obtener color según estado
  const getColorEstado = (estado) => {
    const estadoConfig = estadosCitas.find(e => e.valor === estado);
    return estadoConfig ? estadoConfig.color : colors.primary;
  };

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función para formatear fecha corta
  const formatearFechaCorta = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    });
  };

  // Función para formatear hora
  const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Determinar si es cita pasada, hoy o futura
  const getTipoCita = (fecha) => {
    const fechaCita = new Date(fecha);
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const citaHoy = new Date(fechaCita.getFullYear(), fechaCita.getMonth(), fechaCita.getDate());
    
    if (citaHoy.getTime() === hoy.getTime()) return 'hoy';
    if (fechaCita < ahora) return 'pasada';
    return 'futura';
  };

  // Componente de estadísticas mejorado
  const EstadisticasCitas = () => (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 3,
        borderRadius: 3,
        border: `1px solid ${colors.cardBorder}`,
        background: colors.gradientBg,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Elemento decorativo */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.primary}15 0%, transparent 70%)`,
          zIndex: 0
        }}
      />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography 
          variant="h6" 
          color={colors.text} 
          gutterBottom 
          sx={{ 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <TrendingUp sx={{ color: colors.primary }} />
          Resumen de Citas
        </Typography>
        
        <Grid container spacing={2}>
          {estadosCitas.slice(0, 4).map((estado, index) => {
            const Icon = estado.icon;
            const count = estadisticasCitas[estado.valor] || 0;
            
            return (
              <Grid item xs={6} sm={3} key={estado.valor}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      borderRadius: 2,
                      border: `1px solid ${colors.cardBorder}`,
                      backgroundColor: colors.cardBg,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: colors.shadow,
                        borderColor: estado.color
                      }
                    }}
                    onClick={() => setFiltroEstado(estado.valor)}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: `${estado.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 1
                      }}
                    >
                      <Icon sx={{ color: estado.color, fontSize: 24 }} />
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{
                        color: estado.color,
                        fontWeight: 700,
                        mb: 0.5,
                        fontSize: { xs: '1.5rem', sm: '2rem' }
                      }}
                    >
                      {count}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color={colors.subtext}
                      sx={{ 
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}
                    >
                      {estado.label}
                    </Typography>
                  </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Paper>
  );

  // Componente de próxima cita destacada
  const ProximaCitaDestacada = () => {
    if (!proximaCita) return null;
    
    const tipoCita = getTipoCita(proximaCita.fecha_consulta);
    
    return (
      
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            border: `2px solid ${colors.primary}`,
            background: `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.cardBg} 100%)`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Badge HOY */}
          {tipoCita === 'hoy' && (
            <Chip
              label="HOY"
              size="small"
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: colors.warning,
                color: 'white',
                fontWeight: 700,
                animation: 'pulse 2s infinite'
              }}
            />
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: colors.primary,
                width: 56,
                height: 56
              }}
            >
              <CalendarToday sx={{ fontSize: 28 }} />
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  color: colors.text,
                  fontWeight: 600,
                  mb: 0.5
                }}
              >
                {tipoCita === 'hoy' ? '¡Tu cita es hoy!' : 'Próxima Cita'}
              </Typography>
              
              <Typography
                variant="subtitle1"
                sx={{
                  color: colors.primary,
                  fontWeight: 500
                }}
              >
                {proximaCita.servicio_nombre}
              </Typography>
            </Box>
          </Box>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarToday sx={{ color: colors.primary, fontSize: 20 }} />
                <Typography variant="body1" color={colors.text}>
                  {formatearFecha(proximaCita.fecha_consulta)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime sx={{ color: colors.primary, fontSize: 20 }} />
                <Typography variant="body1" color={colors.text} fontWeight={500}>
                  {formatearHora(proximaCita.fecha_consulta)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Person sx={{ color: colors.primary, fontSize: 20 }} />
                <Typography variant="body1" color={colors.text}>
                  Dr. {proximaCita.odontologo_nombre || 'Por asignar'}
                </Typography>
              </Box>
              
              <Chip 
                label={proximaCita.estado} 
                size="small"
                sx={{
                  bgcolor: getColorEstado(proximaCita.estado),
                  color: 'white',
                  fontWeight: 500
                }}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Visibility />}
              onClick={() => {
                setCitaSeleccionada(proximaCita);
                setDialogDetalles(true);
              }}
              sx={{
                borderColor: colors.primary,
                color: colors.primary,
                '&:hover': {
                  borderColor: colors.primary,
                  bgcolor: `${colors.primary}10`
                }
              }}
            >
              Ver detalles
            </Button>
          </Box>
        </Paper>
    );
  };

  // Componente de tarjeta de cita mejorado
  const CitaCard = ({ cita, index }) => {
    const tipoCita = getTipoCita(cita.fecha_consulta);
    const colorEstado = getColorEstado(cita.estado);
    
    return (
      <Grid item xs={12} sm={6} lg={4} key={cita.consulta_id}>
       <Paper>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              borderRadius: 3,
              border: `1px solid ${colors.cardBorder}`,
              bgcolor: colors.cardBg,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: colors.shadow,
                borderColor: colorEstado
              }
            }}
          >
            {/* Indicador de estado superior */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${colorEstado} 0%, ${colorEstado}80 100%)`
              }}
            />
            
            {/* Badge para citas especiales */}
            {tipoCita === 'hoy' && (
              <Chip
                label="HOY"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  bgcolor: colors.warning,
                  color: 'white',
                  fontWeight: 700,
                  zIndex: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              />
            )}
            
            <CardContent sx={{ p: 3 }}>
              {/* Header con servicio y fecha */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <MedicalServices sx={{ color: colors.primary, fontSize: 20 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: colors.text,
                      fontSize: '1rem',
                      lineHeight: 1.3
                    }}
                  >
                    {cita.servicio_nombre}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Chip 
                    label={cita.estado} 
                    size="small"
                    sx={{
                      bgcolor: colorEstado,
                      color: 'white',
                      fontWeight: 500,
                      fontSize: '0.75rem'
                    }}
                  />
                  
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.subtext,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }}
                  >
                    {formatearFechaCorta(cita.fecha_consulta)}
                  </Typography>
                </Box>
              </Box>
              
              {/* Información principal */}
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday sx={{ color: colors.primary, fontSize: 18 }} />
                  <Typography variant="body2" color={colors.text}>
                    {formatearFecha(cita.fecha_consulta)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime sx={{ color: colors.primary, fontSize: 18 }} />
                  <Typography variant="body2" color={colors.text} fontWeight={500}>
                    {formatearHora(cita.fecha_consulta)}
                  </Typography>
                  {cita.duracion && (
                    <Typography variant="caption" color={colors.subtext}>
                      ({cita.duracion} min)
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person sx={{ color: colors.primary, fontSize: 18 }} />
                  <Typography variant="body2" color={colors.text}>
                    {cita.odontologo_nombre || 'Por asignar'}
                  </Typography>
                </Box>
              </Stack>
              
              {/* Precio si está disponible */}
              {cita.precio_servicio && (
                <Box sx={{ 
                  mb: 2, 
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: `${colors.primary}10`,
                  border: `1px solid ${colors.primary}20`
                }}>
                  <Typography variant="body2" color={colors.text} align="center">
                    <strong>Costo: ${cita.precio_servicio}</strong>
                  </Typography>
                </Box>
              )}
              
              {/* Acciones */}
              <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={() => {
                    setCitaSeleccionada(cita);
                    setDialogDetalles(true);
                  }}
                  sx={{
                    flex: 1,
                    borderColor: colors.primary,
                    color: colors.primary,
                    '&:hover': { 
                      borderColor: colors.primary,
                      bgcolor: `${colors.primary}10`
                    }
                  }}
                >
                  Detalles
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Paper>
      </Grid>
    );
  };

  // Componente para mostrar detalles de cita mejorado
  const DetallesCita = ({ cita }) => (
    <Dialog
      open={dialogDetalles}
      onClose={() => setDialogDetalles(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: colors.primary, 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        borderRadius: '12px 12px 0 0'
      }}>
        <EventNote />
        Detalles de la Cita
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {cita && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" color={colors.text} gutterBottom>
                Información General
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color={colors.subtext}>
                    Servicio
                  </Typography>
                  <Typography variant="body1" color={colors.text} fontWeight={600}>
                    {cita.servicio_nombre}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color={colors.subtext}>
                    Estado
                  </Typography>
                  <Chip 
                    label={cita.estado} 
                    size="small"
                    sx={{
                      bgcolor: getColorEstado(cita.estado),
                      color: 'white',
                      fontWeight: 500
                    }}
                  />
                </Box>
                
                <Box>
                  <Typography variant="body2" color={colors.subtext}>
                    Fecha y Hora
                  </Typography>
                  <Typography variant="body1" color={colors.text}>
                    {formatearFecha(cita.fecha_consulta)}
                  </Typography>
                  <Typography variant="body1" color={colors.text} fontWeight={600}>
                    {formatearHora(cita.fecha_consulta)}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" color={colors.text} gutterBottom>
                Información del Profesional
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color={colors.subtext}>
                    Odontólogo
                  </Typography>
                  <Typography variant="body1" color={colors.text} fontWeight={600}>
                    {cita.odontologo_nombre || 'Por asignar'}
                  </Typography>
                </Box>
                
                {cita.duracion && (
                  <Box>
                    <Typography variant="body2" color={colors.subtext}>
                      Duración estimada
                    </Typography>
                    <Typography variant="body1" color={colors.text}>
                      {cita.duracion} minutos
                    </Typography>
                  </Box>
                )}
                
                {cita.precio_servicio && (
                  <Box>
                    <Typography variant="body2" color={colors.subtext}>
                      Costo
                    </Typography>
                    <Typography variant="body1" color={colors.text} fontWeight={600}>
                      ${cita.precio_servicio}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Grid>
            
            {cita.notas && (
              <Grid item xs={12}>
                <Typography variant="h6" color={colors.text} gutterBottom>
                  Notas adicionales
                </Typography>
                <Paper sx={{ 
                  p: 2, 
                  bgcolor: colors.background, 
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: 2
                }}>
                  <Typography variant="body2" color={colors.text}>
                    {cita.notas}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={() => setDialogDetalles(false)}
          variant="outlined"
          sx={{
            borderColor: colors.primary,
            color: colors.primary,
            '&:hover': {
              borderColor: colors.primary,
              bgcolor: `${colors.primary}10`
            }
          }}
        >
          Cerrar
        </Button>
        
        {cita && cita.estado === 'Programada' && (
          <Button
            variant="contained"
            sx={{
              bgcolor: colors.warning,
              '&:hover': { bgcolor: colors.warning, filter: 'brightness(90%)' }
            }}
          >
            Reprogramar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header mejorado */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: colors.text,
            mb: 1,
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Mis Citas Dentales
        </Typography>
        <Typography
          variant="subtitle1"
          color={colors.subtext}
          sx={{ mb: 3 }}
        >
          Gestiona tus citas y mantente al día con tu salud bucal
        </Typography>
        
        {/* Acciones principales mejoradas */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap',
          alignItems: 'center' 
        }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAgendarDialogOpen(true)}
            sx={{
              bgcolor: colors.primary,
              color: 'white',
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              boxShadow: colors.shadow,
              '&:hover': {
                bgcolor: colors.primary,
                filter: 'brightness(110%)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Agendar Nueva Cita
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            sx={{
              borderColor: colors.primary,
              color: colors.primary,
              borderRadius: 2,
              '&:hover': {
                borderColor: colors.primary,
                bgcolor: `${colors.primary}10`
              }
            }}
          >
            {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
          
          <IconButton
            onClick={handleRefresh}
            disabled={citasLoading}
            sx={{
              color: colors.primary,
              bgcolor: `${colors.primary}10`,
              borderRadius: 2,
              '&:hover': { 
                bgcolor: `${colors.primary}20`,
                transform: 'rotate(180deg)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Próxima cita destacada */}
      <ProximaCitaDestacada />

      {/* Filtros mejorados */}
      <Collapse in={mostrarFiltros}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${colors.cardBorder}`,
            bgcolor: colors.cardBg
          }}
        >
          <Typography variant="h6" color={colors.text} gutterBottom>
            Filtros de Búsqueda
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Buscar por servicio o doctor"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& fieldset': { borderColor: colors.cardBorder },
                    '&:hover fieldset': { borderColor: colors.primary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Estado"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& fieldset': { borderColor: colors.cardBorder },
                    '&:hover fieldset': { borderColor: colors.primary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary }
                  }
                }}
              >
                {estadosCitas.map((estado) => (
                  <MenuItem key={estado.valor} value={estado.valor}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <estado.icon sx={{ fontSize: 16, color: estado.color }} />
                      {estado.label}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {/* Estadísticas */}
      {!citasLoading && citas.length > 0 && <EstadisticasCitas />}

      {/* Contenido principal */}
      {citasLoading ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <Card sx={{ p: 3, bgcolor: colors.cardBg }}>
                <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
                <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={36} />
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : citasError ? (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4,
            borderRadius: 2
          }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Reintentar
            </Button>
          }
        >
          Error al cargar las citas: {citasError}
        </Alert>
      ) : citasFiltradas.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            border: `1px solid ${colors.cardBorder}`,
            bgcolor: colors.cardBg
          }}
        >
          <EventNote sx={{ fontSize: 64, color: colors.subtext, mb: 2 }} />
          <Typography variant="h6" color={colors.text} gutterBottom>
            {filtroEstado === 'todas' ? 'No tienes citas registradas' : `No hay citas ${estadosCitas.find(e => e.valor === filtroEstado)?.label.toLowerCase()}`}
          </Typography>
          <Typography variant="body2" color={colors.subtext} sx={{ mb: 3 }}>
            {filtroEstado === 'todas' 
              ? '¡Es un buen momento para agendar tu primera cita!' 
              : 'Prueba cambiando los filtros o agenda una nueva cita'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAgendarDialogOpen(true)}
            sx={{
              bgcolor: colors.primary,
              borderRadius: 2,
              '&:hover': { bgcolor: colors.primary, filter: 'brightness(110%)' }
            }}
          >
            Agendar Primera Cita
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {citasFiltradas.map((cita, index) => (
            <CitaCard key={cita.consulta_id} cita={cita} index={index} />
          ))}
        </Grid>
      )}

      {/* Dialog de detalles */}
      <DetallesCita cita={citaSeleccionada} />

      {/* Dialog para agendar cita */}
      <AgendarCitaDialog
        open={agendarDialogOpen}
        onClose={() => setAgendarDialogOpen(false)}
        onSuccess={handleRefresh}
      />

      {/* FAB para agendar en móvil */}
      {isMobile && (
        <Fab
          color="primary"
          onClick={() => setAgendarDialogOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            bgcolor: colors.primary,
            boxShadow: colors.shadow,
            '&:hover': { 
              bgcolor: colors.primary, 
              filter: 'brightness(110%)',
              transform: 'scale(1.1)'
            }
          }}
        >
          <Add />
        </Fab>
      )}
    </Container>
  );
};

export default Citas;