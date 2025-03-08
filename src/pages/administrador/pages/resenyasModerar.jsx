import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Box,
  Typography,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Rating,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import {
  Delete,
  CheckCircle,
  Cancel,
  ArrowBack,
  ArrowForward,
  Visibility,
} from "@mui/icons-material";

const ModeracionServicios = () => {
  // Elimina el array estático y usa un estado vacío inicialmente
  const [reviews, setReviews] = useState([]);
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [selectedComment, setSelectedComment] = useState({ usuario: "", comentario: "" });
  // Paginación y filtros
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [starFilter, setStarFilter] = useState("all");

  // Dialog y snackbar
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [dialogAction, setDialogAction] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // 1. Cargar datos desde el backend al montar el componente
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          "https://back-end-4803.onrender.com/api/resenya/get"
        );
        if (!response.ok) {
          throw new Error("Error al obtener reseñas");
        }
        const data = await response.json();
  
        const mappedReviews = data.map((item) => ({
          id: item.reseñaId,
          usuario: `${item.nombre} ${item.aPaterno} ${item.aMaterno}`,
          comentario: item.comentario,
          estado: item.estado,
          calificacion: item.calificacion,
          fecha: item.fecha_creacion, // Puedes formatearla si lo deseas
        }));
  
        setReviews(mappedReviews);
      } catch (error) {
        console.error("Error al obtener reseñas:", error);
      }
    };
  
    // Llamar a la función inmediatamente
    fetchReviews();
  
    // Establecer intervalo para actualizar cada 1 segundo
    const intervalId = setInterval(fetchReviews, 1000);
  
    // Limpiar el intervalo cuando el componente se desmonta
    return () => clearInterval(intervalId);
  }, []);
  
  // Handlers para filtros
  const handleSearch = (event) => setSearch(event.target.value);
  const handleFilter = (event, newFilter) => {
    if (newFilter !== null) setFilter(newFilter);
  };
  const handleStarFilter = (event) => setStarFilter(event.target.value);

  // Abrir diálogo de confirmación (para eliminar o habilitar/deshabilitar)
  const handleOpenDialog = (review, action) => {
    setSelectedReview(review);
    setDialogAction(
      action === "habilitar/deshabilitar"
        ? review.estado === "Habilitado"
          ? "deshabilitar"
          : "habilitar"
        : action
    );
    setOpenDialog(true);
  };

  // 2. Realizar la acción de habilitar/deshabilitar o eliminar en el backend
  const handleConfirmAction = async () => {
    if (dialogAction === "eliminar") {
      // Eliminar reseña
      try {
        const response = await fetch(
          `https://back-end-4803.onrender.com/api/resenya/eliminar/${selectedReview.id}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          throw new Error("Error al eliminar la reseña");
        }
        // Actualizar estado en frontend
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review.id !== selectedReview.id)
        );
        setSnackbarMessage(`Reseña de "${selectedReview.usuario}" eliminada.`);
      } catch (error) {
        console.error(error);
        setSnackbarMessage("Ocurrió un error al eliminar la reseña.");
      }
    } else if (
      dialogAction === "habilitar" ||
      dialogAction === "deshabilitar"
    ) {
      // Habilitar/Deshabilitar reseña
      const nuevoEstado =
        dialogAction === "habilitar" ? "Habilitado" : "Deshabilitado";
      try {
        const response = await fetch(
          `https://back-end-4803.onrender.com/api/resenya/estado/${selectedReview.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ estado: nuevoEstado }),
          }
        );
        if (!response.ok) {
          throw new Error("Error al actualizar estado de la reseña");
        }
        // Actualizar estado en frontend
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === selectedReview.id
              ? { ...review, estado: nuevoEstado }
              : review
          )
        );
        setSnackbarMessage(
          `Reseña de "${selectedReview.usuario}" ${
            dialogAction === "habilitar" ? "habilitada" : "deshabilitada"
          }.`
        );
      } catch (error) {
        console.error(error);
        setSnackbarMessage("Ocurrió un error al actualizar el estado.");
      }
    }
    setOpenDialog(false);
    setSnackbarOpen(true);
  };

  // Filtrado de reseñas
  const filteredReviews = useMemo(() => {
    return reviews
      .filter((review) =>
        review.usuario.toLowerCase().includes(search.toLowerCase())
      )
      .filter((review) =>
        filter === "habilitados"
          ? review.estado === "Habilitado"
          : filter === "deshabilitados"
          ? review.estado === "Deshabilitado"
          : true
      )
      .filter((review) =>
        starFilter === "all"
          ? true
          : review.calificacion === parseInt(starFilter)
      );
  }, [reviews, search, filter, starFilter]);

   // Función para abrir el `Dialog` con el comentario seleccionado
   const handleOpenCommentDialog = (review) => {
    setSelectedComment({ usuario: review.usuario, comentario: review.comentario });
    setOpenCommentDialog(true);
  };

  // Función para cerrar el `Dialog`
  const handleCloseCommentDialog = () => {
    setOpenCommentDialog(false);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        📑 Moderación de Reseñas
      </Typography>

      <TextField
        label="Buscar reseña por usuario"
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        value={search}
        onChange={handleSearch}
      />

      <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
        <ToggleButtonGroup value={filter} exclusive onChange={handleFilter}>
          <ToggleButton value="all">Todos</ToggleButton>
          <ToggleButton value="habilitados">Habilitados</ToggleButton>
          <ToggleButton value="deshabilitados">Deshabilitados</ToggleButton>
        </ToggleButtonGroup>

        <Box display="flex" alignItems="center">
      <Typography variant="body1" sx={{ mr: 1 }}>⭐ Filtrar</Typography>
        <FormControl sx={{ minWidth: 140 }}>
          <Select value={starFilter} onChange={handleStarFilter}>
          <MenuItem value="all">Todas</MenuItem>
         {[5, 4, 3, 2, 1].map((stars) => (
         <MenuItem key={stars} value={stars}>
          {"★".repeat(stars) + "☆".repeat(5 - stars)}
          </MenuItem>
         ))}
        </Select>
        </FormControl>
      </Box>

      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#B3D9FF" }}>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Comentario</TableCell>
              <TableCell>Calificación</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
  {filteredReviews.length > 0 ? (
    filteredReviews
      .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
      .map((review) => (
        <TableRow key={review.id}>
          <TableCell>{review.usuario}</TableCell>

          {/* 🔍 Mostrar preview del comentario sin icono */}
          <TableCell>
            <Typography variant="body2" noWrap sx={{ maxWidth: "150px", display: "inline-block" }}>
              {review.comentario.slice(0, 20)}...
            </Typography>
          </TableCell>

          <TableCell>
            <Rating value={review.calificacion} readOnly />
          </TableCell>
          <TableCell>{review.estado}</TableCell>
          <TableCell align="center">
            {/* 🔍 Tooltip para "Ver reseña" */}
            <Tooltip title="Ver reseña">
              <IconButton onClick={() => handleOpenCommentDialog(review)} sx={{ mx: 1 }}>
                <Visibility color="primary" />
              </IconButton>
            </Tooltip>

            {/* 🔄 Tooltip para "Habilitar/Deshabilitar reseña" */}
            <Tooltip title={review.estado === "Habilitado" ? "Deshabilitar reseña" : "Habilitar reseña"}>
              <IconButton onClick={() => handleOpenDialog(review, "habilitar/deshabilitar")}>
                {review.estado === "Habilitado" ? <CheckCircle color="success" /> : <Cancel color="error" />}
              </IconButton>
            </Tooltip>

            {/* 🗑️ Tooltip para "Eliminar reseña" */}
            <Tooltip title="Eliminar reseña">
              <IconButton onClick={() => handleOpenDialog(review, "eliminar")} color="error">
                <Delete />
              </IconButton>
            </Tooltip>
          </TableCell>
        </TableRow>
      ))
  ) : (
    <TableRow>
      <TableCell colSpan={5} align="center">
        <Typography variant="h6" sx={{ color: "gray", py: 2 }}>
          No hay reseñas disponibles
        </Typography>
      </TableCell>
    </TableRow>
  )}
</TableBody>

    {/*Dialog para ver la reseña completa */}
  <Dialog open={openCommentDialog} onClose={handleCloseCommentDialog} fullWidth maxWidth="sm">
  <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
    Reseña de {selectedComment.usuario}
  </DialogTitle>
    <DialogContent>
      <Typography variant="body1" sx={{ textAlign: "justify", mt: 2 }}>
        {selectedComment.comentario}
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleCloseCommentDialog} color="primary">
        Cerrar
      </Button>
    </DialogActions>
    </Dialog>

        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="center" mt={2}>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#90CAF9", color: "white", mx: 1 }}
          startIcon={<ArrowBack />}
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#90CAF9", color: "white", mx: 1 }}
          endIcon={<ArrowForward />}
          disabled={(page + 1) * rowsPerPage >= filteredReviews.length}
          onClick={() => setPage(page + 1)}
        >
          Siguiente
        </Button>
      </Box>

      {/* Diálogo de confirmación */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que deseas {dialogAction} la reseña de "{selectedReview?.usuario}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleConfirmAction} color="error">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de notificaciones */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="info"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ModeracionServicios;
