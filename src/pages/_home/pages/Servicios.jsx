import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Container,
    InputBase,
    IconButton,
    Paper,
    Menu,
    MenuItem,
    Tooltip,
    Button,
    ThemeProvider,
    createTheme,
    CssBaseline,
    alpha,
    Fade,
    Divider,
    Zoom,
    Chip,
    Skeleton,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import {
    Search as SearchIcon,
    FilterList as FilterListIcon,
    CalendarMonth as CalendarMonthIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    Info as InfoIcon,
    CheckCircle as CheckCircleIcon,
    ArrowForward as ArrowForwardIcon,
    LocalHospital,
    Spa,
    HealthAndSafety,
    Build,
    MedicalServices,
    AccessTime,
    Star
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import ServicioDetalleDialog from './ServiciosDetalle';

// Componente principal de Servicios
const Servicios = () => {
    // Estados para manejar la data y UI
    const [services, setServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [highlightedService, setHighlightedService] = useState(null);
    const { isDarkTheme } = useThemeContext();
    const navigate = useNavigate();
    const [highlightedServiceDialogOpen, setHighlightedServiceDialogOpen] = useState(false);
    const servicosRef = useRef(null);
    const isMobile = useMediaQuery('(max-width:600px)');

    // Efecto para cargar servicios
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('https://back-end-4803.onrender.com/api/servicios/all');
                if (!response.ok) throw new Error('Error al obtener los servicios');
                const data = await response.json();
                setServices(data);

                // Seleccionar un servicio destacado
                if (data.length > 0) {
                    const servicesWithImages = data.filter(service => service.image_url);
                    if (servicesWithImages.length > 0) {
                        setHighlightedService(servicesWithImages[Math.floor(Math.random() * servicesWithImages.length)]);
                    } else {
                        setHighlightedService(data[Math.floor(Math.random() * data.length)]);
                    }
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Tema personalizado con mejoras para modo oscuro
    const theme = createTheme({
        palette: {
            mode: isDarkTheme ? 'dark' : 'light',
            primary: {
                main: isDarkTheme ? '#3B82F6' : '#2563EB', // Azul más cálido y menos intenso
            },
            secondary: {
                main: '#10B981', // Verde más suave
            },
            background: {
                default: isDarkTheme ? '#0F172A' : '#F8FAFC', // Fondo más suave, menos negro
                paper: isDarkTheme ? '#1E293B' : '#FFFFFF',  // Tarjetas menos oscuras
            },
            text: {
                primary: isDarkTheme ? '#F1F5F9' : '#334155', // Texto más suave
                secondary: isDarkTheme ? '#94A3B8' : '#64748B',
            },
        },
        typography: {
            fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 30,
                        textTransform: 'none',
                        fontWeight: 600,
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                        overflow: 'hidden',
                        boxShadow: isDarkTheme
                            ? '0 4px 20px rgba(0,0,0,0.25)' // Sombra más suave en modo oscuro
                            : '0 2px 8px rgba(0,0,0,0.1)',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    },
                },
            },
        },
    });

    // Extraer categorías únicas
    const categories = ['Todos', ...new Set(services.map(service => service.category))];

    // Filtrar servicios según búsqueda y categoría
    const filteredServices = services.filter(service => {
        const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || service.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Manejar cambio de categoría
    const handleCategoryClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCategoryClose = (category) => {
        if (category) {
            setSelectedCategory(category);
            if (servicosRef.current) {
                servicosRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
        setAnchorEl(null);
    };

    // Obtener imagen de placeholder mejorada con colores de odontología
    const getPlaceholderImage = (title) => {
        const keywords = ['dental', 'dentist', 'tooth', 'smile'];
        return `https://source.unsplash.com/400x300/?${keywords[Math.floor(Math.random() * keywords.length)]},${title.replace(' ', ',')}`;
    };

    // Manejar agenda de cita
    const handleAgendarCita = (service) => {
        navigate('/agendar-cita', {
            state: {
                servicioSeleccionado: service
            }
        });
    };

    // Desplazarse a la sección de servicios
    const scrollToServices = () => {
        if (servicosRef.current) {
            servicosRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Componente ServiceCard rediseñado - Estilo minimalista y profesional
    const ServiceCard = ({ service, index, handleAgendarCita, isDarkTheme }) => {
        const theme = useTheme();
        const [dialogOpen, setDialogOpen] = useState(false);
        const [isHovered, setIsHovered] = useState(false);
        const [imageLoaded, setImageLoaded] = useState(false);
        const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

        const handleOpenDialog = () => setDialogOpen(true);
        const handleCloseDialog = () => setDialogOpen(false);

        // Formatear precio
        const formattedPrice = new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(parseFloat(service.price || 0));

        return (
            <Fade in timeout={200 + index * 50}>
                <Paper
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    elevation={0}
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        backgroundColor: isDarkTheme ? '#1A1A1A' : '#FFFFFF',
                        border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                        boxShadow: isHovered
                            ? isDarkTheme
                                ? '0 12px 40px rgba(0,0,0,0.4)'
                                : '0 8px 32px rgba(0,0,0,0.08)'
                            : isDarkTheme
                                ? '0 2px 8px rgba(0,0,0,0.2)'
                                : '0 1px 4px rgba(0,0,0,0.04)',
                        '&:hover': {
                            '& .service-image': {
                                transform: 'scale(1.02)'
                            }
                        }
                    }}
                >
                    {/* Imagen minimalista */}
                    <Box sx={{
                        position: 'relative',
                        height: { xs: 200, sm: 220 },
                        overflow: 'hidden',
                        backgroundColor: isDarkTheme ? '#262626' : '#F8FAFB'
                    }}>
                        {!imageLoaded && (
                            <Skeleton
                                variant="rectangular"
                                width="100%"
                                height="100%"
                                animation="wave"
                                sx={{
                                    bgcolor: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                                }}
                            />
                        )}

                        <Box
                            component="img"
                            className="service-image"
                            src={service.image_url ?
                                (service.image_url.includes('cloudinary')
                                    ? service.image_url.replace('/upload/', '/upload/w_400,h_300,c_fill,q_auto,f_auto/')
                                    : service.image_url)
                                : getPlaceholderImage(service.title)
                            }
                            alt={service.title}
                            onLoad={() => setImageLoaded(true)}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = getPlaceholderImage(service.title);
                            }}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.4s ease',
                                opacity: imageLoaded ? 1 : 0,
                                filter: isDarkTheme ? 'brightness(0.9)' : 'brightness(1)'
                            }}
                        />

                        {/* Badge de categoría minimalista */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 16,
                                left: 16,
                                px: 1.5,
                                py: 0.5,
                                borderRadius: '8px',
                                backgroundColor: isDarkTheme
                                    ? 'rgba(255,255,255,0.9)'
                                    : 'rgba(255,255,255,0.95)',
                                backdropFilter: 'blur(8px)',
                                border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 600,
                                    color: isDarkTheme ? '#1A1A1A' : '#374151',
                                    fontSize: '0.75rem',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                {service.category || 'General'}
                            </Typography>
                        </Box>

                        {/* Indicador de tratamiento discreto */}
                        {service.tratamiento === 1 && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: '#10B981',
                                    border: '2px solid white',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            />
                        )}
                    </Box>

                    {/* Contenido principal */}
                    <Box sx={{
                        flexGrow: 1,
                        p: { xs: 2.5, sm: 3 },
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Header con título y precio */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 1.5
                        }}>
                            <Typography
                                variant="h6"
                                component="h3"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: '1.1rem', sm: '1.2rem' },
                                    lineHeight: 1.3,
                                    color: theme.palette.text.primary,
                                    flex: 1,
                                    mr: 2,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}
                            >
                                {service.title}
                            </Typography>

                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                                    color: theme.palette.text.primary,
                                    flexShrink: 0
                                }}
                            >
                                {formattedPrice}
                            </Typography>
                        </Box>

                        {/* Descripción */}
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                lineHeight: 1.5,
                                mb: 2,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}
                        >
                            {service.description && service.description.includes('.')
                                ? service.description.split('.')[0] + '.'
                                : service.description}
                        </Typography>

                        {/* Información de duración minimalista */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mb: 3,
                            p: 1.5,
                            backgroundColor: isDarkTheme
                                ? 'rgba(255,255,255,0.02)'
                                : 'rgba(0,0,0,0.02)',
                            borderRadius: '12px',
                            border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <AccessTime sx={{
                                    fontSize: 16,
                                    color: theme.palette.text.secondary
                                }} />
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontSize: '0.875rem', fontWeight: 500 }}
                                >
                                    {service.duration || 'Duración variable'}
                                </Typography>
                            </Box>

                            {service.citasEstimadas && (
                                <>
                                    <Divider orientation="vertical" flexItem sx={{ height: 16 }} />
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ fontSize: '0.875rem' }}
                                    >
                                        {service.citasEstimadas} cita{service.citasEstimadas > 1 ? 's' : ''}
                                    </Typography>
                                </>
                            )}
                        </Box>

                        {/* Botones minimalistas */}
                        <Box sx={{
                            display: 'flex',
                            gap: 1.5,
                            mt: 'auto'
                        }}>
                            <Button
                                variant="text"
                                startIcon={<InfoIcon sx={{ fontSize: 18 }} />}
                                onClick={handleOpenDialog}
                                sx={{
                                    flex: 1,
                                    borderRadius: '12px',
                                    py: 1.25,
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    color: theme.palette.text.secondary,
                                    backgroundColor: 'transparent',
                                    border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                                    '&:hover': {
                                        backgroundColor: isDarkTheme
                                            ? 'rgba(255,255,255,0.04)'
                                            : 'rgba(0,0,0,0.04)',
                                        borderColor: isDarkTheme
                                            ? 'rgba(255,255,255,0.2)'
                                            : 'rgba(0,0,0,0.12)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Detalles
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={<CalendarMonthIcon sx={{ fontSize: 18 }} />}
                                onClick={() => handleAgendarCita(service)}
                                sx={{
                                    flex: 1,
                                    borderRadius: '12px',
                                    py: 1.25,
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    backgroundColor: theme.palette.text.primary,
                                    color: theme.palette.background.paper,
                                    boxShadow: 'none',
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.text.primary, 0.9),
                                        boxShadow: `0 4px 16px ${alpha(theme.palette.text.primary, 0.2)}`,
                                        transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Agendar
                            </Button>
                        </Box>
                    </Box>

                    {/* Diálogo de detalles */}
                    <ServicioDetalleDialog
                        open={dialogOpen}
                        onClose={handleCloseDialog}
                        servicioId={service.id}
                        onAgendarCita={(service) => handleAgendarCita(service)}
                    />
                </Paper>
            </Fade>
        );
    };

    // ALTERNATIVA: Diseño tipo lista horizontal (opcional)
    const ServiceListItem = ({ service, index, handleAgendarCita, isDarkTheme }) => {
        const theme = useTheme();
        const [dialogOpen, setDialogOpen] = useState(false);
        const [isHovered, setIsHovered] = useState(false);
        const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

        const formattedPrice = new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(parseFloat(service.price || 0));

        if (isMobile) {
            // En móvil usar el diseño de card
            return <ServiceCard service={service} index={index} handleAgendarCita={handleAgendarCita} isDarkTheme={isDarkTheme} />;
        }

        return (
            <Fade in timeout={200 + index * 50}>
                <Paper
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    elevation={0}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 0,
                        borderRadius: '16px',
                        backgroundColor: isDarkTheme ? '#1A1A1A' : '#FFFFFF',
                        border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
                        transition: 'all 0.3s ease',
                        transform: isHovered ? 'translateX(8px)' : 'translateX(0)',
                        boxShadow: isHovered
                            ? isDarkTheme ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)'
                            : 'none',
                        overflow: 'hidden',
                        minHeight: 120,
                        mb: 2
                    }}
                >
                    {/* Imagen lateral */}
                    <Box sx={{
                        width: 120,
                        height: 120,
                        position: 'relative',
                        overflow: 'hidden',
                        flexShrink: 0,
                        backgroundColor: isDarkTheme ? '#262626' : '#F8FAFB'
                    }}>
                        <Box
                            component="img"
                            src={service.image_url || getPlaceholderImage(service.title)}
                            alt={service.title}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease',
                                transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                            }}
                        />
                    </Box>

                    {/* Contenido */}
                    <Box sx={{
                        flex: 1,
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Box sx={{ flex: 1, mr: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '1.1rem',
                                        color: theme.palette.text.primary
                                    }}
                                >
                                    {service.title}
                                </Typography>
                                <Chip
                                    label={service.category}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        fontSize: '0.7rem',
                                        height: 20,
                                        borderColor: 'transparent',
                                        backgroundColor: isDarkTheme
                                            ? 'rgba(255,255,255,0.08)'
                                            : 'rgba(0,0,0,0.04)',
                                        color: theme.palette.text.secondary
                                    }}
                                />
                            </Box>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    lineHeight: 1.4,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    mb: 1
                                }}
                            >
                                {service.description}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: '0.8rem' }}
                            >
                                {service.duration} {service.citasEstimadas && `• ${service.citasEstimadas} citas`}
                            </Typography>
                        </Box>

                        {/* Precio y acciones */}
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: 1.5
                        }}>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    color: theme.palette.text.primary
                                }}
                            >
                                {formattedPrice}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => setDialogOpen(true)}
                                    sx={{
                                        borderRadius: '8px',
                                        minWidth: 'auto',
                                        px: 2,
                                        color: theme.palette.text.secondary
                                    }}
                                >
                                    Detalles
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => handleAgendarCita(service)}
                                    sx={{
                                        borderRadius: '8px',
                                        backgroundColor: theme.palette.text.primary,
                                        color: theme.palette.background.paper,
                                        boxShadow: 'none',
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.text.primary, 0.9),
                                            boxShadow: 'none'
                                        }
                                    }}
                                >
                                    Agendar
                                </Button>
                            </Box>
                        </Box>
                    </Box>

                    <ServicioDetalleDialog
                        open={dialogOpen}
                        onClose={() => setDialogOpen(false)}
                        servicioId={service.id}
                        onAgendarCita={handleAgendarCita}
                    />
                </Paper>
            </Fade>
        );
    };
    // Componente de esqueleto de carga mejorado para el tema oscuro
    const ServicesLoadingSkeleton = () => {
        const theme = useTheme();

        // Array para crear múltiples tarjetas de esqueleto
        const skeletonCards = Array(9).fill(0);

        return (
            <Box sx={{ py: 2 }}>
                <Grid container spacing={3}>
                    {skeletonCards.map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    bgcolor: theme.palette.background.paper,
                                    boxShadow: theme.shadows[1],
                                    position: 'relative'
                                }}
                            >
                                {/* Imagen de esqueleto */}
                                <Skeleton
                                    variant="rectangular"
                                    height={200}
                                    animation="wave"
                                    sx={{
                                        bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
                                    }}
                                />

                                {/* Contenido de esqueleto */}
                                <CardContent sx={{
                                    flexGrow: 1,
                                    p: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    {/* Título y descripción */}
                                    <Box>
                                        <Skeleton
                                            variant="text"
                                            height={28}
                                            width="80%"
                                            animation="wave"
                                            sx={{
                                                mb: 1,
                                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'
                                            }}
                                        />
                                        <Skeleton
                                            variant="text"
                                            animation="wave"
                                            sx={{
                                                mb: 0.5,
                                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'
                                            }}
                                        />
                                        <Skeleton
                                            variant="text"
                                            width="90%"
                                            animation="wave"
                                            sx={{
                                                mb: 0.5,
                                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'
                                            }}
                                        />
                                        <Skeleton
                                            variant="text"
                                            width="70%"
                                            animation="wave"
                                            sx={{
                                                mb: 2,
                                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'
                                            }}
                                        />
                                    </Box>

                                    {/* Botones de esqueleto */}
                                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                        <Skeleton
                                            variant="rectangular"
                                            height={40}
                                            width="50%"
                                            animation="wave"
                                            sx={{
                                                borderRadius: 25,
                                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'
                                            }}
                                        />
                                        <Skeleton
                                            variant="rectangular"
                                            height={40}
                                            width="50%"
                                            animation="wave"
                                            sx={{
                                                borderRadius: 25,
                                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'
                                            }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{
                minHeight: '100vh',
                background: isDarkTheme
                    ? 'linear-gradient(135deg, #121212 0%, #1a1a1a 100%)'
                    : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                transition: 'background 0.5s ease'
            }}>
                {/* Hero Section Mejorado */}
                <Box
                    sx={{
                        pt: { xs: 6, md: 10 },
                        pb: { xs: 8, md: 12 },
                        background: isDarkTheme
                            ? 'linear-gradient(135deg, #121212 0%, #1a1a1a 100%)'
                            : `linear-gradient(135deg, #ffffff 0%, #E5F3FD 100%)`,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Elementos decorativos */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '-20%',
                            right: '-10%',
                            width: '500px',
                            height: '500px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, isDarkTheme ? 0.15 : 0.2)} 100%)`,
                            zIndex: 0
                        }}
                    />

                    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                        <Grid container spacing={4} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <Typography
                                    variant="h2"
                                    component="h1"
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: { xs: '2.5rem', md: '3.5rem' },
                                        color: theme.palette.text.primary,
                                        mb: 2,
                                        lineHeight: 1.2
                                    }}
                                >
                                    Nuestros Servicios Dentales
                                </Typography>

                                <Typography
                                    variant="h6"
                                    color="textSecondary"
                                    sx={{
                                        mb: 4,
                                        fontWeight: 400,
                                        lineHeight: 1.5
                                    }}
                                >
                                    Cuidamos de tu sonrisa con servicios de calidad, atención personalizada y tecnología apropiada para cada tratamiento.
                                </Typography>

                                {/* Botones de acción principales */}
                                <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={scrollToServices}
                                        endIcon={<ArrowForwardIcon />}
                                        sx={{
                                            py: 1.5,
                                            px: 3,
                                            background: isDarkTheme
                                                ? 'linear-gradient(90deg, #4A9FDC, #78C1F5)'
                                                : 'linear-gradient(90deg, #4984B8, #6FA9DB)',
                                            '&:hover': {
                                                opacity: 0.9,
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 6px 10px rgba(0,0,0,0.2)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Ver los Servicios
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        size="large"
                                        onClick={() => navigate('/Contact')}
                                        sx={{
                                            py: 1.5,
                                            px: 3,
                                            borderColor: isDarkTheme ? '#4A9FDC' : '#4984B8',
                                            color: isDarkTheme ? '#4A9FDC' : '#4984B8',
                                            '&:hover': {
                                                borderColor: isDarkTheme ? '#78C1F5' : '#6FA9DB',
                                                background: 'transparent',
                                                transform: 'translateY(-2px)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Contáctanos
                                    </Button>
                                </Box>

                                {/* Highlights del servicio */}
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                    {['Atención de calidad', 'Experiencia profesional', 'Precios accesibles'].map((highlight, index) => (
                                        <Chip
                                            key={index}
                                            icon={<CheckCircleIcon />}
                                            label={highlight}
                                            sx={{
                                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(3,66,124,0.05)',
                                                color: theme.palette.text.primary,
                                                py: 0.7,
                                                fontWeight: 500,
                                                '& .MuiChip-icon': {
                                                    color: isDarkTheme ? theme.palette.primary.light : theme.palette.primary.main
                                                }
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Grid>

                            {/* Servicio destacado */}
                            <Grid item xs={12} md={6}>
                                {highlightedService && (
                                    <Zoom in timeout={1000}>
                                        <Card
                                            elevation={4}
                                            sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                position: 'relative',
                                                boxShadow: isDarkTheme
                                                    ? '0 10px 30px rgba(0,0,0,0.3)'
                                                    : '0 10px 30px rgba(0,0,0,0.1)',
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                transform: {
                                                    xs: 'none',
                                                    md: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)'
                                                },
                                                '&:hover': {
                                                    transform: {
                                                        xs: 'translateY(-10px)',
                                                        md: 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(-10px)'
                                                    }
                                                },
                                                transition: 'transform 0.5s ease',
                                                backgroundColor: isDarkTheme
                                                    ? alpha('#1E1E1E', 0.95)
                                                    : theme.palette.background.paper,
                                                border: isDarkTheme ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none'
                                            }}
                                        >
                                            <Box sx={{
                                                position: 'relative',
                                                overflow: 'hidden',
                                                height: { xs: 200, md: 250 }
                                            }}>
                                                <img
                                                    src={highlightedService.image_url || getPlaceholderImage(highlightedService.title)}
                                                    alt={highlightedService.title}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            </Box>

                                            <CardContent sx={{ p: 3, flexGrow: 1 }}>
                                                <Typography
                                                    variant="overline"
                                                    color="primary"
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    {highlightedService.category}
                                                </Typography>

                                                <Typography
                                                    variant="h5"
                                                    component="h2"
                                                    sx={{
                                                        fontWeight: 700,
                                                        mb: 2,
                                                        color: theme.palette.text.primary
                                                    }}
                                                >
                                                    {highlightedService.title}
                                                </Typography>

                                                <Typography
                                                    variant="body1"
                                                    color="text.secondary"
                                                    sx={{ mb: 3 }}
                                                >
                                                    {highlightedService.description && highlightedService.description.length > 120
                                                        ? `${highlightedService.description.slice(0, 120)}...`
                                                        : highlightedService.description}
                                                </Typography>

                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        onClick={() => {
                                                            setHighlightedServiceDialogOpen(true);
                                                        }}
                                                        startIcon={<InfoIcon />}
                                                        sx={{
                                                            backgroundColor: isDarkTheme ? theme.palette.primary.dark : theme.palette.primary.main,
                                                            '&:hover': {
                                                                backgroundColor: isDarkTheme ? theme.palette.primary.main : theme.palette.primary.dark,
                                                            }
                                                        }}
                                                    >
                                                        Ver detalles
                                                    </Button>

                                                    <Button
                                                        variant="outlined"
                                                        fullWidth
                                                        onClick={() => handleAgendarCita(highlightedService)}
                                                        startIcon={<CalendarMonthIcon />}
                                                        sx={{
                                                            borderColor: isDarkTheme ? theme.palette.primary.light : theme.palette.primary.main,
                                                            color: isDarkTheme ? theme.palette.primary.light : theme.palette.primary.main,
                                                            '&:hover': {
                                                                borderColor: theme.palette.primary.main,
                                                                backgroundColor: isDarkTheme ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.05),
                                                            }
                                                        }}
                                                    >
                                                        Agendar cita
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Zoom>
                                )}

                                {/* Diálogo para el servicio destacado */}
                                {highlightedService && (
                                    <ServicioDetalleDialog
                                        open={highlightedServiceDialogOpen}
                                        onClose={() => setHighlightedServiceDialogOpen(false)}
                                        servicioId={highlightedService.id}
                                        onAgendarCita={handleAgendarCita}
                                    />
                                )}
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                {/* Sección principal de servicios */}
                <Container ref={servicosRef} maxWidth="lg" sx={{ py: 6, mt: { xs: 0, md: 0 } }}>
                    {/* Encabezado de la sección */}
                    <Box sx={{
                        textAlign: 'center',
                        mb: 5
                    }}>
                        <Divider sx={{
                            mb: 6,
                            '&::before, &::after': {
                                borderColor: isDarkTheme ? alpha(theme.palette.divider, 0.3) : alpha(theme.palette.divider, 0.5),
                            }
                        }}>
                            <Typography
                                variant="h4"
                                component="h2"
                                sx={{
                                    fontWeight: 700,
                                    color: theme.palette.text.primary,
                                    px: 2
                                }}
                            >
                                Todos nuestros servicios
                            </Typography>
                        </Divider>

                        <Typography
                            variant="subtitle1"
                            color="textSecondary"
                            sx={{ maxWidth: '700px', mx: 'auto', mb: 4 }}
                        >
                            Explora nuestra completa gama de servicios dentales diseñados para toda la familia.
                        </Typography>

                        {/* Búsqueda y filtros */}
                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            mb: 4
                        }}>
                            <Paper
                                elevation={isDarkTheme ? 3 : 0}
                                sx={{
                                    p: '2px 4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: { xs: '100%', sm: '450px' },
                                    border: `1px solid ${isDarkTheme ? alpha(theme.palette.divider, 0.2) : alpha(theme.palette.primary.main, 0.2)}`,
                                    borderRadius: '50px',
                                    bgcolor: isDarkTheme ? alpha(theme.palette.background.paper, 0.8) : theme.palette.background.paper
                                }}
                            >
                                <InputBase
                                    sx={{
                                        ml: 2,
                                        flex: 1,
                                        color: theme.palette.text.primary
                                    }}
                                    placeholder="Buscar servicios dentales..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <IconButton sx={{ p: '10px', color: theme.palette.primary.main }}>
                                    <SearchIcon />
                                </IconButton>
                            </Paper>

                            <Tooltip title="Filtrar por categoría">
                                <Button
                                    variant="outlined"
                                    onClick={handleCategoryClick}
                                    endIcon={<KeyboardArrowDownIcon />}
                                    startIcon={<FilterListIcon />}
                                    sx={{
                                        borderRadius: '50px',
                                        px: 3,
                                        borderColor: isDarkTheme ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.primary.main, 0.2),
                                        color: isDarkTheme ? theme.palette.primary.light : theme.palette.primary.main,
                                        '&:hover': {
                                            borderColor: theme.palette.primary.main,
                                            backgroundColor: isDarkTheme ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.05),
                                        }
                                    }}
                                >
                                    {selectedCategory}
                                </Button>
                            </Tooltip>

                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={() => handleCategoryClose()}
                                PaperProps={{
                                    sx: {
                                        mt: 1,
                                        maxHeight: 300,
                                        width: 200,
                                        backgroundColor: isDarkTheme ? '#1E1E1E' : theme.palette.background.paper,
                                        boxShadow: isDarkTheme ? '0 4px 20px rgba(0,0,0,0.5)' : theme.shadows[4]
                                    }
                                }}
                            >
                                {categories.map((category) => (
                                    <MenuItem
                                        key={category}
                                        onClick={() => handleCategoryClose(category)}
                                        selected={category === selectedCategory}
                                        sx={{
                                            '&.Mui-selected': {
                                                backgroundColor: isDarkTheme
                                                    ? alpha(theme.palette.primary.main, 0.2)
                                                    : alpha(theme.palette.primary.main, 0.1),
                                            },
                                            '&:hover': {
                                                backgroundColor: isDarkTheme
                                                    ? alpha(theme.palette.primary.main, 0.15)
                                                    : alpha(theme.palette.primary.main, 0.05),
                                            }
                                        }}
                                    >
                                        {category}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                    </Box>

                    {/* Renderizado condicional */}
                    {loading ? (
                        <ServicesLoadingSkeleton />
                    ) : error ? (
                        <Paper
                            elevation={isDarkTheme ? 3 : 2}
                            sx={{
                                p: 3,
                                textAlign: 'center',
                                borderLeft: '4px solid #f44336',
                                my: 4,
                                maxWidth: '600px',
                                mx: 'auto',
                                backgroundColor: isDarkTheme ? alpha('#2c2c2c', 0.7) : theme.palette.background.paper
                            }}
                        >
                            <Typography color="error" variant="h6" sx={{ mb: 1 }}>
                                Error al cargar los servicios
                            </Typography>
                            <Typography color="textSecondary">
                                {error}
                            </Typography>
                            <Button
                                variant="outlined"
                                color="primary"
                                sx={{ mt: 2 }}
                                onClick={() => window.location.reload()}
                            >
                                Intentar de nuevo
                            </Button>
                        </Paper>
                    ) : filteredServices.length === 0 ? (
                        <Box sx={{ textAlign: 'center', my: 4 }}>
                            <Typography align="center" sx={{ mb: 2 }}>
                                No se encontraron servicios que coincidan con tu búsqueda.
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('Todos');
                                }}
                            >
                                Ver todos los servicios
                            </Button>
                        </Box>
                    ) : (
                        // Reemplazamos la paginación por un grid con scroll infinito
                        <Box sx={{ mb: 6 }}>
                            <Grid container spacing={3}>
                                {filteredServices.map((service, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={service.id}>
                                        <ServiceCard
                                            service={service}
                                            index={index}
                                            handleAgendarCita={handleAgendarCita}
                                            isDarkTheme={isDarkTheme}
                                        />
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Botón para volver arriba - visible después de scroll */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                                <Button
                                    variant="contained"
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    sx={{
                                        borderRadius: '50px',
                                        px: 4,
                                        py: 1.2,
                                        background: isDarkTheme
                                            ? 'linear-gradient(90deg, #4A9FDC, #78C1F5)'
                                            : 'linear-gradient(90deg, #4984B8, #6FA9DB)',
                                        boxShadow: isDarkTheme
                                            ? '0 4px 15px rgba(74, 159, 220, 0.3)'
                                            : '0 4px 15px rgba(73, 132, 184, 0.3)',
                                        '&:hover': {
                                            background: isDarkTheme
                                                ? 'linear-gradient(90deg, #78C1F5, #4A9FDC)'
                                                : 'linear-gradient(90deg, #6FA9DB, #4984B8)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: isDarkTheme
                                                ? '0 6px 20px rgba(74, 159, 220, 0.4)'
                                                : '0 6px 20px rgba(73, 132, 184, 0.4)',
                                        }
                                    }}
                                >
                                    Volver arriba
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default Servicios;