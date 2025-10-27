import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Typography,
    Stack,
    CircularProgress,
    alpha,
    Grid,
    Fade,
    InputAdornment,
    Avatar,
    LinearProgress,
    Chip
} from '@mui/material';
import {
    Search as SearchIcon,
    Person as PersonIcon,
    EmojiEvents as TrophyIcon,
    TrendingUp as TrendingIcon,
    Star as StarIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'https://back-end-4803.onrender.com/api/gamificacion';

const PacientesTab = ({ colors, isMobile, isTablet, showNotif }) => {
    const [pacientes, setPacientes] = useState([]);
    const [filteredPacientes, setFilteredPacientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        total_pacientes: 0,
        promedio_puntos_disponibles: 0,
        promedio_nivel: 0,
        total_puntos_otorgados: 0
    });

    useEffect(() => {
        cargarPacientes();
        cargarEstadisticas();
    }, []);

    useEffect(() => {
        filtrarPacientes();
    }, [searchTerm, pacientes]);

    // Cargar pacientes con gamificación
    const cargarPacientes = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_URL}/pacientes-gamificacion`);
            setPacientes(data);
        } catch (error) {
            showNotif('Error al cargar pacientes', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Cargar estadísticas globales
    const cargarEstadisticas = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/estadisticas`);
            setStats(data);
        } catch (error) {
            console.error('Error al cargar estadísticas');
        }
    };

    // Filtrar pacientes por búsqueda
    const filtrarPacientes = () => {
        if (!searchTerm) {
            setFilteredPacientes(pacientes);
            return;
        }

        const filtered = pacientes.filter(p =>
            p.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPacientes(filtered);
    };

    // Calcular color del nivel
    const getNivelColor = (nivel) => {
        if (nivel >= 10) return colors.success;
        if (nivel >= 5) return colors.primary;
        return colors.warning;
    };

    if (loading && pacientes.length === 0) {
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
                <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={800} color={colors.text} mb={3}>
                    👥 Pacientes con Gamificación
                </Typography>

                {/* Stats Cards */}
                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card
                            sx={{
                                background: colors.gradient,
                                borderRadius: '20px',
                                boxShadow: colors.shadow,
                                height: '100%'
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Avatar
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            background: 'rgba(255,255,255,0.2)',
                                            fontSize: '1.8rem'
                                        }}
                                    >
                                        👥
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" fontWeight={800} color="white">
                                            {stats.total_pacientes || 0}
                                        </Typography>
                                        <Typography variant="body2" color="rgba(255,255,255,0.9)" fontWeight={600}>
                                            Total Pacientes
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card
                            sx={{
                                background: colors.gradientAlt,
                                borderRadius: '20px',
                                boxShadow: colors.shadow,
                                height: '100%'
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Avatar
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            background: 'rgba(255,255,255,0.2)',
                                            fontSize: '1.8rem'
                                        }}
                                    >
                                        ⭐
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" fontWeight={800} color="white">
                                            {Math.round(stats.promedio_puntos_disponibles) || 0}
                                        </Typography>
                                        <Typography variant="body2" color="rgba(255,255,255,0.9)" fontWeight={600}>
                                            Promedio Puntos
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card
                            sx={{
                                background: colors.gradientWarning,
                                borderRadius: '20px',
                                boxShadow: colors.shadow,
                                height: '100%'
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Avatar
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            background: 'rgba(255,255,255,0.2)',
                                            fontSize: '1.8rem'
                                        }}
                                    >
                                        📊
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" fontWeight={800} color="white">
                                            {stats.promedio_nivel || 0}
                                        </Typography>
                                        <Typography variant="body2" color="rgba(255,255,255,0.9)" fontWeight={600}>
                                            Nivel Promedio
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card
                            sx={{
                                background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`,
                                borderRadius: '20px',
                                boxShadow: colors.shadow,
                                height: '100%'
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Avatar
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            background: 'rgba(255,255,255,0.2)',
                                            fontSize: '1.8rem'
                                        }}
                                    >
                                        🎯
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" fontWeight={800} color="white">
                                            {stats.total_puntos_otorgados || 0}
                                        </Typography>
                                        <Typography variant="body2" color="rgba(255,255,255,0.9)" fontWeight={600}>
                                            Puntos Totales
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Barra de búsqueda */}
                <Box mb={3}>
                    <TextField
                        placeholder="Buscar paciente por nombre o email..."
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
                                borderRadius: '16px',
                                background: colors.paper
                            }
                        }}
                    />
                </Box>

                {/* Grid de pacientes */}
                {filteredPacientes.length > 0 ? (
                    <Grid container spacing={3}>
                        {filteredPacientes.map((paciente) => (
                            <Grid item xs={12} sm={6} md={4} key={paciente.id_paciente}>
                                <Card
                                    sx={{
                                        background: colors.cardBg,
                                        borderRadius: '24px',
                                        border: `1px solid ${colors.border}`,
                                        boxShadow: colors.shadow,
                                        backdropFilter: colors.glassBlur,
                                        height: '100%',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: `0 24px 48px ${alpha(colors.primary, 0.2)}`
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        {/* Avatar y nombre */}
                                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                                            <Avatar
                                                sx={{
                                                    width: 56,
                                                    height: 56,
                                                    background: colors.gradient,
                                                    fontSize: '1.5rem',
                                                    fontWeight: 800
                                                }}
                                            >
                                                {paciente.nombre_completo.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box flex={1}>
                                                <Typography variant="h6" fontWeight={800} color={colors.text} noWrap>
                                                    {paciente.nombre_completo}
                                                </Typography>
                                                <Typography variant="caption" color={colors.secondaryText} noWrap>
                                                    {paciente.email}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Nivel */}
                                        <Box
                                            sx={{
                                                p: 2,
                                                borderRadius: '16px',
                                                background: alpha(getNivelColor(paciente.nivel), 0.1),
                                                border: `2px solid ${alpha(getNivelColor(paciente.nivel), 0.3)}`,
                                                mb: 2
                                            }}
                                        >
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                                <Typography variant="body2" fontWeight={700} color={colors.text}>
                                                    Nivel {paciente.nivel}
                                                </Typography>
                                                <StarIcon sx={{ color: getNivelColor(paciente.nivel), fontSize: 20 }} />
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={Math.min((paciente.puntos_totales % 100), 100)}
                                                sx={{
                                                    height: 8,
                                                    borderRadius: '8px',
                                                    background: alpha(colors.secondaryText, 0.1),
                                                    '& .MuiLinearProgress-bar': {
                                                        borderRadius: '8px',
                                                        background: `linear-gradient(90deg, ${getNivelColor(paciente.nivel)}, ${alpha(getNivelColor(paciente.nivel), 0.7)})`
                                                    }
                                                }}
                                            />
                                        </Box>

                                        {/* Puntos */}
                                        <Stack spacing={1.5}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    p: 1.5,
                                                    borderRadius: '12px',
                                                    background: alpha(colors.primary, 0.05)
                                                }}
                                            >
                                                <Typography variant="body2" color={colors.secondaryText} fontWeight={600}>
                                                    Puntos Disponibles
                                                </Typography>
                                                <Chip
                                                    label={paciente.puntos_disponibles}
                                                    sx={{
                                                        background: colors.gradient,
                                                        color: 'white',
                                                        fontWeight: 800,
                                                        fontSize: '0.9rem'
                                                    }}
                                                />
                                            </Box>

                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    p: 1.5,
                                                    borderRadius: '12px',
                                                    background: alpha(colors.success, 0.05)
                                                }}
                                            >
                                                <Typography variant="body2" color={colors.secondaryText} fontWeight={600}>
                                                    Puntos Totales
                                                </Typography>
                                                <Chip
                                                    label={paciente.puntos_totales}
                                                    sx={{
                                                        background: colors.gradientAlt,
                                                        color: 'white',
                                                        fontWeight: 800,
                                                        fontSize: '0.9rem'
                                                    }}
                                                />
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
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
                        <PersonIcon sx={{ fontSize: 64, color: colors.secondaryText, mb: 2 }} />
                        <Typography variant="h6" color={colors.secondaryText} fontWeight={600}>
                            No hay pacientes registrados
                        </Typography>
                        <Typography variant="body2" color={colors.secondaryText}>
                            {searchTerm ? 'Intenta con otra búsqueda' : 'Los pacientes aparecerán aquí cuando completen servicios'}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Fade>
    );
};

export default PacientesTab;