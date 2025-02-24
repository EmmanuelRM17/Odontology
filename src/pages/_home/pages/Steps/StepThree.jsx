import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    Alert
} from '@mui/material';
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    AccessTime as TimeIcon,
    Event as EventIcon,
    EditCalendar as EditCalendarIcon,
    CalendarMonth as CalendarMonthIcon,
    Schedule as ScheduleIcon,
    ArrowForward as ArrowForwardIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';

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
    onFormDataChange,
    formData
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [availableTimes, setAvailableTimes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [workDays, setWorkDays] = useState([]);
    const [showTimeDialog, setShowTimeDialog] = useState(false);
    const [selectedDateForTimes, setSelectedDateForTimes] = useState(null);

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

    const fetchAvailableTimes = (date) => {
        if (!(date instanceof Date) || isNaN(date)) {
            console.error('Fecha no válida para obtener horarios:', date);
            return;
        }

        const formattedDate = date.toISOString().split('T')[0];
        setIsLoading(true);

        axios.get(`https://back-end-4803.onrender.com/api/horarios/disponibilidad?odontologo_id=${formData.odontologo_id}&fecha=${formattedDate}`)
            .then((response) => {
                const times = [];
                response.data.forEach((item) => {
                    const startTime = new Date(`${formattedDate}T${item.hora_inicio}`);
                    const endTime = new Date(`${formattedDate}T${item.hora_fin}`);
                    const duracion = item.duracion || 30;

                    while (startTime < endTime) {
                        times.push(startTime.toTimeString().slice(0, 5));
                        startTime.setMinutes(startTime.getMinutes() + duracion);
                    }
                });
                setAvailableTimes(times);
            })
            .catch(() => {
                setNotification({
                    open: true,
                    message: 'Error al obtener los horarios disponibles.',
                    type: 'error',
                });
            })
            .finally(() => setIsLoading(false));
    };

    const handleDateClick = (date) => {
        // Validar si date es un objeto Date válido
        if (date instanceof Date && !isNaN(date) && !isDateDisabled(date)) {
            setSelectedDateForTimes(date);
            
            // Asegurarse de que date sea siempre un objeto Date antes de formatear
            const formattedDate = date.toISOString().split('T')[0];
    
            if (formattedDate) {
                onDateTimeChange(formattedDate, null);
                onFormDataChange({ fechaCita: formattedDate });
                fetchAvailableTimes(date);
                setShowTimeDialog(true);
            } else {
                console.error('No se pudo formatear la fecha:', date);
            }
        } else {
            console.error('Fecha no válida seleccionada:', date);
        }
    };
    
    const handleTimeSelection = (time) => {
        // Verificar que selectedDateForTimes sea un objeto Date válido
        if (selectedDateForTimes instanceof Date && !isNaN(selectedDateForTimes)) {
            const formattedDate = selectedDateForTimes.toISOString().split('T')[0];
            
            onDateTimeChange(formattedDate, time);
            onFormDataChange({
                fechaCita: formattedDate,
                horaCita: time
            });
            setShowTimeDialog(false);
        } else {
            console.error('Fecha no válida en handleTimeSelection:', selectedDateForTimes);
        }
    };
    
    const handleContinue = () => {
        if (selectedDate && selectedTime) {
            if (!(selectedDate instanceof Date)) {
                console.warn('selectedDate no es un objeto Date, convirtiendo...');
                selectedDate = new Date(selectedDate);
            }
            
            if (selectedDate instanceof Date && !isNaN(selectedDate)) {
                onStepCompletion('step3', true);
            } else {
                console.error('Fecha no válida al continuar:', selectedDate);
            }
        }
    };
    

    const isDateDisabled = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today || !workDays.includes(date.getDay());
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        const days = [];
        let week = [];

        for (let i = 0; i < firstDay; i++) {
            week.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            week.push(new Date(year, month, day));
            if (week.length === 7) {
                days.push(week);
                week = [];
            }
        }

        if (week.length > 0) {
            while (week.length < 7) {
                week.push(null);
            }
            days.push(week);
        }

        return days;
    };

    const handlePreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    return (
        <Paper
            elevation={3}
            sx={{
                p: 4,
                borderRadius: 3,
                backgroundColor: colors.cardBg,
                boxShadow: isDarkTheme ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)'
            }}
        >
            <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, color: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarMonthIcon sx={{ mr: 1 }} />
                Agenda tu Cita
            </Typography>

            <Paper
                elevation={2}
                sx={{
                    p: 2,
                    mb: 3,
                    backgroundColor: colors.cardBg,
                    border: `1px solid ${colors.primary}`,
                    borderRadius: 2
                }}
            >
                <Typography variant="h6" sx={{ color: colors.primary, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <EditCalendarIcon sx={{ mr: 1 }} />
                    Detalles de tu Cita
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EventIcon sx={{ mr: 1, color: colors.secondary }} />
                        <Typography>
                            <strong>Fecha:</strong> {selectedDate ? formatDate(selectedDate) : 'No seleccionada'}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ScheduleIcon sx={{ mr: 1, color: colors.secondary }} />
                        <Typography>
                            <strong>Hora:</strong> {selectedTime || 'No seleccionada'}
                        </Typography>
                    </Box>
                    {selectedDate && selectedTime && (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                setSelectedDateForTimes(new Date(selectedDate));
                                fetchAvailableTimes(new Date(selectedDate));
                                setShowTimeDialog(true);
                            }}
                            startIcon={<EditCalendarIcon />}
                            sx={{ alignSelf: 'flex-start', mt: 1 }}
                        >
                            Cambiar Horario
                        </Button>
                    )}
                </Box>
            </Paper>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <IconButton onClick={handlePreviousMonth}>
                            <ChevronLeftIcon />
                        </IconButton>
                        <Typography variant="h6" sx={{ color: colors.primary }}>
                            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </Typography>
                        <IconButton onClick={handleNextMonth}>
                            <ChevronRightIcon />
                        </IconButton>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {weekDays.map((day) => (
                                        <TableCell
                                            key={day}
                                            align="center"
                                            sx={{
                                                color: colors.primary,
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {day}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {getDaysInMonth(currentDate).map((week, weekIndex) => (
                                    <TableRow key={weekIndex}>
                                        {week.map((date, dayIndex) => (
                                            <TableCell
                                                key={dayIndex}
                                                align="center"
                                                sx={{
                                                    height: '60px',
                                                    border: '1px solid rgba(224, 224, 224, 0.3)'
                                                }}
                                            >
                                                {date && (
                                                    <Button
                                                        onClick={() => handleDateClick(date)}
                                                        disabled={isDateDisabled(date)}
                                                        sx={{
                                                            minWidth: '40px',
                                                            height: '40px',
                                                            borderRadius: '50%',
                                                            backgroundColor: selectedDate === date.toISOString().split('T')[0] ? colors.primary : 'transparent',
                                                            color: selectedDate === date.toISOString().split('T')[0] ? 'white' : isDateDisabled(date) ? 'grey.400' : colors.text,
                                                            '&:hover': {
                                                                backgroundColor: selectedDate === date.toISOString().split('T')[0] ? colors.primary : 'rgba(0,0,0,0.1)'
                                                            }
                                                        }}
                                                    >
                                                        {date.getDate()}
                                                    </Button>
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Dialog
                        open={showTimeDialog}
                        onClose={() => setShowTimeDialog(false)}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle sx={{
                            color: colors.primary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}>
                            <TimeIcon />
                            Horarios Disponibles
                            <Typography variant="subtitle2" sx={{ ml: 'auto', color: colors.secondary }}>
                                {selectedDateForTimes && formatDate(selectedDateForTimes)}
                            </Typography>
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={1} sx={{ mt: 1 }}>
                                {availableTimes.length > 0 ? (
                                    availableTimes.map((time) => (
                                        <Grid item xs={4} key={time}>
                                            <Button
                                                variant={selectedTime === time ? 'contained' : 'outlined'}
                                                color="primary"
                                                fullWidth
                                                onClick={() => handleTimeSelection(time)}
                                                sx={{ mb: 1 }}
                                                startIcon={<ScheduleIcon />}
                                            >
                                                {time}
                                            </Button>
                                        </Grid>
                                    ))
                                ) : (
                                    <Grid item xs={12}>
                                        <Alert severity="info">
                                            No hay horarios disponibles para esta fecha
                                        </Alert>
                                    </Grid>
                                )}
                            </Grid>
                        </DialogContent>
                    </Dialog>

                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 4,
                        gap: 2
                    }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={onPrev}
                            startIcon={<ArrowBackIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            Atrás
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleContinue}
                            disabled={!selectedDate || !selectedTime}
                            endIcon={<ArrowForwardIcon />}
                            sx={{ textTransform: 'none' }}>
                            Continuar
                        </Button>
                    </Box>
                </>
            )}
        </Paper>
    );
};

export default StepThree;
