import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Container, Box, Card, Typography } from "@mui/material";
import axios from "axios";

moment.locale("es");
const localizer = momentLocalizer(moment);

const messages = {
  today: "Hoy",
  previous: "Anterior",
  next: "Siguiente",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Agenda",
  date: "Fecha",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "No hay eventos en este período",
  showMore: (total) => `+${total} más`, // Traduce "+X more" a "+X más"
};

// Nueva lista de colores (sin el verde y con dos nuevos colores)
const labelColors = ["#FF5733", "#3357FF", "#FF33A8", "#FF8C00", "#9C27B0", "#FF4500", "#1E90FF"];

const CalendarioAgenda = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = () => {
    axios
      .get("https://back-end-4803.onrender.com/api/calendario/agenda")
      .then((response) => {
        const formattedEvents = response.data.map((event) => {
          const startDate = moment(event.fecha_consulta, "YYYY-MM-DD HH:mm:ss").toDate();
          const duration = parseInt(event.duration.split("-")[1].trim()); // Duración en minutos
          const endDate = new Date(startDate.getTime() + duration * 60000);

          // Asignar color aleatorio
          const randomColor = labelColors[Math.floor(Math.random() * labelColors.length)];

          return {
            title: event.servicio_nombre,
            start: startDate,
            end: endDate,
            startTime: moment(startDate).format("YYYY-MM-DD HH:mm"),
            duration: duration,
            color: randomColor,
          };
        });

        setEvents(formattedEvents);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los eventos:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents(); // Carga inicial
    const interval = setInterval(fetchEvents, 30000); // Actualiza cada 30 segundos

    return () => clearInterval(interval); // Limpia el intervalo al desmontar
  }, []);

  // Estilos de los eventos (más pequeños)
  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.color,
        color: "white",
        fontSize: "15px", // Texto más pequeño
        padding: "3px", // Espacio reducido dentro del evento
        borderRadius: "3px", // Bordes más pequeños
        border: "none",
        minHeight: "15px", // Altura mínima reducida
      },
    };
  };

  // Estilos para opacar días pasados
  const dayPropGetter = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      return {
        style: {
          backgroundColor: "#f0f0f0",
          opacity: 0.5,
        },
      };
    }
    return {};
  };

  if (loading) {
    return <Typography variant="h6" sx={{ textAlign: "center", marginTop: 10 }}>Cargando eventos...</Typography>;
  }

  return (
    <Container maxWidth="lg">
    <Box mt={8}>
      <Card elevation={4} sx={{ padding: 3, borderRadius: "12px" }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "#0d47a1",
            mb: 2,
            textAlign: "center",
            display: "block",
            fontSize: "20px",
          }}
        >
          📅 Agenda de Citas - Odontología
        </Typography>
        <Box
          sx={{
            "& .rbc-toolbar": {
              fontSize: "17px",
              fontWeight: "bold",
              color: "#0D47A1",
              textAlign: "center",
              textTransform: "uppercase",
              paddingBottom: "10px",
            },
            "& .rbc-header": {
              fontSize: "15px",
              fontWeight: "bold",
              color: "#0D47A1",
              textTransform: "uppercase",
            },
          }}
        >
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={["month", "week", "day"]} // Manteniendo todas las vistas
            eventPropGetter={eventStyleGetter}
            dayPropGetter={dayPropGetter}
            style={{ height: 600, marginTop: 10, fontSize: "15px" }}
            messages={messages}
          />
        </Box>
      </Card>
    </Box>
  </Container>
  
  );
};

export default CalendarioAgenda;
