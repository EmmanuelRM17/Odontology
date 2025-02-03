import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Grid,
    Container,
    Typography,
    Box,
    Avatar,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Modal,
    Tooltip,
    Fade,
    useTheme,
    useMediaQuery,
    Skeleton} from '@mui/material';
import {
    Save as SaveIcon,
    Edit as EditIcon,
    Close as CloseIcon,
    PhotoCamera as PhotoCameraIcon} from '@mui/icons-material';
import axios from 'axios';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { Link } from 'react-router-dom';
import RedesSociales from './politicas/RedesSociales';

const PerfilEmpresa = () => {
    const [formData, setFormData] = useState({
        id_empresa: '',
        nombre_empresa: '',
        direccion: '',
        telefono: '',
        correo_electronico: '',
        descripcion: '',
        logo: null,
        slogan: ''
    });
    const [logoPreview, setLogoPreview] = useState('');
    const [originalLogo, setOriginalLogo] = useState(''); // Para guardar el logo original
    const [isEditingDatos, setIsEditingDatos] = useState(false);
    const [isEditingLogo, setIsEditingLogo] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [logoChanged, setLogoChanged] = useState(false);
    const [errorMessages, setErrorMessages] = useState({});
    const [dataFetched, setDataFetched] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        type: 'success',
    });
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [openImageModal, setOpenImageModal] = useState(false); // Para controlar el modal de la imagen
    const [isDarkTheme, setIsDarkTheme] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [previewChanges, setPreviewChanges] = useState(false);
    const [logoHistory, setLogoHistory] = useState([]);
    const theme = useTheme();

    // Efecto para detectar tema oscuro
    useEffect(() => {
        const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkTheme(matchDarkTheme.matches);

        const handleThemeChange = (e) => {
            setIsDarkTheme(e.matches);
        };

        matchDarkTheme.addEventListener('change', handleThemeChange);
        return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
    }, []);

    // Definición mejorada de colores para mejor contraste
    const colors = {
        background: isDarkTheme ? '#263749' : 'rgba(173, 216, 230, 0.2)',
        paper: isDarkTheme ? '#243447' : '#ffffff',
        text: isDarkTheme ? '#FFFFFF' : '#333333',             // Blanco puro para modo oscuro
        secondaryText: isDarkTheme ? '#E8F1FF' : '#666666',    // Gris más claro para modo oscuro
        inputText: isDarkTheme ? '#FFFFFF' : '#333333',        // Texto blanco en inputs
        inputLabel: isDarkTheme ? '#E8F1FF' : '#666666',       // Labels más claros
        inputBorder: isDarkTheme ? '#4B9FFF' : '#e0e0e0',
        primary: isDarkTheme ? '#4B9FFF' : '#1976d2',
        inputBackground: isDarkTheme ? '#1B2A3A' : '#ffffff',  // Fondo más oscuro para inputs
        disabledBackground: isDarkTheme ? '#243447' : '#f5f5f5',
        disabledText: isDarkTheme ? '#B8C7D9' : '#9e9e9e'
    };
    
    // Estilos mejorados para los inputs
    const inputStyles = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: colors.inputBackground,
            color: colors.inputText, // Color directo del texto
            '& fieldset': {
                borderColor: colors.inputBorder,
                borderWidth: isDarkTheme ? '2px' : '1px',
            },
            '&:hover fieldset': {
                borderColor: colors.primary,
            },
            '&.Mui-focused fieldset': {
                borderColor: colors.primary,
            },
            '& input': {
                color: colors.inputText,
                '&::placeholder': {
                    color: colors.secondaryText,
                    opacity: 1
                }
            },
            '& textarea': {
                color: colors.inputText,
            }
        },
        '& .MuiInputLabel-root': {
            color: colors.inputLabel,
            '&.Mui-focused': {
                color: colors.primary
            }
        },
        '& .MuiFormHelperText-root': {
            color: isDarkTheme ? '#FF9999' : '#f44336',
            opacity: 1
        },
        '&.Mui-disabled': {
            '& .MuiInputBase-input': {
                color: colors.disabledText,
                '-webkit-text-fill-color': colors.disabledText,
            },
            '& .MuiInputLabel-root': {
                color: colors.disabledText,
            },
            backgroundColor: 'transparent'
        }
    };

    useEffect(() => {
        const fetchPerfilEmpresa = async () => {
            try {
                setIsLoading(true); // Establecer loading al inicio
                const response = await axios.get('https://back-end-4803.onrender.com/api/perfilEmpresa/get');
                const { id_empresa, nombre_empresa, direccion, telefono, correo_electronico, descripcion, logo, slogan } = response.data;

                if (id_empresa) {
                    setFormData({
                        id_empresa,
                        nombre_empresa,
                        direccion,
                        telefono,
                        correo_electronico,
                        descripcion,
                        slogan
                    });
                    setDataFetched(true);
                } else {
                    setDataFetched(false);
                    mostrarNotificacion('No hay información para actualizar, suba su información', 'error');
                }

                if (logo) {
                    // Verificar si el logo ya incluye el prefijo data:image
                    const logoBase64 = logo.startsWith('data:image')
                        ? logo
                        : `data:image/png;base64,${logo}`;

                    console.log('Logo cargado:', logoBase64.substring(0, 50) + '...'); // Para debugging
                    setLogoPreview(logoBase64);
                    setOriginalLogo(logoBase64);
                }
            } catch (error) {
                console.error('Error al cargar el perfil:', error);
                mostrarNotificacion('Error al obtener el perfil de la empresa', 'error');
            } finally {
                setIsLoading(false); // Asegurarnos de que isLoading se establezca en false
            }
        };

        fetchPerfilEmpresa();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        setHasChanges(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (allowedTypes.includes(file.type)) {
                setFormData({
                    ...formData,
                    logo: file,
                });
                const objectUrl = URL.createObjectURL(file);
                setLogoPreview(objectUrl);
                setLogoChanged(true);
            } else {
                mostrarNotificacion('Por favor, sube una imagen válida (PNG o JPEG)', 'error');
            }
        }
    };

    const handleCancelLogo = () => {
        setOpenConfirmDialog(true); // Abre el diálogo de confirmación
    };

    const handleCancelDatos = () => {
        // Restaura los datos originales cargados desde el backend
        const originalData = {
            id_empresa: formData.id_empresa,
            nombre_empresa: formData.nombre_empresa,
            direccion: formData.direccion,
            telefono: formData.telefono,
            correo_electronico: formData.correo_electronico,
            descripcion: formData.descripcion,
            slogan: formData.slogan,
        };

        setFormData(originalData); // Restablece los datos originales
        setHasChanges(false); // Marca que no hay cambios pendientes
        setIsEditingDatos(false); // Cierra el modo de edición
    };

    const handleConfirmCancelLogo = () => {
        setLogoPreview(originalLogo); // Restaura el logo original
        setFormData({ ...formData, logo: null }); // Elimina el archivo cargado
        setLogoChanged(false); // Marca que no hay cambios en el logo
        setOpenConfirmDialog(false); // Cierra el diálogo
    };

    const validateForm = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10,15}$/;

        if (!formData.nombre_empresa) errors.nombre_empresa = "El nombre de la empresa es obligatorio.";
        if (!formData.direccion) errors.direccion = "La dirección es obligatoria.";
        if (!formData.telefono || !phoneRegex.test(formData.telefono)) errors.telefono = "El teléfono es inválido.";
        if (!formData.correo_electronico || !emailRegex.test(formData.correo_electronico)) errors.correo_electronico = "El correo electrónico es inválido.";
        if (!formData.descripcion) errors.descripcion = "La descripción es obligatoria.";
        if (!formData.slogan) errors.slogan = "El slogan es obligatorio.";

        setErrorMessages(errors);
        return Object.keys(errors).length === 0;
    };

    const mostrarNotificacion = (mensaje, tipo) => {
        setNotification({
            open: true,
            message: mensaje,
            type: tipo,
        });
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    const handleSaveLogo = async () => {
        const formDataToSend = new FormData();
        formDataToSend.append('id_empresa', formData.id_empresa);
        formDataToSend.append('logo', formData.logo);

        try {
            const response = await axios.put('https://back-end-4803.onrender.com/api/perfilEmpresa/updateLogo', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                mostrarNotificacion('Logo actualizado con éxito', 'success');
                setLogoChanged(false);
                setIsEditingLogo(false);
                setOriginalLogo(logoPreview); // Actualiza el logo original con el nuevo
            } else {
                mostrarNotificacion('Error al actualizar el logo', 'error');
            }
        } catch (error) {
            mostrarNotificacion('Error al actualizar el logo', 'error');
        }
    };
    const handleSaveDatos = async (e) => {
        e.preventDefault();
        if (!dataFetched) {
            mostrarNotificacion('No hay información para actualizar', 'error');
            return;
        }

        if (!validateForm()) return;

        const formDataToSend = {
            id_empresa: formData.id_empresa,
            nombre_empresa: formData.nombre_empresa,
            direccion: formData.direccion,
            telefono: formData.telefono,
            correo_electronico: formData.correo_electronico,
            descripcion: formData.descripcion,
            slogan: formData.slogan,
        };

        try {
            const response = await axios.put('https://back-end-4803.onrender.com/api/perfilEmpresa/updateDatos', formDataToSend);

            if (response.status === 200) {
                mostrarNotificacion('Datos actualizados con éxito', 'success');
                setHasChanges(false);
                setIsEditingDatos(false);
            } else {
                mostrarNotificacion('Error al actualizar los datos', 'error');
            }
        } catch (error) {
            mostrarNotificacion('Error al actualizar los datos', 'error');
        }
    };

    const handleOpenImageModal = () => {
        setOpenImageModal(true); // Abre el modal de la imagen
    };

    const handleCloseImageModal = () => {
        setOpenImageModal(false); // Cierra el modal de la imagen
    };

    // Componente para el visor de imagen mejorado

    return (
        <Box sx={{
            p: { xs: 2, sm: 4 },
            minHeight: '100vh',
            backgroundColor: isDarkTheme ? colors.background : 'rgba(173, 216, 230, 0.2)',
            position: 'relative',
            transition: 'all 0.3s ease'
        }}>
            <Container maxWidth="md">

                <Box sx={{
                    mt: 6,
                    backgroundColor: isDarkTheme ? colors.paper : '#fff',
                    padding: { xs: 2, sm: 4 },
                    borderRadius: '16px',
                    boxShadow: isDarkTheme ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease'
                }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography
                            variant="h4"
                            gutterBottom
                            sx={{
                                color: colors.text,
                                fontSize: { xs: '1.5rem', sm: '2rem' },
                                fontWeight: 600,
                                mb: 3
                            }}
                        >
                            Perfil de la Empresa
                        </Typography>

                        {isLoading ? (
                            <Skeleton
                                variant="circular"
                                width={100}
                                height={100}
                                sx={{ margin: '0 auto' }}
                            />
                        ) : logoPreview ? (
                            <Tooltip title="Click para ampliar" arrow>
                                <Avatar
                                    src={logoPreview}
                                    alt="Logo de la empresa"
                                    onClick={handleOpenImageModal}
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        margin: '0 auto',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        backgroundColor: isDarkTheme ? '#1B2A3A' : '#ffffff',
                                        boxShadow: isDarkTheme ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 8px rgba(0,0,0,0.2)',
                                        cursor: 'pointer',
                                        border: `2px solid ${colors.primary}`,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                            boxShadow: isDarkTheme ? '0 6px 16px rgba(0,0,0,0.4)' : '0 6px 16px rgba(0,0,0,0.2)',
                                        }
                                    }}
                                />
                            </Tooltip>
                        ) : (
                            <Avatar
                                sx={{
                                    width: 100,
                                    height: 100,
                                    margin: '0 auto',
                                    backgroundColor: isDarkTheme ? '#1B2A3A' : '#ffffff',
                                    border: `2px solid ${colors.primary}`,
                                }}
                            >
                                <PhotoCameraIcon />
                            </Avatar>
                        )}
                        <IconButton
                            color="primary"
                            component="label"
                            sx={{
                                mt: 2,
                                backgroundColor: colors.hover,
                                '&:hover': {
                                    backgroundColor: colors.hover,
                                    transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => setIsEditingLogo(true)}
                        >
                            <PhotoCameraIcon />
                            <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                        </IconButton>

                        {logoChanged && (
                            <Fade in={true}>
                                <Box sx={{
                                    textAlign: 'center',
                                    mt: 2,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 2
                                }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<CloseIcon />}
                                        onClick={handleCancelLogo}
                                        sx={{
                                            color: colors.text,
                                            borderColor: colors.border,
                                            '&:hover': {
                                                borderColor: colors.primary,
                                                backgroundColor: colors.hover
                                            }
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        onClick={handleSaveLogo}
                                        sx={{
                                            backgroundColor: colors.primary,
                                            '&:hover': {
                                                backgroundColor: isDarkTheme ? '#5BABFF' : '#1565c0'
                                            }
                                        }}
                                    >
                                        Guardar
                                    </Button>
                                </Box>
                            </Fade>
                        )}
                    </Box>
                    <Modal
                        open={openImageModal}
                        onClose={handleCloseImageModal}
                        closeAfterTransition
                        BackdropProps={{
                            timeout: 500,
                            style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' } // Fondo más oscuro para mejor contraste
                        }}
                    >
                        <Fade in={openImageModal}>
                            <Box sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '90%',
                                maxWidth: '600px',
                                bgcolor: colors.paper,
                                boxShadow: isDarkTheme ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)',
                                p: 4,
                                borderRadius: '16px',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}>
                                <IconButton
                                    onClick={handleCloseImageModal}
                                    sx={{
                                        position: 'absolute',
                                        right: 8,
                                        top: 8,
                                        color: colors.text,
                                        backgroundColor: 'rgba(0,0,0,0.1)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0,0,0,0.2)'
                                        }
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                                <Box
                                    component="img"
                                    src={logoPreview}
                                    alt="Logo ampliado"
                                    sx={{
                                        maxWidth: '100%',
                                        maxHeight: '60vh',
                                        objectFit: 'contain',
                                        borderRadius: '8px',
                                        mt: 2,
                                        backgroundColor: isDarkTheme ? '#1B2A3A' : '#ffffff',
                                        border: `1px solid ${colors.border}`
                                    }}
                                />
                                <Typography
                                    variant="caption"
                                    sx={{
                                        mt: 2,
                                        color: colors.secondaryText
                                    }}
                                >
                                    Click fuera de la imagen para cerrar
                                </Typography>
                            </Box>
                        </Fade>
                    </Modal>
                    <form onSubmit={handleSaveDatos}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nombre de la Empresa"
                                    name="nombre_empresa"
                                    value={formData.nombre_empresa}
                                    onChange={handleInputChange}
                                    disabled={!isEditingDatos}
                                    error={!!errorMessages.nombre_empresa}
                                    helperText={errorMessages.nombre_empresa}
                                    sx={inputStyles}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Dirección"
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleInputChange}
                                    disabled={!isEditingDatos}
                                    error={!!errorMessages.direccion}
                                    helperText={errorMessages.direccion}
                                    sx={inputStyles}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Teléfono"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleInputChange}
                                    disabled={!isEditingDatos}
                                    error={!!errorMessages.telefono}
                                    helperText={errorMessages.telefono}
                                    sx={inputStyles}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Correo Electrónico"
                                    type="email"
                                    name="correo_electronico"
                                    value={formData.correo_electronico}
                                    onChange={handleInputChange}
                                    required
                                    disabled={!isEditingDatos}
                                    error={!!errorMessages.correo_electronico}
                                    helperText={errorMessages.correo_electronico}
                                    sx={inputStyles}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Descripción"
                                    name="descripcion"
                                    multiline
                                    rows={4}
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    disabled={!isEditingDatos}
                                    error={!!errorMessages.descripcion}
                                    helperText={errorMessages.descripcion}
                                    sx={inputStyles}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Slogan"
                                    name="slogan"
                                    value={formData.slogan}
                                    onChange={handleInputChange}
                                    disabled={!isEditingDatos}
                                    error={!!errorMessages.slogan}
                                    helperText={errorMessages.slogan}
                                    sx={inputStyles}
                                />
                            </Grid>

                            <Grid item xs={12} sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 2,
                                mt: 3
                            }}>
                                {!isEditingDatos ? (
                                    <Button
                                        variant="outlined"
                                        startIcon={<EditIcon />}
                                        onClick={() => setIsEditingDatos(true)}
                                        sx={{
                                            color: colors.primary,
                                            borderColor: colors.primary,
                                            '&:hover': {
                                                borderColor: colors.primary,
                                                backgroundColor: colors.hover
                                            }
                                        }}
                                    >
                                        Editar
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="outlined"
                                            startIcon={<CloseIcon />}
                                            onClick={handleCancelDatos}
                                            sx={{
                                                color: colors.text,
                                                borderColor: colors.border,
                                                '&:hover': {
                                                    borderColor: colors.primary,
                                                    backgroundColor: colors.hover
                                                }
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            variant="contained"
                                            startIcon={<SaveIcon />}
                                            onClick={handleSaveDatos}
                                            disabled={!hasChanges}
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
                                            Guardar
                                        </Button>
                                    </>
                                )}
                            </Grid>
                        </Grid>
                    </form>
                </Box>

                <RedesSociales />
            </Container>

            <Notificaciones
                open={notification.open}
                message={notification.message}
                type={notification.type}
                handleClose={handleCloseNotification}
            />

            <Dialog
                open={openConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: colors.paper,
                        color: colors.text
                    }
                }}
            >
                <DialogTitle sx={{ color: colors.text }}>
                    {"Confirmar cancelación"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: colors.secondaryText }}>
                        ¿Deseas deshacer los cambios realizados en el logo?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenConfirmDialog(false)}
                        sx={{ color: colors.primary }}
                    >
                        No
                    </Button>
                    <Button
                        onClick={handleConfirmCancelLogo}
                        autoFocus
                        sx={{ color: colors.primary }}
                    >
                        Sí
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PerfilEmpresa;
