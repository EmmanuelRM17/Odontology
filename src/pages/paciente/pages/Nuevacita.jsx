import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl,
    InputLabel, Select, MenuItem, Grid, Typography, FormHelperText, Box, CircularProgress,
    Divider, Alert, AlertTitle, Step, StepLabel, Stepper, Paper, Chip, IconButton,
    alpha, Radio, RadioGroup, FormControlLabel, Card, CardContent, Container,
    InputAdornment, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';

import {
  CalendarMonth,
  Person,
  EventAvailable,
  Checklist,
  Search,
  ArrowBackIosNew,
  CheckCircle,
  PersonAdd,
  Close,
  Event as EventIcon,  
  HealthAndSafety,
  AccessTime,
  ArrowForwardIos,
  ArrowBack,
  MedicalServices,
  CleaningServices,
  Face,
  Spa,
  Bloodtype,
  MedicalInformation,
  Apps,
  Category,
  InfoOutlined,
  Update,
  Schedule,
} from '@mui/icons-material';

import { useThemeContext } from '../../../components/Tools/ThemeContext';
import { useAuth } from '../../../components/Tools/AuthContext';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import moment from 'moment-timezone';
import Notificaciones from '../../../components/Layout/Notificaciones';

// Componente Dialog para agendar citas (vista del paciente)
const AgendarCitaDialog = ({ open, onClose, onSuccess }) => {
    const { isDarkTheme } = useThemeContext();
    const { user } = useAuth();

    // Estados comunes
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [servicios, setServicios] = useState([]);
    const [odontologos, setOdontologos] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTratamiento, setIsTratamiento] = useState(false);
    const [isStepValid, setIsStepValid] = useState(false);
    const [filtroServicio, setFiltroServicio] = useState('todos');
    const [notification, setNotification] = useState({ open: false, message: '', type: '' });

    // Estados específicos para citas
    const [selectedDate, setSelectedDate] = useState(null);
    const [workDays, setWorkDays] = useState([]);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [occupiedTimes, setOccupiedTimes] = useState([]);

    // Función corregida para manejar el cierre de notificaciones
    const handleNotificationClose = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    // Estado del formulario
    const [formData, setFormData] = useState({
        // Datos del paciente (se llenan automáticamente)
        paciente_id: user?.id || '',
        paciente_nombre: user?.nombre || '',
        paciente_apellido_paterno: user?.aPaterno || '',
        paciente_apellido_materno: user?.aMaterno || '',
        paciente_genero: user?.genero || '',
        paciente_fecha_nacimiento: user?.fechaNacimiento ? new Date(user.fechaNacimiento) : null,
        paciente_telefono: user?.telefono || '',
        paciente_correo: user?.email || '',

        // Datos de la cita
        servicios_seleccionados: [],
        odontologo_id: '',
        notas: '',
        fecha_consulta: null,
        hora_consulta: null,
        estado: 'Pendiente',

        // Datos específicos de tratamiento
        nombre_tratamiento: '',
        fecha_inicio: null,
        fecha_estimada_fin: null,
        total_citas_programadas: 1,
        costo_total: 0
    });

    // Estados de validación
    const [formErrors, setFormErrors] = useState({
        servicios_seleccionados: false,
        odontologo_id: false,
        fecha_consulta: false,
        hora_consulta: false,
        nombre_tratamiento: false,
        fecha_inicio: false,
        total_citas_programadas: false
    });

    // Pasos simplificados para pacientes
    const steps = ['Elegir Servicio', 'Programar Cita', 'Confirmar'];

    // Colores del tema
    const colors = {
        background: isDarkTheme ? '#0D1B2A' : '#ffffff',
        primary: isDarkTheme ? '#00BCD4' : '#03427C',
        text: isDarkTheme ? '#ffffff' : '#1a1a1a',
        cardBg: isDarkTheme ? '#1A2735' : '#ffffff',
        step: isDarkTheme ? '#00BCD4' : '#2196f3',
        success: '#4CAF50',
        warning: '#FFA726',
        error: '#E53935',
        info: '#03A9F4',
        purple: '#9C27B0',
    };

    // Cargar datos al inicializar
    useEffect(() => {
        if (open && user?.id) {
            resetForm();
            fetchServicios();
            fetchOdontologos();
        }
    }, [open, user]);

    // Verificar validez del paso actual
    useEffect(() => {
        validateStepAsync();
    }, [activeStep, formData]);

    // Resetear formulario al abrir/cerrar
    const resetForm = () => {
        setFormData({
            paciente_id: user?.id || '',
            paciente_nombre: user?.nombre || '',
            paciente_apellido_paterno: user?.aPaterno || '',
            paciente_apellido_materno: user?.aMaterno || '',
            paciente_genero: user?.genero || '',
            paciente_fecha_nacimiento: user?.fechaNacimiento ? new Date(user.fechaNacimiento) : null,
            paciente_telefono: user?.telefono || '',
            paciente_correo: user?.email || '',
            servicios_seleccionados: [],
            odontologo_id: '',
            fecha_consulta: null,
            hora_consulta: null,
            estado: 'Pendiente',
            notas: '',
            nombre_tratamiento: '',
            fecha_inicio: null,
            fecha_estimada_fin: null,
            total_citas_programadas: 1,
            costo_total: 0
        });

        setFormErrors({
            servicios_seleccionados: false,
            odontologo_id: false,
            fecha_consulta: false,
            hora_consulta: false,
            nombre_tratamiento: false,
            fecha_inicio: false,
            total_citas_programadas: false
        });

        setActiveStep(0);
        setError('');
        setSelectedDate(null);
        setIsTratamiento(false);
        setIsStepValid(false);
    };

    // Fetching de servicios
    const fetchServicios = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://back-end-4803.onrender.com/api/servicios/all');
            if (!response.ok) throw new Error('Error al cargar servicios');
            const data = await response.json();
            setServicios(data);
        } catch (error) {
            console.error('Error:', error);
            setError('Error al cargar la lista de servicios');
        } finally {
            setLoading(false);
        }
    };

    // Fetching de odontólogos
    const fetchOdontologos = async () => {
        try {
            const response = await fetch('https://back-end-4803.onrender.com/api/empleados/odontologos/activos');
            if (!response.ok) throw new Error('Error al cargar odontólogos');
            const data = await response.json();
            setOdontologos(data);

            // Si solo hay un odontólogo, seleccionarlo automáticamente
            if (data.length === 1) {
                const odontologo = data[0];
                setFormData(prev => ({
                    ...prev,
                    odontologo_id: odontologo.id
                }));
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error al cargar la lista de odontólogos');
        }
    };

    // Obtener días laborables del odontólogo
    useEffect(() => {
        if (!formData.odontologo_id) return;
        setIsLoading(true);

        axios.get(`https://back-end-4803.onrender.com/api/horarios/dias_laborales?odontologo_id=${formData.odontologo_id}`)
            .then((response) => {
                const daysMap = {
                    'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miércoles': 3,
                    'Jueves': 4, 'Viernes': 5, 'Sábado': 6
                };
                const availableDays = response.data.map(day => daysMap[day]);
                setWorkDays(availableDays);
            })
            .catch((error) => {
                console.error('Error fetching working days:', error);
                setError('Error al obtener los días laborales del odontólogo.');
            })
            .finally(() => setIsLoading(false));
    }, [formData.odontologo_id]);

    // Fetch horarios disponibles para una fecha
    const fetchAvailableTimes = (date) => {
        if (!(date instanceof Date) || isNaN(date)) {
            console.error('Fecha no válida para obtener horarios:', date);
            return;
        }

        const formattedDate = date.toISOString().split('T')[0];
        setIsLoading(true);

        axios.get(`https://back-end-4803.onrender.com/api/horarios/disponibilidad?odontologo_id=${formData.odontologo_id}&fecha=${formattedDate}`)
            .then((response) => {
                const disponibles = [];
                const ocupados = [];

                response.data.forEach((franja) => {
                    if (franja.slots_disponibles) {
                        Object.entries(franja.slots_disponibles).forEach(([timeSlot, isAvailable]) => {
                            if (isAvailable) {
                                disponibles.push(timeSlot);
                            } else {
                                ocupados.push(timeSlot);
                            }
                        });
                    }
                });

                disponibles.sort();
                ocupados.sort();

                setAvailableTimes(disponibles);
                setOccupiedTimes(ocupados);
            })
            .catch((error) => {
                console.error('Error al obtener horarios disponibles:', error);
                setError('Error al obtener los horarios disponibles.');
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        if (formData.servicios_seleccionados.length > 0) {
            setFormErrors(prev => ({
                ...prev,
                servicios_seleccionados: false
            }));
        }
    }, [formData.servicios_seleccionados]);

    // Handler para selección de fecha
    const handleDateSelection = (date) => {
        setSelectedDate(date);

        if (isTratamiento) {
            setFormData(prev => ({
                ...prev,
                fecha_inicio: date,
                fecha_consulta: date
            }));

            const endDate = new Date(date);
            endDate.setMonth(endDate.getMonth() + (formData.total_citas_programadas - 1));

            setFormData(prev => ({
                ...prev,
                fecha_estimada_fin: endDate
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                fecha_consulta: date
            }));
        }

        if (formErrors.fecha_consulta) {
            setFormErrors(prev => ({
                ...prev,
                fecha_consulta: false
            }));
        }

        if (formData.odontologo_id) {
            fetchAvailableTimes(date);
        }

        validateStepAsync();
    };

    // Manejar selección de servicios
    const handleServiceSelection = (servicio) => {
        const isAlreadySelected = formData.servicios_seleccionados.length > 0 &&
            formData.servicios_seleccionados[0].servicio_id === servicio.servicio_id;

        if (isAlreadySelected) {
            setFormData(prev => ({
                ...prev,
                servicios_seleccionados: [],
                nombre_tratamiento: ''
            }));
            setIsTratamiento(false);
        } else {
            const esTratamiento = servicio.tratamiento === 1;
            const citasEstimadas = parseInt(servicio.citasEstimadas || 1, 10);

            setIsTratamiento(esTratamiento);

            setFormData(prev => {
                const newData = {
                    ...prev,
                    servicios_seleccionados: [{
                        servicio_id: servicio.servicio_id || servicio.id,
                        nombre: servicio.nombre || servicio.title,
                        categoria_nombre: servicio.categoria_nombre || servicio.category || 'General',
                        precio: servicio.precio || servicio.price || 0,
                        es_tratamiento: esTratamiento,
                        citas_estimadas: citasEstimadas
                    }]
                };

                if (esTratamiento) {
                    newData.nombre_tratamiento = servicio.nombre || servicio.title || '';
                    newData.total_citas_programadas = citasEstimadas;
                    newData.costo_total = parseFloat(servicio.precio || servicio.price || 0) * citasEstimadas;
                }

                return newData;
            });
        }
    };

    // Manejar selección de odontólogo
    const handleOdontologoChange = (e) => {
        const odontologoId = e.target.value;
        setFormData(prev => ({
            ...prev,
            odontologo_id: odontologoId,
            fecha_consulta: null,
            hora_consulta: null
        }));

        setSelectedDate(null);
        setAvailableTimes([]);

        if (formErrors.odontologo_id) {
            setFormErrors(prev => ({
                ...prev,
                odontologo_id: false
            }));
        }
        validateStepAsync();
    };

    // Manejar selección de hora
    const handleHourSelection = (hora) => {
        setFormData(prev => ({
            ...prev,
            hora_consulta: hora
        }));

        if (formErrors.hora_consulta) {
            setFormErrors(prev => ({
                ...prev,
                hora_consulta: false
            }));
        }
        validateStepAsync();
    };

    // Manejar cambios generales en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: false
            }));
        }
        validateStepAsync();
    };

    // Validar el paso actual de forma asíncrona
    const validateStepAsync = () => {
        setTimeout(() => {
            const isValid = validateStep();
            setIsStepValid(isValid);
        }, 0);
    };

    // Validar el paso actual antes de avanzar
    const validateStep = () => {
        switch (activeStep) {
            case 0: // Validar datos del servicio
                if (formData.servicios_seleccionados.length === 0) {
                    setFormErrors(prev => ({ ...prev, servicios_seleccionados: true }));
                    return false;
                }
                return true;

            case 1: // Validar fechas
                if (isTratamiento) {
                    const citasErrors = {
                        odontologo_id: !formData.odontologo_id,
                        fecha_consulta: !formData.fecha_consulta,
                        hora_consulta: !formData.hora_consulta,
                        total_citas_programadas: formData.total_citas_programadas < 1
                    };

                    setFormErrors(prev => ({ ...prev, ...citasErrors }));
                    return !Object.values(citasErrors).some(error => error);
                } else {
                    const errors = {
                        odontologo_id: !formData.odontologo_id,
                        fecha_consulta: !formData.fecha_consulta,
                        hora_consulta: !formData.hora_consulta
                    };
                    setFormErrors(prev => ({ ...prev, ...errors }));
                    return !Object.values(errors).some(error => error);
                }

            default:
                return true;
        }
    };

    // Avanzar al siguiente paso
    const handleNext = () => {
        if (validateStep()) {
            setActiveStep(prev => prev + 1);
        }
    };

    // Retroceder al paso anterior
    const handleBack = () => {
        setActiveStep(prev => prev - 1);
    };

    // Formatear fecha para mostrar
    const formatDate = (date) => {
        if (!date) return 'No seleccionada';
        return new Date(date).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    // Calcular el precio total
    const calcularPrecioTotal = () => {
        if (formData.servicios_seleccionados.length === 0) {
            return '0.00';
        }

        if (isTratamiento) {
            return parseFloat(formData.costo_total || 0).toFixed(2);
        } else {
            return parseFloat(formData.servicios_seleccionados[0].precio || 0).toFixed(2);
        }
    };

    // Enviar el formulario - CORREGIDO
    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            // Validar campos obligatorios
            if (!formData.paciente_nombre || !formData.paciente_apellido_paterno ||
                !formData.fecha_consulta || !formData.hora_consulta ||
                formData.servicios_seleccionados.length === 0 || !formData.odontologo_id) {
                throw new Error('Por favor complete todos los campos obligatorios antes de continuar.');
            }

            // Formatear fecha y hora en el formato ISO correcto
            let fechaHora = null;
            if (formData.fecha_consulta && formData.hora_consulta) {
                const fecha = moment(formData.fecha_consulta).format('YYYY-MM-DD');
                const hora = formData.hora_consulta;
                fechaHora = moment.tz(`${fecha} ${hora}`, 'YYYY-MM-DD HH:mm', moment.tz.guess()).format('YYYY-MM-DDTHH:mm:00');
            }

            // Obtener información del servicio seleccionado
            const servicioPrincipal = formData.servicios_seleccionados[0] || {};

            // Obtener información del odontólogo
            const odontologo = odontologos.find(o => o.id === formData.odontologo_id) || {};
            const odontologoNombre = odontologo
                ? `${odontologo.nombre || ''} ${odontologo.aPaterno || ''} ${odontologo.aMaterno || ''}`.trim()
                : '';

            // Preparar fecha de nacimiento con formato correcto
            let fechaNacimiento = null;
            if (formData.paciente_fecha_nacimiento) {
                const fechaNacObj = formData.paciente_fecha_nacimiento instanceof Date
                    ? formData.paciente_fecha_nacimiento
                    : new Date(formData.paciente_fecha_nacimiento);

                if (!isNaN(fechaNacObj.getTime())) {
                    fechaNacimiento = moment(fechaNacObj).format('YYYY-MM-DD');
                } else {
                    fechaNacimiento = moment().subtract(30, 'years').format('YYYY-MM-DD');
                }
            } else {
                fechaNacimiento = moment().subtract(30, 'years').format('YYYY-MM-DD');
            }

            // Armar el objeto con los datos para el endpoint
            const requestData = {
                // Datos del paciente (vienen del usuario logueado)
                paciente_id: formData.paciente_id,
                nombre: formData.paciente_nombre.trim(),
                apellido_paterno: formData.paciente_apellido_paterno.trim(),
                apellido_materno: formData.paciente_apellido_materno.trim(),
                genero: formData.paciente_genero || 'No especificado',
                fecha_nacimiento: fechaNacimiento,
                correo: (formData.paciente_correo || '').trim(),
                telefono: (formData.paciente_telefono || '').trim(),

                // Datos del odontólogo
                odontologo_id: formData.odontologo_id,
                odontologo_nombre: odontologoNombre,

                // Datos del servicio
                servicio_id: servicioPrincipal.servicio_id,
                servicio_nombre: (servicioPrincipal.nombre || '').trim(),
                categoria_servicio: (servicioPrincipal.categoria_nombre || 'General').trim(),
                precio_servicio: parseFloat(servicioPrincipal.precio || 0),

                // Fecha y hora en formato que espera el endpoint
                fecha_hora: fechaHora,

                // Estado y notas adicionales
                estado: 'Pendiente', // Siempre pendiente para pacientes
                notas: (formData.notas || '').trim()
            };

            // Hacer la petición con axios
            const response = await axios.post('https://back-end-4803.onrender.com/api/citas/nueva', requestData);

            // Manejar respuesta exitosa
            if (response.status === 201) {
                // Mostrar notificación de éxito
                setNotification({
                    open: true,
                    message: 'Cita agendada con éxito',
                    type: 'success'
                });

                // Disparar evento global para refrescar citas
                window.dispatchEvent(new Event('refreshCitas'));

                // Llamar al callback de éxito si existe
                if (onSuccess) {
                    onSuccess();
                }

                // Cerrar el diálogo después de mostrar la notificación
                setTimeout(() => {
                    handleClose();
                }, 2000);
            }
        } catch (error) {
            console.error('Error al crear:', error);

            // Definir mensaje de error correctamente
            let mensajeError = error.message || 'Error al procesar tu solicitud. Inténtalo de nuevo.';

            if (error.response && error.response.data) {
                if (error.response.data.message) {
                    mensajeError = error.response.data.message;
                } else if (typeof error.response.data === 'string') {
                    mensajeError = error.response.data;
                }
            }

            setNotification({
                open: true,
                message: `Error: ${mensajeError}`,
                type: 'error'
            });

            setError(mensajeError);
        } finally {
            setLoading(false);
        }
    };

    // Obtener información del odontólogo seleccionado
    const selectedOdontologo = odontologos.find(o => o.id === formData.odontologo_id);

    // Cerrar dialog
    const handleClose = () => {
        resetForm();
        onClose();
    };

    // Asignar colores por categoría
    const getCategoriaColor = (categoria) => {
        const coloresDisponibles = [
            colors.primary, colors.info, colors.purple,
            colors.error, colors.success, colors.warning
        ];

        const primeraLetra = (categoria || 'General').charAt(0).toUpperCase();
        const indice = primeraLetra.charCodeAt(0) % coloresDisponibles.length;

        return coloresDisponibles[indice];
    };

    // Función para obtener icono por categoría
    const getCategoriaIcon = (categoria) => {
        const categoryName = (categoria || '').toLowerCase();
        
        if (categoryName.includes('limpieza') || categoryName.includes('profilaxis')) {
            return <CleaningServices />;
        } else if (categoryName.includes('estetica') || categoryName.includes('blanqueamiento')) {
            return <Face />;
        } else if (categoryName.includes('cirugia') || categoryName.includes('extraccion')) {
            return <MedicalServices />;
        } else if (categoryName.includes('tratamiento') || categoryName.includes('endodoncia')) {
            return <MedicalInformation />;
        } else if (categoryName.includes('spa') || categoryName.includes('relajacion')) {
            return <Spa />;
        } else if (categoryName.includes('urgencia') || categoryName.includes('emergencia')) {
            return <Bloodtype />;
        } else {
            return <EventAvailable />;
        }
    };

    // Renderizar paso de selección de servicio
    const renderServiceSelectionStep = () => {
        return (
            <Box>
                {/* Encabezado con título y filtros */}
                <Box sx={{
                    mb: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2
                }}>
                    <Typography variant="h6" color={colors.primary} sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontWeight: 600
                    }}>
                        <EventAvailable />
                        Seleccione un Servicio
                    </Typography>

                    {/* Filtros rápidos */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                            label="Todos"
                            color={filtroServicio === 'todos' ? 'primary' : 'default'}
                            variant={filtroServicio === 'todos' ? 'filled' : 'outlined'}
                            onClick={() => setFiltroServicio('todos')}
                            size="small"
                        />
                        <Chip
                            label="Tratamientos"
                            color={filtroServicio === 'tratamientos' ? 'primary' : 'default'}
                            variant={filtroServicio === 'tratamientos' ? 'filled' : 'outlined'}
                            onClick={() => setFiltroServicio('tratamientos')}
                            size="small"
                        />
                        <Chip
                            label="Consultas"
                            color={filtroServicio === 'consultas' ? 'info' : 'default'}
                            variant={filtroServicio === 'consultas' ? 'filled' : 'outlined'}
                            onClick={() => setFiltroServicio('consultas')}
                            size="small"
                        />
                    </Box>
                </Box>

                {formErrors.servicios_seleccionados && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        <AlertTitle>Selección requerida</AlertTitle>
                        Por favor seleccione un servicio para continuar
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {/* Lista de servicios */}
                    <Grid item xs={12} md={formData.servicios_seleccionados.length > 0 ? 7 : 12}>
                        {servicios.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <CircularProgress size={40} sx={{ mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                    Cargando servicios disponibles...
                                </Typography>
                            </Box>
                        ) : (
                            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                <TableContainer sx={{ maxHeight: 400 }}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha(colors.primary, 0.05) }}>
                                                    Servicio
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha(colors.primary, 0.05) }}>
                                                    Categoría
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha(colors.primary, 0.05) }}>
                                                    Precio
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha(colors.primary, 0.05) }}>
                                                    Seleccionar
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {servicios
                                                .filter(servicio => {
                                                    if (filtroServicio === 'todos') return true;
                                                    if (filtroServicio === 'tratamientos') return parseInt(servicio.tratamiento, 10) === 1;
                                                    if (filtroServicio === 'consultas') return parseInt(servicio.tratamiento, 10) !== 1;
                                                    return true;
                                                })
                                                .map(servicio => {
                                                    const esTratamiento = parseInt(servicio.tratamiento, 10) === 1;
                                                    const isSelected = formData.servicios_seleccionados.length > 0 &&
                                                        formData.servicios_seleccionados[0].servicio_id === servicio.id;
                                                    const categoriaColor = getCategoriaColor(servicio.category);

                                                    return (
                                                        <TableRow
                                                            key={servicio.id}
                                                            hover
                                                            onClick={() => handleServiceSelection({
                                                                servicio_id: servicio.id,
                                                                nombre: servicio.title,
                                                                categoria_nombre: servicio.category,
                                                                precio: servicio.price,
                                                                tratamiento: servicio.tratamiento,
                                                                citasEstimadas: servicio.citasEstimadas || 1
                                                            })}
                                                            sx={{
                                                                cursor: 'pointer',
                                                                bgcolor: isSelected ? alpha(esTratamiento ? colors.primary : colors.info, 0.1) : 'transparent',
                                                                '&:hover': {
                                                                    bgcolor: isSelected ? alpha(esTratamiento ? colors.primary : colors.info, 0.15) : alpha(colors.primary, 0.05)
                                                                }
                                                            }}
                                                        >
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    <Box sx={{
                                                                        mr: 2,
                                                                        bgcolor: alpha(esTratamiento ? colors.primary : colors.info, 0.1),
                                                                        borderRadius: '50%',
                                                                        width: 36,
                                                                        height: 36,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        {esTratamiento ?
                                                                            <MedicalServices sx={{ color: colors.primary }} /> :
                                                                            getCategoriaIcon(servicio.category)
                                                                        }
                                                                    </Box>
                                                                    <Box>
                                                                        <Typography variant="subtitle1" fontWeight={isSelected ? 'bold' : 'medium'}>
                                                                            {servicio.title}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary" sx={{
                                                                            display: '-webkit-box',
                                                                            WebkitLineClamp: 1,
                                                                            WebkitBoxOrient: 'vertical',
                                                                            overflow: 'hidden',
                                                                            maxWidth: '300px'
                                                                        }}>
                                                                            {servicio.description || 'Sin descripción'}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={servicio.category || 'General'}
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: alpha(categoriaColor, 0.1),
                                                                        color: categoriaColor,
                                                                        borderColor: alpha(categoriaColor, 0.3),
                                                                        fontWeight: 500
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="subtitle1" fontWeight="bold" color={esTratamiento ? 'primary' : 'info'}>
                                                                    ${parseFloat(servicio.price).toFixed(2)}
                                                                </Typography>
                                                                {esTratamiento && (
                                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                                        <EventIcon  fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                                                        {servicio.citasEstimadas || 1} citas estimadas
                                                                    </Typography>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Radio
                                                                    checked={isSelected}
                                                                    color={esTratamiento ? 'primary' : 'info'}
                                                                    size="medium"
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        )}
                    </Grid>

                    {/* Panel de detalles del servicio seleccionado */}
                    {formData.servicios_seleccionados.length > 0 && (
                        <Grid item xs={12} md={5}>
                            <Paper elevation={3} sx={{
                                p: 0,
                                overflow: 'hidden',
                                borderRadius: 2,
                                height: '100%',
                                border: `1px solid ${alpha(formData.servicios_seleccionados[0].es_tratamiento ? colors.primary : colors.info, 0.3)}`
                            }}>
                                {/* Header */}
                                <Box sx={{
                                    bgcolor: formData.servicios_seleccionados[0].es_tratamiento ? colors.primary : colors.info,
                                    color: 'white',
                                    p: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {formData.servicios_seleccionados[0].es_tratamiento ? (
                                            <MedicalServices sx={{ mr: 1.5 }} />
                                        ) : (
                                            <EventAvailable sx={{ mr: 1.5 }} />
                                        )}
                                        <Typography variant="h6" fontWeight="bold">
                                            {formData.servicios_seleccionados[0].es_tratamiento ? 'Tratamiento Dental' : 'Consulta Dental'}
                                        </Typography>
                                    </Box>

                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setFormData(prev => ({
                                                ...prev,
                                                servicios_seleccionados: [],
                                                nombre_tratamiento: ''
                                            }));
                                            setIsTratamiento(false);
                                        }}
                                        sx={{
                                            color: 'white',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                                        }}
                                    >
                                        <Close />
                                    </IconButton>
                                </Box>

                                {/* Detalles del servicio */}
                                <CardContent>
                                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                                        {formData.servicios_seleccionados[0].nombre}
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Chip
                                            icon={<Category />}
                                            label={formData.servicios_seleccionados[0].categoria_nombre}
                                            variant="outlined"
                                            size="medium"
                                            sx={{
                                                borderColor: alpha(getCategoriaColor(formData.servicios_seleccionados[0].categoria_nombre), 0.5),
                                                color: getCategoriaColor(formData.servicios_seleccionados[0].categoria_nombre)
                                            }}
                                        />
                                    </Box>

                                    {/* Detalles específicos para tratamientos */}
                                    {formData.servicios_seleccionados[0].es_tratamiento && (
                                        <>
                                            <Divider sx={{ my: 2 }} />

                                            <Box sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                bgcolor: alpha(colors.primary, 0.08),
                                                border: `1px solid ${alpha(colors.primary, 0.2)}`,
                                                mb: 2
                                            }}>
                                                <Typography variant="subtitle1" sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    fontWeight: 'bold',
                                                    color: colors.primary,
                                                    mb: 1.5
                                                }}>
                                                    <InfoOutlined sx={{ mr: 1 }} />
                                                    Información del Tratamiento
                                                </Typography>

                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Box sx={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: '50%',
                                                            bgcolor: alpha(colors.primary, 0.2),
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            mr: 2
                                                        }}>
                                                            <EventIcon  color="primary" />
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Número de Citas
                                                            </Typography>
                                                            <Typography variant="body1" fontWeight="bold">
                                                                {formData.servicios_seleccionados[0].citas_estimadas} citas
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Box sx={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: '50%',
                                                            bgcolor: alpha(colors.info, 0.2),
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            mr: 2
                                                        }}>
                                                            <Update color="info" />
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Frecuencia
                                                            </Typography>
                                                            <Typography variant="body1" fontWeight="bold">
                                                                Citas mensuales
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Box sx={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: '50%',
                                                            bgcolor: alpha(colors.success, 0.2),
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            mr: 2
                                                        }}>
                                                            <CalendarMonth color="success" />
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Duración Estimada
                                                            </Typography>
                                                            <Typography variant="body1" fontWeight="bold">
                                                                {formData.servicios_seleccionados[0].citas_estimadas} {parseInt(formData.servicios_seleccionados[0].citas_estimadas, 10) > 1 ? 'meses' : 'mes'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </>
                                    )}

                                    {/* Precio */}
                                    <Divider sx={{ my: 2 }} />

                                    <Box sx={{
                                        bgcolor: alpha(formData.servicios_seleccionados[0].es_tratamiento ? colors.primary : colors.info, 0.08),
                                        p: 2,
                                        borderRadius: 2,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <Typography variant="subtitle1" fontWeight="medium">
                                            {formData.servicios_seleccionados[0].es_tratamiento ? 'Precio Total Estimado:' : 'Precio:'}
                                        </Typography>

                                        <Typography variant="h5" fontWeight="bold" color={formData.servicios_seleccionados[0].es_tratamiento ? 'primary' : 'info'}>
                                            ${calcularPrecioTotal()}
                                        </Typography>
                                    </Box>

                                    {/* Nota informativa para tratamientos */}
                                    {formData.servicios_seleccionados[0].es_tratamiento && (
                                        <Alert severity="info" sx={{ mt: 2 }}>
                                            <AlertTitle>Nota importante</AlertTitle>
                                            El costo total puede variar según las necesidades específicas que se identifiquen durante el tratamiento.
                                        </Alert>
                                    )}
                                </CardContent>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Box>
        );
    };

    // Renderizar paso de programación
    const renderSchedulingStep = () => {
        return (
            <Box>
                <Typography variant="h6" color={colors.primary} sx={{
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <CalendarMonth />
                    {isTratamiento ? 'Programar Primera Cita del Tratamiento' : 'Selección de Fecha y Hora'}
                </Typography>

                {/* Información del servicio seleccionado */}
                {formData.servicios_seleccionados.length > 0 && (
                    <Paper elevation={2} sx={{
                        p: 3,
                        mb: 3,
                        borderLeft: `6px solid ${isTratamiento ? colors.primary : colors.info}`,
                        backgroundColor: alpha(isTratamiento ? colors.primary : colors.info, 0.05)
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            {isTratamiento ? (
                                <MedicalServices sx={{ mr: 1, color: colors.primary }} />
                            ) : (
                                <EventAvailable sx={{ mr: 1, color: colors.info }} />
                            )}
                            <Typography variant="h6" color={isTratamiento ? colors.primary : colors.info}>
                                {isTratamiento ? 'Tratamiento Dental' : 'Consulta Dental'}
                            </Typography>

                            <Chip
                                label={isTratamiento ? "Tratamiento" : "Consulta"}
                                size="small"
                                color={isTratamiento ? "primary" : "info"}
                                sx={{ ml: 2 }}
                            />
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        <Typography variant="body1" sx={{ mt: 2, fontWeight: 'medium' }}>
                            {isTratamiento ? (
                                <>
                                    Está programando un <strong>tratamiento de {formData.nombre_tratamiento}</strong> que
                                    requiere <strong>{formData.total_citas_programadas} citas</strong> para completarse.
                                </>
                            ) : (
                                <>
                                    Está programando una <strong>consulta de {formData.servicios_seleccionados[0].nombre}</strong>.
                                </>
                            )}
                        </Typography>

                        <Typography variant="body1" sx={{ mt: 1.5, fontStyle: 'italic', color: isTratamiento ? colors.primary : colors.info }}>
                            {isTratamiento ? (
                                <>Ahora seleccione la fecha para la primera cita del tratamiento.</>
                            ) : (
                                <>Seleccione la fecha y hora para su cita.</>
                            )}
                        </Typography>

                        {isTratamiento && (
                            <Box sx={{ mt: 2, p: 1.5, bgcolor: alpha(colors.primary, 0.1), borderRadius: 1 }}>
                                <Typography variant="body2">
                                    <strong>Nota:</strong> Las citas de seguimiento se programarán mensualmente a partir
                                    de la fecha que seleccione para la primera cita.
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                )}

                <Grid container spacing={3}>
                    {/* Información del odontólogo */}
                    {odontologos.length === 1 ? (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 2, backgroundColor: alpha(colors.primary, 0.1) }}>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                    <HealthAndSafety sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                                    Odontólogo asignado: Dr. {odontologos[0].nombre} {odontologos[0].aPaterno} {odontologos[0].aMaterno || ''}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Especialidad: {odontologos[0].puesto || 'Odontólogo'}
                                </Typography>
                            </Paper>
                        </Grid>
                    ) : (
                        <Grid item xs={12}>
                            <FormControl fullWidth error={formErrors.odontologo_id}>
                                <InputLabel>Odontólogo</InputLabel>
                                <Select
                                    name="odontologo_id"
                                    value={formData.odontologo_id}
                                    onChange={handleOdontologoChange}
                                    label="Odontólogo"
                                >
                                    {odontologos.map((odontologo) => (
                                        <MenuItem key={odontologo.id} value={odontologo.id}>
                                            {`Dr. ${odontologo.nombre} ${odontologo.aPaterno} ${odontologo.aMaterno || ''}`}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formErrors.odontologo_id && (
                                    <FormHelperText>Por favor seleccione un odontólogo</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                    )}

                    {/* Calendario para selección de fecha */}
                    <Grid item xs={12} md={7}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                                <EventIcon  sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                                Seleccione una fecha para {isTratamiento ? "la primera cita del tratamiento" : "su cita"}
                            </Typography>

                            {isLoading && !formData.odontologo_id ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                                    <CircularProgress />
                                </Box>
                            ) : !formData.odontologo_id ? (
                                <Alert severity="info">
                                    Por favor seleccione un odontólogo para ver sus días disponibles
                                </Alert>
                            ) : (
                                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                                    <DateCalendar
                                        value={selectedDate}
                                        onChange={handleDateSelection}
                                        minDate={new Date()}
                                        disablePast
                                        sx={{ width: '100%' }}
                                        shouldDisableDate={(date) => {
                                            if (!workDays || workDays.length === 0) {
                                                return date.getDay() === 0;
                                            }
                                            return !workDays.includes(date.getDay());
                                        }}
                                        loading={isLoading}
                                    />
                                </LocalizationProvider>
                            )}
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                                <AccessTime sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                                Horarios disponibles para {isTratamiento ? "la primera cita" : "su cita"}
                            </Typography>

                            {isLoading && selectedDate ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                                    <CircularProgress />
                                </Box>
                            ) : !formData.odontologo_id ? (
                                <Alert severity="info">
                                    Por favor seleccione un odontólogo primero
                                </Alert>
                            ) : !selectedDate ? (
                                <Alert severity="info">
                                    Seleccione primero una fecha para ver los horarios disponibles
                                </Alert>
                            ) : availableTimes.length === 0 && occupiedTimes.length === 0 ? (
                                <Alert severity="warning">
                                    No hay horarios configurados para esta fecha
                                </Alert>
                            ) : (
                                <Box>
                                    {/* Horarios disponibles */}
                                    {availableTimes.length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" sx={{
                                                mb: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontWeight: 'medium',
                                                color: colors.primary
                                            }}>
                                                <Box component="span" sx={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    display: 'inline-block',
                                                    bgcolor: colors.primary,
                                                    mr: 1,
                                                    verticalAlign: 'middle'
                                                }}></Box>
                                                Horarios disponibles
                                            </Typography>

                                            <Box sx={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 1,
                                                p: 1.5,
                                                borderRadius: 1,
                                                bgcolor: alpha(colors.primary, 0.05),
                                                border: `1px solid ${alpha(colors.primary, 0.1)}`
                                            }}>
                                                {availableTimes.map((hora) => (
                                                    <Chip
                                                        key={hora}
                                                        label={hora}
                                                        onClick={() => handleHourSelection(hora)}
                                                        color={formData.hora_consulta === hora ? 'primary' : 'default'}
                                                        variant={formData.hora_consulta === hora ? 'filled' : 'outlined'}
                                                        sx={{
                                                            m: 0.5,
                                                            fontWeight: formData.hora_consulta === hora ? 'bold' : 'normal',
                                                            transition: 'all 0.2s ease',
                                                            '&:hover': {
                                                                transform: 'scale(1.05)',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Horarios ocupados */}
                                    {occupiedTimes.length > 0 && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2" sx={{
                                                mb: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontWeight: 'medium',
                                                color: 'error.main'
                                            }}>
                                                <Box component="span" sx={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    display: 'inline-block',
                                                    bgcolor: 'error.main',
                                                    mr: 1,
                                                    verticalAlign: 'middle'
                                                }}></Box>
                                                Horarios ocupados
                                            </Typography>

                                            <Box sx={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 1,
                                                p: 1.5,
                                                borderRadius: 1,
                                                bgcolor: alpha('#f44336', 0.05),
                                                border: `1px solid ${alpha('#f44336', 0.1)}`
                                            }}>
                                                {occupiedTimes.map((hora) => (
                                                    <Tooltip
                                                        key={hora}
                                                        title="Este horario ya está ocupado"
                                                        arrow
                                                        placement="top"
                                                    >
                                                        <Box sx={{ position: 'relative', m: 0.5 }}>
                                                            <Chip
                                                                label={hora}
                                                                color="error"
                                                                variant="outlined"
                                                                disabled
                                                                sx={{
                                                                    opacity: 0.7,
                                                                    cursor: 'not-allowed'
                                                                }}
                                                            />
                                                            <Box sx={{
                                                                position: 'absolute',
                                                                top: '50%',
                                                                left: 8,
                                                                right: 8,
                                                                height: 2,
                                                                bgcolor: 'error.main',
                                                                transform: 'translateY(-50%) rotate(-45deg)',
                                                                pointerEvents: 'none'
                                                            }} />
                                                        </Box>
                                                    </Tooltip>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}

                                    {availableTimes.length === 0 && occupiedTimes.length > 0 && (
                                        <Alert severity="warning" sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                Sin disponibilidad
                                            </Typography>
                                            <Typography variant="body2">
                                                Todos los horarios de esta fecha ya están ocupados.
                                                Por favor seleccione otra fecha.
                                            </Typography>
                                        </Alert>
                                    )}
                                </Box>
                            )}

                            {formErrors.hora_consulta && selectedDate && (
                                <FormHelperText error>Debe seleccionar una hora</FormHelperText>
                            )}
                        </Paper>
                    </Grid>

                    {/* Campo de notas */}
                    <Grid item xs={12}>
                        <TextField
                            name="notas"
                            label="Notas adicionales"
                            multiline
                            rows={3}
                            fullWidth
                            value={formData.notas}
                            onChange={handleChange}
                            placeholder="Añada cualquier indicación o comentario relevante para esta cita"
                        />
                    </Grid>
                </Grid>
            </Box>
        );
    };

    // Renderizar confirmación
    const renderConfirmationStep = () => {
        return (
            <Box>
                <Typography variant="h6" color={colors.primary} sx={{
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <Checklist />
                    Confirmación {isTratamiento ? 'del Tratamiento' : 'de Cita'}
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                    Por favor revise que todos los datos sean correctos antes de confirmar.
                </Alert>

                <Grid container spacing={3}>
                    {/* Datos del paciente */}
                    <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle1" sx={{
                                fontWeight: 'bold',
                                mb: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <Person fontSize="small" />
                                Datos del Paciente
                            </Typography>

                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Nombre:</strong> {formData.paciente_nombre} {formData.paciente_apellido_paterno} {formData.paciente_apellido_materno}
                            </Typography>

                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Teléfono:</strong> {formData.paciente_telefono || 'No especificado'}
                            </Typography>

                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Correo:</strong> {formData.paciente_correo || 'No especificado'}
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Datos de la cita o tratamiento */}
                    <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle1" sx={{
                                fontWeight: 'bold',
                                mb: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                {isTratamiento ? (
                                    <><MedicalServices fontSize="small" />Detalles del Tratamiento</>
                                ) : (
                                    <><CalendarMonth fontSize="small" />Detalles de la Cita</>
                                )}
                            </Typography>

                            {isTratamiento ? (
                                <>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>Tratamiento:</strong> {formData.nombre_tratamiento}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>Primera cita:</strong> {formatDate(formData.fecha_inicio)}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>Número de sesiones:</strong> {formData.total_citas_programadas}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>Finalización estimada:</strong> {formatDate(formData.fecha_estimada_fin)}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>Frecuencia:</strong> Mensual (una cita cada mes)
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>Fecha:</strong> {formatDate(formData.fecha_consulta)}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>Hora:</strong> {formData.hora_consulta}
                                    </Typography>
                                </>
                            )}

                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Odontólogo:</strong> {selectedOdontologo ?
                                    `Dr. ${selectedOdontologo.nombre} ${selectedOdontologo.aPaterno} ${selectedOdontologo.aMaterno || ''}` :
                                    'No seleccionado'}
                            </Typography>

                            {formData.notas && (
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Notas:</strong> {formData.notas}
                                </Typography>
                            )}
                        </Paper>
                    </Grid>

                    {/* Servicios seleccionados */}
                    <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle1" sx={{
                                fontWeight: 'bold',
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <EventAvailable fontSize="small" />
                                {isTratamiento ? 'Detalles del Servicio' : 'Servicio Seleccionado'}
                            </Typography>

                            <Box sx={{ ml: 1 }}>
                                {formData.servicios_seleccionados.map((servicio, index) => (
                                    <Box key={servicio.servicio_id} sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        borderBottom: index < formData.servicios_seleccionados.length - 1 ? '1px dashed' : 'none',
                                        borderColor: 'divider',
                                        py: 1
                                    }}>
                                        <Typography variant="body1">
                                            {servicio.nombre}
                                            {servicio.es_tratamiento && ` (Tratamiento - ${formData.total_citas_programadas} citas)`}
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            ${parseFloat(servicio.precio || 0).toFixed(2)}
                                            {servicio.es_tratamiento && ` por cita`}
                                        </Typography>
                                    </Box>
                                ))}

                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    mt: 2,
                                    pt: 1,
                                    borderTop: '2px solid',
                                    borderColor: colors.primary
                                }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        TOTAL
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold" color={colors.primary}>
                                        ${calcularPrecioTotal()}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    // Renderizar contenido según el paso actual
    const renderContent = () => {
        switch (activeStep) {
            case 0:
                return renderServiceSelectionStep();
            case 1:
                return renderSchedulingStep();
            case 2:
                return renderConfirmationStep();
            default:
                return null;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxHeight: '90vh',
                    bgcolor: colors.background
                }
            }}
        >
            <DialogTitle sx={{
                bgcolor: colors.primary,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '12px 12px 0 0'
            }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule />
                    {activeStep === 2
                        ? (isTratamiento ? 'Confirmar Nuevo Tratamiento' : 'Confirmar Nueva Cita')
                        : (isTratamiento ? 'Agendar Tratamiento' : 'Agendar Cita')}
                </Typography>
                <IconButton
                    onClick={handleClose}
                    sx={{ color: 'white' }}
                >
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                {/* Stepper */}
                <Box sx={{
                    p: 3,
                    background: isDarkTheme
                        ? `linear-gradient(135deg, ${alpha(colors.primary, 0.15)} 0%, ${alpha(colors.primary, 0.05)} 100%)`
                        : `linear-gradient(135deg, ${alpha(colors.primary, 0.08)} 0%, ${alpha(colors.primary, 0.02)} 100%)`
                }}>
                    <Stepper
                        activeStep={activeStep}
                        alternativeLabel
                        sx={{
                            '& .MuiStepIcon-root': {
                                fontSize: '1.5rem',
                                '&.Mui-completed': { color: '#4caf50' },
                                '&.Mui-active': {
                                    color: isTratamiento ? colors.primary : colors.info,
                                    transform: 'scale(1.1)'
                                }
                            },
                            '& .MuiStepLabel-label': {
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                '&.Mui-active': {
                                    fontWeight: 700,
                                    color: isTratamiento ? colors.primary : colors.info
                                }
                            }
                        }}
                    >
                        {steps.map((label, index) => (
                            <Step key={index}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                {/* Contenido del paso actual */}
                <Box sx={{ p: 3 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {renderContent()}
                </Box>
            </DialogContent>

            {/* Botones de navegación */}
            <DialogActions sx={{
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid',
                borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
            }}>
                <Box>
                    {activeStep > 0 && (
                        <Button
                            onClick={handleBack}
                            variant="outlined"
                            color="inherit"
                            startIcon={<ArrowBack />}
                            disabled={loading}
                        >
                            Atrás
                        </Button>
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        disabled={loading}
                    >
                        Cancelar
                    </Button>

                    {activeStep < steps.length - 1 ? (
                        <Button
                            onClick={handleNext}
                            variant="contained"
                            color="primary"
                            endIcon={<ArrowForwardIos />}
                            disabled={!isStepValid || loading}
                        >
                            Siguiente
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            color="success"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                        >
                            {loading ? 'Guardando...' : 'Confirmar Cita'}
                        </Button>
                    )}
                </Box>
            </DialogActions>
            
            {/* Componente de notificaciones CORREGIDO */}
            <Notificaciones
                open={notification.open}
                message={notification.message}
                type={notification.type}
                onClose={handleNotificationClose}
            />
        </Dialog>
    );
};

export default AgendarCitaDialog;