import { useState, useEffect } from "react";
import { FileText, CheckCircle2, Clock, AlertCircle, BookOpen } from "lucide-react";
import { getReporteMensual } from "../../../api/reportes";

const MESES = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
];

const hoy = new Date();
const ANIOS = [hoy.getFullYear() - 1, hoy.getFullYear(), hoy.getFullYear() + 1];

const formatoFecha = (fecha) =>
    fecha ? new Date(fecha).toLocaleDateString() : "-";

export default function ReporteMensual() {
    const [anio, setAnio] = useState(hoy.getFullYear());
    const [mes, setMes] = useState(hoy.getMonth() + 1);
    const [cargando, setCargando] = useState(false);
    const [datos, setDatos] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        setCargando(true);
        setError("");
        getReporteMensual(anio, mes)
            .then((res) => {
                if (active) setDatos(res.data);
            })
            .catch((err) => {
                if (active) setError(err.response?.data?.message || "Error al cargar el reporte.");
            })
            .finally(() => {
                if (active) setCargando(false);
            });
        return () => {
            active = false;
        };
    }, [anio, mes]);

    const resumen = datos?.resumen;
    const stats = [
        { icon: FileText, label: "Préstamos totales", value: resumen?.total ?? 0, bg: "#f5e0e3", color: "#7a2333" },
        { icon: Clock, label: "Activos", value: resumen?.activos ?? 0, bg: "#f0f0f0", color: "#404040" },
        { icon: CheckCircle2, label: "Devueltos", value: resumen?.devueltos ?? 0, bg: "#f0fdf4", color: "#15803d" },
        { icon: AlertCircle, label: "Retrasados", value: resumen?.retrasados ?? 0, bg: "#fdeceb", color: "#dc2626" },
    ];

    return (
        <>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 16,
                    marginBottom: 24,
                }}
            >
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>
                        Reporte mensual
                    </h1>
                    <p style={{ margin: 0, fontSize: 14, color: "#737373" }}>
                        Actividad de préstamos del mes seleccionado.
                    </p>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <select
                        value={mes}
                        onChange={(e) => setMes(Number(e.target.value))}
                        style={{
                            padding: "9px 12px",
                            borderRadius: 9,
                            border: "1px solid #e0e0e0",
                            fontSize: 14,
                            background: "#fff",
                            outline: "none",
                        }}
                    >
                        {MESES.map((m, i) => (
                            <option key={m} value={i + 1}>
                                {m}
                            </option>
                        ))}
                    </select>
                    <select
                        value={anio}
                        onChange={(e) => setAnio(Number(e.target.value))}
                        style={{
                            padding: "9px 12px",
                            borderRadius: 9,
                            border: "1px solid #e0e0e0",
                            fontSize: 14,
                            background: "#fff",
                            outline: "none",
                        }}
                    >
                        {ANIOS.map((a) => (
                            <option key={a} value={a}>
                                {a}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {cargando && (
                <p style={{ color: "#a3a3a3", fontSize: 14 }}>Generando reporte...</p>
            )}

            {error && (
                <div
                    style={{
                        background: "#fdeceb",
                        border: "1px solid #f6c2bd",
                        color: "#dc2626",
                        borderRadius: 8,
                        padding: "12px 14px",
                        fontSize: 13,
                        marginBottom: 16,
                    }}
                >
                    {error}
                </div>
            )}

            {!cargando && !error && datos && (
                <>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: 16,
                            marginBottom: 24,
                        }}
                    >
                        {stats.map((s) => {
                            const Icon = s.icon;
                            return (
                                <div
                                    key={s.label}
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #ececec",
                                        borderRadius: 14,
                                        padding: "18px 20px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 10,
                                            background: s.bg,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginBottom: 12,
                                        }}
                                    >
                                        <Icon size={17} color={s.color} />
                                    </div>
                                    <p style={{ margin: "0 0 4px", fontSize: 13, color: "#737373" }}>
                                        {s.label}
                                    </p>
                                    <p style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
                                        {s.value}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr",
                            gap: 20,
                            alignItems: "start",
                        }}
                    >
                        <div
                            style={{
                                background: "#fff",
                                border: "1px solid #ececec",
                                borderRadius: 14,
                                padding: 24,
                                overflowX: "auto",
                            }}
                        >
                            <h2
                                style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}
                            >
                                Préstamos de {MESES[mes - 1]} {anio}
                            </h2>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                                <thead>
                                    <tr style={{ textAlign: "left", color: "#737373" }}>
                                        <th style={{ padding: "8px 10px", fontWeight: 600 }}>Título</th>
                                        <th style={{ padding: "8px 10px", fontWeight: 600 }}>Usuario</th>
                                        <th style={{ padding: "8px 10px", fontWeight: 600 }}>Salida</th>
                                        <th style={{ padding: "8px 10px", fontWeight: 600 }}>Límite</th>
                                        <th style={{ padding: "8px 10px", fontWeight: 600 }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {datos.prestamos.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                style={{ padding: "20px 10px", textAlign: "center", color: "#a3a3a3" }}
                                            >
                                                No hay préstamos registrados en este mes.
                                            </td>
                                        </tr>
                                    )}
                                    {datos.prestamos.map((p) => (
                                        <tr key={p.id_prestamo} style={{ borderTop: "1px solid #f2f2f2" }}>
                                            <td style={{ padding: "12px 10px", fontWeight: 600 }}>{p.titulo}</td>
                                            <td style={{ padding: "12px 10px", color: "#525252" }}>
                                                {p.usuario_nombre}
                                            </td>
                                            <td style={{ padding: "12px 10px", color: "#525252" }}>
                                                {formatoFecha(p.fecha_salida)}
                                            </td>
                                            <td style={{ padding: "12px 10px", color: "#525252" }}>
                                                {formatoFecha(p.fecha_limite)}
                                            </td>
                                            <td style={{ padding: "12px 10px" }}>
                                                <span
                                                    style={{
                                                        padding: "3px 10px",
                                                        borderRadius: 999,
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        background:
                                                            p.estatus_prestamo === "Devuelto" ? "#f0fdf4" : "#f5e0e3",
                                                        color:
                                                            p.estatus_prestamo === "Devuelto" ? "#15803d" : "#7a2333",
                                                    }}
                                                >
                                                    {p.estatus_prestamo}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div
                            style={{
                                background: "#fff",
                                border: "1px solid #ececec",
                                borderRadius: 14,
                                padding: 24,
                            }}
                        >
                            <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>
                                Libros más prestados
                            </h2>
                            {datos.topLibros.length === 0 && (
                                <p style={{ margin: 0, fontSize: 13, color: "#a3a3a3" }}>
                                    Sin datos este mes.
                                </p>
                            )}
                            {datos.topLibros.map((t, i) => (
                                <div
                                    key={t.titulo}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        padding: "10px 0",
                                        borderTop: "1px solid #f2f2f2",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: 8,
                                            background: "#f5e0e3",
                                            color: "#7a2333",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontWeight: 700,
                                            fontSize: 12.5,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {i + 1}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontWeight: 600,
                                                fontSize: 13.5,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {t.titulo}
                                        </p>
                                    </div>
                                    <span
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: "#7a2333",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 4,
                                        }}
                                    >
                                        <BookOpen size={13} />
                                        {t.prestamos}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
