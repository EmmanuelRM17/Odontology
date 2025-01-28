import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import PrivateRoute from './components/Tools/PrivateRoute';

//Inicio
import Home from './pages/1- home/pages/Home.js';
import Register from './pages/1- home/pages/Register.js';
import Login from './pages/1- home/pages/Login.js';
import LayoutConEncabezado from './components/Layout/LayoutConEncabezado';
import Recuperacion from './pages/1- home/pages/Recuperacion.js';
import Reset from './pages/1- home/pages/CambiarContrasena.js';

//Paciente
import Principal from './pages/4- paciente/pages/Principal.js';
import LayoutPaciente from './pages/4- paciente/compartidos/LayoutPaciente.jsx';

//Administrador
import LayoutAdmin from './pages/2- administrador/assets/compartidos/LayoutAdmin.js';
import PrincipalAdmin from './pages/2- administrador/pages/Principal.js';
import Configuracion from './pages/2- administrador/pages/Configuracion.js';
import Reportes from './pages/2- administrador/pages/reportes.jsx';
import PerfilEmpresa from './pages/2- administrador/pages/PerfilEmpresa.js';

function App() {
  const [tituloPagina, setTituloPagina] = useState('_'); // Valor inicial predeterminado
  const [logo, setLogo] = useState('');
  const [fetchErrors, setFetchErrors] = useState(0);
  const [loading, setLoading] = useState(true); // Estado para gestionar la carga inicial

  const fetchTitleAndLogo = async (retries = 3) => {
    try {
      const response = await axios.get('https://localhost:4000/api/perfilEmpresa/getTitleAndLogo');
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
      setLoading(false); // Carga completa
    } catch (error) {
      if (error.response) {
        console.error("Error en la respuesta del servidor:", error.response.status);
      } else if (error.request) {
        console.error("Error en la solicitud:", error.request);
      } else {
        console.error("Error desconocido:", error.message);
      }

      if (retries > 0) {
        await new Promise((res) => setTimeout(res, 1000));
        fetchTitleAndLogo(retries - 1);
      } else {
        setFetchErrors((prev) => prev + 1);
        setLoading(false); // Evita que siga cargando indefinidamente
      }
    }
  };

  useEffect(() => {
    fetchTitleAndLogo();
    const interval = setInterval(fetchTitleAndLogo, 4500);

    if (fetchErrors >= 5) {
      clearInterval(interval);
      console.error("Demasiados errores al intentar conectarse con el backend.");
    }

    return () => clearInterval(interval);
  }, [fetchErrors]);

  return (
    <>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LayoutConEncabezado><Home /></LayoutConEncabezado>} />
        <Route path="/register" element={<LayoutConEncabezado><Register /></LayoutConEncabezado>} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperacion" element={<Recuperacion />} />
        <Route path="/resetContra" element={<Reset />} />

        {/* Rutas protegidas del paciente */}
        <Route path="/Paciente/principal" element={
          <PrivateRoute>
            <LayoutPaciente><Principal /></LayoutPaciente>
          </PrivateRoute>
        } />

        {/* Rutas protegidas del administrador */}
        <Route path="/Administrador/principal" element={
          <PrivateRoute>
            <LayoutAdmin><PrincipalAdmin /></LayoutAdmin>
          </PrivateRoute>
        } />
        <Route path="/Administrador/configuracion" element={
          <PrivateRoute>
            <LayoutAdmin><Configuracion /></LayoutAdmin>
          </PrivateRoute>
        } />
        <Route path="/Administrador/reportes" element={
          <PrivateRoute>
            <LayoutAdmin><Reportes /></LayoutAdmin>
          </PrivateRoute>
        } />
        <Route path="/Administrador/PerfilEmpresa" element={
          <PrivateRoute>
            <LayoutAdmin><PerfilEmpresa /></LayoutAdmin>
          </PrivateRoute>
        } />
      </Routes>
      {!loading ? null : <div>Cargando configuración de empresa...</div>} {/* Mensaje de carga opcional */}
    </>
  );
}

export default App;

