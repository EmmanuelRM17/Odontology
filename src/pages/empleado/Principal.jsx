import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActionArea, Box } from '@mui/material';
import { FaUserCircle, FaCalendarAlt, FaClipboardList, FaUsers, FaChartLine } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Principal = () => {
    const navigate = useNavigate();

    const menuItems = [
        { icon: <FaUserCircle size={30} color='#03427c' />, title: 'Mi Perfil', path: '/Empleado/perfil' },
        { icon: <FaCalendarAlt size={30} color='#03427c' />, title: 'Citas', path: '/Empleado/citas' },
        { icon: <FaUsers size={30} color='#03427c' />, title: 'Pacientes', path: '/Empleado/pacientes' },
        { icon: <FaClipboardList size={30} color='#03427c' />, title: 'Historial', path: '/Empleado/historial' },
        { icon: <FaChartLine size={30} color='#03427c' />, title: 'Estadísticas', path: '/Empleado/estadisticas' },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 9, mb: 10 }}>
            <Typography variant="h4" fontWeight="bold" color="#03427c" gutterBottom>
                Bienvenido, Empleado
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Accede rápidamente a las funciones más importantes
            </Typography>

            <Grid container spacing={3} mt={2}>
                {menuItems.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{
                            textAlign: 'center',
                            backgroundColor: '#F9FDFF',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            borderRadius: 2,
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.05)' }
                        }}>
                            <CardActionArea onClick={() => navigate(item.path)}>
                                <CardContent>
                                    <Box mb={1}>{item.icon}</Box>
                                    <Typography variant="h6" fontWeight="bold" color="#03427c">
                                        {item.title}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Principal;
