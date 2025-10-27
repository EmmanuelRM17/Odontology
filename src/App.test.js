import { render, screen } from '@testing-library/react';
import App from './App';

test('renderiza el componente App con título', () => {
  render(<App />);
  expect(screen.getByText('_')).toBeInTheDocument(); // Verifica el texto '_'
});