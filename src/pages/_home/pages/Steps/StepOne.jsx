import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    TextField,
    Button,
    Typography,
    InputAdornment,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Tooltip,
    Alert,
    Paper,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Link,
    FormControl, InputLabel, Select, FormHelperText
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    CheckCircle as CheckCircleIcon,
    HelpOutline as HelpIcon,
    CalendarMonth as CalendarIcon,
    Assignment as AssignmentIcon,
    GavelRounded as TermsIcon,
    PrivacyTip as PrivacyIcon,
    MedicalServices as MedicalIcon,
    ContactMail as ContactIcon,
} from '@mui/icons-material';
import axios from 'axios';
import Captcha from '../../../../components/Tools/Captcha';

// Regex validations
const nameRegex = /^[A-Za-zÀ-ÿñÑ\s]+$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook|yahoo|live|uthh\.edu)\.(com|mx)$/;
const phoneRegex = /^\d{10}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const StepOne = ({
    colors,
    isDarkTheme,
    formData,
    onFormDataChange,
    onNext,
    onStepCompletion,
    setNotification
}) => {
    // State management
    const [errors, setErrors] = useState({});
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [captchaValue, setCaptchaValue] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [openTermsModal, setOpenTermsModal] = useState(false);
    const [openPrivacyModal, setOpenPrivacyModal] = useState(false);
    const [termsConditions, setTermsConditions] = useState('');
    const [privacyPolicy, setPrivacyPolicy] = useState('');

    // Effect for alert auto-hide
    useEffect(() => {
        if (showAlert) {
            const timeout = setTimeout(() => setShowAlert(false), 5000);
            return () => clearTimeout(timeout);
        }
    }, [showAlert]);

    // Modal handlers
    const handleOpenPrivacyModal = async (event) => {
        event.preventDefault();
        if (!privacyPolicy) await fetchPrivacyPolicy();
        setOpenPrivacyModal(true);
    };

    const handleOpenTermsModal = async (event) => {
        event.preventDefault();
        if (!termsConditions) await fetchTermsConditions();
        setOpenTermsModal(true);
    };

    const handleClosePrivacyModal = () => setOpenPrivacyModal(false);
    const handleCloseTermsModal = () => setOpenTermsModal(false);
    const handleCloseSnackbar = () => setOpenSnackbar(false);

    // API calls
    const fetchPrivacyPolicy = async () => {
        try {
            const response = await axios.get('https://back-end-4803.onrender.com/api/politicas/politicas_privacidad');
            const activePolicy = response.data.find(policy => policy.estado === 'activo');
            setPrivacyPolicy(activePolicy ? activePolicy.contenido : 'No se encontraron políticas de privacidad activas.');
        } catch (error) {
            console.error('Error al obtener las políticas de privacidad', error);
            setPrivacyPolicy('Error al cargar las políticas de privacidad.');
        }
    };

    const fetchTermsConditions = async () => {
        try {
            const response = await axios.get('https://back-end-4803.onrender.com/api/termiCondicion/terminos_condiciones');
            const activeTerms = response.data.find(term => term.estado === 'activo');
            setTermsConditions(activeTerms ? activeTerms.contenido : 'No se encontraron términos y condiciones activos.');
        } catch (error) {
            console.error('Error al obtener los términos y condiciones', error);
            setTermsConditions('Error al cargar los términos y condiciones.');
        }
    };

    // Field validation
    const validateField = (name, value) => {
        let errorMessage = '';

        if ((name === 'correo' && formData.omitCorreo) || (name === 'telefono' && formData.omitTelefono)) {
            return '';
        }

        switch (name) {
            case 'nombre':
                if (!value.trim()) {
                    errorMessage = 'El nombre es obligatorio';
                } else if (!nameRegex.test(value)) {
                    errorMessage = 'Solo se permiten letras y espacios';
                }
                break;
            case 'apellidoPaterno':
                if (!value.trim()) {
                    errorMessage = 'El apellido paterno es obligatorio';
                } else if (!nameRegex.test(value)) {
                    errorMessage = 'Solo se permiten letras y espacios';
                }
                break;
            case 'apellidoMaterno':
                if (!value.trim()) {
                    errorMessage = 'El apellido materno es obligatorio';
                } else if (!nameRegex.test(value)) {
                    errorMessage = 'Solo se permiten letras y espacios';
                }
                break;
            case 'genero':
                if (!value.trim()) {
                    errorMessage = 'El género es obligatorio';
                }
                break;
            case 'fechaNacimiento':
                if (!value.trim()) {
                    errorMessage = 'La fecha de nacimiento es obligatoria';
                } else if (!dateRegex.test(value)) {
                    errorMessage = 'Formato de fecha inválido (YYYY-MM-DD)';
                }
                break;
            case 'correo':
                if (!value.trim()) {
                    errorMessage = 'El correo es obligatorio o marca la casilla "Omitir correo"';
                } else if (!emailRegex.test(value)) {
                    errorMessage = 'Correo electrónico inválido';
                }
                break;
            case 'telefono':
                if (!value.trim()) {
                    errorMessage = 'El teléfono es obligatorio o marca la casilla "Omitir teléfono"';
                } else if (!phoneRegex.test(value)) {
                    errorMessage = 'Debe contener 10 dígitos';
                }
                break;
            case 'motivoCita':
                if (!value.trim()) {
                    errorMessage = 'Indica brevemente el motivo de la cita';
                }
                break;
            case 'lugar':
                if (!value.trim()) {
                    errorMessage = 'El lugar de proveniencia es obligatorio';
                }
                break;
            case 'otroLugar':
                if (formData.lugar === 'Otro' && !value.trim()) {
                    errorMessage = 'Especifica el lugar si seleccionaste "Otro"';
                }
                break;

            default:
                break;
        }
        return errorMessage;
    };

    // Change handlers
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            onFormDataChange({ [name]: checked });
            if (name === 'omitCorreo' && checked) {
                onFormDataChange({ correo: '' });
                setErrors((prev) => ({ ...prev, correo: '' }));
            }
            if (name === 'omitTelefono' && checked) {
                onFormDataChange({ telefono: '' });
                setErrors((prev) => ({ ...prev, telefono: '' }));
            }
            return;
        }

        onFormDataChange({ [name]: value });
        const errorMessage = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: errorMessage }));
    };

    // Next step handler
    const handleNext = () => {
        const requiredFields = [
            'nombre',
            'apellidoPaterno',
            'apellidoMaterno',
            'genero',
            'fechaNacimiento',
            'motivoCita',
        ];

        if (!formData.omitCorreo) requiredFields.push('correo');
        if (!formData.omitTelefono) requiredFields.push('telefono');

        requiredFields.push('lugar');
        if (formData.lugar === 'Otro') requiredFields.push('otroLugar');

        const newErrors = {};
        requiredFields.forEach((field) => {
            const errorMessage = validateField(field, formData[field]);
            if (errorMessage) newErrors[field] = errorMessage;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setNotification({
                open: true,
                message: 'Por favor, completa todos los campos requeridos correctamente.',
                type: 'error'
            });
            setShowAlert(true);
            return;
        }

        if (!termsAccepted || !privacyAccepted || !captchaValue) {
            setOpenSnackbar(true);
            return;
        }

        onStepCompletion('step1', true);
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
                <MedicalIcon /> Identificación del Paciente
            </Typography>

            {showAlert && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Por favor completa los campos obligatorios y verifica las casillas.
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Personal Information Section */}
                <Grid item xs={12}>
                    <Typography variant="h6" color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon /> Información Personal
                    </Typography>
                </Grid>

                {/* Name Fields */}
                <Grid item xs={12} md={4}>
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

                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="Apellido Paterno"
                        name="apellidoPaterno"
                        value={formData.apellidoPaterno}
                        onChange={handleChange}
                        required
                        error={!!errors.apellidoPaterno}
                        helperText={errors.apellidoPaterno}
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="Apellido Materno"
                        name="apellidoMaterno"
                        value={formData.apellidoMaterno}
                        onChange={handleChange}
                        required
                        error={!!errors.apellidoMaterno}
                        helperText={errors.apellidoMaterno}
                    />
                </Grid>

                {/* Additional Personal Information */}
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
                        <MenuItem value="">Selecciona</MenuItem>
                        <MenuItem value="Masculino">Masculino</MenuItem>
                        <MenuItem value="Femenino">Femenino</MenuItem>
                        <MenuItem value="Prefiero no decirlo">Prefiero no decirlo</MenuItem>
                    </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Fecha de Nacimiento"
                        name="fechaNacimiento"
                        type="date"
                        value={formData.fechaNacimiento}
                        onChange={handleChange}
                        required
                        error={!!errors.fechaNacimiento}
                        helperText={errors.fechaNacimiento || 'Formato: YYYY-MM-DD'}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <CalendarIcon color="primary" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                {/* Lugar de Proveniencia */}
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth required error={!!errors.lugar}>
                        <InputLabel>Lugar de Proveniencia</InputLabel>
                        <Select
                            value={formData.lugar}
                            onChange={handleChange}
                            label="Lugar de Proveniencia"
                            name="lugar"
                        >
                            <MenuItem value="Ixcatlan">Ixcatlan</MenuItem>
                            <MenuItem value="Tepemaxac">Tepemaxac</MenuItem>
                            <MenuItem value="Pastora">Pastora</MenuItem>
                            <MenuItem value="Ahuacatitla">Ahuacatitla</MenuItem>
                            <MenuItem value="Tepeica">Tepeica</MenuItem>
                            <MenuItem value="Axcaco">Axcaco</MenuItem>
                            <MenuItem value="Otro">Otro</MenuItem>
                        </Select>
                        {errors.lugar && <FormHelperText error>{errors.lugar}</FormHelperText>}
                    </FormControl>
                </Grid>

                {/* Campo adicional si el lugar es "Otro" */}
                {formData.lugar === 'Otro' && (
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Especificar Lugar"
                            name="otroLugar"
                            value={formData.otroLugar}
                            onChange={handleChange}
                            required
                            error={!!errors.otroLugar}
                            helperText={errors.otroLugar || 'Escribe el lugar específico'}
                        />
                    </Grid>
                )}

                {/* Contact Information Section */}
                <Grid item xs={12}>
                    <Typography variant="h6" color="primary" sx={{ mt: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ContactIcon /> Información de Contacto
                    </Typography>
                </Grid>

                {/* Email Field and Checkbox */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Correo"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        disabled={formData.omitCorreo}
                        error={!!errors.correo}
                        helperText={errors.correo || (formData.omitCorreo ? 'Has decidido omitir el correo' : '')}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailIcon color="primary" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData.omitCorreo}
                                onChange={handleChange}
                                name="omitCorreo"
                                color="primary"
                            />
                        }
                        label="Omitir correo"
                    />
                </Grid>

                {/* Phone Field and Checkbox */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Teléfono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        disabled={formData.omitTelefono}
                        error={!!errors.telefono}
                        helperText={errors.telefono || (formData.omitTelefono ? 'Has decidido omitir el teléfono' : '')}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PhoneIcon color="primary" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData.omitTelefono}
                                onChange={handleChange}
                                name="omitTelefono"
                                color="primary"
                            />
                        }
                        label="Omitir teléfono"
                    />
                </Grid>

{/* Selección del Servicio Section */}
<Grid item xs={12}>
    <Typography 
        variant="h6" 
        color="primary" 
        sx={{ mt: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
    >
        <AssignmentIcon /> Selección del Servicio
    </Typography>
</Grid>

{/* Servicio Seleccionado */}
<Grid item xs={12} md={6}>
    <FormControl fullWidth required error={!!errors.servicio}>
        <InputLabel>Servicio</InputLabel>
        <Select
            value={formData.servicio}
            onChange={handleChange}
            label="Servicio"
            name="servicio"
        >
            <MenuItem value="">Seleccione un servicio</MenuItem>
            <MenuItem value="Consulta General">Consulta General</MenuItem>
            <MenuItem value="Limpieza Dental">Limpieza Dental</MenuItem>
            <MenuItem value="Ortodoncia">Ortodoncia</MenuItem>
            <MenuItem value="Endodoncia">Endodoncia</MenuItem>
            <MenuItem value="Implantes Dentales">Implantes Dentales</MenuItem>
        </Select>
        {errors.servicio && <FormHelperText error>{errors.servicio}</FormHelperText>}
    </FormControl>
</Grid>


{/* Sección de Términos, Política y Captcha sin elevación */}
<Grid item xs={12}>
    <Typography 
        variant="h6" 
        color="primary" 
        sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
    >
        <TermsIcon /> Términos y Condiciones
    </Typography>

    {/* Checkbox para Aceptar Términos y Política */}
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', mb: 3 }}>
        <FormControlLabel
            control={
                <Checkbox
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    color="primary"
                />
            }
            label={
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Acepto los <Link href="#" onClick={handleOpenTermsModal}>términos y condiciones</Link> 
                    y la <Link href="#" onClick={handleOpenPrivacyModal}>política de privacidad</Link>.
                </Typography>
            }
        />
    </Box>

    {/* Captcha Centrado */}
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Box sx={{ maxWidth: '300px', width: '100%' }}>
            <Captcha onChange={setCaptchaValue} />
        </Box>
    </Box>
</Grid>

{/* Snackbar para mostrar alertas */}
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


                {/* Continue Button */}
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        startIcon={<CheckCircleIcon />}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 'bold',
                            py: 1.5,
                            px: 4,
                            borderRadius: 2
                        }}
                    >
                        Continuar
                    </Button>
                </Grid>

                {/* Terms Modal */}
                <Dialog
                    open={openTermsModal}
                    onClose={handleCloseTermsModal}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TermsIcon /> Términos y Condiciones
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Typography>{termsConditions}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseTermsModal} color="primary">
                            Cerrar
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Privacy Modal */}
                <Dialog
                    open={openPrivacyModal}
                    onClose={handleClosePrivacyModal}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PrivacyIcon /> Política de Privacidad
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Typography>{privacyPolicy}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClosePrivacyModal} color="primary">
                            Cerrar
                        </Button>
                    </DialogActions>
                </Dialog>

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
            </Grid>
        </Paper>
    );
};

export default StepOne;