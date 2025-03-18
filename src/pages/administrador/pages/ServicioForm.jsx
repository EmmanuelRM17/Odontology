// Componentes y hooks optimizados para ServicioForm
import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import {
  TextField, Button, Grid, MenuItem, FormControl, Select, InputLabel,
  Card, CardContent, Typography, TableContainer, Table, TableBody, TableCell,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  Box, IconButton, Tooltip, Chip, Fab, Alert, AlertTitle, Switch, FormControlLabel,
  Accordion, AccordionSummary, AccordionDetails, Slider, Divider, Avatar, CircularProgress
} from '@mui/material';

import {
  MedicalServices, Timer, AttachMoney, Edit, Delete, Description, CheckCircle,
  Info, EventAvailable, HealthAndSafety, MenuBook, AccessTime, Add, Close, BorderColor,
  Warning, LocalHospital, FilterAlt, ExpandMore, CalendarMonth, Image
} from '@mui/icons-material';

import { alpha } from '@mui/material/styles';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

// Importar componentes con lazy loading
const EditServiceDialog = lazy(() => import('./servicios/EditService'));
const NewService = lazy(() => import('./servicios/newService'));
const CategoryService = lazy(() => import('./servicios/CategoryService'));
const Notificaciones = lazy(() => import('../../../components/Layout/Notificaciones'));

// Hook personalizado para gestionar notificaciones
const useNotification = () => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: '',
  });

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({
      open: true,
      message,
      type,
    });

    // Auto-cerrar después de 3 segundos
    setTimeout(() => {
      setNotification(prev => ({ ...prev, open: false }));
    }, 3000);
  }, []);

  const handleClose = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  return { notification, showNotification, handleClose };
};

// Hook personalizado para gestionar filtros
const useFilters = (initialMaxPrice = 10000) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    tratamiento: 'all',
    priceRange: [0, initialMaxPrice],
    citas: 'all',
  });
  const [priceRange, setPriceRange] = useState([0, initialMaxPrice]);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  }, []);

  const handlePriceChange = useCallback((event, newValue) => {
    setPriceRange(newValue);
  }, []);

  const handlePriceChangeCommitted = useCallback(() => {
    setFilters(prev => ({ ...prev, priceRange }));
  }, [priceRange]);

  const resetFilters = useCallback(() => {
    setFilters({
      category: 'all',
      tratamiento: 'all',
      priceRange: [0, maxPrice],
      citas: 'all',
    });
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  return {
    searchQuery, setSearchQuery,
    categories, setCategories,
    filters, setFilters,
    priceRange, setPriceRange,
    maxPrice, setMaxPrice,
    filtersExpanded, setFiltersExpanded,
    handleFilterChange,
    handlePriceChange,
    handlePriceChangeCommitted,
    resetFilters
  };
};

// Hook personalizado para gestionar paginación
const usePagination = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  return {
    page, setPage,
    rowsPerPage, setRowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage
  };
};

