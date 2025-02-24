import React, { useEffect, useState } from 'react';
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
    CircularProgress
} from '@mui/material';
import {
    MedicalServices as MedicalServicesIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';

import DEFAULT_IMAGE from "../../../../assets/iconos/Sin título.png"; // Imagen por defecto para odontólogos sin imagen

const StepTwo = ({
    colors,
    isDarkTheme,
    onNext,
    onPrev,
    onStepCompletion,
    onFormDataChange
}) => {
    const [odontologos, setOdontologos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSpecialist, setSelectedSpecialist] = useState(null);

    useEffect(() => {
        setIsLoading(true);

        axios.get('https://back-end-4803.onrender.com/api/empleados/odontologos/activos')
            .then((response) => {
                const filteredOdontologos = response.data
                    .filter(odontologo => odontologo.puesto === 'Odontólogo')
                    .map(odontologo => ({
                        id: odontologo.id,
                        name: `${odontologo.nombre} ${odontologo.aPaterno} ${odontologo.aMaterno}`,
                        email: odontologo.email,
                        image: odontologo.imagen || DEFAULT_IMAGE // Asigna la imagen por defecto si no hay una
                    }));
                setOdontologos(filteredOdontologos);
            })
            .catch((error) => {
                console.error('Error al obtener odontólogos:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const handleSelectSpecialist = (specialist) => {
        setSelectedSpecialist(specialist.id);
        onFormDataChange({ especialista: specialist.name, odontologo_id: specialist.id });
        onStepCompletion('step2', true);
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
                Selecciona un Especialista
            </Typography>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress color="primary" />
                </Box>
            ) : (
                <Grid container spacing={3} justifyContent="center">
                    {odontologos.map((specialist) => (
                        <Grid item xs={12} sm={6} md={4} key={specialist.id}>
                            <Card
                                elevation={4}
                                sx={{
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    border: selectedSpecialist === specialist.id
                                        ? `2px solid ${colors.primary}`
                                        : '1px solid transparent',
                                    mb: 3,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'scale(1.05)'
                                    }
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="250"
                                    image={specialist.image}
                                    alt={specialist.name}
                                    sx={{ objectFit: 'cover' }}
                                />
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        sx={{ color: colors.primary, fontWeight: 600, mb: 1 }}
                                    >
                                        {specialist.name}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{ color: colors.text, mb: 2 }}
                                    >
                                        Odontólogo
                                    </Typography>
                                    <Chip
                                        icon={<MedicalServicesIcon />}
                                        label="Especialista Activo"
                                        variant="outlined"
                                        color="primary"
                                        size="medium"
                                    />
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        onClick={() => handleSelectSpecialist(specialist)}
                                        startIcon={<CheckCircleIcon />}
                                        sx={{ mt: 2, textTransform: 'none', fontWeight: 'bold' }}
                                    >
                                        Seleccionar
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

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
                    onClick={onNext}
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
