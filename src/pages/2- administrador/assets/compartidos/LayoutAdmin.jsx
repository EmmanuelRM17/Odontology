import React from 'react';
import BarraAdmin from './BarraAdmin'; // Barra de navegación especial para pacientes
import FooterAdmin from './FooterAdmin'; // Pie de página especial para pacientes

const LayoutPaciente = ({ children }) => {
  return (
    <div className="layout-paciente">
      <header>
        <BarraAdmin />
      </header>
      <main className="main-content-paciente">
        {children}
      </main>
      <footer>
        <FooterAdmin />
      </footer>
    </div>
  );
}

export default LayoutPaciente;
