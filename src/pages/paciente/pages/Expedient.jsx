import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  LinearProgress,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination
} from '@mui/material';
import {
  Assignment,
  Person,
  Email,
  Phone,
  CalendarToday,
  MedicalServices,
  LocalHospital,
  AttachMoney,
  Analytics,
  CheckCircle,
  Warning,
  MonetizationOn,
  AccountBalance,
  ExpandMore,
  Timeline,
  History,
  TrendingUp,
  CreditCard,
  Receipt
} from '@mui/icons-material';
import axios from 'axios';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import { useAuth } from '../../../components/Tools/AuthContext';

// Componente principal del expediente personal del paciente
const ExpedientePacientePersonal = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isDarkTheme } = useThemeContext();
  const { user } = useAuth();
  
  // Estados para datos del expediente
  const [historialCitas, setHistorialCitas] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);
  const [historialPagos, setHistorialPagos] = useState([]);
  const [estadisticasPaciente, setEstadisticasPaciente] = useState({});
  
  // Estados de control y UI
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [sortBy, setSortBy] = useState('fecha_desc');
  const [filterBy, setFilterBy] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedSections, setExpandedSections] = useState({
    resumen: true,
    filtros: false
  });
  
  // Estados para notificaciones
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success',
  });

  // Colores según tema
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
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#06B6D4'
  };

  // Cargar datos del expediente del paciente autenticado
  useEffect(() => {
    const fetchExpedientePersonal = async () => {
      if (!user?.id || user?.tipo !== 'paciente') {
        setNotification({
          open: true,
          message: 'No se puede acceder al expediente. Usuario no válido.',
          type: 'error'
        });
        return;
      }

      setLoading(true);

      try {
        // Cargar datos del paciente autenticado
        const [
          citasResponse,
          tratamientosResponse,
          pagosResponse
        ] = await Promise.all([
          // Citas del paciente autenticado
          axios.get(`https://back-end-4803.onrender.com/api/citas/paciente/${user.id}`),
          // Tratamientos del paciente
          axios.get('https://back-end-4803.onrender.com/api/tratamientos/all'),
          // Pagos del paciente
          axios.get(`https://back-end-4803.onrender.com/api/Finanzas/Pagos/?paciente_id=${user.id}`).catch(() => ({ data: [] }))
        ]);

        // Procesar citas
        const citas = citasResponse.data || [];
        setHistorialCitas(citas);

        // Filtrar tratamientos del paciente autenticado
        const todosTratamientos = tratamientosResponse.data || [];
        const tratamientosPaciente = todosTratamientos.filter(t => 
          parseInt(t.paciente_id) === parseInt(user.id)
        );
        setTratamientos(tratamientosPaciente);

        // Procesar pagos
        const pagos = Array.isArray(pagosResponse.data) ? pagosResponse.data : [];
        setHistorialPagos(pagos);

        // Calcular estadísticas
        const totalCitas = citas.length;
        const citasCompletadas = citas.filter(c => c.estado === 'Completada').length;
        const citasCanceladas = citas.filter(c => c.estado === 'Cancelada').length;
        const totalGastado = pagos.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
        const saldoPendiente = citas
          .filter(cita => !['Pagada', 'Cancelada'].includes(cita.estado))
          .reduce((sum, cita) => sum + parseFloat(cita.precio_servicio || 0), 0);
        
        setEstadisticasPaciente({
          totalCitas,
          citasCompletadas,
          citasCanceladas,
          totalGastado,
          saldoPendiente,
          tasaCompletitud: totalCitas > 0 ? ((citasCompletadas / totalCitas) * 100).toFixed(1) : 0,
          tratamientosActivos: tratamientosPaciente.filter(t => t.estado === 'Activo').length,
          proximaCita: citas
            .filter(c => new Date(c.fecha_consulta) > new Date())
            .sort((a, b) => new Date(a.fecha_consulta) - new Date(b.fecha_consulta))[0]
        });

        setNotification({
          open: true,
          message: 'Expediente cargado exitosamente',
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

    fetchExpedientePersonal();
  }, [user]);

  // Obtener color del estado
  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completada':
      case 'finalizado':
      case 'pagada':
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

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  // Manejar cambio de tabs
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  // Datos filtrados para citas
  const citasFiltradas = useMemo(() => {
    let filtered = [...historialCitas];

    if (filterBy !== 'todos') {
      filtered = filtered.filter(cita => cita.estado === filterBy);
    }

    switch (sortBy) {
      case 'fecha_desc':
        filtered.sort((a, b) => new Date(b.fecha_consulta) - new Date(a.fecha_consulta));
        break;
      case 'fecha_asc':
        filtered.sort((a, b) => new Date(a.fecha_consulta) - new Date(b.fecha_consulta));
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

  // Toggle secciones expandibles
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!user || user.tipo !== 'paciente') {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mt: 4 }}>
          <Typography variant="h6">Acceso Denegado</Typography>
          <Typography>Esta sección solo está disponible para pacientes autenticados.</Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box sx={{ mt: 2 }}>
        {/* Header del expediente personal */}
        <Paper
          sx={{
            backgroundColor: colors.cardBg,
            borderRadius: 3,
            p: 3,
            mb: 3,
            boxShadow: colors.boxShadow
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
                Mi Expediente Clínico
              </Typography>
              <Typography variant="body2" sx={{ color: colors.subtext }}>
                {new Date().toLocaleDateString('es-MX')} • Paciente: {user.nombre}
              </Typography>
            </Box>
          </Box>

          {/* Información básica del paciente */}
          <Box sx={{ bgcolor: colors.cardBgHover, p: 2, borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ color: colors.primary, mr: 1 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.subtext }}>
                      Nombre Completo
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.text, fontWeight: 600 }}>
                      {user.nombre}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Email sx={{ color: colors.secondary, mr: 1 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.subtext }}>
                      Correo Electrónico
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.text, fontWeight: 600 }}>
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Assignment sx={{ color: colors.accent, mr: 1 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.subtext }}>
                      ID de Paciente
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.text, fontWeight: 600 }}>
                      #{user.id}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Resumen de métricas */}
        <Accordion 
          expanded={expandedSections.resumen}
          onChange={() => toggleSection('resumen')}
          sx={{ mb: 2, bgcolor: colors.cardBg, boxShadow: colors.boxShadow }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Analytics sx={{ mr: 1, color: colors.primary }} />
                Resumen de Mi Historial Médico
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
                    Total de Citas
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
                    Asistencia
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
        {(estadisticasPaciente.saldoPendiente > 0 || estadisticasPaciente.proximaCita) && (
          <Alert 
            severity="info" 
            icon={<Warning />}
            sx={{ mb: 2, bgcolor: colors.info + '20' }}
          >
            <Grid container spacing={2}>
              {estadisticasPaciente.proximaCita && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Próxima cita: {formatFecha(estadisticasPaciente.proximaCita.fecha_consulta)}
                  </Typography>
                  <Typography variant="caption">
                    {estadisticasPaciente.proximaCita.servicio_nombre}
                  </Typography>
                </Grid>
              )}
              {estadisticasPaciente.saldoPendiente > 0 && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Saldo pendiente: {formatCurrency(estadisticasPaciente.saldoPendiente)}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} sx={{ color: colors.primary }} />
          </Box>
        )}

        {/* Tabs principales */}
        {!loading && (
          <Paper
            sx={{
              backgroundColor: colors.cardBg,
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: colors.boxShadow
            }}
          >
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
                    <span>Mis Consultas</span>
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalHospital sx={{ fontSize: 18 }} />
                    <span>Mis Tratamientos</span>
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoney sx={{ fontSize: 18 }} />
                    <span>Mis Pagos</span>
                  </Box>
                } 
              />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {/* Tab 0: Historial de Consultas */}
              {tabValue === 0 && (
                <Box>
                  {/* Filtros */}
                  <Accordion 
                    expanded={expandedSections.filtros}
                    onChange={() => toggleSection('filtros')}
                    sx={{ mb: 3, bgcolor: colors.cardBgHover }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
                        Filtros y Ordenamiento
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} sm={6}>
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
                        
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Ordenar por</InputLabel>
                            <Select
                              value={sortBy}
                              label="Ordenar por"
                              onChange={(e) => setSortBy(e.target.value)}
                            >
                              <MenuItem value="fecha_desc">Fecha (Más reciente)</MenuItem>
                              <MenuItem value="fecha_asc">Fecha (Más antigua)</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>

                  {historialCitas.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <CalendarToday sx={{ fontSize: 64, color: colors.subtext, mb: 2 }} />
                      <Typography variant="h6" sx={{ color: colors.subtext, mb: 1 }}>
                        No tienes consultas registradas
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.subtext }}>
                        Tus citas aparecerán aquí una vez que las agendes
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <TableContainer>
                        <Table>
                          <TableHead sx={{ backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, color: colors.text }}>
                                Fecha y Hora
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700, color: colors.text }}>
                                Servicio
                              </TableCell>
                              {!isMobile && (
                                <TableCell sx={{ fontWeight: 700, color: colors.text }}>
                                  Odontólogo
                                </TableCell>
                              )}
                              <TableCell sx={{ fontWeight: 700, color: colors.text }}>
                                Estado
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700, color: colors.text }}>
                                Precio
                              </TableCell>
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
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {formatFecha(cita.fecha_consulta)}
                                  </Typography>
                                </TableCell>
                                
                                <TableCell sx={{ color: colors.text }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {cita.servicio_nombre}
                                  </Typography>
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
                                
                                <TableCell sx={{ color: colors.text }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: colors.accent }}>
                                    {formatCurrency(cita.precio_servicio)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      
                      <TablePagination
                        component="div"
                        count={citasFiltradas.length}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                          setRowsPerPage(parseInt(e.target.value, 10));
                          setPage(0);
                        }}
                        rowsPerPageOptions={[5, 10, 25]}
                        labelRowsPerPage="Filas por página:"
                        sx={{
                          borderTop: `1px solid ${colors.divider}`,
                          '& .MuiTablePagination-toolbar': {
                            color: colors.text
                          }
                        }}
                      />
                    </>
                  )}
                </Box>
              )}

              {/* Tab 1: Tratamientos */}
              {tabValue === 1 && (
                <Box>
                  {tratamientos.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <LocalHospital sx={{ fontSize: 64, color: colors.subtext, mb: 2 }} />
                      <Typography variant="h6" sx={{ color: colors.subtext, mb: 1 }}>
                        No tienes tratamientos activos
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.subtext }}>
                        Tus tratamientos aparecerán aquí una vez que inicien
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={3}>
                      {tratamientos.map((tratamiento) => (
                        <Grid item xs={12} md={6} key={tratamiento.id}>
                          <Card sx={{ bgcolor: colors.cardBgHover, borderRadius: 3 }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar sx={{ bgcolor: getEstadoColor(tratamiento.estado), mr: 2 }}>
                                  <LocalHospital />
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
                                    {tratamiento.nombre_tratamiento}
                                  </Typography>
                                  <Chip
                                    label={tratamiento.estado}
                                    size="small"
                                    sx={{
                                      backgroundColor: getEstadoColor(tratamiento.estado),
                                      color: '#FFFFFF'
                                    }}
                                  />
                                </Box>
                              </Box>
                              
                              <Typography variant="body2" sx={{ color: colors.subtext, mb: 2 }}>
                                Inicio: {formatFecha(tratamiento.fecha_inicio)}
                              </Typography>
                              
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ color: colors.subtext, mb: 1 }}>
                                  Progreso: {tratamiento.citas_completadas || 0} de {tratamiento.total_citas_programadas || 0} citas
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={
                                    tratamiento.total_citas_programadas > 0
                                      ? (tratamiento.citas_completadas / tratamiento.total_citas_programadas) * 100
                                      : 0
                                  }
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: colors.divider,
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: colors.secondary,
                                      borderRadius: 4
                                    }
                                  }}
                                />
                              </Box>
                              
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <Typography variant="caption" sx={{ color: colors.subtext }}>
                                    Costo Total
                                  </Typography>
                                  <Typography variant="body1" sx={{ color: colors.accent, fontWeight: 700 }}>
                                    {formatCurrency(tratamiento.costo_total)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="caption" sx={{ color: colors.subtext }}>
                                    Fecha Est. Fin
                                  </Typography>
                                  <Typography variant="body1" sx={{ color: colors.text, fontWeight: 600 }}>
                                    {tratamiento.fecha_estimada_fin ? formatFecha(tratamiento.fecha_estimada_fin) : 'Por definir'}
                                  </Typography>
                                </Grid>
                              </Grid>
                              
                              {tratamiento.notas && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: colors.cardBg, borderRadius: 2 }}>
                                  <Typography variant="caption" sx={{ color: colors.subtext, display: 'block', mb: 0.5 }}>
                                    Notas del Tratamiento:
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

              {/* Tab 2: Historial de Pagos */}
              {tabValue === 2 && (
                <Box>
                  {/* Resumen financiero personal */}
                  <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ textAlign: 'center', bgcolor: colors.cardBgHover, p: 3 }}>
                        <MonetizationOn sx={{ color: colors.success, fontSize: 48, mb: 2 }} />
                        <Typography variant="h4" sx={{ color: colors.success, fontWeight: 700, mb: 1 }}>
                          {formatCurrency(estadisticasPaciente.totalGastado)}
                        </Typography>
                        <Typography variant="body1" sx={{ color: colors.subtext }}>
                          Total Pagado
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
                          {formatCurrency(estadisticasPaciente.saldoPendiente)}
                        </Typography>
                        <Typography variant="body1" sx={{ color: colors.subtext }}>
                          Saldo Pendiente
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.subtext }}>
                          Por pagar
                        </Typography>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Card sx={{ textAlign: 'center', bgcolor: colors.cardBgHover, p: 3 }}>
                        <AccountBalance sx={{ color: colors.primary, fontSize: 48, mb: 2 }} />
                        <Typography variant="h4" sx={{ color: colors.primary, fontWeight: 700, mb: 1 }}>
                          {formatCurrency((estadisticasPaciente.totalGastado || 0) + (estadisticasPaciente.saldoPendiente || 0))}
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

                  {/* Historial de pagos */}
                  <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CreditCard sx={{ mr: 1, color: colors.success }} />
                      Historial de Mis Pagos
                    </Box>
                  </Typography>
                  
                  {historialPagos.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <CreditCard sx={{ fontSize: 64, color: colors.subtext, mb: 2 }} />
                      <Typography variant="h6" sx={{ color: colors.subtext, mb: 1 }}>
                        No tienes pagos registrados
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.subtext }}>
                        Tus pagos aparecerán aquí una vez que los realices
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      {historialPagos
                        .sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago))
                        .map((pago, index) => (
                        <Card key={index} sx={{ mb: 2, bgcolor: colors.cardBgHover }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" sx={{ color: colors.text, fontWeight: 600, mb: 0.5 }}>
                                  {pago.concepto || 'Pago de servicios odontológicos'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: colors.subtext }}>
                                  <CalendarToday sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                  {formatFecha(pago.fecha_pago)}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h6" sx={{ color: colors.success, fontWeight: 700 }}>
                                  {formatCurrency(pago.total)}
                                </Typography>
                                <Chip
                                  label={pago.estado || 'Pagado'}
                                  size="small"
                                  sx={{
                                    backgroundColor: getEstadoColor(pago.estado || 'pagado'),
                                    color: '#FFFFFF',
                                    fontSize: '0.7rem'
                                  }}
                                />
                              </Box>
                            </Box>
                            
                            {pago.notas && (
                              <Typography variant="body2" sx={{ color: colors.text, mt: 1, fontSize: '0.8rem', fontStyle: 'italic' }}>
                                <Receipt sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                {pago.notas}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
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

export default ExpedientePacientePersonal;