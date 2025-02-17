import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Chip,
    InputAdornment,
    ThemeProvider,
    createTheme,
    CssBaseline,
    Container,
    ButtonGroup,
    Button,
    Select,
    MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';

const Servicios = () => {
    const [services, setServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width:600px)');

    // Obtener servicios desde la API
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('https://back-end-4803.onrender.com/api/servicios/all');
                if (!response.ok) {
                    throw new Error('Error al obtener los servicios');
                }
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

    // Detectar tema oscuro/claro
    useEffect(() => {
        const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkTheme(matchDarkTheme.matches);

        const handleThemeChange = (e) => setIsDarkTheme(e.matches);
        matchDarkTheme.addEventListener('change', handleThemeChange);
        return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
    }, []);

    // Obtener categorías únicas
    const categories = ['Todos', ...new Set(services.map(service => service.category))];

    // Filtrar servicios según búsqueda y categoría
    const filteredServices = services.filter(service => {
        const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || service.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Tema y estilos
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
        shape: {
            borderRadius: 16,
        },
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 25,
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 12,
                        },
                    },
                },
            },
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    background: isDarkTheme
                        ? 'linear-gradient(135deg, #1C2A38 0%, #1C2A38 100%)'
                        : 'linear-gradient(90deg, #ffffff 0%, #E5F3FD 100%)',
                    transition: 'background 0.5s ease',
                    position: 'relative',
                    minHeight: '100vh',
                    overflow: 'hidden'
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ py: 5, px: { xs: 2, sm: 3 } }}>
                        <Typography
                            variant="h3"
                            component="h1"
                            sx={{
                                fontWeight: 700,
                                color: '#03427C',
                                fontSize: { xs: '2rem', sm: '3rem' }
                            }}
                        >
                            Nuestros Servicios
                        </Typography>

                        {/* Input de búsqueda */}
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Buscar servicios..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ my: 3 }}
                        />

                        {/* Categorías */}
                        <Box sx={{ mb: 4 }}>
                            {isMobile ? (
                                // 📌 Muestra un `Select` en pantallas pequeñas con tema dinámico
                                <Select
                                    fullWidth
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    displayEmpty
                                    sx={{
                                        borderRadius: '12px',
                                        backgroundColor: theme.palette.mode === 'dark' ? '#243446' : '#ffffff',
                                        color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: theme.palette.mode === 'dark' ? '#B8C7DC' : '#476685'
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: theme.palette.mode === 'dark' ? '#ffffff' : '#03427C'
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: theme.palette.mode === 'dark' ? '#ffffff' : '#476685'
                                        }
                                    }}
                                >
                                    {categories.map((category) => (
                                        <MenuItem
                                            key={category}
                                            value={category}
                                            sx={{
                                                backgroundColor: theme.palette.mode === 'dark' ? '#243446' : '#ffffff',
                                                color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                                                '&:hover': {
                                                    backgroundColor: theme.palette.mode === 'dark' ? '#1C2A38' : '#E5F3FD'
                                                }
                                            }}
                                        >
                                            {category}
                                        </MenuItem>
                                    ))}
                                </Select>
                            ) : (
                                // 📌 Muestra botones en pantallas grandes
                                <ButtonGroup
                                    variant="contained"
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 1,
                                        '& .MuiButton-root': {
                                            borderRadius: '25px',
                                            m: 0.5
                                        }
                                    }}
                                >
                                    {categories.map((category) => (
                                        <Button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            variant={selectedCategory === category ? "contained" : "outlined"}
                                            size="small"
                                        >
                                            {category}
                                        </Button>
                                    ))}
                                </ButtonGroup>
                            )}
                        </Box>
                        {/* Cargando / Error */}
                        {loading && <Typography>Cargando servicios...</Typography>}
                        {error && <Typography color="error">{error}</Typography>}

                        {/* Servicios */}
                        <Grid container spacing={3} sx={{ mt: 3 }}>
                            {filteredServices.map((service) => (
                                <Grid item xs={12} sm={6} md={4} key={service.id}>
                                    <Tooltip title="Presiona para más información" arrow>
                                        <Card
                                            sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'scale(1.03)',
                                                    boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
                                                },
                                                backgroundColor: isDarkTheme ? '#243446' : '#ffffff',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => navigate(`/servicios/detalle/${service.id}`)}
                                        >
                                            <CardContent>
                                                <Typography
                                                    variant="h6"
                                                    component="h2"
                                                    gutterBottom
                                                    sx={{ color: isDarkTheme ? '#ffffff' : '#03427C' }}
                                                >
                                                    {service.title}
                                                </Typography>
                                                <Chip
                                                    label={service.category}
                                                    color="primary"
                                                    size="small"
                                                    sx={{
                                                        mb: 2,
                                                        borderRadius: '12px',
                                                    }}
                                                />
                                                <Typography
                                                    variant="body2"
                                                    sx={{ color: isDarkTheme ? '#B8C7DC' : '#476685' }}
                                                >
                                                    {service.description.split('.')[0] + '.'}
                                                </Typography>

                                            </CardContent>
                                        </Card>
                                    </Tooltip>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default Servicios;
