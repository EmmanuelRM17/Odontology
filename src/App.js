import React, { useEffect, useState, useRef, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import axios from "axios";
import ThemeProviderComponent from "./components/Tools/ThemeContext";
import PrivateRoute from "./components/Tools/PrivateRoute";
import ErrorPage from "./components/Tools/ErrorPage";
import Breadcrumbs from "./pages/_home/tools/Breadcrumbs";
import ScrollToTop from "./components/Tools/ScrollToTop";
import LoadingScreen from "./components/Tools/LoadingScreen.jsx";

// Componentes públicos
const LayoutConEncabezado = lazy(() => import("./components/Layout/LayoutConEncabezado"));
const Home = lazy(() => import("./pages/_home/pages/Home"));
const Register = lazy(() => import("./pages/_home/pages/Register"));
const Login = lazy(() => import("./pages/_home/pages/Login"));
const Servicios = lazy(() => import("./pages/_home/pages/Servicios"));
const ServicioDetalleRouteHandler = lazy(() => import("./pages/_home/pages/ServicioDetalleRouteHandler.jsx"));
const ServiciosDetalle = lazy(() => import("./pages/_home/pages/ServiciosDetalle"));
const Recuperacion = lazy(() => import("./pages/_home/pages/Recuperacion"));
const Reset = lazy(() => import("./pages/_home/pages/CambiarContrasena"));
const Preguntas = lazy(() => import("./pages/_home/pages/Preguntas"));
const Contactanos = lazy(() => import("./pages/_home/pages/Contactanos"));
const Agendar = lazy(() => import("./pages/_home/pages/Agendar"));
const Confirmacion = lazy(() => import("./pages/_home/pages/Steps/Confirmacion"));
const Acerca = lazy(() => import("./pages/_home/pages/AcerdaDe"));
const Ubicacion = lazy(() => import("./pages/_home/pages/Ubicacion"));

// Componentes paciente
const LayoutPaciente = lazy(() => import("./pages/paciente/compartidos/LayoutPaciente"));
const Principal = lazy(() => import("./pages/paciente/pages/Principal"));
const Citas = lazy(() => import("./pages/paciente/pages/Citas"));
const Tratamientos = lazy(() => import("./pages/paciente/pages/Tratamientos"));
const Progreso = lazy(() => import("./pages/paciente/pages/Progreso"));
const Perfil = lazy(() => import("./pages/paciente/pages/Perfil"));
const Mensajes = lazy(() => import("./pages/paciente/pages/Mensajes.jsx"));
const Pagos = lazy(() => import("./pages/paciente/pages/Pagos"));
const AyudaPaciente = lazy(() => import("./pages/paciente/pages/Ayuda"));
const ExpedientePaciente = lazy(() => import("./pages/paciente/pages/Expedient"));

// Componentes administrador
const LayoutAdmin = lazy(() => import("./pages/administrador/assets/compartidos/LayoutAdmin"));
const PrincipalAdmin = lazy(() => import("./pages/administrador/pages/Principal"));
const Configuracion = lazy(() => import("./pages/administrador/pages/Configuracion"));
const Reportes = lazy(() => import("./pages/administrador/pages/reportes"));
const PerfilEmpresa = lazy(() => import("./pages/administrador/pages/PerfilEmpresa"));
const Pacientes = lazy(() => import("./pages/administrador/pages/PatientsReport"));
const Empleados = lazy(() => import("./pages/administrador/pages/EmpleadosReport"));
const ServicioForm = lazy(() => import("./pages/administrador/pages/ServicioForm"));
const CitasForm = lazy(() => import("./pages/administrador/pages/CitasForm"));
const NuevoAgendamiento = lazy(() => import("./pages/administrador/pages/citas/nuevaCita"));
const TratamientosForm = lazy(() => import("./pages/administrador/pages/TratamientosForm.jsx"));
const HorariosForm = lazy(() => import("./pages/administrador/pages/HorariosForm"));
const ImagenesForm = lazy(() => import("./pages/administrador/pages/ImagenesForm"));
const FinanzasForm = lazy(() => import("./pages/administrador/pages/FinanzasForm.jsx"));
const CalendarioCitas = lazy(() => import("./pages/administrador/pages/CalendarioCitas"));
const Graficas = lazy(() => import("./pages/administrador/pages/Graficas"));
const Predicciones = lazy(() => import("./pages/administrador/pages/Predicciones"));
const Clostering = lazy(() => import("./pages/administrador/pages/Clostering"));
const ModeracionServicios = lazy(() => import("./pages/administrador/pages/resenyasModerar"));
const AyudaAdmin = lazy(() => import("./pages/paciente/pages/Ayuda"));

// Componentes empleado
const LayoutEmpleado = lazy(() => import("./pages/empleado/LayoutEmpleado"));
const PrincipalEmpleado = lazy(() => import("./pages/empleado/Principal"));
const ExpedienteClinico = lazy(() => import("./pages/empleado/pages/ExpedientPacient"));

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
function AppContent({ forceLoading, isOnline }) {
  useUrlTracker();

  return (
    <>
      <ScrollToTop />
        <Routes>
          {/* Rutas públicas */}
          <Route
            path="/"
            element={
              <LayoutConEncabezado>
                <Home />
                <Ubicacion />
                <Preguntas />
              </LayoutConEncabezado>
            }
          />
          <Route
            path="/FAQ"
            element={
              <LayoutConEncabezado>
                <Breadcrumbs paths={[{ name: "Inicio", path: "/" }, { name: "Preguntas Frecuentes" }]} />
                <Preguntas />
              </LayoutConEncabezado>
            }
          />
          <Route
            path="/Contact"
            element={
              <LayoutConEncabezado>
                <Breadcrumbs paths={[{ name: "Inicio", path: "/" }, { name: "Contacto" }]} />
                <Contactanos />
              </LayoutConEncabezado>
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/agendar-cita" element={<Agendar />} />
          <Route path="/confirmacion" element={<Confirmacion />} />
          <Route
            path="/about"
            element={
              <LayoutConEncabezado>
                <Breadcrumbs paths={[{ name: "Inicio", path: "/" }, { name: "Acerca de" }]} />
                <Acerca />
              </LayoutConEncabezado>
            }
          />
          <Route
            path="/servicios"
            element={
              <LayoutConEncabezado>
                <Breadcrumbs paths={[{ name: "Inicio", path: "/" }, { name: "Servicios" }]} />
                <Servicios />
              </LayoutConEncabezado>
            }
          />
          <Route
            path="/servicios/detalle/:servicioId"
            element={
              <LayoutConEncabezado>
                <Breadcrumbs paths={[{ name: "Inicio", path: "/" }, { name: "Servicios", path: "/servicios" }, { name: "Detalle del Servicio" }]} />
                <ServiciosDetalle />
              </LayoutConEncabezado>
            }
          />
          <Route path="/recuperacion" element={<Recuperacion />} />
          <Route path="/resetContra" element={<Reset />} />

          {/* Rutas protegidas del paciente */}
          <Route
            path="/Paciente/principal"
            element={
              <PrivateRoute>
                <LayoutPaciente>
                  <Principal />
                </LayoutPaciente>
              </PrivateRoute>
            }
          />
          <Route
            path="/Paciente/citas"
            element={
              <PrivateRoute>
                <LayoutPaciente>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Paciente/principal" }, { name: "Mis Citas" }]} />
                  <Citas />
                </LayoutPaciente>
              </PrivateRoute>
            }
          />
          <Route
            path="/Paciente/tratamientos"
            element={
              <PrivateRoute>
                <LayoutPaciente>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Paciente/principal" }, { name: "Mis Tratamientos" }]} />
                  <Tratamientos />
                </LayoutPaciente>
              </PrivateRoute>
            }
          />
          <Route
            path="/Paciente/progreso"
            element={
              <PrivateRoute>
                <LayoutPaciente>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Paciente/principal" }, { name: "Mi progreso" }]} />
                  <Progreso />
                </LayoutPaciente>
              </PrivateRoute>
            }
          />
          <Route
            path="/Paciente/perfil"
            element={
              <PrivateRoute>
                <LayoutPaciente>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Paciente/principal" }, { name: "Perfil de Usuario" }]} />
                  <Perfil />
                </LayoutPaciente>
              </PrivateRoute>
            }
          />
          <Route
            path="/Paciente/mensajes"
            element={
              <PrivateRoute>
                <LayoutPaciente>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Paciente/principal" }, { name: "Mensajes" }]} />
                  <Mensajes />
                </LayoutPaciente>
              </PrivateRoute>
            }
          />
          <Route
            path="/Paciente/pagos"
            element={
              <PrivateRoute>
                <LayoutPaciente>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Paciente/principal" }, { name: "Pagos" }]} />
                  <Pagos />
                </LayoutPaciente>
              </PrivateRoute>
            }
          />
          <Route
            path="/Paciente/ayuda"
            element={
              <PrivateRoute>
                <LayoutPaciente>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Paciente/principal" }, { name: "Ayuda" }]} />
                  <AyudaPaciente />
                </LayoutPaciente>
              </PrivateRoute>
            }
          />
          <Route
            path="/Paciente/expediente"
            element={
              <PrivateRoute>
                <LayoutPaciente>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Paciente/principal" }, { name: "Expediente clinico" }]} />
                  <ExpedientePaciente />
                </LayoutPaciente>
              </PrivateRoute>
            }
          />

          {/* Rutas protegidas del administrador */}
          <Route
            path="/Administrador/principal"
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <PrincipalAdmin />
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path="/Administrador/configuracion"
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Configuración" }]} />
                  <Configuracion />
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path="/Administrador/reportes"
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Reportes Generales" }]} />
                  <Reportes />
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path="/Administrador/pacientes"
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Gestión de Pacientes" }]} />
                  <Pacientes />
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path="/Administrador/empleados"
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Gestión de Empleados" }]} />
                  <Empleados />
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path="/Administrador/servicios"
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Gestión de Servicios" }]} />
                  <ServicioForm />
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path="/Administrador/citas"
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Gestión de Citas" }]} />
                  <CitasForm />
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path="/Administrador/citas/nueva"
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Citas", path: "/Administrador/citas" }, { name: "Nueva Cita" }]} />
                  <NuevoAgendamiento />
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path="/Administrador/tratamientos"
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Gestión de Tratamientos" }]} />
                  <TratamientosForm />
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path="/Administrador/horarios"
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Gestión de Horarios" }]} />
                  <HorariosForm />
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path="/Administrador/PerfilEmpresa"
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Perfil Empresarial" }]} />
                  <PerfilEmpresa />
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path="/Administrador/imagenes"
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Gestión de Imágenes" }]} />
                  <ImagenesForm />
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path="/Administrador/finanzas"
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Gestión Financiera" }]} />
                  <FinanzasForm />
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path="/Administrador/Estadisticas"
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Estadísticas Operativas" }]} />
                  <Graficas />
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path="/Administrador/predicciones"
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Predicciones" }]} />
                  <Predicciones />
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path="/Administrador/Clostering"
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Clostering" }]} />
                  <Clostering />
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path="/Administrador/CalendarioCita"
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Calendario de Citas" }]} />
                  <CalendarioCitas />
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path="/Administrador/Reseñas"
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Moderación de Reseñas" }]} />
                  <ModeracionServicios />
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path="/Administrador/ayuda"
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Ayuda" }]} />
                  <AyudaAdmin />
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path="/Administrador/expedienteClinico"
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Administrador/principal" }, { name: "Expediente Clínico" }]} />
                  <ExpedienteClinico />
                </LayoutAdmin>
              </PrivateRoute>
            }
          />

          {/* Rutas protegidas del empleado */}
          <Route
            path="/Empleado/principal"
            element={
              <PrivateRoute>
                <LayoutEmpleado>
                  <PrincipalEmpleado />
                </LayoutEmpleado>
              </PrivateRoute>
            }
          />
          <Route
            path="/Empleado/configuracion"
            element={
              <PrivateRoute>
                <LayoutEmpleado>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Configuración" }]} />
                  <Configuracion />
                </LayoutEmpleado>
              </PrivateRoute>
            }
          />
          <Route
            path="/Empleado/reportes"
            element={
              <PrivateRoute>
                <LayoutEmpleado>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Reportes Generales" }]} />
                  <Reportes />
                </LayoutEmpleado>
              </PrivateRoute>
            }
          />
          <Route
            path="/Empleado/pacientes"
            element={
              <PrivateRoute>
                <LayoutEmpleado>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Gestión de Pacientes" }]} />
                  <Pacientes />
                </LayoutEmpleado>
              </PrivateRoute>
            }
          />
          <Route
            path="/Empleado/servicios"
            element={
              <PrivateRoute>
                <LayoutEmpleado>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Gestión de Servicios" }]} />
                  <ServicioForm />
                </LayoutEmpleado>
              </PrivateRoute>
            }
          />
          <Route
            path="/Empleado/citas"
            element={
              <PrivateRoute>
                <LayoutEmpleado>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Gestión de Citas" }]} />
                  <CitasForm />
                </LayoutEmpleado>
              </PrivateRoute>
            }
          />
          <Route
            path="/Empleado/citas/nueva"
            element={
              <PrivateRoute>
                <LayoutEmpleado>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Citas", path: "/Empleado/citas" }, { name: "Nueva Cita" }]} />
                  <NuevoAgendamiento />
                </LayoutEmpleado>
              </PrivateRoute>
            }
          />
          <Route
            path="/Empleado/tratamientos"
            element={
              <PrivateRoute>
                <LayoutEmpleado>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Gestión de Tratamientos" }]} />
                  <TratamientosForm />
                </LayoutEmpleado>
              </PrivateRoute>
            }
          />
          <Route
            path="/Empleado/horarios"
            element={
              <PrivateRoute>
                <LayoutEmpleado>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Gestión de Horarios" }]} />
                  <HorariosForm />
                </LayoutEmpleado>
              </PrivateRoute>
            }
          />
          <Route
            path="/Empleado/imagenes"
            element={
              <PrivateRoute>
                <LayoutEmpleado>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Gestión de Imágenes" }]} />
                  <ImagenesForm />
                </LayoutEmpleado>
              </PrivateRoute>
            }
          />
          <Route
            path="/Empleado/estadisticas"
            element={
              <PrivateRoute>
                <LayoutEmpleado>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Estadísticas Operativas" }]} />
                  <Graficas />
                </LayoutEmpleado>
              </PrivateRoute>
            }
          />
          <Route
            path="/Empleado/calendarioCita"
            element={
              <PrivateRoute>
                <LayoutEmpleado>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Calendario de Citas" }]} />
                  <CalendarioCitas />
                </LayoutEmpleado>
              </PrivateRoute>
            }
          />
          <Route
            path="/Empleado/reseñas"
            element={
              <PrivateRoute>
                <LayoutEmpleado>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Moderación de Reseñas" }]} />
                  <ModeracionServicios />
                </LayoutEmpleado>
              </PrivateRoute>
            }
          />
          <Route
            path="/Empleado/expedienteClinico"
            element={
              <PrivateRoute>
                <LayoutEmpleado>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Expediente Clínico" }]} />
                  <ExpedienteClinico />
                </LayoutEmpleado>
              </PrivateRoute>
            }
          />
          <Route
            path="/Empleado/ayuda"
            element={
              <PrivateRoute>
                <LayoutEmpleado>
                  <Breadcrumbs paths={[{ name: "Inicio", path: "/Empleado/principal" }, { name: "Ayuda" }]} />
                  <AyudaAdmin />
                </LayoutEmpleado>
              </PrivateRoute>
            }
          />
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [forceLoading, setForceLoading] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setForceLoading(false), 2000); // Reducido a 2s
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      fetchTitleAndLogo();
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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
        const oldIcons = document.querySelectorAll("link[rel='icon']");
        oldIcons.forEach((icon) => icon.parentNode.removeChild(icon));

        const newIcon = document.createElement("link");
        newIcon.id = "dynamic-favicon";
        newIcon.rel = "icon";
        newIcon.type = "image/png";
        newIcon.href = `data:image/png;base64,${logo}`;
        document.head.appendChild(newIcon);
      }

      setFetchErrors(0);

      if (!intervalRef.current) {
        intervalRef.current = setInterval(fetchTitleAndLogo, 300000); // 5 minutos
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (!axios.isCancel(error)) {
        console.error("Error en la solicitud:", error.message);
      }
      setFetchErrors((prev) => prev + 1);
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


  if (forceLoading) {
    return <LoadingScreen tituloPagina={tituloPagina} />;
  }

 return (
    <ThemeProviderComponent>
      <Router>
        <Suspense fallback={<LoadingScreen tituloPagina={tituloPagina} />}>
          <AppContent forceLoading={forceLoading} isOnline={isOnline} />
        </Suspense>
      </Router>
    </ThemeProviderComponent>
  );
}

export default App;