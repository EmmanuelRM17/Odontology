import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

import {
    ArrowBack,
    CheckCircle,
    Email,
    Lock,
    Visibility,
    VisibilityOff
} from '@mui/icons-material';

import { motion } from 'framer-motion';
import ReCAPTCHA from 'react-google-recaptcha';
import { FaTooth } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Notificaciones from '../../../components/Layout/Notificaciones';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [captchaValue, setCaptchaValue] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [openNotification, setOpenNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [, setIsCaptchaLocked] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [canResend, setCanResend] = useState(true);
    const [resendTimer, setResendTimer] = useState(0);
    const [isCaptchaLoading, setIsCaptchaLoading] = useState(true);

    const recaptchaRef = useRef(null);
    const navigate = useNavigate();



    // Detectar el tema 
    useEffect(() => {
        const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(matchDarkTheme.matches);

        const handleThemeChange = (e) => {
            setIsDarkMode(e.matches);
        };

        matchDarkTheme.addEventListener('change', handleThemeChange);
        return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
    }, []);

    // Eliminar notificación después de un tiempo específico
    useEffect(() => {
        if (openNotification) {
            let duration = 3000;
            if (notificationMessage.includes('Cuenta bloqueada')) {
                duration = 6000;
            }

            const timer = setTimeout(() => {
                setOpenNotification(false);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [openNotification, notificationMessage]);

    // Eliminar mensaje de error después de 3 segundos
    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    useEffect(() => {
        const remembered = localStorage.getItem('rememberMe') === 'true';
        if (remembered) {
            const savedEmail = localStorage.getItem('savedEmail');
            if (savedEmail) {
                setFormData(prev => ({ ...prev, email: savedEmail }));
                setRememberMe(true);
            }
        }
    }, []);

    useEffect(() => {
        let timeoutId;
        let checkInterval;
        let retries = 0;
        const MAX_RETRIES = 50; // 🔹 Máximo de intentos (cada 100ms = 5s)
    
        const loadRecaptcha = () => {
            setIsCaptchaLoading(true);
    
            if (!window.grecaptcha) {
                // Timeout para marcar error si no carga en 2 segundos
                timeoutId = setTimeout(() => {
                    setIsCaptchaLoading(false);
                    console.error("❌ reCAPTCHA no se cargó en el tiempo esperado.");
                }, 2000);
    
                // Revisión periódica con límite de intentos
                checkInterval = setInterval(() => {
                    if (window.grecaptcha) {
                        setIsCaptchaLoading(false);
                        clearTimeout(timeoutId);
                        clearInterval(checkInterval);
                        console.log("✅ reCAPTCHA cargado correctamente.");
                    } else if (retries >= MAX_RETRIES) {
                        clearTimeout(timeoutId);
                        clearInterval(checkInterval);
                        setIsCaptchaLoading(false);
                        console.error("⚠ reCAPTCHA no se pudo cargar después de varios intentos.");
                    }
                    retries++;
                }, 100);
            } else {
                setIsCaptchaLoading(false);
            }
        };
    
        loadRecaptcha();
    
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (checkInterval) clearInterval(checkInterval);
        };
    }, []);
    
    // Función helper para manejar el timeout en fetch
    const fetchWithTimeout = async (url, options, timeout = 10000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response;
        } catch (error) {
            clearTimeout(id);
            if (error.name === 'AbortError') {
                throw new Error('La solicitud tardó demasiado tiempo en responder');
            }
            throw error;
        }
    };

    const handleRememberMeChange = (event) => {
        const checked = event.target.checked;
        setRememberMe(checked);

        if (checked) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('savedEmail', formData.email);
        } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('savedEmail');
        }
    };

    // Manejar cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));

        if (name === 'email') {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook|yahoo|live|uthh\.edu)\.(com|mx)$/;
            if (value && !emailRegex.test(value)) {
                setEmailError('Correo electrónico inválido.');
            } else {
                setEmailError('');
            }
        }
    };

    // Actualiza la función handleCaptchaChange:
    const handleCaptchaChange = (value) => {
        try {
            setCaptchaValue(value);
            setIsCaptchaLoading(false);
            setErrorMessage('');
        } catch (error) {
            console.error('Error en el captcha:', error);
            setErrorMessage('Error con el captcha. Por favor, inténtalo de nuevo.');
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
            }
        }
    };

    // Manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación de email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook|yahoo|live|uthh\.edu)\.(com|mx)$/;
        if (!emailRegex.test(formData.email)) {
            setErrorMessage('Por favor, ingrese un correo electrónico válido');
            return;
        }

        // Validación de captcha
        if (!captchaValue) {
            setErrorMessage('Por favor, completa el captcha.');
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
            }
            return;
        }

        // Guardar email si rememberMe está activo
        if (rememberMe) {
            localStorage.setItem('savedEmail', formData.email);
        }

        setIsLoading(true);

        try {
            const response = await fetch('https://back-end-4803.onrender.com/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: formData.email.trim(),
                    password: formData.password,
                    captchaValue
                })
            });

            // Procesar la respuesta
            const data = await response.json();

            // Agregar aquí la verificación del error 500
            if (response.status === 500) {
                navigate('/error', {
                    state: {
                        errorCode: 500,
                        errorMessage: 'Error interno del servidor. Por favor, inténtalo más tarde.'
                    }
                });
                return;
            }
            if (response.ok) {
                // Si la respuesta es correcta, procede con el siguiente paso
                try {
                    const sendCodeResponse = await fetchWithTimeout(
                        'https://back-end-4803.onrender.com/api/send-verification-code',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                email: formData.email.trim()
                            }),
                        },
                        15000
                    );

                    if (sendCodeResponse.ok) {
                        setNotificationMessage('Se ha enviado un código de verificación a su correo electrónico.');
                        setOpenNotification(true);
                        setShowVerificationModal(true);
                        setIsCaptchaLocked(true);
                    } else {
                        const errorData = await sendCodeResponse.json();
                        throw new Error(errorData.message || 'Error al enviar el código de verificación');
                    }
                } catch (error) {
                    console.error('Error en verificación:', error);
                    setErrorMessage('Error al enviar el código de verificación. Por favor, intenta nuevamente.');
                }
            } else {
                // Manejar los casos de error cuando response.ok es falso
                if (data.failedAttempts !== undefined) {
                    setNotificationMessage(`Intentos fallidos: ${data.failedAttempts}`);
                    setOpenNotification(true);
                    setErrorMessage('Contraseña incorrecta.');
                } else if (data.lockStatus) {
                    const formattedDate = new Date(data.lockUntil).toLocaleString('es-ES');
                    setNotificationMessage(`Cuenta bloqueada hasta ${formattedDate}`);
                    setOpenNotification(true);
                } else {
                    setErrorMessage(data.message || 'Error al iniciar sesión.');
                }
            }
        } catch (error) {
            console.error('Error en login:', error);
            if (error.message === 'La solicitud tardó demasiado tiempo en responder') {
                navigate('/error', {
                    state: {
                        errorCode: 500,
                        errorMessage: 'El servidor está tardando en responder. Por favor, intenta nuevamente.'
                    }
                });
            } else {
                navigate('/error', {
                    state: {
                        errorCode: 500,
                        errorMessage: 'Error de conexión. Inténtalo de nuevo más tarde.'
                    }
                });
            }
        } finally {
            setIsLoading(false);
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
            }
            setCaptchaValue(null);
        }
    };


    // Función para reenviar el código
    const handleResendCode = async () => {
        if (!canResend) return;

        try {
            setCanResend(false);
            setResendTimer(30); // 30 segundos de espera

            const response = await fetchWithTimeout(
                'https://back-end-4803.onrender.com/api/send-verification-code',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: formData.email }),
                },
                15000
            );

            if (response.ok) {
                setNotificationMessage('Se ha enviado un nuevo código a tu correo electrónico');
                setOpenNotification(true);

                // Iniciar contador regresivo
                const timer = setInterval(() => {
                    setResendTimer((prev) => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            setCanResend(true);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                setErrorMessage('Error al reenviar el código');
                setCanResend(true);
            }
        } catch (error) {
            setErrorMessage('Error al reenviar el código. Inténtalo más tarde');
            setCanResend(true);
        }
    };

    // Manejar la verificación del código
    const handleVerifyCode = async () => {
        if (!verificationCode.trim()) {
            setErrorMessage('Por favor, ingresa el código de verificación.');
            return;
        }

        if (verificationCode.length !== 6) {
            setErrorMessage('Por favor, ingresa el código completo de 6 caracteres');
            return;
        }
        // Validar que solo contenga letras mayúsculas y números
        const codeRegex = /^[A-Z0-9]{6}$/;
        if (!codeRegex.test(verificationCode)) {
            setErrorMessage('El código solo puede contener letras mayúsculas y números');
            return;
        }

        setIsVerifying(true);

        try {
            const response = await fetchWithTimeout(
                'https://back-end-4803.onrender.com/api/verify-verification-code',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.email.trim(),
                        code: verificationCode.trim()
                    }),
                },
                15000 // 15 segundos de timeout
            );

            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data.message || 'Error al verificar el código.');
                return;
            }

            setNotificationMessage(data.message || 'Código verificado correctamente.');
            setOpenNotification(true);
            setVerificationCode('');
            setShowVerificationModal(false); // Cambiado de setOpenModal a setShowVerificationModal

            // Guardar en localStorage y redireccionar según el tipo de usuario
            if (data.userType === 'administradores') {
                localStorage.setItem('loggedIn', true);
                localStorage.setItem('userType', 'administradores');
                navigate('/Administrador/principal');
            } else if (data.userType === 'pacientes') {
                localStorage.setItem('loggedIn', true);
                localStorage.setItem('userType', 'pacientes');
                navigate('/Paciente/principal');
            } else {
                setErrorMessage('Tipo de usuario desconocido. Inténtalo nuevamente.');
            }
        } catch (error) {
            if (error.message === 'La solicitud tardó demasiado tiempo en responder') {
                setErrorMessage('El servidor está tardando en responder. Por favor, intenta nuevamente.');
            } else {
                setErrorMessage('Error de conexión. Inténtalo de nuevo más tarde.');
            }
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                bgcolor: isDarkMode ? '#1C2A38' : '#F9FDFF'            }}
        >
            {/* Sección Principal - Formulario */}
            <Box
                sx={{
                    flex: { xs: '1', md: '1 1 50%' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: { xs: 2, sm: 3, md: 4 },
                    position: 'relative',
                    minHeight: { xs: '100vh', md: 'auto' }
                }}
            >
                {/* Botón Regresar */}
                <IconButton
                    component={Link}
                    to="/"
                    sx={{
                        position: 'absolute',
                        top: { xs: 10, md: 20 },
                        left: { xs: 10, md: 20 },
                        color: '#0052A3',
                        zIndex: 1,
                        '&:hover': {
                            bgcolor: 'rgba(0, 82, 163, 0.1)'
                        }
                    }}
                >
                    <ArrowBack />
                    <Typography sx={{ ml: 1, color: '#0052A3', display: { xs: 'none', sm: 'block' } }}>
                        Regresar
                    </Typography>
                </IconButton>

                {/* Contenedor del Formulario */}
                <Paper
                    elevation={3}
                    component={motion.div}
                    whileHover={{ y: -5 }}
                    sx={{
                        width: '100%',
                        maxWidth: { xs: '100%', sm: 450 },
                        p: { xs: 3, sm: 4 },
                        borderRadius: 2,
                        bgcolor: 'white',
                        boxShadow: '0 4px 20px rgba(0, 82, 163, 0.1)'
                    }}
                >
                    {/* Logo y Título */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                        >
                            <FaTooth size={40} style={{ color: '#0052A3' }} />
                        </motion.div>
                        <Typography
                            variant="h4"
                            sx={{
                                mt: 2,
                                fontWeight: 700,
                                color: '#0052A3',
                                fontFamily: '"Poppins", sans-serif',
                                fontSize: { xs: '1.5rem', sm: '2rem' }
                            }}
                        >
                            Clínica Dental Carol
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                mt: 1,
                                color: 'text.secondary'
                            }}
                        >
                            Accede a tu cuenta dental
                        </Typography>
                    </Box>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        {/* Campo Email */}
                        <TextField
                            fullWidth
                            required
                            label="Correo electrónico"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            variant="outlined"
                            margin="normal"
                            error={!!emailError}
                            helperText={emailError}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email sx={{ color: emailError ? 'error.main' : '#0052A3' }} />
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: emailError ? 'error.main' : 'rgba(27, 42, 58, 0.2)'
                                    },
                                    '&:hover fieldset': {
                                        borderColor: emailError ? 'error.main' : '#0052A3'
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: emailError ? 'error.main' : '#0052A3'
                                    }
                                },
                                '& .MuiInputLabel-root': {
                                    color: emailError ? 'error.main' : 'inherit',
                                    '&.Mui-focused': {
                                        color: emailError ? 'error.main' : '#0052A3'
                                    }
                                },
                                '& .MuiFormHelperText-root': {
                                    margin: '4px 0 0'
                                }
                            }}
                        />

                        {/* Campo Contraseña */}
                        <TextField
                            fullWidth
                            required
                            label="Contraseña"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            variant="outlined"
                            margin="normal"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: '#0052A3' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'rgba(27, 42, 58, 0.2)'
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#0052A3'
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#0052A3'
                                    }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#0052A3'
                                }
                            }}
                        />

                        {/* Opciones adicionales */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 3
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={rememberMe}
                                        onChange={handleRememberMeChange}
                                        sx={{
                                            color: '#0052A3',
                                            '&.Mui-checked': {
                                                color: '#0052A3'
                                            }
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontSize: '0.9rem' }}>
                                        Recuérdame
                                    </Typography>
                                }
                            />
                            <Link
                                to="/recuperacion"
                                style={{
                                    color: '#0052A3',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: 500
                                }}
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </Box>

                        {/* ReCAPTCHA */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mb: 3,
                            minHeight: '78px'
                        }}>
                            {isCaptchaLoading ? (
                                <CircularProgress size={24} />
                            ) : (
                                <ReCAPTCHA
                                    ref={recaptchaRef}
                                    sitekey="6Lc74mAqAAAAAL5MmFjf4x0PWP9MtBNEy9ypux_h"
                                    onChange={handleCaptchaChange}
                                    onLoad={() => {
                                        setIsCaptchaLoading(false);
                                        setErrorMessage('');
                                    }}
                                    onError={() => {
                                        setIsCaptchaLoading(false);
                                        setErrorMessage('Error al cargar el captcha. Por favor, recarga la página.');
                                    }}
                                    onExpired={() => {
                                        setCaptchaValue(null);
                                        setErrorMessage('El captcha ha expirado. Por favor, complétalo nuevamente.');
                                    }}
                                    theme={isDarkMode ? 'dark' : 'light'}
                                />
                            )}
                        </Box>
                        {/* Mensaje de Error */}
                        {errorMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                            >
                                <Alert
                                    severity="error"
                                    sx={{ mb: 2 }}
                                    onClose={() => setErrorMessage('')}
                                >
                                    {errorMessage}
                                </Alert>
                            </motion.div>
                        )}

                        {/* Modal de Verificación */}
                        <Dialog
                            open={showVerificationModal}
                            onClose={() => {
                                if (!isVerifying) {
                                    setShowVerificationModal(false);
                                    setVerificationCode('');
                                    setErrorMessage('');
                                }
                            }}
                            fullWidth
                            maxWidth="xs"
                        >
                            <DialogTitle sx={{ textAlign: 'center', color: '#0052A3' }}>
                                Verificación Requerida
                            </DialogTitle>
                            <DialogContent>
                                <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                                    Se ha enviado un código de verificación a tu correo electrónico.
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Código de verificación"
                                    value={verificationCode}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^A-Z0-9]/g, '').toUpperCase();
                                        if (value.length <= 6) {
                                            setVerificationCode(value);
                                            setErrorMessage('');
                                        }
                                    }}
                                    error={!!errorMessage}
                                    helperText={errorMessage || 'Ingresa el código de 6 caracteres'}
                                    disabled={isVerifying}
                                    autoFocus
                                    inputProps={{
                                        maxLength: 6,
                                        style: { textTransform: 'uppercase', letterSpacing: '0.5em' }
                                    }}
                                    placeholder="ABC123"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': {
                                                borderColor: errorMessage ? 'error.main' : '#0052A3'
                                            }
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: errorMessage ? 'error.main' : '#0052A3'
                                        },
                                        '& input': {
                                            textAlign: 'center'
                                        }
                                    }}
                                />
                                {/* Botón de reenvío con contador */}
                                <Box sx={{ mt: 2, textAlign: 'center' }}>
                                    <Button
                                        onClick={handleResendCode}
                                        disabled={!canResend}
                                        sx={{
                                            color: '#0052A3',
                                            textTransform: 'none',
                                            '&.Mui-disabled': {
                                                color: 'text.secondary'
                                            }
                                        }}
                                    >
                                        {canResend
                                            ? '¿No recibiste el código? Reenviar'
                                            : `Podrás reenviar en ${resendTimer} segundos`
                                        }
                                    </Button>
                                </Box>
                            </DialogContent>
                            <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
                                <Button
                                    onClick={handleVerifyCode}
                                    variant="contained"
                                    disabled={isVerifying || !verificationCode.trim()}
                                    sx={{
                                        bgcolor: '#0052A3',
                                        '&:hover': {
                                            bgcolor: '#003d7a'
                                        },
                                        minWidth: '120px'
                                    }}
                                >
                                    {isVerifying ? <CircularProgress size={24} /> : 'Verificar'}
                                </Button>
                            </DialogActions>
                        </Dialog>
                        {/* Botón de Inicio de Sesión */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isLoading || !captchaValue}
                            sx={{
                                mt: 2,
                                mb: 3,
                                py: 1.5,
                                bgcolor: '#0052A3',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                borderRadius: '8px',
                                '&:hover': {
                                    bgcolor: '#0052A3'
                                },
                                '&.Mui-disabled': {
                                    bgcolor: 'rgba(27, 42, 58, 0.6)',
                                    color: 'white'
                                }
                            }}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </Button>

                        {/* Link de Registro */}
                        <Typography
                            variant="body2"
                            align="center"
                            sx={{ mt: 2 }}
                        >
                            ¿No tienes una cuenta?{' '}
                            <Link
                                to="/register"
                                style={{
                                    color: '#0052A3',
                                    textDecoration: 'none',
                                    fontWeight: 600
                                }}
                            >
                                Regístrate aquí
                            </Link>
                        </Typography>
                    </form>
                </Paper>
            </Box>

            {/* Sección Lateral - Imagen y Mensaje */}
            <Box
                sx={{
                    flex: '1 1 50%',
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: '#03427c',
                    color: 'white',
                    p: 6,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Patrón de fondo */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.1,
                        backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 50%)',
                        backgroundSize: '20px 20px'
                    }}
                />

                {/* Contenido */}
                <Box sx={{ position: 'relative', textAlign: 'center' }}>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Typography
                            variant="h3"
                            sx={{
                                mb: 4,
                                fontWeight: 700,
                                fontFamily: '"Poppins", sans-serif'
                            }}
                        >
                            Bienvenido a Carol
                        </Typography>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 6,
                                opacity: 0.9,
                                maxWidth: 500,
                                mx: 'auto'
                            }}
                        >
                            Tu salud dental es nuestra prioridad. Accede para gestionar tus citas y consultar tu historial.
                        </Typography>
                    </motion.div>

                    {/* Características */}
                    <Box sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
                        {[
                            'Agenda y gestiona tus citas en línea',
                            'Accede a tu historial dental completo',
                            'Recibe recordatorios de tus próximas citas',
                            'Consulta tratamientos y presupuestos'
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.6 + index * 0.1 }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 2
                                    }}
                                >
                                    <CheckCircle
                                        sx={{
                                            mr: 2,
                                            color: '#4CAF50'
                                        }}
                                    />
                                    <Typography>
                                        {feature}
                                    </Typography>
                                </Box>
                            </motion.div>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* Notificaciones */}
            <Notificaciones
                open={openNotification}
                message={notificationMessage}
                handleClose={() => setOpenNotification(false)}
                severity={notificationMessage.includes('error') ? 'error' : 'success'}
            />
        </Box>
    );
};

export default Login;
