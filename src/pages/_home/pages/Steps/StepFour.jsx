import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Grid,
    Chip,
    Card,
    CardContent,
    Avatar,
    Divider,
    Tooltip,
    CircularProgress
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    CalendarMonth as CalendarIcon,
    AccessTime as TimeIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Home as HomeIcon,
    EventAvailable as EventAvailableIcon,
    MedicalServices as MedicalServicesIcon,
    Place as PlaceIcon,
    MonetizationOn as PriceIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StepFour = ({
    colors,
    isDarkTheme,
    formData,
    onPrev,
    onStepCompletion,
    setNotification
}) => {
    const navigate = useNavigate();
    const [serviceDetails, setServiceDetails] = useState(null);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const fetchServiceDetails = async () => {
            if (!formData.servicio) {
                console.warn('No se ha seleccionado ningún servicio.');
                return;
            }

            setLoading(true);
            try {
                const response = await axios.get('https://back-end-4803.onrender.com/api/servicios/all');
                const selectedService = response.data.find(
                    service => service.title?.toLowerCase() === formData.servicio?.toLowerCase()
                );

                if (!selectedService) {
                    console.warn('El servicio seleccionado no se encuentra en la base de datos.');
                    setNotification({
                        open: true,
                        message: 'Servicio no encontrado en la base de datos',
                        type: 'warning'
                    });
                }

                setServiceDetails(selectedService);
            } catch (error) {
                console.error('Error al cargar los detalles del servicio:', error);
                setNotification({
                    open: true,
                    message: 'Error al cargar los detalles del servicio',
                    type: 'error'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchServiceDetails();
    }, [formData.servicio]);

    const handleConfirm = async () => {
        if (!formData.nombre || !formData.apellidoPaterno || !formData.fechaCita || !formData.horaCita) {
            setNotification({
                open: true,
                message: 'Faltan datos obligatorios para confirmar la cita.',
                type: 'warning'
            });
            return;
        }
    
        try {
            setLoading(true);
    
            const citaData = {
                paciente_id: formData.paciente_id ? parseInt(formData.paciente_id) : null, 
                nombre: formData.nombre,
                apellido_paterno: formData.apellidoPaterno,
                apellido_materno: formData.apellidoMaterno,
                genero: formData.genero,
                fecha_nacimiento: formData.fechaNacimiento,
                correo: formData.correo || '',
                telefono: formData.telefono || '',
                odontologo_id: formData.odontologo_id || null,
                odontologo_nombre: formData.especialista,
                servicio_id: formData.servicio_id || null,
                servicio_nombre: formData.servicio,
                categoria_servicio: serviceDetails?.category || 'No especificado',
                precio_servicio: serviceDetails?.price || 0.00,
                fecha_hora: `${formData.fechaCita}T${formData.horaCita}`,
                estado: 'Pendiente',
                notas: formData.notas || '',
                horario_id: formData.horario_id || null
            };
    
            console.log('Datos enviados para la cita:', citaData);
    
            const response = await axios.post('https://back-end-4803.onrender.com/api/citas/nueva', citaData);
    
            if (response.status === 201) {
                setNotification({
                    open: true,
                    message: '¡Cita guardada exitosamente!',
                    type: 'success'
                });
    
                setTimeout(() => {
                    setNotification({ open: false, message: '', type: '' });
                }, 3000);
    
                onStepCompletion('step4', true);
                navigate('/confirmacion');
            }
        } catch (error) {
            console.error('Error al guardar la cita:', error);
            setNotification({
                open: true,
                message: 'Error al guardar la cita. Inténtalo de nuevo.',
                type: 'error'
            });
            setTimeout(() => {
                setNotification({ open: false, message: '', type: '' });
            }, 3000);
        } finally {
            setLoading(false);
        }
    };    
    
    const formattedDate = formData.fechaCita
        ? new Date(formData.fechaCita).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
        : 'Fecha no seleccionada';

    const formattedTime = formData.horaCita || 'Hora no seleccionada';
    const formattedEmail = formData.correo || 'No proporcionado';
    const formattedPhone = formData.telefono || 'No proporcionado';
    const formattedService = formData.servicio || 'No especificado';

    return (
        <Paper
            elevation={3}
            sx={{
                p: 4,
                backgroundColor: colors.cardBg,
                borderRadius: 3,
                boxShadow: isDarkTheme
                    ? '0 4px 20px rgba(0,0,0,0.3)'
                    : '0 4px 20px rgba(0,0,0,0.1)'
            }}
        >
            <Typography
                variant="h5"
                sx={{ mb: 3, textAlign: 'center', color: colors.primary }}
            >
                Detalles de la Cita
            </Typography>

            <Card
                elevation={6}
                sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `2px solid ${colors.primary}`,
                    mb: 4
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar
                            sx={{
                                bgcolor: colors.accent,
                                width: 60,
                                height: 60,
                                mr: 2
                            }}
                        >
                            <PersonIcon sx={{ fontSize: 32, color: '#ffffff' }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>
                                {formData.nombre} {formData.apellidoPaterno} {formData.apellidoMaterno}
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.secondary }}>
                                {formData.genero}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2} mb={2}>
                        <Grid item xs={12} sm={6}>
                            <Chip
                                icon={<EmailIcon />}
                                label={formattedEmail}
                                color="primary"
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Chip
                                icon={<PhoneIcon />}
                                label={formattedPhone}
                                color="primary"
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 1 }}
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" sx={{ mb: 2, color: colors.secondary }}>
                        Detalles de la Cita
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Chip
                                icon={<CalendarIcon />}
                                label={formattedDate}
                                color="primary"
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Chip
                                icon={<TimeIcon />}
                                label={formattedTime}
                                color="primary"
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Chip
                                icon={<EventAvailableIcon />}
                                label={`Especialista: ${formData.especialista || 'No seleccionado'}`}
                                color="primary"
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 1 }}
                            />
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" sx={{ mb: 2, color: colors.secondary }}>
                        Detalles del Servicio
                    </Typography>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        serviceDetails ? (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Chip
                                        icon={<MedicalServicesIcon />}
                                        label={`Servicio: ${serviceDetails.title}`}
                                        color="primary"
                                        variant="outlined"
                                        fullWidth
                                        sx={{ mb: 1 }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Chip
                                        icon={<CategoryIcon />}
                                        label={`Categoría: ${serviceDetails.category || 'Sin categoría'}`}
                                        color="primary"
                                        variant="outlined"
                                        fullWidth
                                        sx={{ mb: 1 }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Chip
                                        icon={<PriceIcon />}
                                        label={`Precio: $${serviceDetails.price || 'N/A'}`}
                                        color="primary"
                                        variant="outlined"
                                        fullWidth
                                        sx={{ mb: 1 }}
                                    />
                                </Grid>
                            </Grid>
                        ) : (
                            <Typography variant="body1" color="error" sx={{ mt: 2 }}>
                                No se encontraron detalles del servicio.
                            </Typography>
                        )
                    )}

                </CardContent>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={onPrev}
                    startIcon={<HomeIcon />}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 'bold'
                    }}
                >
                    Atrás
                </Button>
                <Tooltip title="Confirmar cita" placement="top">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleConfirm}
                        startIcon={<CheckCircleIcon />}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        Confirmar Cita
                    </Button>
                </Tooltip>
            </Box>
        </Paper>
    );
};

export default StepFour;
