import React, { useState } from 'react';
import {
  TextField, Button, Grid, MenuItem, FormControl, Select, InputLabel,
  Card, CardContent, Typography, TableContainer,
  Table, TableBody, TableCell, TableHead, TableRow, Paper, Dialog,
  DialogTitle, DialogContent, DialogActions, Box, IconButton, Tooltip,
  Chip, Fab
} from '@mui/material';
import {
  MedicalServices, Timer, AttachMoney, Edit, Delete,
  Description, CheckCircle, Info, EventAvailable, Assignment,
  HealthAndSafety, MenuBook, AccessTime, Add, Close, Star, LocalHospital
} from '@mui/icons-material';

const ServicioForm = () => {
  const [isDarkTheme] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openNewServiceForm, setOpenNewServiceForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Colores del tema
  const colors = {
    background: isDarkTheme ? '#0D1B2A' : '#ffffff',
    primary: isDarkTheme ? '#00BCD4' : '#03427C',
    text: isDarkTheme ? '#ffffff' : '#1a1a1a',
    secondary: isDarkTheme ? '#A0AEC0' : '#666666',
    cardBg: isDarkTheme ? '#1A2735' : '#ffffff',
  };

  // Datos de ejemplo con la nueva estructura
  const [services] = useState([
    {
      id: 1,
      title: 'Consulta Dental General',
      shortDescription: 'Evaluación integral para cuidar tu salud bucal y prevenir problemas.',
      duration: '30-45 minutos',
      price: 'Desde $500',
      icon: <MedicalServices sx={{ fontSize: 40 }} />,
      benefits: [
        'Diagnóstico completo del estado de tu salud bucal',
        'Plan de tratamiento personalizado',
        'Detección temprana de problemas dentales',
        'Consejos de higiene dental personalizada'
      ],
      includes: [
        'Examen visual detallado',
        'Evaluación de tejidos blandos',
        'Revisión de historial médico',
        'Recomendaciones de cuidado en casa'
      ],
      preparation: [
        'No es necesario ayuno',
        'Traer estudios previos si los tienes',
        'Llegar 10 minutos antes de tu cita'
      ],
      aftercare: [
        'Seguir las recomendaciones de higiene dental',
        'Programar revisiones periódicas',
        'Mantener una buena alimentación'
      ]
    },
    {
      id: 2,
      title: 'Limpieza Dental por Ultrasonido',
      shortDescription: 'Limpieza profunda sin molestias para eliminar placa y sarro.',
      duration: '45-60 minutos',
      price: 'Desde $800',
      icon: <LocalHospital sx={{ fontSize: 40 }} />,
      benefits: [
        'Eliminación efectiva de sarro y manchas',
        'Prevención de enfermedades periodontales',
        'Mejora la salud de las encías',
        'Aliento más fresco'
      ],
      includes: [
        'Limpieza con ultrasonido',
        'Pulido dental',
        'Aplicación de flúor',
        'Revisión de técnica de cepillado'
      ],
      preparation: [
        'Cepillarse los dientes antes de la cita',
        'Informar sobre sensibilidad dental',
        'No fumar 24 horas antes'
      ],
      aftercare: [
        'Evitar alimentos muy calientes o fríos por 24 horas',
        'No consumir alimentos que manchen por 48 horas',
        'Mantener una buena higiene bucal'
      ]
    },
    {
      id: 3,
      title: 'Curetaje (Limpieza Profunda)',
      shortDescription: 'Limpieza especializada de encías para tratar la enfermedad periodontal.',
      duration: '60-90 minutos',
      price: 'Desde $1,200 por cuadrante',
      icon: <MedicalServices sx={{ fontSize: 40 }} />,
      benefits: [
        'Tratamiento efectivo de la periodontitis',
        'Reducción de la inflamación gingival',
        'Prevención de pérdida ósea',
        'Mejora la salud bucal general'
      ],
      includes: [
        'Limpieza profunda bajo la encía',
        'Eliminación de tejido infectado',
        'Alisado radicular',
        'Aplicación de antibióticos locales si es necesario'
      ],
      preparation: [
        'Evaluación periodontal previa',
        'Posible medicación previa',
        'No fumar 48 horas antes'
      ],
      aftercare: [
        'Seguir el régimen de medicamentos recetados',
        'Cuidado especial al cepillarse',
        'Evitar alimentos duros por una semana'
      ]
    },
    {
      id: 4,
      title: 'Asesoría sobre Diseño de Sonrisa',
      shortDescription: 'Planificación personalizada para transformar tu sonrisa.',
      duration: '60 minutos',
      price: 'Desde $1,000',
      icon: <Star sx={{ fontSize: 40 }} />,
      benefits: [
        'Visualización digital del resultado final',
        'Plan de tratamiento personalizado',
        'Múltiples opciones de tratamiento',
        'Presupuesto detallado'
      ],
      includes: [
        'Fotografías dentales',
        'Análisis facial',
        'Simulación digital',
        'Plan de tratamiento por etapas'
      ],
      preparation: [
        'Traer fotografías de la sonrisa deseada',
        'Lista de expectativas',
        'Historial de tratamientos previos'
      ],
      aftercare: [
        'Revisión del plan propuesto',
        'Programación de tratamientos',
        'Seguimiento personalizado'
      ]
    },
    {
      id: 5,
      title: 'Cirugía Estética de Encía',
      shortDescription: 'Remodelación quirúrgica para mejorar la estética gingival.',
      duration: '60-120 minutos',
      price: 'Desde $3,000',
      icon: <LocalHospital sx={{ fontSize: 40 }} />,
      benefits: [
        'Mejora la proporción diente-encía',
        'Corrección de sonrisa gingival',
        'Resultados duraderos',
        'Recuperación relativamente rápida'
      ],
      includes: [
        'Evaluación preoperatoria',
        'Procedimiento quirúrgico',
        'Material de cicatrización',
        'Primera cita de seguimiento'
      ],
      preparation: [
        'Evaluación periodontal completa',
        'No fumar 2 semanas antes',
        'Suspender anticoagulantes según indicación'
      ],
      aftercare: [
        'Aplicar hielo las primeras 24 horas',
        'Medicación según prescripción',
        'Dieta blanda por una semana'
      ]
    },
    {
      id: 6,
      title: 'Obturación con Resina',
      shortDescription: 'Restauraciones estéticas para dientes dañados por caries.',
      duration: '30-60 minutos',
      price: 'Desde $800 por pieza',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      benefits: [
        'Restauración invisible',
        'Conservación de estructura dental',
        'Durabilidad prolongada',
        'Resistencia a la masticación'
      ],
      includes: [
        'Eliminación de caries',
        'Aplicación de resina del color del diente',
        'Pulido final',
        'Ajuste de mordida'
      ],
      preparation: [
        'Limpieza dental previa recomendada',
        'Informar sobre sensibilidad',
        'No es necesario ayuno'
      ],
      aftercare: [
        'Esperar 24 horas para comer alimentos sólidos',
        'Evitar alimentos muy duros',
        'Mantener buena higiene bucal'
      ]
    },
    {
      id: 7,
      title: 'Incrustación Estética y de Metal',
      shortDescription: 'Restauraciones duraderas para dientes muy dañados.',
      duration: '2 citas de 60 minutos',
      price: 'Desde $2,500',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      benefits: [
        'Mayor durabilidad que las resinas',
        'Ajuste perfecto',
        'Preservación dental',
        'Resistencia superior'
      ],
      includes: [
        'Preparación dental',
        'Toma de impresión',
        'Incrustación provisional',
        'Cementación definitiva'
      ],
      preparation: [
        'Evaluación previa de la pieza',
        'Radiografía dental',
        'No requiere ayuno'
      ],
      aftercare: [
        'Cuidado especial las primeras 24 horas',
        'Evitar alimentos muy duros',
        'Revisión a la semana'
      ]
    },
    {
      id: 8,
      title: 'Coronas Fijas Estéticas o de Metal',
      shortDescription: 'Restauración completa para dientes muy dañados.',
      duration: '2-3 citas de 60 minutos',
      price: 'Desde $4,000 por pieza',
      icon: <Star sx={{ fontSize: 40 }} />,
      benefits: [
        'Restauración completa del diente',
        'Mejora estética y funcional',
        'Protección dental',
        'Durabilidad a largo plazo'
      ],
      includes: [
        'Preparación dental',
        'Corona provisional',
        'Prueba de corona definitiva',
        'Cementación final'
      ],
      preparation: [
        'Evaluación inicial',
        'Radiografía dental',
        'Posible tratamiento de conducto previo'
      ],
      aftercare: [
        'Cuidado especial al masticar los primeros días',
        'Higiene específica para coronas',
        'Revisiones periódicas'
      ]
    },
    {
      id: 9,
      title: 'Placas Removibles Parciales',
      shortDescription: 'Prótesis para reemplazar varios dientes faltantes.',
      duration: '4-5 citas de 45 minutos',
      price: 'Desde $3,500',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      benefits: [
        'Reemplazo de múltiples dientes',
        'Fácil limpieza',
        'Mejora la masticación',
        'Económicamente accesible'
      ],
      includes: [
        'Impresiones dentales',
        'Prueba de estructura metálica',
        'Prueba de dientes',
        'Ajustes necesarios'
      ],
      preparation: [
        'Evaluación de dientes remanentes',
        'Tratamiento previo si es necesario',
        'Modelos de estudio'
      ],
      aftercare: [
        'Limpieza diaria de la prótesis',
        'Retiro nocturno recomendado',
        'Revisiones periódicas de ajuste'
      ]
    },
    {
      id: 10,
      title: 'Placas Totales Removibles',
      shortDescription: 'Prótesis completas para pacientes sin dientes.',
      duration: '5-6 citas de 60 minutos',
      price: 'Desde $6,000',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      benefits: [
        'Restauración completa de la dentadura',
        'Mejora de la apariencia facial',
        'Recuperación de la función masticatoria',
        'Adaptación personalizada'
      ],
      includes: [
        'Impresiones preliminares y definitivas',
        'Registro de mordida',
        'Prueba de dientes en cera',
        'Ajustes posteriores'
      ],
      preparation: [
        'Evaluación de tejidos bucales',
        'Posibles extracciones previas',
        'Tiempo de cicatrización necesario'
      ],
      aftercare: [
        'Aprendizaje de colocación y retiro',
        'Limpieza diaria específica',
        'Ajustes periódicos'
      ]
    },
    {
      id: 11,
      title: 'Guardas Dentales',
      shortDescription: 'Protección nocturna contra el bruxismo.',
      duration: '2 citas de 30 minutos',
      price: 'Desde $2,000',
      icon: <MedicalServices sx={{ fontSize: 40 }} />,
      benefits: [
        'Protección contra el desgaste dental',
        'Alivio de dolor muscular',
        'Mejora calidad del sueño',
        'Previene daño articular'
      ],
      includes: [
        'Toma de impresión',
        'Ajuste del guarda',
        'Instrucciones de uso',
        'Primera revisión de ajuste'
      ],
      preparation: [
        'Evaluación de la mordida',
        'Registro de puntos de contacto',
        'No requiere preparación especial'
      ],
      aftercare: [
        'Limpieza diaria del guarda',
        'Almacenamiento adecuado',
        'Revisión cada 6 meses'
      ]
    },
    {
      id: 12,
      title: 'Placas Hawley',
      shortDescription: 'Retenedores post-ortodoncia removibles.',
      duration: '2 citas de 30 minutos',
      price: 'Desde $1,800',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      benefits: [
        'Mantiene resultados de ortodoncia',
        'Fácil de usar y limpiar',
        'Durabilidad prolongada',
        'Ajustes posibles'
      ],
      includes: [
        'Toma de impresión',
        'Adaptación de la placa',
        'Instrucciones de uso',
        'Primera revisión'
      ],
      preparation: [
        'Terminar tratamiento de ortodoncia',
        'Evaluación final de posición dental',
        'No requiere preparación especial'
      ],
      aftercare: [
        'Uso según indicaciones',
        'Limpieza diaria',
        'Revisiones periódicas'
      ]
    },
    {
      id: 13,
      title: 'Extracción Dental',
      shortDescription: 'Remoción segura de dientes dañados o problemáticos.',
      duration: '30-60 minutos',
      price: 'Desde $800 simple - $3,000 quirúrgica',
      icon: <LocalHospital sx={{ fontSize: 40 }} />,
      benefits: [
        'Eliminación de dolor',
        'Prevención de infecciones',
        'Preparación para prótesis',
        'Resolución rápida'
      ],
      includes: [
        'Anestesia local',
        'Procedimiento de extracción',
        'Material para hemostasia',
        'Receta médica necesaria'
      ],
      preparation: [
        'Evaluación radiográfica',
        'Informar condiciones médicas',
        'Ayuno de 4 horas recomendado'
      ],
      aftercare: [
        'Aplicar hielo las primeras 24 horas',
        'Dieta blanda por 3 días',
        'No fumar por 72 horas'
      ]
    },
    {
      id: 14,
      title: 'Ortodoncia y Ortopedia Maxilar',
      shortDescription: 'Tratamiento integral para alinear dientes y corregir la mordida.',
      duration: '18-24 meses aprox.',
      price: 'Desde $25,000',
      icon: <Star sx={{ fontSize: 40 }} />,
      benefits: [
        'Alineación dental perfecta',
        'Corrección de mordida y problemas funcionales',
        'Mejora estética y salud bucal',
        'Prevención de desgastes dentales'
      ],
      includes: [
        'Evaluación ortodóncica inicial',
        'Toma de modelos y radiografías',
        'Colocación de brackets o alineadores',
        'Ajustes periódicos'
      ],
      preparation: [
        'Evaluación odontológica previa',
        'Limpieza dental antes del tratamiento',
        'Uso de separadores si es necesario'
      ],
      aftercare: [
        'Uso de retenedores al finalizar el tratamiento',
        'Higiene dental estricta',
        'Revisiones periódicas cada 6 meses'
      ]
    }
  ]);

  const [newService, setNewService] = useState({
    title: '',
    shortDescription: '',
    duration: '',
    price: '',
    disponibilidad: true,
    promotion: 0,
    benefits: ['', '', '', ''],
    includes: ['', '', '', ''],
    preparation: ['', '', '', ''],
    aftercare: ['', '', '', '']
  });

  // Función para manejar la apertura del diálogo de detalles
  const handleViewDetails = (service) => {
    setSelectedService(service);
    setOpenDialog(true);
  };

  // Manejar cambios en los arrays de beneficios, includes, etc.
  const handleArrayChange = (field, index, value) => {
    setNewService(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  // Validación del formulario
  const validateForm = () => {
    return (
      newService.title &&
      newService.shortDescription &&
      newService.duration &&
      newService.price &&
      newService.benefits.some(b => b) &&
      newService.includes.some(i => i) &&
      newService.preparation.some(p => p) &&
      newService.aftercare.some(a => a)
    );
  };

  // Función para filtrar servicios basados en la búsqueda
  const filteredServices = services.filter(service => {
    const searchLower = searchQuery.toLowerCase();
    return (
      service.title.toLowerCase().includes(searchLower) ||
      service.shortDescription.toLowerCase().includes(searchLower) ||
      service.price.toLowerCase().includes(searchLower) ||
      service.duration.toLowerCase().includes(searchLower)
    );
  });
  // Renderizado del componente
  return (
    <Box sx={{ p: 3, backgroundColor: colors.background, minHeight: '100vh' }}>
      <Card sx={{
        mb: 4,
        backgroundColor: colors.paper,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <CardContent>
          <Typography variant="h4" align="center" color={colors.primary} gutterBottom>
            <HealthAndSafety sx={{ fontSize: 40, verticalAlign: 'middle', mr: 2 }} />
            Servicios Dentales
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <TextField
              variant="outlined"
              placeholder="Buscar servicio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Info sx={{ color: colors.primary, mr: 1 }} />
              }}
              sx={{ width: '50%' }}
            />
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: colors.tableHeader }}>
                <TableRow>
                  <TableCell>Servicio</TableCell>
                  <TableCell>Duración</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {filteredServices.map((service) => (                  <TableRow
                    key={service.id}
                    sx={{
                      '&:hover': { backgroundColor: colors.hover },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <MedicalServices sx={{ color: colors.primary, mr: 2 }} />
                        <Typography>{service.title}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Timer sx={{ color: colors.primary, mr: 1 }} />
                        {service.duration}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoney sx={{ color: colors.primary }} />
                        {service.price}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={service.disponibilidad ? "Disponible" : "No disponible"}
                        color={service.disponibilidad ? "success" : "error"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Ver detalles">
                          <IconButton
                            onClick={() => handleViewDetails(service)}
                            sx={{
                              backgroundColor: colors.primary,
                              color: 'white',
                              '&:hover': { backgroundColor: colors.hover }
                            }}
                          >
                            <Info />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar servicio">
                          <IconButton
                            sx={{
                              backgroundColor: '#2e7d32',
                              color: 'white',
                              '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.8)' }
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar servicio">
                          <IconButton
                            sx={{
                              backgroundColor: '#d32f2f',
                              color: 'white',
                              '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.8)' }
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      {/* Diálogo de detalles del servicio */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedService && (
          <>
            <DialogTitle sx={{ backgroundColor: colors.primary, color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MedicalServices sx={{ mr: 2 }} />
                {selectedService.title}
              </Box>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" color={colors.primary}>
                    <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Descripción
                  </Typography>
                  <Typography>{selectedService.shortDescription}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" color={colors.primary}>
                    <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Beneficios
                  </Typography>
                  {selectedService.benefits.map((benefit, index) => (
                    <Typography key={index} sx={{ ml: 3 }}>• {benefit}</Typography>
                  ))}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" color={colors.primary}>
                    <MenuBook sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Incluye
                  </Typography>
                  {selectedService.includes.map((item, index) => (
                    <Typography key={index} sx={{ ml: 3 }}>• {item}</Typography>
                  ))}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" color={colors.primary}>
                    <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Preparación
                  </Typography>
                  {selectedService.preparation.map((prep, index) => (
                    <Typography key={index} sx={{ ml: 3 }}>• {prep}</Typography>
                  ))}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" color={colors.primary}>
                    <EventAvailable sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Cuidados posteriores
                  </Typography>
                  {selectedService.aftercare.map((care, index) => (
                    <Typography key={index} sx={{ ml: 3 }}>• {care}</Typography>
                  ))}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)} color="primary">
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Botón FAB para agregar nuevo servicio */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          bgcolor: colors.primary,
          '&:hover': {
            bgcolor: colors.primary,
            opacity: 0.9
          }
        }}
        onClick={() => setOpenNewServiceForm(true)}
      >
        <Add />
      </Fab>

      {/* Modal para nuevo servicio */}
      <Dialog
        open={openNewServiceForm}
        onClose={() => setOpenNewServiceForm(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: colors.cardBg,
            color: colors.text
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: colors.primary,
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MedicalServices />
            <Typography>Nuevo Servicio Dental</Typography>
          </Box>
          <IconButton onClick={() => setOpenNewServiceForm(false)} sx={{ color: '#ffffff' }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Información básica */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: colors.primary, mb: 2 }}>
                Información Básica
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nombre del Servicio"
                    value={newService.title}
                    onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                    sx={{
                      '& label': { color: colors.secondary },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: colors.secondary },
                        '&:hover fieldset': { borderColor: colors.primary },
                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Duración"
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                    placeholder="ej: 30-45 minutos"
                    sx={{
                      '& label': { color: colors.secondary },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: colors.secondary },
                        '&:hover fieldset': { borderColor: colors.primary },
                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Precio"
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    sx={{
                      '& label': { color: colors.secondary },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: colors.secondary },
                        '&:hover fieldset': { borderColor: colors.primary },
                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: colors.secondary }}>Disponibilidad</InputLabel>
                    <Select
                      value={newService.disponibilidad}
                      onChange={(e) => setNewService({ ...newService, disponibilidad: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.secondary },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary }
                      }}
                    >
                      <MenuItem value={true}>Disponible</MenuItem>
                      <MenuItem value={false}>No Disponible</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Descripción Corta"
                    value={newService.shortDescription}
                    onChange={(e) => setNewService({ ...newService, shortDescription: e.target.value })}
                    sx={{
                      '& label': { color: colors.secondary },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: colors.secondary },
                        '&:hover fieldset': { borderColor: colors.primary },
                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Beneficios */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: colors.primary, mb: 2 }}>
                <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                Beneficios
              </Typography>
              {newService.benefits.map((benefit, index) => (
                <TextField
                  key={`benefit-${index}`}
                  fullWidth
                  label={`Beneficio ${index + 1}`}
                  value={benefit}
                  onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                  sx={{ mb: 2 }}
                />
              ))}
            </Grid>

            {/* Incluye */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: colors.primary, mb: 2 }}>
                <MenuBook sx={{ mr: 1, verticalAlign: 'middle' }} />
                Incluye
              </Typography>
              {newService.includes.map((include, index) => (
                <TextField
                  key={`include-${index}`}
                  fullWidth
                  label={`Inclusión ${index + 1}`}
                  value={include}
                  onChange={(e) => handleArrayChange('includes', index, e.target.value)}
                  sx={{ mb: 2 }}
                />
              ))}
            </Grid>

            {/* Preparación */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: colors.primary, mb: 2 }}>
                <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                Preparación
              </Typography>
              {newService.preparation.map((prep, index) => (
                <TextField
                  key={`prep-${index}`}
                  fullWidth
                  label={`Preparación ${index + 1}`}
                  value={prep}
                  onChange={(e) => handleArrayChange('preparation', index, e.target.value)}
                  sx={{ mb: 2 }}
                />
              ))}
            </Grid>

            {/* Cuidados posteriores */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: colors.primary, mb: 2 }}>
                <EventAvailable sx={{ mr: 1, verticalAlign: 'middle' }} />
                Cuidados Posteriores
              </Typography>
              {newService.aftercare.map((care, index) => (
                <TextField
                  key={`care-${index}`}
                  fullWidth
                  label={`Cuidado ${index + 1}`}
                  value={care}
                  onChange={(e) => handleArrayChange('aftercare', index, e.target.value)}
                  sx={{ mb: 2 }}
                />
              ))}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpenNewServiceForm(false)}
            sx={{ color: colors.secondary }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (validateForm()) {
                // Aquí iría la lógica para guardar el servicio
                setOpenNewServiceForm(false);
              }
            }}
            sx={{
              bgcolor: colors.primary,
              '&:hover': {
                bgcolor: colors.primary,
                opacity: 0.9
              }
            }}
          >
            Guardar Servicio
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServicioForm;