import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, CardContent, CardMedia,
  Button, Chip, CircularProgress, Alert, IconButton,
  Grid, Paper, useMediaQuery, useTheme, Collapse, Fade
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import ShareIcon from '@mui/icons-material/Share';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import axios from 'axios';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import Notificaciones from '../../../components/Layout/Notificaciones';

// Componente para los iconos flotantes decorativos
const FloatingIcons = ({ isDarkTheme }) => {

  const icons = [
    { Icon: BookmarkIcon, top: '15%', left: '5%', delay: 0 },
    { Icon: NewspaperIcon, top: '70%', left: '8%', delay: 0.3 },
    { Icon: TipsAndUpdatesIcon, top: '20%', right: '7%', delay: 0.6 },
    { Icon: LocalOfferIcon, top: '75%', right: '5%', delay: 0.9 }
  ];

  return (
    <>
      {icons.map((item, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            zIndex: 0,
            color: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(3,66,124,0.05)',
            top: item.top,
            left: item.left,
            right: item.right,
            animation: `float ${3 + index * 0.5}s ease-in-out infinite`,
            '@keyframes float': {
              '0%, 100%': {
                transform: 'translateY(0)'
              },
              '50%': {
                transform: 'translateY(-15px)'
              }
            },
            opacity: 0.2,
          }}
        >
          <item.Icon sx={{ fontSize: { xs: 40, md: 60 } }} />
        </Box>
      ))}
    </>
  );
};

