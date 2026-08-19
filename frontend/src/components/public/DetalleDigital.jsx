import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    BookOpen,
    ArrowLeft,
    Download,
    Calendar,
    FileText,
    Loader2,
    AlertTriangle,
    Eye,
    File,
} from "lucide-react";
import api, { getImagenUrl } from "../../api/axios";

export default function DetalleDigital() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [digital, setDigital] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [showPdf, setShowPdf] = useState(false);

    useEffect(() => {
        let active = true;
        api.get(`/digitales/${id}`)
            .then((res) => {
                if (!active) return;
                if (res.data.success) {
                    setDigital(res.data.data);
                } else {
                    setError("Libro digital no encontrado");
                }
            })
            .catch(() => { if (active) setError("Error al cargar el libro digital"); })
            .finally(() => { if (active) setCargando(false); });
        return () => { active = false; };
    }, [id]);

    if (cargando) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16 }}>
                <Loader2 size={40} color="#7a2333" className="animate-spin" />
                <p style={{ color: "#737373", fontSize: 14 }}>Cargando libro digital...</p>
            </div>
        );
    }

    if (error || !digital) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16 }}>
                <AlertTriangle size={40} color="#dc2626" />
                <p style={{ color: "#dc2626", fontSize: 16, fontWeight: 600 }}>{error || "Libro digital no encontrado"}</p>
                <button onClick={() => navigate("/")} style={{ background: "#7a2333", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, cursor: "pointer" }}>
                    Volver al inicio
                </button>
            </div>
        );
    }

    const pdfUrl = `${api.defaults.baseURL}/digitales/${digital.digital_id}/descargar`;
    const pdfDownloadUrl = `${pdfUrl}?download=1`;
    const imagen = digital.imagen_url || digital.libro_imagen_url;
    const sinopsis = digital.sinopsis || digital.libro_sinopsis;

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#171717", background: "#ffffff", minHeight: "100vh" }}>
            {/* Header */}
            <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid #eee", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                    <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#7a2333", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <BookOpen size={18} color="#fff" />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 17, color: "#171717" }}>Biblioteca COBAT 19</span>
                    </Link>
                    <nav style={{ display: "flex", gap: 24, fontSize: 14.5, color: "#404040" }}>
                        <Link to="/" style={{ color: "#404040", textDecoration: "none" }}>Inicio</Link>
                        <Link to="/catalogo" style={{ color: "#404040", textDecoration: "none" }}>Catálogo</Link>
                    </nav>
                </div>
                <Link to="/login" style={{ border: "1px solid #e3b7bd", color: "#7a2333", background: "#fff", borderRadius: 8, padding: "8px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>
                    Iniciar sesión
                </Link>
            </header>

            <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 32px 56px" }}>
                <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "#7a2333", fontWeight: 600, fontSize: 14, cursor: "pointer", padding: 0, marginBottom: 20 }}>
                    <ArrowLeft size={16} />
                    Volver
                </button>

                <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 320px", gap: 32 }}>
                    {/* Portada */}
                    <div>
                        {imagen ? (
                            <img
                                src={getImagenUrl(imagen)}
                                alt={digital.titulo_digital}
                                style={{
                                    width: "100%",
                                    aspectRatio: "3/4.4",
                                    objectFit: "cover",
                                    borderRadius: 14,
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                                }}
                            />
                        ) : (
                            <div style={{ width: "100%", aspectRatio: "3/4.4", borderRadius: 14, background: "#f5e0e3", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
                                <FileText size={48} color="#7a2333" />
                            </div>
                        )}
                    </div>

                    {/* Info central */}
                    <div>
                        <span style={{ display: "inline-block", background: "#dbeafe", color: "#1e40af", fontSize: 12.5, fontWeight: 600, padding: "5px 12px", borderRadius: 999, marginBottom: 12 }}>
                            Libro Digital
                        </span>
                        <h1 style={{ fontSize: 30, fontWeight: 800, color: "#7a2333", margin: "0 0 8px" }}>{digital.titulo_digital}</h1>
                        {digital.libro_titulo && (
                            <p style={{ fontSize: 15, color: "#404040", margin: "0 0 4px" }}>
                                Vinculado a: <strong>{digital.libro_titulo}</strong>
                                {digital.libro_autor && ` · ${digital.libro_autor}`}
                            </p>
                        )}

                        <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f5e0e3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Calendar size={15} color="#7a2333" />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: "#a3a3a3" }}>FECHA DE SUBIDA</p>
                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                                        {digital.fecha_subida ? new Date(digital.fecha_subida).toLocaleDateString("es-MX") : "—"}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f5e0e3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <File size={15} color="#7a2333" />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: "#a3a3a3" }}>FORMATO</p>
                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>PDF</p>
                                </div>
                            </div>
                        </div>

                        {sinopsis && (
                            <>
                                <hr style={{ border: "none", borderTop: "1px solid #ececec", margin: "28px 0" }} />
                                <h2 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 14px" }}>Sinopsis</h2>
                                <p style={{ fontSize: 14.5, color: "#404040", lineHeight: 1.75, margin: 0 }}>
                                    {sinopsis}
                                </p>
                            </>
                        )}

                        {showPdf && (
                            <>
                                <hr style={{ border: "none", borderTop: "1px solid #ececec", margin: "28px 0" }} />
                                <h2 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 14px" }}>Vista previa del PDF</h2>
                                <iframe
                                    src={pdfUrl}
                                    title={digital.titulo_digital}
                                    style={{ width: "100%", height: 600, border: "1px solid #ececec", borderRadius: 10 }}
                                />
                            </>
                        )}
                    </div>

                    {/* Panel lateral */}
                    <div>
                        <div style={{ border: "1px solid #ececec", borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
                            <div style={{ background: "#dbeafe", color: "#1e40af", display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", fontWeight: 700, fontSize: 13 }}>
                                <FileText size={15} />
                                DISPONIBLE EN LÍNEA
                            </div>
                            <div style={{ padding: 20 }}>
                                <p style={{ fontSize: 13.5, color: "#525252", margin: "0 0 18px", lineHeight: 1.6 }}>
                                    Este material digital está disponible para consulta y descarga directa.
                                </p>
                                <button onClick={() => setShowPdf(!showPdf)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", background: showPdf ? "#f5e0e3" : "#7a2333", color: showPdf ? "#7a2333" : "#fff", border: showPdf ? "1px solid #7a2333" : "none", borderRadius: 10, padding: "13px 0", fontSize: 14.5, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>
                                    <Eye size={16} />
                                    {showPdf ? "Ocultar PDF" : "Ver PDF en línea"}
                                </button>
                                <a href={pdfDownloadUrl} download style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", background: "#fff", color: "#171717", border: "1px solid #e0e0e0", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none", marginBottom: 14 }}>
                                    <Download size={15} />
                                    Descargar PDF
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ borderTop: "1px solid #f0f0f0", padding: "20px 32px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, fontSize: 12.5, color: "#a3a3a3" }}>
                <span>© 2026 Biblioteca COBAT 19. Sistema de Gestión Bibliotecaria.</span>
            </footer>
        </div>
    );
}
