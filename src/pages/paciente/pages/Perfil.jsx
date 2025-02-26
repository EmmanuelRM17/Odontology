import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, TextField, Button, Grid, Box, Alert,
    CircularProgress, IconButton, useTheme, InputAdornment
} from '@mui/material';
import {
    Person as PersonIcon, Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon,
    LocalHospital as LocalHospitalIcon, Phone as PhoneIcon, Email as EmailIcon,
    LocationOn as LocationOnIcon, MedicalInformation as MedicalInformationIcon, Badge as BadgeIcon,
    ContactPhone as ContactPhoneIcon,
    Warning as WarningIcon,
    SupervisorAccount as SupervisorAccountIcon
} from '@mui/icons-material';
import { useAuth } from '../../../components/Tools/AuthContext';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
const Profile = () => {
    const { isDarkTheme } = useThemeContext();
    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const { user } = useAuth();
    const [profileData, setProfileData] = useState({
        nombre: '',
        aPaterno: '',
        aMaterno: '',
        fechaNacimiento: null,
        tipoTutor: '',
        nombreTutor: '',
        genero: '',
        lugar: '',
        telefono: '',
        email: '',
        alergias: 'Ninguna'
    });

    useEffect(() => {
        console.log("Datos del usuario obtenidos:", user);
    }, [user]);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await fetch(`https://back-end-4803.onrender.com/api/profile/${user.id}?email=${user.email}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error("Error al obtener los datos del perfil");
                }

                const data = await response.json();
                console.log("Perfil completo obtenido:", data);

                setProfileData({
                    nombre: data.nombre || '',
                    aPaterno: data.aPaterno || '',
                    aMaterno: data.aMaterno || '',
                    fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : '',
                    tipoTutor: data.tipoTutor || '',
                    nombreTutor: data.nombreTutor || '',
                    genero: data.genero || '',
                    lugar: data.lugar || '',
                    telefono: data.telefono || '',
                    email: data.email || '',
                    alergias: data.alergias || 'Ninguna',
                    estado: data.estado ? data.estado.trim() : 'Pendiente'
                });


                setLoading(false);
            } catch (error) {
                console.error("Error al cargar perfil:", error);
            }
        };

        if (user && user.id && user.email) {
            fetchProfileData();
        }
    }, [user]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateFields()) return;

        setLoading(true);
        setError(null); // 🔹 Reinicia errores previos

        try {
            const response = await fetch('https://back-end-4803.onrender.com/api/profile/updateProfile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
                credentials: 'include'
            });

            let data;
            try {
                data = await response.json(); // Intenta parsear JSON
            } catch (jsonError) {
                throw new Error("Error en la respuesta del servidor. No se pudo leer JSON.");
            }

            if (!response.ok) {
                throw new Error(data?.message || 'Error al actualizar el perfil');
            }

            if (!data?.updatedProfile) {
                throw new Error("Respuesta inesperada: faltan datos del perfil.");
            }

            setSuccess(true);
            setIsEditing(false);
            setProfileData(data.updatedProfile);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.message || 'Error al actualizar los datos');
            console.error('❌ Error al actualizar perfil:', err);
        } finally {
            setLoading(false);
        }
    };

    const validateFields = () => {
        const errors = {};

        if (!profileData.nombre) errors.nombre = 'El nombre es obligatorio';
        if (!profileData.aPaterno) errors.aPaterno = 'El apellido paterno es obligatorio';
        if (!profileData.aMaterno) errors.aMaterno = 'El apellido materno es obligatorio';
        if (!profileData.email) errors.email = 'El email es obligatorio';

        if (profileData.telefono && !/^[0-9]{10}$/.test(profileData.telefono)) {
            errors.telefono = 'Ingresa un número de teléfono válido (10 dígitos)';
        }

        if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
            errors.email = 'Ingresa un correo electrónico válido';
        }

        setValidationErrors(errors);
        if (Object.keys(errors).length > 0) {
            console.warn("Errores de validación:", errors);
        }
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));

        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };


    const handleCancel = () => {
        setIsEditing(false);
        if (user) {
            setProfileData({
                nombre: user.nombre || '',
                aPaterno: user.aPaterno || '',
                aMaterno: user.aMaterno || '',
                fechaNacimiento: user.fechaNacimiento ? new Date(user.fechaNacimiento).toISOString().split('T')[0] : '',
                tipoTutor: user.tipoTutor || '',
                nombreTutor: user.nombreTutor || '',
                genero: user.genero || '',
                lugar: user.lugar || '',
                telefono: user.telefono || '',
                email: user.email || '',
                alergias: user.alergias || 'Ninguna',
                estado: user.estado ? user.estado.trim() : 'Pendiente'
            });
        }
        setValidationErrors({});
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    return (
        <Container maxWidth="lg" sx={{
            py: 4,
            bgcolor: isDarkTheme ? '#1B2A3A' : '#F9FDFF'
        }}>
            <Paper
                elevation={3}
                sx={{
                    p: { xs: 2, md: 4 },
                    bgcolor: isDarkTheme ? '#1B2A3A' : '#FFFFFF',
                    borderRadius: 3,
                    boxShadow: isDarkTheme
                        ? '0 4px 20px rgba(255, 255, 255, 0.2)'
                        : '0 4px 20px rgba(0, 0, 0, 0.1)',
                    border: isDarkTheme
                        ? '1px solid rgba(255, 255, 255, 0.2)'
                        : '1px solid rgba(0, 0, 0, 0.1)'
                }}
            >
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                        <CircularProgress sx={{ color: '#03427c' }} />
                    </Box>
                ) : (
                    <>
                        {/* Cabecera */}
                        <Box
                            mb={4}
                            sx={{
                                background: isDarkTheme
                                    ? 'linear-gradient(45deg, #03427c, #1B2A3A)'
                                    : 'linear-gradient(45deg, #03427c, #0561b3)',
                                borderRadius: 2,
                                p: 3,
                                color: '#FFFFFF'
                            }}
                        >
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography
                                    variant="h4"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    <LocalHospitalIcon sx={{ fontSize: 40 }} />
                                    Perfil del Paciente
                                </Typography>
                                <IconButton
                                    onClick={() => isEditing ? handleCancel() : handleEdit()}
                                    sx={{
                                        bgcolor: 'white',
                                        '&:hover': {
                                            bgcolor: isEditing ? '#ffebee' : '#F9FDFF',
                                            transform: 'scale(1.1)',
                                            transition: 'all 0.3s'
                                        }
                                    }}
                                >
                                    {isEditing ?
                                        <CancelIcon sx={{ color: '#dc3545' }} /> :
                                        <EditIcon sx={{ color: '#03427c' }} />
                                    }
                                </IconButton>
                            </Box>
                        </Box>

                        {/* Alertas */}
                        {error && (
                            <Alert
                                severity="error"
                                sx={{ mb: 3, borderRadius: 2 }}
                                onClose={() => setError(null)}
                            >
                                {error}
                            </Alert>
                        )}
                        {success && (
                            <Alert
                                severity="success"
                                sx={{ mb: 3, borderRadius: 2 }}
                            >
                                Cambios guardados exitosamente
                            </Alert>
                        )}

                        {/* Formulario */}
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                {/* Información Personal */}
                                <Grid item xs={12}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            mb: 2,
                                            color: isDarkTheme ? '#FFFFFF' : '#03427c',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Información Personal
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Nombre"
                                        name="nombre"
                                        value={profileData.nombre}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon sx={{ color: '#03427c' }} />
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#03427c',
                                                }
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Apellido Paterno"
                                        name="aPaterno"
                                        value={profileData.aPaterno}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        required
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#03427c'
                                                }
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Apellido Materno"
                                        name="aMaterno"
                                        value={profileData.aMaterno}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        required
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#03427c'
                                                }
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Estado"
                                        name="estado"
                                        value={profileData.estado}
                                        variant="filled"
                                        disabled={true}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <BadgeIcon sx={{ color: '#03427c' }} />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Fecha de Nacimiento"
                                        type="date"
                                        name="fechaNacimiento"
                                        value={profileData.fechaNacimiento ? new Date(profileData.fechaNacimiento).toISOString().split('T')[0] : ''}
                                        onChange={(e) => {
                                            const date = e.target.value ? new Date(e.target.value) : null;
                                            setProfileData(prev => ({ ...prev, fechaNacimiento: date }));
                                        }}
                                        disabled={!isEditing}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>

                                {/* Información de Contacto */}
                                <Grid item xs={12}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            mt: 4,
                                            mb: 2,
                                            color: isDarkTheme ? '#FFFFFF' : '#03427c',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        <ContactPhoneIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Información de Contacto
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Teléfono"
                                        name="telefono"
                                        value={profileData.telefono}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PhoneIcon sx={{ color: '#03427c' }} />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailIcon sx={{ color: '#03427c' }} />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Dirección"
                                        name="lugar"
                                        value={profileData.lugar}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LocationOnIcon sx={{ color: '#03427c' }} />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>

                                {/* Información Médica */}
                                <Grid item xs={12}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            mt: 4,
                                            mb: 2,
                                            color: isDarkTheme ? '#FFFFFF' : '#03427c',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        <LocalHospitalIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Información Médica
                                    </Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Alergias"
                                        name="alergias"
                                        value={profileData.alergias}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        multiline
                                        rows={3}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <WarningIcon sx={{ color: '#03427c' }} />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>

                                {/* Información del Tutor */}
                                {profileData.tipoTutor && (
                                    <>
                                        <Grid item xs={12}>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    mt: 4,
                                                    mb: 2,
                                                    color: isDarkTheme ? '#FFFFFF' : '#03427c',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                <SupervisorAccountIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                Información del Tutor
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Tipo de Tutor"
                                                name="tipoTutor"
                                                value={profileData.tipoTutor}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Nombre del Tutor"
                                                name="nombreTutor"
                                                value={profileData.nombreTutor}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            />
                                        </Grid>
                                    </>
                                )}

                                {/* Botón de Guardar */}
                                {isEditing && (
                                    <Grid item xs={12}>
                                        <Box
                                            display="flex"
                                            justifyContent="flex-end"
                                            gap={2}
                                            sx={{ mt: 4 }}
                                        >
                                            <Button
                                                variant="contained"
                                                type="submit"
                                                disabled={loading}
                                                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                                                sx={{
                                                    bgcolor: '#03427c',
                                                    px: 4,
                                                    py: 1.5,
                                                    borderRadius: 2,
                                                    '&:hover': {
                                                        bgcolor: '#025aa5',
                                                        transform: 'translateY(-2px)',
                                                        transition: 'all 0.3s'
                                                    }
                                                }}
                                            >
                                                Guardar Cambios
                                            </Button>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </form>
                    </>
                )}
            </Paper>
        </Container>
    );
};

export default Profile;