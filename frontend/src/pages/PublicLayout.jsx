// src/pages/PublicLayout.jsx
import { Outlet, Link } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';

const PublicLayout = () => {
    return (
        <>
            <Navbar bg="light" expand="lg" className="border-bottom">
                <Container>
                    <Navbar.Brand as={Link} to="/">
                        Biblioteca COBAT 19
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
                            <Nav.Link as={Link} to="/admin">Acceso bibliotecarios</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container className="py-4">
                <Outlet />
            </Container>
            <footer className="bg-light border-top mt-5 py-3">
                <Container className="text-center text-muted small">
                    © 2026 Biblioteca COBAT 19. Sistema de Gestión Bibliotecaria.
                </Container>
            </footer>
        </>
    );
};

export default PublicLayout;