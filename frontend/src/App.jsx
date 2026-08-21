import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';
import Login from './pages/Login';
import AdminLayout from './pages/AdminLayout';
import CatalogoPublico from './components/public/CatalogoPublico';
import Buscador from './components/public/Buscador';
import DetalleLibro from './components/public/DetalleLibro';
import DetalleDigital from './components/public/DetalleDigital';
import Dashboard from './components/admin/Dashboard';
import GestionPrestamos from './components/admin/Prestamos/GestionPrestamos';
import RegistrarPrestamo from './components/admin/Prestamos/RegistrarPrestamo';
import ListaLibros from './components/admin/Libros/ListaLibros';
import FormularioLibro from './components/admin/Libros/FormularioLibro';
import EditarLibro from './components/admin/Libros/EditarLibro';
import ReporteMensual from './components/admin/Reportes/ReporteMensual';
import ListaPDF from './components/admin/Digitales/ListaPDF';
import SubirPDF from './components/admin/Digitales/SubirPDF';
import EditarDigital from './components/admin/Digitales/EditarDigital';
import Perfil from './components/admin/Perfil/Perfil';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Cargando...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <AdminLayout />;
};

const AppRoutes = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Cargando...</div>;

    return (
        <Routes>
            <Route
                path="/login"
                element={user ? <Navigate to="/admin" replace /> : <Login />}
            />
            <Route path="/" element={<CatalogoPublico />} />
            <Route path="/catalogo" element={<Buscador />} />
            <Route path="/libros/:id" element={<DetalleLibro />} />
            <Route path="/digitales/:id" element={<DetalleDigital />} />
            <Route path="/admin" element={<ProtectedRoute />}>
                <Route index element={<Dashboard />} />
                <Route path="prestamos" element={<GestionPrestamos />} />
                <Route path="prestamos/nuevo" element={<RegistrarPrestamo />} />
                <Route path="libros" element={<ListaLibros />} />
                <Route path="libros/nuevo" element={<FormularioLibro />} />
                <Route path="libros/:id/editar" element={<EditarLibro />} />
                <Route path="reportes" element={<ReporteMensual />} />
                <Route path="digitales" element={<ListaPDF />} />
                <Route path="digitales/nuevo" element={<SubirPDF />} />
                <Route path="digitales/:id/editar" element={<EditarDigital />} />
                <Route path="perfil" element={<Perfil />} />
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}

function NotFound() {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
            <h1 style={{ fontSize: 72, fontWeight: 800, color: "#7a2333", margin: "0 0 8px" }}>404</h1>
            <p style={{ fontSize: 18, color: "#525252", margin: "0 0 24px" }}>Página no encontrada</p>
            <a href="/" style={{ background: "#7a2333", color: "#fff", padding: "10px 28px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
                Volver al inicio
            </a>
        </div>
    );
}

export default App;