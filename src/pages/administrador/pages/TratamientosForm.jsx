import {
    Alert, AlertTitle,
    Box,
    Button,
    Card, CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, Grid,
    IconButton,
    LinearProgress,
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
    AssignmentTurnedIn,
    Cancel,
    CheckCircle,
    DateRange,
    EventAvailable, MedicalServices,
    Person,
    Visibility, EventBusy,
    Task,
    ChangeCircle,
    NotificationImportant, PeopleAlt
} from '@mui/icons-material';

import Notificaciones from '../../../components/Layout/Notificaciones';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

/**
 * Componente para gestionar tratamientos
 * 
 * Maneja los estados:
 * - "Pre-Registro": Para pacientes no registrados, pueden pasar a Pendiente o Activo
 * - "Pendiente": Para pacientes registrados, pendientes de activación
 * - "Activo": Tratamiento en curso
 * - "Finalizado": Tratamiento completado (todas las citas realizadas)
 * - "Abandonado": Tratamiento interrumpido
 */
const TratamientosForm = () => {
    const { isDarkTheme } = useThemeContext();
    const [openDialog, setOpenDialog] = useState(false);
    const [openNewTreatmentForm, setOpenNewTreatmentForm] = useState(false);
    const [selectedTratamiento, setSelectedTratamiento] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [tratamientos, setTratamientos] = useState([]);
    const [notification, setNotification] = useState({ open: false, message: '', type: '' });
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Estados para visualización de citas
    const [citasTratamiento, setCitasTratamiento] = useState([]);
    const [openCitasDialog, setOpenCitasDialog] = useState(false);
    const [isLoadingCitas, setIsLoadingCitas] = useState(false);

    // Estados para finalizar tratamiento
    const [openFinalizeDialog, setOpenFinalizeDialog] = useState(false);
    const [tratamientoToFinalize, setTratamientoToFinalize] = useState(null);
    const [finalizeNote, setFinalizeNote] = useState('');
    const [isFinalizing, setIsFinalizing] = useState(false);

    // Estados para abandonar tratamiento
    const [openAbandonDialog, setOpenAbandonDialog] = useState(false);
    const [tratamientoToAbandon, setTratamientoToAbandon] = useState(null);
    const [abandonReason, setAbandonReason] = useState('');
    const [isAbandoning, setIsAbandoning] = useState(false);

    // Estados para cambiar a pendiente
    const [openPendingDialog, setOpenPendingDialog] = useState(false);
    const [tratamientoToPending, setTratamientoToPending] = useState(null);
    const [pendingMessage, setPendingMessage] = useState('');
    const [isChangingToPending, setIsChangingToPending] = useState(false);

    // Estados para activar tratamiento
    const [openActivateDialog, setOpenActivateDialog] = useState(false);
    const [tratamientoToActivate, setTratamientoToActivate] = useState(null);
    const [activateMessage, setActivateMessage] = useState('');
    const [isActivating, setIsActivating] = useState(false);

    // Cargar tratamientos al iniciar
    useEffect(() => {
        // Cargar datos iniciales
        fetchTratamientos(true);

        // Variable para controlar si el componente está montado
        let estaMontado = true;

        // Actualizar cada 2 minutos en lugar de cada 15 segundos
        const intervalo = setInterval(() => {
            if (estaMontado) {
                // Actualización silenciosa (sin indicador de carga)
                fetchTratamientos(false);
            }
        }, 120000); // 2 minutos

        // Limpiar intervalo al desmontar
        return () => {
            estaMontado = false;
            clearInterval(intervalo);
        };
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
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#2196f3',
        purple: '#9C27B0',
    };

    const handleNotificationClose = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    const handleTreatmentCreated = () => {
        setOpenNewTreatmentForm(false);
        fetchTratamientos(); // Recargar la lista de tratamientos
        setNotification({
            open: true,
            message: 'Tratamiento creado con éxito',
            type: 'success'
        });
    };

    const sonDatosDiferentes = (nuevos, actuales) => {
        // Si las longitudes son diferentes, hay cambios
        if (!nuevos || !actuales || nuevos.length !== actuales.length) {
            return true;
        }

        // Comparar solo las propiedades clave para cada tratamiento
        for (let i = 0; i < nuevos.length; i++) {
            const nuevo = nuevos[i];

            // Buscar el tratamiento correspondiente por ID
            const actual = actuales.find(t => t.id === nuevo.id);

            // Si no se encuentra o hay cambios en propiedades clave
            if (!actual ||
                nuevo.estado !== actual.estado ||
                nuevo.citas_completadas !== actual.citas_completadas) {
                return true;
            }
        }

        // Si llegamos aquí, no hay cambios significativos
        return false;
    };

    // Función para obtener tratamientos
    const fetchTratamientos = useCallback(async (mostrarCarga = true) => {
        if (mostrarCarga) {
            setIsLoadingData(true);
        }

        try {
            // Usar timestamp para evitar caché pero sin headers adicionales
            const timestamp = new Date().getTime();
            const response = await fetch(`https://back-end-4803.onrender.com/api/tratamientos/all?t=${timestamp}`);

            if (!response.ok) throw new Error("Error al obtener los tratamientos");

            const data = await response.json();

            // Solo actualizar el estado si hay cambios significativos
            if (sonDatosDiferentes(data, tratamientos)) {
                console.log("Actualizando lista de tratamientos - cambios detectados");
                setTratamientos(data);
            } else {
                console.log("No hay cambios significativos en los tratamientos");
            }
        } catch (error) {
            console.error("Error cargando tratamientos:", error);
            if (tratamientos.length === 0) {
                setTratamientos([]);

                if (mostrarCarga) {
                    setNotification({
                        open: true,
                        message: 'Error al cargar los tratamientos.',
                        type: 'error',
                    });
                }
            }
        } finally {
            if (mostrarCarga) {
                setIsLoadingData(false);
            }
        }
    }, [tratamientos]);

    // Función para actualizar un tratamiento en el estado local
    const updateTratamientoLocally = (id, updatedData) => {
        setTratamientos(currentTratamientos =>
            currentTratamientos.map(tratamiento =>
                tratamiento.id === id
                    ? { ...tratamiento, ...updatedData, actualizado_en: new Date().toISOString() }
                    : tratamiento
            )
        );
    };

    // Función para ver detalles del tratamiento
    const handleViewDetails = (tratamiento) => {
        setSelectedTratamiento(tratamiento);
        setOpenDialog(true);
    };

    // Función para ver citas del tratamiento
    const handleViewCitas = async (tratamientoId) => {
        console.log("Solicitando citas del tratamiento ID:", tratamientoId);
        setIsLoadingCitas(true);
        try {
            const timestamp = new Date().getTime();
            const response = await fetch(`https://back-end-4803.onrender.com/api/tratamientos/${tratamientoId}/citas?t=${timestamp}`);
            if (!response.ok) throw new Error("Error al obtener citas");

            const responseText = await response.text();
            console.log("Respuesta textual citas:", responseText);

            try {
                const data = JSON.parse(responseText);
                console.log("Datos completos de citas:", data);
                setCitasTratamiento(data);
                setOpenCitasDialog(true);
            } catch (e) {
                console.error("Error al parsear JSON:", e);
            }
        } catch (error) {
            console.error("Error completo:", error);
            setNotification({
                open: true,
                message: "Error al cargar las citas del tratamiento: " + error.message,
                type: 'error'
            });
        } finally {
            setIsLoadingCitas(false);
        }
    };

    // Función para calcular el progreso del tratamiento
    const calcularPorcentajeProgreso = (tratamiento) => {
        if (!tratamiento || !tratamiento.total_citas_programadas) return 0;
        return Math.round((tratamiento.citas_completadas / tratamiento.total_citas_programadas) * 100);
    };

    // Función para formatear la fecha
    const formatDate = (dateString) => {
        if (!dateString) return "No definida";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (error) {
            console.error("Error formateando fecha:", error);
            return "Fecha inválida";
        }
    };

    // Función para obtener el color del estado
    const getStatusColor = (status) => {
        switch (status) {
            case "Pre-Registro": return colors.purple; // Color púrpura para Pre-Registro
            case "Pendiente": return colors.warning;   // Color naranja para Pendiente
            case "Activo": return colors.success;
            case "Finalizado": return colors.info;
            case "Abandonado": return colors.error;
            default: return colors.secondary;
        }
    };

    // Verificar si un tratamiento puede cambiar a pendiente
    const canChangeToPending = (tratamiento) => {
        return tratamiento.estado === 'Pre-Registro';
    };

    // Verificar si un tratamiento puede activarse
    const canActivateTreatment = (tratamiento) => {
        return tratamiento.estado === 'Pre-Registro' || tratamiento.estado === 'Pendiente';
    };

    // Verificar si un tratamiento se puede finalizar
    const canFinalizeTreatment = (tratamiento) => {
        return tratamiento.estado === 'Activo' &&
            tratamiento.citas_completadas >= tratamiento.total_citas_programadas;
    };

    // Verificar si un tratamiento se puede abandonar
    const canAbandonTreatment = (tratamiento) => {
        return tratamiento.estado === 'Activo';
    };

    // Función para marcar tratamiento como pendiente
    const openPendingConfirmation = (tratamiento) => {
        if (!canChangeToPending(tratamiento)) {
            setNotification({
                open: true,
                message: `No se puede marcar como pendiente un tratamiento en estado "${tratamiento.estado}"`,
                type: 'warning'
            });
            return;
        }

        setTratamientoToPending(tratamiento);
        setPendingMessage('');
        setOpenPendingDialog(true);
    };

    // Función para procesar cambio a pendiente
    const handleChangeToPending = async () => {
        if (!tratamientoToPending) return;

        setIsChangingToPending(true);
        try {
            const response = await fetch(`https://back-end-4803.onrender.com/api/tratamientos/updateStatus/${tratamientoToPending.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    estado: 'Pendiente',
                    notas: pendingMessage || 'Tratamiento marcado como pendiente para revisión adicional'
                }),
            });

            if (!response.ok) throw new Error("Error al actualizar el estado");

            // Actualizar localmente sin refrescar toda la tabla
            updateTratamientoLocally(tratamientoToPending.id, {
                estado: 'Pendiente',
                notas: pendingMessage
                    ? `${tratamientoToPending.notas ? tratamientoToPending.notas + '\n\n' : ''}${pendingMessage}`
                    : tratamientoToPending.notas
            });

            // Si es el tratamiento actualmente seleccionado, actualizarlo también
            if (selectedTratamiento && selectedTratamiento.id === tratamientoToPending.id) {
                setSelectedTratamiento(prevSelected => ({
                    ...prevSelected,
                    estado: 'Pendiente',
                    notas: pendingMessage
                        ? `${prevSelected.notas ? prevSelected.notas + '\n\n' : ''}${pendingMessage}`
                        : prevSelected.notas
                }));
            }

            setNotification({
                open: true,
                message: 'Tratamiento marcado como Pendiente',
                type: 'info'
            });

            setOpenPendingDialog(false);
            setTratamientoToPending(null);

        } catch (error) {
            console.error("Error al marcar como pendiente:", error);
            setNotification({
                open: true,
                message: 'Error al cambiar el estado del tratamiento',
                type: 'error'
            });
        } finally {
            setIsChangingToPending(false);
        }
    };

    // Función para abrir activación de tratamiento
    const openActivateConfirmation = (tratamiento) => {
        if (!canActivateTreatment(tratamiento)) {
            setNotification({
                open: true,
                message: `No se puede activar un tratamiento en estado "${tratamiento.estado}"`,
                type: 'warning'
            });
            return;
        }

        setTratamientoToActivate(tratamiento);
        setActivateMessage('');
        setOpenActivateDialog(true);
    };

    // Función para activar tratamiento
    const handleActivateTreatment = async () => {
        if (!tratamientoToActivate) return;

        setIsActivating(true);
        try {
            // Usamos confirmar si es Pendiente o updateStatus si es Pre-Registro
            const endpoint = tratamientoToActivate.estado === 'Pendiente'
                ? `https://back-end-4803.onrender.com/api/tratamientos/confirmar/${tratamientoToActivate.id}`
                : `https://back-end-4803.onrender.com/api/tratamientos/updateStatus/${tratamientoToActivate.id}`;

            const body = tratamientoToActivate.estado === 'Pendiente'
                ? { observaciones: activateMessage || 'Tratamiento activado' }
                : { estado: 'Activo', notas: activateMessage || 'Tratamiento activado' };

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error("Error al activar el tratamiento");

            const data = await response.json();

            // Actualizar localmente sin refrescar toda la tabla
            updateTratamientoLocally(tratamientoToActivate.id, {
                estado: 'Activo',
                notas: activateMessage
                    ? `${tratamientoToActivate.notas ? tratamientoToActivate.notas + '\n\n' : ''}${activateMessage}`
                    : tratamientoToActivate.notas
            });

            // Si es el tratamiento actualmente seleccionado, actualizarlo también
            if (selectedTratamiento && selectedTratamiento.id === tratamientoToActivate.id) {
                setSelectedTratamiento(prevSelected => ({
                    ...prevSelected,
                    estado: 'Activo',
                    notas: activateMessage
                        ? `${prevSelected.notas ? prevSelected.notas + '\n\n' : ''}${activateMessage}`
                        : prevSelected.notas
                }));
            }

            setNotification({
                open: true,
                message: data.message || 'Tratamiento activado correctamente. La primera cita ha sido confirmada.',
                type: 'success'
            });

            setOpenActivateDialog(false);
            setTratamientoToActivate(null);

        } catch (error) {
            console.error("Error al activar tratamiento:", error);
            setNotification({
                open: true,
                message: 'Error al activar el tratamiento',
                type: 'error'
            });
        } finally {
            setIsActivating(false);
        }
    };

    // Función para abrir diálogo de finalización
    const openFinalizeConfirmation = (tratamiento) => {
        if (!canFinalizeTreatment(tratamiento)) {
            setNotification({
                open: true,
                message: 'No se puede finalizar este tratamiento aún. Faltan citas por completar.',
                type: 'warning'
            });
            return;
        }

        setTratamientoToFinalize(tratamiento);
        setFinalizeNote('');
        setOpenFinalizeDialog(true);
    };

    // Función para manejar la finalización del tratamiento
    const handleFinalizeTreatment = async () => {
        if (!tratamientoToFinalize) return;

        setIsFinalizing(true);
        try {
            const response = await fetch(`https://back-end-4803.onrender.com/api/tratamientos/updateStatus/${tratamientoToFinalize.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    estado: 'Finalizado',
                    notas: finalizeNote ? `${tratamientoToFinalize.notas ? tratamientoToFinalize.notas + '\n\n' : ''}[FINALIZACIÓN]: ${finalizeNote}` : tratamientoToFinalize.notas
                }),
            });

            if (!response.ok) throw new Error("Error al finalizar el tratamiento");

            // Actualizar localmente sin refrescar toda la tabla
            const nuevasNotas = finalizeNote
                ? `${tratamientoToFinalize.notas ? tratamientoToFinalize.notas + '\n\n' : ''}[FINALIZACIÓN]: ${finalizeNote}`
                : tratamientoToFinalize.notas;

            updateTratamientoLocally(tratamientoToFinalize.id, {
                estado: 'Finalizado',
                notas: nuevasNotas
            });

            // Si es el tratamiento actualmente seleccionado, actualizarlo también
            if (selectedTratamiento && selectedTratamiento.id === tratamientoToFinalize.id) {
                setSelectedTratamiento(prevSelected => ({
                    ...prevSelected,
                    estado: 'Finalizado',
                    notas: nuevasNotas
                }));
            }

            setNotification({
                open: true,
                message: 'Tratamiento finalizado exitosamente',
                type: 'success'
            });

            setOpenFinalizeDialog(false);
            setTratamientoToFinalize(null);

        } catch (error) {
            console.error("Error al finalizar el tratamiento:", error);
            setNotification({
                open: true,
                message: 'Error al finalizar el tratamiento',
                type: 'error'
            });
        } finally {
            setIsFinalizing(false);
        }
    };

    // Función para abrir diálogo de abandono
    const openAbandonConfirmation = (tratamiento) => {
        if (!canAbandonTreatment(tratamiento)) {
            setNotification({
                open: true,
                message: 'No se puede abandonar este tratamiento porque ya fue finalizado o abandonado.',
                type: 'warning'
            });
            return;
        }

        setTratamientoToAbandon(tratamiento);
        setAbandonReason('');
        setOpenAbandonDialog(true);
    };

    // Función para manejar el abandono del tratamiento
    const handleAbandonTreatment = async () => {
        if (!tratamientoToAbandon || !abandonReason) return;

        setIsAbandoning(true);
        try {
            const response = await fetch(`https://back-end-4803.onrender.com/api/tratamientos/updateStatus/${tratamientoToAbandon.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    estado: 'Abandonado',
                    notas: `${tratamientoToAbandon.notas ? tratamientoToAbandon.notas + '\n\n' : ''}[ABANDONADO]: ${abandonReason}`
                }),
            });

            if (!response.ok) throw new Error("Error al abandonar el tratamiento");

            // Actualizar localmente sin refrescar toda la tabla
            const nuevasNotas = `${tratamientoToAbandon.notas ? tratamientoToAbandon.notas + '\n\n' : ''}[ABANDONADO]: ${abandonReason}`;

            updateTratamientoLocally(tratamientoToAbandon.id, {
                estado: 'Abandonado',
                notas: nuevasNotas
            });

            // Si es el tratamiento actualmente seleccionado, actualizarlo también
            if (selectedTratamiento && selectedTratamiento.id === tratamientoToAbandon.id) {
                setSelectedTratamiento(prevSelected => ({
                    ...prevSelected,
                    estado: 'Abandonado',
                    notas: nuevasNotas
                }));
            }

            setNotification({
                open: true,
                message: 'Tratamiento marcado como abandonado. Todas las citas pendientes han sido canceladas.',
                type: 'warning'
            });

            setOpenAbandonDialog(false);
            setTratamientoToAbandon(null);

        } catch (error) {
            console.error("Error al abandonar el tratamiento:", error);
            setNotification({
                open: true,
                message: 'Error al abandonar el tratamiento',
                type: 'error'
            });
        } finally {
            setIsAbandoning(false);
        }
    };

    // Función para verificar si un paciente está registrado
    const isPacienteRegistrado = (tratamiento) => {
        return tratamiento && tratamiento.paciente_id !== null;
    };

    // Función para calcular días restantes
    const calcularDiasRestantes = (fechaFin) => {
        if (!fechaFin) return "No definida";

        const hoy = new Date();
        const fin = new Date(fechaFin);

        // Si la fecha ya pasó
        if (fin < hoy) {
            const diasPasados = Math.ceil((hoy - fin) / (1000 * 60 * 60 * 24));
            return `Vencido (${diasPasados} días)`;
        }

        // Si la fecha es en el futuro
        const diasRestantes = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
        return `${diasRestantes} días`;
    };

    // Descripción de estados del flujo de trabajo
    const estadosDescripcion = {
        'Pre-Registro': 'Tratamiento para paciente no registrado. Se debe registrar al paciente o marcar como pendiente.',
        'Pendiente': 'Tratamiento pendiente de activación.',
        'Activo': 'Tratamiento en curso, con citas programadas.',
        'Finalizado': 'Tratamiento completado exitosamente.',
        'Abandonado': 'Tratamiento interrumpido antes de su finalización.'
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
                        <MedicalServices sx={{ fontSize: 40, verticalAlign: 'middle', mr: 2 }} />
                        Gestión de Tratamientos
                    </Typography>

                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" color={colors.secondary}>
                            Administre los tratamientos de larga duración que requieren múltiples citas
                        </Typography>
                        <TextField
                            variant="outlined"
                            placeholder="Buscar tratamiento..."
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ width: { xs: '100%', sm: '300px' } }}
                        />

                    </Box>

                    {/* Leyenda de estados */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'flex-end',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        flexWrap: 'wrap',
                        mb: 2,
                        p: 1,
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px'
                    }}>
                        <Typography variant="body2" sx={{ mr: 3, fontWeight: 'medium', mb: { xs: 1, sm: 0 } }}>
                            Estados:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Tooltip title={estadosDescripcion['Pre-Registro']} arrow>
                                <Chip label="Pre-Registro" size="small" sx={{ bgcolor: colors.purple, color: 'white' }} />
                            </Tooltip>
                            <Tooltip title={estadosDescripcion['Pendiente']} arrow>
                                <Chip label="Pendiente" size="small" sx={{ bgcolor: colors.warning, color: 'white' }} />
                            </Tooltip>
                            <Tooltip title={estadosDescripcion['Activo']} arrow>
                                <Chip label="Activo" size="small" sx={{ bgcolor: colors.success, color: 'white' }} />
                            </Tooltip>
                            <Tooltip title={estadosDescripcion['Finalizado']} arrow>
                                <Chip label="Finalizado" size="small" sx={{ bgcolor: colors.info, color: 'white' }} />
                            </Tooltip>
                            <Tooltip title={estadosDescripcion['Abandonado']} arrow>
                                <Chip label="Abandonado" size="small" sx={{ bgcolor: colors.error, color: 'white' }} />
                            </Tooltip>
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
                                    <TableCell sx={{ color: '#0277BD', fontWeight: 'bold' }}>Tratamiento</TableCell>
                                    <TableCell sx={{ color: '#0277BD', fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Inicio</TableCell>
                                    <TableCell sx={{ color: '#0277BD', fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Fin Estimado</TableCell>
                                    <TableCell sx={{ color: '#0277BD', fontWeight: 'bold' }}>Progreso</TableCell>
                                    <TableCell sx={{ color: '#0277BD', fontWeight: 'bold' }}>Estado</TableCell>
                                    <TableCell sx={{ color: '#0277BD', fontWeight: 'bold' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>

                            {/* Cuerpo de la tabla */}
                            <TableBody>
                                {isLoadingData ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            <LinearProgress sx={{ my: 2 }} />
                                            <Typography>Cargando tratamientos...</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : tratamientos.length > 0 ? (
                                    tratamientos
                                        .filter(tratamiento =>
                                            (tratamiento.paciente_id && tratamiento.paciente_id.toString().includes(searchQuery)) ||
                                            (tratamiento.nombre_tratamiento && tratamiento.nombre_tratamiento.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                            (tratamiento.paciente_nombre && tratamiento.paciente_nombre.toLowerCase().includes(searchQuery.toLowerCase()))
                                        )
                                        .map((tratamiento) => {
                                            const porcentajeProgreso = calcularPorcentajeProgreso(tratamiento);
                                            const diasRestantes = calcularDiasRestantes(tratamiento.fecha_estimada_fin);
                                            const esRegistrado = isPacienteRegistrado(tratamiento);

                                            return (
                                                <TableRow
                                                    key={tratamiento.id}
                                                    sx={{
                                                        height: '69px',
                                                        '&:hover': { backgroundColor: 'rgba(25,118,210,0.1)' },
                                                        transition: 'background-color 0.2s ease',
                                                        position: 'relative',
                                                        // Barra de color a la izquierda según tipo de paciente
                                                        borderLeft: `4px solid ${esRegistrado ? '#4caf50' : '#ff9800'}`
                                                    }}
                                                >
                                                    <TableCell>{tratamiento.id}</TableCell>

                                                    {/* Paciente */}
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Person sx={{ color: colors.primary, mr: 1, fontSize: 18 }} />
                                                            <Box>
                                                                <Typography variant="body2">
                                                                    {tratamiento.paciente_nombre} {tratamiento.paciente_apellido_paterno || ''} {tratamiento.paciente_apellido_materno || ''}
                                                                </Typography>
                                                                {!esRegistrado && (
                                                                    <Chip
                                                                        label="No registrado"
                                                                        size="small"
                                                                        sx={{
                                                                            fontSize: '0.7rem',
                                                                            height: 20,
                                                                            backgroundColor: '#FFF3E0',
                                                                            color: '#E65100',
                                                                            mt: 0.5
                                                                        }}
                                                                    />
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </TableCell>

                                                    {/* Nombre del tratamiento */}
                                                    <TableCell>
                                                        <Typography fontWeight="medium">
                                                            {tratamiento.nombre_tratamiento}
                                                        </Typography>
                                                        {tratamiento.categoria_servicio && (
                                                            <Typography variant="caption" color="textSecondary">
                                                                {tratamiento.categoria_servicio}
                                                            </Typography>
                                                        )}
                                                    </TableCell>

                                                    {/* Fecha inicio */}
                                                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                                        {formatDate(tratamiento.fecha_inicio)}
                                                    </TableCell>

                                                    {/* Fecha fin estimada */}
                                                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            {formatDate(tratamiento.fecha_estimada_fin)}
                                                            <Tooltip title={`Días restantes: ${diasRestantes}`}>
                                                                <DateRange sx={{ ml: 1, fontSize: 16, color: colors.secondary }} />
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>

                                                    {/* Progreso */}
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                            <Box sx={{ width: '70%', mr: 1 }}>
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={porcentajeProgreso}
                                                                    sx={{
                                                                        height: 8,
                                                                        borderRadius: 5,
                                                                        bgcolor: 'rgba(0,0,0,0.1)',
                                                                        '& .MuiLinearProgress-bar': {
                                                                            bgcolor: porcentajeProgreso === 100 ? colors.success : colors.info
                                                                        }
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Typography variant="caption">
                                                                {tratamiento.citas_completadas}/{tratamiento.total_citas_programadas}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>

                                                    {/* Estado */}
                                                    <TableCell>
                                                        <Tooltip title={estadosDescripcion[tratamiento.estado] || ''} arrow>
                                                            <Chip
                                                                label={tratamiento.estado || "Pre-Registro"}
                                                                sx={{
                                                                    backgroundColor: getStatusColor(tratamiento.estado),
                                                                    color: '#FFF',
                                                                    fontWeight: '500',
                                                                    fontSize: '0.875rem',
                                                                    height: '28px',
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    </TableCell>

                                                    {/* Acciones */}
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                                                            {/* Ver Detalles (siempre visible) */}
                                                            <Tooltip title="Ver detalles" arrow>
                                                                <IconButton
                                                                    onClick={() => handleViewDetails(tratamiento)}
                                                                    sx={{
                                                                        backgroundColor: '#0288d1',
                                                                        '&:hover': { backgroundColor: '#0277bd' },
                                                                        padding: '8px',
                                                                        borderRadius: '50%',
                                                                    }}
                                                                >
                                                                    <Visibility sx={{ color: 'white', fontSize: 20 }} />
                                                                </IconButton>
                                                            </Tooltip>

                                                            {/* Botón para marcar como pendiente (solo si está en Pre-Registro) */}
                                                            {canChangeToPending(tratamiento) && (
                                                                <Tooltip title="Marcar como pendiente" arrow>
                                                                    <IconButton
                                                                        onClick={() => openPendingConfirmation(tratamiento)}
                                                                        sx={{
                                                                            backgroundColor: '#FF9800',
                                                                            '&:hover': { backgroundColor: '#F57C00' },
                                                                            padding: '8px',
                                                                            borderRadius: '50%',
                                                                        }}
                                                                    >
                                                                        <ChangeCircle sx={{ color: 'white', fontSize: 20 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}

                                                            {/* Botón para activar tratamiento (solo si está en Pre-Registro o Pendiente) */}
                                                            {canActivateTreatment(tratamiento) && (
                                                                <Tooltip title="Activar tratamiento" arrow>
                                                                    <IconButton
                                                                        onClick={() => openActivateConfirmation(tratamiento)}
                                                                        sx={{
                                                                            backgroundColor: '#673AB7',
                                                                            '&:hover': { backgroundColor: '#512DA8' },
                                                                            padding: '8px',
                                                                            borderRadius: '50%',
                                                                        }}
                                                                    >
                                                                        <CheckCircle sx={{ color: 'white', fontSize: 20 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}

                                                            {/* Finalizar Tratamiento (si es posible) */}
                                                            {canFinalizeTreatment(tratamiento) && (
                                                                <Tooltip title="Finalizar tratamiento" arrow>
                                                                    <IconButton
                                                                        onClick={() => openFinalizeConfirmation(tratamiento)}
                                                                        sx={{
                                                                            backgroundColor: '#4caf50',
                                                                            '&:hover': { backgroundColor: '#388e3c' },
                                                                            padding: '8px',
                                                                            borderRadius: '50%',
                                                                        }}
                                                                    >
                                                                        <AssignmentTurnedIn sx={{ color: 'white', fontSize: 20 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}

                                                            {/* Abandonar Tratamiento (si es posible) */}
                                                            {canAbandonTreatment(tratamiento) && (
                                                                <Tooltip title="Abandonar tratamiento" arrow>
                                                                    <IconButton
                                                                        onClick={() => openAbandonConfirmation(tratamiento)}
                                                                        sx={{
                                                                            backgroundColor: '#f44336',
                                                                            '&:hover': { backgroundColor: '#d32f2f' },
                                                                            padding: '8px',
                                                                            borderRadius: '50%',
                                                                        }}
                                                                    >
                                                                        <EventBusy sx={{ color: 'white', fontSize: 20 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}

                                                            {/* Ver Citas (siempre visible para tratamientos) */}
                                                            <Tooltip title="Ver citas asociadas" arrow>
                                                                <IconButton
                                                                    onClick={() => handleViewCitas(tratamiento.id)}
                                                                    sx={{
                                                                        backgroundColor: '#2196F3',
                                                                        '&:hover': { backgroundColor: '#1976D2' },
                                                                        padding: '8px',
                                                                        borderRadius: '50%',
                                                                    }}
                                                                >
                                                                    <EventAvailable sx={{ color: 'white', fontSize: 20 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            <Typography color="textSecondary">No hay tratamientos disponibles</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Diálogo de detalles del tratamiento */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedTratamiento && (
                    <>
                        <DialogTitle sx={{
                            backgroundColor: getStatusColor(selectedTratamiento.estado),
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <MedicalServices sx={{ mr: 2 }} />
                                Detalles del Tratamiento #{selectedTratamiento.id}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {!isPacienteRegistrado(selectedTratamiento) && (
                                    <Chip
                                        icon={<PeopleAlt style={{ color: '#E65100' }} />}
                                        label="Paciente No Registrado"
                                        size="small"
                                        sx={{
                                            backgroundColor: '#FFF3E0',
                                            color: '#E65100',
                                            fontWeight: 'bold',
                                            mr: 1
                                        }}
                                    />
                                )}
                                <Tooltip title={estadosDescripcion[selectedTratamiento.estado] || ''} arrow>
                                    <Chip
                                        label={selectedTratamiento.estado}
                                        size="small"
                                        sx={{
                                            backgroundColor: 'white',
                                            color: getStatusColor(selectedTratamiento.estado),
                                            fontWeight: 'bold',
                                            border: `1px solid ${getStatusColor(selectedTratamiento.estado)}`
                                        }}
                                    />
                                </Tooltip>
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
                                        <Typography><strong>Nombre:</strong> {selectedTratamiento.paciente_nombre} {selectedTratamiento.paciente_apellido_paterno || ''} {selectedTratamiento.paciente_apellido_materno || ''}</Typography>
                                        <Typography>
                                            <strong>Estatus:</strong> {isPacienteRegistrado(selectedTratamiento) ? (
                                                <Chip label="Registrado" size="small" sx={{
                                                    bgcolor: '#E8F5E9',
                                                    color: '#2E7D32',
                                                    fontWeight: 'medium',
                                                    fontSize: '0.7rem',
                                                    height: 20,
                                                    ml: 1
                                                }} />
                                            ) : (
                                                <Chip label="No Registrado (Pre-Registro)" size="small" sx={{
                                                    bgcolor: '#FFF3E0',
                                                    color: '#E65100',
                                                    fontWeight: 'medium',
                                                    fontSize: '0.7rem',
                                                    height: 20,
                                                    ml: 1
                                                }} />
                                            )}
                                        </Typography>
                                        <Typography><strong>ID:</strong> {
                                            isPacienteRegistrado(selectedTratamiento) ?
                                                `Paciente #${selectedTratamiento.paciente_id}` :
                                                `Pre-Registro #${selectedTratamiento.pre_registro_id}`
                                        }</Typography>
                                    </Box>
                                </Grid>

                                {/* Información del Tratamiento */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" color={colors.primary}>
                                        <MedicalServices sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Información del Tratamiento
                                    </Typography>
                                    <Box sx={{ ml: 4, mt: 1 }}>
                                        <Typography><strong>Tipo:</strong> {selectedTratamiento.nombre_tratamiento}</Typography>
                                        <Typography><strong>Servicio ID:</strong> {selectedTratamiento.servicio_id}</Typography>
                                        <Typography><strong>Categoría:</strong> {selectedTratamiento.categoria_servicio || "No especificada"}</Typography>
                                        <Typography><strong>Odontólogo:</strong> {selectedTratamiento.odontologo_nombre || "No asignado"}</Typography>
                                        <Typography><strong>Costo Total:</strong> ${parseFloat(selectedTratamiento.costo_total || 0).toFixed(2)}</Typography>
                                    </Box>
                                </Grid>

                                {/* Fechas y progreso */}
                                <Grid item xs={12}>
                                    <Box sx={{ my: 2, height: '1px', bgcolor: 'divider' }} />
                                    <Typography variant="h6" color={colors.primary}>
                                        <DateRange sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Fechas y Progreso
                                    </Typography>

                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        <Grid item xs={12} md={4}>
                                            <Paper elevation={2} sx={{ p: 2, borderLeft: `4px solid ${colors.info}` }}>
                                                <Typography variant="body2" color="textSecondary">Fecha de Inicio</Typography>
                                                <Typography variant="h6">{formatDate(selectedTratamiento.fecha_inicio)}</Typography>
                                            </Paper>
                                        </Grid>

                                        <Grid item xs={12} md={4}>
                                            <Paper elevation={2} sx={{ p: 2, borderLeft: `4px solid ${colors.warning}` }}>
                                                <Typography variant="body2" color="textSecondary">Fecha Estimada de Fin</Typography>
                                                <Typography variant="h6">{formatDate(selectedTratamiento.fecha_estimada_fin)}</Typography>
                                                <Typography variant="caption" color={colors.warning}>
                                                    {calcularDiasRestantes(selectedTratamiento.fecha_estimada_fin)}
                                                </Typography>
                                            </Paper>
                                        </Grid>

                                        <Grid item xs={12} md={4}>
                                            <Paper elevation={2} sx={{ p: 2, borderLeft: `4px solid ${colors.success}` }}>
                                                <Typography variant="body2" color="textSecondary">Progreso de Citas</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                    <Typography variant="h6" mr={1}>
                                                        {selectedTratamiento.citas_completadas}/{selectedTratamiento.total_citas_programadas}
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={calcularPorcentajeProgreso(selectedTratamiento)}
                                                        sx={{
                                                            width: '40%',
                                                            height: 10,
                                                            borderRadius: 5,
                                                            ml: 1
                                                        }}
                                                    />
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                {/* Notas del tratamiento */}
                                <Grid item xs={12}>
                                    <Box sx={{ my: 2, height: '1px', bgcolor: 'divider' }} />
                                    <Typography variant="h6" color={colors.primary} gutterBottom>
                                        <Task sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Notas del Tratamiento
                                    </Typography>
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 2,
                                            bgcolor: '#f9f9f9',
                                            minHeight: '100px',
                                            whiteSpace: 'pre-line' // Para preservar saltos de línea
                                        }}
                                    >
                                        {selectedTratamiento.notas || "Sin notas adicionales para este tratamiento."}
                                    </Paper>
                                </Grid>

                                {/* Historial de cambios (podría expandirse en el futuro) */}
                                <Grid item xs={12}>
                                    <Box sx={{ my: 2, height: '1px', bgcolor: 'divider' }} />
                                    <Typography variant="h6" color={colors.primary} gutterBottom>
                                        <EventAvailable sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Fechas Importantes
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <Typography><strong>Creado en:</strong> {formatDate(selectedTratamiento.creado_en)}</Typography>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography><strong>Última actualización:</strong> {formatDate(selectedTratamiento.actualizado_en)}</Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </DialogContent>

                        <DialogActions>
                            <Button
                                onClick={() => setOpenDialog(false)}
                                variant="outlined"
                                color="primary"
                            >
                                Cerrar
                            </Button>

                            {/* Ver citas asociadas al tratamiento */}
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<EventAvailable />}
                                onClick={() => handleViewCitas(selectedTratamiento.id)}
                            >
                                Ver Citas Asociadas
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Diálogo para mostrar citas asociadas */}
            <Dialog
                open={openCitasDialog}
                onClose={() => setOpenCitasDialog(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{
                    backgroundColor: colors.info,
                    color: 'white',
                }}>
                    <EventAvailable sx={{ mr: 2 }} />
                    Citas asociadas al Tratamiento #{selectedTratamiento?.id}
                </DialogTitle>

                <DialogContent>
                    {isLoadingCitas ? (
                        <Box sx={{ width: '100%', mt: 3, textAlign: 'center' }}>
                            <LinearProgress sx={{ mb: 2 }} />
                            <Typography>Cargando citas asociadas...</Typography>
                        </Box>
                    ) : (
                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>Número de Cita</TableCell>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell>Estado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {citasTratamiento.length > 0 ? (
                                        citasTratamiento.map((cita) => (
                                            <TableRow key={cita.consulta_id}>
                                                <TableCell>{cita.consulta_id}</TableCell>
                                                <TableCell>{cita.numero_cita_tratamiento}</TableCell>
                                                <TableCell>{formatDate(cita.fecha_consulta)}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={cita.estado}
                                                        sx={{
                                                            backgroundColor: getStatusColor(cita.estado === 'Confirmada' ? 'Activo' : cita.estado),
                                                            color: 'white'
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                No hay citas asociadas a este tratamiento
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpenCitasDialog(false)}>
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Diálogo para marcar como pendiente */}
            <Dialog
                open={openPendingDialog}
                onClose={() => !isChangingToPending && setOpenPendingDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderTop: `5px solid ${colors.warning}`,
                        borderRadius: '4px',
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: colors.warning
                }}>
                    <NotificationImportant sx={{ mr: 1 }} />
                    Marcar Tratamiento como Pendiente
                </DialogTitle>

                <DialogContent>
                    <Typography variant="h6" gutterBottom>
                        ¿Deseas marcar este tratamiento como pendiente para revisión adicional?
                    </Typography>

                    {tratamientoToPending && (
                        <Box sx={{ mb: 3 }}>
                            <Typography><strong>Tratamiento:</strong> {tratamientoToPending.nombre_tratamiento}</Typography>
                            <Typography><strong>Paciente:</strong> {tratamientoToPending.paciente_nombre} {tratamientoToPending.paciente_apellido_paterno || ''} {tratamientoToPending.paciente_apellido_materno || ''}</Typography>
                            <Typography><strong>Estado actual:</strong> {tratamientoToPending.estado}</Typography>
                        </Box>
                    )}

                    <TextField
                        label="Mensaje o indicaciones"
                        multiline
                        rows={4}
                        fullWidth
                        value={pendingMessage}
                        onChange={(e) => setPendingMessage(e.target.value)}
                        placeholder="Indique por qué se marca como pendiente o qué se necesita revisar..."
                        variant="outlined"
                    />

                    <Alert severity="info" sx={{ mt: 2 }}>
                        <AlertTitle>Información</AlertTitle>
                        Al marcar como pendiente, el tratamiento queda en espera para confirmar posteriormente.
                        El odontólogo deberá revisar o solicitar más información antes de activarlo.
                    </Alert>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setOpenPendingDialog(false)}
                        color="inherit"
                        disabled={isChangingToPending}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleChangeToPending}
                        variant="contained"
                        sx={{ bgcolor: colors.warning }}
                        disabled={isChangingToPending}
                    >
                        {isChangingToPending ? 'Procesando...' : 'Marcar como Pendiente'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo para activar tratamiento */}
            <Dialog
                open={openActivateDialog}
                onClose={() => !isActivating && setOpenActivateDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderTop: `5px solid ${colors.purple}`,
                        borderRadius: '4px',
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: colors.purple
                }}>
                    <CheckCircle sx={{ mr: 1 }} />
                    Activar Tratamiento
                </DialogTitle>

                <DialogContent>
                    <Typography variant="h6" gutterBottom>
                        ¿Confirmar y activar este tratamiento?
                    </Typography>

                    {tratamientoToActivate && (
                        <Box sx={{ mb: 3 }}>
                            <Typography><strong>Tratamiento:</strong> {tratamientoToActivate.nombre_tratamiento}</Typography>
                            <Typography><strong>Paciente:</strong> {tratamientoToActivate.paciente_nombre} {tratamientoToActivate.paciente_apellido_paterno || ''} {tratamientoToActivate.paciente_apellido_materno || ''}</Typography>
                            <Typography><strong>Estado actual:</strong> {tratamientoToActivate.estado}</Typography>
                            <Typography><strong>Duración planeada:</strong> {tratamientoToActivate.total_citas_programadas} citas</Typography>
                        </Box>
                    )}

                    <TextField
                        label="Mensaje de activación"
                        multiline
                        rows={3}
                        fullWidth
                        value={activateMessage}
                        onChange={(e) => setActivateMessage(e.target.value)}
                        placeholder="Añada notas o indicaciones sobre la activación del tratamiento..."
                        variant="outlined"
                    />

                    <Alert severity="success" sx={{ mt: 2 }}>
                        <AlertTitle>Importante</AlertTitle>
                        Al activar el tratamiento, se confirmará la primera cita y se podrán programar las citas restantes.
                        El sistema automáticamente actualizará el estado de la primera cita a "Confirmada".
                    </Alert>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setOpenActivateDialog(false)}
                        color="inherit"
                        disabled={isActivating}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleActivateTreatment}
                        variant="contained"
                        sx={{ bgcolor: colors.purple, '&:hover': { bgcolor: '#7B1FA2' } }}
                        disabled={isActivating}
                    >
                        {isActivating ? 'Procesando...' : 'Activar Tratamiento'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo para finalizar tratamiento */}
            <Dialog
                open={openFinalizeDialog}
                onClose={() => !isFinalizing && setOpenFinalizeDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderTop: `5px solid ${colors.success}`,
                        borderRadius: '4px',
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: colors.success
                }}>
                    <CheckCircle sx={{ mr: 1 }} />
                    Finalizar Tratamiento
                </DialogTitle>

                <DialogContent>
                    <Typography variant="h6" gutterBottom>
                        ¿Estás seguro de finalizar el tratamiento #{tratamientoToFinalize?.id}?
                    </Typography>

                    {tratamientoToFinalize && (
                        <Box sx={{ mb: 3 }}>
                            <Typography><strong>Tratamiento:</strong> {tratamientoToFinalize.nombre_tratamiento}</Typography>
                            <Typography><strong>Paciente:</strong> {tratamientoToFinalize.paciente_nombre} {tratamientoToFinalize.paciente_apellido_paterno || ''} {tratamientoToFinalize.paciente_apellido_materno || ''}</Typography>
                            <Typography><strong>Progreso:</strong> {tratamientoToFinalize.citas_completadas}/{tratamientoToFinalize.total_citas_programadas} citas</Typography>
                        </Box>
                    )}

                    <TextField
                        label="Notas de finalización"
                        multiline
                        rows={4}
                        fullWidth
                        value={finalizeNote}
                        onChange={(e) => setFinalizeNote(e.target.value)}
                        placeholder="Ingrese cualquier observación sobre la finalización del tratamiento..."
                        variant="outlined"
                    />

                    <Alert severity="info" sx={{ mt: 2 }}>
                        <AlertTitle>Información</AlertTitle>
                        Al finalizar el tratamiento, este quedará registrado como completado y no se podrán agregar más citas.
                    </Alert>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setOpenFinalizeDialog(false)}
                        color="inherit"
                        disabled={isFinalizing}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleFinalizeTreatment}
                        variant="contained"
                        color="success"
                        disabled={isFinalizing}
                    >
                        {isFinalizing ? 'Procesando...' : 'Confirmar Finalización'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo para abandonar tratamiento */}
            <Dialog
                open={openAbandonDialog}
                onClose={() => !isAbandoning && setOpenAbandonDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderTop: `5px solid ${colors.error}`,
                        borderRadius: '4px',
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: colors.error
                }}>
                    <Cancel sx={{ mr: 1 }} />
                    Abandonar Tratamiento
                </DialogTitle>

                <DialogContent>
                    <Typography variant="h6" gutterBottom>
                        ¿Estás seguro de marcar como abandonado el tratamiento #{tratamientoToAbandon?.id}?
                    </Typography>

                    {tratamientoToAbandon && (
                        <Box sx={{ mb: 3 }}>
                            <Typography><strong>Tratamiento:</strong> {tratamientoToAbandon.nombre_tratamiento}</Typography>
                            <Typography><strong>Paciente:</strong> {tratamientoToAbandon.paciente_nombre} {tratamientoToAbandon.paciente_apellido_paterno || ''} {tratamientoToAbandon.paciente_apellido_materno || ''}</Typography>
                            <Typography><strong>Progreso actual:</strong> {tratamientoToAbandon.citas_completadas}/{tratamientoToAbandon.total_citas_programadas} citas</Typography>
                        </Box>
                    )}

                    <TextField
                        label="Motivo del abandono"
                        multiline
                        rows={4}
                        fullWidth
                        required
                        value={abandonReason}
                        onChange={(e) => setAbandonReason(e.target.value)}
                        placeholder="Especifique el motivo por el cual el paciente abandona el tratamiento..."
                        variant="outlined"
                        error={!abandonReason && openAbandonDialog}
                        helperText={!abandonReason && openAbandonDialog ? "Este campo es obligatorio" : ""}
                    />

                    <Alert severity="warning" sx={{ mt: 2 }}>
                        <AlertTitle>Aviso Importante</AlertTitle>
                        Al marcar un tratamiento como abandonado, se cancelarán todas las citas futuras asociadas a este tratamiento.
                    </Alert>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setOpenAbandonDialog(false)}
                        color="inherit"
                        disabled={isAbandoning}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleAbandonTreatment}
                        variant="contained"
                        color="error"
                        disabled={isAbandoning || !abandonReason}
                    >
                        {isAbandoning ? 'Procesando...' : 'Confirmar Abandono'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notificaciones */}
            <Notificaciones
                open={notification.open}
                message={notification.message}
                type={notification.type}
                onClose={handleNotificationClose}
            />
        </Box>
    );
};

export default TratamientosForm;