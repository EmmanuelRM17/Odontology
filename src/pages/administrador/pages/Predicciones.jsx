import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Card, CardContent, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Tooltip
} from '@mui/material';
import { Assessment, Visibility } from '@mui/icons-material';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const PrediccionesNoShow = () => {
  const { isDarkTheme } = useThemeContext();
  const [citas, setCitas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [loadingPred, setLoadingPred] = useState({});
  const [resultados, setResultados] = useState({});

  const colors = {
    background: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
    paper: isDarkTheme ? '#243447' : '#ffffff',
    text: isDarkTheme ? '#FFFFFF' : '#333333',
    primary: isDarkTheme ? '#4B9FFF' : '#1976d2',
  };

  const fetchCitas = useCallback(async () => {
    setLoadingCitas(true);
    try {
      const res = await fetch('https://back-end-4803.onrender.com/api/citas/all');
      const data = await res.json();
      setCitas(data.filter(c => !c.archivado));
    } catch (e) {
      console.error('Error cargando citas:', e);
      setCitas([]);
    } finally {
      setLoadingCitas(false);
    }
  }, []);

  useEffect(() => { fetchCitas(); }, [fetchCitas]);

  const handlePredict = async (cita) => {
    const id = cita.consulta_id;
    setLoadingPred(prev => ({ ...prev, [id]: true }));

    // Prepara datos para la predicción
    const payload = {
      paciente_id: cita.paciente_id,
      fecha_solicitud: cita.fecha_solicitud,
      fecha_consulta: cita.fecha_consulta,
      paciente_fecha_nacimiento: cita.paciente_fecha_nacimiento,
      paciente_genero: cita.paciente_genero,
      paciente_alergias: cita.paciente_alergias,
      paciente_registro_completo: cita.paciente_registro_completo,
      paciente_verificado: cita.paciente_verificado,
      categoria_servicio: cita.categoria_servicio,
      precio_servicio: cita.precio_servicio,
      duracion: cita.duracion
      // histórico: el back traerá total_citas_historicas, etc.
    };

    try {
      const res = await fetch('https://back-end-4803.onrender.com/api/ml/predict-no-show', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      setResultados(prev => ({ ...prev, [id]: json.prediction }));
    } catch (e) {
      console.error('Error en predicción:', e);
    } finally {
      setLoadingPred(prev => ({ ...prev, [id]: false }));
    }
  };

  if (loadingCitas) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3, backgroundColor: colors.background, minHeight: '100vh' }}>
      <Typography variant="h5" sx={{ mb: 2, color: colors.primary }}>Predicción de No-Show</Typography>

      <TableContainer component={Paper} sx={{ backgroundColor: colors.paper }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Paciente</TableCell>
              <TableCell>Fecha de Cita</TableCell>
              <TableCell>Servicio</TableCell>
              <TableCell align="center">Predicción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {citas.map(cita => (
              <TableRow key={cita.consulta_id}>
                <TableCell>{cita.paciente_nombre || 'No registrado'}</TableCell>
                <TableCell>{new Date(cita.fecha_consulta).toLocaleString()}</TableCell>
                <TableCell>{cita.servicio_nombre}</TableCell>
                <TableCell align="center">
                  {loadingPred[cita.consulta_id]
                    ? <CircularProgress size={24} />
                    : resultados[cita.consulta_id]
                      ? (
                        <Tooltip title={`Probabilidad: ${(resultados[cita.consulta_id].probability*100).toFixed(1)}%`}>
                          <Button
                            startIcon={<Assessment />} 
                            onClick={() => handlePredict(cita)}
                            variant="contained"
                            size="small"
                            sx={{ backgroundColor: colors.primary }}
                          >
                            {resultados[cita.consulta_id].will_no_show ? 'Alto riesgo' : 'Bajo riesgo'}
                          </Button>
                        </Tooltip>
                      )
                      : (
                        <Button
                          startIcon={<Visibility />}
                          onClick={() => handlePredict(cita)}
                          variant="outlined"
                          size="small"
                        >Predecir</Button>
                      )
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PrediccionesNoShow;
