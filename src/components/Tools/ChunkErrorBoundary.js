import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

// Captura errores de chunks y recarga automáticamente
class ChunkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      errorMessage: ''
    };
  }

  static getDerivedStateFromError(error) {
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return { 
        hasError: true,
        errorMessage: error.message 
      };
    }
    return null;
  }

  componentDidCatch(error, errorInfo) {
    if (error.name === 'ChunkLoadError') {
      console.error('ChunkLoadError detectado:', error);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: 3
          }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 4,
              maxWidth: 500,
              textAlign: 'center',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ color: '#667eea', fontWeight: 600 }}>
              🔄 Actualizando...
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3, color: '#666' }}>
              Detectamos una actualización de la aplicación. 
              Recargando automáticamente...
            </Typography>

            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleReload}
              sx={{
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                color: 'white',
                px: 4,
                py: 1.5
              }}
            >
              Recargar Ahora
            </Button>

            <Typography variant="caption" display="block" sx={{ mt: 2, color: '#999' }}>
              La página se recargará automáticamente en 2 segundos
            </Typography>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;