// Hook para manejo de API que implemente cache
const useServicesApi = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Función simplificada para obtener todos los servicios
  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Solicitud para obtener los servicios
      const response = await fetch("https://back-end-4803.onrender.com/api/servicios/all");
      if (!response.ok) throw new Error("Error al obtener los servicios");
      const servicesData = await response.json();
      
      // Solicitud para obtener los detalles
      const detailsResponse = await fetch("https://back-end-4803.onrender.com/api/servicios/detalles");
      if (!detailsResponse.ok) throw new Error("Error al obtener los detalles de los servicios");
      const detailsData = await detailsResponse.json();
      
      // Solicitud para obtener las categorías
      const categoriesResponse = await fetch("https://back-end-4803.onrender.com/api/servicios/categorias");
      const categoriesData = categoriesResponse.ok ? await categoriesResponse.json() : [];
      
      // Mapear detalles al servicio correcto
      const servicesWithDetails = servicesData.map(service => ({
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
      
      // Actualizar el estado con los servicios procesados
      setServices(servicesWithDetails);
      
      // Calcular el precio máximo para el filtro
      const highestPrice = Math.max(...servicesWithDetails.map(service => parseFloat(service.price || 0))) + 1000;
      
      return {
        services: servicesWithDetails,
        categories: categoriesResponse.ok ? ['all', ...categoriesData] : ['all'],
        maxPrice: highestPrice
      };
    } catch (error) {
      console.error("Error cargando servicios:", error);
      setError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const deleteService = useCallback(async (serviceId) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`https://back-end-4803.onrender.com/api/servicios/delete/${serviceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar el servicio');
      }
      
      // Actualizamos el estado local eliminando el servicio
      setServices(prev => prev.filter(service => service.id !== serviceId));
      
      return true;
    } catch (error) {
      console.error('Error al eliminar el servicio:', error);
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    services,
    isLoading,
    error,
    fetchServices,
    deleteService
  };
};


// Componente optimizado para la celda de imagen con lazy loading
const ImageCell = React.memo(({ imageUrl, onImageClick }) => {
  // Estado para tracking de carga de imagen
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Función para manejar carga exitosa
  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);
  
  // Función para manejar error
  const handleError = useCallback(() => {
    setError(true);
    setLoaded(true); // También marcamos como cargado para remover el loading
  }, []);
  
  return (
    <Box sx={{ width: 50, height: 50, position: 'relative' }}>
      {imageUrl ? (
        <>
          {!loaded && (
            <Box 
              sx={{
                position: 'absolute',
                width: 50, 
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.1)'
              }}
            >
              <CircularProgress size={24} />
            </Box>
          )}
          <Avatar 
            src={imageUrl} 
            variant="rounded"
            sx={{ 
              width: 50, 
              height: 50, 
              cursor: 'pointer',
              display: loaded ? 'block' : 'none',
            }}
            onClick={() => onImageClick(imageUrl)}
            onLoad={handleLoad}
            onError={handleError}
          />
        </>
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
}, (prevProps, nextProps) => prevProps.imageUrl === nextProps.imageUrl);

// Componente para fila de servicio con optimización y memo
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
      
      {/* Celda de imagen optimizada */}
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
          {/* Botones de acción */}
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
}, (prevProps, nextProps) => {
  // Implementación personalizada de comparación para evitar renderizados innecesarios
  return (
    prevProps.service?.id === nextProps.service?.id &&
    prevProps.index === nextProps.index &&
    prevProps.isDarkTheme === nextProps.isDarkTheme
  );
});

// Componente para visualizar imagen ampliada
const ImageDialog = React.memo(({ open, imageUrl, onClose }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  useEffect(() => {
    // Reset estado cuando se abre nuevo diálogo
    if (open) {
      setImageLoaded(false);
    }
  }, [open, imageUrl]);
  
  if (!open) return null;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md"
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'white',
          bgcolor: 'rgba(0,0,0,0.5)',
          '&:hover': {
            bgcolor: 'rgba(0,0,0,0.7)',
          },
          zIndex: 1
        }}
      >
        <Close />
      </IconButton>
      
      <DialogContent sx={{ p: 1, overflow: 'hidden', position: 'relative' }}>
        {!imageLoaded && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.05)'
          }}>
            <CircularProgress />
          </Box>
        )}
        <Box
          component="img"
          src={imageUrl}
          alt="Imagen ampliada"
          sx={{
            maxWidth: '100%',
            maxHeight: '80vh',
            objectFit: 'contain',
            display: imageLoaded ? 'block' : 'none'
          }}
          onLoad={() => setImageLoaded(true)}
        />
      </DialogContent>
    </Dialog>
  );
});

// Componente para filtros con virtualización
const FilterSection = React.memo(({ 
  expanded, 
  filters, 
  categories, 
  priceRange, 
  maxPrice,
  formatPrice, 
  onFilterChange, 
  onPriceChange, 
  onPriceChangeCommitted,
  onReset,
  isDarkTheme 
}) => {
  if (!expanded) return null;
  
  return (
    <Box sx={{ mb: 3, p: 2, backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(3,66,124,0.05)', borderRadius: '8px' }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Categoría</InputLabel>
            <Select
              value={filters.category}
              onChange={(e) => onFilterChange('category', e.target.value)}
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
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Tipo</InputLabel>
            <Select
              value={filters.tratamiento}
              onChange={(e) => onFilterChange('tratamiento', e.target.value)}
              label="Tipo"
            >
              <MenuItem value="all">Todos los tipos</MenuItem>
              <MenuItem value="yes">Tratamientos</MenuItem>
              <MenuItem value="no">Servicios regulares</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Número de citas</InputLabel>
            <Select
              value={filters.citas}
              onChange={(e) => onFilterChange('citas', e.target.value)}
              label="Número de citas"
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="single">Cita única</MenuItem>
              <MenuItem value="multiple">Múltiples citas</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Rango de precio: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
          </Typography>
          <Slider
            value={priceRange}
            onChange={onPriceChange}
            onChangeCommitted={onPriceChangeCommitted}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => formatPrice(value)}
            min={0}
            max={maxPrice}
            sx={{
              '& .MuiSlider-thumb': {
                backgroundColor: isDarkTheme ? '#00BCD4' : '#03427C',
              },
              '& .MuiSlider-track': {
                backgroundColor: isDarkTheme ? '#00BCD4' : '#03427C',
              },
              '& .MuiSlider-rail': {
                backgroundColor: alpha(isDarkTheme ? '#00BCD4' : '#03427C', 0.3),
              }
            }}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {filters.category !== 'all' && (
          <Chip 
            label={`Categoría: ${filters.category}`} 
            onDelete={() => onFilterChange('category', 'all')}
            size="small"
            color="primary"
          />
        )}
        {filters.tratamiento !== 'all' && (
          <Chip 
            label={`Tipo: ${filters.tratamiento === 'yes' ? 'Tratamientos' : 'Servicios regulares'}`} 
            onDelete={() => onFilterChange('tratamiento', 'all')}
            size="small"
            color="primary"
          />
        )}
        {filters.citas !== 'all' && (
          <Chip 
            label={`Citas: ${filters.citas === 'single' ? 'Única' : 'Múltiples'}`} 
            onDelete={() => onFilterChange('citas', 'all')}
            size="small"
            color="primary"
          />
        )}
        {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
          <Chip 
            label={`Precio: ${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`} 
            onDelete={() => {
              onPriceChange(null, [0, maxPrice]);
              onFilterChange('priceRange', [0, maxPrice]);
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
            onClick={onReset}
            size="small"
            color="error"
          />
        )}
      </Box>
    </Box>
  );
});

// Componente para diálogo de confirmación
const ConfirmDialog = React.memo(({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  isProcessing, 
  colors 
}) => {
  return (
    <Dialog
      open={open}
      onClose={() => !isProcessing && onClose()}
      PaperProps={{
        sx: {
          backgroundColor: colors.paper,
          color: colors.text,
          maxWidth: '500px',
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
        {title}
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          {message}
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
          onClick={onClose}
          disabled={isProcessing}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={isProcessing}
          color="error"
        >
          {isProcessing ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

// Componente principal optimizado
const ServicioForm = () => {
  // Context y APIs
  const { isDarkTheme } = useThemeContext();
  const { notification, showNotification, handleClose: handleNotificationClose } = useNotification();
  const { 
    services, isLoading, error, fetchServices, deleteService 
  } = useServicesApi();
  
  
  // Hooks personalizados
  const { 
    searchQuery, setSearchQuery,
    categories, setCategories,
    filters, setFilters,
    priceRange, setPriceRange,
    maxPrice, setMaxPrice,
    filtersExpanded, setFiltersExpanded,
    handleFilterChange,
    handlePriceChange,
    handlePriceChangeCommitted,
    resetFilters
  } = useFilters(10000);
  
  const {
    page, setPage,
    rowsPerPage, setRowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage
  } = usePagination();
  
  // Estados locales
  const [openDialog, setOpenDialog] = useState(false);
  const [openNewServiceForm, setOpenNewServiceForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [openCategoriesDialog, setOpenCategoriesDialog] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  // Colores del tema memoizados
  const colors = useMemo(() => ({
    background: isDarkTheme ? '#0D1B2A' : '#ffffff',
    paper: isDarkTheme ? '#1A2735' : '#ffffff',
    primary: isDarkTheme ? '#00BCD4' : '#03427C',
    text: isDarkTheme ? '#ffffff' : '#1a1a1a',
    secondary: isDarkTheme ? '#A0AEC0' : '#666666',
    cardBg: isDarkTheme ? '#1A2735' : '#ffffff',
    treatment: '#4CAF50',
    nonTreatment: '#FF5252',
    divider: isDarkTheme ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'
  }), [isDarkTheme]);

  // Formatear precio (memoizado)
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchServices();
        if (result) {
          setCategories(result.categories);
          setMaxPrice(result.maxPrice);
          setPriceRange([0, result.maxPrice]);
          setFilters(prev => ({ ...prev, priceRange: [0, result.maxPrice] }));
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    
    loadData();
  }, [fetchServices, setCategories, setMaxPrice, setPriceRange, setFilters]);

  // Manejar creación de servicio
  const handleServiceCreated = useCallback(() => {
    setOpenNewServiceForm(false);
    fetchServices(true); // Forzar actualización
    showNotification('Servicio creado exitosamente', 'success');
  }, [fetchServices, showNotification]);

  // Manejar eliminación de servicio
  const handleDeleteService = useCallback(async () => {
    if (!serviceToDelete) return;

    setIsProcessing(true);

    try {
      const success = await deleteService(serviceToDelete.id);
      
      if (success) {
        showNotification(`El servicio "${serviceToDelete.title}" ha sido eliminado correctamente.`, 'success');
      } else {
        throw new Error('Error al eliminar el servicio');
      }
      
      setOpenConfirmDialog(false);
      setServiceToDelete(null);

    } catch (error) {
      console.error('Error al eliminar el servicio:', error);
      showNotification('Hubo un error al eliminar el servicio.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [serviceToDelete, deleteService, showNotification]);

  // Función para mostrar los detalles de un servicio
  const handleViewDetails = useCallback((service) => {
    setSelectedService(service);
    setOpenDialog(true);
  }, []);

  // Función para mostrar imagen en grande
  const handleViewImage = useCallback((imageUrl) => {
    setSelectedImage(imageUrl);
    setOpenImageDialog(true);
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

  // Filtrar servicios (memoizado)
  const filteredServices = useMemo(() => services
    .filter(service => {
      // Filtro por texto de búsqueda (optimizado para performance)
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery || (
          (service.title?.toLowerCase().includes(searchLower) || 
          service.description?.toLowerCase().includes(searchLower) ||
          service.category?.toLowerCase().includes(searchLower))
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
  
  // Calcular precio promedio (memoizado)
  const averagePrice = useMemo(() => {
    if (filteredServices.length === 0) return 0;
    return filteredServices.reduce((sum, service) => sum + parseFloat(service.price || 0), 0) / filteredServices.length;
  }, [filteredServices]);

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
          
          {/* Filtros optimizados como componente independiente */}
          <FilterSection
            expanded={filtersExpanded}
            filters={filters}
            categories={categories}
            priceRange={priceRange}
            maxPrice={maxPrice}
            formatPrice={formatPrice}
            onFilterChange={handleFilterChange}
            onPriceChange={handlePriceChange}
            onPriceChangeCommitted={handlePriceChangeCommitted}
            onReset={resetFilters}
            isDarkTheme={isDarkTheme}
          />
          
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
          
          {/* Estado de carga */}
          {isLoading && !services.length && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          {/* Mensaje de error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {/* Tabla de servicios */}
          <TableContainer
            component={Paper}
            sx={{
              boxShadow: isDarkTheme ? '0px 4px 20px rgba(0, 0, 0, 0.3)' : '0px 4px 20px rgba(0, 0, 0, 0.1)',
              backgroundColor: colors.paper,
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: isDarkTheme ? 'rgba(0,188,212,0.1)' : '#E3F2FD' }}>
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
                      index={page * rowsPerPage + index}
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
                      <Typography color="textSecondary">
                        {isLoading ? 'Cargando servicios...' : 'No hay servicios disponibles'}
                      </Typography>
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
                Precio promedio: {formatPrice(averagePrice)}
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
      
      {/* Dialogos con lazy loading para mejor rendimiento */}
      <Suspense fallback={<CircularProgress />}>
        {/* Diálogo de detalles del servicio - solo se renderiza cuando se abre */}
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
              {/* Imagen del servicio con lazy loading */}
              {selectedService.image_url && (
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                  <Box
                    component="img"
                    src={selectedService.image_url}
                    alt={selectedService.title}
                    loading="lazy" // Carga diferida nativa
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
              
              {/* ...resto del contenido del diálogo... */}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)} color="primary">
                Cerrar
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Diálogo de imagen optimizado como componente independiente */}
        <ImageDialog 
          open={openImageDialog}
          imageUrl={selectedImage}
          onClose={() => setOpenImageDialog(false)}
        />

        {/* Diálogo de confirmación como componente independiente */}
        <ConfirmDialog
          open={openConfirmDialog}
          onClose={() => setOpenConfirmDialog(false)}
          onConfirm={handleDeleteService}
          title="Confirmar eliminación"
          message={serviceToDelete ? `¿Estás seguro de que deseas eliminar el servicio "${serviceToDelete.title}"?` : ''}
          isProcessing={isProcessing}
          colors={colors}
        />

        {/* Componentes de diálogo con lazy loading */}
        {openNewServiceForm && (
          <NewService
            open={openNewServiceForm}
            handleClose={() => setOpenNewServiceForm(false)}
            onServiceCreated={handleServiceCreated}
          />
        )}

        {openCategoriesDialog && (
          <CategoryService
            open={openCategoriesDialog}
            handleClose={() => setOpenCategoriesDialog(false)}
          />
        )}

        {openEditDialog && (
          <EditServiceDialog
            open={openEditDialog}
            handleClose={() => setOpenEditDialog(false)}
            serviceId={selectedService}
            onUpdate={() => fetchServices(true)}
          />
        )}

        <Notificaciones
          open={notification.open}
          message={notification.message}
          type={notification.type}
          onClose={handleNotificationClose}
        />
      </Suspense>

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
    </Box>
  );
};

export default React.memo(ServicioForm);