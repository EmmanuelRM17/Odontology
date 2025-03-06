import React, { useState, useMemo } from "react";
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
} from "@mui/material";
import { Delete, CheckCircle, Cancel, ArrowBack, ArrowForward } from "@mui/icons-material";

const initialReviews = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  usuario: `Usuario ${i + 1}`,
  comentario: `Comentario de prueba ${i + 1}`,
  estado: i % 2 === 0 ? "Habilitado" : "Deshabilitado",
  calificacion: Math.floor(Math.random() * 5) + 1,
  fecha: `2024-03-${String(i + 1).padStart(2, "0")}`,
}));

const ModeracionServicios = () => {
  const [reviews, setReviews] = useState(initialReviews);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [starFilter, setStarFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [dialogAction, setDialogAction] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleSearch = (event) => setSearch(event.target.value);
  const handleFilter = (event, newFilter) => {
    if (newFilter !== null) setFilter(newFilter);
  };
  const handleStarFilter = (event) => setStarFilter(event.target.value);

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

  const handleConfirmAction = () => {
    if (dialogAction === "eliminar") {
      setReviews(reviews.filter((review) => review.id !== selectedReview.id));
      setSnackbarMessage(`Reseña de "${selectedReview.usuario}" eliminada.`);
    } else if (dialogAction === "habilitar" || dialogAction === "deshabilitar") {
      setReviews(
        reviews.map((review) =>
          review.id === selectedReview.id
            ? { ...review, estado: review.estado === "Habilitado" ? "Deshabilitado" : "Habilitado" }
            : review
        )
      );
      setSnackbarMessage(
        `Reseña de "${selectedReview.usuario}" ${dialogAction === "habilitar" ? "habilitada" : "deshabilitada"}.`
      );
    }
    setOpenDialog(false);
    setSnackbarOpen(true);
  };

  const filteredReviews = useMemo(() => {
    return reviews
      .filter((review) => review.usuario.toLowerCase().includes(search.toLowerCase()))
      .filter((review) =>
        filter === "habilitados"
          ? review.estado === "Habilitado"
          : filter === "deshabilitados"
          ? review.estado === "Deshabilitado"
          : true
      )
      .filter((review) => (starFilter === "all" ? true : review.calificacion === parseInt(starFilter)));
  }, [reviews, search, filter, starFilter]);

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

        <FormControl sx={{ minWidth: 140, ml: 2 }}>
          <InputLabel>⭐ Filtrar</InputLabel>
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
            {filteredReviews.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((review) => (
              <TableRow key={review.id}>
                <TableCell>{review.usuario}</TableCell>
                <TableCell>{review.comentario}</TableCell>
                <TableCell><Rating value={review.calificacion} readOnly /></TableCell>
                <TableCell>{review.estado}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleOpenDialog(review, "habilitar/deshabilitar")}>
                    {review.estado === "Habilitado" ? <CheckCircle color="success" /> : <Cancel color="error" />}
                  </IconButton>
                  <IconButton onClick={() => handleOpenDialog(review, "eliminar")} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="center" mt={2}>
        <Button variant="contained" sx={{ backgroundColor: "#90CAF9", color: "white", mx: 1 }} startIcon={<ArrowBack />} disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button>
        <Button variant="contained" sx={{ backgroundColor: "#90CAF9", color: "white", mx: 1 }} endIcon={<ArrowForward />} disabled={(page + 1) * rowsPerPage >= filteredReviews.length} onClick={() => setPage(page + 1)}>Siguiente</Button>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmación</DialogTitle>
        <DialogContent><DialogContentText>¿Seguro que deseas {dialogAction} la reseña de "{selectedReview?.usuario}"?</DialogContentText></DialogContent>
        <DialogActions><Button onClick={() => setOpenDialog(false)}>Cancelar</Button><Button onClick={handleConfirmAction} color="error">Confirmar</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModeracionServicios;
