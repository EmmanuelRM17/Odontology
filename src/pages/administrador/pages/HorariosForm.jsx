import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Typography,
  Divider,
  CircularProgress,
  IconButton,
  FormControlLabel,
  Switch,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Tooltip
} from '@mui/material';
import { 
  Save, 
  AccessTime, 
  Person, 
  Delete,
  Add,
  ArrowBack,
  EventAvailable,
  EventBusy
} from '@mui/icons-material';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useNavigate } from 'react-router-dom';

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const HorariosForm = () => {
  const navigate = useNavigate();
  const { isDarkTheme } = useThemeContext();
  const [loading, setLoading] = useState(false);
  const [odontologos, setOdontologos] = useState([]);
  const [selectedOdontologo, setSelectedOdontologo] = useState('');
  
  // Estado para los horarios por día
  const [horariosPorDia, setHorariosPorDia] = useState({
    Lunes: { activo: true, franjas: [{ hora_inicio: '09:00', hora_fin: '12:00', duracion: 30 }] },
    Martes: { activo: true, franjas: [{ hora_inicio: '09:00', hora_fin: '12:00', duracion: 30 }] },
    Miércoles: { activo: true, franjas: [{ hora_inicio: '09:00', hora_fin: '12:00', duracion: 30 }] },
    Jueves: { activo: true, franjas: [{ hora_inicio: '09:00', hora_fin: '12:00', duracion: 30 }] },
    Viernes: { activo: true, franjas: [{ hora_inicio: '09:00', hora_fin: '12:00', duracion: 30 }] },
    Sábado: { activo: false, franjas: [{ hora_inicio: '09:00', hora_fin: '12:00', duracion: 30 }] },
    Domingo: { activo: false, franjas: [{ hora_inicio: '09:00', hora_fin: '12:00', duracion: 30 }] },
  });

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: ''
  });

  // Cargar odontólogos activos
  useEffect(() => {
    const fetchOdontologos = async () => {
      try {
        const response = await fetch('https://back-end-4803.onrender.com/api/empleados/odontologos/activos');
        if (!response.ok) throw new Error('Error al cargar odontólogos');
        const data = await response.json();
        setOdontologos(data);
        
        // Si solo hay un odontólogo, seleccionarlo automáticamente
        if (data.length === 1) {
          setSelectedOdontologo(data[0].id.toString());
        }
      } catch (error) {
        console.error('Error:', error);
        setNotification({
          open: true,
          message: 'Error al cargar la lista de odontólogos',
          type: 'error'
        });
      }
    };
    fetchOdontologos();
  }, []);

  // Cambiar estado activo/inactivo de un día
  const handleDiaActivoChange = (dia) => {
    setHorariosPorDia(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        activo: !prev[dia].activo
      }
    }));
  };

  // Manejar cambios en los campos de horario
  const handleHorarioChange = (dia, index, field, value) => {
    const newHorarios = { ...horariosPorDia };
    newHorarios[dia].franjas[index][field] = value;
    
    // Si cambió hora_inicio o hora_fin, recalcular duración
    if (field === 'hora_inicio' || field === 'hora_fin') {
      const franja = newHorarios[dia].franjas[index];
      const inicio = new Date(`2023-01-01T${franja.hora_inicio}:00`);
      const fin = new Date(`2023-01-01T${franja.hora_fin}:00`);
      
      if (!isNaN(inicio.getTime()) && !isNaN(fin.getTime()) && fin > inicio) {
        const diferencia = Math.abs(fin - inicio) / (1000 * 60); // diferencia en minutos
        newHorarios[dia].franjas[index].duracion = diferencia;
      }
    }
    
    setHorariosPorDia(newHorarios);
  };

  // Agregar nueva franja horaria a un día
  const agregarFranjaHoraria = (dia) => {
    const ultimaFranja = horariosPorDia[dia].franjas[horariosPorDia[dia].franjas.length - 1];
    
    // Calcular nueva hora de inicio (30 min después de la última hora de fin)
    const ultimaHoraFin = new Date(`2023-01-01T${ultimaFranja.hora_fin}:00`);
    ultimaHoraFin.setMinutes(ultimaHoraFin.getMinutes() + 30);
    const nuevaHoraInicio = ultimaHoraFin.toTimeString().slice(0, 5);
    
    // Calcular nueva hora de fin (3 horas después del nuevo inicio)
    const nuevaHoraFin = new Date(`2023-01-01T${nuevaHoraInicio}:00`);
    nuevaHoraFin.setHours(nuevaHoraFin.getHours() + 3);
    const horaFinStr = nuevaHoraFin.toTimeString().slice(0, 5);
    
    setHorariosPorDia(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        franjas: [
          ...prev[dia].franjas,
          { hora_inicio: nuevaHoraInicio, hora_fin: horaFinStr, duracion: 30 }
        ]
      }
    }));
  };

  // Eliminar franja horaria
  const eliminarFranjaHoraria = (dia, index) => {
    if (horariosPorDia[dia].franjas.length <= 1) {
      setNotification({
        open: true,
        message: 'Debe haber al menos una franja horaria para los días activos',
        type: 'warning'
      });
      return;
    }
    
    const newHorarios = { ...horariosPorDia };
    newHorarios[dia].franjas.splice(index, 1);
    setHorariosPorDia(newHorarios);
  };

  // Validación del formulario
  const validateForm = () => {
    if (!selectedOdontologo) {
      setNotification({
        open: true,
        message: 'Debe seleccionar un odontólogo',
        type: 'error'
      });
      return false;
    }
    
    // Verificar que haya al menos un día activo
    const hayDiasActivos = Object.values(horariosPorDia).some(dia => dia.activo);
    if (!hayDiasActivos) {
      setNotification({
        open: true,
        message: 'Debe haber al menos un día de trabajo activo',
        type: 'error'
      });
      return false;
    }
    
    // Verificar cada franja horaria de los días activos
    let isValid = true;
    let mensajeError = '';
    
    Object.entries(horariosPorDia).forEach(([dia, config]) => {
      if (config.activo) {
        config.franjas.forEach((franja, index) => {
          const inicio = new Date(`2023-01-01T${franja.hora_inicio}:00`);
          const fin = new Date(`2023-01-01T${franja.hora_fin}:00`);
          
          if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
            isValid = false;
            mensajeError = `Horario inválido en ${dia}`;
          } else if (fin <= inicio) {
            isValid = false;
            mensajeError = `La hora de fin debe ser posterior a la hora de inicio en ${dia}`;
          } else if (franja.duracion <= 0) {
            isValid = false;
            mensajeError = `La duración debe ser mayor a 0 en ${dia}`;
          }
          
          // Verificar que no haya solapamiento entre franjas del mismo día
          if (isValid && config.franjas.length > 1) {
            for (let i = 0; i < config.franjas.length; i++) {
              if (i !== index) {
                const otraInicio = new Date(`2023-01-01T${config.franjas[i].hora_inicio}:00`);
                const otraFin = new Date(`2023-01-01T${config.franjas[i].hora_fin}:00`);
                
                if ((inicio >= otraInicio && inicio < otraFin) || 
                    (fin > otraInicio && fin <= otraFin) ||
                    (inicio <= otraInicio && fin >= otraFin)) {
                  isValid = false;
                  mensajeError = `Hay franjas horarias que se solapan en ${dia}`;
                  break;
                }
              }
            }
          }
        });
      }
    });
    
    if (!isValid) {
      setNotification({
        open: true,
        message: mensajeError,
        type: 'error'
      });
      return false;
    }
    
    return true;
  };

  // Envío del formulario
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setNotification({ open: false, message: '', type: '' });

    try {
      // Preparar datos para enviar
      const horariosProcesados = [];
      
      Object.entries(horariosPorDia).forEach(([dia, config]) => {
        if (config.activo) {
          config.franjas.forEach(franja => {
            horariosProcesados.push({
              empleado_id: parseInt(selectedOdontologo),
              dia_semana: dia,
              hora_inicio: franja.hora_inicio,
              hora_fin: franja.hora_fin,
              duracion: parseInt(franja.duracion)
            });
          });
        }
      });
      
      // Primero eliminar horarios existentes para este odontólogo
      const responseDelete = await fetch(`https://back-end-4803.onrender.com/api/horarios/delete-by-empleado/${selectedOdontologo}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!responseDelete.ok) throw new Error('Error al eliminar horarios anteriores');
      
      // Crear nuevos horarios
      const responseCreate = await fetch('https://back-end-4803.onrender.com/api/horarios/create-multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(horariosProcesados)
      });
      
      if (!responseCreate.ok) throw new Error('Error al crear nuevos horarios');

      setNotification({
        open: true,
        message: 'Horarios guardados con éxito!',
        type: 'success'
      });

      // Redirigir después de un tiempo
      setTimeout(() => {
        navigate('/admin/horarios');
      }, 2000);

    } catch (error) {
      console.error('Error al guardar horarios:', error);
      setNotification({
        open: true,
        message: 'Ocurrió un error al guardar los horarios. Por favor intente nuevamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Definición de colores según el tema
  const colors = {
    background: isDarkTheme ? '#0D1B2A' : '#f5f5f5',
    paper: isDarkTheme ? '#1A2735' : '#ffffff',
    primary: isDarkTheme ? '#00BCD4' : '#03427C',
    text: isDarkTheme ? '#ffffff' : '#1a1a1a',
    divider: isDarkTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    success: isDarkTheme ? '#4caf50' : '#4caf50',
    error: isDarkTheme ? '#f44336' : '#f44336'
  };

  return (
    <Box sx={{ p: 3, backgroundColor: colors.background, minHeight: '100vh' }}>
      <Card sx={{
        mb: 4,
        backgroundColor: colors.paper,
        color: colors.text,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        borderRadius: '8px'
      }}>
        <CardHeader
          title={
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime />
              Configuración de Horarios
            </Typography>
          }
          sx={{
            backgroundColor: colors.primary,
            color: 'white',
            borderBottom: `1px solid ${colors.divider}`
          }}
        />

        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Sección de odontólogo */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person fontSize="small" />
                Seleccionar Odontólogo
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Odontólogo</InputLabel>
                <Select
                  value={selectedOdontologo}
                  onChange={(e) => setSelectedOdontologo(e.target.value)}
                  label="Odontólogo"
                  disabled={loading || odontologos.length === 1}
                >
                  {odontologos.map(odontologo => (
                    <MenuItem key={odontologo.id} value={odontologo.id.toString()}>
                      {odontologo.nombre} {odontologo.aPaterno} {odontologo.aMaterno}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Sección de configuración de horarios */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime fontSize="small" />
                Configuración de Horarios por Día
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Tarjetas para cada día de la semana */}
            {diasSemana.map((dia) => (
              <Grid item xs={12} key={dia}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    backgroundColor: horariosPorDia[dia].activo 
                      ? isDarkTheme ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)' 
                      : isDarkTheme ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.05)',
                    borderLeft: `4px solid ${horariosPorDia[dia].activo ? colors.success : colors.error}`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    {/* Día y switch de activación */}
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={horariosPorDia[dia].activo}
                              onChange={() => handleDiaActivoChange(dia)}
                              color="primary"
                            />
                          }
                          label={
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {dia}
                            </Typography>
                          }
                        />
                        {horariosPorDia[dia].activo ? (
                          <Chip 
                            size="small" 
                            label="Activo" 
                            color="success" 
                            icon={<EventAvailable />} 
                            sx={{ ml: 1 }}
                          />
                        ) : (
                          <Chip 
                            size="small" 
                            label="Inactivo" 
                            color="error" 
                            icon={<EventBusy />} 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </Grid>
                    
                    {/* Franjas horarias */}
                    <Grid item xs={12} sm={9}>
                      {horariosPorDia[dia].activo && (
                        <Box>
                          {horariosPorDia[dia].franjas.map((franja, index) => (
                            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                              <Grid item xs={12} sm={4}>
                                <TextField
                                  label="Hora inicio"
                                  type="time"
                                  value={franja.hora_inicio}
                                  onChange={(e) => handleHorarioChange(dia, index, 'hora_inicio', e.target.value)}
                                  fullWidth
                                  InputLabelProps={{ shrink: true }}
                                  disabled={loading}
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <TextField
                                  label="Hora fin"
                                  type="time"
                                  value={franja.hora_fin}
                                  onChange={(e) => handleHorarioChange(dia, index, 'hora_fin', e.target.value)}
                                  fullWidth
                                  InputLabelProps={{ shrink: true }}
                                  disabled={loading}
                                />
                              </Grid>
                              <Grid item xs={8} sm={3}>
                                <TextField
                                  label="Duración (min)"
                                  type="number"
                                  value={franja.duracion}
                                  onChange={(e) => handleHorarioChange(dia, index, 'duracion', e.target.value)}
                                  fullWidth
                                  inputProps={{ min: "15", step: "5" }}
                                  disabled={loading}
                                />
                              </Grid>
                              <Grid item xs={4} sm={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <Tooltip title="Eliminar franja">
                                  <IconButton 
                                    color="error" 
                                    onClick={() => eliminarFranjaHoraria(dia, index)}
                                    disabled={loading}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              </Grid>
                            </Grid>
                          ))}
                          
                          <Button
                            startIcon={<Add />}
                            variant="outlined"
                            size="small"
                            onClick={() => agregarFranjaHoraria(dia)}
                            disabled={loading}
                            sx={{ mt: 1 }}
                          >
                            Agregar franja horaria
                          </Button>
                        </Box>
                      )}
                      
                      {!horariosPorDia[dia].activo && (
                        <Typography variant="body2" color="text.secondary">
                          Este día no está configurado como laborable
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}

            {/* Resumen de horarios */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
                Resumen de Horarios
              </Typography>
              <Paper elevation={2} sx={{ p: 2, backgroundColor: isDarkTheme ? 'rgba(0, 188, 212, 0.1)' : 'rgba(3, 66, 124, 0.05)' }}>
                <List dense>
                  {diasSemana.filter(dia => horariosPorDia[dia].activo).map((dia) => (
                    <ListItem key={dia}>
                      <ListItemText
                        primary={dia}
                        secondary={
                          <>
                            {horariosPorDia[dia].franjas.map((franja, index) => (
                              <Typography key={index} variant="body2" component="span" sx={{ display: 'block' }}>
                                {franja.hora_inicio} - {franja.hora_fin} (Duración: {franja.duracion} min)
                              </Typography>
                            ))}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>

        <CardActions sx={{ p: 3, borderTop: `1px solid ${colors.divider}`, justifyContent: 'space-between' }}>
          <Button
            onClick={() => navigate('/admin/horarios')}
            color="inherit"
            variant="outlined"
            startIcon={<ArrowBack />}
            disabled={loading}
            sx={{ borderRadius: '4px' }}
          >
            Volver
          </Button>
          
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            sx={{
              borderRadius: '4px',
              boxShadow: 3,
              '&:hover': { boxShadow: 5 }
            }}
          >
            {loading ? 'Guardando...' : 'Guardar Horarios'}
          </Button>
        </CardActions>
      </Card>

      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        handleClose={() => setNotification({ open: false, message: '', type: '' })}
      />
    </Box>
  );
};

export default HorariosForm;