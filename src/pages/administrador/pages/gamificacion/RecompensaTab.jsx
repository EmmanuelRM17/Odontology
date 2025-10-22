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
    Paper,
    Alert
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
    CardGiftcard as GiftIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'https://back-end-4803.onrender.com/api/gamificacion';

// Iconos profesionales disponibles
const ICONOS_DISPONIBLES = [
    { icon: 'gift', label: 'Regalo', color: '#1976d2', component: GiftIcon },
    { icon: 'diamond', label: 'Diamante', color: '#0288d1', emoji: '💎' },
    { icon: 'star', label: 'Estrella', color: '#fbc02d', component: StarsIcon },
    { icon: 'trophy', label: 'Trofeo', color: '#388e3c', component: TrophyIcon },
    { icon: 'crown', label: 'Corona', color: '#f57c00', emoji: '👑' },
    { icon: 'money', label: 'Dinero', color: '#689f38', emoji: '💰' },
    { icon: 'celebration', label: 'Celebración', color: '#5e35b1', emoji: '🎉' },
    { icon: 'heart', label: 'Favorito', color: '#e53935', emoji: '❤️' },
    { icon: 'sparkle', label: 'Especial', color: '#fdd835', emoji: '✨' },
    { icon: 'target', label: 'Objetivo', color: '#d32f2f', emoji: '🎯' }
];

