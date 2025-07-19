import React, { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';

// Cache compartido para consistencia con PrivateRoute
let roleAuthCache = {
  isAuthenticated: null,
  userRole: null,
  timestamp: 0,
  promise: null
};

const CACHE_DURATION = 30000; // 30 segundos - consistente con PrivateRoute
const REQUEST_TIMEOUT = 10000; // 10 segundos

const ProtectedRoute = ({ children, requiredRole }) => {
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthenticated: false,
    userRole: null
  });

  // Verificar autenticación y rol
  const checkAuth = useCallback(async () => {
    const now = Date.now();
    
    // Usar cache válido si existe
    if (roleAuthCache.isAuthenticated !== null && 
        (now - roleAuthCache.timestamp) < CACHE_DURATION) {
      setAuthState({
        isLoading: false,
        isAuthenticated: roleAuthCache.isAuthenticated,
        userRole: roleAuthCache.userRole
      });
      return;
    }

    // Si ya hay una petición en curso, esperar a que termine
    if (roleAuthCache.promise) {
      try {
        const result = await roleAuthCache.promise;
        setAuthState({
          isLoading: false,
          isAuthenticated: result.isAuthenticated,
          userRole: result.userRole
        });
        return;
      } catch (error) {
        // Si falla la promesa en curso, continuar con nueva petición
      }
    }

    // Crear nueva petición
    const authPromise = performRoleCheck(now);
    roleAuthCache.promise = authPromise;

    try {
      const result = await authPromise;
      setAuthState({
        isLoading: false,
        isAuthenticated: result.isAuthenticated,
        userRole: result.userRole
      });
    } catch (error) {
      console.error('Error en verificación de role auth:', error);
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        userRole: null
      });
    } finally {
      roleAuthCache.promise = null;
    }
  }, []);

  // Función separada para la petición HTTP con manejo de roles
  const performRoleCheck = async (timestamp) => {
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

      let result = {
        isAuthenticated: false,
        userRole: null
      };

      if (response.ok) {
        const data = await response.json();
        
        if (data.user && data.user.tipo) {
          result = {
            isAuthenticated: true,
            userRole: data.user.tipo // 'paciente', 'administrador', 'empleado'
          };
        }
      }

      // Actualizar cache con el resultado
      roleAuthCache = {
        isAuthenticated: result.isAuthenticated,
        userRole: result.userRole,
        timestamp,
        promise: null
      };

      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Para cualquier error, asumir no autenticado
      const result = {
        isAuthenticated: false,
        userRole: null
      };

      roleAuthCache = {
        isAuthenticated: false,
        userRole: null,
        timestamp,
        promise: null
      };

      if (error.name !== 'AbortError') {
        console.warn('Error de red en role check:', error.message);
      }

      return result;
    }
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Mostrar loading mientras verifica
  if (authState.isLoading) {
    return null; // O puedes mostrar un loader específico
  }

  // Verificar autenticación y rol requerido
  if (!authState.isAuthenticated || 
      (requiredRole && authState.userRole !== requiredRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Función para limpiar cache de roles (útil para logout)
export const clearRoleAuthCache = () => {
  roleAuthCache = {
    isAuthenticated: null,
    userRole: null,
    timestamp: 0,
    promise: null
  };
};

// Función para invalidar cache de roles
export const invalidateRoleAuthCache = () => {
  roleAuthCache.timestamp = 0;
};

export default ProtectedRoute;