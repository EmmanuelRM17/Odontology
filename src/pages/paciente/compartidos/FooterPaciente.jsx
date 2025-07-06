import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  IconButton, 
  useMediaQuery,
  Modal,
  Paper,
  Fade,
  Divider
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { 
  FaTimes,
  FaShieldAlt,
  FaFileContract,
  FaExclamationTriangle
} from 'react-icons/fa';
import axios from 'axios';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

// Componente Footer compacto y tradicional
const FooterPaciente = () => {
  // Estados para datos provenientes de la API
  const [privacyPolicy, setPrivacyPolicy] = useState([]);
  const [termsConditions, setTermsConditions] = useState([]);
  const [disclaimer, setDisclaimer] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalIcon, setModalIcon] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isDarkTheme } = useThemeContext();

  // Configuración de colores para footer discreto
  const colors = {
    background: isDarkTheme ? '#121212' : '#f5f5f5',
    text: isDarkTheme ? '#b0b0b0' : '#666666',
    textHover: isDarkTheme ? '#ffffff' : '#333333',
    border: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    primary: isDarkTheme ? '#42a5f5' : '#1565c0',
    cardBg: isDarkTheme ? '#1e1e1e' : '#ffffff'
  };

  // Efecto para cargar datos desde la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [privacyRes, termsRes, disclaimerRes] = await Promise.all([
          axios.get('https://back-end-4803.onrender.com/api/politicas/politicas_privacidad'),
          axios.get('https://back-end-4803.onrender.com/api/termiCondicion/terminos_condiciones'),
          axios.get('https://back-end-4803.onrender.com/api/deslinde/deslinde')
        ]);

        setPrivacyPolicy(privacyRes.data.filter(item => item.estado === 'activo'));
        setTermsConditions(termsRes.data.filter(item => item.estado === 'activo'));
        setDisclaimer(disclaimerRes.data.filter(item => item.estado === 'activo'));
      } catch (error) {
        console.error('Error al cargar documentos legales:', error);
      }
    };

    fetchData();
  }, []);

  // Maneja la apertura del modal
  const handleOpenModal = (title, content, icon) => {
    setModalTitle(title);
    setModalContent(content || 'Contenido no disponible');
    setModalIcon(icon);
    setModalOpen(true);
  };

  // Cierra el modal
  const handleCloseModal = () => setModalOpen(false);

  // Formatear contenido para mejor legibilidad
  const formatContent = (content) => {
    if (!content) return 'Contenido no disponible';
    
    return content
      .split('\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .join('\n\n');
  };

  return (
    <>
      {/* Footer compacto y tradicional */}
      <Box 
        component="footer" 
        sx={{
          backgroundColor: colors.background,
          borderTop: `1px solid ${colors.border}`,
          py: { xs: 2, md: 2.5 },
          mt: 'auto'
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 1.5 : 2
            }}
          >
            {/* Copyright */}
            <Typography 
              variant="body2" 
              sx={{ 
                color: colors.text,
                fontSize: '0.85rem',
                fontWeight: 400
              }}
            >
              © {new Date().getFullYear()} Odontología Carol - Portal de Pacientes
            </Typography>
            
            {/* Enlaces legales */}
            <Box 
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, md: 2 },
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}
            >
              <Button
                onClick={() => handleOpenModal(
                  'Política de Privacidad', 
                  privacyPolicy[0]?.contenido,
                  <FaShieldAlt />
                )}
                sx={{ 
                  fontSize: '0.8rem',
                  color: colors.text,
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  '&:hover': {
                    color: colors.textHover,
                    backgroundColor: alpha(colors.primary, 0.05)
                  }
                }}
              >
                Privacidad
              </Button>
              
              <Divider 
                orientation="vertical" 
                flexItem 
                sx={{ 
                  borderColor: colors.border,
                  height: 16,
                  alignSelf: 'center'
                }} 
              />
              
              <Button
                onClick={() => handleOpenModal(
                  'Términos y Condiciones', 
                  termsConditions[0]?.contenido,
                  <FaFileContract />
                )}
                sx={{ 
                  fontSize: '0.8rem',
                  color: colors.text,
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  '&:hover': {
                    color: colors.textHover,
                    backgroundColor: alpha(colors.primary, 0.05)
                  }
                }}
              >
                Términos
              </Button>
              
              <Divider 
                orientation="vertical" 
                flexItem 
                sx={{ 
                  borderColor: colors.border,
                  height: 16,
                  alignSelf: 'center'
                }} 
              />
              
              <Button
                onClick={() => handleOpenModal(
                  'Deslinde Legal', 
                  disclaimer[0]?.contenido,
                  <FaExclamationTriangle />
                )}
                sx={{ 
                  fontSize: '0.8rem',
                  color: colors.text,
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  '&:hover': {
                    color: colors.textHover,
                    backgroundColor: alpha(colors.primary, 0.05)
                  }
                }}
              >
                Deslinde Legal
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Modal para documentos legales */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Fade in={modalOpen}>
          <Paper
            elevation={isDarkTheme ? 8 : 5}
            sx={{
              position: 'relative',
              borderRadius: 2,
              p: 0,
              mx: 1,
              maxWidth: '700px', 
              maxHeight: '85vh',
              width: '100%',
              overflow: 'hidden',
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              '&:focus': {
                outline: 'none',
              }
            }}
          >
            {/* Header del modal */}
            <Box 
              sx={{
                p: 3,
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: alpha(colors.primary, 0.03)
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: alpha(colors.primary, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.primary
                  }}
                >
                  {modalIcon && React.cloneElement(modalIcon, { size: 16 })}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: isDarkTheme ? '#ffffff' : '#212121'
                  }}
                >
                  {modalTitle}
                </Typography>
              </Box>
              
              <IconButton
                onClick={handleCloseModal}
                size="small"
                sx={{
                  color: colors.text,
                  '&:hover': {
                    color: colors.textHover,
                    backgroundColor: alpha(colors.primary, 0.1)
                  }
                }}
              >
                <FaTimes size={16} />
              </IconButton>
            </Box>

            {/* Contenido scrolleable */}
            <Box 
              sx={{ 
                maxHeight: 'calc(85vh - 140px)',
                overflowY: 'auto',
                p: 3,
                '&::-webkit-scrollbar': {
                  width: '6px'
                },
                '&::-webkit-scrollbar-track': {
                  background: alpha(colors.text, 0.1),
                  borderRadius: '3px'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: alpha(colors.text, 0.3),
                  borderRadius: '3px',
                  '&:hover': {
                    background: alpha(colors.text, 0.5)
                  }
                }
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  lineHeight: 1.6,
                  color: isDarkTheme ? '#e0e0e0' : '#424242',
                  whiteSpace: 'pre-line',
                  fontSize: '0.9rem'
                }}
              >
                {formatContent(modalContent)}
              </Typography>
            </Box>

            {/* Footer del modal */}
            <Box 
              sx={{
                p: 2,
                borderTop: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: alpha(colors.primary, 0.02)
              }}
            >
              <Button
                onClick={handleCloseModal}
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: colors.primary,
                  color: '#fff',
                  px: 2.5,
                  py: 0.75,
                  borderRadius: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: alpha(colors.primary, 0.8),
                    boxShadow: `0 2px 8px ${alpha(colors.primary, 0.3)}`
                  }
                }}
              >
                Cerrar
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Modal>
    </>
  );
};

export default FooterPaciente;