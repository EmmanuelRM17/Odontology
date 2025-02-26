import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    Grid, FormControl, InputLabel, Select, MenuItem, Box, IconButton,
    Typography, Paper, Tooltip, Divider
} from '@mui/material';
import {
    Close, Add as AddIcon, Delete as DeleteIcon,
    InfoOutlined, AccessTime, AttachMoney, Category,
    Description, CheckCircle, List, HealthAndSafety,
    Save as SaveIcon,
    EventAvailable
} from '@mui/icons-material';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const NewService = ({ open, handleClose, onServiceCreated }) => {
    const { isDarkTheme } = useThemeContext();
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({ open: false, message: '', type: '' });

    const [newService, setNewService] = useState({
        title: '',
        description: '',
        category: '',
        durationMin: '',
        durationMax: '',
        price: '',
        benefits: [''],
        includes: [''],
        preparation: [''],
        aftercare: ['']
    });

    const handleNotificationClose = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    // Theme colors
    const colors = {
        primary: '#03427C',
        background: isDarkTheme ? '#1a1a1a' : '#ffffff',
        paperBg: isDarkTheme ? '#2d2d2d' : '#E5F3FD',
        paperBg2: isDarkTheme ? '#333333' : '#F9FDFF',
        text: isDarkTheme ? '#ffffff' : '#000000',
        error: '#ff3d00'
    };

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('https://back-end-4803.onrender.com/api/servicios/categorias');
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error('Error al obtener las categorías:', error);
                setNotification({
                    open: true,
                    message: 'Error al cargar las categorías',
                    type: 'error'
                });
            }
        };

        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewService(prev => ({ ...prev, [name]: value }));
        // Clear error when field is modified
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleArrayChange = (field, index, value) => {
        setNewService(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const handleAddItem = (field) => {
        setNewService(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
        setNotification({ open: true, message: `Agregado nuevo ${field}`, type: 'success' });
    };

    const handleRemoveItem = (field, index) => {
        setNewService(prev => {
            const newArray = [...prev[field]];
            newArray.splice(index, 1);
            return { ...prev, [field]: newArray };
        });
        setNotification({ open: true, message: `Eliminado ${field}`, type: 'info' });
    };

    const validateForm = () => {
        const newErrors = {};
        const regexNoSpecialChars = /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s.,()-]+$/; // Permite letras, números y algunos signos básicos

        // 🟢 Validaciones generales
        if (!newService.title?.trim()) {
            newErrors.title = 'El título es obligatorio.';
        } else if (newService.title.length < 5) {
            newErrors.title = 'El título debe tener al menos 5 caracteres.';
        } else if (!regexNoSpecialChars.test(newService.title)) {
            newErrors.title = 'El título contiene caracteres inválidos.';
        }

        if (!newService.description?.trim()) {
            newErrors.description = 'La descripción es obligatoria.';
        } else if (newService.description.length < 10) {
            newErrors.description = 'La descripción debe tener al menos 10 caracteres.';
        }

        if (!newService.category?.trim()) {
            newErrors.category = 'Debe seleccionar una categoría.';
        }

        if (!newService.durationMin || isNaN(newService.durationMin)) {
            newErrors.durationMin = 'Ingrese una duración mínima válida.';
        }

        if (!newService.durationMax || isNaN(newService.durationMax)) {
            newErrors.durationMax = 'Ingrese una duración máxima válida.';
        }

        if (parseInt(newService.durationMin) > parseInt(newService.durationMax)) {
            newErrors.durationMin = 'La duración mínima no puede ser mayor que la máxima.';
        }

        if (!newService.price || isNaN(newService.price) || newService.price <= 0) {
            newErrors.price = 'Ingrese un precio válido mayor a 0.';
        }

        // 🟢 Corrección de validación para arrays
        const detalleCampos = {
            benefits: "beneficio",
            includes: "incluye",
            preparation: "preparacion",
            aftercare: "cuidado"
        };

        Object.entries(detalleCampos).forEach(([campo, nombre]) => {
            if (!newService[campo]?.some(item => item.trim())) {
                newErrors[campo] = `Debe agregar al menos un ${nombre}.`;
            } else {
                newService[campo].forEach((item, index) => {
                    if (item.length < 5) {
                        newErrors[`${campo}-${index}`] = `${nombre} ${index + 1} debe tener al menos 5 caracteres.`;
                    } else if (!regexNoSpecialChars.test(item)) {
                        newErrors[`${campo}-${index}`] = `${nombre} ${index + 1} contiene caracteres inválidos.`;
                    }
                });
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async () => {
        console.log("🔍 Intentando guardar el servicio...");

        // ✅ Verificar si la validación pasa
        if (!validateForm()) {
            console.log("❌ Falló la validación, revisa los errores:", errors);
            return;
        }

        const formattedService = {
            ...newService,
            duration: `${newService.durationMin}-${newService.durationMax} minutos`,
            benefits: newService.benefits.filter(b => b.trim()),
            includes: newService.includes.filter(i => i.trim()),
            preparation: newService.preparation.filter(p => p.trim()),
            aftercare: newService.aftercare.filter(a => a.trim())
        };

        console.log("📤 Enviando servicio al backend:", formattedService);

        try {
            const response = await fetch('https://back-end-4803.onrender.com/api/servicios/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedService)
            });

            if (!response.ok) {
                let errorMessage = 'Error al crear el servicio';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (_) { }
                throw new Error(errorMessage);
            }

            const createdService = await response.json();
            console.log("✅ Servicio creado exitosamente:", createdService);

            setNotification({
                open: true,
                message: 'Servicio creado exitosamente',
                type: 'success'
            });

            // Reset form
            setNewService({
                title: '',
                description: '',
                category: '',
                durationMin: '',
                durationMax: '',
                price: '',
                benefits: [''],
                includes: [''],
                preparation: [''],
                aftercare: ['']
            });

            // Notificar al componente padre y cerrar el diálogo
            setTimeout(() => {
                onServiceCreated(createdService);
                handleClose();
            }, 1500);

        } catch (error) {
            console.error('❌ Error en el fetch:', error);
            setNotification({
                open: true,
                message: error.message.includes('Failed to fetch')
                    ? 'No hay conexión con el servidor'
                    : error.message,
                type: 'error'
            });
        }
    };


    useEffect(() => {
        if (notification.open) {
            const timer = setTimeout(() => {
                setNotification(prev => ({ ...prev, open: false }));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification.open]);

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                style: {
                    backgroundColor: colors.background
                }
            }}
        >
            <DialogTitle sx={{
                backgroundColor: colors.primary,
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HealthAndSafety />
                    <span>Nuevo Servicio</span>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                <Paper sx={{ p: 3, mb: 3, backgroundColor: colors.paperBg }}>
                    <Typography variant="h6" color={colors.primary} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Description />
                        Detalles del Servicio
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Nombre del Servicio"
                                name="title"
                                value={newService.title}
                                onChange={handleChange}
                                error={!!errors.title}
                                helperText={errors.title}
                                InputProps={{
                                    startAdornment: <InfoOutlined sx={{ color: 'action.active', mr: 1 }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Duración Mínima"
                                name="durationMin"
                                value={newService.durationMin}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    handleChange({ target: { name: 'durationMin', value } });
                                }}
                                error={!!errors.durationMin}
                                helperText={errors.durationMin}
                                InputProps={{
                                    startAdornment: <AccessTime sx={{ color: 'action.active', mr: 1 }} />,
                                    endAdornment: <Typography variant="caption">min</Typography>
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Duración Máxima"
                                name="durationMax"
                                value={newService.durationMax}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    handleChange({ target: { name: 'durationMax', value } });
                                }}
                                error={!!errors.durationMax}
                                helperText={errors.durationMax}
                                InputProps={{
                                    startAdornment: <AccessTime sx={{ color: 'action.active', mr: 1 }} />,
                                    endAdornment: <Typography variant="caption">min</Typography>
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Precio"
                                name="price"
                                type="number"
                                value={newService.price}
                                onChange={handleChange}
                                error={!!errors.price}
                                helperText={errors.price}
                                InputProps={{
                                    startAdornment: <AttachMoney sx={{ color: 'action.active', mr: 1 }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!errors.category}>
                                <InputLabel>Categoría</InputLabel>
                                <Select
                                    name="category"
                                    value={newService.category}
                                    onChange={handleChange}
                                >
                                    {categories.map((cat, index) => (
                                        <MenuItem key={index} value={cat}>
                                            {cat}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Descripción"
                                name="description"
                                value={newService.description}
                                onChange={handleChange}
                                error={!!errors.description}
                                helperText={errors.description}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                <Paper sx={{ p: 3, backgroundColor: colors.paperBg2 }}>
                    <Typography variant="h6" color={colors.primary} sx={{ mb: 2 }}>
                        Detalles Adicionales
                    </Typography>

                    {[
                        { field: 'benefits', label: 'Beneficios', icon: <CheckCircle /> },
                        { field: 'includes', label: 'Incluye', icon: <List /> },
                        { field: 'preparation', label: 'Preparación', icon: <AccessTime /> },
                        { field: 'aftercare', label: 'Cuidados Posteriores', icon: <EventAvailable /> }
                    ].map(({ field, label, icon }) => (
                        <Box key={field} sx={{ mb: 3 }}>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 2
                            }}>
                                <Typography variant="subtitle1" color={colors.primary} sx={{
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    {icon}
                                    {label}
                                </Typography>
                                <Tooltip title={`Agregar ${label}`}>
                                    <IconButton
                                        onClick={() => handleAddItem(field)}
                                        sx={{ color: colors.primary }}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {newService[field].map((item, index) => (
                                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                    <TextField
                                        fullWidth
                                        label={`${label} ${index + 1}`}
                                        value={item}
                                        onChange={(e) => handleArrayChange(field, index, e.target.value)}
                                        error={!!errors[field] && index === 0}
                                        helperText={index === 0 ? errors[field] : ''}
                                    />
                                    {newService[field].length > 1 && (
                                        <Tooltip title="Eliminar">
                                            <IconButton
                                                onClick={() => handleRemoveItem(field, index)}
                                                sx={{ color: colors.error }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    ))}
                </Paper>
            </DialogContent>

            <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={handleClose} sx={{ color: colors.primary }}>
                    Cancelar
                </Button>
                <Tooltip title="Guardar Servicio">
                    <IconButton
                        onClick={handleSubmit}
                        sx={{
                            backgroundColor: colors.primary,
                            color: '#fff',
                            '&:hover': {
                                backgroundColor: colors.primary,
                                opacity: 0.9
                            }
                        }}
                    >
                        <SaveIcon />
                    </IconButton>
                </Tooltip>
            </DialogActions>

            {/* Notificación */}
            <Notificaciones
                open={notification.open}
                message={notification.message}
                type={notification.type}
                onClose={handleNotificationClose}
            />
        </Dialog>
    );
};

export default NewService;
