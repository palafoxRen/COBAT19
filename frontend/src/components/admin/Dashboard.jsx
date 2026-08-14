import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    BookOpen,
    Copy,
    Clock,
    RotateCcw,
    Plus,
    FileText,
    ChevronRight,
    CheckCircle2,
    X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    // Datos reales desde la API
    const [totalLibros, setTotalLibros] = useState(0);
    const [totalEjemplares, setTotalEjemplares] = useState(0);
    const [prestamosActivos, setPrestamosActivos] = useState(0);
    const [prestamosVencidos, setPrestamosVencidos] = useState(0);
    const [actividadReciente, setActividadReciente] = useState([]);

    // Estado para modales
    const [showLoanModal, setShowLoanModal] = useState(false);
    const [showBookModal, setShowBookModal] = useState(false);
    const [loanForm, setLoanForm] = useState({
        inventario: "",
        usuario_identificador: "",
        tipo_usuario: "Alumno",
    });
    const [bookForm, setBookForm] = useState({
        titulo: "",
        autor: "",
        dewey: "",
        inventario: "",
    });
    const [notifOpen, setNotifOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Cargar datos del dashboard
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Obtener libros (para estadísticas)
                const librosRes = await api.get("/libros");
                const libros = librosRes.data.data || [];
                const totalLibrosCount = libros.length;
                const totalEjemplaresCount = libros.reduce(
                    (acc, l) => acc + (l.total_ejemplares || 0),
                    0,
                );

                // Obtener préstamos
                const prestamosRes = await api.get("/prestamos");
                const prestamos = prestamosRes.data.data || [];
                const activos = prestamos.filter(
                    (p) => p.estado_prestamo === "Activo",
                ).length;
                const vencidos = prestamos.filter(
                    (p) => p.estado_prestamo === "Vencido",
                ).length;

                // Actividad reciente (últimos 5 préstamos)
                const recent = prestamos
                    .sort((a, b) => new Date(b.fecha_salida) - new Date(a.fecha_salida))
                    .slice(0, 5)
                    .map((p) => ({
                        id: p.prestamo_id,
                        type: p.estado_prestamo === "Activo" ? "loan" : "return",
                        title: p.titulo || "Sin título",
                        user: p.usuario_nombre || p.usuario_identificador || "Desconocido",
                        time: p.fecha_salida
                            ? new Date(p.fecha_salida).toLocaleDateString()
                            : "Fecha desconocida",
                        status: p.estado_prestamo === "Vencido" ? "Flagged" : "Verified",
                    }));

                setTotalLibros(totalLibrosCount);
                setTotalEjemplares(totalEjemplaresCount);
                setPrestamosActivos(activos);
                setPrestamosVencidos(vencidos);
                setActividadReciente(recent);
            } catch (error) {
                console.error("Error al cargar dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Redirigir al login si no hay usuario
    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    // Registrar préstamo (real)
    const handleRegisterLoan = async (e) => {
        e.preventDefault();
        if (!loanForm.inventario.trim() || !loanForm.usuario_identificador.trim()) {
            alert("Debe completar todos los campos del préstamo.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                inventario: loanForm.inventario,
                tipo_usuario: loanForm.tipo_usuario,
                usuario_identificador: loanForm.usuario_identificador,
            };

            await api.post("/prestamos", payload);

            // Recargar datos
            const prestamosRes = await api.get("/prestamos");
            const prestamos = prestamosRes.data.data || [];
            const activos = prestamos.filter(
                (p) => p.estado_prestamo === "Activo",
            ).length;
            const vencidos = prestamos.filter(
                (p) => p.estado_prestamo === "Vencido",
            ).length;

            const recent = prestamos
                .sort((a, b) => new Date(b.fecha_salida) - new Date(a.fecha_salida))
                .slice(0, 5)
                .map((p) => ({
                    id: p.prestamo_id,
                    type: p.estado_prestamo === "Activo" ? "loan" : "return",
                    title: p.titulo || "Sin título",
                    user: p.usuario_nombre || p.usuario_identificador || "Desconocido",
                    time: p.fecha_salida
                        ? new Date(p.fecha_salida).toLocaleDateString()
                        : "Fecha desconocida",
                    status: p.estado_prestamo === "Vencido" ? "Flagged" : "Verified",
                }));

            setPrestamosActivos(activos);
            setPrestamosVencidos(vencidos);
            setActividadReciente(recent);
            setShowLoanModal(false);
            setLoanForm({
                inventario: "",
                usuario_identificador: "",
                tipo_usuario: "Alumno",
            });
            alert("Préstamo registrado exitosamente.");
        } catch (error) {
            alert(error.response?.data?.message || "Error al registrar el préstamo.");
        } finally {
            setSubmitting(false);
        }
    };

    // Añadir libro (real)
    const handleAddBook = async (e) => {
        e.preventDefault();
        if (
            !bookForm.titulo.trim() ||
            !bookForm.autor.trim() ||
            !bookForm.dewey.trim() ||
            !bookForm.inventario.trim()
        ) {
            alert("Debe completar todos los campos del libro.");
            return;
        }

        setSubmitting(true);
        try {
            await api.post("/libros", {
                titulo: bookForm.titulo,
                autor: bookForm.autor,
                dewey: bookForm.dewey,
                libro_inventario: bookForm.inventario,
            });

            // Recargar datos
            const librosRes = await api.get("/libros");
            const libros = librosRes.data.data || [];
            setTotalLibros(libros.length);
            const totalEjemplaresCount = libros.reduce(
                (acc, l) => acc + (l.total_ejemplares || 0),
                0,
            );
            setTotalEjemplares(totalEjemplaresCount);

            setShowBookModal(false);
            setBookForm({ titulo: "", autor: "", dewey: "", inventario: "" });
            alert("Libro agregado exitosamente.");
        } catch (error) {
            alert(error.response?.data?.message || "Error al agregar el libro.");
        } finally {
            setSubmitting(false);
        }
    };

    // Reporte mensual
    const handleReporteMensual = () => {
        navigate("/admin/reportes");
    };

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                }}
            >
                <p>Cargando dashboard...</p>
            </div>
        );
    }

    const notReturnedCount = prestamosVencidos + prestamosActivos;

    return (
        <>
            {/* Título y estado */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 12,
                    marginBottom: 28,
                }}
            >
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>
                        Dashboard de la biblioteca
                    </h1>
                    <p style={{ margin: 0, fontSize: 14, color: "#737373" }}>
                        Bienvenido de nuevo {user?.nombre || "Bibliotecario"}. Aquí tienes
                        las novedades
                    </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            background: "#f5e0e3",
                            color: "#7a2333",
                            border: "1px solid #e8ccd0",
                            borderRadius: 999,
                            padding: "5px 12px",
                            fontSize: 12.5,
                            fontWeight: 600,
                        }}
                    >
                        <CheckCircle2 size={13} />
                        Todo sincronizado
                    </span>
                    <span style={{ fontSize: 12.5, color: "#a3a3a3" }}>
                        Ult. actualización: {new Date().toLocaleTimeString()}
                    </span>
                </div>
            </div>

            {/* Stat cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 18,
                    marginBottom: 28,
                }}
            >
                {[
                    {
                        icon: Copy,
                        label: "Libros totales",
                        value: totalLibros.toLocaleString(),
                        bg: "#f5e0e3",
                        color: "#7a2333",
                    },
                    {
                        icon: BookOpen,
                        label: "Ejemplares totales",
                        value: totalEjemplares.toLocaleString(),
                        bg: "#f0f0f0",
                        color: "#404040",
                    },
                    {
                        icon: Clock,
                        label: "Préstamos activos",
                        value: prestamosActivos.toString(),
                        bg: "#fdeceb",
                        color: "#c0392b",
                    },
                ].map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.label}
                            style={{
                                background: "#fff",
                                border: "1px solid #ececec",
                                borderRadius: 14,
                                padding: "20px 22px",
                            }}
                        >
                            <div
                                style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 10,
                                    background: card.bg,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: 16,
                                }}
                            >
                                <Icon size={18} color={card.color} />
                            </div>
                            <p
                                style={{ margin: "0 0 4px", fontSize: 13.5, color: "#737373" }}
                            >
                                {card.label}
                            </p>
                            <p style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>
                                {card.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Actividad + Quick actions */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: 20,
                    alignItems: "start",
                }}
            >
                {/* Actividad reciente */}
                <div
                    style={{
                        background: "#fff",
                        border: "1px solid #ececec",
                        borderRadius: 14,
                        padding: 24,
                        overflowX: "auto",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: 18,
                        }}
                    >
                        <div>
                            <h2 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700 }}>
                                Actividad reciente
                            </h2>
                            <p style={{ margin: 0, fontSize: 13, color: "#737373" }}>
                                Actualizaciones desde la biblioteca
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/admin/prestamos")}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#7a2333",
                                fontSize: 13.5,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Ver todos los préstamos
                        </button>
                    </div>

                    {actividadReciente.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#737373" }}>
                            No hay actividad reciente.
                        </p>
                    ) : (
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: 13.5,
                            }}
                        >
                            <thead>
                                <tr style={{ textAlign: "left", color: "#737373" }}>
                                    <th style={{ padding: "8px 10px", fontWeight: 600 }}>Tipo</th>
                                    <th style={{ padding: "8px 10px", fontWeight: 600 }}>
                                        Título
                                    </th>
                                    <th style={{ padding: "8px 10px", fontWeight: 600 }}>User</th>
                                    <th style={{ padding: "8px 10px", fontWeight: 600 }}>
                                        Timestamp
                                    </th>
                                    <th style={{ padding: "8px 10px", fontWeight: 600 }}>
                                        Estado
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {actividadReciente.map((row) => {
                                    const Icon = row.type === "loan" ? BookOpen : RotateCcw;
                                    return (
                                        <tr key={row.id} style={{ borderTop: "1px solid #f2f2f2" }}>
                                            <td style={{ padding: "12px 10px", color: "#525252" }}>
                                                <span
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                    }}
                                                >
                                                    <Icon size={14} />
                                                    {row.type === "loan" ? "Préstamo" : "Devolución"}
                                                </span>
                                            </td>
                                            <td style={{ padding: "12px 10px", fontWeight: 600 }}>
                                                {row.title}
                                            </td>
                                            <td style={{ padding: "12px 10px", color: "#525252" }}>
                                                {row.user}
                                            </td>
                                            <td style={{ padding: "12px 10px", color: "#a3a3a3" }}>
                                                {row.time}
                                            </td>
                                            <td style={{ padding: "12px 10px" }}>
                                                <span
                                                    style={{
                                                        padding: "3px 10px",
                                                        borderRadius: 999,
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        background:
                                                            row.status === "Flagged" ? "#dc2626" : "#f0f0f0",
                                                        color:
                                                            row.status === "Flagged" ? "#fff" : "#404040",
                                                    }}
                                                >
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Quick actions */}
                <div
                    style={{
                        background: "#fff",
                        border: "1px solid #ececec",
                        borderRadius: 14,
                        padding: 24,
                    }}
                >
                    <h2 style={{ margin: "0 0 2px", fontSize: 17, fontWeight: 700 }}>
                        Acciones rápidas
                    </h2>
                    <p style={{ margin: "0 0 18px", fontSize: 13, color: "#737373" }}>
                        En un sólo click.
                    </p>

                    <button
                        onClick={() => setShowLoanModal(true)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            width: "100%",
                            background: "#7a2333",
                            color: "#fff",
                            border: "none",
                            borderRadius: 10,
                            padding: "13px 16px",
                            fontSize: 14.5,
                            fontWeight: 600,
                            cursor: "pointer",
                            marginBottom: 10,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#6e1c28")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#7a2333")}
                    >
                        <Plus size={17} />
                        Registrar préstamo
                    </button>

                    <button
                        onClick={() => setShowBookModal(true)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            width: "100%",
                            background: "#fff",
                            color: "#171717",
                            border: "1px solid #e0e0e0",
                            borderRadius: 10,
                            padding: "13px 16px",
                            fontSize: 14.5,
                            fontWeight: 600,
                            cursor: "pointer",
                            marginBottom: 20,
                        }}
                    >
                        <Copy size={17} />
                        Añadir nuevo libro
                    </button>

                    <p
                        style={{
                            fontSize: 11.5,
                            fontWeight: 700,
                            letterSpacing: 0.4,
                            color: "#a3a3a3",
                            margin: "0 0 10px",
                        }}
                    >
                        ADMIN REPORTS
                    </p>
                    <button
                        onClick={handleReporteMensual}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            background: "none",
                            border: "none",
                            padding: "10px 0",
                            fontSize: 14,
                            color: "#171717",
                            cursor: "pointer",
                        }}
                    >
                        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <FileText size={16} color="#737373" />
                            Reporte mensual
                        </span>
                        <ChevronRight size={15} color="#a3a3a3" />
                    </button>
                </div>
            </div>
            {/* Modal: registrar préstamo */}
            {showLoanModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 50,
                    }}
                    onClick={() => setShowLoanModal(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            borderRadius: 14,
                            padding: 28,
                            width: 380,
                            maxWidth: "90%",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 18,
                            }}
                        >
                            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                                Registrar préstamo
                            </h3>
                            <button
                                onClick={() => setShowLoanModal(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                <X size={18} color="#737373" />
                            </button>
                        </div>
                        <form onSubmit={handleRegisterLoan}>
                            <label
                                style={{ fontSize: 12.5, fontWeight: 600, color: "#404040" }}
                            >
                                Código de inventario
                            </label>
                            <input
                                type="text"
                                value={loanForm.inventario}
                                onChange={(e) =>
                                    setLoanForm({ ...loanForm, inventario: e.target.value })
                                }
                                placeholder="Ej. 16-CB19-00001"
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "10px 12px",
                                    borderRadius: 9,
                                    border: "1px solid #e0e0e0",
                                    fontSize: 14,
                                    margin: "6px 0 14px",
                                    outline: "none",
                                }}
                                required
                            />
                            <label
                                style={{ fontSize: 12.5, fontWeight: 600, color: "#404040" }}
                            >
                                Tipo de usuario
                            </label>
                            <select
                                value={loanForm.tipo_usuario}
                                onChange={(e) =>
                                    setLoanForm({ ...loanForm, tipo_usuario: e.target.value })
                                }
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "10px 12px",
                                    borderRadius: 9,
                                    border: "1px solid #e0e0e0",
                                    fontSize: 14,
                                    margin: "6px 0 14px",
                                    outline: "none",
                                    background: "#fff",
                                }}
                            >
                                <option value="Alumno">Alumno</option>
                                <option value="Docente">Docente</option>
                            </select>
                            <label
                                style={{ fontSize: 12.5, fontWeight: 600, color: "#404040" }}
                            >
                                {loanForm.tipo_usuario === "Alumno"
                                    ? "Matrícula del alumno"
                                    : "Nombre del docente"}
                            </label>
                            <input
                                type="text"
                                value={loanForm.usuario_identificador}
                                onChange={(e) =>
                                    setLoanForm({
                                        ...loanForm,
                                        usuario_identificador: e.target.value,
                                    })
                                }
                                placeholder={
                                    loanForm.tipo_usuario === "Alumno"
                                        ? "Ej. STU-2023-045"
                                        : "Dr. Juan Pérez"
                                }
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "10px 12px",
                                    borderRadius: 9,
                                    border: "1px solid #e0e0e0",
                                    fontSize: 14,
                                    margin: "6px 0 20px",
                                    outline: "none",
                                }}
                                required
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    width: "100%",
                                    background: "#7a2333",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 10,
                                    padding: "12px 0",
                                    fontSize: 14.5,
                                    fontWeight: 700,
                                    cursor: submitting ? "default" : "pointer",
                                    opacity: submitting ? 0.7 : 1,
                                }}
                            >
                                {submitting ? "Registrando..." : "Confirmar préstamo"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: añadir libro */}
            {showBookModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 50,
                    }}
                    onClick={() => setShowBookModal(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            borderRadius: 14,
                            padding: 28,
                            width: 380,
                            maxWidth: "90%",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 18,
                            }}
                        >
                            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                                Añadir nuevo libro
                            </h3>
                            <button
                                onClick={() => setShowBookModal(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                <X size={18} color="#737373" />
                            </button>
                        </div>
                        <form onSubmit={handleAddBook}>
                            <label
                                style={{ fontSize: 12.5, fontWeight: 600, color: "#404040" }}
                            >
                                Título del libro
                            </label>
                            <input
                                type="text"
                                value={bookForm.titulo}
                                onChange={(e) =>
                                    setBookForm({ ...bookForm, titulo: e.target.value })
                                }
                                placeholder="Ej. Cien Años de Soledad"
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "10px 12px",
                                    borderRadius: 9,
                                    border: "1px solid #e0e0e0",
                                    fontSize: 14,
                                    margin: "6px 0 14px",
                                    outline: "none",
                                }}
                                required
                            />
                            <label
                                style={{ fontSize: 12.5, fontWeight: 600, color: "#404040" }}
                            >
                                Autor
                            </label>
                            <input
                                type="text"
                                value={bookForm.autor}
                                onChange={(e) =>
                                    setBookForm({ ...bookForm, autor: e.target.value })
                                }
                                placeholder="Ej. Gabriel García Márquez"
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "10px 12px",
                                    borderRadius: 9,
                                    border: "1px solid #e0e0e0",
                                    fontSize: 14,
                                    margin: "6px 0 14px",
                                    outline: "none",
                                }}
                                required
                            />
                            <label
                                style={{ fontSize: 12.5, fontWeight: 600, color: "#404040" }}
                            >
                                Código Dewey
                            </label>
                            <input
                                type="text"
                                value={bookForm.dewey}
                                onChange={(e) =>
                                    setBookForm({ ...bookForm, dewey: e.target.value })
                                }
                                placeholder="Ej. 863.64"
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "10px 12px",
                                    borderRadius: 9,
                                    border: "1px solid #e0e0e0",
                                    fontSize: 14,
                                    margin: "6px 0 14px",
                                    outline: "none",
                                }}
                                required
                            />
                            <label
                                style={{ fontSize: 12.5, fontWeight: 600, color: "#404040" }}
                            >
                                Código de inventario (primer ejemplar)
                            </label>
                            <input
                                type="text"
                                value={bookForm.inventario}
                                onChange={(e) =>
                                    setBookForm({ ...bookForm, inventario: e.target.value })
                                }
                                placeholder="Ej. 16-CB19-00001"
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "10px 12px",
                                    borderRadius: 9,
                                    border: "1px solid #e0e0e0",
                                    fontSize: 14,
                                    margin: "6px 0 20px",
                                    outline: "none",
                                }}
                                required
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    width: "100%",
                                    background: "#7a2333",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 10,
                                    padding: "12px 0",
                                    fontSize: 14.5,
                                    fontWeight: 700,
                                    cursor: submitting ? "default" : "pointer",
                                    opacity: submitting ? 0.7 : 1,
                                }}
                            >
                                {submitting ? "Agregando..." : "Añadir al inventario"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}