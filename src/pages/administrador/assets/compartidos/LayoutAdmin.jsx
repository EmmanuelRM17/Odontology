import React, { useState, useEffect } from 'react';
import BarraAdmin from './BarraAdmin';
import FooterAdmin from './FooterAdmin';
import { Box, useMediaQuery, useTheme, Paper } from '@mui/material';
import { useThemeContext } from '../../../../components/Tools/ThemeContext';

const LayoutAdmin = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isDarkTheme } = useThemeContext();
  
  // Recibir estado del drawer desde BarraAdmin
  const handleDrawerChange = (isOpen, isCollapsed = false) => {
    setDrawerOpen(isOpen);
    setDrawerCollapsed(isCollapsed);
  };
  
  // Inicializar estado del drawer según el tamaño de pantalla
  useEffect(() => {
    setDrawerOpen(!isMobile);
    setDrawerCollapsed(false);
  }, [isMobile]);
  
  const colors = {
    background: isDarkTheme ? '#0F172A' : '#F8FAFC', // Fondo elegante para el contenido
    boxShadow: isDarkTheme ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)',
    border: isDarkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    contentBg: isDarkTheme ? '#1A1F2C' : '#FFFFFF'
  };

  // Cálculo del margen izquierdo basado en estado del drawer
  const getMarginLeft = () => {
    if (isMobile) return 0;
    if (!drawerOpen) return 0;
    return drawerCollapsed ? '68px' : '280px';
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: colors.background,
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s ease'
      }}
    >
      <BarraAdmin onDrawerChange={handleDrawerChange} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: '64px',
          '@media (max-width: 600px)': {
            mt: '56px', // Altura más pequeña en móviles
          },
          ml: getMarginLeft(),
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          p: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Paper
          elevation={0}
          sx={{
            backgroundColor: colors.contentBg,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: colors.boxShadow,
            border: `1px solid ${colors.border}`,
            p: { xs: 2, sm: 3 },
            height: '100%',
            minHeight: 'calc(100vh - 180px)' // Altura ajustada para evitar desbordamiento
          }}
        >
          {children}
        </Paper>
      </Box>
      
      <Box
        component="footer"
        sx={{
          ml: getMarginLeft(),
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <FooterAdmin />
      </Box>
    </Box>
  );
};

export default LayoutAdmin;