// src/components/admin/Prestamos/GestionPrestamos.jsx
import { useState, useEffect } from 'react';
import { Table, Button, Badge, Form, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../../api/axios';

const GestionPrestamos = () => {
    const [prestamos, setPrestamos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        cargarPrestamos();
    }, []);

    const cargarPrestamos = async () => {
        setCargando(true);
        try {
            const res = await api.get('/prestamos');
            setPrestamos(res.data.data || []);
        } catch (error) {
            console.error('Error al cargar préstamos:', error);
        } finally {
            setCargando(false);
        }
    };

    const handleDevolver = async (prestamoId) => {
        if (window.confirm('¿Confirmar devolución de este libro?')) {
            try {
                await api.put(`/prestamos/${prestamoId}/devolver`);
                cargarPrestamos();
            } catch (error) {
                alert('Error al devolver el libro');
            }
        }
    };

    const filtered = prestamos.filter(p =>
        p.usuario_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.usuario_identificador?.includes(busqueda)
    );

    const estadisticas = {
        devueltosHoy: prestamos.filter(p => p.estado_prestamo === 'Devuelto').length,
        atrasados: prestamos.filter(p => p.estado_prestamo === 'Vencido').length,
        proximos: prestamos.filter(p => p.estado_prestamo === 'Activo').length,
    };

    return (
        <div>
            <h2 className="mb-4">Gestión de préstamos</h2>
            <p className="text-muted">Realice el seguimiento de las devoluciones y registre nuevas solicitudes de préstamo.</p>

            <Row className="mb-3">
                <Col>
                    <Link to="/admin/prestamos/nuevo" className="btn btn-primary">
                        + Nuevo préstamo
                    </Link>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={4}>
                    <Card className="text-center shadow-sm">
                        <Card.Body>
                            <h5>Devueltos hoy</h5>
                            <h2 className="display-6">{estadisticas.devueltosHoy}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center shadow-sm border-danger">
                        <Card.Body>
                            <h5>Devoluciones atrasadas</h5>
                            <h2 className="display-6 text-danger">{estadisticas.atrasados}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center shadow-sm">
                        <Card.Body>
                            <h5>Próximas devoluciones</h5>
                            <h2 className="display-6">{estadisticas.proximos}</h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Control
                    type="text"
                    placeholder="Buscar por matrícula o nombre..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </Form.Group>

            <Table striped bordered hover responsive className="shadow-sm">
                <thead className="bg-light">
                    <tr>
                        <th>Usuario</th>
                        <th>Detalle del libro</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {cargando ? (
                        <tr><td colSpan="5" className="text-center">Cargando...</td></tr>
                    ) : filtered.length === 0 ? (
                        <tr><td colSpan="5" className="text-center">No hay préstamos</td></tr>
                    ) : (
                        filtered.map((p) => (
                            <tr key={p.prestamo_id}>
                                <td>
                                    <strong>{p.tipo_usuario}</strong><br />
                                    {p.tipo_usuario === 'Alumno' ? (
                                        <>Matrícula: {p.usuario_identificador}</>
                            ) : (
                                <>Nombre: {p.usuario_identificador}</>
                            )}
                            {p.usuario_nombre && p.tipo_usuario === 'Docente' && (
                                <><br /><small>Nombre completo: {p.usuario_nombre}</small></>
                            )}
                        </td>
                                <td>
                                    <strong>{p.titulo || 'Sin título'}</strong><br />
                                    <small className="text-muted">ID: {p.inventario}</small>
                                </td>
                                <td>
                                    Prestado: {new Date(p.fecha_salida).toLocaleDateString()}<br />
                                    Devolución: {new Date(p.fecha_limite).toLocaleDateString()}
                                </td>
                                <td>
                                    <Badge bg={
                                        p.estado_prestamo === 'Activo' ? 'primary' :
                                        p.estado_prestamo === 'Devuelto' ? 'success' : 'danger'
                                    }>
                                        {p.estado_prestamo}
                                    </Badge>
                                </td>
                                <td>
                                    {p.estado_prestamo === 'Activo' && (
                                        <Button
                                            variant="outline-success"
                                            size="sm"
                                            onClick={() => handleDevolver(p.prestamo_id)}
                                        >
                                            Devolver
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
            <p className="text-muted">Mostrando {filtered.length} préstamos</p>
        </div>
    );
};

export default GestionPrestamos;