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
    Grid,
    IconButton,
    TextField,
    Typography,
    Switch,
    FormControlLabel,
    Chip,
    InputAdornment,
    MenuItem,
    Tooltip,
    CircularProgress,
    useMediaQuery,
    useTheme,
    alpha,
    Divider,
    Stack,
    Badge,
    Fade,
    Grow,
    Zoom,
    ButtonGroup
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    EmojiEvents as TrophyIcon,
    Close as CloseIcon,
    CheckCircle as CheckIcon,
    Stars as StarsIcon,
    Celebration as CelebrationIcon,
    Inventory as InventoryIcon,
    LocalOffer as OfferIcon,
    Brightness7 as BrightIcon,
    FilterAlt as FilterIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import Notificaciones from '../../../components/Layout/Notificaciones';

const API_URL = 'https://back-end-4803.onrender.com/api/gamificacion';

// 10 ICONOS PREDEFINIDOS CON GRADIENTES
const ICONOS_DISPONIBLES = [
    { emoji: '🎁', label: 'Regalo', color: '#FF6B9D' },
    { emoji: '💎', label: 'Diamante', color: '#4ECDC4' },
    { emoji: '⭐', label: 'Estrella', color: '#FFD93D' },
    { emoji: '🏆', label: 'Trofeo', color: '#95E1D3' },
    { emoji: '👑', label: 'Corona', color: '#F38181' },
    { emoji: '💰', label: 'Dinero', color: '#85E3FF' },
    { emoji: '🎉', label: 'Celebración', color: '#AA96DA' },
    { emoji: '❤️', label: 'Corazón', color: '#FF6B9D' },
    { emoji: '✨', label: 'Brillo', color: '#FDCB6E' },
    { emoji: '🎯', label: 'Diana', color: '#6C5CE7' }
];

