import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs as MuiBreadcrumbs, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Home, ChevronRight } from '@mui/icons-material';
import { keyframes } from '@mui/system';

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
  const isDark = theme.palette.mode === 'dark';
  
  const colors = {
    text: isDark ? theme.palette.grey[100] : theme.palette.grey[900],
    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(25, 118, 210, 0.04)',
    hover: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(25, 118, 210, 0.08)',
    active: isDark ? theme.palette.primary.dark : theme.palette.primary.light,
    separator: isDark ? theme.palette.grey[400] : theme.palette.grey[500],
  };

  return (
    <Box
      sx={{
        padding: '8px 16px',
        borderRadius: '8px',
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        animation: `${fadeIn} 0.5s ease-out`,
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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

          return (
            <Box key={path.path || index}>
              {isLast ? (
                <Typography
                  sx={{
                    color: colors.text,
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