import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';

const LogsReport = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('https://backendodontologia.onrender.com/api/reportes/logs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener los logs');
        }

        const data = await response.json();
        setLogs(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchLogs();
  }, []);

  return (
    <Box sx={{ padding: 3 }}>
      {error && <Typography color="error">{error}</Typography>}
      <Typography variant="h5" sx={{ marginBottom: 2 }}>Reporte de Logs del Sistema</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nivel</TableCell>
              <TableCell>Mensaje</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.id}</TableCell>
                <TableCell>{log.level}</TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>{log.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LogsReport;
