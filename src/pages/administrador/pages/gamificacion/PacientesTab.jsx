import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
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
    Chip,
    Paper
} from '@mui/material';
import {
    Search as SearchIcon,
    Person as PersonIcon,
    People as PeopleIcon,
    Stars as StarsIcon,
    TrendingUp as TrendingIcon,
    EmojiEvents as TrophyIcon,
    Grade as GradeIcon,
    LocalActivity as ActivityIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'https://back-end-4803.onrender.com/api/gamificacion';

const STATS_INICIAL = {
    total_pacientes: 0,
    promedio_puntos_disponibles: 0,
    promedio_nivel: 0,
    total_puntos_otorgados: 0
};

// Hook custom para peticiones con timeout
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

// Componente de estadística memoizado
const StatCard = memo(({ icon: Icon, value, label, gradient, colors }) => (
    <Card
        sx={{
            background: gradient,
            borderRadius: '20px',
            boxShadow: colors.shadow,
            height: '100%'
        }}
    >
        <CardContent sx={{ p: 2.5 }}>
            <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                    sx={{
                        width: 52,
                        height: 52,
                        background: 'rgba(255,255,255,0.2)'
                    }}
                >
                    <Icon sx={{ fontSize: 28, color: 'white' }} />
                </Avatar>
                <Box>
                    <Typography variant="h4" fontWeight={700} color="white">
                        {value}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.95)" fontWeight={600}>
                        {label}
                    </Typography>
                </Box>
            </Box>
        </CardContent>
    </Card>
));

