import React, { useEffect, useState, useContext } from 'react';
import { 
  Box, 
  Typography, 
  keyframes, 
  useTheme,
  Fade,
  CircularProgress,
  Paper
} from '@mui/material';
import { 
  MedicalServices, 
  LocalHospital, 
  AccessTime,
  CheckCircleOutline
} from '@mui/icons-material';

/**
 * Componente FullPageLoader - Pantalla de carga personalizada para aplicación dental
 * 
 * Características:
 * - Animaciones fluidas y profesionales
 * - Compatibilidad con tema claro/oscuro
 * - Múltiples etapas de carga con indicadores visuales
 * - Mensaje personalizable y dinámico
 * - Efectos visuales mejorados con gradientes y sombras
 * - Props adicionales:
 *   - isDarkTheme: boolean - Forzar tema oscuro/claro
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

// Animación de brillo pulsante para el icono central
const pulse = keyframes`
  0% {
    filter: drop-shadow(0 0 5px rgba(0, 183, 255, 0.3));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 15px rgba(0, 183, 255, 0.7));
    transform: scale(1.05);
  }
  100% {
    filter: drop-shadow(0 0 5px rgba(0, 183, 255, 0.3));
    transform: scale(1);
  }
`;

// Animación para la aparición de los puntos de carga
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

// Animación para el movimiento de las partículas decorativas
const float = keyframes`
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
  100% {
    transform: translateY(0px) rotate(0deg);
  }
`;

// Animación para el texto que se escribe
const typewriter = keyframes`
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
`;

// Animación para la barra de progreso
const progressBarAnimation = keyframes`
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
`;

const FullPageLoader = ({ 
  message = "Cargando...", 
  showProgress = true,
  loadingSteps = ["Iniciando", "Cargando datos", "Preparando interfaz", "¡Listo!"],
  autoProgress = true,
  customIcon = null,
  showTips = true,
  isDarkTheme: propIsDarkTheme = false, // Valor predeterminado
  ...props
}) => {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showLoadingDots, setShowLoadingDots] = useState(true);
  const [tip, setTip] = useState(0);
  
  // Usar el tema proporcionado como prop directamente
  const isDarkTheme = propIsDarkTheme;

  // Lista de consejos dentales para mostrar durante la carga
  const dentalTips = [
    "Cepille sus dientes al menos dos veces al día",
    "Use hilo dental diariamente para una limpieza completa",
    "Cambie su cepillo cada 3-4 meses",
    "Visite a su dentista al menos dos veces al año",
    "Limite el consumo de alimentos azucarados",
    "No use los dientes para abrir envases"
  ];

  // Efecto para simular el progreso automático de carga
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

  // Calcular colores según el tema
  const getBackgroundColor = () => {
    return isDarkTheme
      ? 'linear-gradient(180deg, rgba(18,25,38,0.97) 0%, rgba(14,20,33,0.98) 100%)'
      : 'linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(240,247,255,0.98) 100%)';
  };

  const getPrimaryColor = () => {
    return isDarkTheme ? '#0288D1' : '#00BCD4';
  };

  const getSecondaryColor = () => {
    return isDarkTheme ? '#5C6BC0' : '#2196F3';
  };

  const getTextColor = () => {
    return isDarkTheme ? 'rgba(255,255,255,0.9)' : '#0288D1';
  };

  const getSecondaryTextColor = () => {
    return isDarkTheme ? 'rgba(255,255,255,0.6)' : '#546E7A';
  };

  // Renderizar icono de estado según la etapa actual
  const renderStepIcon = (index) => {
    if (index < currentStep) {
      return <CheckCircleOutline sx={{ color: 'success.main', fontSize: 16 }} />;
    } else if (index === currentStep) {
      return <AccessTime sx={{ color: getPrimaryColor(), fontSize: 16, animation: `${pulse} 2s infinite` }} />;
    } else {
      return <CircularProgress size={14} sx={{ color: getSecondaryColor(), opacity: 0.5 }} />;
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
        background: getBackgroundColor(),
        backdropFilter: 'blur(10px)',
        zIndex: 1300,
        overflow: 'hidden'
      }}
    >
      {/* Elementos decorativos flotantes */}
      {[...Array(6)].map((_, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            width: theme.spacing(index % 2 ? 4 : 6),
            height: theme.spacing(index % 2 ? 4 : 6),
            borderRadius: '50%',
            background: `radial-gradient(circle, ${getPrimaryColor()}33, ${getSecondaryColor()}22)`,
            top: `${10 + (index * 15)}%`,
            left: `${5 + (index * 15)}%`,
            animation: `${float} ${4 + index}s infinite ease-in-out`,
            animationDelay: `${index * 0.5}s`,
            opacity: 0.4,
            filter: 'blur(2px)'
          }}
        />
      ))}
      
      {/* Contenedor principal con papel para dar profundidad */}
      <Paper
        elevation={isDarkTheme ? 4 : 8}
        sx={{
          borderRadius: 4,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 380,
          width: '90%',
          backgroundColor: isDarkTheme ? 'rgba(30, 40, 60, 0.6)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: isDarkTheme ? '1px solid rgba(255,255,255,0.1)' : 'none',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isDarkTheme 
            ? '0 10px 30px rgba(0,0,0,0.3)' 
            : '0 10px 30px rgba(0,150,220,0.1)'
        }}
      >
        {/* Círculo de brillo decorativo detrás del loader */}
        <Box
          sx={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${getPrimaryColor()}22 0%, transparent 70%)`,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 0,
            filter: 'blur(20px)',
            animation: `${pulse} 4s infinite ease-in-out`
          }}
        />

        {/* Contenedor de la animación de carga */}
        <Box
          sx={{
            position: 'relative',
            width: '120px',
            height: '120px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 3,
            zIndex: 1
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
              borderTopColor: getPrimaryColor(),
              borderBottomColor: getPrimaryColor(),
              animation: `${rotate} 1.5s linear infinite`,
              boxShadow: `0 0 10px ${getPrimaryColor()}66`,
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
              borderLeftColor: getSecondaryColor(),
              borderRightColor: getSecondaryColor(),
              animation: `${rotate} 2s linear infinite reverse`,
              boxShadow: `0 0 10px ${getSecondaryColor()}66`,
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
              backgroundColor: isDarkTheme ? 'rgba(40, 50, 70, 0.9)' : 'white',
              borderRadius: '50%',
              boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
              zIndex: 2,
              animation: `${pulse} 2s infinite ease-in-out`,
              transition: 'all 0.3s ease',
              border: `2px solid ${getPrimaryColor()}22`
            }}
          >
            {customIcon || (
              currentStep >= loadingSteps.length - 1 ? (
                <CheckCircleOutline 
                  sx={{ 
                    fontSize: 30, 
                    color: 'success.main',
                    animation: `${pulse} 1s infinite ease-in-out`
                  }} 
                />
              ) : (
                <LocalHospital sx={{ fontSize: 30, color: getPrimaryColor() }} />
              )
            )}
          </Box>
        </Box>
        
        {/* Mensaje principal animado */}
        <Box sx={{ position: 'relative', width: '100%', textAlign: 'center', mb: 0.5 }}>
          <Typography
            variant="h6"
            sx={{
              color: getTextColor(),
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
                      backgroundColor: getTextColor(),
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
        
        {/* Barra de progreso */}
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
                background: `linear-gradient(90deg, ${getPrimaryColor()} 0%, ${getSecondaryColor()} 100%)`,
                width: `${progress}%`,
                borderRadius: '2px',
                transition: 'width 0.3s ease',
                boxShadow: `0 0 5px ${getPrimaryColor()}66`,
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
                transform: index <= currentStep ? 'translateX(0)' : 'translateX(-10px)',
                transition: 'all 0.3s ease',
              }}
            >
              {renderStepIcon(index)}
              <Typography
                variant="body2"
                sx={{
                  color: getSecondaryTextColor(),
                  fontWeight: index === currentStep ? 500 : 400,
                }}
              >
                {step}
              </Typography>
            </Box>
          ))}
        </Box>
        
        {/* Consejo dental */}
        {showTips && (
          <Fade in={true} timeout={1000}>
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                background: isDarkTheme ? 'rgba(0,120,212,0.1)' : 'rgba(0,183,255,0.1)',
                border: `1px solid ${isDarkTheme ? 'rgba(0,120,212,0.2)' : 'rgba(0,183,255,0.2)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                width: '100%'
              }}
            >
              <MedicalServices 
                sx={{ 
                  color: getSecondaryColor(),
                  fontSize: 20 
                }} 
              />
              <Typography
                variant="body2"
                sx={{
                  color: getSecondaryTextColor(),
                  fontWeight: '400',
                  lineHeight: 1.4,
                  overflow: 'hidden',
                  position: 'relative',
                  whiteSpace: 'nowrap',
                }}
              >
                <Box
                  sx={{
                    animation: `${typewriter} 3s steps(40, end)`,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    borderRight: `1px solid ${getSecondaryColor()}`,
                    paddingRight: 1,
                    width: 0,
                    display: 'inline-block',
                  }}
                >
                  {dentalTips[tip]}
                </Box>
              </Typography>
            </Box>
          </Fade>
        )}
      </Paper>
    </Box>
  );
};

export default FullPageLoader;