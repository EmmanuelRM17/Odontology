import React, { useState } from 'react';
import BarraAdmin from './BarraAdmin';
import FooterAdmin from './FooterAdmin';
import { Box, useMediaQuery, useTheme, Paper } from '@mui/material';
import { useThemeContext } from '../../../../components/Tools/ThemeContext';

const LayoutAdmin = ({ children }) => {
  // Recibimos el estado del drawer a través de onDrawerChange
  const [drawerOpen, setDrawerOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isDarkTheme } = useThemeContext();

  const handleDrawerChange = (isOpen) => {
    setDrawerOpen(isOpen);
  };

  const colors = {
    background: isDarkTheme ? '#0F172A' : '#F8FAFC',
    boxShadow: isDarkTheme ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)',
    border: isDarkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: colors.background,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <BarraAdmin onDrawerChange={handleDrawerChange} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: '64px',
          '@media (max-width: 600px)': { mt: '56px' },
          // En escritorio se desplaza el contenido si el drawer está abierto
          ml: isMobile ? 0 : (drawerOpen ? '280px' : '0'),
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          p: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Paper
          elevation={0}
          sx={{
            backgroundColor: isDarkTheme ? '#1A1F2C' : '#FFFFFF',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: colors.boxShadow,
            border: `1px solid ${colors.border}`,
            p: { xs: 2, sm: 3 },
            height: '100%',
            minHeight: 'calc(100vh - 180px)'
          }}
        >
          {children}
        </Paper>
      </Box>
      <Box
        component="footer"
        sx={{
          ml: isMobile ? 0 : (drawerOpen ? '280px' : '0'),
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <FooterAdmin />
      </Box>
    </Box>
  );
};

export default LayoutAdmin;
