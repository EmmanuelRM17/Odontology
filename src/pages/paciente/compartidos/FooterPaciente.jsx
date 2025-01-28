import React from 'react';
import { Box, Typography } from '@mui/material';

const FooterPaciente = () => {
  return (
    <Box sx={{ backgroundColor: '#f8f9fa', p: 2, textAlign: 'center' }}>
      <Typography variant="body2" color="textSecondary">
        © 2024 Clínica Dental - Pacientes
      </Typography>
    </Box>
  );
}

export default FooterPaciente;
