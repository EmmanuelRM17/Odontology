import React, { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  Typography,
  Box,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';
import axios from 'axios';
import Notificaciones from '../../../../components/Layout/Notificaciones'; 

// Redes sociales disponibles
const availableSocials = [
  { label: 'Facebook', name: 'facebook', type: 'url' },
  { label: 'Twitter', name: 'twitter', type: 'url' },
  { label: 'LinkedIn', name: 'linkedin', type: 'url' },
  { label: 'Instagram', name: 'instagram', type: 'url' },
  { label: 'WhatsApp', name: 'whatsapp', type: 'phone' },
];

const RedesSociales = () => {
  const [socialData, setSocialData] = useState({});
  const [selectedSocial, setSelectedSocial] = useState('');
  const [url, setUrl] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  
  // Estado para manejar notificaciones
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success',  // success, error, warning, info
  });

  // Primero, agregamos el hook para el tema oscuro
const [isDarkTheme, setIsDarkTheme] = useState(false);

useEffect(() => {
  const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
  setIsDarkTheme(matchDarkTheme.matches);

  const handleThemeChange = (e) => {
    setIsDarkTheme(e.matches);
  };

  matchDarkTheme.addEventListener('change', handleThemeChange);
  return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
}, []);

// Definición de colores
const colors = {
  background: isDarkTheme ? '#1B2A3A' : '#ffffff',
  paper: isDarkTheme ? '#243447' : '#ffffff',
  tableBackground: isDarkTheme ? '#1E2A3A' : '#e3f2fd',
  text: isDarkTheme ? '#FFFFFF' : '#333333',
  secondaryText: isDarkTheme ? '#E8F1FF' : '#666666',
  inputText: isDarkTheme ? '#FFFFFF' : '#333333',
  inputLabel: isDarkTheme ? '#E8F1FF' : '#666666',
  inputBorder: isDarkTheme ? '#4B9FFF' : '#e0e0e0',
  primary: isDarkTheme ? '#4B9FFF' : '#1976d2',
  hover: isDarkTheme ? 'rgba(75,159,255,0.15)' : 'rgba(25,118,210,0.1)',
};

