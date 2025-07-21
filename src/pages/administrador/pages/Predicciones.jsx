import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Card, CardContent, CircularProgress, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, useMediaQuery,
  Paper, Typography, Tooltip, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel,
  Alert, AlertTitle, LinearProgress, Divider, Grid, Stack
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { 
  PsychologyRounded, Visibility, FilterList, Search, Assessment, 
  TrendingUp, TrendingDown, Person, Schedule, AttachMoney, 
  WarningRounded, CheckCircleOutlined, InfoOutlined, Close, Refresh
} from '@mui/icons-material';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import Notificaciones from '../../../components/Layout/Notificaciones';

// Función para obtener el color según el nivel de riesgo
const getRiskColor = (riskLevel, isDarkTheme) => {
  const colors = {
    alto: isDarkTheme ? '#ef4444' : '#dc2626',
    medio: isDarkTheme ? '#f59e0b' : '#d97706', 
    bajo: isDarkTheme ? '#10b981' : '#059669'
  };
  return colors[riskLevel] || colors.bajo;
};

// Función para obtener el icono según el nivel de riesgo
const getRiskIcon = (riskLevel) => {
  switch(riskLevel) {
    case 'alto': return <WarningRounded />;
    case 'medio': return <InfoOutlined />;
    case 'bajo': return <CheckCircleOutlined />;
    default: return <InfoOutlined />;
  }
};

