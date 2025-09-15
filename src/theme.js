import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Color principal (azul por defecto)
    },
    secondary: {
      main: '#dc004e', // Color secundario (rojo por defecto)
    },
    background: {
      default: '#f5f5f5', // Fondo claro
      paper: '#ffffff',   // Fondo de tarjetas
    },
    text: {
      primary: '#000000', // Texto principal
      secondary: '#666666', // Texto secundario
    },
    mode: 'light', // O 'dark' para modo oscuro
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', // Fuente predeterminada
    h1: {
      fontSize: '2.5rem',
    },
  },
  spacing: 8, // Unidad base de espaciado (8px por defecto)
});