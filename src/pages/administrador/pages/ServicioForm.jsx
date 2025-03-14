import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TextField, Button, Grid, MenuItem, FormControl, Select, InputLabel,
  Card, CardContent, Typography, TableContainer, Table, TableBody, TableCell,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  Box, IconButton, Tooltip, Chip, Fab, Alert, AlertTitle, Switch, FormControlLabel,
  Accordion, AccordionSummary, AccordionDetails, Slider, Divider, Avatar
} from '@mui/material';

import {
  MedicalServices, Timer, AttachMoney, Edit, Delete, Description, CheckCircle,
  Info, EventAvailable, HealthAndSafety, MenuBook, AccessTime, Add, Close, BorderColor,
  Warning, LocalHospital, FilterAlt, ExpandMore, CalendarMonth, Image
} from '@mui/icons-material';

import { alpha } from '@mui/material/styles';
import EditServiceDialog from './EditService';
import NewService from './newService';
import CategoryService from './CategoryService';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

// Componente separado para la celda de imagen
const ImageCell = React.memo(({ imageUrl, onImageClick }) => {
  return (
    <Box sx={{ width: 50, height: 50 }}>
      {imageUrl ? (
        <Avatar 
          src={imageUrl} 
          variant="rounded"
          sx={{ 
            width: 50, 
            height: 50, 
            cursor: 'pointer',
          }}
          onClick={() => onImageClick(imageUrl)}
        />
      ) : (
        <Avatar 
          variant="rounded" 
          sx={{ 
            width: 50, 
            height: 50,
            backgroundColor: 'rgba(0,0,0,0.1)'
          }}
        >
          <Image sx={{ color: 'rgba(0,0,0,0.3)' }} />
        </Avatar>
      )}
    </Box>
  );
});

