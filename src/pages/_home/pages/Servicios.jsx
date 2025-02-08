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
    Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';


const services = [
    {
        id: 1,
        title: 'Consulta Dental General',
        description: 'Revisión completa de dientes y encías para detectar problemas y prevenir enfermedades. Incluye asesoría en higiene dental.',
        category: 'Preventivo'
    },
    {
        id: 2,
        title: 'Limpieza Dental por Ultrasonido',
        description: 'Elimina placa y sarro sin molestias, dejando tus dientes más limpios, frescos y protegidos contra caries y gingivitis.',
        category: 'Higiene'
    },
    {
        id: 3,
        title: 'Curetaje (Limpieza Profunda)',
        description: 'Limpieza especializada para tratar encías inflamadas y evitar enfermedades periodontales avanzadas.',
        category: 'Higiene'
    },
    {
        id: 4,
        title: 'Asesoría sobre Diseño de Sonrisa',
        description: 'Evaluamos la forma, alineación y color de tus dientes para mejorar tu sonrisa y aumentar tu confianza.',
        category: 'Estética'
    },
    {
        id: 5,
        title: 'Cirugía Estética de Encía',
        description: 'Corrige encías desiguales o muy grandes para lograr una sonrisa armónica y estética.',
        category: 'Cirugía'
    },
    {
        id: 6,
        title: 'Obturación con Resina',
        description: 'Repara caries con resina del color del diente, restaurando su función y estética de forma discreta.',
        category: 'Restauración'
    },
    {
        id: 7,
        title: 'Incrustación Estética y de Metal',
        description: 'Solución resistente y estética para reparar dientes dañados sin necesidad de una corona completa.',
        category: 'Restauración'
    },
    {
        id: 8,
        title: 'Coronas Fijas Estéticas o de Metal',
        description: 'Protege y restaura dientes debilitados con coronas duraderas y de aspecto natural.',
        category: 'Restauración'
    },
    {
        id: 9,
        title: 'Placas Removibles Parciales',
        description: 'Reemplazo cómodo y accesible para dientes perdidos, mejorando la masticación y la estética.',
        category: 'Prótesis'
    },
    {
        id: 10,
        title: 'Placas Totales Removibles',
        description: 'Prótesis completas para recuperar la sonrisa y la función masticatoria en pacientes sin dientes.',
        category: 'Prótesis'
    },
    {
        id: 11,
        title: 'Guardas Dentales',
        description: 'Protege tus dientes contra el desgaste por bruxismo y reduce el dolor en la mandíbula.',
        category: 'Preventivo'
    },
    {
        id: 12,
        title: 'Placas Hawley',
        description: 'Retenedor removible para mantener los dientes alineados después de un tratamiento de ortodoncia.',
        category: 'Ortodoncia'
    },
    {
        id: 13,
        title: 'Extracción Dental',
        description: 'Removemos dientes dañados o infectados de manera segura y sin dolor con anestesia local.',
        category: 'Cirugía'
    },
    {
        id: 14,
        title: 'Ortodoncia y Ortopedia Maxilar',
        description: 'Alineamos tus dientes y mejoramos tu mordida con brackets o alineadores transparentes.',
        category: 'Ortodoncia'
    }
];


const Servicios = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const navigate = useNavigate();

    // Theme detection
    useEffect(() => {
        const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkTheme(matchDarkTheme.matches);

        const handleThemeChange = (e) => setIsDarkTheme(e.matches);
        matchDarkTheme.addEventListener('change', handleThemeChange);
        return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
    }, []);

    const categories = ['Todos', ...new Set(services.map(service => service.category))];

    const filteredServices = services.filter(service => {
        const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || service.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

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
                    <Box sx={{
                        py: 5,
                        px: { xs: 2, sm: 3 },
                    }}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 4
                        }}>
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
                        </Box>

                        <Box sx={{ mb: 4 }}>
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
                                sx={{ mb: 3 }}
                            />

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
                        </Box>

                        <Grid container spacing={3}>
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
                                                    {service.description}
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