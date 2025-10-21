import React, { useState } from 'react';
import {
    Box,
    Tab,
    Tabs,
    useMediaQuery,
    useTheme,
    Typography,
    Avatar
} from '@mui/material';
import {
    EmojiEvents as TrophyIcon,
    LocalHospital as ServiceIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import Notificaciones from '../../../components/Layout/Notificaciones';
import RecompensaTab from './gamificacion/RecompensaTab';
import ServiciosTab from './gamificacion/ServiciosTab';
import PacientesTab from './gamificacion/PacientesTab';

const AdminGamificacion = () => {
    const { isDarkTheme } = useThemeContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [activeTab, setActiveTab] = useState(0);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        type: 'success'
    });

    // Paleta de colores
    const colors = {
        background: isDarkTheme ? '#0F1419' : '#F0F4F8',
        paper: isDarkTheme ? '#1A1F26' : '#FFFFFF',
        paperLight: isDarkTheme ? '#242B34' : '#F8FAFC',
        cardBg: isDarkTheme
            ? 'linear-gradient(135deg, rgba(30,39,71,0.6) 0%, rgba(21,25,52,0.8) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.95) 100%)',
        text: isDarkTheme ? '#E8F1FF' : '#1E293B',
        secondaryText: isDarkTheme ? '#94A3B8' : '#64748B',
        primary: isDarkTheme ? '#4B9FFF' : '#1976d2',
        primaryLight: isDarkTheme ? '#60A5FA' : '#2196f3',
        primaryDark: isDarkTheme ? '#3D7ECC' : '#0A4B94',
        success: isDarkTheme ? '#5CDB5C' : '#4CAF50',
        warning: isDarkTheme ? '#F59E0B' : '#ff9800',
        error: isDarkTheme ? '#ff6b6b' : '#f44336',
        border: isDarkTheme ? 'rgba(148,163,184,0.1)' : 'rgba(148,163,184,0.2)',
        hover: isDarkTheme ? 'rgba(75,159,255,0.1)' : 'rgba(25,118,210,0.05)',
        gradient: isDarkTheme
            ? 'linear-gradient(135deg, #4B9FFF 0%, #1976d2 100%)'
            : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
        gradientAlt: isDarkTheme
            ? 'linear-gradient(135deg, #5CDB5C 0%, #4CAF50 100%)'
            : 'linear-gradient(135deg, #66bb6a 0%, #4CAF50 100%)',
        gradientWarning: isDarkTheme
            ? 'linear-gradient(135deg, #F59E0B 0%, #ff9800 100%)'
            : 'linear-gradient(135deg, #ffa726 0%, #ff9800 100%)',
        shadow: isDarkTheme
            ? '0 20px 60px -15px rgba(0,0,0,0.6)'
            : '0 20px 60px -15px rgba(25,118,210,0.15)',
        glassBlur: 'blur(20px)'
    };

    // Mostrar notificación
    const showNotif = (message, type = 'success') => {
        setNotification({ open: true, message, type });
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: colors.background,
                p: isMobile ? 2 : isTablet ? 3 : 4
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    mb: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        sx={{
                            width: isMobile ? 48 : 64,
                            height: isMobile ? 48 : 64,
                            background: colors.gradient,
                            fontSize: isMobile ? '1.5rem' : '2rem'
                        }}
                    >
                        🎮
                    </Avatar>
                    <Box>
                        <Typography
                            variant={isMobile ? 'h5' : 'h4'}
                            fontWeight={800}
                            color={colors.text}
                        >
                            Administración de Gamificación
                        </Typography>
                        <Typography
                            variant="body2"
                            color={colors.secondaryText}
                            fontWeight={600}
                        >
                            Gestiona recompensas, servicios y pacientes
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Tabs Navigation */}
            <Box
                sx={{
                    background: colors.paper,
                    borderRadius: '24px',
                    p: 1,
                    mb: 3,
                    boxShadow: colors.shadow,
                    border: `1px solid ${colors.border}`
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant={isMobile ? 'fullWidth' : 'standard'}
                    sx={{
                        '& .MuiTab-root': {
                            borderRadius: '16px',
                            fontWeight: 700,
                            fontSize: isMobile ? '0.85rem' : '1rem',
                            textTransform: 'none',
                            minHeight: isMobile ? 56 : 64,
                            color: colors.secondaryText,
                            transition: 'all 0.3s ease',
                            '&.Mui-selected': {
                                color: colors.primary,
                                background: colors.hover
                            }
                        },
                        '& .MuiTabs-indicator': {
                            height: 4,
                            borderRadius: '4px 4px 0 0',
                            background: colors.gradient
                        }
                    }}
                >
                    <Tab
                        icon={<TrophyIcon />}
                        iconPosition="start"
                        label={isMobile ? 'Recompensa' : '🏆 Recompensa'}
                    />
                    <Tab
                        icon={<ServiceIcon />}
                        iconPosition="start"
                        label={isMobile ? 'Servicios' : '💊 Servicios'}
                    />
                    <Tab
                        icon={<PersonIcon />}
                        iconPosition="start"
                        label={isMobile ? 'Pacientes' : '👥 Pacientes'}
                    />
                </Tabs>
            </Box>

            {/* Tab Content */}
            <Box>
                {activeTab === 0 && (
                    <RecompensaTab
                        colors={colors}
                        isMobile={isMobile}
                        isTablet={isTablet}
                        showNotif={showNotif}
                    />
                )}
                {activeTab === 1 && (
                    <ServiciosTab
                        colors={colors}
                        isMobile={isMobile}
                        isTablet={isTablet}
                        showNotif={showNotif}
                    />
                )}
                {activeTab === 2 && (
                    <PacientesTab
                        colors={colors}
                        isMobile={isMobile}
                        isTablet={isTablet}
                        showNotif={showNotif}
                    />
                )}
            </Box>

            {/* Notificaciones */}
            <Notificaciones
                open={notification.open}
                message={notification.message}
                type={notification.type}
                handleClose={() => setNotification({ ...notification, open: false })}
            />
        </Box>
    );
};

export default AdminGamificacion;