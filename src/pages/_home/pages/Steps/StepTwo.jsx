import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Grid, 
    Paper, 
    Card, 
    CardContent, 
    CardMedia, 
    Button, 
    Chip, 
    Tooltip 
} from '@mui/material';
import {
    MedicalServices as MedicalServicesIcon,
    CheckCircle as CheckCircleIcon,
    Info as InfoIcon
} from '@mui/icons-material';

const StepTwo = ({
    colors,
    isDarkTheme,
    formData,
    onFormDataChange,
    onNext,
    onPrev,
    onStepCompletion,
    setNotification
}) => {
    const [selectedSpecialist, setSelectedSpecialist] = useState(formData.especialista || null);

    const specialists = [
        {
            id: 1,
            name: 'Dr. Juan Pérez',
            specialty: 'Cardiología',
            experience: 10,
            image: 'https://via.placeholder.com/300'
        },
        {
            id: 2,
            name: 'Dra. María López',
            specialty: 'Dermatología',
            experience: 8,
            image: 'https://via.placeholder.com/300'
        },
        {
            id: 3,
            name: 'Dr. Carlos Gómez',
            specialty: 'Pediatría',
            experience: 5,
            image: 'https://via.placeholder.com/300'
        }
    ];

    const handleSelectSpecialist = (specialist) => {
        setSelectedSpecialist(specialist);
        onFormDataChange({ especialista: specialist });
        onStepCompletion('step2', true);
    };

    const handleNext = () => {
        if (!selectedSpecialist) {
            setNotification({
                open: true,
                message: 'Por favor selecciona un especialista antes de continuar.',
                type: 'error'
            });
            onStepCompletion('step2', false);
            return;
        }
        onNext();
    };

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
                Selección de Especialista
            </Typography>

            <Grid container spacing={3}>
                {specialists.map((specialist) => (
                    <Grid item xs={12} sm={6} md={4} key={specialist.id}>
                        <Card 
                            elevation={4}
                            sx={{
                                borderRadius: 3,
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                border: selectedSpecialist?.id === specialist.id 
                                    ? `3px solid ${colors.primary}` 
                                    : '3px solid transparent',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                                }
                            }}
                            onClick={() => handleSelectSpecialist(specialist)}
                        >
                            <CardMedia
                                component="img"
                                height="180"
                                image={specialist.image}
                                alt={specialist.name}
                                sx={{ objectFit: 'cover' }}
                            />
                            <CardContent>
                                <Typography 
                                    variant="h6" 
                                    sx={{ color: colors.primary, fontWeight: 600 }}
                                >
                                    {specialist.name}
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    sx={{ color: colors.text, mb: 1 }}
                                >
                                    {specialist.specialty}
                                </Typography>
                                <Chip
                                    icon={<MedicalServicesIcon />}
                                    label={`${specialist.experience} años de experiencia`}
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={onPrev}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 'bold'
                    }}
                >
                    Atrás
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    disabled={!selectedSpecialist}
                    startIcon={<CheckCircleIcon />}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 'bold'
                    }}
                >
                    Continuar
                </Button>
            </Box>
        </Paper>
    );
};

export default StepTwo;
