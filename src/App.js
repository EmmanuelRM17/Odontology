import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import axios from "axios";
import ThemeProviderComponent from "./components/Tools/ThemeContext";
import PrivateRoute from "./components/Tools/PrivateRoute";
import ErrorPage from "./components/Tools/ErrorPage";
import Chatbot from "./components/Tools/Chatbot.jsx";
import Breadcrumbs from "./pages/_home/tools/Breadcrumbs";
import FullPageLoader from "./components/Tools/FullPageLoader";
import ScrollToTop from "./components/Tools/ScrollToTop";

// Componentes públicos
import LayoutConEncabezado from "./components/Layout/LayoutConEncabezado";
import Home from "./pages/_home/pages/Home";
import Register from "./pages/_home/pages/Register";
import Login from "./pages/_home/pages/Login";
import Servicios from "./pages/_home/pages/Servicios";
import ServicioDetalleRouteHandler from "./pages/_home/pages/ServicioDetalleRouteHandler.jsx";
import ServiciosDetalle from "./pages/_home/pages/ServiciosDetalle";
import Recuperacion from "./pages/_home/pages/Recuperacion";
import Reset from "./pages/_home/pages/CambiarContrasena";
import Preguntas from "./pages/_home/pages/Preguntas";
import Contactanos from "./pages/_home/pages/Contactanos";
import Agendar from "./pages/_home/pages/Agendar";
import Confirmacion from "./pages/_home/pages/Steps/Confirmacion";
import Acerca from "./pages/_home/pages/AcerdaDe";
import Ubicacion from "./pages/_home/pages/Ubicacion";

// Componentes paciente
import Principal from "./pages/paciente/pages/Principal";
import Citas from "./pages/paciente/pages/Citas";
import Tratamientos from "./pages/paciente/pages/Tratamientos";
import Progreso from "./pages/paciente/pages/Progreso";
import LayoutPaciente from "./pages/paciente/compartidos/LayoutPaciente";
import Perfil from "./pages/paciente/pages/Perfil";
import Mensajes from "./pages/paciente/pages/Mensajes.jsx";
import Pagos from "./pages/paciente/pages/Pagos";
import AyudaPaciente from "./pages/paciente/pages/Ayuda";
import ExpedientePaciente from "./pages/paciente/pages/Expedient";

// Componentes administrador
import LayoutAdmin from "./pages/administrador/assets/compartidos/LayoutAdmin";
import PrincipalAdmin from "./pages/administrador/pages/Principal";
import Configuracion from "./pages/administrador/pages/Configuracion";
import Reportes from "./pages/administrador/pages/reportes";
import PerfilEmpresa from "./pages/administrador/pages/PerfilEmpresa";
import Pacientes from "./pages/administrador/pages/PatientsReport";
import Empleados from "./pages/administrador/pages/EmpleadosReport";
import ServicioForm from "./pages/administrador/pages/ServicioForm";
import CitasForm from "./pages/administrador/pages/CitasForm";
import NuevoAgendamiento from "./pages/administrador/pages/citas/nuevaCita";
import TratamientosForm from "./pages/administrador/pages/TratamientosForm.jsx";
import HorariosForm from "./pages/administrador/pages/HorariosForm";
import ImagenesForm from "./pages/administrador/pages/ImagenesForm";
import FinanzasForm from "./pages/administrador/pages/FinanzasForm.jsx";
import CalendarioCitas from "./pages/administrador/pages/CalendarioCitas";
import Graficas from "./pages/administrador/pages/Graficas";
import Predicciones from "./pages/administrador/pages/Predicciones";
import ModeracionServicios from "./pages/administrador/pages/resenyasModerar";
import AyudaAdmin from "./pages/paciente/pages/Ayuda";

// Componentes empleado
import LayoutEmpleado from "./pages/empleado/LayoutEmpleado";
import PrincipalEmpleado from "./pages/empleado/Principal";
import ExpedienteClinico from "./pages/empleado/pages/ExpedientPacient";

// Hook para rastrear URL válidas
const useUrlTracker = () => {
  const location = useLocation();
  useEffect(() => {
    const excludedPaths = ["/error", "/login", "/register", "/recuperacion", "/resetContra", "/confirmacion"];
    const currentPath = location.pathname;
    if (!excludedPaths.some((path) => currentPath.startsWith(path))) {
      sessionStorage.setItem("lastValidUrl", currentPath);
    }
  }, [location.pathname]);
};

