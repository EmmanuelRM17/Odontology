import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, CardContent, Typography, Chip, Grid, Paper, LinearProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar,
    Tabs, Tab, Divider, CircularProgress, Tooltip, Fade, Zoom, Slide,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    useTheme, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem,
    Backdrop, IconButton, Stack, Badge, Skeleton, Container, Fab
} from '@mui/material';
import {
    MedicalServices, EventAvailable, Schedule, Assignment, CheckCircle,
    Person, DateRange, Visibility, Search, FilterList, CalendarToday,
    TrendingUp, Info, AccessTime, Timeline, LocalHospital, Favorite,
    AutoAwesome, PlayArrow, Pause, Stop, RestartAlt, KeyboardArrowRight,
    MoreVert, Share, Download, Print, Close, CheckCircleOutline,
    PendingActions, HourglassTop, Cancel, Star, Stars, EmojiEvents,
    Healing, Psychology, SelfImprovement, HealthAndSafety, AccountCircle,
    MonetizationOn, Business, Report, Analytics, Assessment, Dashboard,
    Category, ViewList, ViewModule, Notes, Description, PersonPin,
    MedicalInformation, Medication, Science, Biotech, FiberManualRecord
} from '@mui/icons-material';
import { useAuth } from '../../../components/Tools/AuthContext';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { alpha, styled, keyframes } from '@mui/material/styles';

// Animaciones personalizadas
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const pulseAnimation = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

// Componentes estilizados
const GlassCard = styled(Card)(({ theme, glowColor = '#3B82F6' }) => ({
    background: theme.palette.mode === 'dark' 
        ? 'rgba(30, 41, 59, 0.7)' 
        : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    border: theme.palette.mode === 'dark'
        ? '1px solid rgba(255, 255, 255, 0.1)'
        : '1px solid rgba(0, 0, 0, 0.05)',
    borderRadius: '24px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: `linear-gradient(90deg, ${glowColor}, transparent, ${glowColor})`,
        opacity: 0,
        transition: 'opacity 0.3s ease'
    },
    '&:hover': {
        transform: 'translateY(-8px) scale(1.02)',
        boxShadow: theme.palette.mode === 'dark'
            ? '0 32px 64px rgba(0, 0, 0, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)'
            : '0 32px 64px rgba(0, 0, 0, 0.15), 0 0 40px rgba(59, 130, 246, 0.1)',
        '&::before': {
            opacity: 1
        }
    }
}));

const GradientButton = styled(Button)(({ theme, gradient }) => ({
    background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '16px',
    padding: '12px 24px',
    color: 'white',
    fontWeight: 600,
    textTransform: 'none',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        transition: 'left 0.5s ease'
    },
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
        '&::before': {
            left: '100%'
        }
    }
}));

const AnimatedProgress = styled(LinearProgress)(({ theme, color = '#3B82F6' }) => ({
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    '& .MuiLinearProgress-bar': {
        borderRadius: 6,
        background: `linear-gradient(90deg, ${color}, ${color}aa)`,
        position: 'relative',
        '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: `${gradientShift} 2s ease-in-out infinite`
        }
    }
}));

const FloatingActionCard = styled(Paper)(({ theme }) => ({
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 1000,
    borderRadius: '20px',
    padding: '16px',
    background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    animation: `${floatAnimation} 3s ease-in-out infinite`
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        background: theme.palette.mode === 'dark' 
            ? 'rgba(30, 41, 59, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden'
    }
}));

/**
 * Componente principal mejorado para tratamientos del paciente
 */
