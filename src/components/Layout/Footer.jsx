import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Container,
  Divider,
  useMediaQuery,
  Stack,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaWhatsapp,
  FaTimes,
  FaCookieBite
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../Tools/ThemeContext';
import Notificaciones from './Notificaciones';

// Formatea URLs de redes sociales según el tipo de red
const formatSocialUrl = (network, url) => {
  const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');

  switch (network) {
    case 'facebook':
      return `https://facebook.com/${cleanUrl}`;
    case 'twitter':
      return `https://twitter.com/${cleanUrl}`;
    case 'linkedin':
      return `https://linkedin.com/in/${cleanUrl}`;
    case 'instagram':
      return `https://instagram.com/${cleanUrl}`;
    case 'whatsapp':
      const phone = cleanUrl.replace(/\D/g, '');
      return `https://wa.me/${phone}`;
    default:
      return url;
  }
};

const availableSocials = [
  {
    label: 'Facebook',
    name: 'facebook',
    icon: <FaFacebook />,
    baseUrl: 'https://facebook.com/',
    color: '#1877F2'
  },
  {
    label: 'Twitter',
    name: 'twitter',
    icon: <FaTwitter />,
    baseUrl: 'https://twitter.com/',
    color: '#1DA1F2'
  },
  {
    label: 'LinkedIn',
    name: 'linkedin',
    icon: <FaLinkedin />,
    baseUrl: 'https://linkedin.com/in/',
    color: '#0A66C2'
  },
  {
    label: 'Instagram',
    name: 'instagram',
    icon: <FaInstagram />,
    baseUrl: 'https://instagram.com/',
    color: '#E4405F'
  },
  {
    label: 'WhatsApp',
    name: 'whatsapp',
    icon: <FaWhatsapp />,
    baseUrl: 'https://wa.me/',
    color: '#25D366'
  }
];

