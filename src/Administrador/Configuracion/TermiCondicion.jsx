import React, { useState, useEffect } from 'react';
import {
    TextField, Button, Typography, Paper, IconButton, Dialog, DialogActions, DialogContent, DialogTitle,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import Notificaciones from '../../Compartidos/Notificaciones';

const TerminosCondiciones = () => {
    const [numeroTermino, setNumeroTermino] = useState('');
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

    useEffect(() => {
        fetchTerminos();
        fetchTerminoActivo(); // Cargar término activo
    }, []);

    // Función para obtener todos los términos inactivos
    const fetchTerminos = async () => {
        try {
            const response = await axios.get('https://backendodontologia.onrender.com/api/termiCondicion/getAllTerminos');
            const data = response.data;

            // Filtrar términos inactivos
            const terminosInactivos = data.filter(termino => termino.estado === 'inactivo');

            // Ordenar por versión en orden descendente (de mayor a menor)
            terminosInactivos.sort((a, b) => parseFloat(b.version) - parseFloat(a.version));

            // Establecer los términos ordenados en el estado
            setTerminos(terminosInactivos);
        } catch (error) {
            console.error('Error al cargar términos:', error);
        }
    };


    const fetchTerminoActivo = async () => {
        try {
            const response = await axios.get('https://backendodontologia.onrender.com/api/termiCondicion/gettermino');
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
        if (!numeroTermino) newErrors.numeroTermino = "El número de término es obligatorio.";
        if (!titulo) newErrors.titulo = "El título es obligatorio.";
        if (!contenido) newErrors.contenido = "El contenido es obligatorio.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const terminoData = { numero_termino: numeroTermino, titulo, contenido };

        try {
            if (editingId !== null) {
                // Actualización de un término existente
                await axios.put(`https://backendodontologia.onrender.com/api/termiCondicion/update/${editingId}`, terminoData);
                setNotification({ open: true, message: `Término actualizado correctamente`, type: 'success' });
            } else {
                // Creación de un nuevo término
                await axios.post('https://backendodontologia.onrender.com/api/termiCondicion/insert', terminoData);
                setNotification({ open: true, message: 'Término insertado con éxito', type: 'success' });
            }

            // Actualizar los términos y el activo después de la operación
            await fetchTerminos(); // Actualizar la lista de términos inactivos
            await fetchTerminoActivo(); // Actualizar el término activo
            resetForm();
            setIsAddingNewTermino(false);
        } catch (error) {
            setNotification({ open: true, message: 'Error al enviar término', type: 'error' });
        }
    };

    const resetForm = () => {
        setNumeroTermino('');
        setTitulo('');
        setContenido('');
        setEditingId(null); // Reseteamos el ID de edición
        setErrors({});
        setIsAddingNewTermino(false); // Reactivar el botón "Nuevo Término"
    };

    const handleEdit = async (id) => {
        try {
            // Cargar el término activo directamente para edición
            const response = await axios.get(`https://backendodontologia.onrender.com/api/termiCondicion/get/${id}`);
            const termino = response.data;

            if (termino) {
                setNumeroTermino(termino.numero_termino);
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
            await axios.put(`https://backendodontologia.onrender.com/api/termiCondicion/deactivate/${id}`, { estado: 'inactivo' });
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
        <Box sx={{ padding: '40px', backgroundColor: '#f9fafc', minHeight: '100vh' }}>
            {/* Término de Condiciones Vigente */}
            <Paper sx={{ padding: '20px', maxWidth: '800px', margin: '0 auto', boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)' }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Término de Condiciones
                </Typography>
                {terminoActivo && (
                    <Paper sx={{ padding: '20px', mt: 4, backgroundColor: '#e3f2fd' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={9}>
                                <Typography variant="h5">Vigente: {terminoActivo.titulo}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Número: {terminoActivo.numero_termino}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Versión: {terminoActivo.version}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={3} sx={{ textAlign: 'right' }}>
                                <IconButton onClick={() => handleEdit(terminoActivo.id)}><EditIcon sx={{ color: '#1976d2' }} /></IconButton>
                                <IconButton onClick={() => handleDelete(terminoActivo.id)}><DeleteIcon sx={{ color: 'red' }} /></IconButton>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2">
                                    {truncateContent(terminoActivo.contenido)}{' '}
                                    <Button variant="outlined" onClick={() => handleDialogOpen(terminoActivo)}>Ver más</Button>
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                )}
                {/* Botón Nuevo Término */}
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    sx={{ mt: 3 }}
                    onClick={() => {
                        resetForm(); // Reiniciar el formulario para nuevo término
                        setIsAddingNewTermino(true);
                    }}
                    disabled={isAddingNewTermino} // Deshabilitar botón cuando está activo
                >
                    Nuevo Término
                </Button>

                {/* Formulario para agregar o actualizar términos */}
                {isAddingNewTermino && (
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Número de Término"
                            value={numeroTermino}
                            onChange={(e) => setNumeroTermino(e.target.value)}
                            fullWidth
                            sx={{ mt: 3 }}
                            error={!!errors.numeroTermino}
                            helperText={errors.numeroTermino}
                        />
                        <TextField
                            label="Título"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            fullWidth
                            sx={{ mt: 3 }}
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
                            sx={{ mt: 2 }}
                            error={!!errors.contenido}
                            helperText={errors.contenido}
                        />
                        <Grid container spacing={2} sx={{ mt: 3 }}>
                            <Grid item xs={6}>
                                <Button type="submit" variant="contained" color="primary" fullWidth>
                                    {editingId !== null ? 'Actualizar' : 'Agregar'}
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    fullWidth
                                    onClick={resetForm}
                                >
                                    Cancelar
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                )}
            </Paper>

            {/* Historial de Términos */}
            <Typography variant="h5" align="center" sx={{ mt: 6, mb: 4 }}>
                Historial de Términos por Versión
            </Typography>

            <TableContainer component={Paper} sx={{ maxWidth: '100%', marginTop: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell><Typography fontWeight="bold">Número de Término</Typography></TableCell>
                            <TableCell><Typography fontWeight="bold">Título</Typography></TableCell>
                            <TableCell><Typography fontWeight="bold">Versión</Typography></TableCell>
                            <TableCell><Typography fontWeight="bold">Fecha de Creación</Typography></TableCell>
                            <TableCell><Typography fontWeight="bold">Fecha de Actualización</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {terminos.length > 0 ? (
                            terminos.map((termino, index) => (
                                <TableRow key={index}>
                                    <TableCell>{termino.numero_termino}</TableCell>
                                    <TableCell>{termino.titulo}</TableCell>
                                    <TableCell>{termino.version}</TableCell>
                                    <TableCell>{new Date(termino.fecha_creacion).toLocaleDateString()}</TableCell>
                                    <TableCell>{new Date(termino.fecha_actualizacion).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No hay términos inactivos.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Diálogo para visualizar el contenido completo del término */}
            <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>Detalles del Término de Condiciones</DialogTitle>
                <DialogContent>
                    {/* Título del término */}
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Título: {dialogContent?.titulo}
                    </Typography>

                    {/* Número del término */}
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Número de Término: {dialogContent?.numero_termino}
                    </Typography>

                    {/* Contenido del término */}
                    <Typography variant="body1" sx={{ overflowWrap: 'break-word', whiteSpace: 'pre-line', mb: 3 }}>
                        {dialogContent?.contenido}
                    </Typography>

                    {/* Fecha de creación o de vigencia */}
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Fecha de Creación: {new Date(dialogContent?.fecha_creacion).toLocaleDateString()}
                    </Typography>

                </DialogContent>

                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary" startIcon={<CloseIcon />}>
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Componente de Notificaciones */}
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
