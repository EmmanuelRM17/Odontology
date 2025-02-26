// src/context/ThemeContext.jsx
import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

const ThemeProviderComponent = ({ children }) => {
    // Leer el tema guardado en localStorage o usar el sistema predeterminado
    const storedTheme = localStorage.getItem('appTheme') === 'dark';
    const [isDarkTheme, setIsDarkTheme] = useState(storedTheme || false);

    // Cambiar y guardar el tema en localStorage
    const toggleTheme = () => {
        const newTheme = !isDarkTheme;
        setIsDarkTheme(newTheme);
        localStorage.setItem('appTheme', newTheme ? 'dark' : 'light');
    };

    // Crear el tema de Material UI basado en el estado actual
    const theme = useMemo(() => createTheme({
        palette: {
            mode: isDarkTheme ? 'dark' : 'light',
        },
    }), [isDarkTheme]);

    return (
        <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

export default ThemeProviderComponent;
