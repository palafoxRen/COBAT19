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
    Folder,
    ImageIcon,
} from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import api from "../../api/axios";

const esVencido = (p) => {
    if (p.estatus_prestamo !== "Activo" || !p.fecha_limite) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const limite = new Date(p.fecha_limite);
    limite.setHours(0, 0, 0, 0);
    return limite < hoy;
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Datos reales desde la API
    const [totalLibros, setTotalLibros] = useState(0);
    const [totalEjemplares, setTotalEjemplares] = useState(0);
    const [prestamosActivos, setPrestamosActivos] = useState(0);
    const [actividadReciente, setActividadReciente] = useState([]);
    const [categorias, setCategorias] = useState([]);

    // Estado para modales
    const [showLoanModal, setShowLoanModal] = useState(false);
    const [showBookModal, setShowBookModal] = useState(false);
    const [loanForm, setLoanForm] = useState({
        inventario: "",
        usuario_identificador: "",
        tipo_usuario: "Alumno",
        fecha_limite: "",
    });
    const [bookForm, setBookForm] = useState({
        titulo: "",
        autor: "",
        dewey: "",
        inventario: "",
        categoria_id: "",
    });
    const [bookImageFile, setBookImageFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Cargar datos del dashboard
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

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
                    (p) => p.estatus_prestamo === "Activo",
                ).length;

                // Actividad reciente (últimos 5 préstamos)
                const recent = prestamos
                    .sort((a, b) => new Date(b.fecha_salida) - new Date(a.fecha_salida))
                    .slice(0, 5)
                    .map((p) => ({
                        id: p.id_prestamo,
                        type: p.estatus_prestamo === "Activo" ? "loan" : "return",
                        title: p.titulo || "Sin título",
                        user: p.usuario_nombre || p.usuario_detalles || "Desconocido",
                        time: p.fecha_salida
                            ? new Date(p.fecha_salida).toLocaleDateString()
                            : "Fecha desconocida",
                        status: esVencido(p) ? "Flagged" : "Verified",
                    }));

                // Obtener categorías (con conteo de libros)
                const categoriasRes = await api.get("/categorias");
                setCategorias(categoriasRes.data.data || []);

                setTotalLibros(totalLibrosCount);
                setTotalEjemplares(totalEjemplaresCount);
                setPrestamosActivos(activos);
                setActividadReciente(recent);
            } catch (error) {
                console.error("Error al cargar dashboard:", error);
                setError("Error al cargar los datos del dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

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
                fecha_limite: loanForm.fecha_limite || undefined,
            };

            await api.post("/prestamos", payload);

            // Recargar datos
            const prestamosRes = await api.get("/prestamos");
            const prestamos = prestamosRes.data.data || [];
            const activos = prestamos.filter(
                (p) => p.estatus_prestamo === "Activo",
            ).length;

            const recent = prestamos
                .sort((a, b) => new Date(b.fecha_salida) - new Date(a.fecha_salida))
                .slice(0, 5)
                .map((p) => ({
                    id: p.id_prestamo,
                    type: p.estatus_prestamo === "Activo" ? "loan" : "return",
                    title: p.titulo || "Sin título",
                    user: p.usuario_nombre || p.usuario_detalles || "Desconocido",
                    time: p.fecha_salida
                        ? new Date(p.fecha_salida).toLocaleDateString()
                        : "Fecha desconocida",
                    status: esVencido(p) ? "Flagged" : "Verified",
                }));

            setPrestamosActivos(activos);
            setActividadReciente(recent);
            setShowLoanModal(false);
            setLoanForm({
                inventario: "",
                usuario_identificador: "",
                tipo_usuario: "Alumno",
                fecha_limite: "",
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
            const res = await api.post("/libros", {
                titulo: bookForm.titulo,
                autor: bookForm.autor,
                dewey: bookForm.dewey,
                libro_inventario: bookForm.inventario,
                categoria_id: bookForm.categoria_id || null,
            });

            if (bookImageFile && res.data?.data?.id_libro) {
                const fd = new FormData();
                fd.append("imagen", bookImageFile);
                await api.post(`/libros/${res.data.data.id_libro}/imagen`, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            // Recargar datos
            const librosRes = await api.get("/libros");
            const libros = librosRes.data.data || [];
            setTotalLibros(libros.length);
            const totalEjemplaresCount = libros.reduce(
                (acc, l) => acc + (l.total_ejemplares || 0),
                0,
            );
            setTotalEjemplares(totalEjemplaresCount);

            const categoriasRes = await api.get("/categorias");
            setCategorias(categoriasRes.data.data || []);

            setShowBookModal(false);
            setBookForm({ titulo: "", autor: "", dewey: "", inventario: "", categoria_id: "" });
            setBookImageFile(null);
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

    if (error) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
                <p style={{ color: "#dc2626", fontSize: 16 }}>{error}</p>
                <button onClick={() => window.location.reload()} style={{ background: "#7a2333", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, cursor: "pointer" }}>
                    Reintentar
                </button>
            </div>
        );
    }

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
                    {
                        icon: Folder,
                        label: "Categorías",
                        value: categorias.length.toString(),
                        bg: "#f5f3ff",
                        color: "#6d28d9",
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
                                    <th style={{ padding: "8px 10px", fontWeight: 600 }}>Alumno/Docente</th>
                                    <th style={{ padding: "8px 10px", fontWeight: 600 }}>
                                        Fecha
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
                        CONSULTA LOS REPORTES
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

            {/* Libros por categoría */}
            <div
                style={{
                    background: "#fff",
                    border: "1px solid #ececec",
                    borderRadius: 14,
                    padding: 24,
                    marginTop: 20,
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
                    <div>
                        <h2 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700 }}>
                            Libros por categoría
                        </h2>
                        <p style={{ margin: 0, fontSize: 13, color: "#737373" }}>
                            Distribución del acervo por categoría
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/admin/libros")}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#7a2333",
                            fontSize: 13.5,
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Ver inventario
                    </button>
                </div>

                {categorias.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#a3a3a3", margin: 0 }}>
                        Aún no hay categorías registradas.
                    </p>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                        {categorias.map((c) => {
                            const max = Math.max(
                                ...categorias.map((x) => Number(x.total_libros) || 0),
                                1,
                            );
                            const pct = Math.max(
                                4,
                                Math.round(((Number(c.total_libros) || 0) / max) * 100),
                            );
                            return (
                                <div
                                    key={c.categoria_id}
                                    style={{
                                        background: "#fafafa",
                                        border: "1px solid #ececec",
                                        borderRadius: 12,
                                        padding: "16px 18px",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: 10,
                                        }}
                                    >
                                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>
                                            {c.nombre}
                                        </p>
                                        <span
                                            style={{
                                                padding: "3px 10px",
                                                borderRadius: 999,
                                                fontSize: 12,
                                                fontWeight: 700,
                                                background: "#f5f3ff",
                                                color: "#6d28d9",
                                            }}
                                        >
                                            {c.total_libros}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            height: 6,
                                            borderRadius: 999,
                                            background: "#f0f0f0",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <div
                                            style={{
                                                height: "100%",
                                                width: `${pct}%`,
                                                borderRadius: 999,
                                                background: "#7a2333",
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
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
                            <label
                                style={{ fontSize: 12.5, fontWeight: 600, color: "#404040" }}
                            >
                                Fecha de devolución
                            </label>
                            <input
                                type="date"
                                value={loanForm.fecha_limite}
                                onChange={(e) =>
                                    setLoanForm({ ...loanForm, fecha_limite: e.target.value })
                                }
                                min={new Date().toISOString().split("T")[0]}
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "10px 12px",
                                    borderRadius: 9,
                                    border: "1px solid #e0e0e0",
                                    fontSize: 14,
                                    margin: "6px 0 20px",
                                    outline: "none",
                                    background: "#fff",
                                }}
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
                                Categoría
                            </label>
                            <div style={{ position: "relative", marginBottom: 14 }}>
                                <Folder
                                    size={14}
                                    color="#a3a3a3"
                                    style={{
                                        position: "absolute",
                                        left: 10,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                    }}
                                />
                                <select
                                    value={bookForm.categoria_id}
                                    onChange={(e) =>
                                        setBookForm({ ...bookForm, categoria_id: e.target.value })
                                    }
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        padding: "10px 12px 10px 32px",
                                        borderRadius: 9,
                                        border: "1px solid #e0e0e0",
                                        fontSize: 14,
                                        outline: "none",
                                        background: "#fff",
                                        appearance: "none",
                                    }}
                                >
                                    <option value="">Sin categoría</option>
                                    {categorias.map((c) => (
                                        <option key={c.categoria_id} value={c.categoria_id}>
                                            {c.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <label
                                style={{ fontSize: 12.5, fontWeight: 600, color: "#404040" }}
                            >
                                Portada
                            </label>
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "10px 14px",
                                    borderRadius: 9,
                                    border: "1.5px dashed #e0e0e0",
                                    background: "#fafafa",
                                    cursor: "pointer",
                                    marginBottom: 14,
                                }}
                            >
                                <ImageIcon size={16} color="#a3a3a3" />
                                <span style={{ fontSize: 13, color: bookImageFile ? "#171717" : "#a3a3a3" }}>
                                    {bookImageFile ? bookImageFile.name : "Seleccionar imagen (opcional)"}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setBookImageFile(e.target.files[0] || null)}
                                    style={{ display: "none" }}
                                />
                            </label>
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