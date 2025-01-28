import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import PrivateRoute from './Compartidos/PrivateRoute.jsx';

//Inicio
import LayoutConEncabezado from './Compartidos/LayoutConEncabezado';
import Acerca from './Inicio/AcerdaDe.jsx';
import Agendar from './Inicio/Agendar.jsx';
import Reset from './Inicio/CambiarContrasena.jsx';
import Contactanos from './Inicio/Contactanos.jsx';
import Home from './Inicio/Home';
import Login from './Inicio/Login.jsx';
import Preguntas from './Inicio/Preguntas.jsx';
import Recuperacion from './Inicio/Recuperacion.jsx';
import Register from './Inicio/Register';

//Paciente
import LayoutPaciente from './Usuarios/Paciente/LayoutPaciente';
import Perfil from './Usuarios/Paciente/Perfil.jsx';
import Principal from './Usuarios/Paciente/Principal.jsx';

//Administrador
import Configuracion from './Usuarios/Administrador/Configuracion.jsx';
import Pacientes from './Usuarios/Administrador/Configuracion/PatientsReport.jsx';
import PerfilEmpresa from './Usuarios/Administrador/Configuracion/PerfilEmpresa.jsx';
import Reportes from './Usuarios/Administrador/Configuracion/reportes.jsx';
import LayoutAdmin from './Usuarios/Administrador/LayoutAdmin.jsx';
import PrincipalAdmin from './Usuarios/Administrador/Principal.jsx';

function App() {
  const [tituloPagina, setTituloPagina] = useState('Mi Empresa');
  const [logo, setLogo] = useState('');
  const [fetchErrors, setFetchErrors] = useState(0);
  const [loading, setLoading] = useState(true);

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
      setLoading(false); // Carga completa
    } catch (error) {
      // Mostrar en consola los errores
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
        <Route path="/FAQ" element={<LayoutConEncabezado> <Preguntas /></LayoutConEncabezado>} />
        <Route path="/Contact" element={<LayoutConEncabezado> <Contactanos /></LayoutConEncabezado>} />
        <Route path="/register" element={<LayoutConEncabezado><Register /></LayoutConEncabezado>} />
        <Route path="/login" element={<Login />} />
        <Route path="/agendar-cita" element={<Agendar />} />
        <Route path="/about" element={<LayoutConEncabezado><Acerca /></LayoutConEncabezado>} />
        <Route path="/recuperacion" element={<Recuperacion />} />
        <Route path="/resetContra" element={<Reset />} />

        {/* Rutas protegidas de pacientes */}
        <Route path="/Paciente/principal" element={<PrivateRoute><LayoutPaciente><Principal /></LayoutPaciente></PrivateRoute>} />
        <Route path="/Paciente/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />

        {/* Rutas protegidas del administrador */}
        <Route path="/Administrador/principal" element={<PrivateRoute><LayoutAdmin><PrincipalAdmin /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/configuracion" element={<PrivateRoute><LayoutAdmin><Configuracion /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/reportes" element={<PrivateRoute><LayoutAdmin><Reportes /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/pacientes" element={<PrivateRoute><LayoutAdmin><Pacientes /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/PerfilEmpresa" element={<PrivateRoute><LayoutAdmin><PerfilEmpresa /></LayoutAdmin></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
