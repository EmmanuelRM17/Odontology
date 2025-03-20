import React, { useState, useEffect, Suspense } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    Fade,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Tooltip,
    IconButton,
    Slide,
    Zoom,
    CardMedia,
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
    useMediaQuery,
    useTheme as useMuiTheme,
    IconButton as MuiIconButton,
    Skeleton,
    Stack,
    Divider,
    Avatar,
    Paper
} from '@mui/material';
import {
    Timer,
    AttachMoney,
    CheckCircleOutline,
    Warning,
    Info,
    Schedule,
    LocalHospital,
    Star,
    Assignment,
    CalendarMonth,
    HelpOutline,
    Close,
    CheckCircle,
    AccessTime,
    Description,
    ThumbUp,
    ThumbDown,
    Share,
    ContentCopy,
    MedicalServices
} from '@mui/icons-material';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

// Componente principal del diálogo de detalles del servicio
const ServicioDetalleDialog = ({ open, onClose, servicioId, onAgendarCita, service: initialService = null }) => {
    const [service, setService] = useState(initialService);
    const [loading, setLoading] = useState(!initialService);
    const [error, setError] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const { isDarkTheme } = useThemeContext();
    const [imageLoading, setImageLoading] = useState(true);
    const muiTheme = useMuiTheme();
    const fullScreen = useMediaQuery(muiTheme.breakpoints.down('md'));
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(muiTheme.breakpoints.down('lg'));

    // Estado para controlar la interacción y feedback
    const [isFavorite, setIsFavorite] = useState(false);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [feedback, setFeedback] = useState(null); // null, 'positive', 'negative'
    const [animateSection, setAnimateSection] = useState(null);

    // Optimización: Cache para servicios
    const [serviceCache, setServiceCache] = useState({});

    // Prefetch servicios en segundo plano
    useEffect(() => {
        // Si ya tenemos el servicio en caché o como prop inicial, no hacemos nada
        if (servicioId && !serviceCache[servicioId] && !initialService) {
            const prefetchService = async () => {
                try {
                    const response = await fetch(`https://back-end-4803.onrender.com/api/servicios/get/${servicioId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setServiceCache(prev => ({ ...prev, [servicioId]: data }));
                    }
                } catch (error) {
                    console.log("Prefetch en segundo plano falló silenciosamente");
                }
            };
            prefetchService();
        }
    }, [servicioId, serviceCache, initialService]);

    useEffect(() => {
        if (open) {
            if (initialService) {
                setService(initialService);
                setLoading(false);
                setError(null);
            } else if (servicioId) {
                // Cargar desde caché si existe
                if (serviceCache[servicioId]) {
                    setService(serviceCache[servicioId]);
                    setLoading(false);
                    setError(null);
                } else {
                    setLoading(true);
                    setError(null);
                    fetchService();
                }
            }
            // Reducir el tiempo de espera para la animación
            requestAnimationFrame(() => setIsVisible(true));
        } else {
            setIsVisible(false);
            if (!initialService) {
                // Solo limpiamos el servicio si no fue proporcionado inicialmente
                setTimeout(() => {
                    if (!open) setService(null);
                }, 200); // Tiempo reducido
            }
        }
    }, [open, servicioId, initialService, serviceCache]);

    const fetchService = async () => {
        try {
            const controller = new AbortController();
            // Reducir timeout para mejorar percepción de velocidad
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            // Usar una variable para monitorear si ya se procesó la respuesta
            let isProcessed = false;

            // Implementar un timeout de renderizado para mostrar datos parciales
            const renderTimeoutId = setTimeout(() => {
                if (!isProcessed && serviceCache[servicioId]) {
                    // Si después de 300ms no tenemos respuesta pero tenemos datos en caché, los usamos temporalmente
                    setService(serviceCache[servicioId]);
                    setLoading(false);
                }
            }, 300);

            const response = await fetch(
                `https://back-end-4803.onrender.com/api/servicios/get/${servicioId}`,
                {
                    signal: controller.signal,
                }
            );

            clearTimeout(timeoutId);
            clearTimeout(renderTimeoutId);
            isProcessed = true;

            if (!response.ok) throw new Error('No se pudo obtener la información del servicio.');
            const data = await response.json();

            // Actualizar la caché con los datos nuevos
            setServiceCache(prev => ({ ...prev, [servicioId]: data }));
            setService(data);
        } catch (error) {
            if (error.name === 'AbortError') {
                setError('La solicitud tardó demasiado. Por favor, inténtalo de nuevo.');
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const colors = {
        background: isDarkTheme ? '#0D1B2A' : '#f8f9fa',
        primary: isDarkTheme ? '#00BCD4' : '#03427C',
        text: isDarkTheme ? '#ffffff' : '#1a1a1a',
        secondary: isDarkTheme ? '#A0AEC0' : '#666666',
        cardBg: isDarkTheme ? '#1A2735' : '#ffffff',
        accent: isDarkTheme ? '#4FD1C5' : '#2B6CB0',
        success: isDarkTheme ? '#4CAF50' : '#4CAF50',
        warning: isDarkTheme ? '#FF9800' : '#FF9800',
        cardBorder: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        cardShadow: isDarkTheme ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.08)',
        gradient: isDarkTheme
            ? 'linear-gradient(135deg, #1A2735 0%, #0D1B2A 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        treatment: '#4CAF50', // Color verde para tratamientos
        nonTreatment: '#FF5252', // Color rojo para no tratamientos
    };

    const handleAgendarCita = () => {
        if (onAgendarCita && service) {
            onAgendarCita(service);  
        }
        onClose();
    };

    // Componente para encabezados de sección
    const SectionHeader = ({ icon: Icon, title, description, color = colors.primary }) => (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            pb: 1,
            borderBottom: `2px solid ${color}`
        }}>
            <Avatar sx={{ bgcolor: color, mr: 1.5 }}>
                <Icon sx={{ color: '#fff', fontSize: 20 }} />
            </Avatar>
            <Box>
                <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600, lineHeight: 1.2 }}>
                    {title}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.secondary, display: 'block', mt: 0.5 }}>
                    {description}
                </Typography>
            </Box>
        </Box>
    );

    // Componente de Esqueleto para cargar
    const SkeletonLoader = () => (
        <Box sx={{ width: '100%' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={5} lg={4}>
                    <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2, mb: 2 }} />
                </Grid>
                <Grid item xs={12} md={7} lg={8}>
                    <Skeleton variant="text" height={60} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={80} sx={{ mb: 2 }} />

                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 16 }} />
                        <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 16 }} />
                    </Box>
                </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 2 }}>
                {[1, 2, 3, 4].map((item) => (
                    <Grid item xs={12} sm={6} key={item}>
                        <Card sx={{ height: '100%', borderRadius: 2 }}>
                            <CardContent>
                                <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
                                <Stack spacing={2}>
                                    <Skeleton variant="text" height={24} />
                                    <Skeleton variant="text" height={24} />
                                    <Skeleton variant="text" height={24} />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    // Componente para mostrar errores
    const ErrorDisplay = ({ message }) => (
        <Box
            sx={{
                textAlign: 'center',
                py: 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2
            }}
        >
            <Box
                sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'rgba(244, 67, 54, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Warning sx={{ fontSize: 40, color: '#f44336' }} />
            </Box>
            <Typography variant="h5" sx={{ color: colors.text, fontWeight: 600 }}>
                No pudimos cargar el servicio
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                {message || 'Servicio no encontrado'}
            </Typography>
            <Button
                variant="outlined"
                onClick={() => {
                    setLoading(true);
                    setError(null);
                    fetchService();
                }}
                sx={{ mt: 2 }}
            >
                Intentar nuevamente
            </Button>
        </Box>
    );

    // Componente para mostrar el indicador de tratamiento
    const TreatmentIndicator = ({ isTreatment, sessionCount }) => (
        <Paper
            elevation={2}
            sx={{
                p: 1.5,
                borderRadius: 2,
                mb: 2,
                backgroundColor: isTreatment ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 82, 82, 0.1)',
                border: `1px solid ${isTreatment ? colors.treatment : colors.nonTreatment}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1
            }}
        >
            <Avatar 
                sx={{ 
                    bgcolor: isTreatment ? colors.treatment : colors.nonTreatment,
                    width: 40,
                    height: 40
                }}
            >
                {isTreatment ? <MedicalServices /> : <Info />}
            </Avatar>
            <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.text }}>
                    {isTreatment ? 'Tratamiento Dental' : 'Servicio Regular'}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.secondary }}>
                    {isTreatment && sessionCount > 1 
                        ? `Requiere aproximadamente ${sessionCount} citas`
                        : 'Se realiza en una única sesión'}
                </Typography>
            </Box>
        </Paper>
    );

    // Componente de sección de información
    const InfoSection = ({ section, index }) => {
        const isActive = animateSection === section.title;

        return (
            <Grid item xs={12} sm={6} key={section.title}>
                <Fade in={isVisible} timeout={300 + section.delay}>
                    <Card
                        sx={{
                            backgroundColor: colors.cardBg,
                            height: '100%',
                            borderRadius: 2,
                            boxShadow: isActive ? `0 8px 24px rgba(${section.color.replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16)).join(',')}, 0.25)` : 'none',
                            border: `1px solid ${isActive ? section.color : colors.cardBorder}`,
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            transform: isActive ? 'translateY(-4px)' : 'translateY(0)',
                            '&:hover': {
                                boxShadow: `0 6px 16px rgba(${section.color.replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16)).join(',')}, 0.15)`,
                                transform: 'translateY(-2px)'
                            }
                        }}
                        onClick={() => setAnimateSection(isActive ? null : section.title)}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '4px',
                                background: section.color || colors.primary
                            }}
                        />
                        <CardContent sx={{ p: 3 }}>
                            <SectionHeader
                                icon={section.icon}
                                title={section.title}
                                description={section.description}
                                color={section.color || colors.primary}
                            />
                            <List
                                sx={{
                                    mt: 1,
                                    maxHeight: 300,
                                    overflow: 'auto',
                                    scrollbarWidth: 'thin',
                                    '&::-webkit-scrollbar': {
                                        width: '6px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                        borderRadius: '10px'
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background: isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                                        borderRadius: '10px',
                                        '&:hover': {
                                            background: isDarkTheme ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
                                        }
                                    }
                                }}
                                dense={isMobile}
                            >
                                {section.data && section.data.length > 0 ? (
                                    section.data.map((item, idx) => (
                                        <Zoom
                                            key={idx}
                                            in={isVisible}
                                            timeout={300 + (idx * 30)}
                                            style={{ transitionDelay: isActive ? '0ms' : `${idx * 30}ms` }}
                                        >
                                            <ListItem
                                                alignItems="flex-start"
                                                sx={{
                                                    px: 1,
                                                    py: 0.7,
                                                    borderRadius: 1,
                                                    mb: 0.5,
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(3,66,124,0.04)',
                                                        transform: 'translateX(4px)'
                                                    }
                                                }}
                                                button
                                                component="div"
                                            >
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    <section.itemIcon
                                                        sx={{
                                                            color: section.color || colors.primary,
                                                            fontSize: isMobile ? 18 : 20
                                                        }}
                                                    />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={item}
                                                    sx={{
                                                        color: colors.text,
                                                        my: 0,
                                                        '& .MuiListItemText-primary': {
                                                            fontSize: isMobile ? '0.85rem' : '0.95rem',
                                                            lineHeight: 1.5
                                                        }
                                                    }}
                                                />
                                            </ListItem>
                                        </Zoom>
                                    ))
                                ) : (
                                    <Typography variant="body2" sx={{ color: colors.secondary, py: 2, px: 1, fontStyle: 'italic' }}>
                                        No hay información disponible
                                    </Typography>
                                )}
                            </List>
                        </CardContent>
                    </Card>
                </Fade>
            </Grid>
        );
    };

    // Contenido del diálogo
    const dialogContent = () => {
        if (loading) {
            return <SkeletonLoader />;
        }

        if (error || !service) {
            return <ErrorDisplay message={error} />;
        }

        // Verificamos si es un tratamiento y cuántas citas requiere
        const isTreatment = service.tratamiento === 1;
        const sessionCount = service.citasEstimadas || 1;

        return (
            <Box sx={{ pt: 1 }}>
                {/* Header Section con imagen a la izquierda y detalles a la derecha */}
                <Grid container spacing={3}>
                    {/* Columna de la imagen a la izquierda */}
                    <Grid item xs={12} md={5} lg={4}>
                        <Card
                            elevation={2}
                            sx={{
                                backgroundColor: colors.cardBg,
                                borderRadius: 2,
                                overflow: 'hidden',
                                position: 'relative',
                                height: { md: '100%' },
                                display: 'flex',
                                flexDirection: 'column',
                                border: `1px solid ${isTreatment ? colors.treatment : colors.nonTreatment}`,
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.02)'
                                }
                            }}
                        >
                            {/* Indicador de categoría */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 10,
                                    left: 10,
                                    zIndex: 5,
                                }}
                            >
                                <Chip
                                    label={service.category || "Servicio dental"}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'rgba(255,255,255,0.85)',
                                        color: colors.primary,
                                        fontWeight: 600,
                                        fontSize: '0.7rem'
                                    }}
                                />
                            </Box>

                            <Box sx={{ position: 'relative', flexGrow: 1, minHeight: 250 }}>
                                {imageLoading && (
                                    <Skeleton
                                        variant="rectangular"
                                        width="100%"
                                        height="100%"
                                        animation="wave"
                                        sx={{ position: 'absolute', top: 0, left: 0 }}
                                    />
                                )}
                                {/* Primera imagen pequeña para carga rápida (placeholder) */}
                                <CardMedia
                                    component="img"
                                    image={service.image_url
                                        ? service.image_url.replace('/upload/', '/upload/w_20,h_20,c_fill,q_10,e_blur:1000,f_auto/')
                                        : `https://via.placeholder.com/20x20/cccccc/ffffff`
                                    }
                                    alt=""
                                    sx={{
                                        objectFit: 'cover',
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        top: 0,
                                        left: 0,
                                        filter: 'blur(8px)',
                                        transform: 'scale(1.05)', // compensa el blur en los bordes
                                        zIndex: 1
                                    }}
                                />
                                {/* Imagen final de alta calidad */}
                                <CardMedia
                                    component="img"
                                    image={service.image_url
                                        ? service.image_url.replace('/upload/', '/upload/w_800,h_800,c_fill,q_auto,f_auto/')
                                        : `https://source.unsplash.com/featured/?dental,${service.title.replace(' ', ',')}`
                                    }
                                    alt={service.title}
                                    loading="eager"
                                    onLoad={() => setImageLoading(false)}
                                    sx={{
                                        objectFit: 'cover',
                                        objectPosition: 'center',
                                        opacity: imageLoading ? 0 : 1,
                                        transition: 'opacity 0.3s ease-in-out',
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        top: 0,
                                        left: 0,
                                        zIndex: 2
                                    }}
                                />
                            </Box>

                            {/* Barra inferior con info rápida */}
                            <Box 
                                sx={{ 
                                    p: 1.5, 
                                    borderTop: `4px solid ${isTreatment ? colors.treatment : colors.nonTreatment}`,
                                    bgcolor: isTreatment ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 82, 82, 0.1)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <LocalHospital sx={{ color: isTreatment ? colors.treatment : colors.nonTreatment, mr: 1 }} />
                                    <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 600 }}>
                                        {isTreatment ? 'Tratamiento' : 'Servicio'}
                                    </Typography>
                                </Box>
                                
                                {isTreatment && sessionCount > 1 && (
                                    <Chip
                                        icon={<CalendarMonth sx={{ fontSize: '0.9rem !important' }} />}
                                        label={`${sessionCount} citas`}
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(76, 175, 80, 0.2)',
                                            color: colors.treatment,
                                            fontWeight: 600,
                                            '& .MuiChip-icon': { 
                                                color: colors.treatment,
                                                mr: '-4px' 
                                            }
                                        }}
                                    />
                                )}
                            </Box>
                        </Card>
                    </Grid>

                    {/* Columna de detalles a la derecha */}
                    <Grid item xs={12} md={7} lg={8}>
                        <Card
                            elevation={0}
                            sx={{
                                backgroundColor: colors.cardBg,
                                borderRadius: 2,
                                p: 3,
                                height: '100%',
                                border: `1px solid ${colors.cardBorder}`,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            {/* Título del servicio */}
                            <Fade in={true} timeout={300}>
                                <Typography
                                    variant={isMobile ? "h5" : "h4"}
                                    sx={{
                                        color: colors.text,
                                        fontWeight: 700,
                                        mb: 1,
                                        lineHeight: 1.2
                                    }}
                                >
                                    {service.title}
                                </Typography>
                            </Fade>

                            {/* Indicador de tratamiento y número de citas */}
                            <TreatmentIndicator 
                                isTreatment={isTreatment} 
                                sessionCount={sessionCount} 
                            />

                            {/* Descripción */}
                            <Fade in={true} timeout={400}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: colors.secondary,
                                        mb: 3,
                                        lineHeight: 1.6,
                                        flexGrow: 1
                                    }}
                                >
                                    {service.description}
                                </Typography>
                            </Fade>

                            <Divider sx={{ mb: 2 }} />

                            {/* Chips de información */}
                            <Box sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1,
                                mb: 1
                            }}>
                                <Zoom in={true} timeout={500}>
                                    <Chip
                                        icon={<Timer />}
                                        label={`Duración: ${service.duration}`}
                                        sx={{
                                            bgcolor: colors.primary,
                                            color: '#fff',
                                            fontWeight: 500,
                                            '& .MuiChip-icon': { color: '#fff' },
                                            pl: 0.5,
                                            height: 32
                                        }}
                                    />
                                </Zoom>
                                <Zoom in={true} timeout={600}>
                                    <Chip
                                        icon={<AttachMoney />}
                                        label={`Precio: $${service.price}`}
                                        sx={{
                                            bgcolor: colors.accent,
                                            color: '#fff',
                                            fontWeight: 500,
                                            '& .MuiChip-icon': { color: '#fff' },
                                            pl: 0.5,
                                            height: 32
                                        }}
                                    />
                                </Zoom>
                                <Zoom in={true} timeout={700}>
                                    <Chip
                                        icon={<AccessTime />}
                                        label={isTreatment && sessionCount > 1 
                                            ? `${sessionCount} sesiones aprox.` 
                                            : "Sesión única"}
                                        sx={{
                                            bgcolor: isTreatment ? colors.treatment : colors.nonTreatment,
                                            color: '#fff',
                                            fontWeight: 500,
                                            '& .MuiChip-icon': { color: '#fff' },
                                            pl: 0.5,
                                            height: 32
                                        }}
                                    />
                                </Zoom>
                            </Box>
                        </Card>
                    </Grid>

                    {/* Info Sections con colores */}
                    {[
                        {
                            title: 'Beneficios',
                            icon: Star,
                            description: 'Ventajas y resultados esperados',
                            data: service.benefits,
                            itemIcon: CheckCircle,
                            delay: 100,
                            color: '#4CAF50' // Verde
                        },
                        {
                            title: 'Qué incluye',
                            icon: Assignment,
                            description: 'Procedimientos y servicios incluidos',
                            data: service.includes,
                            itemIcon: Info,
                            delay: 200,
                            color: '#2196F3' // Azul
                        },
                        {
                            title: 'Preparación',
                            icon: Schedule,
                            description: 'Recomendaciones previas',
                            data: service.preparation,
                            itemIcon: Warning,
                            delay: 300,
                            color: '#FF9800' // Naranja
                        },
                        {
                            title: 'Cuidados posteriores',
                            icon: LocalHospital,
                            description: 'Instrucciones post-tratamiento',
                            data: service.aftercare,
                            itemIcon: CheckCircleOutline,
                            delay: 400,
                            color: '#9C27B0' // Púrpura
                        }
                    ].map((section) => (
                        <InfoSection key={section.title} section={section} />
                    ))}
                </Grid>
            </Box>
        );
    };

    // Componente para opciones de compartir
    const ShareOptions = ({ service, onClose, isDarkTheme, colors }) => {
        const [showToast, setShowToast] = useState(false);
        const [toastMessage, setToastMessage] = useState('');

        // Crear un mensaje con datos del servicio para compartir
        const createServiceMessage = () => {
            // Incluir información sobre si es tratamiento y número de citas
            const treatmentInfo = service.tratamiento === 1 
                ? `\n• Tipo: Tratamiento${service.citasEstimadas > 1 ? ` (${service.citasEstimadas} citas aprox.)` : ''}`
                : '\n• Tipo: Servicio (sesión única)';
                
            return `*ODONTOLOGÍA CAROL*\n\n*${service.title}*\n\n${service.description}\n\n*Detalles del servicio:*\n• Precio: $${service.price}\n• Duración estimada: ${service.duration}${treatmentInfo}\n\nPuedes agendar tu cita o solicitar más información sobre este servicio a través de nuestra página web.\n\n*Visítanos en:* https://odontologiacarol.com\n\nTu sonrisa es nuestra prioridad.\nOdontología Carol - Atención dental de calidad.`;
        };
        
        // Compartir vía WhatsApp
        const shareViaWhatsApp = () => {
            const message = createServiceMessage();
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            showNotification('Abriendo WhatsApp...');
        };

        // Mostrar notificación
        const showNotification = (message) => {
            setToastMessage(message);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
        };

        return (
            <Fade in={true}>
                <Box>
                    {/* Opciones de compartir */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            borderRadius: 1,
                            bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(3,66,124,0.05)'
                        }}
                    >
                        {/* WhatsApp */}
                        <Tooltip title="Compartir por WhatsApp">
                            <IconButton
                                onClick={shareViaWhatsApp}
                                size="small"
                                sx={{
                                    color: '#25D366',
                                    '&:hover': {
                                        bgcolor: 'rgba(37, 211, 102, 0.1)'
                                    }
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </IconButton>
                        </Tooltip>

                        {/* Mensaje Toast */}
                        {showToast && (
                            <Zoom in={showToast}>
                                <Chip
                                    label={toastMessage}
                                    size="small"
                                    color="primary"
                                    sx={{ ml: 1 }}
                                />
                            </Zoom>
                        )}
                    </Box>
                </Box>
            </Fade>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={(event, reason) => {
                if (reason !== 'backdropClick' || !loading) {
                    onClose();
                }
            }}
            fullScreen={fullScreen}
            fullWidth
            maxWidth="lg"
            scroll="paper"
            TransitionComponent={Slide}
            TransitionProps={{ direction: 'up' }}
            PaperProps={{
                sx: {
                    backgroundColor: colors.background,
                    borderRadius: { xs: 0, sm: 3 },
                    overflow: 'hidden',
                    backgroundImage: colors.gradient,
                    maxWidth: fullScreen ? '100%' : '95%'
                }
            }}
            sx={{
                backdropFilter: 'blur(3px)'
            }}
        >
            <DialogTitle
                sx={{
                    m: 0,
                    p: { xs: 1.5, sm: 2 },
                    bgcolor: service && service.tratamiento === 1 ? colors.treatment : colors.primary,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {service && service.tratamiento === 1 ? 
                        <MedicalServices sx={{ mr: 1, fontSize: 22 }} /> : 
                        <Description sx={{ mr: 1, fontSize: 22 }} />
                    }
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        {service && service.tratamiento === 1 ? 'Detalles del Tratamiento' : 'Detalles del Servicio'}
                    </Typography>
                </Box>
                <MuiIconButton
                    aria-label="close"
                    onClick={onClose}
                    disabled={loading}
                    sx={{
                        color: '#fff',
                        '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.2)'
                        }
                    }}
                >
                    <Close />
                </MuiIconButton>
            </DialogTitle>

            <DialogContent
                dividers
                sx={{
                    p: { xs: 2, sm: 3 },
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                }}
            >
                <Suspense fallback={<SkeletonLoader />}>
                    {dialogContent()}
                </Suspense>
            </DialogContent>

            <DialogActions
                sx={{
                    py: 2,
                    px: { xs: 2, sm: 3 },
                    backgroundColor: 'transparent',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* Botón para compartir servicio */}
                    <Tooltip title={showShareOptions ? "Cerrar" : "Compartir servicio"}>
                        <IconButton
                            color="primary"
                            aria-label="compartir servicio"
                            onClick={() => setShowShareOptions(!showShareOptions)}
                            sx={{
                                mr: 1,
                                bgcolor: showShareOptions
                                    ? (isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(3,66,124,0.15)')
                                    : 'transparent',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(3,66,124,0.1)',
                                }
                            }}
                        >
                            <Share />
                        </IconButton>
                    </Tooltip>

                    {/* Mostrar opciones de compartir */}
                    {showShareOptions && service && (
                        <ShareOptions
                            service={service}
                            onClose={() => setShowShareOptions(false)}
                            isDarkTheme={isDarkTheme}
                            colors={colors}
                        />
                    )}

                    {/* Botón para cerrar */}
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        disabled={loading}
                        startIcon={<Close />}
                        size="small"
                        sx={{
                            borderColor: isDarkTheme ? 'rgba(255,255,255,0.3)' : colors.primary,
                            color: isDarkTheme ? 'rgba(255,255,255,0.8)' : colors.primary,
                            px: 2,
                            ml: 1,
                            borderRadius: 6,
                            textTransform: 'none',
                            '&:hover': {
                                borderColor: isDarkTheme ? 'rgba(255,255,255,0.5)' : colors.primary,
                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(3,66,124,0.05)'
                            }
                        }}
                    >
                        Cerrar
                    </Button>
                </Box>

                {/* Botón para agendar cita */}
                <Button
                    variant="contained"
                    startIcon={<CalendarMonth />}
                    onClick={handleAgendarCita}
                    disabled={!service || loading}
                    sx={{
                        backgroundColor: service && service.tratamiento === 1 ? colors.treatment : colors.accent,
                        color: '#fff',
                        px: 3,
                        py: 1,
                        borderRadius: 6,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        '&:hover': {
                            backgroundColor: service && service.tratamiento === 1 
                                ? '#3d9140' // Verde más oscuro
                                : '#1E5A9A', // Azul más oscuro
                            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                            transform: 'translateY(-2px)'
                        },
                        transition: 'transform 0.2s'
                    }}
                >
                    Agendar Cita
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ServicioDetalleDialog;