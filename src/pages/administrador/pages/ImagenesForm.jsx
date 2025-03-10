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
    LinearProgress
} from '@mui/material';

// Material UI Icons
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Link as LinkIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Image as ImageIcon,
    Search as SearchIcon,
    PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';

// Importamos el componente de carga de archivos desde react-dropzone
import { useDropzone } from 'react-dropzone';

const ImagenesForm = () => {
    // Contexto de tema
    const { darkMode } = useThemeContext();

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

    /**
     * Carga los datos del resumen desde la API
     */
    const fetchResumen = async () => {
        try {
            const response = await axios.get(`https://back-end-4803.onrender.com/api/imagenes/resumen`);
            setResumen({
                total: response.data.total || 0,
                con_imagen: response.data.con_imagen || 0,
                sin_imagen: response.data.sin_imagen || 0
            });
            setServicesWithImages(response.data.con_imagen || 0);
            setServicesWithoutImages(response.data.sin_imagen || 0);
        } catch (error) {
            console.error('Error al cargar resumen:', error);
            setNotification({
                open: true,
                message: 'Error al cargar las estadísticas',
                type: 'error'
            });
        }
    };


    // Modifica la función fetchServices para manejar correctamente la estructura de datos
    const fetchServices = async () => {
        setLoadingServices(true);
        try {
            // Obtener servicios con imágenes
            const servicesWithImagesResponse = await axios.get(`https://back-end-4803.onrender.com/api/imagenes/all`);

            // Obtener servicios sin imágenes
            const servicesWithoutImagesResponse = await axios.get(`https://back-end-4803.onrender.com/api/imagenes/pendientes`);

            // Extraer los datos del response de manera segura
            const servicesWithImages = servicesWithImagesResponse.data && servicesWithImagesResponse.data.data ?
                servicesWithImagesResponse.data.data : [];

            const servicesWithoutImages = servicesWithoutImagesResponse.data && servicesWithoutImagesResponse.data.data ?
                servicesWithoutImagesResponse.data.data : [];

            // Combinar resultados
            const allServices = [
                ...servicesWithImages,
                ...servicesWithoutImages
            ];

            setServices(allServices);

            // Actualizar contadores
            setServicesWithImages(servicesWithImages.length || 0);
            setServicesWithoutImages(servicesWithoutImages.length || 0);

        } catch (error) {
            console.error('Error al cargar servicios:', error);
            setNotification({
                open: true,
                message: 'Error al cargar los servicios: ' + (error.response?.data?.message || error.message),
                type: 'error'
            });
        } finally {
            setLoadingServices(false);
        }
    };

    // Modifica la función fetchImages para manejar la estructura de datos correctamente
    const fetchImages = async () => {
        setLoadingImages(true);
        try {
            const response = await axios.get(`https://back-end-4803.onrender.com/api/imagenes/cloudinary`);

            // Extraer los datos de manera segura
            const cloudinaryImages = response.data && response.data.data ?
                response.data.data.map(image => ({
                    id: image.public_id.split('/')[1] || image.public_id,
                    public_id: image.public_id,
                    url: image.url,
                    created_at: image.created_at,
                    format: image.format,
                    bytes: image.bytes
                })) : [];

            setImages(cloudinaryImages);
        } catch (error) {
            console.error('Error al cargar imágenes:', error);
            setNotification({
                open: true,
                message: 'Error al cargar las imágenes: ' + (error.response?.data?.message || error.message),
                type: 'error'
            });
        } finally {
            setLoadingImages(false);
        }
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        fetchResumen();
        fetchServices();
        fetchImages();
    }, []);

    /**
     * Maneja el cambio de pestaña
     * @param {Event} event - Evento de cambio
     * @param {number} newValue - Nuevo valor de la pestaña
     */
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    /**
     * Configura el dropzone para la carga de archivos
     */
    const onDrop = useCallback(acceptedFiles => {
        const imageFiles = acceptedFiles.filter(file =>
            file.type.startsWith('image/')
        );

        if (imageFiles.length === 0) {
            setNotification({
                open: true,
                message: 'Solo se permiten archivos de imagen',
                type: 'error'
            });
            return;
        }

        // Validar tamaño máximo (10MB)
        const oversizedFiles = imageFiles.filter(file => file.size > 10 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            setNotification({
                open: true,
                message: 'Algunas imágenes exceden el tamaño máximo de 10MB',
                type: 'error'
            });
            return;
        }

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
        maxSize: 10 * 1024 * 1024 // 10MB
    });

    /**
     * Sube las imágenes al servidor
     */
    const uploadImages = async () => {
        if (files.length === 0) {
            setNotification({
                open: true,
                message: 'No hay imágenes para subir',
                type: 'warning'
            });
            return;
        }

        setUploading(true);

        try {
            const uploadedImages = [];

            for (const file of files) {
                const formData = new FormData();
                formData.append('image', file);

                const response = await axios.post(`https://back-end-4803.onrender.com/api/imagenes/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (response.data.image) {
                    uploadedImages.push({
                        id: response.data.image.public_id.split('/')[1] || response.data.image.public_id,
                        public_id: response.data.image.public_id,
                        url: response.data.image.url,
                        created_at: new Date().toISOString().split('T')[0],
                        format: response.data.image.format
                    });
                }
            }

            // Actualizamos la lista de imágenes
            setImages(prev => [...uploadedImages, ...prev]);

            // Limpiamos los archivos subidos
            setFiles([]);

            setNotification({
                open: true,
                message: `${uploadedImages.length} imagen(es) subida(s) correctamente`,
                type: 'success'
            });

            // Refrescar los datos
            fetchResumen();

        } catch (error) {
            console.error('Error al subir imágenes:', error);
            setNotification({
                open: true,
                message: 'Error al subir imágenes: ' + (error.response?.data?.message || error.message),
                type: 'error'
            });
        } finally {
            setUploading(false);
        }
    };

    /**
     * Elimina un archivo de la lista de archivos a subir
     * @param {number} index - Índice del archivo a eliminar
     */
    const removeFile = (index) => {
        const newFiles = [...files];

        URL.revokeObjectURL(newFiles[index].preview);

        newFiles.splice(index, 1);
        setFiles(newFiles);
    };

    /**
     * Abre el diálogo para asignar una imagen a un servicio
     * @param {Object} service - Servicio al que asignar la imagen
     */
    const openAssignDialog = (service) => {
        setSelectedService(service);
        setIsAssignDialogOpen(true);
    };

    /**
     * Abre el diálogo para confirmar la eliminación de una imagen
     * @param {Object} image - Imagen a eliminar
     */
    const openDeleteDialog = (image) => {
        setSelectedImage(image);
        setIsDeleteDialogOpen(true);
    };

    /**
     * Asigna una imagen a un servicio
     * @param {Object} image - Imagen a asignar
     */
    const assignImageToService = async (image) => {
        if (!selectedService || !image) return;

        try {
            const response = await axios.post(`https://back-end-4803.onrender.com/api/imagenes/asignar/${selectedService.id}`, {
                imageUrl: image.url
            });

            if (response.data) {
                // Actualizar el estado local
                const updatedServices = services.map(service =>
                    service.id === selectedService.id
                        ? { ...service, image_url: image.url }
                        : service
                );

                setServices(updatedServices);

                // Actualizar contadores
                fetchResumen();

                setNotification({
                    open: true,
                    message: `Imagen asignada a ${selectedService.title}`,
                    type: 'success'
                });
            }
        } catch (error) {
            console.error('Error al asignar imagen:', error);
            setNotification({
                open: true,
                message: 'Error al asignar la imagen: ' + (error.response?.data?.message || error.message),
                type: 'error'
            });
        } finally {
            setIsAssignDialogOpen(false);
            setSelectedService(null);
        }
    };

    /**
     * Elimina una imagen de Cloudinary y de la base de datos
     */
    const deleteImage = async () => {
        if (!selectedImage) return;

        try {
            const response = await axios.delete(`https://back-end-4803.onrender.com/api/imagenes/eliminar`, {
                data: { public_id: selectedImage.public_id }
            });

            if (response.data) {
                // Eliminar de la lista local
                setImages(prev => prev.filter(img => img.id !== selectedImage.id));

                // Actualizar servicios que usaban esta imagen
                fetchServices();

                // Actualizar contadores
                fetchResumen();

                setNotification({
                    open: true,
                    message: 'Imagen eliminada correctamente',
                    type: 'success'
                });
            }
        } catch (error) {
            console.error('Error al eliminar la imagen:', error);
            setNotification({
                open: true,
                message: 'Error al eliminar la imagen: ' + (error.response?.data?.message || error.message),
                type: 'error'
            });
        } finally {
            setIsDeleteDialogOpen(false);
            setSelectedImage(null);
        }
    };

    /**
     * Remueve la imagen asignada a un servicio
     * @param {Object} service - Servicio del que eliminar la imagen
     */
    const removeImageFromService = async (service) => {
        try {
            const response = await axios.delete(`https://back-end-4803.onrender.com/api/imagenes/remover/${service.id}`);

            if (response.data) {
                // Actualizar el estado local
                const updatedServices = services.map(s =>
                    s.id === service.id ? { ...s, image_url: null } : s
                );

                setServices(updatedServices);

                // Actualizar contadores
                fetchResumen();

                setNotification({
                    open: true,
                    message: `Imagen removida de ${service.title}`,
                    type: 'success'
                });
            }
        } catch (error) {
            console.error('Error al remover imagen:', error);
            setNotification({
                open: true,
                message: 'Error al remover la imagen: ' + (error.response?.data?.message || error.message),
                type: 'error'
            });
        }
    };

    // Filtrar servicios según el texto de búsqueda
    const filteredServices = services.filter(service =>
        service.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filtrar imágenes según el texto de búsqueda
    const filteredImages = images.filter(image =>
        image.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.public_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
    };

    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    bgcolor: darkMode ? 'background.paper' : '#fff',
                    borderRadius: 2
                }}
            >
                <Typography variant="h5" gutterBottom component="div" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Administrador de Imágenes
                </Typography>

                {/* Búsqueda */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Buscar por nombre..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={refreshAllData}
                            >
                                Actualizar
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<CloudUploadIcon />}
                                onClick={() => setTabValue(2)}
                            >
                                Subir Imágenes
                            </Button>
                        </Box>
                    </Grid>
                </Grid>

                {/* Resumen */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                        <Card variant="outlined" sx={{ bgcolor: darkMode ? 'background.paper' : '#f5f5f5' }}>
                            <CardContent>
                                <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                                    {resumen.total}
                                </Typography>
                                <Typography color="textSecondary">
                                    Servicios Totales
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card variant="outlined" sx={{ bgcolor: darkMode ? 'background.paper' : '#f0f7ff' }}>
                            <CardContent>
                                <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                                    {resumen.con_imagen}
                                </Typography>
                                <Typography color="textSecondary">
                                    Con Imágenes
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card variant="outlined" sx={{ bgcolor: darkMode ? 'background.paper' : '#fff4f4' }}>
                            <CardContent>
                                <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold', color: 'error.main' }}>
                                    {resumen.sin_imagen}
                                </Typography>
                                <Typography color="textSecondary">
                                    Sin Imágenes
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Pestañas */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="image management tabs"
                        variant="fullWidth"
                    >
                        <Tab label="Servicios" />
                        <Tab label="Imágenes" />
                        <Tab label="Subir Imágenes" />
                    </Tabs>
                </Box>

                {/* Panel de Servicios */}
                {tabValue === 0 && (
                    <Box>
                        {loadingServices ? (
                            <LinearProgress sx={{ my: 2 }} />
                        ) : (
                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Servicio</TableCell>
                                            <TableCell>Categoría</TableCell>
                                            <TableCell>Imagen</TableCell>
                                            <TableCell>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredServices.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">
                                                    <Typography variant="body2" sx={{ py: 2 }}>
                                                        No se encontraron servicios
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredServices.map((service) => (
                                                <TableRow key={service.id}>
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
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {service.image_url ? (
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <img
                                                                    src={service.image_url}
                                                                    alt={service.title}
                                                                    style={{
                                                                        width: '60px',
                                                                        height: '40px',
                                                                        objectFit: 'cover',
                                                                        borderRadius: '4px'
                                                                    }}
                                                                />
                                                                <CheckCircleIcon
                                                                    color="success"
                                                                    fontSize="small"
                                                                    sx={{ ml: 1 }}
                                                                />
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
                                                                        justifyContent: 'center'
                                                                    }}
                                                                >
                                                                    <ImageIcon color="disabled" />
                                                                </Box>
                                                                <CancelIcon
                                                                    color="error"
                                                                    fontSize="small"
                                                                    sx={{ ml: 1 }}
                                                                />
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
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                )}

                {/* Panel de Imágenes */}
                {tabValue === 1 && (
                    <Box>
                        {loadingImages ? (
                            <LinearProgress sx={{ my: 2 }} />
                        ) : (
                            <>
                                <Typography variant="subtitle1" gutterBottom>
                                    {images.length} imágenes disponibles
                                </Typography>
                                <Grid container spacing={2}>
                                    {filteredImages.length === 0 ? (
                                        <Grid item xs={12}>
                                            <Box sx={{
                                                p: 3,
                                                textAlign: 'center',
                                                border: '1px dashed',
                                                borderColor: 'divider',
                                                borderRadius: 1
                                            }}>
                                                <Typography>No se encontraron imágenes</Typography>
                                            </Box>
                                        </Grid>
                                    ) : (
                                        filteredImages.map((image) => (
                                            <Grid item xs={12} sm={6} md={3} key={image.id}>
                                                <Card variant="outlined">
                                                    <CardMedia
                                                        component="img"
                                                        height="140"
                                                        image={image.url}
                                                        alt={image.id}
                                                        sx={{ objectFit: 'cover' }}
                                                    />
                                                    <CardContent sx={{ p: 1.5, pb: 0 }}>
                                                        <Typography variant="caption" color="textSecondary" component="div">
                                                            ID: {image.id}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary" component="div">
                                                            Fecha: {image.created_at}
                                                        </Typography>
                                                    </CardContent>
                                                    <CardActions sx={{ p: 1 }}>
                                                        <Tooltip title="Ver imagen">
                                                            <IconButton size="small" onClick={() => window.open(image.url, '_blank')}>
                                                                <LinkIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Box sx={{ flexGrow: 1 }} />
                                                        <Button
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => {
                                                                // Si hay un servicio seleccionado, asignar imagen, de lo contrario
                                                                // preguntar al usuario qué servicio
                                                                if (selectedService) {
                                                                    assignImageToService(image);
                                                                } else {
                                                                    // Mostrar diálogo para seleccionar servicio
                                                                    setSelectedImage(image);
                                                                    setTabValue(0); // Cambiar a pestaña de servicios
                                                                    setSearchQuery(''); // Limpiar búsqueda
                                                                    setNotification({
                                                                        open: true,
                                                                        message: 'Seleccione un servicio para asignar esta imagen',
                                                                        type: 'info'
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            Asignar
                                                        </Button>
                                                        <Tooltip title="Eliminar imagen">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => openDeleteDialog(image)}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </CardActions>
                                                </Card>
                                            </Grid>
                                        ))
                                    )}
                                </Grid>
                            </>
                        )}
                    </Box>
                )}

                {/* Panel de Subida de Imágenes */}
                {tabValue === 2 && (
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>
                            Subir nuevas imágenes a la galería
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {/* Dropzone */}
                        <Box {...getRootProps()} style={dropzoneStyle}>
                            <input {...getInputProps()} />
                            <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            {isDragActive ? (
                                <Typography>Suelta tus imágenes aquí</Typography>
                            ) : (
                                <>
                                    <Typography>
                                        Arrastra y suelta imágenes aquí, o haz clic para seleccionarlas
                                    </Typography>
                                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                        Máximo 10MB por imagen
                                    </Typography>
                                </>
                            )}
                        </Box>

                        {/* Previsualización de archivos */}
                        {files.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Imágenes seleccionadas ({files.length})
                                </Typography>
                                <Grid container spacing={1} sx={{ mb: 2 }}>
                                    {files.map((file, index) => (
                                        <Grid item xs={6} sm={3} md={2} key={index}>
                                            <Box sx={{ position: 'relative' }}>
                                                <img
                                                    src={file.preview}
                                                    alt={`preview-${index}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '100px',
                                                        objectFit: 'cover',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: -8,
                                                        right: -8,
                                                        bgcolor: 'background.paper',
                                                        boxShadow: 1,
                                                        '&:hover': { bgcolor: 'error.light', color: 'white' }
                                                    }}
                                                    onClick={() => removeFile(index)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                                    onClick={uploadImages}
                                    disabled={files.length === 0 || uploading}
                                    sx={{ mt: 1 }}
                                >
                                    {uploading ? 'Subiendo...' : 'Subir imágenes'}
                                </Button>
                            </Box>
                        )}
                    </Box>
                )}
            </Paper>

            {/* Diálogo para asignar imagen */}
            <Dialog
                open={isAssignDialogOpen}
                onClose={() => setIsAssignDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Seleccionar imagen para: {selectedService?.title}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        {images.map((image) => (
                            <Grid item xs={6} sm={4} md={3} key={image.id}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            transform: 'scale(1.02)',
                                            boxShadow: 2
                                        }
                                    }}
                                    onClick={() => assignImageToService(image)}
                                >
                                    <CardMedia
                                        component="img"
                                        height="120"
                                        image={image.url}
                                        alt={image.id}
                                    />
                                    <CardContent sx={{ p: 1 }}>
                                        <Typography variant="caption" noWrap>
                                            {image.id}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
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
            >
                <DialogTitle>
                    Confirmar eliminación
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Está seguro que desea eliminar esta imagen? Esta acción no se puede deshacer.
                    </Typography>
                    {selectedImage && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <img
                                src={selectedImage.url}
                                alt="Preview"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '200px',
                                    borderRadius: '4px'
                                }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDeleteDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={deleteImage} color="error" variant="contained">
                        Eliminar
                    </Button>
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