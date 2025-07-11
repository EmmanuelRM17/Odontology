import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import { motion } from "framer-motion";
import axios from "axios";
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Container, 
  Grid, 
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  Chip,
  IconButton,
  Badge,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  AlertTitle,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Collapse
} from "@mui/material";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PieChartIcon from '@mui/icons-material/PieChart';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useAuth } from '../../../components/Tools/AuthContext';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

// Panel de filtros simple
const PanelFiltros = ({ onFilterChange, loading }) => {
  const [expanded, setExpanded] = useState(false);
  const [filtros, setFiltros] = useState({
    periodo: '',
    fechaInicio: '',
    fechaFin: '',
    servicio: 'todos'
  });

  const aplicarFiltroRapido = (periodo) => {
    const nuevosFiltros = { ...filtros, periodo };
    setFiltros(nuevosFiltros);
    onFilterChange(nuevosFiltros);
  };

  const handleChange = (campo, valor) => {
    const nuevosFiltros = { ...filtros, [campo]: valor };
    setFiltros(nuevosFiltros);
  };

  const aplicarFiltros = () => {
    onFilterChange(filtros);
  };

  const resetearFiltros = () => {
    const filtrosVacios = {
      periodo: '',
      fechaInicio: '',
      fechaFin: '',
      servicio: 'todos'
    };
    setFiltros(filtrosVacios);
    onFilterChange(filtrosVacios);
  };

  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon color="primary" />
            <Typography variant="h6">Filtros</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={resetearFiltros} size="small">
              <RestartAltIcon />
            </IconButton>
            <IconButton onClick={() => setExpanded(!expanded)} size="small">
              <ExpandMoreIcon sx={{ 
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', 
                transition: '0.3s' 
              }} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {[
            { label: 'Hoy', value: 'hoy' },
            { label: 'Semana', value: 'semana' },
            { label: 'Mes', value: 'mes' },
            { label: 'Trimestre', value: 'trimestre' }
          ].map((filtro) => (
            <Chip
              key={filtro.value}
              label={filtro.label}
              onClick={() => aplicarFiltroRapido(filtro.value)}
              color={filtros.periodo === filtro.value ? 'primary' : 'default'}
              variant={filtros.periodo === filtro.value ? 'filled' : 'outlined'}
              disabled={loading}
            />
          ))}
        </Box>

        <Collapse in={expanded}>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                label="Fecha Inicio"
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => handleChange('fechaInicio', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Fecha Fin"
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => handleChange('fechaFin', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Servicio</InputLabel>
                <Select
                  value={filtros.servicio}
                  onChange={(e) => handleChange('servicio', e.target.value)}
                  label="Servicio"
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="consulta">Consulta</MenuItem>
                  <MenuItem value="limpieza">Limpieza</MenuItem>
                  <MenuItem value="ortodoncia">Ortodoncia</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={aplicarFiltros}
                sx={{ height: '40px' }}
              >
                Aplicar
              </Button>
            </Grid>
          </Grid>
        </Collapse>
      </CardContent>
    </Card>
  );
};

// Componente para vista de tratamientos
const TratamientosView = ({ data, loading, error, chartType, onChartTypeChange }) => {
  const { darkMode } = useThemeContext();
  
  const datosValidos = data && Array.isArray(data) && data.length > 1;
  
  const options = {
    title: "Servicios Odontológicos Realizados",
    titleTextStyle: {
      fontSize: 16,
      bold: true,
      color: darkMode ? "#f5f5f5" : "#333",
      fontName: "Roboto"
    },
    pieHole: chartType === "DonutChart" ? 0.4 : 0,
    backgroundColor: 'transparent',
    colors: ["#4285F4", "#EA4335", "#FBBC05", "#34A853", "#8710D8"],
    legend: { position: "right" },
    chartArea: { width: '80%', height: '80%' },
    vAxis: chartType === "BarChart" ? { title: "Cantidad" } : {},
    hAxis: chartType === "BarChart" ? { title: "Servicio" } : {}
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ 
          backgroundColor: "#1E3A8A", 
          color: "white", 
          padding: 1, 
          borderRadius: 1, 
          mb: 2, 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6">Servicios Odontológicos</Typography>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={onChartTypeChange}
            size="small"
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.1)',
              '& .MuiToggleButton-root': { 
                color: 'white',
                '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.3)' }
              }
            }}
          >
            <ToggleButton value="PieChart">
              <PieChartIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="DonutChart">
              <DonutLargeIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="BarChart">
              <BarChartIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 1 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        ) : !datosValidos ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: 300,
            color: 'text.secondary'
          }}>
            <ErrorOutlineIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" gutterBottom>Sin datos</Typography>
            <Typography variant="body2">No hay servicios para mostrar</Typography>
          </Box>
        ) : (
          <Chart
            chartType={chartType === "DonutChart" ? "PieChart" : chartType}
            width="100%"
            height="300px"
            data={data}
            options={options}
          />
        )}
      </CardContent>
    </Card>
  );
};

