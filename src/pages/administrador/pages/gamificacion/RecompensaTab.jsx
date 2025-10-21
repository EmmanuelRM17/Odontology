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
    FormControlLabel
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
    EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'https://back-end-4803.onrender.com/api/gamificacion';

// 10 iconos disponibles
const ICONOS_DISPONIBLES = [
    { emoji: '🎁', label: 'Regalo', color: '#1976d2' },
    { emoji: '💎', label: 'Diamante', color: '#0288d1' },
    { emoji: '⭐', label: 'Estrella', color: '#fbc02d' },
    { emoji: '🏆', label: 'Trofeo', color: '#388e3c' },
    { emoji: '👑', label: 'Corona', color: '#f57c00' },
    { emoji: '💰', label: 'Dinero', color: '#689f38' },
    { emoji: '🎉', label: 'Celebración', color: '#5e35b1' },
    { emoji: '❤️', label: 'Corazón', color: '#e53935' },
    { emoji: '✨', label: 'Brillo', color: '#fdd835' },
    { emoji: '🎯', label: 'Diana', color: '#d32f2f' }
];

const RecompensaTab = ({ colors, isMobile, isTablet, showNotif }) => {
    const [recompensa, setRecompensa] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        tipo: 'descuento',
        puntos_requeridos: 100,
        icono: '🎁',
        premio: '',
        estado: 1
    });

    useEffect(() => {
        cargarRecompensa();
    }, []);

    // Cargar recompensa única
    const cargarRecompensa = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_URL}/recompensa`);
            setRecompensa(data);
        } catch (error) {
            if (error.response?.status !== 404) {
                showNotif('Error al cargar recompensa', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    // Abrir dialog para crear
    const handleOpenCreate = () => {
        setIsEditing(false);
        setFormData({
            nombre: '',
            descripcion: '',
            tipo: 'descuento',
            puntos_requeridos: 100,
            icono: '🎁',
            premio: '',
            estado: 1
        });
        setOpenDialog(true);
    };

    // Abrir dialog para editar
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
            if (isEditing) {
                await axios.put(`${API_URL}/recompensa/${recompensa.id}`, formData);
                showNotif('Recompensa actualizada correctamente', 'success');
            } else {
                await axios.post(`${API_URL}/recompensa`, formData);
                showNotif('Recompensa creada correctamente', 'success');
            }
            setOpenDialog(false);
            cargarRecompensa();
        } catch (error) {
            showNotif(error.response?.data?.error || 'Error al guardar', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Eliminar recompensa
    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de eliminar la recompensa?')) return;

        setLoading(true);
        try {
            await axios.delete(`${API_URL}/recompensa/${recompensa.id}`);
            showNotif('Recompensa eliminada correctamente', 'success');
            setRecompensa(null);
        } catch (error) {
            showNotif('Error al eliminar recompensa', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !recompensa) {
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
                    <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={800} color={colors.text}>
                        🏆 Recompensa del Sistema
                    </Typography>
                    {!recompensa && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpenCreate}
                            sx={{
                                borderRadius: '16px',
                                background: colors.gradient,
                                px: 3,
                                py: 1.5,
                                fontWeight: 700,
                                boxShadow: `0 8px 24px ${alpha(colors.primary, 0.4)}`,
                                '&:hover': {
                                    background: colors.gradient,
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 12px 32px ${alpha(colors.primary, 0.5)}`
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
                        sx={{
                            background: colors.cardBg,
                            borderRadius: '24px',
                            border: `1px solid ${colors.border}`,
                            boxShadow: colors.shadow,
                            backdropFilter: colors.glassBlur,
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
                                            borderRadius: '24px',
                                            background: colors.gradient,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: isMobile ? '2.5rem' : '3rem',
                                            boxShadow: `0 12px 32px ${alpha(colors.primary, 0.4)}`
                                        }}
                                    >
                                        {recompensa.icono}
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={7}>
                                    <Typography variant="h5" fontWeight={800} color={colors.text} gutterBottom>
                                        {recompensa.nombre}
                                    </Typography>
                                    <Typography variant="body1" color={colors.secondaryText} mb={2}>
                                        {recompensa.descripcion || 'Sin descripción'}
                                    </Typography>

                                    <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                                        <Chip
                                            label={`${recompensa.puntos_requeridos} puntos`}
                                            sx={{
                                                background: colors.gradient,
                                                color: 'white',
                                                fontWeight: 700,
                                                fontSize: '0.95rem',
                                                px: 1
                                            }}
                                        />
                                        <Chip
                                            label={recompensa.tipo}
                                            sx={{
                                                background: colors.gradientAlt,
                                                color: 'white',
                                                fontWeight: 700
                                            }}
                                        />
                                        <Chip
                                            label={recompensa.estado === 1 ? 'Activa' : 'Inactiva'}
                                            sx={{
                                                background: recompensa.estado === 1 ? colors.success : colors.error,
                                                color: 'white',
                                                fontWeight: 700
                                            }}
                                        />
                                    </Stack>

                                    {recompensa.premio && (
                                        <Box
                                            sx={{
                                                mt: 2,
                                                p: 2,
                                                borderRadius: '16px',
                                                background: alpha(colors.primary, 0.1),
                                                border: `2px solid ${alpha(colors.primary, 0.3)}`
                                            }}
                                        >
                                            <Typography variant="body2" fontWeight={700} color={colors.text}>
                                                🎁 Premio: {recompensa.premio}
                                            </Typography>
                                        </Box>
                                    )}
                                </Grid>

                                <Grid item xs={12} md={3} display="flex" flexDirection="column" gap={2}>
                                    <Button
                                        variant="contained"
                                        startIcon={<EditIcon />}
                                        onClick={handleOpenEdit}
                                        fullWidth
                                        sx={{
                                            borderRadius: '16px',
                                            background: colors.gradient,
                                            fontWeight: 700,
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
                                            borderRadius: '16px',
                                            borderColor: colors.error,
                                            color: colors.error,
                                            fontWeight: 700,
                                            py: 1.5,
                                            '&:hover': {
                                                borderColor: colors.error,
                                                background: alpha(colors.error, 0.1)
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
                    <Box
                        sx={{
                            textAlign: 'center',
                            py: 8,
                            background: colors.paper,
                            borderRadius: '24px',
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
                    </Box>
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
                            borderRadius: isMobile ? 0 : '28px',
                            boxShadow: '0 24px 72px rgba(0,0,0,0.3)'
                        }
                    }}
                >
                    <DialogTitle>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight={800} color={colors.text}>
                                {isEditing ? '✏️ Editar Recompensa' : '➕ Crear Recompensa'}
                            </Typography>
                            <IconButton onClick={() => setOpenDialog(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>

                    <Divider sx={{ borderColor: colors.border }} />

                    <DialogContent sx={{ pt: 3 }}>
                        <Stack spacing={3}>
                            <TextField
                                label="Nombre de la Recompensa *"
                                fullWidth
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                            />

                            <TextField
                                label="Descripción"
                                fullWidth
                                multiline
                                rows={3}
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                            />

                            <TextField
                                label="Tipo *"
                                fullWidth
                                value={formData.tipo}
                                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                helperText="Ejemplo: descuento, servicio gratis, promoción"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                            />

                            <TextField
                                label="Puntos Requeridos *"
                                type="number"
                                fullWidth
                                value={formData.puntos_requeridos}
                                onChange={(e) => setFormData({ ...formData, puntos_requeridos: parseInt(e.target.value) || 0 })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                            />

                            <TextField
                                label="Premio"
                                fullWidth
                                value={formData.premio}
                                onChange={(e) => setFormData({ ...formData, premio: e.target.value })}
                                helperText="Describe el premio que recibirá el paciente"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                            />

                            {/* Selector de Iconos */}
                            <Box>
                                <Typography variant="body2" fontWeight={700} color={colors.text} mb={2}>
                                    Selecciona un Icono:
                                </Typography>
                                <Grid container spacing={2}>
                                    {ICONOS_DISPONIBLES.map((icono) => (
                                        <Grid item xs={4} sm={3} md={2.4} key={icono.emoji}>
                                            <Box
                                                onClick={() => setFormData({ ...formData, icono: icono.emoji })}
                                                sx={{
                                                    p: 2,
                                                    borderRadius: '16px',
                                                    border: `3px solid ${formData.icono === icono.emoji ? colors.primary : colors.border}`,
                                                    background: formData.icono === icono.emoji ? alpha(colors.primary, 0.1) : 'transparent',
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'scale(1.1)',
                                                        borderColor: colors.primary
                                                    }
                                                }}
                                            >
                                                <Typography fontSize="2rem">{icono.emoji}</Typography>
                                                <Typography variant="caption" color={colors.secondaryText} fontWeight={600}>
                                                    {icono.label}
                                                </Typography>
                                            </Box>
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
                                    <Typography variant="body2" fontWeight={700} color={colors.text}>
                                        {formData.estado === 1 ? '✅ Recompensa Activa' : '❌ Recompensa Inactiva'}
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
                            sx={{ borderRadius: '16px', px: 3, py: 1.5, fontWeight: 700 }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            variant="contained"
                            disabled={loading}
                            sx={{
                                borderRadius: '16px',
                                background: colors.gradient,
                                px: 4,
                                py: 1.5,
                                fontWeight: 700,
                                minWidth: 140,
                                boxShadow: `0 8px 24px ${alpha(colors.primary, 0.4)}`,
                                '&:hover': {
                                    background: colors.gradient,
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 12px 32px ${alpha(colors.primary, 0.5)}`
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : '💾 Guardar'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Fade>
    );
};

export default RecompensaTab;