// Estilos para los inputs
const inputStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: isDarkTheme ? '#1B2A3A' : '#ffffff',
    color: colors.inputText,
    '& fieldset': {
      borderColor: colors.inputBorder,
      borderWidth: isDarkTheme ? '2px' : '1px',
    },
    '&:hover fieldset': {
      borderColor: colors.primary,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.primary,
    }
  },
  '& .MuiInputLabel-root': {
    color: colors.inputLabel,
    '&.Mui-focused': {
      color: colors.primary
    }
  },
  '& .MuiSelect-icon': {
    color: colors.inputLabel
  },
  '& .MuiMenuItem-root': {
    color: colors.text
  }
};

  // Manejar el cierre de la notificación
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Cargar las redes sociales de la base de datos
  useEffect(() => {
    const fetchSocials = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/redesSociales/get');
        setSocialData(response.data.reduce((acc, item) => ({ ...acc, [item.nombre_red]: item }), {})); // Guardamos el objeto completo
      } catch (error) {
        console.error('Error al obtener las redes sociales:', error);
      }
    };

    fetchSocials();
  }, []);

  const handleInputChange = (e) => {
    if (selectedSocial === 'whatsapp') {
      // Solo permitir números y hasta 10 dígitos
      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
      setUrl(value);
    } else {
      setUrl(e.target.value);
    }
  };

  const handleSocialSelect = (e) => {
    setSelectedSocial(e.target.value);
    setUrl(''); // Limpiar el campo de URL al seleccionar una nueva red social
  };

  // Validación simplificada: solo se valida que el campo no esté vacío y que no se duplique
  const validateInput = () => {
    if (!url) {
      setNotification({
        open: true,
        message: 'Por favor, ingresa un enlace o número.',
        type: 'error',
      });
      return false;
    }

    if (socialData[selectedSocial] && !isEditing) {
      setNotification({
        open: true,
        message: `La red social ${selectedSocial} ya está registrada. Puedes editarla en lugar de agregar una nueva.`,
        type: 'warning',
      });
      return false;
    }

    return true;
  };

  // Guardar red social (añadir o editar)
  const handleSave = async () => {
    if (validateInput()) {
      try {
        if (isEditing !== null) {
          // Editar la red social
          await axios.put(`http://localhost:3001/api/redesSociales/editar/${isEditing}`, {
            nombre_red: selectedSocial,
            url: selectedSocial === 'whatsapp' ? `+52${url}` : url,
          });
          setSocialData({ ...socialData, [selectedSocial]: { ...socialData[selectedSocial], url: `+52${url}` } });
          setIsEditing(null);
          setNotification({
            open: true,
            message: 'Red social actualizada con éxito.',
            type: 'success',
          });
        } else {
          // Añadir nueva red social
          const response = await axios.post('http://localhost:3001/api/redesSociales/nuevo', {
            nombre_red: selectedSocial,
            url: selectedSocial === 'whatsapp' ? `+52${url}` : url,
          });
          const newSocial = response.data;
          setSocialData({ ...socialData, [selectedSocial]: newSocial });
          setNotification({
            open: true,
            message: 'Red social agregada con éxito.',
            type: 'success',
          });
        }
        setSelectedSocial('');
        setUrl('');
      } catch (error) {
        console.error('Error al guardar la red social:', error);
        setNotification({
          open: true,
          message: 'Error al guardar la red social.',
          type: 'error',
        });
      }
    }
  };

  // Eliminar red social
  const handleDelete = async (social) => {
    try {
      const id = socialData[social]?.id;
      await axios.delete(`http://localhost:3001/api/redesSociales/eliminar/${id}`);
      const updatedData = { ...socialData };
      delete updatedData[social];
      setSocialData(updatedData);
      setNotification({
        open: true,
        message: 'Red social eliminada con éxito.',
        type: 'success',
      });
    } catch (error) {
      console.error('Error al eliminar la red social:', error);
      setNotification({
        open: true,
        message: 'Error al eliminar la red social.',
        type: 'error',
      });
    }
  };

  // Editar red social
  const handleEdit = (social) => {
    setIsEditing(socialData[social].id);
    setSelectedSocial(social);
    setUrl(socialData[social].url.replace('+52', '')); // Quitar +52 si es WhatsApp
  };

  return (
    <Box
      sx={{
        mt: 4,
        backgroundColor: colors.paper,
        p: { xs: 2, sm: 3 },
        borderRadius: '16px',
        boxShadow: isDarkTheme ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease'
      }}
    >
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{ 
          color: colors.text,
          fontWeight: 600,
          mb: 3
        }}
      >
        Redes Sociales
      </Typography>
  
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Selecciona una red social"
            value={selectedSocial}
            onChange={handleSocialSelect}
            fullWidth
            sx={inputStyles}
          >
            {availableSocials.map((option) => (
              <MenuItem 
                key={option.name} 
                value={option.name}
                sx={{
                  color: colors.text,
                  '&:hover': {
                    backgroundColor: colors.hover
                  }
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
  
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={selectedSocial === 'whatsapp' ? 'Número de WhatsApp' : 'Enlace'}
            value={url}
            onChange={handleInputChange}
            sx={inputStyles}
            InputProps={{
              startAdornment: selectedSocial === 'whatsapp' && (
                <Typography sx={{ color: colors.secondaryText, mr: 1 }}>
                  +52
                </Typography>
              ),
            }}
            helperText={
              selectedSocial === 'whatsapp'
                ? 'Ingresa los 10 dígitos restantes, ej: 1234567890'
                : 'Ingresa el enlace de la red social'
            }
          />
        </Grid>
  
        <Grid item xs={12}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!selectedSocial || !url}
            sx={{
              backgroundColor: colors.primary,
              '&:hover': {
                backgroundColor: isDarkTheme ? '#5BABFF' : '#1565c0'
              },
              '&.Mui-disabled': {
                backgroundColor: isDarkTheme ? '#2C3E50' : '#e0e0e0'
              }
            }}
          >
            {isEditing ? 'Actualizar' : 'Guardar'}
          </Button>
        </Grid>
      </Grid>
  
      <TableContainer 
        component={Paper} 
        sx={{ 
          backgroundColor: colors.tableBackground,
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: isDarkTheme ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: isDarkTheme ? '#1B2A3A' : '#e3f2fd' }}>
              <TableCell sx={{ color: colors.text, fontWeight: 600 }}>
                Red Social
              </TableCell>
              <TableCell sx={{ color: colors.text, fontWeight: 600 }}>
                Enlace / Número
              </TableCell>
              <TableCell align="right" sx={{ color: colors.text, fontWeight: 600 }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(socialData).map((social) => (
              <TableRow 
                key={social}
                sx={{
                  '&:hover': {
                    backgroundColor: colors.hover
                  }
                }}
              >
                <TableCell sx={{ color: colors.text }}>
                  {availableSocials.find((s) => s.name === social)?.label || social}
                </TableCell>
                <TableCell sx={{ color: colors.text }}>
                  {socialData[social]?.url}
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    onClick={() => handleEdit(social)}
                    sx={{ 
                      color: colors.primary,
                      '&:hover': {
                        backgroundColor: colors.hover
                      }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(social)}
                    sx={{ 
                      color: isDarkTheme ? '#ff6b6b' : '#f44336',
                      '&:hover': {
                        backgroundColor: isDarkTheme ? 'rgba(255,107,107,0.1)' : 'rgba(244,67,54,0.1)'
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {Object.keys(socialData).length === 0 && (
              <TableRow>
                <TableCell 
                  colSpan={3} 
                  align="center"
                  sx={{ 
                    color: colors.secondaryText,
                    py: 4
                  }}
                >
                  No hay redes sociales registradas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
  
      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        handleClose={handleCloseNotification}
      />
    </Box>
  );
};

export default RedesSociales;
