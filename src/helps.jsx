import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs as MuiBreadcrumbs, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const Breadcrumbs = ({ paths }) => {
  const theme = useTheme();
  
  // Definir colores según el modo
  const textColor = theme.palette.mode === 'dark' ? 'white' : 'black'; // Blanco en oscuro, negro en claro
  const separatorColor = theme.palette.mode === 'dark' ? '#f0f0f0' : '#1E90FF';
  const hoverColor = theme.palette.mode === 'dark' ? '#dcdcdc' : '#87CEFA'; // Gris claro en oscuro, azul claro en claro
  const backgroundColor = '#EEF6FF'; // Color de fondo especificado
  const hoverBackgroundColor = theme.palette.mode === 'dark' ? '#B7D5FF' : '#CCE3FF'; // Fondo más intenso al pasar el mouse

  return (
    <Box sx={{ padding: '10px', marginTop: '14px', marginLeft: '15px' }}>
      <MuiBreadcrumbs
        separator=">>"
        aria-label="breadcrumb"
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          fontSize: '1rem',
          '& .MuiBreadcrumbs-separator': {
            color: separatorColor,
            fontWeight: 'bold',
          },
        }}
      >
        {paths.map((path, index) => (
          <Box key={index}>
            {index === paths.length - 1 ? (
              <Typography sx={{ 
                color: textColor, 
                fontWeight: 'bold', 
                backgroundColor, 
                padding: '5px 10px', 
                borderRadius: '8px' // Bordes redondeados
              }}>
                {path.name}
              </Typography>
            ) : (
              <Link
                to={path.path}
                style={{
                  textDecoration: 'none',
                }}
              >
                <Box
                  sx={{
                    color: textColor, // Color del texto
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    padding: '5px 10px',
                    borderRadius: '8px', // Bordes redondeados
                    backgroundColor, // Fondo azul suave
                    transition: 'background-color 0.3s ease, color 0.3s ease, transform 0.3s ease',
                    '&:hover': {
                      backgroundColor: hoverBackgroundColor, // Fondo más intenso al pasar el mouse
                      color: theme.palette.mode === 'dark' ? 'white' : 'black', // Color de texto blanco cuando el fondo es azul marino
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  {path.name}
                </Box>
              </Link>
            )}
          </Box>
        ))}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;
