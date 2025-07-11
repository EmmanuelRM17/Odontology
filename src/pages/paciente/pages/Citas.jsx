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
  Zoom,
  Rating,
  LinearProgress
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
  EventAvailable,
  Star,
  RateReview,
  Send,
  Close,
  Feedback
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import { useAuth } from '../../../components/Tools/AuthContext';
import AgendarCitaDialog from './Nuevacita';
import Notificaciones from '../../../components/Layout/Notificaciones';

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
  
  // Estados para próxima cita específica
  const [proximaCita, setProximaCita] = useState(null);
  const [proximaCitaLoading, setProximaCitaLoading] = useState(false);
  
  // Estados para UI mejorada
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [dialogDetalles, setDialogDetalles] = useState(false);
  const [agendarDialogOpen, setAgendarDialogOpen] = useState(false);
  const [vistaActual, setVistaActual] = useState('grid');
  
  // Estados para reseñas
  const [dialogReseña, setDialogReseña] = useState(false);
  const [citaParaReseña, setCitaParaReseña] = useState(null);
  const [calificacion, setCalificacion] = useState(5);
  const [comentarioReseña, setComentarioReseña] = useState('');
  const [enviandoReseña, setEnviandoReseña] = useState(false);
  const [citasYaResenadas, setCitasYaResenadas] = useState(new Set());
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success'
  });
  
  // Obtener ID del paciente
  const pacienteId = user?.id;

  // Configuración de colores profesional usando tu paleta
  const colors = {
    background: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
    paper: isDarkTheme ? '#243447' : '#ffffff',
    tableBackground: isDarkTheme ? '#1E2A3A' : '#e3f2fd',
    text: isDarkTheme ? '#FFFFFF' : '#333333',
    secondaryText: isDarkTheme ? '#E8F1FF' : '#666666',
    primary: isDarkTheme ? '#4B9FFF' : '#1976d2',
    hover: isDarkTheme ? 'rgba(75,159,255,0.15)' : 'rgba(25,118,210,0.1)',
    inputBorder: isDarkTheme ? '#4B9FFF' : '#1976d2',
    inputLabel: isDarkTheme ? '#E8F1FF' : '#666666',
    cardBackground: isDarkTheme ? '#1D2B3A' : '#F8FAFC',
    divider: isDarkTheme ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
    titleColor: isDarkTheme ? '#4B9FFF' : '#0052A3',
    // Colores adicionales usando tu paleta
    primaryLight: isDarkTheme ? '#60a5fa' : '#3b82f6',
    secondary: isDarkTheme ? '#10b981' : '#059669',
    accent: isDarkTheme ? '#f59e0b' : '#d97706',
    subtext: isDarkTheme ? '#94a3b8' : '#475569',
    cardBg: isDarkTheme ? '#243447' : '#ffffff',
    cardBorder: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    success: isDarkTheme ? '#22c55e' : '#16a34a',
    warning: isDarkTheme ? '#f59e0b' : '#d97706',
    error: isDarkTheme ? '#ef4444' : '#dc2626',
    shadow: isDarkTheme ? '0 10px 15px -3px rgba(0,0,0,0.3)' : '0 10px 15px -3px rgba(0,0,0,0.1)',
    gradientBg: isDarkTheme 
      ? 'linear-gradient(135deg, #243447 0%, #1B2A3A 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #F9FDFF 100%)',
    glassBg: isDarkTheme
      ? 'rgba(36, 52, 71, 0.8)'
      : 'rgba(255, 255, 255, 0.8)',
    // Usar primary en lugar de morado para reseñas
    review: isDarkTheme ? '#4B9FFF' : '#1976d2'
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

  // Efecto para cargar próxima cita específica
  useEffect(() => {
    const fetchProximaCita = async () => {
      if (!pacienteId) {
        setProximaCita(null);
        return;
      }

      try {
        setProximaCitaLoading(true);
        
        const response = await fetch(`https://back-end-4803.onrender.com/api/citas/paciente/${pacienteId}/proxima`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.tiene_proxima_cita) {
            setProximaCita(data.cita);
          } else {
            setProximaCita(null);
          }
        } else {
          setProximaCita(null);
        }
        
      } catch (error) {
        console.error('Error al cargar próxima cita:', error);
        setProximaCita(null);
      } finally {
        setProximaCitaLoading(false);
      }
    };

    fetchProximaCita();
  }, [pacienteId, refreshTrigger]);

  // Efecto para cargar todas las citas
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
          
          if ((fechaA >= ahora && fechaB >= ahora) || (fechaA < ahora && fechaB < ahora)) {
            return fechaA - fechaB;
          }
          
          return fechaA >= ahora ? -1 : 1;
        });
        
        setCitas(citasOrdenadas);
        
        // Verificar qué citas ya tienen reseñas
        const citasCompletadas = citasOrdenadas.filter(c => c.estado === 'Completada');
        const citasResenadas = new Set();
        
        for (const cita of citasCompletadas) {
          try {
            const reseñaResponse = await fetch(
              `https://back-end-4803.onrender.com/api/resenya/verificar/${pacienteId}/${cita.id}`
            );
            if (reseñaResponse.ok) {
              const reseñaData = await reseñaResponse.json();
              if (reseñaData.ya_reseno) {
                citasResenadas.add(cita.id);
              }
            }
          } catch (error) {
            console.error(`Error verificando reseña para cita ${cita.id}:`, error);
          }
        }
        
        setCitasYaResenadas(citasResenadas);
        
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

  // Mostrar notificación usando tu componente
  const mostrarNotificacion = (message, type = 'success') => {
    setNotification({
      open: true,
      message,
      type
    });
  };

  // Manejar cierre de notificación
  const handleNotificationClose = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
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

  // Función para obtener color según estado
  const getColorEstado = (estado) => {
    const estadoConfig = estadosCitas.find(e => e.valor === estado);
    return estadoConfig ? estadoConfig.color : colors.primary;
  };

  // Función para formatear fecha (corregida para timezone)
  const formatearFecha = (fecha) => {
    // Crear fecha sin conversión de timezone
    const fechaStr = fecha.toString();
    const fechaObj = new Date(fechaStr + (fechaStr.includes('T') ? '' : 'T00:00:00'));
    
    return fechaObj.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Mexico_City'
    });
  };

  // Función para formatear fecha corta (corregida para timezone)
  const formatearFechaCorta = (fecha) => {
    const fechaStr = fecha.toString();
    const fechaObj = new Date(fechaStr + (fechaStr.includes('T') ? '' : 'T00:00:00'));
    
    return fechaObj.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      timeZone: 'America/Mexico_City'
    });
  };

  // Función auxiliar para manejar fechas UTC del backend
  const parsearFechaUTC = (fechaString) => {
    // Si viene con .000Z (UTC), remover la Z y tratar como local
    if (fechaString.includes('.000Z')) {
      const fechaSinZ = fechaString.replace('.000Z', '');
      const [datePart, timePart] = fechaSinZ.split('T');
      const [year, month, day] = datePart.split('-');
      const [hour, minute, second] = timePart.split(':');
      
      return new Date(
        parseInt(year),
        parseInt(month) - 1, // Los meses en JS empiezan en 0
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      );
    }
    
    // Para otros formatos, usar la función anterior
    return crearFechaSinTimezone(fechaString);
  };

  // Función auxiliar para crear fecha sin conversión de timezone (mantener la anterior como fallback)
  const crearFechaSinTimezone = (fechaString) => {
    // Si la fecha viene como "2025-07-15 10:00:00", extraer partes manualmente
    const match = fechaString.match(/(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      const [, year, month, day, hour, minute, second] = match;
      return new Date(
        parseInt(year),
        parseInt(month) - 1, // Los meses en JS empiezan en 0
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      );
    }
    
    // Fallback para otros formatos
    return new Date(fechaString);
  };

  // Función para formatear hora correctamente (ACTUALIZADA para UTC)
  const formatearHora = (fecha) => {
    // Método 1: Extraer directamente si viene con .000Z
    const fechaStr = fecha.toString();
    if (fechaStr.includes('.000Z')) {
      const match = fechaStr.match(/T(\d{2}):(\d{2}):(\d{2})/);
      if (match) {
        return match[1] + ':' + match[2];
      }
    }
    
    // Método 2: Extraer de formato SQL normal
    const match = fechaStr.match(/\s(\d{2}):(\d{2})/);
    if (match) {
      return match[1] + ':' + match[2];
    }
    
    // Método 3: Usar la función auxiliar
    const fechaObj = parsearFechaUTC(fechaStr);
    return fechaObj.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Determinar si es cita de hoy (corregido para timezone)
  const esCitaHoy = (fecha) => {
    const fechaStr = fecha.toString();
    const fechaCita = new Date(fechaStr + (fechaStr.includes('T') ? '' : 'T00:00:00'));
    const hoy = new Date();
    
    // Comparar solo fechas (sin hora) en timezone de México
    const fechaCitaStr = fechaCita.toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' });
    const hoyStr = hoy.toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' });
    
    return fechaCitaStr === hoyStr;
  };

  // Función para abrir dialog de reseña (optimizada)
  const abrirDialogReseña = useCallback((cita) => {
    setCitaParaReseña(cita);
    setCalificacion(5);
    setComentarioReseña('');
    setDialogReseña(true);
  }, []);

  // Función para enviar reseña (usando estructura completa)
  const enviarReseña = async () => {
    if (!citaParaReseña || !comentarioReseña.trim()) {
      mostrarNotificacion('Por favor, escriba un comentario para su reseña', 'warning');
      return;
    }

    setEnviandoReseña(true);
    
    try {
      const response = await fetch('https://back-end-4803.onrender.com/api/resenya/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paciente_id: pacienteId,
          cita_id: citaParaReseña.id,
          comentario: comentarioReseña.trim(),
          calificacion: calificacion
        }),
      });

      if (response.ok) {
        mostrarNotificacion('¡Reseña enviada correctamente! Gracias por su opinión.', 'success');
        
        // Marcar la cita como reseñada
        setCitasYaResenadas(prev => new Set([...prev, citaParaReseña.id]));
        
        setDialogReseña(false);
        setCitaParaReseña(null);
        setComentarioReseña('');
        setCalificacion(5);
      } else {
        const errorData = await response.json();
        mostrarNotificacion(errorData.message || 'Error al enviar la reseña', 'error');
      }
    } catch (error) {
      console.error('Error al enviar reseña:', error);
      mostrarNotificacion('Error de conexión al enviar la reseña', 'error');
    } finally {
      setEnviandoReseña(false);
    }
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
        overflow: 'hidden',
        backdropFilter: 'blur(10px)'
      }}
    >
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
            gap: 1,
            fontWeight: 600
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
                    borderRadius: 3,
                    border: `1px solid ${colors.cardBorder}`,
                    backgroundColor: colors.paper,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: colors.shadow,
                      borderColor: estado.color,
                      '&::before': {
                        transform: 'translateX(0%)'
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${estado.color}10 0%, ${estado.color}05 100%)`,
                      transform: 'translateX(-100%)',
                      transition: 'transform 0.3s ease'
                    }
                  }}
                  onClick={() => setFiltroEstado(estado.valor)}
                >
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        backgroundColor: `${estado.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 1.5,
                        border: `2px solid ${estado.color}20`
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
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}
                    >
                      {estado.label}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Paper>
  );

  // Componente de próxima cita destacada mejorado
  const ProximaCitaDestacada = () => {
    if (proximaCitaLoading) {
      return (
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, backgroundColor: colors.paper }}>
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={60} />
          <Skeleton variant="rectangular" height={80} />
        </Paper>
      );
    }

    if (!proximaCita) return null;
    
    const esHoy = esCitaHoy(proximaCita.fecha_completa);
    
    return (
      <Zoom in={true}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            border: `2px solid ${colors.primary}`,
            background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.cardBg} 100%)`,
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Efecto de brillo */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: `linear-gradient(90deg, transparent, ${colors.primary}20, transparent)`,
              animation: 'shine 3s infinite',
              '@keyframes shine': {
                '0%': { left: '-100%' },
                '100%': { left: '100%' }
              }
            }}
          />
          
          {esHoy && (
            <Chip
              label="¡HOY!"
              size="small"
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: colors.warning,
                color: 'white',
                fontWeight: 700,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.1)' }
                }
              }}
            />
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, position: 'relative', zIndex: 1 }}>
            <Avatar
              sx={{
                bgcolor: colors.primary,
                width: 64,
                height: 64,
                boxShadow: `0 4px 12px ${colors.primary}40`
              }}
            >
              <CalendarToday sx={{ fontSize: 32 }} />
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  color: colors.text,
                  fontWeight: 700,
                  mb: 0.5
                }}
              >
                {esHoy ? '¡Tu cita es hoy!' : 'Próxima Cita'}
              </Typography>
              
              <Typography
                variant="h6"
                sx={{
                  color: colors.primary,
                  fontWeight: 600
                }}
              >
                {proximaCita.tipo}
              </Typography>
            </Box>
          </Box>
          
          <Grid container spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CalendarToday sx={{ color: colors.primary, fontSize: 20 }} />
                  <Typography variant="body1" color={colors.text} fontWeight={500}>
                    {proximaCita.fecha}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AccessTime sx={{ color: colors.primary, fontSize: 20 }} />
                  <Typography variant="body1" color={colors.text} fontWeight={600}>
                    {proximaCita.hora}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Person sx={{ color: colors.primary, fontSize: 20 }} />
                  <Typography variant="body1" color={colors.text}>
                    {proximaCita.doctor}
                  </Typography>
                </Box>
                
                <Chip 
                  label={proximaCita.estado} 
                  size="small"
                  sx={{
                    bgcolor: getColorEstado(proximaCita.estado),
                    color: 'white',
                    fontWeight: 600,
                    width: 'fit-content'
                  }}
                />
              </Stack>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', gap: 1.5, position: 'relative', zIndex: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Visibility />}
              onClick={() => {
                const citaCompleta = citas.find(c => c.id === proximaCita.id);
                if (citaCompleta) {
                  setCitaSeleccionada(citaCompleta);
                  setDialogDetalles(true);
                }
              }}
              sx={{
                borderColor: colors.primary,
                color: colors.primary,
                borderRadius: 2,
                px: 2,
                '&:hover': {
                  borderColor: colors.primary,
                  bgcolor: `${colors.primary}10`,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Ver detalles
            </Button>
          </Box>
        </Paper>
      </Zoom>
    );
  };

  // Componente de tarjeta de cita mejorado
  const CitaCard = ({ cita, index }) => {
    const colorEstado = getColorEstado(cita.estado);
    const esHoy = esCitaHoy(cita.fecha_consulta);
    const puedeReseñar = cita.estado === 'Completada' && !citasYaResenadas.has(cita.id);
    const yaResenada = citasYaResenadas.has(cita.id);
    
    return (
      <Grid item xs={12} sm={6} lg={4} key={cita.id}>
        <Slide direction="up" in={true} timeout={300 + (index * 100)}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              borderRadius: 3,
              border: `1px solid ${colors.cardBorder}`,
              bgcolor: colors.paper,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-12px)',
                boxShadow: colors.shadow,
                borderColor: colorEstado,
                '& .card-actions': {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              }
            }}
          >
            {/* Indicador de estado superior mejorado */}
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
            
            {/* Badges mejorados */}
            <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
              {esHoy && (
                <Chip
                  label="HOY"
                  size="small"
                  sx={{
                    bgcolor: colors.warning,
                    color: 'white',
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    mb: (puedeReseñar || yaResenada) ? 1 : 0
                  }}
                />
              )}
              
              {puedeReseñar && (
                <Chip
                  icon={<Star sx={{ fontSize: 16 }} />}
                  label="Reseñar"
                  size="small"
                  sx={{
                    bgcolor: colors.review,
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: colors.review,
                      filter: 'brightness(110%)'
                    }
                  }}
                  onClick={() => abrirDialogReseña(cita)}
                />
              )}
              
              {yaResenada && (
                <Chip
                  icon={<CheckCircle sx={{ fontSize: 16 }} />}
                  label="Reseñada"
                  size="small"
                  sx={{
                    bgcolor: colors.success,
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              )}
            </Box>
            
            <CardContent sx={{ p: 3, pb: 1 }}>
              {/* Header con servicio y fecha */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <MedicalServices sx={{ color: colors.primary, fontSize: 20 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: colors.text,
                      fontSize: '1.1rem',
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
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                  
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.subtext,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }}
                  >
                    {formatearFechaCorta(cita.fecha_consulta)}
                  </Typography>
                </Box>
              </Box>
              
              {/* Información principal mejorada */}
              <Stack spacing={2} sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CalendarToday sx={{ color: colors.primary, fontSize: 18 }} />
                  <Typography variant="body2" color={colors.text} fontWeight={500}>
                    {formatearFecha(cita.fecha_consulta)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AccessTime sx={{ color: colors.primary, fontSize: 18 }} />
                  <Typography variant="body2" color={colors.text} fontWeight={600}>
                    {formatearHora(cita.fecha_consulta)}
                  </Typography>
                  {cita.duracion && (
                    <Typography variant="caption" color={colors.subtext}>
                      ({cita.duracion} min)
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Person sx={{ color: colors.primary, fontSize: 18 }} />
                  <Typography variant="body2" color={colors.text}>
                    {cita.odontologo_nombre || 'Por asignar'}
                  </Typography>
                </Box>
              </Stack>
              
              {/* Precio mejorado */}
              {cita.precio_servicio && (
                <Box sx={{ 
                  mb: 2.5, 
                  p: 2,
                  borderRadius: 2,
                  bgcolor: `${colors.primary}08`,
                  border: `1px solid ${colors.primary}20`,
                  textAlign: 'center'
                }}>
                  <Typography variant="body2" color={colors.text} fontWeight={600}>
                    Costo: ${cita.precio_servicio}
                  </Typography>
                </Box>
              )}
            </CardContent>
            
            {/* Acciones mejoradas */}
            <Box 
              className="card-actions"
              sx={{ 
                p: 2, 
                pt: 0,
                opacity: 0.7,
                transform: 'translateY(10px)',
                transition: 'all 0.3s ease'
              }}
            >
              <Stack direction="row" spacing={1}>
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
                    borderRadius: 2,
                    '&:hover': { 
                      borderColor: colors.primary,
                      bgcolor: `${colors.primary}10`,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Detalles
                </Button>
                
                {puedeReseñar && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<RateReview />}
                    onClick={() => abrirDialogReseña(cita)}
                    sx={{
                      bgcolor: colors.primary,
                      borderRadius: 2,
                      '&:hover': { 
                        bgcolor: colors.primary,
                        filter: 'brightness(110%)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Reseñar
                  </Button>
                )}
              </Stack>
            </Box>
          </Card>
        </Slide>
      </Grid>
    );
  };

  // Dialog de reseña mejorado y corregido
  const DialogReseña = () => (
    <Dialog
      open={dialogReseña}
      onClose={() => setDialogReseña(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: colors.paper,
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
        <RateReview />
        Escribir Reseña
        <IconButton
          onClick={() => setDialogReseña(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white'
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {citaParaReseña && (
          <Box>
            <Paper sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: colors.cardBackground, 
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 2
            }}>
              <Typography variant="subtitle1" color={colors.text} fontWeight={600} gutterBottom>
                Servicio: {citaParaReseña.servicio_nombre}
              </Typography>
              <Typography variant="body2" color={colors.secondaryText}>
                Fecha: {formatearFecha(citaParaReseña.fecha_consulta)}
              </Typography>
              <Typography variant="body2" color={colors.secondaryText}>
                Doctor: {citaParaReseña.odontologo_nombre}
              </Typography>
            </Paper>
            
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h6" color={colors.text} gutterBottom>
                Califica tu experiencia
              </Typography>
              <Rating
                value={calificacion}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setCalificacion(newValue);
                  }
                }}
                size="large"
                sx={{
                  '& .MuiRating-iconFilled': {
                    color: colors.warning
                  },
                  '& .MuiRating-iconEmpty': {
                    color: colors.divider
                  }
                }}
              />
            </Box>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comparte tu experiencia"
              placeholder="Cuéntanos cómo fue tu experiencia, qué te gustó y qué podríamos mejorar..."
              value={comentarioReseña}
              onChange={(e) => setComentarioReseña(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: colors.paper,
                  '& fieldset': { 
                    borderColor: colors.inputBorder 
                  },
                  '&:hover fieldset': { 
                    borderColor: colors.primary 
                  },
                  '&.Mui-focused fieldset': { 
                    borderColor: colors.primary 
                  }
                },
                '& .MuiInputLabel-root': {
                  color: colors.inputLabel
                },
                '& .MuiInputBase-input': {
                  color: colors.text
                }
              }}
            />
            
            {enviandoReseña && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  sx={{ 
                    borderRadius: 1,
                    bgcolor: colors.cardBackground,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: colors.primary
                    }
                  }} 
                />
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={() => setDialogReseña(false)}
          variant="outlined"
          disabled={enviandoReseña}
          sx={{
            borderColor: colors.inputBorder,
            color: colors.text,
            borderRadius: 2,
            '&:hover': {
              borderColor: colors.primary,
              bgcolor: colors.hover
            }
          }}
        >
          Cancelar
        </Button>
        
        <Button
          onClick={enviarReseña}
          variant="contained"
          disabled={enviandoReseña || !comentarioReseña.trim()}
          startIcon={enviandoReseña ? null : <Send />}
          sx={{
            bgcolor: colors.primary,
            borderRadius: 2,
            px: 3,
            '&:hover': {
              bgcolor: colors.primary,
              filter: 'brightness(110%)'
            },
            '&:disabled': {
              bgcolor: colors.cardBackground,
              color: colors.secondaryText
            }
          }}
        >
          {enviandoReseña ? 'Enviando...' : 'Enviar Reseña'}
        </Button>
      </DialogActions>
    </Dialog>
  );

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
                      bgcolor: colors.paper,
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
        <IconButton
          onClick={() => setDialogDetalles(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white'
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {cita && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" color={colors.text} gutterBottom fontWeight={600}>
                Información General
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color={colors.subtext} fontWeight={500}>
                    Servicio
                  </Typography>
                  <Typography variant="body1" color={colors.text} fontWeight={600}>
                    {cita.servicio_nombre}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color={colors.subtext} fontWeight={500}>
                    Estado
                  </Typography>
                  <Chip 
                    label={cita.estado} 
                    size="small"
                    sx={{
                      bgcolor: getColorEstado(cita.estado),
                      color: 'white',
                      fontWeight: 600,
                      mt: 0.5
                    }}
                  />
                </Box>
                
                <Box>
                  <Typography variant="body2" color={colors.subtext} fontWeight={500}>
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
              <Typography variant="h6" color={colors.text} gutterBottom fontWeight={600}>
                Información del Profesional
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color={colors.subtext} fontWeight={500}>
                    Odontólogo
                  </Typography>
                  <Typography variant="body1" color={colors.text} fontWeight={600}>
                    {cita.odontologo_nombre || 'Por asignar'}
                  </Typography>
                </Box>
                
                {cita.duracion && (
                  <Box>
                    <Typography variant="body2" color={colors.subtext} fontWeight={500}>
                      Duración estimada
                    </Typography>
                    <Typography variant="body1" color={colors.text}>
                      {cita.duracion} minutos
                    </Typography>
                  </Box>
                )}
                
                {cita.precio_servicio && (
                  <Box>
                    <Typography variant="body2" color={colors.subtext} fontWeight={500}>
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
                <Typography variant="h6" color={colors.text} gutterBottom fontWeight={600}>
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
            borderRadius: 2,
            '&:hover': {
              borderColor: colors.primary,
              bgcolor: `${colors.primary}10`
            }
          }}
        >
          Cerrar
        </Button>
        
        {cita && cita.estado === 'Completada' && !citasYaResenadas.has(cita.id) && (
          <Button
            variant="contained"
            startIcon={<RateReview />}
            onClick={() => {
              setDialogDetalles(false);
              abrirDialogReseña(cita);
            }}
            sx={{
              bgcolor: colors.primary,
              borderRadius: 2,
              '&:hover': { 
                bgcolor: colors.primary, 
                filter: 'brightness(110%)' 
              }
            }}
          >
            Escribir Reseña
          </Button>
        )}
        
        {cita && cita.estado === 'Completada' && citasYaResenadas.has(cita.id) && (
          <Chip
            icon={<CheckCircle />}
            label="Ya reseñaste esta cita"
            sx={{
              bgcolor: colors.success,
              color: 'white',
              fontWeight: 600
            }}
          />
        )}
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header mejorado */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: colors.text,
            mb: 1,
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '2rem', md: '3rem' }
          }}
        >
          Mis Citas Dentales
        </Typography>
        <Typography
          variant="h6"
          color={colors.subtext}
          sx={{ mb: 3, fontWeight: 400 }}
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
            size="large"
            startIcon={<Add />}
            onClick={() => setAgendarDialogOpen(true)}
            sx={{
              bgcolor: colors.primary,
              color: 'white',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 3,
              boxShadow: colors.shadow,
              fontSize: '1rem',
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
            size="large"
            startIcon={<FilterList />}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            sx={{
              borderColor: colors.primary,
              color: colors.primary,
              borderRadius: 3,
              px: 3,
              py: 1.5,
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
            size="large"
            sx={{
              color: colors.primary,
              bgcolor: `${colors.primary}10`,
              borderRadius: 3,
              width: 56,
              height: 56,
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
            bgcolor: colors.paper,
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography variant="h6" color={colors.text} gutterBottom fontWeight={600}>
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
              <Card sx={{ p: 3, bgcolor: colors.paper, borderRadius: 3 }}>
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
            bgcolor: colors.paper
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
            size="large"
            startIcon={<Add />}
            onClick={() => setAgendarDialogOpen(true)}
            sx={{
              bgcolor: colors.primary,
              borderRadius: 3,
              px: 4,
              py: 1.5,
              '&:hover': { 
                bgcolor: colors.primary, 
                filter: 'brightness(110%)' 
              }
            }}
          >
            Agendar Primera Cita
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {citasFiltradas.map((cita, index) => (
            <CitaCard key={cita.id} cita={cita} index={index} />
          ))}
        </Grid>
      )}

      {/* Dialogs */}
      <DetallesCita cita={citaSeleccionada} />
      <DialogReseña />

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
            width: 64,
            height: 64,
            '&:hover': { 
              bgcolor: colors.primary, 
              filter: 'brightness(110%)',
              transform: 'scale(1.1)'
            }
          }}
        >
          <Add sx={{ fontSize: 32 }} />
        </Fab>
      )}

      {/* Notificaciones usando tu componente */}
      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        onClose={handleNotificationClose}
      />
    </Container>
  );
};

export default Citas;