// Componente de card de paciente memoizado
const PacienteCard = memo(({ paciente, colors, getNivelColor }) => (
    <Card
        sx={{
            background: colors.paper,
            borderRadius: '20px',
            border: `1px solid ${colors.border}`,
            boxShadow: colors.shadow,
            height: '100%',
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-6px)',
                boxShadow: `0 20px 40px ${alpha(colors.primary, 0.2)}`
            }
        }}
    >
        <CardContent sx={{ p: 2.5 }}>
            {/* Avatar y nombre */}
            <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar
                    sx={{
                        width: 52,
                        height: 52,
                        background: colors.gradient,
                        fontSize: '1.4rem',
                        fontWeight: 700
                    }}
                >
                    {paciente.nombre_completo.charAt(0).toUpperCase()}
                </Avatar>
                <Box flex={1} minWidth={0}>
                    <Typography variant="h6" fontWeight={700} color={colors.text} noWrap>
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
                    p: 1.5,
                    borderRadius: '12px',
                    background: alpha(getNivelColor(paciente.nivel), 0.08),
                    border: `2px solid ${alpha(getNivelColor(paciente.nivel), 0.25)}`,
                    mb: 1.5
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" fontWeight={700} color={colors.text}>
                        Nivel {paciente.nivel}
                    </Typography>
                    <GradeIcon sx={{ color: getNivelColor(paciente.nivel), fontSize: 20 }} />
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={Math.min((paciente.puntos_totales % 100), 100)}
                    sx={{
                        height: 6,
                        borderRadius: '6px',
                        background: alpha(colors.secondaryText, 0.1),
                        '& .MuiLinearProgress-bar': {
                            borderRadius: '6px',
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
                        icon={<StarsIcon sx={{ fontSize: 16, color: 'white' }} />}
                        label={paciente.puntos_disponibles}
                        sx={{
                            background: colors.gradient,
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            height: 28
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
                        icon={<TrophyIcon sx={{ fontSize: 16, color: 'white' }} />}
                        label={paciente.puntos_totales}
                        sx={{
                            background: `linear-gradient(135deg, ${colors.success} 0%, ${alpha(colors.success, 0.8)} 100%)`,
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            height: 28
                        }}
                    />
                </Box>
            </Stack>
        </CardContent>
    </Card>
));

const PacientesTab = ({ colors, isMobile, isTablet, showNotif }) => {
    const [pacientes, setPacientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(STATS_INICIAL);

    const ejecutarPeticion = useApiRequest(showNotif);

    // Cargar datos al montar
    useEffect(() => {
        cargarDatos();
    }, []);

    // Cargar pacientes y estadísticas
    const cargarDatos = useCallback(async () => {
        setLoading(true);
        await Promise.all([cargarPacientes(), cargarEstadisticas()]);
        setLoading(false);
    }, []);

    // Cargar pacientes con gamificación
    const cargarPacientes = useCallback(async () => {
        const { exito, data } = await ejecutarPeticion(
            (signal) => axios.get(`${API_URL}/pacientes-gamificacion`, { signal }).then(res => res.data)
        );
        if (exito) setPacientes(data);
    }, [ejecutarPeticion]);

    // Cargar estadísticas globales
    const cargarEstadisticas = useCallback(async () => {
        const { exito, data } = await ejecutarPeticion(
            (signal) => axios.get(`${API_URL}/estadisticas`, { signal }).then(res => res.data)
        );
        if (exito) setStats(data);
    }, [ejecutarPeticion]);

    // Filtrar pacientes por búsqueda con useMemo
    const filteredPacientes = useMemo(() => {
        if (!searchTerm) return pacientes;

        return pacientes.filter(p =>
            p.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [pacientes, searchTerm]);

    // Calcular color del nivel
    const getNivelColor = useCallback((nivel) => {
        if (nivel >= 10) return colors.success;
        if (nivel >= 5) return colors.primary;
        return colors.warning;
    }, [colors]);

    // Configuración de estadísticas
    const statsConfig = useMemo(() => [
        {
            icon: PeopleIcon,
            value: stats.total_pacientes || 0,
            label: 'Total Pacientes',
            gradient: colors.gradient
        },
        {
            icon: StarsIcon,
            value: Math.round(stats.promedio_puntos_disponibles) || 0,
            label: 'Promedio Puntos',
            gradient: `linear-gradient(135deg, ${colors.success} 0%, ${alpha(colors.success, 0.8)} 100%)`
        },
        {
            icon: TrendingIcon,
            value: stats.promedio_nivel || 0,
            label: 'Nivel Promedio',
            gradient: `linear-gradient(135deg, ${colors.warning} 0%, ${alpha(colors.warning, 0.8)} 100%)`
        },
        {
            icon: ActivityIcon,
            value: stats.total_puntos_otorgados || 0,
            label: 'Puntos Totales',
            gradient: `linear-gradient(135deg, ${colors.primaryDark || colors.primary} 0%, ${colors.primary} 100%)`
        }
    ], [stats, colors]);

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
                <Box sx={{ mb: 2.5 }}>
                    <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} color={colors.text}>
                        Pacientes con Gamificación
                    </Typography>
                    <Typography variant="body2" color={colors.secondaryText}>
                        Monitorea el progreso y puntos de tus pacientes
                    </Typography>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={2.5} mb={3}>
                    {statsConfig.map((stat, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <StatCard {...stat} colors={colors} />
                        </Grid>
                    ))}
                </Grid>

                {/* Barra de búsqueda */}
                <Box mb={2.5}>
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
                                borderRadius: '12px',
                                background: colors.paper
                            }
                        }}
                    />
                </Box>

                {/* Grid de pacientes */}
                {filteredPacientes.length > 0 ? (
                    <Grid container spacing={2.5}>
                        {filteredPacientes.map((paciente) => (
                            <Grid item xs={12} sm={6} md={4} key={paciente.id_paciente}>
                                <PacienteCard
                                    paciente={paciente}
                                    colors={colors}
                                    getNivelColor={getNivelColor}
                                />
                            </Grid>
                        ))}
                    </Grid>
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
                        <PersonIcon sx={{ fontSize: 56, color: colors.secondaryText, mb: 1.5 }} />
                        <Typography variant="h6" color={colors.secondaryText} fontWeight={600}>
                            No hay pacientes registrados
                        </Typography>
                        <Typography variant="body2" color={colors.secondaryText}>
                            {searchTerm ? 'Intenta con otra búsqueda' : 'Los pacientes aparecerán cuando completen servicios'}
                        </Typography>
                    </Paper>
                )}
            </Box>
        </Fade>
    );
};

export default memo(PacientesTab);