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
  Alert,
  Skeleton,
  Stack,
  useMediaQuery,
  Fab,
  Collapse,
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
  Cancel,
  Visibility,
  CheckCircle,
  MedicalServices,
  TrendingUp,
  EventAvailable,
  Star,
  RateReview,
  Send,
  Close,
  Schedule
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
  const { user } = useAuth();
  
  // Estados para datos
  const [citas, setCitas] = useState([]);
  const [citasLoading, setCitasLoading] = useState(true);
  const [citasError, setCitasError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Estados para próxima cita
  const [proximaCita, setProximaCita] = useState(null);
  const [proximaCitaLoading, setProximaCitaLoading] = useState(false);
  
  // Estados para UI
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [dialogDetalles, setDialogDetalles] = useState(false);
  const [agendarDialogOpen, setAgendarDialogOpen] = useState(false);
  
  // Estados para reseñas - SIMPLIFICADOS
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
  
  const pacienteId = user?.id;

  // Configuración de colores
  const colors = {
    background: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
    paper: isDarkTheme ? '#243447' : '#ffffff',
    text: isDarkTheme ? '#FFFFFF' : '#333333',
    secondaryText: isDarkTheme ? '#E8F1FF' : '#666666',
    primary: isDarkTheme ? '#4B9FFF' : '#1976d2',
    hover: isDarkTheme ? 'rgba(75,159,255,0.15)' : 'rgba(25,118,210,0.1)',
    inputBorder: isDarkTheme ? '#4B9FFF' : '#1976d2',
    cardBackground: isDarkTheme ? '#1D2B3A' : '#F8FAFC',
    cardBorder: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    success: isDarkTheme ? '#22c55e' : '#16a34a',
    warning: isDarkTheme ? '#f59e0b' : '#d97706',
    error: isDarkTheme ? '#ef4444' : '#dc2626',
    shadow: isDarkTheme ? '0 10px 15px -3px rgba(0,0,0,0.3)' : '0 10px 15px -3px rgba(0,0,0,0.1)',
    gradientBg: isDarkTheme 
      ? 'linear-gradient(135deg, #243447 0%, #1B2A3A 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #F9FDFF 100%)',
    subtext: isDarkTheme ? '#94a3b8' : '#475569',
    cardBg: isDarkTheme ? '#243447' : '#ffffff',
    primaryLight: isDarkTheme ? '#60a5fa' : '#3b82f6',
    secondary: isDarkTheme ? '#10b981' : '#059669',
    accent: isDarkTheme ? '#f59e0b' : '#d97706'
  };

  // Estados de citas
  const estadosCitas = [
    { valor: 'todas', label: 'Todas', color: colors.primary, icon: EventNote },
    { valor: 'Programada', label: 'Programadas', color: colors.secondary, icon: EventAvailable },
    { valor: 'Confirmada', label: 'Confirmadas', color: colors.success, icon: CheckCircle },
    { valor: 'En curso', label: 'En Progreso', color: colors.warning, icon: TrendingUp },
    { valor: 'Completada', label: 'Completadas', color: colors.primary, icon: CheckCircle },
    { valor: 'Cancelada', label: 'Canceladas', color: colors.error, icon: Cancel },
    { valor: 'Reprogramada', label: 'Reprogramadas', color: colors.accent, icon: Schedule }
  ];

  // Cargar próxima cita
useEffect(() => {
  const fetchProximaCita = async () => {
    if (!pacienteId) return;

    try {
      setProximaCitaLoading(true);
      const response = await fetch(`https://back-end-4803.onrender.com/api/citas/paciente/${pacienteId}/proxima`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Validación adicional en frontend
        if (data.tiene_proxima_cita && data.cita) {
          const estadosValidos = ['Programada', 'Confirmada', 'En curso'];
          const fechaCita = new Date(data.cita.fecha_completa);
          const ahora = new Date();
          
          // Solo mostrar si está en estado válido y es futura
          if (estadosValidos.includes(data.cita.estado) && fechaCita >= ahora) {
            setProximaCita(data.cita);
          } else {
            setProximaCita(null);
          }
        } else {
          setProximaCita(null);
        }
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

  // Cargar todas las citas
  useEffect(() => {
    const fetchCitas = async () => {
      if (!pacienteId) return;

      try {
        setCitasLoading(true);
        setCitasError(null);
        
        const response = await fetch(`https://back-end-4803.onrender.com/api/citas/paciente/${pacienteId}`);
        
        if (!response.ok) throw new Error('Error al obtener las citas');
        
        const data = await response.json();
        
        // Ordenar citas
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
        
        // Verificar reseñas existentes
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

  // Escuchar evento de refresh
  useEffect(() => {
    const handleRefreshCitas = () => setRefreshTrigger(prev => prev + 1);
    window.addEventListener('refreshCitas', handleRefreshCitas);
    return () => window.removeEventListener('refreshCitas', handleRefreshCitas);
  }, []);

  // Funciones de utilidad
  const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

  const mostrarNotificacion = (message, type = 'success') => {
    setNotification({ open: true, message, type });
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Filtrar citas
  const citasFiltradas = citas.filter(cita => {
    const cumpleFiltroEstado = filtroEstado === 'todas' || cita.estado === filtroEstado;
    const cumpleBusqueda = !busqueda || 
      cita.servicio_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      cita.odontologo_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      cita.estado?.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleFiltroEstado && cumpleBusqueda;
  });

  // Estadísticas
  const estadisticasCitas = estadosCitas.reduce((acc, estado) => {
    if (estado.valor === 'todas') {
      acc[estado.valor] = citas.length;
    } else {
      acc[estado.valor] = citas.filter(cita => cita.estado === estado.valor).length;
    }
    return acc;
  }, {});

  // Obtener color por estado
  const getColorEstado = (estado) => {
    const estadoConfig = estadosCitas.find(e => e.valor === estado);
    return estadoConfig ? estadoConfig.color : colors.primary;
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
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

  const formatearFechaCorta = (fecha) => {
    const fechaStr = fecha.toString();
    const fechaObj = new Date(fechaStr + (fechaStr.includes('T') ? '' : 'T00:00:00'));
    
    return fechaObj.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      timeZone: 'America/Mexico_City'
    });
  };

  const formatearHora = (fecha) => {
    const fechaStr = fecha.toString();
    if (fechaStr.includes('.000Z')) {
      const match = fechaStr.match(/T(\d{2}):(\d{2}):(\d{2})/);
      if (match) return match[1] + ':' + match[2];
    }
    
    const match = fechaStr.match(/\s(\d{2}):(\d{2})/);
    if (match) return match[1] + ':' + match[2];
    
    const fechaObj = new Date(fechaStr);
    return fechaObj.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const esCitaHoy = (fecha) => {
    const fechaStr = fecha.toString();
    const fechaCita = new Date(fechaStr + (fechaStr.includes('T') ? '' : 'T00:00:00'));
    const hoy = new Date();
    
    const fechaCitaStr = fechaCita.toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' });
    const hoyStr = hoy.toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' });
    
    return fechaCitaStr === hoyStr;
  };

  // Funciones de reseña - SIMPLIFICADAS
  const abrirDialogReseña = (cita) => {
    setCitaParaReseña(cita);
    setCalificacion(5);
    setComentarioReseña('');
    setDialogReseña(true);
  };

  const cerrarDialogReseña = () => {
    if (!enviandoReseña) {
      setDialogReseña(false);
      setCitaParaReseña(null);
      setComentarioReseña('');
      setCalificacion(5);
    }
  };

  const enviarReseña = async () => {
    if (!citaParaReseña || !comentarioReseña.trim()) {
      mostrarNotificacion('Por favor, escriba un comentario para su reseña', 'warning');
      return;
    }

    setEnviandoReseña(true);
    
    try {
      const response = await fetch('https://back-end-4803.onrender.com/api/resenya/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_id: pacienteId,
          cita_id: citaParaReseña.id,
          comentario: comentarioReseña.trim(),
          calificacion: calificacion
        }),
      });

      if (response.ok) {
        mostrarNotificacion('¡Reseña enviada correctamente! Gracias por su opinión.', 'success');
        setCitasYaResenadas(prev => new Set([...prev, citaParaReseña.id]));
        cerrarDialogReseña();
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

  // Componente de estadísticas
  const EstadisticasCitas = () => (
    <Paper elevation={0} sx={{
      p: { xs: 2, md: 3 },
      mb: 3,
      borderRadius: 3,
      border: `1px solid ${colors.cardBorder}`,
      background: colors.gradientBg
    }}>
      <Typography variant="h6" color={colors.text} gutterBottom sx={{ 
        mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600
      }}>
        <TrendingUp sx={{ color: colors.primary }} />
        Resumen de Citas
      </Typography>
      
      <Grid container spacing={2}>
        {estadosCitas.slice(0, 4).map((estado) => {
          const Icon = estado.icon;
          const count = estadisticasCitas[estado.valor] || 0;
          
          return (
            <Grid item xs={6} sm={3} key={estado.valor}>
              <Paper elevation={0} sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 3,
                border: `1px solid ${colors.cardBorder}`,
                backgroundColor: colors.paper,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: colors.shadow,
                  borderColor: estado.color
                }
              }}
              onClick={() => setFiltroEstado(estado.valor)}>
                <Box sx={{
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
                }}>
                  <Icon sx={{ color: estado.color, fontSize: 24 }} />
                </Box>
                <Typography variant="h4" sx={{
                  color: estado.color,
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: { xs: '1.5rem', sm: '2rem' }
                }}>
                  {count}
                </Typography>
                <Typography variant="caption" color={colors.subtext} sx={{ 
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5
                }}>
                  {estado.label}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );

  // Componente de próxima cita
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
      <Paper elevation={0} sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        border: `2px solid ${colors.primary}`,
        background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.cardBg} 100%)`
      }}>
        {esHoy && (
          <Chip label="¡HOY!" size="small" sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            bgcolor: colors.warning,
            color: 'white',
            fontWeight: 700
          }} />
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{
            bgcolor: colors.primary,
            width: 64,
            height: 64,
            boxShadow: `0 4px 12px ${colors.primary}40`
          }}>
            <CalendarToday sx={{ fontSize: 32 }} />
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{
              color: colors.text,
              fontWeight: 700,
              mb: 0.5
            }}>
              {esHoy ? '¡Tu cita es hoy!' : 'Próxima Cita'}
            </Typography>
            
            <Typography variant="h6" sx={{
              color: colors.primary,
              fontWeight: 600
            }}>
              {proximaCita.tipo}
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={2} alignItems="center">
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
              
              <Chip label={proximaCita.estado} size="small" sx={{
                bgcolor: getColorEstado(proximaCita.estado),
                color: 'white',
                fontWeight: 600,
                width: 'fit-content'
              }} />
            </Stack>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 1.5 }}>
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

  // Componente de tarjeta de cita
  const CitaCard = ({ cita, index }) => {
    const colorEstado = getColorEstado(cita.estado);
    const esHoy = esCitaHoy(cita.fecha_consulta);
    const puedeReseñar = cita.estado === 'Completada' && !citasYaResenadas.has(cita.id);
    const yaResenada = citasYaResenadas.has(cita.id);
    
    return (
      <Grid item xs={12} sm={6} lg={4} key={cita.id}>
        <Card elevation={0} sx={{
          height: '100%',
          borderRadius: 3,
          border: `1px solid ${colors.cardBorder}`,
          bgcolor: colors.paper,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: colors.shadow,
            borderColor: colorEstado
          }
        }}>
          {/* Indicador de estado */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${colorEstado} 0%, ${colorEstado}80 100%)`
          }} />
          
          {/* Badges */}
          <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
            {esHoy && (
              <Chip label="HOY" size="small" sx={{
                bgcolor: colors.warning,
                color: 'white',
                fontWeight: 700,
                mb: (puedeReseñar || yaResenada) ? 1 : 0
              }} />
            )}
            
            {puedeReseñar && (
              <Chip
                icon={<Star sx={{ fontSize: 16 }} />}
                label="Reseñar"
                size="small"
                sx={{
                  bgcolor: colors.primary,
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': { filter: 'brightness(110%)' }
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
            {/* Header */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <MedicalServices sx={{ color: colors.primary, fontSize: 20 }} />
                <Typography variant="h6" sx={{
                  fontWeight: 600,
                  color: colors.text,
                  fontSize: '1.1rem',
                  lineHeight: 1.3
                }}>
                  {cita.servicio_nombre}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Chip label={cita.estado} size="small" sx={{
                  bgcolor: colorEstado,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }} />
                
                <Typography variant="caption" sx={{
                  color: colors.subtext,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5
                }}>
                  {formatearFechaCorta(cita.fecha_consulta)}
                </Typography>
              </Box>
            </Box>
            
            {/* Información */}
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
            
            {/* Precio */}
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
          
          {/* Acciones */}
          <Box sx={{ p: 2, pt: 0 }}>
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
                    bgcolor: `${colors.primary}10`
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
                      filter: 'brightness(110%)'
                    }
                  }}
                >
                  Reseñar
                </Button>
              )}
            </Stack>
          </Box>
        </Card>
      </Grid>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{
          fontWeight: 700,
          color: colors.text,
          mb: 1,
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: { xs: '2rem', md: '3rem' }
        }}>
          Mis Citas Dentales
        </Typography>
        <Typography variant="h6" color={colors.subtext} sx={{ mb: 3, fontWeight: 400 }}>
          Gestiona tus citas y mantente al día con tu salud bucal
        </Typography>
        
        {/* Acciones principales */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
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
                filter: 'brightness(110%)'
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
              '&:hover': { bgcolor: `${colors.primary}20` }
            }}
          >
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Próxima cita */}
      <ProximaCitaDestacada />

      {/* Filtros */}
      <Collapse in={mostrarFiltros}>
        <Paper elevation={0} sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${colors.cardBorder}`,
          bgcolor: colors.paper
        }}>
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
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Reintentar
            </Button>
          }
        >
          Error al cargar las citas: {citasError}
        </Alert>
      ) : citasFiltradas.length === 0 ? (
        <Paper elevation={0} sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 3,
          border: `1px solid ${colors.cardBorder}`,
          bgcolor: colors.paper
        }}>
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

      {/* Dialog de detalles de cita */}
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
          {citaSeleccionada && (
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
                      {citaSeleccionada.servicio_nombre}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color={colors.subtext} fontWeight={500}>
                      Estado
                    </Typography>
                    <Chip label={citaSeleccionada.estado} size="small" sx={{
                      bgcolor: getColorEstado(citaSeleccionada.estado),
                      color: 'white',
                      fontWeight: 600,
                      mt: 0.5
                    }} />
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color={colors.subtext} fontWeight={500}>
                      Fecha y Hora
                    </Typography>
                    <Typography variant="body1" color={colors.text}>
                      {formatearFecha(citaSeleccionada.fecha_consulta)}
                    </Typography>
                    <Typography variant="body1" color={colors.text} fontWeight={600}>
                      {formatearHora(citaSeleccionada.fecha_consulta)}
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
                      {citaSeleccionada.odontologo_nombre || 'Por asignar'}
                    </Typography>
                  </Box>
                  
                  {citaSeleccionada.duracion && (
                    <Box>
                      <Typography variant="body2" color={colors.subtext} fontWeight={500}>
                        Duración estimada
                      </Typography>
                      <Typography variant="body1" color={colors.text}>
                        {citaSeleccionada.duracion} minutos
                      </Typography>
                    </Box>
                  )}
                  
                  {citaSeleccionada.precio_servicio && (
                    <Box>
                      <Typography variant="body2" color={colors.subtext} fontWeight={500}>
                        Costo
                      </Typography>
                      <Typography variant="body1" color={colors.text} fontWeight={600}>
                        ${citaSeleccionada.precio_servicio}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Grid>
              
              {citaSeleccionada.notas && (
                <Grid item xs={12}>
                  <Typography variant="h6" color={colors.text} gutterBottom fontWeight={600}>
                    Notas adicionales
                  </Typography>
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: colors.cardBackground, 
                    border: `1px solid ${colors.cardBorder}`,
                    borderRadius: 2
                  }}>
                    <Typography variant="body2" color={colors.text}>
                      {citaSeleccionada.notas}
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
          
          {citaSeleccionada && citaSeleccionada.estado === 'Completada' && !citasYaResenadas.has(citaSeleccionada.id) && (
            <Button
              variant="contained"
              startIcon={<RateReview />}
              onClick={() => {
                setDialogDetalles(false);
                abrirDialogReseña(citaSeleccionada);
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
          
          {citaSeleccionada && citaSeleccionada.estado === 'Completada' && citasYaResenadas.has(citaSeleccionada.id) && (
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

      {/* Dialog de reseña - INTEGRADO Y OPTIMIZADO */}
      <Dialog
        open={dialogReseña}
        onClose={cerrarDialogReseña}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: colors.paper
          }
        }}
      >
        <DialogTitle>
          <RateReview />
          Escribir Reseña
          <IconButton
            onClick={cerrarDialogReseña}
            disabled={enviandoReseña}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {citaParaReseña && (
            <Box>
              <Paper sx={{ p: 2, mb: 3, bgcolor: colors.cardBackground, borderRadius: 2 }}>
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
                  disabled={enviandoReseña}
                  size="large"
                />
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comparte tu experiencia"
                placeholder="Cuéntanos cómo fue tu experiencia..."
                value={comentarioReseña}
                onChange={(e) => setComentarioReseña(e.target.value)}
                disabled={enviandoReseña}
                variant="outlined"
              />
              
              {enviandoReseña && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={cerrarDialogReseña}
            variant="outlined"
            disabled={enviandoReseña}
          >
            Cancelar
          </Button>
          
          <Button
            onClick={enviarReseña}
            variant="contained"
            disabled={enviandoReseña || !comentarioReseña.trim()}
            startIcon={enviandoReseña ? null : <Send />}
          >
            {enviandoReseña ? 'Enviando...' : 'Enviar Reseña'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para agendar cita */}
      <AgendarCitaDialog
        open={agendarDialogOpen}
        onClose={() => setAgendarDialogOpen(false)}
        onSuccess={handleRefresh}
      />

      {/* FAB para móvil */}
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
              filter: 'brightness(110%)'
            }
          }}
        >
          <Add sx={{ fontSize: 32 }} />
        </Fab>
      )}

      {/* Notificaciones */}
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