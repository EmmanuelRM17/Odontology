import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
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
  const [odontologo, setOdontologo] = useState(null);
  const odontologoId = "3";
  // Estado para las duraciones manuales por día y por franja
  const [duracionesManuales, setDuracionesManuales] = useState({
    Lunes: { 0: true }, // Inicializar como true para la primera franja
    Martes: { 0: true },
    Miércoles: { 0: true },
    Jueves: { 0: true },
    Viernes: { 0: true },
    Sábado: { 0: true },
    Domingo: { 0: true },
  });

  // Estado para los horarios por día (conservar igual)
  const [horariosPorDia, setHorariosPorDia] = useState({
    Lunes: { activo: true, franjas: [{ hora_inicio: '09:00', hora_fin: '12:00', duracion: 50 }] },
    Martes: { activo: true, franjas: [{ hora_inicio: '09:00', hora_fin: '12:00', duracion: 50 }] },
    Miércoles: { activo: true, franjas: [{ hora_inicio: '09:00', hora_fin: '12:00', duracion: 50 }] },
    Jueves: { activo: true, franjas: [{ hora_inicio: '09:00', hora_fin: '12:00', duracion: 50 }] },
    Viernes: { activo: true, franjas: [{ hora_inicio: '09:00', hora_fin: '12:00', duracion: 50 }] },
    Sábado: { activo: false, franjas: [{ hora_inicio: '09:00', hora_fin: '12:00', duracion: 50 }] },
    Domingo: { activo: false, franjas: [{ hora_inicio: '09:00', hora_fin: '12:00', duracion: 50 }] },
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: ''
  });

  // Cargar datos del odontólogo
  useEffect(() => {
    const fetchOdontologo = async () => {
      try {
        const response = await fetch('https://back-end-4803.onrender.com/api/empleados/odontologos/activos');
        if (!response.ok) throw new Error('Error al cargar odontólogos');
        const data = await response.json();

        if (data.length > 0) {
          setOdontologo(data[0]);
        }
      } catch (error) {
        console.error('Error:', error);
        setNotification({
          open: true,
          message: 'Error al cargar información del odontólogo',
          type: 'error'
        });
      }
    };
    fetchOdontologo();
  }, []);

  // Cargar horarios del odontólogo
  useEffect(() => {
    const fetchHorariosOdontologo = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://back-end-4803.onrender.com/api/horarios/empleado/${odontologoId}`);

        if (!response.ok) {
          throw new Error('Error al cargar los horarios');
        }

        const data = await response.json();

        if (data && data.horarios) {
          // En lugar de sobrescribir directamente, procesamos los datos
          // para preservar duraciones manuales si ya existen
          const nuevosHorarios = { ...data.horarios };
          const nuevosDuracionesManuales = { ...duracionesManuales };

          // Para cada día, inicializamos los flags de duración manual
          Object.keys(nuevosHorarios).forEach(dia => {
            if (!nuevosDuracionesManuales[dia]) {
              nuevosDuracionesManuales[dia] = {};
            }

            // Asegurarnos que todas las duraciones son números, no strings
            nuevosHorarios[dia].franjas.forEach((franja, index) => {
              franja.duracion = parseInt(franja.duracion);

              // Por defecto, marcamos todas las duraciones cargadas como manuales
              // Esto evitará que se recalculen automáticamente
              nuevosDuracionesManuales[dia][index] = true;
            });
          });

          setHorariosPorDia(nuevosHorarios);
          setDuracionesManuales(nuevosDuracionesManuales);
        }
      } catch (error) {
        console.error('Error al cargar horarios:', error);
        setNotification({
          open: true,
          message: 'Error al cargar los horarios del odontólogo',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHorariosOdontologo();
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

    // Si estamos cambiando la duración
    if (field === 'duracion') {
      // Convertir a número explícitamente
      const duracionNum = parseInt(value);

      // Validar que sea un número válido
      if (isNaN(duracionNum)) {
        setNotification({
          open: true,
          message: 'La duración debe ser un número válido',
          type: 'error'
        });
        return; // No procesar cambios inválidos
      }

      const duracionFinal = duracionNum > 120 ? 120 : duracionNum;
      if (duracionNum > 120) {
        setNotification({
          open: true,
          message: 'La duración máxima permitida es de 2 horas (120 minutos)',
          type: 'warning'
        });
      }

      newHorarios[dia].franjas[index].duracion = duracionFinal;
    }
    else {

      newHorarios[dia].franjas[index][field] = value;

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

    // Calcular nueva hora de fin (1 hora después del nuevo inicio)
    const nuevaHoraFin = new Date(`2023-01-01T${nuevaHoraInicio}:00`);
    nuevaHoraFin.setHours(nuevaHoraFin.getHours() + 1);
    const horaFinStr = nuevaHoraFin.toTimeString().slice(0, 5);

    // Índice de la nueva franja
    const nuevoIndex = horariosPorDia[dia].franjas.length;

    // Duración explícitamente como número, no como string
    const duracionPredeterminada = 50;

    // Actualizar ambos estados: horarios y duraciones manuales
    setHorariosPorDia(prev => {
      const newState = { ...prev };
      newState[dia] = {
        ...newState[dia],
        franjas: [
          ...newState[dia].franjas,
          {
            hora_inicio: nuevaHoraInicio,
            hora_fin: horaFinStr,
            duracion: duracionPredeterminada // Número, no string
          }
        ]
      };
      return newState;
    });

    // Actualizar duracionesManuales inmediatamente
    setDuracionesManuales(prev => {
      const newState = { ...prev };
      if (!newState[dia]) newState[dia] = {};
      newState[dia][nuevoIndex] = true; // Marcar como manual
      return newState;
    });
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

    // Eliminar la franja
    const newHorarios = { ...horariosPorDia };
    newHorarios[dia].franjas.splice(index, 1);
    setHorariosPorDia(newHorarios);

    // Actualizar duracionesManuales
    const newDuracionesManuales = { ...duracionesManuales };

    // Eliminar el índice correspondiente
    delete newDuracionesManuales[dia][index];

    // Reindexar los índices posteriores
    const indices = Object.keys(newDuracionesManuales[dia])
      .map(Number)
      .filter(i => i > index);

    indices.forEach(i => {
      newDuracionesManuales[dia][i - 1] = newDuracionesManuales[dia][i];
      delete newDuracionesManuales[dia][i];
    });

    setDuracionesManuales(newDuracionesManuales);
  };

  // Validación del formulario corregida
  const validateForm = () => {
    // Crear una copia profunda para trabajar sin afectar el estado original
    const horariosCopia = JSON.parse(JSON.stringify(horariosPorDia));

    // Verificar días activos
    const hayDiasActivos = Object.values(horariosCopia).some(dia => dia.activo);
    if (!hayDiasActivos) {
      setNotification({
        open: true,
        message: 'Debe haber al menos un día de trabajo activo',
        type: 'error'
      });
      return false;
    }

    let isValid = true;
    let mensajeError = '';

    // Validar cada franja horaria
    Object.entries(horariosCopia).forEach(([dia, config]) => {
      if (!config.activo) return; // Saltar días inactivos

      config.franjas.forEach((franja, index) => {
        // 1. Validar formato de horas
        const inicio = new Date(`2023-01-01T${franja.hora_inicio}:00`);
        const fin = new Date(`2023-01-01T${franja.hora_fin}:00`);

        if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
          isValid = false;
          mensajeError = `Formato de hora inválido en ${dia}`;
          return;
        }

        // 2. Validar que fin sea posterior a inicio
        if (fin <= inicio) {
          isValid = false;
          mensajeError = `La hora de fin debe ser posterior a la hora de inicio en ${dia}`;
          return;
        }

        // 3. Validar que la duración sea mayor a 0
        const duracionNum = parseInt(franja.duracion);
        if (isNaN(duracionNum) || duracionNum <= 0) {
          isValid = false;
          mensajeError = `La duración debe ser mayor a 0 en ${dia}`;
          return;
        }

        // IMPORTANTE: ELIMINAMOS LA COMPARACIÓN ENTRE DURACIÓN Y HORAS
        // Ya que la duración representa el tiempo de cada cita, no el tiempo total del bloque

        // Si la duración manual excede 120, es un error
        if (duracionNum > 120) {
          isValid = false;
          mensajeError = `La duración no puede exceder las 2 horas (120 minutos) en ${dia}`;
          return;
        }

        // 5. Validar solapamientos
        if (config.franjas.length > 1) {
          for (let i = 0; i < config.franjas.length; i++) {
            if (i === index) continue;

            const otraInicio = new Date(`2023-01-01T${config.franjas[i].hora_inicio}:00`);
            const otraFin = new Date(`2023-01-01T${config.franjas[i].hora_fin}:00`);

            if ((inicio >= otraInicio && inicio < otraFin) ||
              (fin > otraInicio && fin <= otraFin) ||
              (inicio <= otraInicio && fin >= otraFin)) {
              isValid = false;
              mensajeError = `Hay franjas horarias que se solapan en ${dia}`;
              return;
            }
          }
        }
      });
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
              empleado_id: parseInt(odontologoId),
              dia_semana: dia,
              hora_inicio: franja.hora_inicio,
              hora_fin: franja.hora_fin,
              duracion: parseInt(franja.duracion)
            });
          });
        }
      });

      // Eliminar horarios existentes antes de crear nuevos
      const responseDelete = await fetch(`https://back-end-4803.onrender.com/api/horarios/delete-by-empleado/${odontologoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!responseDelete.ok) {
        const errorData = await responseDelete.json();
        throw new Error(errorData.message || 'Error al eliminar horarios anteriores');
      }

      // Crear nuevos horarios
      const responseCreate = await fetch('https://back-end-4803.onrender.com/api/horarios/create-multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(horariosProcesados)
      });

      if (!responseCreate.ok) {
        const errorData = await responseCreate.json();
        throw new Error(errorData.message || 'Error al crear nuevos horarios');
      }

      setNotification({
        open: true,
        message: 'Horarios guardados con éxito!',
        type: 'success'
      });

      // Redirigir después de un tiempo
      setTimeout(() => {
        navigate('/Administrador/horarios');
      }, 2000);

    } catch (error) {
      console.error('Error al guardar horarios:', error);
      setNotification({
        open: true,
        message: error.message || 'Ocurrió un error al guardar los horarios. Por favor intente nuevamente.',
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
                Odontólogo
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              {odontologo && (
                <Paper elevation={2} sx={{ p: 2, backgroundColor: isDarkTheme ? 'rgba(0, 188, 212, 0.1)' : 'rgba(3, 66, 124, 0.05)' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {odontologo.nombre} {odontologo.aPaterno} {odontologo.aMaterno}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {odontologo.email}
                  </Typography>
                  <Chip
                    size="small"
                    label={odontologo.puesto}
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                </Paper>
              )}
              {!odontologo && !loading && (
                <Typography variant="body1" color="error">
                  No se encontró información del odontólogo.
                </Typography>
              )}
              {loading && (
                <CircularProgress size={24} sx={{ mt: 1 }} />
              )}
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
              <Typography variant="subtitle1" sx={{
                mb: 2,
                mt: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontWeight: 'bold'
              }}>
                <AccessTime fontSize="small" />
                Resumen de Horarios Configurados
              </Typography>

              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  backgroundColor: isDarkTheme ? 'rgba(0, 188, 212, 0.1)' : 'rgba(3, 66, 124, 0.05)',
                  borderRadius: '8px',
                  border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`
                }}
              >
                {/* Encabezados de tabla */}
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr' },
                  fontWeight: 'bold',
                  borderBottom: `2px solid ${colors.primary}`,
                  pb: 1,
                  mb: 2
                }}>
                  <Typography variant="subtitle2">Día</Typography>
                  <Typography variant="subtitle2">Horarios Programados</Typography>
                </Box>

                {/* Lista de días activos */}
                {diasSemana.filter(dia => horariosPorDia[dia].activo).length > 0 ? (
                  diasSemana.filter(dia => horariosPorDia[dia].activo).map((dia) => (
                    <Box
                      key={dia}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr' },
                        py: 1.5,
                        borderBottom: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                        '&:last-child': { borderBottom: 'none' }
                      }}
                    >
                      {/* Día de la semana */}
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Chip
                          size="small"
                          label={dia}
                          color="primary"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>

                      {/* Franjas horarias */}
                      <Box>
                        {horariosPorDia[dia].franjas.map((franja, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mb: 0.5,
                              p: 1,
                              backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                              borderRadius: '4px',
                              '&:last-child': { mb: 0 }
                            }}
                          >
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              flexGrow: 1
                            }}>
                              <AccessTime fontSize="small" color="action" />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 'medium',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                {franja.hora_inicio} - {franja.hora_fin}
                              </Typography>
                              <Chip
                                size="small"
                                label={`${franja.duracion} min`}
                                color="secondary"
                                variant="outlined"
                                sx={{ ml: 1, minWidth: '70px' }}
                              />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No hay días activos configurados. Activa al menos un día para ver el resumen.
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>

        <CardActions sx={{
          p: 3,
          borderTop: `1px solid ${colors.divider}`,
          display: 'flex',
          justifyContent: 'flex-end' // Alinea a la derecha
        }}>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            sx={{
              borderRadius: '6px',
              boxShadow: 3,
              px: 3,
              py: 1,
              '&:hover': {
                boxShadow: 5,
                transform: 'translateY(-2px)',
                transition: 'all 0.2s'
              }
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