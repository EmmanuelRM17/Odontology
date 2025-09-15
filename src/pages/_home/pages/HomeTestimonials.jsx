import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Container,
  Paper,
  Fade,
  useMediaQuery,
  useTheme,
  Avatar,
  Rating,
  Skeleton,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import { Star, ChevronLeft, ChevronRight, FormatQuote, Verified, CalendarToday } from '@mui/icons-material';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import { useIntersectionObserver } from '../constants';
import ContactButtons from './Steps/ContactButtons';

// Componente de skeleton mejorado
const TestimonialSkeleton = ({ colors }) => (
  <Card elevation={0} sx={{ height: 320, borderRadius: 4, border: `1px solid ${colors.border}`, backgroundColor: colors.cardBg, overflow: 'hidden' }}>
    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Skeleton variant="rectangular" width={120} height={24} sx={{ mb: 2, borderRadius: 1 }} />
      <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" height={20} sx={{ mb: 3 }} />
      <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center' }}>
        <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
        <Box>
          <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="40%" height={16} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// Componente de tarjeta de testimonio renovado
const TestimonialCard = ({ testimonial, index, isVisible, colors, isDarkTheme }) => {
  const getInitials = (name) => name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  const avatarColors = [
    { bg: isDarkTheme ? '#4B9FFF20' : '#E3F2FD', color: isDarkTheme ? '#4B9FFF' : '#1976D2' },
    { bg: isDarkTheme ? '#10B98120' : '#E8F5E8', color: isDarkTheme ? '#10B981' : '#059669' },
    { bg: isDarkTheme ? '#F59E0B20' : '#FFF3E0', color: isDarkTheme ? '#F59E0B' : '#F57C00' },
    { bg: isDarkTheme ? '#EF444420' : '#FFEBEE', color: isDarkTheme ? '#EF4444' : '#D32F2F' },
  ];
  const avatarColor = avatarColors[index % avatarColors.length];

  return (
    <Fade in={isVisible} timeout={600 + (index * 200)}>
      <Card
        elevation={0}
        sx={{
          height: '100%',
          borderRadius: 4,
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.cardBg,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: isDarkTheme ? '0 8px 25px rgba(0,0,0,0.3)' : '0 8px 25px rgba(0,0,0,0.1)',
            borderColor: colors.primary,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: colors.primary,
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover::before': {
            opacity: 1,
          },
        }}
      >
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Rating
              value={testimonial.rating}
              readOnly
              size="small"
              sx={{
                '& .MuiRating-iconFilled': { color: '#FFD700' },
                '& .MuiRating-iconEmpty': { color: colors.border },
              }}
            />
            <FormatQuote sx={{ fontSize: 24, color: colors.border, opacity: 0.5 }} />
          </Box>
          <Typography
            variant="body2"
            sx={{ color: colors.text, lineHeight: 1.7, fontSize: '0.95rem', flex: 1, mb: 3, fontStyle: 'italic' }}
          >
            {testimonial.testimonial}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto', pt: 2, borderTop: `1px solid ${colors.border}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Avatar
                sx={{
                  bgcolor: isDarkTheme ? avatarColor.bg + '20' : avatarColor.bg,
                  color: avatarColor.color,
                  width: 48,
                  height: 48,
                  mr: 2,
                  fontSize: '1rem',
                  fontWeight: 700,
                  border: `2px solid ${avatarColor.color}20`,
                }}
              >
                {getInitials(testimonial.name)}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.primary, fontSize: '0.9rem', mb: 0.5 }}>
                  {testimonial.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarToday sx={{ fontSize: 12, color: colors.subtext }} />
                  <Typography variant="caption" sx={{ color: colors.subtext, fontSize: '0.75rem' }}>
                    {formatDate(testimonial.date)}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Chip
              icon={<Verified sx={{ fontSize: 14 }} />}
              label="Verificado"
              size="small"
              sx={{
                bgcolor: isDarkTheme ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)',
                color: isDarkTheme ? '#10B981' : '#059669',
                border: `1px solid ${isDarkTheme ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.2)'}`,
                fontSize: '0.7rem',
                height: 22,
                '& .MuiChip-icon': { fontSize: 12 },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

// Componente slider para móvil mejorado
const MobileTestimonialSlider = ({ testimonials, testimonialVisible, colors, isDarkTheme }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  const prevTestimonial = () => setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));

  if (testimonials.length === 0) return null;

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box sx={{ mb: 3, minHeight: 320 }}>
        <TestimonialCard
          testimonial={testimonials[currentIndex]}
          index={currentIndex}
          isVisible={testimonialVisible}
          colors={colors}
          isDarkTheme={isDarkTheme}
        />
      </Box>
      {testimonials.length > 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', top: '50%', left: -16, right: -16, transform: 'translateY(-50%)', zIndex: 10, pointerEvents: 'none' }}>
            <IconButton
              onClick={prevTestimonial}
              sx={{
                backgroundColor: colors.cardBg,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                color: colors.primary,
                width: 44,
                height: 44,
                border: `1px solid ${colors.border}`,
                pointerEvents: 'auto',
                '&:hover': {
                  backgroundColor: colors.primary,
                  color: 'white',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              onClick={nextTestimonial}
              sx={{
                backgroundColor: colors.cardBg,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                color: colors.primary,
                width: 44,
                height: 44,
                border: `1px solid ${colors.border}`,
                pointerEvents: 'auto',
                '&:hover': {
                  backgroundColor: colors.primary,
                  color: 'white',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 3 }}>
            {testimonials.map((_, idx) => (
              <Box
                key={`indicator-${idx}`}
                onClick={() => setCurrentIndex(idx)}
                sx={{
                  width: idx === currentIndex ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: idx === currentIndex ? colors.primary : colors.border,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: colors.primary,
                    transform: 'scale(1.2)',
                  },
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

// Componente principal HomeTestimonials renovado
const HomeTestimonials = ({ colors }) => {
  const theme = useTheme();
  const { isDarkTheme } = useThemeContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [testimonialRef, testimonialVisible] = useIntersectionObserver();
  const [ctaRef, ctaVisible] = useIntersectionObserver();

  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://back-end-4803.onrender.com/api/resenya/get', { cache: 'force-cache' });
      if (!response.ok) throw new Error('Error al cargar testimoniales');
      const data = await response.json();
      const activeTestimonials = data
        .filter(item => item.estado === 'Habilitado')
        .map(item => ({
          id: item.reseñaId,
          name: `${item.nombre} ${item.aPaterno || ''} ${item.aMaterno || ''}`.trim(),
          rating: item.calificacion,
          testimonial: item.comentario,
          date: item.fecha_creacion,
        }))
        .sort(() => Math.random() - 0.5)
        .slice(0, isMobile ? 3 : 6);
      setTestimonials(activeTestimonials);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar los testimonios');
      console.error('Error al cargar testimoniales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [isMobile]);

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Box ref={testimonialRef} sx={{ mb: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Chip
            label="Testimonios"
            sx={{
              bgcolor: isDarkTheme ? 'rgba(75,159,255,0.15)' : 'rgba(25,118,210,0.1)',
              color: colors.primary,
              fontWeight: 600,
              mb: 2,
              border: `1px solid ${isDarkTheme ? 'rgba(75,159,255,0.3)' : 'rgba(25,118,210,0.2)'}`,
            }}
          />
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, mb: 2, color: colors.text, fontSize: { xs: '2rem', md: '2.5rem' } }}
          >
            Lo que dicen nuestros pacientes
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: colors.subtext,
              maxWidth: 600,
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.1rem' },
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            Experiencias reales de pacientes satisfechos que confían en nuestra atención dental de calidad
          </Typography>
        </Box>
        {loading ? (
          isMobile ? (
            <TestimonialSkeleton colors={colors} />
          ) : (
            <Grid container spacing={4}>
              {Array(3)
                .fill()
                .map((_, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <TestimonialSkeleton colors={colors} />
                  </Grid>
                ))}
            </Grid>
          )
        ) : error ? (
          <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 3 }}>
            <Typography variant="h6" color={colors.text} gutterBottom>
              {error}
            </Typography>
            <Typography variant="body2" color={colors.subtext}>
              Intenta recargar la página o vuelve más tarde
            </Typography>
          </Paper>
        ) : testimonials.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 3 }}>
            <Star sx={{ fontSize: 48, color: colors.primary, mb: 2 }} />
            <Typography variant="h6" color={colors.text} gutterBottom>
              Próximamente
            </Typography>
            <Typography variant="body2" color={colors.subtext}>
              Estamos recopilando testimonios de nuestros pacientes
            </Typography>
          </Paper>
        ) : (
          isMobile ? (
            <MobileTestimonialSlider
              testimonials={testimonials}
              testimonialVisible={testimonialVisible}
              colors={colors}
              isDarkTheme={isDarkTheme}
            />
          ) : (
            <Grid container spacing={4}>
              {testimonials.map((testimonial, index) => (
                <Grid item xs={12} md={4} key={testimonial.id}>
                  <TestimonialCard
                    testimonial={testimonial}
                    index={index}
                    isVisible={testimonialVisible}
                    colors={colors}
                    isDarkTheme={isDarkTheme}
                  />
                </Grid>
              ))}
            </Grid>
          )
        )}
      </Box>
      <Box
        ref={ctaRef}
        sx={{
          p: { xs: 4, md: 6 },
          borderRadius: 3,
          backgroundColor: colors.primary,
          color: 'white',
          textAlign: 'center',
          boxShadow: isDarkTheme ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(25,118,210,0.2)',
          transform: ctaVisible ? 'translateY(0)' : 'translateY(30px)',
          opacity: ctaVisible ? 1 : 0,
          transition: 'all 0.8s ease',
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
              ¿Necesitas atención dental?
            </Typography>
            <Typography
              variant="body1"
              sx={{ opacity: 0.95, fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.6, maxWidth: 600, mx: 'auto' }}
            >
              Agenda tu cita y descubre la atención dental de calidad que mereces.
            </Typography>
          </Box>
          <ContactButtons colors={colors} isDarkTheme={isDarkTheme} isCTA={true} showLabels={true} />
        </Stack>
      </Box>
    </Container>
  );
};

export default HomeTestimonials;