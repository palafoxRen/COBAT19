import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import AdminLayout from './pages/AdminLayout';
import CatalogoPublico from './components/public/CatalogoPublico';
import Dashboard from './components/admin/Dashboard';
import GestionPrestamos from './components/admin/Prestamos/GestionPrestamos';
import RegistrarPrestamo from './components/admin/Prestamos/RegistrarPrestamo';
import 'bootstrap/dist/css/bootstrap.min.css';

const AppRoutes = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Cargando...</div>;

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<CatalogoPublico />} />
            <Route path="/admin" element={user ? <AdminLayout /> : <Navigate to="/login" />}>
                <Route index element={<Dashboard />} />
                <Route path="prestamos" element={<GestionPrestamos />} />
                <Route path="prestamos/nuevo" element={<RegistrarPrestamo />} />
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