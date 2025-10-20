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
    Tooltip,
    CircularProgress,
    useMediaQuery,
    useTheme,
    alpha,
    Divider,
    Stack,
    Fade,
    Grow,
    Zoom,
    Tab,
    Tabs,
    Avatar,
    Badge,
    LinearProgress,
    MenuItem
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    CheckCircle as CheckIcon,
    LocalHospital as ServiceIcon,
    EmojiEvents as TrophyIcon,
    Person as PersonIcon,
    TrendingUp as TrendingIcon,
    Star as StarIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import Notificaciones from '../../../components/Layout/Notificaciones';

const API_URL = 'https://back-end-4803.onrender.com/api/gamificacion';

// 10 ICONOS PREDEFINIDOS PARA RECOMPENSA
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

const AdminGamificacion = () => {
    const { isDarkTheme } = useThemeContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [activeTab, setActiveTab] = useState(0); // 0: Recompensa, 1: Servicios, 2: Pacientes

    // Estados Recompensa
    const [recompensa, setRecompensa] = useState(null);
    const [openDialogRecompensa, setOpenDialogRecompensa] = useState(false);
    const [formRecompensa, setFormRecompensa] = useState({
        nombre: '',
        descripcion: '',
        puntos_requeridos: 100,
        icono: '🎁',
        premio: '',
        estado: 1
    });

    // Estados Servicios
    const [servicios, setServicios] = useState([]);
    const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
    const [filteredServicios, setFilteredServicios] = useState([]);
    const [searchTermServicios, setSearchTermServicios] = useState('');
    const [selectedEstadoServicios, setSelectedEstadoServicios] = useState('todos');
    const [openDialogServicio, setOpenDialogServicio] = useState(false);
    const [openDeleteDialogServicio, setOpenDeleteDialogServicio] = useState(false);
    const [openAsignarServicio, setOpenAsignarServicio] = useState(false);
    const [selectedServicio, setSelectedServicio] = useState(null);
    const [formServicio, setFormServicio] = useState({
        id_servicio: '',
        puntos: 10,
        estado: 1
    });

    // Estados Pacientes
    const [pacientes, setPacientes] = useState([]);
    const [filteredPacientes, setFilteredPacientes] = useState([]);
    const [searchTermPacientes, setSearchTermPacientes] = useState('');
    const [statsGlobal, setStatsGlobal] = useState({
        totalPacientes: 0,
        puntosPromedio: 0,
        nivelPromedio: 0,
        totalPuntosOtorgados: 0
    });

    const [loading, setLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [notification, setNotification] = useState({
        open: false,
        message: '',
        type: 'success'
    });

    // PALETA DE COLORES AZUL DE ODONTOLOGÍA
    const colors = {
        background: isDarkTheme ? '#0F1419' : '#F0F4F8',
        paper: isDarkTheme ? '#1A1F26' : '#FFFFFF',
        paperLight: isDarkTheme ? '#242B34' : '#F8FAFC',
        cardBg: isDarkTheme
            ? 'linear-gradient(135deg, rgba(30,39,71,0.6) 0%, rgba(21,25,52,0.8) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.95) 100%)',
        text: isDarkTheme ? '#E8F1FF' : '#1E293B',
        secondaryText: isDarkTheme ? '#94A3B8' : '#64748B',
        primary: isDarkTheme ? '#4B9FFF' : '#1976d2',
        primaryLight: isDarkTheme ? '#60A5FA' : '#2196f3',
        primaryDark: isDarkTheme ? '#3D7ECC' : '#0A4B94',
        success: isDarkTheme ? '#5CDB5C' : '#4CAF50',
        warning: isDarkTheme ? '#F59E0B' : '#ff9800',
        error: isDarkTheme ? '#ff6b6b' : '#f44336',
        border: isDarkTheme ? 'rgba(148,163,184,0.1)' : 'rgba(148,163,184,0.2)',
        hover: isDarkTheme ? 'rgba(75,159,255,0.1)' : 'rgba(25,118,210,0.05)',
        gradient: isDarkTheme
            ? 'linear-gradient(135deg, #4B9FFF 0%, #1976d2 100%)'
            : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
        gradientAlt: isDarkTheme
            ? 'linear-gradient(135deg, #5CDB5C 0%, #4CAF50 100%)'
            : 'linear-gradient(135deg, #66bb6a 0%, #4CAF50 100%)',
        gradientWarning: isDarkTheme
            ? 'linear-gradient(135deg, #F59E0B 0%, #ff9800 100%)'
            : 'linear-gradient(135deg, #ffa726 0%, #ff9800 100%)',
        shadow: isDarkTheme
            ? '0 20px 60px -15px rgba(0,0,0,0.6)'
            : '0 20px 60px -15px rgba(25,118,210,0.15)',
        glassBlur: 'blur(20px)'
    };

    // Mostrar notificación
    const showNotif = (message, type = 'success') => {
        setNotification({ open: true, message, type });
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        filtrarServicios();
    }, [searchTermServicios, selectedEstadoServicios, servicios]);

    useEffect(() => {
        filtrarPacientes();
    }, [searchTermPacientes, pacientes]);

    // Cargar todos los datos
    const cargarDatos = async () => {
        setIsLoadingData(true);
        try {
            const [resRecompensas, resServicios, resPacientes] = await Promise.all([
                axios.get(`${API_URL}/recompensas`),
                axios.get(`${API_URL}/servicios-gamificacion`),
                axios.get(`${API_URL}/pacientes-gamificacion`)
            ]);

            if (resRecompensas.data.length > 0) {
                setRecompensa(resRecompensas.data[0]);
            }

            setServicios(resServicios.data || []);
            setPacientes(resPacientes.data || []);

            // Calcular estadísticas globales
            if (resPacientes.data.length > 0) {
                const totalPacientes = resPacientes.data.length;
                const puntosTotal = resPacientes.data.reduce((sum, p) => sum + p.puntos_disponibles, 0);
                const nivelTotal = resPacientes.data.reduce((sum, p) => sum + p.nivel, 0);
                const puntosOtorgados = resPacientes.data.reduce((sum, p) => sum + p.puntos_totales, 0);

                setStatsGlobal({
                    totalPacientes,
                    puntosPromedio: Math.round(puntosTotal / totalPacientes),
                    nivelPromedio: (nivelTotal / totalPacientes).toFixed(1),
                    totalPuntosOtorgados: puntosOtorgados
                });
            }
        } catch (error) {
            showNotif('Error al cargar datos', 'error');
        } finally {
            setIsLoadingData(false);
        }
    };

    // Cargar servicios disponibles
    const cargarServiciosDisponibles = async () => {
        try {
            const res = await axios.get(`${API_URL}/servicios/disponibles`);
            setServiciosDisponibles(res.data || []);
        } catch (error) {
            showNotif('Error al cargar servicios disponibles', 'error');
        }
    };

    // Filtrar servicios
    const filtrarServicios = () => {
        let filtered = servicios;

        if (searchTermServicios) {
            filtered = filtered.filter(s =>
                s.nombre_servicio.toLowerCase().includes(searchTermServicios.toLowerCase())
            );
        }

        if (selectedEstadoServicios === 'activos') {
            filtered = filtered.filter(s => s.estado === 1);
        } else if (selectedEstadoServicios === 'inactivos') {
            filtered = filtered.filter(s => s.estado === 0);
        }

        setFilteredServicios(filtered);
    };

    // Filtrar pacientes
    const filtrarPacientes = () => {
        let filtered = pacientes;

        if (searchTermPacientes) {
            filtered = filtered.filter(p =>
                p.nombre_completo.toLowerCase().includes(searchTermPacientes.toLowerCase()) ||
                p.email.toLowerCase().includes(searchTermPacientes.toLowerCase())
            );
        }

        setFilteredPacientes(filtered);
    };

    // ==================== RECOMPENSA ====================

    // Abrir modal editar recompensa
    const handleEditRecompensa = () => {
        if (recompensa) {
            setFormRecompensa({
                nombre: recompensa.nombre,
                descripcion: recompensa.descripcion,
                puntos_requeridos: recompensa.puntos_requeridos,
                icono: recompensa.icono,
                premio: recompensa.premio,
                estado: recompensa.estado
            });
            setOpenDialogRecompensa(true);
        }
    };

    // Guardar recompensa (crear o editar)
    const handleSaveRecompensa = async () => {
        if (!formRecompensa.nombre || !formRecompensa.puntos_requeridos) {
            showNotif('Completa todos los campos requeridos', 'error');
            return;
        }

        setLoading(true);
        try {
            if (recompensa) {
                // EDITAR recompensa existente
                await axios.put(`${API_URL}/recompensas/${recompensa.id}`, formRecompensa);
                showNotif('✅ Recompensa actualizada correctamente', 'success');
            } else {
                // CREAR primera recompensa
                await axios.post(`${API_URL}/recompensas`, {
                    ...formRecompensa,
                    tipo: 'descuento', // tipo por defecto
                    orden: 0
                });
                showNotif('✅ Recompensa creada correctamente', 'success');
            }
            setOpenDialogRecompensa(false);
            cargarDatos();
        } catch (error) {
            showNotif('❌ Error al guardar recompensa', 'error');
        } finally {
            setLoading(false);
        }
    };
    // ==================== SERVICIOS ====================

    // Abrir modal asignar servicio
    const handleOpenAsignarServicio = async () => {
        await cargarServiciosDisponibles();
        setFormServicio({ id_servicio: '', puntos: 10, estado: 1 });
        setOpenAsignarServicio(true);
    };

    // Abrir modal editar servicio
    const handleOpenEditServicio = (servicio) => {
        setSelectedServicio(servicio);
        setFormServicio({
            id_servicio: servicio.id_servicio,
            puntos: servicio.puntos,
            estado: servicio.estado
        });
        setOpenDialogServicio(true);
    };

    // Guardar servicio (asignar o editar)
    const handleSaveServicio = async () => {
        if (openAsignarServicio) {
            // Asignar nuevo servicio
            if (!formServicio.id_servicio || !formServicio.puntos) {
                showNotif('Completa todos los campos requeridos', 'error');
                return;
            }

            setLoading(true);
            try {
                await axios.post(`${API_URL}/servicios-gamificacion`, {
                    id_servicio: formServicio.id_servicio,
                    puntos: formServicio.puntos
                });
                showNotif('✅ Servicio asignado correctamente', 'success');
                setOpenAsignarServicio(false);
                cargarDatos();
            } catch (error) {
                showNotif('❌ Error al asignar servicio', 'error');
            } finally {
                setLoading(false);
            }
        } else {
            // Editar servicio existente
            if (!formServicio.puntos) {
                showNotif('Completa todos los campos requeridos', 'error');
                return;
            }

            setLoading(true);
            try {
                await axios.put(`${API_URL}/servicios-gamificacion/${selectedServicio.id}`, {
                    puntos: formServicio.puntos,
                    estado: formServicio.estado
                });
                showNotif('✅ Servicio actualizado correctamente', 'success');
                setOpenDialogServicio(false);
                cargarDatos();
            } catch (error) {
                showNotif('❌ Error al actualizar servicio', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    // Abrir confirmación eliminar servicio
    const handleOpenDeleteServicio = (servicio) => {
        setSelectedServicio(servicio);
        setOpenDeleteDialogServicio(true);
    };

    // Eliminar servicio
    const handleDeleteServicio = async () => {
        setLoading(true);
        try {
            await axios.delete(`${API_URL}/servicios-gamificacion/${selectedServicio.id}`);
            showNotif('🗑️ Servicio eliminado de gamificación', 'success');
            setOpenDeleteDialogServicio(false);
            cargarDatos();
        } catch (error) {
            showNotif('❌ Error al eliminar servicio', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ==================== LOADING ====================

    if (isLoadingData) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    background: colors.background,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                <CircularProgress size={60} sx={{ color: colors.primary }} />
                <Typography variant="h6" color={colors.secondaryText}>
                    Cargando datos...
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: colors.background,
                pt: 4,
                pb: 6,
                px: isMobile ? 2 : 4
            }}
        >
            {/* Header */}
            <Fade in timeout={600}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 80,
                            height: 80,
                            borderRadius: '24px',
                            background: colors.gradient,
                            mb: 2,
                            boxShadow: `0 8px 24px ${alpha(colors.primary, 0.4)}`
                        }}
                    >
                        <TrophyIcon sx={{ fontSize: 48, color: 'white' }} />
                    </Box>
                    <Typography
                        variant={isMobile ? "h5" : "h4"}
                        fontWeight={800}
                        color={colors.text}
                        sx={{ mb: 1 }}
                    >
                        Gestión de Gamificación
                    </Typography>
                    <Typography variant="body1" color={colors.secondaryText}>
                        Administra recompensas, servicios y monitorea pacientes del sistema OdontoPuntos
                    </Typography>
                </Box>
            </Fade>

            {/* Tabs */}
            <Grow in timeout={800}>
                <Card
                    sx={{
                        maxWidth: 1400,
                        mx: 'auto',
                        mb: 4,
                        borderRadius: '24px',
                        background: colors.paper,
                        boxShadow: colors.shadow,
                        overflow: 'hidden'
                    }}
                >
                    <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        variant={isMobile ? "fullWidth" : "standard"}
                        centered={!isMobile}
                        sx={{
                            borderBottom: `2px solid ${colors.border}`,
                            '& .MuiTab-root': {
                                fontSize: isMobile ? '0.9rem' : '1rem',
                                fontWeight: 700,
                                py: 2.5,
                                px: isMobile ? 2 : 4,
                                color: colors.secondaryText,
                                textTransform: 'none',
                                minHeight: 72,
                                '&.Mui-selected': {
                                    color: colors.primary
                                }
                            },
                            '& .MuiTabs-indicator': {
                                height: 4,
                                borderRadius: '4px 4px 0 0',
                                background: colors.gradient
                            }
                        }}
                    >
                        <Tab
                            icon={<TrophyIcon />}
                            iconPosition="start"
                            label="Recompensa"
                        />
                        <Tab
                            icon={<ServiceIcon />}
                            iconPosition="start"
                            label="Servicios"
                        />
                        <Tab
                            icon={<PersonIcon />}
                            iconPosition="start"
                            label="Pacientes"
                        />
                    </Tabs>

                    {/* TAB 1: RECOMPENSA */}
                    {activeTab === 0 && (
                        <Fade in timeout={400}>
                            <Box sx={{ p: isMobile ? 3 : 5 }}>
                                {recompensa ? (
                                    <Stack spacing={4}>
                                        {/* Card Recompensa Grande */}
                                        <Zoom in timeout={600}>
                                            <Card
                                                sx={{
                                                    background: colors.cardBg,
                                                    borderRadius: '24px',
                                                    border: `2px solid ${colors.border}`,
                                                    overflow: 'hidden',
                                                    position: 'relative'
                                                }}
                                            >
                                                {/* Fondo decorativo */}
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: -50,
                                                        right: -50,
                                                        width: 200,
                                                        height: 200,
                                                        borderRadius: '50%',
                                                        background: alpha(colors.primary, 0.1),
                                                        filter: 'blur(60px)'
                                                    }}
                                                />

                                                <CardContent sx={{ p: isMobile ? 3 : 5, textAlign: 'center', position: 'relative' }}>
                                                    <Typography
                                                        sx={{
                                                            fontSize: isMobile ? '4rem' : '6rem',
                                                            mb: 3,
                                                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                                                        }}
                                                    >
                                                        {recompensa.icono}
                                                    </Typography>

                                                    <Typography
                                                        variant={isMobile ? "h5" : "h4"}
                                                        fontWeight={800}
                                                        color={colors.text}
                                                        sx={{ mb: 2 }}
                                                    >
                                                        {recompensa.nombre}
                                                    </Typography>

                                                    <Typography
                                                        variant="body1"
                                                        color={colors.secondaryText}
                                                        sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
                                                    >
                                                        {recompensa.descripcion}
                                                    </Typography>

                                                    <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
                                                        <Grid item xs={12} sm="auto">
                                                            <Box
                                                                sx={{
                                                                    background: colors.gradient,
                                                                    borderRadius: '16px',
                                                                    p: 3,
                                                                    textAlign: 'center',
                                                                    minWidth: 180,
                                                                    boxShadow: `0 8px 24px ${alpha(colors.primary, 0.3)}`
                                                                }}
                                                            >
                                                                <Typography variant="h4" fontWeight={800} color="white">
                                                                    {recompensa.puntos_requeridos}
                                                                </Typography>
                                                                <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                                                                    Puntos Requeridos
                                                                </Typography>
                                                            </Box>
                                                        </Grid>

                                                        <Grid item xs={12} sm="auto" display="flex" alignItems="center" justifyContent="center">
                                                            <Typography
                                                                variant="h4"
                                                                fontWeight={700}
                                                                color={colors.text}
                                                                sx={{ px: 2 }}
                                                            >
                                                                =
                                                            </Typography>
                                                        </Grid>

                                                        <Grid item xs={12} sm="auto">
                                                            <Box
                                                                sx={{
                                                                    background: colors.gradientAlt,
                                                                    borderRadius: '16px',
                                                                    p: 3,
                                                                    textAlign: 'center',
                                                                    minWidth: 180,
                                                                    boxShadow: `0 8px 24px ${alpha(colors.success, 0.3)}`
                                                                }}
                                                            >
                                                                <Typography variant="h4" fontWeight={800} color="white">
                                                                    {recompensa.premio}
                                                                </Typography>
                                                                <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                                                                    Premio
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>

                                                    <Chip
                                                        icon={recompensa.estado === 1 ? <CheckIcon /> : <CloseIcon />}
                                                        label={recompensa.estado === 1 ? 'Recompensa Activa' : 'Recompensa Inactiva'}
                                                        sx={{
                                                            background: alpha(
                                                                recompensa.estado === 1 ? colors.success : colors.error,
                                                                0.15
                                                            ),
                                                            color: recompensa.estado === 1 ? colors.success : colors.error,
                                                            fontWeight: 700,
                                                            fontSize: '1rem',
                                                            borderRadius: '12px',
                                                            px: 3,
                                                            py: 3
                                                        }}
                                                    />
                                                </CardContent>
                                            </Card>
                                        </Zoom>

                                        {/* Botón Editar */}
                                        <Button
                                            variant="contained"
                                            size="large"
                                            startIcon={<EditIcon />}
                                            onClick={handleEditRecompensa}
                                            sx={{
                                                borderRadius: '16px',
                                                background: colors.gradient,
                                                py: 2,
                                                fontWeight: 700,
                                                fontSize: '1.1rem',
                                                boxShadow: `0 8px 24px ${alpha(colors.primary, 0.4)}`,
                                                '&:hover': {
                                                    background: colors.gradient,
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: `0 12px 32px ${alpha(colors.primary, 0.5)}`
                                                }
                                            }}
                                        >
                                            Editar Recompensa
                                        </Button>
                                    </Stack>
                                ) : (
                                    // ========== SI NO HAY RECOMPENSA ==========
                                    <Stack spacing={4} alignItems="center" sx={{ py: 8 }}>
                                        <Box
                                            sx={{
                                                width: 120,
                                                height: 120,
                                                borderRadius: '24px',
                                                background: alpha(colors.primary, 0.1),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <TrophyIcon sx={{ fontSize: 64, color: colors.primary, opacity: 0.5 }} />
                                        </Box>

                                        <Box textAlign="center">
                                            <Typography
                                                variant="h5"
                                                fontWeight={700}
                                                color={colors.text}
                                                sx={{ mb: 1 }}
                                            >
                                                No hay recompensa configurada
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                color={colors.secondaryText}
                                            >
                                                Crea la primera recompensa del sistema de gamificación
                                            </Typography>
                                        </Box>

                                        {/* Botón Crear Primera Recompensa */}
                                        <Button
                                            variant="contained"
                                            size="large"
                                            startIcon={<AddIcon />}
                                            onClick={() => {
                                                setFormRecompensa({
                                                    nombre: '',
                                                    descripcion: '',
                                                    puntos_requeridos: 100,
                                                    icono: '🎁',
                                                    premio: '',
                                                    estado: 1
                                                });
                                                setOpenDialogRecompensa(true);
                                            }}
                                            sx={{
                                                borderRadius: '16px',
                                                background: colors.gradient,
                                                py: 2,
                                                px: 5,
                                                fontWeight: 700,
                                                fontSize: '1.1rem',
                                                boxShadow: `0 8px 24px ${alpha(colors.primary, 0.4)}`,
                                                '&:hover': {
                                                    background: colors.gradient,
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: `0 12px 32px ${alpha(colors.primary, 0.5)}`
                                                }
                                            }}
                                        >
                                            Crear Primera Recompensa
                                        </Button>
                                    </Stack>
                                )}
                            </Box>
                        </Fade>
                    )}

                    {/* TAB 2: SERVICIOS */}
                    {activeTab === 1 && (
                        <Fade in timeout={400}>
                            <Box sx={{ p: isMobile ? 3 : 4 }}>
                                {/* Filtros y búsqueda */}
                                <Stack spacing={3} sx={{ mb: 4 }}>
                                    <TextField
                                        fullWidth
                                        placeholder="🔍 Buscar servicio por nombre..."
                                        value={searchTermServicios}
                                        onChange={(e) => setSearchTermServicios(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ color: colors.secondaryText }} />
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '16px',
                                                background: colors.background,
                                                '& fieldset': {
                                                    borderColor: colors.border
                                                }
                                            }
                                        }}
                                    />

                                    {/* Filtros de estado */}
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        {['todos', 'activos', 'inactivos'].map((estado) => (
                                            <Chip
                                                key={estado}
                                                label={estado.charAt(0).toUpperCase() + estado.slice(1)}
                                                onClick={() => setSelectedEstadoServicios(estado)}
                                                icon={
                                                    estado === 'todos' ? <ServiceIcon /> :
                                                        estado === 'activos' ? <CheckIcon /> :
                                                            <CloseIcon />
                                                }
                                                sx={{
                                                    background: selectedEstadoServicios === estado
                                                        ? colors.gradient
                                                        : colors.background,
                                                    color: selectedEstadoServicios === estado
                                                        ? 'white'
                                                        : colors.text,
                                                    fontWeight: 700,
                                                    borderRadius: '12px',
                                                    px: 2,
                                                    py: 2.5,
                                                    cursor: 'pointer',
                                                    border: `2px solid ${selectedEstadoServicios === estado ? 'transparent' : colors.border}`,
                                                    '&:hover': {
                                                        background: selectedEstadoServicios === estado
                                                            ? colors.gradient
                                                            : colors.hover,
                                                        transform: 'translateY(-2px)'
                                                    }
                                                }}
                                            />
                                        ))}
                                    </Stack>

                                    {/* Botón Asignar Servicio */}
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<AddIcon />}
                                        onClick={handleOpenAsignarServicio}
                                        sx={{
                                            borderRadius: '16px',
                                            background: colors.gradientAlt,
                                            py: 2,
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            boxShadow: `0 8px 24px ${alpha(colors.success, 0.4)}`,
                                            '&:hover': {
                                                background: colors.gradientAlt,
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 12px 32px ${alpha(colors.success, 0.5)}`
                                            }
                                        }}
                                    >
                                        Asignar Nuevo Servicio
                                    </Button>
                                </Stack>

                                {/* Lista de servicios */}
                                <Grid container spacing={3}>
                                    {filteredServicios.length > 0 ? (
                                        filteredServicios.map((servicio, index) => (
                                            <Grid item xs={12} sm={6} md={4} key={servicio.id}>
                                                <Zoom in timeout={300 + index * 50}>
                                                    <Card
                                                        sx={{
                                                            borderRadius: '20px',
                                                            border: `2px solid ${colors.border}`,
                                                            background: colors.cardBg,
                                                            transition: 'all 0.3s ease',
                                                            height: '100%',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            '&:hover': {
                                                                transform: 'translateY(-8px)',
                                                                boxShadow: colors.shadow,
                                                                borderColor: colors.primary
                                                            }
                                                        }}
                                                    >
                                                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                                            <Stack spacing={2}>
                                                                {/* Header con icono */}
                                                                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                                                    <Box
                                                                        sx={{
                                                                            width: 56,
                                                                            height: 56,
                                                                            borderRadius: '16px',
                                                                            background: alpha(colors.primary, 0.15),
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}
                                                                    >
                                                                        <ServiceIcon sx={{ color: colors.primary, fontSize: 32 }} />
                                                                    </Box>

                                                                    <Chip
                                                                        size="small"
                                                                        icon={servicio.estado === 1 ? <CheckIcon /> : <CloseIcon />}
                                                                        label={servicio.estado === 1 ? 'Activo' : 'Inactivo'}
                                                                        sx={{
                                                                            background: alpha(
                                                                                servicio.estado === 1 ? colors.success : colors.error,
                                                                                0.15
                                                                            ),
                                                                            color: servicio.estado === 1 ? colors.success : colors.error,
                                                                            fontWeight: 700
                                                                        }}
                                                                    />
                                                                </Box>

                                                                {/* Nombre del servicio */}
                                                                <Typography
                                                                    variant="h6"
                                                                    fontWeight={700}
                                                                    color={colors.text}
                                                                    sx={{
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: 2,
                                                                        WebkitBoxOrient: 'vertical',
                                                                        overflow: 'hidden',
                                                                        minHeight: 56
                                                                    }}
                                                                >
                                                                    {servicio.nombre_servicio}
                                                                </Typography>

                                                                {/* Puntos destacados */}
                                                                <Box
                                                                    sx={{
                                                                        background: alpha(colors.warning, 0.15),
                                                                        borderRadius: '12px',
                                                                        p: 2,
                                                                        textAlign: 'center',
                                                                        border: `2px solid ${alpha(colors.warning, 0.3)}`
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        variant="h4"
                                                                        fontWeight={800}
                                                                        sx={{
                                                                            background: colors.gradientWarning,
                                                                            WebkitBackgroundClip: 'text',
                                                                            WebkitTextFillColor: 'transparent'
                                                                        }}
                                                                    >
                                                                        {servicio.puntos}
                                                                    </Typography>
                                                                    <Typography variant="caption" color={colors.secondaryText} fontWeight={600}>
                                                                        Puntos
                                                                    </Typography>
                                                                </Box>

                                                                {/* Acciones */}
                                                                <Stack direction="row" spacing={1}>
                                                                    <Tooltip title="Editar">
                                                                        <IconButton
                                                                            onClick={() => handleOpenEditServicio(servicio)}
                                                                            sx={{
                                                                                flex: 1,
                                                                                background: alpha(colors.primary, 0.1),
                                                                                color: colors.primary,
                                                                                borderRadius: '12px',
                                                                                '&:hover': {
                                                                                    background: alpha(colors.primary, 0.2),
                                                                                    transform: 'scale(1.05)'
                                                                                }
                                                                            }}
                                                                        >
                                                                            <EditIcon />
                                                                        </IconButton>
                                                                    </Tooltip>

                                                                    <Tooltip title="Eliminar">
                                                                        <IconButton
                                                                            onClick={() => handleOpenDeleteServicio(servicio)}
                                                                            sx={{
                                                                                flex: 1,
                                                                                background: alpha(colors.error, 0.1),
                                                                                color: colors.error,
                                                                                borderRadius: '12px',
                                                                                '&:hover': {
                                                                                    background: alpha(colors.error, 0.2),
                                                                                    transform: 'scale(1.05)'
                                                                                }
                                                                            }}
                                                                        >
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Stack>
                                                            </Stack>
                                                        </CardContent>
                                                    </Card>
                                                </Zoom>
                                            </Grid>
                                        ))
                                    ) : (
                                        <Grid item xs={12}>
                                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                                <ServiceIcon sx={{ fontSize: 80, color: colors.secondaryText, mb: 2, opacity: 0.3 }} />
                                                <Typography
                                                    variant="h6"
                                                    color={colors.secondaryText}
                                                >
                                                    No hay servicios disponibles
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        </Fade>
                    )}

                    {/* TAB 3: PACIENTES */}
                    {activeTab === 2 && (
                        <Fade in timeout={400}>
                            <Box sx={{ p: isMobile ? 3 : 4 }}>
                                {/* Estadísticas globales */}
                                <Grid container spacing={3} sx={{ mb: 4 }}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Card
                                            sx={{
                                                borderRadius: '20px',
                                                background: colors.gradient,
                                                p: 3,
                                                textAlign: 'center',
                                                boxShadow: `0 8px 24px ${alpha(colors.primary, 0.3)}`
                                            }}
                                        >
                                            <PersonIcon sx={{ fontSize: 48, color: 'white', mb: 1 }} />
                                            <Typography variant="h4" fontWeight={800} color="white">
                                                {statsGlobal.totalPacientes}
                                            </Typography>
                                            <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                                                Total Pacientes
                                            </Typography>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <Card
                                            sx={{
                                                borderRadius: '20px',
                                                background: colors.gradientAlt,
                                                p: 3,
                                                textAlign: 'center',
                                                boxShadow: `0 8px 24px ${alpha(colors.success, 0.3)}`
                                            }}
                                        >
                                            <StarIcon sx={{ fontSize: 48, color: 'white', mb: 1 }} />
                                            <Typography variant="h4" fontWeight={800} color="white">
                                                {statsGlobal.puntosPromedio}
                                            </Typography>
                                            <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                                                Puntos Promedio
                                            </Typography>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <Card
                                            sx={{
                                                borderRadius: '20px',
                                                background: colors.gradientWarning,
                                                p: 3,
                                                textAlign: 'center',
                                                boxShadow: `0 8px 24px ${alpha(colors.warning, 0.3)}`
                                            }}
                                        >
                                            <TrophyIcon sx={{ fontSize: 48, color: 'white', mb: 1 }} />
                                            <Typography variant="h4" fontWeight={800} color="white">
                                                {statsGlobal.nivelPromedio}
                                            </Typography>
                                            <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                                                Nivel Promedio
                                            </Typography>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <Card
                                            sx={{
                                                borderRadius: '20px',
                                                background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`,
                                                p: 3,
                                                textAlign: 'center',
                                                boxShadow: `0 8px 24px ${alpha(colors.primary, 0.3)}`
                                            }}
                                        >
                                            <TrendingIcon sx={{ fontSize: 48, color: 'white', mb: 1 }} />
                                            <Typography variant="h4" fontWeight={800} color="white">
                                                {statsGlobal.totalPuntosOtorgados}
                                            </Typography>
                                            <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                                                Puntos Otorgados
                                            </Typography>
                                        </Card>
                                    </Grid>
                                </Grid>

                                {/* Búsqueda de pacientes */}
                                <TextField
                                    fullWidth
                                    placeholder="🔍 Buscar paciente por nombre o email..."
                                    value={searchTermPacientes}
                                    onChange={(e) => setSearchTermPacientes(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: colors.secondaryText }} />
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{
                                        mb: 3,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '16px',
                                            background: colors.background,
                                            '& fieldset': {
                                                borderColor: colors.border
                                            }
                                        }
                                    }}
                                />

                                {/* Lista de pacientes */}
                                <Grid container spacing={3}>
                                    {filteredPacientes.length > 0 ? (
                                        filteredPacientes.map((paciente, index) => (
                                            <Grid item xs={12} sm={6} md={4} key={paciente.id}>
                                                <Zoom in timeout={300 + index * 50}>
                                                    <Card
                                                        sx={{
                                                            borderRadius: '20px',
                                                            border: `2px solid ${colors.border}`,
                                                            background: colors.cardBg,
                                                            transition: 'all 0.3s ease',
                                                            height: '100%',
                                                            '&:hover': {
                                                                transform: 'translateY(-8px)',
                                                                boxShadow: colors.shadow,
                                                                borderColor: colors.primary
                                                            }
                                                        }}
                                                    >
                                                        <CardContent sx={{ p: 3 }}>
                                                            <Stack spacing={2}>
                                                                {/* Avatar y nombre */}
                                                                <Box display="flex" alignItems="center" gap={2}>
                                                                    <Badge
                                                                        overlap="circular"
                                                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                                        badgeContent={
                                                                            <Box
                                                                                sx={{
                                                                                    width: 24,
                                                                                    height: 24,
                                                                                    borderRadius: '50%',
                                                                                    background: colors.gradient,
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    color: 'white',
                                                                                    fontSize: '0.75rem',
                                                                                    fontWeight: 800,
                                                                                    border: `2px solid ${colors.paper}`
                                                                                }}
                                                                            >
                                                                                {paciente.nivel}
                                                                            </Box>
                                                                        }
                                                                    >
                                                                        <Avatar
                                                                            sx={{
                                                                                width: 64,
                                                                                height: 64,
                                                                                background: colors.gradient,
                                                                                fontSize: '1.5rem',
                                                                                fontWeight: 800
                                                                            }}
                                                                        >
                                                                            {paciente.nombre_completo.charAt(0)}
                                                                        </Avatar>
                                                                    </Badge>

                                                                    <Box flex={1}>
                                                                        <Typography
                                                                            variant="subtitle1"
                                                                            fontWeight={700}
                                                                            color={colors.text}
                                                                            sx={{
                                                                                display: '-webkit-box',
                                                                                WebkitLineClamp: 1,
                                                                                WebkitBoxOrient: 'vertical',
                                                                                overflow: 'hidden'
                                                                            }}
                                                                        >
                                                                            {paciente.nombre_completo}
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="caption"
                                                                            color={colors.secondaryText}
                                                                            sx={{
                                                                                display: '-webkit-box',
                                                                                WebkitLineClamp: 1,
                                                                                WebkitBoxOrient: 'vertical',
                                                                                overflow: 'hidden'
                                                                            }}
                                                                        >
                                                                            {paciente.email}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>

                                                                <Divider sx={{ borderColor: colors.border }} />

                                                                {/* Puntos disponibles */}
                                                                <Box>
                                                                    <Typography variant="caption" color={colors.secondaryText} fontWeight={600}>
                                                                        Puntos Disponibles
                                                                    </Typography>
                                                                    <Typography variant="h5" fontWeight={800} color={colors.primary}>
                                                                        {paciente.puntos_disponibles}
                                                                    </Typography>
                                                                    <LinearProgress
                                                                        variant="determinate"
                                                                        value={Math.min((paciente.puntos_disponibles / recompensa?.puntos_requeridos) * 100, 100)}
                                                                        sx={{
                                                                            mt: 1,
                                                                            height: 8,
                                                                            borderRadius: 4,
                                                                            backgroundColor: alpha(colors.primary, 0.1),
                                                                            '& .MuiLinearProgress-bar': {
                                                                                borderRadius: 4,
                                                                                background: colors.gradient
                                                                            }
                                                                        }}
                                                                    />
                                                                </Box>

                                                                {/* Estadísticas */}
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={6}>
                                                                        <Box
                                                                            sx={{
                                                                                background: alpha(colors.success, 0.1),
                                                                                borderRadius: '12px',
                                                                                p: 1.5,
                                                                                textAlign: 'center'
                                                                            }}
                                                                        >
                                                                            <Typography variant="h6" fontWeight={800} color={colors.success}>
                                                                                {paciente.puntos_totales}
                                                                            </Typography>
                                                                            <Typography variant="caption" color={colors.secondaryText}>
                                                                                Total
                                                                            </Typography>
                                                                        </Box>
                                                                    </Grid>

                                                                    <Grid item xs={6}>
                                                                        <Box
                                                                            sx={{
                                                                                background: alpha(colors.warning, 0.1),
                                                                                borderRadius: '12px',
                                                                                p: 1.5,
                                                                                textAlign: 'center'
                                                                            }}
                                                                        >
                                                                            <Typography variant="h6" fontWeight={800} color={colors.warning}>
                                                                                Nivel {paciente.nivel}
                                                                            </Typography>
                                                                            <Typography variant="caption" color={colors.secondaryText}>
                                                                                Rango
                                                                            </Typography>
                                                                        </Box>
                                                                    </Grid>
                                                                </Grid>
                                                            </Stack>
                                                        </CardContent>
                                                    </Card>
                                                </Zoom>
                                            </Grid>
                                        ))
                                    ) : (
                                        <Grid item xs={12}>
                                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                                <PersonIcon sx={{ fontSize: 80, color: colors.secondaryText, mb: 2, opacity: 0.3 }} />
                                                <Typography
                                                    variant="h6"
                                                    color={colors.secondaryText}
                                                >
                                                    No hay pacientes registrados
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        </Fade>
                    )}
                </Card>
            </Grow>

            {/* DIALOG EDITAR RECOMPENSA */}
            <Dialog
                open={openDialogRecompensa}
                onClose={() => setOpenDialogRecompensa(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        background: colors.paper,
                        borderRadius: '28px',
                        boxShadow: '0 24px 72px rgba(0,0,0,0.3)'
                    }
                }}
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '16px',
                                    background: alpha(colors.primary, 0.15),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <EditIcon sx={{ color: colors.primary, fontSize: 28 }} />
                            </Box>
                            <Typography variant="h6" fontWeight={800} color={colors.text}>
                                Editar Recompensa
                            </Typography>
                        </Box>
                        <IconButton onClick={() => setOpenDialogRecompensa(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <Divider sx={{ borderColor: colors.border }} />

                <DialogContent sx={{ pt: 3 }}>
                    <Stack spacing={3}>
                        {/* Selector de icono */}
                        <Box>
                            <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                color={colors.text}
                                sx={{ mb: 1.5 }}
                            >
                                Icono de la Recompensa
                            </Typography>
                            <Grid container spacing={1}>
                                {ICONOS_DISPONIBLES.map((icono) => (
                                    <Grid item key={icono.emoji}>
                                        <Tooltip title={icono.label}>
                                            <Box
                                                onClick={() => setFormRecompensa({
                                                    ...formRecompensa,
                                                    icono: icono.emoji
                                                })}
                                                sx={{
                                                    width: 56,
                                                    height: 56,
                                                    borderRadius: '14px',
                                                    border: `3px solid ${formRecompensa.icono === icono.emoji
                                                        ? colors.primary
                                                        : colors.border
                                                        }`,
                                                    background: formRecompensa.icono === icono.emoji
                                                        ? alpha(colors.primary, 0.1)
                                                        : colors.background,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.8rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        transform: 'scale(1.1)',
                                                        borderColor: colors.primary
                                                    }
                                                }}
                                            >
                                                {icono.emoji}
                                            </Box>
                                        </Tooltip>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        <TextField
                            fullWidth
                            label="Nombre"
                            value={formRecompensa.nombre}
                            onChange={(e) => setFormRecompensa({
                                ...formRecompensa,
                                nombre: e.target.value
                            })}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '16px'
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Descripción"
                            multiline
                            rows={3}
                            value={formRecompensa.descripcion}
                            onChange={(e) => setFormRecompensa({
                                ...formRecompensa,
                                descripcion: e.target.value
                            })}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '16px'
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Puntos Requeridos"
                            type="number"
                            value={formRecompensa.puntos_requeridos}
                            onChange={(e) => setFormRecompensa({
                                ...formRecompensa,
                                puntos_requeridos: parseInt(e.target.value) || 0
                            })}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '16px'
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Premio (ej: 10% descuento)"
                            value={formRecompensa.premio}
                            onChange={(e) => setFormRecompensa({
                                ...formRecompensa,
                                premio: e.target.value
                            })}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '16px'
                                }
                            }}
                        />

                        <Box
                            sx={{
                                p: 2,
                                borderRadius: '16px',
                                background: alpha(
                                    formRecompensa.estado === 1 ? colors.success : colors.error,
                                    0.1
                                ),
                                border: `2px solid ${formRecompensa.estado === 1 ? colors.success : colors.error
                                    }`
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formRecompensa.estado === 1}
                                        onChange={(e) => setFormRecompensa({
                                            ...formRecompensa,
                                            estado: e.target.checked ? 1 : 0
                                        })}
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
                                            {formRecompensa.estado === 1
                                                ? '✅ Recompensa Activa'
                                                : '❌ Recompensa Inactiva'}
                                        </Typography>
                                        <Typography variant="caption" color={colors.secondaryText}>
                                            {formRecompensa.estado === 1
                                                ? 'Visible para pacientes'
                                                : 'Oculta para pacientes'}
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Box>
                    </Stack>
                </DialogContent>

                <Divider sx={{ borderColor: colors.border }} />

                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button
                        onClick={() => setOpenDialogRecompensa(false)}
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

            {/* DIALOG ASIGNAR NUEVO SERVICIO */}
            <Dialog
                open={openAsignarServicio}
                onClose={() => setOpenAsignarServicio(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        background: colors.paper,
                        borderRadius: '28px',
                        boxShadow: '0 24px 72px rgba(0,0,0,0.3)'
                    }
                }}
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '16px',
                                    background: alpha(colors.success, 0.15),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <AddIcon sx={{ color: colors.success, fontSize: 28 }} />
                            </Box>
                            <Typography variant="h6" fontWeight={800} color={colors.text}>
                                Asignar Nuevo Servicio
                            </Typography>
                        </Box>
                        <IconButton onClick={() => setOpenAsignarServicio(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <Divider sx={{ borderColor: colors.border }} />

                <DialogContent sx={{ pt: 3 }}>
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            select
                            label="Selecciona un Servicio"
                            value={formServicio.id_servicio}
                            onChange={(e) => setFormServicio({
                                ...formServicio,
                                id_servicio: e.target.value
                            })}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '16px'
                                }
                            }}
                        >
                            {serviciosDisponibles.map((servicio) => (
                                <MenuItem key={servicio.id} value={servicio.id}>
                                    {servicio.nombre}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            label="Puntos que Otorga"
                            type="number"
                            value={formServicio.puntos}
                            onChange={(e) => setFormServicio({
                                ...formServicio,
                                puntos: parseInt(e.target.value) || 0
                            })}
                            helperText="Puntos que ganará el paciente al completar este servicio"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '16px'
                                }
                            }}
                        />
                    </Stack>
                </DialogContent>

                <Divider sx={{ borderColor: colors.border }} />

                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button
                        onClick={() => setOpenAsignarServicio(false)}
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
                        onClick={handleSaveServicio}
                        variant="contained"
                        disabled={loading}
                        sx={{
                            borderRadius: '16px',
                            background: colors.gradientAlt,
                            px: 4,
                            py: 1.5,
                            fontWeight: 700,
                            fontSize: '1rem',
                            minWidth: 140,
                            boxShadow: `0 8px 24px ${alpha(colors.success, 0.4)}`,
                            '&:hover': {
                                background: colors.gradientAlt,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 12px 32px ${alpha(colors.success, 0.5)}`
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : '💾 Asignar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* DIALOG EDITAR SERVICIO */}
            <Dialog
                open={openDialogServicio}
                onClose={() => setOpenDialogServicio(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        background: colors.paper,
                        borderRadius: '28px',
                        boxShadow: '0 24px 72px rgba(0,0,0,0.3)'
                    }
                }}
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '16px',
                                    background: alpha(colors.primary, 0.15),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <EditIcon sx={{ color: colors.primary, fontSize: 28 }} />
                            </Box>
                            <Typography variant="h6" fontWeight={800} color={colors.text}>
                                Editar Servicio
                            </Typography>
                        </Box>
                        <IconButton onClick={() => setOpenDialogServicio(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <Divider sx={{ borderColor: colors.border }} />

                <DialogContent sx={{ pt: 3 }}>
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="Nombre del Servicio"
                            value={selectedServicio?.nombre_servicio || ''}
                            disabled
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '16px'
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Puntos que Otorga"
                            type="number"
                            value={formServicio.puntos}
                            onChange={(e) => setFormServicio({
                                ...formServicio,
                                puntos: parseInt(e.target.value) || 0
                            })}
                            helperText="Puntos que ganará el paciente al completar este servicio"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '16px'
                                }
                            }}
                        />

                        <Box
                            sx={{
                                p: 2,
                                borderRadius: '16px',
                                background: alpha(
                                    formServicio.estado === 1 ? colors.success : colors.error,
                                    0.1
                                ),
                                border: `2px solid ${formServicio.estado === 1 ? colors.success : colors.error
                                    }`
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formServicio.estado === 1}
                                        onChange={(e) => setFormServicio({
                                            ...formServicio,
                                            estado: e.target.checked ? 1 : 0
                                        })}
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
                                            {formServicio.estado === 1
                                                ? '✅ Servicio Activo'
                                                : '❌ Servicio Inactivo'}
                                        </Typography>
                                        <Typography variant="caption" color={colors.secondaryText}>
                                            {formServicio.estado === 1
                                                ? 'Disponible para asignar puntos'
                                                : 'No disponible en el sistema'}
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Box>
                    </Stack>
                </DialogContent>

                <Divider sx={{ borderColor: colors.border }} />

                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button
                        onClick={() => setOpenDialogServicio(false)}
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
                        onClick={handleSaveServicio}
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

            {/* DIALOG ELIMINAR SERVICIO */}
            <Dialog
                open={openDeleteDialogServicio}
                onClose={() => setOpenDeleteDialogServicio(false)}
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
                            ¿Eliminar Servicio?
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ pt: 2 }}>
                    <Typography color={colors.text} gutterBottom fontWeight={600}>
                        ¿Estás seguro de eliminar <strong>"{selectedServicio?.nombre_servicio}"</strong> de la gamificación?
                    </Typography>
                    <Typography variant="body2" color={colors.secondaryText}>
                        ⚠️ Esta acción removerá el servicio de la gamificación pero no lo eliminará del catálogo de servicios.
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button
                        onClick={() => setOpenDeleteDialogServicio(false)}
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
                        onClick={handleDeleteServicio}
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

export default AdminGamificacion;