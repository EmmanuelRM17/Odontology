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
    Tabs
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    CheckCircle as CheckIcon,
    LocalHospital as ServiceIcon
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

    const [activeTab, setActiveTab] = useState(0); // 0: Recompensa, 1: Servicios
    
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
    const [filteredServicios, setFilteredServicios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEstado, setSelectedEstado] = useState('todos');
    const [openDialogServicio, setOpenDialogServicio] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedServicio, setSelectedServicio] = useState(null);
    const [formServicio, setFormServicio] = useState({
        nombre: '',
        puntos: 10,
        estado: 1
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
    }, [searchTerm, selectedEstado, servicios]);

    // Cargar datos de recompensa y servicios
    const cargarDatos = async () => {
        setIsLoadingData(true);
        try {
            const [resRecompensas, resServicios] = await Promise.all([
                axios.get(`${API_URL}/recompensas`),
                axios.get(`${API_URL}/servicios`)
            ]);
            
            if (resRecompensas.data.length > 0) {
                setRecompensa(resRecompensas.data[0]);
            }
            
            setServicios(resServicios.data || []);
        } catch (error) {
            showNotif('Error al cargar datos', 'error');
        } finally {
            setIsLoadingData(false);
        }
    };

    // Filtrar servicios
    const filtrarServicios = () => {
        let filtered = servicios;

        if (searchTerm) {
            filtered = filtered.filter(s => 
                s.nombre.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedEstado === 'activos') {
            filtered = filtered.filter(s => s.estado === 1);
        } else if (selectedEstado === 'inactivos') {
            filtered = filtered.filter(s => s.estado === 0);
        }

        setFilteredServicios(filtered);
    };

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

    // Guardar recompensa
    const handleSaveRecompensa = async () => {
        if (!formRecompensa.nombre || !formRecompensa.puntos_requeridos) {
            showNotif('Completa todos los campos requeridos', 'error');
            return;
        }

        setLoading(true);
        try {
            await axios.put(`${API_URL}/recompensas/${recompensa.id}`, formRecompensa);
            showNotif('✅ Recompensa actualizada correctamente', 'success');
            setOpenDialogRecompensa(false);
            cargarDatos();
        } catch (error) {
            showNotif('❌ Error al actualizar recompensa', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Abrir modal servicio (crear/editar)
    const handleOpenServicio = (servicio = null) => {
        if (servicio) {
            setSelectedServicio(servicio);
            setFormServicio({
                nombre: servicio.nombre,
                puntos: servicio.puntos,
                estado: servicio.estado
            });
        } else {
            setSelectedServicio(null);
            setFormServicio({ nombre: '', puntos: 10, estado: 1 });
        }
        setOpenDialogServicio(true);
    };

    // Guardar servicio
    const handleSaveServicio = async () => {
        if (!formServicio.nombre || !formServicio.puntos) {
            showNotif('Completa todos los campos requeridos', 'error');
            return;
        }

        setLoading(true);
        try {
            if (selectedServicio) {
                await axios.put(`${API_URL}/servicios/${selectedServicio.id}`, formServicio);
                showNotif('✅ Servicio actualizado correctamente', 'success');
            } else {
                await axios.post(`${API_URL}/servicios`, formServicio);
                showNotif('✅ Servicio creado correctamente', 'success');
            }
            setOpenDialogServicio(false);
            cargarDatos();
        } catch (error) {
            showNotif('❌ Error al guardar servicio', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Abrir confirmación eliminar
    const handleOpenDelete = (servicio) => {
        setSelectedServicio(servicio);
        setOpenDeleteDialog(true);
    };

    // Eliminar servicio
    const handleDeleteServicio = async () => {
        setLoading(true);
        try {
            await axios.delete(`${API_URL}/servicios/${selectedServicio.id}`);
            showNotif('🗑️ Servicio eliminado correctamente', 'success');
            setOpenDeleteDialog(false);
            cargarDatos();
        } catch (error) {
            showNotif('❌ Error al eliminar servicio', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (isLoadingData) {
        return (
            <Box 
                sx={{ 
                    minHeight: '100vh',
                    background: colors.background,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <CircularProgress size={60} sx={{ color: colors.primary }} />
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
                    <Typography 
                        variant="h4" 
                        fontWeight={800} 
                        color={colors.text}
                        sx={{ mb: 1 }}
                    >
                        🎮 Gestión de Gamificación
                    </Typography>
                    <Typography variant="body1" color={colors.secondaryText}>
                        Administra recompensas y servicios del sistema OdontoPuntos
                    </Typography>
                </Box>
            </Fade>

            {/* Tabs */}
            <Grow in timeout={800}>
                <Card
                    sx={{
                        maxWidth: 1200,
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
                        variant="fullWidth"
                        sx={{
                            borderBottom: `2px solid ${colors.border}`,
                            '& .MuiTab-root': {
                                fontSize: '1rem',
                                fontWeight: 700,
                                py: 2.5,
                                color: colors.secondaryText,
                                textTransform: 'none',
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
                        <Tab label="🎁 Recompensa" />
                        <Tab label="🦷 Servicios" />
                    </Tabs>

                    {/* SECCIÓN RECOMPENSA */}
                    {activeTab === 0 && (
                        <Fade in timeout={400}>
                            <Box sx={{ p: isMobile ? 3 : 4 }}>
                                {recompensa ? (
                                    <Stack spacing={3}>
                                        {/* Card Recompensa */}
                                        <Card
                                            sx={{
                                                background: colors.cardBg,
                                                borderRadius: '20px',
                                                border: `2px solid ${colors.border}`,
                                                p: 4,
                                                textAlign: 'center'
                                            }}
                                        >
                                            <Typography 
                                                sx={{ 
                                                    fontSize: '5rem',
                                                    mb: 2
                                                }}
                                            >
                                                {recompensa.icono}
                                            </Typography>
                                            
                                            <Typography 
                                                variant="h5" 
                                                fontWeight={800} 
                                                color={colors.text}
                                                sx={{ mb: 1 }}
                                            >
                                                {recompensa.nombre}
                                            </Typography>

                                            <Typography 
                                                variant="body1" 
                                                color={colors.secondaryText}
                                                sx={{ mb: 3 }}
                                            >
                                                {recompensa.descripcion}
                                            </Typography>

                                            <Box 
                                                sx={{ 
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    mb: 2
                                                }}
                                            >
                                                <Chip
                                                    label={`${recompensa.puntos_requeridos} puntos`}
                                                    sx={{
                                                        background: colors.gradient,
                                                        color: 'white',
                                                        fontWeight: 700,
                                                        fontSize: '1rem',
                                                        px: 2,
                                                        py: 3
                                                    }}
                                                />
                                                <Typography 
                                                    variant="h6" 
                                                    fontWeight={700}
                                                    color={colors.text}
                                                >
                                                    =
                                                </Typography>
                                                <Chip
                                                    label={recompensa.premio}
                                                    sx={{
                                                        background: colors.gradientAlt,
                                                        color: 'white',
                                                        fontWeight: 700,
                                                        fontSize: '1rem',
                                                        px: 2,
                                                        py: 3
                                                    }}
                                                />
                                            </Box>

                                            <Chip
                                                icon={recompensa.estado === 1 ? <CheckIcon /> : <CloseIcon />}
                                                label={recompensa.estado === 1 ? 'Activa' : 'Inactiva'}
                                                sx={{
                                                    background: alpha(
                                                        recompensa.estado === 1 ? colors.success : colors.error, 
                                                        0.15
                                                    ),
                                                    color: recompensa.estado === 1 ? colors.success : colors.error,
                                                    fontWeight: 700,
                                                    borderRadius: '12px',
                                                    px: 2,
                                                    py: 2.5
                                                }}
                                            />
                                        </Card>

                                        {/* Botón Editar */}
                                        <Button
                                            variant="contained"
                                            size="large"
                                            startIcon={<EditIcon />}
                                            onClick={handleEditRecompensa}
                                            sx={{
                                                borderRadius: '16px',
                                                background: colors.gradient,
                                                py: 1.8,
                                                fontWeight: 700,
                                                fontSize: '1rem',
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
                                    <Typography 
                                        variant="h6" 
                                        color={colors.secondaryText}
                                        textAlign="center"
                                        sx={{ py: 8 }}
                                    >
                                        No hay recompensa configurada
                                    </Typography>
                                )}
                            </Box>
                        </Fade>
                    )}

                    {/* SECCIÓN SERVICIOS */}
                    {activeTab === 1 && (
                        <Fade in timeout={400}>
                            <Box sx={{ p: isMobile ? 3 : 4 }}>
                                {/* Filtros y búsqueda */}
                                <Stack spacing={2} sx={{ mb: 3 }}>
                                    <TextField
                                        fullWidth
                                        placeholder="🔍 Buscar servicio..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
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
                                    <Stack direction="row" spacing={1}>
                                        {['todos', 'activos', 'inactivos'].map((estado) => (
                                            <Chip
                                                key={estado}
                                                label={estado.charAt(0).toUpperCase() + estado.slice(1)}
                                                onClick={() => setSelectedEstado(estado)}
                                                sx={{
                                                    background: selectedEstado === estado 
                                                        ? colors.primary 
                                                        : colors.background,
                                                    color: selectedEstado === estado 
                                                        ? 'white' 
                                                        : colors.text,
                                                    fontWeight: 700,
                                                    borderRadius: '12px',
                                                    px: 2,
                                                    py: 2.5,
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        background: selectedEstado === estado 
                                                            ? colors.primary 
                                                            : colors.hover
                                                    }
                                                }}
                                            />
                                        ))}
                                    </Stack>

                                    {/* Botón Agregar */}
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<AddIcon />}
                                        onClick={() => handleOpenServicio()}
                                        sx={{
                                            borderRadius: '16px',
                                            background: colors.gradientAlt,
                                            py: 1.8,
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
                                        Agregar Servicio
                                    </Button>
                                </Stack>

                                {/* Lista de servicios */}
                                <Stack spacing={2}>
                                    {filteredServicios.length > 0 ? (
                                        filteredServicios.map((servicio, index) => (
                                            <Zoom in key={servicio.id} timeout={300 + index * 50}>
                                                <Card
                                                    sx={{
                                                        borderRadius: '16px',
                                                        border: `2px solid ${colors.border}`,
                                                        background: colors.cardBg,
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            transform: 'translateY(-4px)',
                                                            boxShadow: colors.shadow,
                                                            borderColor: colors.primary
                                                        }
                                                    }}
                                                >
                                                    <CardContent>
                                                        <Grid container alignItems="center" spacing={2}>
                                                            <Grid item xs>
                                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                                    <Box
                                                                        sx={{
                                                                            width: 48,
                                                                            height: 48,
                                                                            borderRadius: '12px',
                                                                            background: alpha(colors.primary, 0.1),
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}
                                                                    >
                                                                        <ServiceIcon sx={{ color: colors.primary }} />
                                                                    </Box>
                                                                    <Box>
                                                                        <Typography 
                                                                            variant="h6" 
                                                                            fontWeight={700}
                                                                            color={colors.text}
                                                                        >
                                                                            {servicio.nombre}
                                                                        </Typography>
                                                                        <Chip
                                                                            label={`${servicio.puntos} puntos`}
                                                                            size="small"
                                                                            sx={{
                                                                                background: alpha(colors.primary, 0.1),
                                                                                color: colors.primary,
                                                                                fontWeight: 700,
                                                                                mt: 0.5
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                </Stack>
                                                            </Grid>

                                                            <Grid item>
                                                                <Stack direction="row" spacing={1} alignItems="center">
                                                                    <Chip
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

                                                                    <Tooltip title="Editar">
                                                                        <IconButton
                                                                            onClick={() => handleOpenServicio(servicio)}
                                                                            sx={{
                                                                                background: alpha(colors.primary, 0.1),
                                                                                color: colors.primary,
                                                                                '&:hover': {
                                                                                    background: alpha(colors.primary, 0.2)
                                                                                }
                                                                            }}
                                                                        >
                                                                            <EditIcon />
                                                                        </IconButton>
                                                                    </Tooltip>

                                                                    <Tooltip title="Eliminar">
                                                                        <IconButton
                                                                            onClick={() => handleOpenDelete(servicio)}
                                                                            sx={{
                                                                                background: alpha(colors.error, 0.1),
                                                                                color: colors.error,
                                                                                '&:hover': {
                                                                                    background: alpha(colors.error, 0.2)
                                                                                }
                                                                            }}
                                                                        >
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Stack>
                                                            </Grid>
                                                        </Grid>
                                                    </CardContent>
                                                </Card>
                                            </Zoom>
                                        ))
                                    ) : (
                                        <Typography 
                                            variant="h6" 
                                            color={colors.secondaryText}
                                            textAlign="center"
                                            sx={{ py: 8 }}
                                        >
                                            No hay servicios disponibles
                                        </Typography>
                                    )}
                                </Stack>
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
                                                    border: `3px solid ${
                                                        formRecompensa.icono === icono.emoji 
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
                                border: `2px solid ${
                                    formRecompensa.estado === 1 ? colors.success : colors.error
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

            {/* DIALOG CREAR/EDITAR SERVICIO */}
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
                                    background: alpha(
                                        selectedServicio ? colors.primary : colors.success, 
                                        0.15
                                    ),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {selectedServicio ? (
                                    <EditIcon sx={{ 
                                        color: colors.primary, 
                                        fontSize: 28 
                                    }} />
                                ) : (
                                    <AddIcon sx={{ 
                                        color: colors.success, 
                                        fontSize: 28 
                                    }} />
                                )}
                            </Box>
                            <Typography variant="h6" fontWeight={800} color={colors.text}>
                                {selectedServicio ? 'Editar Servicio' : 'Nuevo Servicio'}
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
                            placeholder="Ej: Consulta General"
                            value={formServicio.nombre}
                            onChange={(e) => setFormServicio({ 
                                ...formServicio, 
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
                                border: `2px solid ${
                                    formServicio.estado === 1 ? colors.success : colors.error
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
                            background: selectedServicio ? colors.gradient : colors.gradientAlt,
                            px: 4,
                            py: 1.5,
                            fontWeight: 700,
                            fontSize: '1rem',
                            minWidth: 140,
                            boxShadow: `0 8px 24px ${alpha(
                                selectedServicio ? colors.primary : colors.success, 
                                0.4
                            )}`,
                            '&:hover': {
                                background: selectedServicio ? colors.gradient : colors.gradientAlt,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 12px 32px ${alpha(
                                    selectedServicio ? colors.primary : colors.success, 
                                    0.5
                                )}`
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : '💾 Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* DIALOG ELIMINAR SERVICIO */}
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
                            ¿Eliminar Servicio?
                        </Typography>
                    </Box>
                </DialogTitle>
                
                <DialogContent sx={{ pt: 2 }}>
                    <Typography color={colors.text} gutterBottom fontWeight={600}>
                        ¿Estás seguro de eliminar <strong>"{selectedServicio?.nombre}"</strong>?
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