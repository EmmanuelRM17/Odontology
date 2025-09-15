import React from 'react';
import { Box } from '@mui/material';

const SectionDivider = ({ colors }) => (
  <Box
    sx={{
      width: '100%',
      height: '2px', // Solo línea delgada
      background: colors.sectionDivider,
      my: { xs: 6, md: 8 },
      borderRadius: 2,
      // Eliminado el pseudo-elemento ::after
    }}
  />
);

export default SectionDivider;