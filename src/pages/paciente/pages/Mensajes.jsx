import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import {
  Construction,
  Message,
  Schedule,
  Phone,
  Email,
  WhatsApp,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import { useAuth } from '../../../components/Tools/AuthContext';

// Componente de mensajes en mantenimiento
const Mensajes = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isDarkTheme } = useThemeContext();
  const { user } = useAuth();

  // Colores según tema
  const colors = {
    background: isDarkTheme ? '#0F172A' : '#F8FAFC',
    cardBg: isDarkTheme ? '#1E293B' : '#FFFFFF',
    text: isDarkTheme ? '#F3F4F6' : '#1F2937',
    subtext: isDarkTheme ? '#94A3B8' : '#64748B',
    primary: isDarkTheme ? '#3B82F6' : '#2563EB',
    secondary: isDarkTheme ? '#4ADE80' : '#10B981',
    warning: isDarkTheme ? '#F59E0B' : '#F59E0B',
    divider: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    boxShadow: isDarkTheme
      ? '0 4px 12px rgba(0,0,0,0.3)'
      : '0 2px 6px rgba(0,0,0,0.05)'
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mt: 2 }}>
        {/* Botón de regreso */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/Paciente/principal')}
          sx={{
            mb: 3,
            color: colors.primary,
            '&:hover': {
              backgroundColor: colors.primary + '10'
            }
          }}
        >
          Volver al Inicio
        </Button>

        {/* Card principal de mantenimiento */}
        <Paper
          sx={{
            backgroundColor: colors.cardBg,
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: colors.boxShadow,
            textAlign: 'center'
          }}
        >
          <Box
            sx={{
              background: `linear-gradient(135deg, ${colors.warning}, ${colors.primary})`,
              py: 4,
              px: 3
            }}
          >
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2
              }}
            >
              <Construction sx={{ fontSize: 40, color: '#FFFFFF' }} />
            </Avatar>
            
            <Typography
              variant="h4"
              sx={{
                color: '#FFFFFF',
                fontWeight: 700,
                mb: 1,
                fontSize: { xs: '1.8rem', md: '2.25rem' }
              }}
            >
              Sistema de Mensajería
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 500
              }}
            >
              Próximamente Disponible
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  color: colors.text,
                  fontWeight: 600,
                  mb: 2
                }}
              >
                Hola {user?.nombre}, estamos trabajando en algo increíble
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: colors.subtext,
                  lineHeight: 1.6,
                  mb: 3
                }}
              >
                Estamos desarrollando un sistema de mensajería directa que te permitirá 
                comunicarte de manera rápida y segura con nuestro equipo médico. 
                Podrás enviar consultas, recibir respuestas y mantener un historial 
                de todas tus conversaciones.
              </Typography>

              {/* Características que vendrán */}
              <Box sx={{ textAlign: 'left', mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: colors.text,
                    fontWeight: 600,
                    mb: 2,
                    textAlign: 'center'
                  }}
                >
                  Características que incluirá:
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { icon: <Message />, text: 'Mensajería directa con el equipo médico' },
                    { icon: <Schedule />, text: 'Respuestas en tiempo real durante horarios de atención' },
                    { icon: <Construction />, text: 'Historial completo de conversaciones' },
                    { icon: <Message />, text: 'Notificaciones de nuevos mensajes' }
                  ].map((feature, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        backgroundColor: colors.primary + '08',
                        borderRadius: 2,
                        border: `1px solid ${colors.divider}`
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: colors.primary + '20',
                          color: colors.primary,
                          width: 40,
                          height: 40,
                          mr: 2
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Typography
                        variant="body2"
                        sx={{
                          color: colors.text,
                          fontWeight: 500
                        }}
                      >
                        {feature.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 3, borderColor: colors.divider }} />
              
              {/* Información adicional */}
              <Card
                sx={{
                  backgroundColor: colors.secondary + '10',
                  border: `1px solid ${colors.secondary}40`,
                  borderRadius: 2
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.text,
                      fontWeight: 500,
                      textAlign: 'center'
                    }}
                  >
                    <strong>💡 Consejo:</strong> Mientras desarrollamos esta función, 
                    puedes agendar citas directamente desde la sección "Mis Citas" 
                    o contactarnos por los medios tradicionales para cualquier consulta urgente.
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Botón de acción */}
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/Paciente/citas')}
              sx={{
                backgroundColor: colors.primary,
                color: '#FFFFFF',
                py: 1.5,
                px: 4,
                borderRadius: 3,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: colors.primary + 'DD'
                }
              }}
            >
              Ver Mis Citas
            </Button>
          </CardContent>
        </Paper>

        {/* Footer informativo */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography
            variant="caption"
            sx={{
              color: colors.subtext,
              fontSize: '0.75rem'
            }}
          >
            Estamos trabajando para mejorar tu experiencia. 
            Te notificaremos cuando la función esté disponible.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Mensajes;