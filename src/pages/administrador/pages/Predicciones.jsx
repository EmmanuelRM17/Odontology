import React, { useEffect, useState, useCallback } from 'react';
import {
    Box, Button, Card, CardContent, CircularProgress, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, useMediaQuery, Paper, Typography, Tooltip, TextField, InputAdornment, Select, MenuItem,
    FormControl, InputLabel, Alert, AlertTitle, Divider, Grid, Stack, Avatar, Tabs, Tab
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
    PsychologyRounded, Visibility, Search, Assessment, Person, Schedule, Email,
    TrendingUp, TrendingDown, WarningRounded, ErrorRounded, CheckCircleOutlined, InfoOutlined,
    Close, Refresh, CalendarToday, CalendarViewWeek, DateRange, Send, ViewList
} from '@mui/icons-material';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import Notificaciones from '../../../components/Layout/Notificaciones';

// Función para obtener el color según el nivel de riesgo BINARIO
const getRiskColor = (riskLevel, isDarkTheme) => {
    const colors = {
        ALTO: isDarkTheme ? '#ef4444' : '#dc2626',       // Rojo para alto riesgo
        BAJO: isDarkTheme ? '#10b981' : '#059669'        // Verde para bajo riesgo
    };
    return colors[riskLevel] || colors.BAJO;
};

