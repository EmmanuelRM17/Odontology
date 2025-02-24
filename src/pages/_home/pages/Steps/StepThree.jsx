import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    CircularProgress,
    Collapse,
    Divider
} from '@mui/material';
import {
    Event as EventIcon,
    Time as TimeIcon,
    EventAvailable as EventAvailableIcon,
    EventBusy as EventBusyIcon
} from '@mui/icons-material';
import axios from 'axios';

const StepThree = ({
    colors,
    selectedDate,
    selectedTime,
    onDateTimeChange,
    setNotification,
    onFormDataChange,
    formData
}) => {
    const [availableTimes, setAvailableTimes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showTimes, setShowTimes] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const odontologoId = formData.odontologo_id;
        const formattedDate = selectedDate?.toISOString().split('T')[0];

        if (!odontologoId || !formattedDate) {
            setIsLoading(false);
            return;
        }

        // Llamada al endpoint de disponibilidad con la duración de cada cita
        axios.get(`https://back-end-4803.onrender.com/api/horarios/disponibilidad?odontologo_id=${odontologoId}&fecha=${formattedDate}`)
            .then((response) => {
                const times = [];
                response.data.forEach((item) => {
                    const startTime = new Date(`${formattedDate}T${item.hora_inicio}`);
                    const endTime = new Date(`${formattedDate}T${item.hora_fin}`);
                    const duracion = item.duracion || 30; // Duración predeterminada de 30 minutos
                    while (startTime < endTime) {
                        times.push(startTime.toTimeString().slice(0, 5)); // Formato HH:mm
                        startTime.setMinutes(startTime.getMinutes() + duracion);
                    }
                });
                setAvailableTimes(times);
                setShowTimes(true);
            })
            .catch(() => {
                setNotification({
                    open: true,
                    message: 'Error al obtener los horarios disponibles.',
                    type: 'error',
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [selectedDate, formData.odontologo_id]);

    const handleSelectDate = (date) => {
        onDateTimeChange(date, null);
        setShowTimes(true);
        onFormDataChange({ fechaCita: date.toISOString().split('T')[0] });
    };

    const handleSelectTime = (time) => {
        onDateTimeChange(selectedDate, time);
        onFormDataChange({ horaCita: time });
    };

    return (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, backgroundColor: colors.cardBg }}>
            <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, color: colors.primary }}>
                <EventIcon /> Selecciona la fecha
            </Typography>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress color="primary" />
                </Box>
            ) : (
                <Collapse in={showTimes}>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" sx={{ color: colors.secondary, mb: 2 }}>
                        <TimeIcon /> Horas Disponibles
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 2 }}>
                        {availableTimes.map((time) => (
                            <Button
                                key={time}
                                variant={selectedTime === time ? "contained" : "outlined"}
                                color="primary"
                                onClick={() => handleSelectTime(time)}
                            >
                                {time}
                            </Button>
                        ))}
                    </Box>
                </Collapse>
            )}
        </Paper>
    );
};

export default StepThree;
