import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    Stack,
    CircularProgress,
    alpha,
    Divider,
    Grid,
    Fade,
    IconButton,
    Chip,
    Switch,
    FormControlLabel,
    InputAdornment,
    MenuItem,
    Paper,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
    Search as SearchIcon,
    LocalHospital as ServiceIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    Stars as StarsIcon,
    FilterList as FilterIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'https://back-end-4803.onrender.com/api/gamificacion';

const FORM_EDIT_INICIAL = { puntos: 10, estado: 1 };
const FORM_ASIGNAR_INICIAL = { id_servicio: '', puntos: 10 };

// Hook custom para peticiones con timeout
const useApiRequest = (showNotif) => {
    const ejecutarPeticion = useCallback(async (peticion, mensajeExito) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const resultado = await peticion(controller.signal);
            
            clearTimeout(timeoutId);
            if (mensajeExito) showNotif(mensajeExito, 'success');
            return { exito: true, data: resultado };
        } catch (error) {
            if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
                showNotif('Tiempo de espera agotado. Intenta nuevamente.', 'error');
            } else if (error.response?.status !== 404) {
                showNotif(error.response?.data?.error || 'Error en la operación', 'error');
            }
            return { exito: false, error };
        }
    }, [showNotif]);

    return ejecutarPeticion;
};

