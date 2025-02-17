import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Grid, MenuItem, FormControl, Select, InputLabel,
  Card, CardContent, Typography, TableContainer,
  Table, TableBody, TableCell, TableHead, TableRow, Paper, Dialog,
  DialogTitle, DialogContent, DialogActions, Box, IconButton, Tooltip,
  Chip, Fab,
} from '@mui/material';
import {
  MedicalServices, Timer, AttachMoney, Edit, Delete,
  Description, CheckCircle, Info, EventAvailable,
  HealthAndSafety, MenuBook, AccessTime, Add, Close, BorderColor
} from '@mui/icons-material';
import EditServiceDialog from './EditService';
import Notificaciones from '../../../components/Layout/Notificaciones';

const ServicioForm = () => {
  const [isDarkTheme] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openNewServiceForm, setOpenNewServiceForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: '',
  });

  // Colores del tema
  const colors = {
    background: isDarkTheme ? '#0D1B2A' : '#ffffff',
    primary: isDarkTheme ? '#00BCD4' : '#03427C',
    text: isDarkTheme ? '#ffffff' : '#1a1a1a',
    secondary: isDarkTheme ? '#A0AEC0' : '#666666',
    cardBg: isDarkTheme ? '#1A2735' : '#ffffff',
  };

  const [newService, setNewService] = useState({
    title: '',
    description: '',
    category: 'General',
    duration: '',
    price: '',
    disponibilidad: true,
    promotion: 0,
    benefits: ['', '', '', ''],
    includes: ['', '', '', ''],
    preparation: ['', '', '', ''],
    aftercare: ['', '', '', '']
  });

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Función para manejar la apertura del diálogo de detalles
  const handleArrayChange = (field, index, value) => {
    setNewService(prev => ({
      ...prev,
      [field]: prev[field] ? prev[field].map((item, i) => (i === index ? value : item)) : [],
    }));
  };

  //validacion del form
  const validateServiceForm = () => {
    return (
      newService.title.trim() !== "" &&
      newService.description.trim() !== "" &&
      +     newService.category.trim() !== "" &&
      newService.duration.trim() !== "" &&
      newService.price > 0
    );
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;

    setIsProcessing(true);

    try {
        const response = await fetch(`https://back-end-4803.onrender.com/api/servicios/delete/${serviceToDelete.id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Error al eliminar el servicio');
        }

        setNotification({
            open: true,
            message: `El servicio "${serviceToDelete.title}" ha sido eliminado correctamente.`,
            type: 'success',
        });

        setOpenConfirmDialog(false);
        setServiceToDelete(null);
        fetchServices(); // Refrescar la lista después de eliminar

        // Asegurar que la notificación se cierre después de 3 segundos
        setTimeout(() => {
            setNotification({ open: false, message: '', type: '' });
        }, 3000);

    } catch (error) {
        console.error('Error al eliminar el servicio:', error);

        setNotification({
            open: true,
            message: 'Hubo un error al eliminar el servicio.',
            type: 'error',
        });

        setTimeout(() => {
            setNotification({ open: false, message: '', type: '' });
        }, 3000);

    } finally {
        setIsProcessing(false);
    }
};
 


  const handleViewDetails = (service) => {
    const details = {
      benefits: service.benefits || [],
      includes: service.includes || [],
      preparation: service.preparation || [],
      aftercare: service.aftercare || [],
    };

    setSelectedService({ ...service, details }); // Asegura que `details` exista
    setOpenDialog(true);
  };


  // Función para filtrar servicios basados en la búsqueda
  const fetchServices = async () => {
    try {
      const response = await fetch("https://back-end-4803.onrender.com/api/servicios/all");
      if (!response.ok) throw new Error("Error al obtener los servicios");

      const data = await response.json();

      // Consulta para obtener los detalles del servicio
      const detailsResponse = await fetch("https://back-end-4803.onrender.com/api/servicios/detalles");
      if (!detailsResponse.ok) throw new Error("Error al obtener los detalles de los servicios");

      const detailsData = await detailsResponse.json();

      // Mapear detalles al servicio correcto
      const servicesWithDetails = data.map(service => ({
        ...service,
        benefits: detailsData
          .filter(d => d.servicio_id === service.id && d.tipo === 'beneficio')
          .map(d => d.descripcion),

        includes: detailsData
          .filter(d => d.servicio_id === service.id && d.tipo === 'incluye')
          .map(d => d.descripcion),

        preparation: detailsData
          .filter(d => d.servicio_id === service.id && d.tipo === 'preparacion')
          .map(d => d.descripcion),

        aftercare: detailsData
          .filter(d => d.servicio_id === service.id && d.tipo === 'cuidado')
          .map(d => d.descripcion),
      }));


      setServices(servicesWithDetails);
    } catch (error) {
      console.error("Error cargando servicios:", error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Renderizado del componente
  return (
    <Box sx={{ p: 3, backgroundColor: colors.background, minHeight: '100vh' }}>
      <Card sx={{
        mb: 4,
        backgroundColor: colors.paper,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <CardContent>
          <Typography variant="h4" align="center" color={colors.primary} gutterBottom>
            <HealthAndSafety sx={{ fontSize: 40, verticalAlign: 'middle', mr: 2 }} />
            Servicios Dentales
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <TextField
              variant="outlined"
              placeholder="Buscar servicio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Info sx={{ color: colors.primary, mr: 1 }} />
              }}
              sx={{ width: '50%' }}
            />
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: colors.tableHeader }}>
                <TableRow>
                  <TableCell>Servicio</TableCell>
                  <TableCell>Duración</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services && services.length > 0 ? (
                  services.map((service) => (
                    <TableRow
                      key={service?.id || Math.random()} // Evita errores si `id` es undefined
                      sx={{
                        '&:hover': { backgroundColor: colors.hover },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MedicalServices sx={{ color: colors.primary, mr: 2 }} />
                          <Typography>{service?.title || "N/A"}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Timer sx={{ color: colors.primary, mr: 1 }} />
                          {service?.duration || "N/A"}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AttachMoney sx={{ color: colors.primary }} />
                          {service?.price ? parseFloat(service.price).toFixed(2) : "N/A"}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={service?.category || "N/A"}
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>

                          {/* 🔍 Ver Detalles */}
                          <Tooltip title="Ver detalles">
                            <IconButton
                              onClick={() => handleViewDetails(service)}
                              sx={{
                                backgroundColor: '#4caf50',
                                color: 'white',
                                borderRadius: '50%',
                                width: 42,
                                height: 42,
                                '&:hover': { backgroundColor: '#388e3c' }
                              }}
                            >
                              <Info fontSize="medium" />
                            </IconButton>
                          </Tooltip>

                          {/* ✏️ Editar Servicio */}
                          <Tooltip title="Editar servicio">
                            <IconButton
                              sx={{
                                backgroundColor: '#0288d1', // Azul más claro para editar
                                color: 'white',
                                borderRadius: '50%',
                                width: 42,
                                height: 42,
                                '&:hover': { backgroundColor: '#0277bd' } // Azul oscuro al pasar el mouse
                              }}
                              onClick={() => {
                                if (service?.id) {
                                  setSelectedService(service.id);
                                  setOpenEditDialog(true);
                                }
                              }}
                            >
                              <BorderColor fontSize="medium" /> {/* Cambia Edit por un icono más bonito */}
                            </IconButton>
                          </Tooltip>

                          {/* ❌ Eliminar Servicio */}
                          <Tooltip title="Eliminar servicio">
                            <IconButton
                              onClick={() => {
                                setServiceToDelete(service);
                                setOpenConfirmDialog(true);
                              }}
                              sx={{
                                backgroundColor: '#e53935', // Rojo vibrante
                                color: 'white',
                                borderRadius: '50%',
                                width: 42,
                                height: 42,
                                '&:hover': { backgroundColor: '#c62828' } // Rojo más oscuro al pasar el mouse
                              }}
                            >
                              <Close fontSize="medium" /> {/* Ícono de "X" más claro */}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>

                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="textSecondary">No hay servicios disponibles</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>
          </TableContainer>

        </CardContent>
      </Card>
      {/* Diálogo de detalles del servicio */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedService && (
          <>
            <DialogTitle sx={{ backgroundColor: colors.primary, color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MedicalServices sx={{ mr: 2 }} />
                {selectedService.title || "Servicio sin título"}
              </Box>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                {/* Descripción */}
                <Grid item xs={12}>
                  <Typography variant="h6" color={colors.primary}>
                    <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Descripción
                  </Typography>
                  <Typography>
                    {selectedService.description || "No hay descripción disponible"}
                  </Typography>
                </Grid>

                {/* Beneficios */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" color={colors.primary}>
                    <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Beneficios
                  </Typography>
                  {selectedService.details?.benefits?.length > 0 ? (
                    selectedService.details.benefits.map((benefit, index) => (
                      <Typography key={index} sx={{ ml: 3 }}>• {benefit}</Typography>
                    ))
                  ) : (
                    <Typography sx={{ ml: 3, color: "gray" }}>
                      No hay beneficios registrados
                    </Typography>
                  )}
                </Grid>

                {/* Incluye */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" color={colors.primary}>
                    <MenuBook sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Incluye
                  </Typography>
                  {selectedService.details?.includes?.length > 0 ? (
                    selectedService.details.includes.map((item, index) => (
                      <Typography key={index} sx={{ ml: 3 }}>• {item}</Typography>
                    ))
                  ) : (
                    <Typography sx={{ ml: 3, color: "gray" }}>
                      No hay elementos incluidos registrados
                    </Typography>
                  )}
                </Grid>

                {/* Preparación */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" color={colors.primary}>
                    <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Preparación
                  </Typography>
                  {selectedService.details?.preparation?.length > 0 ? (
                    selectedService.details.preparation.map((prep, index) => (
                      <Typography key={index} sx={{ ml: 3 }}>• {prep}</Typography>
                    ))
                  ) : (
                    <Typography sx={{ ml: 3, color: "gray" }}>
                      No hay preparación registrada
                    </Typography>
                  )}
                </Grid>

                {/* Cuidados posteriores */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" color={colors.primary}>
                    <EventAvailable sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Cuidados posteriores
                  </Typography>
                  {selectedService.details?.aftercare?.length > 0 ? (
                    selectedService.details.aftercare.map((care, index) => (
                      <Typography key={index} sx={{ ml: 3 }}>• {care}</Typography>
                    ))
                  ) : (
                    <Typography sx={{ ml: 3, color: "gray" }}>
                      No hay cuidados posteriores registrados
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)} color="primary">
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Diálogo de eliminar el servicio */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => !isProcessing && setOpenConfirmDialog(false)}
        PaperProps={{
          sx: {
            backgroundColor: colors.paper,
            color: colors.text
          }
        }}
      >
        <DialogTitle sx={{ color: colors.primary }}>
          Confirmar eliminación
        </DialogTitle>

        <DialogContent>
          <Typography>
            <strong>¿Estás seguro de que deseas eliminar el servicio "{serviceToDelete?.title}"?</strong>
          </Typography>

          <Typography variant="body2" sx={{ mt: 1, color: colors.secondary }}>
            Se eliminarán todos los detalles asociados, incluyendo:
          </Typography>

          {/* 📌 Lista de detalles asociados */}
          {serviceToDelete && (
            <Box sx={{ mt: 2, pl: 2 }}>
              {serviceToDelete.benefits.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Beneficios:</Typography>
                  {serviceToDelete.benefits.map((benefit, index) => (
                    <Typography key={index} variant="body2">• {benefit}</Typography>
                  ))}
                </>
              )}

              {serviceToDelete.includes.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 1 }}>Incluye:</Typography>
                  {serviceToDelete.includes.map((item, index) => (
                    <Typography key={index} variant="body2">• {item}</Typography>
                  ))}
                </>
              )}

              {serviceToDelete.preparation.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 1 }}>Preparación:</Typography>
                  {serviceToDelete.preparation.map((prep, index) => (
                    <Typography key={index} variant="body2">• {prep}</Typography>
                  ))}
                </>
              )}

              {serviceToDelete.aftercare.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 1 }}>Cuidados posteriores:</Typography>
                  {serviceToDelete.aftercare.map((care, index) => (
                    <Typography key={index} variant="body2">• {care}</Typography>
                  ))}
                </>
              )}
            </Box>
          )}

          <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold', color: '#d32f2f' }}>
            ⚠ Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOpenConfirmDialog(false)}
            disabled={isProcessing}
            sx={{ color: colors.secondary }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteService}
            disabled={isProcessing}
            sx={{
              bgcolor: '#e53935',
              '&:hover': { bgcolor: '#c62828' }
            }}
          >
            {isProcessing ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>



      {/* Botón FAB para agregar nuevo servicio */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          bgcolor: colors.primary,
          '&:hover': {
            bgcolor: colors.primary,
            opacity: 0.9
          }
        }}
        onClick={() => setOpenNewServiceForm(true)}
      >
        <Add />
      </Fab>

      {/* Modal para nuevo servicio */}
      <Dialog
        open={openNewServiceForm}
        onClose={() => setOpenNewServiceForm(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: colors.cardBg,
            color: colors.text
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: colors.primary,
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MedicalServices />
            <Typography>Nuevo Servicio Dental</Typography>
          </Box>
          <IconButton onClick={() => setOpenNewServiceForm(false)} sx={{ color: '#ffffff' }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Información básica */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: colors.primary, mb: 2 }}>
                Información Básica
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nombre del Servicio"
                    value={newService.title}
                    onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                    sx={{
                      '& label': { color: colors.secondary },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: colors.secondary },
                        '&:hover fieldset': { borderColor: colors.primary },
                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Duración"
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                    placeholder="ej: 30-45 minutos"
                    sx={{
                      '& label': { color: colors.secondary },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: colors.secondary },
                        '&:hover fieldset': { borderColor: colors.primary },
                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Precio"
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    sx={{
                      '& label': { color: colors.secondary },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: colors.secondary },
                        '&:hover fieldset': { borderColor: colors.primary },
                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: colors.secondary }}>Disponibilidad</InputLabel>
                    <Select
                      value={newService.disponibilidad}
                      onChange={(e) => setNewService({ ...newService, disponibilidad: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.secondary },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary }
                      }}
                    >
                      <MenuItem value={true}>Disponible</MenuItem>
                      <MenuItem value={false}>No Disponible</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Descripción Corta"
                    value={newService.shortDescription}
                    onChange={(e) => setNewService({ ...newService, shortDescription: e.target.value })}
                    sx={{
                      '& label': { color: colors.secondary },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: colors.secondary },
                        '&:hover fieldset': { borderColor: colors.primary },
                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Beneficios */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: colors.primary, mb: 2 }}>
                <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                Beneficios
              </Typography>
              {newService.benefits.map((benefit, index) => (
                <TextField
                  key={`benefit-${index}`}
                  fullWidth
                  label={`Beneficio ${index + 1}`}
                  value={benefit}
                  onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                  sx={{ mb: 2 }}
                />
              ))}
            </Grid>

            {/* Incluye */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: colors.primary, mb: 2 }}>
                <MenuBook sx={{ mr: 1, verticalAlign: 'middle' }} />
                Incluye
              </Typography>
              {newService.includes.map((include, index) => (
                <TextField
                  key={`include-${index}`}
                  fullWidth
                  label={`Inclusión ${index + 1}`}
                  value={include}
                  onChange={(e) => handleArrayChange('includes', index, e.target.value)}
                  sx={{ mb: 2 }}
                />
              ))}
            </Grid>

            {/* Preparación */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: colors.primary, mb: 2 }}>
                <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                Preparación
              </Typography>
              {newService.preparation.map((prep, index) => (
                <TextField
                  key={`prep-${index}`}
                  fullWidth
                  label={`Preparación ${index + 1}`}
                  value={prep}
                  onChange={(e) => handleArrayChange('preparation', index, e.target.value)}
                  sx={{ mb: 2 }}
                />
              ))}
            </Grid>

            {/* Cuidados posteriores */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: colors.primary, mb: 2 }}>
                <EventAvailable sx={{ mr: 1, verticalAlign: 'middle' }} />
                Cuidados Posteriores
              </Typography>
              {newService.aftercare.map((care, index) => (
                <TextField
                  key={`care-${index}`}
                  fullWidth
                  label={`Cuidado ${index + 1}`}
                  value={care}
                  onChange={(e) => handleArrayChange('aftercare', index, e.target.value)}
                  sx={{ mb: 2 }}
                />
              ))}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpenNewServiceForm(false)}
            sx={{ color: colors.secondary }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (validateServiceForm()) {
                setOpenNewServiceForm(false);
              }
            }}
            sx={{
              bgcolor: colors.primary,
              '&:hover': {
                bgcolor: colors.primary,
                opacity: 0.9
              }
            }}
          >
            Guardar Servicio
          </Button>
        </DialogActions>
      </Dialog>
      <EditServiceDialog
        open={openEditDialog}
        handleClose={() => setOpenEditDialog(false)}
        serviceId={selectedService}
        onUpdate={fetchServices}
      />
      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        onClose={handleNotificationClose}
      />
    </Box>
  );
};

export default ServicioForm;