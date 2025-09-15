import React, { useMemo, useState, useEffect, lazy, Suspense } from 'react';
import { Box, useTheme, IconButton, Fade, CircularProgress } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';
import axios from 'axios';
import { Global } from '@emotion/react';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

// Utilidades
import { getThemeColors } from '../constants';

// Lazy loading de componentes pesados
const HomeHero = lazy(() => import('./HomeHero'));
const HomeServices = lazy(() => import('./HomeServices'));
const HomeTestimonials = lazy(() => import('./HomeTestimonials'));

// Componente de scroll to top
const ScrollToTopButton = ({ colors }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Fade in={isVisible}>
      <IconButton
        onClick={scrollToTop}
        aria-label="Volver arriba"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          backgroundColor: colors.primary,
          color: 'white',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            backgroundColor: colors.primary,
            opacity: 0.9,
            transform: 'translateY(-3px)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        <KeyboardArrowUp />
      </IconButton>
    </Fade>
  );
};

const Home = () => {
  const theme = useTheme();
  const { isDarkTheme } = useThemeContext();
  const [isPaused, setIsPaused] = useState(false);
  const [infoData, setInfoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener datos de la API con caché local y debounce
  useEffect(() => {
    let cachedData = localStorage.getItem('infoData');
    if (cachedData) {
      setInfoData(JSON.parse(cachedData));
      setLoading(false);
    }

    const fetchInfoData = async () => {
      try {
        const response = await axios.get('https://back-end-4803.onrender.com/api/perfilEmpresa/infoHeader', {
          cache: 'force-cache',
          headers: { 'Cache-Control': 'max-age=900' }
        });
        setInfoData(response.data);
        localStorage.setItem('infoData', JSON.stringify(response.data));
        setError(null);
      } catch (err) {
        console.error('Error al obtener información:', err);
        if (cachedData) {
          setInfoData(JSON.parse(cachedData));
          setError(null); 
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInfoData();

    const intervalId = setInterval(fetchInfoData, 900000); // 15 minutos
    return () => clearInterval(intervalId);
  }, []);

  // Calcular colores con memoización
  const colors = useMemo(() => getThemeColors(isDarkTheme), [isDarkTheme]);

  // Reducir animaciones decorativas en móviles con memoización
  const renderDecorations = useMemo(() => {
    if (theme.breakpoints.down('sm')) return null;
    return (
      <>
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: { xs: '150px', md: '300px' },
            height: { xs: '150px', md: '300px' },
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colors.primary}10 0%, transparent 70%)`,
            zIndex: 0,
            animation: 'float 8s ease-in-out infinite'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            left: '8%',
            width: { xs: '100px', md: '200px' },
            height: { xs: '100px', md: '200px' },
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colors.primary}08 0%, transparent 70%)`,
            zIndex: 0,
            animation: 'float 12s ease-in-out infinite reverse'
          }}
        />
      </>
    );
  }, [colors, theme]);

  return (
    <Box
      sx={{
        background: colors.background,
        pt: { xs: 3, md: 4 },
        pb: { xs: 5, md: 6 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Global
        styles={`
          @keyframes float {
            0% { transform: translate3d(0, 0, 0) scale(1); }
            50% { transform: translate3d(0, -20px, 0) scale(1.05); }
            100% { transform: translate3d(0, 0, 0) scale(1); }
          }

          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          }

          @media (max-width: 768px) {
            .float-animation { animation-duration: 10s !important; }
          }
        `}
      />

      {renderDecorations}

      <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress color="primary" /></Box>}>
        <HomeHero colors={colors} isPaused={isPaused} setIsPaused={setIsPaused} />
        <HomeServices colors={colors} setIsPaused={setIsPaused} />
        <HomeTestimonials colors={colors} infoData={infoData} />
      </Suspense>

      <Suspense fallback={null}>
        <ScrollToTopButton colors={colors} />
      </Suspense>

      {loading && (
        <Box sx={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2000 }}>
          <CircularProgress color="primary" />
        </Box>
      )}
      {error && !infoData && (
        <Box sx={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2000, color: colors.text, background: colors.cardBg, p: 2, borderRadius: 4 }}>
          {error}
        </Box>
      )}
    </Box>
  );
};

export default Home;