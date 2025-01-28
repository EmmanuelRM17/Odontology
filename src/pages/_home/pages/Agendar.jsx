import React, { useState, useEffect } from 'react';
import {
    Box, TextField, Typography, Button, MenuItem, Stepper, IconButton, Step, StepLabel,
    Grid, InputAdornment, 
    Checkbox, Modal, FormControlLabel, Snackbar, Alert, Chip, useMediaQuery, useTheme} from '@mui/material';
import {
    ArrowBack,
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    CheckCircle as CheckCircleIcon,
    MedicalServices as MedicalServicesIcon,
    Home as HomeIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import Captcha from '../Compartidos/Herramientas/captcha';

// Validation Regex
const nameRegex = /^[A-Za-zÀ-ÿñÑà-ü\s]+$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook|yahoo|live|uthh\.edu)\.(com|mx)$/;
const phoneRegex = /^\d{10}$/;

const steps = ['Identificación', 'Profesional', 'Disponibilidad', 'Confirmación'];

const ReservaCitas = () => {
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        genero: '',
        correo: '',
        telefono: '',
        asunto: '',
        mensaje: '',
    });
    const [errors, setErrors] = useState({});
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [privacyPolicy, setPrivacyPolicy] = useState('');
    const [termsConditions, setTermsConditions] = useState('');
    const [openPrivacyModal, setOpenPrivacyModal] = useState(false);
    const [openTermsModal, setOpenTermsModal] = useState(false);
    const [allAccepted, setAllAccepted] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [captchaValue, setCaptchaValue] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    // System Theme Detection
    useEffect(() => {
        const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkTheme(matchDarkTheme.matches);

        const handleThemeChange = (e) => {
            setIsDarkTheme(e.matches);
        };

        matchDarkTheme.addEventListener('change', handleThemeChange);
        return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
    }, []);


    // Theme colors
    const themeColors = {
        background: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
        paper: isDarkTheme ? '#243447' : '#ffffff',
        text: isDarkTheme ? '#ffffff' : '#000000',
        primary: '#03427C',
        secondary: isDarkTheme ? '#90caf9' : '#03427C'
    };

    const handleAcceptChange = (event) => {
        setAllAccepted(event.target.checked);
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const validateField = (name, value) => {
        let errorMessage = '';
        switch (name) {
            case 'nombre':
            case 'apellidos':
                if (!nameRegex.test(value)) {
                    errorMessage = 'Solo se permiten letras y espacios';
                }
                break;
            case 'correo':
                if (!emailRegex.test(value)) {
                    errorMessage = 'Correo electrónico inválido';
                }
                break;
            case 'telefono':
                if (!phoneRegex.test(value)) {
                    errorMessage = 'Debe contener 10 dígitos';
                }
                break;
            default:
                if (!value.trim()) {
                    errorMessage = 'Este campo es obligatorio';
                }
        }
        return errorMessage;
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Validar campo
        const errorMessage = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: errorMessage
        }));
    };

    const validateStep = () => {
        const newErrors = {};
        if (step === 1) {
            ['nombre', 'apellidos', 'genero', 'correo', 'telefono'].forEach(key => {
                const errorMessage = validateField(key, formData[key]);
                if (errorMessage) {
                    newErrors[key] = errorMessage;
                }
            });
        }
        // Agregar más validaciones si se requiere en pasos posteriores

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (validateStep()) {
            if (step === 1) {
                if (!allAccepted) {
                    setOpenSnackbar(true);
                    return;
                }
                if (!captchaValue) {
                    setErrorMessage('Por favor, completa el captcha.');
                    return;
                }
            }
            setStep(prevStep => prevStep + 1);
        }
    };

    const handleCaptchaChange = (value) => {
        setCaptchaValue(value);
        if (!value) {
            setErrorMessage('Por favor, completa el captcha nuevamente.');
        } else {
            setErrorMessage('');
        }
    };

    const handlePrevStep = () => {
        setStep(prevStep => prevStep - 1);
    };
    const handleReservar = () => {
        if (selectedDate && selectedTime) {
            setStep(4);
        }
    };


    const handleReset = () => {
        setStep(1);
        setFormData({
            nombre: '',
            apellidos: '',
            genero: '',
            correo: '',
            telefono: '',
            asunto: '',
            mensaje: '',
        });
        setSelectedDate('');
        setSelectedTime('');
        setErrors({});
        setOpenConfirmDialog(false);
        setCaptchaValue(null);
    };

    // Función para abrir el modal de políticas de privacidad y obtener su contenido si aún no está cargado
    const handleOpenPrivacyModal = async (event) => {
        event.stopPropagation();
        if (!privacyPolicy) await fetchPrivacyPolicy();
        setOpenPrivacyModal(true);
    };

    // Función para abrir el modal de términos y condiciones y obtener su contenido si aún no está cargado
    const handleOpenTermsModal = async (event) => {
        event.stopPropagation();
        if (!termsConditions) await fetchTermsConditions();
        setOpenTermsModal(true);
    };

    const handleClosePrivacyModal = () => setOpenPrivacyModal(false);
    const handleCloseTermsModal = () => setOpenTermsModal(false);


    const fetchPrivacyPolicy = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/politicas/politicas_privacidad');
            const activePolicy = response.data.find(policy => policy.estado === 'activo');
            setPrivacyPolicy(activePolicy ? activePolicy.contenido : 'No se encontraron políticas de privacidad activas.');
        } catch (error) {
            console.error('Error al obtener las políticas de privacidad', error);
            setPrivacyPolicy('Error al cargar las políticas de privacidad.');
        }
    };

    const fetchTermsConditions = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/termiCondicion/terminos_condiciones');
            const activeTerms = response.data.find(term => term.estado === 'activo');
            setTermsConditions(activeTerms ? activeTerms.contenido : 'No se encontraron términos y condiciones activos.');
        } catch (error) {
            console.error('Error al obtener los términos y condiciones', error);
            setTermsConditions('Error al cargar los términos y condiciones.');
        }
    };


    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundColor: themeColors.background,
                pb: 4,
                transition: 'background-color 0.3s ease'
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    backgroundColor: themeColors.primary,
                    color: '#fff',
                    py: 2,
                    textAlign: 'center',
                    boxShadow: 2,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 2
                }}
            >
                <IconButton
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: 8,
                        transform: 'translateY(-50%)',
                        color: '#00bcd4'
                    }}
                    component={Link}
                    to="/"
                >
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        <ArrowBack />
                        {!isSmallScreen && (
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#ffffff',
                                    opacity: 0.7
                                }}
                            >
                                Salir
                            </Typography>
                        )}
                    </Box>
                </IconButton>

                <Typography variant={isSmallScreen ? 'h5' : 'h4'} fontWeight="bold">
                    Programa tu consulta
                </Typography>
            </Box>

            {/* Stepper */}
            <Box sx={{
                width: '90%',
                maxWidth: '600px',
                mx: 'auto',
                my: 3,
                '& .MuiStepLabel-label': {
                    color: themeColors.text,
                    fontSize: {
                        xs: '0.7rem',
                        sm: '0.8rem',
                    },
                    fontWeight: 500,
                    mt: 1
                }
            }}>
                <Stepper
                    activeStep={step - 1}
                    alternativeLabel
                    sx={{
                        '& .MuiStepIcon-root': {
                            color: 'transparent',
                            width: {
                                xs: 24,
                                sm: 28,
                            },
                            height: {
                                xs: 24,
                                sm: 28,
                            },
                            border: `2px solid ${isDarkTheme ? '#90caf9' : '#1976d2'}`,
                            borderRadius: '50%',
                            transition: 'all 0.3s ease-in-out',
                            position: 'relative',

                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%) scale(0)',
                                width: '70%',
                                height: '70%',
                                borderRadius: '50%',
                                backgroundColor: isDarkTheme ? '#90caf9' : '#1976d2',
                                transition: 'transform 0.3s ease-in-out'
                            },

                            // Círculo activo
                            '&.Mui-active': {
                                borderColor: isDarkTheme ? '#90caf9' : '#1976d2',
                                '&::after': {
                                    transform: 'translate(-50%, -50%) scale(1)',
                                }
                            },

                            // Círculo completado
                            '&.Mui-completed': {
                                borderColor: isDarkTheme ? '#90caf9' : '#1976d2',
                                color: isDarkTheme ? '#90caf9' : '#1976d2', // Color para el check icon
                                '&::after': {
                                    transform: 'translate(-50%, -50%) scale(1)',
                                    backgroundColor: isDarkTheme ? '#90caf9' : '#1976d2',
                                }
                            }
                        },
                        '& .MuiStepIcon-text': {
                            fill: isDarkTheme ? '#FFF' : '#000', // Siempre blanco para contraste con el fondo
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                            zIndex: 1,
                            position: 'relative'
                        },

                        // Línea conectora
                        '& .MuiStepConnector-line': {
                            borderColor: isDarkTheme ? 'rgba(144, 202, 249, 0.2)' : 'rgba(25, 118, 210, 0.2)',
                            borderTopWidth: 2,
                            transition: 'all 0.3s ease'
                        },

                        // Línea conectora activa y completada
                        '& .MuiStepConnector-active .MuiStepConnector-line, & .MuiStepConnector-completed .MuiStepConnector-line': {
                            borderColor: isDarkTheme ? '#90caf9' : '#1976d2'
                        },

                        // Ajuste del espaciado
                        '& .MuiStep-root': {
                            padding: {
                                xs: '0 4px',
                                sm: '0 8px',
                            }
                        }
                    }}
                >
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>
                                <Box sx={{
                                    typography: 'body2',
                                    fontWeight: 'medium',
                                    textAlign: 'center',
                                    width: {
                                        xs: '60px',
                                        sm: '80px',
                                    },
                                    mx: 'auto'
                                }}>
                                    {label}
                                </Box>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>
            {/* Form Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: { xs: '80%', sm: '750px', md: '850px' },
                        mx: 'auto',
                        backgroundColor: '#ffffff',
                        color: themeColors.text,
                        borderRadius: 4,
                        p: { xs: 2, sm: 4, md: 5 },
                        boxShadow: 6,
                        border: '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: 8
                        }
                    }}
                >
                    {/* Form content goes here */}
                    {step === 1 && (
                        <>
                            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', color: '#1976d2' }}>
                                Identificación del Paciente
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Nombre"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required
                                        error={!!errors.nombre}
                                        helperText={errors.nombre}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon color="primary" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Apellidos"
                                        name="apellidos"
                                        value={formData.apellidos}
                                        onChange={handleChange}
                                        required
                                        error={!!errors.apellidos}
                                        helperText={errors.apellidos}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon color="primary" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Género"
                                        name="genero"
                                        value={formData.genero}
                                        onChange={handleChange}
                                        required
                                        error={!!errors.genero}
                                        helperText={errors.genero}
                                    >
                                        <MenuItem value="Masculino">Masculino</MenuItem>
                                        <MenuItem value="Femenino">Femenino</MenuItem>
                                        <MenuItem value="Prefiero no decirlo">Prefiero no decirlo</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Correo electrónico"
                                        name="correo"
                                        value={formData.correo}
                                        onChange={handleChange}
                                        required
                                        error={!!errors.correo}
                                        helperText={errors.correo}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailIcon color="primary" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Teléfono"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        required
                                        error={!!errors.telefono}
                                        helperText={errors.telefono}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PhoneIcon color="primary" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <br />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={allAccepted}
                                            onChange={handleAcceptChange}
                                            name="acceptAll"
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Typography
                                            variant="body2"
                                            sx={{ color: '#000000' }}
                                        >
                                            Al seleccionar, confirmas que estás de acuerdo con nuestros{' '}
                                            <Link
                                                component="span"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleOpenTermsModal(e);
                                                }}
                                                sx={{
                                                    cursor: 'pointer',
                                                    textDecoration: 'underline',
                                                    color: '#1976d2'
                                                }}
                                            >
                                                términos y condiciones
                                            </Link>{' '}
                                            y que entiendes nuestra{' '}
                                            <Link
                                                component="span"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleOpenPrivacyModal(e);
                                                }}
                                                sx={{
                                                    cursor: 'pointer',
                                                    textDecoration: 'underline',
                                                    color: '#1976d2'
                                                }}
                                            >
                                                política de privacidad
                                            </Link>.
                                        </Typography>
                                    }
                                />

                                {allAccepted && (
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                        <Captcha
                                            onCaptchaChange={handleCaptchaChange}
                                            isDarkMode={isDarkTheme}
                                        />
                                    </Box>
                                )}
                            </Box>
                            <Modal open={openPrivacyModal} onClose={handleClosePrivacyModal}>
                                <Box
                                    sx={{
                                        width: '90%', // 90% of the viewport width
                                        maxWidth: 600, // Maximum width
                                        maxHeight: '80vh', // Limit height to 80% of the viewport
                                        bgcolor: 'background.paper',
                                        p: 4,
                                        m: 'auto',
                                        mt: 5,
                                        borderRadius: 2,
                                        overflowY: 'auto', // Enable vertical scrolling
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        Políticas de Privacidad
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            whiteSpace: 'pre-line', // Preserve line breaks
                                        }}
                                    >
                                        {privacyPolicy}
                                    </Typography>
                                    <Button
                                        onClick={handleClosePrivacyModal}
                                        sx={{ mt: 2 }}
                                        variant="contained"
                                        fullWidth
                                    >
                                        Cerrar
                                    </Button>
                                </Box>
                            </Modal>

                            <Modal open={openTermsModal} onClose={handleCloseTermsModal}>
                                <Box
                                    sx={{
                                        width: '90%', // 90% of the viewport width
                                        maxWidth: 600, // Maximum width
                                        maxHeight: '80vh', // Limit height to 80% of the viewport
                                        bgcolor: 'background.paper',
                                        p: 4,
                                        m: 'auto',
                                        mt: 5,
                                        borderRadius: 2,
                                        overflowY: 'auto', // Enable vertical scrolling
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        Términos y Condiciones
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            whiteSpace: 'pre-line', // Preserve line breaks
                                        }}
                                    >
                                        {termsConditions}
                                    </Typography>
                                    <Button
                                        onClick={handleCloseTermsModal}
                                        sx={{ mt: 2 }}
                                        variant="contained"
                                        fullWidth
                                    >
                                        Cerrar
                                    </Button>
                                </Box>
                            </Modal>

                            {/* Snackbar for terms not accepted */}
                            <Snackbar
                                open={openSnackbar}
                                autoHideDuration={6000}
                                onClose={handleCloseSnackbar}
                                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                            >
                                <Alert
                                    onClose={handleCloseSnackbar}
                                    severity="error"
                                    sx={{ width: '100%' }}
                                >
                                    Debe aceptar los términos y condiciones y la política de privacidad para continuar.
                                </Alert>
                            </Snackbar>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handlePrevStep}
                                    disabled={step === 1}
                                    sx={{ textTransform: 'none', fontWeight: 'bold' }}
                                >
                                    Atrás
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleNextStep}
                                    sx={{ textTransform: 'none', fontWeight: 'bold' }}
                                    disabled={
                                        !formData.nombre ||
                                        !formData.apellidos ||
                                        !formData.genero ||
                                        !formData.correo ||
                                        !formData.telefono ||
                                        Object.values(errors).some(err => err) ||
                                        !allAccepted ||
                                        !captchaValue
                                    }
                                >
                                    Continuar
                                </Button>

                            </Box>
                        </>
                    )}

                    {step === 2 && (
                        <Box
                            sx={{
                                width: '90%',
                                maxWidth: '600px',
                                mx: 'auto',
                                backgroundColor: '#fff',
                                p: { xs: 1, sm: 2 },
                                boxShadow: 3,
                            }}
                        >
                            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', color: '#1976d2' }}>
                                Profesional Asignado
                            </Typography>

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    gap: 2
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 180,
                                        height: 180,
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        boxShadow: 3,
                                        border: '4px solid #1976d2'
                                    }}
                                >
                                    <img
                                        src="https://via.placeholder.com/180"
                                        alt="Dra. María López"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </Box>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h6" sx={{ color: '#333', mb: 0.5 }}>
                                        Dr. Hugo Gomez Ramirez
                                    </Typography>
                                    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                                        Especialista en Ortodoncia
                                    </Typography>
                                    <Chip
                                        icon={<MedicalServicesIcon />}
                                        label="3+ años de experiencia"
                                        variant="outlined"
                                        color="primary"
                                        size="small"
                                    />
                                </Box>
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    justifyContent: 'space-between',
                                    gap: 2,
                                    mt: 4
                                }}
                            >
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => setStep(1)}
                                    sx={{
                                        textTransform: 'none',
                                        order: { xs: 2, sm: 1 }
                                    }}
                                >
                                    Atrás
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setStep(3)}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 'bold',
                                        order: { xs: 1, sm: 2 }
                                    }}
                                >
                                    Continuar
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {step === 3 && (
                        <Box
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                backgroundColor: '#f0f4f8',
                                p: { xs: 2, sm: 4 }
                            }}
                        >
                            <Typography
                                variant="h4"
                                sx={{
                                    mb: 4,
                                    textAlign: 'center',
                                    color: '#1976d2',
                                    fontWeight: 'bold',
                                    fontSize: { xs: '1.5rem', sm: '2rem' }
                                }}
                            >
                                Selecciona Fecha y Hora
                            </Typography>

                            <Box
                                sx={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    gap: { xs: 2, sm: 3 },
                                    width: '100%',
                                    maxWidth: '1200px',
                                    mx: 'auto'
                                }}
                            >
                                {/* Date Selection */}
                                <Box
                                    sx={{
                                        flex: { xs: '1', md: '0.5' },
                                        backgroundColor: '#fff',
                                        borderRadius: 4,
                                        boxShadow: 3,
                                        p: { xs: 2, sm: 3 },
                                        overflow: 'auto',
                                        maxHeight: { xs: '400px', md: '500px' }
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            textAlign: 'center',
                                            mb: 3,
                                            color: '#333'
                                        }}
                                    >
                                        Fechas Disponibles
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: {
                                                xs: 'repeat(3, 1fr)',
                                                sm: 'repeat(4, 1fr)',
                                                md: 'repeat(4, 1fr)'
                                            },
                                            gap: { xs: 1, sm: 2 }
                                        }}
                                    >
                                        {(() => {
                                            const dates = [];
                                            for (let i = 1; i <= 15; i++) {
                                                const date = new Date();
                                                date.setDate(date.getDate() + i);
                                                dates.push(date);
                                            }
                                            return dates.map((date, index) => (
                                                <Button
                                                    key={index}
                                                    fullWidth
                                                    variant={selectedDate && selectedDate.toDateString() === date.toDateString() ? "contained" : "outlined"}
                                                    color="primary"
                                                    onClick={() => setSelectedDate(date)}
                                                    sx={{
                                                        py: { xs: 1, sm: 1.5 },
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            transform: 'scale(1.05)',
                                                            boxShadow: 1
                                                        }
                                                    }}
                                                >
                                                    <Typography variant="body2">
                                                        {date.toLocaleDateString('es-ES', {
                                                            weekday: 'short',
                                                            day: 'numeric',
                                                            month: 'short'
                                                        }).replace('.', '')}
                                                    </Typography>
                                                </Button>
                                            ));
                                        })()}
                                    </Box>
                                </Box>

                                {/* Time Slots Section */}
                                <Box
                                    sx={{
                                        flex: { xs: '1', md: '0.5' },
                                        backgroundColor: '#fff',
                                        borderRadius: 4,
                                        boxShadow: 3,
                                        p: { xs: 2, sm: 3 },
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            mb: 3,
                                            textAlign: 'center',
                                            color: '#333'
                                        }}
                                    >
                                        Horarios Disponibles
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: {
                                                xs: 'repeat(2, 1fr)',
                                                sm: 'repeat(3, 1fr)',
                                                md: 'repeat(4, 1fr)'
                                            },
                                            gap: { xs: 1, sm: 2 }
                                        }}
                                    >
                                        {[
                                            "09:00", "10:00", "11:00", "12:00",
                                            "13:00", "14:00", "15:00", "16:00",
                                            "17:00", "18:00", "19:00", "20:00",
                                            "21:00", "22:00", "23:00"
                                        ].map((time) => (
                                            <Button
                                                key={time}
                                                fullWidth
                                                variant={selectedTime === time ? "contained" : "outlined"}
                                                color="primary"
                                                onClick={() => setSelectedTime(time)}
                                                sx={{
                                                    py: { xs: 1, sm: 1.5 },
                                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                    fontWeight: selectedTime === time ? 'bold' : 'normal',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'scale(1.05)',
                                                        boxShadow: 1
                                                    }
                                                }}
                                            >
                                                {time}
                                            </Button>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>

                            {/* Navigation Buttons */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    mt: { xs: 2, sm: 4 },
                                    gap: 2
                                }}
                            >
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => setStep(2)}
                                    sx={{
                                        textTransform: 'none',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0,0,0,0.05)'
                                        }
                                    }}
                                >
                                    Atrás
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    onClick={handleReservar}  // Esta función ahora llevará al paso 4
                                    disabled={!selectedDate || !selectedTime}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            backgroundColor: '#1565c0'
                                        }
                                    }}
                                >
                                    Reservar Cita
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {step === 4 && (
                        <Box
                            sx={{
                                width: '80%',
                                mx: 'auto',
                                backgroundColor: '#ffffff',    // Fondo blanco fijo                                 
                                borderRadius: 2,
                                p: 4,
                                boxShadow: 3,
                                textAlign: 'center',
                            }}
                        >
                            <CheckCircleIcon
                                color="success"
                                sx={{
                                    fontSize: 60,
                                    mb: 2
                                }}
                            />
                            <Typography
                                variant="h5"
                                sx={{
                                    mb: 3,
                                    fontWeight: 'bold',
                                    color: '#1976d2'  // Color azul para el títuloo                              
                                }}
                            >
                                ¡Solicitud Enviada!
                            </Typography>
                            <Typography
                                sx={{
                                    mb: 2,
                                    color: '#000000'  // Texto negro fijo
                                }}
                            >
                                Su solicitud de cita ha sido enviada. El médico revisará su disponibilidad y pronto recibirá una notificación.
                            </Typography>
                            <Typography
                                sx={{
                                    mb: 3,
                                    fontStyle: 'italic',
                                    color: '#666666'  // Gris oscuro para el texto secundario                                
                                }}
                            >
                                Por favor, esté pendiente de su correo electrónico ({formData.correo}) y su teléfono ({formData.telefono})
                                donde recibirá la confirmación de su cita.
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate('/')}
                                startIcon={<HomeIcon />}
                                sx={{
                                    mt: 4,
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    py: 1.5,
                                    px: 4
                                }}
                            >
                                Volver al inicio
                            </Button>
                        </Box>
                    )}
                </Box>
            </motion.div >

            {/* Snackbar for terms acceptance */}
            < Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity="warning"
                    sx={{
                        width: '100%',
                        backgroundColor: isDarkTheme ? 'rgba(255, 244, 229, 0.95)' : undefined,
                        color: '#663c00',
                        '& .MuiAlert-icon': {
                            color: '#663c00'
                        }
                    }}
                >
                    Debe aceptar los términos y condiciones para continuar
                </Alert>
            </Snackbar >
        </Box >
    );
};

export default ReservaCitas;