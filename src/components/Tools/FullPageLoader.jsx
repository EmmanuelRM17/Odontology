import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  keyframes, 
  Paper,
  CircularProgress
} from '@mui/material';
import { 
  LocalHospital, 
  AccessTime,
  CheckCircleOutline,
  MedicalServices
} from '@mui/icons-material';

/**
 * Componente FullPageLoader - Pantalla de carga optimizada para aplicación dental
 * 
 * Características:
 * - Animaciones optimizadas para mejor rendimiento
 * - Diseño limpio con colores sólidos y contrastantes
 * - Efectos visuales simplificados para reducir lag
 * - Mantiene la funcionalidad de pasos de carga y consejos
 */

// Animación de rotación para los círculos de carga
const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Animación para el ícono central - simplificada
const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// Animación para los puntos de carga
const fadeInOut = keyframes`
  0% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.3;
  }
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
  
  // Paleta de colores moderna y limpia
  const colors = {
    primary: isDarkTheme ? '#2196F3' : '#0288D1',
    secondary: isDarkTheme ? '#03A9F4' : '#00BCD4',
    background: isDarkTheme ? '#1E2A3E' : '#FFFFFF',
    paper: isDarkTheme ? '#283546' : '#F5F9FF',
    text: isDarkTheme ? '#FFFFFF' : '#0277BD',
    secondaryText: isDarkTheme ? '#B0BEC5' : '#546E7A',
    success: '#4CAF50',
    border: isDarkTheme ? '#384B65' : '#E1F5FE',
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

  // Efecto para simular el progreso de carga
  useEffect(() => {
    if (!autoProgress) return;

    // Actualización de progreso
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 0.5;
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
    }, Math.floor(5000 / loadingSteps.length));

    // Rotación de consejos
    const tipInterval = setInterval(() => {
      setTip(prev => (prev + 1) % dentalTips.length);
    }, 4000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearInterval(tipInterval);
    };
  }, [autoProgress, loadingSteps.length]);

  // Renderizar icono de estado según la etapa actual
  const renderStepIcon = (index) => {
    if (index < currentStep) {
      return <CheckCircleOutline sx={{ color: colors.success, fontSize: 16 }} />;
    } else if (index === currentStep) {
      return <AccessTime sx={{ color: colors.primary, fontSize: 16, animation: `${pulse} 2s infinite` }} />;
    } else {
      return <CircularProgress size={14} sx={{ color: colors.secondary, opacity: 0.5 }} />;
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
        zIndex: 1300,
        overflow: 'hidden'
      }}
    >
      {/* Contenedor principal */}
      <Paper
        elevation={isDarkTheme ? 8 : 4}
        sx={{
          borderRadius: 4,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 380,
          width: '90%',
          backgroundColor: colors.paper,
          border: `1px solid ${colors.border}`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isDarkTheme 
            ? '0 8px 24px rgba(0,0,0,0.25)' 
            : '0 8px 24px rgba(0,0,0,0.08)'
        }}
      >
        {/* Contenedor de la animación de carga */}
        <Box
          sx={{
            position: 'relative',
            width: '110px',
            height: '110px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 3
          }}
        >
          {/* Círculo de carga exterior */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '3px solid transparent',
              borderTopColor: colors.primary,
              borderBottomColor: colors.primary,
              animation: `${rotate} 1.5s linear infinite`,
            }}
          />
          
          {/* Círculo de carga interior */}
          <Box
            sx={{
              position: 'absolute',
              width: '80%',
              height: '80%',
              borderRadius: '50%',
              border: '3px solid transparent',
              borderLeftColor: colors.secondary,
              borderRightColor: colors.secondary,
              animation: `${rotate} 2s linear infinite reverse`,
            }}
          />
          
          {/* Icono central */}
          <Box
            sx={{
              width: '55px',
              height: '55px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: isDarkTheme ? colors.background : '#FFFFFF',
              borderRadius: '50%',
              boxShadow: isDarkTheme 
                ? '0 4px 8px rgba(0,0,0,0.3)' 
                : '0 4px 8px rgba(0,0,0,0.08)',
              zIndex: 2,
              animation: `${pulse} 2s infinite ease-in-out`,
              border: `2px solid ${colors.border}`
            }}
          >
            {customIcon || (
              currentStep >= loadingSteps.length - 1 ? (
                <CheckCircleOutline 
                  sx={{ 
                    fontSize: 30, 
                    color: colors.success
                  }} 
                />
              ) : (
                <LocalHospital sx={{ fontSize: 30, color: colors.primary }} />
              )
            )}
          </Box>
        </Box>
        
        {/* Mensaje principal */}
        <Box sx={{ position: 'relative', width: '100%', textAlign: 'center', mb: 0.5 }}>
          <Typography
            variant="h6"
            sx={{
              color: colors.text,
              fontWeight: '500',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 0.5
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
                      width: '5px',
                      height: '5px',
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
        
        {/* Barra de progreso simplificada */}
        {showProgress && (
          <Box
            sx={{
              width: '100%',
              height: '4px',
              backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              borderRadius: '2px',
              overflow: 'hidden',
              mt: 1,
              mb: 3
            }}
          >
            <Box
              sx={{
                height: '100%',
                backgroundColor: colors.primary,
                width: `${progress}%`,
                borderRadius: '2px',
                transition: 'width 0.3s ease',
              }}
            />
          </Box>
        )}
        
        {/* Pasos de carga */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            width: '100%',
            gap: 1,
            mb: 3
          }}
        >
          {loadingSteps.map((step, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                opacity: index <= currentStep ? 1 : 0.6,
                transform: index <= currentStep ? 'translateX(0)' : 'translateX(-5px)',
                transition: 'all 0.3s ease',
              }}
            >
              {renderStepIcon(index)}
              <Typography
                variant="body2"
                sx={{
                  color: colors.secondaryText,
                  fontWeight: index === currentStep ? 500 : 400,
                }}
              >
                {step}
              </Typography>
            </Box>
          ))}
        </Box>
        
        {/* Consejo dental - simplificado */}
        {showTips && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              background: isDarkTheme ? 'rgba(33,150,243,0.08)' : 'rgba(3,169,244,0.06)',
              border: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              width: '100%'
            }}
          >
            <MedicalServices 
              sx={{ 
                color: colors.secondary,
                fontSize: 20 
              }} 
            />
            <Typography
              variant="body2"
              sx={{
                color: colors.secondaryText,
                fontWeight: '400',
                lineHeight: 1.4
              }}
            >
              {dentalTips[tip]}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default FullPageLoader;