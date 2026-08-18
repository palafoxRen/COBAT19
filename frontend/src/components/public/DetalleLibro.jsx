import { useState } from "react";
import {
    BookOpen,
    ArrowLeft,
    Star,
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
} from "lucide-react";

const BOOK = {
    title: "Cien años de soledad",
    author: "Gabriel García Márquez",
    category: "Literatura Latinoamericana",
    rating: 4.8,
    reviews: 24,
    publisher: "Editorial Sudamericana",
    year: 1967,
    isbn: "978-0307474728",
    format: "Tapa Dura / PDF",
    location: "Pasillo 4, Estante B",
    loanPeriod: "3 días",
    cover:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=700&fit=crop",
    synopsis:
        "Cien años de soledad es una novela del escritor colombiano Gabriel García Márquez, ganador del Premio Nobel de Literatura en 1982. Es considerada una obra maestra de la literatura hispanoamericana y universal, así como una de las obras más traducidas y leídas en español. La novela narra la historia de la familia Buendía a lo largo de siete generaciones en el pueblo ficticio de Macondo.",
    authorBio:
        "Gabriel García Márquez (Aracataca, 1927 - Ciudad de México, 2014) fue un escritor y periodista colombiano. Reconocido por su obra de realismo mágico, su narrativa destaca por la mezcla de elementos fantásticos con situaciones cotidianas. Su legado literario lo posiciona como uno de los autores más importantes del siglo XX.",
};

const RELATED_BOOKS = [
    {
        title: "El amor en los tiempos",
        author: "G. García Márquez",
        img: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&h=400&fit=crop",
    },
    {
        title: "Crónica de una muerte",
        author: "G. García Márquez",
        img: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=400&fit=crop",
    },
    {
        title: "Pedro Páramo",
        author: "Juan Rulfo",
        img: "https://images.unsplash.com/photo-1524578271613-d550eede883b?w=300&h=400&fit=crop",
    },
    {
        title: "La casa de los espíritus",
        author: "Isabel Allende",
        img: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&h=400&fit=crop",
    },
];

