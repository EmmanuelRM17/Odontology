import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Verificación simplificada sin cache problemático
    const checkAuth = async () => {
      try {
        const response = await fetch('https://back-end-4803.onrender.com/api/users/check-auth', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          // FIX: Verificación más robusta - asegurar que AMBOS campos existan
          if (data.authenticated === true && data.user && data.user.tipo) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            navigate('/error', { 
              state: { 
                errorCode: 403, 
                errorMessage: 'No tienes permisos para acceder a esta página.' 
              },
              replace: true
            });
          }
        } else if (response.status === 401) {
          setIsAuthenticated(false);
          navigate('/error', { 
            state: { 
              errorCode: 401, 
              errorMessage: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.' 
            },
            replace: true
          });
        } else {
          // Otros errores del servidor
          setIsAuthenticated(false);
          navigate('/error', { 
            state: { 
              errorCode: response.status, 
              errorMessage: 'Error al verificar la autenticación.' 
            },
            replace: true
          });
        }
      } catch (error) {
        console.error('Error al verificar la autenticación:', error);
        setIsAuthenticated(false);
        navigate('/error', { 
          state: { 
            errorCode: 500, 
            errorMessage: 'Error de conexión al verificar la autenticación.' 
          },
          replace: true
        });
      }
    };

    checkAuth();
  }, [navigate]);

  // Mientras verifica, no renderizar nada
  if (isAuthenticated === null) {
    return null;
  }

  // Solo renderizar children si está autenticado
  return isAuthenticated ? children : null;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired, 
};

// Función para limpiar cache manualmente (útil para logout)
export const clearAuthCache = () => {
  console.log('clearAuthCache llamada - sin cache que limpiar');
};

// Función adicional para invalidar cache (por compatibilidad)
export const invalidateAuthCache = () => {
  console.log('invalidateAuthCache llamada - sin cache que invalidar');
};

export default PrivateRoute;