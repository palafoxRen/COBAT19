import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <div className="bg-dark text-white p-3" style={{ width: '250px', minHeight: '100vh' }}>
                <h5 className="mb-4">Biblioteca COBAT 19</h5>
                <ul className="nav flex-column">
                    <li className="nav-item">
                        <Link to="/admin" className="nav-link text-white">Dashboard</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/admin/libros" className="nav-link text-white">Inventario</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/admin/prestamos" className="nav-link text-white">Préstamos</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/admin/digitales" className="nav-link text-white">Libros Digitales</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/admin/reportes" className="nav-link text-white">Reportes</Link>
                    </li>
                </ul>
                <hr className="border-light" />
                <button className="btn btn-outline-light btn-sm w-100" onClick={handleLogout}>
                    Cerrar sesión
                </button>
            </div>

            {/* Contenido principal */}
            <div className="flex-grow-1">
                <Navbar bg="light" expand="lg" className="px-3 border-bottom">
                    <Container fluid>
                        <Navbar.Brand>Panel de Administración</Navbar.Brand>
                        <Nav className="ms-auto">
                            <NavDropdown title={user?.nombre_completo || 'Admin'} id="basic-nav-dropdown">
                                <NavDropdown.Item onClick={handleLogout}>Cerrar sesión</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Container>
                </Navbar>
                <Container fluid className="p-4">
                    <Outlet />
                </Container>
            </div>
        </div>
    );
};

export default AdminLayout;