export default function BookDetail() {
    const [status] = useState("Disponible");
    const [showLoanInfo, setShowLoanInfo] = useState(false);
    const [showHelp, setShowHelp] = useState(null);

    const isAvailable = status === "Disponible";

    const handleRequestLoan = () => setShowLoanInfo(true);

    const handleDownload = () => {
        alert(`Descargando PDF de "${BOOK.title}"...`);
    };

    const statusStyles = {
        Disponible: { bg: "#dcfce7", color: "#15803d", label: "DISPONIBLE" },
        Solicitado: { bg: "#f5e0e3", color: "#7a2333", label: "SOLICITADO" },
        Prestado: { bg: "#fef2f2", color: "#b91c1c", label: "PRESTADO" },
    };
    const currentStatusStyle = statusStyles[status];

    return (
        <div
            style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                color: "#171717",
                background: "#ffffff",
                minHeight: "100vh",
            }}
        >
            {/* Header */}
            <header
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 32px",
                    borderBottom: "1px solid #eee",
                    flexWrap: "wrap",
                    gap: 12,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: "#7a2333",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <BookOpen size={18} color="#fff" />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 17 }}>COBAT Librium</span>
                    </div>
                    <nav style={{ display: "flex", gap: 24, fontSize: 14.5, color: "#404040" }}>
                        <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "#404040", textDecoration: "none" }}>
                            Home
                        </a>
                        <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "#404040", textDecoration: "none" }}>
                            Catalog
                        </a>
                    </nav>
                </div>
                <button
                    onClick={() => alert("Ir a inicio de sesión")}
                    style={{
                        border: "1px solid #e3b7bd",
                        color: "#7a2333",
                        background: "#fff",
                        borderRadius: 8,
                        padding: "8px 18px",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    Iniciar sesión
                </button>
            </header>

            <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 32px 56px" }}>
                <button
                    onClick={() => alert("Volviendo al catálogo")}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "none",
                        border: "none",
                        color: "#7a2333",
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: "pointer",
                        padding: 0,
                        marginBottom: 20,
                    }}
                >
                    <ArrowLeft size={16} />
                    Volver al Catálogo
                </button>

                {/* Sección principal */}
                <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 320px", gap: 32 }}>
                    {/* Portada */}
                    <div>
                        <img
                            src={BOOK.cover}
                            alt={BOOK.title}
                            style={{
                                width: "100%",
                                aspectRatio: "3/4.4",
                                objectFit: "cover",
                                borderRadius: 14,
                                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                            }}
                        />
                    </div>

                    {/* Info central */}
                    <div>
                        <span
                            style={{
                                display: "inline-block",
                                background: "#f5e0e3",
                                color: "#7a2333",
                                fontSize: 12.5,
                                fontWeight: 600,
                                padding: "5px 12px",
                                borderRadius: 999,
                                marginBottom: 12,
                            }}
                        >
                            {BOOK.category}
                        </span>
                        <h1 style={{ fontSize: 30, fontWeight: 800, color: "#7a2333", margin: "0 0 8px" }}>
                            {BOOK.title}
                        </h1>
                        <p style={{ fontSize: 16, color: "#404040", margin: "0 0 10px" }}>
                            por {BOOK.author}
                        </p>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                            <div style={{ display: "flex", gap: 2 }}>
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <Star
                                        key={n}
                                        size={16}
                                        color="#f59e0b"
                                        fill={n <= Math.round(BOOK.rating) ? "#f59e0b" : "none"}
                                    />
                                ))}
                            </div>
                            <span style={{ fontSize: 13.5, color: "#737373" }}>
                                ({BOOK.rating} / 5.0 basada en {BOOK.reviews} reseñas)
                            </span>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "20px 32px",
                            }}
                        >
                            <InfoField icon={Building2} label="EDITORIAL" value={BOOK.publisher} />
                            <InfoField icon={Calendar} label="AÑO DE PUBLICACIÓN" value={BOOK.year} />
                            <InfoField icon={Hash} label="ISBN" value={BOOK.isbn} />
                            <InfoField icon={Bookmark} label="FORMATO" value={BOOK.format} />
                        </div>

                        <hr style={{ border: "none", borderTop: "1px solid #ececec", margin: "28px 0" }} />

                        {/* Sinopsis */}
                        <h2
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                fontSize: 19,
                                fontWeight: 700,
                                margin: "0 0 14px",
                            }}
                        >
                            <BookOpenCheck size={19} color="#7a2333" />
                            Sinopsis
                        </h2>
                        <p style={{ fontSize: 14.5, color: "#404040", lineHeight: 1.75, margin: "0 0 28px" }}>
                            {BOOK.synopsis}
                        </p>
                    </div>

                    {/* Panel lateral de acciones */}
                    <div>
                        <div
                            style={{
                                border: "1px solid #ececec",
                                borderRadius: 14,
                                overflow: "hidden",
                                marginBottom: 20,
                            }}
                        >
                            <div
                                style={{
                                    background: currentStatusStyle.bg,
                                    color: currentStatusStyle.color,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "12px 20px",
                                    fontWeight: 700,
                                    fontSize: 13,
                                }}
                            >
                                <CheckCircle2 size={15} />
                                {currentStatusStyle.label}
                            </div>

                            <div style={{ padding: 20 }}>
                                <p style={{ fontSize: 13.5, color: "#525252", margin: "0 0 18px", lineHeight: 1.6 }}>
                                    Acciones disponibles para este ejemplar en la biblioteca.
                                </p>

                                <div
                                    style={{
                                        background: "#fafafa",
                                        border: "1px solid #ececec",
                                        borderRadius: 10,
                                        padding: "12px 14px",
                                        marginBottom: 18,
                                        fontSize: 13,
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#737373" }}>Préstamo:</span>
                                        <strong>{BOOK.loanPeriod}</strong>
                                    </div>
                                </div>

                                <button
                                    onClick={handleRequestLoan}
                                    disabled={!isAvailable}
                                    style={{
                                        width: "100%",
                                        background: isAvailable ? "#7a2333" : "#e0e0e0",
                                        color: isAvailable ? "#fff" : "#a3a3a3",
                                        border: "none",
                                        borderRadius: 10,
                                        padding: "13px 0",
                                        fontSize: 14.5,
                                        fontWeight: 700,
                                        cursor: isAvailable ? "pointer" : "not-allowed",
                                        marginBottom: 10,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (isAvailable) e.currentTarget.style.background = "#6e1c28";
                                    }}
                                    onMouseLeave={(e) => {
                                        if (isAvailable) e.currentTarget.style.background = "#7a2333";
                                    }}
                                >
                                    {status === "Disponible"
                                        ? "Solicitar préstamo"
                                        : status === "Solicitado"
                                            ? "Solicitud enviada"
                                            : "No disponible"}
                                </button>

                                <button
                                    onClick={handleDownload}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 8,
                                        width: "100%",
                                        background: "#fff",
                                        color: "#171717",
                                        border: "1px solid #e0e0e0",
                                        borderRadius: 10,
                                        padding: "12px 0",
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        marginBottom: 14,
                                    }}
                                >
                                    <Download size={15} />
                                    Descargar PDF
                                </button>

                                <p style={{ fontSize: 11.5, color: "#a3a3a3", textAlign: "center", margin: 0, lineHeight: 1.5 }}>
                                    * Al solicitar el préstamo, te comprometes a seguir el reglamento
                                    interno de la biblioteca.
                                </p>
                            </div>
                        </div>

                        {/* Ayuda */}
                        <div
                            style={{
                                background: "#fafafa",
                                border: "1px solid #ececec",
                                borderRadius: 14,
                                padding: 20,
                            }}
                        >
                            <p
                                style={{
                                    fontSize: 11.5,
                                    fontWeight: 700,
                                    letterSpacing: 0.4,
                                    color: "#a3a3a3",
                                    margin: "0 0 14px",
                                }}
                            >
                                AYUDA
                            </p>
                            <button
                                onClick={() => setShowHelp("renovar")}
                                style={helpLinkStyle}
                            >
                                <HelpCircle size={15} color="#737373" />
                                ¿Cómo renovar mis préstamos?
                            </button>
                            <button
                                onClick={() => setShowHelp("reportar")}
                                style={{ ...helpLinkStyle, marginBottom: 0 }}
                            >
                                <AlertCircle size={15} color="#737373" />
                                Reportar daños en el ejemplar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Libros relacionados */}
                <div style={{ marginTop: 48 }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 20,
                        }}
                    >
                        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Libros Relacionados</h2>
                        <button
                            onClick={() => alert("Mostrando todos los libros relacionados")}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#7a2333",
                                fontWeight: 600,
                                fontSize: 13.5,
                                cursor: "pointer",
                            }}
                        >
                            Ver todo
                        </button>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                            gap: 20,
                        }}
                    >
                        {RELATED_BOOKS.map((b) => (
                            <div
                                key={b.title}
                                onClick={() => alert(`Ver detalles de "${b.title}"`)}
                                style={{ cursor: "pointer" }}
                            >
                                <img
                                    src={b.img}
                                    alt={b.title}
                                    style={{
                                        width: "100%",
                                        aspectRatio: "3/4",
                                        objectFit: "cover",
                                        borderRadius: 10,
                                        marginBottom: 10,
                                    }}
                                />
                                <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14 }}>{b.title}</p>
                                <p style={{ margin: 0, fontSize: 12.5, color: "#737373" }}>{b.author}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer
                style={{
                    borderTop: "1px solid #f0f0f0",
                    padding: "20px 32px",
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 10,
                    fontSize: 12.5,
                    color: "#a3a3a3",
                }}
            >
                <span>© 2026 Biblioteca COBAT. Sistema de Gestión Bibliotecaria para el COBAT 19.</span>
                <span style={{ display: "flex", gap: 20 }}>
                    <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "#a3a3a3", textDecoration: "none" }}>
                        Privacy Policy
                    </a>
                    <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "#a3a3a3", textDecoration: "none" }}>
                        Terms of Service
                    </a>
                </span>
            </footer>

            {/* Modal información de préstamo */}
            {showLoanInfo && (
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
                    onClick={() => setShowLoanInfo(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            borderRadius: 14,
                            padding: 28,
                            width: 400,
                            maxWidth: "90%",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: "50%",
                                background: isAvailable ? "#dcfce7" : "#fdeceb",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 16px",
                            }}
                        >
                            {isAvailable ? (
                                <BookOpenCheck size={24} color="#15803d" />
                            ) : (
                                <AlertCircle size={24} color="#dc2626" />
                            )}
                        </div>
                        <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700 }}>
                            {isAvailable ? "Acude a la biblioteca" : "Libro no disponible"}
                        </h3>
                        <p style={{ fontSize: 14, color: "#525252", lineHeight: 1.65, margin: "0 0 20px" }}>
                            {isAvailable
                                ? "Para realizar el préstamo de este libro, acude directamente a la biblioteca del COBAT 19. Ahí el bibliotecario te atenderá y registrará el préstamo."
                                : "Este libro actualmente se encuentra prestado y no está disponible para préstamo. Intenta más tarde o consulta con el bibliotecario."}
                        </p>
                        <button
                            onClick={() => setShowLoanInfo(false)}
                            style={{
                                width: "100%",
                                background: isAvailable ? "#7a2333" : "#e0e0e0",
                                color: isAvailable ? "#fff" : "#a3a3a3",
                                border: "none",
                                borderRadius: 10,
                                padding: "12px 0",
                                fontSize: 14,
                                fontWeight: 700,
                                cursor: "pointer",
                            }}
                        >
                            {isAvailable ? "Entendido" : "Cerrar"}
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de ayuda */}
            {showHelp && (
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
                    onClick={() => setShowHelp(null)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            borderRadius: 14,
                            padding: 28,
                            width: 400,
                            maxWidth: "90%",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                                {showHelp === "renovar" ? "¿Cómo renovar mis préstamos?" : "Reportar daños en el ejemplar"}
                            </h3>
                            <button onClick={() => setShowHelp(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                                <X size={18} color="#737373" />
                            </button>
                        </div>
                        <p style={{ fontSize: 14, color: "#525252", lineHeight: 1.65, margin: 0 }}>
                            {showHelp === "renovar"
                                ? "Puedes renovar tus préstamos desde tu perfil de alumno, siempre que el libro no tenga otra reserva pendiente. Cada título puede renovarse hasta 2 veces por 3 días adicionales."
                                : "Si detectas manchas, páginas faltantes o daños en la portada, repórtalo desde tu perfil o directamente con el bibliotecario para evitar cargos indebidos a tu cuenta."}
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
            <div
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "#f5e0e3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Icon size={15} color="#7a2333" />
            </div>
            <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: "#a3a3a3" }}>
                    {label}
                </p>
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