import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Grid, Typography, FormHelperText, Box, CircularProgress,
  Divider, Alert, Step, StepLabel, Stepper, Paper, Chip,
  FormControlLabel, Switch, Autocomplete, Checkbox, IconButton, alpha, Radio,
} from '@mui/material';
import {
  Add, CalendarMonth, Person, EventAvailable, Checklist, Search, ArrowBackIosNew, CheckCircle,
  PersonAdd, Close, InfoOutlined, LocalHospital, Event, HealthAndSafety, AccessTime, ArrowForwardIos,
} from '@mui/icons-material';
import { useThemeContext } from '../../../../components/Tools/ThemeContext';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateCalendar, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import Notificaciones from '../../../../components/Layout/Notificaciones';

const NewCita = ({ open, handleClose, onAppointmentCreated }) => {
  const { isDarkTheme } = useThemeContext();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [odontologos, setOdontologos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [workDays, setWorkDays] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: '' });
  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const [formData, setFormData] = useState({
    // Datos del paciente
    paciente_id: '',
    paciente_nombre: '',
    paciente_apellido_paterno: '',
    paciente_apellido_materno: '',
    paciente_genero: '',                // Nuevo campo
    paciente_fecha_nacimiento: null,    // Nuevo campo
    paciente_telefono: '',
    paciente_correo: '',

    // Servicios seleccionados
    servicios_seleccionados: [],

    // Datos de la cita
    odontologo_id: '',
    fecha_consulta: null,
    hora_consulta: null,
    estado: 'Pendiente',
    notas: ''
  });
  // Estados de validación
  const [formErrors, setFormErrors] = useState({
    paciente_id: false,
    paciente_nombre: false,
    paciente_apellido_paterno: false,
    paciente_apellido_materno: false,
    paciente_genero: false,                // Nuevo campo
    paciente_fecha_nacimiento: false,      // Nuevo campo
    servicios_seleccionados: false,
    odontologo_id: false,
    fecha_consulta: false,
    hora_consulta: false
  });


  // Pasos del formulario
  const steps = ['Seleccionar Paciente', 'Elegir Servicios', 'Seleccionar Fecha y Hora', 'Confirmar'];

  // Colores del tema
  const colors = {
    background: isDarkTheme ? '#0D1B2A' : '#ffffff',
    primary: isDarkTheme ? '#00BCD4' : '#03427C',
    text: isDarkTheme ? '#ffffff' : '#1a1a1a',
    cardBg: isDarkTheme ? '#1A2735' : '#ffffff',
    step: isDarkTheme ? '#00BCD4' : '#2196f3',
  };

  // Cargar datos al abrir el diálogo
  useEffect(() => {
    if (open) {
      resetForm();
      fetchServicios();
      fetchOdontologos();
      fetchPacientes();
    }
  }, [open]);

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      paciente_id: '',
      paciente_nombre: '',
      paciente_apellido_paterno: '',
      paciente_apellido_materno: '',
      paciente_genero: '',
      paciente_fecha_nacimiento: null,
      paciente_telefono: '',
      paciente_correo: '',
      servicios_seleccionados: [],
      odontologo_id: '',
      fecha_consulta: null,
      hora_consulta: null,
      estado: 'Pendiente',
      notas: ''
    });
    setFormErrors({
      paciente_id: false,
      paciente_nombre: false,
      paciente_apellido_paterno: false,
      paciente_apellido_materno: false,
      paciente_genero: false,
      paciente_fecha_nacimiento: false,
      servicios_seleccionados: false,
      odontologo_id: false,
      fecha_consulta: false,
      hora_consulta: false
    });
    setActiveStep(0);
    setError('');
    setSuccess('');
    setSearchQuery('');
    setSearchResults([]);
    setShowNewPatientForm(false);
    setSelectedDate(null);
    setHorariosDisponibles([]);
  };

  // Fetching de servicios
  const fetchServicios = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://back-end-4803.onrender.com/api/servicios/all');
      if (!response.ok) throw new Error('Error al cargar servicios');
      const data = await response.json();
      console.log("Datos de servicios recibidos:", data); // Agregar para depuración
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

        // Cargar disponibilidad para este odontólogo
        fetchDisponibilidad(odontologo.id);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar la lista de odontólogos');
    }
  };

  useEffect(() => {
    if (!formData.odontologo_id) return;
    setIsLoading(true);

    axios.get(`https://back-end-4803.onrender.com/api/horarios/dias_laborales?odontologo_id=${formData.odontologo_id}`)
      .then((response) => {
        const daysMap = {
          'Domingo': 0,
          'Lunes': 1,
          'Martes': 2,
          'Miércoles': 3,
          'Jueves': 4,
          'Viernes': 5,
          'Sábado': 6
        };
        const availableDays = response.data.map(day => daysMap[day]);
        setWorkDays(availableDays);
      })
      .catch((error) => {
        console.error('Error fetching working days:', error);
        setNotification({
          open: true,
          message: 'Error al obtener los días laborales del odontólogo.',
          type: 'error',
        });
      })
      .finally(() => setIsLoading(false));
  }, [formData.odontologo_id]);

  // Add this function to fetch available times for a selected date
  const fetchAvailableTimes = (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
      console.error('Fecha no válida para obtener horarios:', date);
      return;
    }

    const formattedDate = date.toISOString().split('T')[0];
    setIsLoading(true);

    axios.get(`https://back-end-4803.onrender.com/api/horarios/disponibilidad?odontologo_id=${formData.odontologo_id}&fecha=${formattedDate}`)
      .then((response) => {
        const times = [];
        response.data.forEach((item) => {
          const startTime = new Date(`${formattedDate}T${item.hora_inicio}`);
          const endTime = new Date(`${formattedDate}T${item.hora_fin}`);
          const duracion = item.duracion || 30;

          while (startTime < endTime) {
            times.push(startTime.toTimeString().slice(0, 5));
            startTime.setMinutes(startTime.getMinutes() + duracion);
          }
        });
        setAvailableTimes(times);
      })
      .catch((error) => {
        console.error('Error fetching available times:', error);
        setNotification({
          open: true,
          message: 'Error al obtener los horarios disponibles.',
          type: 'error',
        });
      })
      .finally(() => setIsLoading(false));
  };

  // Update the date selection handler to fetch available times
  const handleDateSelection = (date) => {
    setSelectedDate(date);
    setFormData(prev => ({
      ...prev,
      fecha_consulta: date
    }));

    if (formErrors.fecha_consulta) {
      setFormErrors(prev => ({
        ...prev,
        fecha_consulta: false
      }));
    }

    // Fetch available times for the selected date
    if (formData.odontologo_id) {
      fetchAvailableTimes(date);
    }
  };

  // Fetching de pacientes
  const fetchPacientes = async () => {
    try {
      const response = await fetch('https://back-end-4803.onrender.com/api/pacientes/all');
      if (!response.ok) throw new Error('Error al cargar pacientes');
      const data = await response.json();
      setPacientes(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar la lista de pacientes');
    }
  };

  // Buscar pacientes
  const handleSearchPatient = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Filter patients using the correct field names from your database
      const filteredPacientes = pacientes.filter(paciente =>
        paciente.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paciente.aPaterno?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paciente.aMaterno?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paciente.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paciente.telefono?.includes(searchQuery)
      );

      setSearchResults(filteredPacientes);
    } catch (error) {
      console.error('Error al buscar pacientes:', error);
      setError('Ocurrió un error al buscar pacientes');
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, pacientes]);

  // Buscar al escribir (con debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        handleSearchPatient();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, handleSearchPatient]);

  // Seleccionar paciente existente
  const handleSelectPatient = (paciente) => {
    setFormData(prev => ({
      ...prev,
      paciente_id: paciente.id,
      paciente_nombre: paciente.nombre,
      paciente_apellido_paterno: paciente.aPaterno,
      paciente_apellido_materno: paciente.aMaterno || '',
      paciente_genero: paciente.genero || 'No especificado',
      paciente_fecha_nacimiento: paciente.fecha_nacimiento ? new Date(paciente.fecha_nacimiento) : null,
      paciente_telefono: paciente.telefono || '',
      paciente_correo: paciente.email || '',
    }));

    // Clear search and results
    setSearchQuery('');
    setSearchResults([]);
    setShowNewPatientForm(false);
  };

  // Activar formulario de nuevo paciente
  const handleNewPatient = () => {
    setShowNewPatientForm(true);
    setFormData(prev => ({
      ...prev,
      paciente_id: '',
      paciente_nombre: '',
      paciente_apellido_paterno: '',
      paciente_apellido_materno: '',
      paciente_telefono: '',
      paciente_correo: '',
      paciente_alergias: '',
    }));
    // Limpiar errores relacionados
    setFormErrors(prev => ({
      ...prev,
      paciente_nombre: false,
      paciente_apellido_paterno: false
    }));
  };

  // Manejar cambios en el formulario de paciente
  const handlePatientFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  // Manejar selección múltiple de servicios
  const handleServiceSelection = (servicio) => {
    setFormData(prev => {
      // Verificar si es el mismo servicio que ya está seleccionado
      const isAlreadySelected = prev.servicios_seleccionados.length > 0 &&
        prev.servicios_seleccionados[0].servicio_id === servicio.servicio_id;

      // Si ya está seleccionado, deseleccionar (dejar la lista vacía)
      if (isAlreadySelected) {
        return {
          ...prev,
          servicios_seleccionados: []
        };
      }

      // Si no está seleccionado o hay otro seleccionado, reemplazar con el nuevo
      return {
        ...prev,
        servicios_seleccionados: [{
          servicio_id: servicio.servicio_id,
          nombre: servicio.nombre,
          categoria_nombre: servicio.categoria_nombre,
          precio: servicio.precio
        }]
      };
    });

    // Limpiar error si es necesario
    if (formErrors.servicios_seleccionados) {
      setFormErrors(prev => ({
        ...prev,
        servicios_seleccionados: false
      }));
    }
  };
  // Calcular el precio total de los servicios seleccionados
  const calcularPrecioTotal = () => {
    if (formData.servicios_seleccionados.length === 0) {
      return '0.00';
    }
    return parseFloat(formData.servicios_seleccionados[0].precio || 0).toFixed(2);
  };

  // Manejar selección de odontólogo
  const handleOdontologoChange = (e) => {
    const odontologoId = e.target.value;
    setFormData(prev => ({
      ...prev,
      odontologo_id: odontologoId,
      // Reset date and time when changing dentist
      fecha_consulta: null,
      hora_consulta: null
    }));

    // Clear selected date to force user to select again
    setSelectedDate(null);
    setAvailableTimes([]);

    // Clear errors
    if (formErrors.odontologo_id) {
      setFormErrors(prev => ({
        ...prev,
        odontologo_id: false
      }));
    }

  };

  // Simular obtención de fechas disponibles para el odontólogo
  const fetchDisponibilidad = (odontologoId) => {
    setLoading(true);
    // Simulación: generar fechas disponibles para las próximas 2 semanas
    const fechasDisp = [];
    const hoy = new Date();

    for (let i = 1; i <= 14; i++) {
      const fecha = new Date();
      fecha.setDate(hoy.getDate() + i);

      // Excluir domingos (0 es domingo en JavaScript)
      if (fecha.getDay() !== 0) {
        fechasDisp.push(fecha);
      }
    }

    setFechasDisponibles(fechasDisp);
    setLoading(false);
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
  };

  // Manejar cambios generales en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  // Validar el paso actual antes de avanzar
  const validateStep = () => {
    switch (activeStep) {
      case 0: // Validar datos del paciente
        if (showNewPatientForm) {
          const errors = {
            paciente_nombre: !formData.paciente_nombre.trim(),
            paciente_apellido_paterno: !formData.paciente_apellido_paterno.trim(),
            paciente_apellido_materno: !formData.paciente_apellido_materno.trim(),
            paciente_genero: !formData.paciente_genero,
            paciente_fecha_nacimiento: !formData.paciente_fecha_nacimiento,
          };
          setFormErrors(prev => ({ ...prev, ...errors }));
          return !Object.values(errors).some(error => error);
        } else {
          if (!formData.paciente_id) {
            setFormErrors(prev => ({ ...prev, paciente_id: true }));
            return false;
          }
          return true;
        }

      case 1: // Validar selección de servicios
        if (formData.servicios_seleccionados.length === 0) {
          setFormErrors(prev => ({ ...prev, servicios_seleccionados: true }));
          return false;
        }
        return true;

      case 2: // Validar selección de fecha y hora
        const errors = {
          odontologo_id: !formData.odontologo_id,
          fecha_consulta: !formData.fecha_consulta,
          hora_consulta: !formData.hora_consulta
        };
        setFormErrors(prev => ({ ...prev, ...errors }));
        return !Object.values(errors).some(error => error);

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

  // Preparar datos para envío
  const prepareDataForSubmission = () => {
    // Combinar fecha y hora para crear un objeto Date
    let fechaHora = null;
    if (formData.fecha_consulta && formData.hora_consulta) {
      const [horas, minutos] = formData.hora_consulta.split(':');
      fechaHora = new Date(formData.fecha_consulta);
      fechaHora.setHours(parseInt(horas, 10), parseInt(minutos, 10), 0);
    }

    // Si es un paciente nuevo, incluir los datos para creación
    const esNuevoPaciente = showNewPatientForm;

    // Obtener información del odontólogo seleccionado
    const odontologo = odontologos.find(o => o.id === formData.odontologo_id) || {};

    // Tomar el primer servicio como principal
    const servicioPrincipal = formData.servicios_seleccionados[0] || {};

    // Formatear fecha de nacimiento a YYYY-MM-DD
    let fechaNacimiento = null;
    if (formData.paciente_fecha_nacimiento) {
      const date = new Date(formData.paciente_fecha_nacimiento);
      fechaNacimiento = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    // Estructura de datos según lo que espera el backend
    return {
      // Datos del paciente
      paciente_id: esNuevoPaciente ? null : formData.paciente_id,
      nombre: formData.paciente_nombre,
      apellido_paterno: formData.paciente_apellido_paterno,
      apellido_materno: formData.paciente_apellido_materno,
      genero: formData.paciente_genero || 'No especificado',
      fecha_nacimiento: fechaNacimiento,
      correo: formData.paciente_correo || '',
      telefono: formData.paciente_telefono || '',

      // Datos del odontólogo
      odontologo_id: formData.odontologo_id,
      odontologo_nombre: odontologo ?
        `${odontologo.nombre || ''} ${odontologo.aPaterno || ''} ${odontologo.aMaterno || ''}`.trim() :
        '',

      // Datos del servicio
      servicio_id: servicioPrincipal.servicio_id,
      servicio_nombre: servicioPrincipal.nombre,
      categoria_servicio: servicioPrincipal.categoria_nombre || 'General',
      precio_servicio: servicioPrincipal.precio || 0,

      // Datos de la cita
      fecha_hora: fechaHora?.toISOString(), // Fecha y hora combinadas
      estado: formData.estado || 'Pendiente',
      notas: formData.notas || '',

      // Variables de control
      es_nuevo_paciente: esNuevoPaciente
    };
  };

  // Enviar el formulario
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
  
    try {
      const dataToSubmit = prepareDataForSubmission();
      
      // Imprimir los datos que se enviarán al backend para debugging
      console.log("Datos a enviar al backend:", JSON.stringify(dataToSubmit, null, 2));
  
      // Usar un único endpoint para crear citas
      const endpoint = 'https://back-end-4803.onrender.com/api/citas/nueva';
  
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la cita');
      }
  
      const responseData = await response.json();
      console.log("Respuesta del servidor:", responseData);
  
      // Usar notificación en lugar de setSuccess
      setNotification({
        open: true,
        message: '¡Cita creada con éxito!',
        type: 'success',
      });
  
      // Esperar un momento y cerrar
      setTimeout(() => {
        handleClose();
        if (onAppointmentCreated) onAppointmentCreated();
      }, 1500);
  
    } catch (error) {
      console.error('Error al crear la cita:', error);
      // Usar notificación en lugar de setError
      setNotification({
        open: true,
        message: `Error: ${error.message}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Obtener información del odontólogo seleccionado
  const selectedOdontologo = odontologos.find(o => o.id === formData.odontologo_id);

  // Renderizar paso de selección de paciente
  const renderPatientSelectionStep = () => {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color={colors.primary} sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: `1px solid ${isDarkTheme ? '#2D3748' : '#E2E8F0'}`,
          pb: 1
        }}>
          <Person />
          Selección de Paciente
        </Typography>

        {!showNewPatientForm ? (
          <>
            {/* Búsqueda de pacientes existentes */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Buscar paciente (nombre, apellido, correo o teléfono)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                disabled={!!formData.paciente_id} // Deshabilitar si hay un paciente seleccionado
                InputProps={{
                  startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
                  endAdornment: isSearching ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }}
              />

              <Button
                variant="contained"
                color="secondary"
                startIcon={<PersonAdd />}
                onClick={handleNewPatient}
                disabled={!!formData.paciente_id} // Deshabilitar si hay un paciente seleccionado
                sx={{ mt: 2 }}
              >
                Nuevo Paciente
              </Button>
            </Box>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
              <Paper variant="outlined" sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
                <Box component="ul" sx={{ p: 0, m: 0, listStyleType: 'none' }}>
                  {searchResults.map((paciente) => (
                    <Box
                      component="li"
                      key={paciente.paciente_id}
                      sx={{
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                        '&:hover': { backgroundColor: 'action.hover' },
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onClick={() => handleSelectPatient(paciente)}
                    >
                      <Box>
                        <Typography variant="body1" component="div" sx={{ fontWeight: 'medium' }}>
                          {paciente.nombre} {paciente.apellido_paterno} {paciente.apellido_materno || ''}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {paciente.email || 'Sin correo'} • {paciente.telefono || 'Sin teléfono'}
                        </Typography>
                      </Box>
                      <Button size="small" variant="outlined" sx={{ minWidth: 0 }}>
                        Seleccionar
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}

            {/* Mensaje cuando no hay resultados */}
            {searchQuery && searchResults.length === 0 && !isSearching && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No se encontraron pacientes con esos datos. Puedes crear un nuevo paciente.
              </Alert>
            )}

            {/* Paciente seleccionado */}
            {formData.paciente_id && (
              <Paper
                elevation={3}
                sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: alpha(colors.primary, 0.1),
                  border: `1px solid ${alpha(colors.primary, 0.3)}`,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6">
                      {formData.paciente_nombre} {formData.paciente_apellido_paterno} {formData.paciente_apellido_materno}
                    </Typography>

                    <Typography variant="body1" sx={{ mt: 1 }}>
                      <strong>Correo:</strong> {formData.paciente_correo || 'No especificado'}
                    </Typography>

                    <Typography variant="body1">
                      <strong>Teléfono:</strong> {formData.paciente_telefono || 'No especificado'}
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Close />}
                    onClick={() => {
                      // Limpiar la selección del paciente
                      setFormData(prev => ({
                        ...prev,
                        paciente_id: '',
                        paciente_nombre: '',
                        paciente_apellido_paterno: '',
                        paciente_apellido_materno: '',
                        paciente_genero: '',
                        paciente_fecha_nacimiento: null,
                        paciente_telefono: '',
                        paciente_correo: '',
                        paciente_alergias: '',
                      }));
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                  >
                    Cancelar Selección
                  </Button>
                </Box>
              </Paper>
            )}
          </>
        ) : (
          <>
            {/* Formulario de nuevo paciente */}
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Datos del Nuevo Paciente</Typography>
                <IconButton
                  onClick={() => {
                    setShowNewPatientForm(false);
                    setFormErrors(prev => ({
                      ...prev,
                      paciente_nombre: false,
                      paciente_apellido_paterno: false,
                      paciente_genero: false,
                      paciente_fecha_nacimiento: false,
                    }));
                  }}
                  color="default"
                  size="small"
                >
                  <Close />
                </IconButton>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    name="paciente_nombre"
                    label="Nombre *"
                    fullWidth
                    value={formData.paciente_nombre}
                    onChange={handlePatientFormChange}
                    error={formErrors.paciente_nombre}
                    helperText={formErrors.paciente_nombre ? "El nombre es obligatorio" : ""}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    name="paciente_apellido_paterno"
                    label="Apellido Paterno *"
                    fullWidth
                    value={formData.paciente_apellido_paterno}
                    onChange={handlePatientFormChange}
                    error={formErrors.paciente_apellido_paterno}
                    helperText={formErrors.paciente_apellido_paterno ? "El apellido paterno es obligatorio" : ""}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    name="paciente_apellido_materno"
                    label="Apellido Materno *"
                    fullWidth
                    value={formData.paciente_apellido_materno}
                    onChange={handlePatientFormChange}
                    error={formErrors.paciente_apellido_materno}
                    helperText={formErrors.paciente_apellido_materno ? "El apellido materno es obligatorio" : ""}
                  />
                </Grid>

                {/* Nuevo campo para género */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={formErrors.paciente_genero}>
                    <InputLabel id="genero-select-label">Género *</InputLabel>
                    <Select
                      labelId="genero-select-label"
                      id="genero-select"
                      name="paciente_genero"
                      value={formData.paciente_genero || ''}
                      onChange={handlePatientFormChange}
                      label="Género *"
                    >
                      <MenuItem value="Masculino">Masculino</MenuItem>
                      <MenuItem value="Femenino">Femenino</MenuItem>
                      <MenuItem value="Otro">Otro</MenuItem>
                      <MenuItem value="No especificado">Prefiero no decirlo</MenuItem>
                    </Select>
                    {formErrors.paciente_genero && (
                      <FormHelperText>Por favor seleccione un género</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Nuevo campo para fecha de nacimiento */}
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DatePicker
                      label="Fecha de Nacimiento *"
                      value={formData.paciente_fecha_nacimiento}
                      onChange={(date) => {
                        setFormData(prev => ({
                          ...prev,
                          paciente_fecha_nacimiento: date
                        }));
                        if (formErrors.paciente_fecha_nacimiento) {
                          setFormErrors(prev => ({
                            ...prev,
                            paciente_fecha_nacimiento: false
                          }));
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: formErrors.paciente_fecha_nacimiento,
                          helperText: formErrors.paciente_fecha_nacimiento ? "La fecha de nacimiento es obligatoria" : ""
                        }
                      }}
                      disableFuture
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    name="paciente_telefono"
                    label="Teléfono"
                    fullWidth
                    value={formData.paciente_telefono}
                    onChange={handlePatientFormChange}
                    placeholder="(Opcional)"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="paciente_correo"
                    label="Correo electrónico"
                    fullWidth
                    value={formData.paciente_correo}
                    onChange={handlePatientFormChange}
                    placeholder="(Opcional)"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="notas"
                    label="Notas del paciente"
                    fullWidth
                    multiline
                    rows={2}
                    value={formData.notas}
                    onChange={handlePatientFormChange}
                    placeholder="(Opcional) Indique cualquier información adicional relevante para el paciente"
                  />
                </Grid>
              </Grid>
            </Paper>
          </>
        )}
      </Box>
    );
  };

  // Renderizar paso de selección de servicios
  const renderServiceSelectionStep = () => {
    console.log("Servicios disponibles:", servicios); // Para depuración

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color={colors.primary} sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: `1px solid ${isDarkTheme ? '#2D3748' : '#E2E8F0'}`,
          pb: 1
        }}>
          <EventAvailable />
          Selección de Servicio
        </Typography>

        {formErrors.servicios_seleccionados && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Debe seleccionar un servicio
          </Alert>
        )}

        <Typography variant="body2" sx={{ mb: 2 }}>
          Seleccione el servicio o tratamiento que se realizará durante la cita.
        </Typography>

        {/* Servicio seleccionado */}
        {formData.servicios_seleccionados.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Alert severity="success" icon={<CheckCircle />}>
              Servicio seleccionado: <strong>{formData.servicios_seleccionados[0].nombre}</strong> -
              ${parseFloat(formData.servicios_seleccionados[0].precio).toFixed(2)}
            </Alert>
          </Box>
        )}

        <Grid container spacing={2}>
          {/* Lista de servicios disponibles */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
              {servicios.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Cargando servicios disponibles...
                  </Typography>
                </Box>
              ) : (
                <Box component="ul" sx={{ p: 0, m: 0, listStyleType: 'none' }}>
                  {servicios.map((servicio) => {
                    // Comprobación de selección basada solo en id
                    const isSelected = formData.servicios_seleccionados.length > 0 &&
                      formData.servicios_seleccionados[0].servicio_id === servicio.id;

                    return (
                      <Box
                        component="li"
                        key={servicio.id}
                        sx={{
                          p: 2,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': { borderBottom: 'none' },
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: isSelected ? alpha(colors.primary, 0.1) : 'transparent',
                          transition: 'background-color 0.2s ease',
                          '&:hover': { backgroundColor: isSelected ? alpha(colors.primary, 0.2) : 'action.hover' }
                        }}
                        onClick={() => handleServiceSelection({
                          servicio_id: servicio.id,
                          nombre: servicio.title,
                          categoria_nombre: servicio.category,
                          precio: servicio.price
                        })}
                      >
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" component="div" sx={{ fontWeight: isSelected ? 'bold' : 'medium' }}>
                            {servicio.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {servicio.category || 'General'} • ${parseFloat(servicio.price).toFixed(2)}
                          </Typography>
                          {servicio.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {servicio.description}
                            </Typography>
                          )}
                        </Box>
                        <Radio
                          checked={isSelected}
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevenir que se propague el clic
                            handleServiceSelection({
                              servicio_id: servicio.id,
                              nombre: servicio.title,
                              categoria_nombre: servicio.category,
                              precio: servicio.price
                            });
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {formData.servicios_seleccionados.length > 0 && (
          <Paper sx={{ mt: 3, p: 2, backgroundColor: alpha(colors.primary, 0.1) }}>
            <Typography variant="h6">
              Resumen del servicio seleccionado
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1" sx={{ mb: 0.5, fontWeight: 'medium' }}>
                {formData.servicios_seleccionados[0].nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Categoría: {formData.servicios_seleccionados[0].categoria_nombre || 'General'}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Precio: ${parseFloat(formData.servicios_seleccionados[0].precio).toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
    );
  };

  useEffect(() => {
    if (odontologos.length === 1) {
      const odontologo = odontologos[0];
      setFormData(prev => ({
        ...prev,
        odontologo_id: odontologo.id
      }));
      fetchDisponibilidad(odontologo.id);
    }
  }, [odontologos]);

  const renderDateTimeSelectionStep = () => {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color={colors.primary} sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: `1px solid ${isDarkTheme ? '#2D3748' : '#E2E8F0'}`,
          pb: 1
        }}>
          <CalendarMonth />
          Selección de Fecha y Hora
        </Typography>
        <Grid container spacing={3}>
          {/* Selección de odontólogo */}
          <Grid item xs={12}>
            <FormControl fullWidth error={formErrors.odontologo_id}>
              <InputLabel id="odontologo-select-label">Odontólogo</InputLabel>
              <Select
                labelId="odontologo-select-label"
                id="odontologo-select"
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

          {/* Información del odontólogo seleccionado */}
          {formData.odontologo_id && selectedOdontologo && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, backgroundColor: alpha(colors.primary, 0.1) }}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  <HealthAndSafety sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                  Odontólogo: Dr. {selectedOdontologo.nombre} {selectedOdontologo.aPaterno} {selectedOdontologo.aMaterno || ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Especialidad: {selectedOdontologo.puesto || 'Odontólogo'}
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Calendario para selección de fecha */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                <Event sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                Seleccione una fecha
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
                    // Función para determinar si una fecha debe estar deshabilitada
                    shouldDisableDate={(date) => {
                      // Si no hay días laborales definidos, solo deshabilitar domingos
                      if (!workDays || workDays.length === 0) {
                        return date.getDay() === 0;
                      }
                      // Deshabilitar días que no son laborales para el odontólogo
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
                Horarios disponibles
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
              ) : availableTimes.length === 0 ? (
                <Alert severity="warning">
                  No hay horarios disponibles para esta fecha
                </Alert>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {availableTimes.map((hora) => (
                    <Chip
                      key={hora}
                      label={hora}
                      onClick={() => handleHourSelection(hora)}
                      color={formData.hora_consulta === hora ? 'primary' : 'default'}
                      variant={formData.hora_consulta === hora ? 'filled' : 'outlined'}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              )}

              {formErrors.hora_consulta && selectedDate && (
                <FormHelperText error>Debe seleccionar una hora</FormHelperText>
              )}
            </Paper>
          </Grid>

          {/* Resumen de la fecha y hora seleccionada */}
          {formData.fecha_consulta && formData.hora_consulta && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, backgroundColor: 'success.light', color: 'white' }}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  Fecha y hora seleccionada:
                </Typography>
                <Typography variant="h6">
                  {formatDate(formData.fecha_consulta)} a las {formData.hora_consulta}
                </Typography>
              </Paper>
            </Grid>
          )}

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

  // Renderizar paso de confirmación
  const renderConfirmationStep = () => {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color={colors.primary} sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: `1px solid ${isDarkTheme ? '#2D3748' : '#E2E8F0'}`,
          pb: 1
        }}>
          <Checklist />
          Confirmación de Cita
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          Por favor revise que todos los datos sean correctos antes de confirmar la cita.
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

              {formData.paciente_alergias && (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Alergias/Observaciones:</strong> {formData.paciente_alergias}
                </Typography>
              )}

              {showNewPatientForm && (
                <Chip label="Nuevo paciente" color="secondary" size="small" sx={{ mt: 1 }} />
              )}
            </Paper>
          </Grid>

          {/* Datos de la cita */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{
                fontWeight: 'bold',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <CalendarMonth fontSize="small" />
                Detalles de la Cita
              </Typography>

              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Fecha:</strong> {formatDate(formData.fecha_consulta)}
              </Typography>

              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Hora:</strong> {formData.hora_consulta}
              </Typography>

              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Odontólogo:</strong> {selectedOdontologo ?
                  `${selectedOdontologo.nombre} ${selectedOdontologo.apellido_paterno} ${selectedOdontologo.apellido_materno || ''}` :
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
                Servicios Seleccionados
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
                      {index + 1}. {servicio.nombre}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      ${parseFloat(servicio.precio || 0).toFixed(2)}
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



  return (
    <Dialog
      open={open}
      onClose={loading ? null : handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          backgroundColor: colors.cardBg,
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: colors.primary,
          color: 'white',
          py: 2.5,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          fontSize: '1.25rem',
          fontWeight: 600
        }}
      >
        <CalendarMonth sx={{ fontSize: 28 }} />
        {activeStep === 3 ? 'Confirmar Cita' : 'Nueva Cita'}
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 4 }}>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: '8px',
              '& .MuiAlert-icon': { fontSize: '1.5rem' }
            }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{
              mb: 3,
              borderRadius: '8px',
              '& .MuiAlert-icon': { fontSize: '1.5rem' }
            }}
          >
            {success}
          </Alert>
        )}

        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            mb: 4,
            '& .MuiStepIcon-root': {
              fontSize: '1.75rem',
              '&.Mui-completed': { color: '#4caf50' },
              '&.Mui-active': { color: colors.primary }
            },
            '& .MuiStepLabel-label': {
              mt: 1,
              fontSize: '0.9rem'
            }
          }}
        >
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
            overflow: 'hidden',
            mb: 3
          }}
        >
          {/* Renderizar el contenido del paso actual */}
          {activeStep === 0 && renderPatientSelectionStep()}
          {activeStep === 1 && renderServiceSelectionStep()}
          {activeStep === 2 && renderDateTimeSelectionStep()}
          {activeStep === 3 && renderConfirmationStep()}
        </Paper>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          pt: 1,
          justifyContent: 'space-between',
          borderTop: '1px solid',
          borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
        }}
      >
        <Box>
          {activeStep === 0 ? (
            <Button
              onClick={handleClose}
              variant="outlined"
              color="inherit"
              disabled={loading}
              sx={{
                borderRadius: '8px',
                py: 1,
                px: 2
              }}
            >
              Cancelar
            </Button>
          ) : (
            <Button
              onClick={handleBack}
              variant="outlined"
              color="inherit"
              startIcon={<ArrowBackIosNew />}
              disabled={loading}
              sx={{
                borderRadius: '8px',
                py: 1,
                px: 2
              }}
            >
              Atrás
            </Button>
          )}
        </Box>

        <Box>
          {activeStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              variant="contained"
              color="primary"
              endIcon={<ArrowForwardIos />}
              sx={{
                borderRadius: '8px',
                py: 1,
                px: 3,
                boxShadow: '0 4px 12px rgba(0, 120, 200, 0.2)',
                '&:hover': {
                  boxShadow: '0 6px 14px rgba(0, 120, 200, 0.3)'
                }
              }}
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
              sx={{
                borderRadius: '8px',
                py: 1,
                px: 3,
                backgroundColor: '#2e7d32',
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
                '&:hover': {
                  backgroundColor: '#1b5e20',
                  boxShadow: '0 6px 14px rgba(46, 125, 50, 0.3)'
                }
              }}
            >
              {loading ? 'Guardando...' : 'Confirmar Cita'}
            </Button>
          )}
        </Box>
      </DialogActions>
      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        onClose={handleNotificationClose}
      />

    </Dialog>
  );

};

export default NewCita;