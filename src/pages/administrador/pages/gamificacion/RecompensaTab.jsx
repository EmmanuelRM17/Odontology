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
    Paper,
    InputAdornment
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
    EmojiEvents as TrophyIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    Stars as StarsIcon,
    CardGiftcard as GiftIcon,
    Savings as MoneyIcon,
    LocalOffer as OfferIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'https://back-end-4803.onrender.com/api/gamificacion';

// Iconos para sistema de descuentos y puntos
const ICONOS_DISPONIBLES = [
    { icon: 'gift', label: 'Regalo', color: '#1976d2', component: GiftIcon },
    { icon: 'star', label: 'Estrella', color: '#fbc02d', component: StarsIcon },
    { icon: 'trophy', label: 'Trofeo', color: '#388e3c', component: TrophyIcon },
    { icon: 'money', label: 'Descuento', color: '#689f38', component: MoneyIcon },
    { icon: 'offer', label: 'Oferta', color: '#1976d2', component: OfferIcon }
];

const FORM_INICIAL = {
    nombre: '',
    descripcion: '',
    tipo: 'descuento',
    puntos_requeridos: 100,
    icono: 'gift',
    premio: '',
    estado: 1
};

// Hook custom para peticiones con timeout y manejo de errores
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

// Componente memoizado para renderizar iconos
const IconoRecompensa = memo(({ iconKey, size = 'large' }) => {
    const icono = ICONOS_DISPONIBLES.find(i => i.icon === iconKey);
    if (!icono) return <GiftIcon />;
    
    const IconComponent = icono.component;
    return <IconComponent sx={{ fontSize: size === 'large' ? 48 : 24 }} />;
});

// Componente de card de icono en selector
const IconoSelector = memo(({ icono, seleccionado, onClick, colors }) => {
    const IconComponent = icono.component;
    return (
        <Paper
            elevation={0}
            onClick={onClick}
            sx={{
                p: 1.5,
                borderRadius: '12px',
                border: `2px solid ${seleccionado ? colors.primary : colors.border}`,
                background: seleccionado ? alpha(colors.primary, 0.05) : 'transparent',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                    transform: 'scale(1.05)',
                    borderColor: colors.primary
                }
            }}
        >
            <IconComponent sx={{ fontSize: 28, color: seleccionado ? colors.primary : colors.secondaryText }} />
            <Typography variant="caption" color={colors.secondaryText} fontWeight={500} mt={0.5} display="block">
                {icono.label}
            </Typography>
        </Paper>
    );
});

