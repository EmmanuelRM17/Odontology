import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    CircularProgress,
    Card,
    CardContent,
    Collapse,
    Divider
} from '@mui/material';
import {
    CalendarMonth as CalendarIcon,
    AccessTime as TimeIcon,
    CheckCircle as CheckCircleIcon,
    ArrowBack as ArrowBackIcon,
    Event as EventIcon,
    EventAvailable as EventAvailableIcon,
    EventBusy as EventBusyIcon
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
    setNotification,
    onFormDataChange
}) => {
    const [availableDates, setAvailableDates] = useState([]);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showTimes, setShowTimes] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            const dates = [];
            const currentDate = new Date();
            const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
                dates.push(new Date(d));
            }
            setAvailableDates(dates);

            setAvailableTimes([
                "10:00", "10:30", "11:00", "11:30", "12:00",
                "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"
            ]);

            setIsLoading(false);
        }, 1000);
    }, []);

    const handleSelectDate = (date) => {
        onDateTimeChange(date, null);
        setShowTimes(true);
        onFormDataChange({ fechaCita: date.toISOString().split('T')[0] });
    };

    const handleSelectTime = (time) => {
        onDateTimeChange(selectedDate, time);
        onFormDataChange({ horaCita: time });
    };

    const handleNext = () => {
        if (!selectedDate || !selectedTime) {
            setNotification({
                open: true,
                message: 'Por favor selecciona una fecha y horario para continuar.',
                type: 'error'
            });
            onStepCompletion('step3', false); 
            return;
        }
        onStepCompletion('step3', true); 
    };
    

    const isSameDate = (date1, date2) => {
        if (!(date1 instanceof Date) || !(date2 instanceof Date)) return false;
        return date1.toDateString() === date2.toDateString();
    };

    const isDateDisabled = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
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
                sx={{
                    mb: 3,
                    textAlign: 'center',
                    color: colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                }}
            >
                <EventIcon /> Selecciona la fecha
            </Typography>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress color="primary" />
                </Box>
            ) : (
                <>
                    <Card
                        elevation={4}
                        sx={{
                            borderRadius: 3,
                            overflow: 'hidden',
                            mb: 3
                        }}
                    >
                        <CardContent sx={{ p: 0 }}>
                            {/* Días de la semana */}
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(7, 1fr)',
                                    p: 2,
                                    backgroundColor: colors.primary,
                                    color: 'white'
                                }}
                            >
                                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                                    <Typography
                                        key={day}
                                        sx={{
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        {day}
                                    </Typography>
                                ))}
                            </Box>

                            {/* Calendario */}
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(7, 1fr)',
                                    gap: 1,
                                    p: 2
                                }}
                            >
                                {availableDates.map((date, index) => {
                                    const disabled = isDateDisabled(date);
                                    return (
                                        <Button
                                            key={date.toISOString()}
                                            onClick={() => !disabled && handleSelectDate(date)}
                                            disabled={disabled}
                                            sx={{
                                                minHeight: '80px',
                                                borderRadius: 2,
                                                border: isSameDate(selectedDate, date)
                                                    ? `2px solid ${colors.primary}`
                                                    : '1px solid transparent',
                                                backgroundColor: disabled
                                                    ? `rgba(0, 0, 0, 0.12)`
                                                    : isSameDate(selectedDate, date)
                                                        ? `${colors.primary}15`
                                                        : 'transparent',
                                                '&:hover': {
                                                    backgroundColor: disabled
                                                        ? `rgba(0, 0, 0, 0.12)`
                                                        : `${colors.primary}25`
                                                },
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 1
                                            }}
                                        >
                                            {disabled ? (
                                                <EventBusyIcon sx={{ color: 'text.disabled', fontSize: '1.5rem' }} />
                                            ) : (
                                                <EventAvailableIcon sx={{ color: colors.primary, fontSize: '1.5rem' }} />
                                            )}
                                            <Typography
                                                sx={{
                                                    fontSize: '1.2rem',
                                                    fontWeight: 'bold',
                                                    color: disabled ? 'text.disabled' : 'text.primary'
                                                }}
                                            >
                                                {date.getDate()}
                                            </Typography>
                                        </Button>
                                    )
                                })}
                            </Box>
                        </CardContent>
                    </Card>

                    <Collapse in={showTimes}>
                        <Divider sx={{ my: 3 }} />
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 2,
                                color: colors.secondary,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <TimeIcon /> Horas Disponibles
                        </Typography>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                gap: 2,
                                mb: 3
                            }}
                        >
                            {availableTimes.map((time) => (
                                <Button
                                    key={time}
                                    variant={selectedTime === time ? "contained" : "outlined"}
                                    color="primary"
                                    onClick={() => handleSelectTime(time)}
                                    sx={{
                                        py: 2,
                                        borderRadius: 2,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            transform: 'scale(1.05)'
                                        }
                                    }}
                                >
                                    {time}
                                </Button>
                            ))}
                        </Box>
                    </Collapse>

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