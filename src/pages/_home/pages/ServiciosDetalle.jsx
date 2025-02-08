import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Container,
    Grid,
    Chip,
    Fade,
    useTheme,
    Button,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import { useParams } from 'react-router-dom';
import {
    Timer,
    AttachMoney,
    CheckCircleOutline,
    MedicalServices,
    Warning,
    Info,
    Schedule,
    LocalHospital,
    Star,
    Assignment
} from '@mui/icons-material';


const services = [
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
]

const ServicioDetalle = () => {
    const { servicioId } = useParams();
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const theme = useTheme();

    const service = services.find(s => s.id === parseInt(servicioId));

    useEffect(() => {
        const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkTheme(matchDarkTheme.matches);

        const handleThemeChange = (e) => setIsDarkTheme(e.matches);
        matchDarkTheme.addEventListener('change', handleThemeChange);

        setIsVisible(true);

        return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
    }, []);

    const colors = {
        background: isDarkTheme ? '#0D1B2A' : '#ffffff',
        primary: isDarkTheme ? '#00BCD4' : '#03427C',
        text: isDarkTheme ? '#ffffff' : '#1a1a1a',
        secondary: isDarkTheme ? '#A0AEC0' : '#666666',
        cardBg: isDarkTheme ? '#1A2735' : '#ffffff',
    };

    if (!service) {
        return (
            <Box sx={{
                textAlign: 'center',
                py: 5,
                backgroundColor: colors.background,
                minHeight: '100vh'
            }}>
                <Typography variant="h4" color="error">
                    Servicio no encontrado
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            backgroundColor: colors.background,
            minHeight: '100vh',
            py: 5,
            transition: 'background-color 0.3s ease'
        }}>
            <Container maxWidth="lg">
                <Fade in={isVisible} timeout={1000}>
                    <Grid container spacing={4}>
                        {/* Cabecera del servicio */}
                        <Grid item xs={12}>
                            <Card
                                elevation={3}
                                sx={{
                                    backgroundColor: colors.cardBg,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: theme.shadows[10]
                                    }
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                    <Box sx={{ mb: 3 }}>
                                        {service.icon}
                                    </Box>
                                    <Typography
                                        variant="h3"
                                        sx={{
                                            color: colors.primary,
                                            fontWeight: 700,
                                            mb: 2,
                                            fontFamily: '"Montserrat", sans-serif'
                                        }}
                                    >
                                        {service.title}
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: colors.secondary,
                                            mb: 3,
                                            maxWidth: '800px',
                                            mx: 'auto'
                                        }}
                                    >
                                        {service.shortDescription}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                                        <Chip
                                            icon={<Timer />}
                                            label={service.duration}
                                            sx={{ backgroundColor: colors.primary, color: '#fff' }}
                                        />
                                        <Chip
                                            icon={<AttachMoney />}
                                            label={service.price}
                                            variant="outlined"
                                            sx={{ color: colors.text, borderColor: colors.primary }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Beneficios */}
                        <Grid item xs={12} md={6}>
                            <Card
                                elevation={2}
                                sx={{
                                    height: '100%',
                                    backgroundColor: colors.cardBg,
                                    transition: 'all 0.3s ease',
                                    '&:hover': { transform: 'translateY(-5px)' }
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            color: colors.primary,
                                            mb: 3,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                    >
                                        <Star /> Beneficios
                                    </Typography>
                                    <List>
                                        {service.benefits.map((benefit, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon>
                                                    <CheckCircleOutline sx={{ color: colors.primary }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={benefit}
                                                    sx={{ color: colors.text }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Qué incluye */}
                        <Grid item xs={12} md={6}>
                            <Card
                                elevation={2}
                                sx={{
                                    height: '100%',
                                    backgroundColor: colors.cardBg,
                                    transition: 'all 0.3s ease',
                                    '&:hover': { transform: 'translateY(-5px)' }
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            color: colors.primary,
                                            mb: 3,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                    >
                                        <Assignment /> Qué incluye
                                    </Typography>
                                    <List>
                                        {service.includes.map((item, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon>
                                                    <Info sx={{ color: colors.primary }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={item}
                                                    sx={{ color: colors.text }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Preparación */}
                        <Grid item xs={12} md={6}>
                            <Card
                                elevation={2}
                                sx={{
                                    height: '100%',
                                    backgroundColor: colors.cardBg,
                                    transition: 'all 0.3s ease',
                                    '&:hover': { transform: 'translateY(-5px)' }
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            color: colors.primary,
                                            mb: 3,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                    >
                                        <Schedule /> Preparación
                                    </Typography>
                                    <List>
                                        {service.preparation.map((prep, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon>
                                                    <Warning sx={{ color: colors.primary }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={prep}
                                                    sx={{ color: colors.text }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Cuidados posteriores */}
                        <Grid item xs={12} md={6}>
                            <Card
                                elevation={2}
                                sx={{
                                    height: '100%',
                                    backgroundColor: colors.cardBg,
                                    transition: 'all 0.3s ease',
                                    '&:hover': { transform: 'translateY(-5px)' }
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            color: colors.primary,
                                            mb: 3,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                    >
                                        <LocalHospital /> Cuidados posteriores
                                    </Typography>
                                    <List>
                                        {service.aftercare.map((care, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon>
                                                    <CheckCircleOutline sx={{ color: colors.primary }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={care}
                                                    sx={{ color: colors.text }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Botón de acción */}
                        <Grid item xs={12}>
                            <Box sx={{ textAlign: 'center', mt: 3 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        backgroundColor: colors.primary,
                                        '&:hover': {
                                            backgroundColor: colors.primary,
                                            opacity: 0.9
                                        },
                                        py: 1.5,
                                        px: 4,
                                        borderRadius: 2
                                    }}
                                >
                                    Agendar Cita
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Fade>
            </Container>
        </Box>
    );
};

export default ServicioDetalle;