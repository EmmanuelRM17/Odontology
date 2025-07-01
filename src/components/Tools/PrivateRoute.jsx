import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// Cache global para evitar múltiples llamadas
let authCache = {
  isAuthenticated: null,
  timestamp: 0,
  isChecking: false
};

const CACHE_DURATION = 60000; // 1 minuto en milisegundos
const MAX_RETRIES = 2;

const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async (retryCount = 0) => {
    const now = Date.now();
    
    // Verificar cache válido
    if (authCache.isAuthenticated !== null && 
        (now - authCache.timestamp) < CACHE_DURATION) {
      setIsAuthenticated(authCache.isAuthenticated);
      setIsLoading(false);
      return;
    }

    // Evitar múltiples llamadas simultáneas
    if (authCache.isChecking) {
      const checkInterval = setInterval(() => {
        if (!authCache.isChecking) {
          clearInterval(checkInterval);
          setIsAuthenticated(authCache.isAuthenticated);
          setIsLoading(false);
        }
      }, 100);
      return;
    }

    authCache.isChecking = true;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos timeout

      const response = await fetch('https://back-end-4803.onrender.com/api/users/check-auth', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const authenticated = data.authenticated === true;
        
        // Actualizar cache
        authCache = {
          isAuthenticated: authenticated,
          timestamp: now,
          isChecking: false
        };

        setIsAuthenticated(authenticated);
        
        if (!authenticated) {
          navigate('/error', { 
            state: { 
              errorCode: 403, 
              errorMessage: 'No tienes permisos para acceder a esta página.' 
            },
            replace: true
          });
        }
      } else if (response.status === 401) {
        // Token expirado o no válido
        authCache = {
          isAuthenticated: false,
          timestamp: now,
          isChecking: false
        };
        
        setIsAuthenticated(false);
        navigate('/error', { 
          state: { 
            errorCode: 401, 
            errorMessage: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.' 
          },
          replace: true
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error al verificar la autenticación:', error);
      
      // Retry lógica para errores de red
      if (retryCount < MAX_RETRIES && !error.name === 'AbortError') {
        console.log(`Reintentando verificación de auth (${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => {
          checkAuth(retryCount + 1);
        }, 1000 * (retryCount + 1)); // Backoff exponencial
        return;
      }

      // Si fallan todos los reintentos o es timeout
      authCache = {
        isAuthenticated: false,
        timestamp: now,
        isChecking: false
      };
      
      setIsAuthenticated(false);
      
      if (error.name === 'AbortError') {
        navigate('/error', { 
          state: { 
            errorCode: 408, 
            errorMessage: 'Tiempo de espera agotado. Verifica tu conexión.' 
          },
          replace: true
        });
      } else {
        navigate('/error', { 
          state: { 
            errorCode: 500, 
            errorMessage: 'Error al verificar la autenticación. Inténtalo nuevamente.' 
          },
          replace: true
        });
      }
    } finally {
      authCache.isChecking = false;
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Limpiar cache cuando el componente se desmonta
  useEffect(() => {
    return () => {
      // No limpiar cache aquí para mantenerlo entre navegaciones
    };
  }, []);

  // Mostrar loader mientras verifica
  if (isLoading || isAuthenticated === null) {
    return null; // O puedes mostrar un loader aquí
  }

  return isAuthenticated ? children : null;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired, 
};

// Función para limpiar cache manualmente (útil para logout)
export const clearAuthCache = () => {
  authCache = {
    isAuthenticated: null,
    timestamp: 0,
    isChecking: false
  };
};

export default PrivateRoute;