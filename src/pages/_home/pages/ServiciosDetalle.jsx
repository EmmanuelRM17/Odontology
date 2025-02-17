import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Container,
    Grid,
    Chip,
    Fade,
    useTheme,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CircularProgress
} from '@mui/material';
import { useParams } from 'react-router-dom';
import {
    Timer,
    AttachMoney,
    CheckCircleOutline,
    Warning,
    Info,
    Schedule,
    LocalHospital,
    Star,
    Assignment
} from '@mui/icons-material';

const ServicioDetalle = () => {
    const { servicioId } = useParams();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        const fetchService = async () => {
            try {
                const response = await fetch(`https://back-end-4803.onrender.com/api/servicios/get/${servicioId}`);
                if (!response.ok) {
                    throw new Error('No se pudo obtener la información del servicio.');
                }
                const data = await response.json();
                setService(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchService();
        setTimeout(() => setIsVisible(true), 300); // Mantener la animación

        // 📌 Detectar el modo oscuro según el sistema
        const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkTheme(matchDarkTheme.matches);
        
        const handleThemeChange = (e) => setIsDarkTheme(e.matches);
        matchDarkTheme.addEventListener('change', handleThemeChange);

        return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
    }, [servicioId]);

    // 🎨 Configurar colores según tema oscuro/claro
    const colors = {
        background: isDarkTheme ? '#0D1B2A' : '#ffffff',
        primary: isDarkTheme ? '#00BCD4' : '#03427C',
        text: isDarkTheme ? '#ffffff' : '#1a1a1a',
        secondary: isDarkTheme ? '#A0AEC0' : '#666666',
        cardBg: isDarkTheme ? '#1A2735' : '#ffffff',
    };

    // 📌 Mostrar animación de carga mientras se obtiene la información
    if (loading) {
        return (
            <Box sx={{ textAlign: 'center', py: 5, backgroundColor: colors.background, minHeight: '100vh' }}>
                <CircularProgress color="primary" />
                <Typography sx={{ mt: 2, color: colors.text }}>Cargando servicio...</Typography>
            </Box>
        );
    }

    // 📌 Mostrar error si no se pudo obtener el servicio
    if (error) {
        return (
            <Box sx={{ textAlign: 'center', py: 5, backgroundColor: colors.background, minHeight: '100vh' }}>
                <Typography variant="h4" color="error">
                    Error: {error}
                </Typography>
            </Box>
        );
    }

    // 📌 Si el servicio no existe, mostrar mensaje de error
    if (!service) {
        return (
            <Box sx={{ textAlign: 'center', py: 5, backgroundColor: colors.background, minHeight: '100vh' }}>
                <Typography variant="h4" color="error">
                    Servicio no encontrado
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            backgroundColor: colors.background,
            minHeight: '100vh',
            py: 5,
            transition: 'background-color 0.3s ease'
        }}>
            <Container maxWidth="lg">
                <Fade in={isVisible} timeout={1000}>
                    <Grid container spacing={4}>
                        {/* 📌 Cabecera del servicio */}
                        <Grid item xs={12}>
                            <Card
                                elevation={3}
                                sx={{
                                    backgroundColor: colors.cardBg,
                                    transition: 'all 0.3s ease',
                                    '&:hover': { transform: 'translateY(-5px)' }
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="h3" sx={{ color: colors.primary, fontWeight: 700, mb: 2 }}>
                                        {service.title}
                                    </Typography>
                                    <Typography variant="h6" sx={{ color: colors.secondary, mb: 3, maxWidth: '800px', mx: 'auto' }}>
                                        {service.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                                        <Chip icon={<Timer />} label={service.duration} sx={{ backgroundColor: colors.primary, color: '#fff' }} />
                                        <Chip icon={<AttachMoney />} label={service.price} variant="outlined" sx={{ color: colors.text, borderColor: colors.primary }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        {/* 📌 Beneficios */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ backgroundColor: colors.cardBg }}>
                                <CardContent>
                                    <Typography variant="h5" sx={{ color: colors.primary, mb: 3 }}>
                                        <Star /> Beneficios
                                    </Typography>
                                    <List>
                                        {service.benefits.map((benefit, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon><CheckCircleOutline sx={{ color: colors.primary }} /></ListItemIcon>
                                                <ListItemText primary={benefit} sx={{ color: colors.text }} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* 📌 Qué incluye */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ backgroundColor: colors.cardBg }}>
                                <CardContent>
                                    <Typography variant="h5" sx={{ color: colors.primary, mb: 3 }}>
                                        <Assignment /> Qué incluye
                                    </Typography>
                                    <List>
                                        {service.includes.map((item, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon><Info sx={{ color: colors.primary }} /></ListItemIcon>
                                                <ListItemText primary={item} sx={{ color: colors.text }} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* 📌 Preparación */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ backgroundColor: colors.cardBg }}>
                                <CardContent>
                                    <Typography variant="h5" sx={{ color: colors.primary, mb: 3 }}>
                                        <Schedule /> Preparación
                                    </Typography>
                                    <List>
                                        {service.preparation.map((prep, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon><Warning sx={{ color: colors.primary }} /></ListItemIcon>
                                                <ListItemText primary={prep} sx={{ color: colors.text }} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* 📌 Cuidados posteriores */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ backgroundColor: colors.cardBg }}>
                                <CardContent>
                                    <Typography variant="h5" sx={{ color: colors.primary, mb: 3 }}>
                                        <LocalHospital /> Cuidados posteriores
                                    </Typography>
                                    <List>
                                        {service.aftercare.map((care, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon><CheckCircleOutline sx={{ color: colors.primary }} /></ListItemIcon>
                                                <ListItemText primary={care} sx={{ color: colors.text }} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* 📌 Botón de acción */}
                        <Grid item xs={12}>
                            <Box sx={{ textAlign: 'center', mt: 3 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        backgroundColor: colors.primary,
                                        '&:hover': {
                                            backgroundColor: colors.primary,
                                            opacity: 0.9
                                        },
                                        py: 1.5,
                                        px: 4,
                                        borderRadius: 2
                                    }}
                                >
                                    Agendar Cita
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Fade>
            </Container>
        </Box>
    );
};

export default ServicioDetalle;
