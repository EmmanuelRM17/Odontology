import { createContext, useContext, useState, useCallback, useRef } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref para evitar múltiples verificaciones simultáneas
  const authCheckRef = useRef(null);

  // Función optimizada para establecer usuario
  const updateUser = useCallback((userData) => {
    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Función para verificar autenticación desde el contexto
  const verifyAuth = useCallback(async () => {
    // Evitar múltiples verificaciones simultáneas
    if (authCheckRef.current) {
      return authCheckRef.current;
    }

    setIsLoading(true);
    
    const authPromise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('https://back-end-4803.onrender.com/api/users/check-auth', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user) {
            updateUser(data.user);
            resolve(data.user);
          } else {
            updateUser(null);
            resolve(null);
          }
        } else {
          updateUser(null);
          resolve(null);
        }
      } catch (error) {
        console.error('Error en verificación de auth desde contexto:', error);
        updateUser(null);
        reject(error);
      } finally {
        setIsLoading(false);
        authCheckRef.current = null;
      }
    });

    authCheckRef.current = authPromise;
    return authPromise;
  }, [updateUser]);

  // Función para logout optimizada
  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Limpiar estado local inmediatamente
      updateUser(null);
      
      // Intentar logout en el servidor
      await fetch('https://back-end-4803.onrender.com/api/users/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Limpiar cualquier cache de los componentes de ruta
      if (typeof window !== 'undefined') {
        // Importar dinámicamente para evitar errores de dependencia circular
        import('./PrivateRoute').then(module => {
          if (module.clearAuthCache) {
            module.clearAuthCache();
          }
        }).catch(() => {});
        
        import('./ProtectedRoute').then(module => {
          if (module.clearRoleAuthCache) {
            module.clearRoleAuthCache();
          }
        }).catch(() => {});
      }
    } catch (error) {
      console.error('Error durante logout:', error);
    } finally {
      setIsLoading(false);
    }
  }, [updateUser]);

  // Función para invalidar caches
  const invalidateCaches = useCallback(() => {
    if (typeof window !== 'undefined') {
      import('./PrivateRoute').then(module => {
        if (module.invalidateAuthCache) {
          module.invalidateAuthCache();
        }
      }).catch(() => {});
      
      import('./ProtectedRoute').then(module => {
        if (module.invalidateRoleAuthCache) {
          module.invalidateRoleAuthCache();
        }
      }).catch(() => {});
    }
  }, []);

  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    setUser: updateUser,
    verifyAuth,
    logout,
    invalidateCaches
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook optimizado con validación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;