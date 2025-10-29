import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './components/Tools/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import ErrorBoundary from './components/Tools/ErrorBoundary';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Registrar PWA con callback de actualización
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    if (window.confirm('Nueva versión disponible. ¿Actualizar ahora?')) {
      registration.waiting?.postMessage('SKIP_WAITING');
      window.location.reload();
    }
  },
  onSuccess: () => {
    console.log('App lista para uso offline');
  }
});

reportWebVitals(console.log);