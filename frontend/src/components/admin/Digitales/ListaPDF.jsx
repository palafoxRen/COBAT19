import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Upload, Download, FileText, Eye, EyeOff } from "lucide-react";
import { getDigitales } from "../../../api/digitales";
import { getImagenUrl } from "../../../api/axios";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

const formatoFecha = (fecha) =>
    fecha ? new Date(fecha).toLocaleDateString() : "-";

export default function ListaPDF() {
    const [digitales, setDigitales] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getDigitales()
            .then((res) => setDigitales(res.data || []))
            .catch(() => setError("Error al cargar los libros digitales."))
            .finally(() => setCargando(false));
    }, []);

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
                        Libros digitales
                    </h1>
                    <p style={{ margin: 0, fontSize: 14, color: "#737373" }}>
                        Documentos PDF disponibles en la biblioteca.
                    </p>
                </div>
                <Link
                    to="/admin/digitales/nuevo"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "11px 18px",
                        borderRadius: 10,
                        background: "#7a2333",
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 700,
                        textDecoration: "none",
                    }}
                >
                    <Upload size={15} />
                    Subir PDF
                </Link>
            </div>

            {cargando && <p style={{ color: "#a3a3a3", fontSize: 14 }}>Cargando...</p>}

            {error && (
                <div
                    style={{
                        background: "#fdeceb",
                        border: "1px solid #f6c2bd",
                        color: "#dc2626",
                        borderRadius: 8,
                        padding: "12px 14px",
                        fontSize: 13,
                    }}
                >
                    {error}
                </div>
            )}

            {!cargando && !error && (
                <div
                    style={{
                        background: "#fff",
                        border: "1px solid #ececec",
                        borderRadius: 14,
                        padding: 24,
                        overflowX: "auto",
                    }}
                >
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                        <thead>
                            <tr style={{ textAlign: "left", color: "#737373" }}>
                                <th style={{ padding: "8px 10px", fontWeight: 600 }}>Documento</th>
                                <th style={{ padding: "8px 10px", fontWeight: 600 }}>Libro relacionado</th>
                                <th style={{ padding: "8px 10px", fontWeight: 600 }}>Fecha</th>
                                <th style={{ padding: "8px 10px", fontWeight: 600 }}>Estado</th>
                                <th style={{ padding: "8px 10px", fontWeight: 600, textAlign: "right" }}>
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {digitales.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        style={{
                                            padding: "28px 10px",
                                            textAlign: "center",
                                            color: "#a3a3a3",
                                        }}
                                    >
                                        Aún no hay libros digitales. Usa el botón "Subir PDF".
                                    </td>
                                </tr>
                            )}
                            {digitales.map((d) => (
                                <tr key={d.digital_id} style={{ borderTop: "1px solid #f2f2f2" }}>
                                    <td
                                        style={{
                                            padding: "14px 10px",
                                            fontWeight: 600,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                        }}
                                    >
                                        {d.imagen_url ? (
                                            <img
                                                src={getImagenUrl(d.imagen_url)}
                                                alt={d.titulo_digital}
                                                style={{ width: 34, height: 34, borderRadius: 9, objectFit: "cover", flexShrink: 0 }}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: 34,
                                                    height: 34,
                                                    borderRadius: 9,
                                                    background: "#f5e0e3",
                                                    color: "#7a2333",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <FileText size={15} />
                                            </div>
                                        )}
                                        {d.titulo_digital}
                                    </td>
                                    <td style={{ padding: "14px 10px", color: "#525252" }}>
                                        {d.libro_titulo || (
                                            <span style={{ color: "#a3a3a3" }}>Sin asociar</span>
                                        )}
                                    </td>
                                    <td style={{ padding: "14px 10px", color: "#525252" }}>
                                        {formatoFecha(d.fecha_subida)}
                                    </td>
                                    <td style={{ padding: "14px 10px" }}>
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 5,
                                                padding: "3px 10px",
                                                borderRadius: 999,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                background: d.esta_habilitado ? "#f0fdf4" : "#f0f0f0",
                                                color: d.esta_habilitado ? "#15803d" : "#737373",
                                            }}
                                        >
                                            {d.esta_habilitado ? <Eye size={12} /> : <EyeOff size={12} />}
                                            {d.esta_habilitado ? "Habilitado" : "Deshabilitado"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 10px", textAlign: "right" }}>
                                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                            <Link
                                                to={`/digitales/${d.digital_id}`}
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 6,
                                                    padding: "8px 14px",
                                                    borderRadius: 9,
                                                    border: "1px solid #7a2333",
                                                    background: "#fff",
                                                    color: "#7a2333",
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    cursor: "pointer",
                                                    textDecoration: "none",
                                                }}
                                            >
                                                <Eye size={14} />
                                                Ver
                                            </Link>
                                            <button
                                            onClick={() =>
                                                window.open(
                                                    `${API_BASE}/api/digitales/${d.digital_id}/descargar?download=1`,
                                                    "_blank",
                                                )
                                            }
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 6,
                                                padding: "8px 14px",
                                                borderRadius: 9,
                                                border: "1px solid #e0e0e0",
                                                background: "#fff",
                                                color: "#525252",
                                                fontSize: 13,
                                                fontWeight: 600,
                                                cursor: "pointer",
                                            }}
                                        >
                                            <Download size={14} />
                                            Descargar
                                        </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
