import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    TextField,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Switch,
    FormControlLabel,
    Chip,
    InputAdornment,
    MenuItem,
    Tooltip,
    CircularProgress,
    useMediaQuery,
    useTheme,
    alpha,
    Divider
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    EmojiEvents as TrophyIcon,
    Close as CloseIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import Notificaciones from '../../../components/Layout/Notificaciones';

const API_URL = 'https://back-end-4803.onrender.com/api/gamificacion';

// Componente principal
const GestionRecompensas = () => {
    const { isDarkTheme } = useThemeContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // Estados principales
    const [recompensas, setRecompensas] = useState([]);
    const [filteredRecompensas, setFilteredRecompensas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedRecompensa, setSelectedRecompensa] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    
    // Sistema de notificaciones
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        type: 'success'
    });

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        tipo: 'descuento',
        puntos_requeridos: 100,
        icono: '',
        premio: '',
        estado: 1,
        orden: 0
    });

    // Colores según tema
    const colors = {
        background: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
        paper: isDarkTheme ? '#243447' : '#ffffff',
        paperLight: isDarkTheme ? '#2C3E50' : '#F0F7FF',
        text: isDarkTheme ? '#E8F1FF' : '#333333',
        secondaryText: isDarkTheme ? '#B8C7D9' : '#666666',
        primary: isDarkTheme ? '#4B9FFF' : '#1976d2',
        primaryDark: isDarkTheme ? '#3D7ECC' : '#0A4B94',
        hover: isDarkTheme ? 'rgba(75,159,255,0.15)' : 'rgba(25,118,210,0.08)',
        border: isDarkTheme ? '#364B63' : '#e0e0e0',
        tableHeader: isDarkTheme ? '#2C3E50' : '#f5f5f5',
        tableRowHover: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
        success: isDarkTheme ? '#5CDB5C' : '#4CAF50',
        error: isDarkTheme ? '#ff6b6b' : '#f44336'
    };

    const tiposRecompensa = [
        { value: 'descuento', label: 'Descuento' },
        { value: 'servicio', label: 'Servicio Gratis' },
        { value: 'producto', label: 'Producto' },
        { value: 'especial', label: 'Promoción Especial' }
    ];

    // Mostrar notificación
    const showNotif = (message, type = 'success') => {
        setNotification({
            open: true,
            message,
            type
        });
    };

    // Cerrar notificación
    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    // Cargar recompensas al montar
    useEffect(() => {
        fetchRecompensas();
    }, []);

    // Filtrar recompensas cuando cambia el término de búsqueda
    useEffect(() => {
        const filtered = recompensas.filter(r =>
            r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.premio?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredRecompensas(filtered);
    }, [searchTerm, recompensas]);

    // Obtener todas las recompensas
    const fetchRecompensas = async () => {
        setIsLoadingData(true);
        try {
            const { data } = await axios.get(`${API_URL}/recompensas`);
            setRecompensas(data);
            setFilteredRecompensas(data);
        } catch (error) {
            console.error('Error al cargar recompensas:', error);
            showNotif('Error al cargar recompensas', 'error');
        } finally {
            setIsLoadingData(false);
        }
    };

    // Abrir dialog para crear/editar
    const handleOpenDialog = (recompensa = null) => {
        if (recompensa) {
            setSelectedRecompensa(recompensa);
            setFormData({
                nombre: recompensa.nombre,
                descripcion: recompensa.descripcion || '',
                tipo: recompensa.tipo,
                puntos_requeridos: recompensa.puntos_requeridos,
                icono: recompensa.icono || '',
                premio: recompensa.premio || '',
                estado: recompensa.estado,
                orden: recompensa.orden || 0
            });
        } else {
            setSelectedRecompensa(null);
            setFormData({
                nombre: '',
                descripcion: '',
                tipo: 'descuento',
                puntos_requeridos: 100,
                icono: '',
                premio: '',
                estado: 1,
                orden: 0
            });
        }
        setOpenDialog(true);
    };

    // Cerrar dialog
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedRecompensa(null);
    };

    // Guardar recompensa (crear o actualizar)
    const handleSaveRecompensa = async () => {
        // Validaciones
        if (!formData.nombre.trim()) {
            showNotif('El nombre es obligatorio', 'warning');
            return;
        }
        if (!formData.puntos_requeridos || formData.puntos_requeridos < 1) {
            showNotif('Los puntos requeridos deben ser mayor a 0', 'warning');
            return;
        }

        setLoading(true);
        try {
            if (selectedRecompensa) {
                await axios.put(`${API_URL}/recompensas/${selectedRecompensa.id}`, formData);
                showNotif('Recompensa actualizada exitosamente', 'success');
            } else {
                await axios.post(`${API_URL}/recompensas`, formData);
                showNotif('Recompensa creada exitosamente', 'success');
            }
            handleCloseDialog();
            fetchRecompensas();
        } catch (error) {
            console.error('Error al guardar recompensa:', error);
            showNotif(
                error.response?.data?.error || 'Error al guardar recompensa',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    // Abrir dialog de confirmación para eliminar
    const handleOpenDeleteDialog = (recompensa) => {
        setSelectedRecompensa(recompensa);
        setOpenDeleteDialog(true);
    };

    // Eliminar recompensa
    const handleDeleteRecompensa = async () => {
        setLoading(true);
        try {
            await axios.delete(`${API_URL}/recompensas/${selectedRecompensa.id}`);
            showNotif('Recompensa eliminada exitosamente', 'success');
            setOpenDeleteDialog(false);
            fetchRecompensas();
        } catch (error) {
            console.error('Error al eliminar recompensa:', error);
            showNotif(
                error.response?.data?.error || 'Error al eliminar recompensa',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    // Cambiar estado activo/inactivo
    const handleToggleEstado = async (recompensa) => {
        try {
            const nuevoEstado = recompensa.estado === 1 ? 0 : 1;
            await axios.put(`${API_URL}/recompensas/${recompensa.id}`, {
                ...recompensa,
                estado: nuevoEstado
            });
            showNotif(
                `Recompensa ${nuevoEstado === 1 ? 'activada' : 'desactivada'} correctamente`,
                'success'
            );
            fetchRecompensas();
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            showNotif('Error al actualizar estado', 'error');
        }
    };

    // Obtener color del chip según tipo
    const getTipoColor = (tipo) => {
        const colors = {
            descuento: 'primary',
            servicio: 'success',
            producto: 'warning',
            especial: 'secondary'
        };
        return colors[tipo] || 'default';
    };

    return (
        <Box sx={{ p: isMobile ? 2 : 3, backgroundColor: colors.background, minHeight: '100vh' }}>
            {/* Header */}
            <Box
                sx={{
                    mb: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: 2
                }}
            >
                <Box>
                    <Typography
                        variant={isMobile ? 'h5' : 'h4'}
                        sx={{
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: colors.text
                        }}
                    >
                        <TrophyIcon sx={{ color: colors.primary, fontSize: isMobile ? 32 : 40 }} />
                        Gestión de Recompensas
                    </Typography>
                    <Typography variant="body2" color={colors.secondaryText} sx={{ mt: 0.5 }}>
                        Administra el catálogo de premios y recompensas
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                        backgroundColor: colors.primary,
                        '&:hover': { backgroundColor: colors.primaryDark },
                        textTransform: 'none',
                        fontWeight: 600,
                        width: isMobile ? '100%' : 'auto'
                    }}
                >
                    Nueva Recompensa
                </Button>
            </Box>

            {/* Barra de búsqueda */}
            <Card
                sx={{
                    mb: 3,
                    backgroundColor: colors.paper,
                    boxShadow: isDarkTheme ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
                }}
            >
                <CardContent>
                    <TextField
                        fullWidth
                        placeholder="Buscar por nombre, tipo o premio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: colors.secondaryText }} />
                                </InputAdornment>
                            ),
                            style: { color: colors.text }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: colors.border },
                                '&:hover fieldset': { borderColor: colors.primary },
                                '&.Mui-focused fieldset': { borderColor: colors.primary }
                            }
                        }}
                    />
                </CardContent>
            </Card>

            {/* Tabla de recompensas */}
            <TableContainer
                component={Paper}
                sx={{
                    backgroundColor: colors.paper,
                    boxShadow: isDarkTheme ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                    borderRadius: 2,
                    overflow: 'hidden'
                }}
            >
                <Table>
                    <TableHead sx={{ backgroundColor: colors.tableHeader }}>
                        <TableRow>
                            <TableCell sx={{ color: colors.text, fontWeight: 700 }}>Icono</TableCell>
                            <TableCell sx={{ color: colors.text, fontWeight: 700 }}>Nombre</TableCell>
                            {!isMobile && (
                                <TableCell sx={{ color: colors.text, fontWeight: 700 }}>Tipo</TableCell>
                            )}
                            <TableCell sx={{ color: colors.text, fontWeight: 700 }}>Puntos</TableCell>
                            {!isMobile && (
                                <TableCell sx={{ color: colors.text, fontWeight: 700 }}>Premio</TableCell>
                            )}
                            <TableCell sx={{ color: colors.text, fontWeight: 700 }}>Estado</TableCell>
                            <TableCell sx={{ color: colors.text, fontWeight: 700 }} align="center">
                                Acciones
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoadingData ? (
                            <TableRow>
                                <TableCell colSpan={isMobile ? 5 : 7} align="center" sx={{ py: 4 }}>
                                    <CircularProgress sx={{ color: colors.primary }} />
                                </TableCell>
                            </TableRow>
                        ) : filteredRecompensas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={isMobile ? 5 : 7} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color={colors.secondaryText}>
                                        {searchTerm
                                            ? 'No se encontraron recompensas'
                                            : 'No hay recompensas registradas'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRecompensas.map((recompensa) => (
                                <TableRow
                                    key={recompensa.id}
                                    sx={{
                                        '&:hover': { backgroundColor: colors.tableRowHover },
                                        cursor: 'pointer'
                                    }}
                                >
                                    <TableCell>
                                        <Typography variant="h5">{recompensa.icono || '🎁'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            fontWeight={600}
                                            sx={{ color: colors.text }}
                                        >
                                            {recompensa.nombre}
                                        </Typography>
                                        {isMobile && recompensa.descripcion && (
                                            <Typography
                                                variant="caption"
                                                sx={{ color: colors.secondaryText, display: 'block' }}
                                            >
                                                {recompensa.descripcion}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    {!isMobile && (
                                        <TableCell>
                                            <Chip
                                                label={
                                                    tiposRecompensa.find((t) => t.value === recompensa.tipo)
                                                        ?.label || recompensa.tipo
                                                }
                                                color={getTipoColor(recompensa.tipo)}
                                                size="small"
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            fontWeight="bold"
                                            sx={{ color: colors.primary }}
                                        >
                                            {recompensa.puntos_requeridos} pts
                                        </Typography>
                                    </TableCell>
                                    {!isMobile && (
                                        <TableCell>
                                            <Typography variant="body2" sx={{ color: colors.text }}>
                                                {recompensa.premio || '-'}
                                            </Typography>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <Switch
                                            checked={recompensa.estado === 1}
                                            onChange={() => handleToggleEstado(recompensa)}
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Editar">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(recompensa)}
                                                sx={{ color: colors.primary }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDeleteDialog(recompensa)}
                                                sx={{ color: colors.error }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Crear/Editar */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        backgroundColor: colors.paper,
                        backgroundImage: 'none'
                    }
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ color: colors.text, fontWeight: 700 }}>
                            {selectedRecompensa ? 'Editar Recompensa' : 'Nueva Recompensa'}
                        </Typography>
                        <IconButton onClick={handleCloseDialog} sx={{ color: colors.text }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <Divider />
                <DialogContent dividers sx={{ backgroundColor: colors.paperLight }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nombre"
                                required
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                sx={{
                                    '& .MuiInputLabel-root': { color: colors.secondaryText },
                                    '& .MuiOutlinedInput-root': {
                                        color: colors.text,
                                        '& fieldset': { borderColor: colors.border },
                                        '&:hover fieldset': { borderColor: colors.primary },
                                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Descripción"
                                multiline
                                rows={2}
                                value={formData.descripcion}
                                onChange={(e) =>
                                    setFormData({ ...formData, descripcion: e.target.value })
                                }
                                sx={{
                                    '& .MuiInputLabel-root': { color: colors.secondaryText },
                                    '& .MuiOutlinedInput-root': {
                                        color: colors.text,
                                        '& fieldset': { borderColor: colors.border },
                                        '&:hover fieldset': { borderColor: colors.primary },
                                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Tipo"
                                value={formData.tipo}
                                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                sx={{
                                    '& .MuiInputLabel-root': { color: colors.secondaryText },
                                    '& .MuiOutlinedInput-root': {
                                        color: colors.text,
                                        '& fieldset': { borderColor: colors.border },
                                        '&:hover fieldset': { borderColor: colors.primary },
                                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                                    }
                                }}
                            >
                                {tiposRecompensa.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Puntos Requeridos"
                                type="number"
                                required
                                value={formData.puntos_requeridos}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        puntos_requeridos: parseInt(e.target.value) || 0
                                    })
                                }
                                inputProps={{ min: 1 }}
                                sx={{
                                    '& .MuiInputLabel-root': { color: colors.secondaryText },
                                    '& .MuiOutlinedInput-root': {
                                        color: colors.text,
                                        '& fieldset': { borderColor: colors.border },
                                        '&:hover fieldset': { borderColor: colors.primary },
                                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Icono (emoji)"
                                value={formData.icono}
                                onChange={(e) => setFormData({ ...formData, icono: e.target.value })}
                                placeholder="🎁"
                                sx={{
                                    '& .MuiInputLabel-root': { color: colors.secondaryText },
                                    '& .MuiOutlinedInput-root': {
                                        color: colors.text,
                                        '& fieldset': { borderColor: colors.border },
                                        '&:hover fieldset': { borderColor: colors.primary },
                                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Orden"
                                type="number"
                                value={formData.orden}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        orden: parseInt(e.target.value) || 0
                                    })
                                }
                                sx={{
                                    '& .MuiInputLabel-root': { color: colors.secondaryText },
                                    '& .MuiOutlinedInput-root': {
                                        color: colors.text,
                                        '& fieldset': { borderColor: colors.border },
                                        '&:hover fieldset': { borderColor: colors.primary },
                                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Premio/Beneficio"
                                value={formData.premio}
                                onChange={(e) => setFormData({ ...formData, premio: e.target.value })}
                                placeholder="Ej: 10% de descuento en próxima consulta"
                                sx={{
                                    '& .MuiInputLabel-root': { color: colors.secondaryText },
                                    '& .MuiOutlinedInput-root': {
                                        color: colors.text,
                                        '& fieldset': { borderColor: colors.border },
                                        '&:hover fieldset': { borderColor: colors.primary },
                                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.estado === 1}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                estado: e.target.checked ? 1 : 0
                                            })
                                        }
                                        color="primary"
                                    />
                                }
                                label={
                                    <Typography sx={{ color: colors.text }}>
                                        Recompensa activa
                                    </Typography>
                                }
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: colors.paper, p: 2 }}>
                    <Button
                        onClick={handleCloseDialog}
                        disabled={loading}
                        sx={{ color: colors.secondaryText }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSaveRecompensa}
                        variant="contained"
                        disabled={loading}
                        sx={{
                            backgroundColor: colors.primary,
                            '&:hover': { backgroundColor: colors.primaryDark }
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={24} sx={{ color: 'white' }} />
                        ) : (
                            'Guardar'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Confirmar Eliminación */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: colors.paper,
                        backgroundImage: 'none'
                    }
                }}
            >
                <DialogTitle sx={{ color: colors.text }}>Confirmar Eliminación</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: colors.text }}>
                        ¿Está seguro que desea eliminar la recompensa "
                        <strong>{selectedRecompensa?.nombre}</strong>"?
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.secondaryText, mt: 1 }}>
                        Esta acción no se puede deshacer.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenDeleteDialog(false)}
                        disabled={loading}
                        sx={{ color: colors.secondaryText }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDeleteRecompensa}
                        variant="contained"
                        disabled={loading}
                        sx={{
                            backgroundColor: colors.error,
                            '&:hover': {
                                backgroundColor: isDarkTheme ? '#ff4444' : '#d32f2f'
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Eliminar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notificaciones */}
            <Notificaciones
                open={notification.open}
                message={notification.message}
                type={notification.type}
                handleClose={handleCloseNotification}
            />
        </Box>
    );
};

export default GestionRecompensas;