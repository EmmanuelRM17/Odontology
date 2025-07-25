import React, { useState, useEffect, useCallback } from 'react';
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
  Badge,
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
  Stack,
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
  AccordionDetails
} from '@mui/material';
import {
  Receipt,
  Person,
  Payment,
  SaveAlt,
  Cancel,
  CheckCircle,
  PaymentsTwoTone,
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
  AccountCircle,
  FilterList,
  CheckCircleOutline,
  PrintOutlined,
  Refresh,
  PaidOutlined,
  MoreVert,
  GetApp,
  FileCopy,
  Info,
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
  Security
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

  // Configuración de colores para tema oscuro/claro
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
    hover: isDarkTheme ? '#333333' : '#f5f5f5',
    disabled: isDarkTheme ? '#616161' : '#bdbdbd'
  };

  // Estados principales del módulo
  const [mainActiveTab, setMainActiveTab] = useState(0); // 0: Pagos, 1: Configuración

  // ==================== ESTADOS PARA PAGOS ====================
  const [currentStep, setCurrentStep] = useState('selection');
  const [activeTab, setActiveTab] = useState(0); // 0: Deudas, 1: Pagados, 2: Buscar
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

  // Estados para menú contextual
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPago, setSelectedPago] = useState(null);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState({
    montoMin: '',
    montoMax: '',
    ordenarPor: 'deuda_desc'
  });

  // Estados de notificaciones
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('info');
  const [formErrors, setFormErrors] = useState({});

  // Estado del formulario de pago - SIMPLIFICADO SOLO EFECTIVO
  const [paymentData, setPaymentData] = useState({
    metodo_pago: 'Efectivo',
    fecha_pago: new Date(),
    referencia: '',
    notas: ''
  });

  // ==================== ESTADOS PARA CONFIGURACIÓN ====================
  const [configLoading, setConfigLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState({ mercadopago: false, paypal: false });

  // Estados de configuración
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

  // Estados para mostrar/ocultar credenciales
  const [showCredentials, setShowCredentials] = useState({
    mercadopago_token: false,
    mercadopago_secret: false,
    paypal_id: false,
    paypal_secret: false
  });

  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [activeProvider, setActiveProvider] = useState('');

  // ==================== FUNCIONES PARA PAGOS ====================

  // Función para mostrar notificaciones
  const showNotif = useCallback((message, type = 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  }, []);

  const handleCloseNotification = useCallback(() => {
    setShowNotification(false);
  }, []);

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

  // Funciones para manejar menu de pagos completados
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

  // Calcular totales
  const calcularTotales = () => {
    if (!selectedCita) return { subtotal: 0, total: 0 };

    const precio = selectedCita.precio_servicio || selectedCita.precio || selectedCita.monto || 0;
    const subtotal = parseFloat(precio) || 0;
    const total = subtotal;

    return { subtotal, total };
  };

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

  // Procesar pago después de confirmación
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
        concepto: `Pago por servicio: ${selectedCita.servicio_nombre}`,
        metodo_pago: 'Efectivo',
        fecha_pago: paymentData.fecha_pago,
        estado: 'Pagado',
        comprobante: paymentData.referencia || `EFE-${Date.now()}`,
        notas: paymentData.notas || 'Pago procesado en efectivo'
      };

      const response = await axios.post('https://back-end-4803.onrender.com/api/Finanzas/Pagos/upsert', pagoCompleto);

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
      ordenarPor: 'deuda_desc'
    });
  };

  // Filtrar listas
  const filtrarPacientes = (lista, tipo = 'deudas') => {
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

      return true;
    }).sort((a, b) => {
      const montoA = tipo === 'deudas' ? a.totalDeuda : a.totalPagado;
      const montoB = tipo === 'deudas' ? b.totalDeuda : b.totalPagado;

      switch (filtros.ordenarPor) {
        case 'deuda_asc': return montoA - montoB;
        case 'deuda_desc': return montoB - montoA;
        case 'nombre': return `${a.nombre} ${a.apellido_paterno}`.localeCompare(`${b.nombre} ${b.apellido_paterno}`);
        default: return montoB - montoA;
      }
    });
  };

  const pacientesFiltradosDeudas = filtrarPacientes(pacientesConDeudas, 'deudas');
  const pacientesFiltradosPagados = filtrarPacientes(pacientesPagados, 'pagados');

  // Estadísticas
  const estadisticas = {
    totalDeudas: pacientesFiltradosDeudas.reduce((sum, p) => sum + p.totalDeuda, 0),
    totalPagados: pacientesFiltradosPagados.reduce((sum, p) => sum + p.totalPagado, 0),
    pacientesConDeudas: pacientesFiltradosDeudas.length,
    pacientesPagados: pacientesFiltradosPagados.length
  };

  // ==================== FUNCIONES PARA CONFIGURACIÓN ====================

  // Cargar configuración actual
  useEffect(() => {
    if (mainActiveTab === 1) {
      loadConfiguration();
    }
  }, [mainActiveTab]);

  const loadConfiguration = async () => {
    try {
      setConfigLoading(true);
      const response = await axios.get('https://back-end-4803.onrender.com/api/Finanzas/config');

      console.log('Respuesta del backend:', response.data); // Debug

      if (response.data) {
        // CORRECCIÓN: Mapear correctamente la estructura del backend
        const backendData = response.data;

        // Si viene en format response.data.config
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

        console.log('Config establecida:', {
          mercadopago: {
            enabled: configData.mercadopago?.enabled || false,
            access_token: configData.mercadopago?.access_token ? '***PRESENTE***' : 'VACÍO',
            public_key: configData.mercadopago?.public_key ? '***PRESENTE***' : 'VACÍO'
          },
          paypal: {
            enabled: configData.paypal?.enabled || false,
            client_id: configData.paypal?.client_id ? '***PRESENTE***' : 'VACÍO'
          }
        }); // Debug
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      showNotif('Error al cargar la configuración', 'error');
    } finally {
      setConfigLoading(false);
    }
  };

  // Actualizar configuración específica
  const updateConfig = (provider, field, value) => {
    setConfig(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
  };

  // Guardar configuración
  const saveConfiguration = async () => {
    try {
      setSaving(true);

      // CORRECCIÓN: Enviar en el formato que espera el backend
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
      console.log('Enviando configuración:', configData);
      await axios.put('https://back-end-4803.onrender.com/api/Finanzas/config', configData);
      showNotif('Configuración guardada exitosamente', 'success');
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      showNotif('Error al guardar la configuración', 'error');
    } finally {
      setSaving(false);
    }
  };
  // Probar conexión
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

  // Copiar al portapapeles
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showNotif(`${label} copiado al portapapeles`, 'success');
  };

  // Toggle visibilidad de credenciales
  const toggleCredentialVisibility = (key) => {
    setShowCredentials(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // ==================== RENDERS ====================

  // Render de estadísticas
  const renderEstadisticas = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={6} md={3}>
        <Card elevation={0} sx={{
          p: 2,
          bgcolor: colors.cardBg,
          borderRadius: 2,
          border: `1px solid ${colors.cardBorder}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" color={colors.error}>
                {estadisticas.pacientesConDeudas}
              </Typography>
              <Typography variant="body2" color={colors.textSecondary}>
                Deudas pendientes
              </Typography>
            </Box>
            <Warning sx={{ fontSize: 32, color: colors.error }} />
          </Box>
        </Card>
      </Grid>
      <Grid item xs={6} md={3}>
        <Card elevation={0} sx={{
          p: 2,
          bgcolor: colors.cardBg,
          borderRadius: 2,
          border: `1px solid ${colors.cardBorder}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" color={colors.success}>
                {estadisticas.pacientesPagados}
              </Typography>
              <Typography variant="body2" color={colors.textSecondary}>
                Pagos completados
              </Typography>
            </Box>
            <CheckCircle sx={{ fontSize: 32, color: colors.success }} />
          </Box>
        </Card>
      </Grid>
      <Grid item xs={6} md={3}>
        <Card elevation={0} sx={{
          p: 2,
          bgcolor: colors.cardBg,
          borderRadius: 2,
          border: `1px solid ${colors.cardBorder}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" color={colors.error}>
                ${estadisticas.totalDeudas.toLocaleString()}
              </Typography>
              <Typography variant="body2" color={colors.textSecondary}>
                Total adeudado
              </Typography>
            </Box>
            <TrendingUp sx={{ fontSize: 32, color: colors.error }} />
          </Box>
        </Card>
      </Grid>
      <Grid item xs={6} md={3}>
        <Card elevation={0} sx={{
          p: 2,
          bgcolor: colors.cardBg,
          borderRadius: 2,
          border: `1px solid ${colors.cardBorder}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" color={colors.success}>
                ${estadisticas.totalPagados.toLocaleString()}
              </Typography>
              <Typography variant="body2" color={colors.textSecondary}>
                Total recaudado
              </Typography>
            </Box>
            <AttachMoney sx={{ fontSize: 32, color: colors.success }} />
          </Box>
        </Card>
      </Grid>
    </Grid>
  );

  // Render de lista de pacientes
  const renderPacientesList = () => (
    <Box>
      {/* Barra de búsqueda */}
      <Paper elevation={0} sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        bgcolor: colors.paper,
        border: `1px solid ${colors.cardBorder}`
      }}>
        <TextField
          fullWidth
          placeholder="Buscar paciente por nombre, teléfono o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            '& .MuiInputBase-root': {
              color: colors.text,
              backgroundColor: colors.inputBg
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
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: colors.textSecondary }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchTerm('')} size="small">
                  <Close sx={{ color: colors.textSecondary }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Tabs */}
      <Paper elevation={0} sx={{
        mb: 2,
        borderRadius: 2,
        bgcolor: colors.paper,
        border: `1px solid ${colors.cardBorder}`
      }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{
            borderBottom: `1px solid ${colors.cardBorder}`,
            '& .MuiTab-root': {
              color: colors.textSecondary,
              '&.Mui-selected': {
                color: colors.primary,
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: colors.primary,
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
          <Box sx={{ p: 2, borderTop: `1px solid ${colors.cardBorder}` }}>
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
                      backgroundColor: colors.inputBg
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
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: colors.textSecondary,
                    },
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
                      backgroundColor: colors.inputBg
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
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: colors.textSecondary,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ color: colors.textSecondary }}>Ordenar por</InputLabel>
                  <Select
                    value={filtros.ordenarPor}
                    onChange={(e) => setFiltros(prev => ({ ...prev, ordenarPor: e.target.value }))}
                    label="Ordenar por"
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
                    <MenuItem value="deuda_desc">Mayor monto</MenuItem>
                    <MenuItem value="deuda_asc">Menor monto</MenuItem>
                    <MenuItem value="nombre">Nombre A-Z</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setFiltros({ montoMin: '', montoMax: '', ordenarPor: 'deuda_desc' })}
                  sx={{
                    color: colors.primary,
                    borderColor: colors.primary,
                    '&:hover': {
                      borderColor: colors.primary,
                      backgroundColor: colors.hover,
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
        <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? "contained" : "outlined"}
            size="small"
            sx={{
              color: showFilters ? colors.paper : colors.primary,
              borderColor: colors.primary,
              backgroundColor: showFilters ? colors.primary : 'transparent',
              '&:hover': {
                borderColor: colors.primary,
                backgroundColor: showFilters ? colors.primary : colors.hover,
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
            sx={{
              color: colors.primary,
              borderColor: colors.primary,
              '&:hover': {
                borderColor: colors.primary,
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
        borderRadius: 2,
        minHeight: 400,
        bgcolor: colors.paper,
        border: `1px solid ${colors.cardBorder}`
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: colors.primary }} />
          </Box>
        ) : (
          <>
            {/* Tab Deudas */}
            {activeTab === 0 && (
              <Box>
                {pacientesFiltradosDeudas.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <CheckCircle sx={{ fontSize: 64, color: colors.success, mb: 2 }} />
                    <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
                      No hay deudas pendientes
                    </Typography>
                    <Typography variant="body2" color={colors.textSecondary}>
                      Todos los pacientes están al día con sus pagos
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {pacientesFiltradosDeudas.map((paciente) => (
                      <Grid item xs={12} md={6} key={paciente.paciente_id}>
                        <Card
                          elevation={0}
                          sx={{
                            p: 2,
                            border: `1px solid ${colors.cardBorder}`,
                            borderRadius: 2,
                            cursor: 'pointer',
                            bgcolor: colors.paper,
                            '&:hover': {
                              borderColor: colors.primary,
                              boxShadow: 2,
                              backgroundColor: colors.hover
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
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: colors.error, mr: 2 }}>
                              {paciente.nombre.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: colors.text }}>
                                {`${paciente.nombre} ${paciente.apellido_paterno}`.trim()}
                              </Typography>
                              <Typography variant="body2" color={colors.textSecondary}>
                                {paciente.telefono}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="h6" color={colors.error} fontWeight="bold">
                                ${paciente.totalDeuda.toLocaleString()}
                              </Typography>
                              <Typography variant="caption" color={colors.textSecondary}>
                                {paciente.citasPendientes.length} servicio(s)
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {paciente.citasPendientes.slice(0, 2).map((cita, index) => (
                              <Chip
                                key={index}
                                label={`${cita.servicio_nombre} - $${cita.precio_servicio}`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderColor: colors.error,
                                  color: colors.error,
                                  backgroundColor: colors.paper
                                }}
                              />
                            ))}
                            {paciente.citasPendientes.length > 2 && (
                              <Chip
                                label={`+${paciente.citasPendientes.length - 2} más`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderColor: colors.textSecondary,
                                  color: colors.textSecondary,
                                  backgroundColor: colors.paper
                                }}
                              />
                            )}
                          </Box>
                        </Card>
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
                    <PaidOutlined sx={{ fontSize: 64, color: colors.textSecondary, mb: 2 }} />
                    <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
                      No hay pagos registrados
                    </Typography>
                    <Typography variant="body2" color={colors.textSecondary}>
                      Aún no se han completado pagos
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {pacientesFiltradosPagados.map((paciente) => (
                      <Grid item xs={12} md={6} key={paciente.paciente_id}>
                        <Card
                          elevation={0}
                          sx={{
                            p: 2,
                            border: `1px solid ${colors.cardBorder}`,
                            borderRadius: 2,
                            cursor: 'pointer',
                            bgcolor: colors.paper,
                            '&:hover': {
                              borderColor: colors.success,
                              boxShadow: 2,
                              backgroundColor: colors.hover
                            }
                          }}
                          onClick={() => {
                            if (paciente.citasPagadas.length > 0) {
                              handleVerDetalles(paciente.citasPagadas[0], paciente);
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: colors.success, mr: 2 }}>
                              {paciente.nombre.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: colors.text }}>
                                {`${paciente.nombre} ${paciente.apellido_paterno}`.trim()}
                              </Typography>
                              <Typography variant="body2" color={colors.textSecondary}>
                                {paciente.telefono}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="h6" color={colors.success} fontWeight="bold">
                                ${paciente.totalPagado.toLocaleString()}
                              </Typography>
                              <Typography variant="caption" color={colors.textSecondary}>
                                {paciente.citasPagadas.length} servicio(s)
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                            {paciente.citasPagadas.slice(0, 2).map((cita, index) => (
                              <Chip
                                key={index}
                                label={`${cita.servicio_nombre} - $${cita.precio_servicio}`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderColor: colors.success,
                                  color: colors.success,
                                  backgroundColor: colors.paper
                                }}
                              />
                            ))}
                            {paciente.citasPagadas.length > 2 && (
                              <Chip
                                label={`+${paciente.citasPagadas.length - 2} más`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderColor: colors.textSecondary,
                                  color: colors.textSecondary,
                                  backgroundColor: colors.paper
                                }}
                              />
                            )}
                            <Tooltip title="Más opciones">
                              <IconButton
                                size="small"
                                sx={{ ml: 1, color: colors.textSecondary }}
                                onClick={(e) => handleMenuClick(e, paciente.citasPagadas[0], paciente)}
                              >
                                <MoreVert sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}

            {/* Tab Buscar */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
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
                          backgroundColor: colors.inputBg
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
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: colors.textSecondary,
                        },
                      }}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search sx={{ color: colors.textSecondary }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Avatar sx={{ bgcolor: colors.primary, mr: 2 }}>
                        {(option.nombre || 'P').charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ color: colors.text }}>
                          {`${option.nombre || ''} ${option.aPaterno || ''} ${option.aMaterno || ''}`.trim()}
                        </Typography>
                        <Typography variant="body2" color={colors.textSecondary}>
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
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );

  // Render de formulario de pago - SIMPLIFICADO SOLO EFECTIVO
  const renderProcesarPago = () => {
    const totales = calcularTotales();

    return (
      <Container maxWidth="md">
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => setCurrentStep('selection')}
            sx={{ mb: 2, color: colors.primary }}
          >
            Volver
          </Button>
          <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: colors.text }}>
            Procesar Pago
          </Typography>
        </Box>

        <Stepper activeStep={1} alternativeLabel sx={{ mb: 4 }}>
          <Step>
            <StepLabel sx={{ '& .MuiStepLabel-label': { color: colors.textSecondary } }}>
              Seleccionar Paciente
            </StepLabel>
          </Step>
          <Step>
            <StepLabel sx={{ '& .MuiStepLabel-label': { color: colors.text } }}>
              Procesar Pago
            </StepLabel>
          </Step>
          <Step>
            <StepLabel sx={{ '& .MuiStepLabel-label': { color: colors.textSecondary } }}>
              Confirmación
            </StepLabel>
          </Step>
        </Stepper>

        <Grid container spacing={3}>
          {/* Información del paciente */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{
              p: 3,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 2,
              bgcolor: colors.paper
            }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: colors.text }}>
                Información del Paciente
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: colors.primary, mr: 2, width: 56, height: 56 }}>
                  {selectedPaciente?.nombre.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: colors.text }}>
                    {selectedPaciente?.nombre} {selectedPaciente?.aPaterno}
                  </Typography>
                  <Typography variant="body2" color={colors.textSecondary}>
                    {selectedPaciente?.telefono}
                  </Typography>
                  <Typography variant="body2" color={colors.textSecondary}>
                    {selectedPaciente?.email}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Información del servicio */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{
              p: 3,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 2,
              bgcolor: colors.paper
            }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: colors.text }}>
                Servicio a Cobrar
              </Typography>
              <Typography variant="h5" fontWeight="bold" color={colors.primary} gutterBottom>
                {selectedCita?.servicio_nombre}
              </Typography>
              <Typography variant="body2" color={colors.textSecondary} gutterBottom>
                <strong>Fecha:</strong> {new Date(selectedCita?.fecha_consulta).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color={colors.textSecondary} gutterBottom>
                <strong>Doctor:</strong> {selectedCita?.odontologo_nombre}
              </Typography>
              <Typography variant="h3" color={colors.success} fontWeight="bold" sx={{ mt: 2 }}>
                ${selectedCita?.precio_servicio.toLocaleString()}
              </Typography>
            </Card>
          </Grid>

          {/* Formulario de pago - SOLO EFECTIVO */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{
              p: 3,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 2,
              bgcolor: colors.paper
            }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: colors.text }}>
                Método de Pago
              </Typography>

              {/* Solo mostrar método efectivo */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      border: `2px solid ${colors.success}`,
                      borderRadius: 2,
                      bgcolor: `${colors.success}15`,
                    }}
                  >
                    <AccountBalanceWallet sx={{ fontSize: 48, color: colors.success, mb: 2 }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ color: colors.text }}>
                      Pago en Efectivo
                    </Typography>
                    <Typography variant="body2" color={colors.textSecondary}>
                      El paciente paga con dinero en efectivo
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

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
                        backgroundColor: colors.inputBg
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
                      label="Fecha y Hora del Pago"
                      value={paymentData.fecha_pago}
                      onChange={(date) => setPaymentData(prev => ({ ...prev, fecha_pago: date }))}
                      renderInput={(params) => <TextField
                        {...params}
                        fullWidth
                        sx={{
                          '& .MuiInputBase-root': {
                            color: colors.text,
                            backgroundColor: colors.inputBg
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
                    placeholder="Observaciones adicionales sobre el pago..."
                    sx={{
                      '& .MuiInputBase-root': {
                        color: colors.text,
                        backgroundColor: colors.inputBg
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
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: colors.textSecondary,
                      },
                    }}
                  />
                </Grid>
              </Grid>

              {/* Resumen */}
              <Card elevation={0} sx={{
                p: 3,
                bgcolor: colors.cardBg,
                borderRadius: 2,
                mb: 3,
                border: `1px solid ${colors.primary}`
              }}>
                <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: colors.text }}>
                  Resumen del Pago
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ color: colors.text }}>
                    Total a Pagar:
                  </Typography>
                  <Typography variant="h4" color={colors.primary} fontWeight="bold">
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
                    borderColor: colors.textSecondary,
                    '&:hover': {
                      borderColor: colors.textSecondary,
                      backgroundColor: colors.hover,
                    },
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={handleProcesarPago}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} /> : <Payment />}
                  sx={{
                    backgroundColor: colors.primary,
                    color: colors.paper,
                    '&:hover': {
                      backgroundColor: colors.primaryLight,
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
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CheckCircle sx={{ fontSize: 80, color: colors.success, mb: 3 }} />
        <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: colors.text }}>
          Pago Procesado Exitosamente
        </Typography>
        <Typography variant="body1" color={colors.textSecondary} gutterBottom>
          El pago ha sido registrado correctamente en el sistema
        </Typography>

        <Card elevation={0} sx={{
          p: 3,
          mt: 3,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 2,
          bgcolor: colors.paper
        }}>
          <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: colors.text }}>
            Resumen de la Transacción
          </Typography>
          <Divider sx={{ mb: 2, borderColor: colors.cardBorder }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color={colors.textSecondary}>
                Paciente:
              </Typography>
              <Typography variant="body1" fontWeight="bold" sx={{ color: colors.text }}>
                {selectedPaciente?.nombre} {selectedPaciente?.aPaterno}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color={colors.textSecondary}>
                Servicio:
              </Typography>
              <Typography variant="body1" fontWeight="bold" sx={{ color: colors.text }}>
                {selectedCita?.servicio_nombre}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color={colors.textSecondary}>
                Método:
              </Typography>
              <Typography variant="body1" fontWeight="bold" sx={{ color: colors.text }}>
                Efectivo
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color={colors.textSecondary}>
                Monto:
              </Typography>
              <Typography variant="h6" fontWeight="bold" color={colors.success}>
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
              '&:hover': {
                borderColor: colors.primary,
                backgroundColor: colors.hover,
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
              color: colors.paper,
              '&:hover': {
                backgroundColor: colors.primaryLight,
              },
            }}
          >
            Imprimir Recibo
          </Button>
        </Box>
      </Box>
    </Container>
  );

  // Renderizar card de configuración para MercadoPago
  const renderMercadoPagoConfig = () => (
    <Card elevation={0} sx={{
      border: `1px solid ${colors.cardBorder}`,
      borderRadius: 2,
      bgcolor: colors.paper
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CreditCard sx={{ color: '#00b0ff', fontSize: 32, mr: 2 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: colors.text }}>
                MercadoPago
              </Typography>
              <Typography variant="body2" color={colors.textSecondary}>
                Configuración para pagos con MercadoPago
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
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: colors.textSecondary }}>Modo de Operación</InputLabel>
                  <Select
                    value={config.mercadopago.mode}
                    onChange={(e) => updateConfig('mercadopago', 'mode', e.target.value)}
                    label="Modo de Operación"
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
                    <MenuItem value="sandbox">Sandbox (Pruebas)</MenuItem>
                    <MenuItem value="live">Live (Producción)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Access Token"
                  type={showCredentials.mercadopago_token ? "text" : "password"}
                  value={config.mercadopago.access_token}
                  onChange={(e) => updateConfig('mercadopago', 'access_token', e.target.value)}
                  placeholder="TEST-123456789... o APP-123456789..."
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
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={() => toggleCredentialVisibility('mercadopago_token')}
                          size="small"
                        >
                          {showCredentials.mercadopago_token ?
                            <VisibilityOff sx={{ color: colors.textSecondary }} /> :
                            <Visibility sx={{ color: colors.textSecondary }} />
                          }
                        </IconButton>
                        {config.mercadopago.access_token && (
                          <IconButton
                            onClick={() => copyToClipboard(config.mercadopago.access_token, 'Access Token')}
                            size="small"
                          >
                            <ContentCopy sx={{ color: colors.textSecondary }} />
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
                  label="Public Key"
                  value={config.mercadopago.public_key}
                  onChange={(e) => updateConfig('mercadopago', 'public_key', e.target.value)}
                  placeholder="TEST-123456789... o APP-123456789..."
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
                    endAdornment: config.mercadopago.public_key && (
                      <IconButton
                        onClick={() => copyToClipboard(config.mercadopago.public_key, 'Public Key')}
                        size="small"
                      >
                        <ContentCopy sx={{ color: colors.textSecondary }} />
                      </IconButton>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Webhook URL (Opcional)"
                  value={config.mercadopago.webhook_url}
                  onChange={(e) => updateConfig('mercadopago', 'webhook_url', e.target.value)}
                  placeholder="https://tudominio.com/api/webhooks/mercadopago"
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
                        <Link sx={{ color: colors.textSecondary }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={testing.mercadopago ? <CircularProgress size={16} /> : <Biotech />}
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

                  <Alert severity="info" sx={{ flex: 1 }}>
                    <Typography variant="caption">
                      Para obtener las credenciales, visita tu cuenta de MercadoPago → Desarrolladores → Credenciales
                    </Typography>
                  </Alert>
                </Box>
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
      borderRadius: 2,
      bgcolor: colors.paper
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccountBalance sx={{ color: '#0070ba', fontSize: 32, mr: 2 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: colors.text }}>
                PayPal
              </Typography>
              <Typography variant="body2" color={colors.textSecondary}>
                Configuración para pagos con PayPal
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
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: colors.textSecondary }}>Modo de Operación</InputLabel>
                  <Select
                    value={config.paypal.mode}
                    onChange={(e) => updateConfig('paypal', 'mode', e.target.value)}
                    label="Modo de Operación"
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
                    <MenuItem value="sandbox">Sandbox (Pruebas)</MenuItem>
                    <MenuItem value="live">Live (Producción)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Client ID"
                  type={showCredentials.paypal_id ? "text" : "password"}
                  value={config.paypal.client_id}
                  onChange={(e) => updateConfig('paypal', 'client_id', e.target.value)}
                  placeholder="AYaRi5dbGmcaSuvEz..."
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
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={() => toggleCredentialVisibility('paypal_id')}
                          size="small"
                        >
                          {showCredentials.paypal_id ?
                            <VisibilityOff sx={{ color: colors.textSecondary }} /> :
                            <Visibility sx={{ color: colors.textSecondary }} />
                          }
                        </IconButton>
                        {config.paypal.client_id && (
                          <IconButton
                            onClick={() => copyToClipboard(config.paypal.client_id, 'Client ID')}
                            size="small"
                          >
                            <ContentCopy sx={{ color: colors.textSecondary }} />
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
                  label="Client Secret"
                  type={showCredentials.paypal_secret ? "text" : "password"}
                  value={config.paypal.client_secret}
                  onChange={(e) => updateConfig('paypal', 'client_secret', e.target.value)}
                  placeholder="EHJtX2KQPg3Uo..."
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
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={() => toggleCredentialVisibility('paypal_secret')}
                          size="small"
                        >
                          {showCredentials.paypal_secret ?
                            <VisibilityOff sx={{ color: colors.textSecondary }} /> :
                            <Visibility sx={{ color: colors.textSecondary }} />
                          }
                        </IconButton>
                        {config.paypal.client_secret && (
                          <IconButton
                            onClick={() => copyToClipboard(config.paypal.client_secret, 'Client Secret')}
                            size="small"
                          >
                            <ContentCopy sx={{ color: colors.textSecondary }} />
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
                  label="Webhook URL (Opcional)"
                  value={config.paypal.webhook_url}
                  onChange={(e) => updateConfig('paypal', 'webhook_url', e.target.value)}
                  placeholder="https://tudominio.com/api/webhooks/paypal"
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
                        <Link sx={{ color: colors.textSecondary }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={testing.paypal ? <CircularProgress size={16} /> : <Biotech />}
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

                  <Alert severity="info" sx={{ flex: 1 }}>
                    <Typography variant="caption">
                      Para obtener las credenciales, visita PayPal Developer → My Apps & Credentials
                    </Typography>
                  </Alert>
                </Box>
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
      borderRadius: 2,
      bgcolor: colors.paper,
      mb: 3
    }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ color: colors.text, mb: 2 }}>
          Estado de Métodos de Pago
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: colors.cardBg, borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MonetizationOn sx={{ color: colors.success, mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: colors.text }}>
                  Efectivo
                </Typography>
              </Box>
              <Chip label="Siempre Activo" color="success" size="small" />
              <Typography variant="caption" display="block" color={colors.textSecondary} sx={{ mt: 1 }}>
                Pagos presenciales en la clínica
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: colors.cardBg, borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CreditCard sx={{ color: '#00b0ff', mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: colors.text }}>
                  MercadoPago
                </Typography>
              </Box>
              <Chip
                label={config.mercadopago.enabled ? "Configurado" : "Inactivo"}
                color={config.mercadopago.enabled ? "success" : "default"}
                size="small"
              />
              <Typography variant="caption" display="block" color={colors.textSecondary} sx={{ mt: 1 }}>
                Modo: {config.mercadopago.mode === 'sandbox' ? 'Pruebas' : 'Producción'}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: colors.cardBg, borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance sx={{ color: '#0070ba', mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: colors.text }}>
                  PayPal
                </Typography>
              </Box>
              <Chip
                label={config.paypal.enabled ? "Configurado" : "Inactivo"}
                color={config.paypal.enabled ? "success" : "default"}
                size="small"
              />
              <Typography variant="caption" display="block" color={colors.textSecondary} sx={{ mt: 1 }}>
                Modo: {config.paypal.mode === 'sandbox' ? 'Pruebas' : 'Producción'}
              </Typography>
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
        <Typography variant="h3" gutterBottom fontWeight="bold" sx={{ color: colors.text }}>
          Gestión de Finanzas
        </Typography>
        <Typography variant="h6" color={colors.textSecondary}>
          Sistema de pagos y configuración
        </Typography>
      </Box>

      {/* Tabs principales */}
      <Paper elevation={0} sx={{
        mb: 3,
        borderRadius: 2,
        bgcolor: colors.paper,
        border: `1px solid ${colors.cardBorder}`
      }}>
        <Tabs
          value={mainActiveTab}
          onChange={(e, v) => setMainActiveTab(v)}
          variant="fullWidth"
          sx={{
            borderBottom: `1px solid ${colors.cardBorder}`,
            '& .MuiTab-root': {
              color: colors.textSecondary,
              '&.Mui-selected': {
                color: colors.primary,
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: colors.primary,
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
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: colors.primary }} />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {/* Resumen de estado */}
                  <Grid item xs={12}>
                    {renderStatusSummary()}
                  </Grid>

                  {/* Configuración MercadoPago */}
                  <Grid item xs={12}>
                    {renderMercadoPagoConfig()}
                  </Grid>

                  {/* Configuración PayPal */}
                  <Grid item xs={12}>
                    {renderPayPalConfig()}
                  </Grid>

                  {/* Botones de acción */}
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
                          '&:hover': {
                            borderColor: colors.primary,
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
                        startIcon={saving ? <CircularProgress size={16} /> : <Save />}
                        sx={{
                          backgroundColor: colors.primary,
                          color: colors.paper,
                          '&:hover': {
                            backgroundColor: colors.primaryLight,
                          },
                        }}
                      >
                        {saving ? 'Guardando...' : 'Guardar Configuración'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
        </Box>
      </Fade>

      {/* Diálogo de confirmación de pago */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold" sx={{ color: colors.text }}>
            Confirmar Pago
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Confirme que desea procesar este pago
          </Alert>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom sx={{ color: colors.text }}>
              <strong>Paciente:</strong> {selectedPaciente?.nombre} {selectedPaciente?.aPaterno}
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ color: colors.text }}>
              <strong>Servicio:</strong> {selectedCita?.servicio_nombre}
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ color: colors.text }}>
              <strong>Método:</strong> Efectivo
            </Typography>
            <Typography variant="h6" color={colors.primary} fontWeight="bold">
              <strong>Total:</strong> ${calcularTotales().total.toLocaleString()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)} variant="outlined" sx={{ color: colors.textSecondary, borderColor: colors.textSecondary }}>
            Cancelar
          </Button>
          <Button
            onClick={procesarPagoConfirmado}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <CheckCircle />}
            sx={{
              backgroundColor: colors.primary,
              color: colors.paper,
              '&:hover': {
                backgroundColor: colors.primaryLight,
              },
            }}
          >
            {loading ? 'Procesando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de cancelación */}
      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold" sx={{ color: colors.text }}>
            Confirmar Cancelación
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            ¿Desea cancelar el proceso de pago?
          </Alert>
          <Typography variant="body1" sx={{ color: colors.text }}>
            Se perderán todos los datos ingresados en el formulario.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)} variant="outlined" sx={{ color: colors.textSecondary, borderColor: colors.textSecondary }}>
            Continuar
          </Button>
          <Button onClick={confirmCancel} color="error" variant="contained">
            Cancelar Proceso
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de detalles de pago */}
      <Dialog
        open={showPaymentDetails}
        onClose={() => setShowPaymentDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold" sx={{ color: colors.text }}>
            Detalles del Pago
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedPaymentDetails && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ p: 2, bgcolor: colors.cardBg, borderRadius: 2 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ color: colors.text }}>
                    Información del Paciente
                  </Typography>
                  <Typography variant="body2" gutterBottom sx={{ color: colors.text }}>
                    <strong>Nombre:</strong> {`${selectedPaymentDetails.paciente.nombre} ${selectedPaymentDetails.paciente.apellido_paterno}`.trim()}
                  </Typography>
                  <Typography variant="body2" gutterBottom sx={{ color: colors.text }}>
                    <strong>Teléfono:</strong> {selectedPaymentDetails.paciente.telefono || 'No disponible'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    <strong>Email:</strong> {selectedPaymentDetails.paciente.correo || 'No disponible'}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ p: 2, bgcolor: colors.cardBg, borderRadius: 2 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ color: colors.text }}>
                    Información del Pago
                  </Typography>
                  <Typography variant="body2" gutterBottom sx={{ color: colors.text }}>
                    <strong>Monto:</strong> ${parseFloat(selectedPaymentDetails.pago.total).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" gutterBottom sx={{ color: colors.text }}>
                    <strong>Método:</strong> {selectedPaymentDetails.pago.metodo_pago}
                  </Typography>
                  <Typography variant="body2" gutterBottom sx={{ color: colors.text }}>
                    <strong>Fecha:</strong> {new Date(selectedPaymentDetails.pago.fecha_pago).toLocaleDateString('es-ES')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    <strong>Estado:</strong> {selectedPaymentDetails.pago.estado}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPaymentDetails(false)} variant="outlined" sx={{ color: colors.textSecondary, borderColor: colors.textSecondary }}>
            Cerrar
          </Button>
          <Button startIcon={<PrintOutlined />} variant="contained" sx={{ backgroundColor: colors.primary, color: colors.paper }}>
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
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {testResults?.success ? (
              <CheckCircle sx={{ color: colors.success, mr: 2 }} />
            ) : (
              <Error sx={{ color: colors.error, mr: 2 }} />
            )}
            <Typography variant="h6" fontWeight="bold" sx={{ color: colors.text }}>
              Resultado de Prueba - {activeProvider}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {testResults && (
            <Box>
              <Alert severity={testResults.success ? "success" : "error"} sx={{ mb: 2 }}>
                {testResults.message}
              </Alert>

              {testResults.details && Object.keys(testResults.details).length > 0 && (
                <Card elevation={0} sx={{ p: 2, bgcolor: colors.cardBg, borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold" sx={{ color: colors.text }}>
                    Detalles de la Conexión:
                  </Typography>
                  {Object.entries(testResults.details).map(([key, value]) => (
                    <Typography key={key} variant="body2" sx={{ color: colors.text, mb: 1 }}>
                      <strong>{key}:</strong> {String(value)}
                    </Typography>
                  ))}
                </Card>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTestDialog(false)} variant="contained" sx={{ backgroundColor: colors.primary, color: colors.paper }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu contextual para pagos */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: colors.paper,
            border: `1px solid ${colors.cardBorder}`,
          }
        }}
      >
        <MenuItem onClick={() => handleMenuAction('print')}>
          <ListItemIcon><PrintOutlined sx={{ color: colors.textSecondary }} /></ListItemIcon>
          <ListItemText primary="Imprimir recibo" primaryTypographyProps={{ color: colors.text }} />
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('download')}>
          <ListItemIcon><GetApp sx={{ color: colors.textSecondary }} /></ListItemIcon>
          <ListItemText primary="Descargar PDF" primaryTypographyProps={{ color: colors.text }} />
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('copy')}>
          <ListItemIcon><FileCopy sx={{ color: colors.textSecondary }} /></ListItemIcon>
          <ListItemText primary="Copiar comprobante" primaryTypographyProps={{ color: colors.text }} />
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