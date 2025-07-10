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


// Componente Footer compacto y tradicional para pacientes
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

      {/* Modal para documentos legales con formateo profesional */}
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

            {/* Contenido scrolleable con formateo profesional */}
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
              {/* Contenido formateado profesionalmente */}
              <Box
                component="div"
                sx={{
                  ...getFormattedContentStyles(theme, isDarkTheme),
                  color: isDarkTheme ? '#e0e0e0' : '#424242',
                }}
                dangerouslySetInnerHTML={{
                  __html: formatContentForDisplay(modalContent)
                }}
              />
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