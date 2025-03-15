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
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Table, TableBody, TableCell,
    TableContainer,
    TableHead, TableRow,
    TextField,
    Tooltip,
    Typography
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
    Info,
    MenuBook,
    Person,
    ChangeCircle,
    Circle as CircleIcon,
    CheckCircle,
    Error as ErrorIcon
} from '@mui/icons-material';

import { alpha } from '@mui/material/styles';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import EditCita from './citas/editarCita.jsx';
import NewCita from './citas/nuevaCita.jsx';

const CitasForm = () => {
    const { isDarkTheme } = useThemeContext();
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

    useEffect(() => {
        fetchCitas();
    }, []);

    // Colores del tema
    const colors = {
        background: isDarkTheme ? '#0D1B2A' : '#ffffff',
        primary: isDarkTheme ? '#00BCD4' : '#03427C',
        text: isDarkTheme ? '#ffffff' : '#1a1a1a',
        secondary: isDarkTheme ? '#A0AEC0' : '#666666',
        cardBg: isDarkTheme ? '#1A2735' : '#ffffff',
        paper: isDarkTheme ? '#1A2735' : '#ffffff',
        divider: isDarkTheme ? '#2D3748' : '#E2E8F0',
        tratamiento: '#4caf50',       // Color para tratamientos
        consulta: '#f44336',          // Color para consultas regulares
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

    const processCompleteCita = async () => {
        setIsCompleting(true);
        await handleChangeState(citaToComplete, 'Completada', completeMessage);
        setOpenCompleteCitaDialog(false);
        setCitaToComplete(null);
        setIsCompleting(false);
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

            setTimeout(() => {
                setNotification({ open: false, message: '', type: '' });
            }, 3000);

        } catch (error) {
            console.error('Error al archivar la cita:', error);
            setNotification({
                open: true,
                message: 'Hubo un error al archivar la cita.',
                type: 'error',
            });

            setTimeout(() => {
                setNotification({ open: false, message: '', type: '' });
            }, 3000);
        } finally {
            setIsProcessing(false);
        }
    };

    // Función para abrir el diálogo de cancelación
    const handleCancelAppointment = (cita) => {
        // Verificar si se puede cancelar
        if (!canChangeToState(cita.estado, 'Cancelada')) {
            setNotification({
                open: true,
                message: `No se puede cancelar una cita en estado "${cita.estado}"`,
                type: 'error',
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

    // Función para formatear la fecha de manera más amigable
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
            default: return '#BDBDBD';
        }
    };

    // Función para determinar si es un tratamiento o no
    const isTratamiento = (cita) => {
        // Lógica para determinar si es un tratamiento basado en los datos de la cita
        return cita?.tratamiento === 1 || cita?.es_tratamiento === true;
    };

    // Obtener el número de cita dentro del tratamiento
    const getNumeroCitaTratamiento = (cita) => {
        return cita?.numero_cita_tratamiento || cita?.numero_cita || 1;
    };

    // Renderizar botones de acción según el estado de la cita
    const renderStateActionButtons = (cita) => {
        switch (cita.estado) {
            case 'Pendiente':
                return (
                    <Tooltip title="Confirmar cita" arrow>
                        <IconButton
                            onClick={() => confirmCita(cita)}
                            sx={{
                                backgroundColor: '#66BB6A',
                                '&:hover': { backgroundColor: '#388E3C' },
                                padding: '8px',
                                borderRadius: '50%',
                            }}
                        >
                            <CheckCircle fontSize="medium" sx={{ color: 'white' }} />
                        </IconButton>
                    </Tooltip>
                );
            case 'Confirmada':
                return (
                    <Tooltip title="Completar cita" arrow>
                        <IconButton
                            onClick={() => completeCita(cita)}
                            sx={{
                                backgroundColor: '#42A5F5',
                                '&:hover': { backgroundColor: '#1976D2' },
                                padding: '8px',
                                borderRadius: '50%',
                            }}
                        >
                            <CheckCircle fontSize="medium" sx={{ color: 'white' }} />
                        </IconButton>
                    </Tooltip>
                );
            default:
                return null;
        }
    };

    // Verificar si una cita se puede cancelar
    const canCancelAppointment = (cita) => {
        return cita.estado === 'Pendiente' || cita.estado === 'Confirmada';
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

                    {/* Leyenda de colores */}
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        alignItems: 'center', 
                        mb: 2,
                        p: 1,
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px'
                    }}>
                        <Typography variant="body2" sx={{ mr: 3, fontWeight: 'medium' }}>
                            Tipo de cita:
                        </Typography>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mr: 3
                        }}>
                            <Box sx={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%', 
                                bgcolor: colors.tratamiento, 
                                mr: 1 
                            }} />
                            <Typography variant="body2">Tratamiento</Typography>
                        </Box>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center'
                        }}>
                            <Box sx={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%', 
                                bgcolor: colors.consulta, 
                                mr: 1 
                            }} />
                            <Typography variant="body2">No Tratamiento</Typography>
                        </Box>
                    </Box>

                    <TableContainer
                        component={Paper}
                        sx={{
                            boxShadow: isDarkTheme ? '0px 4px 20px rgba(0, 0, 0, 0.3)' : '0px 4px 20px rgba(0, 0, 0, 0.1)',
                            backgroundColor: colors.paper,
                            borderRadius: '12px',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Table>
                            {/* Encabezado de la tabla */}
                            <TableHead sx={{ backgroundColor: '#E3F2FD' }}>
                                <TableRow>
                                    <TableCell sx={{ color: '#0277BD', fontWeight: 'bold' }}>#</TableCell>
                                    <TableCell sx={{ color: '#0277BD', fontWeight: 'bold' }}>Paciente</TableCell>
                                    <TableCell sx={{ color: '#0277BD', fontWeight: 'bold' }}>Servicio</TableCell>
                                    <TableCell sx={{ color: '#0277BD', fontWeight: 'bold' }}>Categoría</TableCell>
                                    <TableCell sx={{ color: '#0277BD', fontWeight: 'bold' }}>Fecha y Hora</TableCell>
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
                                            const numCita = getNumeroCitaTratamiento(cita);
                                            
                                            return (
                                                <TableRow
                                                    key={cita?.consulta_id || index}
                                                    sx={{
                                                        height: '69px',
                                                        '&:hover': { backgroundColor: 'rgba(25,118,210,0.1)' },
                                                        transition: 'background-color 0.2s ease',
                                                        position: 'relative',
                                                        // Barra de color a la izquierda según tipo
                                                        borderLeft: `4px solid ${esTratamiento ? colors.tratamiento : colors.consulta}`
                                                    }}
                                                >
                                                    {/* Indicador numérico para tratamientos */}
                                                    {esTratamiento && (
                                                        <Box 
                                                            sx={{
                                                                position: 'absolute',
                                                                left: '-15px',
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                backgroundColor: colors.tratamiento,
                                                                color: 'white',
                                                                width: '24px',
                                                                height: '24px',
                                                                borderRadius: '50%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '12px',
                                                                fontWeight: 'bold',
                                                                zIndex: 1
                                                            }}
                                                        >
                                                            {numCita}
                                                        </Box>
                                                    )}

                                                    <TableCell sx={{ color: '#333' }}>{cita?.consulta_id || "N/A"}</TableCell>

                                                    {/* Paciente */}
                                                    <TableCell sx={{ color: '#333' }}>
                                                        {cita?.paciente_nombre ?
                                                            `${cita.paciente_nombre} ${cita.paciente_apellido_paterno || ''} ${cita.paciente_apellido_materno || ''}`.trim() :
                                                            "No registrado"}
                                                    </TableCell>

                                                    {/* Servicio */}
                                                    <TableCell sx={{ color: '#333' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            {esTratamiento && (
                                                                <Tooltip title="Tratamiento" arrow>
                                                                    <CircleIcon 
                                                                        sx={{ 
                                                                            color: colors.tratamiento, 
                                                                            fontSize: 12, 
                                                                            mr: 1,
                                                                            opacity: 0.8
                                                                        }} 
                                                                    />
                                                                </Tooltip>
                                                            )}
                                                            {cita?.servicio_nombre || "N/A"}
                                                        </Box>
                                                    </TableCell>

                                                    {/* Categoría */}
                                                    <TableCell sx={{ color: '#333' }}>{cita?.categoria_servicio || "General"}</TableCell>

                                                    {/* Fecha de Consulta */}
                                                    <TableCell sx={{ color: '#333' }}>{formatDate(cita?.fecha_consulta)}</TableCell>

                                                    {/* Estado con Chip de colores */}
                                                    <TableCell>
                                                        <Chip
                                                            label={cita?.estado || "Pendiente"}
                                                            sx={{
                                                                backgroundColor: getStatusColor(cita?.estado),
                                                                color: '#FFF',
                                                                fontWeight: '500',
                                                                fontSize: '0.875rem',
                                                                height: '28px',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    {/* Acciones */}
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            {/* 🔍 Ver Detalles */}
                                                            <Tooltip title="Ver detalles" arrow>
                                                                <IconButton
                                                                    onClick={() => handleViewDetails(cita)}
                                                                    sx={{
                                                                        backgroundColor: '#0288d1',
                                                                        '&:hover': { backgroundColor: '#0277bd' },
                                                                        padding: '8px',
                                                                        borderRadius: '50%',
                                                                    }}
                                                                >
                                                                    <Info fontSize="medium" sx={{ color: 'white' }} />
                                                                </IconButton>
                                                            </Tooltip>

                                                            {/* ✏️ Editar Cita */}
                                                            <Tooltip title="Editar cita" arrow>
                                                                <IconButton
                                                                    onClick={() => {
                                                                        setSelectedCita(cita);
                                                                        setOpenEditDialog(true);
                                                                    }}
                                                                    sx={{
                                                                        backgroundColor: '#4caf50',
                                                                        '&:hover': { backgroundColor: '#388e3c' },
                                                                        padding: '8px',
                                                                        borderRadius: '50%',
                                                                    }}
                                                                >
                                                                    <BorderColor fontSize="medium" sx={{ color: 'white' }} />
                                                                </IconButton>
                                                            </Tooltip>

                                                            {/* Botón de acción según estado (Confirmar o Completar) */}
                                                            {renderStateActionButtons(cita)}

                                                            {/* 📁 Archivar Cita */}
                                                            <Tooltip title="Archivar cita" arrow>
                                                                <IconButton
                                                                    onClick={() => openArchiveConfirmation(cita)}
                                                                    sx={{
                                                                        backgroundColor: '#ff9800',
                                                                        '&:hover': { backgroundColor: '#f57c00' },
                                                                        padding: '8px',
                                                                        borderRadius: '50%',
                                                                    }}
                                                                >
                                                                    <MenuBook fontSize="medium" sx={{ color: 'white' }} />
                                                                </IconButton>
                                                            </Tooltip>

                                                            {/* 🛑 Cancelar Cita - Solo si se puede cancelar */}
                                                            {canCancelAppointment(cita) && (
                                                                <Tooltip title="Cancelar cita" arrow>
                                                                    <IconButton
                                                                        onClick={() => handleCancelAppointment(cita)}
                                                                        sx={{
                                                                            backgroundColor: '#e53935',
                                                                            '&:hover': { backgroundColor: '#c62828' },
                                                                            padding: '8px',
                                                                            borderRadius: '50%',
                                                                        }}
                                                                    >
                                                                        <Close fontSize="medium" sx={{ color: 'white' }} />
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
                                        <TableCell colSpan={7} align="center">
                                            <Typography color="textSecondary">No hay citas disponibles</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

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
                            backgroundColor: isTratamiento(selectedCita) ? '#4caf50' : colors.primary, 
                            color: 'white' 
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Event sx={{ mr: 2 }} />
                                    {isTratamiento(selectedCita) ? (
                                        `Detalles del Tratamiento #${selectedCita.consulta_id} (Cita ${getNumeroCitaTratamiento(selectedCita)})`
                                    ) : (
                                        `Detalles de la Cita #${selectedCita.consulta_id}`
                                    )}
                                </Box>
                                <Chip
                                    label={isTratamiento(selectedCita) ? 'Tratamiento' : 'No Tratamiento'}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'white',
                                        color: isTratamiento(selectedCita) ? '#4caf50' : '#f44336',
                                        fontWeight: 'bold',
                                        border: `1px solid ${isTratamiento(selectedCita) ? '#4caf50' : '#f44336'}`
                                    }}
                                />
                            </Box>
                        </DialogTitle>
                        <DialogContent sx={{ mt: 2 }}>
                            <Grid container spacing={3}>
                                {/* Información del Paciente */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" color={colors.primary}>
                                        <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Información del Paciente
                                    </Typography>
                                    <Box sx={{ ml: 4, mt: 1 }}>
                                        <Typography><strong>Nombre:</strong> {selectedCita.paciente_nombre} {selectedCita.paciente_apellido_paterno} {selectedCita.paciente_apellido_materno}</Typography>
                                        <Typography><strong>Género:</strong> {selectedCita.paciente_genero || "No especificado"}</Typography>
                                        {selectedCita.paciente_fecha_nacimiento && (
                                            <Typography><strong>Fecha de Nacimiento:</strong> {new Date(selectedCita.paciente_fecha_nacimiento).toLocaleDateString()}</Typography>
                                        )}
                                        <Typography><strong>Correo:</strong> {selectedCita.paciente_correo || "No especificado"}</Typography>
                                        <Typography><strong>Teléfono:</strong> {selectedCita.paciente_telefono || "No especificado"}</Typography>
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
                    <MenuBook sx={{ color: '#ff9800' }} />
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
                            bgcolor: '#ff9800',
                            '&:hover': { bgcolor: '#f57c00' },
                            '&:disabled': { bgcolor: alpha('#ff9800', 0.5) }
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
                            bgcolor: '#e53935',
                            '&:hover': { bgcolor: '#c62828' },
                            '&:disabled': { bgcolor: alpha('#e53935', 0.5) }
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
                            bgcolor: '#66BB6A',
                            '&:hover': { bgcolor: '#388e3c' },
                            '&:disabled': { bgcolor: alpha('#66BB6A', 0.5) }
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
                            bgcolor: '#42A5F5',
                            '&:hover': { bgcolor: '#1976d2' },
                            '&:disabled': { bgcolor: alpha('#42A5F5', 0.5) }
                        }}
                    >
                        {isCompleting ? 'Procesando...' : 'Completar Cita'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Botón FAB para agregar nueva cita */}
            <Tooltip title="Agregar nueva cita">
                <Fab
                    color="primary"
                    sx={{
                        position: 'fixed',
                        bottom: 32,
                        right: 32,
                        bgcolor: colors.primary,
                        '&:hover': {
                            bgcolor: colors.primary,
                            opacity: 0.9
                        }
                    }}
                    onClick={() => setOpenNewAppointmentForm(true)}
                >
                    <Add />
                </Fab>
            </Tooltip>

            <NewCita
                open={openNewAppointmentForm}
                handleClose={() => setOpenNewAppointmentForm(false)}
                onAppointmentCreated={handleAppointmentCreated}
            />
            <EditCita
                open={openEditDialog}
                handleClose={() => setOpenEditDialog(false)}
                appointmentData={selectedCita}
                onUpdate={fetchCitas} // Esto recargará las citas después de editar
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