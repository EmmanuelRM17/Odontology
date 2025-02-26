import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tab, 
  Tabs, 
  Card, 
  CardContent, 
  IconButton, 
  CircularProgress,
  Fade,
  useTheme,
  useMediaQuery 
} from '@mui/material';
import { 
  FaUserShield, 
  FaFileAlt, 
  FaExclamationTriangle, 
  FaFileContract, 
  FaBuilding,
  FaChevronUp 
} from 'react-icons/fa';
import AvisoDePrivacidad from './politicas/AvisoPriva';
import DeslindeLegal from './politicas/DeslindeLegal';
import TerminosCondiciones from './politicas/TermiCondicion';
import { Link } from 'react-router-dom';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const Configuracion = () => {
  const [selectedTab, setSelectedTab] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { isDarkTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabChange = (event, newValue) => {
    setLoading(true);
    setSelectedTab(newValue);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const colors = {
    background: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
    cardBg: isDarkTheme ? '#243447' : '#FFFFFF',
    primary: '#0052A3',
    text: isDarkTheme ? '#FFFFFF' : '#333333',
    subtext: isDarkTheme ? '#E0E0E0' : '#666666',
    hover: isDarkTheme ? 'rgba(3,66,124,0.3)' : 'rgba(3,66,124,0.1)',
    tabBg: isDarkTheme ? '#2C3E50' : '#FFFFFF',
    selectedTabBg: isDarkTheme ? '#03427c' : 'rgba(3,66,124,0.1)',
    border: isDarkTheme ? '#34495E' : '#E0E0E0'
  };

  const tabs = [
    { 
      label: 'Política de Privacidad', 
      icon: <FaFileAlt size={20} />,
      component: AvisoDePrivacidad
    },
    { 
      label: 'Deslinde Legal', 
      icon: <FaExclamationTriangle size={20} />,
      component: DeslindeLegal
    },
    { 
      label: 'Términos y Condiciones', 
      icon: <FaFileContract size={20} />,
      component: TerminosCondiciones
    }
  ];

  const renderTabContent = () => {
    if (selectedTab === -1) {
      return (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            color: colors.text
          }}
        >
          <Typography variant="h6">
            Selecciona una opción para ver su contenido
          </Typography>
        </Box>
      );
    }

    const SelectedComponent = tabs[selectedTab].component;
    return <SelectedComponent />;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDarkTheme 
          ? 'linear-gradient(135deg, #1B2A3A 0%, #243447 100%)'
          : 'linear-gradient(135deg, #F9FDFF 0%, #E3F2FD 100%)',
        p: { xs: 2, sm: 4 },
        transition: 'all 0.3s ease'
      }}
    >
      <Box
        sx={{
          maxWidth: '1200px',
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 4
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: isDarkTheme ? '#FFFFFF' : colors.primary,
            textAlign: 'center',
            fontSize: { xs: '1.75rem', sm: '2.5rem' },
            mb: 3,
            textShadow: isDarkTheme ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none'
          }}
        >
          Configuración de la Empresa
        </Typography>

        <Card
          elevation={isDarkTheme ? 4 : 1}
          sx={{
            borderRadius: '16px',
            bgcolor: colors.cardBg,
            overflow: 'hidden',
            border: isDarkTheme ? `1px solid ${colors.border}` : 'none'
          }}
        >
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            centered={!isMobile}
            sx={{
              bgcolor: colors.tabBg,
              borderBottom: 1,
              borderColor: colors.border,
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 500,
                color: colors.text,
                '&:hover': {
                  backgroundColor: colors.hover,
                },
                '&.Mui-selected': {
                  color: isDarkTheme ? '#FFFFFF' : colors.primary,
                  backgroundColor: colors.selectedTabBg,
                  fontWeight: 600
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: colors.primary,
                height: 3
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>

          <CardContent 
            sx={{ 
              p: { xs: 2, sm: 4 },
              bgcolor: colors.cardBg
            }}
          >
            {loading ? (
              <Box 
                sx={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '400px',
                  gap: 2
                }}
              >
                <CircularProgress size={30} sx={{ color: colors.primary }} />
                <Typography sx={{ color: colors.text }}>
                  Cargando...
                </Typography>
              </Box>
            ) : (
              <Box sx={{ minHeight: '400px', color: colors.text }}>
                {renderTabContent()}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Botones flotantes */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          zIndex: 1000
        }}
      >
        {showScrollTop && (
          <Fade in={showScrollTop}>
            <IconButton
              onClick={scrollToTop}
              sx={{
                bgcolor: colors.primary,
                color: '#FFFFFF',
                '&:hover': {
                  bgcolor: colors.primary,
                  opacity: 0.9,
                  transform: 'translateY(-4px)'
                },
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }}
            >
              <FaChevronUp />
            </IconButton>
          </Fade>
        )}

        <IconButton
          component={Link}
          to="/Administrador/PerfilEmpresa"
          sx={{
            bgcolor: colors.primary,
            color: '#FFFFFF',
            p: 2,
            '&:hover': {
              bgcolor: colors.primary,
              opacity: 0.9,
              transform: 'translateY(-4px)'
            },
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}
        >
          <FaBuilding size={24} />
        </IconButton>
        
        <Typography
          variant="caption"
          sx={{
            color: colors.text,
            fontSize: '0.75rem',
            fontWeight: 500,
            textAlign: 'center',
            px: 1,
            py: 0.5,
            bgcolor: colors.cardBg,
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          Perfil Empresa
        </Typography>
      </Box>
    </Box>
  );
};

export default Configuracion;