const TratamientosPaciente = () => {
    const { isDarkTheme } = useThemeContext();
    const { user } = useAuth();
    const theme = useTheme();

    // Estados principales
    const [tratamientos, setTratamientos] = useState([]);
    const [filteredTratamientos, setFilteredTratamientos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTratamiento, setSelectedTratamiento] = useState(null);
    const [citasTratamiento, setCitasTratamiento] = useState([]);
    
    // Estados para diálogos y animaciones
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [openCitasDialog, setOpenCitasDialog] = useState(false);
    const [isLoadingCitas, setIsLoadingCitas] = useState(false);
    const [animateCards, setAnimateCards] = useState(false);
    
    // Estados para filtros y búsqueda
    const [tabValue, setTabValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [viewMode, setViewMode] = useState('cards');
    
    // Estado para notificaciones
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        type: 'info'
    });

    // Paleta de colores sólidos y profesionales
    const colors = {
        background: isDarkTheme 
            ? 'linear-gradient(135deg, #1F2937 0%, #374151 50%, #4B5563 100%)'
            : 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 50%, #E5E7EB 100%)',
        paper: isDarkTheme ? 'rgba(55, 65, 81, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        primary: {
            main: '#1F2937',
            gradient: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
            light: '#4B5563'
        },
        secondary: {
            main: '#047857',
            gradient: 'linear-gradient(135deg, #047857 0%, #065F46 100%)',
            light: '#059669'
        },
        accent: {
            main: '#7C2D12',
            gradient: 'linear-gradient(135deg, #7C2D12 0%, #92400E 100%)',
            light: '#A16207'
        },
        success: {
            main: '#166534',
            gradient: 'linear-gradient(135deg, #166534 0%, #14532D 100%)',
            light: '#16A34A'
        },
        warning: {
            main: '#B45309',
            gradient: 'linear-gradient(135deg, #B45309 0%, #A16207 100%)',
            light: '#D97706'
        },
        error: {
            main: '#B91C1C',
            gradient: 'linear-gradient(135deg, #B91C1C 0%, #991B1B 100%)',
            light: '#DC2626'
        },
        info: {
            main: '#0369A1',
            gradient: 'linear-gradient(135deg, #0369A1 0%, #075985 100%)',
            light: '#0284C7'
        },
        text: isDarkTheme ? '#F9FAFB' : '#2146C0',
        textSecondary: isDarkTheme ? '#9CA3AF' : '#6B7280',
        glass: isDarkTheme 
            ? 'rgba(55, 65, 81, 0.8)' 
            : 'rgba(255, 255, 255, 0.9)',
        border: isDarkTheme ? 'rgba(156, 163, 175, 0.2)' : 'rgba(29, 60, 123, 0.51)'
    };

    // Función para obtener configuración del estado
    const getStatusConfig = (estado) => {
        switch (estado) {
            case 'Activo':
                return {
                    color: colors.success.main,
                    gradient: colors.success.gradient,
                    icon: PlayArrow
                };
            case 'Finalizado':
                return {
                    color: colors.info.main,
                    gradient: colors.info.gradient,
                    icon: CheckCircleOutline
                };
            case 'Pendiente':
                return {
                    color: colors.warning.main,
                    gradient: colors.warning.gradient,
                    icon: PendingActions
                };
            case 'Pre-Registro':
                return {
                    color: colors.accent.main,
                    gradient: colors.accent.gradient,
                    icon: HourglassTop
                };
            case 'Abandonado':
                return {
                    color: colors.error.main,
                    gradient: colors.error.gradient,
                    icon: Cancel
                };
            default:
                return {
                    color: colors.textSecondary,
                    gradient: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
                    icon: Info
                };
        }
    };

    // Función para obtener tratamientos del paciente
    const fetchTratamientos = useCallback(async () => {
        if (!user?.id) return;
        
        setIsLoading(true);
        try {
            const response = await fetch(`https://back-end-4803.onrender.com/api/tratamientos/all`);
            if (!response.ok) throw new Error('Error al obtener tratamientos');
            
            const allTratamientos = await response.json();
            const pacienteTratamientos = allTratamientos.filter(tratamiento => 
                tratamiento.paciente_id === user.id
            );
            
            setTratamientos(pacienteTratamientos);
            setFilteredTratamientos(pacienteTratamientos);
            
            // Activar animación de cards
            setTimeout(() => setAnimateCards(true), 100);
        } catch (error) {
            console.error('Error al cargar tratamientos:', error);
            setNotification({
                open: true,
                message: 'Error al cargar los tratamientos. Intente nuevamente.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    // Cargar tratamientos al montar
    useEffect(() => {
        fetchTratamientos();
    }, [fetchTratamientos]);

    // Aplicar filtros
    useEffect(() => {
        applyFilters();
    }, [searchTerm, statusFilter, tabValue, tratamientos]);

    const applyFilters = () => {
        let filtered = tratamientos;

        // Filtro por pestaña
        if (tabValue === 1) filtered = filtered.filter(t => t.estado === 'Activo');
        else if (tabValue === 2) filtered = filtered.filter(t => t.estado === 'Finalizado');
        else if (tabValue === 3) filtered = filtered.filter(t => 
            t.estado === 'Pendiente' || t.estado === 'Pre-Registro' || t.estado === 'Abandonado'
        );

        // Filtro por búsqueda
        if (searchTerm) {
            filtered = filtered.filter(tratamiento =>
                tratamiento.nombre_tratamiento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tratamiento.categoria_servicio?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtro adicional por estado
        if (statusFilter !== 'todos') {
            filtered = filtered.filter(t => t.estado === statusFilter);
        }

        setFilteredTratamientos(filtered);
    };

    // Calcular progreso con animación
    const calcularProgreso = (tratamiento) => {
        if (!tratamiento.total_citas_programadas) return 0;
        return Math.round((tratamiento.citas_completadas / tratamiento.total_citas_programadas) * 100);
    };

    // Formatear fechas
    const formatDate = (dateString) => {
        if (!dateString) return 'No definida';
        try {
            return new Date(dateString).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return 'Fecha inválida';
        }
    };

    // Obtener próxima cita
    const getProximaCita = (tratamiento) => {
        if (tratamiento.estado === 'Activo') {
            const fechaBase = new Date();
            fechaBase.setDate(fechaBase.getDate() + 7);
            return fechaBase.toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'short'
            });
        }
        return null;
    };

    // Manejar vista de detalles
    const handleViewDetails = (tratamiento) => {
        setSelectedTratamiento(tratamiento);
        setOpenDetailsDialog(true);
    };

    // Ver citas del tratamiento
    const handleViewCitas = async (tratamientoId) => {
        setIsLoadingCitas(true);
        try {
            const response = await fetch(`https://back-end-4803.onrender.com/api/tratamientos/${tratamientoId}/citas`);
            if (!response.ok) throw new Error('Error al obtener citas');
            
            const citas = await response.json();
            setCitasTratamiento(citas);
            setOpenCitasDialog(true);
        } catch (error) {
            console.error('Error al cargar citas:', error);
            setNotification({
                open: true,
                message: 'Error al cargar las citas del tratamiento.',
                type: 'error'
            });
        } finally {
            setIsLoadingCitas(false);
        }
    };

    // Cambiar pestaña
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Obtener estadísticas del paciente
    const getStats = () => {
        const activos = tratamientos.filter(t => t.estado === 'Activo').length;
        const finalizados = tratamientos.filter(t => t.estado === 'Finalizado').length;
        const pendientes = tratamientos.filter(t => t.estado === 'Pendiente').length;
        const total = tratamientos.length;
        
        return { activos, finalizados, pendientes, total };
    };

    // Renderizar tarjeta premium de tratamiento
    const renderTratamientoCard = (tratamiento, index) => {
        const statusConfig = getStatusConfig(tratamiento.estado);
        const progreso = calcularProgreso(tratamiento);
        const proximaCita = getProximaCita(tratamiento);
        const IconComponent = statusConfig.icon;
        
        return (
            <Grid item xs={12} sm={6} lg={4} key={tratamiento.id}>
                <Zoom in={animateCards} timeout={300 + index * 100}>
                    <GlassCard glowColor={statusConfig.color}>
                        {/* Header con gradiente */}
                        <Box
                            sx={{
                                background: statusConfig.gradient,
                                p: 3,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Efecto de brillo */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: -50,
                                    right: -50,
                                    width: 100,
                                    height: 100,
                                    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                                    borderRadius: '50%'
                                }}
                            />
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: 'white',
                                            fontWeight: 700,
                                            mb: 1,
                                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        {tratamiento.nombre_tratamiento}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'rgba(255,255,255,0.9)',
                                            mb: 2,
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Category sx={{ fontSize: 16, mr: 0.5 }} />
                                        {tratamiento.categoria_servicio || 'General'}
                                    </Typography>
                                    
                                    {proximaCita && (
                                        <Chip
                                            icon={<CalendarToday sx={{ fontSize: 16 }} />}
                                            label={`Próxima: ${proximaCita}`}
                                            size="small"
                                            sx={{
                                                backgroundColor: 'rgba(255,255,255,0.2)',
                                                color: 'white',
                                                backdropFilter: 'blur(10px)',
                                                fontWeight: 500
                                            }}
                                        />
                                    )}
                                </Box>
                                
                                <Avatar
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        border: '2px solid rgba(255,255,255,0.3)'
                                    }}
                                >
                                    <IconComponent sx={{ fontSize: 28, color: 'white' }} />
                                </Avatar>
                            </Box>
                        </Box>

                        <CardContent sx={{ p: 3 }}>
                            {/* Información del tratamiento */}
                            <Stack spacing={2}>
                                {/* Fechas */}
                                <Box>
                                    <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                            <DateRange sx={{ fontSize: 16, color: colors.primary.main, mr: 1 }} />
                                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                                Inicio
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ color: colors.text, fontWeight: 500 }}>
                                            {formatDate(tratamiento.fecha_inicio)}
                                        </Typography>
                                    </Stack>
                                    
                                    <Stack direction="row" spacing={2}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                            <Schedule sx={{ fontSize: 16, color: colors.warning.main, mr: 1 }} />
                                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                                Fin estimado
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ color: colors.text, fontWeight: 500 }}>
                                            {formatDate(tratamiento.fecha_estimada_fin)}
                                        </Typography>
                                    </Stack>
                                </Box>

                                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                                {/* Progreso con animación */}
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                                            <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                                            Progreso del tratamiento
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ color: statusConfig.color, fontWeight: 700 }}>
                                                {progreso}%
                                            </Typography>
                                            {progreso === 100 && (
                                                <EmojiEvents sx={{ fontSize: 16, color: colors.warning.main, ml: 0.5 }} />
                                            )}
                                        </Box>
                                    </Box>
                                    
                                    <AnimatedProgress
                                        variant="determinate"
                                        value={progreso}
                                        color={statusConfig.color}
                                    />
                                    
                                    <Typography variant="caption" sx={{ color: colors.textSecondary, mt: 0.5, display: 'flex', alignItems: 'center' }}>
                                        <Assignment sx={{ fontSize: 14, mr: 0.5 }} />
                                        {tratamiento.citas_completadas} de {tratamiento.total_citas_programadas} citas completadas
                                    </Typography>
                                </Box>

                                {/* Costo y odontólogo */}
                                <Stack direction="row" spacing={2}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'flex', alignItems: 'center' }}>
                                            <MonetizationOn sx={{ fontSize: 14, mr: 0.5 }} />
                                            Costo total
                                        </Typography>
                                        <Typography variant="h6" sx={{ color: colors.success.main, fontWeight: 700 }}>
                                            ${parseFloat(tratamiento.costo_total || 0).toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'flex', alignItems: 'center' }}>
                                            <PersonPin sx={{ fontSize: 14, mr: 0.5 }} />
                                            Odontólogo
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: colors.text, fontWeight: 500 }}>
                                            {tratamiento.odontologo_nombre || 'No asignado'}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Stack>

                            {/* Acciones */}
                            <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                                <GradientButton
                                    variant="contained"
                                    size="small"
                                    startIcon={<Visibility />}
                                    onClick={() => handleViewDetails(tratamiento)}
                                    gradient={statusConfig.gradient}
                                    sx={{ flex: 1 }}
                                >
                                    Detalles
                                </GradientButton>
                                
                                <GradientButton
                                    variant="outlined"
                                    size="small"
                                    startIcon={<EventAvailable />}
                                    onClick={() => handleViewCitas(tratamiento.id)}
                                    gradient="linear-gradient(135deg, transparent 0%, transparent 100%)"
                                    sx={{
                                        flex: 1,
                                        background: 'transparent',
                                        border: `2px solid ${statusConfig.color}`,
                                        color: statusConfig.color,
                                        '&:hover': {
                                            background: `${statusConfig.color}20`,
                                            border: `2px solid ${statusConfig.color}`,
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    Citas
                                </GradientButton>
                            </Stack>
                        </CardContent>

                        {/* Indicador de estado flotante */}
                        <Chip
                            label={tratamiento.estado}
                            sx={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                background: statusConfig.gradient,
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                borderRadius: '12px',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                            }}
                        />
                    </GlassCard>
                </Zoom>
            </Grid>
        );
    };

    // Obtener estadísticas
    const stats = getStats();

    // Loading mejorado con skeletons
    if (isLoading) {
        return (
            <Box sx={{ minHeight: '100vh', background: colors.background, p: 3 }}>
                <Container maxWidth="xl">
                    {/* Header skeleton */}
                    <Paper
                        sx={{
                            background: colors.glass,
                            backdropFilter: 'blur(20px)',
                            borderRadius: '28px',
                            p: 4,
                            mb: 4,
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <Skeleton
                            variant="rectangular"
                            height={120}
                            sx={{
                                borderRadius: '16px',
                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                            }}
                        />
                    </Paper>
                    
                    {/* Cards skeleton */}
                    <Grid container spacing={3}>
                        {[...Array(6)].map((_, index) => (
                            <Grid item xs={12} sm={6} lg={4} key={index}>
                                <Skeleton
                                    variant="rectangular"
                                    height={400}
                                    sx={{
                                        borderRadius: '24px',
                                        bgcolor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                                    }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', background: colors.background, position: 'relative' }}>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header premium */}
                <Fade in timeout={800}>
                    <Paper
                        elevation={0}
                        sx={{
                            background: colors.glass,
                            backdropFilter: 'blur(20px)',
                            borderRadius: '28px',
                            p: 4,
                            mb: 4,
                            border: '1px solid rgba(255,255,255,0.1)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Efecto de fondo animado */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(45deg, rgba(59,130,246,0.05) 0%, rgba(139,92,246,0.05) 50%, rgba(16,185,129,0.05) 100%)',
                                backgroundSize: '400% 400%',
                                animation: `${gradientShift} 8s ease infinite`,
                                zIndex: -1
                            }}
                        />

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Avatar
                                sx={{
                                    width: 64,
                                    height: 64,
                                    background: colors.primary.gradient,
                                    mr: 3,
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                                }}
                            >
                                <HealthAndSafety sx={{ fontSize: 32 }} />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        color: colors.text,
                                        fontWeight: 800,
                                        mb: 1,
                                        background: colors.primary.gradient,
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}
                                >
                                    Mis Tratamientos
                                </Typography>
                                <Typography variant="h6" sx={{ color: colors.textSecondary, fontWeight: 400, display: 'flex', alignItems: 'center' }}>
                                    <Timeline sx={{ fontSize: 20, mr: 1 }} />
                                    Monitorea el progreso de tu salud dental
                                </Typography>
                            </Box>
                            
                            {/* Stats rápidas */}
                            <Grid container spacing={2} sx={{ width: 'auto' }}>
                                <Grid item>
                                    <Paper
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            background: colors.success.gradient,
                                            color: 'white',
                                            borderRadius: '16px',
                                            minWidth: 80,
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                        }}
                                    >
                                        <PlayArrow sx={{ fontSize: 20, mb: 0.5 }} />
                                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                            {stats.activos}
                                        </Typography>
                                        <Typography variant="caption">
                                            Activos
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item>
                                    <Paper
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            background: colors.info.gradient,
                                            color: 'white',
                                            borderRadius: '16px',
                                            minWidth: 80,
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                        }}
                                    >
                                        <CheckCircleOutline sx={{ fontSize: 20, mb: 0.5 }} />
                                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                            {stats.finalizados}
                                        </Typography>
                                        <Typography variant="caption">
                                            Finalizados
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item>
                                    <Paper
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            background: colors.accent.gradient,
                                            color: 'white',
                                            borderRadius: '16px',
                                            minWidth: 80,
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                        }}
                                    >
                                        <Dashboard sx={{ fontSize: 20, mb: 0.5 }} />
                                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                            {stats.total}
                                        </Typography>
                                        <Typography variant="caption">
                                            Total
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Controles avanzados */}
                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Buscar tratamiento"
                                    variant="outlined"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search sx={{ color: colors.primary.main }} />
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: colors.glass,
                                            backdropFilter: 'blur(10px)',
                                            borderRadius: '16px',
                                            '& fieldset': {
                                                borderColor: 'rgba(255,255,255,0.2)',
                                                borderWidth: 2
                                            },
                                            '&:hover fieldset': {
                                                borderColor: colors.primary.main,
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: colors.primary.main,
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                            }
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: colors.textSecondary,
                                            fontWeight: 500
                                        },
                                        '& .MuiInputBase-input': {
                                            color: colors.text,
                                            fontWeight: 500
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel sx={{ color: colors.textSecondary, fontWeight: 500 }}>
                                        Filtrar por estado
                                    </InputLabel>
                                    <Select
                                        value={statusFilter}
                                        label="Filtrar por estado"
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        sx={{
                                            backgroundColor: colors.glass,
                                            backdropFilter: 'blur(10px)',
                                            borderRadius: '16px',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'rgba(255,255,255,0.2)',
                                                borderWidth: 2
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: colors.primary.main,
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: colors.primary.main,
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                            },
                                            '& .MuiSelect-select': {
                                                color: colors.text,
                                                fontWeight: 500
                                            }
                                        }}
                                    >
                                        <MenuItem value="todos">
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <ViewList sx={{ mr: 1, fontSize: 18 }} />
                                                Todos los estados
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="Activo">
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <PlayArrow sx={{ mr: 1, fontSize: 18, color: colors.success.main }} />
                                                Activo
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="Pendiente">
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <PendingActions sx={{ mr: 1, fontSize: 18, color: colors.warning.main }} />
                                                Pendiente
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="Finalizado">
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <CheckCircleOutline sx={{ mr: 1, fontSize: 18, color: colors.info.main }} />
                                                Finalizado
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="Pre-Registro">
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <HourglassTop sx={{ mr: 1, fontSize: 18, color: colors.accent.main }} />
                                                Pre-Registro
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="Abandonado">
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Cancel sx={{ mr: 1, fontSize: 18, color: colors.error.main }} />
                                                Abandonado
                                            </Box>
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        {/* Tabs premium */}
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            sx={{
                                '& .MuiTabs-indicator': {
                                    height: 4,
                                    borderRadius: '2px',
                                    background: colors.primary.gradient,
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                                },
                                '& .MuiTab-root': {
                                    color: colors.textSecondary,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    minHeight: 48,
                                    '&.Mui-selected': {
                                        color: colors.primary.main,
                                        fontWeight: 700
                                    }
                                }
                            }}
                        >
                            <Tab 
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <ViewList sx={{ mr: 1, fontSize: 18 }} />
                                        Todos
                                    </Box>
                                } 
                            />
                            <Tab 
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <PlayArrow sx={{ mr: 1, fontSize: 18 }} />
                                        Activos
                                    </Box>
                                } 
                            />
                            <Tab 
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <EmojiEvents sx={{ mr: 1, fontSize: 18 }} />
                                        Finalizados
                                    </Box>
                                } 
                            />
                            <Tab 
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <MoreVert sx={{ mr: 1, fontSize: 18 }} />
                                        Otros
                                    </Box>
                                } 
                            />
                        </Tabs>
                    </Paper>
                </Fade>

                {/* Grid de tratamientos */}
                {filteredTratamientos.length > 0 ? (
                    <Grid container spacing={3}>
                        {filteredTratamientos.map(renderTratamientoCard)}
                    </Grid>
                ) : (
                    <Fade in timeout={600}>
                        <Paper
                            sx={{
                                textAlign: 'center',
                                py: 8,
                                background: colors.glass,
                                backdropFilter: 'blur(20px)',
                                borderRadius: '28px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 120,
                                    height: 120,
                                    mx: 'auto',
                                    mb: 3,
                                    background: colors.primary.gradient,
                                    opacity: 0.7
                                }}
                            >
                                <MedicalServices sx={{ fontSize: 60 }} />
                            </Avatar>
                            <Typography variant="h5" sx={{ color: colors.text, fontWeight: 600, mb: 2 }}>
                                No se encontraron tratamientos
                            </Typography>
                            <Typography variant="body1" sx={{ color: colors.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Info sx={{ mr: 1, fontSize: 20 }} />
                                {searchTerm || statusFilter !== 'todos' 
                                    ? 'Intenta ajustar los filtros de búsqueda'
                                    : 'Aún no tienes tratamientos registrados'
                                }
                            </Typography>
                        </Paper>
                    </Fade>
                )}
            </Container>

            {/* Diálogo de detalles del tratamiento */}
            <StyledDialog
                open={openDetailsDialog}
                onClose={() => setOpenDetailsDialog(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedTratamiento && (
                    <>
                        <DialogTitle
                            sx={{
                                background: getStatusConfig(selectedTratamiento.estado).gradient,
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                p: 3,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Efecto de brillo en el header */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: -30,
                                    right: -30,
                                    width: 60,
                                    height: 60,
                                    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                                    borderRadius: '50%'
                                }}
                            />
                            
                            <MedicalServices sx={{ mr: 2, fontSize: 28 }} />
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                                    {selectedTratamiento.nombre_tratamiento}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9, display: 'flex', alignItems: 'center' }}>
                                    <FiberManualRecord sx={{ fontSize: 8, mr: 1 }} />
                                    Tratamiento #{selectedTratamiento.id}
                                </Typography>
                            </Box>
                            
                            <Chip
                                label={selectedTratamiento.estado}
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    fontWeight: 600,
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.3)'
                                }}
                            />
                        </DialogTitle>

                        <DialogContent sx={{ p: 0 }}>
                            {/* Contenedor principal con padding */}
                            <Box sx={{ p: 3 }}>
                                <Grid container spacing={3}>
                                    {/* Información general */}
                                    <Grid item xs={12} md={6}>
                                        <Paper
                                            sx={{
                                                p: 3,
                                                background: colors.glass,
                                                backdropFilter: 'blur(10px)',
                                                borderRadius: '16px',
                                                border: '1px solid rgba(255,255,255,0.1)'
                                            }}
                                        >
                                            <Typography variant="h6" sx={{ 
                                                color: colors.primary.main, 
                                                mb: 2, 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                fontWeight: 600
                                            }}>
                                                <Info sx={{ mr: 1 }} />
                                                Información General
                                            </Typography>
                                            <Stack spacing={2}>
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'flex', alignItems: 'center' }}>
                                                        <Category sx={{ fontSize: 14, mr: 0.5 }} />
                                                        Categoría
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ color: colors.text, fontWeight: 500 }}>
                                                        {selectedTratamiento.categoria_servicio || 'General'}
                                                    </Typography>
                                                </Box>
                                                
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'flex', alignItems: 'center' }}>
                                                        <PersonPin sx={{ fontSize: 14, mr: 0.5 }} />
                                                        Odontólogo
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ color: colors.text, fontWeight: 500 }}>
                                                        {selectedTratamiento.odontologo_nombre || 'No asignado'}
                                                    </Typography>
                                                </Box>
                                                
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'flex', alignItems: 'center' }}>
                                                        <MonetizationOn sx={{ fontSize: 14, mr: 0.5 }} />
                                                        Costo total
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ color: colors.success.main, fontWeight: 700 }}>
                                                        ${parseFloat(selectedTratamiento.costo_total || 0).toFixed(2)}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    </Grid>

                                    {/* Fechas y progreso */}
                                    <Grid item xs={12} md={6}>
                                        <Paper
                                            sx={{
                                                p: 3,
                                                background: colors.glass,
                                                backdropFilter: 'blur(10px)',
                                                borderRadius: '16px',
                                                border: '1px solid rgba(255,255,255,0.1)'
                                            }}
                                        >
                                            <Typography variant="h6" sx={{ 
                                                color: colors.primary.main, 
                                                mb: 2, 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                fontWeight: 600
                                            }}>
                                                <Timeline sx={{ mr: 1 }} />
                                                Fechas y Progreso
                                            </Typography>
                                            <Stack spacing={2}>
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'flex', alignItems: 'center' }}>
                                                        <DateRange sx={{ fontSize: 14, mr: 0.5 }} />
                                                        Fecha de inicio
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ color: colors.text, fontWeight: 500 }}>
                                                        {formatDate(selectedTratamiento.fecha_inicio)}
                                                    </Typography>
                                                </Box>
                                                
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'flex', alignItems: 'center' }}>
                                                        <Schedule sx={{ fontSize: 14, mr: 0.5 }} />
                                                        Fecha estimada de fin
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ color: colors.text, fontWeight: 500 }}>
                                                        {formatDate(selectedTratamiento.fecha_estimada_fin)}
                                                    </Typography>
                                                </Box>
                                                
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'flex', alignItems: 'center' }}>
                                                        <TrendingUp sx={{ fontSize: 14, mr: 0.5 }} />
                                                        Progreso del tratamiento
                                                    </Typography>
                                                    <Box sx={{ mt: 1 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                            <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
                                                                {calcularProgreso(selectedTratamiento)}%
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                                                {selectedTratamiento.citas_completadas}/{selectedTratamiento.total_citas_programadas} citas
                                                            </Typography>
                                                        </Box>
                                                        <AnimatedProgress
                                                            variant="determinate"
                                                            value={calcularProgreso(selectedTratamiento)}
                                                            color={getStatusConfig(selectedTratamiento.estado).color}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    </Grid>

                                    {/* Notas */}
                                    {selectedTratamiento.notas && (
                                        <Grid item xs={12}>
                                            <Paper
                                                sx={{
                                                    p: 3,
                                                    background: colors.glass,
                                                    backdropFilter: 'blur(10px)',
                                                    borderRadius: '16px',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }}
                                            >
                                                <Typography variant="h6" sx={{ 
                                                    color: colors.primary.main, 
                                                    mb: 2, 
                                                    display: 'flex', 
                                                    alignItems: 'center',
                                                    fontWeight: 600
                                                }}>
                                                    <Notes sx={{ mr: 1 }} />
                                                    Notas del Tratamiento
                                                </Typography>
                                                <Paper
                                                    sx={{
                                                        p: 2,
                                                        backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
                                                        borderRadius: '12px',
                                                        whiteSpace: 'pre-line',
                                                        border: `1px solid ${colors.primary.main}20`
                                                    }}
                                                >
                                                    <Typography variant="body2" sx={{ color: colors.text, lineHeight: 1.6 }}>
                                                        {selectedTratamiento.notas}
                                                    </Typography>
                                                </Paper>
                                            </Paper>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        </DialogContent>

                        <DialogActions sx={{ p: 3, bgcolor: isDarkTheme ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }}>
                            <GradientButton
                                onClick={() => setOpenDetailsDialog(false)}
                                variant="outlined"
                                gradient="transparent"
                                sx={{
                                    background: 'transparent',
                                    border: `2px solid ${colors.textSecondary}`,
                                    color: colors.textSecondary,
                                    '&:hover': {
                                        background: `${colors.textSecondary}20`,
                                        border: `2px solid ${colors.textSecondary}`
                                    }
                                }}
                            >
                                <Close sx={{ mr: 1 }} />
                                Cerrar
                            </GradientButton>
                            <GradientButton
                                onClick={() => {
                                    setOpenDetailsDialog(false);
                                    handleViewCitas(selectedTratamiento.id);
                                }}
                                variant="contained"
                                startIcon={<EventAvailable />}
                                gradient={getStatusConfig(selectedTratamiento.estado).gradient}
                            >
                                Ver Citas
                            </GradientButton>
                        </DialogActions>
                    </>
                )}
            </StyledDialog>

            {/* Diálogo de citas del tratamiento */}
            <StyledDialog
                open={openCitasDialog}
                onClose={() => setOpenCitasDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle
                    sx={{
                        background: colors.secondary.gradient,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        p: 3
                    }}
                >
                    <EventAvailable sx={{ mr: 2, fontSize: 28 }} />
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            Citas del Tratamiento
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Historial de citas programadas
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                    {isLoadingCitas ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <CircularProgress sx={{ color: colors.primary.main, mb: 2 }} size={60} />
                            <Typography sx={{ color: colors.textSecondary, fontSize: '1.1rem' }}>
                                Cargando citas del tratamiento...
                            </Typography>
                        </Box>
                    ) : citasTratamiento.length > 0 ? (
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ 
                                    background: colors.glass,
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <TableRow>
                                        <TableCell sx={{ color: colors.text, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                                            <Assignment sx={{ mr: 1, fontSize: 18 }} />
                                            Cita #
                                        </TableCell>
                                        <TableCell sx={{ color: colors.text, fontWeight: 600 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <DateRange sx={{ mr: 1, fontSize: 18 }} />
                                                Fecha
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ color: colors.text, fontWeight: 600 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <AccessTime sx={{ mr: 1, fontSize: 18 }} />
                                                Hora
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ color: colors.text, fontWeight: 600 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Info sx={{ mr: 1, fontSize: 18 }} />
                                                Estado
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {citasTratamiento.map((cita, index) => (
                                        <TableRow 
                                            key={cita.consulta_id || index}
                                            sx={{ 
                                                '&:hover': { 
                                                    backgroundColor: colors.glass,
                                                    backdropFilter: 'blur(10px)'
                                                },
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <TableCell sx={{ color: colors.text, fontWeight: 500 }}>
                                                <Chip
                                                    label={cita.numero_cita_tratamiento || index + 1}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: colors.primary.main,
                                                        color: 'white',
                                                        fontWeight: 600
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: colors.text }}>
                                                {formatDate(cita.fecha_consulta)}
                                            </TableCell>
                                            <TableCell sx={{ color: colors.text }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <AccessTime sx={{ mr: 1, fontSize: 16, color: colors.primary.main }} />
                                                    {cita.hora || 'No especificada'}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={cita.estado}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: getStatusConfig(
                                                            cita.estado === 'Confirmada' ? 'Activo' : cita.estado
                                                        ).color,
                                                        color: 'white',
                                                        fontWeight: 500
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box sx={{ p: 6, textAlign: 'center' }}>
                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    mx: 'auto',
                                    mb: 2,
                                    background: colors.textSecondary,
                                    opacity: 0.7
                                }}
                            >
                                <CalendarToday sx={{ fontSize: 40 }} />
                            </Avatar>
                            <Typography variant="h6" sx={{ color: colors.text, mb: 1, fontWeight: 600 }}>
                                No hay citas programadas
                            </Typography>
                            <Typography sx={{ color: colors.textSecondary }}>
                                Este tratamiento aún no tiene citas asociadas
                            </Typography>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 3, bgcolor: isDarkTheme ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }}>
                    <GradientButton
                        onClick={() => setOpenCitasDialog(false)}
                        variant="outlined"
                        gradient="transparent"
                        sx={{
                            background: 'transparent',
                            border: `2px solid ${colors.textSecondary}`,
                            color: colors.textSecondary,
                            '&:hover': {
                                background: `${colors.textSecondary}20`,
                                border: `2px solid ${colors.textSecondary}`
                            }
                        }}
                    >
                        <Close sx={{ mr: 1 }} />
                        Cerrar
                    </GradientButton>
                </DialogActions>
            </StyledDialog>

            {/* Componente de notificaciones */}
            <Notificaciones
                open={notification.open}
                message={notification.message}
                type={notification.type}
                handleClose={() => setNotification({ ...notification, open: false })}
            />
        </Box>
    );
};

export default TratamientosPaciente;