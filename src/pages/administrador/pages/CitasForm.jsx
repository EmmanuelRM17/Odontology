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
    Person
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
    };

    const handleNotificationClose = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    const handleAppointmentCreated = (newAppointment) => {
        setOpenNewAppointmentForm(false);
        fetchCitas(); // Vuelve a cargar la lista de citas después de agregar una nueva
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

    // Función para formatear la fecha
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            date.setHours(date.getHours() + 6); // 6 horas mas 
            return date.toLocaleString('es-MX', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
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
                                    <TableCell sx={{ color: '#0277BD', fontWeight: 'bold' }}>Odontólogo</TableCell>
                                    <TableCell sx={{ color: '#0277BD', fontWeight: 'bold' }}>Fecha Consulta</TableCell>
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
                                        .map((cita, index) => (
                                            <TableRow
                                                key={cita?.consulta_id || index}
                                                sx={{
                                                    height: '69px',
                                                    '&:hover': { backgroundColor: 'rgba(25,118,210,0.1)' },
                                                    transition: 'background-color 0.2s ease'
                                                }}
                                            >
                                                <TableCell sx={{ color: '#333' }}>{cita?.consulta_id || "N/A"}</TableCell>

                                                {/* Paciente */}
                                                <TableCell sx={{ color: '#333' }}>
                                                    {cita?.paciente_nombre ?
                                                        `${cita.paciente_nombre} ${cita.paciente_apellido_paterno || ''} ${cita.paciente_apellido_materno || ''}`.trim() :
                                                        "No registrado"}
                                                </TableCell>

                                                {/* Servicio */}
                                                <TableCell sx={{ color: '#333' }}>{cita?.servicio_nombre || "N/A"}</TableCell>

                                                {/* Odontólogo */}
                                                <TableCell sx={{ color: '#333' }}>{cita?.odontologo_nombre || "N/A"}</TableCell>

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

                                                        {/* 🛑 Cancelar Cita */}
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
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
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
                        <DialogTitle sx={{ backgroundColor: colors.primary, color: 'white' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Event sx={{ mr: 2 }} />
                                Detalles de la Cita #{selectedCita.consulta_id}
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
                                        <Typography><strong>Categoría:</strong> {selectedCita.categoria_servicio || "No especificada"}</Typography>
                                        <Typography><strong>Precio:</strong> ${selectedCita.precio_servicio || "0.00"}</Typography>
                                        <Typography><strong>Fecha de Consulta:</strong> {formatDate(selectedCita.fecha_consulta)}</Typography>
                                        <Typography><strong>Estado:</strong> {selectedCita.estado || "Pendiente"}</Typography>
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
                        color: colors.primary,
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