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


const TerminosCondiciones = () => {
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogContent, setDialogContent] = useState('');
    const [errors, setErrors] = useState({});
    const [terminos, setTerminos] = useState([]);
    const [terminoActivo, setTerminoActivo] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
    const [isAddingNewTermino, setIsAddingNewTermino] = useState(false);
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        fetchTerminos();
        fetchTerminoActivo(); // Cargar término activo
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

    // Función para obtener todos los términos inactivos
    const fetchTerminos = async () => {
        try {
            const response = await axios.get('https://back-end-4803.onrender.com/api/termiCondicion/getAllTerminos');
            const data = response.data;

            // Ordenar por versión en orden descendente (de mayor a menor)
            data.sort((a, b) => parseFloat(b.version) - parseFloat(a.version));

            // Establecer los términos ordenados en el estado
            setTerminos(data);
        } catch (error) {
            console.error('Error al cargar términos:', error);
        }
    };

    const fetchTerminoActivo = async () => {
        try {
            const response = await axios.get('https://back-end-4803.onrender.com/api/termiCondicion/gettermino');
            if (response.data) {
                setTerminoActivo(response.data); // Guardar el término activo
            } else {
                setTerminoActivo(null); // En caso de que no haya un término activo
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setTerminoActivo(null); // Establecer término activo a null si no existe
                console.error('No hay términos activos.');
            } else {
                console.error('Error al cargar término activo:', error);
                setTerminoActivo(null);
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

        const terminoData = { titulo, contenido };

        try {
            if (editingId !== null) {
                // Actualización de un término existente
                await axios.put(`https://back-end-4803.onrender.com/api/termiCondicion/update/${editingId}`, terminoData);
                setNotification({ open: true, message: `Término actualizado correctamente`, type: 'success' });
            } else {
                // Creación de un nuevo término
                await axios.post('https://back-end-4803.onrender.com/api/termiCondicion/insert', terminoData);
                setNotification({ open: true, message: 'Término insertado con éxito', type: 'success' });
            }

            // Actualizar los términos y el activo después de la operación
            await fetchTerminos(); // Actualizar la lista de términos
            await fetchTerminoActivo(); // Actualizar el término activo
            resetForm();
            setIsAddingNewTermino(false);
        } catch (error) {
            setNotification({ open: true, message: 'Error al enviar término', type: 'error' });
        }
    };

    const resetForm = () => {
        setTitulo('');
        setContenido('');
        setEditingId(null); // Reseteamos el ID de edición
        setErrors({});
        setIsAddingNewTermino(false); // Reactivar el botón "Nuevo Término"
    };

    const handleEdit = async (id) => {
        try {
            // Cargar el término activo directamente para edición
            const response = await axios.get(`https://back-end-4803.onrender.com/api/termiCondicion/get/${id}`);
            const termino = response.data;

            if (termino) {
                setTitulo(termino.titulo);
                setContenido(termino.contenido);
                setEditingId(id); // Guarda correctamente el ID del término a editar
                setIsAddingNewTermino(true); // Abrir el formulario para editar
            }
        } catch (error) {
            console.error("Error al cargar el término para editar:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.put(`https://back-end-4803.onrender.com/api/termiCondicion/deactivate/${id}`, { estado: 'inactivo' });
            setNotification({ open: true, message: 'Término eliminado con éxito', type: 'success' });
            await fetchTerminos();
            await fetchTerminoActivo(); // Refresca el término activo tras eliminar
        } catch (error) {
            setNotification({ open: true, message: 'Error al eliminar término', type: 'error' });
        }
    };

    const handleDialogOpen = (termino) => {
        setDialogContent(termino); // Guardamos todo el objeto del término en lugar de solo el contenido
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
                    Términos y Condiciones
                </Typography>

                {terminoActivo && (
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
                                    Vigente: {terminoActivo.titulo}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: colors.secondaryText,
                                        mt: 1
                                    }}
                                >
                                    Estado: {terminoActivo.estado}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: colors.secondaryText }}
                                >
                                    Versión: {terminoActivo.version}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={3} sx={{ textAlign: 'right' }}>
                                <IconButton
                                    onClick={() => handleEdit(terminoActivo.id)}
                                    sx={{
                                        color: colors.primary,
                                        '&:hover': { backgroundColor: colors.hover }
                                    }}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    onClick={() => handleDelete(terminoActivo.id)}
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
                                    sx={{
                                        color: colors.text,
                                        mt: 2
                                    }}
                                >
                                    {truncateContent(terminoActivo.contenido)}{' '}
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleDialogOpen(terminoActivo)}
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
                        setIsAddingNewTermino(true);
                    }}
                    disabled={isAddingNewTermino}
                >
                    Nuevo Término
                </Button>

                {isAddingNewTermino && (
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
                Historial de Términos por Versión
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
                        {terminos.length > 0 ? (
                            terminos.map((termino, index) => (
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
                                    <TableCell sx={{ color: colors.text }}>{termino.titulo}</TableCell>
                                    <TableCell sx={{ color: colors.text }}>{termino.version}</TableCell>
                                    <TableCell sx={{ color: colors.text }}>{termino.estado}</TableCell>
                                    <TableCell sx={{ color: colors.text }}>
                                        {new Date(termino.fecha_creacion).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell sx={{ color: colors.text }}>
                                        {new Date(termino.fecha_actualizacion).toLocaleDateString()}
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
                                    No hay términos registrados.
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
                    Detalles del Término
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

export default TerminosCondiciones;
