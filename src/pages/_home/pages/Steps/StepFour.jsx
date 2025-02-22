import React from 'react';
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
    Tooltip
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    CalendarMonth as CalendarIcon,
    AccessTime as TimeIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Home as HomeIcon,
    EventAvailable as EventAvailableIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const StepFour = ({
    colors,
    isDarkTheme,
    formData,
    selectedDate,
    selectedTime,
    onPrev,
    onStepCompletion,
    setNotification
}) => {
    const navigate = useNavigate();

    const handleConfirm = () => {
        setNotification({
            open: true,
            message: '¡Cita confirmada con éxito!',
            type: 'success'
        });
        onStepCompletion('step4', true);
    };

    const formattedDate = selectedDate?.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

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
                Confirmación de Cita
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
                                {formData.nombre} {formData.apellidos}
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
                                label={formData.correo}
                                color="primary"
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Chip
                                icon={<PhoneIcon />}
                                label={formData.telefono}
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
                                label={formattedDate || 'Fecha no seleccionada'}
                                color="primary"
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Chip
                                icon={<TimeIcon />}
                                label={selectedTime || 'Hora no seleccionada'}
                                color="primary"
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Chip
                                icon={<EventAvailableIcon />}
                                label={`Especialista: ${formData.especialista?.name || 'No seleccionado'}`}
                                color="primary"
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 1 }}
                            />
                        </Grid>
                    </Grid>
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
