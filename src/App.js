import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//Inicio
import Home from './Inicio/Home';
import Register from './Inicio/Register';
import Login from './Inicio/Login';
import LayoutConEncabezado from './Compartidos/LayoutConEncabezado';

//Paciente
import Principal from './Paciente/Principal.jsx';
import LayoutPaciente from './Paciente/LayoutPaciente'; // Nuevo layout específico para pacientes

//Administrador
import PrincipalAdmin from './Administrador/Principal.jsx';
import LayoutAdmin from './Administrador/LayoutAdmin.jsx'; // Nuevo layout específico para pacientes
import AvisoDePrivacidad from './Administrador/AvisoPriva';
import DeslindeLegal from './Administrador/DeslindeLegal';
import TerminosCondiciones from './Administrador/TermiCondicion';
import PerfilEmpresa from './Administrador/PerfilEmpresa.jsx';
function App() {
  return (
    <Router basename="/Odontologia">
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LayoutConEncabezado><Home /></LayoutConEncabezado>} />
        <Route path="/register" element={<LayoutConEncabezado><Register /></LayoutConEncabezado>} />
        <Route path="/login" element={<Login />} />

        {/* Rutas del paciente */}
        <Route path="/Paciente/principal" element={<LayoutPaciente><Principal /></LayoutPaciente>} />


        {/* Rutas administrativas */}
        <Route path="/Administrador/principal" element={<LayoutAdmin><PrincipalAdmin /></LayoutAdmin>} />
        <Route path="/AvisoPriva" element={<LayoutAdmin><AvisoDePrivacidad /></LayoutAdmin>} />
        <Route path="/deslindeLegal" element={<LayoutAdmin><DeslindeLegal /></LayoutAdmin>} />
        <Route path="/terminos" element={<LayoutAdmin><TerminosCondiciones /></LayoutAdmin>} />
        <Route path="/perfilEmpresa" element={<LayoutAdmin><PerfilEmpresa /></LayoutAdmin>} />
        
      </Routes>
    </Router>
  );
}

export default App;
