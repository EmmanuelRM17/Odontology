import {
    Avatar, Box, Button, Card, CardContent, Chip, Grid, 
    IconButton, Paper, Typography, Tooltip, Dialog, DialogTitle,
    DialogContent, DialogActions
} from '@mui/material';
import React, { useCallback, useEffect, useState, useMemo, memo } from 'react';
import {
    CalendarMonth, Event, HealthAndSafety, CheckCircle,
    MedicalServices, LocalHospital, PersonOff, Visibility,
    ArrowBack, Description
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Notificaciones from '../../../../components/Layout/Notificaciones';
import { useThemeContext } from '../../../../components/Tools/ThemeContext';

// Paleta de colores
const getColors = (isDarkTheme) => ({
    background: isDarkTheme ? '#1a1f2e' : '#f5f7fa',
    paper: isDarkTheme ? '#242b3d' : '#ffffff',
    cardBg: isDarkTheme ? '#1e2838' : '#f8fafc',
    text: isDarkTheme ? '#e8eaf0' : '#2c3e50',
    secondaryText: isDarkTheme ? '#a8b2c1' : '#64748b',
    primary: isDarkTheme ? '#5b8fd9' : '#4a7eb8',
    hover: isDarkTheme ? 'rgba(91,143,217,0.08)' : 'rgba(74,126,184,0.06)',
    divider: isDarkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    titleColor: isDarkTheme ? '#7ba4dd' : '#2d3748',
    tratamiento: '#66b566',
    consulta: '#8a94a6',
    noRegistrado: '#f29f67',
    details: '#4a9fd9',
    cancel: '#d66464',
    edit: '#66b566',
    confirm: '#70c470',
    complete: '#5b9fd9',
    success: '#66b566',
    warning: '#f29f67',
    info: '#5b9fd9'
});

const STATUS_COLORS = {
    Pendiente: '#f29f67',
    Confirmada: '#70c470',
    Cancelada: '#d66464',
    Completada: '#5b9fd9',
    'PRE-REGISTRO': '#9575cd'
};

// Componente de tarjeta separado
const CitaCard = memo(({ cita, tipo, colors, formatDate, onViewDetails, canConfirmAppointment, handleConfirm, handleComplete }) => {
    const esTratamiento = cita?.es_tratamiento === 1;
    const estaRegistrado = cita?.paciente_id != null;
    const citaCompletada = cita?.estado === 'Completada';

    // Calcular color del avatar
    const avatarColor = (() => {
        if (!cita?.paciente_id) return colors.noRegistrado;
        const colorPool = ['#5C6BC0', '#26A69A', '#EC407A', '#AB47BC', '#7E57C2', '#42A5F5', '#29B6F6', '#26C6DA'];
        return colorPool[cita.paciente_id % colorPool.length];
    })();

    const esHoy = tipo === 'hoy';
    const esAtrasada = tipo === 'atrasadas';

    return (
        <Card
            sx={{
                border: esHoy ? `2px solid ${colors.primary}` : esAtrasada ? `2px solid ${colors.warning}` : `1px solid ${colors.divider}`,
                borderRadius: '16px',
                bgcolor: esAtrasada ? alpha(colors.warning, 0.03) : colors.paper,
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 20px ${alpha(colors.primary, 0.15)}`,
                    borderColor: colors.primary
                },
                height: '100%'
            }}
        >
            <CardContent sx={{ p: 2.5 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <Avatar
                            sx={{
                                bgcolor: avatarColor,
                                width: 42,
                                height: 42,
                                mr: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600,
                                border: estaRegistrado ? 'none' : `2px solid ${colors.noRegistrado}`,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                        >
                            {cita.paciente_nombre ? cita.paciente_nombre.charAt(0).toUpperCase() : '?'}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 600,
                                    color: colors.text,
                                    lineHeight: 1.3,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {cita.paciente_nombre} {cita.paciente_apellido_paterno}
                            </Typography>
                            <Typography variant="caption" sx={{ color: colors.secondaryText, fontSize: '0.75rem' }}>
                                {esHoy ? formatDate(cita.fecha_consulta, 'hora') : formatDate(cita.fecha_consulta, 'fecha-corta')} • {formatDate(cita.fecha_consulta, 'hora')}
                            </Typography>
                        </Box>
                    </Box>
                    <Chip
                        label={cita.estado}
                        size="small"
                        sx={{
                            bgcolor: STATUS_COLORS[cita.estado] || '#bdbdbd',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: '24px',
                            borderRadius: '12px',
                            ml: 1
                        }}
                    />
                </Box>

                {/* Servicio */}
                <Box sx={{ mb: 2, pl: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Box
                            sx={{
                                bgcolor: alpha(esTratamiento ? colors.tratamiento : colors.consulta, 0.1),
                                borderRadius: '10px',
                                p: 0.8,
                                mr: 1.5,
                                display: 'flex'
                            }}
                        >
                            {esTratamiento ? (
                                <MedicalServices sx={{ color: colors.tratamiento, fontSize: 16 }} />
                            ) : (
                                <LocalHospital sx={{ color: colors.consulta, fontSize: 16 }} />
                            )}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: colors.text,
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {cita.servicio_nombre}
                            </Typography>
                            <Typography variant="caption" sx={{ color: colors.secondaryText, fontSize: '0.7rem' }}>
                                {esTratamiento ? `Tratamiento (cita ${cita.numero_cita_calculado || 1})` : cita.categoria_servicio || "Consulta"}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Acciones */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.75, flexWrap: 'wrap' }}>
                    <Tooltip title="Ver detalles" arrow>
                        <IconButton
                            onClick={() => onViewDetails(cita)}
                            size="small"
                            sx={{
                                bgcolor: colors.details,
                                '&:hover': { bgcolor: alpha(colors.details, 0.85), transform: 'scale(1.1)' },
                                color: 'white',
                                width: 32,
                                height: 32,
                                borderRadius: '10px',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Visibility sx={{ fontSize: '1rem' }} />
                        </IconButton>
                    </Tooltip>

                    {!citaCompletada && cita.estado === 'Pendiente' && canConfirmAppointment(cita) && (
                        <Tooltip title="Confirmar" arrow>
                            <IconButton
                                onClick={() => handleConfirm(cita)}
                                size="small"
                                sx={{
                                    bgcolor: colors.confirm,
                                    '&:hover': { bgcolor: alpha(colors.confirm, 0.85), transform: 'scale(1.1)' },
                                    color: 'white',
                                    width: 32,
                                    height: 32,
                                    borderRadius: '10px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <CheckCircle sx={{ fontSize: '1rem' }} />
                            </IconButton>
                        </Tooltip>
                    )}

                    {!citaCompletada && cita.estado === 'Confirmada' && (
                        <Tooltip title="Completar" arrow>
                            <IconButton
                                onClick={() => handleComplete(cita)}
                                size="small"
                                sx={{
                                    bgcolor: colors.complete,
                                    '&:hover': { bgcolor: alpha(colors.complete, 0.85), transform: 'scale(1.1)' },
                                    color: 'white',
                                    width: 32,
                                    height: 32,
                                    borderRadius: '10px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <CheckCircle sx={{ fontSize: '1rem' }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
});

const MiAgenda = () => {
    const { isDarkTheme } = useThemeContext();
    const colors = useMemo(() => getColors(isDarkTheme), [isDarkTheme]);
    const navigate = useNavigate();

    // Estados
    const [citas, setCitas] = useState([]);
    const [tratamientos, setTratamientos] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState({ open: false, message: '', type: '' });
    
    // Estado para diálogo de detalles
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCita, setSelectedCita] = useState(null);

    // Cargar datos
    const fetchCitas = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch("https://back-end-4803.onrender.com/api/citas/all");
            if (!response.ok) throw new Error("Error al obtener las citas");

            const data = await response.json();
            const citasFiltradas = data.filter(cita => !cita.archivado);

            const citasPorTratamiento = {};
            citasFiltradas.forEach(cita => {
                if (cita.tratamiento_id) {
                    if (!citasPorTratamiento[cita.tratamiento_id]) {
                        citasPorTratamiento[cita.tratamiento_id] = [];
                    }
                    citasPorTratamiento[cita.tratamiento_id].push(cita);
                }
            });

            Object.keys(citasPorTratamiento).forEach(tratamientoId => {
                citasPorTratamiento[tratamientoId].sort((a, b) => new Date(a.fecha_consulta) - new Date(b.fecha_consulta));
                citasPorTratamiento[tratamientoId].forEach((cita, index) => {
                    cita.numero_cita_calculado = index + 1;
                });
            });

            const citasActualizadas = citasFiltradas.map(cita => {
                if (cita.tratamiento_id && citasPorTratamiento[cita.tratamiento_id]) {
                    const citaEnGrupo = citasPorTratamiento[cita.tratamiento_id].find(c => c.consulta_id === cita.consulta_id);
                    if (citaEnGrupo) return { ...cita, numero_cita_calculado: citaEnGrupo.numero_cita_calculado };
                }
                return cita;
            });

            setCitas(citasActualizadas);
        } catch (error) {
            console.error("Error cargando citas:", error);
            setNotification({ open: true, message: 'Error al cargar las citas.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchTratamientos = useCallback(async () => {
        try {
            const response = await fetch("https://back-end-4803.onrender.com/api/tratamientos/all");
            if (!response.ok) throw new Error("Error al obtener los tratamientos");
            const data = await response.json();
            const tratamientosMap = {};
            data.forEach(tratamiento => {
                tratamientosMap[tratamiento.id] = tratamiento;
            });
            setTratamientos(tratamientosMap);
        } catch (error) {
            console.error("Error cargando tratamientos:", error);
        }
    }, []);

    useEffect(() => {
        fetchCitas();
        fetchTratamientos();
    }, [fetchCitas, fetchTratamientos]);

    // Filtrar citas por período
    const citasPorPeriodo = useMemo(() => {
        const ahora = new Date();
        const hoyInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        const mañana = new Date(hoyInicio.getTime() + 24 * 60 * 60 * 1000);
        const proximaSemana = new Date(hoyInicio.getTime() + 7 * 24 * 60 * 60 * 1000);

        const citasHoy = citas.filter(cita => {
            const fechaCita = new Date(cita.fecha_consulta);
            return fechaCita >= hoyInicio && fechaCita < mañana;
        }).sort((a, b) => new Date(a.fecha_consulta) - new Date(b.fecha_consulta));

        const citasProximas = citas.filter(cita => {
            const fechaCita = new Date(cita.fecha_consulta);
            return fechaCita >= mañana && fechaCita < proximaSemana;
        }).sort((a, b) => new Date(a.fecha_consulta) - new Date(b.fecha_consulta));

        const citasAtrasadas = citas.filter(cita => {
            const fechaCita = new Date(cita.fecha_consulta);
            return fechaCita < hoyInicio && (cita.estado === 'Pendiente' || cita.estado === 'Confirmada');
        }).sort((a, b) => new Date(b.fecha_consulta) - new Date(a.fecha_consulta));

        return { citasHoy, citasProximas, citasAtrasadas };
    }, [citas]);

    // Formatear fecha
    const formatDate = useCallback((dateString, formato = 'completo') => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        date.setHours(date.getHours() + 6);

        if (formato === 'hora') {
            return date.toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
        } else if (formato === 'fecha-corta') {
            return date.toLocaleString('es-MX', { day: 'numeric', month: 'short' });
        } else {
            const dia = date.toLocaleString('es-MX', { weekday: 'long' });
            const diaMes = date.toLocaleString('es-MX', { day: 'numeric', month: 'long' });
            const hora = date.toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
            const diaCapitalizado = dia.charAt(0).toUpperCase() + dia.slice(1);
            return `${diaCapitalizado} ${diaMes}, ${hora}`;
        }
    }, []);

    // Verificar permisos
    const canConfirmAppointment = useCallback((cita) => {
        if (!cita?.es_tratamiento) return true;
        const tratamiento = tratamientos[cita.tratamiento_id];
        return tratamiento && tratamiento.estado === 'Activo';
    }, [tratamientos]);

    // Handler para ver detalles
    const handleViewDetails = useCallback((cita) => {
        setSelectedCita(cita);
        setOpenDialog(true);
    }, []);

    // Cambiar estado de cita
    const handleChangeState = useCallback(async (cita, newState) => {
        try {
            const response = await fetch(`https://back-end-4803.onrender.com/api/citas/updateStatus/${cita.consulta_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: newState }),
            });

            if (!response.ok) throw new Error("Error al actualizar el estado");

            setNotification({ open: true, message: `Cita actualizada a ${newState}.`, type: 'success' });
            fetchCitas();
        } catch (error) {
            console.error("Error al actualizar el estado:", error);
            setNotification({ open: true, message: "Error al actualizar la cita.", type: 'error' });
        }
    }, [fetchCitas]);

    // Handlers
    const handleConfirm = useCallback((cita) => {
        if (!canConfirmAppointment(cita)) {
            setNotification({ open: true, message: 'Esta cita debe ser activada desde tratamientos.', type: 'warning' });
            return;
        }
        handleChangeState(cita, 'Confirmada');
    }, [canConfirmAppointment, handleChangeState]);

    const handleComplete = useCallback((cita) => {
        handleChangeState(cita, 'Completada');
    }, [handleChangeState]);

    return (
        <Card sx={{ minHeight: '100vh', backgroundColor: colors.background, borderRadius: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Box sx={{ padding: { xs: 2, sm: 3, md: 4 } }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <IconButton
                            onClick={() => navigate('/Administrador/citas')}
                            sx={{
                                bgcolor: alpha(colors.primary, 0.1),
                                '&:hover': { bgcolor: alpha(colors.primary, 0.2) },
                                borderRadius: '12px'
                            }}
                        >
                            <ArrowBack sx={{ color: colors.primary }} />
                        </IconButton>
                        <Box sx={{ bgcolor: alpha(colors.primary, 0.1), borderRadius: '14px', p: 1.2, display: 'flex' }}>
                            <HealthAndSafety sx={{ color: colors.primary, fontSize: 26 }} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: colors.titleColor }}>
                            Mi Agenda
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: colors.secondaryText, fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </Typography>
                </Box>

                {/* Métricas */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${alpha(colors.primary, 0.85)} 100%)`,
                        borderRadius: '20px',
                        color: 'white',
                        boxShadow: `0 8px 20px ${alpha(colors.primary, 0.25)}`
                    }}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', p: 2.5, borderRadius: '16px', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
                                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    {citasPorPeriodo.citasHoy.length}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 500 }}>
                                    Citas de Hoy
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', p: 2.5, borderRadius: '16px', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
                                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    {citasPorPeriodo.citasProximas.length}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 500 }}>
                                    Próximos 7 Días
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ bgcolor: citasPorPeriodo.citasAtrasadas.length > 0 ? 'rgba(255,152,0,0.25)' : 'rgba(76,175,80,0.25)', p: 2.5, borderRadius: '16px', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
                                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    {citasPorPeriodo.citasAtrasadas.length}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 500 }}>
                                    Pendientes
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Citas de Hoy */}
                <Paper elevation={0} sx={{ mb: 3, borderRadius: '20px', overflow: 'hidden', border: `1px solid ${colors.divider}` }}>
                    <Box sx={{ p: 2.5, borderBottom: `1px solid ${colors.divider}`, bgcolor: alpha(colors.primary, 0.05) }}>
                        <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Event sx={{ fontSize: 24 }} />
                            Citas de Hoy
                            <Chip label={citasPorPeriodo.citasHoy.length} size="small" sx={{ ml: 1, bgcolor: colors.primary, color: 'white', fontWeight: 'bold', height: '24px', borderRadius: '12px' }} />
                        </Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                        {isLoading ? (
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <Typography color={colors.secondaryText}>Cargando citas...</Typography>
                            </Box>
                        ) : citasPorPeriodo.citasHoy.length > 0 ? (
                            <Grid container spacing={2}>
                                {citasPorPeriodo.citasHoy.map((cita) => (
                                    <Grid item xs={12} sm={6} md={4} key={cita.consulta_id}>
                                        <CitaCard 
                                            cita={cita} 
                                            tipo="hoy" 
                                            colors={colors}
                                            formatDate={formatDate}
                                            onViewDetails={handleViewDetails}
                                            canConfirmAppointment={canConfirmAppointment}
                                            handleConfirm={handleConfirm}
                                            handleComplete={handleComplete}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <CalendarMonth sx={{ fontSize: 48, color: colors.secondaryText, opacity: 0.5, mb: 2 }} />
                                <Typography variant="h6" sx={{ color: colors.secondaryText, fontWeight: 500, mb: 1 }}>Sin citas programadas</Typography>
                                <Typography variant="body2" sx={{ color: colors.secondaryText }}>No hay citas programadas para hoy</Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>

                {/* Próximas Citas */}
                <Paper elevation={0} sx={{ mb: 3, borderRadius: '20px', overflow: 'hidden', border: `1px solid ${colors.divider}` }}>
                    <Box sx={{ p: 2.5, borderBottom: `1px solid ${colors.divider}`, bgcolor: alpha(colors.info, 0.05) }}>
                        <Typography variant="h6" sx={{ color: colors.info, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <CalendarMonth sx={{ fontSize: 24 }} />
                            Próximas Citas (7 días)
                            <Chip label={citasPorPeriodo.citasProximas.length} size="small" sx={{ ml: 1, bgcolor: colors.info, color: 'white', fontWeight: 'bold', height: '24px', borderRadius: '12px' }} />
                        </Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                        {citasPorPeriodo.citasProximas.length > 0 ? (
                            <Grid container spacing={2}>
                                {citasPorPeriodo.citasProximas.map((cita) => (
                                    <Grid item xs={12} sm={6} md={4} key={cita.consulta_id}>
                                        <CitaCard 
                                            cita={cita} 
                                            tipo="proximas" 
                                            colors={colors}
                                            formatDate={formatDate}
                                            onViewDetails={handleViewDetails}
                                            canConfirmAppointment={canConfirmAppointment}
                                            handleConfirm={handleConfirm}
                                            handleComplete={handleComplete}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <Event sx={{ fontSize: 48, color: colors.secondaryText, opacity: 0.5, mb: 2 }} />
                                <Typography variant="h6" sx={{ color: colors.secondaryText, fontWeight: 500, mb: 1 }}>Agenda libre</Typography>
                                <Typography variant="body2" sx={{ color: colors.secondaryText }}>No hay citas próximas programadas</Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>

                {/* Citas Atrasadas */}
                {citasPorPeriodo.citasAtrasadas.length > 0 && (
                    <Paper elevation={0} sx={{ borderRadius: '20px', overflow: 'hidden', border: `2px solid ${colors.warning}` }}>
                        <Box sx={{ p: 2.5, borderBottom: `2px solid ${colors.warning}`, bgcolor: alpha(colors.warning, 0.08) }}>
                            <Typography variant="h6" sx={{ color: colors.warning, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <PersonOff sx={{ fontSize: 24 }} />
                                Citas Pendientes de Reagendar
                                <Chip label={citasPorPeriodo.citasAtrasadas.length} size="small" sx={{ ml: 1, bgcolor: colors.warning, color: 'white', fontWeight: 'bold', height: '24px', borderRadius: '12px' }} />
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.warning, mt: 0.5, fontWeight: 500 }}>
                                Estas citas requieren seguimiento
                            </Typography>
                        </Box>
                        <Box sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                                {citasPorPeriodo.citasAtrasadas.slice(0, 6).map((cita) => (
                                    <Grid item xs={12} sm={6} md={4} key={cita.consulta_id}>
                                        <CitaCard 
                                            cita={cita} 
                                            tipo="atrasadas" 
                                            colors={colors}
                                            formatDate={formatDate}
                                            onViewDetails={handleViewDetails}
                                            canConfirmAppointment={canConfirmAppointment}
                                            handleConfirm={handleConfirm}
                                            handleComplete={handleComplete}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Paper>
                )}
            </Box>

            {/* Diálogo de detalles */}
            <Dialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)} 
                maxWidth="md" 
                fullWidth 
                PaperProps={{ sx: { borderRadius: '20px' } }}
            >
                {selectedCita && (
                    <>
                        <DialogTitle 
                            sx={{ 
                                backgroundColor: selectedCita?.es_tratamiento === 1 ? colors.tratamiento : colors.primary, 
                                color: 'white', 
                                borderRadius: '20px 20px 0 0' 
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Event sx={{ mr: 2 }} />
                                    {selectedCita?.es_tratamiento === 1 ? 
                                        `Detalles del Tratamiento (Cita ${selectedCita.numero_cita_calculado || 1})` : 
                                        `Detalles de la Cita`}
                                </Box>
                                <Chip 
                                    label={selectedCita?.es_tratamiento === 1 ? 'Tratamiento' : 'Consulta'} 
                                    size="small" 
                                    sx={{ 
                                        backgroundColor: 'white', 
                                        color: selectedCita?.es_tratamiento === 1 ? colors.tratamiento : colors.primary, 
                                        fontWeight: 'bold',
                                        borderRadius: '12px'
                                    }} 
                                />
                            </Box>
                        </DialogTitle>
                        <DialogContent sx={{ mt: 2 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" color={colors.primary} sx={{ mb: 2, fontWeight: 600 }}>
                                        Información del Paciente
                                    </Typography>
                                    <Box sx={{ ml: 1 }}>
                                        <Typography sx={{ mb: 1 }}>
                                            <strong>Nombre:</strong> {selectedCita.paciente_nombre} {selectedCita.paciente_apellido_paterno} {selectedCita.paciente_apellido_materno}
                                        </Typography>
                                        <Typography sx={{ mb: 1 }}>
                                            <strong>Género:</strong> {selectedCita.paciente_genero || "No especificado"}
                                        </Typography>
                                        {selectedCita.paciente_fecha_nacimiento && (
                                            <Typography sx={{ mb: 1 }}>
                                                <strong>Fecha de Nacimiento:</strong> {new Date(selectedCita.paciente_fecha_nacimiento).toLocaleDateString()}
                                            </Typography>
                                        )}
                                        <Typography sx={{ mb: 1 }}>
                                            <strong>Correo:</strong> {selectedCita.paciente_correo || "No especificado"}
                                        </Typography>
                                        <Typography>
                                            <strong>Teléfono:</strong> {selectedCita.paciente_telefono || "No especificado"}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" color={colors.primary} sx={{ mb: 2, fontWeight: 600 }}>
                                        <CalendarMonth sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Información de la Cita
                                    </Typography>
                                    <Box sx={{ ml: 1 }}>
                                        <Typography sx={{ mb: 1 }}>
                                            <strong>Servicio:</strong> {selectedCita.servicio_nombre}
                                        </Typography>
                                        <Typography sx={{ mb: 1 }}>
                                            <strong>Tipo:</strong> {selectedCita?.es_tratamiento === 1 ? "Tratamiento" : "Consulta Regular"}
                                        </Typography>
                                        {selectedCita?.es_tratamiento === 1 && (
                                            <Typography sx={{ mb: 1 }}>
                                                <strong>Número de cita:</strong> {selectedCita.numero_cita_calculado || 1}
                                            </Typography>
                                        )}
                                        <Typography sx={{ mb: 1 }}>
                                            <strong>Precio:</strong> ${selectedCita.precio_servicio || "0.00"}
                                        </Typography>
                                        <Typography sx={{ mb: 1 }}>
                                            <strong>Fecha de Consulta:</strong> {formatDate(selectedCita.fecha_consulta)}
                                        </Typography>
                                        <Typography sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                            <strong>Estado:</strong> 
                                            <Chip 
                                                label={selectedCita.estado || "Pendiente"} 
                                                size="small" 
                                                sx={{ 
                                                    ml: 1, 
                                                    backgroundColor: STATUS_COLORS[selectedCita.estado] || '#bdbdbd', 
                                                    color: '#FFF', 
                                                    fontWeight: '600', 
                                                    fontSize: '0.75rem', 
                                                    height: '24px',
                                                    borderRadius: '12px'
                                                }} 
                                            />
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" color={colors.primary} sx={{ mb: 2, fontWeight: 600 }}>
                                        <HealthAndSafety sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Odontólogo
                                    </Typography>
                                    <Box sx={{ ml: 1 }}>
                                        <Typography>
                                            <strong>Nombre:</strong> {selectedCita.odontologo_nombre || "No asignado"}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" color={colors.primary} sx={{ mb: 2, fontWeight: 600 }}>
                                        <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Notas
                                    </Typography>
                                    <Box sx={{ ml: 1 }}>
                                        <Typography>{selectedCita.notas || "Sin notas adicionales"}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button 
                                onClick={() => setOpenDialog(false)} 
                                sx={{ 
                                    color: colors.primary,
                                    borderRadius: '12px',
                                    px: 3
                                }}
                            >
                                Cerrar
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <Notificaciones
                open={notification.open}
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification(prev => ({ ...prev, open: false }))}
            />
        </Card>
    );
};

export default MiAgenda;