// Componente de contenido principal con todas las rutas
function AppContent({ loading, forceLoading, isOnline }) {
  useUrlTracker();

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LayoutConEncabezado>{loading || forceLoading ? <FullPageLoader message="Cargando la página principal..." /> : <><Chatbot /><Home /><Ubicacion /><Preguntas /></>}</LayoutConEncabezado>} />
        <Route path="/FAQ" element={<LayoutConEncabezado><Chatbot /><Breadcrumbs paths={[{ name: "Inicio", path: "/" }, { name: "Preguntas Frecuentes" }]} /><Preguntas /></LayoutConEncabezado>} />
        <Route path="/Contact" element={<LayoutConEncabezado><Chatbot /><Breadcrumbs paths={[{ name: "Inicio", path: "/" }, { name: "Contacto" }]} /><Contactanos /></LayoutConEncabezado>} />
        <Route path="/register" element={<><Chatbot /><Register /></>} />
        <Route path="/login" element={<Login />} />
        <Route path="/agendar-cita" element={<><Chatbot /><Agendar /></>} />
        <Route path="/confirmacion" element={<Confirmacion />} />
        <Route path="/about" element={<LayoutConEncabezado><Chatbot /><Breadcrumbs paths={[{ name: "Inicio", path: "/" }, { name: "Acerca de" }]} /><Acerca /></LayoutConEncabezado>} />
        <Route path="/servicios" element={<LayoutConEncabezado><Breadcrumbs paths={[{ name: "Inicio", path: "/" }, { name: "Servicios" }]} /><Servicios /></LayoutConEncabezado>} />
        <Route path="/servicios/detalle/:servicioId" element={<LayoutConEncabezado><Chatbot /><Breadcrumbs paths={[{ name: "Inicio", path: "/" }, { name: "Servicios", path: "/servicios" }, { name: "Detalle del Servicio" }]} /><ServiciosDetalle /></LayoutConEncabezado>} />
        <Route path="/recuperacion" element={<Recuperacion />} />
        <Route path="/resetContra" element={<Reset />} />

        {/* Rutas protegidas del paciente */}
        <Route path="/Paciente/principal" element={<PrivateRoute><LayoutPaciente><Chatbot /><Principal /></LayoutPaciente></PrivateRoute>} />
        <Route path="/Paciente/citas" element={<PrivateRoute><LayoutPaciente><Chatbot /><Breadcrumbs paths={[{ name: "Inicio", path: "/Paciente/principal" }, { name: "Mis Citas" }]} /><Citas /></LayoutPaciente></PrivateRoute>} />
        <Route path="/Paciente/tratamientos" element={<PrivateRoute><LayoutPaciente><Chatbot /><Breadcrumbs paths={[{ name: "Inicio", path: "/Paciente/principal" }, { name: "Mis Tratamientos" }]} /><Tratamientos /></LayoutPaciente></PrivateRoute>} />
        <Route path="/Paciente/progreso" element={<PrivateRoute><LayoutPaciente><Chatbot /><Breadcrumbs paths={[{ name: "Inicio", path: "/Paciente/principal" }, { name: "Mi progreso" }]} /><Progreso /></LayoutPaciente></PrivateRoute>} />
        <Route path="/Paciente/perfil" element={<PrivateRoute><LayoutPaciente><Chatbot /><Breadcrumbs paths={[{ name: "Inicio", path: "/Paciente/principal" }, { name: "Perfil de Usuario" }]} /><Perfil /></LayoutPaciente></PrivateRoute>} />
        <Route path="/Paciente/mensajes" element={<PrivateRoute><LayoutPaciente><Chatbot /><Breadcrumbs paths={[{ name: "Inicio", path: "/Paciente/principal" }, { name: "Mensajes" }]} /><Mensajes /></LayoutPaciente></PrivateRoute>} />
        <Route path="/Paciente/pagos" element={<PrivateRoute><LayoutPaciente><Chatbot /><Breadcrumbs paths={[{ name: "Inicio", path: "/Paciente/principal" }, { name: "Pagos" }]} /><Pagos /></LayoutPaciente></PrivateRoute>} />
        <Route path="/Paciente/ayuda" element={<PrivateRoute><LayoutPaciente><Chatbot /><Breadcrumbs paths={[{ name: "Inicio", path: "/Paciente/principal" }, { name: "Ayuda" }]} /><AyudaPaciente /></LayoutPaciente></PrivateRoute>} />
        <Route path="/Paciente/expediente" element={<PrivateRoute><LayoutPaciente><Chatbot /><Breadcrumbs paths={[{ name: "Inicio", path: "/Paciente/principal" }, { name: "Expediente clinico" }]} /><ExpedientePaciente /></LayoutPaciente></PrivateRoute>} />

        {/* Rutas protegidas del administrador */}
        <Route path="/Administrador/principal" element={<PrivateRoute><LayoutAdmin><PrincipalAdmin /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/configuracion" element={<PrivateRoute><LayoutAdmin><Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Configuración" }]} /><Configuracion /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/reportes" element={<PrivateRoute><LayoutAdmin><Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Reportes Generales" }]} /><Reportes /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/pacientes" element={<PrivateRoute><LayoutAdmin><Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Gestión de Pacientes" }]} /><Pacientes /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/empleados" element={<PrivateRoute><LayoutAdmin><Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Gestión de Empleados" }]} /><Empleados /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/servicios" element={<PrivateRoute><LayoutAdmin><Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Gestión de Servicios" }]} /><ServicioForm /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/citas" element={<PrivateRoute><LayoutAdmin><Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Gestión de Citas" }]} /><CitasForm /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/citas/nueva" element={<PrivateRoute><LayoutAdmin><Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Citas", path: "/Administrador/citas" }, { name: "Nueva Cita" }]} /><NuevoAgendamiento /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/tratamientos" element={<PrivateRoute><LayoutAdmin><Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Gestión de Tratamientos" }]} /><TratamientosForm /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/horarios" element={<PrivateRoute><LayoutAdmin><Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Gestión de Horarios" }]} /><HorariosForm /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/PerfilEmpresa" element={<PrivateRoute><LayoutAdmin><Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Perfil Empresarial" }]} /><PerfilEmpresa /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/imagenes" element={<PrivateRoute><LayoutAdmin><Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Gestión de Imágenes" }]} /><ImagenesForm /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/finanzas" element={<PrivateRoute><LayoutAdmin><Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Gestión Financiera" }]} /><FinanzasForm /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/Estadisticas" element={<PrivateRoute><LayoutAdmin><Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Estadísticas Operativas" }]} /><Graficas /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/predicciones" element={<PrivateRoute><LayoutAdmin><Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Predicciones" }]} />< Predicciones/></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/CalendarioCita" element={<PrivateRoute><LayoutAdmin><Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Calendario de Citas" }]} /><CalendarioCitas /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/Reseñas" element={<PrivateRoute><LayoutAdmin><Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Moderación de Reseñas" }]} /><ModeracionServicios /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/ayuda" element={<PrivateRoute><LayoutAdmin><Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Ayuda" }]} /><AyudaAdmin /></LayoutAdmin></PrivateRoute>} />
        <Route path="/Administrador/expedienteClinico" element={<PrivateRoute><LayoutAdmin><Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Expediente Clínico" }]} /><ExpedienteClinico /></LayoutAdmin></PrivateRoute>} />

        {/* Rutas protegidas del empleado */}
        <Route path="/Empleado/principal" element={<PrivateRoute><LayoutEmpleado><PrincipalEmpleado /></LayoutEmpleado></PrivateRoute>} />
        <Route path="/Empleado/configuracion" element={<PrivateRoute><LayoutEmpleado><Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Configuración" }]} /><Configuracion /></LayoutEmpleado></PrivateRoute>} />
        <Route path="/Empleado/reportes" element={<PrivateRoute><LayoutEmpleado><Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Reportes Generales" }]} /><Reportes /></LayoutEmpleado></PrivateRoute>} />
        <Route path="/Empleado/pacientes" element={<PrivateRoute><LayoutEmpleado><Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Gestión de Pacientes" }]} /><Pacientes /></LayoutEmpleado></PrivateRoute>} />
        <Route path="/Empleado/servicios" element={<PrivateRoute><LayoutEmpleado><Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Gestión de Servicios" }]} /><ServicioForm /></LayoutEmpleado></PrivateRoute>} />
        <Route path="/Empleado/citas" element={<PrivateRoute><LayoutEmpleado><Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Gestión de Citas" }]} /><CitasForm /></LayoutEmpleado></PrivateRoute>} />
        <Route path="/Empleado/citas/nueva" element={<PrivateRoute><LayoutEmpleado><Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Citas", path: "/Empleado/citas" }, { name: "Nueva Cita" }]} /><NuevoAgendamiento /></LayoutEmpleado></PrivateRoute>} />
        <Route path="/Empleado/tratamientos" element={<PrivateRoute><LayoutEmpleado><Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Gestión de Tratamientos" }]} /><TratamientosForm /></LayoutEmpleado></PrivateRoute>} />
        <Route path="/Empleado/horarios" element={<PrivateRoute><LayoutEmpleado><Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Gestión de Horarios" }]} /><HorariosForm /></LayoutEmpleado></PrivateRoute>} />
        <Route path="/Empleado/imagenes" element={<PrivateRoute><LayoutEmpleado><Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Gestión de Imágenes" }]} /><ImagenesForm /></LayoutEmpleado></PrivateRoute>} />
        <Route path="/Empleado/estadisticas" element={<PrivateRoute><LayoutEmpleado><Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Estadísticas Operativas" }]} /><Graficas /></LayoutEmpleado></PrivateRoute>} />
        <Route path="/Empleado/calendarioCita" element={<PrivateRoute><LayoutEmpleado><Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Calendario de Citas" }]} /><CalendarioCitas /></LayoutEmpleado></PrivateRoute>} />
        <Route path="/Empleado/reseñas" element={<PrivateRoute><LayoutEmpleado><Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Moderación de Reseñas" }]} /><ModeracionServicios /></LayoutEmpleado></PrivateRoute>} />
        <Route path="/Empleado/expedienteClinico" element={<PrivateRoute><LayoutEmpleado><Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Expediente Clínico" }]} /><ExpedienteClinico /></LayoutEmpleado></PrivateRoute>} />
        <Route path="/Empleado/ayuda" element={<PrivateRoute><LayoutEmpleado><Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Ayuda" }]} /><AyudaAdmin /></LayoutEmpleado></PrivateRoute>} />
        {/* Rutas de error */}
        <Route path="/error" element={<ErrorPage />} />
        <Route path="*" element={<ErrorPage errorCode={404} errorMessage="Página no encontrada" />} />
      </Routes>
      <ServicioDetalleRouteHandler />
    </>
  );
}

function App() {
  const [tituloPagina, setTituloPagina] = useState("_");
  const [logo, setLogo] = useState("");
  const [fetchErrors, setFetchErrors] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [forceLoading, setForceLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setForceLoading(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      fetchTitleAndLogo(); // << intenta recargar favicon/título al reconectar
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Función para obtener título y logo de la empresa
  const fetchTitleAndLogo = async (retries = 3) => {
    if (!isOnline || fetchErrors >= 5) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await axios.get(
        "https://back-end-4803.onrender.com/api/perfilEmpresa/getTitleAndLogo",
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      const { nombre_pagina, logo } = response.data;

      if (nombre_pagina) {
        document.title = nombre_pagina;
        setTituloPagina(nombre_pagina);
      }
      if (logo) {
        // Elimina cualquier favicon existente con ID o rel=icon
        const oldIcons = document.querySelectorAll("link[rel='icon']");
        oldIcons.forEach(icon => icon.parentNode.removeChild(icon));

        const newIcon = document.createElement("link");
        newIcon.id = "dynamic-favicon";
        newIcon.rel = "icon";
        newIcon.type = "image/png";
        newIcon.href = `data:image/png;base64,${logo}`;
        document.head.appendChild(newIcon);
      }

      setFetchErrors(0);
      setLoading(false);

      if (!intervalRef.current) {
        intervalRef.current = setInterval(fetchTitleAndLogo, 60000);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (!axios.isCancel(error)) {
        console.error("Error en la solicitud:", error.message);
      }
      setFetchErrors((prev) => prev + 1);
      setLoading(false);
      if (retries > 0) {
        await new Promise((res) => setTimeout(res, 2000));
        fetchTitleAndLogo(retries - 1);
      }
    }
  };

  useEffect(() => {
    fetchTitleAndLogo();
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (fetchErrors >= 5 && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [fetchErrors]);

  if (loading) return <FullPageLoader message="Cargando la página..." />;

  if (!isOnline) {
    return (
      <Router>
        <ErrorPage
          errorCode={502}
          errorMessage="Sin conexión a Internet"
          detailedMessage="La página se actualizará automáticamente cuando se restablezca la conexión."
        />
      </Router>
    );
  }

  return (
    <ThemeProviderComponent>
      <Router>
        <AppContent loading={loading} forceLoading={forceLoading} isOnline={isOnline} />
      </Router>
    </ThemeProviderComponent>
  );
}

export default App;