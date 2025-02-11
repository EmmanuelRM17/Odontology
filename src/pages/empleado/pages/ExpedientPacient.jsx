import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { Visibility } from '@mui/icons-material';  // Ícono de ojo

const ExpedienteClinico = () => {
  const location = useLocation();
  const { nombre, telefono, correo } = location.state || {};

  const [hoveredRow, setHoveredRow] = useState(null);
  const [filters, setFilters] = useState({ servicio: '', fecha: '' });

  // Datos de ejemplo para el historial con nombre del servicio
  const historial = [
    { fecha: '2025-02-01', descripcion: 'Consulta general', servicio: 'Medicina General', id: 1 },
    { fecha: '2025-01-15', descripcion: 'Revisión dental', servicio: 'Odontología', id: 2 },
    { fecha: '2024-12-20', descripcion: 'Chequeo de salud', servicio: 'Medicina General', id: 3 },
    { fecha: '2024-11-30', descripcion: 'Limpieza dental', servicio: 'Odontología', id: 4 },
    { fecha: '2024-10-10', descripcion: 'Consulta de urgencias', servicio: 'Urgencias', id: 5 },
  ];

  // Función para visualizar expediente
  const visualizarExpediente = (id) => {
    console.log(`Visualizando expediente con ID: ${id}`);
    // Aquí iría la lógica para visualizar el expediente
  };

  // Función para filtrar los datos
  const applyFilters = () => {
    let filteredData = historial.filter((item) => {
      const servicioMatch = item.servicio.toLowerCase().includes(filters.servicio.toLowerCase());
      const fechaMatch = item.fecha.includes(filters.fecha);
      return servicioMatch && fechaMatch;
    });

    // Ordenar por fecha según el filtro seleccionado
    if (filters.fecha === 'másReciente') {
      filteredData = filteredData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    } else if (filters.fecha === 'másAntiguo') {
      filteredData = filteredData.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    }

    return filteredData;
  };

  return (
    <div style={{ marginTop: '80px' }}>
      <h2 style={{ color: '#003366', textAlign: 'center' }}>Expediente Clínico</h2>

      <form style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <TextField 
          label="Nombre Completo" 
          value={nombre || 'No disponible'} 
          disabled 
          style={{ marginRight: '10px', width: '300px' }}
        />
        <TextField 
          label="Correo" 
          value={correo || 'No disponible'} 
          disabled 
          style={{ marginRight: '10px', width: '300px' }}
        />
        <TextField 
          label="Teléfono" 
          value={telefono || 'No disponible'} 
          disabled 
          style={{ width: '300px' }}
        />
      </form>

      <h3 style={{ textAlign: 'center' }}>Historial de Expediente Clínico</h3>

      {/* Filtros */}
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'flex-start', marginLeft: '20px' }}>
        <TextField 
          label="Filtrar por Servicio" 
          value={filters.servicio} 
          onChange={(e) => setFilters({ ...filters, servicio: e.target.value })}
          style={{ width: '300px', marginRight: '10px' }}
        />
        <FormControl style={{ width: '300px' }}>
          <InputLabel>Filtrar por Fecha</InputLabel>
          <Select
            value={filters.fecha}
            onChange={(e) => setFilters({ ...filters, fecha: e.target.value })}
            label="Filtrar por Fecha"
          >
            <MenuItem value="">Seleccionar</MenuItem>
            <MenuItem value="másReciente">Más reciente</MenuItem>
            <MenuItem value="másAntiguo">Más antiguo</MenuItem>
          </Select>
        </FormControl>
      </div>

      <TableContainer style={{ maxWidth: '80%', margin: 'auto', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
        <Table>
          <TableHead style={{ backgroundColor: '#e0f7fa' }}>
            <TableRow>
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell><strong>Servicio</strong></TableCell>
              <TableCell><strong>Descripción</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applyFilters().map((item) => (
              <TableRow
                key={item.id}
                onMouseEnter={() => setHoveredRow(item.id)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  backgroundColor: hoveredRow === item.id ? '#b3e5fc' : 'transparent', // Color azul bajito al pasar el ratón
                }}
              >
                <TableCell>{item.fecha}</TableCell>
                <TableCell>{item.servicio}</TableCell>
                <TableCell>{item.descripcion}</TableCell>
                <TableCell>
                  <Button 
                    variant="contained" 
                    startIcon={<Visibility />} 
                    onClick={() => visualizarExpediente(item.id)} 
                    title="Ver expediente"
                    style={{ textTransform: 'none' }}
                  >
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ExpedienteClinico;
