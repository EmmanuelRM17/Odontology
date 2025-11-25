import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { LocalHospital } from '@mui/icons-material';

const LoadingScreen = ({ tituloPagina = "Cargando" }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #03427C 0%, #0256a8 50%, #03427C 100%)',
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      {/* Efectos de fondo */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(255,255,255,0.03) 0%, transparent 50%)',
          animation: 'pulse 4s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 0.5 },
            '50%': { opacity: 1 }
          }
        }}
      />

      {/* Contenedor principal */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ position: 'relative', textAlign: 'center' }}
      >
        {/* Círculo exterior decorativo */}
        <Box
          sx={{
            position: 'relative',
            display: 'inline-flex',
            mb: 3
          }}
        >
          {/* CircularProgress principal */}
          <CircularProgress
            size={140}
            thickness={3}
            sx={{
              color: '#fff',
              position: 'absolute',
              filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))'
            }}
          />
          
          {/* Círculo de fondo */}
          <Box
            sx={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255,255,255,0.2)'
            }}
          >
            {/* Icono */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <LocalHospital
                sx={{
                  fontSize: 60,
                  color: '#fff',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }}
              />
            </motion.div>
          </Box>
        </Box>

        {/* Título */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Typography
            variant="h4"
            sx={{
              color: '#fff',
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
              textAlign: 'center',
              mb: 1,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              letterSpacing: '-0.02em'
            }}
          >
            {tituloPagina}
          </Typography>
        </motion.div>

        {/* Subtítulo animado */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}
          >
            Por favor espera un momento...
          </Typography>
        </motion.div>
      </motion.div>
    </Box>
  );
};

export default LoadingScreen;