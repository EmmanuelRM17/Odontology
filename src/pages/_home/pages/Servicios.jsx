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
    Tabs,
    Tab,
    Avatar,
    Chip,
    Badge,
    Divider,
    Zoom,
    useMediaQuery
} from '@mui/material';
import { 
    Search as SearchIcon,
    LocalHospital as LocalHospitalIcon,
    FilterList as FilterListIcon,
    CalendarMonth as CalendarMonthIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    Star as StarIcon,
    Info as InfoIcon,
    CheckCircle as CheckCircleIcon,
    WhatsApp as WhatsAppIcon,
    ArrowForward as ArrowForwardIcon,
    Phone as PhoneIcon,
    ImportContacts as ImportContactsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import ServiceImage from './Image';

// Datos para las categorías destacadas
const FEATURED_CATEGORIES = [
    { 
        name: 'Preventivos', 
        icon: CheckCircleIcon, 
        description: 'Cuidados para prevenir problemas dentales',
        color: '#4CAF50'
    },
    { 
        name: 'Estéticos', 
        icon: StarIcon, 
        description: 'Mejora la apariencia de tu sonrisa',
        color: '#2196F3' 
    },
    { 
        name: 'Restaurativos', 
        icon: LocalHospitalIcon, 
        description: 'Recupera la función y salud dental',
        color: '#FF9800' 
    },
    { 
        name: 'Especialidades', 
        icon: ImportContactsIcon, 
        description: 'Tratamientos específicos y avanzados',
        color: '#9C27B0' 
    }
];

// Testimonios de clientes
const TESTIMONIALS = [
    {
        name: "Carolina Gómez",
        testimonial: "Excelente atención y profesionalismo. Mi sonrisa luce increíble después del tratamiento.",
        service: "Blanqueamiento dental"
    },
    {
        name: "Juan Pérez",
        testimonial: "Un servicio de primera, muy contentos con los resultados. Totalmente recomendable.",
        service: "Ortodoncia"
    },
    {
        name: "María López",
        testimonial: "Muy satisfecha con el trato y la calidad del servicio. Agendé otra cita de inmediato.",
        service: "Limpieza dental"
    }
];

const Servicios = () => {
    const [services, setServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [featuredServices, setFeaturedServices] = useState([]);
    const [highlightedService, setHighlightedService] = useState(null);
    const { isDarkTheme } = useThemeContext();
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width:600px)');
    const isTablet = useMediaQuery('(max-width:960px)');
    const servicosRef = useRef(null);

    // Efecto para cargar servicios
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('https://back-end-4803.onrender.com/api/servicios/all');
                if (!response.ok) throw new Error('Error al obtener los servicios');
                const data = await response.json();
                setServices(data);
                
                // Seleccionar servicios destacados y un servicio destacado
                if (data.length > 0) {
                    const featured = data.filter(service => 
                        service.category === 'Preventivos' || 
                        service.category === 'Estéticos' ||
                        service.title.includes('limpieza') ||
                        service.title.includes('blanqueamiento')
                    ).slice(0, 6);
                    
                    setFeaturedServices(featured.length > 0 ? featured : data.slice(0, 6));
                    setHighlightedService(data[Math.floor(Math.random() * data.length)]);
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
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
            // Desplazarse a la sección de servicios
            if (servicosRef.current) {
                servicosRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
        setAnchorEl(null);
    };

    // Obtener imagen de placeholder
    const getPlaceholderImage = (title) => {
        return `https://source.unsplash.com/400x300/?dental,${title.replace(' ', ',')}`;
    };

    // Manejar agenda de cita
    const handleAgendarCita = (service) => {
        navigate('/agendar-cita', { state: { selectedService: service } });
    };

    // Desplazarse a la sección de servicios
    const scrollToServices = () => {
        if (servicosRef.current) {
            servicosRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Cambiar tab
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Seleccionar categoría destacada
    const handleFeaturedCategoryClick = (categoryName) => {
        setSelectedCategory(categoryName);
        scrollToServices();
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
                {/* Hero Section */}
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
                    {/* Elemento decorativo */}
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
                                        Ver todos los servicios
                                    </Button>
                                    
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        startIcon={<WhatsAppIcon />}
                                        sx={{
                                            py: 1.5,
                                            px: 3,
                                            borderWidth: 2,
                                            '&:hover': {
                                                borderWidth: 2,
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        Consulta por WhatsApp
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
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
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
                                            <Badge
                                                badgeContent="Destacado"
                                                color="primary"
                                                sx={{
                                                    '& .MuiBadge-badge': {
                                                        py: 1,
                                                        px: 2,
                                                        borderRadius: '20px 0 20px 0',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        textTransform: 'uppercase',
                                                        right: 0,
                                                        top: 0
                                                    }
                                                }}
                                            >
                                                <ServiceImage
                                                    imageUrl={highlightedService.image_url || getPlaceholderImage(highlightedService.title)}
                                                    title={highlightedService.title}
                                                    sx={{ height: { xs: 200, md: 250 } }}
                                                />
                                            </Badge>
                                            
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
                                                    {highlightedService.description.slice(0, 120)}...
                                                </Typography>
                                                
                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        onClick={() => navigate(`/servicios/detalle/${highlightedService.id}`)}
                                                        startIcon={<InfoIcon />}
                                                    >
                                                        Más información
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
                            </Grid>
                        </Grid>
                    </Container>
                </Box>
                
                {/* Categorías destacadas */}
                <Container maxWidth="lg" sx={{ py: 6, position: 'relative', zIndex: 2, mt: { xs: -4, md: -6 } }}>
                    <Grid container spacing={3}>
                        {FEATURED_CATEGORIES.map((category, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Paper
                                    elevation={2}
                                    onClick={() => handleFeaturedCategoryClick(category.name)}
                                    sx={{
                                        p: 3,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-10px)',
                                            boxShadow: theme.shadows[8]
                                        },
                                        borderTop: `3px solid ${category.color}`,
                                        bgcolor: theme.palette.background.paper
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            bgcolor: alpha(category.color, 0.1),
                                            color: category.color,
                                            width: 64,
                                            height: 64,
                                            mb: 2
                                        }}
                                    >
                                        <category.icon fontSize="large" />
                                    </Avatar>
                                    
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 600,
                                            mb: 1,
                                            color: theme.palette.text.primary
                                        }}
                                    >
                                        {category.name}
                                    </Typography>
                                    
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mb: 2 }}
                                    >
                                        {category.description}
                                    </Typography>
                                    
                                    <Box
                                        sx={{
                                            mt: 'auto',
                                            color: category.color,
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}
                                    >
                                        <span>Ver servicios</span>
                                        <ArrowForwardIcon fontSize="small" />
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
                
                {/* Testimonios */}
                <Box
                    sx={{
                        py: 6,
                        background: isDarkTheme
                            ? 'linear-gradient(90deg, #1C2A38 0%, #243446 100%)'
                            : 'linear-gradient(90deg, #EFF6FF 0%, #F8FAFC 100%)'
                    }}
                >
                    <Container maxWidth="lg">
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                mb: 4,
                                textAlign: 'center',
                                color: theme.palette.text.primary
                            }}
                        >
                            Lo que dicen nuestros pacientes
                        </Typography>
                        
                        <Grid container spacing={3}>
                            {TESTIMONIALS.map((testimonial, index) => (
                                <Grid item xs={12} md={4} key={index}>
                                    <Paper
                                        elevation={2}
                                        sx={{
                                            p: 3,
                                            height: '100%',
                                            borderRadius: 4,
                                            position: 'relative',
                                            '&::before': {
                                                content: '"""',
                                                position: 'absolute',
                                                top: 16,
                                                left: 16,
                                                fontSize: '4rem',
                                                lineHeight: 1,
                                                color: alpha(theme.palette.primary.main, 0.1),
                                                fontFamily: 'serif',
                                                fontWeight: 'bold',
                                                zIndex: 0
                                            }
                                        }}
                                    >
                                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    mb: 2,
                                                    fontStyle: 'italic',
                                                    fontSize: '1rem',
                                                    color: theme.palette.text.secondary
                                                }}
                                            >
                                                "{testimonial.testimonial}"
                                            </Typography>
                                            
                                            <Divider sx={{ my: 2 }} />
                                            
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography
                                                        variant="subtitle1"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: theme.palette.text.primary
                                                        }}
                                                    >
                                                        {testimonial.name}
                                                    </Typography>
                                                    
                                                    <Typography
                                                        variant="caption"
                                                        color="primary"
                                                    >
                                                        {testimonial.service}
                                                    </Typography>
                                                </Box>
                                                
                                                <Box>
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <StarIcon 
                                                            key={star} 
                                                            fontSize="small" 
                                                            sx={{ color: '#FFD700' }} 
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </Box>
                
                {/* Sección principal de servicios */}
                <Container ref={servicosRef} maxWidth="lg" sx={{ py: 6 }}>
                    {/* Encabezado de la sección */}
                    <Box sx={{
                        textAlign: 'center',
                        mb: 5
                    }}>
                        <LocalHospitalIcon sx={{
                            fontSize: 40,
                            color: theme.palette.primary.main,
                            mb: 2
                        }} />
                        
                        <Typography
                            variant="h4"
                            component="h2"
                            sx={{
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                                mb: 2
                            }}
                        >
                            Todos nuestros servicios
                        </Typography>
                        
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
                        
                        {/* Pestañas para ver diferentes vistas */}
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs 
                                value={tabValue} 
                                onChange={handleTabChange}
                                centered
                                sx={{
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        px: 3
                                    }
                                }}
                            >
                                <Tab label="Todos los servicios" />
                                <Tab label="Más solicitados" />
                                <Tab label="Recomendados" />
                            </Tabs>
                        </Box>
                    </Box>

                    {/* Grid de servicios */}
                    {loading ? (
                        <Typography align="center">Cargando servicios...</Typography>
                    ) : error ? (
                        <Typography color="error" align="center">{error}</Typography>
                    ) : filteredServices.length === 0 ? (
                        <Typography align="center" sx={{ my: 4 }}>
                            No se encontraron servicios que coincidan con tu búsqueda.
                        </Typography>
                    ) : (
                        <Grid container spacing={4}>
                            {filteredServices.map((service) => (
                                <Grid item xs={12} sm={6} md={4} key={service.id}>
                                    <Fade in timeout={500}>
                                        <Card
                                            sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                                                '&:hover': {
                                                    transform: 'translateY(-8px)',
                                                    boxShadow: theme.shadows[10],
                                                },
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                bgcolor: theme.palette.background.paper
                                            }}
                                        >
                                            <Tooltip title="Click para más información" placement="top">
                                                <Box
                                                    onClick={() => navigate(`/servicios/detalle/${service.id}`)}
                                                    sx={{ cursor: 'pointer' }}
                                                >
                                                    <ServiceImage
                                                        imageUrl={service.image_url
                                                            ? service.image_url.replace('/upload/', '/upload/w_400,h_300,c_fill,q_auto,f_auto/')
                                                            : getPlaceholderImage(service.title)
                                                        }
                                                        title={service.title}
                                                    />

                                                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                                        <Typography
                                                            variant="overline"
                                                            color="primary"
                                                            sx={{ fontWeight: 600 }}
                                                        >
                                                            {service.category || 'General'}
                                                        </Typography>
                                                        <Typography
                                                            variant="h6"
                                                            component="h2"
                                                            sx={{
                                                                fontWeight: 600,
                                                                mb: 1,
                                                                color: theme.palette.text.primary
                                                            }}
                                                        >
                                                            {service.title}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{ 
                                                                mb: 2,
                                                                display: '-webkit-box',
                                                                overflow: 'hidden',
                                                                WebkitBoxOrient: 'vertical',
                                                                WebkitLineClamp: 3,
                                                                lineHeight: 1.5
                                                            }}
                                                        >
                                                            {service.description.split('.')[0] + '.'}
                                                        </Typography>
                                                    </CardContent>
                                                </Box>
                                            </Tooltip>
                                            <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    startIcon={<CalendarMonthIcon />}
                                                    onClick={() => handleAgendarCita(service)}
                                                    sx={{
                                                        borderRadius: '50px',
                                                        py: 1.2
                                                    }}
                                                >
                                                    Agendar Cita
                                                </Button>
                                            </Box>
                                        </Card>
                                    </Fade>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Container>
                
                {/* Sección de llamada a la acción */}
                <Box
                    sx={{
                        py: 6,
                        background: isDarkTheme
                            ? 'linear-gradient(135deg, #03427C 0%, #075bb3 100%)'
                            : 'linear-gradient(135deg, #03427C 0%, #075bb3 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Elementos decorativos */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '-50%',
                            left: '-10%',
                            width: '300px',
                            height: '300px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)',
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: '-30%',
                            right: '-5%',
                            width: '250px',
                            height: '250px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)',
                        }}
                    />
                    
                    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                        <Grid container spacing={4} alignItems="center">
                            <Grid item xs={12} md={7}>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 700,
                                        mb: 2,
                                        fontSize: { xs: '2rem', md: '2.5rem' }
                                    }}
                                >
                                    ¿Necesitas más información?
                                </Typography>
                                
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 400,
                                        mb: 4,
                                        opacity: 0.9
                                    }}
                                >
                                    Nuestro equipo está listo para resolver todas tus dudas y ayudarte a elegir el tratamiento ideal para ti.
                                </Typography>
                                
                                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<PhoneIcon />}
                                        sx={{
                                            bgcolor: 'white',
                                            color: theme.palette.primary.main,
                                            px: 3,
                                            py: 1.5,
                                            '&:hover': {
                                                bgcolor: 'rgba(255,255,255,0.9)',
                                                transform: 'translateY(-3px)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Llámanos ahora
                                    </Button>
                                    
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        startIcon={<WhatsAppIcon />}
                                        sx={{
                                            color: 'white',
                                            borderColor: 'white',
                                            px: 3,
                                            py: 1.5,
                                            '&:hover': {
                                                borderColor: 'white',
                                                bgcolor: 'rgba(255,255,255,0.1)',
                                                transform: 'translateY(-3px)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Escríbenos por WhatsApp
                                    </Button>
                                </Box>
                            </Grid>
                            
                            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: '100%'
                                    }}
                                >
                                    <LocalHospitalIcon
                                        sx={{
                                            fontSize: '200px',
                                            color: 'rgba(255,255,255,0.2)'
                                        }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>
                
                {/* FAQ o información adicional */}
                <Container maxWidth="lg" sx={{ py: 6 }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    mb: 3,
                                    color: theme.palette.text.primary
                                }}
                            >
                                Preguntas frecuentes
                            </Typography>
                            
                            <Box sx={{ mb: 4 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        mb: 1,
                                        color: theme.palette.text.primary
                                    }}
                                >
                                    ¿Cómo puedo agendar una cita?
                                </Typography>
                                
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                    Puedes agendar tu cita a través de nuestra plataforma online, llamando a nuestro número de contacto o enviándonos un mensaje por WhatsApp.
                                </Typography>
                                
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        mb: 1,
                                        color: theme.palette.text.primary
                                    }}
                                >
                                    ¿Qué métodos de pago aceptan?
                                </Typography>
                                
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                    Aceptamos efectivo, tarjetas de crédito/débito y también ofrecemos opciones de financiamiento para tratamientos extensos.
                                </Typography>
                                
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        mb: 1,
                                        color: theme.palette.text.primary
                                    }}
                                >
                                    ¿Atienden urgencias dentales?
                                </Typography>
                                
                                <Typography variant="body1" color="text.secondary">
                                    Sí, contamos con servicio de urgencias dentales. Contáctanos de inmediato y te daremos prioridad en nuestra agenda.
                                </Typography>
                            </Box>
                            
                            <Button
                                variant="outlined"
                                sx={{ mt: 2 }}
                            >
                                Ver más preguntas frecuentes
                            </Button>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    mb: 3,
                                    color: theme.palette.text.primary
                                }}
                            >
                                Horario de atención
                            </Typography>
                            
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 3,
                                    borderRadius: 4,
                                    bgcolor: theme.palette.background.paper
                                }}
                            >
                                {[
                                    { day: 'Lunes a Viernes', hours: '9:00 AM - 6:00 PM' },
                                    { day: 'Sábado', hours: '9:00 AM - 2:00 PM' },
                                    { day: 'Domingo', hours: 'Cerrado' }
                                ].map((schedule, index) => (
                                    <Box key={index} sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        py: 1.5,
                                        borderBottom: index !== 2 ? `1px solid ${alpha(theme.palette.text.primary, 0.1)}` : 'none'
                                    }}>
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                fontWeight: 600, 
                                                color: theme.palette.text.primary 
                                            }}
                                        >
                                            {schedule.day}
                                        </Typography>
                                        
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                color: schedule.day === 'Domingo' 
                                                    ? '#f44336' 
                                                    : theme.palette.text.secondary
                                            }}
                                        >
                                            {schedule.hours}
                                        </Typography>
                                    </Box>
                                ))}
                            </Paper>
                            
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    mt: 4,
                                    mb: 2,
                                    color: theme.palette.text.primary
                                }}
                            >
                                Contacto
                            </Typography>
                            
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 3,
                                    borderRadius: 4,
                                    bgcolor: theme.palette.background.paper
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.main,
                                            mr: 2
                                        }}
                                    >
                                        <PhoneIcon />
                                    </Avatar>
                                    
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Teléfono
                                        </Typography>
                                        
                                        <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                            +123 456 7890
                                        </Typography>
                                    </Box>
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.main,
                                            mr: 2
                                        }}
                                    >
                                        <WhatsAppIcon />
                                    </Avatar>
                                    
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            WhatsApp
                                        </Typography>
                                        
                                        <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                            +123 456 7890
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default Servicios;