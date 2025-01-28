import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Container,
  IconButton,
  Button,
  useTheme,
} from '@mui/material';
import { NavigateBefore, NavigateNext } from '@mui/icons-material';
import { Suspense, lazy } from 'react';

// Importar imágenes locales (puedes asignar imágenes diferentes a cada servicio)
import img1 from '../../../assets/imagenes/img1_1.jpeg';
import img2 from '../../../assets/imagenes/img2_1.jpg';
import img3 from '../../../assets/imagenes/img3_1.png';

// Cargar Ubicación de manera diferida
const Ubicacion = lazy(() => import('./Ubicacion'));

// Configuración de animaciones
const slideVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
  transition: { duration: 0.5 },
};

// Servicios con tratamientos
const services = [
  { title: 'Consulta Dental General', img: img1, description: 'Consulta básica para revisar tu salud bucal.' },
  { title: 'Limpieza Dental por Ultrasonido', img: img2, description: 'Eliminación de placa dental con ultrasonido.' },
  { title: 'Curetaje (Limpieza Profunda)', img: img3, description: 'Limpieza profunda para tratar problemas de encías.' },
  { title: 'Asesoría sobre Diseño de Sonrisa', img: img1, description: 'Diseño de sonrisa personalizado.' },
  { title: 'Cirugía Estética de Encía', img: img2, description: 'Mejora la estética de tus encías.' },
  { title: 'Obturación con Resina', img: img3, description: 'Restauración de dientes dañados por caries con resina.' },
  { title: 'Incrustación Estética y de Metal', img: img1, description: 'Colocación de incrustaciones estéticas o metálicas en dientes.' },
  { title: 'Coronas Fijas Estéticas o de Metal', img: img2, description: 'Coronas fijas para dientes dañados o perdidos.' },
  { title: 'Placas Removibles Parciales', img: img3, description: 'Placas removibles para dientes faltantes.' },
  { title: 'Placas Totales Removibles', img: img1, description: 'Placas removibles para prótesis dentales completas.' },
  { title: 'Guardas Dentales', img: img2, description: 'Protección dental para evitar daño durante la noche.' },
  { title: 'Placas Hawley', img: img3, description: 'Placas ortodónticas para mantener los dientes en su lugar.' },
  { title: 'Extracción Dental', img: img1, description: 'Extracción de dientes problemáticos o innecesarios.' },
  { title: 'Ortodoncia y Ortopedia Maxilar', img: img2, description: 'Tratamientos para corregir la alineación de los dientes y maxilares.' },
];

const Home = () => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  // Funciones para cambiar de servicio
  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % services.length);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + services.length) % services.length);
  }, []);

  // Auto-slide cada 5 segundos
  useEffect(() => {
    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [handleNext]);

  return (
    <Box sx={{ background: theme.palette.background.default, minHeight: '100vh', py: 5 }}>
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        <Typography variant="h3" fontWeight="bold" color="primary" mb={2}>
          Odontología Carol
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" mb={5}>
          Cuidando tu sonrisa con pasión y profesionalismo.
        </Typography>

        {/* Carrusel de Servicios */}
        <Box sx={{ position: 'relative', overflow: 'hidden', width: '100%', maxWidth: 500, mx: 'auto', mb: 5 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={slideVariants}
              style={{ position: 'absolute', width: '100%', textAlign: 'center' }}
            >
              <img
                src={services[activeIndex].img}
                alt={services[activeIndex].title}
                style={{ width: '100%', borderRadius: '10px', objectFit: 'cover', height: '300px' }}
              />
              <Typography variant="h5" fontWeight="bold" color="primary" mt={2}>
                {services[activeIndex].title}
              </Typography>
              <Typography variant="body1" color="textSecondary" mt={1} mb={2}>
                {services[activeIndex].description}
              </Typography>
              <Button variant="contained" color="primary">
                Leer más
              </Button>
            </motion.div>
          </AnimatePresence>

          {/* Botones de navegación */}
          <IconButton
            onClick={handlePrev}
            sx={{
              position: 'absolute',
              top: '50%',
              left: 0,
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.6)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' },
            }}
          >
            <NavigateBefore />
          </IconButton>

          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              top: '50%',
              right: 0,
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.6)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' },
            }}
          >
            <NavigateNext />
          </IconButton>
        </Box>

        {/* Componente de Ubicación */}
        <Suspense fallback={<Typography>Cargando mapa...</Typography>}>
          <Ubicacion />
        </Suspense>
      </Container>
    </Box>
  );
};

export default React.memo(Home);
