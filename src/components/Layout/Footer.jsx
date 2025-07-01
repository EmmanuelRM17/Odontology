import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Modal, 
  Button, 
  Grid, 
  Container, 
  Divider,
  Paper,
  Fade,
  useMediaQuery,
  Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaInstagram, 
  FaWhatsapp,
  FaTimes
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../Tools/ThemeContext';

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

// Componente Footer mejorado con diseño profesional y responsivo
const Footer = () => {
  const [socials, setSocials] = useState([]);
  const [privacyPolicy, setPrivacyPolicy] = useState([]);
  const [termsConditions, setTermsConditions] = useState([]);
  const [disclaimer, setDisclaimer] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  
  const navigate = useNavigate();
  const { isDarkTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
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

  // Colores originales mejorados
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

  const currentColors = isDarkTheme ? colors.dark : colors.light;

  // Estilos del footer con colores originales
  const footerStyle = {
    backgroundColor: currentColors.background,
    color: currentColors.text,
    paddingTop: isMobile ? '48px' : '80px',
    paddingBottom: '32px',
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
  };

  // Estilo mejorado para títulos de sección
  const sectionTitleStyle = {
    fontWeight: 700,
    fontSize: isMobile ? '1.1rem' : '1.25rem',
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
  };

  // Estilo mejorado para botones de navegación
  const navButtonStyle = {
    color: currentColors.textSecondary,
    fontSize: '0.9rem',
    textAlign: 'left',
    justifyContent: 'flex-start',
    padding: '8px 0',
    borderRadius: '6px',
    textTransform: 'none',
    fontWeight: 400,
    letterSpacing: '0.02em',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '0%',
      height: '100%',
      background: currentColors.hover,
      transition: 'width 0.3s ease',
      zIndex: 0,
    },
    '&:hover': {
      color: currentColors.text,
      transform: 'translateX(8px)',
      '&::before': {
        width: '100%',
      },
      '& .MuiButton-startIcon': {
        transform: 'scale(1.1)',
      }
    },
    '& .MuiButton-label': {
      position: 'relative',
      zIndex: 1,
    }
  };

  // Estilo mejorado para íconos de redes sociales
  const socialIconStyle = (socialColor) => ({
    color: currentColors.textSecondary,
    fontSize: isMobile ? '1.3rem' : '1.5rem',
    padding: '12px',
    margin: '4px',
    borderRadius: '12px',
    background: currentColors.hover,
    border: `1px solid ${currentColors.border}`,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: `linear-gradient(45deg, ${socialColor}, ${socialColor}80)`,
      opacity: 0,
      transition: 'opacity 0.3s ease',
    },
    '&:hover': {
      transform: 'translateY(-4px) scale(1.05)',
      color: '#FFFFFF',
      borderColor: socialColor,
      boxShadow: `0 8px 25px ${socialColor}40, 0 4px 10px rgba(0,0,0,0.1)`,
      '&::before': {
        opacity: 1,
      },
      '& svg': {
        position: 'relative',
        zIndex: 1,
      }
    }
  });

  return (
    <Box component="footer" sx={footerStyle}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={isMobile ? 4 : 6}>
          {/* Columna 1: Acerca de Carol */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={sectionTitleStyle}>
              Acerca de Carol
            </Typography>
            
            <Button
              sx={navButtonStyle}
              onClick={() => navigate('/about')}
              fullWidth
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
            <Typography variant="h6" sx={sectionTitleStyle}>
              Servicio al Cliente
            </Typography>
            
            <Stack spacing={0.5}>
              <Button
                sx={navButtonStyle}
                onClick={() => navigate('/FAQ')}
                fullWidth
              >
                Preguntas frecuentes
              </Button>
              
              <Button
                sx={navButtonStyle}
                onClick={() => navigate('/Contact')}
                fullWidth
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
            <Typography variant="h6" sx={sectionTitleStyle}>
              Normatividad
            </Typography>
            
            <Stack spacing={0.5}>
              <Button
                onClick={() => handleOpenModal('Política de Privacidad', privacyPolicy[0]?.contenido || 'No disponible')}
                sx={navButtonStyle}
                fullWidth
              >
                Política de Privacidad
              </Button>
              
              <Button
                onClick={() => handleOpenModal('Términos y Condiciones', termsConditions[0]?.contenido || 'No disponible')}
                sx={navButtonStyle}
                fullWidth
              >
                Términos y Condiciones
              </Button>
              
              <Button
                onClick={() => handleOpenModal('Deslinde Legal', disclaimer[0]?.contenido || 'No disponible')}
                sx={navButtonStyle}
                fullWidth
              >
                Deslinde Legal
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
            <Typography variant="h6" sx={sectionTitleStyle}>
              Síguenos
            </Typography>
            
            <Box 
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                mt: 2,
                justifyContent: isMobile ? 'flex-start' : 'flex-start'
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
                    sx={socialIconStyle(socialConfig.color)}
                  >
                    {socialConfig.icon}
                  </IconButton>
                );
              })}
            </Box>
          </Grid>
        </Grid>

        {/* Línea separadora mejorada */}
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

        {/* Copyright mejorado */}
        <Box
          sx={{
            textAlign: 'center',
            py: 2,
          }}
        >
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
        </Box>
      </Container>

      {/* Modal mejorado */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        }}
      >
        <Fade in={modalOpen}>
          <Paper
            elevation={24}
            sx={{
              position: 'relative',
              borderRadius: '16px',
              p: { xs: 3, sm: 4 },
              mx: 2,
              maxWidth: '700px', 
              maxHeight: '85vh',
              width: '100%',
              overflowY: 'auto',
              background: isDarkTheme 
                ? '#132F4C' 
                : '#ffffff',
              border: isDarkTheme 
                ? '1px solid rgba(248, 250, 252, 0.1)' 
                : '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: isDarkTheme
                ? '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                : '0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              '&:focus': {
                outline: 'none',
              },
            }}
          >
            {/* Cabecera del modal */}
            <Box 
              sx={{
                borderBottom: `1px solid ${currentColors.border}`,
                pb: 3,
                mb: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: currentColors.accent,
                  fontSize: { xs: '1.3rem', sm: '1.5rem' }
                }}
              >
                {modalTitle}
              </Typography>
              
              <IconButton
                onClick={handleCloseModal}
                aria-label="Cerrar modal"
                sx={{
                  color: currentColors.textSecondary,
                  backgroundColor: currentColors.hover,
                  borderRadius: '10px',
                  padding: '8px',
                  '&:hover': {
                    color: currentColors.text,
                    backgroundColor: currentColors.border,
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <FaTimes />
              </IconButton>
            </Box>

            {/* Contenido del modal */}
            <Box 
              sx={{ 
                mb: 4,
                maxHeight: '60vh',
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: currentColors.hover,
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: currentColors.border,
                  borderRadius: '10px',
                  '&:hover': {
                    background: currentColors.accent,
                  },
                },
              }}
            >
              <Box
                sx={{
                  backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                  border: `1px solid ${currentColors.border}`,
                  borderRadius: '12px',
                  padding: { xs: 2, sm: 3 },
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.75,
                    color: isDarkTheme ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                    fontSize: '0.95rem',
                    fontWeight: 400,
                    textAlign: 'justify',
                    letterSpacing: '0.01em',
                    '& p': {
                      marginBottom: '16px',
                      '&:last-child': {
                        marginBottom: 0,
                      },
                    },
                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                      color: currentColors.accent,
                      fontWeight: 600,
                      marginTop: '24px',
                      marginBottom: '12px',
                      '&:first-of-type': {
                        marginTop: 0,
                      },
                    },
                    '& h1': {
                      fontSize: '1.4rem',
                    },
                    '& h2': {
                      fontSize: '1.2rem',
                    },
                    '& h3': {
                      fontSize: '1.1rem',
                    },
                    '& ul, & ol': {
                      paddingLeft: '20px',
                      marginBottom: '16px',
                    },
                    '& li': {
                      marginBottom: '8px',
                      lineHeight: 1.6,
                    },
                    '& strong, & b': {
                      color: currentColors.text,
                      fontWeight: 600,
                    },
                    '& em, & i': {
                      fontStyle: 'italic',
                      color: currentColors.accent,
                    },
                    whiteSpace: 'pre-line',
                  }}
                  component="div"
                  dangerouslySetInnerHTML={{
                    __html: modalContent
                      .replace(/\n\n/g, '</p><p>')
                      .replace(/^/, '<p>')
                      .replace(/$/, '</p>')
                      .replace(/<p><\/p>/g, '')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/^(\d+\.\s)/gm, '<li>$1')
                      .replace(/^(-\s)/gm, '<li>')
                      .replace(/^([A-ZÁÉÍÓÚÑ][^:\n]*:)/gm, '<h3>$1</h3>')
                  }}
                />
              </Box>
            </Box>

            {/* Pie del modal */}
            <Box 
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                borderTop: `1px solid ${currentColors.border}`,
                pt: 3
              }}
            >
              <Button
                onClick={handleCloseModal}
                variant="contained"
                sx={{
                  backgroundColor: isDarkTheme ? '#90CAF9' : '#0288D1',
                  color: isDarkTheme ? '#0A1929' : 'white',
                  px: 4,
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: isDarkTheme ? '#64B5F6' : '#01579B',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
                  },
                  transition: 'all 0.3s ease',
                  boxShadow: isDarkTheme 
                    ? '0 4px 12px rgba(144, 202, 249, 0.2)' 
                    : '0 4px 12px rgba(2, 136, 209, 0.3)',
                }}
              >
                Cerrar
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Modal>
    </Box>
  );
};

export default Footer;