// Componente de card de servicio memoizado
const ServicioCard = memo(({ servicio, colors, onEdit, onDelete }) => (
    <Card
        elevation={0}
        sx={{
            background: colors.paper,
            borderRadius: '20px',
            border: `1px solid ${colors.border}`,
            boxShadow: colors.shadow,
            height: '100%',
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 24px ${alpha(colors.primary, 0.15)}`
            }
        }}
    >
        <CardContent sx={{ p: 2.5 }}>
            <Box display="flex" justifyContent="space-between" alignItems="start" mb={1.5}>
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        background: colors.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <ServiceIcon sx={{ color: 'white', fontSize: 22 }} />
                </Box>
                <Chip
                    icon={servicio.estado === 1 ? <CheckIcon sx={{ fontSize: 14 }} /> : <CancelIcon sx={{ fontSize: 14 }} />}
                    label={servicio.estado === 1 ? 'Activo' : 'Inactivo'}
                    size="small"
                    sx={{
                        background: servicio.estado === 1 ? alpha(colors.success, 0.1) : alpha(colors.error, 0.1),
                        color: servicio.estado === 1 ? colors.success : colors.error,
                        fontWeight: 600,
                        border: `1px solid ${servicio.estado === 1 ? alpha(colors.success, 0.3) : alpha(colors.error, 0.3)}`,
                        height: 28
                    }}
                />
            </Box>

            <Typography variant="h6" fontWeight={700} color={colors.text} mb={0.5} noWrap>
                {servicio.nombre_servicio}
            </Typography>

            <Typography
                variant="body2"
                color={colors.secondaryText}
                mb={1.5}
                sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: 36
                }}
            >
                {servicio.descripcion_servicio || 'Sin descripción'}
            </Typography>

            <Paper
                elevation={0}
                sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    background: alpha(colors.primary, 0.05),
                    border: `1px solid ${alpha(colors.primary, 0.2)}`,
                    mb: 1.5
                }}
            >
                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                    <StarsIcon sx={{ color: colors.primary, fontSize: 18 }} />
                    <Typography variant="h5" fontWeight={700} color={colors.primary}>
                        {servicio.puntos}
                    </Typography>
                    <Typography variant="body2" color={colors.secondaryText} fontWeight={600}>
                        puntos
                    </Typography>
                </Box>
            </Paper>

            <Stack direction="row" spacing={1}>
                <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => onEdit(servicio)}
                    fullWidth
                    sx={{
                        borderRadius: '10px',
                        borderColor: colors.primary,
                        color: colors.primary,
                        fontWeight: 600,
                        textTransform: 'none',
                        py: 0.8,
                        '&:hover': {
                            borderColor: colors.primary,
                            background: alpha(colors.primary, 0.05)
                        }
                    }}
                >
                    Editar
                </Button>
                <IconButton
                    onClick={() => onDelete(servicio)}
                    sx={{
                        borderRadius: '10px',
                        border: `1px solid ${colors.error}`,
                        color: colors.error,
                        '&:hover': {
                            background: alpha(colors.error, 0.05)
                        }
                    }}
                >
                    <DeleteIcon />
                </IconButton>
            </Stack>
        </CardContent>
    </Card>
));

const ServiciosTab = ({ colors, isMobile, isTablet, showNotif }) => {
    const [servicios, setServicios] = useState([]);
    const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
    const [recompensa, setRecompensa] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('todos');
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [openDialogEdit, setOpenDialogEdit] = useState(false);
    const [openDialogAsignar, setOpenDialogAsignar] = useState(false);
    const [openDialogDelete, setOpenDialogDelete] = useState(false);
    const [selectedServicio, setSelectedServicio] = useState(null);
    const [formEdit, setFormEdit] = useState(FORM_EDIT_INICIAL);
    const [formAsignar, setFormAsignar] = useState(FORM_ASIGNAR_INICIAL);

    const ejecutarPeticion = useApiRequest(showNotif);

    // Cargar datos al montar
    useEffect(() => {
        cargarDatos();
    }, []);

    // Cargar servicios y recompensa
    const cargarDatos = useCallback(async () => {
        setLoadingData(true);
        await Promise.all([cargarServicios(), cargarRecompensa()]);
        setLoadingData(false);
    }, []);

    // Cargar servicios
    const cargarServicios = useCallback(async () => {
        const { exito, data } = await ejecutarPeticion(
            (signal) => axios.get(`${API_URL}/servicios-gamificacion`, { signal }).then(res => res.data)
        );
        if (exito) setServicios(data);
    }, [ejecutarPeticion]);

    // Cargar recompensa para saber puntos requeridos
    const cargarRecompensa = useCallback(async () => {
        const { exito, data } = await ejecutarPeticion(
            (signal) => axios.get(`${API_URL}/recompensa`, { signal }).then(res => res.data)
        );
        if (exito) setRecompensa(data);
    }, [ejecutarPeticion]);

    // Cargar servicios disponibles
    const cargarServiciosDisponibles = useCallback(async () => {
        const { exito, data } = await ejecutarPeticion(
            (signal) => axios.get(`${API_URL}/servicios/disponibles`, { signal }).then(res => res.data)
        );
        if (exito) setServiciosDisponibles(data);
    }, [ejecutarPeticion]);

    // Filtrar servicios con useMemo
    const filteredServicios = useMemo(() => {
        let filtered = [...servicios];

        if (searchTerm) {
            filtered = filtered.filter(s =>
                s.nombre_servicio.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterEstado === 'activos') {
            filtered = filtered.filter(s => s.estado === 1);
        } else if (filterEstado === 'inactivos') {
            filtered = filtered.filter(s => s.estado === 0);
        }

        return filtered;
    }, [servicios, searchTerm, filterEstado]);

    // Calcular cuántos servicios necesita completar con los puntos actuales
    const calcularServiciosNecesarios = useCallback((puntos) => {
        if (!recompensa || !puntos) return null;
        return Math.ceil(recompensa.puntos_requeridos / puntos);
    }, [recompensa]);

    // Abrir dialog editar
    const handleOpenEdit = useCallback((servicio) => {
        setSelectedServicio(servicio);
        setFormEdit({
            puntos: servicio.puntos,
            estado: servicio.estado
        });
        setOpenDialogEdit(true);
    }, []);

    // Abrir dialog asignar
    const handleOpenAsignar = useCallback(async () => {
        await cargarServiciosDisponibles();
        setFormAsignar(FORM_ASIGNAR_INICIAL);
        setOpenDialogAsignar(true);
    }, [cargarServiciosDisponibles]);

    // Abrir dialog eliminar
    const handleOpenDelete = useCallback((servicio) => {
        setSelectedServicio(servicio);
        setOpenDialogDelete(true);
    }, []);

    // Cerrar dialogs
    const handleCloseEdit = useCallback(() => {
        setOpenDialogEdit(false);
        setFormEdit(FORM_EDIT_INICIAL);
    }, []);

    const handleCloseAsignar = useCallback(() => {
        setOpenDialogAsignar(false);
        setFormAsignar(FORM_ASIGNAR_INICIAL);
    }, []);

    const handleCloseDelete = useCallback(() => {
        setOpenDialogDelete(false);
    }, []);

    // Validar formulario edición
    const validarFormEdit = useCallback(() => {
        if (!formEdit.puntos || formEdit.puntos <= 0) {
            showNotif('Los puntos deben ser mayores a 0', 'warning');
            return false;
        }
        return true;
    }, [formEdit, showNotif]);

    // Validar formulario asignación
    const validarFormAsignar = useCallback(() => {
        if (!formAsignar.id_servicio) {
            showNotif('Selecciona un servicio', 'warning');
            return false;
        }
        if (!formAsignar.puntos || formAsignar.puntos <= 0) {
            showNotif('Los puntos deben ser mayores a 0', 'warning');
            return false;
        }
        return true;
    }, [formAsignar, showNotif]);

    // Guardar edición
    const handleSaveEdit = useCallback(async () => {
        if (!validarFormEdit()) return;

        setLoading(true);
        const { exito } = await ejecutarPeticion(
            (signal) => axios.put(`${API_URL}/servicios-gamificacion/${selectedServicio.id}`, formEdit, { signal }),
            'Servicio actualizado correctamente'
        );
        
        if (exito) {
            handleCloseEdit();
            cargarServicios();
        }
        setLoading(false);
    }, [validarFormEdit, selectedServicio, formEdit, ejecutarPeticion, handleCloseEdit, cargarServicios]);

    // Asignar servicio
    const handleAsignar = useCallback(async () => {
        if (!validarFormAsignar()) return;

        setLoading(true);
        const { exito } = await ejecutarPeticion(
            (signal) => axios.post(`${API_URL}/servicios-gamificacion`, formAsignar, { signal }),
            'Servicio asignado correctamente'
        );
        
        if (exito) {
            handleCloseAsignar();
            cargarServicios();
        }
        setLoading(false);
    }, [validarFormAsignar, formAsignar, ejecutarPeticion, handleCloseAsignar, cargarServicios]);

    // Eliminar servicio
    const handleDelete = useCallback(async () => {
        setLoading(true);
        const { exito } = await ejecutarPeticion(
            (signal) => axios.delete(`${API_URL}/servicios-gamificacion/${selectedServicio.id}`, { signal }),
            'Servicio eliminado de gamificación'
        );
        
        if (exito) {
            handleCloseDelete();
            cargarServicios();
        }
        setLoading(false);
    }, [selectedServicio, ejecutarPeticion, handleCloseDelete, cargarServicios]);

    // Actualizar campos
    const actualizarCampoEdit = useCallback((campo, valor) => {
        setFormEdit(prev => ({ ...prev, [campo]: valor }));
    }, []);

    const actualizarCampoAsignar = useCallback((campo, valor) => {
        setFormAsignar(prev => ({ ...prev, [campo]: valor }));
    }, []);

    // Estilos memoizados
    const estilos = useMemo(() => ({
        botonPrimario: {
            borderRadius: '12px',
            background: colors.gradient,
            px: 3,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: `0 4px 14px ${alpha(colors.primary, 0.4)}`,
            '&:hover': {
                background: colors.gradient,
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${alpha(colors.primary, 0.5)}`
            }
        },
        textField: {
            '& .MuiOutlinedInput-root': { borderRadius: '12px' }
        }
    }), [colors]);

    if (loadingData) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress sx={{ color: colors.primary }} />
            </Box>
        );
    }

    return (
        <Fade in timeout={500}>
            <Box>
                {/* Header */}
                <Box sx={{ mb: 2.5 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2,
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: 2
                        }}
                    >
                        <Box>
                            <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} color={colors.text}>
                                Servicios con Puntos
                            </Typography>
                            <Typography variant="body2" color={colors.secondaryText}>
                                Gestiona los puntos asignados a cada servicio
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpenAsignar}
                            sx={estilos.botonPrimario}
                        >
                            Asignar Servicio
                        </Button>
                    </Box>

                    {/* Barra de búsqueda y filtros */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            background: colors.paper,
                            borderRadius: '16px',
                            border: `1px solid ${colors.border}`
                        }}
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    placeholder="Buscar servicio..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: colors.secondaryText }} />
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={estilos.textField}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    select
                                    value={filterEstado}
                                    onChange={(e) => setFilterEstado(e.target.value)}
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FilterIcon sx={{ color: colors.secondaryText }} />
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={estilos.textField}
                                >
                                    <MenuItem value="todos">Todos</MenuItem>
                                    <MenuItem value="activos">Activos</MenuItem>
                                    <MenuItem value="inactivos">Inactivos</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>

                {/* Grid de servicios */}
                {filteredServicios.length > 0 ? (
                    <Grid container spacing={2.5}>
                        {filteredServicios.map((servicio) => (
                            <Grid item xs={12} sm={6} md={4} key={servicio.id}>
                                <ServicioCard
                                    servicio={servicio}
                                    colors={colors}
                                    onEdit={handleOpenEdit}
                                    onDelete={handleOpenDelete}
                                />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Paper
                        elevation={0}
                        sx={{
                            textAlign: 'center',
                            py: 6,
                            background: colors.paper,
                            borderRadius: '20px',
                            border: `2px dashed ${colors.border}`
                        }}
                    >
                        <ServiceIcon sx={{ fontSize: 56, color: colors.secondaryText, mb: 1.5 }} />
                        <Typography variant="h6" color={colors.secondaryText} fontWeight={600}>
                            No hay servicios {filterEstado === 'activos' ? 'activos' : filterEstado === 'inactivos' ? 'inactivos' : 'asignados'}
                        </Typography>
                        <Typography variant="body2" color={colors.secondaryText}>
                            {searchTerm || filterEstado !== 'todos' ? 'Intenta con otros filtros' : 'Comienza asignando un servicio'}
                        </Typography>
                    </Paper>
                )}

                {/* Dialog Editar */}
                <Dialog
                    open={openDialogEdit}
                    onClose={handleCloseEdit}
                    maxWidth="sm"
                    fullWidth
                    fullScreen={isMobile}
                    PaperProps={{
                        sx: {
                            background: colors.paper,
                            borderRadius: isMobile ? 0 : '24px',
                            boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
                        }
                    }}
                >
                    <DialogTitle>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight={700} color={colors.text}>
                                Editar Servicio
                            </Typography>
                            <IconButton onClick={handleCloseEdit} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Typography variant="body2" color={colors.secondaryText} mt={0.5}>
                            {selectedServicio?.nombre_servicio}
                        </Typography>
                    </DialogTitle>

                    <Divider sx={{ borderColor: colors.border }} />

                    <DialogContent sx={{ pt: 2.5 }}>
                        <Stack spacing={2.5}>
                            {recompensa && (
                                <Alert
                                    severity="info"
                                    icon={<InfoIcon />}
                                    sx={{
                                        borderRadius: '12px',
                                        background: alpha(colors.primary, 0.05),
                                        border: `1px solid ${alpha(colors.primary, 0.2)}`,
                                        '& .MuiAlert-icon': { color: colors.primary }
                                    }}
                                >
                                    <Typography variant="body2" fontWeight={600} color={colors.text}>
                                        Recompensa: {recompensa.puntos_requeridos} puntos
                                    </Typography>
                                    {formEdit.puntos > 0 && (
                                        <Typography variant="caption" color={colors.secondaryText}>
                                            El paciente necesitará completar {calcularServiciosNecesarios(formEdit.puntos)} servicios como este para canjear
                                        </Typography>
                                    )}
                                </Alert>
                            )}

                            <TextField
                                label="Puntos"
                                type="number"
                                fullWidth
                                required
                                value={formEdit.puntos}
                                onChange={(e) => actualizarCampoEdit('puntos', parseInt(e.target.value) || 0)}
                                helperText="Puntos que ganará el paciente al completar este servicio"
                                inputProps={{ min: 1 }}
                                sx={estilos.textField}
                            />

                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: '12px',
                                    background: alpha(formEdit.estado === 1 ? colors.success : colors.error, 0.05),
                                    border: `1px solid ${alpha(formEdit.estado === 1 ? colors.success : colors.error, 0.2)}`
                                }}
                            >
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formEdit.estado === 1}
                                            onChange={(e) => actualizarCampoEdit('estado', e.target.checked ? 1 : 0)}
                                            sx={{
                                                '& .MuiSwitch-switchBase.Mui-checked': { color: colors.success },
                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: colors.success }
                                            }}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body2" fontWeight={600} color={colors.text}>
                                                {formEdit.estado === 1 ? 'Servicio Activo' : 'Servicio Inactivo'}
                                            </Typography>
                                            <Typography variant="caption" color={colors.secondaryText}>
                                                {formEdit.estado === 1 ? 'Disponible para asignar puntos' : 'No disponible en el sistema'}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </Paper>
                        </Stack>
                    </DialogContent>

                    <Divider sx={{ borderColor: colors.border }} />

                    <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
                        <Button
                            onClick={handleCloseEdit}
                            disabled={loading}
                            sx={{ 
                                borderRadius: '12px', 
                                px: 3, 
                                py: 1.2, 
                                fontWeight: 600,
                                textTransform: 'none'
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSaveEdit}
                            variant="contained"
                            disabled={loading}
                            sx={{ ...estilos.botonPrimario, px: 4, minWidth: 120 }}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Guardar'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog Asignar */}
                <Dialog
                    open={openDialogAsignar}
                    onClose={handleCloseAsignar}
                    maxWidth="sm"
                    fullWidth
                    fullScreen={isMobile}
                    PaperProps={{
                        sx: {
                            background: colors.paper,
                            borderRadius: isMobile ? 0 : '24px',
                            boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
                        }
                    }}
                >
                    <DialogTitle>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight={700} color={colors.text}>
                                Asignar Nuevo Servicio
                            </Typography>
                            <IconButton onClick={handleCloseAsignar} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>

                    <Divider sx={{ borderColor: colors.border }} />

                    <DialogContent sx={{ pt: 2.5 }}>
                        <Stack spacing={2.5}>
                            {recompensa && (
                                <Alert
                                    severity="info"
                                    icon={<InfoIcon />}
                                    sx={{
                                        borderRadius: '12px',
                                        background: alpha(colors.primary, 0.05),
                                        border: `1px solid ${alpha(colors.primary, 0.2)}`,
                                        '& .MuiAlert-icon': { color: colors.primary }
                                    }}
                                >
                                    <Typography variant="body2" fontWeight={600} color={colors.text}>
                                        Recompensa: {recompensa.puntos_requeridos} puntos
                                    </Typography>
                                    {formAsignar.puntos > 0 && (
                                        <Typography variant="caption" color={colors.secondaryText}>
                                            El paciente necesitará completar {calcularServiciosNecesarios(formAsignar.puntos)} servicios como este para canjear
                                        </Typography>
                                    )}
                                </Alert>
                            )}

                            <TextField
                                select
                                label="Selecciona un Servicio"
                                fullWidth
                                required
                                value={formAsignar.id_servicio}
                                onChange={(e) => actualizarCampoAsignar('id_servicio', e.target.value)}
                                sx={estilos.textField}
                            >
                                {serviciosDisponibles.length === 0 && (
                                    <MenuItem disabled>No hay servicios disponibles</MenuItem>
                                )}
                                {serviciosDisponibles.map((servicio) => (
                                    <MenuItem key={servicio.id} value={servicio.id}>
                                        {servicio.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Puntos"
                                type="number"
                                fullWidth
                                required
                                value={formAsignar.puntos}
                                onChange={(e) => actualizarCampoAsignar('puntos', parseInt(e.target.value) || 0)}
                                helperText="Puntos que ganará el paciente al completar este servicio"
                                inputProps={{ min: 1 }}
                                sx={estilos.textField}
                            />
                        </Stack>
                    </DialogContent>

                    <Divider sx={{ borderColor: colors.border }} />

                    <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
                        <Button
                            onClick={handleCloseAsignar}
                            disabled={loading}
                            sx={{ 
                                borderRadius: '12px', 
                                px: 3, 
                                py: 1.2, 
                                fontWeight: 600,
                                textTransform: 'none'
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleAsignar}
                            variant="contained"
                            disabled={loading}
                            sx={{ ...estilos.botonPrimario, px: 4, minWidth: 120 }}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Asignar'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog Eliminar */}
                <Dialog
                    open={openDialogDelete}
                    onClose={handleCloseDelete}
                    PaperProps={{
                        sx: {
                            background: colors.paper,
                            borderRadius: '24px',
                            boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
                        }
                    }}
                >
                    <DialogTitle>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '12px',
                                    backgroundColor: alpha(colors.error, 0.1),
                                    border: `1px solid ${alpha(colors.error, 0.3)}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <DeleteIcon sx={{ color: colors.error, fontSize: 22 }} />
                            </Box>
                            <Typography variant="h6" fontWeight={700} color={colors.text}>
                                Eliminar Servicio
                            </Typography>
                        </Box>
                    </DialogTitle>

                    <DialogContent sx={{ pt: 1.5 }}>
                        <Typography color={colors.text} gutterBottom fontWeight={600}>
                            ¿Estás seguro de eliminar <strong>"{selectedServicio?.nombre_servicio}"</strong> de la gamificación?
                        </Typography>
                        <Typography variant="body2" color={colors.secondaryText}>
                            Esta acción removerá el servicio de la gamificación pero no lo eliminará del catálogo.
                        </Typography>
                    </DialogContent>

                    <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
                        <Button
                            onClick={handleCloseDelete}
                            disabled={loading}
                            sx={{ 
                                borderRadius: '12px', 
                                px: 3, 
                                py: 1.2, 
                                fontWeight: 600,
                                textTransform: 'none'
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDelete}
                            variant="contained"
                            disabled={loading}
                            sx={{
                                borderRadius: '12px',
                                backgroundColor: colors.error,
                                px: 4,
                                py: 1.2,
                                fontWeight: 600,
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: colors.error,
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 4px 14px ${alpha(colors.error, 0.4)}`
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Eliminar'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Fade>
    );
};

export default memo(ServiciosTab);