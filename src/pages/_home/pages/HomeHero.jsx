import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
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
  LocalHospital
} from '@mui/icons-material'; // Eliminé ChevronLeft y ChevronRight ya que no se usan
import { useThemeContext } from '../../../components/Tools/ThemeContext';

// Utilidades y constantes
import { useIntersectionObserver, DENTAL_BENEFITS, FEATURES_DATA } from '../constants';
import images from '../../../utils/imageLoader';
import SectionDivider from './SectionDivider';
// Componente BenefitItem optimizado
const BenefitItem = memo(({ benefit, index, animateServices, colors, isDarkTheme }) => {
  const Icon = benefit.icon;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Slide direction="right" in={animateServices} timeout={300 + (index * 150)}>
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
          <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600, fontSize: isMobile ? '0.8rem' : '0.85rem', mb: 0.2 }}>
            {benefit.title}
          </Typography>
          <Typography variant="caption" sx={{ color: colors.subtext, fontSize: isMobile ? '0.7rem' : '0.75rem', lineHeight: 1.2 }}>
            {benefit.description}
          </Typography>
        </Box>
      </Paper>
    </Slide>
  );
}, (prevProps, nextProps) => prevProps.benefit === nextProps.benefit && prevProps.animateServices === nextProps.animateServices);

// Componente FeatureCard OPTIMIZADO
const FeatureCard = memo(({ feature, index, isVisible, colors, isMobile }) => {
  const Icon = feature.icon;
  const cardStyles = useMemo(() => ({
    container: {
      '--delay': `${index * 120}ms`,
      '--translate-y': isVisible ? '0px' : '30px',
      '--scale': isVisible ? '1' : '0.95',
      '--opacity': isVisible ? '1' : '0',
      opacity: 'var(--opacity)',
      transform: `translateY(var(--translate-y)) scale(var(--scale))`,
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      transitionDelay: 'var(--delay)'
    },
    paper: {
      p: isMobile ? 2.5 : 3.5,
      height: '100%',
      borderRadius: '16px',
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      flexDirection: 'column',
      '&:hover': {
        backgroundColor: colors.cardHover,
        transform: 'translateY(-8px) scale(1.02)',
        boxShadow: colors.shadow,
        borderColor: colors.primary
      }
    },
    iconContainer: {
      '--icon-delay': `${(index * 120) + 200}ms`,
      '--icon-opacity': isVisible ? '1' : '0',
      '--icon-scale': isVisible ? '1' : '0.8',
      display: 'flex',
      justifyContent: 'center',
      mb: isMobile ? 2 : 3,
      opacity: 'var(--icon-opacity)',
      transform: `scale(var(--icon-scale))`,
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      transitionDelay: 'var(--icon-delay)'
    },
    iconBox: {
      width: isMobile ? 48 : 64,
      height: isMobile ? 48 : 64,
      borderRadius: '50%',
      background: colors.lightBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: colors.primary,
      mb: 1
    },
    title: {
      '--title-delay': `${(index * 120) + 300}ms`,
      '--title-opacity': isVisible ? '1' : '0',
      '--title-translate': isVisible ? '0px' : '15px',
      fontWeight: 600,
      color: colors.text,
      fontSize: isMobile ? '1rem' : '1.1rem',
      mb: isMobile ? 1.5 : 2,
      textAlign: 'center',
      opacity: 'var(--title-opacity)',
      transform: `translateY(var(--title-translate))`,
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      transitionDelay: 'var(--title-delay)'
    },
    description: {
      '--desc-delay': `${(index * 120) + 400}ms`,
      '--desc-opacity': isVisible ? '1' : '0',
      '--desc-translate': isVisible ? '0px' : '15px',
      color: colors.subtext,
      lineHeight: 1.6,
      fontSize: isMobile ? '0.85rem' : '0.95rem',
      textAlign: 'center',
      opacity: 'var(--desc-opacity)',
      transform: `translateY(var(--desc-translate))`,
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      transitionDelay: 'var(--desc-delay)'
    }
  }), [isVisible, colors, isMobile]);

  return (
    <Box sx={cardStyles.container}>
      <Paper elevation={0} sx={cardStyles.paper}>
        <Box sx={cardStyles.iconContainer}>
          <Box sx={cardStyles.iconBox}>
            <Icon sx={{ fontSize: isMobile ? '22px' : '28px' }} />
          </Box>
        </Box>
        <Typography variant="h6" sx={cardStyles.title}>{feature.title}</Typography>
        <Typography variant="body2" sx={cardStyles.description}>{feature.description}</Typography>
      </Paper>
    </Box>
  );
}, (prevProps, nextProps) =>
  prevProps.isVisible === nextProps.isVisible &&
  prevProps.index === nextProps.index &&
  prevProps.colors === nextProps.colors &&
  prevProps.isMobile === nextProps.isMobile &&
  prevProps.feature.title === nextProps.feature.title
);