const NewsCard = ({ article, index, colors, isDarkTheme, setNotification }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isHovered, setIsHovered] = useState(false);
  // Esta función asegura que solo la tarjeta actual cambie de estado
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  // Función para copiar el enlace y mostrar la notificación
  const handleShare = (url) => {
    navigator.clipboard.writeText(url);
    setNotification({
      open: true,
      message: '¡Enlace de la noticia copiado al portapapeles!',
      type: 'success',
    });
  };

  return (
    <Grid item xs={12} md={4} sx={{ mb: 4 }}>
      <Box
        className={`news-card-${index}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          height: '100%',
          animation: `fadeInUp 0.5s ease-out forwards`,
          animationDelay: `${index * 0.1}s`,
          opacity: 0,
          '@keyframes fadeInUp': {
            '0%': {
              opacity: 0,
              transform: 'translateY(50px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          },
          transition: 'all 0.3s ease',
        }}
      >
        <Paper
          elevation={isHovered ? 8 : 2}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            height: '100%',
            backgroundColor: colors.cardBackground,
            position: 'relative',
            transition: 'all 0.3s ease',
            transform: isHovered ? 'translateY(-8px)' : 'none',
            border: isDarkTheme ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }}
        >
          {/* Overlay de color en la imagen */}
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height={200}
              image={article.enlace_img || '/api/placeholder/400/300'}
              alt={article.titulo}
              sx={{
                transition: 'all 0.5s ease',
                filter: isHovered ? 'brightness(1.1)' : 'brightness(0.85)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `linear-gradient(to bottom, rgba(0,0,0,0.1), ${colors.cardBackground})`,
                transition: 'opacity 0.3s ease',
                opacity: isHovered ? 0.7 : 0.9,
              }}
            />

            {/* Categoría y tiempo de lectura */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              <Chip
                label={article.categoria || "Sin categoría"}
                size="small"
                icon={<LocalOfferIcon />}
                sx={{
                  backgroundColor: 'rgba(3,66,124,0.8)',
                  color: '#ffffff',
                  backdropFilter: 'blur(5px)',
                  fontWeight: 600,
                }}
              />
              <Chip
                icon={<AccessTimeIcon />}
                label="5 min"
                size="small"
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: '#ffffff',
                  backdropFilter: 'blur(5px)',
                }}
              />
            </Box>
          </Box>

          <CardContent
            sx={{
              p: 3,
              position: 'relative',
              zIndex: 1,
              height: '250px', // Alto fijo para evitar movimiento
              overflow: 'hidden',
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: colors.primaryText,
                fontSize: { xs: '1.2rem', md: '1.4rem' },
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {article.titulo}
            </Typography>

            <Collapse in={isHovered || isMobile} collapsedSize={80}>
              <Typography
                variant="body1"
                sx={{
                  color: colors.secondaryText,
                  mb: 3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3, // Máximo de 3 líneas
                  WebkitBoxOrient: 'vertical',
                  height: '72px', // Alto fijo para el texto
                }}
              >
                {article.descripcion}
              </Typography>

            </Collapse>

            {/* Aquí está el cambio principal: solo se muestra la acción si la tarjeta está en hover */}
            <Fade in={isHovered || isMobile}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 2,
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  right: '16px',
                }}
              >
                <Button
                  variant="contained"
                  href={article.enlace_inf}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: '50px',
                    backgroundColor: '#03427C',
                    color: '#fff',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#0266BD',
                      boxShadow: '0 8px 16px rgba(3, 66, 124, 0.2)',
                    },
                    textTransform: 'none',
                  }}
                >
                  Leer artículo
                </Button>
                <IconButton
                  onClick={() => handleShare(article.enlace_inf)}
                  sx={{
                    color: colors.primaryColor,
                    backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(3,66,124,0.05)',
                    '&:hover': {
                      backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(3,66,124,0.1)',
                    }
                  }}
                >
                  <ShareIcon />
                </IconButton>

              </Box>
            </Fade>
          </CardContent>
        </Paper>
      </Box>

    </Grid>
  );
};

const Noticias = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkTheme } = useThemeContext();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'info',
  });

  const colors = {
    cardBackground: isDarkTheme ? '#0D1B2A' : '#ffffff',
    primaryText: isDarkTheme ? '#ffffff' : '#1a1a1a',
    secondaryText: isDarkTheme ? '#A0AEC0' : '#666666',
    primaryColor: isDarkTheme ? '#00BCD4' : '#03427C',
    background: isDarkTheme
      ? "linear-gradient(90deg, #1C2A38 0%, #2C3E50 100%)"
      : "linear-gradient(90deg, #ffffff 0%, #E5F3FD 100%)",
  };

  const fetchNews = async () => {
    try {
      const response = await axios.get("https://back-end-4803.onrender.com/api/servicios/noticias");
      setArticles(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching news:", error);
      setError("No pudimos cargar las noticias. Por favor, intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const updateInterval = setInterval(fetchNews, 40 * 60 * 1000);
    return () => clearInterval(updateInterval);
  }, []);

  const handleNextSlide = useCallback(() => {
    if (articles.length <= 3) return;
    setCurrentSlide((prev) => (prev === articles.length - 3 ? 0 : prev + 1));
  }, [articles.length]);

  const handlePrevSlide = useCallback(() => {
    if (articles.length <= 3) return;
    setCurrentSlide((prev) => (prev === 0 ? articles.length - 3 : prev - 1));
  }, [articles.length]);

  // Autoplay functionality - cambiado a 6000ms (6 segundos)
  useEffect(() => {
    let interval;
    if (autoplay && articles.length > 3) {
      interval = setInterval(handleNextSlide, 6000);
    }
    return () => clearInterval(interval);
  }, [autoplay, handleNextSlide, articles.length]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: colors.background,
        }}
      >
        <Box
          sx={{
            animation: 'pulse 2s infinite ease-in-out',
            '@keyframes pulse': {
              '0%, 100%': {
                transform: 'scale(1)',
                opacity: 0.8
              },
              '50%': {
                transform: 'scale(1.2)',
                opacity: 1
              }
            }
          }}
        >
          <CircularProgress
            size={80}
            thickness={4}
            sx={{
              color: colors.primaryColor,
              filter: "drop-shadow(0 0 10px rgba(3, 66, 124, 0.3))",
            }}
          />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: colors.background,
          p: 3,
        }}
      >
        <Alert
          severity="error"
          icon={<ErrorOutlineIcon fontSize="large" />}
          sx={{
            maxWidth: 600,
            width: "100%",
            p: 3,
            fontSize: "1.1rem",
            animation: "fadeIn 0.5s ease-in-out",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // Seleccionar artículos para la vista actual
  const visibleArticles = isMobile
    ? articles
    : articles.slice(currentSlide, currentSlide + 3);

  return (
    <Box
      sx={{
        minHeight: "90vh",
        background: colors.background,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "background 0.3s ease-in-out",
        py: 6,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Iconos flotantes decorativos */}
      <FloatingIcons isDarkTheme={isDarkTheme} />

      <Container maxWidth="xl">
        <Box
          sx={{
            mb: 8,
            textAlign: "center",
            animation: 'fadeInDown 0.8s ease-out forwards',
            '@keyframes fadeInDown': {
              '0%': {
                opacity: 0,
                transform: 'translateY(-50px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: colors.primaryColor,
              letterSpacing: 4,
              fontWeight: 600,
              display: "block",
              mb: 1,
            }}
          >
            MANTENTE INFORMADO
          </Typography>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: colors.primaryText,
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "3rem" },
              position: "relative",
              display: "inline-block",
              mb: 2,
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: "-10px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "80px",
                height: "4px",
                backgroundColor: colors.primaryColor,
                borderRadius: "2px",
              },
            }}
          >
            Noticias y Consejos
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: colors.secondaryText,
              maxWidth: "800px",
              mx: "auto",
              mt: 3,
            }}
          >
            Descubre las últimas actualizaciones y recomendaciones para mantenerte al día
          </Typography>
        </Box>

        {!isMobile && articles.length > 3 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              mb: 4,
            }}
          >
            <IconButton
              onClick={handlePrevSlide}
              sx={{
                backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(3,66,124,0.05)',
                color: colors.primaryText,
                '&:hover': {
                  backgroundColor: colors.primaryColor,
                  color: '#fff',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              onClick={handleNextSlide}
              sx={{
                backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(3,66,124,0.05)',
                color: colors.primaryText,
                '&:hover': {
                  backgroundColor: colors.primaryColor,
                  color: '#fff',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        )}

        <Grid
          container
          spacing={4}
          sx={{
            position: "relative",
            zIndex: 1,
          }}
          onMouseEnter={() => setAutoplay(false)}
          onMouseLeave={() => setAutoplay(true)}
        >
          {visibleArticles.map((article, index) => (
            <NewsCard
              key={index}
              article={article}
              index={index}
              colors={colors}
              isDarkTheme={isDarkTheme}
              setNotification={setNotification} // Pasar la función de notificación
            />
          ))}
        </Grid>

        {/* Dots navigation for mobile */}
        {isMobile && articles.length > 3 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
              mt: 4
            }}
          >
            {Array.from({ length: Math.ceil(articles.length / 3) }).map((_, idx) => (
              <Box
                key={idx}
                component="button"
                onClick={() => setCurrentSlide(idx * 3)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: currentSlide >= idx * 3 && currentSlide < (idx + 1) * 3
                    ? colors.primaryColor
                    : isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: colors.primaryColor,
                    transform: 'scale(1.2)'
                  }
                }}
              />
            ))}
          </Box>
        )}
        <Notificaciones
          open={notification.open}
          message={notification.message}
          type={notification.type}
          handleClose={() => setNotification({ ...notification, open: false })}
          autoHideDuration={5000}
        />
      </Container>

    </Box>
  );
};

export default Noticias;