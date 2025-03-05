import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Container, Box, Card, Typography, CircularProgress, Dialog } from "@mui/material";
import axios from "axios";
import DetalleCitaPaciente from "./DetalleCitaPaciente";
import Notificaciones from "../../../components/Layout/Notificaciones";  // Importamos el componente de notificaciones
import { useThemeContext } from '../../../components/Tools/ThemeContext'; // Importamos el useThemeContext

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
  showMore: (total) => `+${total} más`, 
};

const labelColors = ["#FF5733", "#3357FF", "#FF33A8", "#FF8C00", "#9C27B0", "#FF4500", "#1E90FF"];

const CalendarioAgenda = () => {
  const { isDarkTheme } = useThemeContext();  // Usamos el contexto para obtener el tema actual
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCita, setSelectedCita] = useState(null);
  const [openNotification, setOpenNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("error");
  const [openDialog, setOpenDialog] = useState(false);

  const fetchEvents = () => {
    axios
      .get("https://back-end-4803.onrender.com/api/calendario/agenda")
      .then((response) => {
        const formattedEvents = response.data.map((event) => {
          const startDate = moment(event.fecha_consulta, "YYYY-MM-DD HH:mm:ss").toDate();
          const duration = parseInt(event.duration.split("-")[1].trim());
          const endDate = new Date(startDate.getTime() + duration * 60000);

          const randomColor = labelColors[Math.floor(Math.random() * labelColors.length)];

          return {
            id: event.cita_id,
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
    fetchEvents(); 
    const interval = setInterval(fetchEvents, 30000); 

    return () => clearInterval(interval); 
  }, []);

  const handleSelectEvent = (event) => {
    setLoading(true);  // Activa la animación de carga
    axios
      .get(`https://back-end-4803.onrender.com/api/calendario/agenda/${event.id}`)
      .then((response) => {
        setSelectedCita(response.data);
        setOpenDialog(true);
        setLoading(false);  // Detiene la animación de carga cuando se obtienen los datos
      })
      .catch((error) => {
        setLoading(false);  // Detiene la animación de carga
        setNotificationMessage("No fue posible obtener el detalle. Intente más tarde.");
        setNotificationType("error");
        setOpenNotification(true);  // Muestra el mensaje de error
      });
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.color,
        color: "white",
        fontSize: "15px",
        padding: "3px", 
        borderRadius: "3px", 
        border: "none",
        minHeight: "15px", 
      },
    };
  };

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
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: isDarkTheme ? "#001f3d" : "#f0f0f0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999, // Asegura que esté por encima de otros elementos
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={80} thickness={5} />
          <Typography variant="h6" sx={{ mt: 2, color: isDarkTheme ? "#ffffff" : "#333" }}>
            Cargando eventos...
          </Typography>
        </Box>
      </Box>
    );
  }
  
  return (
    <>
    {/* Fondo fuera del container */}
    <Box 
      sx={{
        position: "absolute", 
        top: 0, 
        left: 0, 
        width: "100%", 
        height: "150%", 
        backgroundColor: isDarkTheme ? "#001f3d" : "#f0f0f0", 
        zIndex: -1,  // Asegura que este div quede detrás del contenido
      }} 
    />
    <Container maxWidth="lg">
      <Box mt={8}>
        <Card elevation={4} sx={{
          padding: 3, 
          borderRadius: "12px", 
          backgroundColor: isDarkTheme ? "#001f3d" : "#ffffff",  // Fondo cambia según el tema
        }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: isDarkTheme ? "#ffffff" : "#0d47a1",  // Color del texto cambia según el tema
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
                color: isDarkTheme ? "#ffffff" : "#0D47A1",  // Colores cambian según el tema
                textAlign: "center",
                textTransform: "uppercase",
                paddingBottom: "10px",
              },
              "& .rbc-header": {
                fontSize: "15px",
                fontWeight: "bold",
                color: isDarkTheme ? "#ffffff" : "#0D47A1", // Colores cambian según el tema
                textTransform: "uppercase",
              },
            }}
          >
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              views={["month", "week", "day"]}
              eventPropGetter={eventStyleGetter}
              dayPropGetter={dayPropGetter}
              style={{ height: 600, marginTop: 10, fontSize: "15px" }}
              messages={messages}
              onSelectEvent={handleSelectEvent}
            />
          </Box>
        </Card>
      </Box>

      {/* Notificación de error */}
      <Notificaciones
        open={openNotification}
        message={notificationMessage}
        type={notificationType}
        handleClose={() => setOpenNotification(false)}
      />

    
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DetalleCitaPaciente open={openDialog} onClose={() => setOpenDialog(false)} cita={selectedCita} />
      </Dialog>
    </Container>
    </>
  );
};

export default CalendarioAgenda;
