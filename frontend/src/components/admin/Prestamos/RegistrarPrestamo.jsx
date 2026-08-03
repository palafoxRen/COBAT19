import { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';

const RegistrarPrestamo = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        inventario: '',
        tipo_usuario: 'Alumno',
        usuario_identificador: '',
        usuario_nombre: '',
        fecha_limite: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const payload = {
                inventario: formData.inventario,
                tipo_usuario: formData.tipo_usuario,
                usuario_identificador: formData.usuario_identificador,
                fecha_limite: formData.fecha_limite || undefined,
            };

            // Solo para docentes se envía nombre completo
            if (formData.tipo_usuario === 'Docente') {
                if (!formData.usuario_nombre) {
                    setError('Debe ingresar el nombre completo del docente');
                    setLoading(false);
                    return;
                }
                payload.usuario_nombre = formData.usuario_nombre;
            }

            await api.post('/prestamos', payload);
            setSuccess(true);
            setTimeout(() => navigate('/admin/prestamos'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrar el préstamo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="mb-4">Registrar nuevo préstamo</h2>
            <p className="text-muted">Ingrese los datos del estudiante o del docente y del libro.</p>

            <Card>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">Préstamo registrado exitosamente</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Código de inventario</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="inventario"
                                        placeholder="e.g. 16-CB19-00001"
                                        value={formData.inventario}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Form.Text className="text-muted">
                                        Ingrese el código único del ejemplar
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tipo de usuario</Form.Label>
                                    <Form.Select
                                        name="tipo_usuario"
                                        value={formData.tipo_usuario}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="Alumno">Alumno</option>
                                        <option value="Docente">Docente</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        {formData.tipo_usuario === 'Alumno' && (
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Matrícula del alumno</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="usuario_identificador"
                                            placeholder="STU-2023-045"
                                            value={formData.usuario_identificador}
                                            onChange={handleChange}
                                            required
                                        />
                                        <Form.Text className="text-muted">
                                            Número de control o matrícula
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}

                        {formData.tipo_usuario === 'Docente' && (
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombre completo del docente</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="usuario_nombre"
                                            placeholder="Dr. Juan Pérez"
                                            value={formData.usuario_nombre}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Identificador (opcional)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="usuario_identificador"
                                            placeholder="DOC-001"
                                            value={formData.usuario_identificador}
                                            onChange={handleChange}
                                        />
                                        <Form.Text className="text-muted">
                                            Número de empleado (opcional)
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Fecha límite de devolución</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="fecha_limite"
                                        value={formData.fecha_limite}
                                        onChange={handleChange}
                                    />
                                    <Form.Text className="text-muted">
                                        Si no se especifica, se tomarán 7 días por defecto
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Alert variant="warning" className="mt-3">
                            <strong>Recordatorio:</strong> Alumnos que no devuelvan a tiempo el libro no podrán pedir otro libro.
                        </Alert>

                        <div className="d-flex gap-2">
                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'Registrando...' : 'Registrar préstamo'}
                            </Button>
                            <Button variant="secondary" onClick={() => navigate('/admin/prestamos')}>
                                Cancelar
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default RegistrarPrestamo;