const GestionRecompensas = () => {
    const { isDarkTheme } = useThemeContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [recompensas, setRecompensas] = useState([]);
    const [filteredRecompensas, setFilteredRecompensas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTipo, setSelectedTipo] = useState('todos');
    const [selectedEstado, setSelectedEstado] = useState('todos');
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedRecompensa, setSelectedRecompensa] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        type: 'success'
    });

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        tipo: 'descuento',
        puntos_requeridos: 100,
        icono: '🎁',
        premio: '',
        estado: 1,
        orden: 0
    });

    const [stats, setStats] = useState({
        total: 0,
        activas: 0,
        inactivas: 0,
        puntosPromedio: 0
    });

    // COLORES MODERNOS CON GRADIENTES
    const colors = {
        background: isDarkTheme ? '#0A0E27' : '#F0F4F8',
        paper: isDarkTheme ? '#151934' : '#FFFFFF',
        paperLight: isDarkTheme ? '#1E2747' : '#F8FAFC',
        cardBg: isDarkTheme 
            ? 'linear-gradient(135deg, rgba(30,39,71,0.6) 0%, rgba(21,25,52,0.8) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.95) 100%)',
        text: isDarkTheme ? '#F1F5F9' : '#1E293B',
        secondaryText: isDarkTheme ? '#94A3B8' : '#64748B',
        primary: '#6366F1',
        primaryLight: '#818CF8',
        primaryDark: '#4F46E5',
        secondary: '#EC4899',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        border: isDarkTheme ? 'rgba(148,163,184,0.1)' : 'rgba(148,163,184,0.2)',
        hover: isDarkTheme ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        gradientAlt: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        shadow: isDarkTheme
            ? '0 20px 60px -15px rgba(0,0,0,0.6)'
            : '0 20px 60px -15px rgba(99,102,241,0.15)',
        glassBlur: 'blur(20px)'
    };

    const tiposRecompensa = [
        { value: 'descuento', label: 'Descuento', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '💸' },
        { value: 'servicio', label: 'Servicio', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: '🔧' },
        { value: 'producto', label: 'Producto', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', icon: '📦' },
        { value: 'especial', label: 'Especial', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', icon: '✨' }
    ];

    const showNotif = (message, type = 'success') => {
        setNotification({ open: true, message, type });
    };

    // Calcular estadísticas
    useEffect(() => {
        if (recompensas.length > 0) {
            const activas = recompensas.filter(r => r.estado === 1).length;
            const puntosTotal = recompensas.reduce((sum, r) => sum + r.puntos_requeridos, 0);
            
            setStats({
                total: recompensas.length,
                activas,
                inactivas: recompensas.length - activas,
                puntosPromedio: Math.round(puntosTotal / recompensas.length)
            });
        }
    }, [recompensas]);

    useEffect(() => {
        fetchRecompensas();
    }, []);

    // Filtrado avanzado
    useEffect(() => {
        let filtered = recompensas;

        if (searchTerm) {
            filtered = filtered.filter(r =>
                r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.premio?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedTipo !== 'todos') {
            filtered = filtered.filter(r => r.tipo === selectedTipo);
        }

        if (selectedEstado === 'activas') {
            filtered = filtered.filter(r => r.estado === 1);
        } else if (selectedEstado === 'inactivas') {
            filtered = filtered.filter(r => r.estado === 0);
        }

        setFilteredRecompensas(filtered);
    }, [searchTerm, selectedTipo, selectedEstado, recompensas]);

    const fetchRecompensas = async () => {
        setIsLoadingData(true);
        try {
            const { data } = await axios.get(`${API_URL}/recompensas`);
            setRecompensas(data);
            setFilteredRecompensas(data);
        } catch (error) {
            console.error('Error:', error);
            showNotif('Error al cargar recompensas', 'error');
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleOpenDialog = (recompensa = null) => {
        if (recompensa) {
            setSelectedRecompensa(recompensa);
            setFormData({
                nombre: recompensa.nombre,
                descripcion: recompensa.descripcion || '',
                tipo: recompensa.tipo,
                puntos_requeridos: recompensa.puntos_requeridos,
                icono: recompensa.icono || '🎁',
                premio: recompensa.premio || '',
                estado: recompensa.estado,
                orden: recompensa.orden || 0
            });
        } else {
            setSelectedRecompensa(null);
            setFormData({
                nombre: '',
                descripcion: '',
                tipo: 'descuento',
                puntos_requeridos: 100,
                icono: '🎁',
                premio: '',
                estado: 1,
                orden: 0
            });
        }
        setOpenDialog(true);
    };

    const handleSaveRecompensa = async () => {
        if (!formData.nombre.trim()) {
            showNotif('El nombre es obligatorio', 'warning');
            return;
        }
        if (!formData.puntos_requeridos || formData.puntos_requeridos < 1) {
            showNotif('Los puntos deben ser mayor a 0', 'warning');
            return;
        }

        setLoading(true);
        try {
            if (selectedRecompensa) {
                await axios.put(`${API_URL}/recompensas/${selectedRecompensa.id}`, formData);
                showNotif('✨ Recompensa actualizada exitosamente', 'success');
            } else {
                await axios.post(`${API_URL}/recompensas`, formData);
                showNotif('🎉 Recompensa creada exitosamente', 'success');
            }
            setOpenDialog(false);
            fetchRecompensas();
        } catch (error) {
            showNotif(error.response?.data?.error || 'Error al guardar', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRecompensa = async () => {
        setLoading(true);
        try {
            await axios.delete(`${API_URL}/recompensas/${selectedRecompensa.id}`);
            showNotif('🗑️ Recompensa eliminada exitosamente', 'success');
            setOpenDeleteDialog(false);
            fetchRecompensas();
        } catch (error) {
            showNotif(error.response?.data?.error || 'Error al eliminar', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleEstado = async (recompensa) => {
        try {
            const nuevoEstado = recompensa.estado === 1 ? 0 : 1;
            await axios.put(`${API_URL}/recompensas/${recompensa.id}`, {
                ...recompensa,
                estado: nuevoEstado
            });
            showNotif(`Recompensa ${nuevoEstado === 1 ? 'activada' : 'desactivada'}`, 'success');
            fetchRecompensas();
        } catch (error) {
            showNotif('Error al actualizar estado', 'error');
        }
    };

    const getTipoConfig = (tipo) => {
        return tiposRecompensa.find(t => t.value === tipo) || tiposRecompensa[0];
    };

    // Card de estadística moderna
    const StatCard = ({ title, value, icon, gradient }) => (
        <Zoom in timeout={300}>
            <Card
                sx={{
                    background: gradient,
                    borderRadius: '32px',
                    border: 'none',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.2)'
                    }
                }}
            >
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: 'rgba(255,255,255,0.9)',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: 1
                            }}
                        >
                            {title}
                        </Typography>
                        <Typography 
                            variant="h3" 
                            sx={{ 
                                color: 'white',
                                fontWeight: 800,
                                fontSize: isMobile ? '2rem' : '2.5rem'
                            }}
                        >
                            {value}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            position: 'absolute',
                            right: 16,
                            top: 16,
                            fontSize: '3rem',
                            opacity: 0.2
                        }}
                    >
                        {icon}
                    </Box>
                </CardContent>
            </Card>
        </Zoom>
    );

    // Card de recompensa ultra moderna
    const RecompensaCard = ({ recompensa }) => {
        const tipoConfig = getTipoConfig(recompensa.tipo);
        const iconData = ICONOS_DISPONIBLES.find(i => i.emoji === recompensa.icono);
        
        return (
            <Grow in timeout={400}>
                <Card
                    sx={{
                        height: '100%',
                        background: colors.cardBg,
                        backdropFilter: colors.glassBlur,
                        borderRadius: '32px',
                        border: `2px solid ${colors.border}`,
                        boxShadow: colors.shadow,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'visible',
                        '&:hover': {
                            transform: 'translateY(-12px) scale(1.02)',
                            boxShadow: `0 24px 72px -15px ${alpha(iconData?.color || colors.primary, 0.3)}`,
                            borderColor: iconData?.color || colors.primary
                        }
                    }}
                >
                    {/* Badge de estado flotante */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -12,
                            right: 20,
                            zIndex: 2
                        }}
                    >
                        <Chip
                            label={recompensa.estado === 1 ? 'Activa' : 'Inactiva'}
                            size="small"
                            sx={{
                                background: recompensa.estado === 1 ? colors.success : colors.secondaryText,
                                color: 'white',
                                fontWeight: 700,
                                borderRadius: '16px',
                                px: 1,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}
                        />
                    </Box>

                    <CardContent sx={{ p: 4 }}>
                        {/* Icono grande con gradiente */}
                        <Box
                            sx={{
                                width: 100,
                                height: 100,
                                borderRadius: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: `linear-gradient(135deg, ${iconData?.color || colors.primary}20 0%, ${iconData?.color || colors.primary}40 100%)`,
                                mb: 3,
                                fontSize: '3.5rem',
                                boxShadow: `0 8px 24px ${alpha(iconData?.color || colors.primary, 0.3)}`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'rotate(-5deg) scale(1.1)'
                                }
                            }}
                        >
                            {recompensa.icono || '🎁'}
                        </Box>

                        {/* Chip del tipo con gradiente */}
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: 2,
                                py: 0.75,
                                borderRadius: '20px',
                                background: tipoConfig.gradient,
                                mb: 2,
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: 'white',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                        >
                            <span>{tipoConfig.icon}</span>
                            <span>{tipoConfig.label}</span>
                        </Box>

                        {/* Nombre */}
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 800,
                                color: colors.text,
                                mb: 1.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: 1.3
                            }}
                        >
                            {recompensa.nombre}
                        </Typography>

                        {/* Descripción */}
                        {recompensa.descripcion && (
                            <Typography
                                variant="body2"
                                sx={{
                                    color: colors.secondaryText,
                                    mb: 3,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    lineHeight: 1.6,
                                    minHeight: 60
                                }}
                            >
                                {recompensa.descripcion}
                            </Typography>
                        )}

                        <Divider sx={{ my: 2.5, borderColor: colors.border }} />

                        {/* Puntos con estilo */}
                        <Box 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                mb: 2.5
                            }}
                        >
                            <Box>
                                <Typography variant="caption" color={colors.secondaryText} fontWeight={600}>
                                    PUNTOS NECESARIOS
                                </Typography>
                                <Box display="flex" alignItems="baseline" gap={0.5}>
                                    <Typography 
                                        variant="h4" 
                                        fontWeight={900}
                                        sx={{
                                            background: colors.gradient,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}
                                    >
                                        {recompensa.puntos_requeridos}
                                    </Typography>
                                    <Typography variant="body2" color={colors.secondaryText} fontWeight={600}>
                                        pts
                                    </Typography>
                                </Box>
                            </Box>

                            <Switch
                                checked={recompensa.estado === 1}
                                onChange={() => handleToggleEstado(recompensa)}
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: colors.success
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        backgroundColor: colors.success
                                    }
                                }}
                            />
                        </Box>

                        {/* Premio */}
                        {recompensa.premio && (
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: '20px',
                                    background: alpha(colors.success, 0.1),
                                    border: `2px solid ${alpha(colors.success, 0.3)}`,
                                    mb: 2.5
                                }}
                            >
                                <Typography 
                                    variant="caption" 
                                    color={colors.success} 
                                    fontWeight={700}
                                    sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                                >
                                    🎁 Premio
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    color={colors.text}
                                    fontWeight={600}
                                    sx={{ mt: 0.5 }}
                                >
                                    {recompensa.premio}
                                </Typography>
                            </Box>
                        )}

                        {/* Botones de acción */}
                        <Stack direction="row" spacing={1.5}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<EditIcon />}
                                onClick={() => handleOpenDialog(recompensa)}
                                sx={{
                                    borderRadius: '16px',
                                    background: colors.gradient,
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    py: 1.5,
                                    boxShadow: `0 4px 12px ${alpha(colors.primary, 0.3)}`,
                                    '&:hover': {
                                        background: colors.gradient,
                                        boxShadow: `0 8px 20px ${alpha(colors.primary, 0.4)}`,
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                Editar
                            </Button>
                            <IconButton
                                onClick={() => {
                                    setSelectedRecompensa(recompensa);
                                    setOpenDeleteDialog(true);
                                }}
                                sx={{
                                    borderRadius: '16px',
                                    border: `2px solid ${colors.error}`,
                                    color: colors.error,
                                    '&:hover': {
                                        backgroundColor: alpha(colors.error, 0.1),
                                        borderColor: colors.error,
                                        transform: 'scale(1.1)'
                                    }
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Stack>
                    </CardContent>
                </Card>
            </Grow>
        );
    };

    return (
        <Box sx={{ p: isMobile ? 2 : 4, backgroundColor: colors.background, minHeight: '100vh' }}>
            {/* Header ultra moderno */}
            <Fade in timeout={600}>
                <Box mb={5}>
                    <Box display="flex" alignItems="center" gap={3} mb={2}>
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '24px',
                                background: colors.gradient,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 8px 24px ${alpha(colors.primary, 0.4)}`
                            }}
                        >
                            <TrophyIcon sx={{ color: 'white', fontSize: 36 }} />
                        </Box>
                        <Box flex={1}>
                            <Typography 
                                variant={isMobile ? 'h4' : 'h3'} 
                                fontWeight={900}
                                sx={{
                                    background: colors.gradient,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}
                            >
                                Gestión de Recompensas
                            </Typography>
                            <Typography variant="body1" color={colors.secondaryText} fontWeight={500}>
                                Administra el catálogo de premios del sistema de gamificación 🎮
                            </Typography>
                        </Box>
                        {!isMobile && (
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenDialog()}
                                sx={{
                                    borderRadius: '20px',
                                    background: colors.gradientAlt,
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textTransform: 'none',
                                    boxShadow: `0 8px 24px ${alpha(colors.secondary, 0.4)}`,
                                    '&:hover': {
                                        background: colors.gradientAlt,
                                        transform: 'translateY(-4px)',
                                        boxShadow: `0 12px 32px ${alpha(colors.secondary, 0.5)}`
                                    }
                                }}
                            >
                                Nueva Recompensa
                            </Button>
                        )}
                    </Box>
                </Box>
            </Fade>

            {/* Estadísticas con gradientes */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={6} sm={6} md={3}>
                    <StatCard
                        title="Total"
                        value={stats.total}
                        icon="🎁"
                        gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                    <StatCard
                        title="Activas"
                        value={stats.activas}
                        icon="✅"
                        gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                    <StatCard
                        title="Inactivas"
                        value={stats.inactivas}
                        icon="❌"
                        gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                    <StatCard
                        title="Puntos Promedio"
                        value={stats.puntosPromedio || 0}
                        icon="⭐"
                        gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                    />
                </Grid>
            </Grid>

            {/* Filtros modernos con chips */}
            <Fade in timeout={800}>
                <Card
                    sx={{
                        mb: 4,
                        background: colors.cardBg,
                        backdropFilter: colors.glassBlur,
                        borderRadius: '32px',
                        border: `2px solid ${colors.border}`,
                        boxShadow: colors.shadow,
                        overflow: 'hidden'
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Stack spacing={3}>
                            {/* Búsqueda */}
                            <TextField
                                fullWidth
                                placeholder="🔍 Buscar recompensas por nombre, descripción o premio..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '24px',
                                        backgroundColor: alpha(colors.primary, 0.05),
                                        fontSize: '1.1rem',
                                        fontWeight: 500,
                                        '& fieldset': { border: 'none' },
                                        '&:hover': {
                                            backgroundColor: alpha(colors.primary, 0.08)
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: alpha(colors.primary, 0.1),
                                            boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.2)}`
                                        }
                                    }
                                }}
                            />

                            {/* Filtros con chips */}
                            <Box>
                                <Typography 
                                    variant="caption" 
                                    fontWeight={700}
                                    sx={{ 
                                        color: colors.secondaryText,
                                        textTransform: 'uppercase',
                                        letterSpacing: 1,
                                        mb: 1.5,
                                        display: 'block'
                                    }}
                                >
                                    Filtrar por tipo
                                </Typography>
                                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                                    <Chip
                                        label="Todos"
                                        onClick={() => setSelectedTipo('todos')}
                                        sx={{
                                            borderRadius: '16px',
                                            px: 2,
                                            py: 2.5,
                                            fontWeight: 700,
                                            fontSize: '0.95rem',
                                            background: selectedTipo === 'todos' ? colors.gradient : 'transparent',
                                            color: selectedTipo === 'todos' ? 'white' : colors.text,
                                            border: `2px solid ${selectedTipo === 'todos' ? 'transparent' : colors.border}`,
                                            '&:hover': {
                                                background: selectedTipo === 'todos' ? colors.gradient : alpha(colors.primary, 0.1),
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    />
                                    {tiposRecompensa.map((tipo) => (
                                        <Chip
                                            key={tipo.value}
                                            label={
                                                <Box display="flex" alignItems="center" gap={0.5}>
                                                    <span>{tipo.icon}</span>
                                                    <span>{tipo.label}</span>
                                                </Box>
                                            }
                                            onClick={() => setSelectedTipo(tipo.value)}
                                            sx={{
                                                borderRadius: '16px',
                                                px: 2,
                                                py: 2.5,
                                                fontWeight: 700,
                                                fontSize: '0.95rem',
                                                background: selectedTipo === tipo.value ? tipo.gradient : 'transparent',
                                                color: selectedTipo === tipo.value ? 'white' : colors.text,
                                                border: `2px solid ${selectedTipo === tipo.value ? 'transparent' : colors.border}`,
                                                '&:hover': {
                                                    background: selectedTipo === tipo.value ? tipo.gradient : alpha(colors.primary, 0.1),
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </Box>

                            <Box>
                                <Typography 
                                    variant="caption" 
                                    fontWeight={700}
                                    sx={{ 
                                        color: colors.secondaryText,
                                        textTransform: 'uppercase',
                                        letterSpacing: 1,
                                        mb: 1.5,
                                        display: 'block'
                                    }}
                                >
                                    Filtrar por estado
                                </Typography>
                                <Stack direction="row" spacing={1.5}>
                                    <Chip
                                        label="Todas"
                                        onClick={() => setSelectedEstado('todos')}
                                        sx={{
                                            borderRadius: '16px',
                                            px: 2,
                                            py: 2.5,
                                            fontWeight: 700,
                                            fontSize: '0.95rem',
                                            background: selectedEstado === 'todos' ? colors.gradient : 'transparent',
                                            color: selectedEstado === 'todos' ? 'white' : colors.text,
                                            border: `2px solid ${selectedEstado === 'todos' ? 'transparent' : colors.border}`,
                                            '&:hover': {
                                                background: selectedEstado === 'todos' ? colors.gradient : alpha(colors.primary, 0.1),
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    />
                                    <Chip
                                        label="✅ Activas"
                                        onClick={() => setSelectedEstado('activas')}
                                        sx={{
                                            borderRadius: '16px',
                                            px: 2,
                                            py: 2.5,
                                            fontWeight: 700,
                                            fontSize: '0.95rem',
                                            background: selectedEstado === 'activas' ? colors.success : 'transparent',
                                            color: selectedEstado === 'activas' ? 'white' : colors.text,
                                            border: `2px solid ${selectedEstado === 'activas' ? 'transparent' : colors.border}`,
                                            '&:hover': {
                                                background: selectedEstado === 'activas' ? colors.success : alpha(colors.success, 0.1),
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    />
                                    <Chip
                                        label="❌ Inactivas"
                                        onClick={() => setSelectedEstado('inactivas')}
                                        sx={{
                                            borderRadius: '16px',
                                            px: 2,
                                            py: 2.5,
                                            fontWeight: 700,
                                            fontSize: '0.95rem',
                                            background: selectedEstado === 'inactivas' ? colors.error : 'transparent',
                                            color: selectedEstado === 'inactivas' ? 'white' : colors.text,
                                            border: `2px solid ${selectedEstado === 'inactivas' ? 'transparent' : colors.border}`,
                                            '&:hover': {
                                                background: selectedEstado === 'inactivas' ? colors.error : alpha(colors.error, 0.1),
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    />
                                </Stack>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Fade>

            {/* Botón móvil flotante */}
            {isMobile && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 1000
                    }}
                >
                    <Button
                        variant="contained"
                        onClick={() => handleOpenDialog()}
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '24px',
                            background: colors.gradientAlt,
                            boxShadow: `0 8px 24px ${alpha(colors.secondary, 0.5)}`,
                            '&:hover': {
                                background: colors.gradientAlt,
                                transform: 'scale(1.1)',
                                boxShadow: `0 12px 32px ${alpha(colors.secondary, 0.6)}`
                            }
                        }}
                    >
                        <AddIcon sx={{ fontSize: 32 }} />
                    </Button>
                </Box>
            )}

            {/* Contenido - Solo Cards */}
            {isLoadingData ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                    <CircularProgress size={60} sx={{ color: colors.primary }} />
                </Box>
            ) : filteredRecompensas.length === 0 ? (
                <Fade in timeout={1000}>
                    <Card
                        sx={{
                            p: 8,
                            textAlign: 'center',
                            background: colors.cardBg,
                            backdropFilter: colors.glassBlur,
                            borderRadius: '32px',
                            border: `2px solid ${colors.border}`
                        }}
                    >
                        <Box sx={{ fontSize: '6rem', mb: 2, opacity: 0.5 }}>🎁</Box>
                        <Typography variant="h5" fontWeight={700} color={colors.text} gutterBottom>
                            {searchTerm || selectedTipo !== 'todos' || selectedEstado !== 'todos'
                                ? 'No se encontraron recompensas'
                                : 'No hay recompensas registradas'}
                        </Typography>
                        <Typography variant="body1" color={colors.secondaryText} mb={4}>
                            {searchTerm || selectedTipo !== 'todos' || selectedEstado !== 'todos'
                                ? 'Intenta cambiar los filtros de búsqueda'
                                : 'Comienza creando tu primera recompensa increíble'}
                        </Typography>
                        {!searchTerm && selectedTipo === 'todos' && selectedEstado === 'todos' && (
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenDialog()}
                                sx={{
                                    borderRadius: '20px',
                                    background: colors.gradient,
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    textTransform: 'none'
                                }}
                            >
                                Crear Primera Recompensa
                            </Button>
                        )}
                    </Card>
                </Fade>
            ) : (
                <Grid container spacing={3}>
                    {filteredRecompensas.map((recompensa, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={recompensa.id}>
                            <RecompensaCard recompensa={recompensa} />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Dialog CREAR/EDITAR - Ultra Moderno */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        background: isDarkTheme 
                            ? 'linear-gradient(135deg, #151934 0%, #0A0E27 100%)'
                            : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                        borderRadius: isMobile ? 0 : '32px',
                        boxShadow: '0 24px 72px rgba(0,0,0,0.3)'
                    }
                }}
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '16px',
                                    background: colors.gradient,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: `0 8px 24px ${alpha(colors.primary, 0.4)}`
                                }}
                            >
                                {selectedRecompensa ? <EditIcon sx={{ color: 'white' }} /> : <AddIcon sx={{ color: 'white' }} />}
                            </Box>
                            <Box>
                                <Typography variant="h5" fontWeight={800} color={colors.text}>
                                    {selectedRecompensa ? 'Editar Recompensa' : 'Nueva Recompensa'}
                                </Typography>
                                <Typography variant="caption" color={colors.secondaryText}>
                                    {selectedRecompensa ? 'Modifica los detalles' : 'Crea una nueva recompensa increíble'}
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton 
                            onClick={() => setOpenDialog(false)}
                            sx={{
                                borderRadius: '12px',
                                '&:hover': {
                                    backgroundColor: alpha(colors.error, 0.1),
                                    color: colors.error
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <Divider sx={{ borderColor: colors.border }} />
                <DialogContent sx={{ pt: 4, pb: 3 }}>
                    <Stack spacing={4}>
                        {/* PREVIEW CARD */}
                        <Card
                            sx={{
                                p: 4,
                                background: `linear-gradient(135deg, ${getTipoConfig(formData.tipo).gradient})`,
                                borderRadius: '28px',
                                textAlign: 'center',
                                border: 'none',
                                boxShadow: '0 12px 36px rgba(0,0,0,0.2)'
                            }}
                        >
                            <Typography 
                                variant="overline" 
                                sx={{ 
                                    color: 'rgba(255,255,255,0.9)',
                                    fontWeight: 700,
                                    letterSpacing: 2
                                }}
                            >
                                VISTA PREVIA
                            </Typography>
                            <Box sx={{ fontSize: '5rem', my: 2 }}>
                                {formData.icono || '🎁'}
                            </Box>
                            <Typography variant="h5" fontWeight={800} color="white" gutterBottom>
                                {formData.nombre || 'Nombre de la recompensa'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                                {formData.descripcion || 'Descripción de la recompensa'}
                            </Typography>
                            <Chip
                                label={`${formData.puntos_requeridos} PUNTOS`}
                                sx={{
                                    background: 'rgba(255,255,255,0.25)',
                                    backdropFilter: 'blur(10px)',
                                    color: 'white',
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    px: 3,
                                    py: 2.5,
                                    borderRadius: '16px'
                                }}
                            />
                        </Card>

                        {/* Nombre */}
                        <TextField
                            fullWidth
                            label="Nombre de la Recompensa"
                            required
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            placeholder="Ej: 10% de Descuento Premium"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '20px',
                                    fontSize: '1.1rem',
                                    fontWeight: 600
                                }
                            }}
                        />

                        {/* Descripción */}
                        <TextField
                            fullWidth
                            label="Descripción"
                            multiline
                            rows={3}
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            placeholder="Describe en qué consiste esta increíble recompensa..."
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '20px'
                                }
                            }}
                        />

                        {/* SELECTOR VISUAL DE ICONOS - 10 OPCIONES */}
                        <Box>
                            <Typography 
                                variant="subtitle1" 
                                fontWeight={700} 
                                color={colors.text}
                                gutterBottom
                                sx={{ mb: 2 }}
                            >
                                🎨 Selecciona un Icono
                            </Typography>
                            <Grid container spacing={2}>
                                {ICONOS_DISPONIBLES.map((icono, index) => (
                                    <Grid item xs={6} sm={4} md={2.4} key={index}>
                                        <Tooltip title={icono.label} arrow>
                                            <Box
                                                onClick={() => setFormData({ ...formData, icono: icono.emoji })}
                                                sx={{
                                                    height: 100,
                                                    borderRadius: '24px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '3rem',
                                                    cursor: 'pointer',
                                                    background: formData.icono === icono.emoji
                                                        ? `linear-gradient(135deg, ${icono.color}30 0%, ${icono.color}60 100%)`
                                                        : alpha(colors.primary, 0.05),
                                                    border: `3px solid ${formData.icono === icono.emoji ? icono.color : 'transparent'}`,
                                                    boxShadow: formData.icono === icono.emoji 
                                                        ? `0 8px 24px ${alpha(icono.color, 0.4)}`
                                                        : 'none',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': {
                                                        transform: 'scale(1.1) rotate(-5deg)',
                                                        boxShadow: `0 12px 32px ${alpha(icono.color, 0.5)}`,
                                                        background: `linear-gradient(135deg, ${icono.color}30 0%, ${icono.color}60 100%)`
                                                    }
                                                }}
                                            >
                                                <Box sx={{ mb: 0.5 }}>{icono.emoji}</Box>
                                                <Typography 
                                                    variant="caption" 
                                                    fontWeight={700}
                                                    sx={{ 
                                                        color: formData.icono === icono.emoji ? icono.color : colors.secondaryText,
                                                        fontSize: '0.7rem'
                                                    }}
                                                >
                                                    {icono.label}
                                                </Typography>
                                            </Box>
                                        </Tooltip>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        {/* Tipo y Puntos */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Tipo de Recompensa"
                                    value={formData.tipo}
                                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '20px'
                                        }
                                    }}
                                >
                                    {tiposRecompensa.map((tipo) => (
                                        <MenuItem key={tipo.value} value={tipo.value}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <span>{tipo.icon}</span>
                                                <span>{tipo.label}</span>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Puntos Requeridos"
                                    type="number"
                                    required
                                    value={formData.puntos_requeridos}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            puntos_requeridos: parseInt(e.target.value) || 0
                                        })
                                    }
                                    inputProps={{ min: 1, step: 10 }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '20px',
                                            fontSize: '1.2rem',
                                            fontWeight: 700
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        {/* Premio */}
                        <TextField
                            fullWidth
                            label="Premio/Beneficio"
                            value={formData.premio}
                            onChange={(e) => setFormData({ ...formData, premio: e.target.value })}
                            placeholder="Ej: 10% de descuento en próxima consulta"
                            helperText="Describe el beneficio específico que recibirá el paciente"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '20px'
                                }
                            }}
                        />

                        {/* Orden y Estado */}
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Orden de Visualización"
                                    type="number"
                                    value={formData.orden}
                                    onChange={(e) =>
                                        setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })
                                    }
                                    helperText="Menor número = aparece primero"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '20px'
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: '20px',
                                        background: alpha(formData.estado === 1 ? colors.success : colors.error, 0.1),
                                        border: `2px solid ${formData.estado === 1 ? colors.success : colors.error}`,
                                        textAlign: 'center'
                                    }}
                                >
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.estado === 1}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, estado: e.target.checked ? 1 : 0 })
                                                }
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                                        color: colors.success
                                                    },
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                        backgroundColor: colors.success
                                                    }
                                                }}
                                            />
                                        }
                                        label={
                                            <Box>
                                                <Typography variant="body2" fontWeight={700} color={colors.text}>
                                                    {formData.estado === 1 ? '✅ Recompensa Activa' : '❌ Recompensa Inactiva'}
                                                </Typography>
                                                <Typography variant="caption" color={colors.secondaryText}>
                                                    {formData.estado === 1 ? 'Visible para pacientes' : 'Oculta para pacientes'}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Stack>
                </DialogContent>
                <Divider sx={{ borderColor: colors.border }} />
                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        disabled={loading}
                        sx={{
                            borderRadius: '16px',
                            px: 3,
                            py: 1.5,
                            color: colors.secondaryText,
                            fontWeight: 700,
                            fontSize: '1rem'
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSaveRecompensa}
                        variant="contained"
                        disabled={loading}
                        sx={{
                            borderRadius: '16px',
                            background: colors.gradient,
                            px: 4,
                            py: 1.5,
                            fontWeight: 700,
                            fontSize: '1rem',
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

            {/* Dialog Eliminar */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                PaperProps={{
                    sx: {
                        background: colors.paper,
                        borderRadius: '28px',
                        boxShadow: '0 24px 72px rgba(0,0,0,0.3)'
                    }
                }}
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '16px',
                                backgroundColor: alpha(colors.error, 0.15),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <DeleteIcon sx={{ color: colors.error, fontSize: 28 }} />
                        </Box>
                        <Typography variant="h6" fontWeight={800} color={colors.text}>
                            ¿Eliminar Recompensa?
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Typography color={colors.text} gutterBottom fontWeight={600}>
                        ¿Estás seguro de eliminar <strong>"{selectedRecompensa?.nombre}"</strong>?
                    </Typography>
                    <Typography variant="body2" color={colors.secondaryText}>
                        ⚠️ Esta acción no se puede deshacer y se eliminará permanentemente del sistema.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button 
                        onClick={() => setOpenDeleteDialog(false)} 
                        disabled={loading}
                        sx={{
                            borderRadius: '16px',
                            px: 3,
                            py: 1.5,
                            fontWeight: 700
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDeleteRecompensa}
                        variant="contained"
                        disabled={loading}
                        sx={{
                            borderRadius: '16px',
                            backgroundColor: colors.error,
                            px: 4,
                            py: 1.5,
                            fontWeight: 700,
                            '&:hover': {
                                backgroundColor: colors.error,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 8px 24px ${alpha(colors.error, 0.5)}`
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : '🗑️ Eliminar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Notificaciones
                open={notification.open}
                message={notification.message}
                type={notification.type}
                handleClose={() => setNotification({ ...notification, open: false })}
            />
        </Box>
    );
};

export default GestionRecompensas;