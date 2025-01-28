import React from 'react';
import BarraPaciente from './BarraPaciente'; // Barra de navegación especial para pacientes
import FooterPaciente from './FooterPaciente'; // Pie de página especial para pacientes

const LayoutPaciente = ({ children }) => {
  return (
    <div className="layout-paciente">
      <header>
        <BarraPaciente />
      </header>
      <main className="main-content-paciente">
        {children}
      </main>
      <footer>
        <FooterPaciente />
      </footer>
    </div>
  );
}

export default LayoutPaciente;
