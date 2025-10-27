import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import PacientesTab from './PacientesTab.jsx';

// Mock axios
jest.mock('axios');

// Mock the showNotif prop
const mockShowNotif = jest.fn();

const mockColors = {
  primary: '#3f51b5',
  primaryDark: '#303f9f',
  success: '#4caf50',
  warning: '#ff9800',
  text: '#212121',
  secondaryText: '#757575',
  gradient: 'linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)',
  gradientAlt: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
  gradientWarning: 'linear-gradient(135deg, #ff9800 0%, #ffb300 100%)',
  cardBg: '#ffffff',
  border: '#e0e0e0',
  shadow: '0 4px 20px rgba(0,0,0,0.1)',
  paper: '#f5f5f5',
  glassBlur: 'blur(10px)',
};

const mockPacientesData = [
  {
    id_paciente: 1,
    nombre_completo: 'Juan Perez',
    email: 'juan@example.com',
    nivel: 5,
    puntos_disponibles: 100,
    puntos_totales: 500,
  },
  {
    id_paciente: 2,
    nombre_completo: 'Maria Gomez',
    email: 'maria@example.com',
    nivel: 3,
    puntos_disponibles: 50,
    puntos_totales: 200,
  },
];

describe('Pacientes Gammificacion -  Endpoint Data Obtencion de datos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockReset();
  });

  test('fetches and displays pacientes data correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockPacientesData });

    render(
      <PacientesTab
        colors={mockColors}
        isMobile={false}
        isTablet={false}
        showNotif={mockShowNotif}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Juan Perez')).toBeInTheDocument();
     
    });
  });

  test('displays no pacientes message when data is empty', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <PacientesTab
        colors={mockColors}
        isMobile={false}
        isTablet={false}
        showNotif={mockShowNotif}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No hay pacientes registrados')).toBeInTheDocument();
      
    });
  });

  test('handles pacientes API error gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('Error fetching pacientes'));

    render(
      <PacientesTab
        colors={mockColors}
        isMobile={false}
        isTablet={false}
        showNotif={mockShowNotif}
      />
    );

    await waitFor(() => {
      expect(mockShowNotif).toHaveBeenCalledWith('Error al cargar pacientes', 'error');
     
    });
  });
});