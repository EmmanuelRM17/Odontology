import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  Divider,
  InputAdornment,
  CircularProgress,
  Autocomplete,
  Chip,
  Card,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Alert,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Fade,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Container,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionDetails,
  Slide
} from '@mui/material';
import {
  Receipt,
  Person,
  Payment,
  Cancel,
  CheckCircle,
  Search,
  MonetizationOn,
  AccountBalanceWallet,
  Warning,
  PersonSearch,
  ArrowBack,
  ConfirmationNumber,
  Phone,
  CalendarToday,
  MedicalServices,
  FilterList,
  CheckCircleOutline,
  PrintOutlined,
  Refresh,
  PaidOutlined,
  MoreVert,
  GetApp,
  FileCopy,
  Close,
  Add,
  TrendingUp,
  AttachMoney,
  Email,
  Settings,
  CreditCard,
  AccountBalance,
  Visibility,
  VisibilityOff,
  Save,
  Biotech,
  Error,
  ContentCopy,
  Link,
  CardGiftcard,
  Stars
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import axios from 'axios';
import { useAuth } from '../../../components/Tools/AuthContext';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import Notificaciones from '../../../components/Layout/Notificaciones';

const FinanzasForm = ({ idPago = null, onSave, onCancel }) => {
  const { user } = useAuth();
  const { isDarkTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Configuración de colores profesionales
  const colors = useMemo(() => ({
    background: isDarkTheme ? '#0A0E27' : '#F8FAFC',
    paper: isDarkTheme ? '#1A1F3A' : '#FFFFFF',
    paperElevated: isDarkTheme ? '#252B48' : '#FFFFFF',
    text: isDarkTheme ? '#E2E8F0' : '#1E293B',
    textSecondary: isDarkTheme ? '#94A3B8' : '#64748B',
    primary: isDarkTheme ? '#60A5FA' : '#1976d2',
    primaryLight: isDarkTheme ? '#93C5FD' : '#42A5F5',
    primaryDark: isDarkTheme ? '#3B82F6' : '#1565C0',
    success: isDarkTheme ? '#4ADE80' : '#10B981',
    successLight: isDarkTheme ? '#86EFAC' : '#34D399',
    warning: isDarkTheme ? '#FBBF24' : '#F59E0B',
    error: isDarkTheme ? '#F87171' : '#EF4444',
    errorLight: isDarkTheme ? '#FCA5A5' : '#F87171',
    info: isDarkTheme ? '#38BDF8' : '#0EA5E9',
    cardBg: isDarkTheme ? 'rgba(30, 31, 58, 0.6)' : 'rgba(248, 250, 252, 0.8)',
    cardBorder: isDarkTheme ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.8)',
    inputBg: isDarkTheme ? 'rgba(30, 31, 58, 0.4)' : '#FFFFFF',
    hover: isDarkTheme ? 'rgba(96, 165, 250, 0.1)' : 'rgba(25, 118, 210, 0.04)',
    hoverStrong: isDarkTheme ? 'rgba(96, 165, 250, 0.15)' : 'rgba(25, 118, 210, 0.08)',
    disabled: isDarkTheme ? '#475569' : '#CBD5E1',
    divider: isDarkTheme ? 'rgba(71, 85, 105, 0.2)' : 'rgba(226, 232, 240, 0.6)',
    shadow: isDarkTheme ? '0 2px 12px rgba(0, 0, 0, 0.3)' : '0 1px 8px rgba(0, 0, 0, 0.06)',
    shadowHover: isDarkTheme ? '0 4px 20px rgba(0, 0, 0, 0.4)' : '0 2px 12px rgba(0, 0, 0, 0.1)',
    glassBg: isDarkTheme ? 'rgba(30, 31, 58, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    glassHover: isDarkTheme ? 'rgba(37, 43, 72, 0.8)' : 'rgba(255, 255, 255, 0.9)',
  }), [isDarkTheme]);

  // Estados principales
  const [mainActiveTab, setMainActiveTab] = useState(0);
  const [currentStep, setCurrentStep] = useState('selection');
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(null);

  // Estados de datos
  const [pacientes, setPacientes] = useState([]);
  const [pacientesConDeudas, setPacientesConDeudas] = useState([]);
  const [pacientesPagados, setPacientesPagados] = useState([]);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [selectedCita, setSelectedCita] = useState(null);
  const [pacienteCompleto, setPacienteCompleto] = useState(null);

  // Estados para menú y filtros
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPago, setSelectedPago] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState({
    montoMin: '',
    montoMax: '',
    ordenarPor: 'deuda_desc',
    fechaDesde: null,
    fechaHasta: null
  });

  // Estados de notificaciones
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('info');
  const [formErrors, setFormErrors] = useState({});

  // Estado del formulario de pago
  const [paymentData, setPaymentData] = useState({
    metodo_pago: 'Efectivo',
    fecha_pago: new Date(),
    referencia: '',
    notas: ''
  });

  // Estados de código de canje OdontoPuntos
  const [codigoCanje, setCodigoCanje] = useState('');
  const [verificandoCodigo, setVerificandoCodigo] = useState(false);
  const [codigoVerificado, setCodigoVerificado] = useState(null);
  const [descuentoAplicado, setDescuentoAplicado] = useState(0);

  // Estados de configuración
  const [configLoading, setConfigLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState({ mercadopago: false, paypal: false });
  const [config, setConfig] = useState({
    mercadopago: {
      enabled: false,
      access_token: '',
      public_key: '',
      webhook_url: '',
      mode: 'sandbox'
    },
    paypal: {
      enabled: false,
      client_id: '',
      client_secret: '',
      webhook_url: '',
      mode: 'sandbox'
    }
  });
  const [showCredentials, setShowCredentials] = useState({
    mercadopago_token: false,
    mercadopago_secret: false,
    paypal_id: false,
    paypal_secret: false
  });
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [activeProvider, setActiveProvider] = useState('');

  // Función para mostrar notificaciones
  const showNotif = useCallback((message, type = 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  }, []);

  const handleCloseNotification = useCallback(() => {
    setShowNotification(false);
  }, []);

  // Verificar código de canje de OdontoPuntos
  const verificarCodigoCanje = async () => {
    if (!codigoCanje.trim()) {
      showNotif('Ingrese un código de canje', 'warning');
      return;
    }

    setVerificandoCodigo(true);
    try {
      const response = await axios.get(`https://back-end-4803.onrender.com/api/gamificacion/verificar-canje/${codigoCanje.trim()}`);
      const canje = response.data;

      if (canje.estado === 'usado') {
        showNotif('Este código ya fue utilizado', 'error');
        setCodigoVerificado(null);
        setDescuentoAplicado(0);
        return;
      }

      if (canje.estado === 'expirado') {
        showNotif('Este código ha expirado', 'error');
        setCodigoVerificado(null);
        setDescuentoAplicado(0);
        return;
      }

      if (canje.id_paciente !== selectedPaciente?.id) {
        showNotif('Este código no pertenece a este paciente', 'error');
        setCodigoVerificado(null);
        setDescuentoAplicado(0);
        return;
      }

      setCodigoVerificado(canje);
      setDescuentoAplicado(parseFloat(canje.premio) || 0);
      showNotif(`Código válido. ${canje.premio}% de descuento aplicado`, 'success');

    } catch (error) {
      console.error('Error al verificar código:', error);
      showNotif(error.response?.data?.error || 'Código inválido', 'error');
      setCodigoVerificado(null);
      setDescuentoAplicado(0);
    } finally {
      setVerificandoCodigo(false);
    }
  };

  // Limpiar código de canje
  const limpiarCodigoCanje = () => {
    setCodigoCanje('');
    setCodigoVerificado(null);
    setDescuentoAplicado(0);
  };

  // Cargar pacientes con deudas
  const fetchPacientesConDeudas = useCallback(async () => {
    try {
      setLoading(true);

      const [citasResponse, pagosResponse] = await Promise.all([
        axios.get('https://back-end-4803.onrender.com/api/citas/all'),
        axios.get('https://back-end-4803.onrender.com/api/Finanzas/Pagos/')
      ]);

      const todasCitas = citasResponse.data;
      const todosPagos = pagosResponse.data;

      const citasCompletadas = todasCitas.filter(cita =>
        cita.estado === 'Completada' &&
        cita.precio_servicio &&
        parseFloat(cita.precio_servicio) > 0 &&
        cita.paciente_id
      );

      const deudasPorPaciente = {};
      const pagadosPorPaciente = {};

      citasCompletadas.forEach(cita => {
        const pagoRelacionado = todosPagos.find(pago =>
          pago.cita_id === cita.consulta_id && ['Pagado', 'Parcial'].includes(pago.estado)
        );

        const pacienteId = cita.paciente_id;
        const precioServicio = parseFloat(cita.precio_servicio) || 0;

        const datosBasicos = {
          paciente_id: pacienteId,
          nombre: cita.paciente_nombre || '',
          apellido_paterno: cita.paciente_apellido_paterno || '',
          apellido_materno: cita.paciente_apellido_materno || '',
          telefono: cita.paciente_telefono || '',
          correo: cita.paciente_correo || '',
          genero: cita.paciente_genero || '',
          fecha_nacimiento: cita.paciente_fecha_nacimiento || ''
        };

        const citaData = {
          id: cita.consulta_id,
          consulta_id: cita.consulta_id,
          servicio_id: cita.servicio_id,
          servicio_nombre: cita.servicio_nombre || 'Servicio no especificado',
          categoria_servicio: cita.categoria_servicio || 'General',
          precio_servicio: precioServicio,
          fecha_consulta: cita.fecha_consulta,
          odontologo_id: cita.odontologo_id,
          odontologo_nombre: cita.odontologo_nombre || 'No especificado',
          notas: cita.notas || '',
          pago: pagoRelacionado || null
        };

        if (pagoRelacionado) {
          if (!pagadosPorPaciente[pacienteId]) {
            pagadosPorPaciente[pacienteId] = {
              ...datosBasicos,
              citasPagadas: [],
              totalPagado: 0,
              ultimoPago: null
            };
          }
          pagadosPorPaciente[pacienteId].citasPagadas.push(citaData);
          pagadosPorPaciente[pacienteId].totalPagado += precioServicio;

          const fechaPago = new Date(pagoRelacionado.fecha_pago);
          if (!pagadosPorPaciente[pacienteId].ultimoPago || fechaPago > new Date(pagadosPorPaciente[pacienteId].ultimoPago)) {
            pagadosPorPaciente[pacienteId].ultimoPago = pagoRelacionado.fecha_pago;
          }
        } else {
          if (!deudasPorPaciente[pacienteId]) {
            deudasPorPaciente[pacienteId] = {
              ...datosBasicos,
              citasPendientes: [],
              totalDeuda: 0,
              ultimaCita: null
            };
          }
          deudasPorPaciente[pacienteId].citasPendientes.push(citaData);
          deudasPorPaciente[pacienteId].totalDeuda += precioServicio;

          const fechaCita = new Date(cita.fecha_consulta);
          if (!deudasPorPaciente[pacienteId].ultimaCita || fechaCita > new Date(deudasPorPaciente[pacienteId].ultimaCita)) {
            deudasPorPaciente[pacienteId].ultimaCita = cita.fecha_consulta;
          }
        }
      });

      const pacientesConDeudas = Object.values(deudasPorPaciente)
        .filter(p => p.citasPendientes.length > 0)
        .sort((a, b) => b.totalDeuda - a.totalDeuda);

      const pacientesPagados = Object.values(pagadosPorPaciente)
        .filter(p => p.citasPagadas.length > 0)
        .sort((a, b) => new Date(b.ultimoPago) - new Date(a.ultimoPago));

      setPacientesConDeudas(pacientesConDeudas);
      setPacientesPagados(pacientesPagados);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      showNotif('Error al cargar información', 'error');
      setLoading(false);
    }
  }, [showNotif]);

  // Cargar información completa del paciente
  const fetchPacienteCompleto = async (pacienteId) => {
    try {
      const response = await axios.get(`https://back-end-4803.onrender.com/api/reportes/pacientes`);
      const paciente = response.data.find(p => p.id === pacienteId);
      if (paciente) {
        setPacienteCompleto(paciente);
      }
    } catch (err) {
      console.warn('No se pudo cargar información adicional del paciente:', err);
    }
  };

  // Cargar pacientes para búsqueda
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const response = await axios.get('https://back-end-4803.onrender.com/api/reportes/pacientes');
        setPacientes(Array.isArray(response.data) ? response.data : []);
        await fetchPacientesConDeudas();
      } catch (err) {
        console.error('Error al cargar pacientes:', err);
        setPacientes([]);
        showNotif('Error al cargar pacientes', 'error');
      }
    };
    fetchPacientes();
  }, [fetchPacientesConDeudas, showNotif]);

  // Funciones para manejar menu
  const handleMenuClick = (event, pago, paciente) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedPago({ ...pago, paciente });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPago(null);
  };

  // Ver detalles del pago
  const handleVerDetalles = async (pago, paciente) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://back-end-4803.onrender.com/api/Finanzas/Pagos/${pago.pago.id}`);
      setSelectedPaymentDetails({
        pago: response.data,
        cita: pago,
        paciente: paciente
      });
      setShowPaymentDetails(true);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar detalles del pago:', err);
      showNotif('Error al cargar detalles del pago', 'error');
      setLoading(false);
    }
  };

  // Función para acciones del menú contextual
  const handleMenuAction = (action) => {
    switch (action) {
      case 'print':
        showNotif('Función de impresión en desarrollo', 'info');
        break;
      case 'download':
        showNotif('Función de descarga en desarrollo', 'info');
        break;
      case 'copy':
        if (selectedPago?.pago?.comprobante) {
          navigator.clipboard.writeText(selectedPago.pago.comprobante);
          showNotif('Número de comprobante copiado', 'success');
        } else {
          showNotif('No hay comprobante para copiar', 'warning');
        }
        break;
      default:
        break;
    }
    handleMenuClose();
  };

  // Seleccionar paciente desde lista de deudas
  const handleSelectPacienteConDeuda = async (pacienteData, cita) => {
    setLoading(true);
    try {
      setSelectedPaciente({
        id: pacienteData.paciente_id,
        nombre: pacienteData.nombre,
        aPaterno: pacienteData.apellido_paterno,
        aMaterno: pacienteData.apellido_materno,
        telefono: pacienteData.telefono,
        email: pacienteData.correo,
        genero: pacienteData.genero,
        fecha_nacimiento: pacienteData.fecha_nacimiento
      });

      setSelectedCita(cita);
      setCurrentStep('payment');

      try {
        await fetchPacienteCompleto(pacienteData.paciente_id);
      } catch (err) {
        console.warn('Error cargando información completa del paciente:', err);
      }
    } catch (error) {
      console.error('Error al seleccionar paciente:', error);
      showNotif('Error al procesar la selección', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar paciente desde búsqueda
  const handleSelectPacienteBusqueda = async (paciente) => {
    try {
      setLoading(true);

      const response = await axios.get(`https://back-end-4803.onrender.com/api/citas/paciente/${paciente.id}`);
      const citasPendientes = response.data.filter(c =>
        c.estado === 'Completada' &&
        c.precio_servicio &&
        parseFloat(c.precio_servicio) > 0
      );

      if (citasPendientes.length === 0) {
        showNotif('Este paciente no tiene servicios pendientes de pago', 'info');
        setLoading(false);
        return;
      }

      setSelectedPaciente(paciente);
      setPacienteCompleto(paciente);

      if (citasPendientes.length === 1) {
        const cita = citasPendientes[0];
        setSelectedCita({
          ...cita,
          id: cita.consulta_id,
          precio_servicio: parseFloat(cita.precio_servicio) || 0
        });
        setCurrentStep('payment');
      } else {
        showNotif('Este paciente tiene múltiples servicios pendientes. Seleccione uno específico desde la lista de deudas.', 'info');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      showNotif('Error al cargar información del paciente', 'error');
      setLoading(false);
    }
  };

  // Calcular totales CON descuento
  const calcularTotales = useCallback(() => {
    if (!selectedCita) return { subtotal: 0, descuento: 0, porcentajeDescuento: 0, total: 0 };

    const precio = selectedCita.precio_servicio || selectedCita.precio || selectedCita.monto || 0;
    const subtotal = parseFloat(precio) || 0;
    const montoDescuento = (subtotal * descuentoAplicado) / 100;
    const total = subtotal - montoDescuento;

    return { 
      subtotal, 
      descuento: montoDescuento,
      porcentajeDescuento: descuentoAplicado,
      total: Math.max(0, total)
    };
  }, [selectedCita, descuentoAplicado]);

  // Validar y procesar pago
  const handleProcesarPago = async () => {
    if (!selectedCita) {
      showNotif('Error: No se ha seleccionado ningún servicio', 'error');
      return;
    }

    if (!selectedPaciente) {
      showNotif('Error: No se ha seleccionado ningún paciente', 'error');
      return;
    }

    if (!selectedCita.servicio_nombre) {
      showNotif('Error: Información del servicio incompleta', 'error');
      return;
    }

    setFormErrors({});
    setShowConfirmDialog(true);
  };

  // Procesar pago después de confirmación CON código de canje
  const procesarPagoConfirmado = async () => {
    setLoading(true);
    setShowConfirmDialog(false);

    try {
      if (!selectedCita || !selectedPaciente) {
        throw new Error('Información incompleta del paciente o servicio');
      }

      const citaId = selectedCita.id;
      if (!citaId) {
        throw new Error('La cita seleccionada no tiene un ID válido');
      }

      const totales = calcularTotales();

      const pagoCompleto = {
        paciente_id: selectedPaciente.id,
        cita_id: citaId,
        monto: totales.total,
        subtotal: totales.subtotal,
        total: totales.total,
        concepto: `Pago por servicio: ${selectedCita.servicio_nombre}${codigoVerificado ? ` (Descuento ${totales.porcentajeDescuento}% aplicado)` : ''}`,
        metodo_pago: 'Efectivo',
        fecha_pago: paymentData.fecha_pago,
        estado: 'Pagado',
        comprobante: paymentData.referencia || `EFE-${Date.now()}`,
        notas: `${paymentData.notas || 'Pago procesado en efectivo'}${codigoVerificado ? `\nCódigo OdontoPuntos: ${codigoCanje} (${totales.porcentajeDescuento}% desc)` : ''}`
      };

      const response = await axios.post('https://back-end-4803.onrender.com/api/Finanzas/Pagos/upsert', pagoCompleto);

      // Marcar código como usado SI se aplicó descuento
      if (codigoVerificado && codigoCanje) {
        try {
          await axios.put(`https://back-end-4803.onrender.com/api/gamificacion/usar-canje/${codigoCanje.trim()}`);
        } catch (codigoError) {
          console.error('Error al marcar código como usado:', codigoError);
        }
      }

      showNotif('Pago procesado exitosamente', 'success');
      setCurrentStep('success');
      await fetchPacientesConDeudas();

      setTimeout(() => {
        if (onSave) onSave(response.data);
      }, 3000);

    } catch (err) {
      console.error('Error al procesar pago:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Error al procesar el pago. Intente nuevamente.';
      showNotif(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar y resetear
  const handleCancelar = () => {
    if (currentStep === 'selection') {
      if (onCancel) onCancel();
    } else {
      setShowCancelDialog(true);
    }
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep('selection');
    setSelectedPaciente(null);
    setSelectedCita(null);
    setPacienteCompleto(null);
    setPaymentData({
      metodo_pago: 'Efectivo',
      fecha_pago: new Date(),
      referencia: '',
      notas: ''
    });
    setFormErrors({});
    setActiveTab(0);
    setSearchTerm('');
    setFiltros({
      montoMin: '',
      montoMax: '',
      ordenarPor: 'deuda_desc',
      fechaDesde: null,
      fechaHasta: null
    });
    limpiarCodigoCanje();
  };

  // Filtrar listas con fechas
  const filtrarPacientes = useCallback((lista, tipo = 'deudas') => {
    return lista.filter(paciente => {
      const nombreCompleto = `${paciente.nombre} ${paciente.apellido_paterno} ${paciente.apellido_materno}`.toLowerCase();
      const telefono = paciente.telefono?.toLowerCase() || '';
      const email = paciente.correo?.toLowerCase() || '';
      const busqueda = searchTerm.toLowerCase();

      const coincideBusqueda = nombreCompleto.includes(busqueda) ||
        telefono.includes(busqueda) ||
        email.includes(busqueda);

      if (!coincideBusqueda) return false;

      const monto = tipo === 'deudas' ? paciente.totalDeuda : paciente.totalPagado;

      if (filtros.montoMin && monto < parseFloat(filtros.montoMin)) return false;
      if (filtros.montoMax && monto > parseFloat(filtros.montoMax)) return false;

      // Filtro por fecha
      if (tipo === 'deudas' && filtros.fechaDesde) {
        const fechaCita = new Date(paciente.ultimaCita);
        if (fechaCita < new Date(filtros.fechaDesde)) return false;
      }

      if (tipo === 'deudas' && filtros.fechaHasta) {
        const fechaCita = new Date(paciente.ultimaCita);
        if (fechaCita > new Date(filtros.fechaHasta)) return false;
      }

      return true;
    }).sort((a, b) => {
      const montoA = tipo === 'deudas' ? a.totalDeuda : a.totalPagado;
      const montoB = tipo === 'deudas' ? b.totalDeuda : b.totalPagado;

      switch (filtros.ordenarPor) {
        case 'deuda_asc': return montoA - montoB;
        case 'deuda_desc': return montoB - montoA;
        case 'nombre': return `${a.nombre} ${a.apellido_paterno}`.localeCompare(`${b.nombre} ${b.apellido_paterno}`);
        case 'fecha_asc': 
          const fechaA = new Date(tipo === 'deudas' ? a.ultimaCita : a.ultimoPago);
          const fechaB = new Date(tipo === 'deudas' ? b.ultimaCita : b.ultimoPago);
          return fechaA - fechaB;
        case 'fecha_desc':
          const fechaA2 = new Date(tipo === 'deudas' ? a.ultimaCita : a.ultimoPago);
          const fechaB2 = new Date(tipo === 'deudas' ? b.ultimaCita : b.ultimoPago);
          return fechaB2 - fechaA2;
        default: return montoB - montoA;
      }
    });
  }, [searchTerm, filtros]);

  const pacientesFiltradosDeudas = useMemo(() => 
    filtrarPacientes(pacientesConDeudas, 'deudas'), 
    [pacientesConDeudas, filtrarPacientes]
  );

  const pacientesFiltradosPagados = useMemo(() => 
    filtrarPacientes(pacientesPagados, 'pagados'), 
    [pacientesPagados, filtrarPacientes]
  );

  // Estadísticas
  const estadisticas = useMemo(() => ({
    totalDeudas: pacientesFiltradosDeudas.reduce((sum, p) => sum + p.totalDeuda, 0),
    totalPagados: pacientesFiltradosPagados.reduce((sum, p) => sum + p.totalPagado, 0),
    pacientesConDeudas: pacientesFiltradosDeudas.length,
    pacientesPagados: pacientesFiltradosPagados.length
  }), [pacientesFiltradosDeudas, pacientesFiltradosPagados]);

  // Cargar configuración
  useEffect(() => {
    if (mainActiveTab === 1) {
      loadConfiguration();
    }
  }, [mainActiveTab]);

  const loadConfiguration = async () => {
    try {
      setConfigLoading(true);
      const response = await axios.get('https://back-end-4803.onrender.com/api/Finanzas/config');

      if (response.data) {
        const backendData = response.data;
        const configData = backendData.config || backendData;

        setConfig({
          mercadopago: {
            enabled: configData.mercadopago?.enabled || false,
            access_token: configData.mercadopago?.access_token || '',
            public_key: configData.mercadopago?.public_key || '',
            webhook_url: configData.mercadopago?.webhook_url || '',
            mode: configData.mercadopago?.mode || 'production'
          },
          paypal: {
            enabled: configData.paypal?.enabled || false,
            client_id: configData.paypal?.client_id || '',
            client_secret: configData.paypal?.client_secret || '',
            webhook_url: configData.paypal?.webhook_url || '',
            mode: configData.paypal?.mode || 'sandbox'
          }
        });
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      showNotif('Error al cargar la configuración', 'error');
    } finally {
      setConfigLoading(false);
    }
  };

  const updateConfig = (provider, field, value) => {
    setConfig(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
  };

  const saveConfiguration = async () => {
    try {
      setSaving(true);
      const configData = {
        config: {
          mercadopago: {
            enabled: config.mercadopago.enabled,
            access_token: config.mercadopago.access_token,
            public_key: config.mercadopago.public_key,
            webhook_url: config.mercadopago.webhook_url,
            mode: config.mercadopago.mode
          },
          paypal: {
            enabled: config.paypal.enabled,
            client_id: config.paypal.client_id,
            client_secret: config.paypal.client_secret,
            webhook_url: config.paypal.webhook_url,
            mode: config.paypal.mode
          }
        },
        environment: 'sandbox'
      };
      
      await axios.put('https://back-end-4803.onrender.com/api/Finanzas/config', configData);
      showNotif('Configuración guardada exitosamente', 'success');
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      showNotif('Error al guardar la configuración', 'error');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (provider) => {
    try {
      setTesting(prev => ({ ...prev, [provider]: true }));
      setActiveProvider(provider);

      const endpoint = provider === 'mercadopago'
        ? 'https://back-end-4803.onrender.com/api/Finanzas/test-mercadopago'
        : 'https://back-end-4803.onrender.com/api/Finanzas/test-paypal';

      const response = await axios.post(endpoint, {
        config: config[provider]
      });

      setTestResults({
        provider,
        success: true,
        message: response.data.message || 'Conexión exitosa',
        details: response.data
      });
      setShowTestDialog(true);
      showNotif(`Conexión con ${provider} exitosa`, 'success');
    } catch (error) {
      console.error(`Error probando ${provider}:`, error);
      setTestResults({
        provider,
        success: false,
        message: error.response?.data?.error || `Error de conexión con ${provider}`,
        details: error.response?.data || {}
      });
      setShowTestDialog(true);
      showNotif(`Error de conexión con ${provider}`, 'error');
    } finally {
      setTesting(prev => ({ ...prev, [provider]: false }));
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showNotif(`${label} copiado al portapapeles`, 'success');
  };

  const toggleCredentialVisibility = (key) => {
    setShowCredentials(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // ==================== RENDERS ====================

  // Render de estadísticas
  const renderEstadisticas = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[
        { 
          value: estadisticas.pacientesConDeudas, 
          label: 'Deudas Pendientes', 
          icon: Warning, 
          color: colors.error,
          bgColor: `${colors.error}15`
        },
        { 
          value: estadisticas.pacientesPagados, 
          label: 'Pagos Completados', 
          icon: CheckCircle, 
          color: colors.success,
          bgColor: `${colors.success}15`
        },
        { 
          value: `$${estadisticas.totalDeudas.toLocaleString()}`, 
          label: 'Total Adeudado', 
          icon: TrendingUp, 
          color: colors.error,
          bgColor: `${colors.error}15`
        },
        { 
          value: `$${estadisticas.totalPagados.toLocaleString()}`, 
          label: 'Total Recaudado', 
          icon: AttachMoney, 
          color: colors.success,
          bgColor: `${colors.success}15`
        }
      ].map((stat, index) => (
        <Grid item xs={6} md={3} key={index}>
          <Slide direction="up" in timeout={300 + (index * 100)}>
            <Card 
              elevation={0} 
              sx={{
                p: 2,
                background: `linear-gradient(135deg, ${stat.bgColor} 0%, ${colors.glassBg} 100%)`,
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                border: `1px solid ${colors.cardBorder}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: colors.shadowHover,
                  borderColor: stat.color
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box sx={{ 
                  p: 1, 
                  bgcolor: stat.bgColor, 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <stat.icon sx={{ fontSize: 24, color: stat.color }} />
                </Box>
              </Box>
              <Typography variant="h5" fontWeight="700" sx={{ color: colors.text, mb: 0.5 }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 500 }}>
                {stat.label}
              </Typography>
            </Card>
          </Slide>
        </Grid>
      ))}
    </Grid>
  );

  // Render de lista de pacientes
  const renderPacientesList = () => (
    <Box>
      {/* Barra de búsqueda */}
      <Paper elevation={0} sx={{
        p: 2,
        mb: 2,
        borderRadius: 3,
        bgcolor: colors.glassBg,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${colors.cardBorder}`,
        boxShadow: colors.shadow
      }}>
        <TextField
          fullWidth
          placeholder="Buscar por nombre, teléfono o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            '& .MuiInputBase-root': {
              color: colors.text,
              backgroundColor: colors.inputBg,
              borderRadius: 2
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: colors.primary,
              },
              '&.Mui-focused fieldset': {
                borderColor: colors.primary,
                borderWidth: 2
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: colors.primary }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton 
                  onClick={() => setSearchTerm('')} 
                  size="small"
                  sx={{
                    bgcolor: colors.error + '15',
                    '&:hover': { bgcolor: colors.error + '25' }
                  }}
                >
                  <Close sx={{ color: colors.error, fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Tabs */}
      <Paper elevation={0} sx={{
        mb: 2,
        borderRadius: 3,
        bgcolor: colors.glassBg,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${colors.cardBorder}`,
        overflow: 'hidden',
        boxShadow: colors.shadow
      }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              color: colors.textSecondary,
              fontWeight: 600,
              fontSize: '0.875rem',
              minHeight: 48,
              transition: 'all 0.3s ease',
              '&.Mui-selected': {
                color: colors.primary,
              },
              '&:hover': {
                backgroundColor: colors.hover,
                color: colors.primaryLight
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: colors.primary,
              height: 3,
              borderRadius: '3px 3px 0 0'
            },
          }}
        >
          <Tab
            icon={<Warning />}
            label={`Deudas (${pacientesFiltradosDeudas.length})`}
            iconPosition="start"
          />
          <Tab
            icon={<CheckCircleOutline />}
            label={`Pagados (${pacientesFiltradosPagados.length})`}
            iconPosition="start"
          />
          <Tab
            icon={<PersonSearch />}
            label="Buscar"
            iconPosition="start"
          />
        </Tabs>

        {/* Filtros */}
        <Collapse in={showFilters}>
          <Box sx={{ 
            p: 2, 
            borderTop: `1px solid ${colors.divider}`,
            bgcolor: colors.cardBg
          }}>
            <Typography variant="subtitle2" fontWeight="600" sx={{ color: colors.text, mb: 2 }}>
              Filtros
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <TextField
                  size="small"
                  fullWidth
                  label="Monto mínimo"
                  type="number"
                  value={filtros.montoMin}
                  onChange={(e) => setFiltros(prev => ({ ...prev, montoMin: e.target.value }))}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: colors.text,
                      backgroundColor: colors.inputBg,
                      borderRadius: 2
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: colors.cardBorder },
                      '&:hover fieldset': { borderColor: colors.primary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                    '& .MuiInputLabel-root': { color: colors.textSecondary },
                  }}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  size="small"
                  fullWidth
                  label="Monto máximo"
                  type="number"
                  value={filtros.montoMax}
                  onChange={(e) => setFiltros(prev => ({ ...prev, montoMax: e.target.value }))}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: colors.text,
                      backgroundColor: colors.inputBg,
                      borderRadius: 2
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: colors.cardBorder },
                      '&:hover fieldset': { borderColor: colors.primary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                    '& .MuiInputLabel-root': { color: colors.textSecondary },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ color: colors.textSecondary }}>Ordenar por</InputLabel>
                  <Select
                    value={filtros.ordenarPor}
                    onChange={(e) => setFiltros(prev => ({ ...prev, ordenarPor: e.target.value }))}
                    label="Ordenar por"
                    sx={{
                      '& .MuiSelect-select': {
                        color: colors.text,
                        backgroundColor: colors.inputBg,
                        borderRadius: 2
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.cardBorder,
                      },
                    }}
                  >
                    <MenuItem value="deuda_desc">Mayor monto</MenuItem>
                    <MenuItem value="deuda_asc">Menor monto</MenuItem>
                    <MenuItem value="nombre">Nombre A-Z</MenuItem>
                    <MenuItem value="fecha_desc">Más reciente</MenuItem>
                    <MenuItem value="fecha_asc">Más antiguo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  size="small"
                  onClick={() => setFiltros({ montoMin: '', montoMax: '', ordenarPor: 'deuda_desc', fechaDesde: null, fechaHasta: null })}
                  sx={{
                    color: colors.error,
                    borderColor: colors.error,
                    borderRadius: 2,
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: colors.error,
                      backgroundColor: colors.error + '15',
                    },
                  }}
                >
                  Limpiar
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        {/* Botones de acción */}
        <Box sx={{ 
          p: 1.5, 
          display: 'flex', 
          gap: 1, 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderTop: `1px solid ${colors.divider}`
        }}>
          <Button
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? "contained" : "outlined"}
            size="small"
            sx={{
              color: showFilters ? '#fff' : colors.primary,
              borderColor: colors.primary,
              backgroundColor: showFilters ? colors.primary : 'transparent',
              borderRadius: 2,
              fontWeight: 600,
              '&:hover': {
                borderColor: colors.primaryDark,
                backgroundColor: showFilters ? colors.primaryDark : colors.hover,
              },
            }}
          >
            Filtros
          </Button>
          <Button
            startIcon={<Refresh />}
            onClick={fetchPacientesConDeudas}
            disabled={loading}
            size="small"
            variant="outlined"
            sx={{
              color: colors.primary,
              borderColor: colors.primary,
              borderRadius: 2,
              fontWeight: 600,
              '&:hover': {
                borderColor: colors.primaryDark,
                backgroundColor: colors.hover,
              },
            }}
          >
            Actualizar
          </Button>
        </Box>
      </Paper>

      {/* Contenido de tabs */}
      <Paper elevation={0} sx={{
        p: 2,
        borderRadius: 3,
        minHeight: 400,
        bgcolor: colors.glassBg,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${colors.cardBorder}`,
        boxShadow: colors.shadow
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
            <CircularProgress sx={{ color: colors.primary }} />
          </Box>
        ) : (
          <>
            {/* Tab Deudas */}
            {activeTab === 0 && (
              <Box>
                {pacientesFiltradosDeudas.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <CheckCircle sx={{ fontSize: 64, color: colors.success, mb: 2, opacity: 0.8 }} />
                    <Typography variant="h6" gutterBottom fontWeight="600" sx={{ color: colors.text }}>
                      No hay deudas pendientes
                    </Typography>
                    <Typography variant="body2" color={colors.textSecondary}>
                      Todos los pacientes están al día
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {pacientesFiltradosDeudas.map((paciente, index) => (
                      <Grid item xs={12} md={6} key={paciente.paciente_id}>
                        <Fade in timeout={300 + (index * 50)}>
                          <Card
                            elevation={0}
                            sx={{
                              p: 2,
                              border: `1px solid ${colors.cardBorder}`,
                              borderRadius: 3,
                              cursor: 'pointer',
                              bgcolor: colors.glassBg,
                              backdropFilter: 'blur(10px)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderColor: colors.error,
                                boxShadow: `0 4px 16px ${colors.error}20`,
                                transform: 'translateY(-2px)',
                                bgcolor: colors.glassHover
                              }
                            }}
                            onClick={() => {
                              if (paciente.citasPendientes.length === 1) {
                                handleSelectPacienteConDeuda(paciente, paciente.citasPendientes[0]);
                              } else {
                                showNotif(`${paciente.nombre} tiene ${paciente.citasPendientes.length} servicios pendientes`, 'info');
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                              <Avatar sx={{ 
                                bgcolor: colors.error + '20',
                                color: colors.error,
                                mr: 2,
                                width: 44,
                                height: 44,
                                fontWeight: 700,
                                border: `2px solid ${colors.error}`
                              }}>
                                {paciente.nombre.charAt(0)}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" fontWeight="700" sx={{ color: colors.text }}>
                                  {`${paciente.nombre} ${paciente.apellido_paterno}`.trim()}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Phone sx={{ fontSize: 12, color: colors.textSecondary }} />
                                  <Typography variant="caption" color={colors.textSecondary}>
                                    {paciente.telefono}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h6" color={colors.error} fontWeight="700">
                                  ${paciente.totalDeuda.toLocaleString()}
                                </Typography>
                                <Chip 
                                  label={`${paciente.citasPendientes.length} servicio${paciente.citasPendientes.length !== 1 ? 's' : ''}`}
                                  size="small"
                                  sx={{
                                    bgcolor: colors.error + '20',
                                    color: colors.error,
                                    fontWeight: 600,
                                    fontSize: '0.65rem',
                                    height: 20
                                  }}
                                />
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                              {paciente.citasPendientes.slice(0, 2).map((cita, idx) => (
                                <Chip
                                  key={idx}
                                  label={`${cita.servicio_nombre} - $${cita.precio_servicio}`}
                                  size="small"
                                  sx={{
                                    bgcolor: colors.error + '10',
                                    color: colors.error,
                                    fontWeight: 500,
                                    borderRadius: 1.5,
                                    fontSize: '0.7rem'
                                  }}
                                />
                              ))}
                              {paciente.citasPendientes.length > 2 && (
                                <Chip
                                  label={`+${paciente.citasPendientes.length - 2} más`}
                                  size="small"
                                  sx={{
                                    bgcolor: colors.textSecondary + '20',
                                    color: colors.textSecondary,
                                    fontWeight: 500,
                                    borderRadius: 1.5,
                                    fontSize: '0.7rem'
                                  }}
                                />
                              )}
                            </Box>
                          </Card>
                        </Fade>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}

            {/* Tab Pagados */}
            {activeTab === 1 && (
              <Box>
                {pacientesFiltradosPagados.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <PaidOutlined sx={{ fontSize: 64, color: colors.textSecondary, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" gutterBottom fontWeight="600" sx={{ color: colors.text }}>
                      No hay pagos registrados
                    </Typography>
                    <Typography variant="body2" color={colors.textSecondary}>
                      Aún no se han completado pagos
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {pacientesFiltradosPagados.map((paciente, index) => (
                      <Grid item xs={12} md={6} key={paciente.paciente_id}>
                        <Fade in timeout={300 + (index * 50)}>
                          <Card
                            elevation={0}
                            sx={{
                              p: 2,
                              border: `1px solid ${colors.cardBorder}`,
                              borderRadius: 3,
                              cursor: 'pointer',
                              bgcolor: colors.glassBg,
                              backdropFilter: 'blur(10px)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderColor: colors.success,
                                boxShadow: `0 4px 16px ${colors.success}20`,
                                transform: 'translateY(-2px)',
                                bgcolor: colors.glassHover
                              }
                            }}
                            onClick={() => {
                              if (paciente.citasPagadas.length > 0) {
                                handleVerDetalles(paciente.citasPagadas[0], paciente);
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                              <Avatar sx={{ 
                                bgcolor: colors.success + '20',
                                color: colors.success,
                                mr: 2,
                                width: 44,
                                height: 44,
                                fontWeight: 700,
                                border: `2px solid ${colors.success}`
                              }}>
                                {paciente.nombre.charAt(0)}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" fontWeight="700" sx={{ color: colors.text }}>
                                  {`${paciente.nombre} ${paciente.apellido_paterno}`.trim()}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Phone sx={{ fontSize: 12, color: colors.textSecondary }} />
                                  <Typography variant="caption" color={colors.textSecondary}>
                                    {paciente.telefono}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h6" color={colors.success} fontWeight="700">
                                  ${paciente.totalPagado.toLocaleString()}
                                </Typography>
                                <Chip 
                                  label={`${paciente.citasPagadas.length} servicio${paciente.citasPagadas.length !== 1 ? 's' : ''}`}
                                  size="small"
                                  sx={{
                                    bgcolor: colors.success + '20',
                                    color: colors.success,
                                    fontWeight: 600,
                                    fontSize: '0.65rem',
                                    height: 20
                                  }}
                                />
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
                              {paciente.citasPagadas.slice(0, 2).map((cita, idx) => (
                                <Chip
                                  key={idx}
                                  label={`${cita.servicio_nombre} - $${cita.precio_servicio}`}
                                  size="small"
                                  sx={{
                                    bgcolor: colors.success + '10',
                                    color: colors.success,
                                    fontWeight: 500,
                                    borderRadius: 1.5,
                                    fontSize: '0.7rem'
                                  }}
                                />
                              ))}
                              {paciente.citasPagadas.length > 2 && (
                                <Chip
                                  label={`+${paciente.citasPagadas.length - 2} más`}
                                  size="small"
                                  sx={{
                                    bgcolor: colors.textSecondary + '20',
                                    color: colors.textSecondary,
                                    fontWeight: 500,
                                    borderRadius: 1.5,
                                    fontSize: '0.7rem'
                                  }}
                                />
                              )}
                              <Tooltip title="Más opciones" arrow>
                                <IconButton
                                  size="small"
                                  sx={{ 
                                    ml: 'auto',
                                    color: colors.textSecondary,
                                    bgcolor: colors.cardBg,
                                    '&:hover': { bgcolor: colors.hover }
                                  }}
                                  onClick={(e) => handleMenuClick(e, paciente.citasPagadas[0], paciente)}
                                >
                                  <MoreVert sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Card>
                        </Fade>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}

            {/* Tab Buscar */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight="600" sx={{ color: colors.text, mb: 2 }}>
                  Buscar Paciente
                </Typography>
                <Autocomplete
                  options={pacientes || []}
                  getOptionLabel={(option) => `${option.nombre || ''} ${option.aPaterno || ''} ${option.aMaterno || ''}`.trim()}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Busque y seleccione un paciente"
                      sx={{
                        '& .MuiInputBase-root': {
                          color: colors.text,
                          backgroundColor: colors.inputBg,
                          borderRadius: 2
                        },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: colors.cardBorder,
                          },
                          '&:hover fieldset': {
                            borderColor: colors.primary,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: colors.primary,
                            borderWidth: 2
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: colors.textSecondary,
                        },
                      }}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <Search sx={{ color: colors.primary }} />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} style={{ padding: '10px 14px' }}>
                      <Avatar sx={{ bgcolor: colors.primary, mr: 1.5, width: 36, height: 36 }}>
                        {(option.nombre || 'P').charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="600" sx={{ color: colors.text }}>
                          {`${option.nombre || ''} ${option.aPaterno || ''} ${option.aMaterno || ''}`.trim()}
                        </Typography>
                        <Typography variant="caption" color={colors.textSecondary}>
                          {option.telefono || ''} • {option.email || ''}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  onChange={(e, value) => {
                    if (value) handleSelectPacienteBusqueda(value);
                  }}
                  loading={loading}
                  noOptionsText="No se encontraron pacientes"
                  loadingText="Cargando pacientes..."
                  sx={{
                    '& .MuiAutocomplete-listbox': {
                      bgcolor: colors.paper,
                      '& .MuiAutocomplete-option': {
                        '&:hover': {
                          bgcolor: colors.hover
                        }
                      }
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );

  // Render de formulario de pago CON CÓDIGO DE CANJE
  const renderProcesarPago = () => {
    const totales = calcularTotales();

    return (
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => setCurrentStep('selection')}
            sx={{ 
              mb: 2, 
              color: colors.primary,
              fontWeight: 600,
              '&:hover': { bgcolor: colors.hover }
            }}
          >
            Volver
          </Button>
          <Typography variant="h4" gutterBottom fontWeight="700" sx={{ color: colors.text }}>
            Procesar Pago
          </Typography>
        </Box>

        <Stepper activeStep={1} alternativeLabel sx={{ mb: 3 }}>
          {['Seleccionar', 'Pago', 'Confirmación'].map((label, index) => (
            <Step key={label}>
              <StepLabel 
                sx={{ 
                  '& .MuiStepLabel-label': { 
                    color: index === 1 ? colors.text : colors.textSecondary,
                    fontWeight: index === 1 ? 600 : 500,
                    fontSize: '0.875rem'
                  }
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Grid container spacing={2}>
          {/* Información del paciente */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{
              p: 2.5,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 3,
              bgcolor: colors.glassBg,
              backdropFilter: 'blur(10px)',
              height: '100%'
            }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="700" sx={{ color: colors.text, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person sx={{ color: colors.primary, fontSize: 20 }} />
                Paciente
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ 
                  bgcolor: colors.primary,
                  mr: 2,
                  width: 48,
                  height: 48,
                  fontWeight: 700
                }}>
                  {selectedPaciente?.nombre.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="700" sx={{ color: colors.text }}>
                    {selectedPaciente?.nombre} {selectedPaciente?.aPaterno}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Phone sx={{ fontSize: 14, color: colors.textSecondary }} />
                    <Typography variant="body2" color={colors.textSecondary}>
                      {selectedPaciente?.telefono}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Información del servicio */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{
              p: 2.5,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 3,
              bgcolor: colors.glassBg,
              backdropFilter: 'blur(10px)',
              height: '100%'
            }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="700" sx={{ color: colors.text, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MedicalServices sx={{ color: colors.primary, fontSize: 20 }} />
                Servicio
              </Typography>
              <Typography variant="h5" fontWeight="700" color={colors.primary} gutterBottom>
                {selectedCita?.servicio_nombre}
              </Typography>
              <Typography variant="body2" color={colors.textSecondary} gutterBottom>
                <strong>Fecha:</strong> {new Date(selectedCita?.fecha_consulta).toLocaleDateString('es-ES')}
              </Typography>
              <Typography variant="h4" color={colors.success} fontWeight="700" sx={{ mt: 1 }}>
                ${selectedCita?.precio_servicio.toLocaleString()}
              </Typography>
            </Card>
          </Grid>

          {/* Formulario de pago */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{
              p: 3,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 3,
              bgcolor: colors.glassBg,
              backdropFilter: 'blur(10px)'
            }}>
              <Typography variant="h6" gutterBottom fontWeight="700" sx={{ color: colors.text, mb: 2 }}>
                Método de Pago
              </Typography>

              {/* Método efectivo */}
              <Card
                elevation={0}
                sx={{
                  p: 2.5,
                  textAlign: 'center',
                  border: `2px solid ${colors.success}`,
                  borderRadius: 3,
                  bgcolor: `${colors.success}10`,
                  mb: 3
                }}
              >
                <AccountBalanceWallet sx={{ fontSize: 48, color: colors.success, mb: 1 }} />
                <Typography variant="h6" fontWeight="700" sx={{ color: colors.text }}>
                  Pago en Efectivo
                </Typography>
                <Typography variant="body2" color={colors.textSecondary}>
                  El paciente paga con dinero en efectivo
                </Typography>
              </Card>

              <Divider sx={{ my: 2.5, borderColor: colors.divider }} />

              {/* CÓDIGO ODONTOPUNTOS */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="700" sx={{ color: colors.text, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Stars sx={{ color: colors.warning }} />
                  Código de Descuento
                </Typography>
                
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Código OdontoPuntos"
                      value={codigoCanje}
                      onChange={(e) => setCodigoCanje(e.target.value.toUpperCase())}
                      placeholder="ODP123456789"
                      disabled={codigoVerificado !== null}
                      sx={{
                        '& .MuiInputBase-root': {
                          color: colors.text,
                          backgroundColor: codigoVerificado ? `${colors.success}15` : colors.inputBg,
                          borderRadius: 2,
                          fontWeight: 600
                        },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: codigoVerificado ? colors.success : colors.cardBorder,
                            borderWidth: codigoVerificado ? 2 : 1
                          },
                          '&:hover fieldset': {
                            borderColor: codigoVerificado ? colors.success : colors.primary,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: colors.primary,
                            borderWidth: 2
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: colors.textSecondary,
                          fontWeight: 600
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CardGiftcard sx={{ color: codigoVerificado ? colors.success : colors.warning }} />
                          </InputAdornment>
                        ),
                        endAdornment: codigoVerificado && (
                          <InputAdornment position="end">
                            <CheckCircle sx={{ color: colors.success }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={verificarCodigoCanje}
                      disabled={verificandoCodigo || codigoVerificado !== null || !codigoCanje.trim()}
                      startIcon={verificandoCodigo ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <Search />}
                      sx={{
                        backgroundColor: colors.primary,
                        color: '#fff',
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: 'none',
                        boxShadow: `0 2px 8px ${colors.primary}40`,
                        '&:hover': {
                          backgroundColor: colors.primaryDark,
                          boxShadow: `0 4px 12px ${colors.primary}50`
                        },
                        '&:disabled': {
                          backgroundColor: colors.disabled,
                          color: colors.textSecondary
                        }
                      }}
                    >
                      {verificandoCodigo ? 'Verificando...' : 'Verificar'}
                    </Button>
                  </Grid>

                  {codigoVerificado && (
                    <Grid item xs={12} md={3}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={limpiarCodigoCanje}
                        startIcon={<Close />}
                        sx={{
                          color: colors.error,
                          borderColor: colors.error,
                          fontWeight: 600,
                          borderRadius: 2,
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: colors.error,
                            backgroundColor: `${colors.error}15`
                          },
                        }}
                      >
                        Quitar
                      </Button>
                    </Grid>
                  )}
                </Grid>

                {codigoVerificado && (
                  <Fade in timeout={500}>
                    <Alert 
                      severity="success" 
                      icon={<CheckCircle />}
                      sx={{ 
                        mt: 2, 
                        borderRadius: 2,
                        border: `1px solid ${colors.success}`,
                        bgcolor: `${colors.success}15`
                      }}
                    >
                      <Typography variant="body2" fontWeight="700" sx={{ color: colors.success }}>
                        ✓ Código válido: {codigoVerificado.nombre_recompensa}
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        Descuento del <strong>{descuentoAplicado}%</strong> aplicado
                      </Typography>
                    </Alert>
                  </Fade>
                )}
              </Box>

              <Divider sx={{ my: 2.5, borderColor: colors.divider }} />

              {/* Campos del formulario */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Número de Recibo (Opcional)"
                    value={paymentData.referencia}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, referencia: e.target.value }))}
                    placeholder="REC-001"
                    sx={{
                      '& .MuiInputBase-root': {
                        color: colors.text,
                        backgroundColor: colors.inputBg,
                        borderRadius: 2
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: colors.cardBorder,
                        },
                        '&:hover fieldset': {
                          borderColor: colors.primary,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: colors.primary,
                          borderWidth: 2
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: colors.textSecondary,
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ConfirmationNumber sx={{ color: colors.textSecondary }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DateTimePicker
                      label="Fecha y Hora"
                      value={paymentData.fecha_pago}
                      onChange={(date) => setPaymentData(prev => ({ ...prev, fecha_pago: date }))}
                      renderInput={(params) => <TextField
                        {...params}
                        fullWidth
                        sx={{
                          '& .MuiInputBase-root': {
                            color: colors.text,
                            backgroundColor: colors.inputBg,
                            borderRadius: 2
                          },
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: colors.cardBorder,
                            },
                            '&:hover fieldset': {
                              borderColor: colors.primary,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: colors.primary,
                              borderWidth: 2
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: colors.textSecondary,
                          },
                        }}
                      />}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notas (opcional)"
                    value={paymentData.notas}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, notas: e.target.value }))}
                    multiline
                    rows={3}
                    placeholder="Observaciones adicionales..."
                    sx={{
                      '& .MuiInputBase-root': {
                        color: colors.text,
                        backgroundColor: colors.inputBg,
                        borderRadius: 2
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: colors.cardBorder,
                        },
                        '&:hover fieldset': {
                          borderColor: colors.primary,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: colors.primary,
                          borderWidth: 2
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: colors.textSecondary,
                      },
                    }}
                  />
                </Grid>
              </Grid>

              {/* Resumen CON descuento */}
              <Card elevation={0} sx={{
                p: 2.5,
                bgcolor: `${colors.primary}10`,
                borderRadius: 3,
                mb: 3,
                border: `2px solid ${colors.primary}`
              }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="700" sx={{ color: colors.text, mb: 2 }}>
                  Resumen del Pago
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body1" sx={{ color: colors.text, fontWeight: 600 }}>
                    Subtotal:
                  </Typography>
                  <Typography variant="body1" sx={{ color: colors.text, fontWeight: 600 }}>
                    ${totales.subtotal.toLocaleString()}
                  </Typography>
                </Box>

                {codigoVerificado && totales.descuento > 0 && (
                  <Fade in timeout={500}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Stars sx={{ color: colors.warning, fontSize: 18 }} />
                          <Typography variant="body1" sx={{ color: colors.success, fontWeight: 700 }}>
                            Descuento ({totales.porcentajeDescuento}%):
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ color: colors.success, fontWeight: 700 }}>
                          -${totales.descuento.toLocaleString()}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1.5, borderColor: colors.divider }} />
                    </Box>
                  </Fade>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                  <Typography variant="h6" sx={{ color: colors.text, fontWeight: 700 }}>
                    Total:
                  </Typography>
                  <Typography variant="h4" color={colors.primary} fontWeight="800">
                    ${totales.total.toLocaleString()}
                  </Typography>
                </Box>
              </Card>

              {/* Botones */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleCancelar}
                  disabled={loading}
                  startIcon={<Cancel />}
                  sx={{
                    color: colors.textSecondary,
                    borderColor: colors.cardBorder,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: colors.error,
                      backgroundColor: `${colors.error}10`,
                      color: colors.error
                    },
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={handleProcesarPago}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <Payment />}
                  sx={{
                    backgroundColor: colors.primary,
                    color: '#fff',
                    borderRadius: 2,
                    px: 4,
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: `0 4px 12px ${colors.primary}40`,
                    '&:hover': {
                      backgroundColor: colors.primaryDark,
                      boxShadow: `0 6px 16px ${colors.primary}50`
                    },
                  }}
                >
                  {loading ? 'Procesando...' : 'Procesar Pago'}
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    );
  };

  // Render de confirmación de éxito
  const renderExito = () => (
    <Container maxWidth="sm">
      <Fade in timeout={500}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircle sx={{ fontSize: 80, color: colors.success, mb: 3 }} />
          <Typography variant="h4" gutterBottom fontWeight="800" sx={{ color: colors.text }}>
            ¡Pago Exitoso!
          </Typography>
          <Typography variant="body1" color={colors.textSecondary} gutterBottom sx={{ mb: 4 }}>
            El pago ha sido registrado correctamente
          </Typography>

          <Card elevation={0} sx={{
            p: 3,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 3,
            bgcolor: colors.glassBg,
            backdropFilter: 'blur(10px)',
            boxShadow: colors.shadow
          }}>
            <Typography variant="h6" gutterBottom fontWeight="700" sx={{ color: colors.text, mb: 2 }}>
              Resumen
            </Typography>
            <Divider sx={{ mb: 2, borderColor: colors.divider }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color={colors.textSecondary}>
                  Paciente:
                </Typography>
                <Typography variant="body1" fontWeight="600" sx={{ color: colors.text }}>
                  {selectedPaciente?.nombre} {selectedPaciente?.aPaterno}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color={colors.textSecondary}>
                  Servicio:
                </Typography>
                <Typography variant="body1" fontWeight="600" sx={{ color: colors.text }}>
                  {selectedCita?.servicio_nombre}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color={colors.textSecondary}>
                  Método:
                </Typography>
                <Typography variant="body1" fontWeight="600" sx={{ color: colors.text }}>
                  Efectivo
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color={colors.textSecondary}>
                  Monto:
                </Typography>
                <Typography variant="h6" fontWeight="700" color={colors.success}>
                  ${calcularTotales().total.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Card>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={resetForm}
              startIcon={<Add />}
              sx={{
                color: colors.primary,
                borderColor: colors.primary,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderColor: colors.primaryDark,
                  backgroundColor: colors.hover
                },
              }}
            >
              Nuevo Pago
            </Button>
            <Button
              variant="contained"
              startIcon={<PrintOutlined />}
              sx={{
                backgroundColor: colors.primary,
                color: '#fff',
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: `0 2px 8px ${colors.primary}40`,
                '&:hover': {
                  backgroundColor: colors.primaryDark,
                  boxShadow: `0 4px 12px ${colors.primary}50`
                },
              }}
            >
              Imprimir
            </Button>
          </Box>
        </Box>
      </Fade>
    </Container>
  );

  // Renderizar card de configuración para MercadoPago
  const renderMercadoPagoConfig = () => (
    <Card elevation={0} sx={{
      border: `1px solid ${colors.cardBorder}`,
      borderRadius: 3,
      bgcolor: colors.paper
    }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CreditCard sx={{ color: '#00b0ff', fontSize: 28, mr: 1.5 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="700" sx={{ color: colors.text }}>
                MercadoPago
              </Typography>
              <Typography variant="caption" color={colors.textSecondary}>
                Configuración para pagos
              </Typography>
            </Box>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={config.mercadopago.enabled}
                onChange={(e) => updateConfig('mercadopago', 'enabled', e.target.checked)}
                color="primary"
              />
            }
            label={
              <Chip
                label={config.mercadopago.enabled ? "Activo" : "Inactivo"}
                color={config.mercadopago.enabled ? "success" : "default"}
                size="small"
              />
            }
          />
        </Box>

        <Accordion expanded={config.mercadopago.enabled} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
          <AccordionDetails sx={{ p: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: colors.textSecondary }}>Modo</InputLabel>
                  <Select
                    value={config.mercadopago.mode}
                    onChange={(e) => updateConfig('mercadopago', 'mode', e.target.value)}
                    label="Modo"
                    sx={{
                      '& .MuiSelect-select': {
                        color: colors.text,
                        backgroundColor: colors.inputBg
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.cardBorder,
                      },
                    }}
                  >
                    <MenuItem value="sandbox">Sandbox</MenuItem>
                    <MenuItem value="live">Producción</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Access Token"
                  type={showCredentials.mercadopago_token ? "text" : "password"}
                  value={config.mercadopago.access_token}
                  onChange={(e) => updateConfig('mercadopago', 'access_token', e.target.value)}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: colors.text,
                      backgroundColor: colors.inputBg
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: colors.cardBorder },
                      '&:hover fieldset': { borderColor: colors.primary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                    '& .MuiInputLabel-root': { color: colors.textSecondary },
                  }}
                  InputProps={{
                    endAdornment: (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          onClick={() => toggleCredentialVisibility('mercadopago_token')}
                          size="small"
                        >
                          {showCredentials.mercadopago_token ?
                            <VisibilityOff sx={{ color: colors.textSecondary, fontSize: 18 }} /> :
                            <Visibility sx={{ color: colors.textSecondary, fontSize: 18 }} />
                          }
                        </IconButton>
                        {config.mercadopago.access_token && (
                          <IconButton
                            onClick={() => copyToClipboard(config.mercadopago.access_token, 'Token')}
                            size="small"
                          >
                            <ContentCopy sx={{ color: colors.textSecondary, fontSize: 18 }} />
                          </IconButton>
                        )}
                      </Box>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Public Key"
                  value={config.mercadopago.public_key}
                  onChange={(e) => updateConfig('mercadopago', 'public_key', e.target.value)}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: colors.text,
                      backgroundColor: colors.inputBg
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: colors.cardBorder },
                      '&:hover fieldset': { borderColor: colors.primary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                    '& .MuiInputLabel-root': { color: colors.textSecondary },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Webhook URL"
                  value={config.mercadopago.webhook_url}
                  onChange={(e) => updateConfig('mercadopago', 'webhook_url', e.target.value)}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: colors.text,
                      backgroundColor: colors.inputBg
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: colors.cardBorder },
                      '&:hover fieldset': { borderColor: colors.primary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                    '& .MuiInputLabel-root': { color: colors.textSecondary },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Link sx={{ color: colors.textSecondary, fontSize: 18 }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={testing.mercadopago ? <CircularProgress size={14} /> : <Biotech />}
                  onClick={() => testConnection('mercadopago')}
                  disabled={!config.mercadopago.access_token || !config.mercadopago.public_key || testing.mercadopago}
                  sx={{
                    color: colors.primary,
                    borderColor: colors.primary,
                    '&:hover': { borderColor: colors.primary, backgroundColor: colors.hover },
                  }}
                >
                  {testing.mercadopago ? 'Probando...' : 'Probar Conexión'}
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );

  // Renderizar card de configuración para PayPal
  const renderPayPalConfig = () => (
    <Card elevation={0} sx={{
      border: `1px solid ${colors.cardBorder}`,
      borderRadius: 3,
      bgcolor: colors.paper
    }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccountBalance sx={{ color: '#0070ba', fontSize: 28, mr: 1.5 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="700" sx={{ color: colors.text }}>
                PayPal
              </Typography>
              <Typography variant="caption" color={colors.textSecondary}>
                Configuración para pagos
              </Typography>
            </Box>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={config.paypal.enabled}
                onChange={(e) => updateConfig('paypal', 'enabled', e.target.checked)}
                color="primary"
              />
            }
            label={
              <Chip
                label={config.paypal.enabled ? "Activo" : "Inactivo"}
                color={config.paypal.enabled ? "success" : "default"}
                size="small"
              />
            }
          />
        </Box>

        <Accordion expanded={config.paypal.enabled} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
          <AccordionDetails sx={{ p: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: colors.textSecondary }}>Modo</InputLabel>
                  <Select
                    value={config.paypal.mode}
                    onChange={(e) => updateConfig('paypal', 'mode', e.target.value)}
                    label="Modo"
                    sx={{
                      '& .MuiSelect-select': {
                        color: colors.text,
                        backgroundColor: colors.inputBg
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.cardBorder,
                      },
                    }}
                  >
                    <MenuItem value="sandbox">Sandbox</MenuItem>
                    <MenuItem value="live">Producción</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Client ID"
                  type={showCredentials.paypal_id ? "text" : "password"}
                  value={config.paypal.client_id}
                  onChange={(e) => updateConfig('paypal', 'client_id', e.target.value)}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: colors.text,
                      backgroundColor: colors.inputBg
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: colors.cardBorder },
                      '&:hover fieldset': { borderColor: colors.primary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                    '& .MuiInputLabel-root': { color: colors.textSecondary },
                  }}
                  InputProps={{
                    endAdornment: (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          onClick={() => toggleCredentialVisibility('paypal_id')}
                          size="small"
                        >
                          {showCredentials.paypal_id ?
                            <VisibilityOff sx={{ color: colors.textSecondary, fontSize: 18 }} /> :
                            <Visibility sx={{ color: colors.textSecondary, fontSize: 18 }} />
                          }
                        </IconButton>
                        {config.paypal.client_id && (
                          <IconButton
                            onClick={() => copyToClipboard(config.paypal.client_id, 'ID')}
                            size="small"
                          >
                            <ContentCopy sx={{ color: colors.textSecondary, fontSize: 18 }} />
                          </IconButton>
                        )}
                      </Box>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Client Secret"
                  type={showCredentials.paypal_secret ? "text" : "password"}
                  value={config.paypal.client_secret}
                  onChange={(e) => updateConfig('paypal', 'client_secret', e.target.value)}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: colors.text,
                      backgroundColor: colors.inputBg
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: colors.cardBorder },
                      '&:hover fieldset': { borderColor: colors.primary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                    '& .MuiInputLabel-root': { color: colors.textSecondary },
                  }}
                  InputProps={{
                    endAdornment: (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          onClick={() => toggleCredentialVisibility('paypal_secret')}
                          size="small"
                        >
                          {showCredentials.paypal_secret ?
                            <VisibilityOff sx={{ color: colors.textSecondary, fontSize: 18 }} /> :
                            <Visibility sx={{ color: colors.textSecondary, fontSize: 18 }} />
                          }
                        </IconButton>
                        {config.paypal.client_secret && (
                          <IconButton
                            onClick={() => copyToClipboard(config.paypal.client_secret, 'Secret')}
                            size="small"
                          >
                            <ContentCopy sx={{ color: colors.textSecondary, fontSize: 18 }} />
                          </IconButton>
                        )}
                      </Box>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Webhook URL"
                  value={config.paypal.webhook_url}
                  onChange={(e) => updateConfig('paypal', 'webhook_url', e.target.value)}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: colors.text,
                      backgroundColor: colors.inputBg
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: colors.cardBorder },
                      '&:hover fieldset': { borderColor: colors.primary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                    '& .MuiInputLabel-root': { color: colors.textSecondary },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Link sx={{ color: colors.textSecondary, fontSize: 18 }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={testing.paypal ? <CircularProgress size={14} /> : <Biotech />}
                  onClick={() => testConnection('paypal')}
                  disabled={!config.paypal.client_id || !config.paypal.client_secret || testing.paypal}
                  sx={{
                    color: colors.primary,
                    borderColor: colors.primary,
                    '&:hover': { borderColor: colors.primary, backgroundColor: colors.hover },
                  }}
                >
                  {testing.paypal ? 'Probando...' : 'Probar Conexión'}
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );

  // Renderizar resumen de estado
  const renderStatusSummary = () => (
    <Card elevation={0} sx={{
      border: `1px solid ${colors.cardBorder}`,
      borderRadius: 3,
      bgcolor: colors.paper,
      mb: 2
    }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight="700" sx={{ color: colors.text, mb: 2 }}>
          Estado de Métodos de Pago
        </Typography>

        <Grid container spacing={1.5}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 1.5, bgcolor: colors.cardBg, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MonetizationOn sx={{ color: colors.success, mr: 1, fontSize: 20 }} />
                <Typography variant="body2" fontWeight="600" sx={{ color: colors.text }}>
                  Efectivo
                </Typography>
              </Box>
              <Chip label="Siempre Activo" color="success" size="small" />
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 1.5, bgcolor: colors.cardBg, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CreditCard sx={{ color: '#00b0ff', mr: 1, fontSize: 20 }} />
                <Typography variant="body2" fontWeight="600" sx={{ color: colors.text }}>
                  MercadoPago
                </Typography>
              </Box>
              <Chip
                label={config.mercadopago.enabled ? "Configurado" : "Inactivo"}
                color={config.mercadopago.enabled ? "success" : "default"}
                size="small"
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 1.5, bgcolor: colors.cardBg, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance sx={{ color: '#0070ba', mr: 1, fontSize: 20 }} />
                <Typography variant="body2" fontWeight="600" sx={{ color: colors.text }}>
                  PayPal
                </Typography>
              </Box>
              <Chip
                label={config.paypal.enabled ? "Configurado" : "Inactivo"}
                color={config.paypal.enabled ? "success" : "default"}
                size="small"
              />
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3, bgcolor: colors.background, minHeight: '100vh' }}>
      {loading && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, '& .MuiLinearProgress-bar': { backgroundColor: colors.primary } }} />}

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="800" sx={{ color: colors.text }}>
          Gestión de Finanzas
        </Typography>
        <Typography variant="body1" color={colors.textSecondary} fontWeight="500">
          Sistema de pagos y configuración
        </Typography>
      </Box>

      {/* Tabs principales */}
      <Paper elevation={0} sx={{
        mb: 3,
        borderRadius: 3,
        bgcolor: colors.glassBg,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${colors.cardBorder}`,
        overflow: 'hidden',
        boxShadow: colors.shadow
      }}>
        <Tabs
          value={mainActiveTab}
          onChange={(e, v) => setMainActiveTab(v)}
          variant="fullWidth"
          sx={{
            minHeight: 54,
            '& .MuiTab-root': {
              color: colors.textSecondary,
              fontWeight: 600,
              fontSize: '0.9rem',
              minHeight: 54,
              textTransform: 'none',
              transition: 'all 0.3s ease',
              '&.Mui-selected': {
                color: colors.primary,
              },
              '&:hover': {
                backgroundColor: colors.hover,
                color: colors.primaryLight
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: colors.primary,
              height: 3,
              borderRadius: '3px 3px 0 0'
            },
          }}
        >
          <Tab
            icon={<Payment />}
            label="Gestión de Pagos"
            iconPosition="start"
          />
          <Tab
            icon={<Settings />}
            label="Configuración"
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Contenido principal */}
      <Fade in={true} timeout={300}>
        <Box>
          {/* Tab Gestión de Pagos */}
          {mainActiveTab === 0 && (
            <>
              {currentStep === 'selection' && (
                <>
                  {renderEstadisticas()}
                  {renderPacientesList()}
                </>
              )}

              {currentStep === 'payment' && renderProcesarPago()}

              {currentStep === 'success' && renderExito()}
            </>
          )}

          {/* Tab Configuración */}
          {mainActiveTab === 1 && (
            <Box>
              {configLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress sx={{ color: colors.primary }} />
                </Box>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    {renderStatusSummary()}
                  </Grid>
                  <Grid item xs={12}>
                    {renderMercadoPagoConfig()}
                  </Grid>
                  <Grid item xs={12}>
                    {renderPayPalConfig()}
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={loadConfiguration}
                        disabled={saving}
                        startIcon={<Refresh />}
                        sx={{
                          color: colors.primary,
                          borderColor: colors.primary,
                          borderRadius: 2,
                          fontWeight: 600,
                          '&:hover': {
                            borderColor: colors.primaryDark,
                            backgroundColor: colors.hover,
                          },
                        }}
                      >
                        Recargar
                      </Button>
                      <Button
                        variant="contained"
                        onClick={saveConfiguration}
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <Save />}
                        sx={{
                          backgroundColor: colors.primary,
                          color: '#fff',
                          borderRadius: 2,
                          fontWeight: 700,
                          boxShadow: `0 2px 8px ${colors.primary}40`,
                          '&:hover': {
                            backgroundColor: colors.primaryDark,
                            boxShadow: `0 4px 12px ${colors.primary}50`
                          },
                        }}
                      >
                        {saving ? 'Guardando...' : 'Guardar'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
        </Box>
      </Fade>

      {/* Diálogo de confirmación de pago CON descuento */}
      <Dialog 
        open={showConfirmDialog} 
        onClose={() => setShowConfirmDialog(false)} 
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
        <DialogTitle>
          <Typography variant="h6" fontWeight="700" sx={{ color: colors.text }}>
            Confirmar Pago
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            Verifique la información antes de procesar
          </Alert>
          <Box>
            <Typography variant="body2" gutterBottom sx={{ color: colors.text, fontWeight: 600 }}>
              <strong>Paciente:</strong> {selectedPaciente?.nombre} {selectedPaciente?.aPaterno}
            </Typography>
            <Typography variant="body2" gutterBottom sx={{ color: colors.text, fontWeight: 600 }}>
              <strong>Servicio:</strong> {selectedCita?.servicio_nombre}
            </Typography>
            
            {codigoVerificado && (
              <>
                <Divider sx={{ my: 1.5, borderColor: colors.divider }} />
                <Box sx={{ bgcolor: `${colors.success}15`, p: 1.5, borderRadius: 2, mb: 1.5 }}>
                  <Typography variant="caption" color={colors.success} fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Stars fontSize="small" />
                    Código OdontoPuntos aplicado
                  </Typography>
                  <Typography variant="body2" gutterBottom sx={{ color: colors.text, fontWeight: 600, mt: 0.5 }}>
                    <strong>Subtotal:</strong> ${calcularTotales().subtotal.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" gutterBottom sx={{ color: colors.success, fontWeight: 700 }}>
                    <strong>Descuento ({calcularTotales().porcentajeDescuento}%):</strong> -${calcularTotales().descuento.toLocaleString()}
                  </Typography>
                </Box>
              </>
            )}
            
            <Typography variant="h6" color={colors.primary} fontWeight="800" sx={{ mt: 1.5 }}>
              <strong>Total:</strong> ${calcularTotales().total.toLocaleString()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setShowConfirmDialog(false)} 
            variant="outlined" 
            sx={{ 
              color: colors.textSecondary, 
              borderColor: colors.cardBorder, 
              borderRadius: 2,
              fontWeight: 600
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={procesarPagoConfirmado}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <CheckCircle />}
            sx={{
              backgroundColor: colors.primary,
              color: '#fff',
              borderRadius: 2,
              fontWeight: 700,
              boxShadow: `0 2px 8px ${colors.primary}40`,
              '&:hover': {
                backgroundColor: colors.primaryDark,
                boxShadow: `0 4px 12px ${colors.primary}50`
              },
            }}
          >
            {loading ? 'Procesando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de cancelación */}
      <Dialog 
        open={showCancelDialog} 
        onClose={() => setShowCancelDialog(false)} 
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
        <DialogTitle>
          <Typography variant="h6" fontWeight="700" sx={{ color: colors.text }}>
            Confirmar Cancelación
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            ¿Desea cancelar el proceso?
          </Alert>
          <Typography variant="body2" sx={{ color: colors.text }}>
            Se perderán todos los datos ingresados
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setShowCancelDialog(false)} 
            variant="outlined" 
            sx={{ 
              color: colors.textSecondary, 
              borderColor: colors.cardBorder, 
              borderRadius: 2,
              fontWeight: 600 
            }}
          >
            Continuar
          </Button>
          <Button 
            onClick={confirmCancel} 
            color="error" 
            variant="contained"
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de detalles de pago */}
      <Dialog
        open={showPaymentDetails}
        onClose={() => setShowPaymentDetails(false)}
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
        <DialogTitle>
          <Typography variant="h6" fontWeight="700" sx={{ color: colors.text }}>
            Detalles del Pago
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedPaymentDetails && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ p: 2, bgcolor: colors.cardBg, borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="700" sx={{ color: colors.text }}>
                    Paciente
                  </Typography>
                  <Typography variant="body2" gutterBottom sx={{ color: colors.text, fontWeight: 600 }}>
                    <strong>Nombre:</strong> {`${selectedPaymentDetails.paciente.nombre} ${selectedPaymentDetails.paciente.apellido_paterno}`.trim()}
                  </Typography>
                  <Typography variant="body2" gutterBottom sx={{ color: colors.text, fontWeight: 600 }}>
                    <strong>Teléfono:</strong> {selectedPaymentDetails.paciente.telefono || 'N/A'}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ p: 2, bgcolor: colors.cardBg, borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="700" sx={{ color: colors.text }}>
                    Pago
                  </Typography>
                  <Typography variant="body2" gutterBottom sx={{ color: colors.text, fontWeight: 600 }}>
                    <strong>Monto:</strong> ${parseFloat(selectedPaymentDetails.pago.total).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" gutterBottom sx={{ color: colors.text, fontWeight: 600 }}>
                    <strong>Método:</strong> {selectedPaymentDetails.pago.metodo_pago}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setShowPaymentDetails(false)} 
            variant="outlined" 
            sx={{ 
              color: colors.textSecondary, 
              borderColor: colors.cardBorder, 
              borderRadius: 2,
              fontWeight: 600 
            }}
          >
            Cerrar
          </Button>
          <Button 
            startIcon={<PrintOutlined />} 
            variant="contained" 
            sx={{ 
              backgroundColor: colors.primary, 
              color: '#fff', 
              borderRadius: 2,
              fontWeight: 700
            }}
          >
            Imprimir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de resultados de prueba */}
      <Dialog
        open={showTestDialog}
        onClose={() => setShowTestDialog(false)}
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
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {testResults?.success ? (
              <CheckCircle sx={{ color: colors.success, mr: 1.5, fontSize: 28 }} />
            ) : (
              <Error sx={{ color: colors.error, mr: 1.5, fontSize: 28 }} />
            )}
            <Typography variant="h6" fontWeight="700" sx={{ color: colors.text }}>
              Resultado - {activeProvider}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {testResults && (
            <Box>
              <Alert severity={testResults.success ? "success" : "error"} sx={{ mb: 2, borderRadius: 2 }}>
                {testResults.message}
              </Alert>

              {testResults.details && Object.keys(testResults.details).length > 0 && (
                <Card elevation={0} sx={{ p: 1.5, bgcolor: colors.cardBg, borderRadius: 2 }}>
                  <Typography variant="caption" gutterBottom fontWeight="700" sx={{ color: colors.text }}>
                    Detalles:
                  </Typography>
                  {Object.entries(testResults.details).map(([key, value]) => (
                    <Typography key={key} variant="caption" display="block" sx={{ color: colors.text }}>
                      <strong>{key}:</strong> {String(value)}
                    </Typography>
                  ))}
                </Card>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setShowTestDialog(false)} 
            variant="contained" 
            sx={{ 
              backgroundColor: colors.primary, 
              color: '#fff', 
              borderRadius: 2,
              fontWeight: 700
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: colors.paper,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 2
          }
        }}
      >
        <MenuItem onClick={() => handleMenuAction('print')}>
          <ListItemIcon><PrintOutlined sx={{ color: colors.textSecondary, fontSize: 18 }} /></ListItemIcon>
          <ListItemText primary="Imprimir" primaryTypographyProps={{ color: colors.text, fontWeight: 600, fontSize: '0.875rem' }} />
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('download')}>
          <ListItemIcon><GetApp sx={{ color: colors.textSecondary, fontSize: 18 }} /></ListItemIcon>
          <ListItemText primary="Descargar" primaryTypographyProps={{ color: colors.text, fontWeight: 600, fontSize: '0.875rem' }} />
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('copy')}>
          <ListItemIcon><FileCopy sx={{ color: colors.textSecondary, fontSize: 18 }} /></ListItemIcon>
          <ListItemText primary="Copiar" primaryTypographyProps={{ color: colors.text, fontWeight: 600, fontSize: '0.875rem' }} />
        </MenuItem>
      </Menu>

      {/* Notificaciones */}
      <Notificaciones
        open={showNotification}
        message={notificationMessage}
        type={notificationType}
        handleClose={handleCloseNotification}
      />
    </Container>
  );
};

export default FinanzasForm;