// Componente ImageCarousel
const ImageCarousel = React.memo(({ images, isPaused, currentImageIndex, setCurrentImageIndex, colors }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isTransitioning, setIsTransitioning] = useState(false);

  const getNextIndex = useCallback(() => (currentImageIndex + 1) % images.length, [currentImageIndex, images.length]);

  const handleTransition = useCallback((newIndex) => {
    if (isTransitioning || images.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(newIndex);
      setIsTransitioning(false);
    }, 800);
  }, [isTransitioning, images.length, setCurrentImageIndex]);

  const nextImage = useCallback(() => handleTransition(getNextIndex()), [getNextIndex, handleTransition]);

  useEffect(() => {
    if (isPaused || images.length <= 1) return;
    const interval = setInterval(nextImage, 4000);
    return () => clearInterval(interval);
  }, [isPaused, nextImage, images.length]);

  if (!images || images.length === 0) {
    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No hay imágenes</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'visible' }}>
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
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
            transform: isTransitioning ? 'scale(1.05)' : 'scale(1)',
            opacity: isTransitioning ? 0.8 : 1,
            '&:hover': {
              transform: 'scale(1.03)',
              boxShadow: '0 12px 25px rgba(0, 0, 0, 0.3)',
              border: `3px solid ${colors.primary}80`
            }
          }}
          onClick={nextImage}
        >
          <img src={images[getNextIndex()]} alt="Preview" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
        </Box>
      )}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: isMobile ? '100%' : '90%',
          height: isMobile ? '100%' : '75%',
          borderRadius: 4,
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isTransitioning ? 'scale(1.02)' : 'scale(1)',
          opacity: isTransitioning ? 0.9 : 1,
          zIndex: 2,
          border: `4px solid ${colors.border}`,
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            border: `4px solid ${colors.primary}60`
          }
        }}
      >
        <img src={images[currentImageIndex]} alt="Main" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
      </Box>
    </Box>
  );
});

