import { useState } from "react";
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, CardBody, FormGroup, FormLabel, FormCheck } from 'react-bootstrap';

const login = () => {
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(usuario, contrasena);
        if (result.success) {
            navigate('/admin');
        } else {
            setError(result.message);
        }
    };

    return (
        <Container fluid className="vh-100 d-flex align-items-senter justify-content-center bg-light">
            <Row className="w-100 justify-content-center">
                <Col md={6} lg={4}>
                    <Card className="shadow">
                        <Card.Body className="p-4">
                            <div className="text-center mb-4">
                                <h2>Biblioteca COBAT 19</h2>
                                <p className="text-muted">Acceso para bibliotecarios</p>
                            </div>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Usuario de bibliotecario</Form.Label>
                                    <Form.Control
                                    type="text"
                                    placeholder="Ingrese su correo electrónico"
                                    value={usuario}
                                    onChange={(e) => setUsuario(e.target.value)}
                                    required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Contraseña</Form.Label>
                                    <Form.Control
                                    type="password"
                                    placeholder="********"
                                    value={contrasena}
                                    onChange={(e) => setContrasena(e.target.value)}
                                    required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Check type="checkbox" label="Recodarme en este dispositivo"/>
                                </Form.Group>
                                <Button type="submit" variant="primary" className="w-100">
                                    Ingresar
                                </Button>
                            </form>
                            <div className="mt-3 text-center">
                                <small className="text-muted">¿Problemas para ingresar? Contacta al Administrador
                                </small>
                            </div>
                            <div className="text-center text-muted small">
                                PROPIEDAD DEL COBAT PLANTEL 19
                            </div>
                        </Card.Body>
                    </Card>
                    <p className="text-center text-muted mt-3 small">
                        2026 Sistema de Gestión Bibliotecaria para el COBAT 19
                    </p>
                </Col>
            </Row>
        </Container>
    );
};