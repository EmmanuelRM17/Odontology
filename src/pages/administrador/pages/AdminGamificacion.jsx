import React, { useState, useMemo, lazy, Suspense, useEffect, useRef, useCallback, memo } from 'react';
import {
    Box,
    Tab,
    Tabs,
    useMediaQuery,
    useTheme,
    Typography,
    Avatar,
    Paper,
    CircularProgress,
    alpha
} from '@mui/material';
import {
    EmojiEvents as TrophyIcon,
    LocalHospital as ServiceIcon,
    People as PeopleIcon,
    Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import Notificaciones from '../../../components/Layout/Notificaciones';

// Lazy load de tabs para optimización
const RecompensaTab = lazy(() => import('./gamificacion/RecompensaTab'));
const ServiciosTab = lazy(() => import('./gamificacion/ServiciosTab'));
const PacientesTab = lazy(() => import('./gamificacion/PacientesTab'));

// Loader memoizado para tabs
const TabLoader = memo(() => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={40} />
    </Box>
));

// Configuración de tabs
const TABS_CONFIG = [
    { icon: TrophyIcon, label: 'Recompensas', index: 0 },
    { icon: ServiceIcon, label: 'Servicios', index: 1 },
    { icon: PeopleIcon, label: 'Pacientes', index: 2 }
];

const AdminGamificacion = () => {
    const { isDarkTheme } = useThemeContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [activeTab, setActiveTab] = useState(0);
    const [loadedTabs, setLoadedTabs] = useState(new Set([0]));
    const changeTimeout = useRef(null);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        type: 'success'
    });

    // Paleta de colores memoizada
    const colors = useMemo(() => ({
        background: isDarkTheme ? '#0F1419' : '#F0F4F8',
        paper: isDarkTheme ? '#1A1F26' : '#FFFFFF',
        paperLight: isDarkTheme ? '#242B34' : '#F8FAFC',
        text: isDarkTheme ? '#E8F1FF' : '#1E293B',
        secondaryText: isDarkTheme ? '#94A3B8' : '#64748B',
        primary: isDarkTheme ? '#4B9FFF' : '#1976d2',
        primaryLight: isDarkTheme ? '#60A5FA' : '#2196f3',
        success: isDarkTheme ? '#5CDB5C' : '#4CAF50',
        warning: isDarkTheme ? '#F59E0B' : '#ff9800',
        error: isDarkTheme ? '#ff6b6b' : '#f44336',
        border: isDarkTheme ? 'rgba(148,163,184,0.1)' : 'rgba(148,163,184,0.2)',
        hover: isDarkTheme ? 'rgba(75,159,255,0.1)' : 'rgba(25,118,210,0.05)',
        gradient: isDarkTheme
            ? 'linear-gradient(135deg, #4B9FFF 0%, #1976d2 100%)'
            : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
        shadow: isDarkTheme
            ? '0 20px 60px -15px rgba(0,0,0,0.6)'
            : '0 20px 60px -15px rgba(25,118,210,0.15)'
    }), [isDarkTheme]);

    // Cleanup de timeout al desmontar
    useEffect(() => {
        return () => {
            if (changeTimeout.current) {
                clearTimeout(changeTimeout.current);
            }
        };
    }, []);

    // Mostrar notificación
    const showNotif = useCallback((message, type = 'success') => {
        setNotification({ open: true, message, type });
    }, []);

    // Cerrar notificación
    const handleCloseNotif = useCallback(() => {
        setNotification(prev => ({ ...prev, open: false }));
    }, []);

    // Manejar cambio de tab con debounce
    const handleTabChange = useCallback((e, newValue) => {
        if (changeTimeout.current) {
            clearTimeout(changeTimeout.current);
        }
        
        changeTimeout.current = setTimeout(() => {
            setActiveTab(newValue);
            setLoadedTabs(prev => {
                if (!prev.has(newValue)) {
                    return new Set([...prev, newValue]);
                }
                return prev;
            });
        }, 150);
    }, []);

    // Props compartidas para tabs
    const tabProps = useMemo(() => ({
        colors,
        isMobile,
        isTablet,
        showNotif
    }), [colors, isMobile, isTablet, showNotif]);

    // Estilos memoizados
    const estilos = useMemo(() => ({
        contenedorPrincipal: {
            minHeight: '100vh',
            background: colors.background,
            p: isMobile ? 2 : isTablet ? 3 : 4
        },
        headerPaper: {
            mb: 4,
            p: isMobile ? 2 : 3,
            background: colors.paper,
            borderRadius: '20px',
            border: `1px solid ${colors.border}`,
            boxShadow: colors.shadow
        },
        avatar: {
            width: isMobile ? 48 : 64,
            height: isMobile ? 48 : 64,
            background: colors.gradient,
            boxShadow: `0 8px 24px ${alpha(colors.primary, 0.3)}`
        },
        tabsPaper: {
            background: colors.paper,
            borderRadius: '20px',
            p: 0.5,
            mb: 3,
            boxShadow: colors.shadow,
            border: `1px solid ${colors.border}`
        },
        tabsConfig: {
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
        }
    }), [colors, isMobile, isTablet]);

    // Renderizar tabs cargados con lazy mounting
    const renderTabs = useMemo(() => (
        <>
            {loadedTabs.has(0) && (
                <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
                    <Suspense fallback={<TabLoader />}>
                        <RecompensaTab {...tabProps} />
                    </Suspense>
                </Box>
            )}
            {loadedTabs.has(1) && (
                <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
                    <Suspense fallback={<TabLoader />}>
                        <ServiciosTab {...tabProps} />
                    </Suspense>
                </Box>
            )}
            {loadedTabs.has(2) && (
                <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
                    <Suspense fallback={<TabLoader />}>
                        <PacientesTab {...tabProps} />
                    </Suspense>
                </Box>
            )}
        </>
    ), [loadedTabs, activeTab, tabProps]);

    return (
        <Box sx={estilos.contenedorPrincipal}>
            {/* Header */}
            <Paper elevation={0} sx={estilos.headerPaper}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={estilos.avatar}>
                        <DashboardIcon sx={{ fontSize: isMobile ? 28 : 36 }} />
                    </Avatar>
                    <Box>
                        <Typography
                            variant={isMobile ? 'h5' : 'h4'}
                            fontWeight={700}
                            color={colors.text}
                        >
                            Sistema de Puntos
                        </Typography>
                        <Typography
                            variant="body2"
                            color={colors.secondaryText}
                            fontWeight={500}
                        >
                            Recompensas y puntos para pacientes
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Tabs Navigation */}
            <Paper elevation={0} sx={estilos.tabsPaper}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant={isMobile ? 'fullWidth' : 'standard'}
                    sx={estilos.tabsConfig}
                >
                    {TABS_CONFIG.map(({ icon: Icon, label, index }) => (
                        <Tab
                            key={index}
                            icon={<Icon />}
                            iconPosition="start"
                            label={label}
                        />
                    ))}
                </Tabs>
            </Paper>

            {/* Tabs Content */}
            {renderTabs}

            {/* Notificaciones */}
            <Notificaciones
                open={notification.open}
                message={notification.message}
                type={notification.type}
                handleClose={handleCloseNotif}
            />
        </Box>
    );
};

export default memo(AdminGamificacion);