import React, { useEffect, useState, useRef, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import axios from "axios";
import ThemeProviderComponent from "./components/Tools/ThemeContext";
import OfflineBanner from "./components/Tools/OfflineBanner";
import PrivateRoute from "./components/Tools/PrivateRoute";
import ErrorPage from "./components/Tools/ErrorPage";
import Breadcrumbs from "./pages/_home/tools/Breadcrumbs";
import ScrollToTop from "./components/Tools/ScrollToTop";
import LoadingScreen from "./components/Tools/LoadingScreen.jsx";

// Lazy imports - Públicos
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

// Lazy imports - Paciente
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

// Lazy imports - Admin
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
const Gamificacion = lazy(() => import("./pages/administrador/pages/AdminGamificacion"));
const Clostering = lazy(() => import("./pages/administrador/pages/Clostering"));
const ModeracionServicios = lazy(() => import("./pages/administrador/pages/resenyasModerar"));
const AyudaAdmin = lazy(() => import("./pages/paciente/pages/Ayuda"));

// Lazy imports - Empleado
const LayoutEmpleado = lazy(() => import("./pages/empleado/LayoutEmpleado"));
const PrincipalEmpleado = lazy(() => import("./pages/empleado/Principal"));
const ExpedienteClinico = lazy(() => import("./pages/empleado/pages/ExpedientPacient"));

// Configuración de rutas por rol
const routeConfig = {
  paciente: [
    { path: "principal", component: Principal },
    { path: "citas", component: Citas, breadcrumb: "Mis Citas" },
    { path: "tratamientos", component: Tratamientos, breadcrumb: "Mis Tratamientos" },
    { path: "progreso", component: Progreso, breadcrumb: "Mi progreso" },
    { path: "perfil", component: Perfil, breadcrumb: "Perfil de Usuario" },
    { path: "mensajes", component: Mensajes, breadcrumb: "Mensajes" },
    { path: "pagos", component: Pagos, breadcrumb: "Pagos" },
    { path: "ayuda", component: AyudaPaciente, breadcrumb: "Ayuda" },
    { path: "expediente", component: ExpedientePaciente, breadcrumb: "Expediente clinico" }
  ],
  administrador: [
    { path: "principal", component: PrincipalAdmin },
    { path: "configuracion", component: Configuracion, breadcrumb: "Configuración" },
    { path: "reportes", component: Reportes, breadcrumb: "Reportes Generales" },
    { path: "pacientes", component: Pacientes, breadcrumb: "Gestión de Pacientes" },
    { path: "empleados", component: Empleados, breadcrumb: "Gestión de Empleados" },
    { path: "servicios", component: ServicioForm, breadcrumb: "Gestión de Servicios" },
    { path: "citas", component: CitasForm, breadcrumb: "Gestión de Citas" },
    { path: "citas/nueva", component: NuevoAgendamiento, breadcrumb: "Nueva Cita", parentPath: "/Administrador/citas", parentName: "Citas" },
    { path: "tratamientos", component: TratamientosForm, breadcrumb: "Gestión de Tratamientos" },
    { path: "horarios", component: HorariosForm, breadcrumb: "Gestión de Horarios" },
    { path: "PerfilEmpresa", component: PerfilEmpresa, breadcrumb: "Perfil Empresarial" },
    { path: "imagenes", component: ImagenesForm, breadcrumb: "Gestión de Imágenes" },
    { path: "finanzas", component: FinanzasForm, breadcrumb: "Gestión Financiera" },
    { path: "Estadisticas", component: Graficas, breadcrumb: "Estadísticas Operativas" },
    { path: "predicciones", component: Predicciones, breadcrumb: "Predicciones" },
    { path: "gamificacion", component: Gamificacion, breadcrumb: "Gamificación" },
    { path: "Clostering", component: Clostering, breadcrumb: "Clostering" },
    { path: "CalendarioCita", component: CalendarioCitas, breadcrumb: "Calendario de Citas" },
    { path: "Reseñas", component: ModeracionServicios, breadcrumb: "Moderación de Reseñas" },
    { path: "ayuda", component: AyudaAdmin, breadcrumb: "Ayuda" },
    { path: "expedienteClinico", component: ExpedienteClinico, breadcrumb: "Expediente Clínico" }
  ],
  empleado: [
    { path: "principal", component: PrincipalEmpleado },
    { path: "configuracion", component: Configuracion, breadcrumb: "Configuración" },
    { path: "reportes", component: Reportes, breadcrumb: "Reportes Generales" },
    { path: "pacientes", component: Pacientes, breadcrumb: "Gestión de Pacientes" },
    { path: "servicios", component: ServicioForm, breadcrumb: "Gestión de Servicios" },
    { path: "citas", component: CitasForm, breadcrumb: "Gestión de Citas" },
    { path: "citas/nueva", component: NuevoAgendamiento, breadcrumb: "Nueva Cita", parentPath: "/Empleado/citas", parentName: "Citas" },
    { path: "tratamientos", component: TratamientosForm, breadcrumb: "Gestión de Tratamientos" },
    { path: "horarios", component: HorariosForm, breadcrumb: "Gestión de Horarios" },
    { path: "imagenes", component: ImagenesForm, breadcrumb: "Gestión de Imágenes" },
    { path: "estadisticas", component: Graficas, breadcrumb: "Estadísticas Operativas" },
    { path: "calendarioCita", component: CalendarioCitas, breadcrumb: "Calendario de Citas" },
    { path: "reseñas", component: ModeracionServicios, breadcrumb: "Moderación de Reseñas" },
    { path: "expedienteClinico", component: ExpedienteClinico, breadcrumb: "Expediente Clínico" },
    { path: "ayuda", component: AyudaAdmin, breadcrumb: "Ayuda" }
  ]
};

// Hook para rastrear URL válidas
const useUrlTracker = () => {
  const location = useLocation();
  useEffect(() => {
    const excludedPaths = ["/error", "/login", "/register", "/recuperacion", "/resetContra", "/confirmacion"];
    if (!excludedPaths.some(path => location.pathname.startsWith(path))) {
      sessionStorage.setItem("lastValidUrl", location.pathname);
    }
  }, [location.pathname]);
};

// Genera rutas protegidas dinámicamente
const generateProtectedRoutes = (role, Layout, routes) => {
  const roleCapitalized = role.charAt(0).toUpperCase() + role.slice(1);
  const basePath = `/${roleCapitalized}`;

  return routes.map(({ path, component: Component, breadcrumb, parentPath, parentName }) => (
    <Route
      key={`${basePath}/${path}`}
      path={`${basePath}/${path}`}
      element={
        <PrivateRoute>
          <Layout>
            {breadcrumb && (
              <Breadcrumbs
                paths={[
                  { name: "Inicio", path: `${basePath}/principal` },
                  ...(parentPath ? [{ name: parentName, path: parentPath }] : []),
                  { name: breadcrumb }
                ]}
              />
            )}
            <Component />
          </Layout>
        </PrivateRoute>
      }
    />
  ));
};

function AppContent() {
  useUrlTracker();

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LayoutConEncabezado><Home /><Ubicacion /><Preguntas /></LayoutConEncabezado>} />
        <Route path="/FAQ" element={<LayoutConEncabezado><Breadcrumbs paths={[{ name: "Inicio", path: "/" }, { name: "Preguntas Frecuentes" }]} /><Preguntas /></LayoutConEncabezado>} />
        <Route path="/Contact" element={<LayoutConEncabezado><Breadcrumbs paths={[{ name: "Inicio", path: "/" }, { name: "Contacto" }]} /><Contactanos /></LayoutConEncabezado>} />
        <Route path="/about" element={<LayoutConEncabezado><Breadcrumbs paths={[{ name: "Inicio", path: "/" }, { name: "Acerca de" }]} /><Acerca /></LayoutConEncabezado>} />
        <Route path="/servicios" element={<LayoutConEncabezado><Breadcrumbs paths={[{ name: "Inicio", path: "/" }, { name: "Servicios" }]} /><Servicios /></LayoutConEncabezado>} />
        <Route path="/servicios/detalle/:servicioId" element={<LayoutConEncabezado><Breadcrumbs paths={[{ name: "Inicio", path: "/" }, { name: "Servicios", path: "/servicios" }, { name: "Detalle del Servicio" }]} /><ServiciosDetalle /></LayoutConEncabezado>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/agendar-cita" element={<Agendar />} />
        <Route path="/confirmacion" element={<Confirmacion />} />
        <Route path="/recuperacion" element={<Recuperacion />} />
        <Route path="/resetContra" element={<Reset />} />

        {/* Rutas protegidas generadas dinámicamente */}
        {generateProtectedRoutes("paciente", LayoutPaciente, routeConfig.paciente)}
        {generateProtectedRoutes("administrador", LayoutAdmin, routeConfig.administrador)}
        {generateProtectedRoutes("empleado", LayoutEmpleado, routeConfig.empleado)}

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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [forceLoading, setForceLoading] = useState(true);
  const [showOfflineMsg, setShowOfflineMsg] = useState(false);
  const intervalRef = useRef(null);

  // Loading inicial
  useEffect(() => {
    const timer = setTimeout(() => setForceLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Manejo de conexión online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMsg(false);
      fetchTitleAndLogo();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMsg(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Fetch título y logo con reintentos
  const fetchTitleAndLogo = async (retries = 3) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await axios.get("https://back-end-4803.onrender.com/api/perfilEmpresa/getTitleAndLogo", { signal: controller.signal });
      clearTimeout(timeoutId);

      const { nombre_pagina, logo } = response.data;

      if (nombre_pagina) {
        document.title = nombre_pagina;
        setTituloPagina(nombre_pagina);
      }

      if (logo) {
        document.querySelectorAll("link[rel='icon']").forEach(icon => icon.remove());
        const newIcon = document.createElement("link");
        newIcon.id = "dynamic-favicon";
        newIcon.rel = "icon";
        newIcon.type = "image/png";
        newIcon.href = `data:image/png;base64,${logo}`;
        document.head.appendChild(newIcon);
      }

      if (!intervalRef.current) {
        intervalRef.current = setInterval(fetchTitleAndLogo, 300000);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (retries > 0 && !axios.isCancel(error)) {
        await new Promise(res => setTimeout(res, 2000));
        fetchTitleAndLogo(retries - 1);
      }
    }
  };

  useEffect(() => {
    if (isOnline) fetchTitleAndLogo();
    return () => clearInterval(intervalRef.current);
  }, [isOnline]);


if (forceLoading) return <LoadingScreen tituloPagina={tituloPagina} />;

return (
  <ThemeProviderComponent>
    <Router>
      {!isOnline && showOfflineMsg && <OfflineBanner />}
      <div style={!isOnline && showOfflineMsg ? { marginTop: '48px' } : undefined}>
        <Suspense fallback={<LoadingScreen tituloPagina={tituloPagina} />}>
          <AppContent />
        </Suspense>
      </div>
    </Router>
  </ThemeProviderComponent>
);
}

export default App;