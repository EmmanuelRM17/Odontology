import React from 'react';
import { 
    Box, 
    Typography, 
    Grid, 
    Paper, 
    Card, 
    CardContent, 
    CardMedia, 
    Button,
    Chip
} from '@mui/material';
import {
    MedicalServices as MedicalServicesIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const StepTwo = ({
    colors,
    isDarkTheme,
    onNext,
    onPrev,
    onStepCompletion,
}) => {
    const specialist = {
        id: 1,
        name: 'Dr. Hugo Gómez Ramírez',
        specialty: 'Odontólogo',
        experience: 10,
        image: 'https://via.placeholder.com/300'
    };

    const handleNext = () => {
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
                Especialista
            </Typography>

            <Grid container justifyContent="center">
                <Grid item xs={12} sm={8} md={6}>
                    <Card 
                        elevation={4}
                        sx={{
                            borderRadius: 3,
                            overflow: 'hidden',
                            border: `2px solid ${colors.primary}`,
                            mb: 3
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
                                {specialist.specialty}
                            </Typography>
                            <Chip
                                icon={<MedicalServicesIcon />}
                                label={`${specialist.experience} años de experiencia`}
                                variant="outlined"
                                color="primary"
                                size="medium"
                                sx={{ mb: 1 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
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