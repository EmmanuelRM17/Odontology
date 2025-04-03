import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  Badge,
  Divider,
  Zoom,
  IconButton,
  Slide,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  MedicalServices, 
  LocalHospital, 
  ChevronLeft, 
  ChevronRight 
} from '@mui/icons-material';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
// Implementación sin librerías externas

// Utilidades y constantes
import { useIntersectionObserver, DENTAL_BENEFITS, FEATURES_DATA } from '../constants';
import images from '../../../utils/imageLoader';
import { SectionDivider } from './Home';

// Componente BenefitItem optimizado
const BenefitItem = ({ benefit, index, animateServices, colors, isDarkTheme }) => {
  const Icon = benefit.icon;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Slide
      direction="right"
      in={animateServices}
      timeout={300 + (index * 150)}
    >
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: isMobile ? 1 : 1.25,
          borderRadius: '8px',
          backgroundColor: isDarkTheme ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
          border: `1px solid ${colors.border}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateX(5px)',
            backgroundColor: isDarkTheme ? 'rgba(39, 52, 73, 0.8)' : 'rgba(249, 250, 251, 0.9)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            borderColor: colors.primary
          }
        }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: isMobile ? 24 : 32,
          height: isMobile ? 24 : 32,
          borderRadius: '50%',
          backgroundColor: colors.lightBg,
          color: colors.primary,
          mr: isMobile ? 1 : 1.5,
          flexShrink: 0
        }}>
          <Icon sx={{ fontSize: isMobile ? '16px' : '22px' }} />
        </Box>
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: colors.text,
              fontWeight: 600,
              fontSize: isMobile ? '0.8rem' : '0.85rem',
              mb: 0.2
            }}
          >
            {benefit.title}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: colors.subtext,
              display: 'block',
              fontSize: isMobile ? '0.7rem' : '0.75rem',
              lineHeight: 1.2
            }}
          >
            {benefit.description}
          </Typography>
        </Box>
      </Paper>
    </Slide>
  );
};

// Componente FeatureCard optimizado
const FeatureCard = ({ feature, index, isVisible, colors }) => {
  const Icon = feature.icon;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Zoom
      in={isVisible}
      style={{
        transitionDelay: isVisible ? `${index * 150}ms` : '0ms',
        transitionDuration: '500ms'
      }}
    >
      <Paper
        elevation={0}
        className={isVisible ? 'animate-fade-up' : ''}
        sx={{
          p: isMobile ? 2.5 : 3.5,
          height: '100%',
          borderRadius: '16px',
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}`,
          transition: 'all 0.4s ease',
          '&:hover': {
            backgroundColor: colors.cardHover,
            transform: 'translateY(-8px)',
            boxShadow: colors.shadow
          },
          display: 'flex',
          flexDirection: 'column',
          opacity: 0,
          animation: isVisible ? 'fadeInUp 0.6s forwards' : 'none',
          animationDelay: `${index * 0.15}s`
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: isMobile ? 2 : 3
          }}
        >
          <Box
            sx={{
              width: isMobile ? 48 : 64,
              height: isMobile ? 48 : 64,
              borderRadius: '50%',
              background: colors.lightBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.primary,
              mb: 1
            }}
          >
            <Icon sx={{ fontSize: isMobile ? '22px' : '28px' }} />
          </Box>
        </Box>

        <Typography
          variant="h6"
          align="center"
          sx={{
            fontWeight: 600,
            color: colors.text,
            fontSize: isMobile ? '1rem' : '1.1rem',
            mb: isMobile ? 1.5 : 2
          }}
        >
          {feature.title}
        </Typography>

        <Typography
          variant="body2"
          align="center"
          sx={{
            color: colors.subtext,
            lineHeight: 1.6,
            fontSize: isMobile ? '0.85rem' : '0.95rem'
          }}
        >
          {feature.description}
        </Typography>
      </Paper>
    </Zoom>
  );
};

