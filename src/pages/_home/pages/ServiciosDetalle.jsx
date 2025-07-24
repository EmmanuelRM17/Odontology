// Reemplaza tu componente ServicioDetalleDialog con esta versión minimalista

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

    // Configuración de colores MINIMALISTA Y PROFESIONAL
    const colors = {
        background: isDarkTheme ? '#0A0A0A' : '#FAFBFC',
        primary: isDarkTheme ? '#FFFFFF' : '#1A1A1A',
        text: isDarkTheme ? '#F8FAFC' : '#1A202C',
        secondary: isDarkTheme ? '#94A3B8' : '#64748B',
        cardBg: isDarkTheme ? '#1A1A1A' : '#FFFFFF',
        accent: isDarkTheme ? '#E2E8F0' : '#374151',
        cardBorder: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        cardShadow: isDarkTheme 
            ? '0 4px 20px rgba(0,0,0,0.4)' 
            : '0 2px 12px rgba(0,0,0,0.08)',
        divider: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        // Solo un color de acento discreto
        highlight: isDarkTheme ? '#3B82F6' : '#2563EB',
        // Eliminamos todos los colores específicos por categoría
        neutral: isDarkTheme ? '#6B7280' : '#9CA3AF'
    };

    // Control de scroll para mostrar/ocultar botón "volver arriba"
    useEffect(() => {
        if (!open || !dialogContentRef.current) return;
        
        const handleScroll = () => {
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
    
    // Componente para encabezados de sección - MINIMALISTA
    const SectionHeader = ({ icon: Icon, title, description }) => (
        <Box 
            sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1.5,
                pb: 1,
                borderBottom: `1px solid ${colors.divider}`
            }}
        >
            <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1.5,
                flexShrink: 0
            }}>
                <Icon sx={{ fontSize: 16, color: colors.secondary }} />
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ 
                    color: colors.text, 
                    fontWeight: 600,
                    fontSize: '0.9rem'
                }}>
                    {title}
                </Typography>
                {!isMobile && (
                    <Typography variant="caption" sx={{ 
                        color: colors.secondary,
                        fontSize: '0.75rem'
                    }}>
                        {description}
                    </Typography>
                )}
            </Box>
        </Box>
    );

    // Componente de Esqueleto para cargar - COMPACTO
    const SkeletonLoader = () => (
        <Box sx={{ width: '100%', p: 1 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <Skeleton 
                        variant="rectangular" 
                        height={260}
                        sx={{ 
                            borderRadius: '8px',
                            mb: 1.5,
                            bgcolor: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
                        }} 
                    />
                </Grid>
                <Grid item xs={12} md={8}>
                    <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={80} sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '12px' }} />
                        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '12px' }} />
                    </Box>
                </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 2 }}>
                {[1, 2, 3, 4].map((item) => (
                    <Grid item xs={12} sm={6} key={item}>
                        <Card sx={{ 
                            height: 140,
                            borderRadius: '8px',
                            bgcolor: colors.cardBg,
                            border: `1px solid ${colors.cardBorder}`
                        }}>
                            <CardContent sx={{ p: 1.5 }}>
                                <Skeleton variant="text" height={28} sx={{ mb: 1 }} />
                                <Stack spacing={0.5}>
                                    {[1, 2].map(i => (
                                        <Skeleton 
                                            key={i}
                                            variant="text" 
                                            height={16} 
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
                py: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2
            }}
        >
            <Box
                sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: alpha('#EF4444', 0.1),
                    border: `1px solid ${alpha('#EF4444', 0.2)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Warning sx={{ fontSize: 28, color: '#EF4444' }} />
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
                    borderColor: colors.secondary,
                    color: colors.secondary,
                    '&:hover': {
                        borderColor: colors.text,
                        color: colors.text
                    }
                }}
            >
                Intentar nuevamente
            </Button>
        </Box>
    );

    // Componente para mostrar el indicador de tratamiento - MINIMALISTA
    const TreatmentIndicator = ({ isTreatment, sessionCount }) => (
        <Paper
            elevation={0}
            sx={{
                p: 1.5,
                borderRadius: '8px',
                mb: 2,
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
            }}
        >
            <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '6px',
                backgroundColor: alpha(colors.highlight, 0.1),
                border: `1px solid ${alpha(colors.highlight, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {isTreatment ? 
                    <MedicalServices sx={{ fontSize: 16, color: colors.highlight }} /> : 
                    <Info sx={{ fontSize: 16, color: colors.highlight }} />
                }
            </Box>
            <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text, fontSize: '0.875rem' }}>
                    {isTreatment ? 'Tratamiento Dental' : 'Servicio Regular'}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.secondary, fontSize: '0.75rem' }}>
                    {isTreatment && sessionCount > 1 
                        ? `Requiere aproximadamente ${sessionCount} citas`
                        : 'Se realiza en una única sesión'}
                </Typography>
            </Box>
        </Paper>
    );

    // Componente de sección de información - MINIMALISTA
    const InfoSection = ({ section, index }) => (
        <Grid item xs={12} sm={6} key={section.title}>
            <Fade in={isVisible} timeout={300 + section.delay}>
                <Card
                    sx={{
                        backgroundColor: colors.cardBg,
                        height: { xs: 'auto', sm: 260 },
                        borderRadius: '8px',
                        boxShadow: colors.cardShadow,
                        border: `1px solid ${colors.cardBorder}`,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            borderColor: alpha(colors.highlight, 0.3),
                            boxShadow: `0 4px 20px ${alpha(colors.highlight, 0.1)}`
                        }
                    }}
                >
                    <CardContent sx={{ p: 2 }}>
                        <SectionHeader
                            icon={section.icon}
                            title={section.title}
                            description={section.description}
                        />
                        <List
                            sx={{
                                mt: 0.5,
                                maxHeight: { xs: 180, sm: 160 },
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
                                    <ListItem
                                        key={idx}
                                        alignItems="flex-start"
                                        sx={{
                                            px: 0,
                                            py: 0.5,
                                            borderRadius: '4px',
                                            mb: 0.25,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                bgcolor: alpha(colors.highlight, 0.05)
                                            }
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 24 }}>
                                            <Box
                                                sx={{
                                                    width: 4,
                                                    height: 4,
                                                    borderRadius: '50%',
                                                    backgroundColor: colors.secondary,
                                                    mt: 1
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

    // Componente de imagen ampliable - MINIMALISTA
    const ZoomableImage = ({ src, alt }) => {
        return (
            <Box sx={{ position: 'relative' }}>
                <Box
                    ref={imageRef}
                    sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        minHeight: 200,
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
                        backgroundColor: colors.cardBg
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
                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
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

                    {/* Overlay minimalista para zoom */}
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
                        <ZoomIn sx={{ color: 'white', fontSize: 24 }} />
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
                    <Box sx={{ 
                        position: 'relative', 
                        width: '100%', 
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
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

    // Componente para opciones de compartir - MINIMALISTA
    const ShareOptions = () => (
        <Grow in={showShareOptions}>
            <Box sx={{ 
                position: isMobile ? 'fixed' : 'absolute', 
                bottom: isMobile ? 0 : 'auto',
                left: isMobile ? 0 : '60px', 
                width: isMobile ? '100%' : 'auto',
                zIndex: 100,
                boxShadow: colors.cardShadow,
                borderRadius: isMobile ? '12px 12px 0 0' : '8px',
                p: 2,
                bgcolor: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`
            }}>
                <Typography variant="subtitle2" sx={{ 
                    fontWeight: 600, 
                    color: colors.text,
                    mb: 1.5
                }}>
                    Compartir servicio
                </Typography>
            
                <Grid container spacing={1.5}>
                    <Grid item xs={4}>
                        <Button
                            variant="outlined"
                            fullWidth
                            size="small"
                            onClick={shareViaWhatsApp}
                            startIcon={<WhatsAppIcon />}
                            sx={{
                                color: colors.text,
                                borderColor: colors.cardBorder,
                                '&:hover': {
                                    borderColor: colors.secondary,
                                    bgcolor: alpha(colors.secondary, 0.05)
                                },
                                textTransform: 'none',
                                py: 1
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
                                color: colors.text,
                                borderColor: colors.cardBorder,
                                '&:hover': {
                                    borderColor: colors.secondary,
                                    bgcolor: alpha(colors.secondary, 0.05)
                                },
                                textTransform: 'none',
                                py: 1
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
                                color: colors.text,
                                borderColor: colors.cardBorder,
                                '&:hover': {
                                    borderColor: colors.secondary,
                                    bgcolor: alpha(colors.secondary, 0.05)
                                },
                                textTransform: 'none',
                                py: 1
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
                            mt: 1.5, 
                            color: colors.secondary,
                            '&:hover': {
                                bgcolor: alpha(colors.secondary, 0.05)
                            }
                        }}
                    >
                        Cancelar
                    </Button>
                )}
            </Box>
        </Grow>
    );

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
            <Box sx={{ p: 1 }}>
                {/* Header Section minimalista */}
                <Grid container spacing={2}>
                    {/* Columna de la imagen */}
                    <Grid item xs={12} md={4}>
                        <Card
                            elevation={0}
                            sx={{
                                backgroundColor: colors.cardBg,
                                borderRadius: '8px',
                                overflow: 'hidden',
                                position: 'relative',
                                height: { md: '100%' },
                                display: 'flex',
                                flexDirection: 'column',
                                border: `1px solid ${colors.cardBorder}`
                            }}
                        >
                            {/* Categoría minimalista */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 12,
                                    left: 12,
                                    zIndex: 5,
                                }}
                            >
                                <Chip
                                    label={service.category || "Servicio dental"}
                                    size="small"
                                    sx={{
                                        backgroundColor: alpha(colors.text, 0.9),
                                        color: colors.background,
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

                            {/* Barra inferior minimalista */}
                            <Box sx={{ 
                                p: 1.5,
                                borderTop: `1px solid ${colors.divider}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <LocalHospital sx={{ 
                                        color: colors.secondary, 
                                        fontSize: 16
                                    }} />
                                    <Typography variant="caption" sx={{ 
                                        color: colors.text, 
                                        fontWeight: 500,
                                        fontSize: '0.75rem'
                                    }}>
                                        {isTreatment ? 'Tratamiento' : 'Servicio'}
                                    </Typography>
                                </Box>
                                
                                {isTreatment && sessionCount > 1 && (
                                    <Typography variant="caption" sx={{ 
                                        color: colors.secondary,
                                        fontSize: '0.75rem'
                                    }}>
                                        {sessionCount} citas
                                    </Typography>
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
                                borderRadius: '8px',
                                p: 2,
                                height: '100%',
                                border: `1px solid ${colors.cardBorder}`,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            {/* Título */}
                            <Typography
                                variant={isMobile ? "h6" : "h5"}
                                sx={{
                                    color: colors.text,
                                    fontWeight: 600,
                                    mb: 1.5,
                                    lineHeight: 1.3
                                }}
                            >
                                {service.title}
                            </Typography>

                            {/* Indicador de tratamiento */}
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

                            <Divider sx={{ mb: 2, borderColor: colors.divider }} />

                            {/* Chips minimalistas */}
                            <Box sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1,
                                mb: 1
                            }}>
                                <Chip
                                    icon={<Timer />}
                                    label={service.duration}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        borderColor: colors.cardBorder,
                                        color: colors.text,
                                        fontSize: '0.75rem',
                                        '& .MuiChip-icon': { 
                                            color: colors.secondary,
                                            fontSize: 14
                                        }
                                    }}
                                />
                                <Chip
                                    icon={<AttachMoney />}
                                    label={`$${service.price}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        borderColor: colors.cardBorder,
                                        color: colors.text,
                                        fontSize: '0.75rem',
                                        '& .MuiChip-icon': { 
                                            color: colors.secondary,
                                            fontSize: 14
                                        }
                                    }}
                                />
                                <Chip
                                    icon={<AccessTime />}
                                    label={isTreatment && sessionCount > 1 
                                        ? `${sessionCount} sesiones` 
                                        : "Sesión única"}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        borderColor: colors.cardBorder,
                                        color: colors.text,
                                        fontSize: '0.75rem',
                                        '& .MuiChip-icon': { 
                                            color: colors.secondary,
                                            fontSize: 14
                                        }
                                    }}
                                />
                            </Box>
                        </Card>
                    </Grid>

                    {/* Secciones de información con diseño minimalista */}
                    {[
                        {
                            title: 'Beneficios',
                            icon: Star,
                            description: 'Ventajas y resultados esperados',
                            data: service.benefits,
                            delay: 100
                        },
                        {
                            title: 'Qué incluye',
                            icon: Assignment,
                            description: 'Procedimientos incluidos',
                            data: service.includes,
                            delay: 150
                        },
                        {
                            title: 'Preparación',
                            icon: Schedule,
                            description: 'Recomendaciones previas',
                            data: service.preparation,
                            delay: 200
                        },
                        {
                            title: 'Cuidados posteriores',
                            icon: LocalHospital,
                            description: 'Instrucciones post-tratamiento',
                            data: service.aftercare,
                            delay: 250
                        }
                    ].map((section, index) => (
                        <InfoSection key={section.title} section={section} index={index} />
                    ))}
                </Grid>
            </Box>
        );
    };
    
    // Botón para volver arriba
    const ScrollTopButton = () => (
        <Zoom in={showScrollTop}>
            <Fab
                size="small"
                aria-label="volver arriba"
                onClick={scrollToTop}
                sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    zIndex: 9,
                    width: 40,
                    height: 40,
                    bgcolor: colors.text,
                    color: colors.background,
                    '&:hover': {
                        bgcolor: colors.secondary
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
                        borderRadius: { xs: 0, sm: '8px' },
                        overflow: 'hidden',
                        maxWidth: fullScreen ? '100%' : '90%'
                    }
                }}
                sx={{
                    backdropFilter: 'blur(4px)'
                }}
            >
                <DialogTitle
                    sx={{
                        m: 0,
                        p: 2,
                        bgcolor: colors.cardBg,
                        color: colors.text,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: `1px solid ${colors.divider}`
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Description sx={{ mr: 1, fontSize: 20, color: colors.secondary }} />
                        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600 }}>
                            Detalles del Servicio
                        </Typography>
                    </Box>
                    <MuiIconButton
                        aria-label="close"
                        onClick={onClose}
                        disabled={loading}
                        size="small"
                        sx={{
                            color: colors.secondary,
                            '&:hover': {
                                bgcolor: alpha(colors.secondary, 0.1)
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
                        p: 1.5,
                        backgroundColor: colors.background,
                        border: 'none',
                        borderTop: `1px solid ${colors.divider}`,
                        borderBottom: `1px solid ${colors.divider}`,
                        position: 'relative',
                        '&::-webkit-scrollbar': {
                            width: '6px'
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
                        py: 1.5,
                        px: 2,
                        backgroundColor: colors.cardBg,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 1,
                        borderTop: `1px solid ${colors.divider}`
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        {/* Botón para compartir servicio */}
                        <Tooltip title={showShareOptions ? "Cerrar" : "Compartir servicio"}>
                            <IconButton
                                size="small"
                                onClick={() => setShowShareOptions(!showShareOptions)}
                                sx={{
                                    mr: 1,
                                    color: colors.secondary,
                                    bgcolor: showShareOptions ? alpha(colors.secondary, 0.1) : 'transparent',
                                    '&:hover': {
                                        bgcolor: alpha(colors.secondary, 0.1)
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
                                borderColor: colors.cardBorder,
                                color: colors.secondary,
                                px: 2,
                                borderRadius: '6px',
                                textTransform: 'none',
                                '&:hover': {
                                    borderColor: colors.secondary,
                                    bgcolor: alpha(colors.secondary, 0.05)
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
                            backgroundColor: colors.text,
                            color: colors.background,
                            px: 3,
                            py: 1,
                            borderRadius: '6px',
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: colors.cardShadow,
                            '&:hover': {
                                backgroundColor: colors.secondary,
                                boxShadow: `0 4px 12px ${alpha(colors.text, 0.2)}`
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
                            maxHeight: '40vh',
                            bgcolor: colors.cardBg
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