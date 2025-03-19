import React, { useState, useCallback, useEffect } from 'react';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import Notificaciones from '../../../components/Layout/Notificaciones';
import axios from 'axios';
// Material UI imports
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    CircularProgress,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tabs,
    Tab,
    Tooltip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Divider,
    LinearProgress,
    Skeleton,
    Collapse,
    Alert,
    Fade,
    useMediaQuery,
    Menu,
    MenuItem,
    InputAdornment,
    FormControl,
    FormControlLabel,
    Badge,
    Drawer,
    ListItemIcon,
    ListItemText,
    List,
    ListItem,
    Slider,
    AppBar,
    Toolbar,
    Radio,
    RadioGroup,
    ButtonGroup,
    Checkbox
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

// Material UI Icons
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Image as ImageIcon,
    Search as SearchIcon,
    PhotoCamera as PhotoCameraIcon,
    FolderOpen as FolderOpenIcon,
    Upload as UploadIcon,
    GridView as GridViewIcon,
    ViewList as ViewListIcon,
    Close as CloseIcon,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    SettingsBackupRestore as ResetIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    Fullscreen as FullscreenIcon,
    ContentCopy as ContentCopyIcon,
    FilterAlt as FilterAltIcon} from '@mui/icons-material';

// Importamos el componente de carga de archivos desde react-dropzone
import { useDropzone } from 'react-dropzone';

const API_URL = 'https://back-end-4803.onrender.com';
const FTP_FOLDER = '/Imagenes';
const IMAGE_URL_BASE = 'https://odontologiacarol.com/Imagenes/';
const IMAGE_ERROR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWltYWdlLW9mZiI+PGxpbmUgeDE9IjIiIHkxPSIyIiB4Mj0iMjIiIHkyPSIyMiIvPjxwYXRoIGQ9Ik0xMC41IDEwLjVsLTIgMkw1IDEwbC0yIDJWNWEyIDIgMCAwIDEgMi0yaDEwIi8+PHBhdGggZD0iTTE3LjIgNUgxOWEyIDIgMCAwIDEgMiAydjExLjRtLTEuNzIgMi42Yy0uMjcuMDgtLjU0LjItLjgzLjJINWEyIDIgMCAwIDEtMi0ydi0xMSIvPjxwYXRoIGQ9Ik0xOCAxMmExIDEgMCAxIDEtMi0xIi8+PC9zdmc+';


// Constantes para modes de visualización
const VIEW_MODES = {
    GRID: 'grid',
    LIST: 'list',
    COMPACT: 'compact'
};

// Constantes para opciones de ordenamiento
const SORT_OPTIONS = {
    NAME_ASC: 'name_asc',
    NAME_DESC: 'name_desc',
    DATE_ASC: 'date_asc',
    DATE_DESC: 'date_desc',
    WITH_IMAGES_FIRST: 'with_images_first',
    WITHOUT_IMAGES_FIRST: 'without_images_first'
};

