// src/components/public/CatalogoPublico.jsx
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const CatalogoPublico = () => {
    const [libros, setLibros] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        const fetchLibros = async () => {
            setCargando(true);
            try {
                const res = await api.get('/libros');
                setLibros(res.data.data || []);
            } catch (error) {
                console.error('Error al cargar catálogo:', error);
            } finally {
                setCargando(false);
            }
        };
        fetchLibros();
    }, []);

    const filtered = libros.filter(l =>
        l.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        l.autor?.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <Container className="py-4">
            <h1 className="display-4 mb-4">Biblioteca del COBAT 19</h1>
            <p className="lead">Expande tu conocimiento. ¡Busca los títulos que tenemos para ti!</p>

            <Row className="mb-4">
                <Col md={8}>
                    <Form.Control
                        type="text"
                        placeholder="Busca por título, autor..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="form-control-lg"
                    />
                </Col>
                <Col md={4}>
                    <Button variant="primary" className="w-100">Buscar</Button>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center shadow-sm">
                        <Card.Body>
                            <h2 className="display-5">{libros.length}</h2>
                            <Card.Text>Ejemplares totales</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center shadow-sm">
                        <Card.Body>
                            <h2 className="display-5">{libros.filter(l => l.disponibles > 0).length}</h2>
                            <Card.Text>Disponibles</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center shadow-sm">
                        <Card.Body>
                            <h2 className="display-5">124</h2>
                            <Card.Text>Novedades del mes</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <h3 className="mb-3">Busca por categoría</h3>
            <Row className="mb-4">
                {['Literatura', 'Ciencia', 'Historia', 'Matemáticas', 'Geografía', 'Idiomas', 'Arte', 'Biología'].map((cat) => (
                    <Col key={cat} md={3} className="mb-2">
                        <Button variant="outline-secondary" className="w-100">
                            {cat}
                        </Button>
                    </Col>
                ))}
            </Row>

            <h3 className="mb-3">Novedades</h3>
            <Row>
                {cargando ? (
                    <p>Cargando libros...</p>
                ) : filtered.length === 0 ? (
                    <p>No se encontraron libros</p>
                ) : (
                    filtered.slice(0, 6).map((libro) => (
                        <Col key={libro.libro_id} md={4} className="mb-3">
                            <Card className="shadow-sm h-100">
                                <Card.Body>
                                    <Card.Title>{libro.titulo}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">{libro.autor}</Card.Subtitle>
                                    <Badge bg="info">{libro.tematica || 'General'}</Badge>
                                    <div className="mt-2">
                                        <small>Disponibles: {libro.disponibles || 0}</small>
                                    </div>
                                    <Link to={`/libro/${libro.libro_id}`} className="btn btn-primary btn-sm mt-2">
                                        Ver detalles
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>
        </Container>
    );
};

export default CatalogoPublico;