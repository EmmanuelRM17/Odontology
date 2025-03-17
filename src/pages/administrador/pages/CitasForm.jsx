import {
    Alert, AlertTitle,
    Box,
    Button,
    Card, CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
    Grid,
    IconButton, Paper,
    Table, TableBody, TableCell,
    TableContainer,
    TableHead, TableRow,
    TextField,
    Tooltip,
    Typography,
    Avatar,
    useTheme
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import {
    Add,
    BorderColor,
    CalendarMonth,
    Close,
    Description,
    Event,
    HealthAndSafety,
    MenuBook, CheckCircle, MedicalServices, LocalHospital,
    PersonOff, Visibility
} from '@mui/icons-material';

import { alpha } from '@mui/material/styles';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import EditCita from './citas/editarCita.jsx';

const CitasForm = () => {
    const { isDarkTheme } = useThemeContext();
    const theme = useTheme();
    const [openDialog, setOpenDialog] = useState(false);
    const [openNewAppointmentForm, setOpenNewAppointmentForm] = useState(false);
    const [selectedCita, setSelectedCita] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [citas, setCitas] = useState([]);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [citaToDelete, setCitaToDelete] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', type: '' });

    // Estados para la cancelación de citas
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [citaToCancel, setCitaToCancel] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    // Estados para confirmar cita
    const [openConfirmCitaDialog, setOpenConfirmCitaDialog] = useState(false);
    const [citaToConfirm, setCitaToConfirm] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);

    // Estados para completar cita
    const [openCompleteCitaDialog, setOpenCompleteCitaDialog] = useState(false);
    const [citaToComplete, setCitaToComplete] = useState(null);
    const [completeMessage, setCompleteMessage] = useState('');
    const [isCompleting, setIsCompleting] = useState(false);

    // Mapa para asignar colores consistentes a pacientes
    const [pacienteColores, setPacienteColores] = useState({});

    // Estado para almacenar la información de tratamientos
    const [tratamientos, setTratamientos] = useState({});

    useEffect(() => {
        fetchCitas();
        fetchTratamientos();
    }, []);

    // Colores del tema - Simplificados 
    const colors = {
        background: isDarkTheme ? '#0D1B2A' : '#F8F9FA',
        primary: isDarkTheme ? '#00BCD4' : '#1976D2',
        text: isDarkTheme ? '#ffffff' : '#1a1a1a',
        secondary: isDarkTheme ? '#A0AEC0' : '#666666',
        cardBg: isDarkTheme ? '#1A2735' : '#ffffff',
        paper: isDarkTheme ? '#1A2735' : '#ffffff',
        divider: isDarkTheme ? '#2D3748' : '#E2E8F0',
        tratamiento: isDarkTheme ? '#4CAF50' : '#4CAF50',
        consulta: isDarkTheme ? '#9E9E9E' : '#9E9E9E',
        noRegistrado: '#FFA726',
        registrado: '#42A5F5',
        details: '#03A9F4',    // Color para el botón de detalles (ojito)
        archive: '#FF9800',    // Color para archivar (consistente con el original)
        cancel: '#E53935',     // Color para cancelar
        edit: '#4CAF50',       // Color para editar
        confirm: '#66BB6A',    // Color para confirmar
        complete: '#42A5F5'    // Color para completar
    };

    // Función para cargar los tratamientos y mapearlos por ID
    const fetchTratamientos = async () => {
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
            setNotification({
                open: true,
                message: 'Error al cargar los tratamientos.',
                type: 'error',
            });
        }
    };

    // Función para generar un color para un paciente específico
    const getPatientColor = (patientId, pacienteName) => {
        // Si el paciente no tiene ID, está no registrado
        if (!patientId) {
            return colors.noRegistrado;
        }

        // Si ya tiene un color asignado, usarlo
        if (pacienteColores[patientId]) {
            return pacienteColores[patientId];
        }

        // Generar un nuevo color
        const colorPool = [
            '#5C6BC0', '#26A69A', '#EC407A',
            '#AB47BC', '#7E57C2', '#5C6BC0',
            '#42A5F5', '#29B6F6', '#26C6DA'
        ];

        // Asignar un color basado en ID o alfabéticamente
        const colorIndex = patientId % colorPool.length;
        const newColor = colorPool[colorIndex];

        // Actualizar el mapa de colores
        setPacienteColores(prev => ({
            ...prev,
            [patientId]: newColor
        }));

        return newColor;
    };

    const handleNotificationClose = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    const handleAppointmentCreated = (newAppointment) => {
        setOpenNewAppointmentForm(false);
        fetchCitas(); // Vuelve a cargar la lista de citas después de agregar una nueva
    };

    // Función para verificar si se puede cambiar a un estado específico
    const canChangeToState = (currentState, newState) => {
        switch (currentState) {
            case 'Pendiente':
                return newState === 'Confirmada' || newState === 'Cancelada';
            case 'Confirmada':
                return newState === 'Completada' || newState === 'Cancelada';
            case 'Completada':
                return false; // No se puede cambiar desde Completada
            case 'Cancelada':
                return false; // No se puede cambiar desde Cancelada
            default:
                return false;
        }
    };

    // Función para verificar si una cita puede ser confirmada directamente
    const canConfirmAppointment = (cita) => {
        // Si la cita está vinculada a un tratamiento (tiene tratamiento_id o es_tratamiento es 1)
        if (cita.tratamiento_id || cita.es_tratamiento === 1) {
            const tratamiento = tratamientos[cita.tratamiento_id];

            // Si no encontramos el tratamiento o no está Activo, no permitimos confirmar
            if (!tratamiento || tratamiento.estado !== 'Activo') {
                return false;
            }
        }

        // Si no es un tratamiento (es una consulta normal), siempre se puede confirmar
        return true;
    };

    // Función genérica para cambiar el estado de una cita
    const handleChangeState = async (cita, newState, message = '') => {
        if (!cita || !canChangeToState(cita.estado, newState)) {
            setNotification({
                open: true,
                message: `No se puede cambiar de "${cita?.estado}" a "${newState}"`,
                type: 'error',
            });
            return;
        }

        // Verificación adicional para confirmar citas de tratamientos
        if (newState === 'Confirmada' && cita.tratamiento_id && !canConfirmAppointment(cita)) {
            setNotification({
                open: true,
                message: 'Las citas de tratamientos en estado "Pre-Registro" o "Pendiente" deben activarse desde la gestión de tratamientos.',
                type: 'warning',
            });
            return;
        }

        setIsProcessing(true);
        try {
            const response = await fetch(`https://back-end-4803.onrender.com/api/citas/updateStatus/${cita.consulta_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    estado: newState,
                    mensaje: message // Agregar mensaje para notificación si existe
                }),
            });

            if (!response.ok) throw new Error("Error al actualizar el estado");

            setNotification({
                open: true,
                message: `La cita ha sido actualizada a estado ${newState}.`,
                type: 'success',
            });

            fetchCitas(); // Recargar citas

        } catch (error) {
            console.error("Error al actualizar el estado:", error);
            setNotification({
                open: true,
                message: "Hubo un error al actualizar el estado de la cita.",
                type: 'error',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Funciones específicas para cada cambio de estado
    const confirmCita = (cita) => {
        // Verificar nuevamente si la cita puede ser confirmada
        if (!canConfirmAppointment(cita)) {
            setNotification({
                open: true,
                message: 'Esta cita pertenece a un tratamiento que debe ser activado desde la gestión de tratamientos.',
                type: 'warning',
            });
            return;
        }

        setCitaToConfirm(cita);
        setConfirmMessage('');
        setOpenConfirmCitaDialog(true);
    };

    const processConfirmCita = async () => {
        setIsConfirming(true);
        await handleChangeState(citaToConfirm, 'Confirmada', confirmMessage);
        setOpenConfirmCitaDialog(false);
        setCitaToConfirm(null);
        setIsConfirming(false);
    };

    const completeCita = (cita) => {
        setCitaToComplete(cita);
        setCompleteMessage('');
        setOpenCompleteCitaDialog(true);
    };

    // Modifica la función processCompleteCita en CitasForm.jsx
    const processCompleteCita = async () => {
        setIsCompleting(true);
        try {
            console.log("OBJETO CITA COMPLETO:", citaToComplete);
            console.log("tratamiento_id está presente:", citaToComplete.tratamiento_id ? "SÍ" : "NO");

            // 1. Primero actualizar el estado de la cita a completada
            await handleChangeState(citaToComplete, 'Completada', completeMessage);
            console.log("Cita marcada como completada. ID:", citaToComplete.consulta_id || citaToComplete.id);

            // 2. Determinar el ID del tratamiento
            // Intentar primero obtener directamente de la propiedad
            let tratamientoId = citaToComplete.tratamiento_id;

            // Si no está disponible directamente, intentar extraerlo de las notas
            if (!tratamientoId && citaToComplete.notas) {
                const match = citaToComplete.notas.match(/tratamiento #(\d+)/i);
                if (match && match[1]) {
                    tratamientoId = parseInt(match[1]);
                    console.log("Tratamiento ID extraído de las notas:", tratamientoId);
                }
            }

            // Si tenemos tratamiento_id (de cualquier fuente), proceder con la actualización
            if (tratamientoId) {
                const citaId = citaToComplete.consulta_id || citaToComplete.id;
                console.log(`Actualizando tratamiento ${tratamientoId} para cita ${citaId}`);

                try {
                    // Usar el endpoint en router de tratamientos (no el de citas)
                    const response = await fetch("https://back-end-4803.onrender.com/api/tratamientos/actualizarProgreso", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            tratamiento_id: tratamientoId,
                            cita_id: citaId
                        }),
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Error HTTP ${response.status}: ${errorText}`);
                    }

                    const data = await response.json();
                    console.log("Respuesta del servidor:", data);

                    setNotification({
                        open: true,
                        message: data.tratamiento_completado
                            ? `Tratamiento finalizado. Todas las citas han sido completadas.`
                            : `Cita completada. Contador actualizado a ${data.citas_completadas}/${data.total_citas}. Se ha programado la siguiente cita.`,
                        type: 'success',
                    });
                } catch (error) {
                    console.error("Error al actualizar progreso:", error);
                    throw new Error("Error al actualizar el progreso del tratamiento: " + error.message);
                }
            } else {
                console.warn("No se encontró tratamiento_id para esta cita");
                setNotification({
                    open: true,
                    message: "Cita completada con éxito.",
                    type: 'success',
                });
            }

            // Cerrar diálogo y actualizar datos
            setOpenCompleteCitaDialog(false);
            setCitaToComplete(null);
            await fetchCitas();

            // También recargar tratamientos si la función existe
            if (typeof fetchTratamientos === 'function') {
                setTimeout(() => {
                    fetchTratamientos();
                }, 1000);
            }

        } catch (error) {
            console.error("Error al completar cita:", error);
            setNotification({
                open: true,
                message: "Error al procesar la cita completada: " + error.message,
                type: 'error',
            });
        } finally {
            setIsCompleting(false);
        }
    };

    // Función para abrir el diálogo de confirmación de archivado
    const openArchiveConfirmation = (cita) => {
        setCitaToDelete(cita);
        setOpenConfirmDialog(true);
    };

    // Función para archivar cita
    const handleArchiveAppointment = async () => {
        if (!citaToDelete) return;

        setIsProcessing(true);
        try {
            const response = await fetch(`https://back-end-4803.onrender.com/api/citas/archive/${citaToDelete.consulta_id}`, {
                method: 'PUT',
            });

            if (!response.ok) {
                throw new Error('Error al archivar la cita');
            }

            setNotification({
                open: true,
                message: `La cita ha sido archivada correctamente.`,
                type: 'success',
            });

            setOpenConfirmDialog(false);
            setCitaToDelete(null);
            fetchCitas(); // Recargar la lista de citas para que desaparezca
        } catch (error) {
            console.error('Error al archivar la cita:', error);
            setNotification({
                open: true,
                message: 'Hubo un error al archivar la cita.',
                type: 'error',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Función para abrir el diálogo de cancelación
    const handleCancelAppointment = (cita) => {
        // Verificar si se puede cancelar según las reglas actualizadas
        if (!canCancelAppointment(cita)) {
            let mensaje = `No se puede cancelar una cita en estado "${cita.estado}"`;

            // Si es un tratamiento no activado
            if ((cita.tratamiento_id || cita.es_tratamiento === 1) &&
                tratamientos[cita.tratamiento_id] &&
                tratamientos[cita.tratamiento_id].estado !== 'Activo') {
                mensaje = 'Esta cita pertenece a un tratamiento que debe ser activado desde la gestión de tratamientos antes de poder ser cancelada.';
            }

            setNotification({
                open: true,
                message: mensaje,
                type: 'warning',
            });
            return;
        }

        setCitaToCancel(cita);
        setOpenCancelDialog(true);
        setCancelReason(''); // Reiniciar el motivo de cancelación
    };

    // Función para procesar la cancelación con el motivo
    const processCancelAppointment = async () => {
        if (!citaToCancel) return;

        setIsCancelling(true);
        try {
            const response = await fetch(`https://back-end-4803.onrender.com/api/citas/cancel/${citaToCancel.consulta_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    motivo: cancelReason
                }),
            });

            if (!response.ok) throw new Error("Error al cancelar la cita");

            setNotification({
                open: true,
                message: `La cita ha sido cancelada. Se notificará al paciente.`,
                type: 'warning',
            });

            setOpenCancelDialog(false);
            setCitaToCancel(null);
            fetchCitas(); // Vuelve a cargar la lista de citas para actualizar el estado

        } catch (error) {
            console.error("Error al cancelar la cita:", error);
            setNotification({
                open: true,
                message: "Hubo un error al cancelar la cita.",
                type: 'error',
            });
        } finally {
            setIsCancelling(false);
        }
    };

    const handleViewDetails = (cita) => {
        const updatedCita = citas.find(c => c.consulta_id === cita.consulta_id);
        setSelectedCita(updatedCita || cita);
        setOpenDialog(true);
    };

    // Función para obtener citas
    const fetchCitas = useCallback(async () => {
        try {
            const response = await fetch("https://back-end-4803.onrender.com/api/citas/all");
            if (!response.ok) throw new Error("Error al obtener las citas");

            const data = await response.json();
            setCitas(data.filter(cita => !cita.archivado));
        } catch (error) {
            console.error("Error cargando citas:", error);
            setCitas([]);
            setNotification({
                open: true,
                message: 'Error al cargar las citas.',
                type: 'error',
            });
        }
    }, []);

    // Función para formatear la fecha de manera amigable
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            date.setHours(date.getHours() + 6); // 6 horas mas 

            // Formato de día y mes
            const dia = date.toLocaleString('es-MX', { weekday: 'long' });
            const diaMes = date.toLocaleString('es-MX', { day: 'numeric', month: 'long' });

            // Formato de hora
            const hora = date.toLocaleString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });

            // Primer letra mayúscula para el día de la semana
            const diaCapitalizado = dia.charAt(0).toUpperCase() + dia.slice(1);

            return `${diaCapitalizado} ${diaMes}, ${hora}`;
        } catch (error) {
            console.error("Error formateando fecha:", error);
            return "Fecha inválida";
        }
    };

    // Función para obtener el color del estado
    const getStatusColor = (status) => {
        switch (status) {
            case "Pendiente": return '#FFA726';
            case "Confirmada": return '#66BB6A';
            case "Cancelada": return '#EF5350';
            case "Completada": return '#42A5F5';
            case "PRE-REGISTRO": return '#9C27B0'; // Añadido para distinguir pre-registros
            default: return '#BDBDBD';
        }
    };

    // Función para determinar si es un tratamiento o no
    const isTratamiento = (cita) => {
        // Usando directamente es_tratamiento que viene del campo tratamiento de la BD (1 = true)
        return cita?.es_tratamiento === 1;
    };

    // Obtener el número de cita dentro del tratamiento
    const getNumeroCitaTratamiento = (cita) => {
        return cita?.numero_cita_tratamiento || cita?.numero_cita || 1;
    };

    // Verificar si un paciente está registrado (tiene paciente_id)
    const isRegistered = (cita) => {
        return cita?.paciente_id != null;
    };

    // Obtener el estado del tratamiento asociado a una cita
    const getTratamientoEstado = (cita) => {
        if (!cita?.tratamiento_id) return null;

        const tratamiento = tratamientos[cita.tratamiento_id];
        return tratamiento?.estado || null;
    };

    // Verificar si una cita está completada
    const isCitaCompletada = (cita) => {
        return cita?.estado === 'Completada';
    };

    // Renderizar botones de acción según el estado de la cita
    const renderStateActionButtons = (cita) => {
        // Primero verificamos si la cita se puede confirmar según las reglas de negocio
        const puedeConfirmar = canConfirmAppointment(cita);

        switch (cita.estado) {
            case 'Pendiente':
                // Solo mostrar botón de confirmar si la cita puede confirmarse
                return puedeConfirmar ? (
                    <Tooltip title="Confirmar cita" arrow>
                        <IconButton
                            onClick={() => confirmCita(cita)}
                            size="small"
                            sx={{
                                backgroundColor: colors.confirm,
                                '&:hover': { backgroundColor: '#388E3C' },
                                color: 'white',
                                width: { xs: 28, sm: 32 },
                                height: { xs: 28, sm: 32 },
                                '& .MuiSvgIcon-root': {
                                    fontSize: { xs: '0.9rem', sm: '1.1rem' }
                                }
                            }}
                        >
                            <CheckCircle />
                        </IconButton>
                    </Tooltip>
                ) : null;

            case 'Confirmada':
                return (
                    <Tooltip title="Completar cita" arrow>
                        <IconButton
                            onClick={() => completeCita(cita)}
                            size="small"
                            sx={{
                                backgroundColor: colors.complete,
                                '&:hover': { backgroundColor: '#1976D2' },
                                color: 'white',
                                width: { xs: 28, sm: 32 },
                                height: { xs: 28, sm: 32 },
                                '& .MuiSvgIcon-root': {
                                    fontSize: { xs: '0.9rem', sm: '1.1rem' }
                                }
                            }}
                        >
                            <CheckCircle />
                        </IconButton>
                    </Tooltip>
                );
            default:
                return null;
        }
    };

    // Verificar si una cita se puede cancelar
    const canCancelAppointment = (cita) => {
        // Primero verificar si está en un estado que permita cancelación
        const estadoPermiteCancelar = cita.estado === 'Pendiente' || cita.estado === 'Confirmada';

        if (!estadoPermiteCancelar) {
            return false;
        }

        // Para tratamientos, aplicar la misma regla que para confirmar
        if (cita.tratamiento_id || cita.es_tratamiento === 1) {
            const tratamiento = tratamientos[cita.tratamiento_id];

            // Si no encontramos el tratamiento o no está Activo, no permitimos cancelar
            if (!tratamiento || tratamiento.estado !== 'Activo') {
                return false;
            }
        }

        // Si no es un tratamiento (es una consulta normal), siempre se puede cancelar
        return true;
    };

    return (
        <Box sx={{ p: 3, backgroundColor: colors.background, minHeight: '100vh' }}>
            <Card sx={{
                mb: 4,
                backgroundColor: colors.paper,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                <CardContent>
                    <Typography variant="h4" align="center" color={colors.primary} gutterBottom>
                        <CalendarMonth sx={{ fontSize: 40, verticalAlign: 'middle', mr: 2 }} />
                        Gestión de Citas
                    </Typography>

                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <TextField
                            variant="outlined"
                            placeholder="Buscar cita..."
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ width: { xs: '100%', sm: '300px' } }}
                        />
                    </Box>

                    {/* Leyenda simplificada */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        mb: 2,
                        p: 1,
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                            <MedicalServices sx={{ color: colors.tratamiento, fontSize: 16, mr: 1 }} />
                            <Typography variant="body2">Tratamiento</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                            <LocalHospital sx={{ color: colors.consulta, fontSize: 16, mr: 1 }} />
                            <Typography variant="body2">Consulta</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonOff sx={{ color: colors.noRegistrado, fontSize: 16, mr: 1 }} />
                            <Typography variant="body2">No Registrado</Typography>
                        </Box>
                    </Box>

                    <TableContainer
                        component={Paper}
                        sx={{
                            boxShadow: isDarkTheme ? '0px 4px 20px rgba(0, 0, 0, 0.3)' : '0px 4px 20px rgba(0, 0, 0, 0.1)',
                            backgroundColor: colors.paper,
                            borderRadius: '12px',
                            overflow: 'auto',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Table>
                            {/* Encabezado de la tabla */}
                            <TableHead sx={{ backgroundColor: '#E3F2FD' }}>
                                <TableRow>
                                    <TableCell sx={{ color: '#0277BD', fontWeight: 'bold' }}>Paciente</TableCell>
                                    <TableCell sx={{ color: '#0277BD', fontWeight: 'bold', display: { xs: 'none', sm: 'table-cell' } }}>Servicio</TableCell>
                                    <TableCell sx={{ color: '#0277BD', fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Fecha y Hora</TableCell>
                                    <TableCell sx={{ color: '#0277BD', fontWeight: 'bold' }}>Estado</TableCell>
                                    <TableCell sx={{ color: '#0277BD', fontWeight: 'bold' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>

                            {/* Cuerpo de la tabla */}
                            <TableBody>
                                {citas.length > 0 ? (
                                    citas
                                        .filter(cita =>
                                            (cita.paciente_nombre && cita.paciente_nombre.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                            (cita.servicio_nombre && cita.servicio_nombre.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                            (cita.odontologo_nombre && cita.odontologo_nombre.toLowerCase().includes(searchQuery.toLowerCase()))
                                        )
                                        .map((cita, index) => {
                                            const esTratamiento = isTratamiento(cita);
                                            const estaRegistrado = isRegistered(cita);
                                            const numCita = getNumeroCitaTratamiento(cita);
                                            const avatarColor = getPatientColor(cita.paciente_id, cita.paciente_nombre);
                                            const tratamientoEstado = getTratamientoEstado(cita);
                                            const citaCompletada = isCitaCompletada(cita);

                                            // Determinar si mostrar indicador especial cuando es tratamiento no activado
                                            const esTratamientoNoActivado = esTratamiento &&
                                                tratamientoEstado &&
                                                (tratamientoEstado === 'Pre-Registro' || tratamientoEstado === 'Pendiente');

                                            return (
                                                <TableRow
                                                    key={cita?.consulta_id || index}
                                                    sx={{
                                                        height: '65px',
                                                        '&:hover': { backgroundColor: 'rgba(25,118,210,0.05)' },
                                                        transition: 'background-color 0.2s ease',
                                                        borderLeft: `4px solid ${esTratamiento ? colors.tratamiento : colors.consulta}`
                                                    }}
                                                >
                                                    {/* Paciente con avatar e indicador de registro */}
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Avatar
                                                                sx={{
                                                                    bgcolor: avatarColor,
                                                                    width: { xs: 32, sm: 36 },
                                                                    height: { xs: 32, sm: 36 },
                                                                    mr: { xs: 1, sm: 2 },
                                                                    border: estaRegistrado ? 'none' : `2px solid ${colors.noRegistrado}`
                                                                }}
                                                            >
                                                                {cita.paciente_nombre ? cita.paciente_nombre.charAt(0).toUpperCase() : '?'}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography
                                                                    variant="body2"
                                                                    fontWeight="medium"
                                                                    sx={{
                                                                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                                                        maxWidth: { xs: '110px', sm: '100%' },
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                >
                                                                    {cita?.paciente_nombre ?
                                                                        `${cita.paciente_nombre} ${cita.paciente_apellido_paterno || ''} ${cita.paciente_apellido_materno || ''}`.trim() :
                                                                        "No registrado"}
                                                                </Typography>
                                                                <Box
                                                                    sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 0.5
                                                                    }}
                                                                >
                                                                    {esTratamiento && (
                                                                        <Chip
                                                                            size="small"
                                                                            label={`Cita ${numCita}`}
                                                                            sx={{
                                                                                height: 18,
                                                                                fontSize: '0.65rem',
                                                                                bgcolor: colors.tratamiento,
                                                                                color: 'white',
                                                                                display: { xs: 'flex', md: 'none' }
                                                                            }}
                                                                        />
                                                                    )}
                                                                    <Typography
                                                                        variant="caption"
                                                                        color="textSecondary"
                                                                        sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                                                                    >
                                                                        {estaRegistrado ? 'Registrado' : 'No registrado'}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>

                                                    {/* Servicio con icono según tipo */}
                                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            {esTratamiento ? (
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    <MedicalServices
                                                                        sx={{
                                                                            color: colors.tratamiento,
                                                                            fontSize: 18,
                                                                            mr: 1
                                                                        }}
                                                                    />
                                                                    <Box>
                                                                        <Typography variant="body2">
                                                                            {cita?.servicio_nombre || "N/A"}
                                                                        </Typography>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                            <Typography variant="caption"
                                                                                sx={{
                                                                                    color: colors.tratamiento,
                                                                                }}
                                                                            >
                                                                                Tratamiento (cita {numCita})
                                                                            </Typography>

                                                                            {/* Agregar insignia si el tratamiento no está activado */}
                                                                            {esTratamientoNoActivado && (
                                                                                <Chip
                                                                                    size="small"
                                                                                    label={tratamientoEstado}
                                                                                    sx={{
                                                                                        height: 16,
                                                                                        fontSize: '0.6rem',
                                                                                        ml: 0.5,
                                                                                        bgcolor: tratamientoEstado === 'Pre-Registro' ? '#9C27B0' : '#FF9800',
                                                                                        color: 'white'
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        </Box>
                                                                    </Box>
                                                                </Box>
                                                            ) : (
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    <LocalHospital
                                                                        sx={{
                                                                            color: colors.consulta,
                                                                            fontSize: 18,
                                                                            mr: 1
                                                                        }}
                                                                    />
                                                                    <Box>
                                                                        <Typography variant="body2">
                                                                            {cita?.servicio_nombre || "N/A"}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="textSecondary">
                                                                            {cita?.categoria_servicio || "General"}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </TableCell>

                                                    {/* Fecha de Consulta */}
                                                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                                        <Typography variant="body2">{formatDate(cita?.fecha_consulta)}</Typography>
                                                    </TableCell>

                                                    {/* Estado con Chip de colores */}
                                                    <TableCell>
                                                        <Chip
                                                            label={cita?.estado || "Pendiente"}
                                                            sx={{
                                                                backgroundColor: getStatusColor(cita?.estado),
                                                                color: '#FFF',
                                                                fontWeight: '500',
                                                                fontSize: '0.75rem',
                                                                height: '24px',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    {/* Acciones */}
                                                    <TableCell>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            gap: { xs: 0.5, sm: 1 },
                                                            flexWrap: { xs: 'wrap', md: 'nowrap' },
                                                            justifyContent: 'center'
                                                        }}>
                                                            {/* Ver Detalles - Cambiado a ícono de ojo */}
                                                            <Tooltip title="Ver detalles" arrow>
                                                                <IconButton
                                                                    onClick={() => handleViewDetails(cita)}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: colors.details,
                                                                        '&:hover': { backgroundColor: '#0277bd' },
                                                                        color: 'white',
                                                                        width: { xs: 28, sm: 32 },
                                                                        height: { xs: 28, sm: 32 },
                                                                        '& .MuiSvgIcon-root': {
                                                                            fontSize: { xs: '0.9rem', sm: '1.1rem' }
                                                                        }
                                                                    }}
                                                                >
                                                                    <Visibility />
                                                                </IconButton>
                                                            </Tooltip>

                                                            {/* Editar Cita - Solo si NO está completada */}
                                                            {!citaCompletada && (
                                                                <Tooltip title="Editar cita" arrow>
                                                                    <IconButton
                                                                        onClick={() => {
                                                                            setSelectedCita(cita);
                                                                            setOpenEditDialog(true);
                                                                        }}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: colors.edit,
                                                                            '&:hover': { backgroundColor: '#388e3c' },
                                                                            color: 'white',
                                                                            width: { xs: 28, sm: 32 },
                                                                            height: { xs: 28, sm: 32 },
                                                                            '& .MuiSvgIcon-root': {
                                                                                fontSize: { xs: '0.9rem', sm: '1.1rem' }
                                                                            }
                                                                        }}
                                                                    >
                                                                        <BorderColor />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}

                                                            {/* Botón de acción según estado (Confirmar o Completar) */}
                                                            {renderStateActionButtons(cita)}

                                                            {/* Archivar Cita - Siempre disponible */}
                                                            <Tooltip title="Archivar cita" arrow>
                                                                <IconButton
                                                                    onClick={() => openArchiveConfirmation(cita)}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: colors.archive,
                                                                        '&:hover': { backgroundColor: '#f57c00' },
                                                                        color: 'white',
                                                                        width: { xs: 28, sm: 32 },
                                                                        height: { xs: 28, sm: 32 },
                                                                        '& .MuiSvgIcon-root': {
                                                                            fontSize: { xs: '0.9rem', sm: '1.1rem' }
                                                                        }
                                                                    }}
                                                                >
                                                                    <MenuBook />
                                                                </IconButton>
                                                            </Tooltip>

                                                            {/* Cancelar Cita - Solo si se puede cancelar y NO está completada */}
                                                            {canCancelAppointment(cita) && !citaCompletada && (
                                                                <Tooltip title="Cancelar cita" arrow>
                                                                    <IconButton
                                                                        onClick={() => handleCancelAppointment(cita)}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: colors.cancel,
                                                                            '&:hover': { backgroundColor: '#c62828' },
                                                                            color: 'white',
                                                                            width: { xs: 28, sm: 32 },
                                                                            height: { xs: 28, sm: 32 },
                                                                            '& .MuiSvgIcon-root': {
                                                                                fontSize: { xs: '0.9rem', sm: '1.1rem' }
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Close />
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
                                        <TableCell colSpan={5} align="center">
                                            <Typography color="textSecondary">No hay citas disponibles</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Botón para agregar nueva cita */}
            <Fab
                color="primary"
                aria-label="add"
                onClick={() => setOpenNewAppointmentForm(true)}
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                }}
            >
                <Add />
            </Fab>

            {/* Diálogo de detalles de la cita */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedCita && (
                    <>
                        <DialogTitle sx={{
                            backgroundColor: isTratamiento(selectedCita) ? colors.tratamiento : colors.primary,
                            color: 'white'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Event sx={{ mr: 2 }} />
                                    {isTratamiento(selectedCita) ? (
                                        `Detalles del Tratamiento (Cita ${getNumeroCitaTratamiento(selectedCita)})`
                                    ) : (
                                        `Detalles de la Cita`
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {/* Mostrar estado del tratamiento si aplica */}
                                    {isTratamiento(selectedCita) && getTratamientoEstado(selectedCita) && (
                                        <Chip
                                            label={`Tratamiento: ${getTratamientoEstado(selectedCita)}`}
                                            size="small"
                                            sx={{
                                                backgroundColor: 'rgba(255,255,255,0.9)',
                                                color: getStatusColor(getTratamientoEstado(selectedCita)),
                                                fontWeight: 'bold',
                                            }}
                                        />
                                    )}
                                    <Chip
                                        label={isTratamiento(selectedCita) ? 'Tratamiento' : 'Consulta'}
                                        size="small"
                                        sx={{
                                            backgroundColor: 'white',
                                            color: isTratamiento(selectedCita) ? colors.tratamiento : colors.primary,
                                            fontWeight: 'bold',
                                        }}
                                    />
                                </Box>
                            </Box>
                        </DialogTitle>
                        <DialogContent sx={{ mt: 2 }}>
                            <Grid container spacing={3}>
                                {/* Información del Paciente */}
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar
                                            sx={{
                                                bgcolor: getPatientColor(selectedCita.paciente_id, selectedCita.paciente_nombre),
                                                width: 40,
                                                height: 40,
                                                mr: 2,
                                                border: isRegistered(selectedCita) ? 'none' : `2px solid ${colors.noRegistrado}`
                                            }}
                                        >
                                            {selectedCita.paciente_nombre ? selectedCita.paciente_nombre.charAt(0).toUpperCase() : '?'}
                                        </Avatar>
                                        <Typography variant="h6" color={colors.primary}>
                                            Información del Paciente
                                        </Typography>
                                    </Box>
                                    <Box sx={{ ml: 4, mt: 1 }}>
                                        <Typography><strong>Nombre:</strong> {selectedCita.paciente_nombre} {selectedCita.paciente_apellido_paterno} {selectedCita.paciente_apellido_materno}</Typography>
                                        <Typography><strong>Género:</strong> {selectedCita.paciente_genero || "No especificado"}</Typography>
                                        {selectedCita.paciente_fecha_nacimiento && (
                                            <Typography><strong>Fecha de Nacimiento:</strong> {new Date(selectedCita.paciente_fecha_nacimiento).toLocaleDateString()}</Typography>
                                        )}
                                        <Typography><strong>Correo:</strong> {selectedCita.paciente_correo || "No especificado"}</Typography>
                                        <Typography><strong>Teléfono:</strong> {selectedCita.paciente_telefono || "No especificado"}</Typography>
                                        <Typography><strong>Estado:</strong> {isRegistered(selectedCita) ? 'Registrado' : 'No registrado'}</Typography>
                                    </Box>
                                </Grid>

                                {/* Información de la Cita */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" color={colors.primary}>
                                        <CalendarMonth sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Información de la Cita
                                    </Typography>
                                    <Box sx={{ ml: 4, mt: 1 }}>
                                        <Typography><strong>Servicio:</strong> {selectedCita.servicio_nombre}</Typography>
                                        <Typography><strong>Tipo:</strong> {isTratamiento(selectedCita) ? "Tratamiento" : "Consulta Regular"}</Typography>
                                        {isTratamiento(selectedCita) && (
                                            <Typography><strong>Número de cita:</strong> {getNumeroCitaTratamiento(selectedCita)}</Typography>
                                        )}
                                        <Typography><strong>Categoría:</strong> {selectedCita.categoria_servicio || "No especificada"}</Typography>
                                        <Typography><strong>Precio:</strong> ${selectedCita.precio_servicio || "0.00"}</Typography>
                                        <Typography><strong>Fecha de Consulta:</strong> {formatDate(selectedCita.fecha_consulta)}</Typography>
                                        <Typography><strong>Estado:</strong>
                                            <Chip
                                                label={selectedCita.estado || "Pendiente"}
                                                size="small"
                                                sx={{
                                                    ml: 1,
                                                    backgroundColor: getStatusColor(selectedCita.estado),
                                                    color: '#FFF',
                                                    fontWeight: '500',
                                                    fontSize: '0.75rem',
                                                    height: '24px',
                                                }}
                                            />
                                        </Typography>
                                        <Typography><strong>Fecha de Solicitud:</strong> {formatDate(selectedCita.fecha_solicitud)}</Typography>
                                    </Box>
                                </Grid>

                                {/* Información del Odontólogo */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" color={colors.primary}>
                                        <HealthAndSafety sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Odontólogo Asignado
                                    </Typography>
                                    <Box sx={{ ml: 4, mt: 1 }}>
                                        <Typography><strong>Nombre:</strong> {selectedCita.odontologo_nombre || "No asignado"}</Typography>
                                    </Box>
                                </Grid>

                                {/* Notas */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" color={colors.primary}>
                                        <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Notas
                                    </Typography>
                                    <Box sx={{ ml: 4, mt: 1 }}>
                                        <Typography>
                                            {selectedCita.notas || "Sin notas adicionales"}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDialog(false)} color="primary">
                                Cerrar
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Diálogo de archivar la cita */}
            <Dialog
                open={openConfirmDialog}
                onClose={() => !isProcessing && setOpenConfirmDialog(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: colors.paper,
                        color: colors.text,
                        maxWidth: '600px',
                        width: '100%'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        color: colors.primary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        borderBottom: `1px solid ${colors.divider}`
                    }}
                >
                    <MenuBook sx={{ color: colors.archive }} />
                    Confirmar Archivado de Cita
                </DialogTitle>

                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        ¿Estás seguro de que deseas archivar la cita #{citaToDelete?.consulta_id}?
                    </Typography>

                    {citaToDelete && (
                        <Box sx={{ mt: 2 }}>
                            <Typography><strong>Paciente:</strong> {citaToDelete.paciente_nombre} {citaToDelete.paciente_apellido_paterno} {citaToDelete.paciente_apellido_materno}</Typography>
                            <Typography><strong>Servicio:</strong> {citaToDelete.servicio_nombre}</Typography>
                            <Typography><strong>Fecha:</strong> {formatDate(citaToDelete.fecha_consulta)}</Typography>
                            <Typography><strong>Estado actual:</strong> <Chip
                                label={citaToDelete.estado || "Pendiente"}
                                size="small"
                                sx={{
                                    backgroundColor: getStatusColor(citaToDelete.estado),
                                    color: '#FFF',
                                    fontWeight: '500',
                                    fontSize: '0.75rem',
                                    height: '24px',
                                    ml: 1
                                }}
                            /></Typography>
                        </Box>
                    )}

                    <Alert
                        severity="info"
                        sx={{
                            mt: 2
                        }}
                    >
                        <AlertTitle>Información</AlertTitle>
                        Las citas archivadas no aparecerán en la lista principal, pero se mantendrán en la base de datos para consultas futuras.
                    </Alert>
                </DialogContent>

                <DialogActions sx={{ p: 2, borderTop: `1px solid ${colors.divider}` }}>
                    <Button
                        onClick={() => setOpenConfirmDialog(false)}
                        disabled={isProcessing}
                        sx={{
                            color: colors.secondary,
                            '&:hover': {
                                backgroundColor: alpha(colors.secondary, 0.1)
                            }
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleArchiveAppointment}
                        disabled={isProcessing}
                        sx={{
                            bgcolor: colors.archive,
                            '&:hover': { bgcolor: '#f57c00' },
                            '&:disabled': { bgcolor: alpha(colors.archive, 0.5) }
                        }}
                    >
                        {isProcessing ? 'Archivando...' : 'Confirmar Archivado'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo de cancelación de cita */}
            <Dialog
                open={openCancelDialog}
                onClose={() => !isCancelling && setOpenCancelDialog(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: colors.paper,
                        color: colors.text,
                        maxWidth: '600px',
                        width: '100%'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        color: '#d32f2f',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        borderBottom: `1px solid ${colors.divider}`
                    }}
                >
                    <Close sx={{ color: '#d32f2f' }} />
                    Confirmar Cancelación de Cita
                </DialogTitle>

                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        ¿Estás seguro de que deseas cancelar la cita #{citaToCancel?.consulta_id}?
                    </Typography>

                    {citaToCancel && (
                        <Box sx={{ mt: 2 }}>
                            <Typography><strong>Paciente:</strong> {citaToCancel.paciente_nombre} {citaToCancel.paciente_apellido_paterno} {citaToCancel.paciente_apellido_materno}</Typography>
                            <Typography><strong>Servicio:</strong> {citaToCancel.servicio_nombre}</Typography>
                            <Typography><strong>Fecha:</strong> {formatDate(citaToCancel.fecha_consulta)}</Typography>
                            <Typography><strong>Odontólogo:</strong> {citaToCancel.odontologo_nombre || "No asignado"}</Typography>
                        </Box>
                    )}

                    <TextField
                        label="Motivo de la cancelación"
                        placeholder="Indique el motivo por el cual se cancela la cita..."
                        multiline
                        rows={3}
                        fullWidth
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        margin="normal"
                        variant="outlined"
                        required
                        helperText="Este mensaje será enviado al paciente como notificación"
                        sx={{ mt: 3 }}
                    />

                    <Alert
                        severity="warning"
                        sx={{
                            mt: 2,
                            '& .MuiAlert-icon': {
                                color: '#d32f2f'
                            }
                        }}
                    >
                        <AlertTitle>Importante</AlertTitle>
                        Esta acción cambiará el estado de la cita a "Cancelada" y enviará una notificación al paciente.
                    </Alert>
                </DialogContent>

                <DialogActions sx={{ p: 2, borderTop: `1px solid ${colors.divider}` }}>
                    <Button
                        onClick={() => setOpenCancelDialog(false)}
                        disabled={isCancelling}
                        sx={{
                            color: colors.secondary,
                            '&:hover': {
                                backgroundColor: alpha(colors.secondary, 0.1)
                            }
                        }}
                    >
                        Volver
                    </Button>
                    <Button
                        variant="contained"
                        onClick={processCancelAppointment}
                        disabled={isCancelling || !cancelReason.trim()}
                        sx={{
                            bgcolor: colors.cancel,
                            '&:hover': { bgcolor: '#c62828' },
                            '&:disabled': { bgcolor: alpha(colors.cancel, 0.5) }
                        }}
                    >
                        {isCancelling ? 'Procesando...' : 'Confirmar Cancelación'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo de confirmación de cita */}
            <Dialog
                open={openConfirmCitaDialog}
                onClose={() => !isConfirming && setOpenConfirmCitaDialog(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: colors.paper,
                        color: colors.text,
                        maxWidth: '600px',
                        width: '100%'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        color: '#388e3c',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        borderBottom: `1px solid ${colors.divider}`
                    }}
                >
                    <CheckCircle sx={{ color: '#388e3c' }} />
                    Confirmar Cita
                </DialogTitle>

                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        ¿Confirmar la cita #{citaToConfirm?.consulta_id}?
                    </Typography>

                    {citaToConfirm && (
                        <Box sx={{ mt: 2 }}>
                            <Typography><strong>Paciente:</strong> {citaToConfirm.paciente_nombre} {citaToConfirm.paciente_apellido_paterno} {citaToConfirm.paciente_apellido_materno}</Typography>
                            <Typography><strong>Servicio:</strong> {citaToConfirm.servicio_nombre}</Typography>
                            <Typography><strong>Fecha:</strong> {formatDate(citaToConfirm.fecha_consulta)}</Typography>
                            <Typography><strong>Odontólogo:</strong> {citaToConfirm.odontologo_nombre || "No asignado"}</Typography>
                        </Box>
                    )}

                    <TextField
                        label="Mensaje para el paciente (opcional)"
                        placeholder="Añada algún mensaje o indicación para el paciente..."
                        multiline
                        rows={3}
                        fullWidth
                        value={confirmMessage}
                        onChange={(e) => setConfirmMessage(e.target.value)}
                        margin="normal"
                        variant="outlined"
                        helperText="Este mensaje se enviará al paciente como confirmación"
                        sx={{ mt: 3 }}
                    />

                    <Alert
                        severity="info"
                        sx={{ mt: 2 }}
                    >
                        <AlertTitle>Información</AlertTitle>
                        Esta acción cambiará el estado de la cita a "Confirmada" y notificará al paciente.
                    </Alert>
                </DialogContent>

                <DialogActions sx={{ p: 2, borderTop: `1px solid ${colors.divider}` }}>
                    <Button
                        onClick={() => setOpenConfirmCitaDialog(false)}
                        disabled={isConfirming}
                        sx={{
                            color: colors.secondary,
                            '&:hover': {
                                backgroundColor: alpha(colors.secondary, 0.1)
                            }
                        }}
                    >
                        Volver
                    </Button>
                    <Button
                        variant="contained"
                        onClick={processConfirmCita}
                        disabled={isConfirming}
                        sx={{
                            bgcolor: colors.confirm,
                            '&:hover': { bgcolor: '#388e3c' },
                            '&:disabled': { bgcolor: alpha(colors.confirm, 0.5) }
                        }}
                    >
                        {isConfirming ? 'Procesando...' : 'Confirmar Cita'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo para marcar la cita como Completada */}
            <Dialog
                open={openCompleteCitaDialog}
                onClose={() => !isCompleting && setOpenCompleteCitaDialog(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: colors.paper,
                        color: colors.text,
                        maxWidth: '600px',
                        width: '100%'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        color: '#1976d2',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        borderBottom: `1px solid ${colors.divider}`
                    }}
                >
                    <CheckCircle sx={{ color: '#1976d2' }} />
                    Completar Cita
                </DialogTitle>

                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        ¿Marcar la cita #{citaToComplete?.consulta_id} como completada?
                    </Typography>

                    {citaToComplete && (
                        <Box sx={{ mt: 2 }}>
                            <Typography><strong>Paciente:</strong> {citaToComplete.paciente_nombre} {citaToComplete.paciente_apellido_paterno} {citaToComplete.paciente_apellido_materno}</Typography>
                            <Typography><strong>Servicio:</strong> {citaToComplete.servicio_nombre}</Typography>
                            <Typography><strong>Fecha:</strong> {formatDate(citaToComplete.fecha_consulta)}</Typography>
                            <Typography><strong>Odontólogo:</strong> {citaToComplete.odontologo_nombre || "No asignado"}</Typography>

                            {/* Mostrar información adicional si es tratamiento */}
                            {citaToComplete.tratamiento_id && (
                                <Box sx={{ mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                    <Typography><strong>Tratamiento ID:</strong> {citaToComplete.tratamiento_id}</Typography>
                                    <Typography><strong>Número de cita:</strong> {getNumeroCitaTratamiento(citaToComplete)}</Typography>
                                    <Typography><strong>Al completar:</strong> Se programará automáticamente la siguiente cita para el próximo mes</Typography>
                                </Box>
                            )}
                        </Box>
                    )}

                    <TextField
                        label="Notas del tratamiento (opcional)"
                        placeholder="Añada notas sobre el tratamiento realizado..."
                        multiline
                        rows={3}
                        fullWidth
                        value={completeMessage}
                        onChange={(e) => setCompleteMessage(e.target.value)}
                        margin="normal"
                        variant="outlined"
                        helperText="Estas notas se guardarán en el historial del paciente"
                        sx={{ mt: 3 }}
                    />

                    <Alert
                        severity="success"
                        sx={{ mt: 2 }}
                    >
                        <AlertTitle>Información</AlertTitle>
                        Esta acción marcará la cita como "Completada" y no podrá ser cancelada posteriormente.
                        {citaToComplete?.tratamiento_id && " También se registrará el progreso en el tratamiento asociado."}
                    </Alert>
                </DialogContent>

                <DialogActions sx={{ p: 2, borderTop: `1px solid ${colors.divider}` }}>
                    <Button
                        onClick={() => setOpenCompleteCitaDialog(false)}
                        disabled={isCompleting}
                        sx={{
                            color: colors.secondary,
                            '&:hover': {
                                backgroundColor: alpha(colors.secondary, 0.1)
                            }
                        }}
                    >
                        Volver
                    </Button>
                    <Button
                        variant="contained"
                        onClick={processCompleteCita}
                        disabled={isCompleting}
                        sx={{
                            bgcolor: colors.complete,
                            '&:hover': { bgcolor: '#1976d2' },
                            '&:disabled': { bgcolor: alpha(colors.complete, 0.5) }
                        }}
                    >
                        {isCompleting ? 'Procesando...' : 'Completar Cita'}
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
                onClose={handleNotificationClose}
            />
        </Box>
    );
};

export default CitasForm;