const RecompensaTab = ({ colors, isMobile, isTablet, showNotif }) => {
    const [recompensa, setRecompensa] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        tipo: 'descuento',
        puntos_requeridos: 100,
        icono: 'gift',
        premio: '',
        estado: 1
    });

    useEffect(() => {
        cargarRecompensa();
    }, []);

    // Cargar recompensa con timeout
    const cargarRecompensa = async () => {
        setLoadingData(true);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const { data } = await axios.get(`${API_URL}/recompensa`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            setRecompensa(data);
        } catch (error) {
            if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
                showNotif('Tiempo de espera agotado. Intenta nuevamente.', 'error');
            } else if (error.response?.status !== 404) {
                showNotif('Error al cargar recompensa', 'error');
            }
        } finally {
            setLoadingData(false);
        }
    };

    // Abrir dialog crear
    const handleOpenCreate = () => {
        setIsEditing(false);
        setFormData({
            nombre: '',
            descripcion: '',
            tipo: 'descuento',
            puntos_requeridos: 100,
            icono: 'gift',
            premio: '',
            estado: 1
        });
        setOpenDialog(true);
    };

    // Abrir dialog editar
    const handleOpenEdit = () => {
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
    };

    // Guardar recompensa
    const handleSave = async () => {
        if (!formData.nombre || !formData.tipo || !formData.puntos_requeridos) {
            showNotif('Completa todos los campos requeridos', 'warning');
            return;
        }

        setLoading(true);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            if (isEditing) {
                await axios.put(`${API_URL}/recompensa/${recompensa.id}`, formData, {
                    signal: controller.signal
                });
                showNotif('Recompensa actualizada correctamente', 'success');
            } else {
                await axios.post(`${API_URL}/recompensa`, formData, {
                    signal: controller.signal
                });
                showNotif('Recompensa creada correctamente', 'success');
            }
            
            clearTimeout(timeoutId);
            setOpenDialog(false);
            cargarRecompensa();
        } catch (error) {
            if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
                showNotif('Tiempo de espera agotado. Intenta nuevamente.', 'error');
            } else {
                showNotif(error.response?.data?.error || 'Error al guardar', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    // Eliminar recompensa
    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de eliminar la recompensa?')) return;

        setLoading(true);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            await axios.delete(`${API_URL}/recompensa/${recompensa.id}`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            showNotif('Recompensa eliminada correctamente', 'success');
            setRecompensa(null);
        } catch (error) {
            if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
                showNotif('Tiempo de espera agotado. Intenta nuevamente.', 'error');
            } else {
                showNotif('Error al eliminar recompensa', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    // Renderizar icono seleccionado
    const renderIcono = (iconKey, size = 'large') => {
        const icono = ICONOS_DISPONIBLES.find(i => i.icon === iconKey);
        if (!icono) return <GiftIcon />;
        
        if (icono.component) {
            const IconComponent = icono.component;
            return <IconComponent sx={{ fontSize: size === 'large' ? 48 : 24 }} />;
        }
        return <Typography fontSize={size === 'large' ? '3rem' : '1.5rem'}>{icono.emoji}</Typography>;
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
                {/* Header */}
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
                        <CardContent sx={{ p: isMobile ? 3 : 4 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={2} display="flex" justifyContent="center" alignItems="center">
                                    <Box
                                        sx={{
                                            width: isMobile ? 80 : 100,
                                            height: isMobile ? 80 : 100,
                                            borderRadius: '20px',
                                            background: colors.gradient,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: `0 8px 24px ${alpha(colors.primary, 0.3)}`
                                        }}
                                    >
                                        {renderIcono(recompensa.icono)}
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={7}>
                                    <Typography variant="h5" fontWeight={700} color={colors.text} gutterBottom>
                                        {recompensa.nombre}
                                    </Typography>
                                    <Typography variant="body1" color={colors.secondaryText} mb={2}>
                                        {recompensa.descripcion || 'Sin descripción'}
                                    </Typography>

                                    <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1} mb={2}>
                                        <Chip
                                            icon={<StarsIcon sx={{ fontSize: 18 }} />}
                                            label={`${recompensa.puntos_requeridos} puntos`}
                                            sx={{
                                                background: colors.gradient,
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: '0.9rem',
                                                px: 0.5,
                                                height: 36
                                            }}
                                        />
                                        <Chip
                                            label={recompensa.tipo}
                                            sx={{
                                                background: alpha(colors.primary, 0.1),
                                                color: colors.primary,
                                                fontWeight: 600,
                                                border: `1px solid ${alpha(colors.primary, 0.3)}`,
                                                height: 36
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
                                                height: 36
                                            }}
                                        />
                                    </Stack>

                                    {recompensa.premio && (
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                borderRadius: '12px',
                                                background: alpha(colors.success, 0.05),
                                                border: `1px solid ${alpha(colors.success, 0.2)}`
                                            }}
                                        >
                                            <Typography variant="body2" fontWeight={600} color={colors.text}>
                                                Premio: {recompensa.premio}
                                            </Typography>
                                        </Paper>
                                    )}
                                </Grid>

                                <Grid item xs={12} md={3} display="flex" flexDirection="column" gap={2}>
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
                                            py: 1.5
                                        }}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<DeleteIcon />}
                                        onClick={handleDelete}
                                        fullWidth
                                        sx={{
                                            borderRadius: '12px',
                                            borderColor: colors.error,
                                            color: colors.error,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            py: 1.5,
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
                            py: 8,
                            background: colors.paper,
                            borderRadius: '20px',
                            border: `2px dashed ${colors.border}`
                        }}
                    >
                        <TrophyIcon sx={{ fontSize: 64, color: colors.secondaryText, mb: 2 }} />
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
                    onClose={() => setOpenDialog(false)}
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
                            <IconButton onClick={() => setOpenDialog(false)} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>

                    <Divider sx={{ borderColor: colors.border }} />

                    <DialogContent sx={{ pt: 3 }}>
                        <Stack spacing={3}>
                            <TextField
                                label="Nombre de la Recompensa"
                                fullWidth
                                required
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />

                            <TextField
                                label="Descripción"
                                fullWidth
                                multiline
                                rows={3}
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Tipo"
                                        fullWidth
                                        required
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                        helperText="Ej: descuento, servicio gratis"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Puntos Requeridos"
                                        type="number"
                                        fullWidth
                                        required
                                        value={formData.puntos_requeridos}
                                        onChange={(e) => setFormData({ ...formData, puntos_requeridos: parseInt(e.target.value) || 0 })}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                    />
                                </Grid>
                            </Grid>

                            <TextField
                                label="Premio"
                                fullWidth
                                value={formData.premio}
                                onChange={(e) => setFormData({ ...formData, premio: e.target.value })}
                                helperText="Describe el premio que recibirá"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />

                            {/* Selector de Iconos */}
                            <Box>
                                <Typography variant="body2" fontWeight={600} color={colors.text} mb={2}>
                                    Selecciona un Icono:
                                </Typography>
                                <Grid container spacing={2}>
                                    {ICONOS_DISPONIBLES.map((icono) => (
                                        <Grid item xs={4} sm={3} md={2.4} key={icono.icon}>
                                            <Paper
                                                elevation={0}
                                                onClick={() => setFormData({ ...formData, icono: icono.icon })}
                                                sx={{
                                                    p: 2,
                                                    borderRadius: '12px',
                                                    border: `2px solid ${formData.icono === icono.icon ? colors.primary : colors.border}`,
                                                    background: formData.icono === icono.icon ? alpha(colors.primary, 0.05) : 'transparent',
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        transform: 'scale(1.05)',
                                                        borderColor: colors.primary
                                                    }
                                                }}
                                            >
                                                {icono.component ? (
                                                    <icono.component sx={{ fontSize: 32, color: formData.icono === icono.icon ? colors.primary : colors.secondaryText }} />
                                                ) : (
                                                    <Typography fontSize="2rem">{icono.emoji}</Typography>
                                                )}
                                                <Typography variant="caption" color={colors.secondaryText} fontWeight={500} mt={1} display="block">
                                                    {icono.label}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.estado === 1}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.checked ? 1 : 0 })}
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

                    <DialogActions sx={{ p: 3, gap: 2 }}>
                        <Button
                            onClick={() => setOpenDialog(false)}
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
                            onClick={handleSave}
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
            </Box>
        </Fade>
    );
};

export default RecompensaTab;