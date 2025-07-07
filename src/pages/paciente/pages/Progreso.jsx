import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Paper, Avatar, Divider,
  Tabs, Tab, Button, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Slider, Switch, FormControlLabel, Chip, Stack,
  LinearProgress, CircularProgress, Tooltip, Fade, Zoom, Collapse,
  Alert, AlertTitle, TextField, MenuItem, Select, FormControl,
  InputLabel, Skeleton, Container, Fab, List, ListItem, ListItemText,
  ListItemIcon, ListItemButton, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';

import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector,
  TimelineContent, TimelineDot, TimelineOppositeContent
} from '@mui/lab';

import {
  Timeline as TimelineIcon, PhotoCamera, Compare, TrendingUp, Assessment,
  CalendarToday, CheckCircle, Schedule, AutoAwesome, Visibility, Download,
  Share, Print, ZoomIn, ZoomOut, Fullscreen, Close, NavigateBefore,
  NavigateNext, PlayArrow, Pause, RestartAlt, Favorite, FavoriteBorder,
  Star, StarBorder, MoodBad, Mood, SentimentSatisfiedAlt, LocalHospital,
  Psychology, SelfImprovement, HealthAndSafety, MonitorHeart, DateRange,
  Notes, Analytics, CameraAlt, ViewCarousel, CompareArrows, BarChart,
  ShowChart, PieChart, Insights, EmojiEvents, Flag, LightbulbOutlined,
  CloudUpload, DeleteOutline, ExpandMore, Dashboard, SwapHoriz,
  TrendingDown, Warning, Info
} from '@mui/icons-material';

import { useAuth } from '../../../components/Tools/AuthContext';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    Filler
} from 'chart.js';
import { alpha, styled, keyframes } from '@mui/material/styles';

// Registrar componentes de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    ChartTooltip,
    Legend,
    Filler
);

// Animaciones
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(22, 101, 52, 0.4); }
  50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(22, 101, 52, 0); }
