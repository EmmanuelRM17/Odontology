import React from "react";
import { Chart } from "react-google-charts";

export const data = [
  ["Tratamiento", "Cantidad"],
  ["Limpieza Dental", 45],
  ["Extracción", 30],
  ["Ortodoncia", 25],
  ["Implantes", 15],
  ["Blanqueamiento", 20],
];

const options = {
  title: "Tratamientos más Realizados",
  pieHole: 0.4, // Gráfico de dona
  is3D: false,
};

const Dashboard = () => {
  return (
    <div style={{ width: "100%", height: "400px", textAlign: "center" }}>
      <h2>Panel de la Clínica Odontológica</h2>
      <Chart chartType="PieChart" width="100%" height="400px" data={data} options={options} />
    </div>
  );
};

export default Dashboard;
