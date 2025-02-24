import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    CircularProgress,
    Collapse,
    Divider,
    Grid,
    TextField
} from '@mui/material';
import {
    Event as EventIcon,
    AccessTime as TimeIcon
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
    const [workDays, setWorkDays] = useState([]);

    useEffect(() => {
        if (!formData.odontologo_id) return;
        setIsLoading(true);

        axios.get(`https://back-end-4803.onrender.com/api/horarios/dias_laborales?odontologo_id=${formData.odontologo_id}`)
            .then((response) => {
                const daysMap = {
                    'Domingo': 0,
                    'Lunes': 1,
                    'Martes': 2,
                    'Miércoles': 3,
                    'Jueves': 4,
                    'Viernes': 5,
                    'Sábado': 6
                };
                const availableDays = response.data.map(day => daysMap[day]);
                setWorkDays(availableDays);
            })
            .catch(() => {
                setNotification({
                    open: true,
                    message: 'Error al obtener los días laborales del odontólogo.',
                    type: 'error',
                });
            })
            .finally(() => setIsLoading(false));
    }, [formData.odontologo_id]);

    const isWorkDay = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDay();
        return workDays.includes(day);
    };

    useEffect(() => {
        if (!selectedDate) return;

        setIsLoading(true);
        const odontologoId = formData.odontologo_id;

        axios.get(`https://back-end-4803.onrender.com/api/horarios/disponibilidad?odontologo_id=${odontologoId}&fecha=${selectedDate}`)
            .then((response) => {
                const times = [];
                response.data.forEach((item) => {
                    const startTime = new Date(`${selectedDate}T${item.hora_inicio}`);
                    const endTime = new Date(`${selectedDate}T${item.hora_fin}`);
                    const duracion = item.duracion || 30;

                    while (startTime < endTime) {
                        times.push(startTime.toTimeString().slice(0, 5));
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
            .finally(() => setIsLoading(false));
    }, [selectedDate, formData.odontologo_id]);

    const handleSelectDate = (e) => {
        const date = e.target.value;
        onDateTimeChange(date, null);
        setShowTimes(false);
        onFormDataChange({ fechaCita: date });
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

            <TextField
                type="date"
                label="Elige una fecha"
                value={selectedDate || ''}
                onChange={handleSelectDate}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{
                    min: new Date().toISOString().split('T')[0],
                }}
                sx={{ mb: 3 }}
                color="primary"
            />

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
                    <Grid container spacing={2}>
                        {availableTimes.length > 0 ? (
                            availableTimes.map((time) => (
                                <Grid item xs={6} sm={4} md={3} key={time}>
                                    <Button
                                        variant={selectedTime === time ? "contained" : "outlined"}
                                        color="primary"
                                        onClick={() => handleSelectTime(time)}
                                        fullWidth
                                    >
                                        {time}
                                    </Button>
                                </Grid>
                            ))
                        ) : (
                            <Typography color="error" sx={{ mx: 2 }}>
                                No hay horarios disponibles para esta fecha.
                            </Typography>
                        )}
                    </Grid>
                </Collapse>
            )}
        </Paper>
    );
};

export default StepThree;
