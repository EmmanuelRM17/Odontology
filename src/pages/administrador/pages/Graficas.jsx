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
  Divider,
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
  useMediaQuery
} from "@mui/material";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import MoreVertIcon from '@mui/icons-material/MoreVert';

/**
 * Dashboard de Odontología
 * 
 * Componente principal que muestra estadísticas y gráficas de servicios
 * odontológicos, citas frecuentes y análisis de pacientes.
 */
const Dashboard = () => {
  // Estados para almacenar datos
  const [dataTratamientos, setDataTratamientos] = useState([["Servicio", "Cantidad"]]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabSelected, setTabSelected] = useState("general");
  
  // Theme para responsive
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Configuración para gráfica de servicios
  const optionsTratamientos = {
    title: "Servicios Odontológicos Realizados",
    titleTextStyle: {
      fontSize: 16,
      bold: true,
      color: "#333",
      fontName: "Roboto"
    },
    pieHole: 0.4,
    is3D: false,
    backgroundColor: 'transparent',
    colors: ["#4285F4", "#EA4335", "#FBBC05", "#34A853", "#8710D8"],
    legend: { position: "right" },
    chartArea: { width: '80%', height: '80%' }
  };

  // Configuración para gráfica de ingresos
  const optionsIngresos = {
    title: "Ingresos Mensual y Anual de los Servicios Odontológicos",
    titleTextStyle: {
      fontSize: 16,
      bold: true,
      color: "#333",
      fontName: "Roboto"
    },
    backgroundColor: 'transparent',
    colors: ["#4285F4"],
    curveType: "function",
    hAxis: { title: "Mes" },
    vAxis: { title: "Ingresos" },
    legend: { position: "bottom" },
    pointSize: 5,
    lineWidth: 3,
    tooltip: { isHtml: true },
    chartArea: { width: '80%', height: '70%' }
  };

  // Configuración para gráfica de citas por día
  const optionsCitasDia = {
    title: "Citas por Día de la Semana",
    titleTextStyle: {
      fontSize: 16,
      bold: true,
      color: "#333",
      fontName: "Roboto"
    },
    backgroundColor: 'transparent',
    colors: ["#34A853"],
    legend: { position: "none" },
    hAxis: { title: "Día" },
    vAxis: { title: "Cantidad de Citas", maxValue: 18 },
    chartArea: { width: '80%', height: '70%' }
  };

  // Datos estáticos para ingresos mensuales, con valores menores a 18
  const dataIngresos = [
    ["Mes", "Ingresos", { role: "annotation" }],
    ["Enero", 5, null],
    ["Febrero", 8, null],
    ["Marzo", 12, "12"],
    ["Abril", 7, null],
    ["Mayo", 9, null],
    ["Junio", 6, null],
    ["Julio", 15, null],
    ["Agosto", 11, null],
    ["Septiembre", 10, null],
    ["Octubre", 13, null],
    ["Noviembre", 9, null],
    ["Diciembre", 14, null],
  ];

  // Datos de citas por día de la semana
  const dataCitasDia = [
    ["Día", "Cantidad"],
    ["Lunes", 14],
    ["Martes", 12],
    ["Miércoles", 17],
    ["Jueves", 15],
    ["Viernes", 16],
    ["Sábado", 8],
    ["Domingo", 3],
  ];

  // Datos estáticos de respaldo por si falla la API
  const dataTratamientosRespaldo = [
    ["Servicio", "Cantidad"],
    ["Limpieza", 12],
    ["Extracción", 8],
    ["Endodoncia", 5],
    ["Blanqueamiento", 7],
    ["Ortodoncia", 4],
  ];

  // Datos de próximas citas
  const proximasCitas = [
    { id: 1, paciente: "Ana García", servicio: "Limpieza Dental", fecha: "18 Mar 2025", hora: "9:30 AM", estado: "Confirmada" },
    { id: 2, paciente: "Carlos López", servicio: "Extracción", fecha: "18 Mar 2025", hora: "11:00 AM", estado: "Pendiente" },
    { id: 3, paciente: "María Rodríguez", servicio: "Revisión", fecha: "19 Mar 2025", hora: "10:15 AM", estado: "Confirmada" },
    { id: 4, paciente: "Juan Pérez", servicio: "Endodoncia", fecha: "19 Mar 2025", hora: "3:45 PM", estado: "Pendiente" },
  ];

  // Datos de pacientes frecuentes
  const pacientesFrecuentes = [
    { id: 1, nombre: "Sofia Martínez", visitas: 12, ultimaVisita: "12 Mar 2025", tratamiento: "Ortodoncia" },
    { id: 2, nombre: "Roberto Sánchez", visitas: 10, ultimaVisita: "8 Mar 2025", tratamiento: "Limpieza" },
    { id: 3, nombre: "Laura Torres", visitas: 8, ultimaVisita: "15 Mar 2025", tratamiento: "Endodoncia" },
  ];

  // Métricas de resumen
  const metricasResumen = {
    citasHoy: 5,
    citasSemana: 17,
    nuevoPacientes: 3,
    ingresosSemana: 2450,
    tasaOcupacion: 78
  };

  // Función para obtener datos de servicios desde la API
  const fetchData = () => {
    setLoading(true);
    axios
      .get("https://back-end-4803.onrender.com/api/Graficas/topservicios")
      .then((response) => {
        const formattedData = [["Servicio", "Cantidad"]];
        
        // Limitar a máximo 5 servicios y asegurarse que ninguno exceda 18
        response.data.slice(0, 5).forEach((item) => {
          // Asegurar que ningún valor sea mayor que 18
          const cantidad = Math.min(item.total_realizados, 18);
          formattedData.push([item.servicio_nombre, cantidad]);
        });
        
        setDataTratamientos(formattedData);
        setLoading(false);
        setError(null);
      })
      .catch((error) => {
        console.error("Error obteniendo datos de tratamientos:", error);
        // Usar datos de respaldo en caso de error
        setDataTratamientos(dataTratamientosRespaldo);
        setLoading(false);
        setError("No se pudieron cargar los datos del servidor. Mostrando datos estáticos.");
      });
  };

  // Efecto para cargar datos al montar el componente
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  // Estado de chip para citas
  const getChipColor = (estado) => {
    return estado === "Confirmada" 
      ? { bgcolor: "#D1FAE5", color: "#065F46" } 
      : { bgcolor: "#FEF3C7", color: "#92400E" };
  };

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

        {/* Pestañas */}
        <Box sx={{ 
          display: 'flex', 
          mb: 3, 
          overflow: 'auto',
          pb: 1
        }}>
          {["general", "citas", "pacientes", "finanzas"].map((tab) => (
            <Button 
              key={tab}
              sx={{ 
                mr: 1,
                px: 3,
                py: 1,
                borderRadius: '50px',
                textTransform: 'capitalize',
                backgroundColor: tabSelected === tab ? '#1E3A8A' : 'transparent',
                color: tabSelected === tab ? 'white' : 'text.primary',
                '&:hover': {
                  backgroundColor: tabSelected === tab ? '#1E3A8A' : '#F3F4F6',
                }
              }}
              onClick={() => setTabSelected(tab)}
            >
              {tab === "general" && "General"}
              {tab === "citas" && "Citas"}
              {tab === "pacientes" && "Pacientes"}
              {tab === "finanzas" && "Finanzas"}
            </Button>
          ))}
        </Box>

        {/* Mostrar error si existe */}
        {error && (
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              mb: 3, 
              backgroundColor: "#FDEDED", 
              color: "#5F2120",
              borderLeft: "4px solid #EF5350",
              textAlign: "center" 
            }}
          >
            <Typography variant="body1">{error}</Typography>
          </Paper>
        )}

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
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 'auto' }}>
                {metricasResumen.citasHoy}
              </Typography>
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
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 'auto' }}>
                {metricasResumen.citasSemana}
              </Typography>
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
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 'auto' }}>
                {metricasResumen.nuevoPacientes}
              </Typography>
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
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 'auto' }}>
                ${metricasResumen.ingresosSemana}
              </Typography>
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
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 'auto' }}>
                {metricasResumen.tasaOcupacion}%
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Gráficas y datos principales */}
        <Grid container spacing={3}>
          {/* Gráfica de servicios */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ 
                  backgroundColor: "#1E3A8A", 
                  color: "white", 
                  padding: 1, 
                  borderRadius: 1, 
                  mb: 2, 
                  textAlign: "center" 
                }}>
                  <Typography variant="h6">Servicios Odontológicos Realizados</Typography>
                </Box>
                <Chart
                  chartType="PieChart"
                  width="100%"
                  height="300px"
                  data={dataTratamientos}
                  options={optionsTratamientos}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfica de ingresos */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ 
                  backgroundColor: "#1E3A8A", 
                  color: "white", 
                  padding: 1, 
                  borderRadius: 1, 
                  mb: 2, 
                  textAlign: "center" 
                }}>
                  <Typography variant="h6">Ingresos Mensual y Anual</Typography>
                </Box>
                <Chart
                  chartType="LineChart"
                  width="100%"
                  height="300px"
                  data={dataIngresos}
                  options={optionsIngresos}
                />
              </CardContent>
            </Card>
          </Grid>
          
          {/* Gráfica de citas por día */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ 
                  backgroundColor: "#1E3A8A", 
                  color: "white", 
                  padding: 1, 
                  borderRadius: 1, 
                  mb: 2, 
                  textAlign: "center" 
                }}>
                  <Typography variant="h6">Citas por Día de la Semana</Typography>
                </Box>
                <Chart
                  chartType="ColumnChart"
                  width="100%"
                  height="300px"
                  data={dataCitasDia}
                  options={optionsCitasDia}
                />
              </CardContent>
            </Card>
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
                        borderLeft: cita.estado === "Confirmada" ? '3px solid #10B981' : '3px solid #F59E0B',
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
                        <Avatar sx={{ bgcolor: cita.estado === "Confirmada" ? '#D1FAE5' : '#FEF3C7' }}>
                          {cita.estado === "Confirmada" ? 
                            <EventAvailableIcon sx={{ color: '#065F46' }} /> : 
                            <PriorityHighIcon sx={{ color: '#92400E' }} />
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
              </CardContent>
            </Card>
          </Grid>
          
          {/* Pacientes Frecuentes */}
          <Grid item xs={12}>
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
                  <Typography variant="h6">Pacientes Frecuentes</Typography>
                  <LocalHospitalIcon />
                </Box>
                
                <Grid container spacing={2}>
                  {pacientesFrecuentes.map((paciente) => (
                    <Grid item xs={12} md={4} key={paciente.id}>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          display: 'flex', 
                          flexDirection: 'column',
                          height: '100%',
                          borderRadius: '8px',
                          backgroundColor: '#FAFAFA',
                          '&:hover': {
                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <Avatar
                            sx={{ 
                              bgcolor: '#E0E7FF', 
                              color: '#4F46E5',
                              width: 50, 
                              height: 50,
                              mr: 2 
                            }}
                          >
                            {paciente.nombre.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                              {paciente.nombre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {paciente.tratamiento}
                            </Typography>
                          </Box>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Última visita:
                          </Typography>
                          <Typography variant="body2" color="text.primary">
                            {paciente.ultimaVisita}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Total visitas:
                          </Typography>
                          <Chip
                            label={paciente.visitas}
                            size="small"
                            sx={{ 
                              backgroundColor: '#E0E7FF',
                              color: '#4F46E5',
                              fontWeight: 'bold'
                            }}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
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