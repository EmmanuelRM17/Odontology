import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './components/Tools/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import ErrorBoundary from './components/Tools/ErrorBoundary';
import ChunkErrorBoundary from './components/Tools/ChunkErrorBoundary';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { preloadAllChunks, prefetchRoutes } from './utils/preloadChunks'; // ← NUEVO

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChunkErrorBoundary>
      <ErrorBoundary>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ChunkErrorBoundary>
  </React.StrictMode>
);

// Registrar PWA
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    const waitingWorker = registration.waiting;
    if (waitingWorker && waitingWorker.state === 'installed') {
      if (window.confirm('Nueva versión disponible. ¿Actualizar ahora?')) {
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        waitingWorker.addEventListener('statechange', (e) => {
          if (e.target.state === 'activated') {
            window.location.reload();
          }
        });
      }
    }
  },
  onSuccess: () => {
    console.log('App lista para uso offline');
    // ← NUEVO: Precargar chunks cuando SW esté listo
    preloadAllChunks();
    prefetchRoutes();
  }
});

reportWebVitals(console.log);