// Hook personalizado para manejar el estado de la sección "¿Por qué elegirnos?"
const useWhyChooseUsSection = () => {
  const [whyUsRef, whyUsVisible] = useIntersectionObserver({ threshold: 0.2, rootMargin: '100px' });
  const titleStyles = useMemo(() => ({
    title: {
      '--title-opacity': whyUsVisible ? '1' : '0',
      '--title-translate': whyUsVisible ? '0px' : '20px',
      fontWeight: 700,
      textAlign: 'center',
      fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2rem' },
      mb: { xs: 1.5, md: 2 },
      opacity: 'var(--title-opacity)',
      transform: `translateY(var(--title-translate))`,
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    subtitle: {
      '--subtitle-opacity': whyUsVisible ? '1' : '0',
      '--subtitle-translate': whyUsVisible ? '0px' : '20px',
      textAlign: 'center',
      maxWidth: '800px',
      mx: 'auto',
      mb: { xs: 3, sm: 4, md: 5 },
      fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
      lineHeight: 1.7,
      px: { xs: 1, sm: 2, md: 0 },
      opacity: 'var(--subtitle-opacity)',
      transform: `translateY(var(--subtitle-translate))`,
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      transitionDelay: '100ms'
    }
  }), [whyUsVisible]);

  return { whyUsRef, whyUsVisible, titleStyles };
};

// Componente principal HomeHero optimizado
const HomeHero = ({ colors, isPaused, setIsPaused }) => {
  const { isDarkTheme } = useThemeContext();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [animateServices, setAnimateServices] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { whyUsRef, whyUsVisible, titleStyles } = useWhyChooseUsSection();

  useEffect(() => {
    const timer = setTimeout(() => setAnimateServices(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const featuresGrid = useMemo(() => (
    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center" alignItems="stretch">
  {FEATURES_DATA.slice(0, 6).map((feature, index) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={`feature-${index}`}>
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'stretch' }}>
        <FeatureCard
          feature={feature}
          index={index}
          isVisible={whyUsVisible}
          colors={colors}
          isMobile={isMobile}
        />
      </Box>
    </Grid>
  ))}
</Grid>
  ), [whyUsVisible, colors, isMobile]);

  return (
    <Container maxWidth="lg" sx={{ px: 0, position: 'relative' }}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 3, sm: 4, md: 6 }} sx={{ alignItems: 'center', mb: { xs: 4, sm: 5, md: 8 } }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ py: { xs: 1, sm: 2, md: 3 } }}>
              <Badge badgeContent="Odontología" color="primary" sx={{ mb: { xs: 2, md: 3 }, '& .MuiBadge-badge': { fontSize: { xs: '0.65rem', md: '0.75rem' }, fontWeight: 600, textTransform: 'uppercase', px: { xs: 1.2, md: 1.5 }, py: { xs: 0.4, md: 0.5 }, borderRadius: '4px' } }} />
              <Typography variant="h3" component="h1" sx={{ fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3rem' }, fontWeight: 800, lineHeight: 1.2, mb: { xs: 2, md: 3 }, color: colors.text, letterSpacing: '-0.02em' }}>
                Consultorio Dental{' '}
                <Box component="span" sx={{ color: colors.primary, "&::after": { content: '""', position: 'absolute', width: '100%', height: { xs: 3, md: 4 }, bottom: { xs: -5, md: -6 }, left: 0, background: colors.accentGradient, borderRadius: '2px' } }}>
                  Carol
                </Box>
              </Typography>
              <Typography variant="subtitle1" sx={{ color: colors.subtext, fontWeight: 400, mb: { xs: 3, md: 4 }, fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.2rem' }, lineHeight: 1.7, maxWidth: '540px' }}>
                Tu dentista de confianza, con servicios accesibles y atención cálida para toda la familia. Comprometidos con la salud bucal de nuestros vecinos.
              </Typography>
              <Box sx={{ mt: 3, py: 2, display: { xs: 'flex', sm: 'none' }, flexDirection: 'column', alignItems: 'center', gap: 1.5, opacity: animateServices ? 1 : 0, transform: animateServices ? 'translateY(0px)' : 'translateY(20px)', transition: 'all 0.6s ease-out' }}>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: 45, height: 45, borderRadius: '50%', backgroundColor: colors.lightBg, color: colors.primary }}>
                    <MedicalServices sx={{ fontSize: '1.6rem' }} />
                  </Box>
                </Box>
                <Typography variant="subtitle1" align="center" sx={{ color: colors.text, fontWeight: 600, mb: 1, fontSize: '1rem' }}>Atención dental de calidad</Typography>
                <Typography variant="body2" align="center" sx={{ color: colors.subtext, maxWidth: '280px', mb: 1, fontSize: '0.85rem' }}>Nos preocupamos por ofrecerle los mejores servicios a precios accesibles</Typography>
              </Box>
              <Box sx={{ mt: { xs: 2, md: 3 }, p: { xs: 1.5, sm: 2 }, borderRadius: '12px', background: isDarkTheme ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.95)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', border: `1px solid ${colors.border}`, width: '100%', display: { xs: 'none', sm: 'block' }, opacity: animateServices ? 1 : 0, transform: animateServices ? 'translateY(0px)' : 'translateY(30px)', transition: 'all 0.6s ease-out', transitionDelay: '200ms' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <LocalHospital sx={{ color: colors.primary, fontSize: { xs: '1.1rem', md: '1.3rem' } }} />
                  <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem' } }}>Beneficios de la salud dental</Typography>
                </Box>
                <Divider sx={{ mb: 1.5, opacity: 0.6 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: 1, sm: 1.5 } }}>
                  {DENTAL_BENEFITS.map((benefit, index) => (
                    <BenefitItem key={index} benefit={benefit} index={index} animateServices={animateServices} colors={colors} isDarkTheme={isDarkTheme} />
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative', height: { xs: '280px', sm: '360px', md: '400px' }, width: '100%', borderRadius: 0 }}>
              <ImageCarousel images={images} isPaused={isPaused} currentImageIndex={currentImageIndex} setCurrentImageIndex={setCurrentImageIndex} colors={colors} />
            </Box>
          </Grid>
        </Grid>
        <SectionDivider colors={colors} />
        <Box ref={whyUsRef} sx={{ mb: { xs: 4, sm: 5, md: 8 }, contain: 'layout style' }}>
          <Typography variant="h4" sx={{ ...titleStyles.title, color: colors.text }}>¿Por qué elegirnos?</Typography>
          <Typography variant="subtitle1" sx={{ ...titleStyles.subtitle, color: colors.subtext }}>Nuestra prioridad es ofrecer servicios odontológicos con un enfoque genuino en el bienestar de nuestra comunidad</Typography>
          {featuresGrid}
        </Box>
        <SectionDivider colors={colors} />
      </Box>
    </Container>
  );
};

export default HomeHero;