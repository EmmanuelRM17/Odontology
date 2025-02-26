import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs as MuiBreadcrumbs, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Home, ChevronRight } from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { useThemeContext } from '../../../components/Tools/ThemeContext'; // Asegúrate de usar la ruta correcta

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1);
  }
`;

const Breadcrumbs = ({ paths }) => {
  const theme = useTheme();
  const { isDarkTheme } = useThemeContext(); // ✅ Correcto
  
  const colors = {
    text: isDarkTheme ? '#ffffff' : theme.palette.grey[900],
    background: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(3, 66, 124, 0.04)',
    hover: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(3, 66, 124, 0.08)',
    active: isDarkTheme ? '#1976d2' : '#03427C',
    separator: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : theme.palette.grey[500],
    containerBg: isDarkTheme ? 'rgba(3, 11, 70, 0.32)' : 'rgba(255, 255, 255, 0.8)',
    shadow: isDarkTheme ? '0 2px 4px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
    hoverShadow: isDarkTheme ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
  };

  return (
    <Box
      sx={{
        padding: '8px 16px',
        borderRadius: '8px',
        backgroundColor: colors.containerBg,
        backdropFilter: 'blur(8px)',
        boxShadow: colors.shadow,
        animation: `${fadeIn} 0.5s ease-out`,
        '&:hover': {
          boxShadow: colors.hoverShadow,
          transition: 'box-shadow 0.3s ease-in-out',
        },
      }}
    >
      <MuiBreadcrumbs
        separator={
          <ChevronRight
            sx={{
              color: colors.separator,
              fontSize: '1rem',
              mx: 0.2,
              animation: `${pulse} 2s infinite ease-in-out`,
            }}
          />
        }
        aria-label="navegación breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-ol': {
            alignItems: 'center',
          },
        }}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: colors.text,
              p: '4px 8px',
              borderRadius: '6px',
              backgroundColor: colors.background,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: colors.hover,
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Home sx={{ mr: 0.3, fontSize: '0.9rem' }} />
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
              Inicio
            </Typography>
          </Box>
        </Link>

        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;
          
          // Skip rendering if the path name is "Inicio"
          if (path.name === "Inicio") return null;

          return (
            <Box key={path.path || index}>
              {isLast ? (
                <Typography
                  sx={{
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    p: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: colors.active,
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {path.name}
                </Typography>
              ) : (
                <Link to={path.path} style={{ textDecoration: 'none' }}>
                  <Box
                    sx={{
                      color: colors.text,
                      p: '4px 8px',
                      borderRadius: '6px',
                      backgroundColor: colors.background,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: colors.hover,
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                      {path.name}
                    </Typography>
                  </Box>
                </Link>
              )}
            </Box>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;