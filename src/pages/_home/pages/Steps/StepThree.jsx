import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Button,
    Paper,
    CircularProgress,
    Card,
    CardContent,
    Tooltip
} from '@mui/material';
import {
    CalendarMonth as CalendarIcon,
    AccessTime as TimeIcon,
    CheckCircle as CheckCircleIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const StepThree = ({
    colors,
    isDarkTheme,
    selectedDate,
    selectedTime,
    onDateTimeChange,
    onNext,
    onPrev,
    onStepCompletion,
    setNotification
}) => {
    const [availableDates, setAvailableDates] = useState([]);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        // Simulación de carga de fechas disponibles
        setTimeout(() => {
            const dates = [];
            for (let i = 0; i < 15; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i);
                dates.push(date);
            }
            setAvailableDates(dates);

            setAvailableTimes([
                "09:00", "10:00", "11:00", "12:00",
                "13:00", "14:00", "15:00", "16:00",
                "17:00", "18:00", "19:00", "20:00"
            ]);

            setIsLoading(false);
        }, 1000);
    }, []);

    const handleSelectDate = (date) => {
        onDateTimeChange(date, selectedTime);
        onStepCompletion('step3', true);
    };

    const handleSelectTime = (time) => {
        onDateTimeChange(selectedDate, time);
        onStepCompletion('step3', true);
    };

    const handleNext = () => {
        if (!selectedDate || !selectedTime) {
            setNotification({
                open: true,
                message: 'Debes seleccionar una fecha y un horario antes de continuar.',
                type: 'error'
            });
            onStepCompletion('step3', false);
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
                Selecciona Fecha y Hora
            </Typography>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress color="primary" />
                </Box>
            ) : (
                <>
                    <Typography 
                        variant="h6" 
                        sx={{ mb: 2, color: colors.secondary }}
                    >
                        Fechas Disponibles
                    </Typography>
                    <Grid container spacing={2} mb={4}>
                        {availableDates.map((date) => (
                            <Grid item xs={6} sm={4} md={3} key={date.toISOString()}>
                                <Card
                                    elevation={selectedDate?.toDateString() === date.toDateString() ? 6 : 3}
                                    sx={{
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        border: selectedDate?.toDateString() === date.toDateString()
                                            ? `2px solid ${colors.primary}`
                                            : '2px solid transparent',
                                        '&:hover': {
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                            transform: 'translateY(-3px)'
                                        },
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleSelectDate(date)}
                                >
                                    <CardContent 
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            p: 2
                                        }}
                                    >
                                        <CalendarIcon sx={{ color: colors.accent, mb: 1 }} />
                                        <Typography 
                                            variant="body2" 
                                            sx={{ color: colors.text }}
                                        >
                                            {date.toLocaleDateString('es-ES', {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short'
                                            }).replace('.', '')}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Typography 
                        variant="h6" 
                        sx={{ mb: 2, color: colors.secondary }}
                    >
                        Horarios Disponibles
                    </Typography>
                    <Grid container spacing={2}>
                        {availableTimes.map((time) => (
                            <Grid item xs={6} sm={4} md={3} key={time}>
                                <Button
                                    fullWidth
                                    variant={selectedTime === time ? "contained" : "outlined"}
                                    color="primary"
                                    onClick={() => handleSelectTime(time)}
                                    startIcon={<TimeIcon />}
                                    sx={{
                                        textTransform: 'none',
                                        py: 1.5,
                                        fontWeight: 'bold',
                                        borderRadius: 2,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                            boxShadow: 1
                                        }
                                    }}
                                >
                                    {time}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={onPrev}
                            startIcon={<ArrowBackIcon />}
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
                            disabled={!selectedDate || !selectedTime}
                            startIcon={<CheckCircleIcon />}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 'bold'
                            }}
                        >
                            Continuar
                        </Button>
                    </Box>
                </>
            )}
        </Paper>
    );
};

export default StepThree;