// Componente ImageCarousel optimizado con swipe para móvil
const ImageCarousel = React.memo(({
  images,
  isPaused,
  currentImageIndex,
  setCurrentImageIndex
}) => {
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isImageTransitioning, setIsImageTransitioning] = useState(false);
  const [carouselDirection, setCarouselDirection] = useState('next');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Transición automática de imágenes
  const handleAutoImageTransition = useCallback(() => {
    if (isImageTransitioning) return;

    setCarouselDirection('next');
    setIsImageTransitioning(true);
    setNextImageIndex((currentImageIndex + 1) % images.length);

    setTimeout(() => {
      setCurrentImageIndex(nextImageIndex);
      setIsImageTransitioning(false);
      setNextImageIndex((nextImageIndex + 1) % images.length);
    }, 600);
  }, [currentImageIndex, nextImageIndex, isImageTransitioning, images.length, setCurrentImageIndex]);

  // Efecto para auto rotación de imágenes
  useEffect(() => {
    if (isPaused || images.length <= 1) return;

    const interval = setInterval(() => {
      handleAutoImageTransition();
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused, currentImageIndex, images.length, handleAutoImageTransition]);

  // Navegación manual
  const nextImage = useCallback(() => {
    if (isImageTransitioning) return;

    setCarouselDirection('next');
    setIsImageTransitioning(true);
    const next = (currentImageIndex + 1) % images.length;
    setNextImageIndex(next);

    setTimeout(() => {
      setCurrentImageIndex(next);
      setIsImageTransitioning(false);
      setNextImageIndex((next + 1) % images.length);
    }, 600);
  }, [currentImageIndex, isImageTransitioning, images.length, setCurrentImageIndex]);

  const prevImage = useCallback(() => {
    if (isImageTransitioning) return;

    setCarouselDirection('prev');
    setIsImageTransitioning(true);
    const prev = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    setNextImageIndex(prev);

    setTimeout(() => {
      setCurrentImageIndex(prev);
      setIsImageTransitioning(false);
      setNextImageIndex(prev === 0 ? images.length - 1 : prev - 1);
    }, 600);
  }, [currentImageIndex, isImageTransitioning, images.length, setCurrentImageIndex]);

  const handleSwipeChange = (index) => {
    setCurrentImageIndex(index % images.length);
  };

  // Para uso en dispositivos móviles con solución nativa
  if (isMobile) {
    return (
      <Box sx={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden' }}>
        {/* Imagen principal */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${images[currentImageIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'opacity 0.5s ease-in-out'
          }}
        />
        
        {/* Indicadores de navegación */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            zIndex: 5
          }}
        >
          {images.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: idx === currentImageIndex 
                  ? 'white' 
                  : 'rgba(255,255,255,0.5)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            />
          ))}
        </Box>

        {/* Botones de navegación para móvil (más grandes y accesibles) */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 1,
            zIndex: 2
          }}
        >
          <IconButton
            onClick={prevImage}
            aria-label="Imagen anterior"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(5px)',
              color: 'white',
              width: 32,
              height: 32
            }}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>

          <IconButton
            onClick={nextImage}
            aria-label="Imagen siguiente"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(5px)',
              color: 'white',
              width: 32,
              height: 32
            }}
          >
            <ChevronRight fontSize="small" />
          </IconButton>
        </Box>

        {/* Overlay con información */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
            padding: 2,
            zIndex: 5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 600,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              fontSize: '1.1rem'
            }}
          >
            Consultorio Dental Carol
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 1px 3px rgba(0,0,0,0.3)',
              fontSize: '0.8rem'
            }}
          >
            Nos preocupamos por la salud de su Sonrisa
          </Typography>
        </Box>
      </Box>
    );
  }

  // Versión para tablets/desktop
  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}
    >
      {/* Imagen actual */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${images[currentImageIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'transform 0.6s ease-out',
          transform: isImageTransitioning
            ? carouselDirection === 'next'
              ? 'translateX(-100%)'
              : 'translateX(100%)'
            : 'translateX(0)'
        }}
      />

      {/* Imagen siguiente/anterior */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${images[nextImageIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'transform 0.6s ease-out',
          transform: isImageTransitioning
            ? 'translateX(0)'
            : carouselDirection === 'next'
              ? 'translateX(100%)'
              : 'translateX(-100%)'
        }}
      />

      {/* Controles de navegación */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          top: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          zIndex: 10
        }}
      >
        <IconButton
          onClick={prevImage}
          aria-label="Imagen anterior"
          sx={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(5px)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.25)',
              transform: 'translateX(-3px)'
            },
            transition: 'all 0.3s ease',
            width: 40,
            height: 40
          }}
        >
          <ChevronLeft />
        </IconButton>

        <IconButton
          onClick={nextImage}
          aria-label="Imagen siguiente"
          sx={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(5px)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.25)',
              transform: 'translateX(3px)'
            },
            transition: 'all 0.3s ease',
            width: 40,
            height: 40
          }}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Overlay con información */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
          padding: 3,
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end'
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontWeight: 600,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          Consultorio Dental Carol
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255,255,255,0.9)',
            textShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}
        >
          Nos preocupamos por la salud de su Sonrisa
        </Typography>
      </Box>
    </Box>
  );
});

