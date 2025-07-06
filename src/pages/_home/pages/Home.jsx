import React, { useMemo, useState, useEffect } from 'react';
import { Box, useTheme, IconButton, Fade, CircularProgress } from '@mui/material';
import { Global } from '@emotion/react';
import { KeyboardArrowUp } from '@mui/icons-material';
import axios from 'axios';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

// Componentes de secciones
import HomeHero from './HomeHero';
import HomeServices from './HomeServices';
import HomeTestimonials from './HomeTestimonials';

// Utilidades
import { getThemeColors } from '../constants';

// Componente de scroll to top
const ScrollToTopButton = ({ colors }) => {
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
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

// Componente divisor de secciones
export const SectionDivider = ({ colors }) => (
  <Box
    sx={{
      width: '100%',
      height: '1px',
      background: colors.sectionDivider,
      my: { xs: 6, md: 8 },
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        width: '80px',
        height: '3px',
        background: colors.accentGradient,
        top: '-1px',
        left: '50%',
        transform: 'translateX(-50%)'
      }
    }}
  />
);

const Home = () => {
  const theme = useTheme();
  const { isDarkTheme } = useThemeContext();
  const [isPaused, setIsPaused] = useState(false);
  const [infoData, setInfoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener datos de la API
  useEffect(() => {
    const fetchInfoData = async () => {
      try {
        const response = await axios.get('https://back-end-4803.onrender.com/api/perfilEmpresa/infoHeader');
        setInfoData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al obtener información:', err);
        setError('No se pudo cargar la información');
      } finally {
        setLoading(false);
      }
    };

    fetchInfoData();

    // Opcional: refrescar cada cierto tiempo para mantener actualizado el horario
    const intervalId = setInterval(fetchInfoData, 60000); // Cada minuto

    return () => clearInterval(intervalId);
  }, []);

  // Calcular colores basados en el tema actual
  const colors = useMemo(() => getThemeColors(isDarkTheme), [isDarkTheme]);

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
      {/* Elementos decorativos de fondo optimizados */}
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
          animation: 'float 8s ease-in-out infinite',
          willChange: 'transform' // Optimización de rendimiento
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
          animation: 'float 12s ease-in-out infinite reverse',
          willChange: 'transform'
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: '40%',
          left: '30%',
          width: { xs: '80px', md: '150px' },
          height: { xs: '80px', md: '150px' },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.primary}05 0%, transparent 70%)`,
          zIndex: 0,
          animation: 'float 15s ease-in-out infinite',
          willChange: 'transform'
        }}
      />

      {/* Estilos globales para animaciones OPTIMIZADOS */}
      <Global
        styles={`
          /* Animaciones base optimizadas con hardware acceleration */
          @keyframes float {
            0% { 
              transform: translate3d(0, 0, 0) scale(1); 
            }
            50% { 
              transform: translate3d(0, -20px, 0) scale(1.05); 
            }
            100% { 
              transform: translate3d(0, 0, 0) scale(1); 
            }
          }
          
          /* Animaciones de entrada más fluidas */
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translate3d(0, 30px, 0);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }
          
          @keyframes fadeInLeft {
            from {
              opacity: 0;
              transform: translate3d(-30px, 0, 0);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }
          
          @keyframes fadeInRight {
            from {
              opacity: 0;
              transform: translate3d(30px, 0, 0);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }

          /* Animación de escalado suave */
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: translate3d(0, 0, 0) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0) scale(1);
            }
          }

          /* Animación de deslizamiento optimizada */
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translate3d(0, 40px, 0) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0) scale(1);
            }
          }

          /* Animación de pulso mejorada */
          @keyframes pulse {
            0% { 
              transform: scale(1);
              opacity: 1;
            }
            50% { 
              transform: scale(1.05);
              opacity: 0.8;
            }
            100% { 
              transform: scale(1);
              opacity: 1;
            }
          }

          /* Animación de gradiente suave */
          @keyframes gradientShift {
            0% { 
              background-position: 0% 0%; 
            }
            50% { 
              background-position: 100% 100%; 
            }
            100% { 
              background-position: 0% 0%; 
            }
          }
          
          /* Clases utilitarias optimizadas */
          .animate-fade-up {
            animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            will-change: transform, opacity;
          }
          
          .animate-fade-left {
            animation: fadeInLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            will-change: transform, opacity;
          }
          
          .animate-fade-right {
            animation: fadeInRight 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            will-change: transform, opacity;
          }

          .animate-scale-in {
            animation: scaleIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            will-change: transform, opacity;
          }

          .animate-slide-up {
            animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            will-change: transform, opacity;
          }

          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            will-change: transform;
          }

          /* Optimizaciones globales de rendimiento */
          * {
            box-sizing: border-box;
          }

          /* Smooth scrolling optimizado */
          html {
            scroll-behavior: smooth;
          }

          /* Prevenir layout shifts durante animaciones */
          .animation-container {
            contain: layout style paint;
          }

          /* Reducir motion para usuarios que lo prefieren */
          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
            
            .animate-fade-up,
            .animate-fade-left,
            .animate-fade-right,
            .animate-scale-in,
            .animate-slide-up {
              animation: none !important;
              opacity: 1 !important;
              transform: none !important;
            }
          }

          /* Optimizaciones para móviles */
          @media (max-width: 768px) {
            /* Reducir complejidad de animaciones en móviles */
            .float-animation {
              animation-duration: 10s !important;
            }
            
            /* Simplificar transforms en pantallas pequeñas */
            .complex-transform {
              transform: translateY(0) !important;
            }
          }

          /* Efectos de hover optimizados */
          .hover-lift {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            will-change: transform;
          }
          
          .hover-lift:hover {
            transform: translateY(-4px);
          }

          /* Efectos de focus mejorados para accesibilidad */
          .focus-visible {
            outline: 2px solid ${colors.primary};
            outline-offset: 2px;
            border-radius: 4px;
          }

          /* Transiciones suaves para cambios de tema */
          .theme-transition {
            transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
          }
        `}
      />

      {/* Componentes de secciones */}
      <HomeHero colors={colors} isPaused={isPaused} setIsPaused={setIsPaused} />
      <HomeServices colors={colors} setIsPaused={setIsPaused} />
      <HomeTestimonials colors={colors} infoData={infoData} />

    </Box>
  );
};

export default Home;