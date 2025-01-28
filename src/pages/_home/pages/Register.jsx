import { Alert, Box, Button, Card, CardContent, Checkbox, CircularProgress, Container, FormControl, FormControlLabel, FormHelperText, Grid, IconButton, InputAdornment, InputLabel, Link, MenuItem, Modal, Select, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaEnvelope, FaEye, FaEyeSlash, FaInfoCircle, FaLock, FaPhone, FaPlusCircle, FaUser } from 'react-icons/fa'; // Importamos 
import { useNavigate } from 'react-router-dom';
import zxcvbn from 'zxcvbn';
import ErrorBoundary from '../../../components/Tools/ErrorBoundary';
import Notificaciones from '../../../components/Layout/Notificaciones';



const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    nombre: '',
    aPaterno: '',
    aMaterno: '',
    fechaNacimiento: '',
    esMayorDeEdad: true, // Campo para reflejar si es mayor de edad
    genero: '',
    lugar: '',
    otroLugar: '',
    telefono: '',
    email: '',
    alergias: [],
    otraAlergia: '',
    tipoTutor: '',
    nombreTutor: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isVerifiedComplete, setIsVerifiedComplete] = useState(false);
  const [emailVerificationError, setEmailVerificationError] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [openNotification, setOpenNotification] = useState(false); const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordSafe, setIsPasswordSafe] = useState(false);
  const [isPasswordFiltered, setIsPasswordFiltered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const steps = ['Datos personales', 'Información de contacto', 'Datos de acceso'];
  const nameRegex = /^[A-Za-zÀ-ÿ\u00f1\u00d1\u00e0-\u00fc\s]+$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook|yahoo|live|uthh\.edu)\.(com|mx)$/;
  const phoneRegex = /^\d{10}$/;
  const today = new Date().toISOString().split('T')[0];
  const [showChangeEmailConfirmation, setShowChangeEmailConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEmailEditable, setIsEmailEditable] = useState(true); // Controlar si el correo es editable
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [termsConditions, setTermsConditions] = useState('');
  const [openPrivacyModal, setOpenPrivacyModal] = useState(false);
  const [openTermsModal, setOpenTermsModal] = useState(false);
  const [allAccepted, setAllAccepted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(matchDarkTheme.matches);

    const handleThemeChange = (e) => {
      setIsDarkMode(e.matches);
    };

    matchDarkTheme.addEventListener('change', handleThemeChange);
    return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
  }, []);

  const handleAcceptChange = (event) => {
    setAllAccepted(event.target.checked);
  };

  // Función para abrir el modal de políticas de privacidad y obtener su contenido si aún no está cargado
  const handleOpenPrivacyModal = async (event) => {
    event.stopPropagation();
    if (!privacyPolicy) await fetchPrivacyPolicy(); // Solo llamar si no está cargado
    setOpenPrivacyModal(true);
  };

  // Función para abrir el modal de términos y condiciones y obtener su contenido si aún no está cargado
  const handleOpenTermsModal = async (event) => {
    event.stopPropagation();
    if (!termsConditions) await fetchTermsConditions(); // Solo llamar si no está cargado
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


  const handleCloseNotification = () => {
    setOpenNotification(false); // Función para cerrar la notificacióooon
  };

  // Función para alternar la visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Función para alternar la visibilidad de la confirmación de contraseña
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Función para verificar las reglas personalizadas
  const checkPasswordRules = (password) => {
    const errors = [];
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength = password.length >= 8;
    const noRepeatingChars = !/(.)\1{2}/.test(password);  // No repetir más de 3 letras seguidas

    if (!hasUpperCase) errors.push('Debe tener al menos una letra mayúscula.');
    if (!hasNumber) errors.push('Debe tener al menos un número.');
    if (!hasSpecialChar) errors.push('Debe tener al menos un símbolo especial.');
    if (!hasMinLength) errors.push('Debe tener más de 8 caracteres.');
    if (!noRepeatingChars) errors.push('No puede tener más de 3 letras seguidas iguales.');

    return errors;
  };

  // Función para verificar tanto la seguridad como las reglas de la contraseña
  const checkPasswordValidity = async (password) => {
    const customErrors = checkPasswordRules(password);

    if (customErrors.length > 0) {
      // Si no cumple con las reglas personalizadas, mostramos los errores
      setPasswordError(customErrors.join(' '));
      setIsPasswordSafe(false);  // Marcar como insegura
      return false;
    }

    // Si cumple con las reglas personalizadas, verificamos si la contraseña ha sido filtrada
    setIsLoading(true);
    try {
      const hashedPassword = CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex);
      const prefix = hashedPassword.slice(0, 5);
      const suffix = hashedPassword.slice(5);

      const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
      const hashes = response.data.split('\n').map(line => line.split(':')[0]);

      if (hashes.includes(suffix.toUpperCase())) {
        setPasswordError('Contraseña insegura: ha sido filtrada en brechas de datos.');
        setIsPasswordSafe(false);
        setIsPasswordFiltered(true);
        return false;  // No permitir el registro
      } else {
        // Si la contraseña no ha sido filtrada
        setPasswordError('');
        setIsPasswordSafe(true);
        setIsPasswordFiltered(false);
        return true;  // Permitir el registro
      }
    } catch (error) {
      console.error('Error al verificar la contraseña:', error);
      setPasswordError('Error al verificar la contraseña.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar el cambio en los campos
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Remover espacios en blanco al principio y al final del valor
    const trimmedValue = value.trim();

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Validación de la contraseña
    if (name === 'password') {
      const strength = zxcvbn(value).score;
      setPasswordStrength(strength);
      checkPasswordValidity(value).then((isValid) => {
        if (!isValid) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            password: 'La contraseña no cumple con los requisitos o ha sido filtrada.',
          }));
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            password: '',
          }));
        }
      });
    }

    if (name === 'nombre') {
      const trimmedValue = value.trim(); // Elimina espacios al inicio y final
      if (!nameRegex.test(trimmedValue)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          nombre: 'El nombre solo debe contener letras, espacios y acentos.',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          nombre: '',
        }));
      }
      setFormData((prevData) => ({
        ...prevData,
        [name]: value, // Guarda el valor ingresado (sin modificar espacios internos)
      }));
    }

    if (name === 'aPaterno') {
      if (!nameRegex.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          aPaterno: 'El apellido paterno solo debe contener letras',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          aPaterno: '',
        }));
      }
    }

    if (name === 'aMaterno') {
      if (!nameRegex.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          aMaterno: 'El apellido materno solo debe contener letras',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          aMaterno: '',
        }));
      }
    }
    // Manejar fecha de nacimiento
    if (name === 'fechaNacimiento') {
      const hoy = new Date();
      const nacimiento = new Date(value);
      const edad = hoy.getFullYear() - nacimiento.getFullYear();
      const esMenorDeEdad =
        edad < 18 ||
        (edad === 18 &&
          (hoy.getMonth() < nacimiento.getMonth() ||
            (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())));

      setFormData((prevData) => ({
        ...prevData,
        esMayorDeEdad: !esMenorDeEdad, // Actualizar si es mayor de edad
      }));

      // Limpiar los datos del tutor si es mayor de edad
      if (!esMenorDeEdad) {
        setFormData((prevData) => ({
          ...prevData,
          tipoTutor: '',
          nombreTutor: '',
        }));
        setErrors((prevErrors) => ({
          ...prevErrors,
          tipoTutor: '',
          nombreTutor: '',
        }));
      }
    }
    // Validar otros campos como tipoTutor y nombreTutor solo si es menor de edad
    if (name === 'tipoTutor' && !formData.esMayorDeEdad) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        tipoTutor: value ? '' : 'Selecciona el tipo de tutor',
      }));
    }

    if (name === 'relacionTutor') {
      const trimmedValue = value.trim(); // Elimina espacios en blanco
      if (!nameRegex.test(trimmedValue) || trimmedValue === '') {
        setErrors((prevErrors) => ({
          ...prevErrors,
          relacionTutor: 'La relación solo debe contener letras, espacios y acentos.',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          relacionTutor: '',
        }));
      }
      setFormData((prevData) => ({
        ...prevData,
        [name]: trimmedValue,
      }));
    }

    if (name === 'nombreTutor') {
      if (!nameRegex.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          nombreTutor: 'El nombre del tutor solo debe contener letras y espacios.',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          nombreTutor: '',
        }));
      }
    }

    if (name === 'email') {
      if (value !== trimmedValue || !emailRegex.test(trimmedValue)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: 'Verifique que su correo sea valido',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: '',
        }));
      }
    }

    if (name === 'telefono') {
      if (!phoneRegex.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          telefono: 'Verifique que su numero de telefono sea valido',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          telefono: '',
        }));
      }
    }

    if (name === 'alergias' && value.includes('Otro')) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        otraAlergia: formData.otraAlergia ? '' : 'Especifica la alergia',
      }));
    }

    if (name === 'otraAlergia') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        otraAlergia: value.trim() ? '' : 'Especifica la alergia',
      }));
    }

  };


  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const updateTutorFullName = (nombre, apellidos) => {
    const nombreCompleto = `${nombre || ''} ${apellidos || ''}`.trim();
    setFormData(prev => ({
      ...prev,
      nombreTutor: nombreCompleto,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevenir múltiples envíos
    if (isSubmitting || isLoading) return;

    try {
      setIsSubmitting(true);
      setIsLoading(true);

      // Validaciones iniciales
      let newErrors = {};

      // Validación para "Otro" en alergias
      if (formData.alergias.includes('Otro') && !formData.otraAlergia.trim()) {
        newErrors.otraAlergia = 'Especifica la alergia';
      }

      // Validación de lugar "Otro"
      if (formData.lugar === 'Otro' && !formData.otroLugar.trim()) {
        newErrors.otroLugar = 'Especifica el lugar';
      }

      // Validación de tutor si es menor de edad
      // En tu handleSubmit o donde manejes las validaciones
      if (!formData.esMayorDeEdad) {
        if (!formData.tipoTutor) {
          newErrors.tipoTutor = 'Selecciona el tipo de tutor';
        }

        if (formData.tipoTutor === 'Otro' && !formData.relacionTutor?.trim()) {
          newErrors.relacionTutor = 'Especifica el tipo de tutor';
        }

        if (!formData.nombreTutorNombre?.trim()) {
          newErrors.nombreTutorNombre = 'El nombre del tutor es requerido';
        }

        if (!formData.nombreTutorApellidos?.trim()) {
          newErrors.nombreTutorApellidos = 'Los apellidos del tutor son requeridos';
        }
      }

      // Si hay errores de validación, detener el proceso
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        throw new Error('Por favor, completa todos los campos requeridos');
      }

      // Verificar contraseña
      const isPasswordValid = await checkPasswordValidity(formData.password);
      if (!isPasswordValid || passwordStrength < 3) {
        throw new Error(
          passwordStrength < 3
            ? 'La contraseña debe ser al menos "Fuerte" para continuar.'
            : 'La contraseña debe cumplir con los requisitos y no estar comprometida.'
        );
      }

      // Preparar datos para el envío
      const dataToSubmit = {
        ...formData,
        lugar: formData.lugar === 'Otro' ? formData.otroLugar : formData.lugar,
        alergias: formData.alergias.map(alergia =>
          alergia === 'Otro' ? formData.otraAlergia : alergia
        ),
        tutor: !formData.esMayorDeEdad
          ? { tipo: formData.tipoTutor, nombre: formData.nombreTutor }
          : null,
      };

      // Enviar datos
      const response = await axios.post(
        'http://localhost:3001/api/register',
        dataToSubmit,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      // Manejar respuesta exitosa
      if (response.status === 200 || response.status === 201) {
        setNotificationMessage('¡Registro exitoso! Redirigiendo...');
        setNotificationType('success');
        setOpenNotification(true);

        // Redirigir después de mostrar el mensaje
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }

    } catch (error) {
      // Manejar errores
      let errorMessage = 'Error en el registro. Intenta nuevamente.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setNotificationMessage(errorMessage);
      setNotificationType('error');
      setOpenNotification(true);

    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = () => {
    // Permitir la edición del correo electrónico
    setIsEmailEditable(true);
    setShowChangeEmailConfirmation(false);

    // Reinicia los estados relacionados con la verificación
    setIsEmailSent(false);
    setIsEmailVerified(false);
    setIsVerifiedComplete(false);
    setEmailVerificationError('');
    setFormData((prevFormData) => ({
      ...prevFormData,
      verificationToken: '', // Limpia el token
    }));

    // Notificación opcional
    setNotificationMessage('Por favor, ingresa el nuevo correo y verifica nuevamente.');
    setNotificationType('info');
    setOpenNotification(true);
  };

  const handleVerifyEmail = async () => {
    const trimmedEmail = formData.email.trim(); // Eliminar espacios en blanco

    if (!formData.email) {
      setEmailVerificationError('Por favor, ingresa un correo electrónico.');
      return;
    }

    if (!trimmedEmail) {
      setEmailVerificationError('Por favor, ingresa un correo electrónico.');
      return;
    }

    // Verificar si el correo tiene el formato y dominio correcto
    if (!emailRegex.test(formData.email)) {
      setEmailVerificationError('Verifique que su correo sea ingresado correctamente');
      return;
    }

    setIsVerifyingEmail(true); // Cambia el botón a "Verificando..."
    setEmailVerificationError(''); // Limpia cualquier error previo

    try {
      const response = await axios.post('http://localhost:3001/api/send-verification-email', {
        email: trimmedEmail,
      });

      if (response.status === 200) {
        setIsEmailSent(true); // Indica que el correo fue enviado
        setIsEmailEditable(false); // Bloquea el campo de correo
        setNotificationMessage('Correo de verificación enviado.');
        setNotificationType('success');
        setOpenNotification(true);
      }
    } catch (error) {
      // Verifica si el servidor responde con un mensaje indicando que el correo ya está registrado
      if (error.response && error.response.status === 400 && error.response.data.message) {
        if (error.response.data.message === 'El correo electrónico ya está registrado.') {
          setEmailVerificationError('El correo electrónico ya está registrado. Por favor, intenta con otro correo.');
          setNotificationMessage('El correo electrónico ya está registrado.'); // Agregamos el mensaje a la notificación
          setNotificationType('error'); // Establece el tipo de notificación
          setOpenNotification(true); // Abre la notificación
        } else {
          setEmailVerificationError(error.response.data.message); // Captura otros mensajes de error del servidor
        }
      } else {
        setEmailVerificationError('Error al enviar el correo de verificación.');
      }
    } finally {
      setIsVerifyingEmail(false); // Finaliza la verificación
    }
  };

  // Verificar el token de verificación
  const handleVerifyToken = async () => {
    if (!formData.verificationToken) {
      setEmailVerificationError('Por favor, ingresa el token de verificación.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/verify-token', {
        email: formData.email,
        token: formData.verificationToken,
      });

      if (response.status === 200) {
        setIsEmailVerified(true); // Verificación completada
        setIsVerifiedComplete(true); // Marca como verificado
        setEmailVerificationError('');
        setNotificationMessage('Correo verificado correctamente.');
        setNotificationType('success');
        setOpenNotification(true);
      }
    } catch (error) {
      // Mostrar el mensaje específico que el servidor envía
      if (error.response && error.response.status === 400) {
        setEmailVerificationError(error.response.data.message); // Mostrar mensaje específico de token inválido o expirado
      } else {
        setEmailVerificationError('Error en el servidor al verificar el token.');
      }
    }
  };

  const validateStep = () => {
    const stepErrors = {};
    const nameRegex = /^[A-Za-zÀ-ÿ\u00f1\u00d1\u00e0-\u00fc\s]+$/; // Acepta acentos, ñ y espacios.

    if (activeStep === 0) {
      // Validación de nombre y apellidos (solo letras, espacios y acentos)
      if (!formData.nombre || !nameRegex.test(formData.nombre)) {
        stepErrors.nombre = 'El nombre solo debe contener letras, espacios y acentos.';
      }
      if (!formData.aPaterno || !nameRegex.test(formData.aPaterno)) {
        stepErrors.aPaterno = 'El apellido paterno solo debe contener letras, espacios y acentos.';
      }
      if (!formData.aMaterno || !nameRegex.test(formData.aMaterno)) {
        stepErrors.aMaterno = 'El apellido materno solo debe contener letras, espacios y acentos.';
      }

      // Validación de género y lugar de procedencia
      if (!formData.genero) {
        stepErrors.genero = 'Selecciona un género';
      }
      if (formData.lugar === 'Otro' && !formData.otroLugar) {
        stepErrors.otroLugar = 'Especifica el lugar';
      }

      // Validación de campos personales
      if (!formData.fechaNacimiento) {
        stepErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
      }
      if (formData.tipoTutor === 'Otro' && (!formData.relacionTutor || formData.relacionTutor.trim() === '')) {
        stepErrors.relacionTutor = 'Por favor, especifica la relación con el menor.';
      }

      // Validar tutor si es menor de edad
      const hoy = new Date();
      const nacimiento = new Date(formData.fechaNacimiento);
      const edad = hoy.getFullYear() - nacimiento.getFullYear();
      const esMenorDeEdad =
        edad < 18 || (edad === 18 && (hoy.getMonth() < nacimiento.getMonth() || (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())));

      if (esMenorDeEdad) {
        if (!formData.tipoTutor) {
          stepErrors.tipoTutor = 'Selecciona el tipo de tutor';
        }
        if (!formData.nombreTutor || formData.nombreTutor.trim() === '') {
          stepErrors.nombreTutor = 'El nombre del tutor es obligatorio';
        }
      }
    }

    if (activeStep === 1) {
      if (!formData.telefono) stepErrors.telefono = 'El teléfono es requerido';
      if (!formData.email) stepErrors.email = 'El correo electrónico es requerido';
      if (formData.alergias.includes('Otro') && !formData.otraAlergia.trim()) {
        stepErrors.otraAlergia = 'Especifica la alergia';
      }
    }

    if (activeStep === 2) {
      if (!formData.password) stepErrors.password = 'La contraseña es requerida';
      if (formData.password !== formData.confirmPassword) stepErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const alergiasInfo = {
    Penicilina: 'Antibiótico común.',
    Látex: 'Material en guantes y equipo dental.',
    'Anestésicos Locales': 'Utilizado en procedimientos odontológicos.',
    Metales: 'Usado en coronas y aparatos.',
    Acrílico: 'Presente en prótesis dentales.',
  };

  const commonTextFieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
      transition: 'all 0.3s ease',
      '&:hover fieldset': {
        borderColor: '#03427c',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#03427c',
        borderWidth: '2px'
      },
      '& fieldset': {
        borderColor: 'rgba(3, 66, 124, 0.2)'
      }
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(3, 66, 124, 0.7)',
      '&.Mui-focused': {
        color: '#03427c',
      }
    },
    '& .MuiInputAdornment-root': {
      '& .MuiSvgIcon-root': {
        color: '#03427c'
      }
    }
  }


  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {/* Datos Personales Título */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#03427c',
                    mb: 2,
                    fontWeight: 600,
                    position: 'relative',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: '40px',
                      height: '3px',
                      backgroundColor: '#03427c',
                      borderRadius: '2px'
                    }
                  }}
                >
                  Datos Personales
                </Typography>
              </Grid>

              {/* Campos de nombre y apellidos en una fila */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^A-Za-zÀ-ÿ\u00f1\u00d1\u00e0-\u00fc\s]/g, '');
                  }}
                  required
                  error={!!errors.nombre}
                  helperText={errors.nombre || 'Solo letras, espacios y acentos.'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaUser style={{ color: errors.nombre ? '#d32f2f' : '#03427c' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#03427c',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#03427c',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#03427c',
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Apellido Paterno"
                  name="aPaterno"
                  value={formData.aPaterno}
                  onChange={handleChange}
                  required
                  error={!!errors.aPaterno}
                  helperText={errors.aPaterno || 'Solo letras, espacios y acentos.'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaUser style={{ color: errors.aPaterno ? '#d32f2f' : '#03427c' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#03427c',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#03427c',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#03427c',
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Apellido Materno"
                  name="aMaterno"
                  value={formData.aMaterno}
                  onChange={handleChange}
                  required
                  error={!!errors.aMaterno}
                  helperText={errors.aMaterno || 'Solo letras, espacios y acentos.'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaUser style={{ color: errors.aMaterno ? '#d32f2f' : '#03427c' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#03427c',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#03427c',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#03427c',
                    }
                  }}
                />
              </Grid>

              {/* Género y Fecha de Nacimiento */}
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  required
                  error={!!errors.genero}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#03427c',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#03427c',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#03427c',
                    }
                  }}
                >
                  <InputLabel>Género</InputLabel>
                  <Select
                    value={formData.genero}
                    onChange={handleChange}
                    label="Género"
                    name="genero"
                  >
                    <MenuItem value="Masculino">Masculino</MenuItem>
                    <MenuItem value="Femenino">Femenino</MenuItem>
                    <MenuItem value="Otro">Prefiero no decirlo</MenuItem>
                  </Select>
                  {errors.genero && (
                    <FormHelperText error>{errors.genero}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* CAMPO DE EDAD */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fecha de Nacimiento"
                  name="fechaNacimiento"
                  type="date"
                  inputProps={{
                    max: today,
                    style: {
                      fontSize: '1rem',
                      padding: '12px',
                      cursor: 'pointer'
                    }
                  }}
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  required
                  error={!!errors.fechaNacimiento}
                  helperText={errors.fechaNacimiento || 'Selecciona tu fecha de nacimiento'}
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      fontSize: '1rem',
                      transform: 'translate(14px, -9px) scale(0.75)'
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,1)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#03427c',
                        borderWidth: '2px',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#03427c',
                        borderWidth: '2px'
                      },
                      '& input::-webkit-calendar-picker-indicator': {
                        cursor: 'pointer',
                        padding: '8px',
                        position: 'absolute',
                        right: '8px',
                        filter: isDarkMode ? 'invert(1)' : 'none',
                        opacity: 0.7,
                        '&:hover': {
                          opacity: 1
                        }
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(3, 66, 124, 0.7)',
                      '&.Mui-focused': {
                        color: '#03427c',
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: isDarkMode ? '#ffffff' : '#000000',
                    }
                  }}
                />
              </Grid>

              {/* Mensaje de menor de edad */}
              {formData.fechaNacimiento && !formData.esMayorDeEdad && (
                <Grid item xs={12}>
                  <Alert
                    severity="info"
                    variant="filled"
                    icon={<InfoIcon sx={{ fontSize: '1.5rem' }} />}
                    sx={{
                      mt: 1,
                      borderRadius: '8px',
                      '& .MuiAlert-icon': {
                        opacity: 1,
                        alignItems: 'center'
                      },
                      '& .MuiAlert-message': {
                        padding: '8px 0'
                      },
                      animation: 'fadeIn 0.5s ease-in-out',
                      '@keyframes fadeIn': {
                        '0%': {
                          opacity: 0,
                          transform: 'translateY(-10px)'
                        },
                        '100%': {
                          opacity: 1,
                          transform: 'translateY(0)'
                        }
                      }
                    }}
                  >
                    Al ser menor de edad, necesitaremos los datos del tutor.
                  </Alert>
                </Grid>
              )}

              {/* Campos del tutor */}
              {formData.fechaNacimiento && !formData.esMayorDeEdad && (
                <>
                  <Grid item xs={12}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#03427c',
                        mt: 2,
                        mb: 2,
                        fontWeight: 600
                      }}
                    >
                      Datos del Tutor
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl
                      fullWidth
                      required
                      error={!!errors.tipoTutor}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                          '&:hover fieldset': {
                            borderColor: '#03427c',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#03427c',
                            borderWidth: '2px'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(3, 66, 124, 0.7)',
                          '&.Mui-focused': {
                            color: '#03427c',
                          }
                        }
                      }}
                    >
                      <InputLabel>Tipo de Tutor</InputLabel>
                      <Select
                        value={formData.tipoTutor || ''}
                        onChange={handleChange}
                        label="Tipo de Tutor"
                        name="tipoTutor"
                      >
                        <MenuItem value="Madre">Madre</MenuItem>
                        <MenuItem value="Padre">Padre</MenuItem>
                        <MenuItem value="Abuelo/a">Abuelo/a</MenuItem>
                        <MenuItem value="Tío/a">Tío/a</MenuItem>
                        <MenuItem value="Hermano/a">Hermano/a</MenuItem>
                        <MenuItem value="Otro">Otro</MenuItem>
                      </Select>
                      {errors.tipoTutor && (
                        <FormHelperText error>{errors.tipoTutor}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {formData.tipoTutor === 'Otro' && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Especificar tipo de tutor"
                        name="relacionTutor"
                        value={formData.relacionTutor || ''}
                        onChange={handleChange}
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(/[^A-Za-zÀ-ÿ\u00f1\u00d1\u00e0-\u00fc\s]/g, '');
                        }}
                        required
                        error={!!errors.relacionTutor}
                        helperText={errors.relacionTutor || 'Ejemplo: Tío, Abuelo, etc.'}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                            '&:hover fieldset': {
                              borderColor: '#03427c',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#03427c',
                              borderWidth: '2px'
                            }
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(3, 66, 124, 0.7)',
                            '&.Mui-focused': {
                              color: '#03427c',
                            }
                          }
                        }}
                      />
                    </Grid>
                  )}

                  {/* Nombre del Tutor separado en campos */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nombre del Tutor"
                      name="nombreTutorNombre"
                      value={formData.nombreTutorNombre || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^A-Za-zÀ-ÿ\u00f1\u00d1\u00e0-\u00fc\s]/g, '');
                        handleChange({ ...e, target: { ...e.target, value } });
                        const nombreCompleto = `${value} ${formData.nombreTutorApellidos || ''}`.trim();
                        setFormData(prev => ({
                          ...prev,
                          nombreTutorNombre: value,
                          nombreTutor: nombreCompleto
                        }));
                      }}
                      required
                      error={!!errors.nombreTutorNombre}
                      helperText={errors.nombreTutorNombre || 'Ingresa el nombre'}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                          '&:hover fieldset': {
                            borderColor: '#03427c',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#03427c',
                            borderWidth: '2px'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(3, 66, 124, 0.7)',
                          '&.Mui-focused': {
                            color: '#03427c',
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Apellidos del Tutor"
                      name="nombreTutorApellidos"
                      value={formData.nombreTutorApellidos || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^A-Za-zÀ-ÿ\u00f1\u00d1\u00e0-\u00fc\s]/g, '');
                        handleChange({ ...e, target: { ...e.target, value } });
                        const nombreCompleto = `${formData.nombreTutorNombre || ''} ${value}`.trim();
                        setFormData(prev => ({
                          ...prev,
                          nombreTutorApellidos: value,
                          nombreTutor: nombreCompleto
                        }));
                      }}
                      required
                      error={!!errors.nombreTutorApellidos}
                      helperText={errors.nombreTutorApellidos || 'Ingresa los apellidos'}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                          '&:hover fieldset': {
                            borderColor: '#03427c',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#03427c',
                            borderWidth: '2px'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(3, 66, 124, 0.7)',
                          '&.Mui-focused': {
                            color: '#03427c',
                          }
                        }
                      }}
                    />
                  </Grid>
                </>
              )}

              {/* Lugar de Procedencia */}
              <Grid item xs={12}>
                <FormControl
                  fullWidth
                  required
                  error={!!errors.lugar}
                  sx={{
                    mt: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#03427c',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#03427c',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#03427c',
                    }
                  }}
                >
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

              {formData.lugar === 'Otro' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Especificar Lugar"
                    name="otroLugar"
                    value={formData.otroLugar}
                    onChange={handleChange}
                    required
                    error={!!errors.otroLugar}
                    helperText={errors.otroLugar || 'Escribe el lugar específico'}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#03427c',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#03427c',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#03427c',
                      }
                    }}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* Sección de Verificación de Email */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#03427c',
                    mb: 3,
                    fontWeight: 600,
                    position: 'relative',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: '40px',
                      height: '3px',
                      backgroundColor: '#03427c',
                      borderRadius: '2px'
                    }
                  }}
                >
                  Verificación de Correo
                </Typography>
              </Grid>

              {/* Campo de Email y Botones */}
              <Grid item xs={12}>
                <Box sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'flex-start' },
                  gap: 2
                }}>
                  <TextField
                    fullWidth
                    label="Correo electrónico"
                    name="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setIsEmailSent(false);
                      setIsEmailVerified(false);
                      setIsVerifiedComplete(false);
                    }}
                    required
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={!isEmailEditable}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaEnvelope style={{ color: errors.email ? '#d32f2f' : '#03427c' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#03427c',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#03427c',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#03427c',
                      }
                    }}
                  />

                  {!isEmailVerified && (
                    <Button
                      variant="contained"
                      onClick={handleVerifyEmail}
                      disabled={isVerifyingEmail || isVerifiedComplete || isEmailSent}
                      sx={{
                        bgcolor: '#03427c',
                        minWidth: '150px',
                        height: '56px',
                        '&:hover': {
                          bgcolor: '#02305c'
                        },
                        '&.Mui-disabled': {
                          bgcolor: 'rgba(3, 66, 124, 0.4)'
                        }
                      }}
                    >
                      {isVerifiedComplete ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FaCheckCircle /> Verificado
                        </Box>
                      ) : isVerifyingEmail ? (
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                      ) : isEmailSent ? (
                        'Correo Enviado'
                      ) : (
                        'Verificar Correo'
                      )}
                    </Button>
                  )}
                </Box>
              </Grid>

              {/* Código de Verificación */}
              {isEmailSent && !isEmailVerified && (
                <Grid item xs={12}>
                  <Box sx={{
                    bgcolor: 'rgba(3, 66, 124, 0.03)',
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid rgba(3, 66, 124, 0.1)'
                  }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, color: '#03427c', fontWeight: 500 }}>
                      Ingresa el código de verificación enviado a tu correo
                    </Typography>

                    <TextField
                      fullWidth
                      label="Código de verificación"
                      name="verificationToken"
                      value={formData.verificationToken}
                      onChange={(e) => setFormData({ ...formData, verificationToken: e.target.value })}
                      required
                      error={!!errors.verificationToken}
                      helperText={errors.verificationToken}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FaLock style={{ color: errors.verificationToken ? '#d32f2f' : '#03427c' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#03427c',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#03427c',
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#03427c',
                        }
                      }}
                    />

                    <Box sx={{
                      display: 'flex',
                      gap: 2,
                      mt: 2,
                      flexDirection: { xs: 'column', sm: 'row' }
                    }}>
                      <Button
                        variant="contained"
                        onClick={handleVerifyToken}
                        sx={{
                          bgcolor: '#03427c',
                          '&:hover': {
                            bgcolor: '#02305c'
                          }
                        }}
                      >
                        Validar Código
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={() => setShowChangeEmailConfirmation(true)}
                        sx={{
                          color: '#03427c',
                          borderColor: '#03427c',
                          '&:hover': {
                            borderColor: '#02305c',
                            bgcolor: 'rgba(3, 66, 124, 0.05)'
                          }
                        }}
                      >
                        Cambiar correo
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              )}

              {/* Información Adicional (visible después de verificar) */}
              {isEmailVerified && (
                <>
                  <Grid item xs={12}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#03427c',
                        mt: 4,
                        mb: 3,
                        fontWeight: 600
                      }}
                    >
                      Información de Contacto y Salud
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
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
                            <FaPhone style={{ color: errors.telefono ? '#d32f2f' : '#03427c' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#03427c',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#03427c',
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#03427c',
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      error={!!errors.alergias}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#03427c',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#03427c',
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#03427c',
                        }
                      }}
                    >
                      <InputLabel>Alergias</InputLabel>
                      <Select
                        multiple
                        value={formData.alergias}
                        onChange={(e) => {
                          const { value } = e.target;
                          // Si seleccionas "Ninguna", deselecciona todas las demás
                          if (value.includes('Ninguna')) {
                            setFormData({
                              ...formData,
                              alergias: ['Ninguna'],
                            });
                          } else {
                            // Remover "Ninguna" si se seleccionan otras alergias
                            setFormData({
                              ...formData,
                              alergias: typeof value === 'string' ? value.split(',') : value.filter((alergia) => alergia !== 'Ninguna'),
                            });
                          }
                        }}
                        label="Alergias"
                        name="alergias"
                        renderValue={(selected) => selected.join(', ')}
                      >
                        <MenuItem value="Ninguna">
                          <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%'
                          }}>
                            <Typography>Ninguna</Typography>
                            {formData.alergias.includes('Ninguna') ? (
                              <FaCheckCircle style={{ color: '#03427c' }} />
                            ) : (
                              <FaPlusCircle />
                            )}
                          </Box>
                        </MenuItem>

                        {Object.keys(alergiasInfo).map((alergia) => (
                          <MenuItem
                            key={alergia}
                            value={alergia}
                            disabled={formData.alergias.includes('Ninguna')}
                          >
                            <Box sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              width: '100%'
                            }}>
                              <Typography>{alergia}</Typography>
                              {formData.alergias.includes(alergia) ? (
                                <FaCheckCircle style={{ color: '#03427c' }} />
                              ) : (
                                <FaPlusCircle />
                              )}
                            </Box>
                          </MenuItem>
                        ))}

                        <MenuItem
                          value="Otro"
                          disabled={formData.alergias.includes('Ninguna')}
                        >
                          <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%'
                          }}>
                            <Typography>Otro</Typography>
                            {formData.alergias.includes('Otro') ? (
                              <FaCheckCircle style={{ color: '#03427c' }} />
                            ) : (
                              <FaPlusCircle />
                            )}
                          </Box>
                        </MenuItem>
                      </Select>

                      {/* Información de alergias seleccionadas */}
                      {formData.alergias.some((alergia) => alergiasInfo[alergia]) && (
                        <Alert
                          severity="info"
                          sx={{ mt: 1 }}
                          icon={<FaInfoCircle />}
                        >
                          {alergiasInfo[formData.alergias.find((alergia) => alergiasInfo[alergia])]}
                        </Alert>
                      )}

                      <FormHelperText>
                        {errors.alergias || 'Puedes seleccionar más de una alergia'}
                      </FormHelperText>
                    </FormControl>

                    {/* Campo para especificar otra alergia */}
                    {formData.alergias.includes('Otro') && (
                      <TextField
                        fullWidth
                        label="Especificar Alergia"
                        name="otraAlergia"
                        value={formData.otraAlergia}
                        onChange={handleChange}
                        required
                        error={!!errors.otraAlergia}
                        helperText={errors.otraAlergia}
                        sx={{
                          mt: 2,
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#03427c',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#03427c',
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#03427c',
                          }
                        }}
                      />
                    )}
                  </Grid>
                </>
              )}
            </Grid>

            {/* Modal de Confirmación */}
            <Modal
              open={showChangeEmailConfirmation}
              onClose={() => setShowChangeEmailConfirmation(false)}
            >
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
              }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#03427c' }}>
                  Cambiar correo electrónico
                </Typography>

                <Typography variant="body1" sx={{ mb: 3 }}>
                  ¿Estás seguro de que deseas cambiar el correo? Esto invalidará el código enviado anteriormente.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowChangeEmailConfirmation(false)}
                    sx={{
                      color: '#03427c',
                      borderColor: '#03427c',
                      '&:hover': {
                        borderColor: '#02305c',
                        bgcolor: 'rgba(3, 66, 124, 0.05)'
                      }
                    }}
                  >
                    Cancelar
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleEmailChange}
                    sx={{
                      bgcolor: '#03427c',
                      '&:hover': {
                        bgcolor: '#02305c'
                      }
                    }}
                  >
                    Sí, cambiar correo
                  </Button>
                </Box>
              </Box>
            </Modal>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* Título */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#03427c',
                    mb: 3,
                    fontWeight: 600,
                    position: 'relative',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: '40px',
                      height: '3px',
                      backgroundColor: '#03427c',
                      borderRadius: '2px'
                    }
                  }}
                >
                  Configura tu Contraseña
                </Typography>
              </Grid>

              {/* Campo Contraseña */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    handleChange(e);
                    if (e.target.value !== formData.confirmPassword) {
                      setErrors(prev => ({
                        ...prev,
                        confirmPassword: 'Las contraseñas no coinciden',
                      }));
                    } else {
                      setErrors(prev => ({
                        ...prev,
                        confirmPassword: '',
                      }));
                    }
                  }}
                  required
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaLock style={{ color: errors.password ? '#d32f2f' : '#03427c' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                          sx={{ color: '#03427c' }}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#03427c',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#03427c',
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#03427c',
                    }
                  }}
                />
              </Grid>

              {/* Campo Confirmar Contraseña */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirmar Contraseña"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    handleChange(e);
                    if (e.target.value !== formData.password) {
                      setErrors(prev => ({
                        ...prev,
                        confirmPassword: 'Las contraseñas no coinciden',
                      }));
                    } else {
                      setErrors(prev => ({
                        ...prev,
                        confirmPassword: '',
                      }));
                    }
                  }}
                  required
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaLock style={{ color: errors.confirmPassword ? '#d32f2f' : '#03427c' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={toggleConfirmPasswordVisibility}
                          edge="end"
                          sx={{ color: '#03427c' }}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#03427c',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#03427c',
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#03427c',
                    }
                  }}
                />
              </Grid>

              {/* Mensajes de Estado y Seguridad */}
              <Grid item xs={12}>
                {passwordError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {passwordError}
                  </Alert>
                )}

                {isPasswordFiltered && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Contraseña filtrada. Por favor, elige otra.
                  </Alert>
                )}

                {isPasswordSafe && !isPasswordFiltered && (
                  <Alert
                    icon={<FaCheckCircle />}
                    severity="success"
                    sx={{ mb: 2 }}
                  >
                    Contraseña segura
                  </Alert>
                )}
              </Grid>

              {/* Indicador de Fortaleza */}
              <Grid item xs={12}>
                <Box sx={{ mt: 1 }}>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1
                  }}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                    >
                      Fortaleza de la contraseña
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: passwordStrength < 2
                          ? '#d32f2f'
                          : passwordStrength === 2
                            ? '#ed6c02'
                            : '#2e7d32'
                      }}
                    >
                      {passwordStrength === 0 && 'Muy débil'}
                      {passwordStrength === 1 && 'Débil'}
                      {passwordStrength === 2 && 'Regular'}
                      {passwordStrength === 3 && 'Fuerte'}
                      {passwordStrength === 4 && 'Muy fuerte'}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      height: '6px',
                      bgcolor: 'rgba(0, 0, 0, 0.1)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${(passwordStrength / 4) * 100}%`,
                        bgcolor: passwordStrength < 2
                          ? '#d32f2f'
                          : passwordStrength === 2
                            ? '#ed6c02'
                            : '#2e7d32',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 4
            }}
          >
            <Typography
              variant="h6"
              color="error"
              sx={{ mb: 2 }}
            >
              Ha ocurrido un error
            </Typography>
            <Typography
              variant="body1"
              color="textSecondary"
            >
              Paso no reconocido en el formulario
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{
                mt: 2,
                bgcolor: '#03427c',
                '&:hover': {
                  bgcolor: '#02305c'
                }
              }}
            >
              Reiniciar Formulario
            </Button>
          </Box>
        );
    }
  };

  return (
    <ErrorBoundary>
      <Box
        sx={{
          minHeight: '100vh',
          background: isDarkMode
            ? '#1D2A38'
            : 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)',
          py: { xs: 4, md: 8 }
        }}
      >
        <Container maxWidth="md">
          <Notificaciones
            open={openNotification}
            message={notificationMessage}
            type={notificationType}
            handleClose={handleCloseNotification}
          />

          <Card
            elevation={0}
            sx={{
              p: { xs: 2, sm: 4 },
              boxShadow: '0 8px 32px rgba(3, 66, 124, 0.08)',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(3, 66, 124, 0.1)',
            }}
          >
            <CardContent>
              <Typography
                variant="h4"
                sx={{
                  textAlign: 'center',
                  mb: 4,
                  color: '#03427c',
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 600,
                  fontSize: { xs: '1.75rem', sm: '2.125rem' },
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60px',
                    height: '4px',
                    backgroundColor: '#03427c',
                    borderRadius: '2px'
                  }
                }}
              >
                Registro
              </Typography>

              <Stepper
                activeStep={activeStep}
                sx={{
                  mb: 5,
                  '& .MuiStepLabel-root .Mui-completed': {
                    color: '#03427c',
                  },
                  '& .MuiStepLabel-root .Mui-active': {
                    color: '#03427c',
                  },
                  '& .MuiStepLabel-root .Mui-active .MuiStepIcon-text': {
                    fill: 'white',
                    fontWeight: 'bold'
                  },
                  '& .MuiStepConnector-line': {
                    borderColor: 'rgba(3, 66, 124, 0.2)'
                  }
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel
                      StepIconProps={{
                        sx: {
                          width: { xs: 28, sm: 32 },
                          height: { xs: 28, sm: 32 }
                        }
                      }}
                      sx={{
                        '& .MuiStepLabel-label': {
                          display: { xs: 'none', sm: 'block' },
                          color: 'rgba(3, 66, 124, 0.8)',
                          '&.Mui-active': {
                            color: '#03427c',
                            fontWeight: 600
                          }
                        }
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              <form onSubmit={handleSubmit}>
                <Box sx={{ px: { xs: 0, sm: 2 } }}>
                  {getStepContent(activeStep)}
                </Box>

                <Box sx={{ mt: 4 }}>
                  {activeStep === steps.length - 1 && (
                    <Box
                      sx={{
                        p: 3,
                        bgcolor: 'rgba(3, 66, 124, 0.03)',
                        borderRadius: 2,
                        mb: 3
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={allAccepted}
                            onChange={handleAcceptChange}
                            name="acceptAll"
                            sx={{
                              color: '#03427c',
                              '&.Mui-checked': {
                                color: '#03427c',
                              },
                            }}
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                            Al registrarte, confirmas que estás de acuerdo con nuestros{' '}
                            <Link
                              component="span"
                              onClick={handleOpenTermsModal}
                              sx={{
                                cursor: 'pointer',
                                color: '#03427c',
                                textDecoration: 'none',
                                borderBottom: '1px dashed #03427c',
                                '&:hover': {
                                  borderBottom: '1px solid #03427c',
                                }
                              }}
                            >
                              términos y condiciones
                            </Link>
                            {' '}y que entiendes nuestra{' '}
                            <Link
                              component="span"
                              onClick={handleOpenPrivacyModal}
                              sx={{
                                cursor: 'pointer',
                                color: '#03427c',
                                textDecoration: 'none',
                                borderBottom: '1px dashed #03427c',
                                '&:hover': {
                                  borderBottom: '1px solid #03427c',
                                }
                              }}
                            >
                              política de privacidad
                            </Link>.
                          </Typography>
                        }
                      />
                    </Box>
                  )}

                  {/* Box para los botones */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: activeStep === 0 ? 'flex-end' : 'space-between', // Alineación condicional
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2
                    }}
                  >
                    {activeStep !== 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Button
                          onClick={handleBack}
                          sx={{
                            minWidth: '100px', // Ancho mínimo más pequeño
                            px: 3,  // Padding horizontal reducido
                            py: 1,  // Padding vertical reducido
                            color: '#03427c',
                            borderColor: 'rgba(3, 66, 124, 0.5)',
                            '&:hover': {
                              borderColor: '#03427c',
                              bgcolor: 'rgba(3, 66, 124, 0.05)',
                              transform: 'translateX(-3px)',
                              transition: 'transform 0.2s'
                            }
                          }}
                          variant="outlined"
                          disabled={isLoading}
                        >
                          Regresar
                        </Button>
                      </motion.div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Button
                        variant="contained"
                        type={activeStep === steps.length - 1 ? "submit" : "button"}
                        onClick={activeStep === steps.length - 1 ? undefined : handleNext}
                        disabled={isLoading || isSubmitting || (activeStep === steps.length - 1 && !allAccepted)}
                        sx={{
                          minWidth: '120px',
                          px: 4,
                          py: 1,
                          bgcolor: '#03427c',
                          position: 'relative',
                          '&:hover': {
                            bgcolor: '#02305c',
                            transform: 'translateX(3px)',
                            transition: 'transform 0.2s'
                          },
                          '&.Mui-disabled': {
                            bgcolor: 'rgba(3, 66, 124, 0.4)'
                          },
                          width: { xs: '100%', sm: 'auto' }
                        }}
                      >
                        {(isLoading || isSubmitting) ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}
                          >
                            <CircularProgress
                              size={20}
                              sx={{
                                color: 'white',
                                animation: 'spin 1s linear infinite',
                                '@keyframes spin': {
                                  '0%': { transform: 'rotate(0deg)' },
                                  '100%': { transform: 'rotate(360deg)' }
                                }
                              }}
                            />
                            <span>Procesando...</span>
                          </Box>
                        ) : (
                          activeStep === steps.length - 1 ? 'Registrar' : 'Siguiente'
                        )}
                      </Button>
                    </motion.div>
                  </Box>
                </Box>

                <Modal
                  open={openPrivacyModal || openTermsModal}
                  onClose={openPrivacyModal ? handleClosePrivacyModal : handleCloseTermsModal}
                >
                  <Box
                    sx={{
                      width: '90%',
                      maxWidth: 600,
                      maxHeight: '85vh',
                      bgcolor: '#ffffff',
                      p: { xs: 3, sm: 4 },
                      m: 'auto',
                      mt: '5vh',
                      borderRadius: 3,
                      overflowY: 'auto',
                      boxShadow: '0 8px 32px rgba(3, 66, 124, 0.1)',
                      border: '1px solid rgba(3, 66, 124, 0.1)'
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        color: '#03427c',
                        fontWeight: 600,
                        mb: 3,
                        pb: 2,
                        borderBottom: '2px solid rgba(3, 66, 124, 0.1)'
                      }}
                    >
                      {openPrivacyModal ? 'Políticas de Privacidad' : 'Términos y Condiciones'}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(0, 0, 0, 0.7)',
                        whiteSpace: 'pre-line',
                        lineHeight: 1.7
                      }}
                    >
                      {openPrivacyModal ? privacyPolicy : termsConditions}
                    </Typography>
                    <Button
                      onClick={openPrivacyModal ? handleClosePrivacyModal : handleCloseTermsModal}
                      sx={{
                        mt: 3,
                        bgcolor: '#03427c',
                        '&:hover': {
                          bgcolor: '#02305c'
                        },
                        py: 1.5
                      }}
                      variant="contained"
                      fullWidth
                    >
                      Cerrar
                    </Button>
                  </Box>
                </Modal>
              </form>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ErrorBoundary>
  );
};

export default Register;
