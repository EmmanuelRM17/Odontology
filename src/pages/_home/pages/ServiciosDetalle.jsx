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
    CircularProgress,
    Tooltip,
    IconButton,
    Slide,
    Zoom,
    CardMedia
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
    Assignment,
    CalendarMonth,
    HelpOutline
} from '@mui/icons-material';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
const ServicioDetalle = () => {
    const { servicioId } = useParams();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const { isDarkTheme } = useThemeContext();
    const theme = useTheme();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    
    useEffect(() => {
        const fetchService = async () => {
            try {
                const response = await fetch(`https://back-end-4803.onrender.com/api/servicios/get/${servicioId}`);
                if (!response.ok) throw new Error('No se pudo obtener la información del servicio.');
                const data = await response.json();
                setService(data);
                setTimeout(() => setIsVisible(true), 100);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
    
        fetchService();
        window.scrollTo(0, 0);
    
    }, [servicioId]);
    

    const colors = {
        background: isDarkTheme ? '#0D1B2A' : '#ffffff',
        primary: isDarkTheme ? '#00BCD4' : '#03427C',
        text: isDarkTheme ? '#ffffff' : '#1a1a1a',
        secondary: isDarkTheme ? '#A0AEC0' : '#666666',
        cardBg: isDarkTheme ? '#1A2735' : '#ffffff',
        accent: isDarkTheme ? '#4FD1C5' : '#2B6CB0',
    };

    const SectionHeader = ({ icon: Icon, title, description }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Icon sx={{ color: colors.primary, fontSize: 28, mr: 1 }} />
            <Typography variant="h5" sx={{ color: colors.primary, fontWeight: 600 }}>
                {title}
            </Typography>
            <Tooltip title={description} placement="top">
                <IconButton size="small" sx={{ ml: 1 }}>
                    <HelpOutline sx={{ color: colors.secondary, fontSize: 20 }} />
                </IconButton>
            </Tooltip>
        </Box>
    );

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '100vh',
                backgroundColor: colors.background 
            }}>
                <CircularProgress size={60} thickness={4} sx={{ color: colors.primary }} />
                <Typography sx={{ mt: 2, color: colors.text }}>Cargando servicio...</Typography>
            </Box>
        );
    }

    if (error || !service) {
        return (
            <Box sx={{ 
                textAlign: 'center', 
                py: 5, 
                backgroundColor: colors.background, 
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Typography variant="h4" color="error">
                    {error || 'Servicio no encontrado'}
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
                <Slide direction="down" in={isVisible} timeout={800}>
                    <Grid container spacing={4}>
                        {/* Header Section */}
                        <Grid item xs={12}>
                            <Card elevation={3} sx={{
                                backgroundColor: colors.cardBg,
                                transition: 'all 0.3s ease',
                                borderRadius: 3,
                                overflow: 'hidden',
                                '&:hover': { transform: 'translateY(-5px)' }
                            }}>
                                <CardMedia
                                    component="img"
                                    height="300"
                                    image={`https://source.unsplash.com/1200x300/?dental,${service.title.replace(' ', ',')}`}
                                    alt={service.title}
                                    sx={{
                                        objectFit: 'cover',
                                        objectPosition: 'center'
                                    }}
                                />
                                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                    <Fade in timeout={1200}>
                                        <Typography variant="h3" sx={{
                                            color: colors.primary,
                                            fontWeight: 700,
                                            mb: 2,
                                            fontSize: { xs: '2rem', md: '2.5rem' }
                                        }}>
                                            {service.title}
                                        </Typography>
                                    </Fade>
                                    <Fade in timeout={1400}>
                                        <Typography variant="h6" sx={{
                                            color: colors.secondary,
                                            mb: 3,
                                            maxWidth: '800px',
                                            mx: 'auto',
                                            fontSize: { xs: '1rem', md: '1.25rem' }
                                        }}>
                                            {service.description}
                                        </Typography>
                                    </Fade>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: 2,
                                        flexWrap: 'wrap'
                                    }}>
                                        <Zoom in timeout={1600}>
                                            <Tooltip title="Duración del tratamiento">
                                                <Chip
                                                    icon={<Timer />}
                                                    label={service.duration}
                                                    sx={{
                                                        backgroundColor: colors.primary,
                                                        color: '#fff',
                                                        '& .MuiChip-icon': { color: '#fff' }
                                                    }}
                                                />
                                            </Tooltip>
                                        </Zoom>
                                        <Zoom in timeout={1800}>
                                            <Tooltip title="Precio del servicio">
                                                <Chip
                                                    icon={<AttachMoney />}
                                                    label={service.price}
                                                    variant="outlined"
                                                    sx={{
                                                        color: colors.text,
                                                        borderColor: colors.primary,
                                                        '& .MuiChip-icon': { color: colors.primary }
                                                    }}
                                                />
                                            </Tooltip>
                                        </Zoom>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Info Sections */}
                        {[
                            {
                                title: 'Beneficios',
                                icon: Star,
                                description: 'Ventajas y resultados esperados del tratamiento',
                                data: service.benefits,
                                itemIcon: CheckCircleOutline,
                                delay: 200
                            },
                            {
                                title: 'Qué incluye',
                                icon: Assignment,
                                description: 'Procedimientos y servicios incluidos',
                                data: service.includes,
                                itemIcon: Info,
                                delay: 400
                            },
                            {
                                title: 'Preparación',
                                icon: Schedule,
                                description: 'Recomendaciones previas al tratamiento',
                                data: service.preparation,
                                itemIcon: Warning,
                                delay: 600
                            },
                            {
                                title: 'Cuidados posteriores',
                                icon: LocalHospital,
                                description: 'Instrucciones post-tratamiento',
                                data: service.aftercare,
                                itemIcon: CheckCircleOutline,
                                delay: 800
                            }
                        ].map((section, index) => (
                            <Grid item xs={12} md={6} key={section.title}>
                                <Fade in={isVisible} timeout={1000 + section.delay}>
                                    <Card sx={{
                                        backgroundColor: colors.cardBg,
                                        height: '100%',
                                        borderRadius: 3,
                                        transition: 'transform 0.3s ease',
                                        '&:hover': { transform: 'translateY(-5px)' }
                                    }}>
                                        <CardContent>
                                            <SectionHeader
                                                icon={section.icon}
                                                title={section.title}
                                                description={section.description}
                                            />
                                            <List>
                                                {section.data.map((item, idx) => (
                                                    <Fade
                                                        key={idx}
                                                        in={isVisible}
                                                        timeout={1000 + section.delay + (idx * 100)}
                                                    >
                                                        <ListItem>
                                                            <ListItemIcon>
                                                                <section.itemIcon sx={{ color: colors.primary }} />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={item}
                                                                sx={{ color: colors.text }}
                                                            />
                                                        </ListItem>
                                                    </Fade>
                                                ))}
                                            </List>
                                        </CardContent>
                                    </Card>
                                </Fade>
                            </Grid>
                        ))}

                        {/* Action Button */}
                        <Grid item xs={12}>
                            <Fade in={isVisible} timeout={2000}>
                                <Box sx={{ textAlign: 'center', mt: 3 }}>
                                    <Tooltip title="Agenda tu cita ahora">
                                        <Button
                                            variant="contained"
                                            size="large"
                                            startIcon={<CalendarMonth />}
                                            sx={{
                                                backgroundColor: colors.accent,
                                                '&:hover': {
                                                    backgroundColor: colors.primary,
                                                    transform: 'scale(1.05)',
                                                },
                                                py: 2,
                                                px: 6,
                                                borderRadius: 3,
                                                textTransform: 'none',
                                                fontSize: '1.1rem',
                                                fontWeight: 600,
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            Agendar Cita
                                        </Button>
                                    </Tooltip>
                                </Box>
                            </Fade>
                        </Grid>
                    </Grid>
                </Slide>
            </Container>
        </Box>
    );
};

export default ServicioDetalle;