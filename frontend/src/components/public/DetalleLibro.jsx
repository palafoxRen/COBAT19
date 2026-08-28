import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    BookOpen,
    ArrowLeft,
    Building2,
    Calendar,
    Hash,
    Bookmark,
    CheckCircle2,
    Download,
    HelpCircle,
    AlertCircle,
    BookOpenCheck,
    X,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import api, { getImagenUrl } from "../../api/axios";

export default function DetalleLibro() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [libro, setLibro] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [showLoanInfo, setShowLoanInfo] = useState(false);
    const [showHelp, setShowHelp] = useState(null);

    useEffect(() => {
        let active = true;
        api.get(`/libros/${id}`)
            .then((res) => {
                if (!active) return;
                if (res.data.success) {
                    setLibro(res.data.data);
                } else {
                    setError("Libro no encontrado");
                }
            })
            .catch(() => { if (active) setError("Error al cargar el libro"); })
            .finally(() => { if (active) setCargando(false); });
        return () => { active = false; };
    }, [id]);

    if (cargando) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16 }}>
                <Loader2 size={40} color="#7a2333" className="animate-spin" />
                <p style={{ color: "#737373", fontSize: 14 }}>Cargando libro...</p>
            </div>
        );
    }

    if (error || !libro) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16 }}>
                <AlertTriangle size={40} color="#dc2626" />
                <p style={{ color: "#dc2626", fontSize: 16, fontWeight: 600 }}>{error || "Libro no encontrado"}</p>
                <button onClick={() => navigate("/catalogo")} style={{ background: "#7a2333", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, cursor: "pointer" }}>
                    Volver al catálogo
                </button>
            </div>
        );
    }

    const ejemplares = libro.ejemplares || [];
    const disponibles = ejemplares.filter((e) => e.disponibilidad).length;
    const totalEjemplares = ejemplares.length;
    const isAvailable = disponibles > 0;

    const handleDownload = () => {
        const pdfUrl = libro.url_pdf;
        if (pdfUrl) {
            window.open(getImagenUrl(pdfUrl), "_blank");
        } else {
            alert("Este libro no tiene versión digital disponible.");
        }
    };

    const statusStyles = {
        available: { bg: "#dcfce7", color: "#15803d", label: "DISPONIBLE" },
        unavailable: { bg: "#fef2f2", color: "#b91c1c", label: "NO DISPONIBLE" },
    };
    const statusKey = isAvailable ? "available" : "unavailable";
    const currentStatusStyle = statusStyles[statusKey];

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
                        {libro.imagen_url ? (
                            <img
                                src={getImagenUrl(libro.imagen_url)}
                                alt={libro.titulo}
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
                                <BookOpen size={48} color="#7a2333" />
                            </div>
                        )}
                    </div>

                    {/* Info central */}
                    <div>
                        {libro.categoria_nombre && (
                            <span style={{ display: "inline-block", background: "#f5e0e3", color: "#7a2333", fontSize: 12.5, fontWeight: 600, padding: "5px 12px", borderRadius: 999, marginBottom: 12 }}>
                                {libro.categoria_nombre}
                            </span>
                        )}
                        <h1 style={{ fontSize: 30, fontWeight: 800, color: "#7a2333", margin: "0 0 8px" }}>{libro.titulo}</h1>
                        <p style={{ fontSize: 16, color: "#404040", margin: "0 0 10px" }}>por {libro.autor}</p>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 32px" }}>
                            {libro.editorial && <InfoField icon={Building2} label="EDITORIAL" value={libro.editorial} />}
                            {libro.fecha_registro && <InfoField icon={Calendar} label="FECHA DE REGISTRO" value={new Date(libro.fecha_registro).toLocaleDateString("es-MX")} />}
                            {libro.isbn && <InfoField icon={Hash} label="ISBN" value={libro.isbn} />}
                            {libro.dewey && <InfoField icon={Bookmark} label="CLASIFICACIÓN DEWEY" value={libro.dewey} />}
                        </div>

                        <hr style={{ border: "none", borderTop: "1px solid #ececec", margin: "28px 0" }} />

                        {libro.sinopsis && (
                            <>
                                <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 19, fontWeight: 700, margin: "0 0 14px" }}>
                                    <BookOpenCheck size={19} color="#7a2333" />
                                    Sinopsis
                                </h2>
                                <p style={{ fontSize: 14.5, color: "#404040", lineHeight: 1.75, margin: "0 0 28px" }}>
                                    {libro.sinopsis}
                                </p>
                            </>
                        )}

                        <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 19, fontWeight: 700, margin: "0 0 14px" }}>
                            <BookOpenCheck size={19} color="#7a2333" />
                            Ejemplares
                        </h2>
                        {ejemplares.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {ejemplares.map((ej) => (
                                    <div key={ej.libro_inventario} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#fafafa", border: "1px solid #ececec", borderRadius: 8, fontSize: 13.5 }}>
                                        <span style={{ fontWeight: 600 }}>{ej.libro_inventario}</span>
                                        <span style={{ color: "#737373" }}>{ej.estado_fisico}</span>
                                        <span style={{ background: ej.disponibilidad ? "#dcfce7" : "#fef2f2", color: ej.disponibilidad ? "#15803d" : "#b91c1c", padding: "3px 10px", borderRadius: 999, fontWeight: 600, fontSize: 12 }}>
                                            {ej.disponibilidad ? "Disponible" : "Prestado"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: "#737373", fontSize: 14 }}>No hay ejemplares registrados.</p>
                        )}
                    </div>

                    {/* Panel lateral */}
                    <div>
                        <div style={{ border: "1px solid #ececec", borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
                            <div style={{ background: currentStatusStyle.bg, color: currentStatusStyle.color, display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", fontWeight: 700, fontSize: 13 }}>
                                <CheckCircle2 size={15} />
                                {currentStatusStyle.label}
                            </div>
                            <div style={{ padding: 20 }}>
                                <p style={{ fontSize: 13.5, color: "#525252", margin: "0 0 18px", lineHeight: 1.6 }}>
                                    {disponibles} de {totalEjemplares} ejemplares disponibles
                                </p>
                                <button onClick={() => setShowLoanInfo(true)} disabled={!isAvailable} style={{ width: "100%", background: isAvailable ? "#7a2333" : "#e0e0e0", color: isAvailable ? "#fff" : "#a3a3a3", border: "none", borderRadius: 10, padding: "13px 0", fontSize: 14.5, fontWeight: 700, cursor: isAvailable ? "pointer" : "not-allowed", marginBottom: 10 }}>
                                    {isAvailable ? "Solicitar préstamo" : "No disponible"}
                                </button>
                                <button onClick={handleDownload} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", background: "#fff", color: "#171717", border: "1px solid #e0e0e0", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 14 }}>
                                    <Download size={15} />
                                    Descargar PDF
                                </button>
                                <p style={{ fontSize: 11.5, color: "#a3a3a3", textAlign: "center", margin: 0, lineHeight: 1.5 }}>
                                    * Al solicitar el préstamo, te comprometes a seguir el reglamento interno de la biblioteca.
                                </p>
                            </div>
                        </div>

                        <div style={{ background: "#fafafa", border: "1px solid #ececec", borderRadius: 14, padding: 20 }}>
                            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.4, color: "#a3a3a3", margin: "0 0 14px" }}>AYUDA</p>
                            <button onClick={() => setShowHelp("renovar")} style={helpLinkStyle}>
                                <HelpCircle size={15} color="#737373" />
                                ¿Cómo renovar mis préstamos?
                            </button>
                            <button onClick={() => setShowHelp("reportar")} style={{ ...helpLinkStyle, marginBottom: 0 }}>
                                <AlertCircle size={15} color="#737373" />
                                Reportar daños en el ejemplar
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ borderTop: "1px solid #f0f0f0", padding: "20px 32px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, fontSize: 12.5, color: "#a3a3a3" }}>
                <span>2026 Biblioteca COBAT 19. Sistema de Gestión Bibliotecaria.</span>
            </footer>

            {/* Modal préstamo */}
            {showLoanInfo && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={() => setShowLoanInfo(false)}>
                    <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, padding: 28, width: 400, maxWidth: "90%", textAlign: "center" }}>
                        <div style={{ width: 48, height: 48, borderRadius: "50%", background: isAvailable ? "#dcfce7" : "#fdeceb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                            {isAvailable ? <BookOpenCheck size={24} color="#15803d" /> : <AlertCircle size={24} color="#dc2626" />}
                        </div>
                        <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700 }}>{isAvailable ? "Acude a la biblioteca" : "Libro no disponible"}</h3>
                        <p style={{ fontSize: 14, color: "#525252", lineHeight: 1.65, margin: "0 0 20px" }}>
                            {isAvailable ? "Para realizar el préstamo de este libro, acude directamente a la biblioteca del COBAT 19. Ahí el bibliotecario te atenderá y registrará el préstamo." : "Este libro actualmente no está disponible para préstamo. Intenta más tarde o consulta con el bibliotecario."}
                        </p>
                        <button onClick={() => setShowLoanInfo(false)} style={{ width: "100%", background: isAvailable ? "#7a2333" : "#e0e0e0", color: isAvailable ? "#fff" : "#a3a3a3", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                            {isAvailable ? "Entendido" : "Cerrar"}
                        </button>
                    </div>
                </div>
            )}

            {/* Modal ayuda */}
            {showHelp && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={() => setShowHelp(null)}>
                    <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, padding: 28, width: 400, maxWidth: "90%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{showHelp === "renovar" ? "¿Cómo renovar mis préstamos?" : "Reportar daños"}</h3>
                            <button onClick={() => setShowHelp(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color="#737373" /></button>
                        </div>
                        <p style={{ fontSize: 14, color: "#525252", lineHeight: 1.65, margin: 0 }}>
                            {showHelp === "renovar" ? "Puedes renovar tus préstamos directamente con el bibliotecario, siempre que el libro no tenga otra reserva pendiente. Cada título puede renovarse hasta 2 veces." : "Si detectas manchas, páginas faltantes o daños en la portada, repórtalo directamente con el bibliotecario para evitar cargos indebidos a tu cuenta."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoField({ icon: Icon, label, value }) {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f5e0e3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={15} color="#7a2333" />
            </div>
            <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: "#a3a3a3" }}>{label}</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{value}</p>
            </div>
        </div>
    );
}

const helpLinkStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    background: "none",
    border: "none",
    textAlign: "left",
    fontSize: 13.5,
    color: "#404040",
    cursor: "pointer",
    padding: "6px 0",
    marginBottom: 10,
};
