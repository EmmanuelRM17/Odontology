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
    Skeleton, // Añadido para el esqueleto de carga
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
    ChevronRight as ChevronRightIcon,
    ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import ServicioDetalleDialog from './ServiciosDetalle';

const Servicios = () => {
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
                    // Elegir un servicio destacado que tenga buena imagen
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

    // Tema personalizado
    const theme = createTheme({
        palette: {
            mode: isDarkTheme ? 'dark' : 'light',
            primary: {
                main: '#03427C',
            },
            secondary: {
                main: '#4CAF50',
            },
            background: {
                default: isDarkTheme ? '#1C2A38' : '#ffffff',
                paper: isDarkTheme ? '#243446' : '#ffffff',
            },
            text: {
                primary: isDarkTheme ? '#ffffff' : '#03427C',
                secondary: isDarkTheme ? '#B8C7DC' : '#476685',
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
                servicioSeleccionado: service  // Use consistent property name
            }
        });
    };

    // Desplazarse a la sección de servicios
    const scrollToServices = () => {
        if (servicosRef.current) {
            servicosRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const ServicesGrid = ({ filteredServices }) => {
        const [currentIndex, setCurrentIndex] = useState(0);
        const [isAnimating, setIsAnimating] = useState(false);
        const { isDarkTheme } = useThemeContext();
        const navigate = useNavigate();
        const theme = useTheme();

        // Determinar el número de tarjetas por página (ahora usamos un grid de 6 tarjetas)
        const cardsPerPage = 6;

        // Calcular el número de páginas
        const totalPages = Math.ceil(filteredServices.length / cardsPerPage);

        // Obtener los servicios actuales a mostrar
        const getCurrentServices = () => {
            const startIndex = currentIndex * cardsPerPage;
            return filteredServices.slice(startIndex, startIndex + cardsPerPage);
        };

        // Navegar a la página anterior
        const goToPrevious = () => {
            if (currentIndex > 0 && !isAnimating) {
                setIsAnimating(true);
                setCurrentIndex(currentIndex - 1);

                setTimeout(() => {
                    setIsAnimating(false);
                }, 400);
            }
        };

        // Navegar a la página siguiente
        const goToNext = () => {
            if (currentIndex < totalPages - 1 && !isAnimating) {
                setIsAnimating(true);
                setCurrentIndex(currentIndex + 1);

                setTimeout(() => {
                    setIsAnimating(false);
                }, 400);
            }
        };

        // Manejar agenda de cita
        const handleAgendarCita = (service) => {
            navigate('/agendar-cita', { state: { servicioSeleccionado: service } });
        };

        return (
            <Box
                sx={{
                    position: 'relative',
                    mt: 4,
                    mb: 2,
                    px: { xs: 1, md: 6 } // Dar espacio en los lados para los botones
                }}
            >
                {/* Botón Anterior - Ahora en el lado izquierdo */}
                {totalPages > 1 && (
                    <IconButton
                        onClick={goToPrevious}
                        disabled={isAnimating || currentIndex === 0}
                        aria-label="anterior página"
                        sx={{
                            position: 'absolute',
                            left: { xs: -5, sm: -15, md: -25 },
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 10,
                            bgcolor: theme.palette.background.paper,
                            boxShadow: 3,
                            '&:hover': {
                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(3,66,124,0.08)'
                            },
                            width: { xs: 40, md: 48 },
                            height: { xs: 40, md: 48 },
                            color: theme.palette.primary.main,
                            opacity: currentIndex === 0 ? 0.5 : 1,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <ChevronLeftIcon fontSize="medium" />
                    </IconButton>
                )}

                {/* Contenedor principal del grid */}
                <Box
                    sx={{
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Fade in={!isAnimating} timeout={300}>
                        <Grid
                            container
                            spacing={3}
                        >
                            {getCurrentServices().map((service, index) => (
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
                    </Fade>
                </Box>

                {/* Botón Siguiente - Ahora en el lado derecho */}
                {totalPages > 1 && (
                    <IconButton
                        onClick={goToNext}
                        disabled={isAnimating || currentIndex === totalPages - 1}
                        aria-label="siguiente página"
                        sx={{
                            position: 'absolute',
                            right: { xs: -5, sm: -15, md: -25 },
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 10,
                            bgcolor: theme.palette.background.paper,
                            boxShadow: 3,
                            '&:hover': {
                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(3,66,124,0.08)'
                            },
                            width: { xs: 40, md: 48 },
                            height: { xs: 40, md: 48 },
                            color: theme.palette.primary.main,
                            opacity: currentIndex === totalPages - 1 ? 0.5 : 1,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <ChevronRightIcon fontSize="medium" />
                    </IconButton>
                )}

                {/* Indicadores de página en la parte inferior */}
                {totalPages > 1 && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mt: 3,
                            gap: 1
                        }}
                    >
                        {[...Array(totalPages)].map((_, index) => (
                            <Box
                                key={index}
                                onClick={() => {
                                    if (!isAnimating && index !== currentIndex) {
                                        setIsAnimating(true);
                                        setCurrentIndex(index);
                                        setTimeout(() => setIsAnimating(false), 400);
                                    }
                                }}
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    bgcolor: currentIndex === index
                                        ? 'primary.main'
                                        : isDarkTheme ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: currentIndex !== index ? 'scale(1.2)' : 'none',
                                        bgcolor: currentIndex !== index
                                            ? (isDarkTheme ? 'rgba(255,255,255,0.5)' : 'rgba(3,66,124,0.4)')
                                            : 'primary.main'
                                    }
                                }}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        );
    };

    const ServiceCard = ({ service, index, handleAgendarCita, isDarkTheme }) => {
        const theme = useTheme();
        const [dialogOpen, setDialogOpen] = useState(false);

        const handleOpenDialog = () => {
            setDialogOpen(true);
        };

        const handleCloseDialog = () => {
            setDialogOpen(false);
        };

        return (
            <Fade in timeout={500 + index * 100}>
                <Card
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: theme.shadows[8],
                        },
                        borderRadius: '16px',
                        overflow: 'hidden',
                        bgcolor: theme.palette.background.paper,
                        position: 'relative',
                        boxShadow: theme.shadows[2]
                    }}
                >
                    <Box sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        height: 200,  // Altura fija para uniformidad
                        borderBottom: `3px solid ${service.category === 'Preventivos' ? '#4CAF50' :
                            service.category === 'Estéticos' ? '#2196F3' :
                                service.category === 'Restaurativos' ? '#FF9800' :
                                    '#03427C'
                            }`
                    }}>
                        <img
                            src={service.image_url
                                ? service.image_url.includes('cloudinary')
                                    ? service.image_url.replace('/upload/', '/upload/w_400,h_300,c_fill,q_auto,f_auto/')
                                    : service.image_url
                                : getPlaceholderImage(service.title)
                            }
                            alt={service.title}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = getPlaceholderImage(service.title);
                            }}
                            style={{
                                height: '100%',
                                width: '100%',
                                objectFit: 'cover',
                                display: 'block',
                                transition: 'transform 0.5s ease'
                            }}
                        />

                        {/* Overlay con categoría */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 10,
                                left: 10,
                                bgcolor: 'rgba(255,255,255,0.9)',
                                color: theme.palette.text.primary,
                                py: 0.5,
                                px: 1.5,
                                borderRadius: '30px',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            {service.category || 'General'}
                        </Box>

                        {/* Gradiente para mejor legibilidad */}
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '30%',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))',
                            }}
                        />
                    </Box>

                    <CardContent sx={{
                        flexGrow: 1,
                        p: 3,
                        height: { xs: 'auto', sm: 150 },  // Altura similar para contenido
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <Box>
                            <Typography
                                variant="h6"
                                component="h2"
                                sx={{
                                    fontWeight: 600,
                                    mb: 1,
                                    color: theme.palette.text.primary,
                                    fontSize: '1.1rem',
                                    lineHeight: 1.3,
                                    height: '2.8rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                }}
                            >
                                {service.title}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mb: 2,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    lineHeight: 1.5,
                                    minHeight: '4.5rem'  // Espacio fijo para 3 líneas
                                }}
                            >
                                {service.description && service.description.includes('.')
                                    ? service.description.split('.')[0] + '.'
                                    : service.description}
                            </Typography>
                        </Box>
                    </CardContent>

                    <Box sx={{ p: 2, pt: 0, mt: 'auto', display: 'flex', gap: 1 }}>
                        {/* Botón para ver detalles - NUEVO */}
                        <Button
                            variant="outlined"
                            startIcon={<InfoIcon />}
                            onClick={handleOpenDialog}
                            sx={{
                                flex: 1,
                                borderRadius: '50px',
                                py: 1.2,
                                borderColor: theme.palette.primary.main,
                                color: theme.palette.primary.main,
                                '&:hover': {
                                    borderColor: theme.palette.primary.dark,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                }
                            }}
                        >
                            Detalles
                        </Button>

                        {/* Botón de agendar cita */}
                        <Button
                            variant="contained"
                            startIcon={<CalendarMonthIcon />}
                            onClick={() => handleAgendarCita(service)}
                            sx={{
                                flex: 1,
                                borderRadius: '50px',
                                py: 1.2,
                                background: service.category === 'Preventivos' ? '#4CAF50' :
                                    service.category === 'Estéticos' ? '#2196F3' :
                                        service.category === 'Restaurativos' ? '#FF9800' :
                                            theme.palette.primary.main,
                                '&:hover': {
                                    background: service.category === 'Preventivos' ? '#3d8b40' :
                                        service.category === 'Estéticos' ? '#1976d2' :
                                            service.category === 'Restaurativos' ? '#e68900' :
                                                theme.palette.primary.dark,
                                }
                            }}
                        >
                            Agendar
                        </Button>
                    </Box>

                    <ServicioDetalleDialog
                        open={dialogOpen}
                        onClose={handleCloseDialog}
                        servicioId={service.id}
                        onAgendarCita={(service) => handleAgendarCita(service)}
                    />
                </Card>
            </Fade>
        );
    };

    // Componente de esqueleto de carga para mostrar mientras los servicios se están cargando
    const ServicesLoadingSkeleton = () => {
        const { isDarkTheme } = useThemeContext();
        const theme = useTheme();

        // Array para crear múltiples tarjetas de esqueleto
        const skeletonCards = Array(6).fill(0);

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
                                    position: 'relative',
                                    transition: 'transform 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: theme.shadows[3],
                                    }
                                }}
                            >
                                {/* Imagen de esqueleto */}
                                <Box sx={{
                                    height: 200,
                                    bgcolor: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                            animation: 'shimmer 1.5s infinite',
                                            '@keyframes shimmer': {
                                                '0%': { transform: 'translateX(-100%)' },
                                                '100%': { transform: 'translateX(100%)' }
                                            }
                                        }}
                                    />

                                    {/* Simulador de categoría */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 10,
                                            left: 10,
                                            width: 80,
                                            height: 24,
                                            borderRadius: 30,
                                            bgcolor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                                        }}
                                    />
                                </Box>

                                {/* Contenido de esqueleto */}
                                <CardContent sx={{
                                    flexGrow: 1,
                                    p: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    height: { xs: 'auto', sm: 220 }
                                }}>
                                    {/* Título de esqueleto */}
                                    <Box>
                                        <Box
                                            sx={{
                                                height: 24,
                                                width: '80%',
                                                mb: 1,
                                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                                borderRadius: 1
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                height: 16,
                                                width: '100%',
                                                mb: 0.5,
                                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                                                borderRadius: 0.5
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                height: 16,
                                                width: '90%',
                                                mb: 0.5,
                                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                                                borderRadius: 0.5
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                height: 16,
                                                width: '70%',
                                                mb: 2,
                                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                                                borderRadius: 0.5
                                            }}
                                        />
                                    </Box>

                                    {/* Botones de esqueleto */}
                                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                        <Box
                                            sx={{
                                                height: 40,
                                                flex: 1,
                                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                                                borderRadius: 25
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                height: 40,
                                                flex: 1,
                                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(3,66,124,0.1)',
                                                borderRadius: 25
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
                    ? 'linear-gradient(135deg, #1C2A38 0%, #243446 100%)'
                    : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                transition: 'background 0.5s ease'
            }}>
                {/* Hero Section Mejorado */}
                <Box
                    sx={{
                        pt: { xs: 6, md: 10 },
                        pb: { xs: 8, md: 12 },
                        background: isDarkTheme
                            ? 'linear-gradient(135deg, #1C2A38 0%, #243446 100%)'
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
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
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
                                                transform: 'translateY(-2px)'
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
                                                    color: theme.palette.primary.main
                                                }
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Grid>
                            {/* Servicio destacado mejorado */}
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
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
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
                                                transition: 'transform 0.5s ease'
                                            }}
                                        >
                                            {/* El resto del código del Card se mantiene igual */}

                                            {/* Modificar sólo esta parte de los botones */}
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

                                                {/* Aquí está el cambio: ahora podemos usar ServicioDetalleDialog */}
                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        onClick={() => {
                                                            // En lugar de navegar, ahora abrimos el diálogo
                                                            setHighlightedServiceDialogOpen(true);
                                                        }}
                                                        startIcon={<InfoIcon />}
                                                    >
                                                        Ver detalles
                                                    </Button>

                                                    <Button
                                                        variant="outlined"
                                                        fullWidth
                                                        onClick={() => handleAgendarCita(highlightedService)}
                                                        startIcon={<CalendarMonthIcon />}
                                                    >
                                                        Agendar cita
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Zoom>
                                )}

                                {/* Añadir el diálogo para el servicio destacado */}
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
                        <Divider sx={{ mb: 6 }}>
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
                                elevation={0}
                                sx={{
                                    p: '2px 4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: { xs: '100%', sm: '450px' },
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                    borderRadius: '50px',
                                    bgcolor: theme.palette.background.paper
                                }}
                            >
                                <InputBase
                                    sx={{ ml: 2, flex: 1 }}
                                    placeholder="Buscar servicios dentales..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <IconButton sx={{ p: '10px' }}>
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
                                        borderColor: alpha(theme.palette.primary.main, 0.2),
                                        '&:hover': {
                                            borderColor: theme.palette.primary.main
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
                                        backgroundColor: theme.palette.background.paper
                                    }
                                }}
                            >
                                {categories.map((category) => (
                                    <MenuItem
                                        key={category}
                                        onClick={() => handleCategoryClose(category)}
                                        selected={category === selectedCategory}
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
                            elevation={2}
                            sx={{
                                p: 3,
                                textAlign: 'center',
                                borderLeft: '4px solid #f44336',
                                my: 4,
                                maxWidth: '600px',
                                mx: 'auto'
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
                        <Box sx={{ position: 'relative', mb: 6 }}>
                            {/* Reemplazo del carrusel por el grid con navegación lateral */}
                            <ServicesGrid filteredServices={filteredServices} />
                        </Box>
                    )}
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default Servicios;