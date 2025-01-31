import React, { useState } from 'react';
import { TextField, Button, Grid, MenuItem, FormControl, Select, InputLabel, Snackbar, Alert, Card, CardContent, Typography, CardHeader, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { FaTooth, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import TablePagination from '@mui/material/TablePagination';

const ServicioForm = () => {
  const [formData, setFormData] = useState({
    nombre_servicio: '',
    descripcion: '',
    precio: '',
    disponibilidad: true,
    promociones: '',
  });

  const [errors, setErrors] = useState({
    nombre_servicio: false,
    descripcion: false,
    precio: false,
    promociones: false,
  });

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [services, setServices] = useState([
    { nombre_servicio: 'Limpieza Dental', descripcion: 'Limpieza profunda', precio: 200, disponibilidad: true, promociones: '10' },
    { nombre_servicio: 'Implantes', descripcion: 'Implante dental', precio: 500, disponibilidad: false, promociones: '0' },
    { nombre_servicio: 'Ortodoncia', descripcion: 'Frenos', precio: 300, disponibilidad: true, promociones: '5' },
    // Agregar más servicios si es necesario
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'promociones' && isNaN(value)) {
      return;  // No permite ingresar letras en el campo promociones
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = { nombre_servicio: false, descripcion: false, precio: false, promociones: false };
    
    // Validar que los campos no estén vacíos
    if (!formData.nombre_servicio) newErrors.nombre_servicio = true;
    if (!formData.descripcion) newErrors.descripcion = true;
    if (formData.precio <= 0 || formData.precio === '') newErrors.precio = true;
    if (formData.promociones && isNaN(formData.promociones)) newErrors.promociones = true;

    setErrors(newErrors);
    return !Object.values(newErrors).includes(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setNotificationMessage('Por favor, complete todos los campos correctamente.');
      setNotificationOpen(true);
      return;
    }

    setNotificationMessage('Servicio agregado con éxito');
    setNotificationOpen(true);

    // Limpiar los campos del formulario
    setFormData({
      nombre_servicio: '',
      descripcion: '',
      precio: '',
      disponibilidad: true,
      promociones: '',
    });
  };

  const handleCloseNotification = () => {
    setNotificationOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    // Aquí se podría agregar la lógica de búsqueda real
    console.log('Buscar servicio:', searchQuery);
  };

  const handleEdit = (index) => {
    const service = services[index];
    setFormData({
      nombre_servicio: service.nombre_servicio,
      descripcion: service.descripcion,
      precio: service.precio,
      disponibilidad: service.disponibilidad,
      promociones: service.promociones,
    });
  };

  const handleDelete = (index) => {
    const updatedServices = services.filter((_, i) => i !== index);
    setServices(updatedServices);
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredServices = services.filter(service =>
    service.nombre_servicio.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ width: '100%', padding: '20px' }}>
      <Card elevation={2} style={{ maxWidth: '900px', margin: 'auto', padding: '20px' }}>
      <CardHeader
          title={<Typography variant="h5" align="center">Agregar Nuevo Servicio Odontológico</Typography>}
        />
       <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <FaTooth size={40} />
        </div>
       
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre del Servicio"
                  name="nombre_servicio"
                  value={formData.nombre_servicio}
                  onChange={handleChange}
                  error={errors.nombre_servicio}
                  helperText={errors.nombre_servicio ? 'Este campo es obligatorio' : ''}
                
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Descripción"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  error={errors.descripcion}
                  helperText={errors.descripcion ? 'Este campo es obligatorio' : ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Precio"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  type="number"
                  error={errors.precio}
                  helperText={errors.precio ? 'El precio debe ser mayor a 0' : ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <Select
                    name="disponibilidad"
                    value={formData.disponibilidad}
                    onChange={handleChange}
                  >
                    <MenuItem value={true}>Disponible</MenuItem>
                    <MenuItem value={false}>No Disponible</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Promociones (Solo Números)"
                  name="promociones"
                  value={formData.promociones}
                  onChange={handleChange}
                  type="number"
                  error={errors.promociones}
                  helperText={errors.promociones ? 'Este campo debe ser un número válido' : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="primary" type="submit" fullWidth>
                  Agregar Servicio
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
        <TextField
          label="Buscar Servicio"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ width: '650px', marginRight: '10px' }}  // Barra de búsqueda más ancha
        />
      </div>

      <TableContainer component={Paper} style={{ marginTop: '20px', backgroundColor: 'white' }}>
        <Table>
          <TableHead style={{ backgroundColor: '#E3F2FD' }}>
            <TableRow>
              <TableCell align="center" style={{ fontWeight: 'bold' }}>Nombre</TableCell>
              <TableCell align="center" style={{ fontWeight: 'bold' }}>Descripción</TableCell>
              <TableCell align="center" style={{ fontWeight: 'bold' }}>Precio</TableCell>
              <TableCell align="center" style={{ fontWeight: 'bold' }}>Disponibilidad</TableCell>
              <TableCell align="center" style={{ fontWeight: 'bold' }}>Promociones</TableCell>
              <TableCell align="center" style={{ fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredServices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((service, index) => (
              <TableRow
                key={index}
                hover
                style={{
                  backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E3F2FD'} // Azul al pasar el puntero
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : 'white'} // Restablece al salir
              >
                <TableCell align="center">{service.nombre_servicio}</TableCell>
                <TableCell align="center">{service.descripcion}</TableCell>
                <TableCell align="center">{service.precio}</TableCell>
                <TableCell align="center">{service.disponibilidad ? 'Disponible' : 'No Disponible'}</TableCell>
                <TableCell align="center">{service.promociones}</TableCell>
                <TableCell align="center">
                  <Button
                    onClick={() => handleEdit(index)}
                    startIcon={<FaEdit />}
                    style={{ margin: '0 5px' }}
                    title="Editar Servicio"
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(index)}
                    startIcon={<FaTrash />}
                    style={{ margin: '0 5px' }}
                    title="Eliminar Servicio"
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={() => handleChangePage(page - 1)}
          disabled={page === 0}
          style={{ marginRight: '10px' }}
        >
          Atras
        </Button>
        <Button
          variant="contained"
          onClick={() => handleChangePage(page + 1)}
          disabled={page >= Math.ceil(filteredServices.length / rowsPerPage) - 1}
        >
          Siguiente
        </Button>
      </div>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredServices.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}
      />

      <Snackbar open={notificationOpen} autoHideDuration={6000} onClose={handleCloseNotification}>
        <Alert onClose={handleCloseNotification} severity={errors.nombre_servicio || errors.descripcion || errors.precio || errors.promociones ? "error" : "success"}>
          {notificationMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ServicioForm;
