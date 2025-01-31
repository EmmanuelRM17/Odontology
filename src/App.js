import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import PrivateRoute from './components/Tools/PrivateRoute';
import ErrorPage from './components/Tools/ErrorPage.jsx';

// Componentes Importados
import Home from './pages/_home/pages/Home';
import Register from './pages/_home/pages/Register';
import Login from './pages/_home/pages/Login';
import LayoutConEncabezado from './components/Layout/LayoutConEncabezado';
import Recuperacion from './pages/_home/pages/Recuperacion';
import Reset from './pages/_home/pages/CambiarContrasena';
import Preguntas from './pages/_home/pages/Preguntas';
import Contactanos from './pages/_home/pages/Contactanos';
import Agendar from './pages/_home/pages/Agendar';
import Acerca from './pages/_home/pages/AcerdaDe';

// Rutas del paciente
import Principal from './pages/paciente/pages/Principal';
import LayoutPaciente from './pages/paciente/compartidos/LayoutPaciente';
import Perfil from './pages/paciente/pages/Perfil';

// Rutas del administrador
import LayoutAdmin from './pages/administrador/assets/compartidos/LayoutAdmin';
import PrincipalAdmin from './pages/administrador/pages/Principal';
import Configuracion from './pages/administrador/pages/Configuracion';
import Reportes from './pages/administrador/pages/reportes';
import PerfilEmpresa from './pages/administrador/pages/PerfilEmpresa';
import Pacientes from './pages/administrador/pages/PatientsReport.jsx';

function App() {
  const [tituloPagina, setTituloPagina] = useState('_');
  const [logo, setLogo] = useState('');
  const [fetchErrors, setFetchErrors] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null); // Referencia para el intervalo

  const fetchTitleAndLogo = async (retries = 3) => {
    try {
      const response = await axios.get('http://localhost:3001/api/perfilEmpresa/getTitleAndLogo');
      const { nombre_empresa, logo } = response.data;

      if (nombre_empresa) {
        document.title = nombre_empresa;
        setTituloPagina(nombre_empresa);
      }
      if (logo) {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = `data:image/png;base64,${logo}`;
        document.getElementsByTagName('head')[0].appendChild(link);
        setLogo(`data:image/png;base64,${logo}`);
      }

      setFetchErrors(0);
      setLoading(false);
    } catch (error) {
      console.error("Error en la solicitud:", error.message);

      if (retries > 0) {
        await new Promise((res) => setTimeout(res, 1000));
        fetchTitleAndLogo(retries - 1);
      } else {
        setFetchErrors((prev) => prev + 1);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTitleAndLogo();
    if (fetchErrors < 5) {
      intervalRef.current = setInterval(fetchTitleAndLogo, 4500);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current); 
      }
    };
  }, []); 

  useEffect(() => {
    if (fetchErrors >= 5) {
      console.error("Demasiados errores al intentar conectarse con el backend.");
      if (intervalRef.current) {
        clearInterval(intervalRef.current); 
      }
    }
  }, [fetchErrors]);

  useEffect(() => {
    if (loading) {
      console.log("Cargando configuración de empresa...");
    }
  }, [loading]);

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LayoutConEncabezado><Home /><Preguntas /></LayoutConEncabezado>} />
        <Route path="/FAQ" element={<LayoutConEncabezado><Preguntas /></LayoutConEncabezado>} />
        <Route path="/Contact" element={<LayoutConEncabezado><Contactanos /></LayoutConEncabezado>} />
        <Route path="/register" element={<LayoutConEncabezado><Register /></LayoutConEncabezado>} />
        <Route path="/login" element={<Login />} />
        <Route path="/agendar-cita" element={<Agendar />} />
        <Route path="/about" element={<LayoutConEncabezado><Acerca /></LayoutConEncabezado>} />
        <Route path="/recuperacion" element={<Recuperacion />} />
        <Route path="/resetContra" element={<Reset />} />

        {/* Rutas protegidas del paciente */}
        <Route path="/Paciente/principal" element={<PrivateRoute><LayoutPaciente><Principal /></LayoutPaciente></PrivateRoute>} />
        <Route path="/Paciente/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />

        {/* Rutas protegidas del administrador */}
        <Route path="/Administrador/principal" element={<PrivateRoute><LayoutAdmin><PrincipalAdmin /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/configuracion" element={<PrivateRoute><LayoutAdmin><Configuracion /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/reportes" element={<PrivateRoute><LayoutAdmin><Reportes /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/pacientes" element={<PrivateRoute><LayoutAdmin><Pacientes /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/PerfilEmpresa" element={<PrivateRoute><LayoutAdmin><PerfilEmpresa /></LayoutAdmin></PrivateRoute>} />

        {/* Ruta para manejo de errores */}
        <Route path="/error" element={<ErrorPage />} />
        <Route path="*" element={<ErrorPage errorCode={404} errorMessage="Página no encontrada" />} />
      </Routes>
    </Router>
  );
}

export default App;
