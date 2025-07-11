import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Card, 
  Container,
  Fade,
  useTheme,
  useMediaQuery,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import { 
  SecurityOutlined, 
  HistoryOutlined,
  DashboardOutlined 
} from '@mui/icons-material';
import LoginAttemptsReport from './LoginAttemptsReport';
import LogsReport from './LogsReport';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

// Configuración de pestañas
const TABS_CONFIG = [
  {
    id: 0,
    label: 'Intentos de Login',
    icon: SecurityOutlined,
    description: 'Monitoreo de intentos de acceso al sistema',
    color: '#2196f3'
  },
  {
    id: 1,
    label: 'Auditoría del Sistema',
    icon: HistoryOutlined,
    description: 'Registro de actividades y eventos del sistema',
    color: '#ff9800'
  }
];

const Reportes = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const { isDarkTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Configuración de colores dinámicos
  const colors = {
    background: isDarkTheme ? '#0f1419' : '#f8fafc',
    cardBg: isDarkTheme ? '#1e293b' : '#ffffff',
    headerBg: isDarkTheme ? '#334155' : '#ffffff',
    text: isDarkTheme ? '#f1f5f9' : '#1e293b',
    secondaryText: isDarkTheme ? '#94a3b8' : '#64748b',
    primary: isDarkTheme ? '#3b82f6' : '#2563eb',
    accent: isDarkTheme ? '#06b6d4' : '#0891b2',
    shadow: isDarkTheme 
      ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' 
      : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: isDarkTheme ? '#374151' : '#e2e8f0',
    tabActive: isDarkTheme ? '#3b82f6' : '#2563eb',
    tabHover: isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.05)'
  };

  // Manejar cambio de pestaña
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Renderizar contenido de pestaña
  const renderTabContent = () => {
    const activeTab = TABS_CONFIG[selectedTab];
    
    return (
      <Fade in={true} timeout={300}>
        <Box>
          {selectedTab === 0 && <LoginAttemptsReport />}
          {selectedTab === 1 && <LogsReport />}
        </Box>
      </Fade>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.background}dd 100%)`,
        py: { xs: 2, md: 4 }
      }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <DashboardOutlined sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                sx={{
                  fontWeight: 700,
                  color: colors.text,
                  fontFamily: '"Inter", "Roboto", sans-serif',
                  letterSpacing: '-0.02em'
                }}
              >
                Centro de Reportes
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: colors.secondaryText,
                  fontWeight: 400,
                  mt: 0.5
                }}
              >
                Monitoreo y análisis de la actividad del sistema
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ borderColor: colors.border, my: 3 }} />
        </Box>

        {/* Navigation Tabs */}
        <Card
          elevation={0}
          sx={{
            background: colors.headerBg,
            border: `1px solid ${colors.border}`,
            borderRadius: 3,
            overflow: 'hidden',
            mb: 3,
            boxShadow: colors.shadow
          }}
        >
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            sx={{
              minHeight: 64,
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.accent} 100%)`
              },
              '& .MuiTabs-root': {
                minHeight: 64
              }
            }}
          >
            {TABS_CONFIG.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = selectedTab === tab.id;
              
              return (
                <Tab
                  key={tab.id}
                  icon={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconComponent 
                        sx={{ 
                          fontSize: 20,
                          color: isActive ? colors.tabActive : colors.secondaryText,
                          transition: 'color 0.2s ease'
                        }} 
                      />
                      {!isMobile && (
                        <Chip
                          size="small"
                          label="Nuevo"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            bgcolor: isActive ? colors.primary : colors.border,
                            color: isActive ? 'white' : colors.secondaryText,
                            transition: 'all 0.2s ease',
                            '& .MuiChip-label': {
                              px: 1
                            }
                          }}
                        />
                      )}
                    </Box>
                  }
                  label={
                    <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? colors.tabActive : colors.text,
                          fontSize: isMobile ? '0.875rem' : '0.95rem',
                          transition: 'color 0.2s ease'
                        }}
                      >
                        {tab.label}
                      </Typography>
                      {!isMobile && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: colors.secondaryText,
                            display: 'block',
                            fontSize: '0.75rem',
                            mt: 0.25,
                            opacity: isActive ? 1 : 0.7,
                            transition: 'opacity 0.2s ease'
                          }}
                        >
                          {tab.description}
                        </Typography>
                      )}
                    </Box>
                  }
                  iconPosition="start"
                  sx={{
                    minHeight: 64,
                    px: { xs: 2, md: 3 },
                    textTransform: 'none',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    '&:hover': {
                      backgroundColor: colors.tabHover,
                    },
                    '&.Mui-selected': {
                      backgroundColor: colors.tabHover,
                    },
                    transition: 'all 0.2s ease'
                  }}
                />
              );
            })}
          </Tabs>
        </Card>

        {/* Content Area */}
        <Card
          elevation={0}
          sx={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: colors.shadow,
            minHeight: 500
          }}
        >
          {renderTabContent()}
        </Card>
      </Container>
    </Box>
  );
};

export default Reportes;