// Componente para vista de ingresos
const IngresosView = ({ data, loading, error, chartType, onChartTypeChange }) => {
  const { darkMode } = useThemeContext();
  
  const datosValidos = data && Array.isArray(data) && data.length > 1;
  
  const chartData = React.useMemo(() => {
    if (data.length <= 1) return data;
    
    if (chartType === "ColumnChart") {
      return data.map((row, index) => {
        if (index === 0) return row;
        return [row[0], row[1], row[1] > 1000 ? row[1].toString() : null];
      });
    }
    return data;
  }, [data, chartType]);
  
  const options = {
    title: "Ingresos Mensual y Anual",
    titleTextStyle: {
      fontSize: 16,
      bold: true,
      color: darkMode ? "#f5f5f5" : "#333",
      fontName: "Roboto"
    },
    backgroundColor: 'transparent',
    colors: ["#4285F4"],
    curveType: chartType === "LineChart" ? "function" : null,
    hAxis: { title: "Mes" },
    vAxis: { title: "Ingresos" },
    legend: { position: "bottom" },
    pointSize: 5,
    lineWidth: 3,
    tooltip: { isHtml: true },
    chartArea: { width: '80%', height: '70%' },
    annotations: {
      textStyle: {
        fontSize: 12,
        color: '#555'
      }
    }
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ 
          backgroundColor: "#1E3A8A", 
          color: "white", 
          padding: 1, 
          borderRadius: 1, 
          mb: 2, 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6">Ingresos Mensual y Anual</Typography>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={onChartTypeChange}
            size="small"
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.1)',
              '& .MuiToggleButton-root': { 
                color: 'white',
                '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.3)' }
              }
            }}
          >
            <ToggleButton value="LineChart">
              <ShowChartIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="ColumnChart">
              <BarChartIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="Table">
              <TableChartIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 1 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        ) : !datosValidos ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: 300,
            color: 'text.secondary'
          }}>
            <ErrorOutlineIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" gutterBottom>Sin datos</Typography>
            <Typography variant="body2">No hay ingresos para mostrar</Typography>
          </Box>
        ) : (
          <Chart
            chartType={chartType}
            width="100%"
            height="300px"
            data={chartData}
            options={options}
          />
        )}
      </CardContent>
    </Card>
  );
};

// Componente para vista de citas por día
const CitasDiaView = ({ data, loading, error, chartType, onChartTypeChange }) => {
  const { darkMode } = useThemeContext();
  
  const datosValidos = data && Array.isArray(data) && data.length > 1;
  
  const options = {
    title: "Citas por Día de la Semana",
    titleTextStyle: {
      fontSize: 16,
      bold: true,
      color: darkMode ? "#f5f5f5" : "#333",
      fontName: "Roboto"
    },
    backgroundColor: 'transparent',
    colors: ["#34A853"],
    legend: { position: "none" },
    hAxis: { title: "Día" },
    vAxis: { title: "Cantidad de Citas" },
    chartArea: { width: '80%', height: '70%' }
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ 
          backgroundColor: "#1E3A8A", 
          color: "white", 
          padding: 1, 
          borderRadius: 1, 
          mb: 2, 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6">Citas por Día de la Semana</Typography>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={onChartTypeChange}
            size="small"
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.1)',
              '& .MuiToggleButton-root': { 
                color: 'white',
                '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.3)' }
              }
            }}
          >
            <ToggleButton value="ColumnChart">
              <BarChartIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="LineChart">
              <ShowChartIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="Table">
              <TableChartIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 1 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        ) : !datosValidos ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: 300,
            color: 'text.secondary'
          }}>
            <ErrorOutlineIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" gutterBottom>Sin datos</Typography>
            <Typography variant="body2">No hay citas para mostrar</Typography>
          </Box>
        ) : (
          <Chart
            chartType={chartType}
            width="100%"
            height="300px"
            data={data}
            options={options}
          />
        )}
      </CardContent>
    </Card>
  );
};

