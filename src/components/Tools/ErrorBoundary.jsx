import React from 'react';

const ErrorBoundary = ({ children }) => {
  return (
    <React.Suspense
      fallback={
        <div style={{
          textAlign: 'center',
          padding: '40px',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #f0f4f8 0%, #e0e7ff 100%)',
          color: '#1e3a8a',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            animation: 'pulse 1.5s infinite ease-in-out',
            padding: '40px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 6px 20px rgba(30, 58, 138, 0.1)',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '20px', fontWeight: 700 }}>
              Cargando
            </h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '25px', fontWeight: 500 }}>
              Lamentamos la inconveniencia. Por favor, recarga la página o contacta a soporte.
            </p>
            <div style={{
              width: '60px',
              height: '60px',
              border: '6px solid #1e3a8a',
              borderTop: '6px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }} />
          </div>
          <style>
            {`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
              @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.03); }
              }
            `}
          </style>
        </div>
      }
    >
      {children}
    </React.Suspense>
  );
};

export default ErrorBoundary;