// Componente Footer con Dialog de Material-UI
const Footer = () => {
  const [socials, setSocials] = useState([]);
  const [privacyPolicy, setPrivacyPolicy] = useState([]);
  const [termsConditions, setTermsConditions] = useState([]);
  const [disclaimer, setDisclaimer] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  // Estados para el aviso de cookies
  const [showCookieNotice, setShowCookieNotice] = useState(false);
  const [cookieDialogOpen, setCookieDialogOpen] = useState(false);
  const [bannerHiddenForDialog, setBannerHiddenForDialog] = useState(false);
  const [cookiesRejected, setCookiesRejected] = useState(false);

  // Estados para notificaciones
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'info'
  });

  const navigate = useNavigate();
  const { isDarkTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Verificar si el usuario ya interactuó con las cookies
    const cookiesAccepted = localStorage.getItem('carolDental_cookiesAccepted');

    if (!cookiesAccepted) {
      // Primera visita - mostrar banner después de 2 segundos
      setTimeout(() => setShowCookieNotice(true), 2000);
    } else if (cookiesAccepted === 'false') {
      // Cookies rechazadas - mostrar indicador
      setCookiesRejected(true);
      // Mostrar banner ocasionalmente para que puedan reconsiderar
      const shouldShowAgain = Math.random() < 0.25; // 25% de probabilidad (1 de cada 4 visitas)
      if (shouldShowAgain) {
        setTimeout(() => setShowCookieNotice(true), 4000); // Después de 4 segundos
      }
    } else {
      // Cookies aceptadas
      setCookiesRejected(false);
    }

    const fetchSocials = async () => {
      try {
        const response = await axios.get('https://back-end-4803.onrender.com/api/redesSociales/sociales');
        setSocials(response.data);
      } catch (error) {
        console.error('Error al obtener las redes sociales', error);
      }
    };

    const fetchPrivacyPolicy = async () => {
      try {
        const response = await axios.get('https://back-end-4803.onrender.com/api/politicas/politicas_privacidad');
        const activePolicy = response.data.filter(policy => policy.estado === 'activo');
        setPrivacyPolicy(activePolicy);
      } catch (error) {
        console.error('Error al obtener las políticas de privacidad', error);
      }
    };

    const fetchTermsConditions = async () => {
      try {
        const response = await axios.get('https://back-end-4803.onrender.com/api/termiCondicion/terminos_condiciones');
        const activeTerms = response.data.filter(term => term.estado === 'activo');
        setTermsConditions(activeTerms);
      } catch (error) {
        console.error('Error al obtener los términos y condiciones', error);
      }
    };

    const fetchDisclaimer = async () => {
      try {
        const response = await axios.get('https://back-end-4803.onrender.com/api/deslinde/deslinde');
        const activeDisclaimer = response.data.filter(disclaimer => disclaimer.estado === 'activo');
        setDisclaimer(activeDisclaimer);
      } catch (error) {
        console.error('Error al obtener el deslinde legal', error);
      }
    };

    fetchSocials();
    fetchPrivacyPolicy();
    fetchTermsConditions();
    fetchDisclaimer();
  }, []);

  // Maneja la aceptación de cookies
  const handleAcceptCookies = () => {
    localStorage.setItem('carolDental_cookiesAccepted', 'true');
    setShowCookieNotice(false);
    setBannerHiddenForDialog(false);
    setCookieDialogOpen(false);
    setCookiesRejected(false);

    // Mostrar notificación de éxito
    setNotification({
      open: true,
      message: 'Cookies aceptadas. Ahora puede disfrutar de todas las funcionalidades.',
      type: 'success'
    });
  };

  // Maneja el rechazo de cookies
  const handleRejectCookies = () => {
    localStorage.setItem('carolDental_cookiesAccepted', 'false');
    setShowCookieNotice(false);
    setBannerHiddenForDialog(false);
    setCookieDialogOpen(false);
    setCookiesRejected(true);

    // Limpiar cookies existentes del navegador
    document.cookie = 'carolDental_admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'carolDental_empleado=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'carolDental_paciente=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    // Mostrar notificación de advertencia
    setNotification({
      open: true,
      message: 'Cookies rechazadas. Puede cambiar su decisión desde el footer.',
      type: 'warning'
    });
  };

  // Maneja la apertura del Dialog de cookies
  const handleOpenCookieDialog = () => {
    setBannerHiddenForDialog(true); // Ocultar banner temporalmente
    setCookieDialogOpen(true);
  };

  // Maneja el cierre del Dialog de cookies
  const handleCloseCookieDialog = () => {
    setCookieDialogOpen(false);
    setBannerHiddenForDialog(false);
  };

  // Maneja el cierre de notificaciones
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Maneja la apertura del modal con contenido dinámico
  const handleOpenModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setModalOpen(true);
  };

  // Maneja el clic en un ícono de red social
  const handleSocialClick = (social) => {
    const formattedUrl = formatSocialUrl(social.nombre_red, social.url);
    window.open(formattedUrl, '_blank', 'noopener,noreferrer');
  };

  // Cierra el modal
  const handleCloseModal = () => setModalOpen(false);

  // Colores usando tema de Material-UI
  const colors = {
    light: {
      background: '#03427C',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.9)',
      accent: '#0288D1',
      border: 'rgba(255, 255, 255, 0.2)',
      hover: 'rgba(255, 255, 255, 0.1)',
    },
    dark: {
      background: '#0D1B2A',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.9)',
      accent: '#90CAF9',
      border: 'rgba(255, 255, 255, 0.1)',
      hover: 'rgba(255, 255, 255, 0.05)',
    }
  };

  // Función mejorada que convierte texto plano a HTML bien formateado
  const formatContentForDisplay = (content) => {
    if (!content) return '<p class="policy-paragraph">Contenido no disponible</p>';

    let formattedContent = content
      .trim()
      .replace(/\r\n/g, '\n') // Normalizar saltos de línea
      .replace(/\r/g, '\n');

    // 1. CAJAS ESPECIALES PRIMERO (antes de procesar párrafos)
    formattedContent = formattedContent
      .replace(/^IMPORTANTE:\s*(.+?)(?=\n\n|\n[A-Z0-9]|$)/gims, '<div class="important-notice"><strong>IMPORTANTE:</strong> $1</div>')
      .replace(/^NOTA:\s*(.+?)(?=\n\n|\n[A-Z0-9]|$)/gims, '<div class="note-box"><strong>NOTA:</strong> $1</div>')
      .replace(/^AVISO:\s*(.+?)(?=\n\n|\n[A-Z0-9]|$)/gims, '<div class="warning-box"><strong>AVISO:</strong> $1</div>');

    // 2. TÍTULOS (detectar líneas completas en mayúsculas o títulos numerados)
    formattedContent = formattedContent
      // Títulos principales (líneas en mayúsculas completas)
      .replace(/^([A-ZÁÉÍÓÚÑ\s]{4,})$/gm, '<h3 class="policy-title">$1</h3>')
      // Subtítulos numerados (1. TÍTULO, 1.1 TÍTULO, etc.)
      .replace(/^(\d+\.(?:\d+\.?)?\s+[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñ\s]+)$/gm, '<h4 class="policy-subtitle">$1</h4>');

    // 3. LISTAS (mejorar detección)
    formattedContent = formattedContent
      // Listas numeradas (líneas que empiezan con número.)
      .replace(/^(\d+\.\s+.+)$/gm, '<li class="numbered-item">$1</li>')
      // Listas con viñetas (•, -, *)
      .replace(/^[•\-\*]\s+(.+)$/gm, '<li class="bullet-item">• $1</li>');

    // 4. TEXTO DESTACADO
    formattedContent = formattedContent
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong class="highlight-text">$1</strong>')
      .replace(/\*([^*\n]+)\*/g, '<em class="italic-text">$1</em>');

    // 5. DETECTAR ELEMENTOS ESPECIALES
    formattedContent = formattedContent
      // Fechas (DD/MM/YYYY)
      .replace(/(\d{1,2}\/\d{1,2}\/\d{4})/g, '<span class="date-highlight">$1</span>')
      // Emails
      .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1" class="email-link">$1</a>')
      // Teléfonos mexicanos
      .replace(/(\d{3}\s?\d{3}\s?\d{4})/g, '<span class="phone-highlight">$1</span>');

    // 6. PROCESAR PÁRRAFOS (después de todo lo demás)
    // Dividir por líneas vacías para crear párrafos
    let paragraphs = formattedContent.split(/\n\s*\n/);

    paragraphs = paragraphs.map(paragraph => {
      paragraph = paragraph.trim();
      if (!paragraph) return '';

      // Si ya es HTML (contiene tags), no envolver en <p>
      if (paragraph.includes('<h3') || paragraph.includes('<h4') ||
        paragraph.includes('<div class=') || paragraph.includes('<li class=')) {
        return paragraph;
      }

      // Si no, envolver en párrafo
      return `<p class="policy-paragraph">${paragraph}</p>`;
    });

    formattedContent = paragraphs.filter(p => p).join('\n\n');

    // 7. AGRUPAR LISTAS CONSECUTIVAS
    formattedContent = formattedContent
      // Agrupar elementos de lista numerada consecutivos
      .replace(/(<li class="numbered-item">.*?<\/li>\s*)+/gs, (match) => {
        return `<ol class="numbered-list">${match}</ol>`;
      })
      // Agrupar elementos de lista con viñetas consecutivos
      .replace(/(<li class="bullet-item">.*?<\/li>\s*)+/gs, (match) => {
        return `<ul class="bullet-list">${match}</ul>`;
      });

    // 8. LIMPIEZA FINAL
    formattedContent = formattedContent
      .replace(/<p class="policy-paragraph"><\/p>/g, '')
      .replace(/<p class="policy-paragraph">\s*<\/p>/g, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Reducir múltiples saltos de línea
      .trim();

    return formattedContent;
  };

  // Estilos mejorados para el contenido formateado
  const getFormattedContentStyles = (theme, isDarkTheme) => ({
    // Contenedor principal
    lineHeight: 1.6,
    fontSize: '0.9rem',

    // TÍTULOS
    '& .policy-title': {
      fontSize: '1.25rem',
      fontWeight: 700,
      color: isDarkTheme ? '#4B9FFF' : '#1976d2',
      marginTop: theme.spacing(2.5),
      marginBottom: theme.spacing(1.5),
      borderBottom: `3px solid ${isDarkTheme ? '#4B9FFF' : '#1976d2'}`,
      paddingBottom: theme.spacing(0.75),
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      textAlign: 'left',
    },

    '& .policy-subtitle': {
      fontSize: '1.1rem',
      fontWeight: 600,
      color: isDarkTheme ? '#E8F1FF' : '#333333',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1.25),
      paddingLeft: theme.spacing(1),
      borderLeft: `4px solid ${isDarkTheme ? '#4B9FFF' : '#1976d2'}`,
      backgroundColor: isDarkTheme ? alpha('#4B9FFF', 0.05) : alpha('#1976d2', 0.05),
      padding: theme.spacing(0.75, 1),
      borderRadius: theme.spacing(0.5),
    },

    // PÁRRAFOS
    '& .policy-paragraph': {
      marginBottom: theme.spacing(1.5),
      textAlign: 'justify',
      lineHeight: 1.7,
      fontSize: '0.9rem',
      color: isDarkTheme ? '#E8F1FF' : '#424242',
    },

    // LISTAS
    '& .numbered-list': {
      paddingLeft: theme.spacing(2.5),
      marginBottom: theme.spacing(1.5),
      listStyleType: 'decimal',

      '& .numbered-item': {
        marginBottom: theme.spacing(0.75),
        lineHeight: 1.6,
        fontSize: '0.9rem',
        color: isDarkTheme ? '#E8F1FF' : '#424242',
        listStyleType: 'none', // Quitamos el estilo por defecto
        position: 'relative',
        paddingLeft: theme.spacing(0.5),
      },
    },

    '& .bullet-list': {
      paddingLeft: theme.spacing(2.5),
      marginBottom: theme.spacing(1.5),
      listStyleType: 'none',

      '& .bullet-item': {
        marginBottom: theme.spacing(0.75),
        lineHeight: 1.6,
        fontSize: '0.9rem',
        color: isDarkTheme ? '#E8F1FF' : '#424242',
        listStyleType: 'none',
        position: 'relative',
        paddingLeft: theme.spacing(1),

        '&::before': {
          content: '"•"',
          position: 'absolute',
          left: 0,
          color: isDarkTheme ? '#4B9FFF' : '#1976d2',
          fontWeight: 'bold',
          fontSize: '1.2em',
        },
      },
    },

    // TEXTO DESTACADO
    '& .highlight-text': {
      color: isDarkTheme ? '#4B9FFF' : '#1976d2',
      fontWeight: 600,
      backgroundColor: isDarkTheme ? alpha('#4B9FFF', 0.1) : alpha('#1976d2', 0.1),
      padding: theme.spacing(0.1, 0.3),
      borderRadius: theme.spacing(0.3),
    },

    '& .italic-text': {
      fontStyle: 'italic',
      color: isDarkTheme ? '#B0BEC5' : '#666666',
      fontWeight: 500,
    },

    // CAJAS ESPECIALES
    '& .important-notice': {
      backgroundColor: isDarkTheme ? alpha('#f44336', 0.15) : alpha('#f44336', 0.1),
      color: isDarkTheme ? '#ffcdd2' : '#c62828',
      padding: theme.spacing(1.5),
      borderRadius: theme.spacing(1),
      marginBottom: theme.spacing(2),
      border: `2px solid ${isDarkTheme ? alpha('#f44336', 0.4) : alpha('#f44336', 0.3)}`,
      borderLeft: `6px solid ${isDarkTheme ? '#f44336' : '#d32f2f'}`,
      fontSize: '0.9rem',
      fontWeight: 500,

      '& strong': {
        color: isDarkTheme ? '#f44336' : '#b71c1c',
        fontSize: '1em',
        marginRight: theme.spacing(0.5),
      },
    },

    '& .note-box': {
      backgroundColor: isDarkTheme ? alpha('#2196f3', 0.15) : alpha('#2196f3', 0.1),
      color: isDarkTheme ? '#bbdefb' : '#1565c0',
      padding: theme.spacing(1.5),
      borderRadius: theme.spacing(1),
      marginBottom: theme.spacing(2),
      border: `2px solid ${isDarkTheme ? alpha('#2196f3', 0.4) : alpha('#2196f3', 0.3)}`,
      borderLeft: `6px solid ${isDarkTheme ? '#2196f3' : '#1976d2'}`,
      fontSize: '0.9rem',
      fontWeight: 500,

      '& strong': {
        color: isDarkTheme ? '#2196f3' : '#0d47a1',
        fontSize: '1em',
        marginRight: theme.spacing(0.5),
      },
    },

    '& .warning-box': {
      backgroundColor: isDarkTheme ? alpha('#ff9800', 0.15) : alpha('#ff9800', 0.1),
      color: isDarkTheme ? '#ffcc02' : '#ef6c00',
      padding: theme.spacing(1.5),
      borderRadius: theme.spacing(1),
      marginBottom: theme.spacing(2),
      border: `2px solid ${isDarkTheme ? alpha('#ff9800', 0.4) : alpha('#ff9800', 0.3)}`,
      borderLeft: `6px solid ${isDarkTheme ? '#ff9800' : '#f57c00'}`,
      fontSize: '0.9rem',
      fontWeight: 500,

      '& strong': {
        color: isDarkTheme ? '#ff9800' : '#e65100',
        fontSize: '1em',
        marginRight: theme.spacing(0.5),
      },
    },

    // ELEMENTOS ESPECIALES
    '& .date-highlight': {
      backgroundColor: isDarkTheme ? alpha('#666666', 0.3) : alpha('#f5f5f5', 0.9),
      color: isDarkTheme ? '#ffffff' : '#333333',
      padding: theme.spacing(0.25, 0.5),
      borderRadius: theme.spacing(0.5),
      fontFamily: 'monospace',
      fontSize: '0.85rem',
      border: `1px solid ${isDarkTheme ? alpha('#666666', 0.5) : alpha('#cccccc', 0.8)}`,
    },

    '& .email-link': {
      color: isDarkTheme ? '#4B9FFF' : '#1976d2',
      textDecoration: 'underline',
      fontWeight: 500,
      '&:hover': {
        textDecoration: 'none',
        backgroundColor: isDarkTheme ? alpha('#4B9FFF', 0.1) : alpha('#1976d2', 0.1),
        borderRadius: theme.spacing(0.3),
        padding: theme.spacing(0.1, 0.3),
      },
    },

    '& .phone-highlight': {
      backgroundColor: isDarkTheme ? alpha('#4caf50', 0.2) : alpha('#4caf50', 0.15),
      color: isDarkTheme ? '#a5d6a7' : '#1b5e20',
      padding: theme.spacing(0.25, 0.6),
      borderRadius: theme.spacing(0.5),
      fontFamily: 'monospace',
      fontSize: '0.85rem',
      fontWeight: 600,
      border: `1px solid ${isDarkTheme ? alpha('#4caf50', 0.4) : alpha('#4caf50', 0.3)}`,
    },

    // ESPACIADO GENERAL
    '& > *:first-of-type': {
      marginTop: 0,
    },
    '& > *:last-child': {
      marginBottom: 0,
    },

    // MEJORAS RESPONSIVAS
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.85rem',

      '& .policy-title': {
        fontSize: '1.1rem',
      },

      '& .policy-subtitle': {
        fontSize: '1rem',
      },

      '& .numbered-list, & .bullet-list': {
        paddingLeft: theme.spacing(1.5),
      },
    },
  });

  
  const currentColors = isDarkTheme ? colors.dark : colors.light;

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: currentColors.background,
        color: currentColors.text,
        paddingTop: { xs: 6, md: 10 },
        paddingBottom: 4,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 -10px 20px rgba(0, 0, 0, 0.05)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, ${currentColors.accent} 50%, transparent 100%)`,
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={{ xs: 4, md: 6 }}>
          {/* Columna 1: Acerca de Carol */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                mb: 3,
                color: currentColors.text,
                position: 'relative',
                paddingBottom: '12px',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '32px',
                  height: '3px',
                  background: `linear-gradient(90deg, ${currentColors.accent}, transparent)`,
                  borderRadius: '2px',
                }
              }}
            >
              Acerca de Carol
            </Typography>

            <Button
              onClick={() => navigate('/about')}
              fullWidth
              sx={{
                color: currentColors.textSecondary,
                fontSize: '0.9rem',
                textAlign: 'left',
                justifyContent: 'flex-start',
                padding: '8px 0',
                textTransform: 'none',
                fontWeight: 400,
                '&:hover': {
                  color: currentColors.text,
                  transform: 'translateX(8px)',
                  backgroundColor: currentColors.hover,
                },
                transition: 'all 0.3s ease',
              }}
            >
              Información sobre nuestra empresa
            </Button>

            {isMobile && (
              <Divider sx={{
                backgroundColor: currentColors.border,
                my: 3,
                opacity: 0.5
              }} />
            )}
          </Grid>

          {/* Columna 2: Servicio al Cliente */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                mb: 3,
                color: currentColors.text,
                position: 'relative',
                paddingBottom: '12px',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '32px',
                  height: '3px',
                  background: `linear-gradient(90deg, ${currentColors.accent}, transparent)`,
                  borderRadius: '2px',
                }
              }}
            >
              Servicio al Cliente
            </Typography>

            <Stack spacing={0.5}>
              <Button
                onClick={() => navigate('/FAQ')}
                fullWidth
                sx={{
                  color: currentColors.textSecondary,
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  padding: '8px 0',
                  textTransform: 'none',
                  fontWeight: 400,
                  '&:hover': {
                    color: currentColors.text,
                    transform: 'translateX(8px)',
                    backgroundColor: currentColors.hover,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Preguntas frecuentes
              </Button>

              <Button
                onClick={() => navigate('/Contact')}
                fullWidth
                sx={{
                  color: currentColors.textSecondary,
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  padding: '8px 0',
                  textTransform: 'none',
                  fontWeight: 400,
                  '&:hover': {
                    color: currentColors.text,
                    transform: 'translateX(8px)',
                    backgroundColor: currentColors.hover,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Contáctanos
              </Button>
            </Stack>

            {isMobile && (
              <Divider sx={{
                backgroundColor: currentColors.border,
                my: 3,
                opacity: 0.5
              }} />
            )}
          </Grid>

          {/* Columna 3: Normatividad */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                mb: 3,
                color: currentColors.text,
                position: 'relative',
                paddingBottom: '12px',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '32px',
                  height: '3px',
                  background: `linear-gradient(90deg, ${currentColors.accent}, transparent)`,
                  borderRadius: '2px',
                }
              }}
            >
              Normatividad
            </Typography>

            <Stack spacing={0.5}>
              <Button
                onClick={() => handleOpenModal('Política de Privacidad', privacyPolicy[0]?.contenido || 'No disponible')}
                fullWidth
                sx={{
                  color: currentColors.textSecondary,
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  padding: '8px 0',
                  textTransform: 'none',
                  fontWeight: 400,
                  '&:hover': {
                    color: currentColors.text,
                    transform: 'translateX(8px)',
                    backgroundColor: currentColors.hover,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Política de Privacidad
              </Button>

              <Button
                onClick={() => handleOpenModal('Términos y Condiciones', termsConditions[0]?.contenido || 'No disponible')}
                fullWidth
                sx={{
                  color: currentColors.textSecondary,
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  padding: '8px 0',
                  textTransform: 'none',
                  fontWeight: 400,
                  '&:hover': {
                    color: currentColors.text,
                    transform: 'translateX(8px)',
                    backgroundColor: currentColors.hover,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Términos y Condiciones
              </Button>

              <Button
                onClick={() => handleOpenModal('Deslinde Legal', disclaimer[0]?.contenido || 'No disponible')}
                fullWidth
                sx={{
                  color: currentColors.textSecondary,
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  padding: '8px 0',
                  textTransform: 'none',
                  fontWeight: 400,
                  '&:hover': {
                    color: currentColors.text,
                    transform: 'translateX(8px)',
                    backgroundColor: currentColors.hover,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Deslinde Legal
              </Button>

              <Button
                onClick={handleOpenCookieDialog}
                fullWidth
                startIcon={cookiesRejected ? <FaCookieBite /> : null}
                sx={{
                  color: cookiesRejected ? 'warning.main' : currentColors.textSecondary,
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  padding: '8px 0',
                  textTransform: 'none',
                  fontWeight: cookiesRejected ? 600 : 400,
                  backgroundColor: cookiesRejected ? 'action.hover' : 'transparent',
                  borderRadius: cookiesRejected ? 1 : 0,
                  '&:hover': {
                    color: cookiesRejected ? 'warning.dark' : currentColors.text,
                    transform: 'translateX(8px)',
                    backgroundColor: cookiesRejected ? 'action.selected' : currentColors.hover,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {cookiesRejected ? 'Configuración de Cookies' : 'Aviso de Cookies'}
              </Button>
            </Stack>

            {isMobile && (
              <Divider sx={{
                backgroundColor: currentColors.border,
                my: 3,
                opacity: 0.5
              }} />
            )}
          </Grid>

          {/* Columna 4: Redes Sociales */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                mb: 3,
                color: currentColors.text,
                position: 'relative',
                paddingBottom: '12px',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '32px',
                  height: '3px',
                  background: `linear-gradient(90deg, ${currentColors.accent}, transparent)`,
                  borderRadius: '2px',
                }
              }}
            >
              Síguenos
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                mt: 2,
              }}
            >
              {socials.map((social) => {
                const socialConfig = availableSocials.find(
                  (s) => s.name === social.nombre_red
                );

                return socialConfig && (
                  <IconButton
                    key={social.id}
                    onClick={() => handleSocialClick(social)}
                    aria-label={`Visitar ${socialConfig.label}`}
                    sx={{
                      color: currentColors.textSecondary,
                      fontSize: { xs: '1.3rem', md: '1.5rem' },
                      padding: '12px',
                      margin: '4px',
                      borderRadius: '12px',
                      background: currentColors.hover,
                      border: `1px solid ${currentColors.border}`,
                      transition: 'all 0.4s ease',
                      '&:hover': {
                        transform: 'translateY(-4px) scale(1.05)',
                        color: '#FFFFFF',
                        borderColor: socialConfig.color,
                        backgroundColor: socialConfig.color,
                        boxShadow: `0 8px 25px ${socialConfig.color}40, 0 4px 10px rgba(0,0,0,0.1)`,
                      }
                    }}
                  >
                    {socialConfig.icon}
                  </IconButton>
                );
              })}
            </Box>
          </Grid>
        </Grid>

        {/* Línea separadora */}
        <Box
          sx={{
            position: 'relative',
            mt: 6,
            mb: 4,
            height: '1px',
            width: '100%',
            background: `linear-gradient(90deg, transparent 0%, ${currentColors.border} 20%, ${currentColors.accent} 50%, ${currentColors.border} 80%, transparent 100%)`,
          }}
        />

        {/* Copyright */}
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: currentColors.textSecondary,
              fontWeight: 300,
              letterSpacing: '0.5px',
              lineHeight: 1.6,
            }}
          >
            © {new Date().getFullYear()} Odontología Carol. Todos los derechos reservados.
          </Typography>

          {/* Indicador de cookies rechazadas */}
          {cookiesRejected && (
            <Box
              sx={{
                mt: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                p: 1,
                bgcolor: 'action.hover',
                borderRadius: 1,
                border: 1,
                borderColor: 'divider'
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.8rem'
                }}
              >
                Cookies deshabilitadas
              </Typography>
              <Button
                size="small"
                onClick={handleOpenCookieDialog}
                sx={{
                  color: 'primary.main',
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 1,
                  py: 0.2,
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                  }
                }}
              >
                Configurar
              </Button>
            </Box>
          )}
        </Box>
      </Container>

      {/* Banner de Cookies Compacto - Centrado */}
      <Box
        sx={{
          position: 'fixed',
          bottom: (showCookieNotice && !bannerHiddenForDialog) ? 20 : -100,
          left: '50%',
          transform: 'translateX(-50%)',
          transition: theme.transitions.create(['bottom'], {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeInOut,
          }),
          zIndex: theme.zIndex.fab, // Usar z-index más alto
          maxWidth: { xs: '92vw', sm: '380px' },
          width: '100%',
        }}
      >
        <Card
          elevation={6}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: 1,
            borderColor: 'primary.main',
            borderWidth: 2,
          }}
        >
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              {/* Icono compacto */}
              <Box
                sx={{
                  bgcolor: cookiesRejected ? 'warning.main' : 'primary.main',
                  borderRadius: 2,
                  p: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  width: 32,
                  height: 32,
                }}
              >
                <FaCookieBite
                  style={{
                    fontSize: '0.9rem',
                    color: 'white',
                  }}
                />
              </Box>

              {/* Texto compacto */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: '0.8rem',
                    lineHeight: 1.1,
                    mb: 0.1,
                  }}
                >
                  {cookiesRejected ? 'Cookies rechazadas' : 'Cookies esenciales'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: cookiesRejected ? 'warning.main' : 'text.secondary',
                    fontSize: '0.7rem',
                    lineHeight: 1,
                    display: 'block',
                    fontWeight: cookiesRejected ? 500 : 'normal',
                  }}
                >
                  {cookiesRejected ? 'Funcionalidad limitada' : 'Para funcionamiento del sitio'}
                </Typography>
              </Box>

              {/* Botones compactos */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  flexShrink: 0,
                }}
              >
                {!cookiesRejected && (
                  <Button
                    size="small"
                    onClick={handleOpenCookieDialog}
                    sx={{
                      minWidth: 'auto',
                      px: 0.8,
                      py: 0.2,
                      fontSize: '0.65rem',
                      textTransform: 'none',
                      color: 'text.secondary',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                  >
                    Info
                  </Button>
                )}

                <Button
                  size="small"
                  onClick={cookiesRejected ? handleAcceptCookies : handleRejectCookies}
                  variant={cookiesRejected ? "contained" : "outlined"}
                  color={cookiesRejected ? "primary" : "default"}
                  sx={{
                    minWidth: 'auto',
                    px: cookiesRejected ? 1.5 : 1,
                    py: 0.2,
                    fontSize: '0.65rem',
                    textTransform: 'none',
                    borderRadius: 1,
                    fontWeight: cookiesRejected ? 600 : 500,
                  }}
                >
                  {cookiesRejected ? 'Aceptar' : 'Rechazar'}
                </Button>

                {!cookiesRejected && (
                  <Button
                    size="small"
                    onClick={handleAcceptCookies}
                    variant="contained"
                    sx={{
                      minWidth: 'auto',
                      px: 1.2,
                      py: 0.2,
                      fontSize: '0.65rem',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 1,
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: 1,
                      }
                    }}
                  >
                    Aceptar
                  </Button>
                )}

                {cookiesRejected && (
                  <Button
                    size="small"
                    onClick={handleOpenCookieDialog}
                    sx={{
                      minWidth: 'auto',
                      px: 0.8,
                      py: 0.2,
                      fontSize: '0.65rem',
                      textTransform: 'none',
                      color: 'text.secondary',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                  >
                    Info
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Dialog de información de cookies */}
      <Dialog
        open={cookieDialogOpen}
        onClose={handleCloseCookieDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 2 },
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderBottom: 1,
            borderColor: 'divider',
            pb: 2,
            bgcolor: cookiesRejected ? 'action.hover' : 'transparent',
          }}
        >
          <FaCookieBite
            style={{
              fontSize: '1.5rem',
              color: cookiesRejected ? theme.palette.warning.main : theme.palette.primary.main
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              Configuración de Cookies
            </Typography>
            {cookiesRejected && (
              <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 500 }}>
                Actualmente rechazadas - Funcionalidad limitada
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={handleCloseCookieDialog}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
          >
            <FaTimes />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Estado actual de cookies */}
            {cookiesRejected && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'warning.light',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'warning.main',
                }}
              >
                <Typography variant="h6" sx={{ color: 'warning.dark', fontWeight: 600, mb: 1 }}>
                  Cookies Actualmente Rechazadas
                </Typography>
                <Typography variant="body2" sx={{ color: 'warning.dark', mb: 1 }}>
                  No puede acceder a funciones como login, citas, o historial médico.
                </Typography>
                <Button
                  onClick={handleAcceptCookies}
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={{
                    mt: 1,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Aceptar Cookies Ahora
                </Button>
              </Box>
            )}

            <Typography variant="body1" paragraph>
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web. Nos ayudan a brindarle una mejor experiencia personalizada.
            </Typography>

            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Cookies de Autenticación (Esenciales)
              </Typography>
              <Typography variant="body2" paragraph>
                Utilizamos cookies específicas para mantener su sesión activa según su tipo de usuario:
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2">
                  <strong>carolDental_admin:</strong> Para administradores del sistema
                </Typography>
                <Typography component="li" variant="body2">
                  <strong>carolDental_empleado:</strong> Para empleados de la clínica
                </Typography>
                <Typography component="li" variant="body2">
                  <strong>carolDental_paciente:</strong> Para pacientes registrados
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Configuración de Seguridad
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2">
                  <strong>Solo HTTP:</strong> No accesibles desde JavaScript del navegador
                </Typography>
                <Typography component="li" variant="body2">
                  <strong>Conexión segura:</strong> Solo se transmiten por HTTPS
                </Typography>
                <Typography component="li" variant="body2">
                  <strong>Protección contra ataques:</strong> Configuradas para prevenir falsificación
                </Typography>
                <Typography component="li" variant="body2">
                  <strong>Duración limitada:</strong> 24 horas para sesiones de usuarios
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom color="error">
                ¿Qué pasa si rechaza las cookies?
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2">
                  No podrá iniciar sesión en su cuenta
                </Typography>
                <Typography component="li" variant="body2">
                  No podrá mantener sesiones activas
                </Typography>
                <Typography component="li" variant="body2">
                  No tendrá acceso a funciones personalizadas
                </Typography>
                <Typography component="li" variant="body2">
                  El sitio funcionará solo en modo público limitado
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                p: 2,
                bgcolor: 'info.light',
                borderRadius: 1,
                border: 1,
                borderColor: 'info.main',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.dark' }}>
                Nota importante: Las cookies de autenticación son técnicamente necesarias para el funcionamiento de nuestros servicios.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button
            onClick={handleRejectCookies}
            variant="outlined"
            color="error"
            startIcon={<FaTimes />}
            disabled={cookiesRejected}
            sx={{ opacity: cookiesRejected ? 0.5 : 1 }}
          >
            {cookiesRejected ? 'Ya Rechazadas' : 'Rechazar Cookies'}
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={handleCloseCookieDialog}
            variant="outlined"
          >
            Cerrar
          </Button>
          <Button
            onClick={handleAcceptCookies}
            variant="contained"
            startIcon={<FaCookieBite />}
            color="primary"
          >
            {cookiesRejected ? 'Aceptar Ahora' : 'Aceptar Cookies'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog original para políticas */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 2 },
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            pb: 2,
          }}
        >
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            {modalTitle}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box
            component="div"
            sx={{
              ...getFormattedContentStyles(theme),
              '& > *:first-of-type': {
                marginTop: 0,
              },
              '& > *:last-child': {
                marginBottom: 0,
              },
            }}
            dangerouslySetInnerHTML={{
              __html: formatContentForDisplay(modalContent)
            }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleCloseModal} variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Componente de Notificaciones */}
      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default Footer;