// Componente para fila de servicio
const ServiceRow = React.memo(({ service, index, colors, isDarkTheme, onViewDetails, onEdit, onDelete, onImageClick }) => {
  return (
    <TableRow
      sx={{
        height: '69px',
        '&:hover': { backgroundColor: 'rgba(25,118,210,0.1)' },
        transition: 'background-color 0.2s ease',
        borderLeft: service?.tratamiento === 1 
          ? `4px solid ${colors.treatment}` 
          : `4px solid ${colors.nonTreatment}`
      }}
    >
      <TableCell sx={{ color: colors.text }}>{index + 1}</TableCell>
      
      {/* Celda de imagen */}
      <TableCell>
        <ImageCell imageUrl={service?.image_url} onImageClick={onImageClick} />
      </TableCell>
      
      <TableCell sx={{ color: colors.text }}>
        {service?.title || "N/A"}
        {service?.tratamiento === 1 && service?.citasEstimadas > 1 && (
          <Tooltip title={`Tratamiento de ${service.citasEstimadas} citas`}>
            <Box 
              component="span" 
              sx={{ 
                display: 'inline-flex',
                alignItems: 'center',
                ml: 1,
                color: colors.treatment 
              }}
            >
              <CalendarMonth fontSize="small" sx={{ mr: 0.5 }} />
              {service.citasEstimadas}
            </Box>
          </Tooltip>
        )}
      </TableCell>
      <TableCell sx={{ color: colors.text }}>
        {service?.duration || "N/A"}
      </TableCell>
      <TableCell sx={{ color: colors.text }}>
        ${service?.price ? parseFloat(service.price).toFixed(2) : "N/A"}
      </TableCell>
      <TableCell>
        <Chip
          label={service?.category || "N/A"}
          sx={{
            backgroundColor: isDarkTheme ? '#0288d1' : '#E3F2FD',
            color: isDarkTheme ? '#FFF' : '#0277BD',
            fontWeight: '500',
            border: `1px solid ${isDarkTheme ? '#0288d1' : '#0277BD'}`,
            fontSize: '0.875rem',
            height: '28px',
          }}
        />
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* 🔍 Ver Detalles */}
          <Tooltip title="Ver detalles" arrow>
            <IconButton
              onClick={() => onViewDetails(service)}
              sx={{
                backgroundColor: '#0288d1',
                '&:hover': { backgroundColor: '#0277bd' },
                padding: '8px',
                borderRadius: '50%',
              }}
            >
              <Info fontSize="small" sx={{ color: 'white' }} />
            </IconButton>
          </Tooltip>

          {/* ✏️ Editar Servicio */}
          <Tooltip title="Editar servicio" arrow>
            <IconButton
              onClick={() => onEdit(service.id)}
              sx={{
                backgroundColor: '#4caf50',
                '&:hover': { backgroundColor: '#388e3c' },
                padding: '8px',
                borderRadius: '50%',
              }}
            >
              <BorderColor fontSize="small" sx={{ color: 'white' }} />
            </IconButton>
          </Tooltip>

          {/* ❌ Eliminar Servicio */}
          <Tooltip title="Eliminar servicio" arrow>
            <IconButton
              onClick={() => onDelete(service)}
              sx={{
                backgroundColor: '#e53935',
                '&:hover': { backgroundColor: '#c62828' },
                padding: '8px',
                borderRadius: '50%',
              }}
            >
              <Close fontSize="small" sx={{ color: 'white' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
});

// Componente principal
const ServicioForm = () => {
  const { isDarkTheme } = useThemeContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [openNewServiceForm, setOpenNewServiceForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [openCategoriesDialog, setOpenCategoriesDialog] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: '',
  });
  
  // Estado para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Estado para expandir filtros
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Estado para filtros
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    tratamiento: 'all',
    priceRange: [0, 10000],
    citas: 'all',
  });
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);

  // Colores del tema
  const colors = {
    background: isDarkTheme ? '#0D1B2A' : '#ffffff',
    primary: isDarkTheme ? '#00BCD4' : '#03427C',
    text: isDarkTheme ? '#ffffff' : '#1a1a1a',
    secondary: isDarkTheme ? '#A0AEC0' : '#666666',
    cardBg: isDarkTheme ? '#1A2735' : '#ffffff',
    treatment: '#4CAF50', // Color verde para tratamientos
    nonTreatment: '#FF5252', // Color rojo para no tratamientos
  };

  const handleNotificationClose = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  const handleServiceCreated = useCallback(() => {
    setOpenNewServiceForm(false);
    fetchServices(); // Vuelve a cargar la lista de servicios después de agregar uno nuevo
  }, []);

  // Función para eliminar un servicio
  const handleDeleteService = useCallback(async () => {
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
  }, [serviceToDelete]);

  // Función para mostrar los detalles de un servicio
  const handleViewDetails = useCallback((service) => {
    const details = {
      benefits: service.benefits || [],
      includes: service.includes || [],
      preparation: service.preparation || [],
      aftercare: service.aftercare || [],
    };

    setSelectedService({ ...service, details }); // Asegura que `details` exista
    setOpenDialog(true);
  }, []);

  // Función para mostrar imagen en grande
  const handleViewImage = useCallback((imageUrl) => {
    setSelectedImage(imageUrl);
    setOpenImageDialog(true);
  }, []);

  // Función para obtener todos los servicios
  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch("https://back-end-4803.onrender.com/api/servicios/all");
      if (!response.ok) throw new Error("Error al obtener los servicios");

      const data = await response.json();

      // Consulta para obtener los detalles del servicio
      const detailsResponse = await fetch("https://back-end-4803.onrender.com/api/servicios/detalles");
      if (!detailsResponse.ok) throw new Error("Error al obtener los detalles de los servicios");

      const detailsData = await detailsResponse.json();

      // Consulta para obtener las categorías
      const categoriesResponse = await fetch("https://back-end-4803.onrender.com/api/servicios/categorias");
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(['all', ...categoriesData]);
      }

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

      // Establecer el precio máximo para el filtro
      const highestPrice = Math.max(...servicesWithDetails.map(service => parseFloat(service.price || 0))) + 1000;
      setMaxPrice(highestPrice);
      setPriceRange([0, highestPrice]);
      setFilters(prev => ({ ...prev, priceRange: [0, highestPrice] }));

    } catch (error) {
      console.error("Error cargando servicios:", error);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Manejar cambios en los filtros
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  }, []);

  // Manejar cambios en el rango de precios
  const handlePriceChange = useCallback((event, newValue) => {
    setPriceRange(newValue);
  }, []);

  const handlePriceChangeCommitted = useCallback(() => {
    setFilters(prev => ({ ...prev, priceRange }));
  }, [priceRange]);

  // Función para filtrar servicios basados en búsqueda y filtros con useMemo para optimización
  const filteredServices = useMemo(() => services
    .filter(service => {
      // Filtro por texto de búsqueda
      const matchesSearch = 
        !searchQuery || (
          (service.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.category?.toLowerCase().includes(searchQuery.toLowerCase()))
        );

      // Filtro por categoría
      const matchesCategory = 
        filters.category === 'all' || service.category === filters.category;
      
      // Filtro por tratamiento
      const matchesTratamiento = 
        filters.tratamiento === 'all' || 
        (filters.tratamiento === 'yes' && service.tratamiento === 1) || 
        (filters.tratamiento === 'no' && (!service.tratamiento || service.tratamiento === 0));
      
      // Filtro por rango de precio
      const price = parseFloat(service.price || 0);
      const matchesPrice = 
        price >= filters.priceRange[0] && price <= filters.priceRange[1];
      
      // Filtro por número de citas
      const matchesCitas = 
        filters.citas === 'all' || 
        (filters.citas === 'single' && (!service.citasEstimadas || parseInt(service.citasEstimadas) === 1)) || 
        (filters.citas === 'multiple' && service.citasEstimadas && parseInt(service.citasEstimadas) > 1);
      
      return matchesSearch && matchesCategory && matchesTratamiento && matchesPrice && matchesCitas;
    }), [services, searchQuery, filters]);

  // Obtener servicios paginados
  const paginatedServices = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredServices.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredServices, page, rowsPerPage]);
  
  // Función para manejar cambio de página
  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);
  
  // Función para manejar cambio de filas por página
  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);
  
  // Función para seleccionar servicio a editar
  const handleSelectServiceToEdit = useCallback((serviceId) => {
    setSelectedService(serviceId);
    setOpenEditDialog(true);
  }, []);
  
  // Función para seleccionar servicio a eliminar
  const handleSelectServiceToDelete = useCallback((service) => {
    setServiceToDelete(service);
    setOpenConfirmDialog(true);
  }, []);

  // Función para formatear precio
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(price);
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

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
            {/* 📂 Botón para ver categorías (a la izquierda) */}
            <Tooltip title="Ver Categorías">
              <IconButton
                onClick={() => setOpenCategoriesDialog(true)}
                sx={{
                  backgroundColor: colors.primary,
                  color: 'white',
                  borderRadius: '50%',
                  width: 42,
                  height: 42,
                  mr: 2,
                  '&:hover': { backgroundColor: '#0277bd' }
                }}
              >
                <MenuBook fontSize="medium" />
              </IconButton>
            </Tooltip>

            {/* 🔍 Barra de búsqueda */}
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

            {/* Botón para mostrar/ocultar filtros */}
            <Tooltip title="Filtros">
              <IconButton
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                sx={{
                  backgroundColor: colors.primary,
                  color: 'white',
                  ml: 2,
                  borderRadius: '50%',
                  width: 42,
                  height: 42,
                  '&:hover': { backgroundColor: '#0277bd' }
                }}
              >
                <FilterAlt fontSize="medium" />
              </IconButton>
            </Tooltip>
          </Box>
          
          {/* Filtros expandibles */}
          {filtersExpanded && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(3,66,124,0.05)', borderRadius: '8px' }}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {/* Filtro por categoría */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Categoría</InputLabel>
                    <Select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      label="Categoría"
                    >
                      <MenuItem value="all">Todas las categorías</MenuItem>
                      {categories
                        .filter(category => category !== 'all')
                        .map((category, index) => (
                          <MenuItem key={index} value={category}>{category}</MenuItem>
                        ))
                      }
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Filtro por tratamiento */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={filters.tratamiento}
                      onChange={(e) => handleFilterChange('tratamiento', e.target.value)}
                      label="Tipo"
                    >
                      <MenuItem value="all">Todos los tipos</MenuItem>
                      <MenuItem value="yes">Tratamientos</MenuItem>
                      <MenuItem value="no">Servicios regulares</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Filtro por citas */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Número de citas</InputLabel>
                    <Select
                      value={filters.citas}
                      onChange={(e) => handleFilterChange('citas', e.target.value)}
                      label="Número de citas"
                    >
                      <MenuItem value="all">Todos</MenuItem>
                      <MenuItem value="single">Cita única</MenuItem>
                      <MenuItem value="multiple">Múltiples citas</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Filtro por rango de precio */}
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Rango de precio: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </Typography>
                  <Slider
                    value={priceRange}
                    onChange={handlePriceChange}
                    onChangeCommitted={handlePriceChangeCommitted}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => formatPrice(value)}
                    min={0}
                    max={maxPrice}
                    sx={{
                      '& .MuiSlider-thumb': {
                        backgroundColor: colors.primary,
                      },
                      '& .MuiSlider-track': {
                        backgroundColor: colors.primary,
                      },
                      '& .MuiSlider-rail': {
                        backgroundColor: alpha(colors.primary, 0.3),
                      }
                    }}
                  />
                </Grid>
              </Grid>
              
              {/* Resumen de filtros aplicados */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {filters.category !== 'all' && (
                  <Chip 
                    label={`Categoría: ${filters.category}`} 
                    onDelete={() => handleFilterChange('category', 'all')}
                    size="small"
                    color="primary"
                  />
                )}
                {filters.tratamiento !== 'all' && (
                  <Chip 
                    label={`Tipo: ${filters.tratamiento === 'yes' ? 'Tratamientos' : 'Servicios regulares'}`} 
                    onDelete={() => handleFilterChange('tratamiento', 'all')}
                    size="small"
                    color="primary"
                  />
                )}
                {filters.citas !== 'all' && (
                  <Chip 
                    label={`Citas: ${filters.citas === 'single' ? 'Única' : 'Múltiples'}`} 
                    onDelete={() => handleFilterChange('citas', 'all')}
                    size="small"
                    color="primary"
                  />
                )}
                {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                  <Chip 
                    label={`Precio: ${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`} 
                    onDelete={() => {
                      setPriceRange([0, maxPrice]);
                      handleFilterChange('priceRange', [0, maxPrice]);
                    }}
                    size="small"
                    color="primary"
                  />
                )}
                {(filters.category !== 'all' || 
                  filters.tratamiento !== 'all' || 
                  filters.citas !== 'all' ||
                  priceRange[0] > 0 || 
                  priceRange[1] < maxPrice) && (
                  <Chip 
                    label="Limpiar todos" 
                    onClick={() => {
                      setFilters({
                        category: 'all',
                        tratamiento: 'all',
                        priceRange: [0, maxPrice],
                        citas: 'all',
                      });
                      setPriceRange([0, maxPrice]);
                    }}
                    size="small"
                    color="error"
                  />
                )}
              </Box>
            </Box>
          )}
          
          {/* Leyenda para identificar tratamientos */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                backgroundColor: colors.treatment 
              }} />
              <Typography variant="caption">Tratamiento</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                backgroundColor: colors.nonTreatment 
              }} />
              <Typography variant="caption">No Tratamiento</Typography>
            </Box>
          </Box>
          
          <TableContainer
            component={Paper}
            sx={{
              boxShadow: isDarkTheme ? '0px 4px 20px rgba(0, 0, 0, 0.3)' : '0px 4px 20px rgba(0, 0, 0, 0.1)',
              backgroundColor: colors.paper,
              borderRadius: '12px', // 🔹 Bordes más redondeados
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: '#E3F2FD' }}>
                <TableRow>
                  <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>#</TableCell>
                  <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Imagen</TableCell>
                  <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Servicio</TableCell>
                  <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Duración</TableCell>
                  <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Precio</TableCell>
                  <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Categoría</TableCell>
                  <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedServices.length > 0 ? (
                  paginatedServices.map((service, index) => (
                    <ServiceRow 
                      key={service?.id || index}
                      service={service}
                      index={page * rowsPerPage + index + 1}
                      colors={colors}
                      isDarkTheme={isDarkTheme}
                      onViewDetails={handleViewDetails}
                      onEdit={handleSelectServiceToEdit}
                      onDelete={handleSelectServiceToDelete}
                      onImageClick={handleViewImage}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="textSecondary">No hay servicios disponibles</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Información de resultados */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Mostrando {Math.min(rowsPerPage, filteredServices.length)} de {filteredServices.length} servicios
            </Typography>
            
            {filteredServices.length > 0 && (
              <Typography variant="body2" color="textSecondary">
                Precio promedio: {formatPrice(
                  filteredServices.reduce((sum, service) => sum + parseFloat(service.price || 0), 0) / filteredServices.length
                )}
              </Typography>
            )}
          </Box>
          
          {/* Controles de paginación */}
          <Box sx={{ 
            mt: 2, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: 2 
          }}>
            <Button 
              disabled={page === 0}
              onClick={() => handleChangePage(null, page - 1)}
              variant="outlined"
              size="small"
            >
              Anterior
            </Button>
            
            <Typography>
              Página {page + 1} de {Math.max(1, Math.ceil(filteredServices.length / rowsPerPage))}
            </Typography>
            
            <Button 
              disabled={page >= Math.ceil(filteredServices.length / rowsPerPage) - 1}
              onClick={() => handleChangePage(null, page + 1)}
              variant="outlined"
              size="small"
            >
              Siguiente
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      {/* Diálogo de detalles del servicio */}
      {openDialog && selectedService && (
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ 
            backgroundColor: selectedService.tratamiento === 1 ? colors.treatment : colors.nonTreatment, 
            color: 'white' 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MedicalServices sx={{ mr: 2 }} />
                {selectedService.title || "Servicio sin título"}
              </Box>
              <Chip
                icon={<LocalHospital />}
                label={selectedService.tratamiento === 1 ? "Tratamiento" : "Servicio"}
                sx={{
                  backgroundColor: 'white',
                  color: selectedService.tratamiento === 1 ? colors.treatment : colors.nonTreatment,
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {/* Imagen del servicio */}
            {selectedService.image_url && (
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                <Box
                  component="img"
                  src={selectedService.image_url}
                  alt={selectedService.title}
                  sx={{
                    maxWidth: '100%',
                    height: '200px',
                    borderRadius: '8px',
                    objectFit: 'contain',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleViewImage(selectedService.image_url)}
                />
              </Box>
            )}
            
            <Grid container spacing={3}>
              {/* Información general */}
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 2, 
                  mb: 2,
                  p: 2,
                  backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderRadius: '8px'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime fontSize="small" sx={{ color: selectedService.tratamiento === 1 ? colors.treatment : colors.nonTreatment }} />
                    <Typography variant="body2">
                      <strong>Duración:</strong> {selectedService.duration}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoney fontSize="small" sx={{ color: selectedService.tratamiento === 1 ? colors.treatment : colors.nonTreatment }} />
                    <Typography variant="body2">
                      <strong>Precio:</strong> ${parseFloat(selectedService.price).toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MenuBook fontSize="small" sx={{ color: selectedService.tratamiento === 1 ? colors.treatment : colors.nonTreatment }} />
                    <Typography variant="body2">
                      <strong>Categoría:</strong> {selectedService.category}
                    </Typography>
                  </Box>
                  
                  {selectedService.tratamiento === 1 && selectedService.citasEstimadas && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarMonth fontSize="small" sx={{ color: colors.treatment }} />
                      <Typography variant="body2">
                        <strong>Citas estimadas:</strong> {selectedService.citasEstimadas}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
              
              {/* Descripción */}
              <Grid item xs={12}>
                <Typography variant="h6" color={selectedService.tratamiento === 1 ? colors.treatment : colors.nonTreatment}>
                  <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Descripción
                </Typography>
                <Typography>
                  {selectedService.description || "No hay descripción disponible"}
                </Typography>
              </Grid>

              {/* Beneficios */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" color={selectedService.tratamiento === 1 ? colors.treatment : colors.nonTreatment}>
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
                <Typography variant="h6" color={selectedService.tratamiento === 1 ? colors.treatment : colors.nonTreatment}>
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
                <Typography variant="h6" color={selectedService.tratamiento === 1 ? colors.treatment : colors.nonTreatment}>
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
                <Typography variant="h6" color={selectedService.tratamiento === 1 ? colors.treatment : colors.nonTreatment}>
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
        </Dialog>
      )}

      {/* Diálogo para ver imagen en grande */}
      {openImageDialog && (
        <Dialog 
          open={openImageDialog} 
          onClose={() => setOpenImageDialog(false)} 
          maxWidth="md"
        >
          <IconButton
            onClick={() => setOpenImageDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
              }
            }}
          >
            <Close />
          </IconButton>
          
          <DialogContent sx={{ p: 1, overflow: 'hidden' }}>
            <Box
              component="img"
              src={selectedImage}
              alt="Imagen ampliada"
              sx={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo de confirmar eliminación */}
      {openConfirmDialog && serviceToDelete && (
        <Dialog
          open={openConfirmDialog}
          onClose={() => !isProcessing && setOpenConfirmDialog(false)}
          PaperProps={{
            sx: {
              backgroundColor: colors.paper,
              color: colors.text,
              maxWidth: '500px', // Reducido para mejor rendimiento
              width: '100%'
            }
          }}
        >
          <DialogTitle
            sx={{
              color: colors.primary,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              borderBottom: `1px solid ${colors.divider}`
            }}
          >
            <Warning sx={{ color: '#d32f2f' }} />
            Confirmar eliminación
          </DialogTitle>

          <DialogContent sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              ¿Estás seguro de que deseas eliminar el servicio "{serviceToDelete.title}"?
            </Typography>

            <Alert
              severity="error"
              sx={{ mt: 2 }}
            >
              <AlertTitle>Esta acción no se puede deshacer.</AlertTitle>
            </Alert>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setOpenConfirmDialog(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleDeleteService}
              disabled={isProcessing}
              color="error"
            >
              {isProcessing ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Botón FAB para agregar nuevo servicio */}
      <Tooltip title="Agregar nuevo servicio">
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
      </Tooltip>

      <NewService
        open={openNewServiceForm}
        handleClose={() => setOpenNewServiceForm(false)}
        onServiceCreated={handleServiceCreated}
      />

      <CategoryService
        open={openCategoriesDialog}
        handleClose={() => setOpenCategoriesDialog(false)}
      />
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