// Componente principal HomeHero optimizado
const HomeHero = ({ colors, isPaused, setIsPaused }) => {
  const { isDarkTheme } = useThemeContext();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [animateServices, setAnimateServices] = useState(false);
  const [whyUsRef, whyUsVisible] = useIntersectionObserver();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Efecto para activar animaciones
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateServices(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      {/* Hero Section */}
      <Grid
        container
        spacing={{ xs: 3, sm: 4, md: 6 }}
        sx={{
          alignItems: "center",
          mb: { xs: 4, sm: 5, md: 8 }
        }}
      >
        {/* Lado izquierdo - Texto principal */}
        <Grid item xs={12} md={6}>
          <Box sx={{ py: { xs: 1, sm: 2, md: 3 } }}>
            <Badge
              badgeContent="Odontología"
              color="primary"
              sx={{
                mb: { xs: 2, md: 3 },
                '& .MuiBadge-badge': {
                  fontSize: { xs: '0.65rem', md: '0.75rem' },
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  px: { xs: 1.2, md: 1.5 },
                  py: { xs: 0.4, md: 0.5 },
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                  transform: 'none',
                  position: 'static',
                  display: 'inline-block'
                }
              }}
            />

            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3rem' },
                fontWeight: 800,
                lineHeight: 1.2,
                mb: { xs: 2, md: 3 },
                color: colors.text,
                letterSpacing: '-0.02em'
              }}
            >
              Consultorio Dental{' '}
              <Box
                component="span"
                sx={{
                  color: colors.primary,
                  position: 'relative',
                  "&::after": {
                    content: '""',
                    position: 'absolute',
                    width: '100%',
                    height: { xs: 3, md: 4 },
                    bottom: { xs: -5, md: -6 },
                    left: 0,
                    background: colors.accentGradient,
                    borderRadius: '2px'
                  }
                }}
              >
                Carol
              </Box>
            </Typography>

            <Typography
              variant="subtitle1"
              sx={{
                color: colors.subtext,
                fontWeight: 400,
                mb: { xs: 3, md: 4 },
                fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.2rem' },
                lineHeight: 1.7,
                maxWidth: '540px'
              }}
            >
              Tu dentista de confianza, con servicios accesibles y atención cálida para toda la familia. Comprometidos con la salud bucal de nuestros vecinos.
            </Typography>

            {/* Caja informativa para móvil */}
            <Box
              component="div"
              className="scroll-reveal-element"
              sx={{
                mt: 3,
                py: 2,
                display: { xs: 'flex', sm: 'none' },
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                position: 'relative',
                zIndex: 1
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 1
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 45,
                    height: 45,
                    borderRadius: '50%',
                    backgroundColor: colors.lightBg,
                    color: colors.primary,
                  }}
                >
                  <MedicalServices sx={{ fontSize: '1.6rem' }} />
                </Box>
              </Box>
              <Typography
                variant="subtitle1"
                align="center"
                sx={{
                  color: colors.text,
                  fontWeight: 600,
                  mb: 1,
                  fontSize: '1rem'
                }}
              >
                Atención dental de calidad
              </Typography>
              <Typography
                variant="body2"
                align="center"
                sx={{
                  color: colors.subtext,
                  maxWidth: '280px',
                  mb: 1,
                  fontSize: '0.85rem'
                }}
              >
                Nos preocupamos por ofrecerle los mejores servicios a precios accesibles
              </Typography>
            </Box>

            {/* Beneficios de visitar al odontólogo */}
            <Box
              sx={{
                mt: { xs: 2, md: 3 },
                p: { xs: 1.5, sm: 2 },
                borderRadius: '12px',
                background: isDarkTheme ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: `1px solid ${colors.border}`,
                width: '100%',
                display: { xs: 'none', sm: 'block' },
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Elementos decorativos de fondo */}
              <Box sx={{
                position: 'absolute',
                top: -20, right: -20,
                width: '140px', height: '140px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${colors.primary}22 0%, transparent 70%)`,
                zIndex: 0
              }} />

              <Box sx={{
                position: 'absolute',
                bottom: -30, left: -30,
                width: '160px', height: '160px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${colors.primary}15 0%, transparent 70%)`,
                zIndex: 0
              }} />

              {/* Encabezado */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1.5,
                position: 'relative',
                zIndex: 1
              }}>
                <LocalHospital sx={{ 
                  color: colors.primary, 
                  fontSize: { xs: '1.1rem', md: '1.3rem' } 
                }} />
                <Typography variant="h6" sx={{
                  color: colors.text,
                  fontWeight: 600,
                  fontSize: { xs: '0.9rem', md: '1rem' }
                }}>
                  Beneficios de la salud dental
                </Typography>
              </Box>

              <Divider sx={{ mb: 1.5, opacity: 0.6 }} />

              {/* Grid de beneficios */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: { xs: 1, sm: 1.5 },
                position: 'relative',
                zIndex: 1
              }}>
                {DENTAL_BENEFITS.map((benefit, index) => (
                  <BenefitItem
                    key={index}
                    benefit={benefit}
                    index={index}
                    animateServices={animateServices}
                    colors={colors}
                    isDarkTheme={isDarkTheme}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Lado derecho - Carrusel de imágenes */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              position: 'relative',
              height: { xs: '240px', sm: '320px', md: '440px' },
              width: '100%',
              borderRadius: { xs: '12px', md: '16px' },
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
              border: `1px solid ${colors.border}`
            }}
          >
            <ImageCarousel
              images={images}
              isPaused={isPaused}
              currentImageIndex={currentImageIndex}
              setCurrentImageIndex={setCurrentImageIndex}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Separador entre secciones */}
      <SectionDivider colors={colors} />

      {/* Sección "Por qué elegirnos" */}
      <Box
        ref={whyUsRef}
        sx={{ mb: { xs: 4, sm: 5, md: 8 } }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: 700,
            mb: { xs: 1.5, md: 2 },
            color: colors.text,
            fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2rem' }
          }}
        >
          ¿Por qué elegirnos?
        </Typography>

        <Typography
          variant="subtitle1"
          align="center"
          sx={{
            color: colors.subtext,
            maxWidth: '800px',
            mx: 'auto',
            mb: { xs: 3, sm: 4, md: 5 },
            fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
            lineHeight: 1.7,
            px: { xs: 1, sm: 2, md: 0 }
          }}
        >
          Nuestra prioridad es ofrecer servicios odontológicos con un enfoque genuino en el bienestar de nuestra comunidad
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {FEATURES_DATA.map((feature, index) => (
            <Grid item xs={6} sm={6} md={3} key={index}>
              <FeatureCard
                feature={feature}
                index={index}
                isVisible={whyUsVisible}
                colors={colors}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      <SectionDivider colors={colors} />
    </Container>
  );
};

export default HomeHero;