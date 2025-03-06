import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import { motion } from "framer-motion";
import axios from "axios";
import { Card, CardContent, Typography, Box } from "@mui/material";

const optionsTratamientos = {
  title: "🦷 Servicios Odontológicos Realizados",
  pieHole: 0.4,
  is3D: false,
};

const optionsIngresos = {
  title: "💰 Ingresos Mensual y Anual de los Servicios Odontológicos",
  curveType: "function",
  hAxis: { title: "Mes" },
  vAxis: { title: "Ingresos" },
  legend: { position: "bottom" },
};

const dataIngresos = [
  ["Mes", "Ingresos"],
  ["Enero", 5000],
  ["Febrero", 6000],
  ["Marzo", 7000],
  ["Abril", 5500],
  ["Mayo", 6200],
  ["Junio", 5800],
  ["Julio", 7200],
  ["Agosto", 6800],
  ["Septiembre", 6500],
  ["Octubre", 7100],
  ["Noviembre", 6900],
  ["Diciembre", 7500],
];

const Dashboard = () => {
  const [dataTratamientos, setDataTratamientos] = useState([["Servicio", "Cantidad"]]);

  const fetchData = () => {
    axios
      .get("https://back-end-4803.onrender.com/api/Graficas/topservicios")
      .then((response) => {
        const formattedData = [["Servicio", "Cantidad"]];
        response.data.forEach((item) => {
          formattedData.push([item.servicio_nombre, item.total_realizados]);
        });
        setDataTratamientos(formattedData);
      })
      .catch((error) => {
        console.error("Error obteniendo datos de tratamientos:", error);
      });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      style={{ width: "100%", textAlign: "center", padding: "16px" }}
    >
     <Box sx={{ backgroundColor: "#1E3A8A", color: "white", padding: 1, borderRadius: 2, display: "block", width: "100%", margin: "0 auto" }}>
        <Typography variant="h5">
          📊 Panel de la Odontología Carol
        </Typography>
      </Box>

      <Box display="grid" gridTemplateColumns="1fr" gap={4}>
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ backgroundColor: "#1E3A8A", color: "white", padding: 1, borderRadius: 1, mb: 2, textAlign: "center" }}>
              <Typography variant="h6">🦷 Servicios Odontológicos Realizados</Typography>
            </Box>
            <Chart
              chartType="PieChart"
              width="100%"
              height="400px"
              data={dataTratamientos}
              options={optionsTratamientos}
            />
          </CardContent>
        </Card>

        <Card elevation={3}>
          <CardContent>
            <Box sx={{ backgroundColor: "#1E3A8A", color: "white", padding: 1, borderRadius: 1, mb: 2, textAlign: "center" }}>
              <Typography variant="h6">💰 Ingresos Mensual y Anual de los Servicios Odontológicos</Typography>
            </Box>
            <Chart
              chartType="LineChart"
              width="100%"
              height="400px"
              data={dataIngresos}
              options={optionsIngresos}
            />
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );
};

export default Dashboard;
