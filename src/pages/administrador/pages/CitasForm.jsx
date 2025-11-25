import {
    Avatar, Box, Button, Card, CardContent,
    Chip, Dialog, DialogActions,
    DialogContent, DialogTitle, FormControl, Grid, IconButton,
    InputAdornment, MenuItem, Paper, Select, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Typography, Tooltip, Alert, AlertTitle, Divider, Pagination
} from '@mui/material';
import React, { useCallback, useEffect, useState, useMemo, memo } from 'react';
import {
    Add, BorderColor, CalendarMonth, Close, Description,
    Event, HealthAndSafety, MenuBook, CheckCircle,
    MedicalServices, LocalHospital, PersonOff, Visibility,
    Search, ViewList, ViewModule, ViewStream
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import EditCita from './citas/editarCita.jsx';

// Paleta de colores suaves y modernos
const getColors = (isDarkTheme) => ({
    background: isDarkTheme ? '#1a1f2e' : '#f5f7fa',
    paper: isDarkTheme ? '#242b3d' : '#ffffff',
    tableBackground: isDarkTheme ? '#1e2838' : '#f8fafc',
    text: isDarkTheme ? '#e8eaf0' : '#2c3e50',
    secondaryText: isDarkTheme ? '#a8b2c1' : '#64748b',
    primary: isDarkTheme ? '#5b8fd9' : '#4a7eb8',
    hover: isDarkTheme ? 'rgba(91,143,217,0.08)' : 'rgba(74,126,184,0.06)',
    inputBorder: isDarkTheme ? '#3d4758' : '#e2e8f0',
    divider: isDarkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    titleColor: isDarkTheme ? '#7ba4dd' : '#2d3748',
    tratamiento: '#66b566',
    consulta: '#8a94a6',
    noRegistrado: '#f29f67',
    details: '#4a9fd9',
    archive: '#e89a5c',
    cancel: '#d66464',
    edit: '#66b566',
    confirm: '#70c470',
    complete: '#5b9fd9'
});

const STATUS_COLORS = {
    Pendiente: '#f29f67',
    Confirmada: '#70c470',
    Cancelada: '#d66464',
    Completada: '#5b9fd9',
    'PRE-REGISTRO': '#9575cd'
};

// Tarjeta de cita memoizada
const CitaCard = memo(({ cita, colors, onViewDetails, onEdit, onConfirm, onComplete, onArchive, onCancel, canCancel, canConfirm }) => {
    const esTratamiento = cita?.es_tratamiento === 1;
    const estaRegistrado = cita?.paciente_id != null;
    const citaCompletada = cita?.estado === 'Completada';
    
    const avatarColor = useMemo(() => {
        if (!cita?.paciente_id) return colors.noRegistrado;
        const colorPool = ['#5C6BC0', '#26A69A', '#EC407A', '#AB47BC', '#7E57C2', '#42A5F5', '#29B6F6', '#26C6DA'];
        return colorPool[cita.paciente_id % colorPool.length];
    }, [cita?.paciente_id, colors.noRegistrado]);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        date.setHours(date.getHours() + 6);
        const dia = date.toLocaleString('es-MX', { weekday: 'short' });
        const diaMes = date.toLocaleString('es-MX', { day: 'numeric', month: 'short' });
        const hora = date.toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
        return `${dia.charAt(0).toUpperCase() + dia.slice(1)} ${diaMes}, ${hora}`;
    }, []);

    return (
        <Card
            sx={{
                backgroundColor: colors.paper,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                borderRadius: '16px',
                overflow: 'hidden',
                borderLeft: `4px solid ${esTratamiento ? colors.tratamiento : colors.consulta}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
                }
            }}
        >
            <CardContent sx={{ p: 2, flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <Avatar
                            sx={{
                                bgcolor: avatarColor,
                                width: 38,
                                height: 38,
                                mr: 1.5,
                                border: estaRegistrado ? 'none' : `2px solid ${colors.noRegistrado}`,
                                fontSize: '0.95rem',
                                fontWeight: 600
                            }}
                        >
                            {cita.paciente_nombre ? cita.paciente_nombre.charAt(0).toUpperCase() : '?'}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                    fontWeight: 600, 
                                    color: colors.text, 
                                    lineHeight: 1.3,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {cita?.paciente_nombre ? `${cita.paciente_nombre} ${cita.paciente_apellido_paterno || ''}`.trim() : "No registrado"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: colors.secondaryText, fontSize: '0.7rem' }}>
                                {estaRegistrado ? 'Registrado' : 'No registrado'}
                            </Typography>
                        </Box>
                    </Box>
                    <Chip
                        label={cita?.estado || "Pendiente"}
                        size="small"
                        sx={{
                            backgroundColor: STATUS_COLORS[cita?.estado] || '#bdbdbd',
                            color: '#FFF',
                            fontWeight: '600',
                            fontSize: '0.7rem',
                            height: '22px',
                            borderRadius: '11px',
                            ml: 1
                        }}
                    />
                </Box>

                <Box sx={{ mb: 1.5, pl: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        {esTratamiento ? (
                            <MedicalServices sx={{ color: colors.tratamiento, fontSize: 16, mr: 1 }} />
                        ) : (
                            <LocalHospital sx={{ color: colors.consulta, fontSize: 16, mr: 1 }} />
                        )}
                        <Typography variant="body2" sx={{ color: colors.text, fontWeight: 500, fontSize: '0.85rem' }}>
                            {cita?.servicio_nombre || "N/A"}
                        </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: colors.secondaryText, ml: 3, fontSize: '0.7rem' }}>
                        {esTratamiento ? `Tratamiento (cita ${cita.numero_cita_calculado || 1})` : cita?.categoria_servicio || "Consulta"}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pl: 0.5 }}>
                    <Event sx={{ color: colors.primary, fontSize: 14, mr: 1 }} />
                    <Typography variant="caption" sx={{ color: colors.text, fontSize: '0.75rem' }}>
                        {formatDate(cita?.fecha_consulta)}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, flexWrap: 'wrap' }}>
                    <Tooltip title="Ver detalles" arrow>
                        <IconButton onClick={() => onViewDetails(cita)} size="small" sx={{ bgcolor: colors.details, '&:hover': { bgcolor: alpha(colors.details, 0.85) }, color: 'white', width: 30, height: 30, borderRadius: '8px' }}>
                            <Visibility sx={{ fontSize: '1rem' }} />
                        </IconButton>
                    </Tooltip>

                    {!citaCompletada && (
                        <Tooltip title="Editar" arrow>
                            <IconButton onClick={() => onEdit(cita)} size="small" sx={{ bgcolor: colors.edit, '&:hover': { bgcolor: alpha(colors.edit, 0.85) }, color: 'white', width: 30, height: 30, borderRadius: '8px' }}>
                                <BorderColor sx={{ fontSize: '1rem' }} />
                            </IconButton>
                        </Tooltip>
                    )}

                    {cita?.estado === 'Pendiente' && canConfirm && (
                        <Tooltip title="Confirmar" arrow>
                            <IconButton onClick={() => onConfirm(cita)} size="small" sx={{ bgcolor: colors.confirm, '&:hover': { bgcolor: alpha(colors.confirm, 0.85) }, color: 'white', width: 30, height: 30, borderRadius: '8px' }}>
                                <CheckCircle sx={{ fontSize: '1rem' }} />
                            </IconButton>
                        </Tooltip>
                    )}

                    {cita?.estado === 'Confirmada' && (
                        <Tooltip title="Completar" arrow>
                            <IconButton onClick={() => onComplete(cita)} size="small" sx={{ bgcolor: colors.complete, '&:hover': { bgcolor: alpha(colors.complete, 0.85) }, color: 'white', width: 30, height: 30, borderRadius: '8px' }}>
                                <CheckCircle sx={{ fontSize: '1rem' }} />
                            </IconButton>
                        </Tooltip>
                    )}

                    {canCancel && !citaCompletada && (
                        <Tooltip title="Cancelar" arrow>
                            <IconButton onClick={() => onCancel(cita)} size="small" sx={{ bgcolor: colors.cancel, '&:hover': { bgcolor: alpha(colors.cancel, 0.85) }, color: 'white', width: 30, height: 30, borderRadius: '8px' }}>
                                <Close sx={{ fontSize: '1rem' }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
});

const CitasForm = () => {
    const { isDarkTheme } = useThemeContext();
    const colors = useMemo(() => getColors(isDarkTheme), [isDarkTheme]);
    const navigate = useNavigate();

    // Estados principales
    const [citas, setCitas] = useState([]);
    const [tratamientos, setTratamientos] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [tipoFilter, setTipoFilter] = useState('todos');
    const [viewMode, setViewMode] = useState('table');
    
    // Paginación
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(50);

    // Estados de diálogos
    const [openDialog, setOpenDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [openConfirmCitaDialog, setOpenConfirmCitaDialog] = useState(false);
    const [openCompleteCitaDialog, setOpenCompleteCitaDialog] = useState(false);

    // Estados de datos seleccionados
    const [selectedCita, setSelectedCita] = useState(null);
    const [citaToDelete, setCitaToDelete] = useState(null);
    const [citaToCancel, setCitaToCancel] = useState(null);
    const [citaToConfirm, setCitaToConfirm] = useState(null);
    const [citaToComplete, setCitaToComplete] = useState(null);

    // Estados de proceso
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Estados de mensajes
    const [cancelReason, setCancelReason] = useState('');
    const [confirmMessage, setConfirmMessage] = useState('');
    const [completeMessage, setCompleteMessage] = useState('');
    const [notification, setNotification] = useState({ open: false, message: '', type: '' });

    // Cargar citas
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
            setCitas([]);
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

    // Verificar si una cita es del pasado
    const esCitaPasada = useCallback((fecha) => {
        const ahora = new Date();
        const hoyInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        const fechaCita = new Date(fecha);
        return fechaCita < hoyInicio;
    }, []);

    // Ordenar citas
    const sortCitas = useCallback((citasArray) => {
        const ahora = new Date();
        const hoyInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

        const getEstadoPrioridad = (estado) => {
            switch (estado) {
                case 'Confirmada': return 1;
                case 'Pendiente':
                case 'PRE-REGISTRO': return 2;
                case 'Completada': return 3;
                case 'Cancelada': return 4;
                default: return 5;
            }
        };

        return [...citasArray].sort((a, b) => {
            const fechaA = new Date(a.fecha_consulta);
            const fechaB = new Date(b.fecha_consulta);
            const aEsPasado = fechaA < hoyInicio;
            const bEsPasado = fechaB < hoyInicio;

            if (aEsPasado && !bEsPasado) return 1;
            if (!aEsPasado && bEsPasado) return -1;

            if (aEsPasado && bEsPasado) {
                return fechaB - fechaA;
            } else {
                const estadoA = getEstadoPrioridad(a.estado);
                const estadoB = getEstadoPrioridad(b.estado);
                if (estadoA !== estadoB) return estadoA - estadoB;
                return fechaA - fechaB;
            }
        });
    }, []);

    // Filtrar citas
    const filteredCitas = useMemo(() => {
        let filtered = citas.filter(cita => {
            const matchesSearch =
                searchQuery === '' ||
                (cita.paciente_nombre && cita.paciente_nombre.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (cita.servicio_nombre && cita.servicio_nombre.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (cita.odontologo_nombre && cita.odontologo_nombre.toLowerCase().includes(searchQuery.toLowerCase()));

            let matchesStatus = true;
            if (statusFilter === 'hoy_futuras') {
                matchesStatus = !esCitaPasada(cita.fecha_consulta);
            } else if (statusFilter === 'pasadas') {
                matchesStatus = esCitaPasada(cita.fecha_consulta) && (cita.estado === 'Pendiente' || cita.estado === 'Confirmada');
            } else if (statusFilter !== 'todos') {
                matchesStatus = cita.estado === statusFilter;
            }

            const esTratamiento = cita?.es_tratamiento === 1;
            const matchesTipo = tipoFilter === 'todos' || (tipoFilter === 'tratamiento' && esTratamiento) || (tipoFilter === 'consulta' && !esTratamiento);

            return matchesSearch && matchesStatus && matchesTipo;
        });

        return sortCitas(filtered);
    }, [citas, searchQuery, statusFilter, tipoFilter, sortCitas, esCitaPasada]);

    // Citas paginadas
    const paginatedCitas = useMemo(() => {
        const startIndex = (page - 1) * rowsPerPage;
        return filteredCitas.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredCitas, page, rowsPerPage]);

    // Handlers
    const canConfirmAppointment = useCallback((cita) => {
        if (!cita?.es_tratamiento) return true;
        const tratamiento = tratamientos[cita.tratamiento_id];
        return tratamiento && tratamiento.estado === 'Activo';
    }, [tratamientos]);

    const canCancelAppointment = useCallback((cita) => {
        const estadoPermiteCancelar = cita.estado === 'PRE-REGISTRO' || cita.estado === 'Pendiente' || cita.estado === 'Confirmada';
        if (!estadoPermiteCancelar) return false;
        if (!cita?.es_tratamiento) return true;
        const tratamiento = tratamientos[cita.tratamiento_id];
        return tratamiento && tratamiento.estado === 'Activo';
    }, [tratamientos]);

    const handleViewDetails = useCallback((cita) => {
        setSelectedCita(cita);
        setOpenDialog(true);
    }, []);

    const handleEdit = useCallback((cita) => {
        setSelectedCita(cita);
        setOpenEditDialog(true);
    }, []);

    const handleConfirm = useCallback((cita) => {
        if (!canConfirmAppointment(cita)) {
            setNotification({ open: true, message: 'Esta cita debe ser activada desde la gestión de tratamientos.', type: 'warning' });
            return;
        }
        setCitaToConfirm(cita);
        setConfirmMessage('');
        setOpenConfirmCitaDialog(true);
    }, [canConfirmAppointment]);

    const handleComplete = useCallback((cita) => {
        setCitaToComplete(cita);
        setCompleteMessage('');
        setOpenCompleteCitaDialog(true);
    }, []);

    const handleCancel = useCallback((cita) => {
        if (!canCancelAppointment(cita)) {
            setNotification({ open: true, message: 'No se puede cancelar esta cita.', type: 'warning' });
            return;
        }
        setCitaToCancel(cita);
        setCancelReason('');
        setOpenCancelDialog(true);
    }, [canCancelAppointment]);

    const handleArchive = useCallback((cita) => {
        setCitaToDelete(cita);
        setOpenConfirmDialog(true);
    }, []);

    const handleChangeState = useCallback(async (cita, newState, message = '') => {
        setIsProcessing(true);
        try {
            const response = await fetch(`https://back-end-4803.onrender.com/api/citas/updateStatus/${cita.consulta_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: newState, mensaje: message }),
            });

            if (!response.ok) throw new Error("Error al actualizar el estado");

            setNotification({ open: true, message: `La cita ha sido actualizada a estado ${newState}.`, type: 'success' });
            fetchCitas();
        } catch (error) {
            console.error("Error al actualizar el estado:", error);
            setNotification({ open: true, message: "Hubo un error al actualizar el estado de la cita.", type: 'error' });
        } finally {
            setIsProcessing(false);
        }
    }, [fetchCitas]);

    const processConfirmCita = useCallback(async () => {
        setIsConfirming(true);
        await handleChangeState(citaToConfirm, 'Confirmada', confirmMessage);
        setOpenConfirmCitaDialog(false);
        setCitaToConfirm(null);
        setIsConfirming(false);
    }, [citaToConfirm, confirmMessage, handleChangeState]);

    const processCompleteCita = useCallback(async () => {
        setIsCompleting(true);
        try {
            await handleChangeState(citaToComplete, 'Completada', completeMessage);

            let tratamientoId = citaToComplete.tratamiento_id;
            if (!tratamientoId && citaToComplete.notas) {
                const match = citaToComplete.notas.match(/tratamiento #(\d+)/i);
                if (match && match[1]) tratamientoId = parseInt(match[1]);
            }

            if (tratamientoId) {
                const citaId = citaToComplete.consulta_id || citaToComplete.id;
                const response = await fetch("https://back-end-4803.onrender.com/api/tratamientos/actualizarProgreso", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tratamiento_id: tratamientoId, cita_id: citaId }),
                });

                if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

                const data = await response.json();
                setNotification({
                    open: true,
                    message: data.tratamiento_completado ? `Tratamiento finalizado.` : `Cita completada. Progreso: ${data.citas_completadas}/${data.total_citas}`,
                    type: 'success',
                });
            } else {
                setNotification({ open: true, message: "Cita completada con éxito.", type: 'success' });
            }

            setOpenCompleteCitaDialog(false);
            setCitaToComplete(null);
            await fetchCitas();
            setTimeout(() => fetchTratamientos(), 1000);
        } catch (error) {
            console.error("Error al completar cita:", error);
            setNotification({ open: true, message: "Error al procesar la cita.", type: 'error' });
        } finally {
            setIsCompleting(false);
        }
    }, [citaToComplete, completeMessage, handleChangeState, fetchCitas, fetchTratamientos]);

    const processCancelAppointment = useCallback(async () => {
        if (!citaToCancel) return;
        setIsCancelling(true);
        try {
            const response = await fetch(`https://back-end-4803.onrender.com/api/citas/cancel/${citaToCancel.consulta_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ motivo: cancelReason }),
            });

            if (!response.ok) throw new Error("Error al cancelar la cita");

            setNotification({ open: true, message: `La cita ha sido cancelada.`, type: 'warning' });
            setOpenCancelDialog(false);
            setCitaToCancel(null);
            fetchCitas();
        } catch (error) {
            console.error("Error al cancelar la cita:", error);
            setNotification({ open: true, message: "Hubo un error al cancelar la cita.", type: 'error' });
        } finally {
            setIsCancelling(false);
        }
    }, [citaToCancel, cancelReason, fetchCitas]);

    const handleArchiveAppointment = useCallback(async () => {
        if (!citaToDelete) return;
        setIsProcessing(true);
        try {
            const response = await fetch(`https://back-end-4803.onrender.com/api/citas/archive/${citaToDelete.consulta_id}`, {
                method: 'PUT',
            });

            if (!response.ok) throw new Error('Error al archivar la cita');

            setNotification({ open: true, message: `La cita ha sido archivada.`, type: 'success' });
            setOpenConfirmDialog(false);
            setCitaToDelete(null);
            fetchCitas();
        } catch (error) {
            console.error('Error al archivar la cita:', error);
            setNotification({ open: true, message: 'Hubo un error al archivar la cita.', type: 'error' });
        } finally {
            setIsProcessing(false);
        }
    }, [citaToDelete, fetchCitas]);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            date.setHours(date.getHours() + 6);
            const dia = date.toLocaleString('es-MX', { weekday: 'long' });
            const diaMes = date.toLocaleString('es-MX', { day: 'numeric', month: 'long' });
            const hora = date.toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
            const diaCapitalizado = dia.charAt(0).toUpperCase() + dia.slice(1);
            return `${diaCapitalizado} ${diaMes}, ${hora}`;
        } catch (error) {
            return "Fecha inválida";
        }
    }, []);

    // Vista de tabla mejorada
    const renderTableView = useMemo(() => {
        return (
            <TableContainer 
                component={Paper} 
                sx={{ 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
                    backgroundColor: colors.paper, 
                    borderRadius: '20px', 
                    overflow: 'hidden',
                    border: `1px solid ${colors.divider}`
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: colors.tableBackground }}>
                            <TableCell sx={{ color: colors.text, fontWeight: 600, py: 2.5, fontSize: '0.9rem', borderBottom: `2px solid ${colors.divider}` }}>Paciente</TableCell>
                            <TableCell sx={{ color: colors.text, fontWeight: 600, py: 2.5, fontSize: '0.9rem', display: { xs: 'none', sm: 'table-cell' }, borderBottom: `2px solid ${colors.divider}` }}>Servicio</TableCell>
                            <TableCell sx={{ color: colors.text, fontWeight: 600, py: 2.5, fontSize: '0.9rem', display: { xs: 'none', md: 'table-cell' }, borderBottom: `2px solid ${colors.divider}` }}>Fecha y Hora</TableCell>
                            <TableCell sx={{ color: colors.text, fontWeight: 600, py: 2.5, fontSize: '0.9rem', borderBottom: `2px solid ${colors.divider}` }}>Estado</TableCell>
                            <TableCell sx={{ color: colors.text, fontWeight: 600, py: 2.5, fontSize: '0.9rem', borderBottom: `2px solid ${colors.divider}` }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedCitas.length > 0 ? (
                            paginatedCitas.map((cita) => {
                                const esTratamiento = cita?.es_tratamiento === 1;
                                const estaRegistrado = cita?.paciente_id != null;
                                const citaCompletada = cita?.estado === 'Completada';
                                const avatarColor = (() => {
                                    if (!cita?.paciente_id) return colors.noRegistrado;
                                    const colorPool = ['#5C6BC0', '#26A69A', '#EC407A', '#AB47BC', '#7E57C2', '#42A5F5', '#29B6F6', '#26C6DA'];
                                    return colorPool[cita.paciente_id % colorPool.length];
                                })();

                                return (
                                    <TableRow
                                        key={cita?.consulta_id}
                                        sx={{
                                            height: '70px',
                                            '&:hover': { 
                                                backgroundColor: colors.hover,
                                                transform: 'scale(1.001)',
                                                transition: 'all 0.2s ease'
                                            },
                                            borderLeft: `4px solid ${esTratamiento ? colors.tratamiento : colors.consulta}`,
                                            borderBottom: `1px solid ${colors.divider}`
                                        }}
                                    >
                                        <TableCell sx={{ py: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar 
                                                    sx={{ 
                                                        bgcolor: avatarColor, 
                                                        width: 40, 
                                                        height: 40, 
                                                        mr: 2, 
                                                        border: estaRegistrado ? 'none' : `2px solid ${colors.noRegistrado}`, 
                                                        fontSize: '0.95rem',
                                                        fontWeight: 600,
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                    }}
                                                >
                                                    {cita.paciente_nombre ? cita.paciente_nombre.charAt(0).toUpperCase() : '?'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600} sx={{ color: colors.text, fontSize: '0.9rem', lineHeight: 1.3 }}>
                                                        {cita?.paciente_nombre ? `${cita.paciente_nombre} ${cita.paciente_apellido_paterno || ''} ${cita.paciente_apellido_materno || ''}`.trim() : "No registrado"}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: colors.secondaryText, fontSize: '0.75rem' }}>
                                                        {estaRegistrado ? 'Registrado' : 'No registrado'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, py: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box 
                                                    sx={{ 
                                                        bgcolor: alpha(esTratamiento ? colors.tratamiento : colors.consulta, 0.1),
                                                        borderRadius: '10px',
                                                        p: 0.8,
                                                        mr: 1.5,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    {esTratamiento ? (
                                                        <MedicalServices sx={{ color: colors.tratamiento, fontSize: 18 }} />
                                                    ) : (
                                                        <LocalHospital sx={{ color: colors.consulta, fontSize: 18 }} />
                                                    )}
                                                </Box>
                                                <Box>
                                                    <Typography variant="body2" sx={{ color: colors.text, fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.3 }}>
                                                        {cita?.servicio_nombre || "N/A"}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: colors.secondaryText, fontSize: '0.75rem' }}>
                                                        {esTratamiento ? `Tratamiento (cita ${cita.numero_cita_calculado || 1})` : cita?.categoria_servicio || "General"}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, py: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Event sx={{ color: colors.primary, fontSize: 16, mr: 1 }} />
                                                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: colors.text }}>
                                                    {formatDate(cita?.fecha_consulta)}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ py: 2 }}>
                                            <Chip 
                                                label={cita?.estado || "Pendiente"} 
                                                sx={{ 
                                                    backgroundColor: STATUS_COLORS[cita?.estado] || '#bdbdbd', 
                                                    color: '#FFF', 
                                                    fontWeight: '600', 
                                                    fontSize: '0.75rem', 
                                                    height: '26px',
                                                    borderRadius: '13px',
                                                    px: 1.5
                                                }} 
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 2 }}>
                                            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: { xs: 'wrap', md: 'nowrap' }, justifyContent: 'flex-start' }}>
                                                <Tooltip title="Ver detalles" arrow>
                                                    <IconButton 
                                                        onClick={() => handleViewDetails(cita)} 
                                                        size="small" 
                                                        sx={{ 
                                                            backgroundColor: colors.details, 
                                                            '&:hover': { backgroundColor: alpha(colors.details, 0.85), transform: 'scale(1.1)' }, 
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
                                                {!citaCompletada && (
                                                    <Tooltip title="Editar cita" arrow>
                                                        <IconButton 
                                                            onClick={() => handleEdit(cita)} 
                                                            size="small" 
                                                            sx={{ 
                                                                backgroundColor: colors.edit, 
                                                                '&:hover': { backgroundColor: alpha(colors.edit, 0.85), transform: 'scale(1.1)' }, 
                                                                color: 'white', 
                                                                width: 32, 
                                                                height: 32,
                                                                borderRadius: '10px',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            <BorderColor sx={{ fontSize: '1rem' }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {cita?.estado === 'Pendiente' && canConfirmAppointment(cita) && (
                                                    <Tooltip title="Confirmar cita" arrow>
                                                        <IconButton 
                                                            onClick={() => handleConfirm(cita)} 
                                                            size="small" 
                                                            sx={{ 
                                                                backgroundColor: colors.confirm, 
                                                                '&:hover': { backgroundColor: alpha(colors.confirm, 0.85), transform: 'scale(1.1)' }, 
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
                                                {cita?.estado === 'Confirmada' && (
                                                    <Tooltip title="Completar cita" arrow>
                                                        <IconButton 
                                                            onClick={() => handleComplete(cita)} 
                                                            size="small" 
                                                            sx={{ 
                                                                backgroundColor: colors.complete, 
                                                                '&:hover': { backgroundColor: alpha(colors.complete, 0.85), transform: 'scale(1.1)' }, 
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
                                                <Tooltip title="Archivar cita" arrow>
                                                    <IconButton 
                                                        onClick={() => handleArchive(cita)} 
                                                        size="small" 
                                                        sx={{ 
                                                            backgroundColor: colors.archive, 
                                                            '&:hover': { backgroundColor: alpha(colors.archive, 0.85), transform: 'scale(1.1)' }, 
                                                            color: 'white', 
                                                            width: 32, 
                                                            height: 32,
                                                            borderRadius: '10px',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        <MenuBook sx={{ fontSize: '1rem' }} />
                                                    </IconButton>
                                                </Tooltip>
                                                {canCancelAppointment(cita) && !citaCompletada && (
                                                    <Tooltip title="Cancelar cita" arrow>
                                                        <IconButton 
                                                            onClick={() => handleCancel(cita)} 
                                                            size="small" 
                                                            sx={{ 
                                                                backgroundColor: colors.cancel, 
                                                                '&:hover': { backgroundColor: alpha(colors.cancel, 0.85), transform: 'scale(1.1)' }, 
                                                                color: 'white', 
                                                                width: 32, 
                                                                height: 32,
                                                                borderRadius: '10px',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            <Close sx={{ fontSize: '1rem' }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                    <Typography color={colors.secondaryText} sx={{ fontSize: '0.95rem' }}>
                                        {isLoading ? 'Cargando citas...' : 'No hay citas disponibles'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }, [paginatedCitas, colors, formatDate, handleViewDetails, handleEdit, handleConfirm, handleComplete, handleArchive, handleCancel, canConfirmAppointment, canCancelAppointment, isLoading]);

    // Vista de cuadrícula
    const renderGridView = useMemo(() => {
        return (
            <Grid container spacing={2.5}>
                {paginatedCitas.length > 0 ? (
                    paginatedCitas.map((cita) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={cita?.consulta_id}>
                            <CitaCard
                                cita={cita}
                                colors={colors}
                                onViewDetails={handleViewDetails}
                                onEdit={handleEdit}
                                onConfirm={handleConfirm}
                                onComplete={handleComplete}
                                onArchive={handleArchive}
                                onCancel={handleCancel}
                                canCancel={canCancelAppointment(cita)}
                                canConfirm={canConfirmAppointment(cita)}
                            />
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: colors.paper, borderRadius: '20px' }}>
                            <Typography color={colors.secondaryText}>
                                {isLoading ? 'Cargando citas...' : 'No hay citas disponibles'}
                            </Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        );
    }, [paginatedCitas, colors, handleViewDetails, handleEdit, handleConfirm, handleComplete, handleArchive, handleCancel, canCancelAppointment, canConfirmAppointment, isLoading]);

    return (
        <Card sx={{ minHeight: '100vh', backgroundColor: colors.background, borderRadius: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Box sx={{ padding: { xs: 2, sm: 3, md: 4 } }}>
                {/* Header compacto */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ 
                            bgcolor: alpha(colors.primary, 0.1), 
                            borderRadius: '14px', 
                            p: 1.2, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            <CalendarMonth sx={{ color: colors.primary, fontSize: 26 }} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: colors.titleColor }}>
                            Gestión de Citas
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<HealthAndSafety />}
                            onClick={() => navigate('/Administrador/mi-agenda')}
                            sx={{
                                borderRadius: '12px',
                                borderColor: colors.primary,
                                color: colors.primary,
                                '&:hover': {
                                    borderColor: colors.primary,
                                    bgcolor: alpha(colors.primary, 0.05)
                                },
                                display: { xs: 'none', sm: 'flex' }
                            }}
                        >
                            Mi Agenda
                        </Button>
                        <Tooltip title="Vista de tabla">
                            <IconButton 
                                onClick={() => setViewMode('table')} 
                                sx={{ 
                                    color: viewMode === 'table' ? 'white' : colors.text, 
                                    backgroundColor: viewMode === 'table' ? colors.primary : alpha(colors.primary, 0.1),
                                    borderRadius: '12px',
                                    '&:hover': {
                                        backgroundColor: viewMode === 'table' ? colors.primary : alpha(colors.primary, 0.15)
                                    }
                                }}
                            >
                                <ViewList />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Vista de cuadrícula">
                            <IconButton 
                                onClick={() => setViewMode('grid')} 
                                sx={{ 
                                    color: viewMode === 'grid' ? 'white' : colors.text, 
                                    backgroundColor: viewMode === 'grid' ? colors.primary : alpha(colors.primary, 0.1),
                                    borderRadius: '12px',
                                    '&:hover': {
                                        backgroundColor: viewMode === 'grid' ? colors.primary : alpha(colors.primary, 0.15)
                                    }
                                }}
                            >
                                <ViewModule />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Filtros compactos en una línea */}
                <Box sx={{ 
                    display: 'flex', 
                    gap: 1.5, 
                    mb: 2.5,
                    flexWrap: { xs: 'wrap', md: 'nowrap' },
                    alignItems: 'center'
                }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{ 
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search sx={{ color: colors.primary, fontSize: 20 }} />
                                </InputAdornment>
                            )
                        }}
                        sx={{ 
                            flex: { xs: '1 1 100%', md: 2 },
                            backgroundColor: colors.paper, 
                            borderRadius: '14px',
                            '& .MuiOutlinedInput-root': { 
                                borderRadius: '14px',
                                color: colors.text, 
                                '& fieldset': { borderColor: colors.inputBorder },
                                '&:hover fieldset': { borderColor: colors.primary },
                                '&.Mui-focused fieldset': { borderColor: colors.primary }
                            }
                        }}
                    />
                    <FormControl size="small" sx={{ flex: { xs: '1 1 45%', md: 1 }, minWidth: 120 }}>
                        <Select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)} 
                            sx={{ 
                                backgroundColor: colors.paper, 
                                color: colors.text, 
                                borderRadius: '14px',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.inputBorder },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary }
                            }}
                        >
                            <MenuItem value="todos">Todos</MenuItem>
                            <MenuItem value="hoy_futuras">Hoy y Futuras</MenuItem>
                            <MenuItem value="pasadas">Pasadas</MenuItem>
                            <Divider />
                            <MenuItem value="PRE-REGISTRO">Pre-Registro</MenuItem>
                            <MenuItem value="Pendiente">Pendiente</MenuItem>
                            <MenuItem value="Confirmada">Confirmada</MenuItem>
                            <MenuItem value="Completada">Completada</MenuItem>
                            <MenuItem value="Cancelada">Cancelada</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ flex: { xs: '1 1 45%', md: 1 }, minWidth: 120 }}>
                        <Select 
                            value={tipoFilter} 
                            onChange={(e) => setTipoFilter(e.target.value)} 
                            sx={{ 
                                backgroundColor: colors.paper, 
                                color: colors.text, 
                                borderRadius: '14px',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.inputBorder },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary }
                            }}
                        >
                            <MenuItem value="todos">Todos</MenuItem>
                            <MenuItem value="tratamiento">Tratamiento</MenuItem>
                            <MenuItem value="consulta">Consulta</MenuItem>
                        </Select>
                    </FormControl>
                    {(searchQuery || statusFilter !== 'todos' || tipoFilter !== 'todos') && (
                        <Button 
                            variant="text" 
                            onClick={() => { 
                                setSearchQuery(''); 
                                setStatusFilter('todos'); 
                                setTipoFilter('todos'); 
                            }} 
                            sx={{ 
                                color: colors.secondaryText, 
                                fontSize: '0.8rem',
                                borderRadius: '12px',
                                whiteSpace: 'nowrap',
                                display: { xs: 'none', md: 'flex' }
                            }}
                        >
                            Limpiar
                        </Button>
                    )}
                </Box>

                {/* Contador y botón nueva cita */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ color: colors.secondaryText, fontSize: '0.9rem', fontWeight: 500 }}>
                        {filteredCitas.length} {filteredCitas.length === 1 ? 'cita' : 'citas'}
                    </Typography>
                    <Button 
                        variant="contained" 
                        startIcon={<Add />} 
                        component={Link} 
                        to="/Administrador/citas/nueva" 
                        sx={{ 
                            backgroundColor: colors.primary, 
                            '&:hover': { backgroundColor: alpha(colors.primary, 0.9) }, 
                            fontSize: '0.85rem',
                            borderRadius: '12px',
                            px: 2.5,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: `0 4px 12px ${alpha(colors.primary, 0.3)}`
                        }}
                    >
                        Nueva Cita
                    </Button>
                </Box>

                {/* Leyenda compacta */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    alignItems: 'center', 
                    mb: 2.5, 
                    gap: 2.5,
                    p: 1.5, 
                    backgroundColor: alpha(colors.tableBackground, 0.4), 
                    borderRadius: '14px' 
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MedicalServices sx={{ color: colors.tratamiento, fontSize: 16 }} />
                        <Typography variant="caption" sx={{ color: colors.text, fontSize: '0.8rem', fontWeight: 500 }}>
                            Tratamiento
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocalHospital sx={{ color: colors.consulta, fontSize: 16 }} />
                        <Typography variant="caption" sx={{ color: colors.text, fontSize: '0.8rem', fontWeight: 500 }}>
                            Consulta
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PersonOff sx={{ color: colors.noRegistrado, fontSize: 16 }} />
                        <Typography variant="caption" sx={{ color: colors.text, fontSize: '0.8rem', fontWeight: 500 }}>
                            No Registrado
                        </Typography>
                    </Box>
                </Box>

                {/* Vistas */}
                {viewMode === 'table' && renderTableView}
                {viewMode === 'grid' && renderGridView}

                {/* Paginación */}
                {filteredCitas.length > rowsPerPage && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination 
                            count={Math.ceil(filteredCitas.length / rowsPerPage)} 
                            page={page} 
                            onChange={(e, value) => setPage(value)}
                            color="primary"
                            size="large"
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    fontSize: '0.9rem'
                                },
                                '& .Mui-selected': {
                                    backgroundColor: colors.primary,
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: alpha(colors.primary, 0.9)
                                    }
                                }
                            }}
                        />
                    </Box>
                )}
            </Box>

            {/* Diálogos (sin cambios en funcionalidad) */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
                {selectedCita && (
                    <>
                        <DialogTitle sx={{ backgroundColor: selectedCita?.es_tratamiento === 1 ? colors.tratamiento : colors.primary, color: 'white', borderRadius: '20px 20px 0 0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Event sx={{ mr: 2 }} />
                                    {selectedCita?.es_tratamiento === 1 ? `Detalles del Tratamiento (Cita ${selectedCita.numero_cita_calculado || 1})` : `Detalles de la Cita`}
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
                                        <Typography sx={{ mb: 1 }}><strong>Nombre:</strong> {selectedCita.paciente_nombre} {selectedCita.paciente_apellido_paterno} {selectedCita.paciente_apellido_materno}</Typography>
                                        <Typography sx={{ mb: 1 }}><strong>Género:</strong> {selectedCita.paciente_genero || "No especificado"}</Typography>
                                        {selectedCita.paciente_fecha_nacimiento && (
                                            <Typography sx={{ mb: 1 }}><strong>Fecha de Nacimiento:</strong> {new Date(selectedCita.paciente_fecha_nacimiento).toLocaleDateString()}</Typography>
                                        )}
                                        <Typography sx={{ mb: 1 }}><strong>Correo:</strong> {selectedCita.paciente_correo || "No especificado"}</Typography>
                                        <Typography><strong>Teléfono:</strong> {selectedCita.paciente_telefono || "No especificado"}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" color={colors.primary} sx={{ mb: 2, fontWeight: 600 }}>
                                        <CalendarMonth sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Información de la Cita
                                    </Typography>
                                    <Box sx={{ ml: 1 }}>
                                        <Typography sx={{ mb: 1 }}><strong>Servicio:</strong> {selectedCita.servicio_nombre}</Typography>
                                        <Typography sx={{ mb: 1 }}><strong>Tipo:</strong> {selectedCita?.es_tratamiento === 1 ? "Tratamiento" : "Consulta Regular"}</Typography>
                                        {selectedCita?.es_tratamiento === 1 && (
                                            <Typography sx={{ mb: 1 }}><strong>Número de cita:</strong> {selectedCita.numero_cita_calculado || 1}</Typography>
                                        )}
                                        <Typography sx={{ mb: 1 }}><strong>Precio:</strong> ${selectedCita.precio_servicio || "0.00"}</Typography>
                                        <Typography sx={{ mb: 1 }}><strong>Fecha de Consulta:</strong> {formatDate(selectedCita.fecha_consulta)}</Typography>
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
                                        <Typography><strong>Nombre:</strong> {selectedCita.odontologo_nombre || "No asignado"}</Typography>
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

            {/* Diálogo de archivar */}
            <Dialog 
                open={openConfirmDialog} 
                onClose={() => !isProcessing && setOpenConfirmDialog(false)} 
                PaperProps={{ sx: { backgroundColor: colors.paper, borderRadius: '20px', maxWidth: '500px' } }}
            >
                <DialogTitle sx={{ color: colors.primary, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                    <MenuBook sx={{ color: colors.archive }} />
                    Archivar Cita
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
                        ¿Archivar la cita #{citaToDelete?.consulta_id}?
                    </Typography>
                    {citaToDelete && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: alpha(colors.tableBackground, 0.5), borderRadius: '12px' }}>
                            <Typography sx={{ mb: 1 }}><strong>Paciente:</strong> {citaToDelete.paciente_nombre} {citaToDelete.paciente_apellido_paterno}</Typography>
                            <Typography sx={{ mb: 1 }}><strong>Servicio:</strong> {citaToDelete.servicio_nombre}</Typography>
                            <Typography><strong>Fecha:</strong> {formatDate(citaToDelete.fecha_consulta)}</Typography>
                        </Box>
                    )}
                    <Alert severity="info" sx={{ mt: 2, borderRadius: '12px' }}>
                        <AlertTitle>Información</AlertTitle>
                        Las citas archivadas se mantendrán en la base de datos.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={() => setOpenConfirmDialog(false)} 
                        disabled={isProcessing} 
                        sx={{ color: colors.secondaryText, borderRadius: '12px' }}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleArchiveAppointment} 
                        disabled={isProcessing} 
                        sx={{ 
                            bgcolor: colors.archive, 
                            '&:hover': { bgcolor: alpha(colors.archive, 0.9) },
                            borderRadius: '12px',
                            px: 3
                        }}
                    >
                        {isProcessing ? 'Archivando...' : 'Confirmar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo de cancelar */}
            <Dialog 
                open={openCancelDialog} 
                onClose={() => !isCancelling && setOpenCancelDialog(false)} 
                PaperProps={{ sx: { backgroundColor: colors.paper, borderRadius: '20px', maxWidth: '500px' } }}
            >
                <DialogTitle sx={{ color: colors.cancel, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                    <Close sx={{ color: colors.cancel }} />
                    Cancelar Cita
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
                        ¿Cancelar la cita #{citaToCancel?.consulta_id}?
                    </Typography>
                    {citaToCancel && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: alpha(colors.tableBackground, 0.5), borderRadius: '12px' }}>
                            <Typography sx={{ mb: 1 }}><strong>Paciente:</strong> {citaToCancel.paciente_nombre} {citaToCancel.paciente_apellido_paterno}</Typography>
                            <Typography sx={{ mb: 1 }}><strong>Servicio:</strong> {citaToCancel.servicio_nombre}</Typography>
                            <Typography><strong>Fecha:</strong> {formatDate(citaToCancel.fecha_consulta)}</Typography>
                        </Box>
                    )}
                    <TextField 
                        label="Motivo de cancelación" 
                        placeholder="Indique el motivo..." 
                        multiline 
                        rows={3} 
                        fullWidth 
                        value={cancelReason} 
                        onChange={(e) => setCancelReason(e.target.value)} 
                        margin="normal" 
                        variant="outlined" 
                        required 
                        helperText="Este mensaje será enviado al paciente" 
                        sx={{ 
                            mt: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px'
                            }
                        }} 
                    />
                    <Alert severity="warning" sx={{ mt: 2, borderRadius: '12px' }}>
                        <AlertTitle>Importante</AlertTitle>
                        Se notificará al paciente sobre la cancelación.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={() => setOpenCancelDialog(false)} 
                        disabled={isCancelling} 
                        sx={{ color: colors.secondaryText, borderRadius: '12px' }}
                    >
                        Volver
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={processCancelAppointment} 
                        disabled={isCancelling || !cancelReason.trim()} 
                        sx={{ 
                            bgcolor: colors.cancel, 
                            '&:hover': { bgcolor: alpha(colors.cancel, 0.9) },
                            borderRadius: '12px',
                            px: 3
                        }}
                    >
                        {isCancelling ? 'Procesando...' : 'Confirmar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo de confirmar */}
            <Dialog 
                open={openConfirmCitaDialog} 
                onClose={() => !isConfirming && setOpenConfirmCitaDialog(false)} 
                PaperProps={{ sx: { backgroundColor: colors.paper, borderRadius: '20px', maxWidth: '500px' } }}
            >
                <DialogTitle sx={{ color: colors.confirm, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                    <CheckCircle sx={{ color: colors.confirm }} />
                    Confirmar Cita
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
                        ¿Confirmar la cita #{citaToConfirm?.consulta_id}?
                    </Typography>
                    {citaToConfirm && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: alpha(colors.tableBackground, 0.5), borderRadius: '12px' }}>
                            <Typography sx={{ mb: 1 }}><strong>Paciente:</strong> {citaToConfirm.paciente_nombre} {citaToConfirm.paciente_apellido_paterno}</Typography>
                            <Typography sx={{ mb: 1 }}><strong>Servicio:</strong> {citaToConfirm.servicio_nombre}</Typography>
                            <Typography><strong>Fecha:</strong> {formatDate(citaToConfirm.fecha_consulta)}</Typography>
                        </Box>
                    )}
                    <TextField 
                        label="Mensaje (opcional)" 
                        placeholder="Añada algún mensaje..." 
                        multiline 
                        rows={3} 
                        fullWidth 
                        value={confirmMessage} 
                        onChange={(e) => setConfirmMessage(e.target.value)} 
                        margin="normal" 
                        variant="outlined" 
                        helperText="Este mensaje se enviará al paciente" 
                        sx={{ 
                            mt: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px'
                            }
                        }} 
                    />
                    <Alert severity="info" sx={{ mt: 2, borderRadius: '12px' }}>
                        <AlertTitle>Información</AlertTitle>
                        Se notificará al paciente sobre la confirmación.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={() => setOpenConfirmCitaDialog(false)} 
                        disabled={isConfirming} 
                        sx={{ color: colors.secondaryText, borderRadius: '12px' }}
                    >
                        Volver
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={processConfirmCita} 
                        disabled={isConfirming} 
                        sx={{ 
                            bgcolor: colors.confirm, 
                            '&:hover': { bgcolor: alpha(colors.confirm, 0.9) },
                            borderRadius: '12px',
                            px: 3
                        }}
                    >
                        {isConfirming ? 'Procesando...' : 'Confirmar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo de completar */}
            <Dialog 
                open={openCompleteCitaDialog} 
                onClose={() => !isCompleting && setOpenCompleteCitaDialog(false)} 
                PaperProps={{ sx: { backgroundColor: colors.paper, borderRadius: '20px', maxWidth: '500px' } }}
            >
                <DialogTitle sx={{ color: colors.complete, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                    <CheckCircle sx={{ color: colors.complete }} />
                    Completar Cita
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
                        ¿Completar la cita #{citaToComplete?.consulta_id}?
                    </Typography>
                    {citaToComplete && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: alpha(colors.tableBackground, 0.5), borderRadius: '12px' }}>
                            <Typography sx={{ mb: 1 }}><strong>Paciente:</strong> {citaToComplete.paciente_nombre} {citaToComplete.paciente_apellido_paterno}</Typography>
                            <Typography sx={{ mb: 1 }}><strong>Servicio:</strong> {citaToComplete.servicio_nombre}</Typography>
                            <Typography sx={{ mb: 1 }}><strong>Fecha:</strong> {formatDate(citaToComplete.fecha_consulta)}</Typography>
                            {citaToComplete.tratamiento_id && (
                                <Box sx={{ mt: 1.5, p: 1.5, bgcolor: alpha(colors.primary, 0.1), borderRadius: '10px' }}>
                                    <Typography fontSize="0.85rem"><strong>Tratamiento ID:</strong> {citaToComplete.tratamiento_id}</Typography>
                                    <Typography fontSize="0.85rem"><strong>Número de cita:</strong> {citaToComplete.numero_cita_calculado || 1}</Typography>
                                    <Typography fontSize="0.8rem" sx={{ mt: 0.5, color: colors.secondaryText }}>
                                        Se programará la siguiente cita automáticamente
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                    <TextField 
                        label="Notas (opcional)" 
                        placeholder="Añada notas..." 
                        multiline 
                        rows={3} 
                        fullWidth 
                        value={completeMessage} 
                        onChange={(e) => setCompleteMessage(e.target.value)} 
                        margin="normal" 
                        variant="outlined" 
                        helperText="Estas notas se guardarán en el historial" 
                        sx={{ 
                            mt: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px'
                            }
                        }} 
                    />
                    <Alert severity="success" sx={{ mt: 2, borderRadius: '12px' }}>
                        <AlertTitle>Información</AlertTitle>
                        La cita se marcará como completada.{citaToComplete?.tratamiento_id && " Se registrará el progreso del tratamiento."}
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={() => setOpenCompleteCitaDialog(false)} 
                        disabled={isCompleting} 
                        sx={{ color: colors.secondaryText, borderRadius: '12px' }}
                    >
                        Volver
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={processCompleteCita} 
                        disabled={isCompleting} 
                        sx={{ 
                            bgcolor: colors.complete, 
                            '&:hover': { bgcolor: alpha(colors.complete, 0.9) },
                            borderRadius: '12px',
                            px: 3
                        }}
                    >
                        {isCompleting ? 'Procesando...' : 'Completar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <EditCita 
                open={openEditDialog} 
                handleClose={() => setOpenEditDialog(false)} 
                appointmentData={selectedCita} 
                onUpdate={fetchCitas} 
            />
            
            <Notificaciones 
                open={notification.open} 
                message={notification.message} 
                type={notification.type} 
                onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
            />
        </Card>
    );
};

export default CitasForm;