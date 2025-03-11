import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material';
import { AccessTime, WbSunny, NightsStay, Info } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useThemeContext } from '../../../../components/Tools/ThemeContext';

/**
 * Componente para mostrar los horarios de atención con visualización mejorada
 * Presenta los horarios de forma clara incluso cuando hay múltiples turnos
 */
const HorariosAtencion = ({ colors, titleAnimationVariants, staggerItemVariants }) => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Procesar los horarios para separar múltiples turnos
  const procesarHorarios = (horariosData) => {
    return horariosData.map(item => {
      // Si hay múltiples horarios, separarlos
      if (item.horas && item.horas !== 'Cerrado') {
        const turnos = item.horas.split(', ').map(turno => {
          const [inicio, fin] = turno.split('-');
          const horaInicio = parseInt(inicio.trim().split(':')[0]);
          return {
            horario: turno.trim(),
            esMañana: horaInicio < 12,
            esTarde: horaInicio >= 12 && horaInicio < 18,
            esNoche: horaInicio >= 18
          };
        });
        
        return { ...item, turnos };
      }
      return { ...item, turnos: [] };
    });
  };

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        const response = await fetch(`https://back-end-4803.onrender.com/api/perfilEmpresa/horarios-atencion`);
        
        if (!response.ok) {
          throw new Error(`Error al obtener horarios: ${response.status}`);
        }
        
        const data = await response.json();
        const horariosFormateados = procesarHorarios(data.horarios || []);
        setHorarios(horariosFormateados);
      } catch (error) {
        console.error('Error al cargar horarios:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHorarios();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="warning" sx={{ mb: 1.5, fontSize: '0.85rem' }}>
        No se pudieron cargar los horarios.
      </Alert>
    );
  }

  // Determinar el diseño basado en el dispositivo
  const getGridColumns = () => {
    if (isMobile) return 2; // En móviles: 2 columnas
    if (isTablet) return 4; // En tablets: 4 columnas
    return 7; // En desktop: 7 columnas (un día por columna)
  };

  const columns = getGridColumns();
  
  // Filtrar días para mostrar según el diseño
  const displayedHorarios = isMobile 
    ? horarios.filter(h => h.estado === 'abierto' || h.esHoy).slice(0, 4) // En móvil solo mostrar días abiertos o el día actual
    : horarios;

  // Obtener el día actual
  const hoyIndex = horarios.findIndex(h => h.esHoy);

  return (
    <>
      <motion.div variants={titleAnimationVariants}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: colors.primaryText,
            mb: 2.5,
            textAlign: 'center',
            position: 'relative',
            fontSize: isMobile ? '1.2rem' : '1.5rem',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              height: '3px',
              background: colors.accentGradient,
              borderRadius: '2px',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <AccessTime sx={{ color: colors.primaryColor, fontSize: isMobile ? '1.2rem' : '1.5rem' }} />
            Horarios de Atención
          </Box>
        </Typography>
      </motion.div>

      {/* Destacar el horario de hoy para mayor visibilidad */}
      {hoyIndex >= 0 && (
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Chip 
            label={horarios[hoyIndex].estado === 'abierto' 
              ? `Hoy ${horarios[hoyIndex].dia}: ${horarios[hoyIndex].horas}` 
              : `Hoy ${horarios[hoyIndex].dia}: Cerrado`}
            sx={{
              fontSize: '0.9rem',
              py: 0.7,
              px: 1,
              backgroundColor: horarios[hoyIndex].estado === 'abierto' 
                ? (isDarkTheme ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)')
                : (isDarkTheme ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'),
              color: horarios[hoyIndex].estado === 'abierto' ? colors.success : colors.error,
              fontWeight: 600,
              border: `1px solid ${horarios[hoyIndex].estado === 'abierto' ? colors.success : colors.error}`
            }}
          />
        </Box>
      )}

      {/* Vista de horarios mejorada */}
      <motion.div variants={staggerItemVariants}>
        <Box sx={{ maxWidth: '100%', mx: 'auto', mb: 2 }}>
          <Grid container spacing={isMobile ? 1 : 2} justifyContent="center">
            {displayedHorarios.map((item, index) => (
              <Grid item xs={6/columns} sm={12/columns} key={index}>
                <motion.div
                  whileHover={{ y: -5, boxShadow: "0 8px 15px rgba(0,0,0,0.1)" }}
                  transition={{ duration: 0.2 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      height: '100%',
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: '10px',
                      border: `1px solid ${colors.divider}`,
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      boxShadow: isDarkTheme ? '0 4px 10px rgba(0,0,0,0.2)' : '0 4px 10px rgba(37,99,235,0.08)',
                      background: item.estado === 'abierto'
                        ? (isDarkTheme ? 'linear-gradient(145deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.02) 100%)' : 'linear-gradient(145deg, rgba(16, 185, 129, 0.03) 0%, rgba(5, 150, 105, 0.01) 100%)')
                        : (isDarkTheme ? 'linear-gradient(145deg, rgba(244, 63, 94, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%)' : 'linear-gradient(145deg, rgba(244, 63, 94, 0.03) 0%, rgba(239, 68, 68, 0.01) 100%)'),
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        background: item.estado === 'abierto'
                          ? (isDarkTheme ? 'linear-gradient(90deg, #10B981, #059669)' : 'linear-gradient(90deg, #059669, #10B981)')
                          : (isDarkTheme ? 'linear-gradient(90deg, #F43F5E, #EF4444)' : 'linear-gradient(90deg, #EF4444, #F43F5E)')
                      },
                      // Resaltar el día actual
                      ...(item.esHoy && {
                        border: `1px solid ${item.estado === 'abierto' ? colors.success : colors.error}`,
                        boxShadow: isDarkTheme 
                          ? `0 4px 12px rgba(0,0,0,0.25)` 
                          : `0 4px 12px rgba(37,99,235,0.1)`,
                      })
                    }}
                  >
                    {/* Día de la semana y estado */}
                    <Box sx={{ mb: 1.5, textAlign: 'center', width: '100%' }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: colors.primaryText,
                          mb: 0.5,
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.5
                        }}
                      >
                        {isMobile ? item.dia.substring(0, 3) : item.dia}
                        {item.esHoy && (
                          <Chip 
                            label="Hoy" 
                            size="small" 
                            sx={{ 
                              ml: 0.5, 
                              height: 16, 
                              fontSize: '0.6rem', 
                              fontWeight: 600,
                              px: 0.5,
                              backgroundColor: colors.primaryColor,
                              color: 'white' 
                            }} 
                          />
                        )}
                      </Typography>

                      <Chip
                        label={item.estado === 'abierto' ? 'Abierto' : 'Cerrado'}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          backgroundColor: item.estado === 'abierto'
                            ? 'rgba(5, 150, 105, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                          color: item.estado === 'abierto' ? colors.success : colors.error,
                          fontSize: '0.65rem',
                          height: 20,
                          px: 0.5
                        }}
                      />
                    </Box>

                    {/* Visualización mejorada de horarios */}
                    {item.estado === 'cerrado' ? (
                      <Box
                        sx={{
                          width: '100%',
                          py: 1.5,
                          borderRadius: '8px',
                          background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(37,99,235,0.05)',
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: colors.error,
                            fontSize: '0.8rem'
                          }}
                        >
                          Cerrado
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          borderRadius: '8px',
                          background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(37,99,235,0.05)',
                          padding: 1.5,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Indicador pulsante para día abierto */}
                        {item.esHoy && item.estaAbiertoAhora && (
                          <motion.div
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: colors.success
                            }}
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.7, 1, 0.7]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        )}

                        {/* Mostrar cada turno separado claramente */}
                        {item.turnos && item.turnos.map((turno, i) => (
                          <Box 
                            key={i}
                            sx={{ 
                              mb: i < item.turnos.length - 1 ? 1 : 0,
                              pb: i < item.turnos.length - 1 ? 1 : 0,
                              borderBottom: i < item.turnos.length - 1 ? `1px dashed ${colors.divider}` : 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}
                          >
                            {/* Icono según turno (mañana/tarde/noche) */}
                            {turno.esMañana ? (
                              <WbSunny sx={{ color: '#f59e0b', fontSize: '1rem' }} />
                            ) : turno.esTarde ? (
                              <WbSunny sx={{ color: '#d97706', fontSize: '1rem' }} />
                            ) : (
                              <NightsStay sx={{ color: '#4f46e5', fontSize: '1rem' }} />
                            )}
                            
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: colors.primaryText,
                                fontSize: '0.85rem'
                              }}
                            >
                              {turno.horario}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </motion.div>

      {/* Ver todos los horarios en móvil, si hay días ocultos */}
      {isMobile && horarios.length > 4 && (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography 
            variant="body2" 
            color="primary"
            sx={{ 
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Ver todos los horarios
          </Typography>
        </Box>
      )}

      {/* Información para pacientes - versión compacta */}
      <motion.div variants={staggerItemVariants}>
        <Box
          sx={{
            p: 2,
            borderRadius: '10px',
            background: `linear-gradient(to right, ${isDarkTheme ? 'rgba(59, 130, 246, 0.08)' : 'rgba(37, 99, 235, 0.03)'} 0%, ${isDarkTheme ? 'rgba(59, 130, 246, 0.03)' : 'rgba(37, 99, 235, 0.01)'} 100%)`,
            border: `1px solid ${isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.05)'}`,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            maxWidth: '100%',
            mx: 'auto'
          }}
        >
          <Info color="primary" sx={{ fontSize: isMobile ? 18 : 20, mt: 0.2 }} />
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: colors.primaryText,
                mb: 0.5,
                fontSize: isMobile ? '0.85rem' : '0.9rem'
              }}
            >
              Información para pacientes
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: colors.secondaryText,
                lineHeight: 1.5,
                fontSize: isMobile ? '0.75rem' : '0.8rem'
              }}
            >
              Para una mejor atención, recomendamos agendar cita con anticipación. En caso de urgencias, llame directamente al consultorio.
            </Typography>
          </Box>
        </Box>
      </motion.div>
    </>
  );
};

export default HorariosAtencion;