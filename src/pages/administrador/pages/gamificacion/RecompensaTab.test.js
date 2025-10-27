import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import RecompensaTab from './RecompensaTab.jsx';

// Mock axios
jest.mock('axios');

// Mock de la prop showNotif
const mockShowNotif = jest.fn();

const mockColors = {
  primary: '#3f51b5',
  primaryDark: '#303f9f',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#d32f2f', // Agregado para evitar el TypeError
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

const mockRecompensaData = {
  id: 1,
  nombre: 'Descuento Especial',
  descripcion: '10% de descuento en servicios',
  tipo: 'descuento',
  puntos_requeridos: 100,
  icono: 'gift',
  premio: 'Descuento en próxima cita',
  estado: 1,
};

describe('RecompensaTab - Obtención de Datos del Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockReset();
  });

  test('obtiene y muestra los datos de la recompensa correctamente', async () => {
    axios.get.mockResolvedValueOnce({ data: mockRecompensaData });

    render(
      <RecompensaTab
        colors={mockColors}
        isMobile={false}
        isTablet={false}
        showNotif={mockShowNotif}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Descuento Especial')).toBeInTheDocument();
      
    });
  });

  test('muestra mensaje de no hay recompensa cuando no está configurada', async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 404 } });

    render(
      <RecompensaTab
        colors={mockColors}
        isMobile={false}
        isTablet={false}
        showNotif={mockShowNotif}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No hay recompensa configurada')).toBeInTheDocument();
    
    });
  });

  test('maneja el error de la API de recompensa correctamente', async () => {
    axios.get.mockRejectedValueOnce(new Error('Error al obtener recompensa'));

    render(
      <RecompensaTab
        colors={mockColors}
        isMobile={false}
        isTablet={false}
        showNotif={mockShowNotif}
      />
    );

    await waitFor(() => {
      expect(mockShowNotif).toHaveBeenCalledWith('Error al cargar recompensa', 'error');
    
    });
  });
});