const RecompensaTab = ({ colors, isMobile, isTablet, showNotif }) => {
    const [recompensa, setRecompensa] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(FORM_INICIAL);

    const ejecutarPeticion = useApiRequest(showNotif);

    // Cargar recompensa al montar
    useEffect(() => {
        cargarRecompensa();
    }, []);

    // Cargar recompensa desde API
    const cargarRecompensa = useCallback(async () => {
        setLoadingData(true);
        const { exito, data } = await ejecutarPeticion(
            (signal) => axios.get(`${API_URL}/recompensa`, { signal }).then(res => res.data)
        );
        if (exito) setRecompensa(data);
        setLoadingData(false);
    }, [ejecutarPeticion]);

    // Validar formulario
    const validarFormulario = useCallback(() => {
        if (!formData.nombre.trim()) {
            showNotif('El nombre es requerido', 'warning');
            return false;
        }
        if (!formData.tipo.trim()) {
            showNotif('El tipo es requerido', 'warning');
            return false;
        }
        if (formData.puntos_requeridos < 1) {
            showNotif('Los puntos deben ser mayor a 0', 'warning');
            return false;
        }
        if (!formData.premio || formData.premio < 1) {
            showNotif('El porcentaje de descuento debe ser mayor a 0', 'warning');
            return false;
        }
        if (formData.premio > 100) {
            showNotif('El porcentaje de descuento no puede ser mayor a 100', 'warning');
            return false;
        }
        return true;
    }, [formData, showNotif]);

    // Abrir dialog crear
    const handleOpenCreate = useCallback(() => {
        setIsEditing(false);
        setFormData(FORM_INICIAL);
        setOpenDialog(true);
    }, []);

    // Abrir dialog editar
    const handleOpenEdit = useCallback(() => {
        if (!recompensa) return;
        setIsEditing(true);
        setFormData({
            nombre: recompensa.nombre,
            descripcion: recompensa.descripcion || '',
            tipo: recompensa.tipo,
            puntos_requeridos: recompensa.puntos_requeridos,
            icono: recompensa.icono,
            premio: recompensa.premio || '',
            estado: recompensa.estado
        });
        setOpenDialog(true);
    }, [recompensa]);

    // Cerrar dialog
    const handleCloseDialog = useCallback(() => {
        setOpenDialog(false);
        setFormData(FORM_INICIAL);
    }, []);

    // Guardar recompensa
    const handleSave = useCallback(async () => {
        if (!validarFormulario()) return;

        setLoading(true);
        const peticion = isEditing
            ? (signal) => axios.put(`${API_URL}/recompensa/${recompensa.id}`, formData, { signal })
            : (signal) => axios.post(`${API_URL}/recompensa`, formData, { signal });

        const mensaje = isEditing ? 'Recompensa actualizada correctamente' : 'Recompensa creada correctamente';
        
        const { exito } = await ejecutarPeticion(peticion, mensaje);
        
        if (exito) {
            handleCloseDialog();
            cargarRecompensa();
        }
        setLoading(false);
    }, [validarFormulario, isEditing, recompensa, formData, ejecutarPeticion, handleCloseDialog, cargarRecompensa]);

    // Eliminar recompensa
    const handleDelete = useCallback(async () => {
        if (!window.confirm('¿Estás seguro de eliminar la recompensa?')) return;

        setLoading(true);
        const { exito } = await ejecutarPeticion(
            (signal) => axios.delete(`${API_URL}/recompensa/${recompensa.id}`, { signal }),
            'Recompensa eliminada correctamente'
        );
        
        if (exito) setRecompensa(null);
        setLoading(false);
    }, [recompensa, ejecutarPeticion]);

    // Actualizar campo del formulario
    const actualizarCampo = useCallback((campo, valor) => {
        setFormData(prev => ({ ...prev, [campo]: valor }));
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
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2.5,
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: 2
                    }}
                >
                    <Box>
                        <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} color={colors.text}>
                            Recompensa del Sistema
                        </Typography>
                        <Typography variant="body2" color={colors.secondaryText}>
                            Gestiona la recompensa única disponible para canjeos
                        </Typography>
                    </Box>
                    {!recompensa && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpenCreate}
                            sx={estilos.botonPrimario}
                        >
                            Crear Recompensa
                        </Button>
                    )}
                </Box>

                {/* Card Recompensa */}
                {recompensa ? (
                    <Card
                        elevation={0}
                        sx={{
                            background: colors.paper,
                            borderRadius: '20px',
                            border: `1px solid ${colors.border}`,
                            boxShadow: colors.shadow,
                            overflow: 'hidden'
                        }}
                    >
                        <CardContent sx={{ p: isMobile ? 2.5 : 3.5 }}>
                            <Grid container spacing={2.5}>
                                <Grid item xs={12} md={2} display="flex" justifyContent="center" alignItems="center">
                                    <Box
                                        sx={{
                                            width: isMobile ? 70 : 90,
                                            height: isMobile ? 70 : 90,
                                            borderRadius: '20px',
                                            background: colors.gradient,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: `0 8px 24px ${alpha(colors.primary, 0.3)}`
                                        }}
                                    >
                                        <IconoRecompensa iconKey={recompensa.icono} />
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={7}>
                                    <Typography variant="h5" fontWeight={700} color={colors.text} gutterBottom>
                                        {recompensa.nombre}
                                    </Typography>
                                    <Typography variant="body1" color={colors.secondaryText} mb={1.5}>
                                        {recompensa.descripcion || 'Sin descripción'}
                                    </Typography>

                                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={1.5}>
                                        <Chip
                                            icon={<StarsIcon sx={{ fontSize: 18 }} />}
                                            label={`${recompensa.puntos_requeridos} puntos`}
                                            sx={{
                                                background: colors.gradient,
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: '0.85rem',
                                                height: 32
                                            }}
                                        />
                                        <Chip
                                            label={recompensa.tipo}
                                            sx={{
                                                background: alpha(colors.primary, 0.1),
                                                color: colors.primary,
                                                fontWeight: 600,
                                                border: `1px solid ${alpha(colors.primary, 0.3)}`,
                                                height: 32
                                            }}
                                        />
                                        <Chip
                                            icon={recompensa.estado === 1 ? <CheckIcon sx={{ fontSize: 18 }} /> : <CancelIcon sx={{ fontSize: 18 }} />}
                                            label={recompensa.estado === 1 ? 'Activa' : 'Inactiva'}
                                            sx={{
                                                background: recompensa.estado === 1 ? alpha(colors.success, 0.1) : alpha(colors.error, 0.1),
                                                color: recompensa.estado === 1 ? colors.success : colors.error,
                                                fontWeight: 600,
                                                border: `1px solid ${recompensa.estado === 1 ? alpha(colors.success, 0.3) : alpha(colors.error, 0.3)}`,
                                                height: 32
                                            }}
                                        />
                                    </Stack>

                                    {recompensa.premio && (
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 1.5,
                                                borderRadius: '12px',
                                                background: alpha(colors.success, 0.05),
                                                border: `1px solid ${alpha(colors.success, 0.2)}`
                                            }}
                                        >
                                            <Typography variant="body2" fontWeight={600} color={colors.text}>
                                                Descuento: {recompensa.premio}% OFF
                                            </Typography>
                                        </Paper>
                                    )}
                                </Grid>

                                <Grid item xs={12} md={3} display="flex" flexDirection="column" gap={1.5}>
                                    <Button
                                        variant="contained"
                                        startIcon={<EditIcon />}
                                        onClick={handleOpenEdit}
                                        fullWidth
                                        sx={{
                                            borderRadius: '12px',
                                            background: colors.gradient,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            py: 1.2
                                        }}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<DeleteIcon />}
                                        onClick={handleDelete}
                                        disabled={loading}
                                        fullWidth
                                        sx={{
                                            borderRadius: '12px',
                                            borderColor: colors.error,
                                            color: colors.error,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            py: 1.2,
                                            '&:hover': {
                                                borderColor: colors.error,
                                                background: alpha(colors.error, 0.05)
                                            }
                                        }}
                                    >
                                        Eliminar
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
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
                        <TrophyIcon sx={{ fontSize: 56, color: colors.secondaryText, mb: 1.5 }} />
                        <Typography variant="h6" color={colors.secondaryText} fontWeight={600}>
                            No hay recompensa configurada
                        </Typography>
                        <Typography variant="body2" color={colors.secondaryText}>
                            Crea una recompensa para comenzar
                        </Typography>
                    </Paper>
                )}

                {/* Dialog Crear/Editar */}
                <Dialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    maxWidth="md"
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
                                {isEditing ? 'Editar Recompensa' : 'Nueva Recompensa'}
                            </Typography>
                            <IconButton onClick={handleCloseDialog} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>

                    <Divider sx={{ borderColor: colors.border }} />

                    <DialogContent sx={{ pt: 2.5 }}>
                        <Stack spacing={2.5}>
                            <TextField
                                label="Nombre de la Recompensa"
                                fullWidth
                                required
                                value={formData.nombre}
                                onChange={(e) => actualizarCampo('nombre', e.target.value)}
                                sx={estilos.textField}
                            />

                            <TextField
                                label="Descripción"
                                fullWidth
                                multiline
                                rows={2}
                                value={formData.descripcion}
                                onChange={(e) => actualizarCampo('descripcion', e.target.value)}
                                sx={estilos.textField}
                            />

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Tipo"
                                        fullWidth
                                        required
                                        value={formData.tipo}
                                        onChange={(e) => actualizarCampo('tipo', e.target.value)}
                                        helperText="Ej: descuento"
                                        sx={estilos.textField}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Puntos Requeridos"
                                        type="number"
                                        fullWidth
                                        required
                                        value={formData.puntos_requeridos}
                                        onChange={(e) => actualizarCampo('puntos_requeridos', parseInt(e.target.value) || 0)}
                                        inputProps={{ min: 1 }}
                                        sx={estilos.textField}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Descuento"
                                        type="number"
                                        fullWidth
                                        required
                                        value={formData.premio}
                                        onChange={(e) => actualizarCampo('premio', parseInt(e.target.value) || '')}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">%</InputAdornment>
                                        }}
                                        inputProps={{ min: 1, max: 100 }}
                                        helperText="1-100%"
                                        sx={estilos.textField}
                                    />
                                </Grid>
                            </Grid>

                            {/* Selector de Iconos */}
                            <Box>
                                <Typography variant="body2" fontWeight={600} color={colors.text} mb={1.5}>
                                    Selecciona un Icono:
                                </Typography>
                                <Grid container spacing={1.5}>
                                    {ICONOS_DISPONIBLES.map((icono) => (
                                        <Grid item xs={4} sm={2.4} key={icono.icon}>
                                            <IconoSelector
                                                icono={icono}
                                                seleccionado={formData.icono === icono.icon}
                                                onClick={() => actualizarCampo('icono', icono.icon)}
                                                colors={colors}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.estado === 1}
                                        onChange={(e) => actualizarCampo('estado', e.target.checked ? 1 : 0)}
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': { color: colors.success },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: colors.success }
                                        }}
                                    />
                                }
                                label={
                                    <Typography variant="body2" fontWeight={600} color={colors.text}>
                                        {formData.estado === 1 ? 'Recompensa Activa' : 'Recompensa Inactiva'}
                                    </Typography>
                                }
                            />
                        </Stack>
                    </DialogContent>

                    <Divider sx={{ borderColor: colors.border }} />

                    <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
                        <Button
                            onClick={handleCloseDialog}
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
                            onClick={handleSave}
                            variant="contained"
                            disabled={loading}
                            sx={{
                                ...estilos.botonPrimario,
                                px: 4,
                                minWidth: 120
                            }}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Guardar'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Fade>
    );
};

export default memo(RecompensaTab);