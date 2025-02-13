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
import ReCAPTCHA from "react-google-recaptcha"; // Importar reCAPTCHA
import { useRef } from "react";
import { CircularProgress } from "@mui/material";

const FAQ = () => {
  const [expandedPanel, setExpandedPanel] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [captchaValue, setCaptchaValue] = useState(null);
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(true);
  const recaptchaRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    question: "",
    isRegistered: false, // Indica si el usuario está registrado
    paciente_id: null, // Guardará el ID del paciente si está registrado
    captchaVerified: false, // Verifica si el captcha fue completado
  });

  useEffect(() => {
    const matchDarkTheme = window.matchMedia("(prefers-color-scheme: dark)");

    setIsDarkTheme(matchDarkTheme.matches);

    const handleThemeChange = (e) => {
      setIsDarkTheme(e.matches);
    };

    matchDarkTheme.addEventListener("change", handleThemeChange);

    return () => matchDarkTheme.removeEventListener("change", handleThemeChange);
  }, []);

  //useEffect para obtener las preguntas de la base de datos 
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch(
          "https://back-end-4803.onrender.com/api/preguntas/get-all"
        );

        if (!response.ok) throw new Error("Error al obtener preguntas");

        const data = await response.json();
        setFaqs(data);
      } catch (error) {
        console.error("Error cargando FAQs:", error);
        setFaqs([]); // Si falla, establecer como vacío
      } finally {
        setLoadingFaqs(false);
      }
    };

    fetchFAQs();
  }, []);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Actualiza la función handleCaptchaChange:
  const handleCaptchaChange = (value) => {
    try {
      setCaptchaValue(value);
      setIsCaptchaLoading(false);
      setErrorMessage("");
      setFormData({ ...formData, captchaVerified: true }); // Asegurar que se marca como verificado
    } catch (error) {
      console.error("Error en el captcha:", error);
      setErrorMessage("Error con el captcha. Por favor, inténtalo de nuevo.");
      setFormData({ ...formData, captchaVerified: false });
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    }
  };

  // Verificar si el correo existe en la base de datos
  const checkEmailInDatabase = async () => {
    try {
      const response = await fetch(
        "https://back-end-4803.onrender.com/api/preguntas/verificar-correo",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        }
      );

      if (!response.ok) throw new Error("Error al verificar el correo");

      const data = await response.json();
      if (data.exists) {
        setFormData((prev) => ({
          ...prev,
          name: data.name, // Autocompletar el nombre si existe
          isRegistered: true,
          paciente_id: data.paciente_id, // Guardar el ID del paciente
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          name: "",
          isRegistered: false,
          paciente_id: null,
        }));
      }
    } catch (error) {
      console.error("Error verificando el correo:", error);
    }
  };


  // Enviar la pregunta a la base de datos
  const handleSubmit = async () => {
    const payload = {
      email: formData.email,
      name: formData.name,
      question: formData.question,
      paciente_id: formData.isRegistered ? formData.paciente_id : null,
    };

    try {
      const response = await fetch(
        "https://back-end-4803.onrender.com/api/preguntas/nueva",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Error al enviar la pregunta");

      console.log("Pregunta enviada correctamente");

      // Actualizar las preguntas en la UI sin necesidad de recargar
      setFaqs([...faqs, { question: formData.question, answer: "Pendiente de respuesta" }]);

      setOpenModal(false);
      setFormData({
        email: "",
        name: "",
        question: "",
        isRegistered: false,
        paciente_id: null,
        captchaVerified: false,
      });
    } catch (error) {
      console.error("Error al enviar la pregunta:", error);
    }
  };


  const styles = {
    container: {
      background: isDarkTheme
        ? "linear-gradient(135deg, #1C2A38, #1C2A38)"
        : "linear-gradient(90deg, #ffffff, #E5F3FD)",
      minHeight: "55vh",
      padding: isMobile ? "1rem" : "2rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
    },
    title: {
      marginBottom: "1.5rem",
      color: isDarkTheme ? "#90CAF9" : "#03427C",
      fontSize: isMobile ? "1.5rem" : "1.75rem",
      fontWeight: "bold",
      textAlign: "center",
      fontFamily: "Montserrat, sans-serif",
    },
    accordion: {
      background: isDarkTheme ? "#2d3748" : "white",
      borderRadius: "12px",
      boxShadow: isDarkTheme
        ? "0 4px 6px rgba(0,0,0,0.3)"
        : "0 4px 6px rgba(0,0,0,0.1)",
      margin: "0.5rem 0",
      width: "100%",
      maxWidth: "800px",
    },
    question: {
      fontFamily: "Montserrat, sans-serif",
      fontSize: isMobile ? "0.9rem" : "1rem",
      fontWeight: 500,
      color: isDarkTheme ? "#ffffff" : "#000000",
    },
    answer: {
      fontFamily: "Montserrat, sans-serif",
      fontSize: isMobile ? "0.85rem" : "0.95rem",
      color: isDarkTheme ? "#cbd5e0" : "#555555",
      lineHeight: 1.5,
    },
    askButton: {
      marginTop: "2rem",
      background: isDarkTheme ? "#90CAF9" : "#03427C",
      color: isDarkTheme ? "#000000" : "white",
      fontFamily: "Montserrat, sans-serif",
      "&:hover": {
        background: isDarkTheme ? "#63a4ff" : "#03427C",
      },
    },
    modal: {
      "& .MuiDialog-paper": {
        borderRadius: "12px",
        padding: "1rem",
        backgroundColor: isDarkTheme ? "#2d3748" : "white",
      },
    },
    modalTitle: {
      fontFamily: "Montserrat, sans-serif",
      color: isDarkTheme ? "#90CAF9" : "#03427C",
    },
    textField: {
      marginBottom: "1rem",
      "& label": {
        fontFamily: "Montserrat, sans-serif",
        color: isDarkTheme ? "#cbd5e0" : undefined,
      },
      "& input": {
        fontFamily: "Montserrat, sans-serif",
        color: isDarkTheme ? "#ffffff" : undefined,
      },
      "& textarea": {
        fontFamily: "Montserrat, sans-serif",
        color: isDarkTheme ? "#ffffff" : undefined,
      },
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: isDarkTheme ? "rgba(255, 255, 255, 0.23)" : undefined,
        },
        "&:hover fieldset": {
          borderColor: isDarkTheme ? "rgba(255, 255, 255, 0.5)" : undefined,
        },
      },
    },
    dialogActions: {
      "& .MuiButton-text": {
        color: isDarkTheme ? "#90CAF9" : undefined,
      },
    },
  };

  return (
    <Box sx={styles.container}>
      <Typography variant="h5" component="h1" sx={styles.title}>
        Preguntas Frecuentes
      </Typography>
      {loadingFaqs ? (
        <CircularProgress size={24} sx={{ marginTop: "2rem" }} />
      ) : (
        faqs.length > 0 ? (
          faqs.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expandedPanel === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
              sx={styles.accordion}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon sx={{ color: isDarkTheme ? "#90CAF9" : "#0077CC" }} />
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
          <Typography sx={{ marginTop: "1rem", color: "#777" }}>
            No hay preguntas frecuentes disponibles.
          </Typography>
        )
      )}

      <Button
        variant="contained"
        startIcon={<EmailIcon />}
        onClick={() => setOpenModal(true)}
        sx={styles.askButton}
      >
        ¿Tienes una duda?
      </Button>

      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        sx={styles.modal}
      >
        <DialogTitle sx={styles.modalTitle}>Hacer una pregunta</DialogTitle>
        <DialogContent>
          {/* Campo de correo con validación */}
          <TextField
            name="email"
            label="Correo electrónico"
            fullWidth
            value={formData.email}
            onChange={handleFormChange}
            onBlur={checkEmailInDatabase} // Valida el email cuando pierda el foco
            required
            type="email"
            sx={styles.textField}
          />

          {/* Campo de nombre (deshabilitado si el usuario está registrado) */}
          <TextField
            name="name"
            label="Nombre"
            fullWidth
            value={formData.name}
            onChange={handleFormChange}
            required
            disabled={formData.isRegistered} // Si está registrado, deshabilita el input
            sx={styles.textField}
          />

          {/* Campo para la pregunta */}
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

          {/* ReCAPTCHA */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 3,
            minHeight: '78px'
          }}>
            {isCaptchaLoading ? (
              <CircularProgress size={24} />
            ) : (
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey="6Lc74mAqAAAAAL5MmFjf4x0PWP9MtBNEy9ypux_h"
                onChange={handleCaptchaChange}
                onLoad={() => {
                  setIsCaptchaLoading(false);
                  setErrorMessage('');
                }}
                onError={() => {
                  setIsCaptchaLoading(false);
                  setErrorMessage('Error al cargar el captcha. Por favor, recarga la página.');
                }}
                onExpired={() => {
                  setCaptchaValue(null);
                  setErrorMessage('El captcha ha expirado. Por favor, complétalo nuevamente.');
                }}
                theme={isDarkMode ? 'dark' : 'light'}
              />
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={styles.dialogActions}>
          <Button
            onClick={() => setOpenModal(false)}
            sx={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.captchaVerified} // Deshabilita hasta que se verifique el captcha
            sx={{
              background: isDarkTheme ? "#90CAF9" : "#0077CC",
              color: isDarkTheme ? "#000000" : "white",
              fontFamily: "Montserrat, sans-serif",
              "&:hover": {
                background: isDarkTheme ? "#63a4ff" : "#005fa3",
              },
            }}
          >
            Enviar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

};
export default FAQ;
