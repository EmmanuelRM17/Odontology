import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Skeleton,
  Tooltip
} from '@mui/material';
import { 
  FaMapMarkerAlt, 
  FaClock, 
  FaPhoneAlt, 
  FaExclamationCircle 
} from 'react-icons/fa';
import axios from 'axios';
import { useThemeContext } from '../../components/Tools/ThemeContext';

// Componente para la barra de información
const InfoBar = () => {
  const { isDarkTheme } = useThemeContext();
  const [infoData, setInfoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInfoData = async () => {
      try {
        setLoading(true);
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
    const intervalId = setInterval(fetchInfoData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Determinar si está abierto ahora
  const isOpenNow = () => {
    if (!infoData || !infoData.horarioHoy.estaAbierto) return false;
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    return infoData.horarioHoy.horarios.some(horario => {
      const [horaInicio, horaFin] = horario.split(' - ');
      return currentTime >= horaInicio && currentTime <= horaFin;
    });
  };

  const openStatus = infoData ? isOpenNow() : false;

  return (
    <Box
      sx={{
        background: isDarkTheme 
          ? "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)"
          : "linear-gradient(180deg, #1d4ed8 0%, #1e3a8a 100%)",
        color: "#FFFFFF",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "12px 16px",
        fontSize: "0.875rem",
        flexWrap: "wrap",
        gap: { xs: 2, sm: 3 },
        boxShadow: isDarkTheme 
          ? "0 4px 20px rgba(0,0,0,0.4)"
          : "0 4px 20px rgba(30,64,175,0.3)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
          animation: "slideShine 3s ease-in-out infinite",
          zIndex: 1
        },
        "& > *": {
          position: "relative",
          zIndex: 2
        },
        "@keyframes slideShine": {
          "0%": { 
            left: "-100%",
            opacity: 0
          },
          "20%": {
            opacity: 1
          },
          "80%": {
            opacity: 1
          },
          "100%": { 
            left: "100%",
            opacity: 0
          }
        }
      }}
    >
      {/* 📍 Dirección */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <FaMapMarkerAlt
          style={{
            color: isDarkTheme ? "#22d3ee" : "#67e8f9"
          }}
          size={16}
        />
        {loading ? (
          <Skeleton variant="text" width={150} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
        ) : error ? (
          <Typography
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              color: "#fca5a5"
            }}
          >
            Error al cargar dirección
          </Typography>
        ) : (
          <Tooltip title={infoData?.direccion || ""} arrow placement="bottom">
            <Typography
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                letterSpacing: "0.3px",
                fontWeight: 500,
                '&:hover': {
                  color: isDarkTheme ? "#67e8f9" : "#a7f3d0",
                  transition: "color 0.2s ease"
                }
              }}
            >
              {infoData?.direccionCorta || "Cargando..."}
            </Typography>
          </Tooltip>
        )}
      </Box>

      <Box
        sx={{
          display: { xs: "none", sm: "block" },
          mx: 2,
          opacity: 0.4,
          color: isDarkTheme ? "#94a3b8" : "#e2e8f0"
        }}
      >
        |
      </Box>

      {/* ⏰ Horario */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <FaClock
          style={{
            color: isDarkTheme ? "#a78bfa" : "#c4b5fd"
          }}
          size={14}
        />
        {loading ? (
          <Skeleton variant="text" width={120} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
        ) : error ? (
          <Typography
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              color: "#fca5a5"
            }}
          >
            Error al cargar horario
          </Typography>
        ) : (
          <Tooltip
            title={
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Horario de {infoData?.horarioHoy.dia}:
                </Typography>
                {infoData?.horarioHoy.horarios.map((h, i) => (
                  <Typography key={i} variant="body2">
                    {h}
                  </Typography>
                ))}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
                  <Box 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%',
                      bgcolor: openStatus ? '#22c55e' : '#ef4444'
                    }} 
                  />
                  <Typography variant="caption">
                    {openStatus ? 'Abierto ahora' : 'Cerrado ahora'}
                  </Typography>
                </Box>
              </>
            }
            arrow
            placement="bottom"
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  letterSpacing: "0.2px",
                  fontWeight: 500
                }}
              >
                {infoData?.horarioGeneral || "Horario no disponible"}
              </Typography>
              
              <Box 
                sx={{ 
                  ml: 1,
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%',
                  bgcolor: openStatus ? '#22c55e' : '#ef4444'
                }} 
              />
            </Box>
          </Tooltip>
        )}
      </Box>

      <Box
        sx={{
          display: { xs: "none", sm: "block" },
          mx: 2,
          opacity: 0.4,
          color: isDarkTheme ? "#94a3b8" : "#e2e8f0"
        }}
      >
        |
      </Box>

      {/* 📞 Teléfono */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <FaPhoneAlt
          style={{
            color: isDarkTheme ? "#34d399" : "#6ee7b7"
          }}
          size={14}
        />
        {loading ? (
          <Skeleton variant="text" width={90} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
        ) : error ? (
          <Typography
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              color: "#fca5a5"
            }}
          >
            Error al cargar teléfono
          </Typography>
        ) : (
          <Typography
            component="a"
            href={`tel:${infoData?.telefono || ''}`}
            sx={{
              textDecoration: "none",
              color: isDarkTheme ? "#34d399" : "#6ee7b7",
              fontWeight: "600",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              transition: "all 0.3s ease",
              "&:hover": {
                color: isDarkTheme ? "#6ee7b7" : "#a7f3d0",
                transform: "scale(1.03)"
              }
            }}
          >
            {infoData?.telefono || "N/A"}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default InfoBar;