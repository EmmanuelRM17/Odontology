import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import ServiciosTab from './ServiciosTab.jsx';

// Mock axios
jest.mock('axios');


// Mock de la prop showNotif
const mockShowNotif = jest.fn();
 
const mockColors = {
  primary: '#3f51b5',
  primaryDark: '#303f9f',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#d32f2f', // Incluido para evitar TypeError
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

const mockServiciosData = [
  {
    id: 1,
    nombre_servicio: 'Limpieza Dental',
    descripcion_servicio: 'Limpieza profesional de dientes',
    puntos: 50,
    estado: 1,
  },
  {
    id: 2,
    nombre_servicio: 'Blanqueamiento',
    descripcion_servicio: 'Blanqueamiento dental avanzado',
    puntos: 100,
    estado: 0,
  },
];

describe('ServiciosTab - Obtención de Datos del Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockReset();
  });

  test('obtiene y muestra los datos de los servicios correctamente', async () => {
    axios.get.mockResolvedValueOnce({ data: mockServiciosData });

    render(
      <ServiciosTab
        colors={mockColors}
        isMobile={false}
        isTablet={false}
        showNotif={mockShowNotif}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Limpieza Dental')).toBeInTheDocument();
    });
  });

  test('muestra mensaje de no hay servicios cuando no están configurados', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <ServiciosTab
        colors={mockColors}
        isMobile={false}
        isTablet={false}
        showNotif={mockShowNotif}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No hay servicios asignados')).toBeInTheDocument();
    });
  });

  test('maneja el error de la API de servicios correctamente', async () => {
    axios.get.mockRejectedValueOnce(new Error('Error al obtener servicios'));

    render(
      <ServiciosTab
        colors={mockColors}
        isMobile={false}
        isTablet={false}
        showNotif={mockShowNotif}
      />
    );

    await waitFor(() => {
      expect(mockShowNotif).toHaveBeenCalledWith('Error al cargar servicios', 'error');

    });
  });
});