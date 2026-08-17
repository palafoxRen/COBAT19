import { useState, useEffect, useMemo } from "react";
import {
    CheckCircle2,
    AlertCircle,
    Clock,
    Search,
    RotateCcw,
    Plus,
    User,
    Bookmark,
    Calendar,
    ChevronDown,
} from "lucide-react";
import api from "../../../api/axios";

// Días de anticipación para marcar un préstamo como "Próximo" a vencer.
const DIAS_PROXIMO = 3;

const STATUS_STYLES = {
    Retrasado: { bg: "#dc2626", color: "#fff" },
    Próximo: { bg: "#f5e0e3", color: "#7a2333" },
    Activo: { bg: "#f0f0f0", color: "#404040" },
};

const TABS = ["Todos", "Retrasado", "Próximo"];

const initialsFrom = (text) => {
    if (!text) return "??";
    const parts = text.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "??";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function GestionPrestamos() {
    const [prestamos, setPrestamos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("Todos");
    const [search, setSearch] = useState("");

    const [form, setForm] = useState({
        bookId: "",
        personType: "",
        name: "",
        matricula: "",
        dueDate: "",
    });

    useEffect(() => {
        cargarPrestamos();
    }, []);

    const cargarPrestamos = async () => {
        setCargando(true);
        try {
            const res = await api.get("/prestamos");
            setPrestamos(res.data.data || []);
        } catch (error) {
            console.error("Error al cargar préstamos:", error);
        } finally {
            setCargando(false);
        }
    };

    // Convierte un registro del backend al formato que necesita la tabla,
    // y excluye los ya devueltos (esta vista es para dar seguimiento a los pendientes).
    //
    // Nota: el backend nunca guarda estatus_prestamo = "Vencido" (solo usa
    // "Activo" y "Devuelto"), así que el retraso se calcula aquí comparando
    // fecha_limite contra hoy, no leyendo ese estado.
    const loans = useMemo(() => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return prestamos
            .filter((p) => p.estatus_prestamo !== "Devuelto")
            .map((p) => {
                let status = "Activo";
                if (p.fecha_limite) {
                    const limite = new Date(p.fecha_limite);
                    limite.setHours(0, 0, 0, 0);
                    const diffDias = Math.round((limite - hoy) / (1000 * 60 * 60 * 24));
                    if (diffDias < 0) {
                        status = "Retrasado";
                    } else if (diffDias <= DIAS_PROXIMO) {
                        status = "Próximo";
                    }
                }

                return {
                    id: p.id_prestamo,
                    userType: p.tipo_usuario === "Alumno" ? "Alumno/a" : "Docente",
                    userLabel: p.usuario_detalles,
                    initials: initialsFrom(p.usuario_nombre || p.usuario_detalles),
                    book: p.titulo || "Sin título",
                    bookId: p.libro_inventario,
                    loanDate: p.fecha_salida
                        ? new Date(p.fecha_salida).toLocaleDateString()
                        : "-",
                    dueDate: p.fecha_limite
                        ? new Date(p.fecha_limite).toLocaleDateString()
                        : "-",
                    status,
                };
            });
    }, [prestamos]);

    // Devueltos hoy: usa fecha_devolucion, que el backend sí guarda al
    // registrar una devolución (a diferencia de "Vencido", este campo es real).
    const returnedToday = useMemo(() => {
        const hoyStr = new Date().toLocaleDateString();
        return prestamos.filter(
            (p) =>
                p.estatus_prestamo === "Devuelto" &&
                p.fecha_devolucion &&
                new Date(p.fecha_devolucion).toLocaleDateString() === hoyStr,
        ).length;
    }, [prestamos]);

    const overdueCount = loans.filter((l) => l.status === "Retrasado").length;
    const upcomingCount = loans.filter((l) => l.status === "Próximo").length;

    const filteredLoans = useMemo(() => {
        let list = loans;
        if (activeTab !== "Todos") {
            list = list.filter((l) => l.status === activeTab);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (l) =>
                    l.userLabel?.toLowerCase().includes(q) ||
                    l.book.toLowerCase().includes(q) ||
                    l.bookId?.toLowerCase().includes(q),
            );
        }
        return list;
    }, [loans, activeTab, search]);

    const handleReturn = async (prestamoId) => {
        if (!window.confirm("¿Confirmar devolución de este libro?")) return;
        try {
            await api.put(`/prestamos/${prestamoId}/devolver`, {});
            cargarPrestamos();
        } catch (error) {
            alert("Error al devolver el libro");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (
            !form.bookId.trim() ||
            !form.personType ||
            !form.name.trim() ||
            !form.matricula.trim() ||
            !form.dueDate
        ) {
            alert("Por favor completa todos los campos.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                inventario: form.bookId,
                tipo_usuario: form.personType === "Alumno/a" ? "Alumno" : "Docente",
                usuario_identificador: form.matricula,
                usuario_nombre: form.name,
                fecha_limite: form.dueDate,
            };

            await api.post("/prestamos", payload);
            setForm({
                bookId: "",
                personType: "",
                name: "",
                matricula: "",
                dueDate: "",
            });
            alert("Préstamo registrado correctamente.");
            cargarPrestamos();
        } catch (error) {
            alert(error.response?.data?.message || "Error al registrar el préstamo");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Título + stats */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 20,
                    marginBottom: 28,
                }}
            >
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>
                        Gestión de préstamos
                    </h1>
                    <p
                        style={{ margin: 0, fontSize: 14, color: "#737373", maxWidth: 420 }}
                    >
                        Realice el seguimiento de las devoluciones y registre nuevas
                        solicitudes de préstamo.
                    </p>
                </div>

                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    {[
                        {
                            icon: CheckCircle2,
                            label: "Devueltos hoy",
                            value: returnedToday,
                            color: "#171717",
                            iconBg: "#f0f0f0",
                            iconColor: "#404040",
                        },
                        {
                            icon: AlertCircle,
                            label: "Devoluciones atrasadas",
                            value: String(overdueCount).padStart(2, "0"),
                            color: "#171717",
                            iconBg: "#fdeceb",
                            iconColor: "#dc2626",
                        },
                        {
                            icon: Clock,
                            label: "Próximas devoluciones",
                            value: String(upcomingCount).padStart(2, "0"),
                            color: "#171717",
                            iconBg: "#f5e0e3",
                            iconColor: "#7a2333",
                        },
                    ].map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.label}
                                style={{
                                    background: "#fff",
                                    border: "1px solid #ececec",
                                    borderRadius: 12,
                                    padding: "14px 20px",
                                    minWidth: 150,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                    }}
                                >
                                    <p style={{ margin: 0, fontSize: 12.5, color: "#737373" }}>
                                        {stat.label}
                                    </p>
                                    <div
                                        style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: "50%",
                                            background: stat.iconBg,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Icon size={13} color={stat.iconColor} />
                                    </div>
                                </div>
                                <p style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 800 }}>
                                    {stat.value}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "340px 1fr",
                    gap: 20,
                    alignItems: "start",
                }}
            >
                {/* Formulario nuevo préstamo */}
                <div
                    style={{
                        background: "#fff",
                        border: "1px solid #ececec",
                        borderRadius: 14,
                        padding: 24,
                    }}
                >
                    <h2
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            margin: "0 0 6px",
                            fontSize: 17,
                            fontWeight: 700,
                        }}
                    >
                        <Plus size={18} color="#7a2333" />
                        Nuevo préstamo
                    </h2>
                    <p style={{ margin: "0 0 20px", fontSize: 13, color: "#737373" }}>
                        Ingrese los datos del estudiante o del docente y del libro.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <FieldLabel>ID del libro</FieldLabel>
                        <IconInput
                            icon={Bookmark}
                            placeholder="00-CB19-00000"
                            value={form.bookId}
                            onChange={(v) => setForm({ ...form, bookId: v })}
                        />
                        <FieldHint>Ingrese el número de inventario</FieldHint>

                        <FieldLabel>Alumno/Docente</FieldLabel>
                        <div style={{ position: "relative", marginBottom: 4 }}>
                            <select
                                value={form.personType}
                                onChange={(e) =>
                                    setForm({ ...form, personType: e.target.value })
                                }
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "11px 12px",
                                    borderRadius: 10,
                                    border: "1px solid #e0e0e0",
                                    fontSize: 14,
                                    color: form.personType ? "#171717" : "#a3a3a3",
                                    outline: "none",
                                    appearance: "none",
                                    background: "#fff",
                                }}
                            >
                                <option value="">Seleccione una opción</option>
                                <option value="Alumno/a">Alumno/a</option>
                                <option value="Docente">Docente</option>
                            </select>
                            <ChevronDown
                                size={15}
                                color="#a3a3a3"
                                style={{
                                    position: "absolute",
                                    right: 12,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    pointerEvents: "none",
                                }}
                            />
                        </div>
                        <FieldHint>Indique si es alumno o docente</FieldHint>

                        <FieldLabel>Nombre</FieldLabel>
                        <IconInput
                            icon={User}
                            placeholder="Nombre completo"
                            value={form.name}
                            onChange={(v) => setForm({ ...form, name: v })}
                        />
                        <FieldHint>Ingrese el nombre del docente o alumno</FieldHint>

                        <FieldLabel>Matrícula del alumno</FieldLabel>
                        <IconInput
                            icon={User}
                            placeholder="20B19000000"
                            value={form.matricula}
                            onChange={(v) => setForm({ ...form, matricula: v })}
                        />
                        <FieldHint>Ingrese la matrícula del alumno</FieldHint>

                        <FieldLabel>Fecha límite de devolución</FieldLabel>
                        <IconInput
                            icon={Calendar}
                            type="date"
                            value={form.dueDate}
                            onChange={(v) => setForm({ ...form, dueDate: v })}
                            marginBottom={20}
                        />

                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                width: "100%",
                                background: submitting ? "#a85a68" : "#7a2333",
                                color: "#fff",
                                border: "none",
                                borderRadius: 10,
                                padding: "13px 0",
                                fontSize: 14.5,
                                fontWeight: 700,
                                cursor: submitting ? "default" : "pointer",
                            }}
                            onMouseEnter={(e) => {
                                if (!submitting) e.currentTarget.style.background = "#6e1c28";
                            }}
                            onMouseLeave={(e) => {
                                if (!submitting) e.currentTarget.style.background = "#7a2333";
                            }}
                        >
                            {submitting ? "Registrando..." : "Completar registro"}
                        </button>
                    </form>

                    <div
                        style={{
                            marginTop: 18,
                            background: "#faf7f7",
                            border: "1px solid #ececec",
                            borderRadius: 10,
                            padding: "12px 14px",
                        }}
                    >
                        <p
                            style={{
                                margin: 0,
                                fontSize: 12.5,
                                color: "#737373",
                                fontStyle: "italic",
                                textAlign: "center",
                            }}
                        >
                            Recordatorio: Alumnos que no devuelvan a tiempo el libro no podrán
                            pedir otro libro.
                        </p>
                    </div>
                </div>

                {/* Lista de préstamos */}
                <div
                    style={{
                        background: "#fff",
                        border: "1px solid #ececec",
                        borderRadius: 14,
                        padding: 24,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 12,
                            marginBottom: 20,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                gap: 6,
                                background: "#f7f7f7",
                                borderRadius: 9,
                                padding: 4,
                            }}
                        >
                            {TABS.map((tab) => {
                                const isActive = activeTab === tab;
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        style={{
                                            padding: "7px 16px",
                                            borderRadius: 7,
                                            border: "none",
                                            background: isActive ? "#fff" : "transparent",
                                            color:
                                                tab === "Retrasado" && !isActive
                                                    ? "#dc2626"
                                                    : isActive
                                                        ? "#171717"
                                                        : "#737373",
                                            fontSize: 13.5,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            boxShadow: isActive
                                                ? "0 1px 3px rgba(0,0,0,0.08)"
                                                : "none",
                                        }}
                                    >
                                        {tab}
                                    </button>
                                );
                            })}
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                border: "1px solid #e0e0e0",
                                borderRadius: 9,
                                padding: "8px 12px",
                                minWidth: 260,
                            }}
                        >
                            <Search size={15} color="#a3a3a3" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar matrícula o nombre de matrícula..."
                                style={{
                                    border: "none",
                                    outline: "none",
                                    fontSize: 13.5,
                                    width: "100%",
                                }}
                            />
                        </div>
                    </div>

                    {/* Tabla */}
                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: 13.5,
                                minWidth: 640,
                            }}
                        >
                            <thead>
                                <tr style={{ textAlign: "left", color: "#737373" }}>
                                    <th style={{ padding: "8px 10px", fontWeight: 600 }}>
                                        Usuario
                                    </th>
                                    <th style={{ padding: "8px 10px", fontWeight: 600 }}>
                                        Detalle del libro
                                    </th>
                                    <th style={{ padding: "8px 10px", fontWeight: 600 }}>
                                        Fecha
                                    </th>
                                    <th style={{ padding: "8px 10px", fontWeight: 600 }}>
                                        Estado
                                    </th>
                                    <th style={{ padding: "8px 10px", fontWeight: 600 }}>
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargando && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            style={{
                                                padding: "24px 10px",
                                                textAlign: "center",
                                                color: "#a3a3a3",
                                            }}
                                        >
                                            Cargando préstamos...
                                        </td>
                                    </tr>
                                )}
                                {!cargando && filteredLoans.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            style={{
                                                padding: "24px 10px",
                                                textAlign: "center",
                                                color: "#a3a3a3",
                                            }}
                                        >
                                            No hay préstamos que coincidan con el filtro.
                                        </td>
                                    </tr>
                                )}
                                {!cargando &&
                                    filteredLoans.map((loan) => {
                                        const style =
                                            STATUS_STYLES[loan.status] || STATUS_STYLES.Activo;
                                        return (
                                            <tr
                                                key={loan.id}
                                                style={{ borderTop: "1px solid #f2f2f2" }}
                                            >
                                                <td style={{ padding: "14px 10px" }}>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 10,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                width: 34,
                                                                height: 34,
                                                                borderRadius: "50%",
                                                                background: "#f5e0e3",
                                                                color: "#7a2333",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                fontSize: 12,
                                                                fontWeight: 700,
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {loan.initials}
                                                        </div>
                                                        <div>
                                                            <p style={{ margin: 0, fontWeight: 600 }}>
                                                                {loan.userType}
                                                            </p>
                                                            <p
                                                                style={{
                                                                    margin: 0,
                                                                    fontSize: 12,
                                                                    color: "#a3a3a3",
                                                                }}
                                                            >
                                                                {loan.userLabel}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: "14px 10px" }}>
                                                    <p style={{ margin: 0, fontWeight: 600 }}>
                                                        {loan.book}
                                                    </p>
                                                    <p
                                                        style={{
                                                            margin: 0,
                                                            fontSize: 12,
                                                            color: "#a3a3a3",
                                                        }}
                                                    >
                                                        ID: {loan.bookId}
                                                    </p>
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "14px 10px",
                                                        color: "#525252",
                                                        fontSize: 12.5,
                                                    }}
                                                >
                                                    <p style={{ margin: 0 }}>Prestado: {loan.loanDate}</p>
                                                    <p
                                                        style={{
                                                            margin: 0,
                                                            color:
                                                                loan.status === "Retrasado"
                                                                    ? "#dc2626"
                                                                    : "#525252",
                                                        }}
                                                    >
                                                        Devolución: {loan.dueDate}
                                                    </p>
                                                </td>
                                                <td style={{ padding: "14px 10px" }}>
                                                    <span
                                                        style={{
                                                            padding: "4px 12px",
                                                            borderRadius: 999,
                                                            fontSize: 12,
                                                            fontWeight: 600,
                                                            background: style.bg,
                                                            color: style.color,
                                                        }}
                                                    >
                                                        {loan.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "14px 10px" }}>
                                                    <button
                                                        onClick={() => handleReturn(loan.id)}
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 6,
                                                            border: "1px solid #7a2333",
                                                            color: "#7a2333",
                                                            background: "#fff",
                                                            borderRadius: 8,
                                                            padding: "7px 14px",
                                                            fontSize: 12.5,
                                                            fontWeight: 600,
                                                            cursor: "pointer",
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = "#f5e0e3";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = "#fff";
                                                        }}
                                                    >
                                                        <RotateCcw size={13} />
                                                        Devolver
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: 20,
                            flexWrap: "wrap",
                            gap: 10,
                        }}
                    >
                        <p style={{ margin: 0, fontSize: 13, color: "#737373" }}>
                            Se están mostrando {filteredLoans.length} préstamo(s) activo(s)
                        </p>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                disabled
                                style={{
                                    border: "1px solid #e0e0e0",
                                    background: "#fff",
                                    color: "#a3a3a3",
                                    borderRadius: 8,
                                    padding: "8px 18px",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: "not-allowed",
                                }}
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => alert("No hay más préstamos por mostrar.")}
                                style={{
                                    border: "none",
                                    background: "#171717",
                                    color: "#fff",
                                    borderRadius: 8,
                                    padding: "8px 18px",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function FieldLabel({ children }) {
    return (
        <label
            style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#171717",
                marginBottom: 6,
            }}
        >
            {children}
        </label>
    );
}

function FieldHint({ children }) {
    return (
        <p style={{ margin: "4px 0 14px", fontSize: 12, color: "#a3a3a3" }}>
            {children}
        </p>
    );
}

function IconInput({
    icon: Icon,
    value,
    onChange,
    placeholder,
    type = "text",
    marginBottom = 0,
}) {
    return (
        <div style={{ position: "relative", marginBottom }}>
            <Icon
                size={15}
                color="#a3a3a3"
                style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                }}
            />
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 12px 11px 36px",
                    borderRadius: 10,
                    border: "1px solid #e0e0e0",
                    fontSize: 14,
                    outline: "none",
                    color: "#171717",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#7a2333")}
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
            />
        </div>
    );
}