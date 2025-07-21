import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Container,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Fade,
  Tabs,
  Tab,
  LinearProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  CardHeader,
  ListItemButton,
  ListItemIcon,
  Skeleton,
  TablePagination,
  Collapse
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  CalendarToday,
  MedicalServices,
  LocalHospital,
  Assignment,
  Search,
  Clear,
  AttachMoney,
  Receipt,
  TrendingUp,
  Schedule,
  Analytics,
  Close,
  ExpandMore,
  Warning,
  CheckCircle,
  Cancel,
  AccessTime,
  MonetizationOn,
  CreditCard,
  AccountBalance,
  FilterList,
  ViewList,
  ViewModule,
  SortByAlpha,
  DateRange,
  Timeline,
  History,
  Info,
  Error,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Refresh
} from '@mui/icons-material';
import axios from 'axios';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import { useAuth } from '../../../components/Tools/AuthContext';

const ExpedienteClinico = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { isDarkTheme } = useThemeContext();
  const { user } = useAuth();
  
  // Estados para selección de paciente
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Estados para datos del expediente
  const [historialCitas, setHistorialCitas] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);
  const [historialPagos, setHistorialPagos] = useState([]);
  const [serviciosPendientes, setServiciosPendientes] = useState([]);
  const [saldoTotal, setSaldoTotal] = useState(0);
  const [estadisticasPaciente, setEstadisticasPaciente] = useState({});
  
  // Estados de control y UI
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState('table'); // table, cards
  const [sortBy, setSortBy] = useState('fecha_desc');
  const [filterBy, setFilterBy] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedSections, setExpandedSections] = useState({
    resumen: true,
    alertas: true,
    filtros: false
  });
  
  // Estados para notificaciones
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success',
  });

  // Paleta de colores profesional
  const colors = {
    background: isDarkTheme ? '#1A1F2C' : '#FFFFFF',
    cardBg: isDarkTheme ? '#111827' : '#FFFFFF',
    cardBgHover: isDarkTheme ? '#1E293B' : '#F8FAFC',
    text: isDarkTheme ? '#F3F4F6' : '#1F2937',
    subtext: isDarkTheme ? '#94A3B8' : '#64748B',
    primary: isDarkTheme ? '#3B82F6' : '#2563EB',
    secondary: isDarkTheme ? '#4ADE80' : '#10B981',
    accent: isDarkTheme ? '#F59E0B' : '#F59E0B',
    divider: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    boxShadow: isDarkTheme
      ? '0 4px 12px rgba(0,0,0,0.3)'
      : '0 2px 6px rgba(0,0,0,0.05)',
    boxShadowHover: isDarkTheme
      ? '0 8px 24px rgba(0,0,0,0.4)'
      : '0 4px 12px rgba(0,0,0,0.1)',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#06B6D4'
  };

  // Verificar si viene con datos de location.state
  useEffect(() => {
    const { id, nombre, telefono, correo } = location.state || {};
    if (id && nombre) {
      setPacienteSeleccionado({
        id,
        nombre,
        telefono,
        correo,
        email: correo
      });
    }
  }, [location.state]);

  // Buscar pacientes con debounce
  const handleSearchPatient = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get('https://back-end-4803.onrender.com/api/pacientes/all');
      const pacientes = response.data || [];
      
      const filtered = pacientes.filter(paciente =>
        paciente.nombre?.toLowerCase().includes(query.toLowerCase()) ||
        paciente.aPaterno?.toLowerCase().includes(query.toLowerCase()) ||
        paciente.aMaterno?.toLowerCase().includes(query.toLowerCase()) ||
        paciente.email?.toLowerCase().includes(query.toLowerCase()) ||
        paciente.telefono?.includes(query)
      );
      
      setSearchResults(filtered);
    } catch (err) {
      console.error('Error buscando pacientes:', err);
      setNotification({
        open: true,
        message: 'Error al buscar pacientes',
        type: 'error'
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Manejar cambio en búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearchPatient(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Seleccionar paciente
  const handleSelectPatient = (paciente) => {
    setPacienteSeleccionado({
      id: paciente.id,
      nombre: `${paciente.nombre} ${paciente.aPaterno} ${paciente.aMaterno || ''}`.trim(),
      telefono: paciente.telefono,
      correo: paciente.email,
      email: paciente.email
    });
    setSearchQuery('');
    setSearchResults([]);
    setPage(0); // Reset pagination
    setNotification({
      open: true,
      message: `Expediente cargado: ${paciente.nombre} ${paciente.aPaterno}`,
      type: 'success'
    });
  };

  // Limpiar selección
  const handleClearSelection = () => {
    setPacienteSeleccionado(null);
    setHistorialCitas([]);
    setTratamientos([]);
    setHistorialPagos([]);
    setServiciosPendientes([]);
    setTabValue(0);
    setPage(0);
  };

  // Cargar datos completos del expediente
  useEffect(() => {
    const fetchExpedienteCompleto = async () => {
      if (!pacienteSeleccionado?.id) return;

      setLoading(true);

      try {
        // Cargar datos usando los endpoints correctos
        const [
          citasResponse,
          tratamientosResponse,
          pagosResponse
        ] = await Promise.all([
          // Citas del paciente - endpoint correcto
          axios.get(`https://back-end-4803.onrender.com/api/citas/paciente/${pacienteSeleccionado.id}`),
          // Todos los tratamientos 
          axios.get('https://back-end-4803.onrender.com/api/tratamientos/all'),
          // Pagos del paciente - endpoint correcto  
          axios.get(`https://back-end-4803.onrender.com/api/Finanzas/Pagos/?paciente_id=${pacienteSeleccionado.id}`).catch(() => ({ data: [] }))
        ]);

        // Procesar citas
        const citas = citasResponse.data || [];
        setHistorialCitas(citas);

        // Procesar tratamientos del paciente específico
        const todosTratamientos = tratamientosResponse.data || [];
        const tratamientosPaciente = todosTratamientos.filter(t => 
          parseInt(t.paciente_id) === parseInt(pacienteSeleccionado.id)
        );
        setTratamientos(tratamientosPaciente);

        // Procesar pagos
        const pagos = Array.isArray(pagosResponse.data) ? pagosResponse.data : [];
        setHistorialPagos(pagos);

        // Calcular servicios pendientes de pago
        const pendientes = citas
          .filter(cita => !['Pagada', 'Cancelada'].includes(cita.estado))
          .map(cita => ({
            id: cita.consulta_id || cita.id,
            servicio: cita.servicio_nombre,
            precio: parseFloat(cita.precio_servicio || 0),
            fecha: new Date(cita.fecha_consulta),
            estado: cita.estado
          }));
        
        setServiciosPendientes(pendientes);
        setSaldoTotal(pendientes.reduce((sum, item) => sum + item.precio, 0));

        // Calcular estadísticas del paciente
        const totalCitas = citas.length;
        const citasCompletadas = citas.filter(c => c.estado === 'Completada').length;
        const citasCanceladas = citas.filter(c => c.estado === 'Cancelada').length;
        const totalGastado = pagos.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
        
        setEstadisticasPaciente({
          totalCitas,
          citasCompletadas,
          citasCanceladas,
          totalGastado,
          tasaCompletitud: totalCitas > 0 ? ((citasCompletadas / totalCitas) * 100).toFixed(1) : 0,
          tratamientosActivos: tratamientosPaciente.filter(t => t.estado === 'Activo').length,
          proximaCita: citas
            .filter(c => new Date(c.fecha_consulta) > new Date())
            .sort((a, b) => new Date(a.fecha_consulta) - new Date(b.fecha_consulta))[0]
        });

        setNotification({
          open: true,
          message: `Expediente cargado exitosamente: ${totalCitas} citas, ${tratamientosPaciente.length} tratamientos`,
          type: 'success'
        });

      } catch (err) {
        console.error('Error al cargar expediente:', err);
        setNotification({
          open: true,
          message: 'Error al cargar los datos del expediente',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExpedienteCompleto();
  }, [pacienteSeleccionado]);

  // Función para obtener color del estado
  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completada':
      case 'finalizado':
      case 'pagada':
      case 'pagado':
        return colors.success;
      case 'confirmada':
      case 'activo':
        return colors.primary;
      case 'pendiente':
        return colors.warning;
      case 'cancelada':
        return colors.error;
      default:
        return colors.subtext;
    }
  };

  // Formatear fecha
  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Formatear fecha y hora
  const formatFechaHora = (fecha) => {
    const date = new Date(fecha);
    return {
      fecha: date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      hora: date.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  // Manejo de tabs
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0); // Reset pagination al cambiar tab
  };

  // Manejar cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Manejar cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Toggle secciones expandibles
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Datos filtrados y ordenados para citas
  const citasFiltradas = useMemo(() => {
    let filtered = [...historialCitas];

    // Filtrar por estado
    if (filterBy !== 'todos') {
      filtered = filtered.filter(cita => cita.estado === filterBy);
    }

    // Ordenar
    switch (sortBy) {
      case 'fecha_desc':
        filtered.sort((a, b) => new Date(b.fecha_consulta) - new Date(a.fecha_consulta));
        break;
      case 'fecha_asc':
        filtered.sort((a, b) => new Date(a.fecha_consulta) - new Date(b.fecha_consulta));
        break;
      case 'servicio':
        filtered.sort((a, b) => (a.servicio_nombre || '').localeCompare(b.servicio_nombre || ''));
        break;
      case 'estado':
        filtered.sort((a, b) => (a.estado || '').localeCompare(b.estado || ''));
        break;
      default:
        break;
    }

    return filtered;
  }, [historialCitas, filterBy, sortBy]);

  // Estados únicos para filtros
  const estadosUnicos = useMemo(() => {
    const estados = [...new Set(historialCitas.map(cita => cita.estado))].filter(Boolean);
    return estados.sort();
  }, [historialCitas]);

  // Datos paginados
  const citasPaginadas = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return citasFiltradas.slice(startIndex, startIndex + rowsPerPage);
  }, [citasFiltradas, page, rowsPerPage]);

  // Componente de Skeleton para carga
  const SkeletonTable = () => (
    <Box>
      {[...Array(5)].map((_, index) => (
        <Skeleton 
          key={index}
          variant="rectangular" 
          height={60} 
          sx={{ 
            mb: 1,
            borderRadius: 1,
            bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
          }} 
        />
      ))}
    </Box>
  );

  if (!pacienteSeleccionado) {
    return (
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Box sx={{ mt: 10 }}>
          {/* Header de búsqueda */}
          <Paper
            sx={{
              backgroundColor: colors.cardBg,
              borderRadius: 3,
              p: 4,
              mb: 3,
              boxShadow: colors.boxShadow,
              textAlign: 'center'
            }}
          >
            <Assignment sx={{ color: colors.primary, fontSize: 64, mb: 2 }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: colors.text,
                mb: 1
              }}
            >
              Expediente Clínico Digital
            </Typography>
            <Typography variant="body1" sx={{ color: colors.subtext, mb: 4 }}>
              Sistema Integral de Gestión Médica • Dr. {user?.nombre || 'Usuario'}
            </Typography>
            
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <TextField
                fullWidth
                label="Buscar paciente (nombre, apellido, correo o teléfono)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                size="large"
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: colors.primary }} />
                    </InputAdornment>
                  ),
                  endAdornment: isSearching && (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  )
                }}
              />

              {/* Resultados de búsqueda */}
              {searchResults.length > 0 && (
                <Paper
                  sx={{
                    backgroundColor: colors.cardBgHover,
                    border: `1px solid ${colors.divider}`,
                    borderRadius: 2,
                    maxHeight: '400px',
                    overflow: 'auto'
                  }}
                >
                  <List>
                    {searchResults.map((paciente) => (
                      <ListItemButton
                        key={paciente.id}
                        onClick={() => handleSelectPatient(paciente)}
                        sx={{
                          '&:hover': {
                            backgroundColor: colors.cardBg
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: colors.primary }}>
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${paciente.nombre} ${paciente.aPaterno} ${paciente.aMaterno || ''}`.trim()}
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ color: colors.subtext }}>
                                 {paciente.email || 'Sin correo'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: colors.subtext }}>
                                 {paciente.telefono || 'Sin teléfono'}
                              </Typography>
                            </Box>
                          }
                          sx={{
                            '& .MuiListItemText-primary': {
                              color: colors.text,
                              fontWeight: 600
                            }
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Paper>
              )}

              {searchQuery && searchResults.length === 0 && !isSearching && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No se encontraron pacientes con ese criterio de búsqueda
                </Alert>
              )}
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box sx={{ mt: 10 }}>
        {/* Header del expediente */}
        <Paper
          sx={{
            backgroundColor: colors.cardBg,
            borderRadius: 3,
            p: 3,
            mb: 3,
            boxShadow: colors.boxShadow
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Assignment sx={{ color: colors.primary, mr: 2, fontSize: 32 }} />
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: colors.text,
                    fontSize: { xs: '1.4rem', md: '1.6rem' }
                  }}
                >
                  Expediente Clínico - {pacienteSeleccionado.nombre}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.subtext }}>
                  Dr. {user?.nombre || 'Usuario'} • {new Date().toLocaleDateString('es-MX')}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => window.location.reload()}
                sx={{
                  color: colors.primary,
                  borderColor: colors.primary,
                  '&:hover': {
                    backgroundColor: colors.primary + '10'
                  }
                }}
              >
                Actualizar
              </Button>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleClearSelection}
                sx={{
                  color: colors.subtext,
                  borderColor: colors.divider,
                  '&:hover': {
                    backgroundColor: colors.cardBgHover
                  }
                }}
              >
                Cambiar Paciente
              </Button>
            </Box>
          </Box>

          {/* Información básica del paciente */}
          <Box sx={{ bgcolor: colors.cardBgHover, p: 2, borderRadius: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ color: colors.primary, mr: 1 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.subtext }}>
                      Paciente
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.text, fontWeight: 600 }}>
                      {pacienteSeleccionado.nombre}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Email sx={{ color: colors.secondary, mr: 1 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.subtext }}>
                      Correo
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.text, fontWeight: 600 }}>
                      {pacienteSeleccionado.correo || 'No disponible'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Phone sx={{ color: colors.accent, mr: 1 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.subtext }}>
                      Teléfono
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.text, fontWeight: 600 }}>
                      {pacienteSeleccionado.telefono || 'No disponible'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Dashboard de métricas */}
        <Accordion 
          expanded={expandedSections.resumen}
          onChange={() => toggleSection('resumen')}
          sx={{ mb: 2, bgcolor: colors.cardBg, boxShadow: colors.boxShadow }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Analytics sx={{ mr: 1, color: colors.primary }} />
                Resumen del Expediente
              </Box>
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', bgcolor: colors.cardBgHover, p: 2 }}>
                  <CalendarToday sx={{ color: colors.primary, fontSize: 32, mb: 1 }} />
                  <Typography variant="h5" sx={{ color: colors.primary, fontWeight: 700 }}>
                    {estadisticasPaciente.totalCitas || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.subtext }}>
                    Total Citas
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', bgcolor: colors.cardBgHover, p: 2 }}>
                  <CheckCircle sx={{ color: colors.success, fontSize: 32, mb: 1 }} />
                  <Typography variant="h5" sx={{ color: colors.success, fontWeight: 700 }}>
                    {estadisticasPaciente.tasaCompletitud || 0}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.subtext }}>
                    Completitud
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', bgcolor: colors.cardBgHover, p: 2 }}>
                  <MonetizationOn sx={{ color: colors.accent, fontSize: 32, mb: 1 }} />
                  <Typography variant="h5" sx={{ color: colors.accent, fontWeight: 700, fontSize: '1.2rem' }}>
                    {formatCurrency(estadisticasPaciente.totalGastado)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.subtext }}>
                    Total Gastado
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', bgcolor: colors.cardBgHover, p: 2 }}>
                  <LocalHospital sx={{ color: colors.secondary, fontSize: 32, mb: 1 }} />
                  <Typography variant="h5" sx={{ color: colors.secondary, fontWeight: 700 }}>
                    {estadisticasPaciente.tratamientosActivos || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.subtext }}>
                    Tratamientos Activos
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Alertas importantes */}
        {(saldoTotal > 0 || estadisticasPaciente.proximaCita) && (
          <Accordion 
            expanded={expandedSections.alertas}
            onChange={() => toggleSection('alertas')}
            sx={{ mb: 2, bgcolor: colors.cardBg, boxShadow: colors.boxShadow }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Warning sx={{ mr: 1, color: colors.warning }} />
                  Alertas y Recordatorios
                </Box>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {saldoTotal > 0 && (
                  <Grid item xs={12} md={6}>
                    <Alert 
                      severity="warning" 
                      icon={<Warning />}
                      sx={{ backgroundColor: colors.warning + '20' }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Próxima cita: {formatFecha(estadisticasPaciente.proximaCita.fecha_consulta)}
                      </Typography>
                      <Typography variant="caption">
                        {estadisticasPaciente.proximaCita.servicio_nombre}
                      </Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} sx={{ color: colors.primary }} />
          </Box>
        )}

        {/* Tabs principales con filtros */}
        {!loading && (
          <Paper
            sx={{
              backgroundColor: colors.cardBg,
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: colors.boxShadow
            }}
          >
            {/* Header de tabs con contadores */}
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons="auto"
              sx={{
                borderBottom: `1px solid ${colors.divider}`,
                '& .MuiTab-root': {
                  color: colors.subtext,
                  fontWeight: 600,
                  textTransform: 'none',
                  minHeight: 60
                },
                '& .Mui-selected': {
                  color: colors.primary
                }
              }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ fontSize: 18 }} />
                    <span>Consultas</span>
                    <Badge badgeContent={historialCitas.length} color="primary" max={99} />
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalHospital sx={{ fontSize: 18 }} />
                    <span>Tratamientos</span>
                    <Badge badgeContent={tratamientos.length} color="secondary" max={99} />
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoney sx={{ fontSize: 18 }} />
                    <span>Finanzas</span>
                    <Badge badgeContent={historialPagos.length} color="warning" max={99} />
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Analytics sx={{ fontSize: 18 }} />
                    <span>Reportes</span>
                  </Box>
                } 
              />
            </Tabs>

            {/* Contenido de las tabs */}
            <Box sx={{ p: 3 }}>
              {/* Tab 0: Historial de Consultas con filtros avanzados */}
              {tabValue === 0 && (
                <Box>
                  {/* Filtros y controles */}
                  <Accordion 
                    expanded={expandedSections.filtros}
                    onChange={() => toggleSection('filtros')}
                    sx={{ mb: 3, bgcolor: colors.cardBgHover }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FilterList sx={{ color: colors.primary }} />
                        <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
                          Filtros y Ordenamiento
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Filtrar por Estado</InputLabel>
                            <Select
                              value={filterBy}
                              label="Filtrar por Estado"
                              onChange={(e) => setFilterBy(e.target.value)}
                            >
                              <MenuItem value="todos">Todos los Estados</MenuItem>
                              {estadosUnicos.map(estado => (
                                <MenuItem key={estado} value={estado}>
                                  {estado}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Ordenar por</InputLabel>
                            <Select
                              value={sortBy}
                              label="Ordenar por"
                              onChange={(e) => setSortBy(e.target.value)}
                            >
                              <MenuItem value="fecha_desc">Fecha (Más reciente)</MenuItem>
                              <MenuItem value="fecha_asc">Fecha (Más antigua)</MenuItem>
                              <MenuItem value="servicio">Servicio A-Z</MenuItem>
                              <MenuItem value="estado">Estado A-Z</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={(e, newMode) => newMode && setViewMode(newMode)}
                            size="small"
                          >
                            <ToggleButton value="table">
                              <ViewList />
                            </ToggleButton>
                            <ToggleButton value="cards">
                              <ViewModule />
                            </ToggleButton>
                          </ToggleButtonGroup>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
                            {citasFiltradas.length} resultado(s) de {historialCitas.length} total
                          </Typography>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>

                  {/* Contenido principal de consultas */}
                  {historialCitas.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <CalendarToday sx={{ fontSize: 64, color: colors.subtext, mb: 2 }} />
                      <Typography variant="h6" sx={{ color: colors.subtext, mb: 1 }}>
                        No hay consultas registradas
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.subtext }}>
                        Las citas aparecerán aquí una vez que se registren
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {viewMode === 'table' ? (
                        // Vista de tabla
                        <>
                          <TableContainer>
                            <Table>
                              <TableHead sx={{ backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 700, color: colors.text }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <CalendarToday sx={{ mr: 1, fontSize: 18, color: colors.primary }} />
                                      Fecha y Hora
                                    </Box>
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 700, color: colors.text }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <MedicalServices sx={{ mr: 1, fontSize: 18, color: colors.secondary }} />
                                      Servicio
                                    </Box>
                                  </TableCell>
                                  {!isMobile && (
                                    <TableCell sx={{ fontWeight: 700, color: colors.text }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Person sx={{ mr: 1, fontSize: 18, color: colors.accent }} />
                                        Odontólogo
                                      </Box>
                                    </TableCell>
                                  )}
                                  <TableCell sx={{ fontWeight: 700, color: colors.text }}>
                                    Estado
                                  </TableCell>
                                  {!isMobile && (
                                    <TableCell sx={{ fontWeight: 700, color: colors.text }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <MonetizationOn sx={{ mr: 1, fontSize: 18, color: colors.accent }} />
                                        Precio
                                      </Box>
                                    </TableCell>
                                  )}
                                  {!isMobile && (
                                    <TableCell sx={{ fontWeight: 700, color: colors.text }}>
                                      Observaciones
                                    </TableCell>
                                  )}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {citasPaginadas.map((cita, index) => (
                                  <TableRow
                                    key={cita.consulta_id || cita.id || index}
                                    sx={{
                                      '&:hover': {
                                        backgroundColor: colors.cardBgHover
                                      },
                                      borderLeft: `4px solid ${getEstadoColor(cita.estado)}`
                                    }}
                                  >
                                    <TableCell sx={{ color: colors.text }}>
                                      <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                          {formatFechaHora(cita.fecha_consulta).fecha}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: colors.subtext }}>
                                          {formatFechaHora(cita.fecha_consulta).hora}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    
                                    <TableCell sx={{ color: colors.text }}>
                                      <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                          {cita.servicio_nombre}
                                        </Typography>
                                        {cita.tratamiento_id && (
                                          <Chip
                                            label={`Tratamiento #${cita.tratamiento_id}`}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                              fontSize: '0.7rem',
                                              height: 20,
                                              mt: 0.5,
                                              borderColor: colors.accent,
                                              color: colors.accent
                                            }}
                                          />
                                        )}
                                      </Box>
                                    </TableCell>
                                    
                                    {!isMobile && (
                                      <TableCell sx={{ color: colors.text }}>
                                        <Typography variant="body2">
                                          {cita.odontologo_nombre || 'No asignado'}
                                        </Typography>
                                      </TableCell>
                                    )}
                                    
                                    <TableCell>
                                      <Chip
                                        label={cita.estado}
                                        size="small"
                                        sx={{
                                          backgroundColor: getEstadoColor(cita.estado),
                                          color: '#FFFFFF',
                                          fontSize: '0.75rem',
                                          fontWeight: 600
                                        }}
                                      />
                                    </TableCell>
                                    
                                    {!isMobile && (
                                      <TableCell sx={{ color: colors.text }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.accent }}>
                                          {formatCurrency(cita.precio_servicio)}
                                        </Typography>
                                      </TableCell>
                                    )}
                                    
                                    {!isMobile && (
                                      <TableCell sx={{ color: colors.text, maxWidth: '200px' }}>
                                        <Tooltip title={cita.notas || 'Sin observaciones'} arrow>
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              fontSize: '0.8rem',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap'
                                            }}
                                          >
                                            {cita.notas || 'Sin observaciones'}
                                          </Typography>
                                        </Tooltip>
                                      </TableCell>
                                    )}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          
                          {/* Paginación */}
                          <TablePagination
                            component="div"
                            count={citasFiltradas.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            labelRowsPerPage="Filas por página:"
                            labelDisplayedRows={({ from, to, count }) =>
                              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                            }
                            sx={{
                              borderTop: `1px solid ${colors.divider}`,
                              '& .MuiTablePagination-toolbar': {
                                color: colors.text
                              },
                              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                color: colors.subtext
                              }
                            }}
                          />
                        </>
                      ) : (
                        // Vista de cards
                        <Grid container spacing={3}>
                          {citasPaginadas.map((cita, index) => (
                            <Grid item xs={12} sm={6} md={4} key={cita.consulta_id || cita.id || index}>
                              <Card
                                sx={{
                                  backgroundColor: colors.cardBgHover,
                                  borderLeft: `4px solid ${getEstadoColor(cita.estado)}`,
                                  borderRadius: 3,
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    boxShadow: colors.boxShadowHover,
                                    transform: 'translateY(-2px)'
                                  }
                                }}
                              >
                                <CardHeader
                                  title={
                                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                                      {cita.servicio_nombre}
                                    </Typography>
                                  }
                                  subheader={formatFecha(cita.fecha_consulta)}
                                  action={
                                    <Chip
                                      label={cita.estado}
                                      size="small"
                                      sx={{
                                        backgroundColor: getEstadoColor(cita.estado),
                                        color: '#FFFFFF',
                                        fontSize: '0.7rem'
                                      }}
                                    />
                                  }
                                />
                                <CardContent sx={{ pt: 0 }}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" sx={{ color: colors.subtext, mb: 1 }}>
                                      {formatFechaHora(cita.fecha_consulta).hora}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: colors.subtext, mb: 1 }}>
                                      {cita.odontologo_nombre || 'No asignado'}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: colors.accent, fontWeight: 600 }}>
                                      {formatCurrency(cita.precio_servicio)}
                                    </Typography>
                                  </Box>
                                  
                                  {cita.tratamiento_id && (
                                    <Chip
                                      label={`Tratamiento #${cita.tratamiento_id}`}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        fontSize: '0.7rem',
                                        mb: 1,
                                        borderColor: colors.accent,
                                        color: colors.accent
                                      }}
                                    />
                                  )}
                                  
                                  {cita.notas && (
                                    <Typography variant="body2" sx={{ color: colors.text, fontSize: '0.85rem' }}>
                                     {cita.notas}
                                    </Typography>
                                  )}
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </>
                  )}
                </Box>
              )}

              {/* Tab 1: Tratamientos */}
              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600, mb: 3 }}>
                    Tratamientos del Paciente
                  </Typography>
                  
                  {tratamientos.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <LocalHospital sx={{ fontSize: 64, color: colors.subtext, mb: 2 }} />
                      <Typography variant="h6" sx={{ color: colors.subtext, mb: 1 }}>
                        No hay tratamientos registrados
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.subtext }}>
                        Los tratamientos aparecerán aquí una vez que se inicien
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={3}>
                      {tratamientos.map((tratamiento) => (
                        <Grid item xs={12} md={6} key={tratamiento.id}>
                          <Card
                            sx={{
                              backgroundColor: colors.cardBgHover,
                              borderRadius: 3,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                boxShadow: colors.boxShadowHover,
                                transform: 'translateY(-2px)'
                              }
                            }}
                          >
                            <CardHeader
                              avatar={
                                <Avatar sx={{ bgcolor: getEstadoColor(tratamiento.estado) }}>
                                  <LocalHospital />
                                </Avatar>
                              }
                              title={
                                <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                  {tratamiento.nombre_tratamiento}
                                </Typography>
                              }
                              subheader={`Iniciado: ${formatFecha(tratamiento.fecha_inicio)}`}
                              action={
                                <Chip
                                  label={tratamiento.estado}
                                  sx={{
                                    backgroundColor: getEstadoColor(tratamiento.estado),
                                    color: '#FFFFFF',
                                    fontSize: '0.75rem',
                                    fontWeight: 600
                                  }}
                                />
                              }
                            />
                            <CardContent>
                              <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" sx={{ color: colors.subtext, mb: 1 }}>
                                  Progreso del Tratamiento
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="body2" sx={{ color: colors.text, mr: 2 }}>
                                    {tratamiento.citas_completadas || 0} de {tratamiento.total_citas_programadas || 0} citas
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: colors.primary, fontWeight: 600 }}>
                                    {tratamiento.total_citas_programadas > 0
                                      ? Math.round((tratamiento.citas_completadas / tratamiento.total_citas_programadas) * 100)
                                      : 0}%
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={
                                    tratamiento.total_citas_programadas > 0
                                      ? (tratamiento.citas_completadas / tratamiento.total_citas_programadas) * 100
                                      : 0
                                  }
                                  sx={{
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: colors.divider,
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: colors.secondary,
                                      borderRadius: 5
                                    }
                                  }}
                                />
                              </Box>
                              
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <Typography variant="caption" sx={{ color: colors.subtext }}>
                                    Fecha Estimada Fin
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
                                    {tratamiento.fecha_estimada_fin ? formatFecha(tratamiento.fecha_estimada_fin) : 'No definida'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="caption" sx={{ color: colors.subtext }}>
                                    Costo Total
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: colors.accent, fontWeight: 700 }}>
                                    {formatCurrency(tratamiento.costo_total)}
                                  </Typography>
                                </Grid>
                              </Grid>
                              
                              {tratamiento.notas && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: colors.cardBg, borderRadius: 2 }}>
                                  <Typography variant="caption" sx={{ color: colors.subtext }}>
                                    Notas del Tratamiento
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: colors.text, fontSize: '0.85rem' }}>
                                    {tratamiento.notas}
                                  </Typography>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}

              {/* Tab 2: Finanzas */}
              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600, mb: 3 }}>
                    Gestión Financiera del Paciente
                  </Typography>
                  
                  {/* Resumen financiero */}
                  <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ textAlign: 'center', bgcolor: colors.cardBgHover, p: 3 }}>
                        <MonetizationOn sx={{ color: colors.success, fontSize: 48, mb: 2 }} />
                        <Typography variant="h4" sx={{ color: colors.success, fontWeight: 700, mb: 1 }}>
                          {formatCurrency(estadisticasPaciente.totalGastado)}
                        </Typography>
                        <Typography variant="body1" sx={{ color: colors.subtext }}>
                          Total Gastado
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.subtext }}>
                          {historialPagos.length} pagos realizados
                        </Typography>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Card sx={{ textAlign: 'center', bgcolor: colors.cardBgHover, p: 3 }}>
                        <Warning sx={{ color: colors.warning, fontSize: 48, mb: 2 }} />
                        <Typography variant="h4" sx={{ color: colors.warning, fontWeight: 700, mb: 1 }}>
                          {formatCurrency(saldoTotal)}
                        </Typography>
                        <Typography variant="body1" sx={{ color: colors.subtext }}>
                          Saldo Pendiente
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.subtext }}>
                          {serviciosPendientes.length} servicios pendientes
                        </Typography>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Card sx={{ textAlign: 'center', bgcolor: colors.cardBgHover, p: 3 }}>
                        <AccountBalance sx={{ color: colors.primary, fontSize: 48, mb: 2 }} />
                        <Typography variant="h4" sx={{ color: colors.primary, fontWeight: 700, mb: 1 }}>
                          {formatCurrency((estadisticasPaciente.totalGastado || 0) + saldoTotal)}
                        </Typography>
                        <Typography variant="body1" sx={{ color: colors.subtext }}>
                          Total General
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.subtext }}>
                          Pagado + Pendiente
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>

                  <Grid container spacing={3}>
                    {/* Servicios pendientes */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Assignment sx={{ mr: 1, color: colors.warning }} />
                          Servicios Pendientes de Pago
                        </Box>
                      </Typography>
                      
                      {serviciosPendientes.length === 0 ? (
                        <Alert severity="success" icon={<CheckCircle />}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            ¡Excelente! No hay servicios pendientes de pago
                          </Typography>
                        </Alert>
                      ) : (
                        <Box>
                          {serviciosPendientes.map((servicio, index) => (
                            <Card key={index} sx={{ mb: 2, bgcolor: colors.cardBgHover }}>
                              <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body1" sx={{ color: colors.text, fontWeight: 600, mb: 0.5 }}>
                                      {servicio.servicio}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: colors.subtext }}>
                                      <CalendarToday sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                      {formatFecha(servicio.fecha)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="h6" sx={{ color: colors.warning, fontWeight: 700 }}>
                                      {formatCurrency(servicio.precio)}
                                    </Typography>
                                    <Chip
                                      label={servicio.estado}
                                      size="small"
                                      sx={{
                                        backgroundColor: getEstadoColor(servicio.estado),
                                        color: '#FFFFFF',
                                        fontSize: '0.7rem'
                                      }}
                                    />
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          ))}
                          
                          <Card sx={{ bgcolor: colors.warning + '20', borderLeft: `4px solid ${colors.warning}` }}>
                            <CardContent sx={{ p: 2 }}>
                              <Typography variant="h6" sx={{ color: colors.warning, fontWeight: 700 }}>
                                Total Pendiente: {formatCurrency(saldoTotal)}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Box>
                      )}
                    </Grid>

                    {/* Historial de pagos */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CreditCard sx={{ mr: 1, color: colors.success }} />
                          Historial de Pagos
                        </Box>
                      </Typography>
                      
                      {historialPagos.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <CreditCard sx={{ fontSize: 48, color: colors.subtext, mb: 2 }} />
                          <Typography variant="body1" sx={{ color: colors.subtext }}>
                            No hay pagos registrados
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                          {historialPagos
                            .sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago))
                            .map((pago, index) => (
                            <Card key={index} sx={{ mb: 2, bgcolor: colors.cardBgHover }}>
                              <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body1" sx={{ color: colors.text, fontWeight: 600, mb: 0.5 }}>
                                      {pago.concepto || 'Pago de servicios médicos'}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="h6" sx={{ color: colors.success, fontWeight: 700 }}>
                                      {formatCurrency(pago.total)}
                                    </Typography>
                                    <Chip
                                      label={pago.estado}
                                      size="small"
                                      sx={{
                                        backgroundColor: getEstadoColor(pago.estado),
                                        color: '#FFFFFF',
                                        fontSize: '0.7rem'
                                      }}
                                    />
                                  </Box>
                                </Box>
                                
                                {pago.notas && (
                                  <Typography variant="body2" sx={{ color: colors.text, mt: 1, fontSize: '0.8rem', fontStyle: 'italic' }}>
                                    <Assignment sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                    {pago.notas}
                                  </Typography>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Tab 3: Reportes y Analytics */}
              {tabValue === 3 && (
                <Box>
                  <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Analytics sx={{ mr: 1, color: colors.primary }} />
                      Reportes y Análisis del Paciente
                    </Box>
                  </Typography>
                  
                  {/* Métricas generales */}
                  <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} md={6}>
                      <Card sx={{ bgcolor: colors.cardBgHover, p: 3 }}>
                        <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TrendingUp sx={{ mr: 1, color: colors.primary }} />
                            Resumen de Actividad
                          </Box>
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: colors.cardBg, borderRadius: 2 }}>
                              <Typography variant="h4" sx={{ color: colors.primary, fontWeight: 700 }}>
                                {estadisticasPaciente.citasCompletadas || 0}
                              </Typography>
                              <Typography variant="caption" sx={{ color: colors.subtext }}>
                                Citas Completadas
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: colors.cardBg, borderRadius: 2 }}>
                              <Typography variant="h4" sx={{ color: colors.error, fontWeight: 700 }}>
                                {estadisticasPaciente.citasCanceladas || 0}
                              </Typography>
                              <Typography variant="caption" sx={{ color: colors.subtext }}>
                                Citas Canceladas
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: colors.cardBg, borderRadius: 2 }}>
                              <Typography variant="h4" sx={{ color: colors.secondary, fontWeight: 700 }}>
                                {estadisticasPaciente.tratamientosActivos || 0}
                              </Typography>
                              <Typography variant="caption" sx={{ color: colors.subtext }}>
                                Tratamientos Activos
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: colors.cardBg, borderRadius: 2 }}>
                              <Typography variant="h4" sx={{ color: colors.success, fontWeight: 700 }}>
                                {estadisticasPaciente.tasaCompletitud || 0}%
                              </Typography>
                              <Typography variant="caption" sx={{ color: colors.subtext }}>
                                Tasa de Completitud
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card sx={{ bgcolor: colors.cardBgHover, p: 3 }}>
                        <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <MedicalServices sx={{ mr: 1, color: colors.secondary }} />
                            Servicios Más Utilizados
                          </Box>
                        </Typography>
                        
                        {historialCitas.length > 0 ? (
                          <Box>
                            {(() => {
                              // Calcular servicios más utilizados
                              const serviciosCount = historialCitas.reduce((acc, cita) => {
                                const servicio = cita.servicio_nombre;
                                acc[servicio] = (acc[servicio] || 0) + 1;
                                return acc;
                              }, {});
                              
                              const serviciosOrdenados = Object.entries(serviciosCount)
                                .sort(([,a], [,b]) => b - a)
                                .slice(0, 5);
                              
                              return serviciosOrdenados.map(([servicio, count], index) => (
                                <Box key={index} sx={{ mb: 2 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
                                      {servicio}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: colors.primary, fontWeight: 600 }}>
                                      {count} veces
                                    </Typography>
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={(count / Math.max(...Object.values(serviciosCount))) * 100}
                                    sx={{
                                      height: 6,
                                      borderRadius: 3,
                                      backgroundColor: colors.divider,
                                      '& .MuiLinearProgress-bar': {
                                        backgroundColor: colors.primary,
                                        borderRadius: 3
                                      }
                                    }}
                                  />
                                </Box>
                              ));
                            })()}
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ color: colors.subtext, textAlign: 'center', py: 2 }}>
                            No hay datos suficientes para mostrar estadísticas
                          </Typography>
                        )}
                      </Card>
                    </Grid>
                  </Grid>
                  
                  {/* Timeline simplificado */}
                  <Card sx={{ bgcolor: colors.cardBgHover, p: 3 }}>
                    <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600, mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <History sx={{ mr: 1, color: colors.primary }} />
                        Cronología Reciente
                      </Box>
                    </Typography>
                    
                    {(() => {
                      // Crear timeline combinando citas y pagos
                      const eventos = [];
                      
                      // Agregar citas
                      historialCitas.slice(0, 10).forEach(cita => {
                        eventos.push({
                          fecha: new Date(cita.fecha_consulta),
                          tipo: 'cita',
                          titulo: cita.servicio_nombre,
                          descripcion: `Estado: ${cita.estado}`,
                          icono: <MedicalServices />,
                          color: getEstadoColor(cita.estado)
                        });
                      });
                      
                      // Agregar pagos
                      historialPagos.slice(0, 5).forEach(pago => {
                        eventos.push({
                          fecha: new Date(pago.fecha_pago),
                          tipo: 'pago',
                          titulo: `Pago: ${formatCurrency(pago.total)}`,
                          descripcion: pago.concepto || 'Pago de servicios',
                          icono: <AttachMoney />,
                          color: colors.success
                        });
                      });
                      
                      // Ordenar por fecha (más reciente primero)
                      eventos.sort((a, b) => b.fecha - a.fecha);
                      
                      return eventos.slice(0, 8).map((evento, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                          <Avatar
                            sx={{
                              bgcolor: evento.color,
                              width: 40,
                              height: 40,
                              mr: 2
                            }}
                          >
                            {evento.icono}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ color: colors.text, fontWeight: 600 }}>
                              {evento.titulo}
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.subtext, mb: 0.5 }}>
                              {evento.descripcion}
                            </Typography>
                            <Typography variant="caption" sx={{ color: colors.subtext }}>
                              {formatFecha(evento.fecha)}
                            </Typography>
                          </Box>
                        </Box>
                      ));
                    })()}
                  </Card>
                </Box>
              )}
            </Box>
          </Paper>
        )}

        {/* Componente de Notificaciones */}
        <Notificaciones
          open={notification.open}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, open: false })}
        />
      </Box>
    </Container>
  );
};

export default ExpedienteClinico; 