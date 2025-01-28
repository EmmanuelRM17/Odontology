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

const FAQ = () => {
  const [expandedPanel, setExpandedPanel] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    question: "",
  });

  useEffect(() => {
    const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    setIsDarkTheme(matchDarkTheme.matches);
  
    const handleThemeChange = (e) => {
      setIsDarkTheme(e.matches);
    };
  
    matchDarkTheme.addEventListener('change', handleThemeChange);
  
    return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
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

  const handleSubmit = () => {
    console.log("Formulario enviado:", formData);
    setFormData({ name: "", email: "", question: "" });
    setOpenModal(false);
  };

  const faqs = [
    {
      question: "¿Qué tipos de tratamientos dentales ofrecen?",
      answer:
        "Ofrecemos una amplia gama de tratamientos que incluyen limpieza dental, blanqueamiento y ortodoncia.",
    },
    {
      question: "¿Cuánto tiempo dura una limpieza dental profesional?",
      answer:
        "Una limpieza dental profesional típicamente dura entre 45 minutos y una hora, dependiendo del estado de tu salud bucal y la cantidad de sarro acumulado.",
    },
    {
      question: "¿Con qué frecuencia debo visitar al dentista?",
      answer:
        "Recomendamos visitas de control y limpieza cada 6 meses. Sin embargo, si tienes problemas específicos, podríamos sugerir visitas más frecuentes.",
    },
    {
      question: "¿Atienden emergencias dentales?",
      answer:
        "Sí, ofrecemos servicio de emergencias dentales. Contamos con horarios flexibles y disponibilidad para atender casos urgentes como dolor severo, traumatismos o infecciones.",
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer:
        "Aceptamos efectivo y ofrecemos planes de financiamiento para tratamientos extensos.",
    },
    {
      question: "¿Cuánto tiempo dura un tratamiento de ortodoncia?",
      answer:
        "La duración del tratamiento de ortodoncia varía según cada caso, pero generalmente puede durar entre 18 y 24 meses. Durante la consulta inicial, podemos darte un estimado más preciso.",
    },
  ];

  const styles = {
    container: {
      background: isDarkTheme
        ? "linear-gradient(135deg, #1C2A38, #1C2A38)"
        : "linear-gradient(35deg, #ffffff, #E5F3FD)",
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

      {faqs.map((faq, index) => (
        <Accordion
          key={index}
          expanded={expandedPanel === `panel${index}`}
          onChange={handleChange(`panel${index}`)}
          sx={styles.accordion}
        >
          <AccordionSummary
            expandIcon={
              <ExpandMoreIcon
                sx={{ color: isDarkTheme ? "#90CAF9" : "#0077CC" }}
              />
            }
          >
            <Typography sx={styles.question}>{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography sx={styles.answer}>{faq.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}

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
          <TextField
            name="name"
            label="Nombre"
            fullWidth
            value={formData.name}
            onChange={handleFormChange}
            sx={styles.textField}
            required
          />
          <TextField
            name="email"
            label="Correo electrónico"
            fullWidth
            value={formData.email}
            onChange={handleFormChange}
            sx={styles.textField}
            required
            type="email"
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