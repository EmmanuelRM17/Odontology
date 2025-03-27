import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useMediaQuery,
  useTheme,
  IconButton,
  Chip,
  Paper,
  Grow,
  Zoom,
  Divider,
  CircularProgress,
  alpha, MenuItem
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EmailIcon from "@mui/icons-material/Email";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import InfoIcon from "@mui/icons-material/Info";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { keyframes } from "@emotion/react";
import Notificaciones from '../../../components/Layout/Notificaciones';
import CustomRecaptcha from "../../../components/Tools/Captcha";
import { useThemeContext } from '../../../components/Tools/ThemeContext';


const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const FAQ = () => {
  // Estados
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const { isDarkTheme } = useThemeContext();
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [categories, setCategories] = useState(["Todas"]);
  const dialogRef = useRef(null);
  const searchInputRef = useRef(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "info"
  });

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    question: "",
    isRegistered: false,
    paciente_id: null
  });

  // Theme y media queries
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Colores principales según el tema - Eliminados tonos morados, solo azules
  const colors = {
    primary: isDarkTheme ? "#60A5FA" : "#0A66C2", // Azul más vibrante
    secondary: isDarkTheme ? "#93C5FD" : "#1E88E5", // Azul secundario
    background: isDarkTheme
      ? "linear-gradient(90deg, #1C2A38 0%, #2C3E50 100%)"
      : "linear-gradient(90deg, #ffffff 0%, #E5F3FD 100%)",
    cardBg: isDarkTheme ? "#1E2A3B" : "#ffffff",
    text: isDarkTheme ? "#ffffff" : "#0A1929",
    secondaryText: isDarkTheme ? "#cbd5e0" : "#555555",
    border: isDarkTheme ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
    hover: isDarkTheme ? "rgba(96, 165, 250, 0.15)" : "rgba(10, 102, 194, 0.08)",
    shadow: isDarkTheme
      ? "0 8px 16px rgba(0,0,0,0.4)"
      : "0 8px 16px rgba(10,102,194,0.15)",
    placeholder: isDarkTheme ? "#4a5568" : "#cccccc"
  };

  // Helper function para mostrar notificaciones
  const showNotification = (message, type = "info", duration = 4000) => {
    setNotification({
      open: true,
      message,
      type
    });

    setTimeout(() => {
      setNotification(prev => ({ ...prev, open: false }));
    }, duration);
  };

  // Lista de preguntas estáticas para clínica dental
  const staticFaqs = [
    {
      question: "¿Qué opciones de blanqueamiento dental ofrecen?",
      answer: (
        <>
          <p>Ofrecemos tres modalidades de blanqueamiento dental adaptadas a las necesidades específicas de cada paciente:</p>
          <ul>
            <li><strong>Blanqueamiento en consultorio:</strong> Procedimiento profesional realizado en una sola sesión. Utiliza agentes blanqueadores de alta concentración con activación por luz para resultados inmediatos.</li>
            <li><strong>Blanqueamiento en casa:</strong> Sistema personalizado con férulas a medida. Incluye gel blanqueador de menor concentración para uso domiciliario durante 1-2 semanas bajo supervisión profesional.</li>
            <li><strong>Blanqueamiento combinado:</strong> Tratamiento que inicia con una sesión en consultorio seguida de aplicaciones en casa para resultados óptimos y duraderos.</li>
          </ul>
          <p>Durante la consulta evaluaremos su caso particular y recomendaremos la mejor opción según sus necesidades y condición dental.</p>
        </>
      ),
      categoria: "Estética dental"
    },
    {
      question: "¿Cuáles son las opciones para reemplazar dientes perdidos?",
      answer: (
        <>
          <p>Contamos con diversas soluciones para restaurar su sonrisa cuando ha perdido piezas dentales:</p>
          <ul>
            <li><strong>Implantes dentales:</strong> La solución más avanzada y similar a los dientes naturales. Un tornillo de titanio se integra al hueso maxilar (osteointegración) y sirve como raíz para soportar una corona dental.</li>
            <li><strong>Puentes fijos:</strong> Restauraciones que se apoyan en los dientes adyacentes para reponer las piezas faltantes. Son fijos y requieren tallado de dientes naturales como soporte.</li>
            <li><strong>Prótesis removibles:</strong> Pueden ser parciales o completas según la cantidad de dientes a reemplazar. Ofrecen una solución económica con la ventaja de poder extraerse para su limpieza.</li>
            <li><strong>Soluciones All-on-4/All-on-6:</strong> Técnicas avanzadas que permiten rehabilitar una arcada completa con tan solo 4 o 6 implantes estratégicamente posicionados.</li>
          </ul>
          <p>Cada opción tiene sus indicaciones, ventajas y consideraciones particulares que evaluaremos en su consulta personalizada.</p>
        </>
      ),
      categoria: "Rehabilitación oral"
    },
    {
      question: "¿Qué es la endodoncia y cuándo es necesaria?",
      answer: (
        <>
          <p>La endodoncia (tratamiento de conductos) es un procedimiento especializado que consiste en:</p>
          <ul>
            <li>Eliminación del tejido pulpar (nervios y vasos sanguíneos) inflamado o infectado</li>
            <li>Limpieza y desinfección de los conductos radiculares</li>
            <li>Sellado hermético para prevenir reinfecciones</li>
          </ul>
          <p><strong>Este tratamiento es necesario cuando:</strong></p>
          <ul>
            <li>Existe dolor dental intenso y persistente</li>
            <li>Se presenta sensibilidad prolongada al frío o calor</li>
            <li>Hay inflamación o sensibilidad en las encías adyacentes</li>
            <li>Se observa oscurecimiento del diente</li>
            <li>Se detecta presencia de infección o absceso en las radiografías</li>
          </ul>
          <p>La endodoncia permite conservar el diente natural, evitando su extracción, y eliminar el dolor causado por la inflamación o infección pulpar.</p>
        </>
      ),
      categoria: "Tratamientos"
    },
    {
      question: "¿Qué son los implantes dentales y cuál es su durabilidad?",
      answer: (
        <>
          <p><strong>Los implantes dentales son:</strong></p>
          <ul>
            <li>Raíces artificiales de titanio biocompatible que se integran al hueso maxilar</li>
            <li>La base para soportar coronas, puentes o prótesis completas</li>
            <li>La solución más similar al diente natural en función y estética</li>
          </ul>
          <p><strong>Respecto a su durabilidad:</strong></p>
          <ul>
            <li>Con cuidados adecuados, los implantes pueden durar toda la vida en la mayoría de los casos (tasa de éxito superior al 95% a los 10 años)</li>
            <li>Las prótesis sobre implantes (coronas, puentes) pueden requerir reemplazos cada 10-15 años, dependiendo de factores individuales</li>
            <li>Su mantenimiento requiere higiene bucal meticulosa, visitas regulares al dentista y evitar hábitos perjudiciales como el tabaquismo</li>
          </ul>
          <p>En nuestra clínica realizamos un estudio completo previo a la intervención para garantizar el mejor pronóstico posible.</p>
        </>
      ),
      categoria: "Implantología"
    },
    {
      question: "¿Cada cuánto tiempo debo acudir a revisión dental?",
      answer: (
        <>
          <p>La frecuencia de las revisiones dentales debe adaptarse a las necesidades individuales de cada paciente:</p>
          <ul>
            <li><strong>Pacientes con salud dental estable:</strong> Revisiones cada 6 meses para exámenes completos y limpiezas profesionales</li>
            <li><strong>Pacientes con enfermedad periodontal:</strong> Controles cada 3-4 meses para mantenimiento periodontal</li>
            <li><strong>Pacientes con alto riesgo de caries:</strong> Revisiones trimestrales con aplicaciones profesionales de flúor</li>
            <li><strong>Pacientes con implantes dentales:</strong> Controles semestrales para verificar la salud periimplantaria</li>
            <li><strong>Niños en etapa de desarrollo:</strong> Revisiones cada 4-6 meses para monitorizar el crecimiento y desarrollo</li>
          </ul>
          <p>Durante su primera consulta evaluaremos su condición bucal y estableceremos un programa personalizado de seguimiento según su perfil de riesgo.</p>
        </>
      ),
      categoria: "Prevención"
    },
    {
      question: "¿Cómo puedo financiar mi tratamiento dental?",
      answer: (
        <>
          <p>En nuestra clínica comprendemos que la inversión en salud bucal es importante, por eso ofrecemos diversas facilidades de pago:</p>
          <ul>
            <li><strong>Métodos de pago directo:</strong>
              <ul>
                <li>Efectivo</li>
                <li>Tarjetas de débito y crédito (Visa, Mastercard, American Express)</li>
                <li>Transferencias bancarias</li>
              </ul>
            </li>
            <li><strong>Planes de financiamiento:</strong>
              <ul>
                <li>Pago fraccionado sin intereses para tratamientos específicos</li>
                <li>Financiación hasta 24 meses para tratamientos extensos</li>
                <li>Plan Familia con descuentos especiales para grupos familiares</li>
              </ul>
            </li>
            <li><strong>Colaboración con aseguradoras:</strong> Trabajamos con las principales compañías de seguros dentales</li>
          </ul>
          <p>Nuestro departamento administrativo le ofrecerá un presupuesto detallado y le ayudará a encontrar la opción que mejor se adapte a sus necesidades financieras.</p>
        </>
      ),
      categoria: "Administración"
    }
  ];

  // Función para obtener FAQs
  const fetchFAQs = useCallback(async () => {
    setLoadingFaqs(true);

    try {
      // Simulamos la carga de preguntas
      await new Promise(resolve => setTimeout(resolve, 800));

      // Usamos las preguntas estáticas
      setFaqs(staticFaqs);
      setFilteredFaqs(staticFaqs);

      // Extraemos categorías únicas
      const uniqueCategories = ['Todas', ...new Set(staticFaqs.map(faq => faq.categoria))];
      setCategories(uniqueCategories);

    } catch (error) {
      console.error("Error al cargar preguntas:", error);
      showNotification("No se pudieron cargar las preguntas frecuentes", "error");
      setFaqs([]);
      setFilteredFaqs([]);
    } finally {
      setLoadingFaqs(false);
    }
  }, []);

  // Filtrar preguntas por búsqueda y categoría
  useEffect(() => {
    let result = [...faqs];

    // Filtrar por categoría
    if (activeCategory !== "Todas") {
      result = result.filter(faq => faq.categoria === activeCategory);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        faq =>
          faq.question.toLowerCase().includes(query) ||
          // Verificamos si el answer es un string o un componente JSX
          (typeof faq.answer === 'string'
            ? faq.answer.toLowerCase().includes(query)
            : React.isValidElement(faq.answer)
              // Para elementos JSX, convertimos a string para búsqueda
              ? faq.answer.props.children
                .flatMap(child => typeof child === 'string' ? child : '')
                .join(' ')
                .toLowerCase()
                .includes(query)
              : false)
      );
    }

    setFilteredFaqs(result);
  }, [faqs, searchQuery, activeCategory]);

  // Cargar preguntas al montar el componente
  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  // Handlers para acordeón
  const handleChange = (panel) => (event, isExpanded) => {
    try {
      setExpandedPanel(isExpanded ? panel : false);
    } catch (error) {
      console.error("Error al manejar el acordeón:", error);
    }
  };

  // Handlers de formulario
  const handleFormChange = (e) => {
    try {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    } catch (error) {
      console.error("Error en el formulario:", error);
      showNotification("Error al actualizar el formulario", "error");
    }
  };

  const handleCaptchaChange = (value) => {
    setCaptchaVerified(!!value);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const checkEmailInDatabase = async () => {
    try {
      if (!validateEmail(formData.email)) {
        showNotification("Por favor ingrese un correo electrónico válido", "warning");
        return;
      }

      const response = await fetch(
        "https://back-end-4803.onrender.com/api/preguntas/verificar-correo",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      setFormData(prev => ({
        ...prev,
        name: data.exists ? `${data.name} ${data.apellido_paterno}` : "",
        isRegistered: data.exists,
        paciente_id: data.exists ? data.paciente_id : null,
      }));

      if (data.exists) {
        showNotification("¿Qué duda tiene mi paciente?", "success");
      }

    } catch (error) {
      showNotification("Error al verificar el correo electrónico", "error");
    }
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      showNotification("Por favor ingrese su correo electrónico", "warning");
      return false;
    }
    if (!formData.name.trim()) {
      showNotification("Por favor ingrese su nombre", "warning");
      return false;
    }
    if (!formData.question.trim()) {
      showNotification("Por favor ingrese su pregunta", "warning");
      return false;
    }
    if (!captchaVerified) {
      showNotification("Por favor complete la verificación de seguridad", "warning");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 1000));

      showNotification("Su pregunta ha sido enviada. Responderemos a la brevedad posible.", "success", 5000);
      setOpenModal(false);

      // Resetear formulario
      setFormData({
        email: "",
        name: "",
        question: "",
        isRegistered: false,
        paciente_id: null
      });
      setCaptchaVerified(false);
    } catch (error) {
      console.error("Error al enviar:", error);
      showNotification("Error al enviar la pregunta", "error");
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  // Componente de esqueleto para la carga
  const SkeletonFAQ = () => (
    <Box sx={{ my: 2, width: '100%' }}>
      {[1, 2, 3, 4].map((_, index) => (
        <Paper
          key={index}
          sx={{
            my: 2,
            p: 2,
            borderRadius: '12px',
            background: `linear-gradient(90deg, ${isDarkTheme ? '#1E2A3B' : '#f5f5f5'
              } 25%, ${isDarkTheme ? '#2C3E50' : '#e0e0e0'
              } 37%, ${isDarkTheme ? '#1E2A3B' : '#f5f5f5'
              } 63%)`,
            backgroundSize: '1000px 100%',
            animation: `${shimmer} 2s infinite linear`,
            height: index === 0 ? '100px' : '80px',
            opacity: 1 - (index * 0.2)
          }}
        />
      ))}
    </Box>
  );

  // Variantes de animación para Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 10
      }
    }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  // Estilos con animaciones mejoradas
  const styles = {
    container: {
      background: colors.background,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: "85vh",
      padding: isMobile ? "1.5rem" : "3rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      transition: "all 0.3s ease-in-out",
      position: "relative",
      overflow: 'hidden'
    },
    header: {
      width: '100%',
      maxWidth: '800px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      mb: isTablet ? 3 : 5,
      position: 'relative',
      zIndex: 1
    },
    title: {
      color: isDarkTheme ? "#ffffff" : "#0A1929",
      fontWeight: 800,
      fontSize: isMobile ? "1.75rem" : "2.5rem",
      textAlign: "center",
      fontFamily: "Montserrat, sans-serif",
      marginBottom: '2rem',
      textTransform: "uppercase",
      letterSpacing: "1px",
      textShadow: isDarkTheme ? "0 2px 10px rgba(255, 255, 255, 0.3)" : "0 2px 5px rgba(10, 102, 194, 0.2)",
      position: 'relative',
      display: 'inline-block',
      '&::after': {
        content: '""',
        position: 'absolute',
        left: '50%',
        bottom: '-10px',
        width: '80px',
        height: '4px',
        background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
        transform: 'translateX(-50%)',
        borderRadius: '4px'
      }
    },
    subtitle: {
      color: colors.secondaryText,
      fontSize: isMobile ? "0.9rem" : "1rem",
      textAlign: "center",
      maxWidth: "600px",
      mt: 3,
      mb: 4,
      lineHeight: 1.6
    },
    searchContainer: {
      width: '100%',
      maxWidth: '700px',
      mb: 3,
      mt: 2
    },
    searchField: {
      "& .MuiOutlinedInput-root": {
        borderRadius: "30px",
        backgroundColor: alpha(colors.cardBg, 0.7),
        backdropFilter: "blur(8px)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
          transform: "translateY(-2px)"
        },
        "&.Mui-focused": {
          boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          transform: "translateY(-2px)"
        }
      },
      "& .MuiOutlinedInput-input": {
        padding: "14px 16px",
        fontFamily: "Montserrat, sans-serif",
        color: colors.text
      },
      "& .MuiInputAdornment-root": {
        marginRight: "8px"
      },
      "& fieldset": {
        borderColor: colors.border
      }
    },
    categoriesContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: isMobile ? 1 : 1.5,
      width: '100%',
      maxWidth: '800px',
      mb: 4,
      px: 1
    },
    categoryChip: {
      borderRadius: '20px',
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 500,
      fontSize: isMobile ? '0.7rem' : '0.85rem',
      py: 1.5,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
      }
    },
    faqContainer: {
      width: '100%',
      maxWidth: '800px',
      position: 'relative',
      zIndex: 1
    },
    accordion: {
      background: alpha(colors.cardBg, 0.8),
      backdropFilter: "blur(10px)",
      borderRadius: "12px",
      boxShadow: colors.shadow,
      mb: 2.5,
      overflow: 'hidden',
      transition: "all 0.3s ease-in-out",
      border: `1px solid ${alpha(colors.border, 0.1)}`,
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: isDarkTheme
          ? "0 12px 20px rgba(0,0,0,0.5)"
          : "0 12px 20px rgba(10,102,194,0.2)",
      },
      "&:before": {
        display: "none"
      }
    },
    accordionSummary: {
      minHeight: '64px',
      padding: '0 16px',
      "&.Mui-expanded": {
        minHeight: '64px',
        borderBottom: `1px solid ${alpha(colors.border, 0.1)}`
      }
    },
    accordionDetails: {
      padding: '16px',
      backgroundColor: alpha(isDarkTheme ? "#1A2636" : "#f8f9fa", 0.5)
    },
    question: {
      fontFamily: '"Montserrat", sans-serif',
      fontSize: isMobile ? "0.95rem" : "1.05rem",
      fontWeight: 600,
      color: colors.text,
      transition: "color 0.3s ease",
      mr: 1
    },
    answer: {
      fontFamily: "Montserrat, sans-serif",
      fontSize: isMobile ? "0.9rem" : "0.95rem",
      color: colors.secondaryText,
      lineHeight: 1.8,
      transition: "all 0.3s ease",
    },
    askButton: {
      // Botón menos prominente
      background: 'transparent',
      color: colors.primary,
      border: `1px solid ${colors.primary}`,
      fontFamily: "Montserrat, sans-serif",
      padding: "0.6rem 1.5rem",
      borderRadius: "8px",
      textTransform: "none",
      fontSize: isMobile ? "0.9rem" : "1rem",
      fontWeight: 500,
      mt: 4,
      transition: "all 0.3s ease",
      boxShadow: "none",
      "&:hover": {
        background: alpha(colors.primary, 0.1),
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        transform: "translateY(-2px)"
      }
    },
    modal: {
      "& .MuiDialog-paper": {
        borderRadius: "16px",
        padding: "0",
        boxShadow: isDarkTheme
          ? "0 24px 48px rgba(0,0,0,0.5)"
          : "0 24px 48px rgba(0,0,0,0.2)",
        backgroundColor: colors.cardBg,
        overflow: "hidden",
        maxWidth: "550px"
      }
    },
    modalHeader: {
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      color: "#ffffff",
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    },
    modalTitle: {
      fontFamily: "Montserrat, sans-serif",
      color: "#ffffff",
      fontSize: "1.4rem",
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
      gap: "10px"
    },
    modalContent: {
      padding: "24px",
    },
    textField: {
      marginBottom: "1.5rem",
      "& label": {
        fontFamily: "Montserrat, sans-serif",
        color: isDarkTheme ? alpha(colors.secondaryText, 0.7) : undefined,
        fontSize: "0.95rem",
      },
      "& input, & textarea": {
        fontFamily: "Montserrat, sans-serif",
        color: colors.text,
        fontSize: "1rem",
        padding: "16px 14px",
      },
      "& .MuiOutlinedInput-root": {
        borderRadius: "12px",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-1px)",
        },
        "& fieldset": {
          borderColor: colors.border,
          transition: "border-color 0.3s ease",
        },
        "&:hover fieldset": {
          borderColor: colors.primary,
        },
        "&.Mui-focused fieldset": {
          borderColor: colors.primary,
          borderWidth: "2px",
        },
      },
    },
    dialogActions: {
      padding: "16px 24px",
      background: isDarkTheme ? alpha("#000000", 0.2) : alpha("#f5f5f5", 0.5),
      borderTop: `1px solid ${colors.border}`
    },
    captchaContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '1.5rem',
      minHeight: '78px',
      transition: 'all 0.3s ease'
    },
    noFaqsMessage: {
      marginTop: "2rem",
      color: colors.secondaryText,
      fontSize: "1.1rem",
      textAlign: "center",
      fontFamily: "Montserrat, sans-serif",
      padding: "2rem",
      border: `2px dashed ${isDarkTheme ? "#4a5568" : "#ccc"}`,
      borderRadius: "12px",
      backgroundColor: alpha(colors.cardBg, 0.5),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1rem"
    },
    loadingSpinner: {
      marginTop: "2rem",
      color: colors.primary
    },
    decorativeIcon: {
      position: 'absolute',
      color: alpha(colors.primary, 0.05),
      zIndex: 0
    }
  };

  // Componente SearchAndCategories rediseñado
  const SearchAndCategories = () => {
    return (
      <Box sx={{
        width: '100%',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        gap: 2,
        mb: 3
      }}>
        {/* Search bar - Ocupa 60% del espacio en escritorio */}
        <Box sx={{
          flex: isMobile ? 1 : '0.6',
          width: isMobile ? '100%' : '60%'
        }}>
          <TextField
            fullWidth
            placeholder="Buscar preguntas..."
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            inputRef={searchInputRef}
            InputProps={{
              startAdornment: (
                <Box component={HelpOutlineIcon} sx={{ mr: 1.5, color: colors.primary }} />
              ),
              endAdornment: searchQuery && (
                <IconButton
                  size="small"
                  onClick={() => setSearchQuery("")}
                  sx={{ color: colors.secondaryText }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )
            }}
            sx={styles.searchField}
          />
        </Box>

        {/* Categories select - Ocupa 40% del espacio en escritorio */}
        <Box sx={{
          flex: isMobile ? 1 : '0.4',
          width: isMobile ? '100%' : '40%'
        }}>
          <TextField
            select
            fullWidth
            value={activeCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            variant="outlined"
            sx={{
              ...styles.searchField,
              "& .MuiSelect-select": {
                display: 'flex',
                alignItems: 'center',
                padding: "14px 16px",
              },
            }}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                    backgroundColor: colors.cardBg,
                  }
                }
              },
            }}
            InputProps={{
              startAdornment: (
                <Box component={QuestionAnswerIcon} sx={{ mr: 1.5, color: colors.primary }} />
              ),
            }}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category} sx={{
                fontFamily: "Montserrat, sans-serif",
                color: colors.text,
                "&:hover": {
                  backgroundColor: alpha(colors.primary, 0.1),
                },
                "&.Mui-selected": {
                  backgroundColor: alpha(colors.primary, 0.1),
                }
              }}>
                {category}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>
    );
  };
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        background: colors.background,
        minHeight: "85vh",
        padding: isMobile ? "1.5rem" : "3rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflow: 'hidden'
      }}
    >
      {/* Decorative background icons */}
      <Box sx={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
        <LiveHelpIcon sx={{
          ...styles.decorativeIcon,
          fontSize: 300,
          top: '5%',
          left: '5%',
          transform: 'rotate(-15deg)'
        }} />
        <QuestionAnswerIcon sx={{
          ...styles.decorativeIcon,
          fontSize: 200,
          bottom: '10%',
          right: '5%',
          transform: 'rotate(10deg)'
        }} />
        <InfoIcon sx={{
          ...styles.decorativeIcon,
          fontSize: 180,
          top: '30%',
          right: '8%',
          transform: 'rotate(-5deg)'
        }} />
        <HelpOutlineIcon sx={{
          ...styles.decorativeIcon,
          fontSize: 220,
          bottom: '20%',
          left: '8%',
          transform: 'rotate(10deg)'
        }} />
      </Box>

      {/* Header Section con buscador y categorías juntos */}
      <motion.div variants={itemVariants} style={{ width: '100%', maxWidth: '800px' }}>
        <Box sx={styles.header}>
          <Typography variant="h3" sx={styles.title}>
            Preguntas Frecuentes
          </Typography>

          <SearchAndCategories />

        </Box>
      </motion.div>

      {/* FAQs Section */}
      <Box sx={styles.faqContainer}>
        {loadingFaqs ? (
          <SkeletonFAQ />
        ) : filteredFaqs.length > 0 ? (
          <AnimatePresence>
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={`faq-${index}`}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Accordion
                  expanded={expandedPanel === `panel${index}`}
                  onChange={handleChange(`panel${index}`)}
                  sx={styles.accordion}
                  TransitionProps={{ unmountOnExit: true }}
                >
                  <AccordionSummary
                    expandIcon={
                      <ExpandMoreIcon
                        sx={{
                          color: colors.primary,
                          transition: 'all 0.3s ease',
                          transform: expandedPanel === `panel${index}` ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                      />
                    }
                    sx={styles.accordionSummary}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {faq.categoria && (
                        <Chip
                          label={faq.categoria}
                          size="small"
                          sx={{
                            mr: 2,
                            backgroundColor: `${colors.primary}30`,
                            color: colors.primary,
                            fontWeight: 500,
                            fontSize: '0.7rem',
                            height: '24px'
                          }}
                        />
                      )}
                      <Typography sx={styles.question}>{faq.question}</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{
                    ...styles.accordionDetails,
                    '& p': {
                      marginBottom: '1rem',
                      lineHeight: 1.8,
                    },
                    '& ul': {
                      marginBottom: '1rem',
                      paddingLeft: '1.5rem',
                    },
                    '& li': {
                      marginBottom: '0.5rem',
                      lineHeight: 1.6,
                    },
                    '& strong': {
                      fontWeight: 600,
                      color: isDarkTheme ? alpha(colors.primary, 0.9) : colors.primary,
                    }
                  }}>
                    <Box sx={styles.answer}>
                      {faq.answer}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Box sx={styles.noFaqsMessage}>
              <ContactSupportIcon fontSize="large" color="action" />
              {searchQuery ? (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    No se encontraron resultados
                  </Typography>
                  <Typography variant="body2">
                    No hay coincidencias para "{searchQuery}". Intenta con otra búsqueda o haz tu pregunta directamente.
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    No hay preguntas disponibles
                  </Typography>
                  <Typography variant="body2">
                    Actualmente no hay preguntas frecuentes disponibles. Sé el primero en hacer una pregunta.
                  </Typography>
                </>
              )}
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setOpenModal(true)}
                startIcon={<EmailIcon />}
                sx={{ mt: 2 }}
              >
                Hacer una pregunta
              </Button>
            </Box>
          </motion.div>
        )}
      </Box>

      {/* Ask Question Button - Menos visible */}
      {filteredFaqs.length > 0 && (
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outlined"
            size="medium"
            startIcon={<LiveHelpIcon />}
            onClick={() => setOpenModal(true)}
            sx={styles.askButton}
          >
            ¿Tienes otra pregunta?
          </Button>
        </motion.div>
      )}

      {/* Question Form Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        sx={styles.modal}
        ref={dialogRef}
      >
        <AnimatePresence>
          {openModal && (
            <motion.div
              key="modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Box sx={styles.modalHeader}>
                <Typography variant="h6" sx={styles.modalTitle}>
                  <QuestionAnswerIcon /> Hacer una pregunta
                </Typography>
                <IconButton
                  aria-label="close"
                  onClick={() => setOpenModal(false)}
                  sx={{ color: '#ffffff' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              <DialogContent sx={styles.modalContent}>
                <Box component="form">
                  <TextField
                    name="email"
                    label="Correo electrónico"
                    fullWidth
                    value={formData.email}
                    onChange={handleFormChange}
                    onBlur={checkEmailInDatabase}
                    required
                    type="email"
                    InputProps={{
                      startAdornment: (
                        <Box component={MarkEmailReadIcon} sx={{ mr: 1.5, color: colors.primary, opacity: formData.isRegistered ? 1 : 0.6 }} />
                      )
                    }}
                    sx={styles.textField}
                  />

                  <TextField
                    name="name"
                    label="Nombre"
                    fullWidth
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    disabled={formData.isRegistered}
                    InputProps={{
                      startAdornment: (
                        <Box component={formData.isRegistered ? CheckCircleIcon : null} sx={{ mr: 1.5, color: 'success.main' }} />
                      )
                    }}
                    sx={styles.textField}
                  />

                  <TextField
                    name="question"
                    label="Tu pregunta"
                    fullWidth
                    value={formData.question}
                    onChange={handleFormChange}
                    sx={styles.textField}
                    required
                    multiline
                    rows={4}
                  />

                  <Box sx={styles.captchaContainer}>
                    <CustomRecaptcha
                      onCaptchaChange={handleCaptchaChange}
                      isDarkMode={isDarkTheme}
                    />
                  </Box>
                </Box>
              </DialogContent>

              <DialogActions sx={styles.dialogActions}>
                <Button
                  onClick={() => setOpenModal(false)}
                  sx={{
                    fontFamily: "Montserrat, sans-serif",
                    color: colors.secondaryText
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={!captchaVerified}
                  startIcon={<SendIcon />}
                  sx={{
                    background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
                    color: isDarkTheme ? "#000000" : "white",
                    fontFamily: "Montserrat, sans-serif",
                    transition: 'all 0.3s ease',
                    borderRadius: '8px',
                    padding: '8px 24px',
                    fontWeight: 600,
                    '&:hover': {
                      boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
                      transform: 'translateY(-2px)'
                    },
                    '&:disabled': {
                      background: colors.placeholder,
                      color: isDarkTheme ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
                    }
                  }}
                >
                  Enviar pregunta
                </Button>
              </DialogActions>
            </motion.div>
          )}
        </AnimatePresence>
      </Dialog>

      {/* Notification Component */}
      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />
    </motion.div>
  );
};

export default FAQ;