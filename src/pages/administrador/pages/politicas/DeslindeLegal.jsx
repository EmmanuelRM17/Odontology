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
import { useThemeContext } from '../../../../components/Tools/ThemeContext';


const DeslindeLegal = () => {
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogContent, setDialogContent] = useState('');
    const [errors, setErrors] = useState({});
    const [deslindes, setDeslindes] = useState([]);
    const [deslindeActivo, setDeslindeActivo] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
    const [isAddingNewDeslinde, setIsAddingNewDeslinde] = useState(false);
    const { isDarkTheme } = useThemeContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


    useEffect(() => {
        fetchDeslindes();
        fetchDeslindeActivo();
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


    // Obtener deslindes inactivos
    const fetchDeslindes = async () => {
        try {
            const response = await axios.get('https://back-end-4803.onrender.com/api/deslinde/getAllDeslindes');
            const data = response.data;

            const deslindesInactivos = data.filter(deslinde => deslinde.estado === 'inactivo');
            deslindesInactivos.sort((a, b) => parseFloat(b.version) - parseFloat(a.version));

            setDeslindes(deslindesInactivos);
        } catch (error) {
            console.error('Error al cargar deslindes:', error);
        }
    };

    // Obtener deslinde activo
    const fetchDeslindeActivo = async () => {
        try {
            const response = await axios.get('https://back-end-4803.onrender.com/api/deslinde/getdeslinde');
            setDeslindeActivo(response.data || null);
        } catch (error) {
            console.error('Error al cargar deslinde activo:', error);
            setDeslindeActivo(null);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!titulo) newErrors.titulo = 'El título es obligatorio.';
        if (!contenido) newErrors.contenido = 'El contenido es obligatorio.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const deslindeData = { numero_deslinde: 0, titulo, contenido };

        try {
            if (editingId !== null) {
                // Actualizar deslinde existente
                await axios.put(`https://back-end-4803.onrender.com/api/deslinde/update/${editingId}`, deslindeData);
                setNotification({ open: true, message: 'Deslinde actualizado correctamente', type: 'success' });
            } else {
                // Crear nuevo deslinde
                await axios.post('https://back-end-4803.onrender.com/api/deslinde/insert', deslindeData);
                setNotification({ open: true, message: 'Deslinde insertado con éxito', type: 'success' });
            }

            await fetchDeslindes();
            await fetchDeslindeActivo();
            resetForm();
            setIsAddingNewDeslinde(false);
        } catch (error) {
            setNotification({ open: true, message: 'Error al enviar deslinde', type: 'error' });
        }
    };

    const resetForm = () => {
        setTitulo('');
        setContenido('');
        setEditingId(null);
        setErrors({});
        setIsAddingNewDeslinde(false);
    };

    const handleEdit = async (id) => {
        try {
            const response = await axios.get(`https://back-end-4803.onrender.com/api/deslinde/get/${id}`);
            const deslinde = response.data;

            if (deslinde) {
                setTitulo(deslinde.titulo);
                setContenido(deslinde.contenido);
                setEditingId(id);
                setIsAddingNewDeslinde(true);
            }
        } catch (error) {
            console.error('Error al cargar el deslinde para editar:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.put(`https://back-end-4803.onrender.com/api/deslinde/deactivate/${id}`, { estado: 'inactivo' });
            setNotification({ open: true, message: 'Deslinde eliminado con éxito', type: 'success' });
            await fetchDeslindes();
            await fetchDeslindeActivo();
        } catch (error) {
            setNotification({ open: true, message: 'Error al eliminar deslinde', type: 'error' });
        }
    };

    const handleDialogOpen = (deslinde) => {
        setDialogContent(deslinde);
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
                    Deslinde Legal
                </Typography>

                {deslindeActivo && (
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
                                    Vigente: {deslindeActivo.titulo}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: colors.secondaryText }}
                                >
                                    Versión: {deslindeActivo.version}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={3} sx={{ textAlign: 'right' }}>
                                <IconButton
                                    onClick={() => handleEdit(deslindeActivo.id)}
                                    sx={{
                                        color: colors.primary,
                                        '&:hover': { backgroundColor: colors.hover }
                                    }}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    onClick={() => handleDelete(deslindeActivo.id)}
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
                                    {truncateContent(deslindeActivo.contenido)}{' '}
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleDialogOpen(deslindeActivo)}
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
                        setIsAddingNewDeslinde(true);
                    }}
                    disabled={isAddingNewDeslinde}
                >
                    Nuevo Deslinde
                </Button>

                {isAddingNewDeslinde && (
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
                Historial de Deslindes por Versión
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
                                    Estado
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography sx={{ fontWeight: 'bold', color: colors.text }}>
                                    Versión
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
                        {deslindes.length > 0 ? (
                            deslindes.map((deslinde, index) => (
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
                                    <TableCell sx={{ color: colors.text }}>{deslinde.titulo}</TableCell>
                                    <TableCell sx={{ color: colors.text }}>{deslinde.estado}</TableCell>
                                    <TableCell sx={{ color: colors.text }}>{deslinde.version}</TableCell>
                                    <TableCell sx={{ color: colors.text }}>
                                        {new Date(deslinde.fecha_creacion).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell sx={{ color: colors.text }}>
                                        {new Date(deslinde.fecha_actualizacion).toLocaleDateString()}
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
                                    No hay deslindes inactivos.
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
                    Detalles del Deslinde
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

export default DeslindeLegal;