const ImagenesForm = () => {
    // Contexto de tema y responsive
    const { darkMode } = useThemeContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

    // Estados para notificaciones
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        type: ''
    });

    // Estados para gestión de imágenes y servicios
    const [tabValue, setTabValue] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [loadingServices, setLoadingServices] = useState(true);
    const [loadingImages, setLoadingImages] = useState(true);
    const [files, setFiles] = useState([]);
    const [services, setServices] = useState([]);
    const [servicesWithImages, setServicesWithImages] = useState(0);
    const [servicesWithoutImages, setServicesWithoutImages] = useState(0);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [resumen, setResumen] = useState({
        total: 0,
        con_imagen: 0,
        sin_imagen: 0
    });
    const [showTips, setShowTips] = useState(true);
    const [errorDetails, setErrorDetails] = useState(null);

    // Nuevos estados para mejoras de UX
    const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
    const [sortOption, setSortOption] = useState(SORT_OPTIONS.NAME_ASC);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [filterHasImages, setFilterHasImages] = useState('all'); // 'all', 'with', 'without'
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [imageSizeSlider, setImageSizeSlider] = useState(3); // 1-5 para tamaño de imagen en grid
    const [anchorElSortMenu, setAnchorElSortMenu] = useState(null);

    // Función para mostrar notificaciones
    const showNotification = (message, type) => {
        setNotification({
            open: true,
            message,
            type
        });
    };

    // Función para manejar errores con detalles
    const handleError = (error, customMessage) => {
        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
        const errorDetails = {
            message: errorMessage,
            status: error.response?.status,
            url: error.config?.url,
            method: error.config?.method,
            time: new Date().toLocaleTimeString()
        };

        setErrorDetails(errorDetails);
        showNotification(`${customMessage}: ${errorMessage}`, 'error');
    };

    /**
     * Carga los datos del resumen desde la API
     */
    const fetchResumen = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/imagenes/resumen`);

            const data = {
                total: response.data.total || 0,
                con_imagen: response.data.con_imagen || 0,
                sin_imagen: response.data.sin_imagen || 0
            };

            setResumen(data);
            setServicesWithImages(data.con_imagen || 0);
            setServicesWithoutImages(data.sin_imagen || 0);
        } catch (error) {
            handleError(error, 'Error al cargar las estadísticas');
        }
    };

    /**
     * Carga los servicios (con y sin imágenes)
     */
    const fetchServices = async () => {
        setLoadingServices(true);

        try {
            // Obtener servicios con imágenes
            const servicesWithImagesResponse = await axios.get(`${API_URL}/api/imagenes/all`);

            // Obtener servicios sin imágenes
            const servicesWithoutImagesResponse = await axios.get(`${API_URL}/api/imagenes/pendientes`);

            // Extraer los datos del response de manera segura
            const servicesWithImages = servicesWithImagesResponse.data?.data || [];
            const servicesWithoutImages = servicesWithoutImagesResponse.data?.data || [];

            // Combinar resultados
            const allServices = [
                ...servicesWithImages,
                ...servicesWithoutImages
            ];

            // Extraer categorías únicas para los filtros
            const categories = [...new Set(allServices.map(service => service.category).filter(Boolean))];
            setAvailableCategories(categories);

            setServices(allServices);

            // Actualizar contadores
            setServicesWithImages(servicesWithImages.length || 0);
            setServicesWithoutImages(servicesWithoutImages.length || 0);

        } catch (error) {
            handleError(error, 'Error al cargar los servicios');
        } finally {
            setLoadingServices(false);
        }
    };

    /**
     * Carga las imágenes disponibles
     */
    const fetchImages = async () => {
        setLoadingImages(true);
        try {
          const { data } = await axios.get(`${API_URL}/api/imagenes/ftp-list`);
          if (data.success && Array.isArray(data.files)) {
            // Transformar la respuesta a tu formato interno
            const fetchedImages = data.files.map(file => {
              const fileName = file.name;
              // size y fecha pueden no venir, revisa qué propiedades trae tu backend
              const rawSize = file.size || 0;
              const rawDate = file.rawModifiedAt || null; // depende de lo que devuelva tu server
      
              return {
                id: fileName,
                name: fileName,
                url: `${IMAGE_URL_BASE}${fileName}`,
                created_at: rawDate
                  ? new Date(rawDate).toISOString().split('T')[0]
                  : 'Desconocido',
                size: rawSize
                  ? formatFileSize(rawSize) 
                  : 'Desconocido',
                format: fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
              };
            });
      
            setImages(fetchedImages);
          } else {
            setImages([]);
          }
        } catch (error) {
          console.error('Error al listar imágenes:', error);
          setImages([]);
        } finally {
          setLoadingImages(false);
        }
      };
      

    /**
     * Inicialización del componente
     */
    useEffect(() => {
        fetchResumen();
        fetchServices();
        fetchImages();

        return () => {
            // Cleanup
        };
    }, []);

    /**
     * Maneja el cambio de pestaña
     */
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    /**
     * Configura el dropzone para la carga de archivos
     */
    const onDrop = useCallback(acceptedFiles => {
        // Filtrar solo archivos de imagen
        const imageFiles = acceptedFiles.filter(file =>
            file.type.startsWith('image/')
        );

        if (imageFiles.length === 0) {
            showNotification('Solo se permiten archivos de imagen', 'error');
            return;
        }

        // Validar tamaño máximo (5MB para evitar problemas con FTP)
        const oversizedFiles = imageFiles.filter(file => file.size > 5 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            showNotification('Algunas imágenes exceden el tamaño máximo de 5MB', 'error');
            return;
        }

        // Crear previsualizaciones
        const newFiles = imageFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));

        setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }, []);

    // Configuración del dropzone
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': []
        },
        maxSize: 5 * 1024 * 1024 // 5MB
    });

    /**
     * Sube las imágenes al servidor FTP
     */
    const uploadImages = async () => {
        if (files.length === 0) {
            showNotification('No hay imágenes para subir', 'warning');
            return;
        }

        setUploading(true);

        try {
            const uploadedImages = [];
            const errores = [];

            for (const file of files) {
                try {
                    // Crear FormData para la subida
                    const formData = new FormData();
                    formData.append('image', file);
                    formData.append('filename', file.name);

                    // Enviar la imagen al servidor
                    const response = await axios.post(`${API_URL}/api/imagenes/upload-ftp`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                        timeout: 60000 // 1 minuto
                    });

                    if (response.data.success) {
                        const cleanFileName = file.name.replace(/\s+/g, '_').replace(/[^\w\d.-]/g, '');

                        uploadedImages.push({
                            id: file.name,
                            name: file.name,
                            url: `${IMAGE_URL_BASE}${cleanFileName}`,
                            created_at: new Date().toISOString().split('T')[0],
                            size: formatFileSize(file.size),
                            format: getFileExtension(file.name)
                        });
                    } else {
                        throw new Error(response.data.message || 'Error al subir la imagen');
                    }
                } catch (fileError) {
                    errores.push(`${file.name}: ${fileError.response?.data?.message || fileError.message}`);
                }
            }

            if (uploadedImages.length > 0) {
                // Actualizamos la lista de imágenes
                setImages(prev => [...uploadedImages, ...prev]);

                // Limpiamos los archivos subidos
                setFiles([]);

                const successMessage = `${uploadedImages.length} de ${files.length} imagen(es) subida(s) correctamente${errores.length > 0 ? ' (con algunos errores)' : ''}`;

                showNotification(
                    successMessage,
                    errores.length > 0 ? 'warning' : 'success'
                );

                // Refrescar los datos
                fetchResumen();
                fetchImages();
            } else {
                const errorMessage = `No se pudieron subir las imágenes: ${errores.join('; ')}`;
                showNotification(errorMessage, 'error');
            }
        } catch (error) {
            handleError(error, 'Error al subir imágenes');
        } finally {
            setUploading(false);
        }
    };

    /**
     * Elimina un archivo de la lista de archivos a subir
     */
    const removeFile = (index) => {
        const newFiles = [...files];
        URL.revokeObjectURL(newFiles[index].preview);
        newFiles.splice(index, 1);
        setFiles(newFiles);
    };

    /**
     * Abre el diálogo para asignar una imagen a un servicio
     */
    const openAssignDialog = (service) => {
        setSelectedService(service);
        setIsAssignDialogOpen(true);
    };

    /**
     * Abre el diálogo para confirmar la eliminación de una imagen
     */
    const openDeleteDialog = (image) => {
        setSelectedImage(image);
        setIsDeleteDialogOpen(true);
    };

    /**
     * Abre el visor de imagen
     */
    const openImagePreview = (image) => {
        setPreviewImage(image);
        setImagePreviewOpen(true);
    };

    /**
     * Asigna una imagen a un servicio
     */
    const assignImageToService = async (image) => {
        if (!selectedService || !image) return;

        try {
            const response = await axios.post(`${API_URL}/api/imagenes/asignar/${selectedService.id}`, {
                imageUrl: image.url,
                name: image.name
            });

            if (response.data) {
                // Actualizar el estado local
                const updatedServices = services.map(service =>
                    service.id === selectedService.id
                        ? {
                            ...service,
                            image_url: image.url,
                            image_name: image.name
                        }
                        : service
                );

                setServices(updatedServices);

                // Actualizar contadores
                fetchResumen();

                showNotification(`Imagen asignada a ${selectedService.title}`, 'success');
            }
        } catch (error) {
            handleError(error, 'Error al asignar la imagen');
        } finally {
            setIsAssignDialogOpen(false);
            setSelectedService(null);
        }
    };

    /**
     * Elimina una imagen del servidor FTP
     */
    const deleteImage = async () => {
        if (!selectedImage) return;

        try {
            const response = await axios.delete(`${API_URL}/api/imagenes/eliminar-ftp`, {
                data: { filename: selectedImage.name }
            });

            if (response.data.success) {
                // Eliminar de la lista local
                setImages(prev => prev.filter(img => img.name !== selectedImage.name));

                // Actualizar servicios que usaban esta imagen
                const updatedServices = services.map(service =>
                    service.image_url === selectedImage.url
                        ? { ...service, image_url: null, image_name: null }
                        : service
                );

                setServices(updatedServices);

                // Actualizar contadores
                fetchResumen();

                showNotification('Imagen eliminada correctamente', 'success');
            } else {
                throw new Error(response.data.message || 'Error al eliminar imagen');
            }
        } catch (error) {
            handleError(error, 'Error al eliminar la imagen');
        } finally {
            setIsDeleteDialogOpen(false);
            setSelectedImage(null);
        }
    };

    /**
     * Remueve la imagen asignada a un servicio
     */
    const removeImageFromService = async (service) => {
        try {
            const response = await axios.delete(`${API_URL}/api/imagenes/remover/${service.id}`);

            if (response.data) {
                // Actualizar el estado local
                const updatedServices = services.map(s =>
                    s.id === service.id ? { ...s, image_url: null, image_name: null } : s
                );

                setServices(updatedServices);

                // Actualizar contadores
                fetchResumen();

                showNotification(`Imagen removida de ${service.title}`, 'success');
            }
        } catch (error) {
            handleError(error, 'Error al remover la imagen');
        }
    };

    // Utilidades para formateo de archivos
    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const getFileExtension = (filename) => {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
    };

    // Funciones de filtrado y ordenación
    const getSortedAndFilteredServices = () => {
        let filteredServices = [...services];

        // Filtrar por búsqueda
        if (searchQuery) {
            filteredServices = filteredServices.filter(service => 
                service.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.image_name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filtrar por categorías seleccionadas
        if (selectedCategories.length > 0) {
            filteredServices = filteredServices.filter(service => 
                service.category && selectedCategories.includes(service.category)
            );
        }

        // Filtrar por estado de imagen
        if (filterHasImages === 'with') {
            filteredServices = filteredServices.filter(service => service.image_url);
        } else if (filterHasImages === 'without') {
            filteredServices = filteredServices.filter(service => !service.image_url);
        }

        // Ordenar según la opción seleccionada
        switch(sortOption) {
            case SORT_OPTIONS.NAME_ASC:
                filteredServices.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            case SORT_OPTIONS.NAME_DESC:
                filteredServices.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
                break;
            case SORT_OPTIONS.WITH_IMAGES_FIRST:
                filteredServices.sort((a, b) => {
                    if (!!a.image_url === !!b.image_url) {
                        return (a.title || '').localeCompare(b.title || '');
                    }
                    return a.image_url ? -1 : 1;
                });
                break;
            case SORT_OPTIONS.WITHOUT_IMAGES_FIRST:
                filteredServices.sort((a, b) => {
                    if (!!a.image_url === !!b.image_url) {
                        return (a.title || '').localeCompare(b.title || '');
                    }
                    return a.image_url ? 1 : -1;
                });
                break;
            default:
                filteredServices.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        }

        return filteredServices;
    };

    const getSortedAndFilteredImages = () => {
        let filteredImages = [...images];

        // Filtrar por búsqueda
        if (searchQuery) {
            filteredImages = filteredImages.filter(image => 
                image.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Ordenar según la opción seleccionada
        switch(sortOption) {
            case SORT_OPTIONS.NAME_ASC:
                filteredImages.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            case SORT_OPTIONS.NAME_DESC:
                filteredImages.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
                break;
            case SORT_OPTIONS.DATE_ASC:
                filteredImages.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
                break;
            case SORT_OPTIONS.DATE_DESC:
                filteredImages.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
                break;
            default:
                filteredImages.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }

        return filteredImages;
    };

    // Gestión de categorías seleccionadas
    const handleCategoryChange = (category) => {
        const currentIndex = selectedCategories.indexOf(category);
        const newSelectedCategories = [...selectedCategories];

        if (currentIndex === -1) {
            newSelectedCategories.push(category);
        } else {
            newSelectedCategories.splice(currentIndex, 1);
        }

        setSelectedCategories(newSelectedCategories);
    };

    // Limpiar filtros
    const clearFilters = () => {
        setSelectedCategories([]);
        setFilterHasImages('all');
        setSearchQuery('');
    };

    // Limpiar las URLs de previsualización al desmontar el componente
    useEffect(() => {
        return () => {
            files.forEach(file => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
    }, [files]);

    // Estilos para el dropzone
    const dropzoneStyle = {
        border: `2px dashed ${darkMode ? '#555' : '#ccc'}`,
        borderRadius: '4px',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive
            ? (darkMode ? 'rgba(30, 144, 255, 0.2)' : 'rgba(30, 144, 255, 0.1)')
            : 'transparent',
        transition: 'all 0.3s ease',
        height: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    };

    // Función para refrescar todos los datos
    const refreshAllData = () => {
        fetchResumen();
        fetchServices();
        fetchImages();
        showNotification('Datos actualizados correctamente', 'success');
    };

    // Calcular porcentaje de servicios con imágenes
    const porcentajeCompletado = resumen.total > 0
        ? Math.round((resumen.con_imagen / resumen.total) * 100)
        : 0;

    // Determinar el tamaño de imagen para la vista de grid
    const getImageGridSize = () => {
        const baseSize = 12; // Tamaño base en divisiones de grid
        
        // Tamaños para escritorio (de menor a mayor)
        if (!isMediumScreen) {
            switch(imageSizeSlider) {
                case 1: return 3; // 4 por fila
                case 2: return 4; // 3 por fila
                case 3: return 6; // 2 por fila (default)
                case 4: return 8; // 1.5 por fila
                case 5: return 12; // 1 por fila
                default: return 6;
            }
        }
        
        // Tamaños para tablets
        if (!isMobile) {
            switch(imageSizeSlider) {
                case 1: return 4; // 3 por fila
                case 2: return 6; // 2 por fila
                case 3: return 8; // 1.5 por fila
                case 4: return 12; // 1 por fila
                case 5: return 12; // 1 por fila
                default: return 8;
            }
        }
        
        // Tamaños para móviles
        switch(imageSizeSlider) {
            case 1: return 6; // 2 por fila
            case 2: return 12; // 1 por fila
            case 3: return 12; // 1 por fila
            case 4: return 12; // 1 por fila
            case 5: return 12; // 1 por fila
            default: return 12;
        }
    };

    // Obtener servicios e imágenes filtrados
    const filteredServices = getSortedAndFilteredServices();
    const filteredImages = getSortedAndFilteredImages();


    return (
        <Box sx={{ width: '100%', p: { xs: 1, sm: 2 } }}>
            <Paper
                elevation={3}
                sx={{
                    p: { xs: 2, sm: 3 },
                    bgcolor: darkMode ? 'background.paper' : '#fff',
                    borderRadius: 2,
                    overflow: 'hidden'
                }}
            >
                <Typography variant="h5" gutterBottom component="div" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <ImageIcon sx={{ mr: 1 }} /> Administrador de Imágenes
                </Typography>

                {/* Tips para nuevos usuarios */}
                <Collapse in={showTips}>
                    <Alert
                        severity="info"
                        sx={{ mb: 3 }}
                        action={
                            <IconButton size="small" onClick={() => setShowTips(false)}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        }
                    >
                        <Typography variant="subtitle2">Consejos:</Typography>
                        <Typography variant="body2">• Tamaño máximo recomendado: 5MB por imagen</Typography>
                        <Typography variant="body2">• Formatos soportados: JPG, PNG, GIF y WebP</Typography>
                    </Alert>
                </Collapse>

                {/* Error detallado (colapsa automáticamente) */}
                <Collapse in={!!errorDetails}>
                    <Alert
                        severity="error"
                        sx={{ mb: 3 }}
                        action={
                            <IconButton size="small" onClick={() => setErrorDetails(null)}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        }
                    >
                        <Typography variant="subtitle2">Error Detallado:</Typography>
                        {errorDetails && (
                            <>
                                <Typography variant="body2">• Mensaje: {errorDetails.message}</Typography>
                                {errorDetails.status && (
                                    <Typography variant="body2">• Status: {errorDetails.status}</Typography>
                                )}
                                {errorDetails.url && (
                                    <Typography variant="body2">• URL: {errorDetails.url}</Typography>
                                )}
                                <Typography variant="body2">• Hora: {errorDetails.time}</Typography>
                            </>
                        )}
                    </Alert>
                </Collapse>

                {/* Progreso de asignación de imágenes */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2">
                            Progreso de asignación de imágenes
                        </Typography>
                        <Typography variant="subtitle2" color="primary">
                            {porcentajeCompletado}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={porcentajeCompletado}
                        sx={{ height: 10, borderRadius: 1 }}
                    />

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12} sm={4}>
                            <Card
                                variant="outlined"
                                sx={{
                                    bgcolor: darkMode ? 'background.paper' : '#f5f5f5',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateY(-3px)', boxShadow: 1 }
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <ImageIcon color="disabled" sx={{ fontSize: 36, mr: 1.5 }} />
                                        <Box>
                                            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                                                {resumen.total}
                                            </Typography>
                                            <Typography color="textSecondary" variant="body2">
                                                Servicios Totales
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card
                                variant="outlined"
                                sx={{
                                    bgcolor: darkMode ? 'background.paper' : '#f0f7ff',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateY(-3px)', boxShadow: 1 }
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <CheckCircleIcon color="primary" sx={{ fontSize: 36, mr: 1.5 }} />
                                        <Box>
                                            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                {resumen.con_imagen}
                                            </Typography>
                                            <Typography color="textSecondary" variant="body2">
                                                Con Imágenes
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card
                                variant="outlined"
                                sx={{
                                    bgcolor: darkMode ? 'background.paper' : '#fff4f4',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateY(-3px)', boxShadow: 1 }
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <CancelIcon color="error" sx={{ fontSize: 36, mr: 1.5 }} />
                                        <Box>
                                            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                                {resumen.sin_imagen}
                                            </Typography>
                                            <Typography color="textSecondary" variant="body2">
                                                Sin Imágenes
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Barra de búsqueda y controles */}
                <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={5}>
                            <TextField
                                fullWidth
                                placeholder="Buscar por nombre o categoría..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchQuery && (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setSearchQuery('')}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                                variant="outlined"
                                size="medium"
                                sx={{
                                    backgroundColor: darkMode ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.03),
                                    borderRadius: 1,
                                    '& .MuiOutlinedInput-root': {
                                        transition: 'box-shadow 0.2s',
                                        '&:hover, &:focus-within': {
                                            boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)'
                                        }
                                    }
                                }}
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={7}>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<FilterAltIcon />}
                                    onClick={() => setIsFilterDrawerOpen(true)}
                                    size={isMobile ? "small" : "medium"}
                                >
                                    {selectedCategories.length > 0 || filterHasImages !== 'all' ? (
                                        <Badge color="error" variant="dot" sx={{ mr: 0.5 }}>
                                            Filtros
                                        </Badge>
                                    ) : (
                                        "Filtros"
                                    )}
                                </Button>
                                
                                <Tooltip title="Cambiar modo de visualización">
                                    <ButtonGroup variant="outlined" size={isMobile ? "small" : "medium"}>
                                        <Button 
                                            color={viewMode === VIEW_MODES.GRID ? "primary" : "inherit"}
                                            onClick={() => setViewMode(VIEW_MODES.GRID)}
                                        >
                                            <GridViewIcon />
                                        </Button>
                                        <Button 
                                            color={viewMode === VIEW_MODES.LIST ? "primary" : "inherit"}
                                            onClick={() => setViewMode(VIEW_MODES.LIST)}
                                        >
                                            <ViewListIcon />
                                        </Button>
                                    </ButtonGroup>
                                </Tooltip>
                                
                                <Button
                                    variant="outlined"
                                    startIcon={<RefreshIcon />}
                                    onClick={refreshAllData}
                                    size={isMobile ? "small" : "medium"}
                                >
                                    Actualizar
                                </Button>
                                
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<CloudUploadIcon />}
                                    onClick={() => setTabValue(2)}
                                    size={isMobile ? "small" : "medium"}
                                >
                                    Subir
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Menú de Ordenación */}
                <Menu
                    anchorEl={anchorElSortMenu}
                    open={Boolean(anchorElSortMenu)}
                    onClose={() => setAnchorElSortMenu(null)}
                    PaperProps={{
                        elevation: 3,
                        sx: { width: 240, maxWidth: '100%', mt: 1.5 }
                    }}
                >
                    <MenuItem
                        onClick={() => {
                            setSortOption(SORT_OPTIONS.NAME_ASC);
                            setAnchorElSortMenu(null);
                        }}
                        selected={sortOption === SORT_OPTIONS.NAME_ASC}
                    >
                        <ListItemIcon>
                            <ArrowUpwardIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Nombre (A-Z)</ListItemText>
                    </MenuItem>
                    
                    <MenuItem
                        onClick={() => {
                            setSortOption(SORT_OPTIONS.NAME_DESC);
                            setAnchorElSortMenu(null);
                        }}
                        selected={sortOption === SORT_OPTIONS.NAME_DESC}
                    >
                        <ListItemIcon>
                            <ArrowDownwardIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Nombre (Z-A)</ListItemText>
                    </MenuItem>
                    
                    <Divider />
                    
                    <MenuItem
                        onClick={() => {
                            setSortOption(SORT_OPTIONS.DATE_ASC);
                            setAnchorElSortMenu(null);
                        }}
                        selected={sortOption === SORT_OPTIONS.DATE_ASC}
                    >
                        <ListItemIcon>
                            <ArrowUpwardIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Fecha (Antigua)</ListItemText>
                    </MenuItem>
                    
                    <MenuItem
                        onClick={() => {
                            setSortOption(SORT_OPTIONS.DATE_DESC);
                            setAnchorElSortMenu(null);
                        }}
                        selected={sortOption === SORT_OPTIONS.DATE_DESC}
                    >
                        <ListItemIcon>
                            <ArrowDownwardIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Fecha (Reciente)</ListItemText>
                    </MenuItem>
                    
                    <Divider />
                    
                    <MenuItem
                        onClick={() => {
                            setSortOption(SORT_OPTIONS.WITH_IMAGES_FIRST);
                            setAnchorElSortMenu(null);
                        }}
                        selected={sortOption === SORT_OPTIONS.WITH_IMAGES_FIRST}
                    >
                        <ListItemIcon>
                            <CheckCircleIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Con imágenes primero</ListItemText>
                    </MenuItem>
                    
                    <MenuItem
                        onClick={() => {
                            setSortOption(SORT_OPTIONS.WITHOUT_IMAGES_FIRST);
                            setAnchorElSortMenu(null);
                        }}
                        selected={sortOption === SORT_OPTIONS.WITHOUT_IMAGES_FIRST}
                    >
                        <ListItemIcon>
                            <CancelIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Sin imágenes primero</ListItemText>
                    </MenuItem>
                </Menu>

                {/* Pestañas */}
                <Box sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    mb: 3,
                    borderRadius: '4px 4px 0 0',
                    overflow: 'hidden',
                    bgcolor: darkMode ? 'background.default' : '#f5f5f5'
                }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="image management tabs"
                        variant={isMobile ? "fullWidth" : "standard"}
                        indicatorColor="primary"
                        textColor="primary"
                    >
                        <Tab
                            label="Servicios"
                            icon={<FolderOpenIcon />}
                            iconPosition="start"
                            sx={{ minHeight: 48, py: 1 }}
                        />
                        <Tab
                            label="Imágenes"
                            icon={<ImageIcon />}
                            iconPosition="start"
                            sx={{ minHeight: 48, py: 1 }}
                        />
                        <Tab
                            label="Subir Imágenes"
                            icon={<UploadIcon />}
                            iconPosition="start"
                            sx={{ minHeight: 48, py: 1 }}
                        />
                    </Tabs>
                </Box>

                {/* Panel de Servicios */}
                {tabValue === 0 && (
                    <Fade in={tabValue === 0}>
                        <Box>
                            {loadingServices ? (
                                <Box sx={{ mt: 2 }}>
                                    <LinearProgress sx={{ mb: 2 }} />
                                    <Grid container spacing={2}>
                                        {[...Array(3)].map((_, i) => (
                                            <Grid item xs={12} key={i}>
                                                <Skeleton variant="rectangular" height={60} />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            ) : filteredServices.length === 0 ? (
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    p: 4,
                                    textAlign: 'center'
                                }}>
                                    <SearchIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
                                    <Typography variant="h6" color="textSecondary" gutterBottom>
                                        No se encontraron servicios
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" paragraph>
                                        Intenta con otros términos de búsqueda o limpia los filtros
                                    </Typography>
                                    <Button 
                                        variant="outlined" 
                                        startIcon={<ResetIcon />} 
                                        onClick={clearFilters}
                                    >
                                        Limpiar filtros
                                    </Button>
                                </Box>
                            ) : viewMode === VIEW_MODES.GRID ? (
                                // Vista de Grid para servicios
                                <Grid container spacing={2}>
                                    {filteredServices.map((service) => (
                                        <Grid item xs={12} sm={6} md={4} key={service.id}>
                                            <Card
                                                variant="outlined"
                                                sx={{
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                                    '&:hover': {
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: 3
                                                    }
                                                }}
                                            >
                                                <Box sx={{ p: 2, flex: 1 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                                            {service.title}
                                                        </Typography>
                                                        {service.category && (
                                                            <Chip
                                                                label={service.category}
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Box>
                                                    
                                                    {service.description && (
                                                        <Typography variant="body2" color="textSecondary" gutterBottom noWrap>
                                                            {service.description}
                                                        </Typography>
                                                    )}
                                                    
                                                    <Box 
                                                        sx={{ 
                                                            mt: 2, 
                                                            height: 140, 
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            position: 'relative',
                                                            bgcolor: 'background.default',
                                                            borderRadius: 1,
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        {service.image_url ? (
                                                            <>
                                                                <Box
                                                                    component="img"
                                                                    src={service.image_url}
                                                                    alt={service.title}
                                                                    sx={{
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        objectFit: 'cover',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                    onClick={() => openImagePreview({
                                                                        name: service.image_name,
                                                                        url: service.image_url
                                                                    })}
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = IMAGE_ERROR_PLACEHOLDER;
                                                                    }}
                                                                />
                                                                <Fade in>
                                                                    <IconButton
                                                                        size="small"
                                                                        sx={{
                                                                            position: 'absolute',
                                                                            top: 8,
                                                                            right: 8,
                                                                            bgcolor: 'rgba(255,255,255,0.8)',
                                                                            '&:hover': {
                                                                                bgcolor: 'white'
                                                                            }
                                                                        }}
                                                                        onClick={() => openImagePreview({
                                                                            name: service.image_name,
                                                                            url: service.image_url
                                                                        })}
                                                                    >
                                                                        <ZoomInIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Fade>
                                                            </>
                                                        ) : (
                                                            <Box sx={{ 
                                                                display: 'flex', 
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                color: 'text.disabled'
                                                            }}>
                                                                <ImageIcon sx={{ fontSize: 40, mb: 1 }} />
                                                                <Typography variant="caption">
                                                                    Sin imagen
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                                
                                                <Divider />
                                                
                                                <CardActions sx={{ justifyContent: 'flex-end', p: 1.5 }}>
                                                    {service.image_url ? (
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            size="small"
                                                            startIcon={<DeleteIcon />}
                                                            onClick={() => removeImageFromService(service)}
                                                        >
                                                            Remover
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            startIcon={<PhotoCameraIcon />}
                                                            onClick={() => openAssignDialog(service)}
                                                        >
                                                            Asignar
                                                        </Button>
                                                    )}
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                // Vista de Lista para servicios
                                <TableContainer
                                    component={Paper}
                                    variant="outlined"
                                    sx={{
                                        boxShadow: 'none',
                                        border: '1px solid',
                                        borderColor: darkMode ? 'divider' : '#e0e0e0',
                                        borderRadius: 1
                                    }}
                                >
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: darkMode ? 'background.default' : '#f5f5f5' }}>
                                                <TableCell>Servicio</TableCell>
                                                <TableCell>Categoría</TableCell>
                                                <TableCell>Imagen</TableCell>
                                                <TableCell>Acciones</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredServices.map((service) => (
                                                <TableRow key={service.id} hover>
                                                    <TableCell>
                                                        <Typography variant="subtitle2">
                                                            {service.title}
                                                        </Typography>
                                                        {service.description && (
                                                            <Typography variant="caption" color="textSecondary">
                                                                {service.description.length > 60
                                                                    ? `${service.description.substring(0, 60)}...`
                                                                    : service.description}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {service.category && (
                                                            <Chip
                                                                label={service.category}
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                                sx={{ fontWeight: 500 }}
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {service.image_url ? (
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Box
                                                                    sx={{
                                                                        width: '60px',
                                                                        height: '40px',
                                                                        position: 'relative',
                                                                        overflow: 'hidden',
                                                                        borderRadius: '4px',
                                                                        border: '1px solid',
                                                                        borderColor: 'divider',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                    onClick={() => openImagePreview({
                                                                        name: service.image_name,
                                                                        url: service.image_url
                                                                    })}
                                                                >
                                                                    <img
                                                                        src={service.image_url}
                                                                        alt={service.title}
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            objectFit: 'cover'
                                                                        }}
                                                                        loading="lazy"
                                                                        onError={(e) => {
                                                                            e.target.onerror = null;
                                                                            e.target.src = IMAGE_ERROR_PLACEHOLDER;
                                                                        }}
                                                                    />
                                                                </Box>
                                                                <Tooltip title="Imagen asignada">
                                                                    <CheckCircleIcon
                                                                        color="success"
                                                                        fontSize="small"
                                                                        sx={{ ml: 1 }}
                                                                    />
                                                                </Tooltip>
                                                            </Box>
                                                        ) : (
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Box
                                                                    sx={{
                                                                        width: '60px',
                                                                        height: '40px',
                                                                        bgcolor: 'action.disabledBackground',
                                                                        borderRadius: '4px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        border: '1px dashed',
                                                                        borderColor: 'divider'
                                                                    }}
                                                                >
                                                                    <ImageIcon color="disabled" />
                                                                </Box>
                                                                <Tooltip title="Sin imagen">
                                                                    <CancelIcon
                                                                        color="error"
                                                                        fontSize="small"
                                                                        sx={{ ml: 1 }}
                                                                    />
                                                                </Tooltip>
                                                            </Box>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {service.image_url ? (
                                                            <Button
                                                                variant="outlined"
                                                                color="error"
                                                                size="small"
                                                                startIcon={<DeleteIcon />}
                                                                onClick={() => removeImageFromService(service)}
                                                            >
                                                                Remover
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                size="small"
                                                                startIcon={<PhotoCameraIcon />}
                                                                onClick={() => openAssignDialog(service)}
                                                            >
                                                                Asignar
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    </Fade>
                )}

                {/* Panel de Imágenes */}
                {tabValue === 1 && (
                    <Fade in={tabValue === 1}>
                        <Box>
                            {loadingImages ? (
                                <Box sx={{ mt: 2 }}>
                                    <LinearProgress sx={{ mb: 3 }} />
                                    <Grid container spacing={2}>
                                        {[...Array(8)].map((_, i) => (
                                            <Grid item xs={6} sm={4} md={3} key={i}>
                                                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 1 }} />
                                                <Skeleton variant="text" sx={{ mt: 1 }} />
                                                <Skeleton variant="text" width="60%" />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            ) : filteredImages.length === 0 ? (
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    p: 4,
                                    textAlign: 'center'
                                }}>
                                    <SearchIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
                                    <Typography variant="h6" color="textSecondary" gutterBottom>
                                        No se encontraron imágenes
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" paragraph>
                                        Intenta con otros términos de búsqueda o sube nuevas imágenes
                                    </Typography>
                                    <Button 
                                        variant="contained" 
                                        startIcon={<CloudUploadIcon />} 
                                        onClick={() => setTabValue(2)}
                                        color="primary"
                                    >
                                        Subir Imágenes
                                    </Button>
                                </Box>
                            ) : viewMode === VIEW_MODES.GRID ? (
                                // Vista de Grid para imágenes
                                <>
                                    {/* Slider para tamaño de imagen */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <ZoomOutIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                        <Slider
                                            value={imageSizeSlider}
                                            onChange={(e, value) => setImageSizeSlider(value)}
                                            min={1}
                                            max={5}
                                            step={1}
                                            size="small"
                                            sx={{ maxWidth: '160px', mr: 1 }}
                                        />
                                        <ZoomInIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                    </Box>
                                    
                                    <Grid container spacing={2}>
                                        {filteredImages.map((image) => {
                                            const gridSize = getImageGridSize();
                                            
                                            return (
                                                <Grid item xs={12} sm={gridSize} md={gridSize} key={image.id}>
                                                    <Card
                                                        variant="outlined"
                                                        sx={{
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                transform: 'translateY(-5px)',
                                                                boxShadow: 3
                                                            }
                                                        }}
                                                    >
                                                        <CardMedia
                                                            component="img"
                                                            height="180"
                                                            image={image.url}
                                                            alt={image.name}
                                                            sx={{
                                                                objectFit: 'cover',
                                                                bgcolor: '#f0f0f0',
                                                                cursor: 'pointer'
                                                            }}
                                                            loading="lazy"
                                                            onClick={() => openImagePreview(image)}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = IMAGE_ERROR_PLACEHOLDER;
                                                            }}
                                                        />
                                                        <CardContent sx={{ p: 1.5, pb: 0 }}>
                                                            <Tooltip title={image.name}>
                                                                <Typography
                                                                    variant="subtitle2"
                                                                    noWrap
                                                                    sx={{ fontWeight: 500 }}
                                                                >
                                                                    {image.name}
                                                                </Typography>
                                                            </Tooltip>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                                                <Typography variant="caption" color="textSecondary">
                                                                    {image.size || 'Desconocido'}
                                                                </Typography>
                                                                <Typography variant="caption" color="textSecondary">
                                                                    {image.created_at}
                                                                </Typography>
                                                            </Box>
                                                        </CardContent>
                                                        <CardActions sx={{ p: 1 }}>
                                                            <Tooltip title="Ver imagen">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => openImagePreview(image)}
                                                                    color="primary"
                                                                >
                                                                    <ZoomInIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Copiar URL">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(image.url);
                                                                        showNotification('URL copiada al portapapeles', 'success');
                                                                    }}
                                                                >
                                                                    <ContentCopyIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Box sx={{ flexGrow: 1 }} />
                                                            <Button
                                                                size="small"
                                                                color="primary"
                                                                onClick={() => {
                                                                    if (selectedService) {
                                                                        assignImageToService(image);
                                                                    } else {
                                                                        setSelectedImage(image);
                                                                        setTabValue(0);
                                                                        setSearchQuery('');
                                                                        showNotification('Seleccione un servicio para asignar esta imagen', 'info');
                                                                    }
                                                                }}
                                                            >
                                                                Asignar
                                                            </Button>
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => openDeleteDialog(image)}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </CardActions>
                                                    </Card>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                </>
                            ) : (
                                // Vista de Lista para imágenes
                                <TableContainer component={Paper} variant="outlined">
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: darkMode ? 'background.default' : '#f5f5f5' }}>
                                                <TableCell>Vista previa</TableCell>
                                                <TableCell>Nombre</TableCell>
                                                <TableCell>Tamaño</TableCell>
                                                <TableCell>Fecha</TableCell>
                                                <TableCell>Acciones</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredImages.map((image) => (
                                                <TableRow key={image.id} hover>
                                                    <TableCell>
                                                        <Box
                                                            sx={{
                                                                width: '60px',
                                                                height: '40px',
                                                                borderRadius: '4px',
                                                                overflow: 'hidden',
                                                                cursor: 'pointer'
                                                            }}
                                                            onClick={() => openImagePreview(image)}
                                                        >
                                                            <img
                                                                src={image.url}
                                                                alt={image.name}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = IMAGE_ERROR_PLACEHOLDER;
                                                                }}
                                                            />
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">{image.name}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">{image.size || 'Desconocido'}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">{image.created_at}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Tooltip title="Ver imagen">
                                                                <IconButton 
                                                                    size="small" 
                                                                    color="primary" 
                                                                    onClick={() => openImagePreview(image)}
                                                                >
                                                                    <ZoomInIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Asignar">
                                                                <IconButton 
                                                                    size="small" 
                                                                    color="primary"
                                                                    onClick={() => {
                                                                        if (selectedService) {
                                                                            assignImageToService(image);
                                                                        } else {
                                                                            setSelectedImage(image);
                                                                            setTabValue(0);
                                                                            setSearchQuery('');
                                                                            showNotification('Seleccione un servicio para asignar esta imagen', 'info');
                                                                        }
                                                                    }}
                                                                >
                                                                    <PhotoCameraIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Eliminar">
                                                                <IconButton 
                                                                    size="small" 
                                                                    color="error"
                                                                    onClick={() => openDeleteDialog(image)}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    </Fade>
                )}

                {/* Panel de Subida de Imágenes */}
                {tabValue === 2 && (
                    <Fade in={tabValue === 2}>
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <CloudUploadIcon sx={{ mr: 1 }} /> Subir nuevas imágenes al servidor
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            {/* Dropzone */}
                            <Box
                                {...getRootProps()}
                                style={dropzoneStyle}
                                sx={{
                                    mb: 3,
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        bgcolor: darkMode ? 'rgba(30, 144, 255, 0.05)' : 'rgba(30, 144, 255, 0.03)'
                                    }
                                }}
                            >
                                <input {...getInputProps()} />
                                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1.5, opacity: 0.8 }} />
                                {isDragActive ? (
                                    <Typography variant="body1" color="primary" sx={{ fontWeight: 500 }}>
                                        ¡Suelta tus imágenes aquí!
                                    </Typography>
                                ) : (
                                    <>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            Arrastra y suelta imágenes aquí, o haz clic para seleccionarlas
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Máximo 5MB por imagen • JPG, PNG, GIF, WebP
                                        </Typography>
                                    </>
                                )}
                            </Box>

                            {/* Previsualización de archivos */}
                            {files.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                            mb: 3,
                                            bgcolor: darkMode ? 'background.paper' : '#f9f9f9',
                                            borderRadius: 1
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                                                <ImageIcon fontSize="small" sx={{ mr: 1 }} />
                                                Imágenes seleccionadas ({files.length})
                                            </Typography>
                                            
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => {
                                                    files.forEach(file => {
                                                        if (file.preview) URL.revokeObjectURL(file.preview);
                                                    });
                                                    setFiles([]);
                                                }}
                                                color="error"
                                            >
                                                Limpiar todo
                                            </Button>
                                        </Box>
                                        
                                        <Grid container spacing={1.5}>
                                            {files.map((file, index) => (
                                                <Grid item xs={6} sm={3} md={2} key={index}>
                                                    <Box sx={{ position: 'relative' }}>
                                                        <Box
                                                            sx={{
                                                                height: '120px',
                                                                width: '100%',
                                                                borderRadius: '4px',
                                                                overflow: 'hidden',
                                                                boxShadow: 1
                                                            }}
                                                        >
                                                            <img
                                                                src={file.preview}
                                                                alt={`preview-${index}`}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover'
                                                                }}
                                                            />
                                                        </Box>
                                                        <IconButton
                                                            size="small"
                                                            sx={{
                                                                position: 'absolute',
                                                                top: -8,
                                                                right: -8,
                                                                bgcolor: 'background.paper',
                                                                boxShadow: 2,
                                                                '&:hover': { bgcolor: 'error.light', color: 'white' }
                                                            }}
                                                            onClick={() => removeFile(index)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                display: 'block',
                                                                mt: 0.5,
                                                                textAlign: 'center',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            {file.name}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            color="textSecondary"
                                                            sx={{
                                                                display: 'block',
                                                                textAlign: 'center'
                                                            }}
                                                        >
                                                            {formatFileSize(file.size)}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Paper>

                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                                            onClick={uploadImages}
                                            disabled={files.length === 0 || uploading}
                                            size="large"
                                            sx={{ px: 4 }}
                                        >
                                            {uploading ? 'Subiendo...' : 'Subir imágenes'}
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Fade>
                )}
            </Paper>

            {/* Drawer de Filtros */}
            <Drawer
                anchor="right"
                open={isFilterDrawerOpen}
                onClose={() => setIsFilterDrawerOpen(false)}
                PaperProps={{
                    sx: { width: { xs: '80%', sm: '350px' } }
                }}
            >
                <AppBar position="static" color="default" elevation={0}>
                    <Toolbar>
                        <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                            Filtros
                        </Typography>
                        <IconButton edge="end" onClick={() => setIsFilterDrawerOpen(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                
                <Box sx={{ p: 2, overflowY: 'auto' }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Estado de imagen
                    </Typography>
                    <FormControl component="fieldset" sx={{ mb: 3 }}>
                        <RadioGroup 
                            value={filterHasImages}
                            onChange={(e) => setFilterHasImages(e.target.value)}
                        >
                            <FormControlLabel
                                value="all"
                                control={<Radio />}
                                label="Todos los servicios"
                            />
                            <FormControlLabel
                                value="with"
                                control={<Radio />}
                                label="Con imágenes"
                            />
                            <FormControlLabel
                                value="without"
                                control={<Radio />}
                                label="Sin imágenes"
                            />
                        </RadioGroup>
                    </FormControl>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Categorías
                        </Typography>
                        
                        {availableCategories.length === 0 ? (
                            <Typography variant="body2" color="textSecondary">
                                No hay categorías disponibles
                            </Typography>
                        ) : (
                            <List dense>
                                {availableCategories.map((category) => (
                                    <ListItem key={category} disablePadding>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={selectedCategories.includes(category)}
                                                    onChange={() => handleCategoryChange(category)}
                                                    size="small"
                                                />
                                            }
                                            label={category}
                                            sx={{ width: '100%' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                </Box>
                
                <Divider />
                
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        variant="outlined"
                        startIcon={<ResetIcon />}
                        onClick={clearFilters}
                    >
                        Limpiar filtros
                    </Button>
                    
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setIsFilterDrawerOpen(false)}
                    >
                        Aplicar
                    </Button>
                </Box>
            </Drawer>

            {/* Diálogo para asignar imagen */}
            <Dialog
                open={isAssignDialogOpen}
                onClose={() => setIsAssignDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2
                    }
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhotoCameraIcon sx={{ mr: 1 }} />
                        Seleccionar imagen para: {selectedService?.title}
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Buscar imagen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                        size="small"
                        sx={{ mb: 2 }}
                    />

                    <Grid container spacing={2}>
                        {loadingImages ? (
                            <>
                                {[...Array(8)].map((_, i) => (
                                    <Grid item xs={6} sm={4} md={3} key={i}>
                                        <Skeleton variant="rectangular" height={120} />
                                        <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
                                    </Grid>
                                ))}
                            </>
                        ) : filteredImages.length === 0 ? (
                            <Grid item xs={12}>
                                <Box sx={{
                                    p: 3,
                                    textAlign: 'center',
                                    border: '1px dashed',
                                    borderColor: 'divider',
                                    borderRadius: 1
                                }}>
                                    <SearchIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                                    <Typography>No se encontraron imágenes</Typography>
                                </Box>
                            </Grid>
                        ) : (
                            filteredImages.map((image) => (
                                <Grid item xs={6} sm={4} md={3} key={image.id}>
                                    <Card
                                        variant="outlined"
                                        sx={{
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                transform: 'scale(1.05)',
                                                boxShadow: 2
                                            }
                                        }}
                                        onClick={() => assignImageToService(image)}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="120"
                                            image={image.url}
                                            alt={image.name}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = IMAGE_ERROR_PLACEHOLDER;
                                            }}
                                            sx={{
                                                objectFit: 'cover',
                                                transition: 'transform 0.2s'
                                            }}
                                        />
                                        <CardContent sx={{ p: 1 }}>
                                            <Typography variant="caption" noWrap>
                                                {image.name}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAssignDialogOpen(false)}>
                        Cancelar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo para confirmar eliminación */}
            <Dialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: 2
                    }
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DeleteIcon color="error" sx={{ mr: 1 }} />
                        Confirmar eliminación
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" paragraph>
                        ¿Está seguro que desea eliminar esta imagen? Esta acción no se puede deshacer.
                    </Typography>
                    <Typography variant="body2" color="error" paragraph>
                        Nota: Si esta imagen está asignada a algún servicio, el servicio perderá su imagen.
                    </Typography>
                    {selectedImage && (
                        <Box sx={{ 
                            mt: 2, 
                            textAlign: 'center',
                            overflow: 'hidden',
                            borderRadius: 1,
                            boxShadow: 1
                        }}>
                            <img
                                src={selectedImage.url}
                                alt="Preview"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '200px',
                                    display: 'block',
                                    margin: '0 auto'
                                }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = IMAGE_ERROR_PLACEHOLDER;
                                }}
                            />
                            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                {selectedImage.name}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setIsDeleteDialogOpen(false)}
                        startIcon={<CloseIcon />}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={deleteImage} 
                        color="error" 
                        variant="contained"
                        startIcon={<DeleteIcon />}
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Visor de imágenes en pantalla completa */}
            <Dialog
                open={imagePreviewOpen}
                onClose={() => setImagePreviewOpen(false)}
                maxWidth="xl"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        overflow: 'hidden'
                    }
                }}
            >
                <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                            {previewImage?.name}
                        </Typography>
                        <Box>
                            <IconButton 
                                onClick={() => {
                                    if (previewImage?.url) {
                                        navigator.clipboard.writeText(previewImage.url);
                                        showNotification('URL copiada al portapapeles', 'success');
                                    }
                                }}
                                title="Copiar URL"
                            >
                                <ContentCopyIcon />
                            </IconButton>
                            <IconButton 
                                onClick={() => window.open(previewImage?.url, '_blank')}
                                title="Abrir en nueva pestaña"
                            >
                                <FullscreenIcon />
                            </IconButton>
                            <IconButton 
                                onClick={() => setImagePreviewOpen(false)}
                                edge="end"
                                title="Cerrar"
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Toolbar>
                </AppBar>
                <Box 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: 'black',
                        height: '70vh',
                        overflow: 'hidden'
                    }}
                >
                    {previewImage && (
                        <img
                            src={previewImage.url}
                            alt={previewImage.name || 'Vista previa'}
                            style={{ 
                                maxWidth: '100%', 
                                maxHeight: '100%',
                                objectFit: 'contain'
                            }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = IMAGE_ERROR_PLACEHOLDER;
                            }}
                        />
                    )}
                </Box>
                <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Typography variant="caption" color="textSecondary">
                        {previewImage?.size || ''} {previewImage?.format ? `• ${previewImage.format.toUpperCase()}` : ''}
                    </Typography>
                    <Box>
                        {selectedService && (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<PhotoCameraIcon />}
                                onClick={() => {
                                    assignImageToService(previewImage);
                                    setImagePreviewOpen(false);
                                }}
                                sx={{ mr: 1 }}
                            >
                                Asignar a {selectedService.title}
                            </Button>
                        )}
                        <Button 
                            onClick={() => setImagePreviewOpen(false)}
                            variant="outlined"
                        >
                            Cerrar
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>

            {/* Notificaciones */}
            <Notificaciones
                open={notification.open}
                message={notification.message}
                type={notification.type}
                handleClose={() => setNotification({ open: false, message: '', type: '' })}
            />
        </Box>
    );
};

export default ImagenesForm;