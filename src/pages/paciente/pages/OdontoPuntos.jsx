import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Paper,
    Button,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Alert,
    alpha,
    Divider,
    LinearProgress,
    IconButton,
    Fade
} from '@mui/material';
import {
    Stars as StarsIcon,
    EmojiEvents as TrophyIcon,
    CardGiftcard as GiftIcon,
    History as HistoryIcon,
    Close as CloseIcon,
    CheckCircle as CheckIcon,
    TrendingUp as TrendingIcon,
    LocalOffer as OfferIcon,
    Redeem as RedeemIcon
} from '@mui/icons-material';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import { useAuth } from '../../../components/Tools/AuthContext';
import axios from 'axios';

const API_URL = 'https://back-end-4803.onrender.com/api/gamificacion';

// Componente de estadística memoizado
const StatCard = memo(({ icon: Icon, title, value, subtitle, color, gradient }) => (
    <Paper
        elevation={0}
        sx={{
            p: 2.5,
            borderRadius: '16px',
            background: gradient,
            border: `1px solid ${alpha(color, 0.2)}`,
            height: '100%',
            transition: 'transform 0.2s ease',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 24px ${alpha(color, 0.2)}`
            }
        }}
    >
        <Box display="flex" alignItems="center" gap={2}>
            <Box
                sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '12px',
                    background: alpha(color, 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Icon sx={{ fontSize: 28, color }} />
            </Box>
            <Box flex={1}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {title}
                </Typography>
                <Typography variant="h4" fontWeight={700} color={color} mt={0.5}>
                    {value}
                </Typography>
                {subtitle && (
                    <Typography variant="caption" color="text.secondary">
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Box>
    </Paper>
));

const OdontoPuntos = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingAction, setLoadingAction] = useState(false);
    const [datosGamificacion, setDatosGamificacion] = useState(null);
    const [recompensa, setRecompensa] = useState(null);
    const [historialPuntos, setHistorialPuntos] = useState([]);
    const [historialCanjeos, setHistorialCanjeos] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [canjeExitoso, setCanjeExitoso] = useState(null);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

    const { isDarkTheme } = useThemeContext();
    const { user } = useAuth();

    const colors = useMemo(() => ({
        background: isDarkTheme ? '#1A1F2C' : '#FFFFFF',
        paper: isDarkTheme ? '#1E293B' : '#FFFFFF',
        primary: isDarkTheme ? '#4B9FFF' : '#1976d2',
        secondary: isDarkTheme ? '#10B981' : '#059669',
        success: isDarkTheme ? '#10B981' : '#059669',
        error: isDarkTheme ? '#F87171' : '#EF4444',
        warning: isDarkTheme ? '#FBBF24' : '#F59E0B',
        text: isDarkTheme ? '#F3F4F6' : '#1F2937',
        secondaryText: isDarkTheme ? '#94A3B8' : '#64748B',
        border: isDarkTheme ? '#334155' : '#E2E8F0',
        shadow: isDarkTheme ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.05)',
        gradient: isDarkTheme
            ? `linear-gradient(135deg, rgba(75,159,255,0.1) 0%, rgba(16,185,129,0.1) 100%)`
            : `linear-gradient(135deg, rgba(25,118,210,0.08) 0%, rgba(5,150,105,0.08) 100%)`
    }), [isDarkTheme]);

    // Cargar todos los datos
    const cargarDatos = useCallback(async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const [gamificacion, recompensaData, puntos, canjeos] = await Promise.allSettled([
                axios.get(`${API_URL}/paciente/${user.id}`),
                axios.get(`${API_URL}/recompensa`),
                axios.get(`${API_URL}/historial-puntos/${user.id}`),
                axios.get(`${API_URL}/historial-canjeos/${user.id}`)
            ]);

            if (gamificacion.status === 'fulfilled') {
                setDatosGamificacion(gamificacion.value.data);
            }
            if (recompensaData.status === 'fulfilled') {
                setRecompensa(recompensaData.value.data);
            }
            if (puntos.status === 'fulfilled') {
                setHistorialPuntos(puntos.value.data);
            }
            if (canjeos.status === 'fulfilled') {
                setHistorialCanjeos(canjeos.value.data);
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // Calcular progreso hacia recompensa
    const progresoRecompensa = useMemo(() => {
        if (!datosGamificacion || !recompensa) return 0;
        return Math.min((datosGamificacion.puntos_disponibles / recompensa.puntos_requeridos) * 100, 100);
    }, [datosGamificacion, recompensa]);

    // Manejar canje
    const handleCanjear = useCallback(async () => {
        if (!user?.id || !recompensa?.id) return;

        setLoadingAction(true);
        try {
            const response = await axios.post(`${API_URL}/canjear`, {
                id_paciente: user.id,
                id_recompensa: recompensa.id
            });

            setCanjeExitoso({
                codigo: response.data.codigo_canje,
                descuento: recompensa.premio
            });
            setMensaje({ texto: 'Canje exitoso', tipo: 'success' });
            await cargarDatos();
        } catch (error) {
            setMensaje({
                texto: error.response?.data?.error || 'Error al canjear recompensa',
                tipo: 'error'
            });
        } finally {
            setLoadingAction(false);
            setOpenDialog(false);
        }
    }, [user?.id, recompensa, cargarDatos]);

    // Formatear fecha
    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress sx={{ color: colors.primary }} />
            </Box>
        );
    }

    return (
        <Fade in timeout={500}>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Header */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" fontWeight={700} color={colors.text} gutterBottom>
                        OdontoPuntos
                    </Typography>
                    <Typography variant="body1" color={colors.secondaryText}>
                        Gana puntos y obtén descuentos en tus tratamientos
                    </Typography>
                </Box>

                {/* Mensaje de feedback */}
                {mensaje.texto && (
                    <Alert
                        severity={mensaje.tipo}
                        onClose={() => setMensaje({ texto: '', tipo: '' })}
                        sx={{ mb: 3, borderRadius: '12px' }}
                    >
                        {mensaje.texto}
                    </Alert>
                )}

                {/* Estadísticas principales */}
                <Grid container spacing={2.5} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                            icon={StarsIcon}
                            title="Puntos Disponibles"
                            value={datosGamificacion?.puntos_disponibles || 0}
                            subtitle="Para canjear"
                            color={colors.primary}
                            gradient={`linear-gradient(135deg, ${alpha(colors.primary, 0.05)} 0%, ${alpha(colors.primary, 0.1)} 100%)`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                            icon={TrophyIcon}
                            title="Nivel Actual"
                            value={datosGamificacion?.nivel || 1}
                            subtitle={`${datosGamificacion?.puntos_totales || 0} puntos totales`}
                            color={colors.warning}
                            gradient={`linear-gradient(135deg, ${alpha(colors.warning, 0.05)} 0%, ${alpha(colors.warning, 0.1)} 100%)`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                        <StatCard
                            icon={TrendingIcon}
                            title="Puntos Ganados"
                            value={datosGamificacion?.puntos_totales || 0}
                            subtitle="Total acumulado"
                            color={colors.success}
                            gradient={`linear-gradient(135deg, ${alpha(colors.success, 0.05)} 0%, ${alpha(colors.success, 0.1)} 100%)`}
                        />
                    </Grid>
                </Grid>

                {/* Card de Recompensa */}
                {recompensa && (
                    <Card
                        elevation={0}
                        sx={{
                            mb: 3,
                            borderRadius: '20px',
                            background: colors.paper,
                            border: `1px solid ${colors.border}`,
                            boxShadow: colors.shadow,
                            overflow: 'hidden'
                        }}
                    >
                        <Box
                            sx={{
                                p: 2,
                                background: colors.gradient,
                                borderBottom: `1px solid ${colors.border}`
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <GiftIcon sx={{ color: colors.primary, fontSize: 28 }} />
                                <Typography variant="h6" fontWeight={700} color={colors.text}>
                                    Recompensa Disponible
                                </Typography>
                                {recompensa.estado === 1 && (
                                    <Chip
                                        label="Activa"
                                        size="small"
                                        sx={{
                                            background: alpha(colors.success, 0.1),
                                            color: colors.success,
                                            fontWeight: 600,
                                            border: `1px solid ${alpha(colors.success, 0.3)}`
                                        }}
                                    />
                                )}
                            </Box>
                        </Box>

                        <CardContent sx={{ p: 3 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={8}>
                                    <Typography variant="h5" fontWeight={700} color={colors.text} gutterBottom>
                                        {recompensa.nombre}
                                    </Typography>
                                    <Typography variant="body1" color={colors.secondaryText} mb={2}>
                                        {recompensa.descripcion || 'Canjea tus puntos por un descuento'}
                                    </Typography>

                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: '12px',
                                            background: alpha(colors.success, 0.08),
                                            border: `1px solid ${alpha(colors.success, 0.2)}`,
                                            mb: 2
                                        }}
                                    >
                                        <Typography variant="h4" fontWeight={700} color={colors.success}>
                                            {recompensa.premio}% OFF
                                        </Typography>
                                        <Typography variant="body2" color={colors.secondaryText}>
                                            Descuento en tu próximo tratamiento
                                        </Typography>
                                    </Paper>

                                    <Box>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Typography variant="body2" fontWeight={600} color={colors.text}>
                                                Progreso
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600} color={colors.primary}>
                                                {datosGamificacion?.puntos_disponibles || 0} / {recompensa.puntos_requeridos}
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={progresoRecompensa}
                                            sx={{
                                                height: 10,
                                                borderRadius: '5px',
                                                backgroundColor: alpha(colors.primary, 0.1),
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: '5px',
                                                    background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.success} 100%)`
                                                }
                                            }}
                                        />
                                        <Typography variant="caption" color={colors.secondaryText} mt={0.5} display="block">
                                            {progresoRecompensa >= 100
                                                ? '¡Ya puedes canjear tu recompensa!'
                                                : `Te faltan ${recompensa.puntos_requeridos - (datosGamificacion?.puntos_disponibles || 0)} puntos`}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={4} display="flex" alignItems="center" justifyContent="center">
                                    <Button
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        disabled={
                                            progresoRecompensa < 100 ||
                                            recompensa.estado !== 1 ||
                                            loadingAction
                                        }
                                        onClick={() => setOpenDialog(true)}
                                        startIcon={<RedeemIcon />}
                                        sx={{
                                            borderRadius: '12px',
                                            py: 2,
                                            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.success} 100%)`,
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            textTransform: 'none',
                                            boxShadow: `0 4px 14px ${alpha(colors.primary, 0.4)}`,
                                            '&:hover': {
                                                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.success} 100%)`,
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 6px 20px ${alpha(colors.primary, 0.5)}`
                                            },
                                            '&:disabled': {
                                                background: alpha(colors.secondaryText, 0.1),
                                                color: colors.secondaryText
                                            }
                                        }}
                                    >
                                        Canjear
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                )}

                {/* Tabs de Historial */}
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: '20px',
                        background: colors.paper,
                        border: `1px solid ${colors.border}`,
                        boxShadow: colors.shadow
                    }}
                >
                    <Box sx={{ borderBottom: `1px solid ${colors.border}` }}>
                        <Tabs
                            value={activeTab}
                            onChange={(e, newValue) => setActiveTab(newValue)}
                            sx={{
                                px: 2,
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                    minHeight: 56
                                },
                                '& .Mui-selected': { color: colors.primary }
                            }}
                        >
                            <Tab label="Historial de Puntos" icon={<HistoryIcon />} iconPosition="start" />
                            <Tab label="Mis Canjeos" icon={<OfferIcon />} iconPosition="start" />
                        </Tabs>
                    </Box>

                    <CardContent sx={{ p: 0 }}>
                        {/* Tab 0: Historial de Puntos */}
                        {activeTab === 0 && (
                            <TableContainer>
                                {historialPuntos.length > 0 ? (
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ background: alpha(colors.primary, 0.05) }}>
                                                <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Concepto</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>Puntos</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700 }}>Tipo</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {historialPuntos.map((punto) => (
                                                <TableRow key={punto.id} hover>
                                                    <TableCell>
                                                        <Typography variant="body2" color={colors.secondaryText}>
                                                            {formatearFecha(punto.fecha)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" color={colors.text}>
                                                            {punto.concepto}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={700}
                                                            color={punto.tipo === 'ganado' ? colors.success : colors.error}
                                                        >
                                                            {punto.tipo === 'ganado' ? '+' : ''}{punto.puntos}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={punto.tipo === 'ganado' ? 'Ganado' : 'Usado'}
                                                            size="small"
                                                            sx={{
                                                                background: punto.tipo === 'ganado'
                                                                    ? alpha(colors.success, 0.1)
                                                                    : alpha(colors.error, 0.1),
                                                                color: punto.tipo === 'ganado' ? colors.success : colors.error,
                                                                fontWeight: 600,
                                                                border: `1px solid ${punto.tipo === 'ganado'
                                                                    ? alpha(colors.success, 0.3)
                                                                    : alpha(colors.error, 0.3)}`
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <Box textAlign="center" py={6}>
                                        <HistoryIcon sx={{ fontSize: 56, color: colors.secondaryText, mb: 2 }} />
                                        <Typography variant="h6" color={colors.secondaryText} fontWeight={600}>
                                            No hay historial de puntos
                                        </Typography>
                                        <Typography variant="body2" color={colors.secondaryText}>
                                            Completa servicios para comenzar a acumular puntos
                                        </Typography>
                                    </Box>
                                )}
                            </TableContainer>
                        )}

                        {/* Tab 1: Historial de Canjeos */}
                        {activeTab === 1 && (
                            <TableContainer>
                                {historialCanjeos.length > 0 ? (
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ background: alpha(colors.primary, 0.05) }}>
                                                <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Recompensa</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>Puntos</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700 }}>Estado</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {historialCanjeos.map((canje) => (
                                                <TableRow key={canje.id} hover>
                                                    <TableCell>
                                                        <Typography variant="body2" color={colors.secondaryText}>
                                                            {formatearFecha(canje.fecha_canje)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight={600} color={colors.text}>
                                                            {canje.nombre_recompensa}
                                                        </Typography>
                                                        <Typography variant="caption" color={colors.secondaryText}>
                                                            {canje.descripcion}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body2" fontWeight={700} color={colors.primary}>
                                                            {canje.puntos_canjeados}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={600}
                                                            sx={{
                                                                fontFamily: 'monospace',
                                                                color: colors.text,
                                                                fontSize: '0.85rem'
                                                            }}
                                                        >
                                                            {canje.codigo_canje}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={canje.estado === 'activo' ? 'Activo' : canje.estado === 'usado' ? 'Usado' : 'Expirado'}
                                                            size="small"
                                                            sx={{
                                                                background:
                                                                    canje.estado === 'activo'
                                                                        ? alpha(colors.success, 0.1)
                                                                        : canje.estado === 'usado'
                                                                            ? alpha(colors.secondaryText, 0.1)
                                                                            : alpha(colors.error, 0.1),
                                                                color:
                                                                    canje.estado === 'activo'
                                                                        ? colors.success
                                                                        : canje.estado === 'usado'
                                                                            ? colors.secondaryText
                                                                            : colors.error,
                                                                fontWeight: 600,
                                                                border: `1px solid ${canje.estado === 'activo'
                                                                    ? alpha(colors.success, 0.3)
                                                                    : canje.estado === 'usado'
                                                                        ? alpha(colors.secondaryText, 0.3)
                                                                        : alpha(colors.error, 0.3)}`
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <Box textAlign="center" py={6}>
                                        <OfferIcon sx={{ fontSize: 56, color: colors.secondaryText, mb: 2 }} />
                                        <Typography variant="h6" color={colors.secondaryText} fontWeight={600}>
                                            No has canjeado recompensas
                                        </Typography>
                                        <Typography variant="body2" color={colors.secondaryText}>
                                            Acumula puntos y canjea tu primera recompensa
                                        </Typography>
                                    </Box>
                                )}
                            </TableContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Dialog de Confirmación */}
                <Dialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: '20px',
                            background: colors.paper
                        }
                    }}
                >
                    <DialogTitle>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight={700} color={colors.text}>
                                Confirmar Canje
                            </Typography>
                            <IconButton onClick={() => setOpenDialog(false)} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>

                    <Divider sx={{ borderColor: colors.border }} />

                    <DialogContent sx={{ pt: 3 }}>
                        <Alert severity="info" sx={{ mb: 2, borderRadius: '12px' }}>
                            ¿Estás seguro de canjear <strong>{recompensa?.puntos_requeridos} puntos</strong> por{' '}
                            <strong>{recompensa?.premio}% de descuento</strong>?
                        </Alert>

                        <Typography variant="body2" color={colors.secondaryText}>
                            Una vez confirmado, recibirás un código único que podrás usar en tu próximo tratamiento.
                        </Typography>
                    </DialogContent>

                    <Divider sx={{ borderColor: colors.border }} />

                    <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
                        <Button
                            onClick={() => setOpenDialog(false)}
                            disabled={loadingAction}
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
                            onClick={handleCanjear}
                            variant="contained"
                            disabled={loadingAction}
                            sx={{
                                borderRadius: '12px',
                                px: 4,
                                py: 1.2,
                                fontWeight: 600,
                                textTransform: 'none',
                                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.success} 100%)`,
                                '&:hover': {
                                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.success} 100%)`,
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            {loadingAction ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Confirmar Canje'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog de Canje Exitoso */}
                <Dialog
                    open={!!canjeExitoso}
                    onClose={() => setCanjeExitoso(null)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: '20px',
                            background: colors.paper
                        }
                    }}
                >
                    <DialogContent sx={{ textAlign: 'center', py: 4 }}>
                        <CheckIcon sx={{ fontSize: 72, color: colors.success, mb: 2 }} />
                        <Typography variant="h5" fontWeight={700} color={colors.text} gutterBottom>
                            ¡Canje Exitoso!
                        </Typography>
                        <Typography variant="body1" color={colors.secondaryText} mb={3}>
                            Has obtenido {canjeExitoso?.descuento}% de descuento
                        </Typography>

                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: '12px',
                                background: alpha(colors.primary, 0.08),
                                border: `2px dashed ${colors.primary}`,
                                mb: 2
                            }}
                        >
                            <Typography variant="caption" color={colors.secondaryText} gutterBottom display="block">
                                Tu código de canje:
                            </Typography>
                            <Typography
                                variant="h4"
                                fontWeight={700}
                                color={colors.primary}
                                sx={{ fontFamily: 'monospace', letterSpacing: 2 }}
                            >
                                {canjeExitoso?.codigo}
                            </Typography>
                        </Paper>

                        <Alert severity="success" sx={{ borderRadius: '12px', textAlign: 'left' }}>
                            Presenta este código en tu próxima cita para aplicar el descuento
                        </Alert>
                    </DialogContent>

                    <Divider sx={{ borderColor: colors.border }} />

                    <DialogActions sx={{ p: 2.5 }}>
                        <Button
                            onClick={() => setCanjeExitoso(null)}
                            variant="contained"
                            fullWidth
                            sx={{
                                borderRadius: '12px',
                                py: 1.5,
                                fontWeight: 600,
                                textTransform: 'none',
                                background: colors.primary
                            }}
                        >
                            Entendido
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Fade>
    );
};

export default memo(OdontoPuntos);