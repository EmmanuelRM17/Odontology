import React, { useState, useEffect } from 'react';
import {
    TextField, Button, Typography, Paper, IconButton, Dialog, DialogActions, DialogContent, DialogTitle,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Grid, useTheme, useMediaQuery
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import Notificaciones from '../../../../components/Layout/Notificaciones';


const PoliticasPrivacidad = () => {
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogContent, setDialogContent] = useState('');
    const [errors, setErrors] = useState({});
    const [politicas, setPoliticas] = useState([]);
    const [politicaActiva, setPoliticaActiva] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
    const [isAddingNewPolicy, setIsAddingNewPolicy] = useState(false);
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


    useEffect(() => {
        fetchPoliticas();
        fetchPoliticaActiva();
    }, []);

    useEffect(() => {
        const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkTheme(matchDarkTheme.matches);

        const handleThemeChange = (e) => {
            setIsDarkTheme(e.matches);
        };

        matchDarkTheme.addEventListener('change', handleThemeChange);
        return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
    }, []);

    // Definición de colores según el tema
    const colors = {
        background: isDarkTheme ? '#243447' : '#f9fafc',
        paper: isDarkTheme ? '#1B2A3A' : '#ffffff',
        text: isDarkTheme ? '#E8F1FF' : '#333333',
        secondaryText: isDarkTheme ? '#B8C7D9' : '#666666',
        primary: isDarkTheme ? '#4B9FFF' : '#1976d2',
        hover: isDarkTheme ? 'rgba(75,159,255,0.15)' : 'rgba(25,118,210,0.1)',
        border: isDarkTheme ? '#364B63' : '#e0e0e0',
        activePolicyBg: isDarkTheme ? '#2C3E50' : '#e3f2fd',
        tableHeader: isDarkTheme ? '#2C3E50' : '#f5f5f5',
        error: isDarkTheme ? '#ff6b6b' : '#f44336',
    };

        // Estilos comunes para inputs
        const inputStyles = {
            '& .MuiOutlinedInput-root': {
                backgroundColor: colors.paper,
                '& fieldset': {
                    borderColor: colors.border,
                },
                '&:hover fieldset': {
                    borderColor: colors.primary,
                },
                '&.Mui-focused fieldset': {
                    borderColor: colors.primary,
                },
            },
            '& .MuiInputLabel-root': {
                color: colors.secondaryText,
            },
            '& .MuiOutlinedInput-input': {
                color: colors.text,
            },
        };

    const fetchPoliticas = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/politicas/getAllPoliticas');
            const data = response.data;

            const politicasInactivas = data.filter(politica => politica.estado === 'inactivo');
            politicasInactivas.sort((a, b) => parseFloat(b.version) - parseFloat(a.version));

            setPoliticas(politicasInactivas);
        } catch (error) {
            console.error('Error al cargar políticas:', error);
        }
    };

    const fetchPoliticaActiva = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/politicas/getpolitica');
            if (response.data) {
                setPoliticaActiva(response.data);
            } else {
                setPoliticaActiva(null);
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setPoliticaActiva(null);
                console.error('No hay políticas activas.');
            } else {
                console.error('Error al cargar política activa:', error);
                setPoliticaActiva(null);
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!titulo) newErrors.titulo = "El título es obligatorio.";
        if (!contenido) newErrors.contenido = "El contenido es obligatorio.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Agregar política con número predeterminado y estado inactivo
        const politicaData = { numero_politica: 0, titulo, contenido, estado: 'inactivo' };

        try {
            if (editingId !== null) {
                await axios.put(`http://localhost:3001/api/politicas/update/${editingId}`, politicaData);
                setNotification({ open: true, message: `Política actualizada correctamente`, type: 'success' });
            } else {
                await axios.post('http://localhost:3001/api/politicas/insert', politicaData);
                setNotification({ open: true, message: 'Política insertada con éxito', type: 'success' });
            }

            await fetchPoliticas();
            await fetchPoliticaActiva();
            resetForm();
            setIsAddingNewPolicy(false);
        } catch (error) {
            setNotification({ open: true, message: 'Error al enviar política', type: 'error' });
        }
    };

    const resetForm = () => {
        setTitulo('');
        setContenido('');
        setEditingId(null);
        setErrors({});
        setIsAddingNewPolicy(false);
    };

    const handleEdit = async (id) => {
        try {
            const response = await axios.get(`http://localhost:3001/api/politicas/get/${id}`);
            const politica = response.data;

            if (politica) {
                setTitulo(politica.titulo);
                setContenido(politica.contenido);
                setEditingId(id);
                setIsAddingNewPolicy(true);
            }
        } catch (error) {
            console.error("Error al cargar la política para editar:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.put(`http://localhost:3001/api/politicas/deactivate/${id}`, { estado: 'inactivo' });
            setNotification({ open: true, message: 'Política eliminada con éxito', type: 'success' });
            await fetchPoliticas();
            await fetchPoliticaActiva();
        } catch (error) {
            setNotification({ open: true, message: 'Error al eliminar política', type: 'error' });
        }
    };

    const handleDialogOpen = (politica) => {
        setDialogContent(politica);
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const truncateContent = (content) => {
        return content.length > 100 ? content.substring(0, 100) + '...' : content;
    };

    return (
        <Box sx={{ 
            padding: { xs: '20px', sm: '40px' }, 
            backgroundColor: colors.background, 
            minHeight: '100vh',
            transition: 'all 0.3s ease'
        }}>
            <Paper sx={{ 
                padding: { xs: '15px', sm: '20px', md: '30px' }, 
                maxWidth: '800px', 
                margin: '0 auto', 
                boxShadow: isDarkTheme ? '0 3px 15px rgba(0, 0, 0, 0.4)' : '0 3px 10px rgba(0, 0, 0, 0.1)',
                backgroundColor: colors.paper,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px'
            }}>
                <Typography 
                    variant="h4" 
                    align="center" 
                    gutterBottom
                    sx={{ 
                        color: colors.text,
                        fontSize: { xs: '1.5rem', sm: '2rem' },
                        marginBottom: '2rem'
                    }}
                >
                    Política de Privacidad
                </Typography>

                {politicaActiva && (
                    <Paper sx={{ 
                        padding: '20px', 
                        mt: 4, 
                        backgroundColor: colors.activePolicyBg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '6px'
                    }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={9}>
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        color: colors.text,
                                        fontSize: { xs: '1.2rem', sm: '1.5rem' }
                                    }}
                                >
                                    Vigente: {politicaActiva.titulo}
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    sx={{ color: colors.secondaryText }}
                                >
                                    Versión: {politicaActiva.version}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={3} sx={{ textAlign: 'right' }}>
                                <IconButton 
                                    onClick={() => handleEdit(politicaActiva.id)}
                                    sx={{ 
                                        color: colors.primary,
                                        '&:hover': { backgroundColor: colors.hover }
                                    }}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton 
                                    onClick={() => handleDelete(politicaActiva.id)}
                                    sx={{ 
                                        color: colors.error,
                                        '&:hover': { backgroundColor: colors.hover }
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography 
                                    variant="body2" 
                                    sx={{ color: colors.text }}
                                >
                                    {truncateContent(politicaActiva.contenido)}{' '}
                                    <Button 
                                        variant="outlined" 
                                        onClick={() => handleDialogOpen(politicaActiva)}
                                        sx={{
                                            color: colors.primary,
                                            borderColor: colors.primary,
                                            '&:hover': {
                                                borderColor: colors.primary,
                                                backgroundColor: colors.hover
                                            }
                                        }}
                                    >
                                        Ver más
                                    </Button>
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                )}

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ 
                        mt: 3,
                        backgroundColor: colors.primary,
                        '&:hover': {
                            backgroundColor: isDarkTheme ? '#5BABFF' : '#1565c0'
                        },
                        '&.Mui-disabled': {
                            backgroundColor: isDarkTheme ? '#2C3E50' : '#e0e0e0'
                        }
                    }}
                    onClick={() => {
                        resetForm();
                        setIsAddingNewPolicy(true);
                    }}
                    disabled={isAddingNewPolicy}
                >
                    Nueva Política
                </Button>

                {isAddingNewPolicy && (
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Título"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            fullWidth
                            sx={{ 
                                mt: 3,
                                ...inputStyles
                            }}
                            error={!!errors.titulo}
                            helperText={errors.titulo}
                        />
                        <TextField
                            label="Contenido"
                            value={contenido}
                            onChange={(e) => setContenido(e.target.value)}
                            fullWidth
                            multiline
                            rows={4}
                            sx={{ 
                                mt: 2,
                                ...inputStyles
                            }}
                            error={!!errors.contenido}
                            helperText={errors.contenido}
                        />
                        <Grid container spacing={2} sx={{ mt: 3 }}>
                            <Grid item xs={12} sm={6}>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    fullWidth
                                    sx={{
                                        backgroundColor: colors.primary,
                                        '&:hover': {
                                            backgroundColor: isDarkTheme ? '#5BABFF' : '#1565c0'
                                        }
                                    }}
                                >
                                    {editingId !== null ? 'Actualizar' : 'Agregar'}
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={resetForm}
                                    sx={{
                                        color: colors.text,
                                        borderColor: colors.border,
                                        '&:hover': {
                                            borderColor: colors.primary,
                                            backgroundColor: colors.hover
                                        }
                                    }}
                                >
                                    Cancelar
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                )}
            </Paper>

            <Typography 
                variant="h5" 
                align="center" 
                sx={{ 
                    mt: 6, 
                    mb: 4,
                    color: colors.text,
                    fontSize: { xs: '1.2rem', sm: '1.5rem' }
                }}
            >
                Historial de Políticas por Versión
            </Typography>

            <TableContainer 
                component={Paper} 
                sx={{ 
                    maxWidth: '100%',
                    marginTop: '20px',
                    boxShadow: isDarkTheme ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 8px rgba(0,0,0,0.1)',
                    backgroundColor: colors.paper,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: colors.tableHeader }}>
                            <TableCell>
                                <Typography sx={{ fontWeight: 'bold', color: colors.text }}>
                                    Título
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography sx={{ fontWeight: 'bold', color: colors.text }}>
                                    Versión
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography sx={{ fontWeight: 'bold', color: colors.text }}>
                                    Estado
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography sx={{ fontWeight: 'bold', color: colors.text }}>
                                    Fecha de Creación
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography sx={{ fontWeight: 'bold', color: colors.text }}>
                                    Fecha de Actualización
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {politicas.length > 0 ? (
                            politicas.map((politica, index) => (
                                <TableRow 
                                    key={index}
                                    sx={{
                                        '&:nth-of-type(odd)': {
                                            backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                                        },
                                        '&:hover': {
                                            backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
                                        }
                                    }}
                                >
                                    <TableCell sx={{ color: colors.text }}>{politica.titulo}</TableCell>
                                    <TableCell sx={{ color: colors.text }}>{politica.version}</TableCell>
                                    <TableCell sx={{ color: colors.text }}>{politica.estado}</TableCell>
                                    <TableCell sx={{ color: colors.text }}>
                                        {new Date(politica.fecha_creacion).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell sx={{ color: colors.text }}>
                                        {new Date(politica.fecha_actualizacion).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell 
                                    colSpan={5} 
                                    align="center"
                                    sx={{ color: colors.secondaryText }}
                                >
                                    No hay políticas inactivas.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog 
                open={openDialog} 
                onClose={handleDialogClose} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: colors.paper,
                        backgroundImage: 'none',
                        boxShadow: isDarkTheme ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)',
                    }
                }}
            >
                <DialogTitle sx={{ color: colors.text }}>
                    Detalles de la Política de Privacidad
                </DialogTitle>
                <DialogContent dividers sx={{
                    borderColor: colors.border,
                    '& .MuiDialogContent-dividers': {
                        borderColor: colors.border
                    }
                }}>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            fontWeight: 'bold', 
                            mb: 2,
                            color: colors.text
                        }}
                    >
                        Título: {dialogContent?.titulo}
                    </Typography>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            overflowWrap: 'break-word', 
                            whiteSpace: 'pre-line', 
                            mb: 3,
                            color: colors.text
                        }}
                    >
                        {dialogContent?.contenido}
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            mb: 2,
                            color: colors.secondaryText
                        }}
                    >
                        Fecha de Creación: {dialogContent?.fecha_creacion ? new Date(dialogContent.fecha_creacion).toLocaleDateString() : ''}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ borderTop: `1px solid ${colors.border}` }}>
                    <Button 
                        onClick={handleDialogClose} 
                        startIcon={<CloseIcon />}
                        sx={{
                            color: colors.primary,
                            '&:hover': {
                                backgroundColor: colors.hover
                            }
                        }}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            <Notificaciones
                open={notification.open}
                message={notification.message}
                type={notification.type}
                handleClose={() => setNotification({ ...notification, open: false })}
            />
        </Box>
    );
};

export default PoliticasPrivacidad;
