import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Box,
    Alert,
    CircularProgress,
    IconButton,
    useTheme,
    InputAdornment
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import {
    Person as PersonIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    LocalHospital as LocalHospitalIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    LocationOn as LocationOnIcon,
    MedicalInformation as MedicalInformationIcon
} from '@mui/icons-material';
import { useAuth } from '../../../components/Tools/AuthContext';


const Profile = () => {
    const theme = useTheme();
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
                    fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
                    telefono: data.telefono || '',
                    email: data.email || '',
                    alergias: data.alergias || 'Ninguna'
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

    const handleDateChange = (date) => {
        setProfileData(prev => ({
            ...prev,
            fechaNacimiento: date
        }));
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (user) {
            setProfileData({
                nombre: user.nombre || '',
                aPaterno: user.aPaterno || '',
                aMaterno: user.aMaterno || '',
                fechaNacimiento: user.fechaNacimiento ? new Date(user.fechaNacimiento) : null,
                tipoTutor: user.tipoTutor || '',
                nombreTutor: user.nombreTutor || '',
                genero: user.genero || '',
                lugar: user.lugar || '',
                telefono: user.telefono || '',
                email: user.email || '',
                alergias: user.alergias || 'Ninguna'
            });
        }
        setValidationErrors({});
    };
    

    const handleError = (fieldName) => ({
        error: !!validationErrors[fieldName],
        helperText: validationErrors[fieldName]
    });

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper
                elevation={1}
                sx={{
                    p: 4,
                    bgcolor: '#FFFFFF',
                    borderRadius: 2,
                    boxShadow: theme.shadows[1]
                }}
            >
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                        <CircularProgress sx={{ color: theme.palette.primary.main }} />
                    </Box>
                ) : (
                    <>
                        {/* Cabecera */}
                        <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
                            <Typography
                                variant="h5"
                                sx={{
                                    color: theme.palette.primary.main,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                <MedicalInformationIcon />
                                Mi Perfil
                            </Typography>
                            <IconButton
                                onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                                sx={{
                                    bgcolor: isEditing ?
                                        theme.palette.error.light :
                                        theme.palette.primary.light,
                                    '&:hover': {
                                        bgcolor: isEditing ?
                                            theme.palette.error.main :
                                            theme.palette.primary.main,
                                        '& svg': {
                                            color: '#FFFFFF'
                                        }
                                    }
                                }}
                            >
                                {isEditing ?
                                    <CancelIcon sx={{ color: theme.palette.error.main }} /> :
                                    <EditIcon sx={{ color: theme.palette.primary.main }} />
                                }
                            </IconButton>
                        </Box>

                        {/* Alertas */}
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}
                        {success && (
                            <Alert severity="success" sx={{ mb: 2 }}>
                                Perfil actualizado correctamente
                            </Alert>
                        )}

                        {/* Formulario */}
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={4}>
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
                                                    <PersonIcon color="primary" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="Apellido Paterno"
                                        name="aPaterno"
                                        value={profileData.aPaterno}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="Apellido Materno"
                                        name="aMaterno"
                                        value={profileData.aMaterno}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Fecha de Nacimiento"
                                        type="date"
                                        name="fechaNacimiento"
                                        value={profileData.fechaNacimiento ?
                                            new Date(profileData.fechaNacimiento).toISOString().split('T')[0]
                                            : ''
                                        }
                                        onChange={(e) => {
                                            const date = e.target.value ? new Date(e.target.value) : null;
                                            handleDateChange(date);
                                        }}
                                        disabled={!isEditing}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon color="primary" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Teléfono"
                                        name="telefono"
                                        value={profileData.telefono}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        {...handleError('telefono')}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PhoneIcon color="primary" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        required
                                        {...handleError('email')}
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
                                        label="Dirección"
                                        name="lugar"
                                        value={profileData.lugar}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LocationOnIcon color="primary" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
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
                                                    <LocalHospitalIcon color="primary" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                {isEditing && (
                                    <Grid item xs={12}>
                                        <Box display="flex" justifyContent="flex-end" gap={2}>
                                            <Button
                                                variant="contained"
                                                type="submit"
                                                disabled={loading}
                                                startIcon={loading ?
                                                    <CircularProgress size={20} /> :
                                                    <SaveIcon />
                                                }
                                                sx={{
                                                    bgcolor: theme.palette.primary.main,
                                                    '&:hover': {
                                                        bgcolor: theme.palette.primary.dark
                                                    }
                                                }}
                                            >
                                                {loading ? 'Guardando...' : 'Guardar Cambios'}
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