import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// Cache optimizado con mejor gestión
let authCache = {
  isAuthenticated: null,
  timestamp: 0,
  promise: null // Para evitar múltiples llamadas simultáneas
};

const CACHE_DURATION = 30000; // 30 segundos - reducido para mejor sincronización
const REQUEST_TIMEOUT = 10000; // 10 segundos

const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticación optimizada
  const checkAuth = useCallback(async () => {
    const now = Date.now();
    
    // Usar cache válido si existe
    if (authCache.isAuthenticated !== null && 
        (now - authCache.timestamp) < CACHE_DURATION) {
      setIsAuthenticated(authCache.isAuthenticated);
      setIsLoading(false);
      return;
    }

    // Si ya hay una petición en curso, esperar a que termine
    if (authCache.promise) {
      try {
        const result = await authCache.promise;
        setIsAuthenticated(result);
        setIsLoading(false);
        return;
      } catch (error) {
        // Si falla la promesa en curso, continuar con nueva petición
      }
    }

    // Crear nueva petición
    const authPromise = performAuthCheck(now);
    authCache.promise = authPromise;

    try {
      const result = await authPromise;
      setIsAuthenticated(result);
    } catch (error) {
      console.error('Error en verificación de auth:', error);
      setIsAuthenticated(false);
      
      // Solo navegar si el componente aún está montado y hay error real
      if (error.shouldNavigate) {
        navigate('/error', { 
          state: { 
            errorCode: error.code || 500, 
            errorMessage: error.message || 'Error al verificar la autenticación.' 
          },
          replace: true
        });
      }
    } finally {
      authCache.promise = null;
      setIsLoading(false);
    }
  }, [navigate]);

  // Función separada para la petición HTTP
  const performAuthCheck = async (timestamp) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
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
          timestamp,
          promise: null
        };

        if (!authenticated) {
          const error = new Error('No tienes permisos para acceder a esta página.');
          error.code = 403;
          error.shouldNavigate = true;
          throw error;
        }

        return authenticated;
      } else if (response.status === 401) {
        // Token expirado o no válido
        authCache = {
          isAuthenticated: false,
          timestamp,
          promise: null
        };
        
        const error = new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        error.code = 401;
        error.shouldNavigate = true;
        throw error;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        authCache = {
          isAuthenticated: false,
          timestamp,
          promise: null
        };
        
        const timeoutError = new Error('Tiempo de espera agotado. Verifica tu conexión.');
        timeoutError.code = 408;
        timeoutError.shouldNavigate = true;
        throw timeoutError;
      }
      
      // Para otros errores, actualizar cache pero no navegar inmediatamente
      authCache = {
        isAuthenticated: false,
        timestamp,
        promise: null
      };
      
      if (error.shouldNavigate) {
        throw error;
      }
      
      // Error de red - no navegar, solo loggear
      console.warn('Error de red en auth check:', error.message);
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Render optimizado - evitar renders innecesarios
  if (isLoading) {
    return null; // O puedes mostrar un skeleton/loader específico
  }

  // Solo renderizar children si está autenticado
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
    promise: null
  };
};

// Función para invalidar cache (útil para forzar re-verificación)
export const invalidateAuthCache = () => {
  authCache.timestamp = 0;
};

export default PrivateRoute;