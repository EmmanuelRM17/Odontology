import React, { useState, useEffect } from 'react';
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
    CardMedia,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useThemeContext } from '../../../components/Tools/ThemeContext'; // Asegúrate de usar la ruta correcta
import ServiceImage from './Image'

const Servicios = () => {
    const [services, setServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const { isDarkTheme } = useThemeContext();
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width:600px)');

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('https://back-end-4803.onrender.com/api/servicios/all');
                if (!response.ok) throw new Error('Error al obtener los servicios');
                const data = await response.json();
                setServices(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const theme = createTheme({
        palette: {
            mode: isDarkTheme ? 'dark' : 'light',
            primary: {
                main: '#03427C',
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
    });

    const categories = ['Todos', ...new Set(services.map(service => service.category))];

    const filteredServices = services.filter(service => {
        const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || service.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleCategoryClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCategoryClose = (category) => {
        if (category) setSelectedCategory(category);
        setAnchorEl(null);
    };

    const getPlaceholderImage = (title) => {
        return `https://source.unsplash.com/400x300/?dental,${title.replace(' ', ',')}`;
    };

    const handleAgendarCita = (service) => {
        navigate('/agendar-cita', { state: { selectedService: service } });
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
                <Container maxWidth="lg" sx={{ py: 6 }}>
                    {/* Header Section */}
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <LocalHospitalIcon sx={{
                            fontSize: 40,
                            color: theme.palette.primary.main,
                            mb: 2
                        }} />
                        <Typography
                            variant="h2"
                            component="h1"
                            sx={{
                                fontWeight: 700,
                                fontSize: { xs: '2.5rem', md: '3.5rem' },
                                color: theme.palette.text.primary,
                                mb: 2
                            }}
                        >
                            Servicios Dentales
                        </Typography>
                        <Typography
                            variant="h6"
                            color="textSecondary"
                            sx={{ maxWidth: '600px', mx: 'auto', mb: 4 }}
                        >
                            Descubra nuestra amplia gama de servicios dentales
                        </Typography>

                        {/* Search and Filter Section */}
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

                    {/* Services Grid */}
                    {loading ? (
                        <Typography align="center">Cargando servicios...</Typography>
                    ) : error ? (
                        <Typography color="error" align="center">{error}</Typography>
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
                                                            {service.category}
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
                                                            sx={{ mb: 2 }}
                                                        >
                                                            {service.description.split('.')[0] + '.'}
                                                        </Typography>
                                                    </CardContent>
                                                </Box>
                                            </Tooltip>
                                            <Box sx={{ p: 2, pt: 0 }}>
                                                <Tooltip title="Agendar cita">
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        startIcon={<CalendarMonthIcon />}
                                                        onClick={() => handleAgendarCita(service)}
                                                        sx={{
                                                            borderRadius: '50px',
                                                            textTransform: 'none'
                                                        }}
                                                    >
                                                        Agendar Cita
                                                    </Button>
                                                </Tooltip>
                                            </Box>
                                        </Card>
                                    </Fade>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default Servicios;