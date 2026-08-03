import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalLibros: 0,
        prestamosActivos: 0,
        prestamosVencidos: 0,
        totalEjemplares: 0,
    });
    const [actividadReciente, setActividadReciente] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener libros y ejemplares
                const librosRes = await api.get('/libros');
                const libros = librosRes.data.data || [];

                // Obtener préstamos
                const prestamosRes = await api.get('/prestamos');
                const prestamos = prestamosRes.data.data || [];

                // Calcular estadísticas reales
                const totalLibros = libros.length;
                const totalEjemplares = libros.reduce((acc, l) => acc + (l.total_ejemplares || 0), 0);
                const prestamosActivos = prestamos.filter(p => p.estado_prestamo === 'Activo').length;
                const prestamosVencidos = prestamos.filter(p => p.estado_prestamo === 'Vencido').length;

                setStats({
                    totalLibros,
                    prestamosActivos,
                    prestamosVencidos,
                    totalEjemplares,
                });

                // Actividad reciente: últimos 5 préstamos
                const recent = prestamos
                    .sort((a, b) => new Date(b.fecha_salida) - new Date(a.fecha_salida))
                    .slice(0, 5)
                    .map(p => ({
                        tipo: p.estado_prestamo === 'Activo' ? 'loan' : 'return',
                        titulo: p.titulo || 'Sin título',
                        usuario: p.usuario_nombre || p.usuario_identificador || 'Desconocido',
                        timestamp: p.fecha_salida,
                        estado: p.estado_prestamo,
                    }));

                setActividadReciente(recent);
            } catch (error) {
                console.error('Error al cargar dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Cargando datos...</div>;

    return (
        <>
            <h2 className="mb-4">Dashboard de la biblioteca</h2>
            <p>Bienvenido de nuevo. Aquí tienes las novedades</p>

            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <h1>{stats.totalLibros}</h1>
                            <Card.Text>Libros totales</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <h1>{stats.totalEjemplares}</h1>
                            <Card.Text>Ejemplares totales</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <h1 className="text-primary">{stats.prestamosActivos}</h1>
                            <Card.Text>Préstamos activos</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <h1 className="text-danger">{stats.prestamosVencidos}</h1>
                            <Card.Text>Préstamos vencidos</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={8}>
                    <Card>
                        <Card.Header>Actividad reciente</Card.Header>
                        <Card.Body>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Tipo</th>
                                        <th>Título</th>
                                        <th>Usuario</th>
                                        <th>Fecha</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {actividadReciente.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center">No hay actividad reciente</td></tr>
                                    ) : (
                                        actividadReciente.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.tipo === 'loan' ? '📤 Préstamo' : '📥 Devolución'}</td>
                                                <td>{item.titulo}</td>
                                                <td>{item.usuario}</td>
                                                <td>{new Date(item.timestamp).toLocaleDateString()}</td>
                                                <td>{item.estado}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card>
                        <Card.Header>Acciones rápidas</Card.Header>
                        <Card.Body>
                            <div className="d-grid gap-2">
                                <Link to="/admin/prestamos/nuevo" className="btn btn-primary">
                                    Registrar préstamo
                                </Link>
                                <Link to="/admin/libros/nuevo" className="btn btn-success">
                                    Añadir nuevo libro
                                </Link>
                                <Link to="/admin/reportes" className="btn btn-info">
                                    Reporte mensual
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default Dashboard;