import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  TextField, 
  Button, 
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Avatar,
  Chip,
  Stack,
  Alert,
  Skeleton,
  Container,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Divider
} from '@mui/material';
import { 
  SecurityOutlined,
  PersonOutlined,
  BusinessOutlined,
  AdminPanelSettingsOutlined,
  InfoOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  PhoneOutlined,
  EmailOutlined,
  CalendarTodayOutlined,
  LocationOnOutlined,
  WarningAmberOutlined,
  CheckCircleOutlined
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const LoginAttemptsReport = () => {
  const [loginAttempts, setLoginAttempts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState('');
  const [lockTimeMinutes, setLockTimeMinutes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
  
  const { isDarkTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Configuración de colores dinámicos
  const colors = {
    background: isDarkTheme ? '#0f1419' : '#f8fafc',
    cardBg: isDarkTheme ? '#1e293b' : '#ffffff',
    headerBg: isDarkTheme ? '#334155' : '#f1f5f9',
    text: isDarkTheme ? '#f1f5f9' : '#1e293b',
    secondaryText: isDarkTheme ? '#94a3b8' : '#64748b',
    primary: isDarkTheme ? '#3b82f6' : '#2563eb',
    success: isDarkTheme ? '#10b981' : '#059669',
    warning: isDarkTheme ? '#f59e0b' : '#d97706',
    error: isDarkTheme ? '#ef4444' : '#dc2626',
    border: isDarkTheme ? '#374151' : '#e2e8f0',
    hover: isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.05)',
    shadow: isDarkTheme 
      ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
      : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  };

  // Obtener datos al cargar
  useEffect(() => {
    fetchLoginAttempts();
  }, []);

  // Obtener intentos de login
  const fetchLoginAttempts = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://back-end-4803.onrender.com/api/reportes/login-attempts');
      
      if (!response.ok) throw new Error('Error al obtener los intentos de login');
      
      const data = await response.json();
      setLoginAttempts(data.attempts);
      setMaxAttempts(data.maxAttempts.toString());
      setLockTimeMinutes(data.lockTimeMinutes.toString());
    } catch (err) {
      setError(err.message);
      showNotification('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Obtener información del usuario
  const handleUserInfo = async (attempt) => {
    if (!attempt.usuario_id || !attempt.tipo_usuario) {
      showNotification('Información de usuario no disponible', 'warning');
      return;
    }

    try {
      const response = await fetch(
        `https://back-end-4803.onrender.com/api/reportes/usuario/${attempt.tipo_usuario}/${attempt.usuario_id}`
      );
      
      if (!response.ok) throw new Error('Error al obtener información del usuario');
      
      const userData = await response.json();
      setSelectedUser(userData);
      setDialogOpen(true);
    } catch (err) {
      showNotification('Error al obtener información del usuario', 'error');
    }
  };

  // Guardar configuración
  const handleSaveConfig = async () => {
    if (!maxAttempts || !lockTimeMinutes) {
      showNotification('Todos los campos son requeridos', 'warning');
      return;
    }

    try {
      const [response1, response2] = await Promise.all([
        fetch('https://back-end-4803.onrender.com/api/reportes/update-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settingName: 'MAX_ATTEMPTS', settingValue: maxAttempts })
        }),
        fetch('https://back-end-4803.onrender.com/api/reportes/update-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settingName: 'LOCK_TIME_MINUTES', settingValue: lockTimeMinutes })
        })
      ]);

      if (response1.ok && response2.ok) {
        showNotification('Configuración actualizada exitosamente', 'success');
        setIsEditing(false);
      } else {
        throw new Error('Error en la actualización');
      }
    } catch (err) {
      showNotification('Error al actualizar la configuración', 'error');
    }
  };

  // Mostrar notificación
  const showNotification = (message, type) => {
    setNotification({ open: true, message, type });
  };

  // Obtener icono según tipo de usuario
  const getUserIcon = (tipo) => {
    const iconProps = { sx: { fontSize: 20 } };
    switch (tipo) {
      case 'administrador': return <AdminPanelSettingsOutlined {...iconProps} />;
      case 'empleado': return <BusinessOutlined {...iconProps} />;
      case 'paciente': return <PersonOutlined {...iconProps} />;
      default: return <PersonOutlined {...iconProps} />;
    }
  };

  // Obtener color según tipo de usuario
  const getUserColor = (tipo) => {
    switch (tipo) {
      case 'administrador': return colors.error;
      case 'empleado': return colors.warning;
      case 'paciente': return colors.primary;
      default: return colors.secondaryText;
    }
  };

  // Validar entrada numérica
  const handleNumericInput = (setter) => (event) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) setter(value);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={3}>
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header con configuración */}
      <Card
        elevation={0}
        sx={{
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: 3,
          mb: 3,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <SecurityOutlined sx={{ color: colors.primary, fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
                Configuración de Seguridad
              </Typography>
              <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                Gestiona los parámetros de seguridad del sistema
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Intentos máximos permitidos"
                value={maxAttempts}
                onChange={handleNumericInput(setMaxAttempts)}
                disabled={!isEditing}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isEditing ? colors.background : colors.headerBg,
                    '& fieldset': { borderColor: colors.border },
                    '&:hover fieldset': { borderColor: colors.primary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Tiempo de bloqueo (minutos)"
                value={lockTimeMinutes}
                onChange={handleNumericInput(setLockTimeMinutes)}
                disabled={!isEditing}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isEditing ? colors.background : colors.headerBg,
                    '& fieldset': { borderColor: colors.border },
                    '&:hover fieldset': { borderColor: colors.primary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary }
                  }
                }}
              />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'center' }}>
            {!isEditing ? (
              <Button
                variant="contained"
                startIcon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
                sx={{
                  bgcolor: colors.primary,
                  '&:hover': { bgcolor: colors.primary, opacity: 0.9 },
                  borderRadius: 2,
                  px: 3
                }}
              >
                Editar Configuración
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  startIcon={<SaveOutlined />}
                  onClick={handleSaveConfig}
                  sx={{
                    bgcolor: colors.success,
                    '&:hover': { bgcolor: colors.success, opacity: 0.9 },
                    borderRadius: 2
                  }}
                >
                  Guardar
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsEditing(false);
                    fetchLoginAttempts(); // Restaurar valores originales
                  }}
                  sx={{
                    borderColor: colors.border,
                    color: colors.secondaryText,
                    borderRadius: 2
                  }}
                >
                  Cancelar
                </Button>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Tabla de intentos */}
      <Card
        elevation={0}
        sx={{
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 1 }}>
            <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
              Registro de Intentos de Acceso
            </Typography>
            <Typography variant="body2" sx={{ color: colors.secondaryText, mt: 0.5 }}>
              {loginAttempts.length} intentos registrados
            </Typography>
          </Box>
          
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ bgcolor: colors.headerBg }}>
                <TableRow>
                  <TableCell sx={{ color: colors.text, fontWeight: 600 }}>Usuario</TableCell>
                  <TableCell sx={{ color: colors.text, fontWeight: 600 }}>IP Address</TableCell>
                  <TableCell sx={{ color: colors.text, fontWeight: 600 }}>Fecha/Hora</TableCell>
                  <TableCell sx={{ color: colors.text, fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ color: colors.text, fontWeight: 600 }}>Intentos</TableCell>
                  <TableCell sx={{ color: colors.text, fontWeight: 600 }}>Bloqueo</TableCell>
                  <TableCell sx={{ color: colors.text, fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loginAttempts.map((attempt) => (
                  <TableRow
                    key={attempt.id}
                    sx={{
                      '&:hover': { bgcolor: colors.hover },
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                          sx={{
                            bgcolor: getUserColor(attempt.tipo_usuario),
                            width: 32,
                            height: 32
                          }}
                        >
                          {getUserIcon(attempt.tipo_usuario)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ color: colors.text, fontWeight: 500 }}>
                            ID: {attempt.usuario_id || 'N/A'}
                          </Typography>
                          <Chip
                            label={attempt.tipo_usuario?.toUpperCase() || 'DESCONOCIDO'}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: getUserColor(attempt.tipo_usuario),
                              color: 'white'
                            }}
                          />
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ color: colors.text }}>{attempt.ip_address}</TableCell>
                    <TableCell sx={{ color: colors.text }}>
                      {format(new Date(attempt.fecha_hora), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={attempt.exitoso ? <CheckCircleOutlined /> : <WarningAmberOutlined />}
                        label={attempt.exitoso ? 'Exitoso' : 'Fallido'}
                        size="small"
                        color={attempt.exitoso ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={attempt.intentos_fallidos}
                        size="small"
                        sx={{
                          bgcolor: attempt.intentos_fallidos >= 3 ? colors.error : colors.warning,
                          color: 'white'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: colors.text }}>
                      {attempt.fecha_bloqueo ? (
                        <Typography variant="caption" sx={{ color: colors.error }}>
                          {format(new Date(attempt.fecha_bloqueo), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: colors.secondaryText }}>
                          Sin bloqueo
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Ver información del usuario">
                        <IconButton
                          size="small"
                          onClick={() => handleUserInfo(attempt)}
                          sx={{
                            bgcolor: colors.primary,
                            color: 'white',
                            '&:hover': { bgcolor: colors.primary, opacity: 0.8 }
                          }}
                        >
                          <InfoOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Modal de información del usuario */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: colors.cardBg,
            borderRadius: 3,
            border: `1px solid ${colors.border}`
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
              Información del Usuario
            </Typography>
            <IconButton onClick={() => setDialogOpen(false)} size="small">
              <CloseOutlined />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ py: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Stack alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: getUserColor(selectedUser.tipo),
                        fontSize: '2rem'
                      }}
                    >
                      {getUserIcon(selectedUser.tipo)}
                    </Avatar>
                    <Chip
                      label={selectedUser.tipo?.toUpperCase()}
                      sx={{
                        bgcolor: getUserColor(selectedUser.tipo),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Stack spacing={2}>
                    <Typography variant="h5" sx={{ color: colors.text, fontWeight: 600 }}>
                      {selectedUser.nombre} {selectedUser.aPaterno} {selectedUser.aMaterno}
                    </Typography>
                    
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonOutlined sx={{ color: colors.secondaryText, fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: colors.text }}>
                          <strong>ID:</strong> {selectedUser.id}
                        </Typography>
                      </Box>
                      
                      {selectedUser.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailOutlined sx={{ color: colors.secondaryText, fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: colors.text }}>
                            <strong>Email:</strong> {selectedUser.email}
                          </Typography>
                        </Box>
                      )}
                      
                      {selectedUser.telefono && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneOutlined sx={{ color: colors.secondaryText, fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: colors.text }}>
                            <strong>Teléfono:</strong> {selectedUser.telefono}
                          </Typography>
                        </Box>
                      )}
                      
                      {selectedUser.estado && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleOutlined sx={{ color: colors.success, fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: colors.text }}>
                            <strong>Estado:</strong> {selectedUser.estado}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Notificaciones */}
      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        handleClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />
    </Container>
  );
};

export default LoginAttemptsReport;