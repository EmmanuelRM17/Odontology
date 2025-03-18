import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  keyframes,
  CircularProgress,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import { 
  LocalHospital, 
  AccessTime,
  CheckCircleOutline,
  MedicalServices
} from '@mui/icons-material';

// Animaciones optimizadas
const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
`;

const fadeInOut = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
`;

const slideIn = keyframes`
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const FullPageLoader = ({ 
  message = "Cargando...", 
  showProgress = true,
  loadingSteps = ["Iniciando", "Cargando datos", "Preparando interfaz", "¡Listo!"],
  autoProgress = true,
  customIcon = null,
  showTips = true,
  isDarkTheme = false,
  ...props
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showLoadingDots, setShowLoadingDots] = useState(true);
  const [tip, setTip] = useState(0);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Paleta de colores profesional mejorada
  const colors = {
    // Colores principales
    primary: isDarkTheme ? '#1E88E5' : '#1976D2',
    secondary: isDarkTheme ? '#00B0FF' : '#0091EA',
    accent: isDarkTheme ? '#64B5F6' : '#42A5F5',
    
    // Fondos
    background: isDarkTheme ? '#121820' : '#FFFFFF',
    surface: isDarkTheme ? '#1E2A38' : '#F8FBFF',
    
    // Textos
    text: isDarkTheme ? '#FFFFFF' : '#0D47A1',
    secondaryText: isDarkTheme ? '#B0BEC5' : '#37474F',
    
    // Estados
    success: '#00C853',
    warning: '#FFD600',
    
    // Elementos UI
    border: isDarkTheme ? 'rgba(100, 181, 246, 0.12)' : 'rgba(25, 118, 210, 0.08)',
    shadow: isDarkTheme ? 'rgba(0, 0, 0, 0.4)' : 'rgba(25, 118, 210, 0.15)',
    
    // Gradientes
    gradientPrimary: isDarkTheme 
      ? 'linear-gradient(135deg, #1976D2 0%, #1E88E5 100%)'
      : 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
    gradientAccent: isDarkTheme 
      ? 'linear-gradient(90deg, rgba(30, 136, 229, 0.08) 0%, rgba(0, 176, 255, 0.12) 100%)'
      : 'linear-gradient(90deg, rgba(25, 118, 210, 0.04) 0%, rgba(0, 145, 234, 0.08) 100%)'
  };

  // Lista de consejos dentales
  const dentalTips = [
    "Cepille sus dientes al menos dos veces al día",
    "Use hilo dental diariamente para una limpieza completa",
    "Cambie su cepillo cada 3-4 meses",
    "Visite a su dentista al menos dos veces al año",
    "Limite el consumo de alimentos azucarados",
    "No use los dientes para abrir envases"
  ];

  // Efecto para simular el progreso de carga en 3 segundos
  useEffect(() => {
    if (!autoProgress) return;

    // Actualización rápida del progreso (completa en ~2.8 segundos)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.8; // Incremento ajustado
      });
    }, 50);

    // Actualización de etapas
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(stepInterval);
          setShowLoadingDots(false);
          return loadingSteps.length - 1;
        }
        return prev + 1;
      });
    }, Math.floor(2800 / loadingSteps.length)); // Se completa en ~2.8 segundos

    // Rotación de consejos 
    const tipInterval = setInterval(() => {
      setTip(prev => (prev + 1) % dentalTips.length);
    }, 1200); 

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearInterval(tipInterval);
    };
  }, [autoProgress, loadingSteps.length]);

  // Renderizar icono de estado según la etapa actual
  const renderStepIcon = (index) => {
    if (index < currentStep) {
      return <CheckCircleOutline sx={{ color: colors.success, fontSize: 18 }} />;
    } else if (index === currentStep) {
      return <AccessTime sx={{ color: colors.primary, fontSize: 18, animation: `${pulse} 1.5s infinite` }} />;
    } else {
      return <CircularProgress size={16} sx={{ color: colors.secondary, opacity: 0.5 }} />;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: colors.background,
        zIndex: 1500,
        overflow: 'hidden'
      }}
    >
      {/* Contenedor principal */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: isMobile ? '92%' : 520,
          width: '100%',
          position: 'relative',
          pt: 2,
          pb: 3,
          px: isMobile ? 2 : 4
        }}
      >
        {/* Contenedor de la animación de carga */}
        <Box
          sx={{
            position: 'relative',
            width: isMobile ? '140px' : '160px',
            height: isMobile ? '140px' : '160px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 4,
            mt: 2
          }}
        >
          {/* Círculo de carga exterior */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '4px solid transparent',
              borderTopColor: colors.primary,
              borderBottomColor: colors.primary,
              animation: `${rotate} 1.5s linear infinite`,
              opacity: 0.9
            }}
          />
          
          {/* Círculo de carga interior */}
          <Box
            sx={{
              position: 'absolute',
              width: '75%',
              height: '75%',
              borderRadius: '50%',
              border: '4px solid transparent',
              borderLeftColor: colors.secondary,
              borderRightColor: colors.secondary,
              animation: `${rotate} 2s linear infinite reverse`,
              opacity: 0.9
            }}
          />
          
          {/* Icono central */}
          <Box
            sx={{
              width: isMobile ? '70px' : '80px',
              height: isMobile ? '70px' : '80px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: isDarkTheme ? colors.surface : '#FFFFFF',
              borderRadius: '50%',
              boxShadow: `0 8px 32px ${colors.shadow}`,
              zIndex: 2,
              animation: `${pulse} 2s infinite ease-in-out`,
              border: `2px solid ${alpha(colors.primary, 0.15)}`
            }}
          >
            {customIcon || (
              currentStep >= loadingSteps.length - 1 ? (
                <CheckCircleOutline 
                  sx={{ 
                    fontSize: isMobile ? 36 : 42, 
                    color: colors.success
                  }} 
                />
              ) : (
                <LocalHospital sx={{ fontSize: isMobile ? 36 : 42, color: colors.primary }} />
              )
            )}
          </Box>
        </Box>
        
        {/* Mensaje principal */}
        <Box sx={{ position: 'relative', width: '100%', textAlign: 'center', mb: 2 }}>
          <Typography
            variant="h5"
            sx={{
              color: colors.text,
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 0.5,
              fontSize: isMobile ? '1.4rem' : '1.6rem',
              letterSpacing: '-0.01em'
            }}
          >
            {loadingSteps[currentStep] || message}
            
            {/* Puntos de carga animados */}
            {showLoadingDots && (
              <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                {[...Array(3)].map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: colors.text,
                      borderRadius: '50%',
                      animation: `${fadeInOut} 1.5s infinite`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                ))}
              </Box>
            )}
          </Typography>
        </Box>
        
        {/* Barra de progreso profesional */}
        {showProgress && (
          <Box
            sx={{
              width: '100%',
              height: '6px',
              backgroundColor: isDarkTheme ? alpha(colors.primary, 0.08) : alpha(colors.primary, 0.05),
              borderRadius: '3px',
              overflow: 'hidden',
              mt: 1,
              mb: 4
            }}
          >
            <Box
              sx={{
                height: '100%',
                background: colors.gradientPrimary,
                width: `${progress}%`,
                borderRadius: '3px',
                transition: 'width 0.15s ease-out',
                boxShadow: `0 1px 3px ${alpha(colors.primary, 0.3)}`
              }}
            />
          </Box>
        )}
        
        {/* Pasos de carga - Mejorados */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            width: '100%',
            gap: 1.5,
            mb: 4,
            px: isMobile ? 1 : 3
          }}
        >
          {loadingSteps.map((step, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                opacity: index <= currentStep ? 1 : 0.5,
                transform: index <= currentStep ? 'translateX(0)' : 'translateX(-5px)',
                transition: 'all 0.25s ease',
              }}
            >
              {renderStepIcon(index)}
              <Typography
                variant="body1"
                sx={{
                  color: index <= currentStep 
                    ? colors.text 
                    : colors.secondaryText,
                  fontWeight: index === currentStep ? 600 : 400,
                  fontSize: '0.95rem'
                }}
              >
                {step}
              </Typography>
            </Box>
          ))}
        </Box>
        
        {/* Consejo dental - Profesional y limpio */}
        {showTips && (
          <Box
            sx={{
              mt: 1,
              py: 2.5,
              px: 3,
              borderRadius: 2,
              background: colors.gradientAccent,
              border: `1px solid ${colors.border}`,
              width: '100%',
              animation: `${slideIn} 0.4s ease-out`,
              boxShadow: `0 6px 20px ${alpha(colors.shadow, 0.08)}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Elemento decorativo */}
            <Box 
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                background: colors.gradientPrimary
              }}
            />
            
            <Box sx={{ 
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              pl: 1
            }}>
              <MedicalServices 
                sx={{ 
                  color: colors.primary,
                  fontSize: 28,
                  mt: 0.5
                }} 
              />
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: isDarkTheme ? colors.accent : colors.primary,
                    fontWeight: 700,
                    mb: 0.5,
                    fontSize: '0.85rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  Consejo Dental
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: colors.text,
                    fontWeight: 400,
                    lineHeight: 1.6,
                    fontSize: '1rem'
                  }}
                >
                  {dentalTips[tip]}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FullPageLoader;