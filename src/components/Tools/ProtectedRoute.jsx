import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('https://back-end-4803.onrender.com/api/users/check-auth', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();

          // FIX: Verificación más robusta - asegurar que AMBOS campos existan
          if (data.authenticated === true && data.user && data.user.tipo) {
            setIsAuthenticated(true);
            setUserRole(data.user.tipo);
          } else {
            setIsAuthenticated(false);
            setUserRole('');
          }
        } else {
          setIsAuthenticated(false);
          setUserRole('');
        }
      } catch (error) {
        console.error('Error en la autenticación:', error.message);
        setIsAuthenticated(false);
        setUserRole('');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || (requiredRole && userRole !== requiredRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;