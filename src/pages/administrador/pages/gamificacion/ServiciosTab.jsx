import React, { useState, useEffect } from 'react';
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
    Paper
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
    FilterList as FilterIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'https://back-end-4803.onrender.com/api/gamificacion';

const ServiciosTab = ({ colors, isMobile, isTablet, showNotif }) => {
    const [servicios, setServicios] = useState([]);
    const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
    const [filteredServicios, setFilteredServicios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('todos');
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [openDialogEdit, setOpenDialogEdit] = useState(false);
    const [openDialogAsignar, setOpenDialogAsignar] = useState(false);
    const [openDialogDelete, setOpenDialogDelete] = useState(false);
    const [selectedServicio, setSelectedServicio] = useState(null);
    const [formEdit, setFormEdit] = useState({ puntos: 10, estado: 1 });
    const [formAsignar, setFormAsignar] = useState({ id_servicio: '', puntos: 10 });

    useEffect(() => {
        cargarServicios();
    }, []);

    useEffect(() => {
        filtrarServicios();
    }, [searchTerm, filterEstado, servicios]);

    // Cargar servicios con timeout
    const cargarServicios = async () => {
        setLoadingData(true);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const { data } = await axios.get(`${API_URL}/servicios-gamificacion`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            setServicios(data);
        } catch (error) {
            if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
                showNotif('Tiempo de espera agotado. Intenta nuevamente.', 'error');
            } else {
                showNotif('Error al cargar servicios', 'error');
            }
        } finally {
            setLoadingData(false);
        }
    };

    // Cargar servicios disponibles
    const cargarServiciosDisponibles = async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const { data } = await axios.get(`${API_URL}/servicios/disponibles`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            setServiciosDisponibles(data);
        } catch (error) {
            if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
                showNotif('Tiempo de espera agotado. Intenta nuevamente.', 'error');
            } else {
                showNotif('Error al cargar servicios disponibles', 'error');
            }
        }
    };

    // Filtrar servicios
    const filtrarServicios = () => {
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

        setFilteredServicios(filtered);
    };

    // Abrir dialog editar
    const handleOpenEdit = (servicio) => {
        setSelectedServicio(servicio);
        setFormEdit({
            puntos: servicio.puntos,
            estado: servicio.estado
        });
        setOpenDialogEdit(true);
    };

    // Abrir dialog asignar
    const handleOpenAsignar = async () => {
        await cargarServiciosDisponibles();
        setFormAsignar({ id_servicio: '', puntos: 10 });
        setOpenDialogAsignar(true);
    };

    // Abrir dialog eliminar
    const handleOpenDelete = (servicio) => {
        setSelectedServicio(servicio);
        setOpenDialogDelete(true);
    };

    // Guardar edición
    const handleSaveEdit = async () => {
        if (!formEdit.puntos || formEdit.puntos <= 0) {
            showNotif('Los puntos deben ser mayores a 0', 'warning');
            return;
        }

        setLoading(true);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            await axios.put(`${API_URL}/servicios-gamificacion/${selectedServicio.id}`, formEdit, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            showNotif('Servicio actualizado correctamente', 'success');
            setOpenDialogEdit(false);
            cargarServicios();
        } catch (error) {
            if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
                showNotif('Tiempo de espera agotado. Intenta nuevamente.', 'error');
            } else {
                showNotif(error.response?.data?.error || 'Error al actualizar', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    // Asignar servicio
    const handleAsignar = async () => {
        if (!formAsignar.id_servicio || !formAsignar.puntos || formAsignar.puntos <= 0) {
            showNotif('Completa todos los campos correctamente', 'warning');
            return;
        }

        setLoading(true);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            await axios.post(`${API_URL}/servicios-gamificacion`, formAsignar, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            showNotif('Servicio asignado correctamente', 'success');
            setOpenDialogAsignar(false);
            cargarServicios();
        } catch (error) {
            if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
                showNotif('Tiempo de espera agotado. Intenta nuevamente.', 'error');
            } else {
                showNotif(error.response?.data?.error || 'Error al asignar', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    // Eliminar servicio
    const handleDelete = async () => {
        setLoading(true);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            await axios.delete(`${API_URL}/servicios-gamificacion/${selectedServicio.id}`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            showNotif('Servicio eliminado de gamificación', 'success');
            setOpenDialogDelete(false);
            cargarServicios();
        } catch (error) {
            if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
                showNotif('Tiempo de espera agotado. Intenta nuevamente.', 'error');
            } else {
                showNotif('Error al eliminar servicio', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

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
                {/* Header con filtros */}
                <Box sx={{ mb: 3 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 3,
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
                            sx={{
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
                            }}
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
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px'
                                        }
                                    }}
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
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px'
                                        }
                                    }}
                                >
                                    <MenuItem value="todos">Todos los estados</MenuItem>
                                    <MenuItem value="activos">Activos</MenuItem>
                                    <MenuItem value="inactivos">Inactivos</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>

                {/* Grid de servicios */}
                {filteredServicios.length > 0 ? (
                    <Grid container spacing={3}>
                        {filteredServicios.map((servicio) => (
                            <Grid item xs={12} sm={6} md={4} key={servicio.id}>
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
                                    <CardContent sx={{ p: 3 }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                            <Box
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: '12px',
                                                    background: colors.gradient,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <ServiceIcon sx={{ color: 'white', fontSize: 24 }} />
                                            </Box>
                                            <Chip
                                                icon={servicio.estado === 1 ? <CheckIcon sx={{ fontSize: 16 }} /> : <CancelIcon sx={{ fontSize: 16 }} />}
                                                label={servicio.estado === 1 ? 'Activo' : 'Inactivo'}
                                                size="small"
                                                sx={{
                                                    background: servicio.estado === 1 ? alpha(colors.success, 0.1) : alpha(colors.error, 0.1),
                                                    color: servicio.estado === 1 ? colors.success : colors.error,
                                                    fontWeight: 600,
                                                    border: `1px solid ${servicio.estado === 1 ? alpha(colors.success, 0.3) : alpha(colors.error, 0.3)}`
                                                }}
                                            />
                                        </Box>

                                        <Typography variant="h6" fontWeight={700} color={colors.text} mb={1} noWrap>
                                            {servicio.nombre_servicio}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color={colors.secondaryText}
                                            mb={2}
                                            sx={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                minHeight: 40
                                            }}
                                        >
                                            {servicio.descripcion_servicio || 'Sin descripción'}
                                        </Typography>

                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                borderRadius: '12px',
                                                background: alpha(colors.primary, 0.05),
                                                border: `1px solid ${alpha(colors.primary, 0.2)}`,
                                                mb: 2
                                            }}
                                        >
                                            <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                                <StarsIcon sx={{ color: colors.primary, fontSize: 20 }} />
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
                                                onClick={() => handleOpenEdit(servicio)}
                                                fullWidth
                                                sx={{
                                                    borderRadius: '10px',
                                                    borderColor: colors.primary,
                                                    color: colors.primary,
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    '&:hover': {
                                                        borderColor: colors.primary,
                                                        background: alpha(colors.primary, 0.05)
                                                    }
                                                }}
                                            >
                                                Editar
                                            </Button>
                                            <IconButton
                                                onClick={() => handleOpenDelete(servicio)}
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
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Paper
                        elevation={0}
                        sx={{
                            textAlign: 'center',
                            py: 8,
                            background: colors.paper,
                            borderRadius: '20px',
                            border: `2px dashed ${colors.border}`
                        }}
                    >
                        <ServiceIcon sx={{ fontSize: 64, color: colors.secondaryText, mb: 2 }} />
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
                    onClose={() => setOpenDialogEdit(false)}
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
                            <IconButton onClick={() => setOpenDialogEdit(false)} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Typography variant="body2" color={colors.secondaryText} mt={1}>
                            {selectedServicio?.nombre_servicio}
                        </Typography>
                    </DialogTitle>

                    <Divider sx={{ borderColor: colors.border }} />

                    <DialogContent sx={{ pt: 3 }}>
                        <Stack spacing={3}>
                            <TextField
                                label="Puntos"
                                type="number"
                                fullWidth
                                required
                                value={formEdit.puntos}
                                onChange={(e) => setFormEdit({ ...formEdit, puntos: parseInt(e.target.value) || 0 })}
                                helperText="Puntos que ganará el paciente al completar este servicio"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
                                            onChange={(e) => setFormEdit({ ...formEdit, estado: e.target.checked ? 1 : 0 })}
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

                    <DialogActions sx={{ p: 3, gap: 2 }}>
                        <Button
                            onClick={() => setOpenDialogEdit(false)}
                            disabled={loading}
                            sx={{ 
                                borderRadius: '12px', 
                                px: 3, 
                                py: 1.5, 
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
                            sx={{
                                borderRadius: '12px',
                                background: colors.gradient,
                                px: 4,
                                py: 1.5,
                                fontWeight: 600,
                                textTransform: 'none',
                                minWidth: 120,
                                boxShadow: `0 4px 14px ${alpha(colors.primary, 0.4)}`,
                                '&:hover': {
                                    background: colors.gradient,
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 6px 20px ${alpha(colors.primary, 0.5)}`
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Guardar'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog Asignar */}
                <Dialog
                    open={openDialogAsignar}
                    onClose={() => setOpenDialogAsignar(false)}
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
                            <IconButton onClick={() => setOpenDialogAsignar(false)} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>

                    <Divider sx={{ borderColor: colors.border }} />

                    <DialogContent sx={{ pt: 3 }}>
                        <Stack spacing={3}>
                            <TextField
                                select
                                label="Selecciona un Servicio"
                                fullWidth
                                required
                                value={formAsignar.id_servicio}
                                onChange={(e) => setFormAsignar({ ...formAsignar, id_servicio: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
                                onChange={(e) => setFormAsignar({ ...formAsignar, puntos: parseInt(e.target.value) || 0 })}
                                helperText="Puntos que ganará el paciente al completar este servicio"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </Stack>
                    </DialogContent>

                    <Divider sx={{ borderColor: colors.border }} />

                    <DialogActions sx={{ p: 3, gap: 2 }}>
                        <Button
                            onClick={() => setOpenDialogAsignar(false)}
                            disabled={loading}
                            sx={{ 
                                borderRadius: '12px', 
                                px: 3, 
                                py: 1.5, 
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
                            sx={{
                                borderRadius: '12px',
                                background: colors.gradient,
                                px: 4,
                                py: 1.5,
                                fontWeight: 600,
                                textTransform: 'none',
                                minWidth: 120,
                                boxShadow: `0 4px 14px ${alpha(colors.primary, 0.4)}`,
                                '&:hover': {
                                    background: colors.gradient,
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 6px 20px ${alpha(colors.primary, 0.5)}`
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Asignar'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog Eliminar */}
                <Dialog
                    open={openDialogDelete}
                    onClose={() => setOpenDialogDelete(false)}
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
                                    width: 48,
                                    height: 48,
                                    borderRadius: '12px',
                                    backgroundColor: alpha(colors.error, 0.1),
                                    border: `1px solid ${alpha(colors.error, 0.3)}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <DeleteIcon sx={{ color: colors.error, fontSize: 24 }} />
                            </Box>
                            <Typography variant="h6" fontWeight={700} color={colors.text}>
                                Eliminar Servicio
                            </Typography>
                        </Box>
                    </DialogTitle>

                    <DialogContent sx={{ pt: 2 }}>
                        <Typography color={colors.text} gutterBottom fontWeight={600}>
                            ¿Estás seguro de eliminar <strong>"{selectedServicio?.nombre_servicio}"</strong> de la gamificación?
                        </Typography>
                        <Typography variant="body2" color={colors.secondaryText}>
                            Esta acción removerá el servicio de la gamificación pero no lo eliminará del catálogo.
                        </Typography>
                    </DialogContent>

                    <DialogActions sx={{ p: 3, gap: 2 }}>
                        <Button
                            onClick={() => setOpenDialogDelete(false)}
                            disabled={loading}
                            sx={{ 
                                borderRadius: '12px', 
                                px: 3, 
                                py: 1.5, 
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
                                py: 1.5,
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

export default ServiciosTab;