// Función para obtener el icono según el nivel de riesgo BINARIO
const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
        case 'ALTO': return <WarningRounded />;
        case 'BAJO': return <CheckCircleOutlined />;
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
    const [servicioFilter, setServicioFilter] = useState('todos');
    const [periodoFilter, setPeriodoFilter] = useState('hoy');
    const [tabValue, setTabValue] = useState(0);

    // Estados para el modal de detalles
    const [selectedCita, setSelectedCita] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [emailMessage, setEmailMessage] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);
    const [citaDetalles, setCitaDetalles] = useState(null);
    const [loadingDetalles, setLoadingDetalles] = useState(false);

    // Estados para notificaciones
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');
    const [openNotification, setOpenNotification] = useState(false);

    // Colores del tema siguiendo el patrón
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

    // Función para obtener fechas según período
    const getFechaRango = useCallback((periodo) => {
        const hoy = new Date();
        const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

        switch (periodo) {
            case 'hoy':
                const finHoy = new Date(inicioHoy);
                finHoy.setHours(23, 59, 59, 999);
                return { inicio: inicioHoy, fin: finHoy };

            case 'semana':
                const inicioSemana = new Date(inicioHoy);
                const finSemana = new Date(inicioHoy);
                finSemana.setDate(inicioHoy.getDate() + 6);
                finSemana.setHours(23, 59, 59, 999);
                return { inicio: inicioSemana, fin: finSemana };

            case 'mes':
                const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
                finMes.setHours(23, 59, 59, 999);
                return { inicio: inicioMes, fin: finMes };

            case 'todos':
                return { inicio: new Date('2020-01-01'), fin: new Date('2030-12-31') };

            default:
                return { inicio: inicioHoy, fin: inicioHoy };
        }
    }, []);

    // Cargar citas desde la API (solo no completadas)
    const fetchCitas = useCallback(async () => {
        setLoadingCitas(true);
        try {
            const res = await fetch('https://back-end-4803.onrender.com/api/citas/all');
            if (!res.ok) throw new Error('Error al obtener las citas');

            const data = await res.json();
            // Filtrar solo citas no archivadas y no completadas
            const citasValidas = data.filter(c =>
                !c.archivado &&
                c.estado !== 'Completada' &&
                c.estado !== 'Cancelada'
            );

            setCitas(citasValidas);

            setNotificationMessage(`Se cargaron ${citasValidas.length} citas válidas para predicción`);
            setNotificationType('success');
            setOpenNotification(true);
        } catch (error) {
            console.error('Error cargando citas:', error);
            setCitas([]);

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

    // Aplicar filtros por período, servicio y búsqueda
    useEffect(() => {
        let filtered = citas;

        // Filtro por período (solo si no es "todos")
        if (periodoFilter !== 'todos') {
            const { inicio, fin } = getFechaRango(periodoFilter);
            filtered = filtered.filter(cita => {
                const fechaCita = new Date(cita.fecha_consulta);
                return fechaCita >= inicio && fechaCita <= fin;
            });
        }

        // Filtro por búsqueda (paciente)
        if (searchQuery) {
            filtered = filtered.filter(cita =>
                cita.paciente_nombre && cita.paciente_nombre.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filtro por servicio
        if (servicioFilter !== 'todos') {
            filtered = filtered.filter(cita => cita.categoria_servicio === servicioFilter);
        }

        // Ordenar por fecha
        filtered.sort((a, b) => new Date(a.fecha_consulta) - new Date(b.fecha_consulta));

        setFilteredCitas(filtered);
    }, [citas, searchQuery, servicioFilter, periodoFilter, getFechaRango]);

    // Obtener detalles completos de la cita para el modal
    const fetchCitaDetalles = async (citaId) => {
        setLoadingDetalles(true);
        try {
            const response = await fetch(`https://back-end-4803.onrender.com/api/ml/cita-detalles/${citaId}`);
            if (!response.ok) throw new Error('Error al obtener detalles');

            const data = await response.json();
            setCitaDetalles(data);
        } catch (error) {
            console.error('Error obteniendo detalles:', error);
            setNotificationMessage('Error al cargar los detalles de la cita');
            setNotificationType('error');
            setOpenNotification(true);
        } finally {
            setLoadingDetalles(false);
        }
    };

    // Manejar predicción individual - CORREGIDO para clasificación binaria
    const handlePredict = async (cita) => {
        const id = cita.consulta_id || cita.id;
        setLoadingPred(prev => ({ ...prev, [id]: true }));

        // Mapeo COMPLETO con todos los campos necesarios
        const payload = {
            // IDs
            cita_id: cita.consulta_id || cita.id,
            paciente_id: cita.paciente_id, // Puede ser null para no registrados

            // Fechas
            fecha_consulta: cita.fecha_consulta,
            fecha_solicitud: cita.fecha_solicitud || cita.fecha_consulta,

            // Datos del paciente usando los campos correctos del debugger
            paciente_genero: cita.paciente_genero || 'Femenino', // ✅ Campo correcto
            paciente_fecha_nacimiento: cita.paciente_fecha_nacimiento, // ✅ Campo correcto
            paciente_alergias: false, // Por defecto false para no registrados

            // Datos adicionales del paciente para historial
            correo: cita.paciente_correo, // ✅ Campo correcto
            telefono: cita.paciente_telefono, // ✅ Campo correcto
            nombre: cita.paciente_nombre, // ✅ Campo correcto

            // Datos del servicio
            categoria_servicio: cita.categoria_servicio || 'General',
            precio_servicio: parseFloat(cita.precio_servicio || 600),
            duracion: parseInt(cita.duracion || 30),

            // Estado y pago
            estado_pago: cita.estado_pago || 'Pendiente',
            tratamiento_pendiente: Boolean(cita.tratamiento_pendiente || cita.es_tratamiento),
        };

        console.log(JSON.stringify(payload, null, 2));

        try {
            const res = await fetch('https://back-end-4803.onrender.com/api/ml/predict-no-show', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            console.log("Status de respuesta:", res.status);

            if (!res.ok) {
                const errorResponse = await res.json();
                console.error("Error del servidor:", errorResponse);
                throw new Error(errorResponse.error || `Error ${res.status}`);
            }

            const json = await res.json();
            console.log("Respuesta exitosa:", json);

            if (json.success && json.prediction) {
                setResultados(prev => ({ ...prev, [id]: json.prediction }));

                // ✅ NOTIFICACIÓN SIN PROBABILIDADES - SOLO RESULTADO BINARIO
                const riskText = json.prediction.will_no_show ? 'NO asistirá' : 'SÍ asistirá';

                setNotificationMessage(`Predicción: ${riskText}`);
                setNotificationType(json.prediction.will_no_show ? 'warning' : 'success');
                setOpenNotification(true);
            } else {
                console.error('Error en respuesta de predicción:', json.error);
                setNotificationMessage(`Error en la predicción: ${json.error || 'Error desconocido'}`);
                setNotificationType('error');
                setOpenNotification(true);
            }
        } catch (error) {
            console.error('Error completo en predicción:', error);
            setNotificationMessage(`Error de conexión: ${error.message}`);
            setNotificationType('error');
            setOpenNotification(true);
        } finally {
            setLoadingPred(prev => ({ ...prev, [id]: false }));
        }
    };

    // Manejar predicción de todas las citas visibles (solo para hoy y semana)
    const handlePredictAll = async () => {
        if (periodoFilter === 'mes' || periodoFilter === 'todos') {
            setNotificationMessage('La predicción masiva está deshabilitada para períodos largos');
            setNotificationType('warning');
            setOpenNotification(true);
            return;
        }

        const citasSinPrediccion = filteredCitas.filter(cita => !resultados[cita.consulta_id]);

        if (citasSinPrediccion.length === 0) {
            setNotificationMessage('Todas las citas visibles ya tienen predicción');
            setNotificationType('info');
            setOpenNotification(true);
            return;
        }

        setNotificationMessage(`Iniciando predicción para ${citasSinPrediccion.length} citas...`);
        setNotificationType('info');
        setOpenNotification(true);

        for (const cita of citasSinPrediccion) {
            try {
                await handlePredict(cita);
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`Error prediciendo cita ${cita.consulta_id}:`, error);
            }
        }
    };

    // Obtener servicios únicos para el filtro
    const serviciosUnicos = [...new Set(citas.map(c => c.categoria_servicio).filter(Boolean))];

    // Mostrar detalles de la predicción (solo si ya se predijo)
    const handleShowDetails = async (cita) => {
        const resultado = resultados[cita.consulta_id];
        if (!resultado) {
            setNotificationMessage('Primero debe realizar la predicción para ver los detalles');
            setNotificationType('warning');
            setOpenNotification(true);
            return;
        }

        setSelectedCita(cita);
        await fetchCitaDetalles(cita.consulta_id);
        setDetailsOpen(true);
    };

    // Abrir diálogo de envío de email (solo para alto riesgo)
    const handleOpenEmailDialog = (cita) => {
        const resultado = resultados[cita.consulta_id];
        if (!resultado || !resultado.will_no_show) {
            setNotificationMessage('El envío de recordatorio solo está disponible para citas de alto riesgo');
            setNotificationType('info');
            setOpenNotification(true);
            return;
        }

        setSelectedCita(cita);
        // ✅ MENSAJE SIN PROBABILIDADES
        setEmailMessage(`Estimado/a ${cita.paciente_nombre},

Le recordamos que tiene una cita programada para el ${new Date(cita.fecha_consulta).toLocaleDateString('es-ES')} a las ${new Date(cita.fecha_consulta).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.

Nuestro sistema ha identificado esta cita como de alto riesgo de inasistencia, por lo que le pedimos confirme su asistencia llamando al consultorio.

Saludos cordiales,
Clínica Dental`);
        setEmailDialogOpen(true);
    };
    // Enviar email de recordatorio
    const handleSendEmail = async () => {
        if (!selectedCita || !emailMessage.trim()) return;

        setSendingEmail(true);
        try {
            const response = await fetch('https://back-end-4803.onrender.com/api/ml/send-reminder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paciente_id: selectedCita.paciente_id,
                    email: selectedCita.paciente_correo,
                    mensaje: emailMessage,
                    cita_id: selectedCita.consulta_id
                })
            });

            if (!response.ok) throw new Error('Error al enviar recordatorio');

            setNotificationMessage(`Recordatorio enviado a ${selectedCita.paciente_nombre}`);
            setNotificationType('success');
            setOpenNotification(true);
            setEmailDialogOpen(false);
            setEmailMessage('');
        } catch (error) {
            setNotificationMessage('Error al enviar el recordatorio');
            setNotificationType('error');
            setOpenNotification(true);
        } finally {
            setSendingEmail(false);
        }
    };

    // Función para formatear fecha
    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Función para calcular edad
    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return 'N/A';
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    };

    // Renderizar tarjetas de citas en formato agenda - CORREGIDO
    const renderCitaCard = (cita, index) => {
        const resultado = resultados[cita.consulta_id];
        const isLoading = loadingPred[cita.consulta_id];
        const tienePrediccion = !!resultado;
        const esAltoRiesgo = resultado && resultado.will_no_show;

        return (
            <Card key={cita.consulta_id} sx={{
                mb: 2,
                backgroundColor: colors.paper,
                border: `1px solid ${colors.border}`,
                borderLeft: resultado ? `4px solid ${getRiskColor(resultado.risk_level, isDarkTheme)}` : `4px solid ${colors.border}`,
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha(colors.primary, 0.15)}`
                }
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        {/* Avatar y información del paciente */}
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{
                                    bgcolor: colors.primary,
                                    width: 45,
                                    height: 45,
                                    mr: 2,
                                    fontSize: '1.1rem'
                                }}>
                                    {cita.paciente_nombre?.charAt(0)?.toUpperCase() || '?'}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
                                        {cita.paciente_nombre || 'No registrado'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                                        {formatFecha(cita.fecha_consulta)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Información del servicio */}
                        <Grid item xs={12} sm={3}>
                            <Typography variant="body1" sx={{ color: colors.text, fontWeight: 500 }}>
                                {cita.servicio_nombre}
                            </Typography>
                            <Chip
                                label={cita.categoria_servicio}
                                size="small"
                                sx={{
                                    fontSize: '0.7rem',
                                    backgroundColor: alpha(colors.primary, 0.1),
                                    color: colors.primary
                                }}
                            />
                        </Grid>

                        {/* Estado de la predicción - CORREGIDO */}
                        <Grid item xs={12} sm={3}>
                            {isLoading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CircularProgress size={20} sx={{ mr: 1 }} />
                                    <Typography variant="body2">Analizando...</Typography>
                                </Box>
                            ) : resultado ? (
                                <Chip
                                    icon={getRiskIcon(resultado.risk_level)}
                                    label={resultado.will_no_show ? 'NO Asistirá' : 'SÍ Asistirá'}
                                    sx={{
                                        backgroundColor: alpha(getRiskColor(resultado.risk_level, isDarkTheme), 0.2),
                                        color: getRiskColor(resultado.risk_level, isDarkTheme),
                                        fontWeight: 500
                                    }}
                                />
                            ) : (
                                <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                                    Sin predicción
                                </Typography>
                            )}
                        </Grid>

                        {/* Acciones */}
                        <Grid item xs={12} sm={2}>
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
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

                                <Tooltip title={tienePrediccion ? "Ver detalles" : "Primero realice la predicción"}>
                                    <span>
                                        <IconButton
                                            onClick={() => handleShowDetails(cita)}
                                            disabled={!tienePrediccion}
                                            sx={{
                                                color: tienePrediccion ? colors.secondaryText : colors.border,
                                                '&:hover': tienePrediccion ? { backgroundColor: alpha(colors.secondaryText, 0.1) } : {},
                                                '&:disabled': { color: colors.border }
                                            }}
                                        >
                                            <Visibility />
                                        </IconButton>
                                    </span>
                                </Tooltip>

                                <Tooltip title={esAltoRiesgo ? "Enviar recordatorio" : "Solo disponible para alto riesgo"}>
                                    <span>
                                        <IconButton
                                            onClick={() => handleOpenEmailDialog(cita)}
                                            disabled={!esAltoRiesgo}
                                            sx={{
                                                color: esAltoRiesgo ? colors.error : colors.border,
                                                '&:hover': esAltoRiesgo ? { backgroundColor: alpha(colors.error, 0.1) } : {},
                                                '&:disabled': { color: colors.border }
                                            }}
                                        >
                                            <Email />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        );
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
                            Predicción de Asistencia - Agenda
                        </Typography>
                    </Box>
                </Box>

                {/* Tabs para períodos con "Todos" */}
                <Paper sx={{
                    mb: 3,
                    backgroundColor: colors.paper,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '12px'
                }}>
                    <Tabs
                        value={tabValue}
                        onChange={(e, newValue) => {
                            setTabValue(newValue);
                            const periodos = ['hoy', 'semana', 'mes', 'todos'];
                            setPeriodoFilter(periodos[newValue]);
                        }}
                        sx={{ borderBottom: `1px solid ${colors.border}` }}
                    >
                        <Tab
                            icon={<CalendarToday />}
                            label="Hoy"
                            sx={{ color: colors.text }}
                        />
                        <Tab
                            icon={<CalendarViewWeek />}
                            label="Esta Semana"
                            sx={{ color: colors.text }}
                        />
                        <Tab
                            icon={<DateRange />}
                            label="Este Mes"
                            sx={{ color: colors.text }}
                        />
                        <Tab
                            icon={<ViewList />}
                            label="Todos"
                            sx={{ color: colors.text }}
                        />
                    </Tabs>
                </Paper>

                {/* Filtros */}
                <Paper sx={{
                    p: 2,
                    mb: 3,
                    backgroundColor: colors.paper,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '12px'
                }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Buscar paciente..."
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

                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Servicio</InputLabel>
                                <Select
                                    value={servicioFilter}
                                    label="Servicio"
                                    onChange={(e) => setServicioFilter(e.target.value)}
                                    sx={{ backgroundColor: colors.cardBackground }}
                                >
                                    <MenuItem value="todos">Todos los servicios</MenuItem>
                                    {serviciosUnicos.map(servicio => (
                                        <MenuItem key={servicio} value={servicio}>{servicio}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <Button
                                variant="contained"
                                startIcon={<Assessment />}
                                onClick={handlePredictAll}
                                disabled={
                                    Object.keys(loadingPred).some(key => loadingPred[key]) ||
                                    periodoFilter === 'mes' ||
                                    periodoFilter === 'todos' ||
                                    filteredCitas.length === 0
                                }
                                sx={{
                                    backgroundColor: colors.primary,
                                    '&:hover': { backgroundColor: alpha(colors.primary, 0.8) },
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    width: '100%'
                                }}
                            >
                                {(periodoFilter === 'mes' || periodoFilter === 'todos') ?
                                    'Deshabilitado (Período largo)' :
                                    `Predecir Todas (${filteredCitas.filter(c => !resultados[c.consulta_id]).length})`
                                }
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Estadísticas rápidas - CORREGIDAS */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={3}>
                        <Paper sx={{
                            p: 2,
                            backgroundColor: alpha(colors.primary, 0.1),
                            border: `1px solid ${alpha(colors.primary, 0.3)}`,
                            borderRadius: '8px'
                        }}>
                            <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>
                                {filteredCitas.length}
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.text }}>
                                Citas programadas
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Paper sx={{
                            p: 2,
                            backgroundColor: alpha(colors.success, 0.1),
                            border: `1px solid ${alpha(colors.success, 0.3)}`,
                            borderRadius: '8px'
                        }}>
                            <Typography variant="h6" sx={{ color: colors.success, fontWeight: 600 }}>
                                {Object.keys(resultados).length}
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.text }}>
                                Predicciones realizadas
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Paper sx={{
                            p: 2,
                            backgroundColor: alpha(colors.error, 0.1),
                            border: `1px solid ${alpha(colors.error, 0.3)}`,
                            borderRadius: '8px'
                        }}>
                            <Typography variant="h6" sx={{ color: colors.error, fontWeight: 600 }}>
                                {Object.values(resultados).filter(r => r.will_no_show).length}
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.text }}>
                                NO asistirán
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Paper sx={{
                            p: 2,
                            backgroundColor: alpha(colors.success, 0.1),
                            border: `1px solid ${alpha(colors.success, 0.3)}`,
                            borderRadius: '8px'
                        }}>
                            <Typography variant="h6" sx={{ color: colors.success, fontWeight: 600 }}>
                                {Object.values(resultados).filter(r => !r.will_no_show).length}
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.text }}>
                                SÍ asistirán
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Lista de citas en formato agenda */}
                <Box>
                    {filteredCitas.length > 0 ? (
                        filteredCitas.map((cita, index) => renderCitaCard(cita, index))
                    ) : (
                        <Paper sx={{
                            p: 4,
                            textAlign: 'center',
                            backgroundColor: colors.paper,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '12px'
                        }}>
                            <Typography variant="h6" sx={{ color: colors.secondaryText, mb: 1 }}>
                                No hay citas programadas
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                                No se encontraron citas para el período seleccionado
                            </Typography>
                        </Paper>
                    )}
                </Box>

                {/* Modal de detalles con datos reales - CORREGIDO */}
                <Dialog
                    open={detailsOpen}
                    onClose={() => setDetailsOpen(false)}
                    maxWidth="lg"
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
                            Análisis Detallado de Predicción
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
                                {loadingDetalles ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <Grid container spacing={3}>
                                        {/* Información del Paciente con datos reales */}
                                        <Grid item xs={12} md={6}>
                                            <Paper sx={{ p: 3, backgroundColor: colors.cardBackground, borderRadius: '12px' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.primary }}>
                                                    <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                    Datos del Paciente
                                                </Typography>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" sx={{ color: colors.secondaryText }}>Nombre completo:</Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            {selectedCita.paciente_nombre} {citaDetalles?.detalles?.apellido_paterno} {citaDetalles?.detalles?.apellido_materno}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" sx={{ color: colors.secondaryText }}>Edad:</Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            {citaDetalles?.detalles?.edad || calcularEdad(citaDetalles?.detalles?.fecha_nacimiento)} años
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" sx={{ color: colors.secondaryText }}>Género:</Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            {citaDetalles?.detalles?.genero || 'No especificado'}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" sx={{ color: colors.secondaryText }}>Teléfono:</Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            {citaDetalles?.telefono || 'No disponible'}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Typography variant="body2" sx={{ color: colors.secondaryText }}>Alergias conocidas:</Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            {citaDetalles?.alergias || 'Ninguna registrada'}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Paper>
                                        </Grid>

                                        {/* Información de la Cita con datos reales */}
                                        <Grid item xs={12} md={6}>
                                            <Paper sx={{ p: 3, backgroundColor: colors.cardBackground, borderRadius: '12px' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.primary }}>
                                                    <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                    Datos de la Cita
                                                </Typography>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" sx={{ color: colors.secondaryText }}>Servicio:</Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            {selectedCita.servicio_nombre}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" sx={{ color: colors.secondaryText }}>Categoría:</Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            {selectedCita.categoria_servicio}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" sx={{ color: colors.secondaryText }}>Precio:</Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            ${selectedCita.precio_servicio || '0.00'}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" sx={{ color: colors.secondaryText }}>Estado de pago:</Typography>
                                                        <Chip
                                                            label={selectedCita.estado_pago || 'Pendiente'}
                                                            size="small"
                                                            color={selectedCita.estado_pago === 'Pagado' ? 'success' : 'warning'}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Typography variant="body2" sx={{ color: colors.secondaryText }}>Fecha programada:</Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            {new Date(selectedCita.fecha_consulta).toLocaleString('es-ES')}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Paper>
                                        </Grid>

                                        {/* Resultado de la Predicción - CORREGIDO para clasificación binaria */}
                                        <Grid item xs={12} md={6}>
                                            <Paper sx={{ p: 3, backgroundColor: colors.cardBackground, borderRadius: '12px' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.primary }}>
                                                    <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                    Resultado del Análisis
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                    {getRiskIcon(resultados[selectedCita.consulta_id].risk_level)}
                                                    <Typography variant="h5" sx={{
                                                        ml: 1,
                                                        color: getRiskColor(resultados[selectedCita.consulta_id].risk_level, isDarkTheme),
                                                        fontWeight: 600
                                                    }}>
                                                        {resultados[selectedCita.consulta_id].will_no_show ? 'NO Asistirá' : 'SÍ Asistirá'}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body1" sx={{ mb: 1 }}>
                                                    <strong>Predicción del modelo:</strong> {resultados[selectedCita.consulta_id].will_no_show ? 'Inasistencia' : 'Asistencia'}
                                                </Typography>
                                                <Typography variant="body1" sx={{ mb: 1 }}>
                                                    <strong>Clasificación binaria:</strong> {resultados[selectedCita.consulta_id].prediction_binary}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                                                    Análisis basado en 16 variables predictivas del modelo RandomForest
                                                </Typography>
                                            </Paper>
                                        </Grid>

                                        {/* Historial Clínico con datos reales */}
                                        <Grid item xs={12} md={6}>
                                            <Paper sx={{ p: 3, backgroundColor: colors.cardBackground, borderRadius: '12px' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.primary }}>
                                                    <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                    Historial del Paciente
                                                </Typography>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" sx={{ color: colors.secondaryText }}>Total de citas:</Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.primary }}>
                                                            {citaDetalles?.total_citas_historicas || 1}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" sx={{ color: colors.secondaryText }}>No-shows previos:</Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.warning }}>
                                                            {citaDetalles?.total_no_shows_historicas || 0}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" sx={{ color: colors.secondaryText }}>% de asistencia:</Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.success }}>
                                                            {((1 - (citaDetalles?.pct_no_show_historico || 0)) * 100).toFixed(1)}%
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" sx={{ color: colors.secondaryText }}>Última cita:</Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            {citaDetalles?.dias_desde_ultima_cita ?
                                                                `Hace ${citaDetalles.dias_desde_ultima_cita} días` :
                                                                'Primera cita'
                                                            }
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Paper>
                                        </Grid>

                                        {/* Variables Más Importantes del Modelo */}
                                        <Grid item xs={12}>
                                            <Paper sx={{ p: 3, backgroundColor: colors.cardBackground, borderRadius: '12px' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.primary }}>
                                                    <PsychologyRounded sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                    Variables Críticas Analizadas
                                                </Typography>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} sm={6} md={3}>
                                                        <Box sx={{
                                                            p: 2,
                                                            border: `1px solid ${alpha(colors.primary, 0.3)}`,
                                                            borderRadius: '8px',
                                                            backgroundColor: alpha(colors.primary, 0.05)
                                                        }}>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                                                Tiempo de Anticipación
                                                            </Typography>
                                                            <Typography variant="h6" sx={{ color: colors.primary }}>
                                                                {Math.floor((new Date(selectedCita.fecha_consulta) - new Date(selectedCita.fecha_solicitud)) / (1000 * 60 * 60 * 24))} días
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: colors.secondaryText }}>
                                                                Días entre solicitud y cita
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={12} sm={6} md={3}>
                                                        <Box sx={{
                                                            p: 2,
                                                            border: `1px solid ${alpha(colors.warning, 0.3)}`,
                                                            borderRadius: '8px',
                                                            backgroundColor: alpha(colors.warning, 0.05)
                                                        }}>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                                                Hora de la Cita
                                                            </Typography>
                                                            <Typography variant="h6" sx={{ color: colors.warning }}>
                                                                {new Date(selectedCita.fecha_consulta).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: colors.secondaryText }}>
                                                                Horario programado
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={12} sm={6} md={3}>
                                                        <Box sx={{
                                                            p: 2,
                                                            border: `1px solid ${alpha(colors.success, 0.3)}`,
                                                            borderRadius: '8px',
                                                            backgroundColor: alpha(colors.success, 0.05)
                                                        }}>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                                                Día de la Semana
                                                            </Typography>
                                                            <Typography variant="h6" sx={{ color: colors.success }}>
                                                                {new Date(selectedCita.fecha_consulta).toLocaleDateString('es-ES', { weekday: 'long' })}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: colors.secondaryText }}>
                                                                Patrón semanal
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={12} sm={6} md={3}>
                                                        <Box sx={{
                                                            p: 2,
                                                            border: `1px solid ${alpha(colors.error, 0.3)}`,
                                                            borderRadius: '8px',
                                                            backgroundColor: alpha(colors.error, 0.05)
                                                        }}>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                                                Precio del Servicio
                                                            </Typography>
                                                            <Typography variant="h6" sx={{ color: colors.error }}>
                                                                ${selectedCita.precio_servicio || '0'}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: colors.secondaryText }}>
                                                                Costo del tratamiento
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Paper>
                                        </Grid>

                                        {/* Recomendaciones basadas en el riesgo - CORREGIDO */}
                                        <Grid item xs={12}>
                                            <Paper sx={{ p: 3, backgroundColor: colors.cardBackground, borderRadius: '12px' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.primary }}>
                                                    Recomendaciones del Sistema
                                                </Typography>
                                                {resultados[selectedCita.consulta_id].will_no_show ? (
                                                    <Alert severity="error" sx={{ mb: 2 }}>
                                                        <AlertTitle>🚨 Alto Riesgo - Paciente NO Asistirá</AlertTitle>
                                                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                            <li>Contactar al paciente 48-72 horas antes de la cita</li>
                                                            <li>Confirmar asistencia vía llamada telefónica</li>
                                                            <li>Considerar reprogramar en horario más conveniente</li>
                                                            <li>Mantener lista de espera para esta hora</li>
                                                            <li>Enviar recordatorio automático por email</li>
                                                        </ul>
                                                    </Alert>
                                                ) : (
                                                    <Alert severity="success" sx={{ mb: 2 }}>
                                                        <AlertTitle>✅ Bajo Riesgo - Paciente SÍ Asistirá</AlertTitle>
                                                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                            <li>Recordatorio estándar es suficiente</li>
                                                            <li>Alta probabilidad de asistencia</li>
                                                            <li>Paciente confiable según el modelo</li>
                                                        </ul>
                                                    </Alert>
                                                )}
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                )}
                            </Box>
                        )}
                    </DialogContent>

                    <DialogActions sx={{ p: 3, gap: 1 }}>
                        <Button
                            variant="outlined"
                            onClick={() => handleOpenEmailDialog(selectedCita)}
                            startIcon={<Email />}
                            disabled={!resultados[selectedCita?.consulta_id] || !resultados[selectedCita?.consulta_id]?.will_no_show}
                            sx={{
                                color: colors.primary,
                                borderColor: colors.primary,
                                '&:hover': {
                                    backgroundColor: alpha(colors.primary, 0.1)
                                }
                            }}
                        >
                            {resultados[selectedCita?.consulta_id]?.will_no_show ?
                                'Enviar Recordatorio Urgente' :
                                'Recordatorio (Solo Alto Riesgo)'
                            }
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => setDetailsOpen(false)}
                            sx={{
                                backgroundColor: colors.primary,
                                '&:hover': { backgroundColor: alpha(colors.primary, 0.8) }
                            }}
                        >
                            Cerrar
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Modal para envío de email - CORREGIDO */}
                <Dialog
                    open={emailDialogOpen}
                    onClose={() => setEmailDialogOpen(false)}
                    maxWidth="sm"
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
                        pb: 1,
                        backgroundColor: alpha(colors.error, 0.1)
                    }}>
                        <Typography variant="h6" sx={{ color: colors.error, fontWeight: 600 }}>
                            🚨 Enviar Recordatorio Urgente
                        </Typography>
                        <IconButton
                            onClick={() => setEmailDialogOpen(false)}
                            sx={{ color: colors.secondaryText }}
                        >
                            <Close />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent>
                        {selectedCita && (
                            <Box sx={{ py: 2 }}>
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                    Esta cita tiene <strong>alto riesgo de inasistencia</strong> según el modelo de clasificación. Se recomienda contacto directo.
                                </Alert>

                                <Typography variant="body1" sx={{ mb: 2, color: colors.text }}>
                                    <strong>Para:</strong> {selectedCita.paciente_nombre}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 2, color: colors.secondaryText }}>
                                    <strong>Email:</strong> {citaDetalles?.correo || 'No disponible'}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 2, color: colors.secondaryText }}>
                                    <strong>Cita:</strong> {formatFecha(selectedCita.fecha_consulta)}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3, color: colors.secondaryText }}>
                                    <strong>Predicción:</strong> Probablemente NO asistirá
                                </Typography>

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={8}
                                    label="Mensaje del recordatorio urgente"
                                    value={emailMessage}
                                    onChange={(e) => setEmailMessage(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: colors.cardBackground,
                                            '& fieldset': { borderColor: colors.border },
                                            '&:hover fieldset': { borderColor: colors.primary }
                                        }
                                    }}
                                />
                            </Box>
                        )}
                    </DialogContent>

                    <DialogActions sx={{ p: 2, gap: 1 }}>
                        <Button
                            variant="outlined"
                            onClick={() => setEmailDialogOpen(false)}
                            disabled={sendingEmail}
                            sx={{
                                color: colors.secondaryText,
                                borderColor: colors.border
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSendEmail}
                            disabled={sendingEmail || !emailMessage.trim()}
                            startIcon={sendingEmail ? <CircularProgress size={16} /> : <Send />}
                            sx={{
                                backgroundColor: colors.error,
                                '&:hover': { backgroundColor: alpha(colors.error, 0.8) }
                            }}
                        >
                            {sendingEmail ? 'Enviando...' : 'Enviar Recordatorio'}
                        </Button>
                    </DialogActions>
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