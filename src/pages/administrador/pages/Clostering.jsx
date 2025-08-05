import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Fade,
  Skeleton,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  ExpandMore,
  Search,
  FilterList,
  TrendingUp,
  Warning,
  Psychology,
  Refresh,
  Download,
  PieChart as PieIcon,
  BarChart as BarIcon,
  ShowChart,
  Group,
  Person,
  LocationOn,
  AccessTime,
  Close,
  Phone,
  Cake,
  LocalHospital,
  CheckCircle,
  Analytics,
  ThumbUp,
  Cancel,
  HelpOutline
} from '@mui/icons-material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Legend,
  ScatterChart,
  Scatter
} from 'recharts';
import axios from 'axios';

// Configuración de colores para los SEGMENTOS CORRECTOS
const SEGMENT_COLORS = {
  'Cumplido': '#2E7D32',      // Verde - Buenos pacientes
  'Problemático': '#D32F2F',   // Rojo - Pacientes problemáticos  
  'Irregular': '#F57C00',      // Naranja - Comportamiento inconsistente
  'NO_CLASIFICADO': '#757575', // Gris
  'ERROR': '#455A64'           // Gris oscuro
};

const Clustering = () => {
  const [tabValue, setTabValue] = useState(0);
  const [chartType, setChartType] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // Estados para filtros ANTES de clasificación
  const [filterOptions, setFilterOptions] = useState(null);
  const [preFilters, setPreFilters] = useState({
    edad_min: 18,
    edad_max: 80,
    ubicaciones: [],
    total_citas_min: 1,
    search: '',
    limit: 25
  });

  // Estados para filtros DESPUÉS de clasificación
  const [postFilters, setPostFilters] = useState({
    segmentos: [], // Para filtrar por segmento después de clasificar
    showAll: true
  });

  // Estados para datos
  const [allPatients, setAllPatients] = useState([]); // Todos los pacientes clasificados
  const [filteredPatients, setFilteredPatients] = useState([]); // Pacientes filtrados para mostrar
  const [statistics, setStatistics] = useState(null);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  // Estados para modal de detalles
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  /**
   * Carga opciones de filtros al montar componente
   */
  useEffect(() => {
    loadFilterOptions();
  }, []);

  /**
   * Efecto para filtrar pacientes después de clasificación
   */
  useEffect(() => {
    if (allPatients.length > 0) {
      filterClassifiedPatients();
    }
  }, [allPatients, postFilters]);

  /**
   * Carga opciones disponibles para filtros
   */
  const loadFilterOptions = async () => {
    setLoadingOptions(true);
    try {
      const response = await axios.get('https://back-end-4803.onrender.com/api/ml/filter-options');
      if (response.data.success) {
        setFilterOptions(response.data.options);
        setPreFilters(prev => ({
          ...prev,
          edad_min: Math.max(18, response.data.options.rangos.edad.min),
          edad_max: Math.min(80, response.data.options.rangos.edad.max)
        }));
      }
    } catch (err) {
      console.error('Error cargando opciones:', err);
      setError('Error cargando opciones de filtros. Usando valores por defecto.');
    } finally {
      setLoadingOptions(false);
    }
  };

  /**
   * Aplica pre-filtros y clasifica pacientes
   */
  const classifyPatients = async () => {
    // Validaciones
    if (preFilters.limit < 5) {
      setError('El límite mínimo es de 5 pacientes para obtener resultados significativos');
      return;
    }

    if (preFilters.edad_min >= preFilters.edad_max) {
      setError('El rango de edad mínima debe ser menor que la máxima');
      return;
    }

    setLoading(true);
    setError(null);
    setAllPatients([]);
    setFilteredPatients([]);
    setStatistics(null);

    try {
      const response = await axios.post('https://back-end-4803.onrender.com/api/ml/patients-segmentation', preFilters);
      
      if (response.data.success) {
        const pacientes = response.data.data.pacientes;
        
        if (pacientes.length === 0) {
          setError('No se encontraron pacientes con los filtros aplicados. Intenta ampliar los criterios.');
          return;
        }

        setAllPatients(pacientes);
        setStatistics(response.data.data.estadisticas);
        setSuccess(`${pacientes.length} pacientes clasificados exitosamente`);
        setFiltersExpanded(false);
        
        // Reset post-filters
        setPostFilters({
          segmentos: [],
          showAll: true
        });
        
      } else {
        setError(response.data.error || 'Error en la clasificación');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Error de conexión';
      setError(`Error al clasificar pacientes: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtra pacientes ya clasificados según filtros post-clasificación
   */
  const filterClassifiedPatients = () => {
    let filtered = [...allPatients];

    // Filtrar por segmentos seleccionados
    if (postFilters.segmentos.length > 0) {
      filtered = filtered.filter(patient => 
        postFilters.segmentos.includes(patient.segmento)
      );
    }

    setFilteredPatients(filtered);
  };

  /**
   * Maneja cambios en pre-filtros
   */
  const handlePreFilterChange = (field, value) => {
    setPreFilters(prev => {
      const newFilters = { ...prev, [field]: value };
      
      if (field === 'edad_min' && value >= prev.edad_max) {
        newFilters.edad_max = Math.min(value + 10, filterOptions?.rangos.edad.max || 80);
      }
      if (field === 'edad_max' && value <= prev.edad_min) {
        newFilters.edad_min = Math.max(value - 10, filterOptions?.rangos.edad.min || 18);
      }
      
      return newFilters;
    });
  };

  /**
   * Maneja cambios en post-filtros
   */
  const handlePostFilterChange = (field, value) => {
    setPostFilters(prev => ({
      ...prev,
      [field]: value,
      showAll: field === 'segmentos' ? value.length === 0 : prev.showAll
    }));
  };

  /**
   * Resetea pre-filtros
   */
  const resetPreFilters = () => {
    if (filterOptions) {
      setPreFilters({
        edad_min: Math.max(18, filterOptions.rangos.edad.min),
        edad_max: Math.min(65, filterOptions.rangos.edad.max),
        ubicaciones: [],
        total_citas_min: 1,
        search: '',
        limit: 25
      });
    }
  };

  /**
   * Aplica filtros rápidos de segmentación - CORREGIDOS
   */
  const applySegmentFilter = (segmentos) => {
    setPostFilters({
      segmentos: Array.isArray(segmentos) ? segmentos : [segmentos],
      showAll: segmentos.length === 0
    });
  };

  /**
   * Aplica filtros rápidos pre-clasificación
   */
  const applyQuickPreFilter = (filterType) => {
    if (!filterOptions) return;

    const quickFilters = {
      'nuevos-pacientes': {
        edad_min: 18,
        edad_max: 35,
        total_citas_min: 1,
        limit: 20
      },
      'pacientes-frecuentes': {
        total_citas_min: 5,
        limit: 30
      },
      'todos-pacientes': {
        edad_min: Math.max(18, filterOptions.rangos.edad.min),
        edad_max: Math.min(80, filterOptions.rangos.edad.max),
        total_citas_min: 1,
        limit: 50
      }
    };

    if (quickFilters[filterType]) {
      setPreFilters(prev => ({ ...prev, ...quickFilters[filterType] }));
      setTimeout(() => classifyPatients(), 100);
    }
  };

  /**
   * Abre modal de detalles del paciente
   */
  const openPatientDetails = (patient) => {
    setSelectedPatient(patient);
    setDetailsOpen(true);
  };

  /**
   * Renderiza chip del segmento
   */
  const renderSegmentChip = (segmento, size = 'small') => {
    const color = SEGMENT_COLORS[segmento] || '#757575';
    const icon = segmento === 'Cumplido' ? <ThumbUp /> : 
                 segmento === 'Irregular' ? <HelpOutline /> : 
                 segmento === 'Problemático' ? <Warning /> : <Person />;

    return (
      <Chip
        icon={icon}
        label={segmento}
        size={size}
        sx={{
          bgcolor: color + '15',
          color: color,
          fontWeight: 'bold',
          borderRadius: '16px',
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: color + '25',
            transform: 'scale(1.05)'
          },
          '& .MuiChip-icon': { color: color }
        }}
      />
    );
  };

  /**
   * Exporta resultados a CSV
   */
  const exportToCSV = () => {
    if (filteredPatients.length === 0) return;

    const csvContent = [
      ['ID', 'Nombre Completo', 'Edad', 'Género', 'Ubicación', 'Segmento', 'Cluster', 'Confianza', 'Total Citas', 'Tasa NoShow', 'Tasa Completion'],
      ...filteredPatients.map(p => [
        p.paciente_id,
        `"${p.nombre_completo}"`,
        p.edad,
        p.genero || 'N/A',
        `"${p.lugar || 'No especificada'}"`,
        p.segmento,
        p.cluster ?? 'N/A',
        p.confidence ? `${(p.confidence * 100).toFixed(1)}%` : 'N/A',
        p.total_citas || 0,
        p.tasa_noshow ? `${(p.tasa_noshow * 100).toFixed(1)}%` : 'N/A',
        p.tasa_completion ? `${(p.tasa_completion * 100).toFixed(1)}%` : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `segmentacion_pacientes_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  /**
   * Prepara datos para gráficos
   */
  const getPieData = () => {
    if (!statistics) return [];
    
    return Object.entries(statistics.segmentos)
      .filter(([segment, count]) => count > 0)
      .map(([segment, count]) => ({
        name: segment,
        value: count,
        color: SEGMENT_COLORS[segment] || '#757575',
        percentage: ((count / statistics.total_pacientes) * 100).toFixed(1)
      }));
  };

  const getLocationData = () => {
    if (!statistics || !statistics.ubicaciones) return [];
    
    return Object.entries(statistics.ubicaciones)
      .map(([location, data]) => ({
        name: location.length > 15 ? location.substring(0, 15) + '...' : location,
        fullName: location,
        pacientes: data.count
      }))
      .sort((a, b) => b.pacientes - a.pacientes)
      .slice(0, 8);
  };

  const getScatterData = () => {
    return filteredPatients.map(patient => ({
      edad: patient.edad || 0,
      total_citas: patient.total_citas || 0,
      segmento: patient.segmento,
      nombre: patient.nombre_completo,
      color: SEGMENT_COLORS[patient.segmento] || '#757575'
    }));
  };

  /**
   * Renderiza el gráfico seleccionado
   */
  const renderChart = () => {
    const chartProps = { width: "100%", height: 350 };

    switch (chartType) {
      case 0:
        return (
          <ResponsiveContainer {...chartProps}>
            <PieChart>
              <Pie
                data={getPieData()}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                labelLine={false}
              >
                {getPieData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value, name) => [`${value} pacientes`, 'Cantidad']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 1:
        return (
          <ResponsiveContainer {...chartProps}>
            <BarChart data={getLocationData()} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <RechartsTooltip />
              <Bar 
                dataKey="pacientes" 
                fill="#1976D2" 
                radius={[4, 4, 0, 0]}
                name="Pacientes"
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 2:
        return (
          <ResponsiveContainer {...chartProps}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                type="number" 
                dataKey="edad" 
                name="Edad" 
                domain={[18, 80]}
                label={{ value: 'Edad (años)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                type="number" 
                dataKey="total_citas" 
                name="Total Citas" 
                label={{ value: 'Total Citas', angle: -90, position: 'insideLeft' }}
              />
              <RechartsTooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value, name) => [
                  value,
                  name === 'total_citas' ? 'Total Citas' : 'Edad'
                ]}
              />
              {Object.entries(SEGMENT_COLORS).map(([segmento, color]) => {
                const segmentData = getScatterData().filter(d => d.segmento === segmento);
                return segmentData.length > 0 ? (
                  <Scatter 
                    key={segmento}
                    name={segmento}
                    data={segmentData}
                    fill={color}
                  />
                ) : null;
              })}
              <Legend />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header azul */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 3, 
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
          color: 'white'
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Analytics sx={{ fontSize: 48 }} />
          <Typography variant="h3" component="h1" fontWeight="bold">
            Segmentación por Comportamiento
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Clasifica pacientes automáticamente basado en tasa de asistencia, completación y pagos
        </Typography>
      </Paper>

      {/* Alertas */}
      <Fade in={!!error}>
        <Box>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2, borderRadius: '16px' }} 
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
        </Box>
      </Fade>

      <Fade in={!!success}>
        <Box>
          {success && (
            <Alert 
              severity="success" 
              sx={{ mb: 2, borderRadius: '16px' }} 
              onClose={() => setSuccess('')}
            >
              {success}
            </Alert>
          )}
        </Box>
      </Fade>

      {/* Filtros rápidos pre-clasificación */}
      <Card sx={{ mb: 3, borderRadius: '20px' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList color="primary" />
            Filtros Rápidos de Clasificación
          </Typography>
          <ButtonGroup variant="outlined" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Button 
              startIcon={<Person />}
              onClick={() => applyQuickPreFilter('nuevos-pacientes')}
              sx={{ borderRadius: '20px' }}
            >
              Nuevos Pacientes
            </Button>
            <Button 
              startIcon={<Group />}
              onClick={() => applyQuickPreFilter('pacientes-frecuentes')}
              sx={{ borderRadius: '20px' }}
            >
              Pacientes Frecuentes
            </Button>
            <Button 
              startIcon={<Analytics />}
              onClick={() => applyQuickPreFilter('todos-pacientes')}
              sx={{ borderRadius: '20px' }}
            >
              Todos los Pacientes
            </Button>
          </ButtonGroup>
        </CardContent>
      </Card>

      {/* Panel de Filtros Avanzados */}
      <Accordion 
        expanded={filtersExpanded} 
        onChange={() => setFiltersExpanded(!filtersExpanded)}
        sx={{ borderRadius: '20px', mb: 3, overflow: 'hidden' }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center" gap={2} width="100%">
            <FilterList color="primary" />
            <Typography variant="h6">Filtros de Clasificación</Typography>
            {allPatients.length > 0 && (
              <Chip 
                label={`${allPatients.length} clasificados`} 
                size="small" 
                color="primary"
                sx={{ borderRadius: '16px' }}
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {loadingOptions ? (
            <Grid container spacing={3}>
              {[1,2,3,4,5,6].map(i => (
                <Grid item xs={12} md={6} key={i}>
                  <Skeleton variant="rectangular" height={60} sx={{ borderRadius: '12px' }} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {/* Búsqueda por nombre */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Buscar por nombre, email o teléfono"
                  value={preFilters.search}
                  onChange={(e) => handlePreFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '16px' 
                    } 
                  }}
                />
              </Grid>

              {/* Límite de resultados */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Límite de resultados</InputLabel>
                  <Select
                    value={preFilters.limit}
                    onChange={(e) => handlePreFilterChange('limit', e.target.value)}
                    label="Límite de resultados"
                    sx={{ borderRadius: '16px' }}
                  >
                    <MenuItem value={5}>5 pacientes (rápido)</MenuItem>
                    <MenuItem value={10}>10 pacientes</MenuItem>
                    <MenuItem value={25}>25 pacientes</MenuItem>
                    <MenuItem value={50}>50 pacientes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Filtro de edad */}
              {filterOptions && (
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom sx={{ fontWeight: 'bold' }}>
                    <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Rango de Edad: {preFilters.edad_min} - {preFilters.edad_max} años
                  </Typography>
                  <Slider
                    value={[preFilters.edad_min, preFilters.edad_max]}
                    onChange={(e, newValue) => {
                      handlePreFilterChange('edad_min', newValue[0]);
                      handlePreFilterChange('edad_max', newValue[1]);
                    }}
                    valueLabelDisplay="auto"
                    min={filterOptions.rangos.edad.min}
                    max={filterOptions.rangos.edad.max}
                    marks={[
                      { value: filterOptions.rangos.edad.min, label: `${filterOptions.rangos.edad.min}` },
                      { value: filterOptions.rangos.edad.max, label: `${filterOptions.rangos.edad.max}` }
                    ]}
                  />
                </Grid>
              )}

              {/* Filtro de citas mínimas */}
              <Grid item xs={12} md={6}>
                <Typography gutterBottom sx={{ fontWeight: 'bold' }}>
                  <LocalHospital sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Mínimo de citas: {preFilters.total_citas_min}
                </Typography>
                <Slider
                  value={preFilters.total_citas_min}
                  onChange={(e, newValue) => handlePreFilterChange('total_citas_min', newValue)}
                  valueLabelDisplay="auto"
                  min={1}
                  max={20}
                  marks={[
                    { value: 1, label: '1' },
                    { value: 5, label: '5' },
                    { value: 10, label: '10' },
                    { value: 20, label: '20+' }
                  ]}
                />
              </Grid>

              {/* Filtro de ubicaciones */}
              {filterOptions && filterOptions.ubicaciones.length > 0 && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>
                      <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Ubicaciones
                    </InputLabel>
                    <Select
                      multiple
                      value={preFilters.ubicaciones}
                      onChange={(e) => handlePreFilterChange('ubicaciones', e.target.value)}
                      label="Ubicaciones"
                      sx={{ borderRadius: '16px' }}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip 
                              key={value} 
                              label={value} 
                              size="small" 
                              sx={{ borderRadius: '12px' }}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {filterOptions.ubicaciones.slice(0, 20).map((ubicacion) => (
                        <MenuItem key={ubicacion.value} value={ubicacion.value}>
                          {ubicacion.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Botones de acción */}
              <Grid item xs={12}>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Button
                    variant="contained"
                    size="large"
                    onClick={classifyPatients}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Analytics />}
                    sx={{ 
                      borderRadius: '24px',
                      minWidth: '180px',
                      height: '48px'
                    }}
                  >
                    {loading ? 'Clasificando...' : 'Clasificar Pacientes'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={resetPreFilters}
                    startIcon={<Refresh />}
                    sx={{ 
                      borderRadius: '24px',
                      height: '48px'
                    }}
                  >
                    Limpiar
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Progreso de clasificación */}
      {loading && (
        <Card sx={{ mb: 3, borderRadius: '20px' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6">
                Clasificando pacientes con machine learning...
              </Typography>
              <CircularProgress size={24} />
            </Box>
            <LinearProgress 
              sx={{ borderRadius: '10px', height: '8px' }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Analizando comportamiento de asistencia, completación y pagos
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Filtros post-clasificación */}
      {allPatients.length > 0 && (
        <Card sx={{ mb: 3, borderRadius: '20px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList color="primary" />
              Filtrar por Segmento
            </Typography>
            <ButtonGroup variant="outlined" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Button 
                variant={postFilters.showAll ? 'contained' : 'outlined'}
                startIcon={<Group />}
                onClick={() => applySegmentFilter([])}
                sx={{ borderRadius: '20px' }}
              >
                Todos ({allPatients.length})
              </Button>
              <Button 
                variant={postFilters.segmentos.includes('Cumplido') ? 'contained' : 'outlined'}
                startIcon={<ThumbUp />}
                onClick={() => applySegmentFilter(['Cumplido'])}
                sx={{ 
                  borderRadius: '20px',
                  ...(postFilters.segmentos.includes('Cumplido') && {
                    bgcolor: SEGMENT_COLORS.Cumplido,
                    '&:hover': { bgcolor: SEGMENT_COLORS.Cumplido }
                  })
                }}
              >
                Cumplidos ({statistics?.segmentos?.Cumplido || 0})
              </Button>
              <Button 
                variant={postFilters.segmentos.includes('Irregular') ? 'contained' : 'outlined'}
                startIcon={<HelpOutline />}
                onClick={() => applySegmentFilter(['Irregular'])}
                sx={{ 
                  borderRadius: '20px',
                  ...(postFilters.segmentos.includes('Irregular') && {
                    bgcolor: SEGMENT_COLORS.Irregular,
                    '&:hover': { bgcolor: SEGMENT_COLORS.Irregular }
                  })
                }}
              >
                Irregulares ({statistics?.segmentos?.Irregular || 0})
              </Button>
              <Button 
                variant={postFilters.segmentos.includes('Problemático') ? 'contained' : 'outlined'}
                startIcon={<Warning />}
                onClick={() => applySegmentFilter(['Problemático'])}
                sx={{ 
                  borderRadius: '20px',
                  ...(postFilters.segmentos.includes('Problemático') && {
                    bgcolor: SEGMENT_COLORS.Problemático,
                    '&:hover': { bgcolor: SEGMENT_COLORS.Problemático }
                  })
                }}
              >
                Problemáticos ({statistics?.segmentos?.Problemático || 0})
              </Button>
            </ButtonGroup>
            
            {filteredPatients.length !== allPatients.length && (
              <Typography variant="body2" color="text.secondary">
                Mostrando {filteredPatients.length} de {allPatients.length} pacientes clasificados
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      {filteredPatients.length > 0 && (
        <Fade in={true}>
          <Box sx={{ mt: 3 }}>
            {/* Tabs */}
            <Paper sx={{ borderRadius: '20px 20px 0 0', overflow: 'hidden' }}>
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)}
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    minHeight: '64px',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }
                }}
              >
                <Tab 
                  label={`Vista de Tarjetas (${filteredPatients.length})`}
                  icon={<Group />}
                  iconPosition="start"
                />
                <Tab 
                  label="Análisis Gráfico" 
                  icon={<ShowChart />}
                  iconPosition="start"
                />
              </Tabs>
            </Paper>

            {/* Tab 0: Vista de Tarjetas */}
            {tabValue === 0 && (
              <Paper sx={{ p: 3, borderRadius: '0 0 20px 20px' }}>
                {/* Estadísticas rápidas */}
                {statistics && (
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={6} md={3}>
                      <Paper 
                        elevation={2}
                        sx={{ 
                          p: 3, 
                          textAlign: 'center',
                          borderRadius: '20px',
                          background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                          color: 'white'
                        }}
                      >
                        <ThumbUp sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="h4" fontWeight="bold">
                          {statistics.segmentos.Cumplido || 0}
                        </Typography>
                        <Typography variant="caption">Cumplidos</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper 
                        elevation={2}
                        sx={{ 
                          p: 3, 
                          textAlign: 'center',
                          borderRadius: '20px',
                          background: 'linear-gradient(135deg, #F57C00 0%, #FF9800 100%)',
                          color: 'white'
                        }}
                      >
                        <HelpOutline sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="h4" fontWeight="bold">
                          {statistics.segmentos.Irregular || 0}
                        </Typography>
                        <Typography variant="caption">Irregulares</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper 
                        elevation={2}
                        sx={{ 
                          p: 3, 
                          textAlign: 'center',
                          borderRadius: '20px',
                          background: 'linear-gradient(135deg, #D32F2F 0%, #F44336 100%)',
                          color: 'white'
                        }}
                      >
                        <Warning sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="h4" fontWeight="bold">
                          {statistics.segmentos.Problemático || 0}
                        </Typography>
                        <Typography variant="caption">Problemáticos</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: '20px' }}>
                        <Group sx={{ fontSize: 32, mb: 1, color: '#1976d2' }} />
                        <Typography variant="h4" fontWeight="bold" color="primary">
                          {statistics.total_pacientes}
                        </Typography>
                        <Typography variant="caption">Total Clasificados</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                )}

                {/* Botón de exportar */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={exportToCSV}
                    startIcon={<Download />}
                    sx={{ borderRadius: '20px' }}
                  >
                    Exportar CSV
                  </Button>
                </Box>

                {/* Tarjetas de pacientes */}
                <Grid container spacing={3}>
                  {filteredPatients.map((patient, index) => (
                    <Grid item xs={12} sm={6} lg={4} key={patient.paciente_id}>
                      <Fade in={true} timeout={300 + index * 50}>
                        <Card 
                          elevation={3}
                          sx={{ 
                            height: '100%',
                            borderRadius: '20px',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'translateY(-8px)',
                              boxShadow: 6
                            }
                          }}
                          onClick={() => openPatientDetails(patient)}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: SEGMENT_COLORS[patient.segmento],
                                    width: 48,
                                    height: 48,
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {patient.nombre?.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="h6" noWrap fontWeight="bold">
                                    {patient.nombre_completo}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    ID: {patient.paciente_id} • {patient.edad} años
                                  </Typography>
                                </Box>
                              </Box>
                              {renderSegmentChip(patient.segmento)}
                            </Box>

                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  <LocationOn sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                                  Ubicación
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {patient.lugar || 'No especificada'}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  <LocalHospital sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                                  Total Citas
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {patient.total_citas}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  <CheckCircle sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                                  Tasa Asistencia
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {patient.tasa_completion ? `${(patient.tasa_completion * 100).toFixed(1)}%` : 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  <Psychology sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                                  Confianza
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {patient.confidence ? `${(patient.confidence * 100).toFixed(1)}%` : 'N/A'}
                                </Typography>
                              </Grid>
                            </Grid>

                            {patient.error_clasificacion && (
                              <Alert severity="warning" sx={{ mt: 2, borderRadius: '12px' }}>
                                Error: {patient.error_clasificacion}
                              </Alert>
                            )}
                          </CardContent>
                        </Card>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}

            {/* Tab 1: Análisis Gráfico */}
            {tabValue === 1 && statistics && (
              <Paper sx={{ p: 3, borderRadius: '0 0 20px 20px' }}>
                {/* Selector de tipo de gráfico */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Selecciona el tipo de visualización:
                  </Typography>
                  <ButtonGroup variant="outlined">
                    <Button
                      variant={chartType === 0 ? 'contained' : 'outlined'}
                      onClick={() => setChartType(0)}
                      startIcon={<PieIcon />}
                      sx={{ borderRadius: '20px 0 0 20px' }}
                    >
                      Distribución
                    </Button>
                    <Button
                      variant={chartType === 1 ? 'contained' : 'outlined'}
                      onClick={() => setChartType(1)}
                      startIcon={<BarIcon />}
                    >
                      Ubicaciones
                    </Button>
                    <Button
                      variant={chartType === 2 ? 'contained' : 'outlined'}
                      onClick={() => setChartType(2)}
                      startIcon={<ShowChart />}
                      sx={{ borderRadius: '0 20px 20px 0' }}
                    >
                      Edad vs Citas
                    </Button>
                  </ButtonGroup>
                </Box>

                {/* Contenedor del gráfico */}
                <Card elevation={2} sx={{ borderRadius: '20px', overflow: 'hidden', mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {chartType === 0 && 'Distribución por Tipo de Comportamiento'}
                      {chartType === 1 && 'Pacientes por Ubicación'}
                      {chartType === 2 && 'Edad vs Total de Citas por Segmento'}
                    </Typography>
                    {renderChart()}
                  </CardContent>
                </Card>

                {/* Estadísticas detalladas */}
                <Card elevation={2} sx={{ borderRadius: '20px' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Analytics />
                      Resumen de Comportamiento
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <Typography variant="h3" color="primary" fontWeight="bold">
                            {statistics.total_pacientes}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Clasificados
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <Typography variant="h3" color="success.main" fontWeight="bold">
                            {((statistics.segmentos.Cumplido || 0) / statistics.total_pacientes * 100).toFixed(0)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Comportamiento Bueno
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <Typography variant="h3" color="warning.main" fontWeight="bold">
                            {((statistics.segmentos.Irregular || 0) / statistics.total_pacientes * 100).toFixed(0)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Comportamiento Irregular
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <Typography variant="h3" color="error.main" fontWeight="bold">
                            {((statistics.segmentos.Problemático || 0) / statistics.total_pacientes * 100).toFixed(0)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Requieren Atención
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Paper>
            )}
          </Box>
        </Fade>
      )}

      {/* Estado vacío */}
      {!loading && allPatients.length === 0 && (
        <Fade in={true}>
          <Paper 
            elevation={0}
            sx={{ 
              textAlign: 'center', 
              py: 8,
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)'
            }}
          >
            <Psychology sx={{ fontSize: 80, color: '#1976D2', mb: 3 }} />
            <Typography variant="h4" color="primary" gutterBottom fontWeight="bold">
              Comienza a clasificar pacientes
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              Aplica filtros para analizar automáticamente el comportamiento de tus pacientes
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => setFiltersExpanded(true)}
              sx={{ borderRadius: '24px', minWidth: '200px' }}
            >
              Abrir Filtros
            </Button>
          </Paper>
        </Fade>
      )}

      {/* Modal de detalles del paciente */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '20px' }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar 
                sx={{ 
                  bgcolor: selectedPatient ? SEGMENT_COLORS[selectedPatient.segmento] : '#1976D2',
                  width: 56,
                  height: 56,
                  fontSize: '1.5rem'
                }}
              >
                {selectedPatient?.nombre?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {selectedPatient?.nombre_completo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ID: {selectedPatient?.paciente_id}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {selectedPatient && renderSegmentChip(selectedPatient.segmento, 'medium')}
              <IconButton onClick={() => setDetailsOpen(false)}>
                <Close />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedPatient && (
            <Grid container spacing={3}>
              {/* Información personal */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person />
                  Información Personal
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Cake color="action" />
                      <Typography variant="body2" color="text.secondary">Edad</Typography>
                    </Box>
                    <Typography variant="h6">{selectedPatient.edad} años</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Person color="action" />
                      <Typography variant="body2" color="text.secondary">Género</Typography>
                    </Box>
                    <Typography variant="h6">{selectedPatient.genero || 'No especificado'}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <LocationOn color="action" />
                      <Typography variant="body2" color="text.secondary">Ubicación</Typography>
                    </Box>
                    <Typography variant="h6">{selectedPatient.lugar || 'No especificada'}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Phone color="action" />
                      <Typography variant="body2" color="text.secondary">Teléfono</Typography>
                    </Box>
                    <Typography variant="h6">{selectedPatient.telefono || 'No disponible'}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Métricas de comportamiento */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Analytics />
                  Métricas de Comportamiento
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <LocalHospital color="action" />
                      <Typography variant="body2" color="text.secondary">Total Citas</Typography>
                    </Box>
                    <Typography variant="h6">{selectedPatient.total_citas}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <CheckCircle color="action" />
                      <Typography variant="body2" color="text.secondary">Tasa Completación</Typography>
                    </Box>
                    <Typography variant="h6">
                      {selectedPatient.tasa_completion ? `${(selectedPatient.tasa_completion * 100).toFixed(1)}%` : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Warning color="action" />
                      <Typography variant="body2" color="text.secondary">Tasa No-Show</Typography>
                    </Box>
                    <Typography variant="h6">
                      {selectedPatient.tasa_noshow ? `${(selectedPatient.tasa_noshow * 100).toFixed(1)}%` : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Cancel color="action" />
                      <Typography variant="body2" color="text.secondary">Citas Canceladas</Typography>
                    </Box>
                    <Typography variant="h6">{selectedPatient.citas_canceladas || 0}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Información de clasificación */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Psychology />
                  Clasificación Automática
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={4}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Group color="action" />
                      <Typography variant="body2" color="text.secondary">Segmento</Typography>
                    </Box>
                    {renderSegmentChip(selectedPatient.segmento, 'medium')}
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Analytics color="action" />
                      <Typography variant="body2" color="text.secondary">Cluster</Typography>
                    </Box>
                    <Typography variant="h6">{selectedPatient.cluster ?? 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <TrendingUp color="action" />
                      <Typography variant="body2" color="text.secondary">Confianza</Typography>
                    </Box>
                    <Typography variant="h6">
                      {selectedPatient.confidence ? `${(selectedPatient.confidence * 100).toFixed(1)}%` : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              {/* Interpretación del comportamiento */}
              <Grid item xs={12}>
                <Card sx={{ mt: 2, borderRadius: '16px', bgcolor: '#f8f9fa' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Interpretación del Comportamiento
                    </Typography>
                    <Typography variant="body1">
                      {selectedPatient.segmento === 'Cumplido' && 
                        'Este paciente muestra un comportamiento excelente: asiste puntualmente a sus citas, completa sus tratamientos y mantiene sus pagos al día.'}
                      {selectedPatient.segmento === 'Irregular' && 
                        'Este paciente presenta un comportamiento inconsistente: puede tener buenas rachas alternadas con períodos problemáticos. Requiere seguimiento personalizado.'}
                      {selectedPatient.segmento === 'Problemático' && 
                        'Este paciente requiere atención especial: tiene tendencia a no asistir a las citas, cancelar con frecuencia o problemas con pagos. Se recomienda confirmación previa y seguimiento cercano.'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDetailsOpen(false)}
            variant="outlined"
            sx={{ borderRadius: '20px' }}
          >
            Cerrar
          </Button>
          <Button 
            variant="contained"
            sx={{ borderRadius: '20px' }}
            onClick={() => {
              console.log('Ver más detalles de:', selectedPatient);
            }}
          >
            Ver Historia Clínica
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Clustering;