import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  Badge,
  Divider,
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

// Componente FeatureCard OPTIMIZADO - sin conflictos de animación
const FeatureCard = ({ feature, index, isVisible, colors }) => {
  const Icon = feature.icon;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        // Animación inicial suave desde opacity 0
        opacity: isVisible ? 1 : 0,
        transform: isVisible 
          ? 'translateY(0px) scale(1)' 
          : 'translateY(30px) scale(0.95)',
        transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1)`,
        transitionDelay: `${index * 120}ms`, // Delay progresivo más suave
        willChange: 'transform, opacity' // Optimización de rendimiento
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: isMobile ? 2.5 : 3.5,
          height: '100%',
          borderRadius: '16px',
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}`,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          transformOrigin: 'center',
          '&:hover': {
            backgroundColor: colors.cardHover,
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: colors.shadow,
            borderColor: colors.primary
          },
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Icono con animación suave */}
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
              mb: 1,
              transition: 'all 0.3s ease',
              // Animación del icono con delay adicional
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'scale(1) rotate(0deg)' : 'scale(0.8) rotate(-10deg)',
              transitionDelay: `${(index * 120) + 200}ms`
            }}
          >
            <Icon sx={{ fontSize: isMobile ? '22px' : '28px' }} />
          </Box>
        </Box>

        {/* Título con animación escalonada */}
        <Typography
          variant="h6"
          align="center"
          sx={{
            fontWeight: 600,
            color: colors.text,
            fontSize: isMobile ? '1rem' : '1.1rem',
            mb: isMobile ? 1.5 : 2,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0px)' : 'translateY(15px)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDelay: `${(index * 120) + 300}ms`
          }}
        >
          {feature.title}
        </Typography>

        {/* Descripción con animación final */}
        <Typography
          variant="body2"
          align="center"
          sx={{
            color: colors.subtext,
            lineHeight: 1.6,
            fontSize: isMobile ? '0.85rem' : '0.95rem',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0px)' : 'translateY(15px)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDelay: `${(index * 120) + 400}ms`
          }}
        >
          {feature.description}
        </Typography>
      </Paper>
    </Box>
  );
};

// Componente ImageCarousel 
const ImageCarousel = React.memo(({
  images,
  isPaused,
  currentImageIndex,
  setCurrentImageIndex,
  colors
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isTransitioning, setIsTransitioning] = useState(false);

  const getNextIndex = useCallback(() =>
    (currentImageIndex + 1) % images.length,
    [currentImageIndex, images.length]
  );

  const handleTransition = useCallback((newIndex) => {
    if (isTransitioning || images.length <= 1) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(newIndex);
      setIsTransitioning(false);
    }, 800);
  }, [isTransitioning, images.length, setCurrentImageIndex]);

  const nextImage = useCallback(() => {
    const newIndex = getNextIndex();
    handleTransition(newIndex);
  }, [getNextIndex, handleTransition]);

  useEffect(() => {
    if (isPaused || images.length <= 1) return;

    const interval = setInterval(nextImage, 4000);
    return () => clearInterval(interval);
  }, [isPaused, nextImage, images.length]);

  if (!images || images.length === 0) {
    return (
      <Box sx={{
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography color="text.secondary">No hay imágenes</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: 'transparent',
      overflow: 'visible'
    }}>

      {/* Segunda imagen/preview (ATRÁS) - MUY rectangular */}
      {!isMobile && images.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '12%',
            right: '5%',
            width: '45%',
            height: '35%',
            borderRadius: 3,
            cursor: 'pointer',
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1,
            border: `3px solid ${colors.border}`,
            boxShadow: `
              0 8px 20px rgba(0, 0, 0, 0.25),
              0 0 0 1px ${colors.primary}40,
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            transform: isTransitioning ? 'scale(1.05)' : 'scale(1)',
            opacity: isTransitioning ? 0.8 : 1,
            overflow: 'hidden',
            '&:hover': {
              transform: 'scale(1.03)',
              boxShadow: `
                0 12px 25px rgba(0, 0, 0, 0.3),
                0 0 0 2px ${colors.primary}60,
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `,
              border: `3px solid ${colors.primary}80`
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              background: `linear-gradient(135deg, ${colors.primary}40, transparent, ${colors.primary}20)`,
              borderRadius: 'inherit',
              zIndex: -1,
              opacity: 0.6
            }
          }}
          onClick={nextImage}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${images[getNextIndex()]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 'inherit'
            }}
          />
        </Box>
      )}

      {/* Imagen principal (ADELANTE) - Rectangular ancha */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: isMobile ? '100%' : '85%',
          height: isMobile ? '100%' : '75%',
          borderRadius: 4,
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isTransitioning ? 'scale(1.02)' : 'scale(1)',
          opacity: isTransitioning ? 0.9 : 1,
          zIndex: 2,
          border: `4px solid ${colors.border}`,
          boxShadow: `
            0 15px 35px rgba(0, 0, 0, 0.2),
            0 0 0 1px ${colors.primary}30,
            inset 0 2px 4px rgba(255, 255, 255, 0.1),
            inset 0 -2px 4px rgba(0, 0, 0, 0.1)
          `,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -3,
            left: -3,
            right: -3,
            bottom: -3,
            background: `linear-gradient(135deg, ${colors.primary}30, transparent 30%, transparent 70%, ${colors.primary}20)`,
            borderRadius: 'inherit',
            zIndex: -1,
            opacity: 0.8
          },
          '&:hover': {
            boxShadow: `
              0 20px 40px rgba(0, 0, 0, 0.25),
              0 0 0 2px ${colors.primary}50,
              inset 0 2px 4px rgba(255, 255, 255, 0.15),
              inset 0 -2px 4px rgba(0, 0, 0, 0.1)
            `,
            border: `4px solid ${colors.primary}60`
          }
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            backgroundImage: `url(${images[currentImageIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: 'inherit',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, transparent 60%, rgba(0,0,0,0.05) 100%)',
              pointerEvents: 'none'
            }
          }}
        />
      </Box>
    </Box>
  );
});