`;

// Componentes estilizados
const StyledCard = styled(Card)(({ theme, gradient }) => ({
    background: gradient || theme.palette.background.paper,
    borderRadius: '16px',
    boxShadow: theme.palette.mode === 'dark' 
        ? '0 4px 20px rgba(0,0,0,0.3)' 
        : '0 4px 20px rgba(0,0,0,0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 30px rgba(0,0,0,0.4)'
            : '0 8px 30px rgba(0,0,0,0.15)'
    }
}));

const GlassContainer = styled(Box)(({ theme }) => ({
    background: theme.palette.mode === 'dark' 
        ? 'rgba(55, 65, 81, 0.8)' 
        : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
    padding: theme.spacing(2),
    margin: theme.spacing(1, 0)
}));

const PhotoComparator = styled(Box)({
    position: 'relative',
    height: '300px',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    '& .before-image, & .after-image': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    '& .after-image': {
        clipPath: 'inset(0 50% 0 0)'
    },
    '& .slider-handle': {
        position: 'absolute',
        top: 0,
        left: '50%',
        height: '100%',
        width: '3px',
        backgroundColor: '#fff',
        cursor: 'ew-resize',
        zIndex: 10,
        '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '30px',
            height: '30px',
            backgroundColor: '#fff',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }
    }
});

/**
 * Componente principal del módulo de progreso del paciente
 */
const ProgresoPaciente = () => {
    const { isDarkTheme } = useThemeContext();
    const { user } = useAuth();

    // Estados principales
    const [tratamientos, setTratamientos] = useState([]);
    const [selectedTratamiento, setSelectedTratamiento] = useState(null);
    const [fotosProgreso, setFotosProgreso] = useState({ antes: [], durante: [], despues: [] });
    const [estadisticas, setEstadisticas] = useState({});
    const [viewMode, setViewMode] = useState('individual'); // 'individual' o 'consolidado'
    
    // Estados de UI
    const [tabValue, setTabValue] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [compareMode, setCompareMode] = useState(false);
    const [compareSlider, setCompareSlider] = useState(50);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    
    // Estado para notificaciones
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        type: 'info'
    });

    // Configuración de colores
    const colors = {
        background: isDarkTheme 
            ? 'linear-gradient(135deg, #1F2937 0%, #374151 50%, #4B5563 100%)'
            : 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 50%, #E5E7EB 100%)',
        paper: isDarkTheme ? '#374151' : '#FFFFFF',
        primary: {
            main: '#1F2937',
            light: '#4B5563',
            gradient: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)'
        },
        success: {
            main: '#166534',
            light: '#16A34A',
            gradient: 'linear-gradient(135deg, #166534 0%, #16A34A 100%)'
        },
        warning: {
            main: '#B45309',
            light: '#D97706',
            gradient: 'linear-gradient(135deg, #B45309 0%, #D97706 100%)'
        },
        error: {
            main: '#B91C1C',
            light: '#DC2626',
            gradient: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)'
        },
        info: {
            main: '#0369A1',
            light: '#0284C7',
            gradient: 'linear-gradient(135deg, #0369A1 0%, #0284C7 100%)'
        },
        text: isDarkTheme ? '#F9FAFB' : '#1F2937',
        textSecondary: isDarkTheme ? '#9CA3AF' : '#6B7280',
        divider: isDarkTheme ? '#4B5563' : '#E5E7EB'
    };

    // Función para obtener tratamientos del paciente
    const fetchTratamientos = useCallback(async () => {
        if (!user?.id) return;
        
        try {
            const response = await fetch(`https://back-end-4803.onrender.com/api/tratamientos/all`);
            if (!response.ok) throw new Error('Error al obtener tratamientos');
            
            const allTratamientos = await response.json();
            const pacienteTratamientos = allTratamientos.filter(t => t.paciente_id === user.id);
            
            setTratamientos(pacienteTratamientos);
            if (pacienteTratamientos.length > 0 && !selectedTratamiento) {
                setSelectedTratamiento(pacienteTratamientos[0]);
            }
        } catch (error) {
            console.error('Error al cargar tratamientos:', error);
            showNotification('Error al cargar los tratamientos.', 'error');
        }
    }, [user?.id, selectedTratamiento]);

    // Función para obtener fotos de progreso
    const fetchFotosProgreso = useCallback(async (tratamientoId) => {
        if (!tratamientoId) return;
        
        try {
            const response = await fetch(`https://back-end-4803.onrender.com/api/imagenes/progreso/tratamiento/${tratamientoId}`);
            if (!response.ok) throw new Error('Error al obtener fotos');
            
            const data = await response.json();
            if (data.success) {
                setFotosProgreso(data.data.fotos_por_tipo);
            }
        } catch (error) {
            console.error('Error al cargar fotos:', error);
            setFotosProgreso({ antes: [], durante: [], despues: [] });
        }
    }, []);

    // Función para obtener estadísticas del tratamiento
    const fetchEstadisticas = useCallback(async (tratamientoId) => {
        if (!tratamientoId) return;
        
        try {
            const response = await fetch(`https://back-end-4803.onrender.com/api/imagenes/progreso/stats/${tratamientoId}`);
            if (!response.ok) throw new Error('Error al obtener estadísticas');
            
            const data = await response.json();
            if (data.success) {
                setEstadisticas(data.data);
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            setEstadisticas({});
        }
    }, []);

    // Función helper para mostrar notificaciones
    const showNotification = (message, type = 'info') => {
        setNotification({ open: true, message, type });
    };

    // Cargar datos al montar y cuando cambie el tratamiento
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await fetchTratamientos();
            setIsLoading(false);
        };
        loadData();
    }, [fetchTratamientos]);

    useEffect(() => {
        if (selectedTratamiento && viewMode === 'individual') {
            fetchFotosProgreso(selectedTratamiento.id);
            fetchEstadisticas(selectedTratamiento.id);
        }
    }, [selectedTratamiento, viewMode, fetchFotosProgreso, fetchEstadisticas]);

    // Función para subir foto de progreso
    const handleUploadPhoto = async (file, tipo) => {
        if (!selectedTratamiento || !file) return;
        
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('image', file);
        formData.append('tratamiento_id', selectedTratamiento.id);
        formData.append('paciente_id', user.id);
        formData.append('tipo', tipo);
        formData.append('descripcion', `Foto ${tipo} del tratamiento`);

        try {
            const response = await fetch('https://back-end-4803.onrender.com/api/imagenes/progreso/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Error al subir foto');
            
            const data = await response.json();
            if (data.success) {
                showNotification('Foto subida correctamente', 'success');
                fetchFotosProgreso(selectedTratamiento.id);
                fetchEstadisticas(selectedTratamiento.id);
            }
        } catch (error) {
            console.error('Error al subir foto:', error);
            showNotification('Error al subir la foto', 'error');
        } finally {
            setUploadingPhoto(false);
        }
    };

    // Función para cambiar tratamiento seleccionado
    const handleTratamientoChange = (tratamiento) => {
        setSelectedTratamiento(tratamiento);
        setTabValue(0);
    };

    // Función para abrir visor de fotos
    const handlePhotoClick = (photo, index = 0) => {
        setSelectedPhoto(photo);
        setCurrentPhotoIndex(index);
        setDialogOpen(true);
    };

    // Calcular estadísticas consolidadas de todos los tratamientos
    const calcularEstadisticasConsolidadas = () => {
        if (tratamientos.length === 0) return {};
        
        const totalCitas = tratamientos.reduce((sum, t) => sum + (t.total_citas_programadas || 0), 0);
        const citasCompletadas = tratamientos.reduce((sum, t) => sum + (t.citas_completadas || 0), 0);
        const progresoPromedio = totalCitas > 0 ? Math.round((citasCompletadas / totalCitas) * 100) : 0;
        
        const tratamientosActivos = tratamientos.filter(t => t.estado === 'Activo').length;
        const tratamientosCompletados = tratamientos.filter(t => t.estado === 'Completado').length;
        
        return {
            totalTratamientos: tratamientos.length,
            tratamientosActivos,
            tratamientosCompletados,
            progresoPromedio,
            totalCitas,
            citasCompletadas,
            citasRestantes: totalCitas - citasCompletadas
        };
    };

    // Calcular estadísticas individuales
    const calcularEstadisticasIndividuales = () => {
        if (!selectedTratamiento) return {};
        
        const progreso = selectedTratamiento.total_citas_programadas 
            ? Math.round((selectedTratamiento.citas_completadas / selectedTratamiento.total_citas_programadas) * 100)
            : 0;
        
        return {
            progresoTratamiento: progreso,
            totalFotos: fotosProgreso.antes.length + fotosProgreso.durante.length + fotosProgreso.despues.length,
            citasCompletadas: selectedTratamiento.citas_completadas || 0,
            citasRestantes: (selectedTratamiento.total_citas_programadas - selectedTratamiento.citas_completadas) || 0
        };
    };

    const statsConsolidadas = calcularEstadisticasConsolidadas();
    const statsIndividuales = calcularEstadisticasIndividuales();

    if (isLoading) {
        return (
            <Box sx={{ minHeight: '100vh', background: colors.background, p: 2 }}>
                <Container maxWidth="xl">
                    <Grid container spacing={2}>
                        {[...Array(6)].map((_, index) => (
                            <Grid item xs={12} md={6} lg={4} key={index}>
                                <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', background: colors.background }}>
            <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* Header principal */}
                <Fade in timeout={600}>
                    <GlassContainer>
                        <Grid container alignItems="center" spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            background: colors.success.gradient,
                                            mr: 2,
                                            animation: `${pulseGlow} 2s infinite`
                                        }}
                                    >
                                        <TimelineIcon sx={{ fontSize: 24 }} />
                                    </Avatar>
                                    <Box>
                                        <Typography
                                            variant="h4"
                                            sx={{
                                                color: colors.text,
                                                fontWeight: 700,
                                                mb: 0.5,
                                                background: colors.success.gradient,
                                                backgroundClip: 'text',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent'
                                            }}
                                        >
                                            Mi Progreso
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                                            {tratamientos.length > 1 ? 
                                                `${tratamientos.length} tratamientos activos` : 
                                                'Seguimiento de tu evolución dental'
                                            }
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    {/* Switch para cambiar entre vistas */}
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={viewMode === 'consolidado'}
                                                onChange={(e) => setViewMode(e.target.checked ? 'consolidado' : 'individual')}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {viewMode === 'consolidado' ? <Dashboard sx={{ mr: 1 }} /> : <Assessment sx={{ mr: 1 }} />}
                                                <Typography variant="body2">
                                                    {viewMode === 'consolidado' ? 'Vista Consolidada' : 'Vista Individual'}
                                                </Typography>
                                            </Box>
                                        }
                                        sx={{ color: colors.text }}
                                    />
                                    
                                    {/* Selector de tratamiento solo en vista individual */}
                                    {viewMode === 'individual' && tratamientos.length > 1 && (
                                        <FormControl sx={{ minWidth: 200 }} size="small">
                                            <InputLabel sx={{ color: colors.textSecondary }}>
                                                Tratamiento
                                            </InputLabel>
                                            <Select
                                                value={selectedTratamiento?.id || ''}
                                                onChange={(e) => {
                                                    const tratamiento = tratamientos.find(t => t.id === e.target.value);
                                                    handleTratamientoChange(tratamiento);
                                                }}
                                                sx={{
                                                    color: colors.text,
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: colors.divider
                                                    }
                                                }}
                                            >
                                                {tratamientos.map((tratamiento) => (
                                                    <MenuItem key={tratamiento.id} value={tratamiento.id}>
                                                        {tratamiento.nombre_tratamiento}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}
                                </Stack>
                            </Grid>
                        </Grid>
                    </GlassContainer>
                </Fade>

                {/* Vista Consolidada */}
                {viewMode === 'consolidado' ? (
                    <>
                        {/* Métricas consolidadas */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={6} md={3}>
                                <StyledCard gradient={colors.primary.gradient}>
                                    <CardContent sx={{ p: 2, color: 'white', textAlign: 'center' }}>
                                        <LocalHospital sx={{ fontSize: 32, mb: 1 }} />
                                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                                            {statsConsolidadas.totalTratamientos}
                                        </Typography>
                                        <Typography variant="body2">Tratamientos</Typography>
                                    </CardContent>
                                </StyledCard>
                            </Grid>
                            
                            <Grid item xs={6} md={3}>
                                <StyledCard gradient={colors.success.gradient}>
                                    <CardContent sx={{ p: 2, color: 'white', textAlign: 'center' }}>
                                        <TrendingUp sx={{ fontSize: 32, mb: 1 }} />
                                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                                            {statsConsolidadas.progresoPromedio}%
                                        </Typography>
                                        <Typography variant="body2">Progreso</Typography>
                                    </CardContent>
                                </StyledCard>
                            </Grid>
                            
                            <Grid item xs={6} md={3}>
                                <StyledCard gradient={colors.info.gradient}>
                                    <CardContent sx={{ p: 2, color: 'white', textAlign: 'center' }}>
                                        <CheckCircle sx={{ fontSize: 32, mb: 1 }} />
                                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                                            {statsConsolidadas.citasCompletadas}
                                        </Typography>
                                        <Typography variant="body2">Citas Hechas</Typography>
                                    </CardContent>
                                </StyledCard>
                            </Grid>
                            
                            <Grid item xs={6} md={3}>
                                <StyledCard gradient={colors.warning.gradient}>
                                    <CardContent sx={{ p: 2, color: 'white', textAlign: 'center' }}>
                                        <Schedule sx={{ fontSize: 32, mb: 1 }} />
                                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                                            {statsConsolidadas.citasRestantes}
                                        </Typography>
                                        <Typography variant="body2">Pendientes</Typography>
                                    </CardContent>
                                </StyledCard>
                            </Grid>
                        </Grid>

                        {/* Lista de tratamientos */}
                        <Paper sx={{ backgroundColor: colors.paper, borderRadius: 2, p: 3 }}>
                            <Typography variant="h6" sx={{ color: colors.text, mb: 2, fontWeight: 600 }}>
                                Resumen de Tratamientos
                            </Typography>
                            
                            {tratamientos.map((tratamiento, index) => {
                                const progreso = tratamiento.total_citas_programadas 
                                    ? Math.round((tratamiento.citas_completadas / tratamiento.total_citas_programadas) * 100)
                                    : 0;
                                
                                return (
                                    <Accordion key={tratamiento.id} sx={{ mb: 1 }}>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.text }}>
                                                        {tratamiento.nombre_tratamiento}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                                        {tratamiento.citas_completadas}/{tratamiento.total_citas_programadas} citas completadas
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ mr: 2 }}>
                                                    <Chip 
                                                        label={tratamiento.estado}
                                                        color={
                                                            tratamiento.estado === 'Activo' ? 'success' :
                                                            tratamiento.estado === 'Completado' ? 'primary' :
                                                            'default'
                                                        }
                                                        size="small"
                                                    />
                                                </Box>
                                                <Box sx={{ minWidth: 80 }}>
                                                    <Typography variant="h6" sx={{ color: colors.success.main, fontWeight: 600 }}>
                                                        {progreso}%
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={8}>
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                                                            Progreso del tratamiento
                                                        </Typography>
                                                        <LinearProgress 
                                                            variant="determinate" 
                                                            value={progreso} 
                                                            sx={{ 
                                                                height: 8, 
                                                                borderRadius: 4,
                                                                '& .MuiLinearProgress-bar': {
                                                                    background: colors.success.gradient
                                                                }
                                                            }} 
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                                            <strong>Inicio:</strong> {new Date(tratamiento.fecha_inicio).toLocaleDateString()}
                                                        </Typography>
                                                        {tratamiento.fecha_fin && (
                                                            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                                                <strong>Fin:</strong> {new Date(tratamiento.fecha_fin).toLocaleDateString()}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <Button
                                                        variant="outlined"
                                                        fullWidth
                                                        onClick={() => {
                                                            setSelectedTratamiento(tratamiento);
                                                            setViewMode('individual');
                                                        }}
                                                        sx={{ 
                                                            borderColor: colors.primary.main,
                                                            color: colors.primary.main,
                                                            '&:hover': {
                                                                borderColor: colors.primary.light,
                                                                backgroundColor: alpha(colors.primary.main, 0.1)
                                                            }
                                                        }}
                                                    >
                                                        Ver Detalles
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>
                                );
                            })}
                        </Paper>
                    </>
                ) : (
                    /* Vista Individual (código anterior) */
                    <>
                        {/* Métricas individuales */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={6} md={3}>
                                <Zoom in timeout={400}>
                                    <StyledCard gradient={colors.success.gradient}>
                                        <CardContent sx={{ p: 2, color: 'white', textAlign: 'center' }}>
                                            <TrendingUp sx={{ fontSize: 32, mb: 1 }} />
                                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                {statsIndividuales.progresoTratamiento}%
                                            </Typography>
                                            <Typography variant="body2">Progreso</Typography>
                                        </CardContent>
                                    </StyledCard>
                                </Zoom>
                            </Grid>
                            
                            <Grid item xs={6} md={3}>
                                <Zoom in timeout={600}>
                                    <StyledCard gradient={colors.info.gradient}>
                                        <CardContent sx={{ p: 2, color: 'white', textAlign: 'center' }}>
                                            <PhotoCamera sx={{ fontSize: 32, mb: 1 }} />
                                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                {statsIndividuales.totalFotos}
                                            </Typography>
                                            <Typography variant="body2">Fotos</Typography>
                                        </CardContent>
                                    </StyledCard>
                                </Zoom>
                            </Grid>
                            
                            <Grid item xs={6} md={3}>
                                <Zoom in timeout={800}>
                                    <StyledCard gradient={colors.warning.gradient}>
                                        <CardContent sx={{ p: 2, color: 'white', textAlign: 'center' }}>
                                            <CheckCircle sx={{ fontSize: 32, mb: 1 }} />
                                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                {statsIndividuales.citasCompletadas}
                                            </Typography>
                                            <Typography variant="body2">Completadas</Typography>
                                        </CardContent>
                                    </StyledCard>
                                </Zoom>
                            </Grid>
                            
                            <Grid item xs={6} md={3}>
                                <Zoom in timeout={1000}>
                                    <StyledCard gradient={colors.primary.gradient}>
                                        <CardContent sx={{ p: 2, color: 'white', textAlign: 'center' }}>
                                            <Schedule sx={{ fontSize: 32, mb: 1 }} />
                                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                {statsIndividuales.citasRestantes}
                                            </Typography>
                                            <Typography variant="body2">Restantes</Typography>
                                        </CardContent>
                                    </StyledCard>
                                </Zoom>
                            </Grid>
                        </Grid>

                        {/* Pestañas para vista individual */}
                        <Paper sx={{ backgroundColor: colors.paper, borderRadius: 2, overflow: 'hidden' }}>
                            <Tabs
                                value={tabValue}
                                onChange={(e, newValue) => setTabValue(newValue)}
                                sx={{
                                    '& .MuiTabs-indicator': {
                                        height: 3,
                                        borderRadius: '1.5px',
                                        background: colors.success.gradient
                                    },
                                    '& .MuiTab-root': {
                                        color: colors.textSecondary,
                                        fontWeight: 500,
                                        textTransform: 'none',
                                        minHeight: '56px',
                                        '&.Mui-selected': {
                                            color: colors.success.main,
                                            fontWeight: 600
                                        }
                                    }
                                }}
                            >
                                <Tab icon={<TimelineIcon />} label="Timeline" />
                                <Tab icon={<PhotoCamera />} label="Fotos" />
                                <Tab icon={<BarChart />} label="Estado" />
                            </Tabs>

                            <Divider />

                            {/* Panel Timeline */}
                            {tabValue === 0 && (
                                <Box sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ color: colors.text, mb: 2, fontWeight: 600 }}>
                                        Línea de Tiempo del Progreso
                                    </Typography>
                                    
                                    <Timeline position="alternate">
                                        <TimelineItem>
                                            <TimelineOppositeContent sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                                                Inicio del tratamiento
                                            </TimelineOppositeContent>
                                            <TimelineSeparator>
                                                <TimelineDot sx={{ bgcolor: colors.primary.main }}>
                                                    <PlayArrow />
                                                </TimelineDot>
                                                <TimelineConnector />
                                            </TimelineSeparator>
                                            <TimelineContent>
                                                <Paper sx={{ p: 2, bgcolor: colors.primary.main, color: 'white' }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Tratamiento Iniciado</Typography>
                                                    <Typography variant="body2">{selectedTratamiento?.nombre_tratamiento}</Typography>
                                                </Paper>
                                            </TimelineContent>
                                        </TimelineItem>

                                        <TimelineItem>
                                            <TimelineOppositeContent sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                                                Fotos iniciales
                                            </TimelineOppositeContent>
                                            <TimelineSeparator>
                                                <TimelineDot sx={{ bgcolor: colors.info.main }}>
                                                    <PhotoCamera />
                                                </TimelineDot>
                                                <TimelineConnector />
                                            </TimelineSeparator>
                                            <TimelineContent>
                                                <Paper sx={{ p: 2 }}>
                                                    <Typography variant="subtitle1" sx={{ color: colors.text, fontWeight: 600 }}>
                                                        Fotografías Iniciales
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                                        {fotosProgreso.antes.length} fotos capturadas
                                                    </Typography>
                                                </Paper>
                                            </TimelineContent>
                                        </TimelineItem>

                                        {fotosProgreso.durante.length > 0 && (
                                            <TimelineItem>
                                                <TimelineOppositeContent sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                                                    En progreso
                                                </TimelineOppositeContent>
                                                <TimelineSeparator>
                                                    <TimelineDot sx={{ bgcolor: colors.warning.main }}>
                                                        <TrendingUp />
                                                    </TimelineDot>
                                                    <TimelineConnector />
                                                </TimelineSeparator>
                                                <TimelineContent>
                                                    <Paper sx={{ p: 2 }}>
                                                        <Typography variant="subtitle1" sx={{ color: colors.text, fontWeight: 600 }}>
                                                            Seguimiento Activo
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                                            {fotosProgreso.durante.length} fotos de seguimiento
                                                        </Typography>
                                                    </Paper>
                                                </TimelineContent>
                                            </TimelineItem>
                                        )}

                                        {fotosProgreso.despues.length > 0 && (
                                            <TimelineItem>
                                                <TimelineOppositeContent sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                                                    Finalización
                                                </TimelineOppositeContent>
                                                <TimelineSeparator>
                                                    <TimelineDot sx={{ bgcolor: colors.success.main }}>
                                                        <CheckCircle />
                                                    </TimelineDot>
                                                </TimelineSeparator>
                                                <TimelineContent>
                                                    <Paper sx={{ p: 2, bgcolor: colors.success.main, color: 'white' }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Tratamiento Completado</Typography>
                                                        <Typography variant="body2">
                                                            {fotosProgreso.despues.length} fotos finales
                                                        </Typography>
                                                    </Paper>
                                                </TimelineContent>
                                            </TimelineItem>
                                        )}
                                    </Timeline>
                                </Box>
                            )}

                            {/* Panel Fotos */}
                            {tabValue === 1 && (
                                <Box sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
                                            Galería de Progreso
                                        </Typography>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={compareMode}
                                                    onChange={(e) => setCompareMode(e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label="Modo Comparación"
                                            sx={{ color: colors.text }}
                                        />
                                    </Box>

                                    {compareMode ? (
                                        // Modo comparación
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <StyledCard>
                                                    <CardContent sx={{ p: 2 }}>
                                                        <Typography variant="subtitle1" sx={{ color: colors.text, mb: 2 }}>
                                                            Comparación Antes / Después
                                                        </Typography>
                                                        {fotosProgreso.antes.length > 0 && fotosProgreso.despues.length > 0 ? (
                                                            <PhotoComparator>
                                                                <img
                                                                    src={fotosProgreso.antes[0].url}
                                                                    alt="Antes"
                                                                    className="before-image"
                                                                />
                                                                <img
                                                                    src={fotosProgreso.despues[0].url}
                                                                    alt="Después"
                                                                    className="after-image"
                                                                    style={{
                                                                        clipPath: `inset(0 ${100 - compareSlider}% 0 0)`
                                                                    }}
                                                                />
                                                                <Box
                                                                    className="slider-handle"
                                                                    style={{ left: `${compareSlider}%` }}
                                                                />
                                                            </PhotoComparator>
                                                        ) : (
                                                            <Alert severity="info">
                                                                <AlertTitle>Comparación no disponible</AlertTitle>
                                                                Se necesitan fotos "antes" y "después" para activar el modo comparación.
                                                            </Alert>
                                                        )}
                                                        
                                                        {fotosProgreso.antes.length > 0 && fotosProgreso.despues.length > 0 && (
                                                            <Box sx={{ mt: 2, px: 1 }}>
                                                                <Slider
                                                                    value={compareSlider}
                                                                    onChange={(e, value) => setCompareSlider(value)}
                                                                    min={0}
                                                                    max={100}
                                                                    sx={{
                                                                        color: colors.primary.main,
                                                                        '& .MuiSlider-thumb': {
                                                                            bgcolor: colors.primary.main
                                                                        }
                                                                    }}
                                                                />
                                                            </Box>
                                                        )}
                                                    </CardContent>
                                                </StyledCard>
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        // Modo galería normal
                                        <Grid container spacing={2}>
                                            {['antes', 'durante', 'despues'].map((tipo) => (
                                                <Grid item xs={12} md={4} key={tipo}>
                                                    <StyledCard>
                                                        <CardContent sx={{ p: 2 }}>
                                                            <Typography variant="subtitle1" sx={{ color: colors.text, mb: 1.5, textAlign: 'center', fontWeight: 600 }}>
                                                                {tipo === 'antes' && <><CameraAlt sx={{ mr: 1 }} />Antes</>}
                                                                {tipo === 'durante' && <><ViewCarousel sx={{ mr: 1 }} />Durante</>}
                                                                {tipo === 'despues' && <><AutoAwesome sx={{ mr: 1 }} />Después</>}
                                                            </Typography>
                                                            
                                                            {fotosProgreso[tipo].length > 0 ? (
                                                                <Grid container spacing={1}>
                                                                    {fotosProgreso[tipo].slice(0, tipo === 'durante' ? 9 : 6).map((foto, index) => (
                                                                        <Grid item xs={tipo === 'durante' ? 4 : 6} key={foto.id}>
                                                                            <Box
                                                                                sx={{
                                                                                    position: 'relative',
                                                                                    paddingTop: '100%',
                                                                                    borderRadius: 1,
                                                                                    overflow: 'hidden',
                                                                                    cursor: 'pointer',
                                                                                    transition: 'transform 0.3s',
                                                                                    '&:hover': {
                                                                                        transform: 'scale(1.05)'
                                                                                    }
                                                                                }}
                                                                                onClick={() => handlePhotoClick(foto, index)}
                                                                            >
                                                                                <Box
                                                                                    component="img"
                                                                                    src={foto.url}
                                                                                    alt={`${tipo} ${index + 1}`}
                                                                                    sx={{
                                                                                        position: 'absolute',
                                                                                        top: 0,
                                                                                        left: 0,
                                                                                        width: '100%',
                                                                                        height: '100%',
                                                                                        objectFit: 'cover'
                                                                                    }}
                                                                                />
                                                                                <Box
                                                                                    sx={{
                                                                                        position: 'absolute',
                                                                                        top: 4,
                                                                                        right: 4,
                                                                                        bgcolor: 'rgba(0,0,0,0.6)',
                                                                                        borderRadius: '50%',
                                                                                        p: 0.5
                                                                                    }}
                                                                                >
                                                                                    <ZoomIn sx={{ color: 'white', fontSize: 14 }} />
                                                                                </Box>
                                                                            </Box>
                                                                        </Grid>
                                                                    ))}
                                                                    {tipo === 'durante' && fotosProgreso[tipo].length > 9 && (
                                                                        <Grid item xs={4}>
                                                                            <Box
                                                                                sx={{
                                                                                    position: 'relative',
                                                                                    paddingTop: '100%',
                                                                                    borderRadius: 1,
                                                                                    bgcolor: alpha(colors.textSecondary, 0.1),
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    border: `1px dashed ${colors.divider}`
                                                                                }}
                                                                            >
                                                                                <Box sx={{ 
                                                                                    position: 'absolute',
                                                                                    top: '50%',
                                                                                    left: '50%',
                                                                                    transform: 'translate(-50%, -50%)',
                                                                                    textAlign: 'center',
                                                                                    color: colors.textSecondary 
                                                                                }}>
                                                                                    <Typography variant="h6">+{fotosProgreso[tipo].length - 9}</Typography>
                                                                                    <Typography variant="caption">más</Typography>
                                                                                </Box>
                                                                            </Box>
                                                                        </Grid>
                                                                    )}
                                                                </Grid>
                                                            ) : (
                                                                <Box
                                                                    sx={{
                                                                        height: 150,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        bgcolor: alpha(colors.textSecondary, 0.1),
                                                                        borderRadius: 1,
                                                                        border: `2px dashed ${colors.divider}`
                                                                    }}
                                                                >
                                                                    <Box sx={{ textAlign: 'center', color: colors.textSecondary }}>
                                                                        <PhotoCamera sx={{ fontSize: 32, mb: 1 }} />
                                                                        <Typography variant="body2">
                                                                            Sin fotos {tipo}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            )}
                                                        </CardContent>
                                                    </StyledCard>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}
                                </Box>
                            )}

                            {/* Panel Estado */}
                            {tabValue === 2 && (
                                <Box sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ color: colors.text, mb: 2, fontWeight: 600 }}>
                                        Estado del Tratamiento
                                    </Typography>
                                    
                                    {/* Advertencia sobre datos no disponibles */}
                                    <Alert severity="warning" sx={{ mb: 3 }}>
                                        <AlertTitle>Función en desarrollo</AlertTitle>
                                        Las métricas de estado (dolor, satisfacción, etc.) estarán disponibles próximamente. 
                                        Actualmente no hay un endpoint en el backend para gestionar estas evaluaciones.
                                    </Alert>
                                    
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <StyledCard>
                                                <CardContent sx={{ p: 2 }}>
                                                    <Typography variant="subtitle1" sx={{ color: colors.text, mb: 1 }}>
                                                        Información del Tratamiento
                                                    </Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} md={6}>
                                                            <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                                                                <strong>Estado:</strong> {selectedTratamiento?.estado}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                                                                <strong>Fecha de inicio:</strong> {new Date(selectedTratamiento?.fecha_inicio).toLocaleDateString()}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                                                                <strong>Citas completadas:</strong> {selectedTratamiento?.citas_completadas}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={12} md={6}>
                                                            <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                                                                <strong>Total de citas:</strong> {selectedTratamiento?.total_citas_programadas}
                                                            </Typography>
                                                            {selectedTratamiento?.fecha_fin && (
                                                                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                                                                    <strong>Fecha de fin:</strong> {new Date(selectedTratamiento?.fecha_fin).toLocaleDateString()}
                                                                </Typography>
                                                            )}
                                                            <Box sx={{ mt: 2 }}>
                                                                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                                                                    Progreso
                                                                </Typography>
                                                                <LinearProgress 
                                                                    variant="determinate" 
                                                                    value={statsIndividuales.progresoTratamiento} 
                                                                    sx={{ 
                                                                        height: 8, 
                                                                        borderRadius: 4,
                                                                        '& .MuiLinearProgress-bar': {
                                                                            background: colors.success.gradient
                                                                        }
                                                                    }} 
                                                                />
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </CardContent>
                                            </StyledCard>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </Paper>
                    </>
                )}
            </Container>

            {/* Dialog para visor de fotos */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: colors.paper,
                        borderRadius: 2
                    }
                }}
            >
                <DialogTitle sx={{ color: colors.text, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Vista de Foto</Typography>
                    <IconButton onClick={() => setDialogOpen(false)}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {selectedPhoto && (
                        <Box
                            component="img"
                            src={selectedPhoto.url}
                            alt="Foto de progreso"
                            sx={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: 1
                            }}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} sx={{ color: colors.textSecondary }}>
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notificaciones */}
            <Notificaciones
                open={notification.open}
                message={notification.message}
                type={notification.type}
                handleClose={() => setNotification({ ...notification, open: false })}
            />
        </Box>
    );
};

export default ProgresoPaciente;