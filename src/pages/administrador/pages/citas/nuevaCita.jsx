import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Grid, Typography, FormHelperText, Box, CircularProgress,
  Divider, Alert, Step, StepLabel, Stepper, Paper, Chip,
  FormControlLabel, Switch, Autocomplete, Checkbox, IconButton, alpha  
} from '@mui/material';
import { 
  Add, CalendarMonth, Person, EventAvailable, Checklist, Search, ArrowBackIosNew, CheckCircle,
  PersonAdd, Close, InfoOutlined, LocalHospital, Event, HealthAndSafety, AccessTime, ArrowForwardIos
} from '@mui/icons-material';
import { useThemeContext } from '../../../../components/Tools/ThemeContext';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateCalendar, TimePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';

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

  // Estados para el formulario
  const [formData, setFormData] = useState({
    // Datos del paciente
    paciente_id: '',
    paciente_nombre: '',
    paciente_apellido_paterno: '',
    paciente_apellido_materno: '',
    paciente_telefono: '',
    paciente_correo: '',
    paciente_alergias: '',
    
    // Servicios seleccionados (array para permitir múltiples)
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
      paciente_telefono: '',
      paciente_correo: '',
      paciente_alergias: '',
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
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar la lista de odontólogos');
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
      // Filtrar pacientes localmente por nombre o correo similar (simulación de búsqueda)
      const filteredPacientes = pacientes.filter(paciente => 
        paciente.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        paciente.apellido_paterno?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paciente.apellido_materno?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paciente.correo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      paciente_id: paciente.paciente_id,
      paciente_nombre: paciente.nombre,
      paciente_apellido_paterno: paciente.apellido_paterno,
      paciente_apellido_materno: paciente.apellido_materno || '',
      paciente_telefono: paciente.telefono || '',
      paciente_correo: paciente.correo || '',
      paciente_alergias: paciente.alergias || '',
    }));

    // Limpiar búsqueda y resultados
    setSearchQuery('');
    setSearchResults([]);
    setShowNewPatientForm(false);
  };

  // Activar formulario de nuevo paciente
  const handleNewPatient = () => {
    setShowNewPatientForm(true);
    setFormData(prev => ({
      ...prev,
      paciente_id: '', // Limpiar ID si había uno seleccionado
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
      // Verificar si el servicio ya está seleccionado
      const isSelected = prev.servicios_seleccionados.some(
        item => item.servicio_id === servicio.servicio_id
      );

      let updatedServicios;
      if (isSelected) {
        // Remover servicio si ya estaba seleccionado
        updatedServicios = prev.servicios_seleccionados.filter(
          item => item.servicio_id !== servicio.servicio_id
        );
      } else {
        // Agregar servicio a la lista
        updatedServicios = [
          ...prev.servicios_seleccionados,
          {
            servicio_id: servicio.servicio_id,
            nombre: servicio.nombre,
            categoria_nombre: servicio.categoria_nombre,
            precio: servicio.precio
          }
        ];
      }

      return {
        ...prev,
        servicios_seleccionados: updatedServicios
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
    return formData.servicios_seleccionados.reduce(
      (total, servicio) => total + parseFloat(servicio.precio || 0), 
      0
    ).toFixed(2);
  };

  // Manejar selección de odontólogo
  const handleOdontologoChange = (e) => {
    const odontologoId = e.target.value;
    setFormData(prev => ({
      ...prev,
      odontologo_id: odontologoId
    }));

    if (formErrors.odontologo_id) {
      setFormErrors(prev => ({
        ...prev,
        odontologo_id: false
      }));
    }

    // Si hay un odontólogo seleccionado, actualizar fechas disponibles
    if (odontologoId) {
      fetchDisponibilidad(odontologoId);
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

  // Manejar selección de fecha en el calendario
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

    // Generar horarios disponibles para la fecha seleccionada
    generateAvailableHours(date);
  };

  // Generar horarios disponibles para la fecha seleccionada
  const generateAvailableHours = (date) => {
    const horarios = [];
    
    // Horarios de mañana: 9:00 a 13:00
    for (let hora = 9; hora <= 13; hora++) {
      for (let minuto of [0, 30]) {
        const horaFormateada = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
        horarios.push(horaFormateada);
      }
    }
    
    // Horarios de tarde: 15:00 a 19:00 (excluye hora de comida)
    for (let hora = 15; hora <= 19; hora++) {
      for (let minuto of [0, 30]) {
        const horaFormateada = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
        horarios.push(horaFormateada);
      }
    }
    
    setHorariosDisponibles(horarios);
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
          // Validar formulario de nuevo paciente
          const errors = {
            paciente_nombre: !formData.paciente_nombre.trim(),
            paciente_apellido_paterno: !formData.paciente_apellido_paterno.trim(),
          };
          setFormErrors(prev => ({ ...prev, ...errors }));
          return !Object.values(errors).some(error => error);
        } else {
          // Validar selección de paciente existente
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
    
    // Tomar el primer servicio como principal (para compatibilidad)
    const serviciosPrincipal = formData.servicios_seleccionados[0];
    
    return {
      // Datos del paciente
      paciente_id: esNuevoPaciente ? null : formData.paciente_id,
      nombre: formData.paciente_nombre,
      apellido_paterno: formData.paciente_apellido_paterno,
      apellido_materno: formData.paciente_apellido_materno,
      telefono: formData.paciente_telefono,
      correo: formData.paciente_correo,
      alergias: formData.paciente_alergias,
      
      // Datos del servicio principal (para API existente)
      servicio_id: serviciosPrincipal.servicio_id,
      servicio_nombre: serviciosPrincipal.nombre,
      categoria_servicio: serviciosPrincipal.categoria_nombre,
      precio_servicio: serviciosPrincipal.precio,
      
      // Servicios adicionales como JSON string (para extensión futura)
      servicios_adicionales: JSON.stringify(
        formData.servicios_seleccionados.slice(1)
      ),
      
      // Datos de la cita
      odontologo_id: formData.odontologo_id,
      fecha_hora: fechaHora?.toISOString(), // Fecha y hora combinadas
      estado: formData.estado,
      notas: formData.notas,
      
      // Flag para indicar si es nuevo paciente
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
      
      // Endpoint: si es paciente nuevo, usar /citas/nueva, de lo contrario /citas/create
      const endpoint = showNewPatientForm 
        ? 'https://back-end-4803.onrender.com/api/citas/nueva'
        : 'https://back-end-4803.onrender.com/api/citas/create';
      
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

      setSuccess('¡Cita creada con éxito!');
      
      // Esperar un momento y cerrar
      setTimeout(() => {
        handleClose();
        if (onAppointmentCreated) onAppointmentCreated();
      }, 1500);
      
    } catch (error) {
      console.error('Error al crear la cita:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Obtener información del odontólogo seleccionado
  const selectedOdontologo = odontologos.find(o => o.odontologo_id === formData.odontologo_id);

  // Renderizar el paso de selección de fecha y hora
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
          <Grid item xs={12} md={12}>
            <FormControl fullWidth error={formErrors.odontologo_id}>
              <InputLabel>Odontólogo</InputLabel>
              <Select
                name="odontologo_id"
                value={formData.odontologo_id}
                onChange={handleOdontologoChange}
                label="Odontólogo"
                disabled={loading}
              >
                {odontologos.map((odontologo) => (
                  <MenuItem key={odontologo.odontologo_id} value={odontologo.odontologo_id}>
                    {`${odontologo.nombre} ${odontologo.apellido_paterno} ${odontologo.apellido_materno || ''}`}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.odontologo_id && (
                <FormHelperText>Debe seleccionar un odontólogo</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {selectedOdontologo && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, backgroundColor: alpha(colors.primary, 0.1) }}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  <HealthAndSafety sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                  {selectedOdontologo.nombre} {selectedOdontologo.apellido_paterno} {selectedOdontologo.apellido_materno || ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Especialidad: {selectedOdontologo.especialidad || 'General'}
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Calendario para selección de fecha */}
          {formData.odontologo_id && (
            <>
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                    <Event sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                    Seleccione una fecha
                  </Typography>
                  
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DateCalendar
                      value={selectedDate}
                      onChange={handleDateSelection}
                      minDate={new Date()}
                      disablePast
                      sx={{ width: '100%' }}
                      // Función para determinar si una fecha debe estar deshabilitada
                      shouldDisableDate={(date) => {
                        // Deshabilitar fines de semana (0 = domingo, 6 = sábado)
                        const day = date.getDay();
                        return day === 0; // Sólo deshabilitar domingos
                      }}
                    />
                  </LocalizationProvider>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                  <AccessTime sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                  Horarios disponibles
                  </Typography>
                  
                  {selectedDate ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {horariosDisponibles.map((hora) => (
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
                  ) : (
                    <Alert severity="info">
                      Seleccione primero una fecha para ver los horarios disponibles
                    </Alert>
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
            </>
          )}
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
                          {paciente.correo || 'Sin correo'} • {paciente.telefono || 'Sin teléfono'}
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
                    }}
                  >
                    Eliminar
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
                      paciente_apellido_paterno: false
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
                    label="Apellido Materno"
                    fullWidth
                    value={formData.paciente_apellido_materno}
                    onChange={handlePatientFormChange}
                  />
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
                    name="paciente_alergias"
                    label="Alergias u observaciones"
                    fullWidth
                    multiline
                    rows={2}
                    value={formData.paciente_alergias}
                    onChange={handlePatientFormChange}
                    placeholder="(Opcional) Indique si el paciente tiene alergias o condiciones especiales"
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
          Selección de Servicios
        </Typography>

        {formErrors.servicios_seleccionados && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Debe seleccionar al menos un servicio
          </Alert>
        )}

        <Typography variant="body2" sx={{ mb: 2 }}>
          Seleccione los servicios o tratamientos que se realizarán durante la cita.
          Puede seleccionar múltiples servicios si es necesario.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {formData.servicios_seleccionados.map((servicio) => (
            <Chip
              key={servicio.servicio_id}
              label={`${servicio.nombre} - ${parseFloat(servicio.precio).toFixed(2)}`}
              onDelete={() => handleServiceSelection(servicio)}
              color="primary"
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Box>

        <Grid container spacing={2}>
          {/* Lista de servicios disponibles */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
              <Box component="ul" sx={{ p: 0, m: 0, listStyleType: 'none' }}>
                {servicios.map((servicio) => {
                  const isSelected = formData.servicios_seleccionados.some(
                    s => s.servicio_id === servicio.servicio_id
                  );
                  
                  return (
                    <Box
                      component="li"
                      key={servicio.servicio_id}
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
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" component="div" sx={{ fontWeight: isSelected ? 'bold' : 'medium' }}>
                          {servicio.nombre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {servicio.categoria_nombre || 'General'} • ${parseFloat(servicio.precio || 0).toFixed(2)}
                        </Typography>
                        {servicio.descripcion && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {servicio.descripcion}
                          </Typography>
                        )}
                      </Box>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={isSelected}
                            onChange={() => handleServiceSelection(servicio)}
                            color="primary"
                          />
                        }
                        label=""
                        sx={{ mr: 0 }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {formData.servicios_seleccionados.length > 0 && (
          <Paper sx={{ mt: 3, p: 2, backgroundColor: alpha(colors.primary, 0.1) }}>
            <Typography variant="h6">
              Resumen de servicios seleccionados
            </Typography>
            <Box sx={{ mt: 1 }}>
              {formData.servicios_seleccionados.map((servicio, index) => (
                <Typography key={servicio.servicio_id} variant="body2" sx={{ mb: 0.5 }}>
                  {index + 1}. {servicio.nombre}: ${parseFloat(servicio.precio || 0).toFixed(2)}
                </Typography>
              ))}
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Total: ${calcularPrecioTotal()}
              </Typography>
            </Box>
          </Paper>
        )}
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
          overflow: 'hidden'
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
    </Dialog>
  );
  
};

export default NewCita;