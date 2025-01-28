import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, Modal, Button, Grid, Container, Divider } from '@mui/material';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Función auxiliar para formatear URLs de redes sociales
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
    baseUrl: 'https://facebook.com/'
  },
  {
    label: 'Twitter',
    name: 'twitter',
    icon: <FaTwitter />,
    baseUrl: 'https://twitter.com/'
  },
  {
    label: 'LinkedIn',
    name: 'linkedin',
    icon: <FaLinkedin />,
    baseUrl: 'https://linkedin.com/in/'
  },
  {
    label: 'Instagram',
    name: 'instagram',
    icon: <FaInstagram />,
    baseUrl: 'https://instagram.com/'
  },
  {
    label: 'WhatsApp',
    name: 'whatsapp',
    icon: <FaWhatsapp />,
    baseUrl: 'https://wa.me/'
  }
];

const Footer = () => {
  const [socials, setSocials] = useState([]);
  const [privacyPolicy, setPrivacyPolicy] = useState([]);
  const [termsConditions, setTermsConditions] = useState([]);
  const [disclaimer, setDisclaimer] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  // Your existing useEffect hooks remain the same...
  useEffect(() => {
    const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(matchDarkTheme.matches);

    const handleThemeChange = (e) => {
      setIsDarkMode(e.matches);
    };

    matchDarkTheme.addEventListener('change', handleThemeChange);

    return () => {
      matchDarkTheme.removeEventListener('change', handleThemeChange);
    };
  }, []);

  useEffect(() => {
    const fetchSocials = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/redesSociales/sociales');
        setSocials(response.data);
      } catch (error) {
        console.error('Error al obtener las redes sociales', error);
      }
    };

    const fetchPrivacyPolicy = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/politicas/politicas_privacidad');
        const activePolicy = response.data.filter(policy => policy.estado === 'activo');
        setPrivacyPolicy(activePolicy);
      } catch (error) {
        console.error('Error al obtener las políticas de privacidad', error);
      }
    };

    const fetchTermsConditions = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/termiCondicion/terminos_condiciones');
        const activeTerms = response.data.filter(term => term.estado === 'activo');
        setTermsConditions(activeTerms);
      } catch (error) {
        console.error('Error al obtener los términos y condiciones', error);
      }
    };

    const fetchDisclaimer = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/deslinde/deslinde');
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

  const handleOpenModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setModalOpen(true);
  };

  const handleSocialClick = (social) => {
    const formattedUrl = formatSocialUrl(social.nombre_red, social.url);
    window.open(formattedUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCloseModal = () => setModalOpen(false);

  // Your existing footer JSX remains the same until the Modal component...
  return (
    <footer
      style={{
        backgroundColor: isDarkMode ? '#0D1B2A' : '#03427C',
        color: '#ffffff',
        padding: '20px 0',
        textAlign: 'center',
        width: '100%',
      }}
    >
      <Container>
        <Grid container spacing={4}>
          {/* Columna 1: Acerca de Carol */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Acerca de Carol</Typography>
            <Button
              sx={{ color: '#ffffff', fontSize: '0.85rem', textAlign: 'left' }}
              onClick={() => navigate('/about')}
            >
              Información sobre nuestra empresa
            </Button>
            <Divider sx={{ backgroundColor: '#ffffff', my: 1, opacity: 0.5 }} />
          </Grid>

          {/* Columna 2: Servicio al Cliente */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Servicio al Cliente</Typography>
            <Button
              sx={{ color: '#ffffff', fontSize: '0.85rem', textAlign: 'left' }}
              onClick={() => navigate('/FAQ')}
            >
              Preguntas frecuentes
            </Button>
            <Button
              sx={{ color: '#ffffff', fontSize: '0.85rem', textAlign: 'left' }}
              onClick={() => navigate('/Contact')}
            >
              Contáctanos
            </Button>
            <Divider sx={{ backgroundColor: '#ffffff', my: 1, opacity: 0.5 }} />
          </Grid>

          {/* Columna 3: Normatividad */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Normatividad</Typography>
            <Button
              onClick={() => handleOpenModal('Política de Privacidad', privacyPolicy[0]?.contenido || 'No disponible')}
              sx={{ color: '#ffffff', fontSize: '0.85rem', textAlign: 'left' }}
            >
              Política de Privacidad
            </Button>
            <Button
              onClick={() => handleOpenModal('Términos y Condiciones', termsConditions[0]?.contenido || 'No disponible')}
              sx={{ color: '#ffffff', fontSize: '0.85rem', textAlign: 'left' }}
            >
              Términos y Condiciones
            </Button>
            <Button
              onClick={() => handleOpenModal('Deslinde Legal', disclaimer[0]?.contenido || 'No disponible')}
              sx={{ color: '#ffffff', fontSize: '0.85rem', textAlign: 'left' }}
            >
              Deslinde Legal
            </Button>
            <Divider sx={{ backgroundColor: '#ffffff', my: 1, opacity: 0.5 }} />
          </Grid>

          {/* Columna 4: Redes Sociales */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Síguenos en redes sociales
            </Typography>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
              mb: 1,
              flexWrap: 'wrap'
            }}>
              {socials.map((social) => {
                const socialConfig = availableSocials.find(
                  (s) => s.name === social.nombre_red
                );

                return socialConfig && (
                  <IconButton
                    key={social.id}
                    onClick={() => handleSocialClick(social)}
                    sx={{
                      color: '#ffffff',
                      fontSize: '1.5rem',
                      transition: 'transform 0.2s, color 0.2s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        color: '#e0e0e0'
                      }
                    }}
                  >
                    {socialConfig.icon}
                  </IconButton>
                );
              })}
            </Box>
            <Divider sx={{ backgroundColor: '#ffffff', my: 1, opacity: 0.5 }} />
          </Grid>
        </Grid>
        <Typography sx={{ mt: 2, fontSize: '0.7rem' }}>© 2024 Odontologia Carol. Todos los derechos reservados.</Typography>
      </Container>

      {/* Enhanced Modal Design */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            p: { xs: 2, sm: 4 },
            mx: 2,
            maxWidth: '600px',
            maxHeight: '80vh',
            width: '100%',
            overflowY: 'auto',
            '&:focus': {
              outline: 'none',
            },
            animation: 'modal-slide-down 0.3s ease-out',
            '@keyframes modal-slide-down': {
              '0%': {
                opacity: 0,
                transform: 'translateY(-20px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          {/* Header */}
          <Box sx={{
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            pb: 2,
            mb: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: '#1a237e',
              }}
            >
              {modalTitle}
            </Typography>
            <IconButton
              onClick={handleCloseModal}
              sx={{
                color: 'grey.500',
                '&:hover': {
                  color: 'grey.700',
                },
              }}
            >
              ✕
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.8,
                color: 'grey.800',
                whiteSpace: 'pre-line',
              }}
            >
              {modalContent}
            </Typography>
          </Box>

          {/* Footer */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            pt: 3
          }}>
            <Button
              onClick={handleCloseModal}
              variant="contained"
              sx={{
                backgroundColor: '#00BCD4',
                color: 'white',
                px: 4,
                py: 1,
                borderRadius: '8px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#0097a7',
                },
                boxShadow: '0 2px 8px rgba(0, 188, 212, 0.25)',
              }}
            >
              Cerrar
            </Button>
          </Box>
        </Box>
      </Modal>
    </footer>
  );
};

export default Footer;