const PrediccionesNoShow = () => {
  const { isDarkTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Estados principales
  const [citas, setCitas] = useState([]);
  const [filteredCitas, setFilteredCitas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [loadingPred, setLoadingPred] = useState({});
  const [resultados, setResultados] = useState({});
  
  // Estados para filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [servicioFilter, setServicioFilter] = useState('todos');
  const [riesgoFilter, setRiesgoFilter] = useState('todos');
  
  // Estados para el modal de detalles
  const [selectedCita, setSelectedCita] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Estados para notificaciones
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [openNotification, setOpenNotification] = useState(false);

  // Colores del tema siguiendo el patrón de CitasForm
  const colors = {
    background: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
    paper: isDarkTheme ? '#243447' : '#ffffff',
    text: isDarkTheme ? '#FFFFFF' : '#333333',
    secondaryText: isDarkTheme ? '#B8C5D1' : '#6B7280',
    primary: isDarkTheme ? '#4B9FFF' : '#1976d2',
    titleColor: isDarkTheme ? '#4B9FFF' : '#0052A3',
    border: isDarkTheme ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
    hover: isDarkTheme ? 'rgba(75,159,255,0.15)' : 'rgba(25,118,210,0.1)',
    cardBackground: isDarkTheme ? '#1D2B3A' : '#F8FAFC',
    success: isDarkTheme ? '#10b981' : '#059669',
    warning: isDarkTheme ? '#f59e0b' : '#d97706',
    error: isDarkTheme ? '#ef4444' : '#dc2626'
  };

  // Cargar citas desde la API
  const fetchCitas = useCallback(async () => {
    setLoadingCitas(true);
    try {
      const res = await fetch('https://back-end-4803.onrender.com/api/citas/all');
      if (!res.ok) throw new Error('Error al obtener las citas');
      
      const data = await res.json();
      const citasActivas = data.filter(c => !c.archivado);
      
      setCitas(citasActivas);
      setFilteredCitas(citasActivas);

      // Mostrar notificación de éxito
      setNotificationMessage(`Se cargaron ${citasActivas.length} citas correctamente`);
      setNotificationType('success');
      setOpenNotification(true);
    } catch (error) {
      console.error('Error cargando citas:', error);
      setCitas([]);
      setFilteredCitas([]);
      
      // Mostrar notificación de error
      setNotificationMessage('Error al cargar las citas. Por favor, intente nuevamente.');
      setNotificationType('error');
      setOpenNotification(true);
    } finally {
      setLoadingCitas(false);
    }
  }, []);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = citas.filter(cita => {
      const matchesSearch = !searchQuery || 
        (cita.paciente_nombre && cita.paciente_nombre.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (cita.servicio_nombre && cita.servicio_nombre.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesEstado = estadoFilter === 'todos' || cita.estado === estadoFilter;
      const matchesServicio = servicioFilter === 'todos' || cita.categoria_servicio === servicioFilter;
      
      const resultado = resultados[cita.consulta_id];
      const matchesRiesgo = riesgoFilter === 'todos' || 
        (resultado && resultado.risk_level === riesgoFilter);

      return matchesSearch && matchesEstado && matchesServicio && matchesRiesgo;
    });

    setFilteredCitas(filtered);
  }, [citas, searchQuery, estadoFilter, servicioFilter, riesgoFilter, resultados]);

  // Manejar predicción individual
  const handlePredict = async (cita) => {
    const id = cita.consulta_id;
    setLoadingPred(prev => ({ ...prev, [id]: true }));

    const payload = {
      paciente_id: cita.paciente_id,
      fecha_solicitud: cita.fecha_solicitud,
      fecha_consulta: cita.fecha_consulta,
      paciente_fecha_nacimiento: cita.paciente_fecha_nacimiento,
      paciente_genero: cita.paciente_genero,
      paciente_alergias: cita.paciente_alergias,
      paciente_registro_completo: cita.paciente_registro_completo || true,
      paciente_verificado: cita.paciente_verificado || true,
      categoria_servicio: cita.categoria_servicio,
      precio_servicio: cita.precio_servicio,
      duracion: cita.duracion || 30,
      estado_pago: cita.estado_pago,
      tratamiento_pendiente: cita.tratamiento_pendiente || false,
      total_citas_historicas: cita.total_citas_historicas || 1,
      total_no_shows_historicas: cita.total_no_shows_historicas || 0,
      pct_no_show_historico: cita.pct_no_show_historico || 0.0,
      dias_desde_ultima_cita: cita.dias_desde_ultima_cita || 0
    };

    try {
      const res = await fetch('https://back-end-4803.onrender.com/api/ml/predict-no-show', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Error en la predicción');
      
      const json = await res.json();
      
      if (json.success && json.prediction) {
        setResultados(prev => ({ ...prev, [id]: json.prediction }));
        
        // Mostrar notificación con el resultado
        const riskText = json.prediction.risk_level === 'alto' ? 'Alto Riesgo' :
                        json.prediction.risk_level === 'medio' ? 'Riesgo Medio' : 'Bajo Riesgo';
        setNotificationMessage(`Predicción completada: ${riskText} (${(json.prediction.probability * 100).toFixed(1)}%)`);
        setNotificationType(json.prediction.risk_level === 'alto' ? 'warning' : 
                           json.prediction.risk_level === 'medio' ? 'info' : 'success');
        setOpenNotification(true);
      } else {
        console.error('Error en respuesta de predicción:', json.error);
        setNotificationMessage(`Error en la predicción: ${json.error || 'Error desconocido'}`);
        setNotificationType('error');
        setOpenNotification(true);
      }
    } catch (error) {
      console.error('Error en predicción:', error);
      setNotificationMessage('Error de conexión al realizar la predicción');
      setNotificationType('error');
      setOpenNotification(true);
    } finally {
      setLoadingPred(prev => ({ ...prev, [id]: false }));
    }
  };

  // Manejar predicción masiva
  const handlePredictAll = async () => {
    const citasSinPrediccion = filteredCitas.filter(cita => !resultados[cita.consulta_id]);
    
    if (citasSinPrediccion.length === 0) {
      setNotificationMessage('Todas las citas visibles ya tienen predicción');
      setNotificationType('info');
      setOpenNotification(true);
      return;
    }

    setNotificationMessage(`Iniciando predicción masiva para ${citasSinPrediccion.length} citas...`);
    setNotificationType('info');
    setOpenNotification(true);
    
    let prediccionesExitosas = 0;
    let prediccionesFallidas = 0;
    
    for (const cita of citasSinPrediccion) {
      try {
        await handlePredict(cita);
        prediccionesExitosas++;
        // Pequeña pausa para evitar sobrecarga del servidor
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        prediccionesFallidas++;
        console.error(`Error prediciendo cita ${cita.consulta_id}:`, error);
      }
    }

    // Notificación final
    setNotificationMessage(
      `Predicción masiva completada: ${prediccionesExitosas} exitosas, ${prediccionesFallidas} fallidas`
    );
    setNotificationType(prediccionesFallidas === 0 ? 'success' : 'warning');
    setOpenNotification(true);
  };

  // Obtener servicios únicos para el filtro
  const serviciosUnicos = [...new Set(citas.map(c => c.categoria_servicio).filter(Boolean))];

  // Mostrar detalles de la predicción
  const handleShowDetails = (cita) => {
    setSelectedCita(cita);
    setDetailsOpen(true);
  };

  if (loadingCitas) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        backgroundColor: colors.background
      }}>
        <CircularProgress size={50} sx={{ color: colors.primary }} />
      </Box>
    );
  }

  return (
    <Card sx={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      borderRadius: '16px',
      boxShadow: isDarkTheme ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.08)',
      transition: 'all 0.3s ease'
    }}>
      <Box sx={{ padding: { xs: 2, sm: 3, md: 4 } }}>
        
        {/* Cabecera */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: { xs: 2, sm: 3 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PsychologyRounded sx={{ color: colors.primary, mr: 1.5, fontSize: 28 }} />
            <Typography variant="h5" sx={{
              fontWeight: 600,
              color: colors.titleColor,
              fontFamily: 'Roboto, sans-serif'
            }}>
              Predicciones de Asistencia
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Assessment />}
            onClick={handlePredictAll}
            disabled={Object.keys(loadingPred).some(key => loadingPred[key])}
            sx={{
              backgroundColor: colors.primary,
              '&:hover': { backgroundColor: alpha(colors.primary, 0.8) },
              borderRadius: '8px',
              textTransform: 'none'
            }}
          >
            Predecir Todas
          </Button>
        </Box>

        {/* Filtros y búsqueda */}
        <Paper sx={{
          p: 2,
          mb: 3,
          backgroundColor: colors.paper,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px'
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar paciente o servicio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: colors.secondaryText }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: colors.cardBackground,
                    '& fieldset': { borderColor: colors.border },
                    '&:hover fieldset': { borderColor: colors.primary }
                  }
                }}
              />
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={estadoFilter}
                  label="Estado"
                  onChange={(e) => setEstadoFilter(e.target.value)}
                  sx={{ backgroundColor: colors.cardBackground }}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="Pendiente">Pendiente</MenuItem>
                  <MenuItem value="Confirmada">Confirmada</MenuItem>
                  <MenuItem value="Completada">Completada</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Servicio</InputLabel>
                <Select
                  value={servicioFilter}
                  label="Servicio"
                  onChange={(e) => setServicioFilter(e.target.value)}
                  sx={{ backgroundColor: colors.cardBackground }}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  {serviciosUnicos.map(servicio => (
                    <MenuItem key={servicio} value={servicio}>{servicio}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Riesgo</InputLabel>
                <Select
                  value={riesgoFilter}
                  label="Riesgo"
                  onChange={(e) => setRiesgoFilter(e.target.value)}
                  sx={{ backgroundColor: colors.cardBackground }}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="alto">Alto</MenuItem>
                  <MenuItem value="medio">Medio</MenuItem>
                  <MenuItem value="bajo">Bajo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla de predicciones */}
        <TableContainer component={Paper} sx={{
          backgroundColor: colors.paper,
          borderRadius: '12px',
          border: `1px solid ${colors.border}`,
          boxShadow: isDarkTheme ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.05)'
        }}>
          <Table>
            <TableHead sx={{ backgroundColor: alpha(colors.primary, 0.1) }}>
              <TableRow>
                <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 1, fontSize: 18 }} />
                    Paciente
                  </Box>
                </TableCell>
                <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Schedule sx={{ mr: 1, fontSize: 18 }} />
                    Fecha y Hora
                  </Box>
                </TableCell>
                <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Servicio</TableCell>
                <TableCell sx={{ color: colors.text, fontWeight: 'bold' }} align="center">
                  Estado de Cita
                </TableCell>
                <TableCell sx={{ color: colors.text, fontWeight: 'bold' }} align="center">
                  Predicción
                </TableCell>
                <TableCell sx={{ color: colors.text, fontWeight: 'bold' }} align="center">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCitas.length > 0 ? filteredCitas.map(cita => {
                const resultado = resultados[cita.consulta_id];
                const isLoading = loadingPred[cita.consulta_id];

                return (
                  <TableRow key={cita.consulta_id} hover sx={{
                    '&:hover': { backgroundColor: colors.hover }
                  }}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {cita.paciente_nombre || 'No registrado'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.secondaryText }}>
                          ID: {cita.paciente_id}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {new Date(cita.fecha_consulta).toLocaleDateString('es-ES')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.secondaryText }}>
                          {new Date(cita.fecha_consulta).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', minute: '2-digit' 
                          })}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography variant="body2">{cita.servicio_nombre}</Typography>
                        <Chip 
                          label={cita.categoria_servicio} 
                          size="small" 
                          sx={{ 
                            fontSize: '0.7rem',
                            backgroundColor: alpha(colors.primary, 0.1),
                            color: colors.primary
                          }} 
                        />
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={cita.estado}
                        size="small"
                        sx={{
                          backgroundColor: cita.estado === 'Completada' ? alpha(colors.success, 0.2) :
                                          cita.estado === 'Pendiente' ? alpha(colors.warning, 0.2) :
                                          alpha(colors.primary, 0.2),
                          color: cita.estado === 'Completada' ? colors.success :
                                 cita.estado === 'Pendiente' ? colors.warning :
                                 colors.primary
                        }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      {isLoading ? (
                        <CircularProgress size={24} sx={{ color: colors.primary }} />
                      ) : resultado ? (
                        <Tooltip title={`Probabilidad: ${(resultado.probability * 100).toFixed(1)}%`}>
                          <Chip
                            icon={getRiskIcon(resultado.risk_level)}
                            label={`${resultado.risk_level.charAt(0).toUpperCase() + resultado.risk_level.slice(1)} Riesgo`}
                            sx={{
                              backgroundColor: alpha(getRiskColor(resultado.risk_level, isDarkTheme), 0.2),
                              color: getRiskColor(resultado.risk_level, isDarkTheme),
                              fontWeight: 500
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" sx={{ color: colors.secondaryText }}>
                          Sin predicción
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Predecir">
                          <IconButton
                            onClick={() => handlePredict(cita)}
                            disabled={isLoading}
                            sx={{
                              color: colors.primary,
                              '&:hover': { backgroundColor: alpha(colors.primary, 0.1) }
                            }}
                          >
                            <Assessment />
                          </IconButton>
                        </Tooltip>
                        
                        {resultado && (
                          <Tooltip title="Ver detalles">
                            <IconButton
                              onClick={() => handleShowDetails(cita)}
                              sx={{
                                color: colors.secondaryText,
                                '&:hover': { backgroundColor: alpha(colors.secondaryText, 0.1) }
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" sx={{ color: colors.secondaryText }}>
                      No hay citas disponibles con los filtros aplicados
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Modal de detalles */}
        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: colors.paper,
              borderRadius: '16px',
              border: `1px solid ${colors.border}`
            }
          }}
        >
          <DialogTitle sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1
          }}>
            <Typography variant="h6" sx={{ color: colors.titleColor, fontWeight: 600 }}>
              Detalles de la Predicción
            </Typography>
            <IconButton
              onClick={() => setDetailsOpen(false)}
              sx={{ color: colors.secondaryText }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          
          <DialogContent>
            {selectedCita && resultados[selectedCita.consulta_id] && (
              <Box sx={{ py: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, backgroundColor: colors.cardBackground, borderRadius: '8px' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: colors.text }}>
                        Información del Paciente
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Nombre:</strong> {selectedCita.paciente_nombre}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Servicio:</strong> {selectedCita.servicio_nombre}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Fecha:</strong> {new Date(selectedCita.fecha_consulta).toLocaleString('es-ES')}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, backgroundColor: colors.cardBackground, borderRadius: '8px' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: colors.text }}>
                        Resultado de Predicción
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {getRiskIcon(resultados[selectedCita.consulta_id].risk_level)}
                        <Typography variant="h6" sx={{ 
                          ml: 1, 
                          color: getRiskColor(resultados[selectedCita.consulta_id].risk_level, isDarkTheme)
                        }}>
                          Riesgo {resultados[selectedCita.consulta_id].risk_level.charAt(0).toUpperCase() + 
                                  resultados[selectedCita.consulta_id].risk_level.slice(1)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Probabilidad:</strong> {(resultados[selectedCita.consulta_id].probability * 100).toFixed(1)}%
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Factores de riesgo */}
                  {resultados[selectedCita.consulta_id].risk_factors?.length > 0 && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, backgroundColor: colors.cardBackground, borderRadius: '8px' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: colors.text }}>
                          Factores de Riesgo Identificados
                        </Typography>
                        <Stack spacing={1}>
                          {resultados[selectedCita.consulta_id].risk_factors.map((factor, index) => (
                            <Box key={index} sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              p: 1,
                              backgroundColor: alpha(
                                factor.impact === 'Alto' ? colors.error :
                                factor.impact === 'Medio' ? colors.warning :
                                colors.success, 0.1
                              ),
                              borderRadius: '6px'
                            }}>
                              <Typography variant="body2">{factor.factor}</Typography>
                              <Chip
                                label={factor.value}
                                size="small"
                                sx={{
                                  backgroundColor: alpha(
                                    factor.impact === 'Alto' ? colors.error :
                                    factor.impact === 'Medio' ? colors.warning :
                                    colors.success, 0.2
                                  ),
                                  color: factor.impact === 'Alto' ? colors.error :
                                         factor.impact === 'Medio' ? colors.warning :
                                         colors.success
                                }}
                              />
                            </Box>
                          ))}
                        </Stack>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
        </Dialog>

      </Box>

      {/* Componente de Notificaciones */}
      <Notificaciones
        open={openNotification}
        message={notificationMessage}
        type={notificationType}
        onClose={() => setOpenNotification(false)}
      />
    </Card>
  );
};

export default PrediccionesNoShow;