// Componente principal del Dashboard
const Dashboard = () => {
  const { user } = useAuth();
  const { darkMode } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Estados para datos
  const [dataTratamientos, setDataTratamientos] = useState([["Servicio", "Cantidad"]]);
  const [dataIngresos, setDataIngresos] = useState([["Mes", "Ingresos", { role: "annotation" }]]);
  const [dataCitasDia, setDataCitasDia] = useState([["Día", "Cantidad"]]);
  const [proximasCitas, setProximasCitas] = useState([]);
  const [metricasResumen, setMetricasResumen] = useState({
    citasHoy: 0,
    citasSemana: 0,
    nuevoPacientes: 0,
    ingresosSemana: 0,
    tasaOcupacion: 0
  });

  // Estados para tipos de gráficas
  const [tratamientosChartType, setTratamientosChartType] = useState("PieChart");
  const [ingresosChartType, setIngresosChartType] = useState("LineChart");
  const [citasDiaChartType, setCitasDiaChartType] = useState("ColumnChart");

  // Estados de UI
  const [loading, setLoading] = useState({
    tratamientos: true,
    ingresos: true,
    citasDia: true,
    proximasCitas: true,
    metricas: true
  });
  const [error, setError] = useState({
    tratamientos: null,
    ingresos: null,
    citasDia: null,
    proximasCitas: null,
    metricas: null
  });
  const [tabSelected, setTabSelected] = useState("general");

  // Función para obtener los servicios más realizados
  const fetchTratamientos = async (filtros = {}) => {
    setLoading(prev => ({ ...prev, tratamientos: true }));
    try {
      let url = "https://back-end-4803.onrender.com/api/Graficas/topservicios";
      const params = new URLSearchParams();
      
      if (filtros.periodo) params.append('periodo', filtros.periodo);
      if (filtros.fechaInicio && filtros.fechaFin) {
        params.append('fechaInicio', filtros.fechaInicio);
        params.append('fechaFin', filtros.fechaFin);
      }
      if (filtros.servicio && filtros.servicio !== 'todos') {
        params.append('servicio', filtros.servicio);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data && response.data.length > 0) {
        const formattedData = [["Servicio", "Cantidad"]];
        response.data.slice(0, 5).forEach((item) => {
          formattedData.push([item.servicio_nombre, item.total_realizados]);
        });
        setDataTratamientos(formattedData);
      } else {
        setDataTratamientos([["Servicio", "Cantidad"]]);
      }
      
      setError(prev => ({ ...prev, tratamientos: null }));
    } catch (err) {
      console.error("Error obteniendo datos de tratamientos:", err);
      setError(prev => ({ ...prev, tratamientos: "Error al cargar los servicios odontológicos" }));
      setDataTratamientos([["Servicio", "Cantidad"]]);
    } finally {
      setLoading(prev => ({ ...prev, tratamientos: false }));
    }
  };

  // Función para obtener ingresos mensuales
  const fetchIngresos = async (filtros = {}) => {
    setLoading(prev => ({ ...prev, ingresos: true }));
    try {
      let url = "https://back-end-4803.onrender.com/api/Graficas/ingresos-mensuales";
      const params = new URLSearchParams();
      
      if (filtros.periodo) params.append('periodo', filtros.periodo);
      if (filtros.fechaInicio && filtros.fechaFin) {
        params.append('fechaInicio', filtros.fechaInicio);
        params.append('fechaFin', filtros.fechaFin);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data && response.data.length > 0) {
        const formattedData = [["Mes", "Ingresos", { role: "annotation" }]];
        const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                       "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        
        response.data.forEach((item) => {
          const ingreso = Number(item.total_ingresos);
          const mostrarAnotacion = ingreso > 1000 ? ingreso.toString() : null;
          formattedData.push([meses[item.mes - 1], ingreso, mostrarAnotacion]);
        });
        
        setDataIngresos(formattedData);
      } else {
        setDataIngresos([["Mes", "Ingresos", { role: "annotation" }]]);
      }
      
      setError(prev => ({ ...prev, ingresos: null }));
    } catch (err) {
      console.error("Error obteniendo datos de ingresos:", err);
      setError(prev => ({ ...prev, ingresos: "Error al cargar los datos de ingresos" }));
      setDataIngresos([["Mes", "Ingresos", { role: "annotation" }]]);
    } finally {
      setLoading(prev => ({ ...prev, ingresos: false }));
    }
  };

  // Función para obtener citas por día de la semana
  const fetchCitasPorDia = async (filtros = {}) => {
    setLoading(prev => ({ ...prev, citasDia: true }));
    try {
      let url = "https://back-end-4803.onrender.com/api/Graficas/citas-por-dia";
      const params = new URLSearchParams();
      
      if (filtros.periodo) params.append('periodo', filtros.periodo);
      if (filtros.fechaInicio && filtros.fechaFin) {
        params.append('fechaInicio', filtros.fechaInicio);
        params.append('fechaFin', filtros.fechaFin);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
      
      const formattedData = [["Día", "Cantidad"]];
      const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
      
      const citasPorDia = dias.map(dia => [dia, 0]);
      
      if (response.data && response.data.length > 0) {
        response.data.forEach((item) => {
          citasPorDia[item.dia_semana][1] = Number(item.total_citas);
        });
      }
      
      citasPorDia.forEach(row => {
        formattedData.push(row);
      });
      
      setDataCitasDia(formattedData);
      setError(prev => ({ ...prev, citasDia: null }));
    } catch (err) {
      console.error("Error obteniendo datos de citas por día:", err);
      setError(prev => ({ ...prev, citasDia: "Error al cargar las citas por día" }));
      setDataCitasDia([["Día", "Cantidad"]]);
    } finally {
      setLoading(prev => ({ ...prev, citasDia: false }));
    }
  };

  // Función para obtener las próximas citas
  const fetchProximasCitas = async (filtros = {}) => {
    setLoading(prev => ({ ...prev, proximasCitas: true }));
    try {
      let url = "https://back-end-4803.onrender.com/api/Graficas/proximas-citas";
      const params = new URLSearchParams();
      
      params.append('limite', '6');
      if (filtros.servicio && filtros.servicio !== 'todos') {
        params.append('servicio', filtros.servicio);
      }
      
      url += `?${params.toString()}`;
      
      const response = await axios.get(url);
      
      if (response.data && response.data.length > 0) {
        const citasFormateadas = response.data.map(cita => ({
          id: cita.id,
          paciente: `${cita.nombre} ${cita.aPaterno}`,
          servicio: cita.servicio_nombre,
          fecha: new Date(cita.fecha_consulta).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }),
          hora: new Date(cita.fecha_consulta).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          estado: cita.estado
        }));
        
        setProximasCitas(citasFormateadas);
      } else {
        setProximasCitas([]);
      }
      
      setError(prev => ({ ...prev, proximasCitas: null }));
    } catch (err) {
      console.error("Error obteniendo próximas citas:", err);
      setError(prev => ({ ...prev, proximasCitas: "Error al cargar las próximas citas" }));
      setProximasCitas([]);
    } finally {
      setLoading(prev => ({ ...prev, proximasCitas: false }));
    }
  };

  // Función para obtener métricas de resumen
  const fetchMetricasResumen = async (filtros = {}) => {
    setLoading(prev => ({ ...prev, metricas: true }));
    try {
      let url = "https://back-end-4803.onrender.com/api/Graficas/metricas-resumen";
      const params = new URLSearchParams();
      
      if (filtros.periodo) params.append('periodo', filtros.periodo);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
      
      setMetricasResumen({
        citasHoy: response.data.citas_hoy,
        citasSemana: response.data.citas_semana,
        nuevoPacientes: response.data.nuevos_pacientes,
        ingresosSemana: response.data.ingresos_semana,
        tasaOcupacion: response.data.tasa_ocupacion
      });
      setError(prev => ({ ...prev, metricas: null }));
    } catch (err) {
      console.error("Error obteniendo métricas de resumen:", err);
      setError(prev => ({ ...prev, metricas: "Error al cargar las métricas del dashboard" }));
      setMetricasResumen({
        citasHoy: 0,
        citasSemana: 0,
        nuevoPacientes: 0,
        ingresosSemana: 0,
        tasaOcupacion: 0
      });
    } finally {
      setLoading(prev => ({ ...prev, metricas: false }));
    }
  };

  // Cargar todos los datos
  const cargarTodosDatos = async (filtros = {}) => {
    await Promise.all([
      fetchTratamientos(filtros),
      fetchIngresos(filtros),
      fetchCitasPorDia(filtros),
      fetchProximasCitas(filtros),
      fetchMetricasResumen(filtros)
    ]);
  };

  // Manejar cambio de filtros
  const handleFilterChange = (filtros) => {
    cargarTodosDatos(filtros);
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarTodosDatos();
  }, []);

  // Manejadores para cambio de tipo de gráficas
  const handleTratamientosChartChange = (event, newType) => {
    if (newType !== null) {
      setTratamientosChartType(newType);
    }
  };
  
  const handleIngresosChartChange = (event, newType) => {
    if (newType !== null) {
      setIngresosChartType(newType);
    }
  };
  
  const handleCitasDiaChartChange = (event, newType) => {
    if (newType !== null) {
      setCitasDiaChartType(newType);
    }
  };

  // Función para obtener color de chip según el estado de la cita
  const getChipColor = (estado) => {
    switch (estado) {
      case "Confirmada":
        return { bgcolor: "#D1FAE5", color: "#065F46" };
      case "Pendiente":
        return { bgcolor: "#FEF3C7", color: "#92400E" };
      case "Cancelada":
        return { bgcolor: "#FEE2E2", color: "#B91C1C" };
      case "Completada":
        return { bgcolor: "#E0E7FF", color: "#4F46E5" };
      default:
        return { bgcolor: "#F3F4F6", color: "#1F2937" };
    }
  };

  // Vista General
  const GeneralView = () => (
    <>
      {/* Tarjetas de métricas resumen */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={2.4}>
          <Paper
            elevation={2}
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              borderTop: '4px solid #3B82F6',
              borderRadius: '8px'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">Citas Hoy</Typography>
              <Badge 
                badgeContent={metricasResumen.citasHoy > 0 ? metricasResumen.citasHoy : "0"} 
                color="primary"
                sx={{ '& .MuiBadge-badge': { fontSize: '0.75rem', height: '20px', minWidth: '20px' } }}
              >
                <CalendarMonthIcon fontSize="small" color="action" />
              </Badge>
            </Box>
            {loading.metricas ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 'auto' }}>
                {metricasResumen.citasHoy}
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Paper
            elevation={2}
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              borderTop: '4px solid #10B981',
              borderRadius: '8px'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">Citas Semana</Typography>
              <EventAvailableIcon fontSize="small" color="action" />
            </Box>
            {loading.metricas ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 'auto' }}>
                {metricasResumen.citasSemana}
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Paper
            elevation={2}
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              borderTop: '4px solid #F59E0B',
              borderRadius: '8px'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">Nuevos Pacientes</Typography>
              <PersonIcon fontSize="small" color="action" />
            </Box>
            {loading.metricas ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 'auto' }}>
                {metricasResumen.nuevoPacientes}
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Paper
            elevation={2}
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              borderTop: '4px solid #EC4899',
              borderRadius: '8px'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">Ingresos Semana</Typography>
              <AttachMoneyIcon fontSize="small" color="action" />
            </Box>
            {loading.metricas ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 'auto' }}>
                ${metricasResumen.ingresosSemana}
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Paper
            elevation={2}
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              borderTop: '4px solid #8B5CF6',
              borderRadius: '8px'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">Ocupación</Typography>
              <TrendingUpIcon fontSize="small" color="action" />
            </Box>
            {loading.metricas ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 'auto' }}>
                {metricasResumen.tasaOcupacion}%
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Gráficas y datos principales */}
      <Grid container spacing={3}>
        {/* Gráfica de servicios */}
        <Grid item xs={12} md={6}>
          <TratamientosView 
            data={dataTratamientos}
            loading={loading.tratamientos}
            error={error.tratamientos}
            chartType={tratamientosChartType}
            onChartTypeChange={handleTratamientosChartChange}
          />
        </Grid>

        {/* Gráfica de ingresos */}
        <Grid item xs={12} md={6}>
          <IngresosView 
            data={dataIngresos}
            loading={loading.ingresos}
            error={error.ingresos}
            chartType={ingresosChartType}
            onChartTypeChange={handleIngresosChartChange}
          />
        </Grid>
        
        {/* Gráfica de citas por día */}
        <Grid item xs={12} md={6}>
          <CitasDiaView 
            data={dataCitasDia}
            loading={loading.citasDia}
            error={error.citasDia}
            chartType={citasDiaChartType}
            onChartTypeChange={handleCitasDiaChartChange}
          />
        </Grid>
        
        {/* Próximas Citas */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: "#1E3A8A", 
                color: "white", 
                padding: 1, 
                borderRadius: 1, 
                mb: 2
              }}>
                <Typography variant="h6">Próximas Citas</Typography>
                <AccessTimeIcon />
              </Box>
              
              {loading.proximasCitas ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                  <CircularProgress />
                </Box>
              ) : error.proximasCitas ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column' }}>
                  <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error.proximasCitas}</Alert>
                </Box>
              ) : proximasCitas.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: 300,
                  color: 'text.secondary'
                }}>
                  <ScheduleIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" gutterBottom>Sin citas</Typography>
                  <Typography variant="body2">No hay citas próximas</Typography>
                </Box>
              ) : (
                <List sx={{ 
                  width: '100%', 
                  maxHeight: 300,
                  overflow: 'auto',
                  '& .MuiListItem-root': {
                    borderBottom: '1px solid #f0f0f0',
                    py: 1
                  }
                }}>
                  {proximasCitas.map((cita) => (
                    <ListItem 
                      key={cita.id}
                      sx={{ 
                        borderLeft: cita.estado === "Confirmada" ? '3px solid #10B981' : 
                                   cita.estado === "Pendiente" ? '3px solid #F59E0B' : 
                                   cita.estado === "Cancelada" ? '3px solid #EF4444' : '3px solid #6B7280',
                        backgroundColor: '#FAFAFA', 
                        mb: 1,
                        borderRadius: '4px'
                      }}
                      secondaryAction={
                        <IconButton edge="end" aria-label="opciones">
                          <MoreVertIcon />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: cita.estado === "Confirmada" ? '#D1FAE5' : 
                                  cita.estado === "Pendiente" ? '#FEF3C7' : 
                                  cita.estado === "Cancelada" ? '#FEE2E2' : '#F3F4F6' 
                        }}>
                          {cita.estado === "Confirmada" ? 
                            <CheckCircleIcon sx={{ color: '#065F46' }} /> : 
                            <PriorityHighIcon sx={{ 
                              color: cita.estado === "Pendiente" ? '#92400E' : 
                                     cita.estado === "Cancelada" ? '#B91C1C' : '#1F2937' 
                            }} />
                          }
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {cita.paciente}
                            </Typography>
                            <Chip 
                              label={cita.estado} 
                              size="small"
                              sx={{ 
                                ...getChipColor(cita.estado),
                                height: '20px',
                                '& .MuiChip-label': { px: 1, py: 0.5, fontSize: '0.7rem' }
                              }} 
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span" color="text.primary">
                              {cita.servicio}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              component="span" 
                              color="text.secondary" 
                              sx={{ display: 'block' }}
                            >
                              {cita.fecha} • {cita.hora}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={{ width: "100%", padding: "16px" }}
    >
      <Container maxWidth="lg">
        {/* Encabezado */}
        <Paper 
          elevation={3} 
          sx={{ 
            mb: 3, 
            p: 2, 
            background: "linear-gradient(90deg, #1E3A8A 0%, #2563EB 100%)",
            color: "white",
            borderRadius: "8px",
            textAlign: "center"
          }}
        >
          <Typography variant="h5" component="h1">
            Panel de Control - Odontología Carol
          </Typography>
        </Paper>

        {/* Notificaciones */}
        <Notificaciones />

        {/* Panel de filtros */}
        <PanelFiltros 
          onFilterChange={handleFilterChange}
          loading={Object.values(loading).some(Boolean)}
        />

        {/* Pestañas */}
        <Paper 
          elevation={2} 
          sx={{ 
            mb: 3, 
            borderRadius: '12px', 
            overflow: 'hidden'
          }}
        >
          <Tabs 
            value={tabSelected} 
            onChange={(e, newValue) => setTabSelected(newValue)}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile}
            allowScrollButtonsMobile
            textColor="primary"
            indicatorColor="primary"
            sx={{ 
              background: darkMode ? 'rgba(30, 58, 138, 0.1)' : '#F8FAFC',
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                py: 2,
                transition: 'all 0.2s ease',
                borderBottom: '1px solid #E2E8F0',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(37, 99, 235, 0.1)' : '#EFF6FF',
                },
                '&.Mui-selected': {
                  color: '#2563EB',
                }
              }
            }}
          >
            <Tab 
              label="General" 
              value="general" 
              icon={<TrendingUpIcon />} 
              iconPosition="start" 
            />
          </Tabs>
        </Paper>

        {/* Contenido según pestaña seleccionada */}
        <GeneralView />
        
        {/* Pie de página */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Última actualización: {new Date().toLocaleString()}
          </Typography>
        </Box>
      </Container>
    </motion.div>
  );
};

export default Dashboard;