// Componente principal HomeHero optimizado
const HomeHero = ({ colors, isPaused, setIsPaused }) => {
  const { isDarkTheme } = useThemeContext();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [animateServices, setAnimateServices] = useState(false);
  const [whyUsRef, whyUsVisible] = useIntersectionObserver({ threshold: 0.2 }); // Mayor threshold para activación más temprana
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Efecto para activar animaciones con mejor timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateServices(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ px: 0, position: 'relative' }}>
      {/* Animaciones de fondo suaves - optimizadas */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      >
        {/* Ondas flotantes con mejor performance */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '-10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colors.primary}08 0%, ${colors.primary}04 50%, transparent 70%)`,
            animation: 'floatWave 12s ease-in-out infinite',
            willChange: 'transform', // Optimización de rendimiento
            '@keyframes floatWave': {
              '0%, 100%': {
                transform: 'translate(0, 0) scale(1)',
                opacity: 0.6
              },
              '33%': {
                transform: 'translate(30px, -20px) scale(1.1)',
                opacity: 0.8
              },
              '66%': {
                transform: 'translate(-20px, 30px) scale(0.9)',
                opacity: 0.4
              }
            }
          }}
        />

        {/* Círculos flotantes optimizados */}
        {[...Array(4)].map((_, index) => ( // Reducido de 6 a 4 para mejor performance
          <Box
            key={index}
            sx={{
              position: 'absolute',
              width: `${20 + Math.random() * 30}px`, // Tamaños más pequeños
              height: `${20 + Math.random() * 30}px`,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.primary}12, ${colors.primary}06)`,
              top: `${Math.random() * 80}%`,
              left: `${Math.random() * 80}%`,
              animation: `float${index} ${8 + Math.random() * 6}s ease-in-out infinite`, // Animaciones más rápidas
              animationDelay: `${Math.random() * 4}s`,
              willChange: 'transform',
              [`@keyframes float${index}`]: {
                '0%, 100%': {
                  transform: `translate(0, 0) rotate(0deg) scale(1)`,
                  opacity: 0.3
                },
                '50%': {
                  transform: `translate(${(Math.random() - 0.5) * 40}px, ${(Math.random() - 0.5) * 40}px) rotate(180deg) scale(${0.8 + Math.random() * 0.3})`,
                  opacity: 0.6
                }
              }
            }}
          />
        ))}
      </Box>

      {/* Contenido principal con z-index superior */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
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

              {/* Caja informativa para móvil - optimizada */}
              <Box
                sx={{
                  mt: 3,
                  py: 2,
                  display: { xs: 'flex', sm: 'none' },
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5,
                  position: 'relative',
                  zIndex: 1,
                  opacity: animateServices ? 1 : 0,
                  transform: animateServices ? 'translateY(0px)' : 'translateY(20px)',
                  transition: 'all 0.6s ease-out'
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

              {/* Beneficios de visitar al odontólogo - optimizado */}
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
                  overflow: 'hidden',
                  backdropFilter: 'blur(10px)',
                  opacity: animateServices ? 1 : 0,
                  transform: animateServices ? 'translateY(0px)' : 'translateY(30px)',
                  transition: 'all 0.6s ease-out',
                  transitionDelay: '200ms'
                }}
              >
                {/* Elementos decorativos de fondo optimizados */}
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
                height: { xs: '280px', sm: '360px', md: '400px' },
                width: '100%',
                borderRadius: 0,
                overflow: 'visible',
                boxShadow: 'none',
                border: 'none'
              }}
            >
              <ImageCarousel
                images={images}
                isPaused={isPaused}
                currentImageIndex={currentImageIndex}
                setCurrentImageIndex={setCurrentImageIndex}
                colors={colors}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Separador entre secciones */}
        <SectionDivider colors={colors} />

        {/* Sección "Por qué elegirnos" - OPTIMIZADA */}
        <Box
          ref={whyUsRef}
          sx={{ mb: { xs: 4, sm: 5, md: 8 } }}
        >
          {/* Título con animación mejorada */}
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 700,
              mb: { xs: 1.5, md: 2 },
              color: colors.text,
              fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2rem' },
              opacity: whyUsVisible ? 1 : 0,
              transform: whyUsVisible ? 'translateY(0px)' : 'translateY(20px)',
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            ¿Por qué elegirnos?
          </Typography>

          {/* Subtítulo con animación */}
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
              px: { xs: 1, sm: 2, md: 0 },
              opacity: whyUsVisible ? 1 : 0,
              transform: whyUsVisible ? 'translateY(0px)' : 'translateY(20px)',
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDelay: '100ms'
            }}
          >
            Nuestra prioridad es ofrecer servicios odontológicos con un enfoque genuino en el bienestar de nuestra comunidad
          </Typography>

          {/* Grid de features con animaciones optimizadas */}
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
      </Box>
    </Container>
  );
};

export default HomeHero;