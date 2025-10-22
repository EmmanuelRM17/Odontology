import React, { useState } from 'react';
import {
    Box,
    Tab,
    Tabs,
    useMediaQuery,
    useTheme,
    Typography,
    Avatar,
    Paper
} from '@mui/material';
import {
    EmojiEvents as TrophyIcon,
    LocalHospital as ServiceIcon,
    People as PeopleIcon,
    Dashboard as DashboardIcon
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
            <Paper
                elevation={0}
                sx={{
                    mb: 4,
                    p: isMobile ? 2 : 3,
                    background: colors.paper,
                    borderRadius: '20px',
                    border: `1px solid ${colors.border}`,
                    boxShadow: colors.shadow
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        sx={{
                            width: isMobile ? 48 : 64,
                            height: isMobile ? 48 : 64,
                            background: colors.gradient,
                            boxShadow: `0 8px 24px rgba(25,118,210,0.3)`
                        }}
                    >
                        <DashboardIcon sx={{ fontSize: isMobile ? 28 : 36 }} />
                    </Avatar>
                    <Box>
                        <Typography
                            variant={isMobile ? 'h5' : 'h4'}
                            fontWeight={700}
                            color={colors.text}
                        >
                            Gestión de Gamificación
                        </Typography>
                        <Typography
                            variant="body2"
                            color={colors.secondaryText}
                            fontWeight={500}
                        >
                            Sistema de recompensas y puntos para pacientes
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Tabs Navigation */}
            <Paper
                elevation={0}
                sx={{
                    background: colors.paper,
                    borderRadius: '20px',
                    p: 0.5,
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
                            fontWeight: 600,
                            fontSize: isMobile ? '0.85rem' : '0.95rem',
                            textTransform: 'none',
                            minHeight: isMobile ? 56 : 64,
                            color: colors.secondaryText,
                            transition: 'all 0.3s ease',
                            mx: 0.5,
                            '&.Mui-selected': {
                                color: colors.primary,
                                background: colors.hover
                            }
                        },
                        '& .MuiTabs-indicator': {
                            display: 'none'
                        }
                    }}
                >
                    <Tab
                        icon={<TrophyIcon />}
                        iconPosition="start"
                        label="Recompensas"
                    />
                    <Tab
                        icon={<ServiceIcon />}
                        iconPosition="start"
                        label="Servicios"
                    />
                    <Tab
                        icon={<PeopleIcon />}
                        iconPosition="start"
                        label="Pacientes"
                    />
                </Tabs>
            </Paper>

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