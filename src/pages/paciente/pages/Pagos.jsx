import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Avatar,
  Alert,
  Badge,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Stack,
  Fade,
  Tooltip,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  LinearProgress
} from '@mui/material';
import {
  AccountBalance,
  MonetizationOn,
  CheckCircle,
  Warning,
  CalendarToday,
  AccountCircle,
  FilterList,
  CheckCircleOutline,
  PrintOutlined,
  Refresh,
  PaidOutlined,
  Info,
  Close,
  TrendingUp,
  Schedule,
  ErrorOutline,
  Payment,
  CreditCard,
  Cancel,
  OpenInNew,
  SecurityOutlined
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../../components/Tools/AuthContext';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import Notificaciones from '../../../components/Layout/Notificaciones';

const PacienteFinanzasView = () => {
  const { user } = useAuth();
  const { isDarkTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Configuración de colores profesional
  const colors = {
    background: isDarkTheme ? '#121212' : '#fafafa',
    paper: isDarkTheme ? '#1e1e1e' : '#ffffff',
    text: isDarkTheme ? '#ffffff' : '#000000',
    textSecondary: isDarkTheme ? '#b0b0b0' : '#666666',
    primary: isDarkTheme ? '#90caf9' : '#1976d2',
    primaryLight: isDarkTheme ? '#bbdefb' : '#42a5f5',
    success: isDarkTheme ? '#81c784' : '#4caf50',
    warning: isDarkTheme ? '#ffb74d' : '#ff9800',
    error: isDarkTheme ? '#f48fb1' : '#f44336',
    info: isDarkTheme ? '#81d4fa' : '#2196f3',
    cardBg: isDarkTheme ? '#2c2c2c' : '#f5f5f5',
    cardBorder: isDarkTheme ? '#404040' : '#e0e0e0',
    inputBg: isDarkTheme ? '#333333' : '#ffffff',
    buttonBg: isDarkTheme ? '#404040' : '#f0f0f0',
    hover: isDarkTheme ? '#333333' : '#f5f5f5'
  };

  // Estados principales
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);

  // Estados para proceso de pago
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedServiceForPayment, setSelectedServiceForPayment] = useState(null);
  const [showPendingDialog, setShowPendingDialog] = useState(false);

  // Estados de datos
  const [serviciosDeuda, setServiciosDeuda] = useState([]);
  const [serviciosPagados, setServiciosPagados] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalDeuda: 0,
    totalPagado: 0,
    serviciosPendientes: 0,
    serviciosCompletados: 0
  });

  // Estados para filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState({
    fechaDesde: null,
    fechaHasta: null,
    ordenarPor: 'fecha_desc'
  });

  // Estados para notificaciones
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('info');

  // Estado del formulario de pago
  const [paymentData, setPaymentData] = useState({
    metodo_pago: 'MercadoPago'
  });

  // Estados para pagos externos
  const [paymentUrlGenerated, setPaymentUrlGenerated] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Función para mostrar notificaciones
  const showNotif = useCallback((message, type = 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  }, []);

  const handleCloseNotification = useCallback(() => {
    setShowNotification(false);
  }, []);

  // Cargar datos financieros del paciente
  const fetchDatosFinancieros = useCallback(async () => {
    if (!user?.id) {
      showNotif('Error: No se pudo identificar al paciente', 'error');
      return;
    }

    try {
      setLoading(true);

      const [citasResponse, pagosResponse] = await Promise.all([
        axios.get(`https://back-end-4803.onrender.com/api/citas/paciente/${user.id}`),
        axios.get('https://back-end-4803.onrender.com/api/Finanzas/Pagos/')
      ]);

      const todasCitas = citasResponse.data;
      const todosPagos = pagosResponse.data;

      // Filtrar solo citas completadas con precio
      const citasCompletadas = todasCitas.filter(cita =>
        cita.estado === 'Completada' &&
        cita.precio_servicio &&
        parseFloat(cita.precio_servicio) > 0
      );

      const serviciosConDeuda = [];
      const serviciosConPago = [];
      let totalDeuda = 0;
      let totalPagado = 0;

      citasCompletadas.forEach(cita => {
        const pagoRelacionado = todosPagos.find(pago =>
          pago.cita_id === cita.consulta_id && 
          pago.paciente_id === user.id &&
          ['Pagado', 'Parcial'].includes(pago.estado)
        );

        const precioServicio = parseFloat(cita.precio_servicio) || 0;
        
        const servicioData = {
          id: cita.consulta_id,
          servicio_id: cita.servicio_id,
          servicio_nombre: cita.servicio_nombre || 'Servicio no especificado',
          categoria_servicio: cita.categoria_servicio || 'General',
          precio_servicio: precioServicio,
          fecha_consulta: cita.fecha_consulta,
          odontologo_id: cita.odontologo_id,
          odontologo_nombre: cita.odontologo_nombre || 'No especificado',
          notas: cita.notas || '',
          estado_cita: cita.estado,
          pago: pagoRelacionado || null
        };

        if (pagoRelacionado) {
          serviciosConPago.push(servicioData);
          totalPagado += precioServicio;
        } else {
          serviciosConDeuda.push(servicioData);
          totalDeuda += precioServicio;
        }
      });

      // Ordenar por fecha más reciente primero
      serviciosConDeuda.sort((a, b) => new Date(b.fecha_consulta) - new Date(a.fecha_consulta));
      serviciosConPago.sort((a, b) => {
        if (a.pago && b.pago) {
          return new Date(b.pago.fecha_pago) - new Date(a.pago.fecha_pago);
        }
        return new Date(b.fecha_consulta) - new Date(a.fecha_consulta);
      });

      setServiciosDeuda(serviciosConDeuda);
      setServiciosPagados(serviciosConPago);
      setEstadisticas({
        totalDeuda,
        totalPagado,
        serviciosPendientes: serviciosConDeuda.length,
        serviciosCompletados: serviciosConPago.length
      });

      setLoading(false);
    } catch (err) {
      console.error('Error al cargar datos financieros:', err);
      showNotif('Error al cargar información financiera', 'error');
      setLoading(false);
    }
  }, [user?.id, showNotif]);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchDatosFinancieros();
  }, [fetchDatosFinancieros]);

  // Función para probar conectividad con el backend
  const testBackendConnection = async () => {
    try {
      setTestingConnection(true);
      console.log('🔍 Probando conectividad con el backend...');
      
      // Probar endpoint de estado
      const response = await axios.get('https://back-end-4803.onrender.com/api/Finanzas/estado', {
        timeout: 5000
      });
      
      console.log('✅ Backend respondió:', response.data);
      showNotif(`Servidor funcionando: ${response.data.message || 'OK'}`, 'success');
      
      setTestingConnection(false);
      return response.data;
    } catch (error) {
      console.error('❌ Error conectando con backend:', error);
      
      let errorMessage = 'Error de conexión con el servidor';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Timeout: El servidor no responde';
      } else if (error.response?.status === 404) {
        errorMessage = 'Endpoint no encontrado - Verificar rutas del servidor';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Error interno del servidor';
      } else if (error.response?.status >= 400) {
        errorMessage = 'Error de configuración del servidor';
      }
      
      showNotif(errorMessage, 'error');
      setTestingConnection(false);
      return null;
    }
  };

  // Función para generar email único y válido
  const generateUniqueEmail = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `cliente.${user.id}.${timestamp}.${random}@clinicadental.test`;
  };

  // Iniciar proceso de pago
  const handleIniciarPago = (servicio) => {
    console.log('🚀 Iniciando proceso de pago para servicio:', servicio);
    setSelectedServiceForPayment(servicio);
    setPaymentData({
      metodo_pago: 'MercadoPago'
    });
    setPaymentUrlGenerated(null);
    setFormErrors({});
    setShowPaymentForm(true);
  };

  // Ver detalles de un servicio
  const handleVerDetalles = async (servicio) => {
    if (servicio.pago) {
      try {
        setLoading(true);
        const response = await axios.get(`https://back-end-4803.onrender.com/api/Finanzas/Pagos/${servicio.pago.id}`);
        setSelectedDetails({
          servicio,
          pagoCompleto: response.data
        });
        setShowDetails(true);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar detalles del pago:', err);
        showNotif('Error al cargar detalles del pago', 'error');
        setLoading(false);
      }
    } else {
      setSelectedDetails({
        servicio,
        pagoCompleto: null
      });
      setShowDetails(true);
    }
  };

  // Crear preferencia de MercadoPago
  const createMercadoPagoPreference = async () => {
    try {
      console.log('🔄 Iniciando proceso de pago MercadoPago...');
      setProcessingPayment(true);
      
      const preferenceData = {
        paciente_id: user.id,
        cita_id: selectedServiceForPayment.id,
        monto: selectedServiceForPayment.precio_servicio,
        concepto: selectedServiceForPayment.servicio_nombre,
        email_paciente: generateUniqueEmail()
      };

      console.log('📤 Enviando datos a MercadoPago:', preferenceData);
      console.log('🌐 URL del endpoint:', 'https://back-end-4803.onrender.com/api/Finanzas/MercadoPago/crear-preferencia');

      const response = await axios.post(
        'https://back-end-4803.onrender.com/api/Finanzas/MercadoPago/crear-preferencia',
        preferenceData,
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📥 Respuesta completa de MercadoPago:', response);
      console.log('📊 Data de respuesta:', response.data);

      const initPoint = response.data.init_point;
      console.log('🔗 Init point recibido:', initPoint);
      
      if (initPoint) {
        console.log('✅ URL de pago generada exitosamente');
        setPaymentUrlGenerated({
          url: initPoint,
          platform: 'MercadoPago',
          preferenceId: response.data.preference_id
        });
        
        setProcessingPayment(false);
        setShowPaymentForm(false);
        setShowPendingDialog(true);
      } else {
        console.error('❌ No se recibió init_point en la respuesta');
        throw new Error('No se pudo generar la URL de pago de MercadoPago');
      }

    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      let errorMessage = 'Error al procesar el pago con MercadoPago';
      
      if (error.response) {
        if (error.response.status === 503) {
          errorMessage = 'MercadoPago no está configurado en el servidor';
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data?.details) {
          errorMessage = error.response.data.details;
        } else {
          errorMessage = `Error del servidor: ${error.response.status}`;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Timeout: El servidor tardó demasiado en responder';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotif(errorMessage, 'error');
      setProcessingPayment(false);
    }
  };

  // Crear orden de PayPal
  const createPayPalOrder = async () => {
    try {
      console.log('🔄 Iniciando proceso de pago PayPal...');
      setProcessingPayment(true);
      
      const orderData = {
        paciente_id: user.id,
        cita_id: selectedServiceForPayment.id,
        monto: selectedServiceForPayment.precio_servicio,
        concepto: selectedServiceForPayment.servicio_nombre
      };

      console.log('📤 Enviando datos a PayPal:', orderData);
      console.log('🌐 URL del endpoint:', 'https://back-end-4803.onrender.com/api/Finanzas/PayPal/crear-orden');

      const response = await axios.post(
        'https://back-end-4803.onrender.com/api/Finanzas/PayPal/crear-orden',
        orderData,
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📥 Respuesta completa de PayPal:', response);
      console.log('📊 Data de respuesta:', response.data);

      const approveUrl = response.data.approve_url;
      console.log('🔗 Approve URL recibida:', approveUrl);
      
      if (approveUrl) {
        console.log('✅ URL de pago PayPal generada exitosamente');
        setPaymentUrlGenerated({
          url: approveUrl,
          platform: 'PayPal',
          orderId: response.data.order_id,
          amountUSD: response.data.amount_usd,
          originalAmountMXN: response.data.original_amount_mxn
        });
        
        setProcessingPayment(false);
        setShowPaymentForm(false);
        setShowPendingDialog(true);
      } else {
        console.error('❌ No se recibió approve_url en la respuesta');
        throw new Error('No se pudo generar la URL de pago de PayPal');
      }

    } catch (error) {
      console.error('❌ Error completo PayPal:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      let errorMessage = 'Error al procesar el pago con PayPal';
      
      if (error.response) {
        if (error.response.status === 503) {
          errorMessage = 'PayPal no está configurado en el servidor';
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data?.details) {
          errorMessage = error.response.data.details;
        } else {
          errorMessage = `Error del servidor: ${error.response.status}`;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Timeout: El servidor tardó demasiado en responder';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotif(errorMessage, 'error');
      setProcessingPayment(false);
    }
  };

  // Procesar pago según método seleccionado
  const handleProcesarPago = () => {
    if (!selectedServiceForPayment) {
      showNotif('Error: No se ha seleccionado un servicio', 'error');
      return;
    }

    setFormErrors({});
    
    switch (paymentData.metodo_pago) {
      case 'MercadoPago':
        createMercadoPagoPreference();
        break;
      case 'PayPal':
        createPayPalOrder();
        break;
      default:
        showNotif('Método de pago no válido', 'error');
    }
  };

  // Cancelar proceso de pago
  const cancelarPago = () => {
    setShowPaymentForm(false);
    setSelectedServiceForPayment(null);
    setPaymentData({
      metodo_pago: 'MercadoPago'
    });
    setPaymentUrlGenerated(null);
    setFormErrors({});
    setProcessingPayment(false);
  };

  // Proceder al pago externo
  const proceedToExternalPayment = () => {
    if (paymentUrlGenerated?.url) {
      window.open(paymentUrlGenerated.url, '_blank');
      setShowPendingDialog(false);
      
      showNotif(`Redirigiendo a ${paymentUrlGenerated.platform}. Complete el pago en la nueva ventana.`, 'info');
      
      setTimeout(() => {
        fetchDatosFinancieros();
      }, 30000);
    }
  };

  // Aplicar filtros
  const aplicarFiltros = (lista) => {
    return lista.filter(servicio => {
      const fecha = servicio.pago ? 
        new Date(servicio.pago.fecha_pago) : 
        new Date(servicio.fecha_consulta);

      if (filtros.fechaDesde && fecha < filtros.fechaDesde) return false;
      if (filtros.fechaHasta && fecha > filtros.fechaHasta) return false;

      return true;
    }).sort((a, b) => {
      const fechaA = a.pago ? 
        new Date(a.pago.fecha_pago) : 
        new Date(a.fecha_consulta);
      const fechaB = b.pago ? 
        new Date(b.pago.fecha_pago) : 
        new Date(b.fecha_consulta);

      switch (filtros.ordenarPor) {
        case 'fecha_desc': return fechaB - fechaA;
        case 'fecha_asc': return fechaA - fechaB;
        case 'monto_desc': return b.precio_servicio - a.precio_servicio;
        case 'monto_asc': return a.precio_servicio - b.precio_servicio;
        default: return fechaB - fechaA;
      }
    });
  };

  // Renderizar filtros
  const renderFiltros = () => (
    <Paper elevation={0} sx={{ 
      mb: 2, 
      border: '1px solid', 
      borderColor: colors.cardBorder, 
      borderRadius: 1,
      bgcolor: colors.paper
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1.5,
        cursor: 'pointer'
      }} onClick={() => setShowFilters(!showFilters)}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterList sx={{ mr: 1, fontSize: 20, color: colors.textSecondary }} />
          <Typography variant="subtitle2" fontWeight="600" sx={{ color: colors.text }}>
            Filtros y Ordenamiento
          </Typography>
          {(filtros.fechaDesde || filtros.fechaHasta) && (
            <Chip label="Activos" size="small" color="primary" sx={{ ml: 1 }} />
          )}
        </Box>
        <Tooltip title="Actualizar datos">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); fetchDatosFinancieros(); }} disabled={loading}>
            <Refresh sx={{ fontSize: 18, color: colors.textSecondary }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={showFilters}>
        <Divider sx={{ borderColor: colors.cardBorder }} />
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <FormControl size="small" fullWidth>
                <InputLabel>Ordenar por</InputLabel>
                <Select
                  value={filtros.ordenarPor}
                  onChange={(e) => setFiltros(prev => ({ ...prev, ordenarPor: e.target.value }))}
                  label="Ordenar por"
                >
                  <MenuItem value="fecha_desc">Fecha más reciente</MenuItem>
                  <MenuItem value="fecha_asc">Fecha más antigua</MenuItem>
                  <MenuItem value="monto_desc">Monto mayor</MenuItem>
                  <MenuItem value="monto_asc">Monto menor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setFiltros({
                  fechaDesde: null,
                  fechaHasta: null,
                  ordenarPor: 'fecha_desc'
                })}
              >
                Limpiar Filtros
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );

  // Renderizar tarjeta de servicio
  const renderServicioCard = (servicio, tipo = 'deuda') => {
    const fecha = tipo === 'deuda' ? 
      new Date(servicio.fecha_consulta) : 
      new Date(servicio.pago?.fecha_pago || servicio.fecha_consulta);
    const color = tipo === 'deuda' ? 'error' : 'success';

    return (
      <Card
        key={servicio.id}
        elevation={1}
        sx={{
          mb: 1.5,
          border: '1px solid',
          borderColor: colors.cardBorder,
          borderRadius: 1,
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          bgcolor: colors.paper,
          '&:hover': {
            borderColor: colors.primary,
            boxShadow: 2,
            transform: 'translateY(-1px)'
          }
        }}
        onClick={() => handleVerDetalles(servicio)}
      >
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    bgcolor: `${color}.main`,
                    mr: 2,
                    width: 40,
                    height: 40
                  }}
                >
                  {tipo === 'deuda' ? <Schedule /> : <CheckCircle />}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight="600" sx={{ color: colors.text, mb: 0.5 }} noWrap>
                    {servicio.servicio_nombre}
                  </Typography>
                  <Typography variant="body2" color={colors.textSecondary} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />
                    {fecha.toLocaleDateString('es-ES')}
                  </Typography>
                  {servicio.odontologo_nombre && (
                    <Typography variant="body2" color={colors.textSecondary} sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccountCircle sx={{ fontSize: 14, mr: 0.5 }} />
                      Dr. {servicio.odontologo_nombre}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" color={`${color}.main`} fontWeight="700" sx={{ mb: 1 }}>
                  ${servicio.precio_servicio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </Typography>
                <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                  <Chip
                    label={tipo === 'deuda' ? 'Pendiente' : 'Pagado'}
                    color={color}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                  {tipo === 'deuda' && (
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleIniciarPago(servicio); 
                      }}
                      startIcon={<Payment />}
                    >
                      Pagar
                    </Button>
                  )}
                </Stack>
                {servicio.pago && (
                  <Typography variant="caption" color={colors.textSecondary} display="block" sx={{ mt: 0.5 }}>
                    Método: {servicio.pago.metodo_pago}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Renderizar estadísticas
  const renderEstadisticas = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={6} sm={3}>
        <Paper elevation={0} sx={{ 
          p: 2, 
          textAlign: 'center', 
          bgcolor: isDarkTheme ? '#4d1f1f' : '#ffebee', 
          borderRadius: 1,
          border: `1px solid ${colors.cardBorder}`
        }}>
          <Warning sx={{ fontSize: 24, color: 'error.main', mb: 1 }} />
          <Typography variant="h5" fontWeight="700" color="error.main">
            {estadisticas.serviciosPendientes}
          </Typography>
          <Typography variant="caption" color={colors.textSecondary} sx={{ fontWeight: 500 }}>
            Servicios Pendientes
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Paper elevation={0} sx={{ 
          p: 2, 
          textAlign: 'center', 
          bgcolor: isDarkTheme ? '#1f4d2f' : '#e8f5e8', 
          borderRadius: 1,
          border: `1px solid ${colors.cardBorder}`
        }}>
          <CheckCircle sx={{ fontSize: 24, color: 'success.main', mb: 1 }} />
          <Typography variant="h5" fontWeight="700" color="success.main">
            {estadisticas.serviciosCompletados}
          </Typography>
          <Typography variant="caption" color={colors.textSecondary} sx={{ fontWeight: 500 }}>
            Servicios Pagados
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Paper elevation={0} sx={{ 
          p: 2, 
          textAlign: 'center', 
          bgcolor: isDarkTheme ? '#4d3d1f' : '#fff3e0', 
          borderRadius: 1,
          border: `1px solid ${colors.cardBorder}`
        }}>
          <TrendingUp sx={{ fontSize: 24, color: 'warning.main', mb: 1 }} />
          <Typography variant="h5" fontWeight="700" color="warning.main">
            ${estadisticas.totalDeuda.toLocaleString('es-MX')}
          </Typography>
          <Typography variant="caption" color={colors.textSecondary} sx={{ fontWeight: 500 }}>
            Total Adeudado
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Paper elevation={0} sx={{ 
          p: 2, 
          textAlign: 'center', 
          bgcolor: isDarkTheme ? '#1f2d4d' : '#e3f2fd', 
          borderRadius: 1,
          border: `1px solid ${colors.cardBorder}`
        }}>
          <MonetizationOn sx={{ fontSize: 24, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" fontWeight="700" color="primary.main">
            ${estadisticas.totalPagado.toLocaleString('es-MX')}
          </Typography>
          <Typography variant="caption" color={colors.textSecondary} sx={{ fontWeight: 500 }}>
            Total Pagado
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );

  // Renderizar contenido principal
  const renderContenido = () => {
    const serviciosFiltradosDeuda = aplicarFiltros(serviciosDeuda);
    const serviciosFiltradosPagados = aplicarFiltros(serviciosPagados);

    return (
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="700" gutterBottom sx={{ color: colors.text }}>
            Estado Financiero
          </Typography>
          <Typography variant="body1" color={colors.textSecondary}>
            Gestiona tus pagos pendientes y consulta tu historial de transacciones
          </Typography>
        </Box>

        {/* Estadísticas */}
        {renderEstadisticas()}

        {/* Tabs */}
        <Paper elevation={1} sx={{ 
          borderRadius: 1, 
          overflow: 'hidden', 
          border: `1px solid ${colors.cardBorder}`,
          bgcolor: colors.paper
        }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            sx={{
              borderBottom: `1px solid ${colors.cardBorder}`,
              '& .MuiTab-root': {
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 48,
                px: 3,
                color: colors.textSecondary,
                '&.Mui-selected': {
                  color: colors.primary
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: colors.primary
              }
            }}
          >
            <Tab
              icon={
                <Badge badgeContent={serviciosFiltradosDeuda.length} color="error" max={99}>
                  <Warning sx={{ fontSize: 18 }} />
                </Badge>
              }
              label={`Servicios Pendientes (${serviciosFiltradosDeuda.length})`}
              iconPosition="start"
            />
            <Tab
              icon={
                <Badge badgeContent={serviciosFiltradosPagados.length} color="success" max={99}>
                  <CheckCircleOutline sx={{ fontSize: 18 }} />
                </Badge>
              }
              label={`Historial de Pagos (${serviciosFiltradosPagados.length})`}
              iconPosition="start"
            />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {renderFiltros()}

            {/* Contenido de las tabs */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} sx={{ color: colors.primary }} />
              </Box>
            ) : (
              <Box>
                {activeTab === 0 ? (
                  serviciosFiltradosDeuda.length === 0 ? (
                    <Paper sx={{ 
                      p: 4, 
                      textAlign: 'center', 
                      bgcolor: isDarkTheme ? '#1f4d2f' : '#e8f5e8', 
                      borderRadius: 1,
                      border: `1px solid ${colors.success}`
                    }}>
                      <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom color="success.main" fontWeight="600">
                        Sin servicios pendientes
                      </Typography>
                      <Typography variant="body1" color={colors.textSecondary}>
                        No tienes servicios pendientes de pago. Estás al día con tus obligaciones.
                      </Typography>
                    </Paper>
                  ) : (
                    <Box>
                      <Alert severity="warning" sx={{ mb: 3, borderRadius: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          Tienes <strong>{serviciosFiltradosDeuda.length}</strong> servicio(s) pendiente(s) de pago por un total de <strong>${estadisticas.totalDeuda.toLocaleString('es-MX')} MXN</strong>.
                          Puedes realizar el pago de forma segura utilizando los métodos disponibles.
                        </Typography>
                      </Alert>
                      <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
                        {serviciosFiltradosDeuda.map((servicio) => renderServicioCard(servicio, 'deuda'))}
                      </Box>
                    </Box>
                  )
                ) : (
                  serviciosFiltradosPagados.length === 0 ? (
                    <Paper sx={{ 
                      p: 4, 
                      textAlign: 'center', 
                      bgcolor: colors.cardBg, 
                      borderRadius: 1,
                      border: `1px solid ${colors.cardBorder}`
                    }}>
                      <PaidOutlined sx={{ fontSize: 48, color: colors.textSecondary, mb: 2 }} />
                      <Typography variant="h6" gutterBottom color={colors.textSecondary} fontWeight="600">
                        Sin historial de pagos
                      </Typography>
                      <Typography variant="body1" color={colors.textSecondary}>
                        Cuando realices tu primer pago, aparecerá registrado en esta sección.
                      </Typography>
                    </Paper>
                  ) : (
                    <Box>
                      <Alert severity="success" sx={{ mb: 3, borderRadius: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          Has realizado <strong>{serviciosFiltradosPagados.length}</strong> pago(s) por un total de <strong>${estadisticas.totalPagado.toLocaleString('es-MX')} MXN</strong>
                        </Typography>
                      </Alert>
                      <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
                        {serviciosFiltradosPagados.map((servicio) => renderServicioCard(servicio, 'pagado'))}
                      </Box>
                    </Box>
                  )
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh', py: 3 }}>
      {processingPayment && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }} />}
      
      <Paper elevation={1} sx={{ 
        p: 3, 
        borderRadius: 1, 
        border: `1px solid ${colors.cardBorder}`,
        bgcolor: colors.paper,
        mx: 2
      }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccountBalance sx={{ mr: 2, fontSize: 32, color: colors.primary }} />
            <Box>
              <Typography variant="h4" fontWeight="700" color={colors.primary}>
                Portal de Pagos
              </Typography>
              <Typography variant="subtitle1" color={colors.textSecondary}>
                {user?.nombre || 'Paciente'} - Clínica Dental
              </Typography>
            </Box>
          </Box>
          
          {/* Botón de prueba del servidor */}
          <Button
            variant="outlined"
            onClick={testBackendConnection}
            disabled={testingConnection}
            startIcon={testingConnection ? <CircularProgress size={16} /> : <Info />}
            sx={{
              color: colors.primary,
              borderColor: colors.primary,
              '&:hover': {
                borderColor: colors.primary,
                backgroundColor: colors.hover
              },
              '&:disabled': {
                color: colors.textSecondary,
                borderColor: colors.textSecondary
              }
            }}
          >
            {testingConnection ? 'Probando...' : 'Probar Servidor'}
          </Button>
        </Box>

        <Divider sx={{ mb: 3, borderColor: colors.cardBorder }} />

        {/* Contenido principal */}
        <Fade in={true} timeout={300}>
          <Box>
            {renderContenido()}
          </Box>
        </Fade>

        {/* FORMULARIO DE PAGO */}
        <Dialog
          open={showPaymentForm}
          onClose={cancelarPago}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { 
              borderRadius: 1,
              bgcolor: colors.paper
            }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', color: colors.text }}>
                <Payment sx={{ mr: 1, color: colors.primary }} />
                Procesar Pago
              </Typography>
              <IconButton onClick={cancelarPago}>
                <Close sx={{ color: colors.textSecondary }} />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedServiceForPayment && (
              <Box>
                {/* Información del servicio */}
                <Paper elevation={0} sx={{ 
                  p: 2, 
                  mb: 3, 
                  bgcolor: colors.cardBg, 
                  borderRadius: 1,
                  border: `1px solid ${colors.cardBorder}`
                }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="600" sx={{ color: colors.text }}>
                    Resumen del Servicio
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text, mb: 1 }}>
                    <strong>Servicio:</strong> {selectedServiceForPayment.servicio_nombre}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text, mb: 1 }}>
                    <strong>Fecha:</strong> {new Date(selectedServiceForPayment.fecha_consulta).toLocaleDateString('es-ES')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text, mb: 2 }}>
                    <strong>Doctor:</strong> Dr. {selectedServiceForPayment.odontologo_nombre}
                  </Typography>
                  <Typography variant="h6" color={colors.primary} fontWeight="700" sx={{ textAlign: 'center' }}>
                    Total: ${selectedServiceForPayment.precio_servicio.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </Typography>
                </Paper>

                {/* Métodos de pago */}
                <Typography variant="subtitle2" gutterBottom fontWeight="600" sx={{ mb: 2, color: colors.text }}>
                  Seleccione el método de pago
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {[
                    { 
                      key: 'MercadoPago', 
                      icon: <CreditCard />, 
                      color: '#00b0ff',
                      title: 'MercadoPago',
                      description: 'Tarjetas de crédito, débito y transferencias'
                    },
                    { 
                      key: 'PayPal', 
                      icon: <AccountBalance />, 
                      color: '#0070ba',
                      title: 'PayPal',
                      description: `Pago internacional (≈ $${(selectedServiceForPayment.precio_servicio / 18.5).toFixed(2)} USD)`
                    }
                  ].map((metodo) => (
                    <Grid item xs={12} key={metodo.key}>
                      <Card
                        variant={paymentData.metodo_pago === metodo.key ? "outlined" : "elevation"}
                        sx={{
                          cursor: 'pointer',
                          borderColor: paymentData.metodo_pago === metodo.key ? metodo.color : colors.cardBorder,
                          borderWidth: paymentData.metodo_pago === metodo.key ? 2 : 1,
                          bgcolor: paymentData.metodo_pago === metodo.key ? `${metodo.color}10` : colors.paper,
                          '&:hover': { 
                            boxShadow: 2,
                            borderColor: metodo.color
                          },
                          borderRadius: 1,
                          transition: 'all 0.2s ease-in-out'
                        }}
                        onClick={() => setPaymentData(prev => ({ ...prev, metodo_pago: metodo.key }))}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ color: metodo.color, mr: 2, fontSize: 24 }}>
                              {metodo.icon}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight="600" sx={{ color: colors.text }}>
                                {metodo.title}
                              </Typography>
                              <Typography variant="body2" color={colors.textSecondary}>
                                {metodo.description}
                              </Typography>
                            </Box>
                            {paymentData.metodo_pago === metodo.key && (
                              <CheckCircle sx={{ color: metodo.color, fontSize: 20 }} />
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Información de seguridad */}
                <Alert severity="info" sx={{ borderRadius: 1 }}>
                  <Typography variant="body2">
                    <SecurityOutlined sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    Tu información está protegida. Serás redirigido a {paymentData.metodo_pago} para completar el pago de forma segura.
                  </Typography>
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={cancelarPago} 
              variant="outlined" 
              startIcon={<Cancel />}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleProcesarPago} 
              variant="contained" 
              startIcon={processingPayment ? <CircularProgress size={16} /> : <Payment />}
              disabled={processingPayment}
            >
              {processingPayment ? 'Procesando...' : `Pagar con ${paymentData.metodo_pago}`}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de redirección */}
        <Dialog
          open={showPendingDialog}
          onClose={() => setShowPendingDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ 
            sx: { 
              borderRadius: 1,
              bgcolor: colors.paper
            } 
          }}
        >
          <DialogContent sx={{ textAlign: 'center', py: 4 }}>
            <Box sx={{ mb: 3 }}>
              {paymentUrlGenerated?.platform === 'MercadoPago' ? (
                <CreditCard sx={{ fontSize: 64, color: '#00b0ff', mb: 2 }} />
              ) : (
                <AccountBalance sx={{ fontSize: 64, color: '#0070ba', mb: 2 }} />
              )}
            </Box>
            
            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ color: colors.text }}>
              Redirección a {paymentUrlGenerated?.platform}
            </Typography>
            
            <Typography variant="body1" color={colors.textSecondary} sx={{ mb: 3 }}>
              Serás redirigido a <strong>{paymentUrlGenerated?.platform}</strong> para completar tu pago de forma segura.
              No cierres esta ventana hasta completar el proceso.
            </Typography>

            {selectedServiceForPayment && (
              <Paper elevation={0} sx={{ 
                p: 2, 
                mb: 3, 
                bgcolor: colors.cardBg, 
                borderRadius: 1,
                border: `1px solid ${colors.cardBorder}`
              }}>
                <Typography variant="subtitle2" sx={{ color: colors.text, mb: 1 }}>
                  {selectedServiceForPayment.servicio_nombre}
                </Typography>
                <Typography variant="h6" color={colors.primary} fontWeight="700">
                  ${selectedServiceForPayment.precio_servicio.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  {paymentUrlGenerated?.platform === 'PayPal' && paymentUrlGenerated?.amountUSD && (
                    <Typography variant="body2" display="block" color={colors.textSecondary}>
                      (≈ ${paymentUrlGenerated.amountUSD} USD)
                    </Typography>
                  )}
                </Typography>
              </Paper>
            )}

            <Alert severity="info" sx={{ mb: 3, textAlign: 'left', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Instrucciones:</strong><br/>
                • Se abrirá una nueva ventana con {paymentUrlGenerated?.platform}<br/>
                • Completa tu pago siguiendo las instrucciones<br/>
                • El pago será procesado automáticamente
              </Typography>
            </Alert>
          </DialogContent>
          
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button 
              onClick={() => setShowPendingDialog(false)} 
              variant="outlined"
            >
              Cancelar
            </Button>
            <Button 
              onClick={proceedToExternalPayment}
              variant="contained"
              startIcon={<OpenInNew />}
              sx={{
                backgroundColor: paymentUrlGenerated?.platform === 'MercadoPago' ? '#00b0ff' : '#0070ba',
                '&:hover': {
                  backgroundColor: paymentUrlGenerated?.platform === 'MercadoPago' ? '#0088cc' : '#005a94'
                }
              }}
            >
              Continuar a {paymentUrlGenerated?.platform}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de detalles */}
        <Dialog
          open={showDetails}
          onClose={() => setShowDetails(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { 
              borderRadius: 1,
              bgcolor: colors.paper
            }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', color: colors.text }}>
                <Info sx={{ mr: 1, color: colors.primary }} />
                Detalles del Servicio
              </Typography>
              <IconButton onClick={() => setShowDetails(false)}>
                <Close sx={{ color: colors.textSecondary }} />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedDetails && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ 
                    p: 2, 
                    bgcolor: colors.cardBg, 
                    borderRadius: 1,
                    border: `1px solid ${colors.cardBorder}`
                  }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight="600" sx={{ color: colors.text }}>
                      Información del Servicio
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.text, mb: 1 }}>
                      <strong>Servicio:</strong> {selectedDetails.servicio.servicio_nombre}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.text, mb: 1 }}>
                      <strong>Categoría:</strong> {selectedDetails.servicio.categoria_servicio}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.text, mb: 1 }}>
                      <strong>Fecha:</strong> {new Date(selectedDetails.servicio.fecha_consulta).toLocaleDateString('es-ES')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.text, mb: 1 }}>
                      <strong>Doctor:</strong> {selectedDetails.servicio.odontologo_nombre}
                    </Typography>
                    <Typography variant="h6" sx={{ color: colors.text, mt: 2, fontWeight: 600 }}>
                      <strong>Monto:</strong> ${selectedDetails.servicio.precio_servicio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  {selectedDetails.pagoCompleto ? (
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      bgcolor: isDarkTheme ? '#1f4d2f' : '#e8f5e8', 
                      borderRadius: 1,
                      border: `1px solid ${colors.success}`
                    }}>
                      <Typography variant="subtitle2" gutterBottom fontWeight="600" sx={{ color: colors.text }}>
                        Información del Pago
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.text, mb: 1 }}>
                        <strong>Estado:</strong> <Chip label={selectedDetails.pagoCompleto.estado} color="success" size="small" />
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.text, mb: 1 }}>
                        <strong>Método:</strong> {selectedDetails.pagoCompleto.metodo_pago}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.text, mb: 1 }}>
                        <strong>Fecha:</strong> {new Date(selectedDetails.pagoCompleto.fecha_pago).toLocaleDateString('es-ES')}
                      </Typography>
                      <Typography variant="h6" sx={{ color: colors.text, mt: 2, fontWeight: 600 }}>
                        <strong>Pagado:</strong> ${parseFloat(selectedDetails.pagoCompleto.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.text, mt: 1 }}>
                        <strong>Comprobante:</strong> {selectedDetails.pagoCompleto.comprobante}
                      </Typography>
                    </Paper>
                  ) : (
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      bgcolor: isDarkTheme ? '#4d1f1f' : '#ffebee', 
                      borderRadius: 1,
                      border: `1px solid ${colors.error}`
                    }}>
                      <Typography variant="subtitle2" gutterBottom fontWeight="600" sx={{ color: colors.text }}>
                        Estado del Pago
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ErrorOutline sx={{ color: 'error.main', mr: 1 }} />
                        <Typography variant="body1" color="error.main" fontWeight="600">
                          Pendiente de pago
                        </Typography>
                      </Box>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ mb: 2 }}>
                        Este servicio no ha sido pagado. Puedes procesarlo usando los métodos disponibles.
                      </Typography>
                      <Typography variant="h6" sx={{ mb: 2, color: colors.text, fontWeight: 600 }}>
                        <strong>Por pagar:</strong> ${selectedDetails.servicio.precio_servicio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </Typography>
                      <Button 
                        variant="contained" 
                        fullWidth
                        onClick={() => {
                          setShowDetails(false);
                          handleIniciarPago(selectedDetails.servicio);
                        }}
                        startIcon={<Payment />}
                      >
                        Pagar Ahora
                      </Button>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setShowDetails(false)} variant="outlined">
              Cerrar
            </Button>
            {selectedDetails?.pagoCompleto && (
              <Button startIcon={<PrintOutlined />} variant="contained">
                Imprimir Comprobante
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Notificaciones */}
        <Notificaciones
          open={showNotification}
          message={notificationMessage}
          type={notificationType}
          handleClose={handleCloseNotification}
        />
      </Paper>
    </Box>
  );
};

export default PacienteFinanzasView;