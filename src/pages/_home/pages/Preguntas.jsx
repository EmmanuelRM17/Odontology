import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EmailIcon from "@mui/icons-material/Email";
import ReCAPTCHA from "react-google-recaptcha";
import { keyframes } from "@emotion/react";
import { useRef } from "react";
import { CircularProgress } from "@mui/material";
import Notificaciones from '../../../components/Layout/Notificaciones'; // Importamos el componente de notificaciones

const FAQ = () => {
  // State management
  const [expandedPanel, setExpandedPanel] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "info"
  });
  const recaptchaRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const captchaTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    question: "",
    isRegistered: false,
    paciente_id: null,
    captchaVerified: false,
  });

  useEffect(() => {
    let retries = 0;
    const maxRetries = 50; // 🔹 Máximo de intentos (cada 100ms = 5s)

    const checkRecaptcha = setInterval(() => {
      if (window.grecaptcha && window.grecaptcha.render) {
        console.log("✅ reCAPTCHA cargado correctamente.");
        setIsCaptchaLoading(false);
        clearInterval(checkRecaptcha);
      } else if (retries >= maxRetries) {
        console.error("⚠ reCAPTCHA no pudo cargar después de varios intentos.");
        setIsCaptchaLoading(false);
        clearInterval(checkRecaptcha);
      }
      retries++;
    }, 100);

    return () => clearInterval(checkRecaptcha);
  }, []);


  // Helper function para mostrar notificaciones
  const showNotification = (message, type = "info", duration = 3000) => {
    setNotification({
      open: true,
      message,
      type
    });

    // Desaparecer la notificación después de 'duration' milisegundos
    setTimeout(() => {
      setNotification(prev => ({ ...prev, open: false }));
    }, duration);
  };


  // Manejador para cerrar notificaciones
  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Theme detection effect
  useEffect(() => {
    try {
      const matchDarkTheme = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDarkTheme(matchDarkTheme.matches);
      setIsDarkMode(matchDarkTheme.matches);

      const handleThemeChange = (e) => {
        setIsDarkTheme(e.matches);
        setIsDarkMode(e.matches);
      };

      matchDarkTheme.addEventListener("change", handleThemeChange);
      return () => matchDarkTheme.removeEventListener("change", handleThemeChange);
    } catch (error) {
      console.error("Error en la detección del tema:", error);
    }
  }, []);

  // FAQ fetching effect
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch(
          "https://back-end-4803.onrender.com/api/preguntas/get-all"
        );

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Formato de datos incorrecto");
        }

        setFaqs(data);
      } catch (error) {
        showNotification("No se pudieron cargar las preguntas frecuentes", "error");
        setFaqs([]);
      } finally {
        setLoadingFaqs(false);
      }
    };

    fetchFAQs();
  }, []);


  // Cleanup effect para el timeout del captcha
  useEffect(() => {
    return () => {
      if (captchaTimeoutRef.current) {
        clearTimeout(captchaTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (panel) => (event, isExpanded) => {
    try {
      setExpandedPanel(isExpanded ? panel : false);
    } catch (error) {
      console.error("Error al manejar el acordeón:", error);
    }
  };

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
    if (value) {
      setCaptchaValue(value);
      setIsCaptchaLoading(false);
      setErrorMessage("");
      setFormData(prev => ({ ...prev, captchaVerified: true }));
      showNotification("Verificación completada", "success");
  
      // Limpiar timeout previo antes de crear uno nuevo
      if (captchaTimeoutRef.current) {
        clearTimeout(captchaTimeoutRef.current);
      }
  
      captchaTimeoutRef.current = setTimeout(() => {
        console.log("Captcha expirado");
        setCaptchaValue(null);
        setFormData(prev => ({ ...prev, captchaVerified: false }));
        showNotification("La verificación ha expirado, por favor intente nuevamente", "warning");
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
      }, 120000); 
    }
  };
  
  // Limpiar timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (captchaTimeoutRef.current) {
        clearTimeout(captchaTimeoutRef.current);
      }
    };
  }, []);
  

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
    if (!formData.captchaVerified) {
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

      const payload = {
        email: formData.email,
        name: formData.name,
        question: formData.question,
        paciente_id: formData.isRegistered ? formData.paciente_id : null,
      };

      const response = await fetch(
        "https://back-end-4803.onrender.com/api/preguntas/nueva",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }


      setFaqs(prev => [...prev, {
        question: formData.question,
        answer: "Pendiente de respuesta"
      }]);

      showNotification("Su pregunta ha sido enviada exitosamente", "success");
      setOpenModal(false);

      // Resetear formulario
      setFormData({
        email: "",
        name: "",
        question: "",
        isRegistered: false,
        paciente_id: null,
        captchaVerified: false,
      });

      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }

      // Limpiar timeout del captcha
      if (captchaTimeoutRef.current) {
        clearTimeout(captchaTimeoutRef.current);
      }
    } catch (error) {
      showNotification("Error al enviar la pregunta", "error");
    }
  };

  // Primero definimos las animaciones
  const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

  const slideFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

  const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

  const styles = {
    container: {
      background: isDarkTheme
        ? "linear-gradient(135deg, #1C2A38 0%, #2C3E50 100%)"
        : "linear-gradient(90deg, #ffffff 0%, #E5F3FD 100%)",
      minHeight: "55vh",
      padding: isMobile ? "1.5rem" : "3rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      transition: "background 0.3s ease-in-out",
      position: "relative",
    },
    title: {
      marginBottom: "2rem",
      color: isDarkTheme ? "#90CAF9" : "#03427C",
      fontSize: isMobile ? "1.75rem" : "2rem",
      fontWeight: "bold",
      textAlign: "center",
      fontFamily: "Montserrat, sans-serif",
      textTransform: "uppercase",
      letterSpacing: "2px",
      position: "relative",
      display: "inline-block",
      paddingBottom: "0.75rem",
      borderBottom: `4px solid ${isDarkTheme ? "#90CAF9" : "#03427C"}`,
      textShadow: "2px 2px 5px rgba(0,0,0,0.2)",
      animation: `${fadeIn} 0.8s ease-out`,
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: "-4px",
        left: "0",
        width: "100%",
        height: "4px",
        background: isDarkTheme ? "#90CAF9" : "#03427C",
        transform: "scaleX(0)",
        transformOrigin: "right",
        transition: "transform 0.3s ease-out",
      },
      "&:hover::after": {
        transform: "scaleX(1)",
        transformOrigin: "left",
      },
    },
    accordion: {
      background: isDarkTheme ? "#2d3748" : "white",
      borderRadius: "12px",
      boxShadow: isDarkTheme
        ? "0 8px 16px rgba(0,0,0,0.4)"
        : "0 8px 16px rgba(0,0,0,0.1)",
      margin: "0.75rem 0",
      width: "100%",
      maxWidth: "800px",
      transition: "all 0.3s ease-in-out",
      animation: `${slideFromRight} 0.5s ease-out`,
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: isDarkTheme
          ? "0 12px 20px rgba(0,0,0,0.5)"
          : "0 12px 20px rgba(0,0,0,0.15)",
      },
    },
    question: {
      fontFamily: '"Montserrat", sans-serif',
      fontSize: isMobile ? "1rem" : "1.1rem",
      fontWeight: 400,
      color: isDarkTheme ? "#ffffff" : "#000000",
      transition: "color 0.3s ease",
    },
    answer: {
      fontFamily: "Montserrat, sans-serif",
      fontSize: isMobile ? "0.9rem" : "1rem",
      color: isDarkTheme ? "#cbd5e0" : "#555555",
      lineHeight: 1.6,
      padding: "0.5rem 0",
      transition: "all 0.3s ease",
    },
    askButton: {
      marginTop: "2.5rem",
      background: isDarkTheme ? "#90CAF9" : "#03427C",
      color: isDarkTheme ? "#000000" : "white",
      fontFamily: "Montserrat, sans-serif",
      padding: "0.75rem 2rem",
      borderRadius: "30px",
      textTransform: "none",
      fontSize: "1.1rem",
      fontWeight: 500,
      transition: "all 0.3s ease",
      animation: `${pulseAnimation} 2s infinite`,
      boxShadow: isDarkTheme
        ? "0 4px 15px rgba(144, 202, 249, 0.4)"
        : "0 4px 15px rgba(3, 66, 124, 0.4)",
      "&:hover": {
        background: isDarkTheme ? "#63a4ff" : "#03427C",
        transform: "translateY(-2px)",
        boxShadow: isDarkTheme
          ? "0 6px 20px rgba(144, 202, 249, 0.6)"
          : "0 6px 20px rgba(3, 66, 124, 0.6)",
      },
    },
    modal: {
      "& .MuiDialog-paper": {
        borderRadius: "16px",
        padding: "1.5rem",
        backgroundColor: isDarkTheme ? "#2d3748" : "white",
        boxShadow: isDarkTheme
          ? "0 12px 24px rgba(0,0,0,0.5)"
          : "0 12px 24px rgba(0,0,0,0.2)",
        animation: `${fadeIn} 0.3s ease-out`,
      },
    },
    modalTitle: {
      fontFamily: "Montserrat, sans-serif",
      color: isDarkTheme ? "#90CAF9" : "#03427C",
      fontSize: "1.5rem",
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: "1px",
      textAlign: "center",
      marginBottom: "1.5rem",
      borderBottom: `3px solid ${isDarkTheme ? "#90CAF9" : "#03427C"}`,
      paddingBottom: "0.75rem",
    },
    textField: {
      marginBottom: "1.5rem",
      "& label": {
        fontFamily: "Montserrat, sans-serif",
        color: isDarkTheme ? "#cbd5e0" : undefined,
        fontSize: "0.95rem",
      },
      "& input, & textarea": {
        fontFamily: "Montserrat, sans-serif",
        color: isDarkTheme ? "#ffffff" : undefined,
        fontSize: "1rem",
        padding: "0.75rem",
      },
      "& .MuiOutlinedInput-root": {
        borderRadius: "8px",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-1px)",
        },
        "& fieldset": {
          borderColor: isDarkTheme ? "rgba(255, 255, 255, 0.23)" : undefined,
          transition: "border-color 0.3s ease",
        },
        "&:hover fieldset": {
          borderColor: isDarkTheme ? "rgba(255, 255, 255, 0.5)" : undefined,
        },
        "&.Mui-focused fieldset": {
          borderColor: isDarkTheme ? "#90CAF9" : "#03427C",
          borderWidth: "2px",
        },
      },
    },
    dialogActions: {
      padding: "1rem",
      "& .MuiButton-text": {
        color: isDarkTheme ? "#90CAF9" : undefined,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-1px)",
        },
      },
    },
    captchaContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '1.5rem',
      minHeight: '78px',
      transition: 'all 0.3s ease',
      animation: `${fadeIn} 0.5s ease-out`,
    },
    noFaqsMessage: {
      marginTop: "2rem",
      color: isDarkTheme ? "#cbd5e0" : "#777",
      fontSize: "1.1rem",
      textAlign: "center",
      fontFamily: "Montserrat, sans-serif",
      animation: `${fadeIn} 0.5s ease-out`,
      padding: "2rem",
      border: `2px dashed ${isDarkTheme ? "#4a5568" : "#ccc"}`,
      borderRadius: "12px",
    },
    loadingSpinner: {
      marginTop: "2rem",
      color: isDarkTheme ? "#90CAF9" : "#03427C",
      animation: `${fadeIn} 0.5s ease-out`,
    },
  };

  return (
    <Box sx={styles.container}>
      {/* Enhanced Animated Title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          color: isDarkMode ? '#ffffff' : '#03427C',
          textTransform: 'uppercase',
          fontFamily: 'Montserrat, sans-serif',
          letterSpacing: '2px',
          position: 'relative',
          display: 'inline-block',
          paddingBottom: '0.5rem',
          borderBottom: `4px solid ${isDarkMode ? '#fff' : '#03427C'}`,
          textShadow: '2px 2px 5px rgba(0,0,0,0.2)',
          textAlign: 'center',
          width: '45%',
          mb: 2
        }}
      >
        Preguntas Frecuentes
      </Typography>

      {/* FAQs Container with Animation */}
      <Box
        sx={{
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto',
          animation: `${fadeIn} 0.8s ease-out`
        }}
      >
        {loadingFaqs ? (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 4,
            animation: `${pulseAnimation} 2s infinite`
          }}>
            <CircularProgress sx={styles.loadingSpinner} />
          </Box>
        ) : faqs.length > 0 ? (
          faqs.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expandedPanel === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
              sx={{
                ...styles.accordion,
                animation: `${slideFromRight} ${0.3 + index * 0.1}s ease-out`
              }}
              TransitionProps={{ unmountOnExit: true }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon
                    sx={{
                      color: isDarkTheme ? "#90CAF9" : "#03427C",
                      transition: 'all 0.3s ease',
                      transform: expandedPanel === `panel${index}` ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                }
              >
                <Typography sx={styles.question}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={styles.answer}>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography sx={styles.noFaqsMessage}>
            No hay preguntas frecuentes disponibles.
          </Typography>
        )}
      </Box>

      {/* Animated Ask Button */}
      <Button
        variant="contained"
        startIcon={<EmailIcon />}
        onClick={() => setOpenModal(true)}
        sx={{
          background: isDarkTheme ? "#90CAF9" : "#03427C",
          color: isDarkTheme ? "#000000" : "white",
          fontFamily: "Montserrat, sans-serif",
          padding: "0.75rem 2rem",
          borderRadius: "30px",
          textTransform: "none",
          fontSize: "1.1rem",
          fontWeight: 500,
          transition: "all 0.3s ease",
          animation: `${pulseAnimation} 2s infinite`,
          boxShadow: isDarkTheme
            ? "0 4px 15px rgba(144, 202, 249, 0.4)"
            : "0 4px 15px rgba(3, 66, 124, 0.4)",
          "&:hover": {
            background: isDarkTheme ? "#63a4ff" : "#03427C",
            transform: "translateY(-2px)",
            boxShadow: isDarkTheme
              ? "0 6px 20px rgba(144, 202, 249, 0.6)"
              : "0 6px 20px rgba(3, 66, 124, 0.6)",
          },
        }}
      >
        ¿Tienes una duda?
      </Button>

      {/* Enhanced Modal with Animations */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          ...styles.modal,
          '& .MuiDialog-paper': {
            ...styles.modal['& .MuiDialog-paper'],
            animation: `${fadeIn} 0.4s ease-out`
          }
        }}
      >
        <DialogTitle sx={styles.modalTitle}>
          Hacer una pregunta
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            sx={{
              mt: 2,
              '& > *': {
                animation: `${slideFromRight} 0.5s ease-out`
              }
            }}
          >
            <TextField
              name="email"
              label="Correo electrónico"
              fullWidth
              value={formData.email}
              onChange={handleFormChange}
              onBlur={checkEmailInDatabase}
              required
              type="email"
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
              {isCaptchaLoading ? (
                <CircularProgress size={24} />
              ) : (
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6Lc74mAqAAAAAL5MmFjf4x0PWP9MtBNEy9ypux_h"
                  onChange={handleCaptchaChange}
                  onExpired={() => {
                    setCaptchaValue(null);
                    setErrorMessage("⚠ El captcha ha expirado. Complétalo nuevamente.");
                    if (recaptchaRef.current) {
                      setTimeout(() => recaptchaRef.current.reset(), 1000);
                    }
                  }}
                  onError={() => {
                    setErrorMessage("❌ Error al cargar el captcha. Inténtalo de nuevo.");
                    setIsCaptchaLoading(true); // Forzar recarga del captcha
                  }}
                  theme={isDarkTheme ? 'dark' : 'light'}
                />
              )}
            </Box>

          </Box>
        </DialogContent>

        <DialogActions sx={styles.dialogActions}>
          <Button
            onClick={() => setOpenModal(false)}
            sx={{
              ...styles.dialogActions['& .MuiButton-text'],
              fontFamily: "Montserrat, sans-serif"
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.captchaVerified}
            sx={{
              background: isDarkTheme ? "#90CAF9" : "#03427C",
              color: isDarkTheme ? "#000000" : "white",
              fontFamily: "Montserrat, sans-serif",
              transition: 'all 0.3s ease',
              '&:hover': {
                background: isDarkTheme ? "#63a4ff" : "#02315E",
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(3, 66, 124, 0.4)'
              },
              '&:disabled': {
                background: isDarkTheme ? "#4a5568" : "#cccccc"
              }
            }}
          >
            Enviar
          </Button>
        </DialogActions>
      </Dialog>

      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        onClose={handleNotificationClose}
      />
    </Box>
  );
};
export default FAQ;
