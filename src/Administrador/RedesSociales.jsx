import React, { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  Typography,
  Box,
  Button,
  IconButton,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';
import axios from 'axios';

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

  // Cargar las redes sociales de la base de datos
  useEffect(() => {
    const fetchSocials = async () => {
      try {
        const response = await axios.get('https://backendodontologia.onrender.com/api/redesSociales/get');
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

  // Validación simplificada: solo se valida que el campo no esté vacío
  const validateInput = () => {
    if (!url) {
      alert('Por favor, ingresa un enlace o número.');
      return false;
    }
    return true;
  };

  // Guardar red social (añadir o editar)
  const handleSave = async () => {
    if (validateInput()) {
      try {
        if (isEditing !== null) {
          await axios.put(`https://backendodontologia.onrender.com/api/redesSociales/editar/${isEditing}`, {
            nombre_red: selectedSocial,
            url: selectedSocial === 'whatsapp' ? `+52${url}` : url,
          });
          setSocialData({ ...socialData, [selectedSocial]: { ...socialData[selectedSocial], url: `+52${url}` } });
          setIsEditing(null);
        } else {
          const response = await axios.post('https://backendodontologia.onrender.com/api/redesSociales/nuevo', {
            nombre_red: selectedSocial,
            url: selectedSocial === 'whatsapp' ? `+52${url}` : url,
          });
          const newSocial = response.data;
          setSocialData({ ...socialData, [selectedSocial]: newSocial });
        }
        setSelectedSocial('');
        setUrl('');
      } catch (error) {
        console.error('Error al guardar la red social:', error);
      }
    }
  };

  // Eliminar red social
  const handleDelete = async (social) => {
    try {
      const id = socialData[social]?.id;
      await axios.delete(`https://backendodontologia.onrender.com/api/redesSociales/eliminar/${id}`);
      const updatedData = { ...socialData };
      delete updatedData[social];
      setSocialData(updatedData);
    } catch (error) {
      console.error('Error al eliminar la red social:', error);
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
        backgroundColor: '#fff',
        p: 3,
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography variant="h5" gutterBottom>
        Redes Sociales
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <TextField
            select
            label="Selecciona una red social"
            value={selectedSocial}
            onChange={handleSocialSelect}
            fullWidth
          >
            {availableSocials.map((option) => (
              <MenuItem key={option.name} value={option.name}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={6}>
          <TextField
            fullWidth
            label={selectedSocial === 'whatsapp' ? 'Número de WhatsApp' : 'Enlace'}
            value={url}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: selectedSocial === 'whatsapp' && <Typography sx={{ color: 'gray' }}>+52</Typography>, // Visualmente +52
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
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!selectedSocial || !url}
          >
            Guardar
          </Button>
        </Grid>
      </Grid>

      <List>
        {Object.keys(socialData).map((social) => (
          <ListItem key={social}>
            <ListItemText
              primary={availableSocials.find((s) => s.name === social)?.label || social}
              secondary={socialData[social]?.url}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(social)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(social)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default RedesSociales;
