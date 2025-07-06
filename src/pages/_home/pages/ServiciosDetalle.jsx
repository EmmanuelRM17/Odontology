import React, { useState, useEffect, Suspense, useRef } from 'react';
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
    Paper,
    Collapse,
    SwipeableDrawer,
    Backdrop,
    Grow,
    Fab,
    Snackbar,
    Alert
} from '@mui/material';
import { alpha } from '@mui/material/styles';
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
    MedicalServices,
    ExpandMore,
    ExpandLess,
    WhatsApp as WhatsAppIcon,
    Email as EmailIcon,
    Link as LinkIcon,
    ArrowUpward,
    ZoomIn,
    ZoomOut,
    KeyboardArrowUp
} from '@mui/icons-material';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

// Componente principal del diálogo de detalles del servicio
const ServicioDetalleDialog = ({ open, onClose, servicioId, onAgendarCita, service: initialService = null }) => {
    // Estados para datos y UI
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
    
    // Estados para interacción
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [activeSection, setActiveSection] = useState(null);
    const [imageZoomed, setImageZoomed] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    // Referencias
    const dialogContentRef = useRef(null);
    const imageRef = useRef(null);
    
    // Optimización: Cache para servicios
    const [serviceCache, setServiceCache] = useState({});

    // Configuración de colores PROFESIONAL Y SOBRIA
    const colors = {
        background: isDarkTheme ? '#121212' : '#fafafa',
        primary: isDarkTheme ? '#1976d2' : '#1565c0', // Azul Material Design más profesional
        text: isDarkTheme ? '#ffffff' : '#212121',
        secondary: isDarkTheme ? '#9e9e9e' : '#757575',
        cardBg: isDarkTheme ? '#1e1e1e' : '#ffffff',
        accent: isDarkTheme ? '#42a5f5' : '#1976d2', // Azul más suave
        success: '#388e3c', // Verde más profesional y menos brillante
        warning: '#f57c00', // Naranja más sobrio
        error: '#d32f2f', // Rojo más profesional
        cardBorder: isDarkTheme ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
        cardShadow: isDarkTheme 
            ? '0 2px 8px rgba(0,0,0,0.4)' 
            : '0 2px 8px rgba(0,0,0,0.08)',
        gradient: isDarkTheme
            ? 'linear-gradient(135deg, #1e1e1e 0%, #121212 100%)'
            : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        // Colores más profesionales para tratamientos
        treatment: isDarkTheme ? '#4caf50' : '#388e3c', // Verde Material Design
        nonTreatment: isDarkTheme ? '#ff7043' : '#d84315', // Naranja en lugar de rojo
    };

    // Control de scroll para mostrar/ocultar botón "volver arriba"
    useEffect(() => {
        if (!open || !dialogContentRef.current) return;
        
        const handleScroll = () => {
            // Verificación de seguridad para evitar errores
            if (!dialogContentRef.current) return;
            
            const scrollTop = dialogContentRef.current.scrollTop;
            setShowScrollTop(scrollTop > 200);
        };
        
        const contentElement = dialogContentRef.current;
        contentElement.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            if (contentElement) {
                contentElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, [open]);

    // Prefetch servicios en segundo plano
    useEffect(() => {
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

    // Gestionar apertura/cierre del diálogo
    useEffect(() => {
        if (open) {
            if (initialService) {
                setService(initialService);
                setLoading(false);
                setError(null);
            } else if (servicioId) {
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
            requestAnimationFrame(() => setIsVisible(true));
        } else {
            setIsVisible(false);
            if (!initialService) {
                setTimeout(() => {
                    if (!open) setService(null);
                }, 200);
            }
        }
    }, [open, servicioId, initialService, serviceCache]);

    // Función para obtener datos del servicio
    const fetchService = async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            let isProcessed = false;

            const renderTimeoutId = setTimeout(() => {
                if (!isProcessed && serviceCache[servicioId]) {
                    setService(serviceCache[servicioId]);
                    setLoading(false);
                }
            }, 300);

            const response = await fetch(
                `https://back-end-4803.onrender.com/api/servicios/get/${servicioId}`,
                { signal: controller.signal }
            );

            clearTimeout(timeoutId);
            clearTimeout(renderTimeoutId);
            isProcessed = true;

            if (!response.ok) throw new Error('No se pudo obtener la información del servicio.');
            const data = await response.json();

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

    // Función para manejar cita
    const handleAgendarCita = () => {
        if (onAgendarCita && service) {
            onAgendarCita(service);  
        }
        onClose();
    };

    // Función para copiar información del servicio
    const copyServiceInfo = () => {
        if (!service) return;
        
        const messageText = createServiceMessage();
        
        navigator.clipboard.writeText(messageText)
            .then(() => {
                showNotification('Información copiada al portapapeles', 'success');
            })
            .catch(() => {
                showNotification('No se pudo copiar la información', 'error');
            });
    };
    
    // Mostrar notificación
    const showNotification = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };
    
    // Cerrar notificación
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    // Crear mensaje con datos del servicio para compartir
    const createServiceMessage = () => {
        if (!service) return '';
        
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
        showNotification('Abriendo WhatsApp...', 'success');
        setShowShareOptions(false);
    };
    
    // Compartir vía Email
    const shareViaEmail = () => {
        const subject = `Información sobre servicio dental: ${service?.title || 'Odontología Carol'}`;
        const body = createServiceMessage().replace(/\*/g, '').replace(/\n/g, '%0D%0A');
        const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
        window.open(mailtoUrl, '_blank');
        showNotification('Preparando email...', 'success');
        setShowShareOptions(false);
    };

    // Función para manejar secciones activas
    const handleSectionActivity = (sectionTitle) => {
        setActiveSection(activeSection === sectionTitle ? null : sectionTitle);
    };
    
    // Volver al inicio del diálogo
    const scrollToTop = () => {
        if (dialogContentRef.current) {
            dialogContentRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };
    
    // Componente para encabezados de sección - MÁS COMPACTO
    const SectionHeader = ({ icon: Icon, title, description, color = colors.primary }) => (
        <Box 
            sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1.5, // Reducido de 2 a 1.5
                pb: 0.5, // Reducido
                borderBottom: `1px solid ${alpha(color, 0.2)}`, // Línea más sutil
                transition: 'all 0.2s ease'
            }}
        >
            <Avatar sx={{ 
                bgcolor: alpha(color, 0.1), // Fondo más sutil
                color: color,
                mr: 1,
                width: 32, // Más pequeño
                height: 32,
                border: `2px solid ${alpha(color, 0.2)}`
            }}>
                <Icon sx={{ fontSize: 18 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ 
                    color: colors.text, 
                    fontWeight: 600, 
                    lineHeight: 1.2,
                    fontSize: '0.95rem' // Más pequeño
                }}>
                    {title}
                </Typography>
                {!isMobile && (
                    <Typography variant="caption" sx={{ 
                        color: colors.secondary, 
                        display: 'block', 
                        mt: 0.2,
                        fontSize: '0.75rem'
                    }}>
                        {description}
                    </Typography>
                )}
            </Box>
        </Box>
    );

    // Componente de Esqueleto para cargar - MÁS COMPACTO
    const SkeletonLoader = () => (
        <Box sx={{ width: '100%' }}>
            <Grid container spacing={2}> {/* Reducido spacing */}
                <Grid item xs={12} md={4}>
                    <Skeleton 
                        variant="rectangular" 
                        height={280} // Reducido
                        sx={{ 
                            borderRadius: 1, 
                            mb: 1.5,
                            bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
                        }} 
                    />
                </Grid>
                <Grid item xs={12} md={8}>
                    <Skeleton variant="text" height={50} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Skeleton variant="rectangular" width={80} height={28} sx={{ borderRadius: 14 }} />
                        <Skeleton variant="rectangular" width={80} height={28} sx={{ borderRadius: 14 }} />
                    </Box>
                </Grid>
            </Grid>

            <Grid container spacing={1.5} sx={{ mt: 1 }}> {/* Spacing reducido */}
                {[1, 2, 3, 4].map((item) => (
                    <Grid item xs={12} sm={6} key={item}>
                        <Card sx={{ 
                            height: 150, // Altura fija más pequeña
                            borderRadius: 1,
                            bgcolor: colors.cardBg,
                            border: `1px solid ${colors.cardBorder}`
                        }}>
                            <CardContent sx={{ p: 2 }}>
                                <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
                                <Stack spacing={1}>
                                    {[1, 2].map(i => ( // Reducido de 3 a 2
                                        <Skeleton 
                                            key={i}
                                            variant="text" 
                                            height={20} 
                                            width={`${Math.floor(60 + Math.random() * 30)}%`}
                                        />
                                    ))}
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
                py: 4, // Reducido
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5 // Reducido
            }}
        >
            <Box
                sx={{
                    width: 60, // Más pequeño
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: alpha(colors.error, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Warning sx={{ fontSize: 32, color: colors.error }} />
            </Box>
            <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
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
                sx={{ 
                    mt: 1,
                    borderColor: colors.primary,
                    color: colors.primary,
                    '&:hover': {
                        borderColor: colors.primary,
                        bgcolor: alpha(colors.primary, 0.05)
                    }
                }}
            >
                Intentar nuevamente
            </Button>
        </Box>
    );

    // Componente para mostrar el indicador de tratamiento - MÁS COMPACTO
    const TreatmentIndicator = ({ isTreatment, sessionCount }) => (
        <Paper
            elevation={0}
            sx={{
                p: 1.5, // Reducido
                borderRadius: 1,
                mb: 1.5, // Reducido
                backgroundColor: alpha(isTreatment ? colors.treatment : colors.nonTreatment, 0.08),
                border: `1px solid ${alpha(isTreatment ? colors.treatment : colors.nonTreatment, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1
            }}
        >
            <Avatar 
                sx={{ 
                    bgcolor: alpha(isTreatment ? colors.treatment : colors.nonTreatment, 0.1),
                    color: isTreatment ? colors.treatment : colors.nonTreatment,
                    width: 36, // Más pequeño
                    height: 36,
                    border: `2px solid ${alpha(isTreatment ? colors.treatment : colors.nonTreatment, 0.2)}`
                }}
            >
                {isTreatment ? <MedicalServices sx={{ fontSize: 18 }} /> : <Info sx={{ fontSize: 18 }} />}
            </Avatar>
            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.text }}>
                    {isTreatment ? 'Tratamiento Dental' : 'Servicio Regular'}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.secondary }}>
                    {isTreatment && sessionCount > 1 
                        ? `Requiere aproximadamente ${sessionCount} citas`
                        : 'Se realiza en una única sesión'}
                </Typography>
            </Box>
        </Paper>
    );

    // Componente de sección de información - MÁS COMPACTO
    const InfoSection = ({ section, index }) => {
        const isActive = activeSection === section.title;

        return (
            <Grid item xs={12} sm={6} key={section.title}>
                <Fade in={isVisible} timeout={300 + section.delay}>
                    <Card
                        sx={{
                            backgroundColor: colors.cardBg,
                            height: isMobile ? 'auto' : 280, // Altura fija más pequeña
                            borderRadius: 1, // Menos redondeado
                            boxShadow: colors.cardShadow,
                            border: `1px solid ${isActive ? alpha(section.color, 0.3) : colors.cardBorder}`,
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderColor: alpha(section.color, 0.3),
                                boxShadow: `0 4px 12px ${alpha(section.color, 0.15)}`
                            }
                        }}
                        onClick={() => setActiveSection(isActive ? null : section.title)}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '3px', // Más delgado
                                background: section.color || colors.primary
                            }}
                        />
                        <CardContent sx={{ p: 2 }}> {/* Padding reducido */}
                            <SectionHeader
                                icon={section.icon}
                                title={section.title}
                                description={section.description}
                                color={section.color || colors.primary}
                            />
                            <List
                                sx={{
                                    mt: 0.5,
                                    maxHeight: isMobile ? 200 : 180, // Más compacto
                                    overflow: 'auto',
                                    scrollbarWidth: 'thin',
                                    '&::-webkit-scrollbar': { width: '4px' },
                                    '&::-webkit-scrollbar-track': {
                                        background: alpha(colors.secondary, 0.1),
                                        borderRadius: '2px'
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background: alpha(colors.secondary, 0.3),
                                        borderRadius: '2px'
                                    }
                                }}
                                dense
                            >
                                {section.data && section.data.length > 0 ? (
                                    section.data.map((item, idx) => (
                                        <Fade key={idx} in={true} timeout={300 + (idx * 20)}>
                                            <ListItem
                                                alignItems="flex-start"
                                                sx={{
                                                    px: 0.5, // Más compacto
                                                    py: 0.5,
                                                    borderRadius: 0.5,
                                                    mb: 0.25,
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        bgcolor: alpha(section.color, 0.05)
                                                    }
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 28 }}>
                                                    <section.itemIcon
                                                        sx={{
                                                            color: section.color || colors.primary,
                                                            fontSize: 16 // Más pequeño
                                                        }}
                                                    />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={item}
                                                    sx={{
                                                        color: colors.text,
                                                        my: 0,
                                                        '& .MuiListItemText-primary': {
                                                            fontSize: '0.875rem',
                                                            lineHeight: 1.4
                                                        }
                                                    }}
                                                />
                                            </ListItem>
                                        </Fade>
                                    ))
                                ) : (
                                    <Typography variant="body2" sx={{ 
                                        color: colors.secondary, 
                                        py: 2, 
                                        px: 1, 
                                        fontStyle: 'italic',
                                        textAlign: 'center'
                                    }}>
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

    // Componente de imagen ampliable - MÁS COMPACTO
    const ZoomableImage = ({ src, alt }) => {
        return (
            <Box sx={{ position: 'relative' }}>
                <Box
                    ref={imageRef}
                    sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        minHeight: 220, // Reducido
                        borderRadius: 1,
                        transition: 'all 0.2s ease'
                    }}
                    onClick={() => setImageZoomed(true)}
                >
                    {imageLoading && (
                        <Skeleton
                            variant="rectangular"
                            width="100%"
                            height="100%"
                            animation="wave"
                            sx={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0,
                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
                            }}
                        />
                    )}
                    
                    <CardMedia
                        component="img"
                        image={src
                            ? src.includes('cloudinary')
                              ? src.replace('/upload/', '/upload/w_600,h_400,c_fill,q_auto,f_auto/')
                              : src
                            : `https://source.unsplash.com/featured/?dental,service`
                        }
                        alt={alt}
                        loading="eager"
                        onLoad={() => setImageLoading(false)}
                        sx={{
                            objectFit: 'cover',
                            objectPosition: 'center',
                            opacity: imageLoading ? 0 : 1,
                            transition: 'opacity 0.3s ease-in-out',
                            width: '100%',
                            height: '100%'
                        }}
                    />

                    {/* Overlay sutil para zoom */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            '&:hover': {
                                opacity: 1,
                                background: 'rgba(0,0,0,0.3)'
                            }
                        }}
                    >
                        <ZoomIn sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                </Box>

                {/* Overlay de imagen ampliada */}
                <Dialog
                    open={imageZoomed}
                    onClose={() => setImageZoomed(false)}
                    maxWidth="lg"
                    PaperProps={{
                        sx: {
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                            overflow: 'hidden'
                        }
                    }}
                    sx={{
                        '& .MuiDialog-paper': { 
                            m: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        },
                        '& .MuiBackdrop-root': {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)'
                        }
                    }}
                >
                    <Box 
                        sx={{ 
                            position: 'relative', 
                            width: '100%', 
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <img 
                            src={src ? 
                                (src.includes('cloudinary') ? 
                                    src.replace('/upload/', '/upload/w_1200,h_1200,c_fill,q_auto,f_auto/') : 
                                    src) : 
                                `https://source.unsplash.com/featured/?dental,service`
                            } 
                            alt={alt}
                            style={{ 
                                maxWidth: '90%', 
                                maxHeight: '90%', 
                                objectFit: 'contain',
                                borderRadius: '4px'
                            }} 
                        />
                        
                        <IconButton 
                            aria-label="cerrar"
                            onClick={() => setImageZoomed(false)}
                            sx={{ 
                                position: 'absolute', 
                                top: 16, 
                                right: 16,
                                bgcolor: 'rgba(0,0,0,0.6)',
                                color: '#fff',
                                '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.8)'
                                }
                            }}
                        >
                            <Close />
                        </IconButton>
                    </Box>
                </Dialog>
            </Box>
        );
    };

    // Componente para opciones de compartir - MÁS COMPACTO
    const ShareOptions = () => {
        const whatsappColor = '#25D366';
        const emailColor = '#EA4335';
        const linkColor = '#1976d2';
        
        return (
            <Grow in={showShareOptions}>
                <Box sx={{ 
                    position: isMobile ? 'fixed' : 'absolute', 
                    bottom: isMobile ? 0 : 'auto',
                    left: isMobile ? 0 : '60px', 
                    width: isMobile ? '100%' : 'auto',
                    zIndex: 100,
                    boxShadow: colors.cardShadow,
                    borderRadius: isMobile ? '12px 12px 0 0' : '8px',
                    p: 1.5, // Reducido
                    bgcolor: colors.cardBg,
                    border: `1px solid ${colors.cardBorder}`
                }}>
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.text }}>
                            Compartir servicio
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.secondary, mb: 1 }}>
                            Elige una opción
                        </Typography>
                    </Box>
                
                    <Grid container spacing={1}>
                        <Grid item xs={4}>
                            <Button
                                variant="outlined"
                                fullWidth
                                size="small"
                                onClick={shareViaWhatsApp}
                                startIcon={<WhatsAppIcon />}
                                sx={{
                                    color: whatsappColor,
                                    borderColor: alpha(whatsappColor, 0.5),
                                    '&:hover': {
                                        borderColor: whatsappColor,
                                        bgcolor: alpha(whatsappColor, 0.08)
                                    },
                                    textTransform: 'none',
                                    py: 0.75
                                }}
                            >
                                WhatsApp
                            </Button>
                        </Grid>
                        
                        <Grid item xs={4}>
                            <Button
                                variant="outlined"
                                fullWidth
                                size="small"
                                onClick={shareViaEmail}
                                startIcon={<EmailIcon />}
                                sx={{
                                    color: emailColor,
                                    borderColor: alpha(emailColor, 0.5),
                                    '&:hover': {
                                        borderColor: emailColor,
                                        bgcolor: alpha(emailColor, 0.08)
                                    },
                                    textTransform: 'none',
                                    py: 0.75
                                }}
                            >
                                Email
                            </Button>
                        </Grid>
                        
                        <Grid item xs={4}>
                            <Button
                                variant="outlined"
                                fullWidth
                                size="small"
                                onClick={copyServiceInfo}
                                startIcon={<ContentCopy />}
                                sx={{
                                    color: linkColor,
                                    borderColor: alpha(linkColor, 0.5),
                                    '&:hover': {
                                        borderColor: linkColor,
                                        bgcolor: alpha(linkColor, 0.08)
                                    },
                                    textTransform: 'none',
                                    py: 0.75
                                }}
                            >
                                Copiar
                            </Button>
                        </Grid>
                    </Grid>
                    
                    {isMobile && (
                        <Button
                            fullWidth
                            variant="text"
                            size="small"
                            onClick={() => setShowShareOptions(false)}
                            sx={{ 
                                mt: 1, 
                                color: colors.text,
                                '&:hover': {
                                    bgcolor: alpha(colors.primary, 0.05)
                                }
                            }}
                        >
                            Cancelar
                        </Button>
                    )}
                </Box>
            </Grow>
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

        const isTreatment = service.tratamiento === 1;
        const sessionCount = service.citasEstimadas || 1;

        return (
            <Box sx={{ pt: 0.5 }}>
                {/* Header Section compacto */}
                <Grid container spacing={2}> {/* Spacing reducido */}
                    {/* Columna de la imagen */}
                    <Grid item xs={12} md={4}>
                        <Card
                            elevation={0}
                            sx={{
                                backgroundColor: colors.cardBg,
                                borderRadius: 1,
                                overflow: 'hidden',
                                position: 'relative',
                                height: { md: '100%' },
                                display: 'flex',
                                flexDirection: 'column',
                                border: `1px solid ${alpha(isTreatment ? colors.treatment : colors.nonTreatment, 0.2)}`
                            }}
                        >
                            {/* Categoría */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    left: 8,
                                    zIndex: 5,
                                }}
                            >
                                <Chip
                                    label={service.category || "Servicio dental"}
                                    size="small"
                                    sx={{
                                        backgroundColor: alpha(colors.primary, 0.9),
                                        color: '#fff',
                                        fontWeight: 500,
                                        fontSize: '0.7rem',
                                        backdropFilter: 'blur(4px)'
                                    }}
                                />
                            </Box>

                            <Box sx={{ position: 'relative', flexGrow: 1, minHeight: 200 }}>
                                <ZoomableImage 
                                    src={service.image_url || `https://source.unsplash.com/featured/?dental,${service.title.replace(' ', ',')}`} 
                                    alt={service.title}
                                />
                            </Box>

                            {/* Barra inferior compacta */}
                            <Box 
                                sx={{ 
                                    p: 1, 
                                    borderTop: `2px solid ${alpha(isTreatment ? colors.treatment : colors.nonTreatment, 0.3)}`,
                                    bgcolor: alpha(isTreatment ? colors.treatment : colors.nonTreatment, 0.05),
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <LocalHospital sx={{ 
                                        color: isTreatment ? colors.treatment : colors.nonTreatment, 
                                        mr: 0.5,
                                        fontSize: 18
                                    }} />
                                    <Typography variant="caption" sx={{ color: colors.text, fontWeight: 600 }}>
                                        {isTreatment ? 'Tratamiento' : 'Servicio'}
                                    </Typography>
                                </Box>
                                
                                {isTreatment && sessionCount > 1 && (
                                    <Chip
                                        icon={<CalendarMonth sx={{ fontSize: '0.8rem !important' }} />}
                                        label={`${sessionCount} citas`}
                                        size="small"
                                        sx={{
                                            bgcolor: alpha(colors.treatment, 0.1),
                                            color: colors.treatment,
                                            fontWeight: 500,
                                            fontSize: '0.7rem',
                                            height: 20,
                                            '& .MuiChip-icon': { 
                                                color: colors.treatment,
                                                fontSize: '0.8rem'
                                            }
                                        }}
                                    />
                                )}
                            </Box>
                        </Card>
                    </Grid>

                    {/* Columna de detalles */}
                    <Grid item xs={12} md={8}>
                        <Card
                            elevation={0}
                            sx={{
                                backgroundColor: colors.cardBg,
                                borderRadius: 1,
                                p: 2, // Reducido
                                height: '100%',
                                border: `1px solid ${colors.cardBorder}`,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            {/* Título compacto */}
                            <Typography
                                variant={isMobile ? "h6" : "h5"}
                                sx={{
                                    color: colors.text,
                                    fontWeight: 700,
                                    mb: 1,
                                    lineHeight: 1.2
                                }}
                            >
                                {service.title}
                            </Typography>

                            {/* Indicador de tratamiento compacto */}
                            <TreatmentIndicator 
                                isTreatment={isTreatment} 
                                sessionCount={sessionCount} 
                            />

                            {/* Descripción */}
                            <Typography
                                variant="body2"
                                sx={{
                                    color: colors.secondary,
                                    mb: 2,
                                    lineHeight: 1.5,
                                    flexGrow: 1
                                }}
                            >
                                {service.description}
                            </Typography>

                            <Divider sx={{ mb: 1.5 }} />

                            {/* Chips compactos */}
                            <Box sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 0.75,
                                mb: 1
                            }}>
                                <Chip
                                    icon={<Timer />}
                                    label={service.duration}
                                    size="small"
                                    sx={{
                                        bgcolor: alpha(colors.primary, 0.1),
                                        color: colors.primary,
                                        border: `1px solid ${alpha(colors.primary, 0.2)}`,
                                        fontWeight: 500,
                                        fontSize: '0.75rem',
                                        '& .MuiChip-icon': { 
                                            color: colors.primary,
                                            fontSize: 16
                                        }
                                    }}
                                />
                                <Chip
                                    icon={<AttachMoney />}
                                    label={`$${service.price}`}
                                    size="small"
                                    sx={{
                                        bgcolor: alpha(colors.accent, 0.1),
                                        color: colors.accent,
                                        border: `1px solid ${alpha(colors.accent, 0.2)}`,
                                        fontWeight: 500,
                                        fontSize: '0.75rem',
                                        '& .MuiChip-icon': { 
                                            color: colors.accent,
                                            fontSize: 16
                                        }
                                    }}
                                />
                                <Chip
                                    icon={<AccessTime />}
                                    label={isTreatment && sessionCount > 1 
                                        ? `${sessionCount} sesiones` 
                                        : "Sesión única"}
                                    size="small"
                                    sx={{
                                        bgcolor: alpha(isTreatment ? colors.treatment : colors.nonTreatment, 0.1),
                                        color: isTreatment ? colors.treatment : colors.nonTreatment,
                                        border: `1px solid ${alpha(isTreatment ? colors.treatment : colors.nonTreatment, 0.2)}`,
                                        fontWeight: 500,
                                        fontSize: '0.75rem',
                                        '& .MuiChip-icon': { 
                                            color: isTreatment ? colors.treatment : colors.nonTreatment,
                                            fontSize: 16
                                        }
                                    }}
                                />
                            </Box>
                        </Card>
                    </Grid>

                    {/* Secciones de información con colores profesionales */}
                    {[
                        {
                            title: 'Beneficios',
                            icon: Star,
                            description: 'Ventajas y resultados esperados',
                            data: service.benefits,
                            itemIcon: CheckCircle,
                            delay: 100,
                            color: colors.success
                        },
                        {
                            title: 'Qué incluye',
                            icon: Assignment,
                            description: 'Procedimientos incluidos',
                            data: service.includes,
                            itemIcon: Info,
                            delay: 150,
                            color: colors.primary
                        },
                        {
                            title: 'Preparación',
                            icon: Schedule,
                            description: 'Recomendaciones previas',
                            data: service.preparation,
                            itemIcon: Warning,
                            delay: 200,
                            color: colors.warning
                        },
                        {
                            title: 'Cuidados posteriores',
                            icon: LocalHospital,
                            description: 'Instrucciones post-tratamiento',
                            data: service.aftercare,
                            itemIcon: CheckCircleOutline,
                            delay: 250,
                            color: colors.accent
                        }
                    ].map((section, index) => (
                        <InfoSection key={section.title} section={section} index={index} />
                    ))}
                </Grid>
            </Box>
        );
    };
    
    // Botón para volver arriba - MÁS COMPACTO
    const ScrollTopButton = () => (
        <Zoom in={showScrollTop}>
            <Fab
                size="small"
                color="primary"
                aria-label="volver arriba"
                onClick={scrollToTop}
                sx={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    zIndex: 9,
                    width: 40, // Más pequeño
                    height: 40,
                    bgcolor: colors.primary,
                    '&:hover': {
                        bgcolor: colors.accent
                    }
                }}
            >
                <KeyboardArrowUp sx={{ fontSize: 20 }} />
            </Fab>
        </Zoom>
    );

    return (
        <>
            <Dialog
                open={open}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick' || !loading) {
                        setShowShareOptions(false);
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
                        borderRadius: { xs: 0, sm: 2 }, // Menos redondeado
                        overflow: 'hidden',
                        backgroundImage: colors.gradient,
                        maxWidth: fullScreen ? '100%' : '90%' // Más compacto
                    }
                }}
                sx={{
                    backdropFilter: 'blur(2px)' // Menos blur
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
                            <MedicalServices sx={{ mr: 1, fontSize: 20 }} /> : 
                            <Description sx={{ mr: 1, fontSize: 20 }} />
                        }
                        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600 }}>
                            {service && service.tratamiento === 1 ? 'Detalles del Tratamiento' : 'Detalles del Servicio'}
                        </Typography>
                    </Box>
                    <MuiIconButton
                        aria-label="close"
                        onClick={onClose}
                        disabled={loading}
                        size="small"
                        sx={{
                            color: '#fff',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.1)'
                            }
                        }}
                    >
                        <Close fontSize="small" />
                    </MuiIconButton>
                </DialogTitle>

                <DialogContent
                    dividers
                    ref={dialogContentRef}
                    sx={{
                        p: { xs: 1.5, sm: 2 }, // Padding reducido
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderTop: `1px solid ${colors.cardBorder}`,
                        borderBottom: `1px solid ${colors.cardBorder}`,
                        position: 'relative',
                        '&::-webkit-scrollbar': {
                            width: '6px' // Scrollbar más delgado
                        },
                        '&::-webkit-scrollbar-track': {
                            background: alpha(colors.secondary, 0.1)
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: alpha(colors.secondary, 0.3),
                            borderRadius: '3px'
                        }
                    }}
                >
                    <Suspense fallback={<SkeletonLoader />}>
                        {dialogContent()}
                    </Suspense>
                    
                    <ScrollTopButton />
                </DialogContent>

                <DialogActions
                    sx={{
                        py: 1.5, // Reducido
                        px: { xs: 1.5, sm: 2 },
                        backgroundColor: 'transparent',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 1
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        {/* Botón para compartir servicio */}
                        <Tooltip title={showShareOptions ? "Cerrar" : "Compartir servicio"}>
                            <IconButton
                                color="primary"
                                size="small"
                                onClick={() => setShowShareOptions(!showShareOptions)}
                                sx={{
                                    mr: 1,
                                    bgcolor: showShareOptions ? alpha(colors.primary, 0.1) : 'transparent',
                                    '&:hover': {
                                        bgcolor: alpha(colors.primary, 0.1)
                                    }
                                }}
                            >
                                <Share fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        {!isMobile && showShareOptions && service && <ShareOptions />}

                        <Button
                            onClick={onClose}
                            variant="outlined"
                            disabled={loading}
                            startIcon={<Close />}
                            size="small"
                            sx={{
                                borderColor: alpha(colors.primary, 0.5),
                                color: colors.primary,
                                px: 2,
                                borderRadius: 1,
                                textTransform: 'none',
                                '&:hover': {
                                    borderColor: colors.primary,
                                    bgcolor: alpha(colors.primary, 0.05)
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
                            backgroundColor: service && service.tratamiento === 1 ? colors.treatment : colors.primary,
                            color: '#fff',
                            px: 3,
                            py: 1,
                            borderRadius: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: colors.cardShadow,
                            '&:hover': {
                                backgroundColor: service && service.tratamiento === 1 
                                    ? '#2e7d32' // Verde más oscuro
                                    : '#1565c0', // Azul más oscuro
                                boxShadow: `0 4px 12px ${alpha(colors.primary, 0.3)}`
                            }
                        }}
                    >
                        Agendar Cita
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Drawer de compartir para móviles */}
            {isMobile && (
                <SwipeableDrawer
                    anchor="bottom"
                    open={showShareOptions && !!service}
                    onClose={() => setShowShareOptions(false)}
                    onOpen={() => {}}
                    disableSwipeToOpen
                    PaperProps={{
                        sx: {
                            borderRadius: '12px 12px 0 0',
                            maxHeight: '40vh' // Más compacto
                        }
                    }}
                >
                    <ShareOptions />
                </SwipeableDrawer>
            )}
            
            {/* Notificaciones */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ServicioDetalleDialog;