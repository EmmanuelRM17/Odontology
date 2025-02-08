import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Container, Typography, Card, CardContent, CardMedia,
    CardActions, Button, Chip, CircularProgress, Alert, IconButton
} from '@mui/material';
import { Tooltip } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import axios from 'axios';

const Noticias = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [autoplay, setAutoplay] = useState(true);

    const colors = {
        cardBackground: isDarkTheme ? '#0D1B2A' : '#ffffff',
        primaryText: isDarkTheme ? '#ffffff' : '#1a1a1a',
        secondaryText: isDarkTheme ? '#A0AEC0' : '#666666',
        primaryColor: isDarkTheme ? '#00BCD4' : '#1976d2',
    };

    const commonStyles = {
        fontFamily: '"Montserrat", "Roboto", sans-serif',
    };

    const fetchNews = async () => {
        try {
            const response = await axios.get("https://newsapi.org/v2/everything", {
                params: {
                    q: "salud dental OR odontología OR cuidado dental",
                    language: "es",
                    sortBy: "publishedAt",
                    apiKey: "7c2adb0e70724b1b80db152b87b901fa",
                },
            });
            setArticles(response.data.articles);
            setError(null);
        } catch (error) {
            console.error("Error fetching news:", error);
            setError("No pudimos cargar las noticias. Por favor, intenta más tarde.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkTheme(matchDarkTheme.matches);

        const handleThemeChange = (e) => setIsDarkTheme(e.matches);
        matchDarkTheme.addEventListener('change', handleThemeChange);
        return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
    }, []);

    // Fetch initial data and set up periodic updates
    useEffect(() => {
        fetchNews();
        // Actualizar datos cada 30 minutos
        const updateInterval = setInterval(fetchNews, 40 * 60 * 1000);
        return () => clearInterval(updateInterval);
    }, []);

    const handleNextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev === articles.length - 3 ? 0 : prev + 1));
    }, [articles.length]);

    const handlePrevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev === 0 ? articles.length - 3 : prev - 1));
    }, [articles.length]);

    // Autoplay functionality
    useEffect(() => {
        let interval;
        if (autoplay && articles.length > 0) {
            interval = setInterval(handleNextSlide, 15000); // Cambiar slide cada 15 segundos
        }
        return () => clearInterval(interval);
    }, [autoplay, handleNextSlide, articles.length]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress size={60} style={{ color: colors.primaryColor }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" p={3}>
                <Alert severity="error" icon={<ErrorOutlineIcon fontSize="large" />}
                    sx={{ maxWidth: 600, width: '100%', p: 3, fontSize: '1.1rem' }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '80vh',
                backgroundImage: isDarkTheme
                    ? 'none'
                    : 'linear-gradient(90deg, #ffffff 0%, #E5F3FD 100%)',
                transition: 'background-image 0.3s ease-in-out',
                py: 4,
                ...commonStyles
            }}
        >
            <Container maxWidth="xl">
                <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                        textAlign: "center",
                        mb: 6,
                        color: colors.primaryText,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: '-10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            maxWidth:'1000px',
                            width: '50%',
                            height: '4px',
                            backgroundColor: '#03427C',
                            borderRadius: '2px'
                        },
                        '& span': {
                            color: '#03427C',
                        },
                        letterSpacing: '1px',
                        ...commonStyles
                    }}
                >
                    <span>Noticias y Consejos</span>
                </Typography>

                <Box
                    sx={{
                        position: 'relative',
                        '&:hover': {
                            '& .MuiIconButton-root': {
                                opacity: 1,
                            }
                        }
                    }}
                    onMouseEnter={() => setAutoplay(false)}
                    onMouseLeave={() => setAutoplay(true)}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            gap: { xs: 2, md: 4 },
                            transition: 'transform 0.5s ease',
                            overflowX: { xs: 'auto', md: 'hidden' },
                            scrollSnapType: 'x mandatory',
                            '::-webkit-scrollbar': { display: 'none' },
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none',
                        }}
                    >
                        {articles.slice(currentSlide, currentSlide + 3).map((article, index) => (
                            <Card
                                key={index}
                                sx={{
                                    minWidth: { xs: '85%', sm: '45%', md: 'calc(33.333% - 16px)' },
                                    scrollSnapAlign: 'start',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: colors.cardBackground,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: 6
                                    },
                                    ...commonStyles
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    sx={{
                                        height: { xs: 0, md: 200 },
                                        display: { xs: 'none', md: 'block' }
                                    }}
                                    image={article.urlToImage || '/api/placeholder/400/300'}
                                    alt={article.title}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                                        <Chip
                                            label="Salud Dental"
                                            size="small"
                                            sx={{
                                                backgroundColor: colors.primaryColor,
                                                color: '#ffffff',
                                                ...commonStyles
                                            }}
                                        />
                                        <Chip
                                            icon={<AccessTimeIcon />}
                                            label="5 min"
                                            size="small"
                                            variant="outlined"
                                            sx={{ color: colors.secondaryText, ...commonStyles }}
                                        />
                                    </Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: colors.primaryText,
                                            mb: 2,
                                            fontWeight: 600,
                                            ...commonStyles
                                        }}
                                    >
                                        {article.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: colors.secondaryText,
                                            mb: 2,
                                            ...commonStyles
                                        }}
                                    >
                                        {article.description}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ p: 2, mt: 'auto' }}>
                                    <Tooltip title="Presiona para más información" arrow>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            href={article.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{
                                                color: colors.primaryColor,
                                                borderColor: colors.primaryColor,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    borderColor: colors.primaryColor,
                                                    backgroundColor: colors.primaryColor,
                                                    color: '#ffffff', // Cambia el texto a blanco cuando se pasa el mouse
                                                },
                                                ...commonStyles
                                            }}
                                        >
                                            Leer más
                                        </Button>
                                    </Tooltip>
                                </CardActions>
                            </Card>
                        ))}
                    </Box>

                    {/* Navigation Arrows - Hidden on mobile */}
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <IconButton
                            onClick={handlePrevSlide}
                            sx={{
                                position: 'absolute',
                                left: -20,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: colors.cardBackground,
                                opacity: 0.7,
                                transition: 'opacity 0.3s ease',
                                '&:hover': {
                                    backgroundColor: colors.cardBackground,
                                    opacity: 1
                                },
                                boxShadow: 2
                            }}
                        >
                            <ChevronLeftIcon />
                        </IconButton>
                        <IconButton
                            onClick={handleNextSlide}
                            sx={{
                                position: 'absolute',
                                right: -20,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: colors.cardBackground,
                                opacity: 0.7,
                                transition: 'opacity 0.3s ease',
                                '&:hover': {
                                    backgroundColor: colors.cardBackground,
                                    opacity: 1
                                },
                                boxShadow: 2
                            }}
                        >
                            <ChevronRightIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Noticias;