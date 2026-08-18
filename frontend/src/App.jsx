import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';
import Login from './pages/Login';
import AdminLayout from './pages/AdminLayout';
import CatalogoPublico from './components/public/CatalogoPublico';
import Buscador from './components/public/Buscador';
import Dashboard from './components/admin/Dashboard';
import GestionPrestamos from './components/admin/Prestamos/GestionPrestamos';
import RegistrarPrestamo from './components/admin/Prestamos/RegistrarPrestamo';
import ListaLibros from './components/admin/Libros/ListaLibros';
import FormularioLibro from './components/admin/Libros/FormularioLibro';
import EditarLibro from './components/admin/Libros/EditarLibro';
import ReporteMensual from './components/admin/Reportes/ReporteMensual';
import ListaPDF from './components/admin/Digitales/ListaPDF';
import SubirPDF from './components/admin/Digitales/SubirPDF';
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
            </Route>
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

export default App;