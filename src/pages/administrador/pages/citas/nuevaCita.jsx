import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, FormControl, InputLabel, Select, MenuItem, 
  Grid, Typography, FormHelperText, Box, CircularProgress,
  Divider, Alert, Step, StepLabel, Stepper, Paper
} from '@mui/material';
import { Add, CalendarMonth, Person, HealthAndSafety, EventAvailable, Checklist } from '@mui/icons-material';
import { useThemeContext } from '../../../../components/Tools/ThemeContext';

const NewCita = ({ open, handleClose, onAppointmentCreated }) => {
  const { isDarkTheme } = useThemeContext();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [odontologos, setOdontologos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para el formulario
  const [formData, setFormData] = useState({
    paciente_id: '',
    servicio_id: '',
    odontologo_id: '',
    fecha_consulta: null,
    estado: 'Pendiente',
    notas: ''
  });

  // Estados de validación
  const [formErrors, setFormErrors] = useState({
    paciente_id: false,
    servicio_id: false,
    odontologo_id: false,
    fecha_consulta: false
  });

  // Pasos del formulario
  const steps = ['Seleccionar Paciente', 'Elegir Servicio', 'Detalles de la Cita', 'Confirmar'];

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
      servicio_id: '',
      odontologo_id: '',
      fecha_consulta: null,
      estado: 'Pendiente',
      notas: ''
    });
    setFormErrors({
      paciente_id: false,
      servicio_id: false,
      odontologo_id: false,
      fecha_consulta: false
    });
    setActiveStep(0);
    setError('');
    setSuccess('');
  };

  // Fetching de servicios
  const fetchServicios = async () => {
    try {
      const response = await fetch('https://back-end-4803.onrender.com/api/servicios/all');
      if (!response.ok) throw new Error('Error al cargar servicios');
      const data = await response.json();
      setServicios(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar la lista de servicios');
    }
  };

  // Fetching de odontólogos
  const fetchOdontologos = async () => {
    try {
      const response = await fetch('https://back-end-4803.onrender.com/api/odontologos/all');
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

  // Manejar cambios en el formulario
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

  // Manejar cambio de fecha
  const handleDateChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      fecha_consulta: value ? new Date(value) : null
    }));

    if (formErrors.fecha_consulta) {
      setFormErrors(prev => ({
        ...prev,
        fecha_consulta: false
      }));
    }
  };

  // Validar paso actual
  const validateStep = () => {
    switch (activeStep) {
      case 0: // Paciente
        if (!formData.paciente_id) {
          setFormErrors(prev => ({ ...prev, paciente_id: true }));
          return false;
        }
        return true;
      
      case 1: // Servicio
        if (!formData.servicio_id) {
          setFormErrors(prev => ({ ...prev, servicio_id: true }));
          return false;
        }
        return true;
      
      case 2: // Detalles
        const errors = {
          odontologo_id: !formData.odontologo_id,
          fecha_consulta: !formData.fecha_consulta
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

  // Enviar el formulario
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('https://back-end-4803.onrender.com/api/citas/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paciente_id: formData.paciente_id,
          servicio_id: formData.servicio_id,
          odontologo_id: formData.odontologo_id,
          fecha_consulta: formData.fecha_consulta,
          estado: formData.estado,
          notas: formData.notas
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la cita');
      }

      setSuccess('¡Cita creada con éxito!');
      
      // Esperar un momento y cerrar
      setTimeout(() => {
        handleClose();
        if (onAppointmentCreated) onAppointmentCreated();
      }, 1500);
      
    } catch (error) {
      console.error('Error al crear la cita:', error);
      setError('Ocurrió un error al crear la cita. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Obtener información del paciente seleccionado
  const selectedPaciente = pacientes.find(p => p.paciente_id === formData.paciente_id);

  // Obtener información del servicio seleccionado
  const selectedServicio = servicios.find(s => s.servicio_id === formData.servicio_id);

  // Obtener información del odontólogo seleccionado
  const selectedOdontologo = odontologos.find(o => o.odontologo_id === formData.odontologo_id);

  // Formatear fecha para mostrar
  const formatDate = (date) => {
    if (!date) return 'No seleccionada';
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Colores del tema
  const colors = {
    background: isDarkTheme ? '#0D1B2A' : '#ffffff',
    primary: isDarkTheme ? '#00BCD4' : '#03427C',
    text: isDarkTheme ? '#ffffff' : '#1a1a1a',
    cardBg: isDarkTheme ? '#1A2735' : '#ffffff',
    step: isDarkTheme ? '#00BCD4' : '#2196f3',
  };

  // Renderizar contenido según el paso actual
  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Seleccionar Paciente
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" color={colors.primary} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person />
              Seleccione un Paciente
            </Typography>
            <FormControl fullWidth error={formErrors.paciente_id}>
              <InputLabel>Paciente</InputLabel>
              <Select
                name="paciente_id"
                value={formData.paciente_id}
                onChange={handleChange}
                label="Paciente"
                disabled={loading}
              >
                {pacientes.map((paciente) => (
                  <MenuItem key={paciente.paciente_id} value={paciente.paciente_id}>
                    {`${paciente.nombre} ${paciente.apellido_paterno} ${paciente.apellido_materno || ''}`}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.paciente_id && (
                <FormHelperText>El paciente es requerido</FormHelperText>
              )}
            </FormControl>

            {selectedPaciente && (
              <Paper sx={{ p: 2, mt: 2, backgroundColor: 'rgba(33, 150, 243, 0.1)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Información del Paciente
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Nombre:</strong> {selectedPaciente.nombre} {selectedPaciente.apellido_paterno} {selectedPaciente.apellido_materno}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Teléfono:</strong> {selectedPaciente.telefono || 'No especificado'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Correo:</strong> {selectedPaciente.correo || 'No especificado'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Género:</strong> {selectedPaciente.genero || 'No especificado'}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Box>
        );
      
      case 1: // Elegir Servicio
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" color={colors.primary} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventAvailable />
              Seleccione un Servicio
            </Typography>
            <FormControl fullWidth error={formErrors.servicio_id}>
              <InputLabel>Servicio</InputLabel>
              <Select
                name="servicio_id"
                value={formData.servicio_id}
                onChange={handleChange}
                label="Servicio"
                disabled={loading}
              >
                {servicios.map((servicio) => (
                  <MenuItem key={servicio.servicio_id} value={servicio.servicio_id}>
                    {servicio.nombre}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.servicio_id && (
                <FormHelperText>El servicio es requerido</FormHelperText>
              )}
            </FormControl>

            {selectedServicio && (
              <Paper sx={{ p: 2, mt: 2, backgroundColor: 'rgba(33, 150, 243, 0.1)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Información del Servicio
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Nombre:</strong> {selectedServicio.nombre}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Categoría:</strong> {selectedServicio.categoria_nombre || 'General'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Precio:</strong> ${selectedServicio.precio || '0.00'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Duración:</strong> {selectedServicio.duracion || 'No especificada'}</Typography>
                  </Grid>
                  {selectedServicio.descripcion && (
                    <Grid item xs={12}>
                      <Typography><strong>Descripción:</strong> {selectedServicio.descripcion}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            )}
          </Box>
        );
      
      case 2: // Detalles de la Cita
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" color={colors.primary} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarMonth />
              Detalles de la Cita
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={formErrors.odontologo_id}>
                  <InputLabel>Odontólogo</InputLabel>
                  <Select
                    name="odontologo_id"
                    value={formData.odontologo_id}
                    onChange={handleChange}
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
                    <FormHelperText>El odontólogo es requerido</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  type="datetime-local"
                  label="Fecha y Hora"
                  name="fecha_consulta"
                  value={formData.fecha_consulta instanceof Date 
                    ? formData.fecha_consulta.toISOString().slice(0, 16)
                    : formData.fecha_consulta || ''}
                  onChange={handleDateChange}
                  fullWidth
                  error={formErrors.fecha_consulta}
                  helperText={formErrors.fecha_consulta ? "La fecha es requerida" : ""}
                  InputLabelProps={{ shrink: true }}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="notas"
                  label="Notas adicionales"
                  multiline
                  rows={3}
                  fullWidth
                  value={formData.notas}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Cualquier información adicional relevante para la cita"
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 3: // Confirmar
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" color={colors.primary} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Checklist />
              Confirmar Información
            </Typography>
            
            <Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(33, 150, 243, 0.08)' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Resumen de la Cita
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ mb: 1 }}>
                    <strong>Paciente:</strong> {selectedPaciente ? 
                      `${selectedPaciente.nombre} ${selectedPaciente.apellido_paterno} ${selectedPaciente.apellido_materno || ''}` : 
                      'No seleccionado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ mb: 1 }}>
                    <strong>Servicio:</strong> {selectedServicio ? selectedServicio.nombre : 'No seleccionado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ mb: 1 }}>
                    <strong>Odontólogo:</strong> {selectedOdontologo ? 
                      `${selectedOdontologo.nombre} ${selectedOdontologo.apellido_paterno} ${selectedOdontologo.apellido_materno || ''}` : 
                      'No seleccionado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ mb: 1 }}>
                    <strong>Fecha y Hora:</strong> {formatDate(formData.fecha_consulta)}
                  </Typography>
                </Grid>
                {formData.notas && (
                  <Grid item xs={12}>
                    <Typography>
                      <strong>Notas:</strong> {formData.notas}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Por favor revise que todos los datos sean correctos antes de confirmar la cita.
              Al hacer clic en "Crear Cita" se enviará una notificación al paciente y al odontólogo.
            </Typography>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? null : handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: colors.cardBg,
          color: colors.text
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: colors.primary, 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Add />
        Nueva Cita
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
          )}
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {renderStepContent()}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={activeStep === 0 ? handleClose : handleBack} 
          color="inherit" 
          disabled={loading}
        >
          {activeStep === 0 ? 'Cancelar' : 'Atrás'}
        </Button>
        
        {activeStep === steps.length - 1 ? (
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Creando...' : 'Crear Cita'}
          </Button>
        ) : (
          <Button 
            onClick={handleNext} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            Siguiente
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default NewCita;