import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import {
    BookOpen,
    Library,
    Bell,
    LayoutGrid,
    ClipboardList,
    FileText,
    User,
    LogOut,
    ChevronRight,
    Users,
} from "lucide-react";

const NAV_ITEMS = [
    { to: "/admin", label: "Dashboard", icon: LayoutGrid, end: true },
    { to: "/admin/libros", label: "Inventario", icon: Library },
    { to: "/admin/prestamos", label: "Préstamos", icon: ClipboardList },
    { to: "/admin/reportes", label: "Reporte mensual", icon: FileText },
    { to: "/admin/digitales", label: "Libros digitales", icon: BookOpen },
    { to: "/admin/usuarios", label: "Usuarios", icon: Users, adminOnly: true },
];

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm("¿Cerrar sesión?")) {
            logout();
            navigate("/login");
        }
    };

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                fontFamily:
                    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                background: "#fafafa",
                color: "#171717",
            }}
        >
            {/* Sidebar */}
            <aside
                style={{
                    width: 260,
                    background: "#fff",
                    borderRight: "1px solid #ececec",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    flexShrink: 0,
                }}
            >
                <div>
                    {/* Logo */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "20px 24px",
                            borderBottom: "1px solid #ececec",
                        }}
                    >
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: "#7a2333",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <BookOpen size={17} color="#fff" />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 16, color: "#7a2333" }}>
                            Biblioteca COBAT 19
                        </span>
                    </div>

                    {/* Nav */}
                    <nav
                        style={{
                            padding: 16,
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                        }}
                    >
                        {NAV_ITEMS.filter(item => !item.adminOnly || user?.rol === "Administrador").map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    style={({ isActive }) => ({
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 10,
                                        width: "100%",
                                        padding: "10px 14px",
                                        borderRadius: 9,
                                        border: "none",
                                        background: isActive ? "#7a2333" : "transparent",
                                        color: isActive ? "#fff" : "#404040",
                                        fontSize: 14.5,
                                        fontWeight: isActive ? 600 : 500,
                                        textAlign: "left",
                                        textDecoration: "none",
                                        boxSizing: "border-box",
                                    })}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <span
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 10,
                                                }}
                                            >
                                                <Icon size={17} />
                                                {item.label}
                                            </span>
                                            {isActive && <ChevronRight size={15} />}
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div style={{ padding: 20, borderTop: "1px solid #ececec", display: "flex", flexDirection: "column", gap: 8 }}>
                    <NavLink
                        to="/admin/perfil"
                        style={({ isActive }) => ({
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "9px 12px", borderRadius: 9,
                            background: isActive ? "#f5f5f5" : "transparent",
                            color: isActive ? "#7a2333" : "#404040",
                            fontSize: 14, fontWeight: isActive ? 600 : 500,
                            textDecoration: "none",
                        })}
                    >
                        <User size={16} />
                        Mi perfil
                    </NavLink>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: "flex", alignItems: "center", gap: 8,
                            background: "none", border: "none",
                            color: "#dc2626", fontSize: 14, fontWeight: 600,
                            cursor: "pointer", padding: "9px 12px",
                            borderRadius: 9, textAlign: "left",
                        }}
                    >
                        <LogOut size={16} />
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                }}
            >
                {/* Header */}
                <header
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 32px",
                        background: "#fff",
                        borderBottom: "1px solid #ececec",
                    }}
                >
                    <div />
                    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                        <button
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                position: "relative",
                                padding: 4,
                            }}
                        >
                            <Bell size={19} color="#404040" />
                        </button>

                        <div
                            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                            onClick={() => navigate("/admin/perfil")}
                        >
                            <div style={{ textAlign: "right" }}>
                                <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>
                                    {user?.nombre || "Bibliotecario"}
                                </p>
                                <p style={{ margin: 0, fontSize: 12, color: "#737373" }}>
                                    {user?.rol || "Bibliotecario"}
                                </p>
                            </div>
                            <div
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: "50%",
                                    background: "#7a2333",
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                    fontSize: 13.5,
                                }}
                            >
                                {user?.nombre ? user.nombre.charAt(0).toUpperCase() : "B"}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Contenido de cada página de /admin */}
                <main style={{ padding: 32, flex: 1 }}>
                    <Outlet />
                </main>

                {/* Footer */}
                <footer
                    style={{
                        borderTop: "1px solid #ececec",
                        padding: "16px 32px",
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 10,
                        fontSize: 12.5,
                        color: "#a3a3a3",
                    }}
                >
                    <span>
                        © 2026 Biblioteca COBAT 19. Sistema de Gestión Bibliotecaria.
                    </span>
                    <span style={{ display: "flex", gap: 20 }}>
                        <a
                            href="/privacidad"
                            style={{ color: "#a3a3a3", textDecoration: "none" }}
                        >
                            Política de privacidad
                        </a>
                        <a
                            href="/terminos"
                            style={{ color: "#a3a3a3", textDecoration: "none" }}
                        >
                            Términos y condiciones
                        </a>
                    </span>
                </footer>
            </div>
        </div>
    );
};

export default AdminLayout;