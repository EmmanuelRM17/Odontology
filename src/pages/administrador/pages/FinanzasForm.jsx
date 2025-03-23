import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Grid, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select,
  Typography, 
  Paper, 
  Divider, 
  InputAdornment, 
  CircularProgress,
  Alert,
  Autocomplete,
  Chip,
  Card,
  CardContent,
  Stack,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Tooltip,
  Collapse,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  Avatar
} from '@mui/material';
import { 
  Receipt, 
  Person, 
  CalendarMonth, 
  Payment, 
  SaveAlt, 
  Cancel, 
  Event, 
  CheckCircle,
  PendingActions,
  PointOfSale,
  Healing,
  PaymentsTwoTone,
  ReceiptLong,
  Info,
  ArrowDropDown,
  ArrowDropUp,
  History,
  MoreVert,
  AttachMoney,
  Search,
  FilterList,
  Add
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import axios from 'axios';
import { useAuth } from '../../../components/Tools/AuthContext';

// Función para generar colores de estado
const getStatusColor = (estado) => {
  const statusColors = {
    'Pendiente': '#ffa726',
    'Confirmada': '#42a5f5',
    'Completada': '#66bb6a',
    'Pagada': '#26a69a',
    'Cancelada': '#ef5350',
    'Pagado': '#26a69a', 
    'Parcial': '#ab47bc'
  };
  return statusColors[estado] || '#757575';
};

// Componente de gestión de pagos con UX mejorada
const FinanzasForm = ({ idPago = null, onSave, onCancel }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Estados del componente
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [pacientes, setPacientes] = useState([]);
  const [citas, setCitas] = useState([]);
  const [historialPagos, setHistorialPagos] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [showDetails, setShowDetails] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [filtroEstadoCitas, setFiltroEstadoCitas] = useState([]);
  const [isPagoParcial, setIsPagoParcial] = useState(false);
  const [serviciosPendientes, setServiciosPendientes] = useState([]);
  const [saldoTotal, setSaldoTotal] = useState(0);

  // Estado del formulario
  const [formValues, setFormValues] = useState({
    paciente_id: '',
    cita_id: '',
    factura_id: '',
    monto: 0,
    subtotal: 0,
    total: 0,
    concepto: '',
    metodo_pago: 'Efectivo',
    fecha_pago: new Date(),
    estado: 'Pagado',
    comprobante: '',
    notas: ''
  });

  // Estado para errores de validación
  const [formErrors, setFormErrors] = useState({});

  // Efecto para cargar pacientes
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://back-end-4803.onrender.com/api/reportes/pacientes');
        setPacientes(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar pacientes:', err);
        setError('No se pudieron cargar los pacientes. Intenta de nuevo más tarde.');
        setLoading(false);
      }
    };

    fetchPacientes();
  }, []);

  // Cargar datos del pago si existe
  useEffect(() => {
    const fetchPago = async () => {
      if (!idPago) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`https://back-end-4803.onrender.com/api/Finanzas/Pagos/${idPago}`);
        
        setFormValues({
          ...response.data,
          fecha_pago: new Date(response.data.fecha_pago)
        });
        
        // Buscar el paciente
        const paciente = pacientes.find(p => p.id === response.data.paciente_id);
        if (paciente) {
          setPacienteSeleccionado(paciente);
          await fetchPacienteData(paciente.id);
        }
        
        // Si tiene cita asociada, buscarla
        if (response.data.cita_id) {
          const citaResponse = await axios.get(`https://back-end-4803.onrender.com/api/citas/${response.data.cita_id}`);
          setCitaSeleccionada(citaResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error(`Error al cargar el pago #${idPago}:`, err);
        setError('Error al cargar los datos del pago');
        setLoading(false);
      }
    };

    fetchPago();
  }, [idPago, pacientes]);

  // Función para cargar los datos completos del paciente (citas y pagos)
  const fetchPacienteData = async (pacienteId) => {
    try {
      setLoading(true);
      
      // Cargar citas - IMPORTANTE: ahora cargamos TODAS las citas, no solo las pendientes
      const citasResponse = await axios.get(`https://back-end-4803.onrender.com/api/citas/paciente/${pacienteId}`);
      setCitas(citasResponse.data);
      
      // Extraer servicios pendientes de pago
      const pendientes = citasResponse.data
        .filter(cita => cita.estado !== 'Pagada' && cita.estado !== 'Cancelada')
        .map(cita => ({
          id: cita.id,
          servicio: cita.servicio_nombre,
          precio: cita.precio_servicio,
          fecha: new Date(cita.fecha_consulta),
          estado: cita.estado
        }));
      
      setServiciosPendientes(pendientes);
      
      // Calcular saldo total de servicios pendientes
      const total = pendientes.reduce((sum, item) => sum + parseFloat(item.precio || 0), 0);
      setSaldoTotal(total);
      
      // Cargar historial de pagos
      const pagosResponse = await axios.get(`https://back-end-4803.onrender.com/api/Finanzas/Pagos/?paciente_id=${pacienteId}`);
      setHistorialPagos(pagosResponse.data || []);
      
      setLoading(false);
    } catch (err) {
      console.error(`Error al cargar datos del paciente #${pacienteId}:`, err);
      setLoading(false);
      setCitas([]);
      setHistorialPagos([]);
      setServiciosPendientes([]);
      setSaldoTotal(0);
    }
  };

  // Agrupar citas por estado para mejor visualización
  const citasAgrupadas = useMemo(() => {
    if (!citas.length) return {};
    
    const grupos = citas.reduce((acc, cita) => {
      const estado = cita.estado || 'Otro';
      if (!acc[estado]) acc[estado] = [];
      acc[estado].push(cita);
      return acc;
    }, {});
    
    // Ordenar por fecha dentro de cada grupo
    Object.keys(grupos).forEach(key => {
      grupos[key].sort((a, b) => new Date(b.fecha_consulta) - new Date(a.fecha_consulta));
    });
    
    return grupos;
  }, [citas]);

  // Filtrar citas según los filtros aplicados
  const citasFiltradas = useMemo(() => {
    if (!citas.length) return [];
    
    let filtered = [...citas];
    
    // Aplicar filtros de estado si existen
    if (filtroEstadoCitas.length > 0) {
      filtered = filtered.filter(cita => filtroEstadoCitas.includes(cita.estado));
    }
    
    // Ordenar por fecha (más recientes primero)
    filtered.sort((a, b) => new Date(b.fecha_consulta) - new Date(a.fecha_consulta));
    
    return filtered;
  }, [citas, filtroEstadoCitas]);

  // Manejadores de eventos para tabs
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Manejador de cambios en campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Lógica especial para monto en caso de pago parcial
    if (name === 'monto' && isPagoParcial) {
      const numValue = parseFloat(value);
      const numTotal = parseFloat(formValues.total);
      
      // Validar que el monto parcial no exceda el total
      if (numValue > numTotal) {
        setFormErrors(prev => ({ 
          ...prev, 
          monto: 'El monto no puede exceder el total a pagar' 
        }));
        return;
      }
      
      setFormValues(prev => ({ 
        ...prev, 
        [name]: value,
        estado: numValue < numTotal ? 'Parcial' : 'Pagado'
      }));
    } else {
      setFormValues(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpiar errores
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Manejador para cambio de fecha
  const handleDateChange = (date) => {
    setFormValues(prev => ({ ...prev, fecha_pago: date }));
    
    if (formErrors.fecha_pago) {
      setFormErrors(prev => ({ ...prev, fecha_pago: null }));
    }
  };

  // Manejador para cambio de paciente
  const handlePacienteChange = async (event, value) => {
    // Limpiar estado anterior
    setCitaSeleccionada(null);
    setHistorialPagos([]);
    setServiciosPendientes([]);
    setSaldoTotal(0);
    
    if (!value) {
      setPacienteSeleccionado(null);
      setFormValues(prev => ({ 
        ...prev, 
        paciente_id: '',
        cita_id: '',
        concepto: ''
      }));
      setCitas([]);
      return;
    }
    
    setPacienteSeleccionado(value);
    setFormValues(prev => ({ 
      ...prev, 
      paciente_id: value.id,
      cita_id: '',
      concepto: ''
    }));
    
    // Cargar datos completos del paciente
    await fetchPacienteData(value.id);
  };

  // Manejador para cambio de cita
  const handleCitaChange = (cita) => {
    setCitaSeleccionada(cita);
    
    if (!cita) {
      setFormValues(prev => ({
        ...prev,
        cita_id: '',
        concepto: '',
        subtotal: 0,
        total: 0,
        monto: 0
      }));
      return;
    }
    
    // Actualizar formulario con datos de la cita
    setFormValues(prev => ({
      ...prev,
      cita_id: cita.id,
      subtotal: cita.precio_servicio || 0,
      total: cita.precio_servicio || 0,
      monto: cita.precio_servicio || 0,
      concepto: `Pago por servicio: ${cita.servicio_nombre || 'No especificado'}`
    }));
    
    // Desactivar pago parcial al elegir una cita
    setIsPagoParcial(false);
  };

  // Manejador para cambio de tipo de pago (parcial o total)
  const handlePagoParcialChange = (event) => {
    const isParcial = event.target.checked;
    setIsPagoParcial(isParcial);
    
    if (isParcial) {
      // Al activar pago parcial, reiniciar el monto a 0
      setFormValues(prev => ({
        ...prev,
        monto: 0,
        estado: 'Parcial'
      }));
    } else {
      // Al desactivar, igualar monto al total
      setFormValues(prev => ({
        ...prev,
        monto: prev.total,
        estado: 'Pagado'
      }));
    }
  };

  // Manejador para tipo de pago (cita o concepto libre)
  const handleTipoPago = (esPorCita) => {
    if (!esPorCita) {
      // Si es concepto libre, limpiar cita seleccionada
      setCitaSeleccionada(null);
      setFormValues(prev => ({
        ...prev,
        cita_id: '',
        concepto: '',
        subtotal: 0,
        total: 0,
        monto: 0
      }));
      setTabValue(0); // Volver a la pestaña principal
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    
    if (!formValues.paciente_id) errors.paciente_id = 'Seleccione un paciente';
    if (!formValues.concepto) errors.concepto = 'Ingrese un concepto';
    if (isPagoParcial && (!formValues.monto || parseFloat(formValues.monto) <= 0)) {
      errors.monto = 'Ingrese un monto válido';
    } else if (!isPagoParcial && (!formValues.total || parseFloat(formValues.total) <= 0)) {
      errors.total = 'Ingrese un monto total válido';
    }
    if (!formValues.metodo_pago) errors.metodo_pago = 'Seleccione un método de pago';
    if (!formValues.fecha_pago) errors.fecha_pago = 'Seleccione una fecha';
    
    return errors;
  };

  // Manejador de envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let response;
      
      if (idPago) {
        // Actualizar pago existente
        response = await axios.put(`https://back-end-4803.onrender.com/api/Finanzas/Pagos/${idPago}`, formValues);
        setSuccess('Pago actualizado correctamente');
      } else {
        // Crear nuevo pago
        response = await axios.post('https://back-end-4803.onrender.com/api/Finanzas/Pagos', formValues);
        setSuccess('Pago registrado correctamente');
      }
      
      setLoading(false);
      
      // Esperar un momento antes de llamar a onSave para mostrar el mensaje de éxito
      setTimeout(() => {
        if (onSave) {
          onSave(response.data);
        }
      }, 1500);
      
    } catch (err) {
      console.error('Error al guardar el pago:', err);
      setError(err.response?.data?.error || 'Error al procesar la solicitud');
      setLoading(false);
    }
  };

  // Renderizar tarjeta de cita
  const renderCitaCard = (cita) => {
    const isSelected = citaSeleccionada && citaSeleccionada.id === cita.id;
    const fecha = new Date(cita.fecha_consulta);
    
    return (
      <Card 
        key={cita.id} 
        variant={isSelected ? "elevation" : "outlined"} 
        elevation={isSelected ? 4 : 0}
        sx={{ 
          mb: 2,
          border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid rgba(0, 0, 0, 0.12)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            borderColor: theme.palette.primary.light,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }
        }}
        onClick={() => handleCitaChange(cita)}
      >
        <CardContent>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={9}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Tooltip title={`Estado: ${cita.estado}`}>
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: getStatusColor(cita.estado),
                      mr: 1.5
                    }} 
                  />
                </Tooltip>
                <Typography variant="subtitle1" fontWeight="medium">
                  {cita.servicio_nombre || 'Servicio no especificado'}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarMonth fontSize="small" sx={{ mr: 0.5, color: 'text.disabled', fontSize: 16 }} />
                {fecha.toLocaleDateString('es-ES', { 
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </Grid>
            <Grid item xs={3} sx={{ textAlign: 'right' }}>
              <Typography variant="h6" color="primary" fontWeight="bold">
                ${parseFloat(cita.precio_servicio || 0).toFixed(2)}
              </Typography>
              <Chip 
                size="small" 
                label={cita.estado} 
                sx={{ 
                  bgcolor: getStatusColor(cita.estado) + '20',
                  color: getStatusColor(cita.estado),
                  fontWeight: 'medium',
                  mt: 0.5
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Renderizar tarjeta de resumen financiero
  const renderResumenFinanciero = () => {
    if (!pacienteSeleccionado) return null;
    
    return (
      <Card variant="outlined" sx={{ mb: 3, bgcolor: 'background.paper' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" color="primary">
              Resumen financiero del paciente
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => setShowDetails(!showDetails)}
              aria-label={showDetails ? "Ocultar detalles" : "Mostrar detalles"}
            >
              {showDetails ? <ArrowDropUp /> : <ArrowDropDown />}
            </IconButton>
          </Box>
          
          <Collapse in={showDetails}>
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Saldo pendiente
                    </Typography>
                    <Tooltip title="Total de servicios sin pagar">
                      <Info fontSize="small" color="action" />
                    </Tooltip>
                  </Box>
                  <Typography variant="h5" color="error" fontWeight="bold">
                    ${saldoTotal.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {serviciosPendientes.length} servicio(s) pendiente(s)
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Último pago
                    </Typography>
                  </Box>
                  {historialPagos.length > 0 ? (
                    <>
                      <Typography variant="h5" color="primary" fontWeight="bold">
                        ${parseFloat(historialPagos[0].monto || 0).toFixed(2)}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        {new Date(historialPagos[0].fecha_pago).toLocaleDateString('es-ES')}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sin pagos registrados
                    </Typography>
                  )}
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total pagado
                    </Typography>
                  </Box>
                  <Typography variant="h5" color="success.dark" fontWeight="bold">
                    ${historialPagos.reduce((sum, p) => sum + parseFloat(p.monto || 0), 0).toFixed(2)}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {historialPagos.length} pago(s) en total
                  </Typography>
                </Paper>
              </Grid>
              
              {/* Lista de servicios pendientes */}
              {serviciosPendientes.length > 0 && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                    Servicios pendientes de pago:
                  </Typography>
                  <Grid container spacing={1}>
                    {serviciosPendientes.map((servicio) => (
                      <Grid item xs={12} sm={6} md={4} key={servicio.id}>
                        <Chip 
                          icon={<PointOfSale fontSize="small" />}
                          label={`${servicio.servicio} - $${parseFloat(servicio.precio).toFixed(2)}`}
                          variant="outlined"
                          sx={{ 
                            mb: 1, 
                            width: '100%', 
                            justifyContent: 'flex-start',
                            borderColor: getStatusColor(servicio.estado),
                            '& .MuiChip-icon': {
                              color: getStatusColor(servicio.estado)
                            }
                          }}
                          onClick={() => {
                            const cita = citas.find(c => c.id === servicio.id);
                            if (cita) handleCitaChange(cita);
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}
              
              {/* Botón para ver historial de pagos */}
              {historialPagos.length > 0 && (
                <Grid item xs={12}>
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<History />}
                    onClick={() => setShowHistory(!showHistory)}
                    sx={{ mt: 1 }}
                  >
                    {showHistory ? 'Ocultar historial de pagos' : 'Ver historial de pagos'}
                  </Button>
                  
                  <Collapse in={showHistory}>
                    <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Historial de pagos
                      </Typography>
                      {historialPagos.slice(0, 5).map((pago, index) => (
                        <Box key={pago.id} sx={{ 
                          py: 1, 
                          borderBottom: index < historialPagos.length - 1 ? '1px solid #f0f0f0' : 'none'
                        }}>
                          <Grid container spacing={1} alignItems="center">
                            <Grid item xs={7}>
                              <Typography variant="body2">
                                {pago.concepto?.length > 30 
                                  ? pago.concepto.substring(0, 30) + '...' 
                                  : pago.concepto || 'Sin concepto'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(pago.fecha_pago).toLocaleDateString('es-ES')}
                                {pago.metodo_pago && ` · ${pago.metodo_pago}`}
                              </Typography>
                            </Grid>
                            <Grid item xs={3}>
                              <Chip 
                                size="small" 
                                label={pago.estado} 
                                sx={{ 
                                  bgcolor: getStatusColor(pago.estado) + '20',
                                  color: getStatusColor(pago.estado),
                                  fontWeight: 'medium'
                                }}
                              />
                            </Grid>
                            <Grid item xs={2} sx={{ textAlign: 'right' }}>
                              <Typography variant="body2" fontWeight="medium">
                                ${parseFloat(pago.monto || 0).toFixed(2)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      ))}
                      
                      {historialPagos.length > 5 && (
                        <Button
                          variant="text"
                          size="small"
                          fullWidth
                          sx={{ mt: 1 }}
                        >
                          Ver todos los pagos ({historialPagos.length})
                        </Button>
                      )}
                    </Paper>
                  </Collapse>
                </Grid>
              )}
            </Grid>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  // Contenido de las pestañas
  const renderTabContent = () => {
    switch (tabValue) {
      case 0: // Pestaña general
        return (
          <Box>
            {pacienteSeleccionado && renderResumenFinanciero()}
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                Tipo de pago
              </Typography>
              
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button 
                  variant={citaSeleccionada ? "contained" : "outlined"} 
                  color="primary"
                  startIcon={<Event />}
                  onClick={() => handleTipoPago(true)}
                  disabled={citas.length === 0}
                >
                  Pago de cita
                </Button>
                <Button 
                  variant={!citaSeleccionada && formValues.paciente_id ? "contained" : "outlined"} 
                  color="primary"
                  startIcon={<ReceiptLong />}
                  onClick={() => handleTipoPago(false)}
                  disabled={!formValues.paciente_id}
                >
                  Otro concepto
                </Button>
              </Stack>
              
              {!citaSeleccionada && (
                <>
                  <TextField
                    fullWidth
                    id="concepto"
                    name="concepto"
                    label="Concepto de pago"
                    variant="outlined"
                    value={formValues.concepto}
                    onChange={handleChange}
                    error={Boolean(formErrors.concepto)}
                    helperText={formErrors.concepto}
                    required
                    sx={{ mb: 2 }}
                    placeholder="Ej. Consulta general, Radiografía, Producto, etc."
                    disabled={!formValues.paciente_id}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Info />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="subtotal"
                        name="subtotal"
                        label="Monto total"
                        variant="outlined"
                        type="number"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        value={formValues.subtotal}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleChange(e);
                          // Actualizar total y monto también
                          setFormValues(prev => ({
                            ...prev,
                            total: value,
                            monto: isPagoParcial ? prev.monto : value
                          }));
                        }}
                        error={Boolean(formErrors.subtotal)}
                        helperText={formErrors.subtotal}
                        required
                        disabled={!formValues.paciente_id || citaSeleccionada !== null}
                      />
                    </Grid>
                    
                    {/* Si es pago parcial, mostrar campo para monto a pagar */}
                    {isPagoParcial && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          id="monto"
                          name="monto"
                          label="Monto a pagar ahora"
                          variant="outlined"
                          type="number"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                          value={formValues.monto}
                          onChange={handleChange}
                          error={Boolean(formErrors.monto)}
                          helperText={formErrors.monto || 'Ingrese el monto parcial'}
                          required
                        />
                      </Grid>
                    )}
                  </Grid>
                  
                  {!citaSeleccionada && formValues.paciente_id && formValues.subtotal > 0 && (
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={isPagoParcial}
                          onChange={handlePagoParcialChange}
                          color="primary"
                        />
                      }
                      label="Pago parcial"
                      sx={{ mt: 2 }}
                    />
                  )}
                </>
              )}
              
              {citaSeleccionada && (
                <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {citaSeleccionada.servicio_nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(citaSeleccionada.fecha_consulta).toLocaleString('es-ES')}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h5" color="primary" fontWeight="bold">
                        ${parseFloat(citaSeleccionada.precio_servicio || 0).toFixed(2)}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={citaSeleccionada.estado} 
                        sx={{ 
                          bgcolor: getStatusColor(citaSeleccionada.estado) + '20',
                          color: getStatusColor(citaSeleccionada.estado),
                          fontWeight: 'medium',
                          mt: 0.5
                        }}
                      />
                    </Box>
                  </Stack>
                </Card>
              )}
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                Detalles del pago
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <InputLabel id="metodo-pago-label">Método de Pago</InputLabel>
                    <Select
                      labelId="metodo-pago-label"
                      id="metodo_pago"
                      name="metodo_pago"
                      value={formValues.metodo_pago}
                      onChange={handleChange}
                      label="Método de Pago"
                      error={Boolean(formErrors.metodo_pago)}
                      required
                      disabled={!formValues.paciente_id}
                      startAdornment={
                        <InputAdornment position="start">
                          <Payment fontSize="small" />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="Efectivo">Efectivo</MenuItem>
                      <MenuItem value="Tarjeta">Tarjeta de Crédito/Débito</MenuItem>
                      <MenuItem value="Transferencia">Transferencia Bancaria</MenuItem>
                    </Select>
                    {formErrors.metodo_pago && (
                      <Typography color="error" variant="caption">
                        {formErrors.metodo_pago}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DateTimePicker
                      label="Fecha de Pago"
                      value={formValues.fecha_pago}
                      onChange={handleDateChange}
                      disabled={!formValues.paciente_id}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
                          required
                          error={Boolean(formErrors.fecha_pago)}
                          helperText={formErrors.fecha_pago}
                          sx={{ mb: 2 }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="comprobante"
                    name="comprobante"
                    label="Número de Comprobante"
                    placeholder="Ej. Folio, referencia, autorización"
                    variant="outlined"
                    value={formValues.comprobante}
                    onChange={handleChange}
                    disabled={!formValues.paciente_id}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ReceiptLong fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="notas"
                    name="notas"
                    label="Notas adicionales"
                    variant="outlined"
                    multiline
                    rows={2}
                    value={formValues.notas}
                    onChange={handleChange}
                    disabled={!formValues.paciente_id}
                    sx={{ mb: 1 }}
                    placeholder="Información adicional sobre el pago"
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        );
        
      case 1: // Pestaña de citas
        return (
          <Box>
            {/* Filtros de citas */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="medium">
                Seleccionar cita para pago
              </Typography>
              
              <Box>
                <Tooltip title="Filtrar por estado">
                  <IconButton 
                    color="primary" 
                    size="small"
                    onClick={() => {/* Implementar filtro */}}
                  >
                    <FilterList />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {/* Filtros rápidos */}
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {['Pendiente', 'Confirmada', 'Completada', 'Cancelada', 'Pagada'].map(estado => (
                <Chip 
                  key={estado}
                  label={estado}
                  onClick={() => {
                    if (filtroEstadoCitas.includes(estado)) {
                      setFiltroEstadoCitas(prev => prev.filter(e => e !== estado));
                    } else {
                      setFiltroEstadoCitas(prev => [...prev, estado]);
                    }
                  }}
                  sx={{ 
                    bgcolor: filtroEstadoCitas.includes(estado) 
                      ? getStatusColor(estado) + '20' 
                      : 'transparent',
                    borderColor: getStatusColor(estado),
                    color: filtroEstadoCitas.includes(estado) 
                      ? getStatusColor(estado)
                      : 'text.primary',
                    '&:hover': {
                      bgcolor: getStatusColor(estado) + '30',
                    }
                  }}
                  variant={filtroEstadoCitas.includes(estado) ? "filled" : "outlined"}
                  size="small"
                />
              ))}
            </Box>
            
            {/* Lista de citas */}
            {citasFiltradas.length > 0 ? (
              <Box>
                {citasFiltradas.map(cita => renderCitaCard(cita))}
              </Box>
            ) : (
              <Alert 
                severity="info" 
                sx={{ mt: 2 }}
                action={
                  <Button 
                    color="inherit" 
                    size="small"
                    onClick={() => setFiltroEstadoCitas([])}
                  >
                    Limpiar filtros
                  </Button>
                }
              >
                {citas.length > 0 
                  ? 'No hay citas que coincidan con los filtros seleccionados.' 
                  : 'El paciente no tiene citas registradas.'
                }
              </Alert>
            )}
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        borderRadius: 2,
        bgcolor: 'background.paper',
        maxWidth: '100%',
        overflow: 'hidden'
      }}
    >
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom 
        sx={{ 
          color: theme.palette.primary.main, 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <PaymentsTwoTone sx={{ mr: 1 }} />
        {idPago ? 'Editar Pago' : 'Nuevo Pago'}
      </Typography>
      
      <Divider sx={{ my: 2 }} />

      {/* Mensajes de error/éxito */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Selección de paciente */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
            Seleccionar paciente
          </Typography>
          
          <Autocomplete
            id="paciente-select"
            options={pacientes}
            getOptionLabel={(option) => `${option.nombre} ${option.aPaterno} ${option.aMaterno || ''}`}
            value={pacienteSeleccionado}
            onChange={handlePacienteChange}
            loading={loading && !pacienteSeleccionado}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar paciente"
                variant="outlined"
                error={Boolean(formErrors.paciente_id)}
                helperText={formErrors.paciente_id}
                fullWidth
                required
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      mr: 1.5,
                      bgcolor: theme.palette.primary.light
                    }}
                  >
                    {option.nombre.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1">
                      {option.nombre} {option.aPaterno} {option.aMaterno || ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tel: {option.telefono || 'No disponible'} 
                      {option.email && ` • ${option.email}`}
                    </Typography>
                  </Box>
                </Box>
              </li>
            )}
          />
        </Box>
        
        {pacienteSeleccionado && (
          <>
            {/* Tabs para navegación */}
            <Box sx={{ mb: 2 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                variant="fullWidth"
                TabIndicatorProps={{
                  style: {
                    height: '3px',
                    borderRadius: '3px'
                  }
                }}
              >
                <Tab 
                  icon={<ReceiptLong />} 
                  label="General" 
                  id="tab-0"
                  aria-controls="tabpanel-0"
                />
                <Tab 
                  icon={<Event />} 
                  label={
                    <Badge 
                      badgeContent={citas.length} 
                      color="primary"
                      sx={{ 
                        '& .MuiBadge-badge': {
                          fontSize: '10px',
                          height: '16px',
                          minWidth: '16px'
                        }
                      }}
                    >
                      Citas
                    </Badge>
                  } 
                  id="tab-1"
                  aria-controls="tabpanel-1"
                  disabled={!pacienteSeleccionado}
                />
              </Tabs>
            </Box>
            
            {/* Contenido del tab seleccionado */}
            <Box role="tabpanel" id={`tabpanel-${tabValue}`} aria-labelledby={`tab-${tabValue}`}>
              {renderTabContent()}
            </Box>
          </>
        )}
        
        {/* Botones de acción */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, pt: 2, borderTop: '1px solid #f0f0f0' }}>
          <Button 
            variant="outlined" 
            color="inherit" 
            onClick={onCancel}
            disabled={loading}
            startIcon={<Cancel />}
            sx={{ mr: 2 }}
          >
            Cancelar
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading || !formValues.paciente_id || (!citaSeleccionada && (!formValues.concepto || formValues.subtotal <= 0))}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveAlt />}
          >
            {idPago ? 'Actualizar Pago' : 'Registrar Pago'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default FinanzasForm;