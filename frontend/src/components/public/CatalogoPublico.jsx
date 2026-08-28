import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    BookOpen,
    Search,
    Smartphone,
    CheckCircle2,
    Sparkles,
    FlaskConical,
    History,
    Calculator,
    Globe,
    Languages,
    Music,
    Dna,
} from "lucide-react";
import api, { getImagenUrl } from "../../api/axios";

const ICON_MAP = {
    literatura: BookOpen,
    ciencia: FlaskConical,
    historia: History,
    matemáticas: Calculator,
    geografía: Globe,
    idiomas: Languages,
    "arte y música": Music,
    arte: Music,
    biología: Dna,
};

const BGS = ["#f5e0e3", "#f7e6e8", "#ffffff", "#ffffff", "#ffffff", "#f5e0e3", "#f7e6e8", "#ffffff"];

export default function CatalogoPublico() {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState("");
    const [submittedQuery, setSubmittedQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [booksRes, catsRes] = await Promise.all([
                    api.get("/libros"),
                    api.get("/categorias"),
                ]);
                const librosConCategoria = (booksRes.data.data || []).map(libro => ({
                    ...libro,
                    categoria: libro.categoria_nombre || null,
                }));
                setBooks(librosConCategoria);
                setCategorias(catsRes.data.data || []);
                setError(null);
            } catch (err) {
                console.error("Error al cargar catálogo:", err);
                setError("No se pudo cargar el catálogo. Intenta más tarde.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filtrar libros localmente (sin recargar)
    const filteredBooks = useMemo(() => {
        let result = books;

        // Búsqueda por texto
        if (submittedQuery.trim()) {
            const q = submittedQuery.toLowerCase();
            result = result.filter(
                (b) =>
                    b.titulo?.toLowerCase().includes(q) ||
                    b.autor?.toLowerCase().includes(q) ||
                    b.titulo_digital?.toLowerCase().includes(q)
            );
        }

        // Filtro por categoría
        if (selectedCategory) {
            const cat = categorias.find(c => c.categoria_id === selectedCategory);
            if (cat) {
                result = result.filter(b => b.categoria === cat.nombre);
            }
        }

        return result;
    }, [books, submittedQuery, selectedCategory, categorias]);

    // Estadísticas reales
    const totalEjemplares = books.reduce((acc, b) => acc + (b.total_ejemplares || 0), 0);
    const disponibles = books.reduce((acc, b) => acc + (b.disponibles || 0), 0);

    // Últimos 6 libros como "novedades" (orden inverso por id_libro)
    const novedades = useMemo(() => {
        return [...books]
            .sort((a, b) => (b.libro_id || 0) - (a.libro_id || 0))
            .slice(0, 6);
    }, [books]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSubmittedQuery(query);
        document
            .getElementById("novedades")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleCategoryClick = (cat) => {
        setSelectedCategory(cat.id === selectedCategory ? null : cat.id);
    };

    const handleLoginClick = () => {
        navigate("/login");
    };

    // Estado de carga
    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "100px 20px", fontFamily: "'Inter', sans-serif" }}>
                <p>Cargando catálogo...</p>
            </div>
        );
    }

    // Estado de error
    if (error) {
        return (
            <div style={{ textAlign: "center", padding: "100px 20px", fontFamily: "'Inter', sans-serif" }}>
                <p style={{ color: "#b91c1c" }}>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        marginTop: 16,
                        padding: "8px 24px",
                        background: "#6e1c28",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                    }}
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div
            style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                color: "#171717",
                background: "#ffffff",
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
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: "#6e1c28",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <BookOpen size={18} color="#fff" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 17 }}>Biblioteca COBAT 19</span>
                </div>

                <nav style={{ display: "flex", gap: 28, fontSize: 14.5, color: "#404040" }}>
                    <a href="#top" style={{ color: "#404040", textDecoration: "none" }}>
                        Inicio
                    </a>
                    <a
                        href="#novedades"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/catalogo");
                        }}
                        style={{ color: "#404040", textDecoration: "none", cursor: "pointer" }}
                    >
                        Catálogo
                    </a>
                </nav>

                <button
                    onClick={handleLoginClick}
                    style={{
                        border: "1px solid #e3b7bd",
                        color: "#6e1c28",
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

            {/* Hero */}
            <section
                id="top"
                style={{
                    background:
                        "linear-gradient(180deg, #faf0f1 0%, #fbf2f3 100%)",
                    padding: "56px 24px 40px",
                    textAlign: "center",
                }}
            >
                <span
                    style={{
                        display: "inline-block",
                        border: "1px solid #e3b7bd",
                        color: "#7a2333",
                        background: "#fff",
                        borderRadius: 999,
                        padding: "5px 16px",
                        fontSize: 13,
                        fontWeight: 600,
                        marginBottom: 20,
                    }}
                >
                    Biblioteca del COBAT 19
                </span>

                <h1
                    style={{
                        fontSize: 44,
                        fontWeight: 800,
                        margin: "0 0 16px",
                        lineHeight: 1.15,
                    }}
                >
                    Expande tu{" "}
                    <span style={{ color: "#7a2333" }}>conocimiento.</span>
                </h1>

                <p style={{ fontSize: 16, color: "#525252", margin: "0 0 32px" }}>
                    ¡Busca los títulos que tenemos para ti!
                </p>

                <form
                    onSubmit={handleSearch}
                    style={{
                        maxWidth: 620,
                        margin: "0 auto",
                        display: "flex",
                        gap: 10,
                        background: "#fff",
                        border: "1px solid #e5e5e5",
                        borderRadius: 12,
                        padding: 6,
                        boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flex: 1,
                            padding: "6px 10px",
                        }}
                    >
                        <Search size={18} color="#a3a3a3" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Busca por título, autor..."
                            style={{
                                border: "none",
                                outline: "none",
                                fontSize: 14.5,
                                width: "100%",
                                color: "#171717",
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        style={{
                            background: "#6e1c28",
                            color: "#fff",
                            border: "none",
                            borderRadius: 9,
                            padding: "0 24px",
                            fontSize: 14.5,
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        Buscar
                    </button>
                </form>
            </section>

            {/* Stats */}
            <section
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 40,
                    flexWrap: "wrap",
                    padding: "36px 24px",
                    borderBottom: "1px solid #f0f0f0",
                }}
            >
                {[
                    { icon: Smartphone, label: "Ejemplares totales", value: totalEjemplares.toLocaleString() + "+" },
                    { icon: CheckCircle2, label: "Disponibles", value: disponibles.toLocaleString() },
                    { icon: Sparkles, label: "Novedades del mes", value: novedades.length.toString() },
                ].map(({ icon: Icon, label, value }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                background: "#f9ecee",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Icon size={18} color="#7a2333" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: 13, color: "#737373" }}>{label}</p>
                            <p style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{value}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Categorías */}
            <section style={{ padding: "56px 32px", maxWidth: 1200, margin: "0 auto" }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        flexWrap: "wrap",
                        gap: 12,
                        marginBottom: 28,
                    }}
                >
                    <div>
                        <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>
                            Busca por categoría
                        </h2>
                        <p style={{ margin: 0, color: "#737373", fontSize: 14.5 }}>
                            Encuentra temas específicos o colecciones académicos...
                        </p>
                    </div>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: 20,
                    }}
                >
                    {categorias.map((cat, idx) => {
                        const Icon = ICON_MAP[cat.nombre?.toLowerCase()] || BookOpen;
                        const isSelected = selectedCategory === cat.categoria_id;
                        return (
                            <button
                                key={cat.categoria_id}
                                onClick={() => handleCategoryClick({ id: cat.categoria_id })}
                                style={{
                                    textAlign: "left",
                                    border: isSelected ? "2px solid #7a2333" : "1px solid #ececec",
                                    background: BGS[idx % BGS.length],
                                    borderRadius: 14,
                                    padding: "22px 20px",
                                    cursor: "pointer",
                                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                                    boxShadow: isSelected ? "0 4px 14px rgba(107,33,168,0.15)" : "none",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                            >
                                <div
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        background: "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: 14,
                                        border: "1px solid #ececec",
                                    }}
                                >
                                    <Icon size={19} color="#404040" />
                                </div>
                                <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: 15.5 }}>
                                    {cat.nombre}
                                </p>
                                <p style={{ margin: 0, fontSize: 13, color: "#737373" }}>
                                    {cat.total_libros || 0} Libros
                                </p>
                            </button>
                        );
                    })}
                </div>

                {selectedCategory && (
                    <p style={{ marginTop: 18, fontSize: 13.5, color: "#7a2333" }}>
                        Mostrando interés en:{" "}
                        <strong>{categorias.find((c) => c.categoria_id === selectedCategory)?.nombre}</strong>
                        {" — "}
                        <button
                            onClick={() => setSelectedCategory(null)}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#737373",
                                textDecoration: "underline",
                                cursor: "pointer",
                                fontSize: 13.5,
                                padding: 0,
                            }}
                        >
                            quitar filtro
                        </button>
                    </p>
                )}
            </section>

            {/* Novedades */}
            <section
                id="novedades"
                style={{
                    padding: "48px 32px 56px",
                    maxWidth: 1200,
                    margin: "0 auto",
                    borderTop: "1px solid #f0f0f0",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        flexWrap: "wrap",
                        gap: 12,
                        marginBottom: 28,
                    }}
                >
                    <div>
                        <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>
                            Novedades
                        </h2>
                        <p style={{ margin: 0, color: "#737373", fontSize: 14.5 }}>
                            {submittedQuery
                                ? `Resultados para "${submittedQuery}"`
                                : "Revisa lo nuevo que tenemos."}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/catalogo")}
                        style={{
                            border: "1px solid #e0e0e0",
                            background: "#fff",
                            borderRadius: 8,
                            padding: "8px 20px",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Ver todos
                    </button>
                </div>

                {filteredBooks.length === 0 ? (
                    <p style={{ color: "#737373", fontSize: 14.5 }}>
                        No se encontraron libros que coincidan con tu búsqueda.
                    </p>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                            gap: 20,
                        }}
                    >
                        {filteredBooks.slice(0, 6).map((book) => (
                            <div
                                key={book.digital_id || book.libro_id || book.id_libro}
                                onClick={() => {
                                    if (book.id_libro) navigate(`/libros/${book.id_libro}`);
                                    else if (book.digital_id) navigate(`/digitales/${book.digital_id}`);
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                <div
                                    style={{
                                        position: "relative",
                                        borderRadius: 12,
                                        overflow: "hidden",
                                        marginBottom: 10,
                                        aspectRatio: "3/4",
                                        background: "#f2f2f2",
                                    }}
                                >
                                    {book.imagen_url ? (
                                        <img
                                            src={getImagenUrl(book.imagen_url)}
                                            alt={book.titulo}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                display: "block",
                                            }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                background: "#f2f2f2",
                                                color: "#999",
                                                fontSize: 14,
                                            }}
                                        >
                                            Sin imagen
                                        </div>
                                    )}
                                    {book.disponibles > 0 && (
                                        <span
                                            style={{
                                                position: "absolute",
                                                top: 10,
                                                left: 10,
                                                background: "#6e1c28",
                                                color: "#fff",
                                                fontSize: 11,
                                                fontWeight: 700,
                                                padding: "3px 10px",
                                                borderRadius: 999,
                                            }}
                                        >
                                            Disponible
                                        </span>
                                    )}
                                </div>
                                <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14.5 }}>
                                    {book.titulo}
                                </p>
                                <p style={{ margin: 0, fontSize: 13, color: "#737373" }}>
                                    {book.autor}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* CTA ayuda */}
            <section style={{ padding: "0 32px 56px", maxWidth: 1200, margin: "0 auto" }}>
                <div
                    style={{
                        background: "linear-gradient(135deg, #6e1c28 0%, #9a3040 100%)",
                        borderRadius: 20,
                        padding: "48px 40px",
                        textAlign: "center",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <BookOpen
                        size={220}
                        color="rgba(255,255,255,0.08)"
                        style={{ position: "absolute", right: 20, bottom: -30 }}
                    />
                    <h2
                        style={{
                            color: "#fff",
                            fontSize: 28,
                            fontWeight: 800,
                            margin: "0 0 14px",
                            position: "relative",
                        }}
                    >
                        ¿Necesitas ayuda?
                    </h2>
                    <p
                        style={{
                            color: "#f0d0d4",
                            maxWidth: 520,
                            margin: "0 auto 24px",
                            fontSize: 15,
                            lineHeight: 1.6,
                            position: "relative",
                        }}
                    >
                        Nuestros bibliotecarios siempre están disponibles para resolver tus
                        dudas y ayudarte a encontrar el libro que buscas.
                    </p>
                    <button
                        onClick={() => alert("Ir a la biblioteca")}
                        style={{
                            background: "#fff",
                            color: "#6e1c28",
                            border: "none",
                            borderRadius: 9,
                            padding: "12px 28px",
                            fontSize: 14.5,
                            fontWeight: 700,
                            cursor: "pointer",
                            position: "relative",
                        }}
                    >
                        Ve a la biblioteca
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: "1px solid #f0f0f0", padding: "40px 32px 24px" }}>
                <div
                    style={{
                        maxWidth: 1200,
                        margin: "0 auto",
                        display: "grid",
                        gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
                        gap: 32,
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <div
                                style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: 7,
                                    background: "#6e1c28",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <BookOpen size={14} color="#fff" />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>
                                BIBLIOTECA COBAT 19
                            </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 13.5, color: "#737373" }}>
                            -La cultura como creadora de la paz.
                        </p>
                    </div>

                    <div>
                        <p
                            style={{
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: 0.4,
                                color: "#a3a3a3",
                                marginBottom: 12,
                            }}
                        >
                            NAVEGACIÓN
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13.5 }}>
                            <a href="#top" style={{ color: "#404040", textDecoration: "none" }}>
                                Inicio
                            </a>
                            <a
                                href="#novedades"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate("/catalogo");
                                }}
                                style={{ color: "#404040", textDecoration: "none", cursor: "pointer" }}
                            >
                                Catálogo
                            </a>
                            <button
                                onClick={handleLoginClick}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#404040",
                                    fontSize: 13.5,
                                    padding: 0,
                                    textAlign: "left",
                                    cursor: "pointer",
                                }}
                            >
                                Acceso de bibliotecarios
                            </button>
                        </div>
                    </div>

                    <div>
                        <p
                            style={{
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: 0.4,
                                color: "#a3a3a3",
                                marginBottom: 12,
                            }}
                        >
                            HORARIOS
                        </p>
                        <p style={{ margin: "0 0 6px", fontSize: 13.5, color: "#404040" }}>
                            Lunes - Viernes 08:00 - 17:00
                        </p>
                        <p style={{ margin: 0, fontSize: 13.5, color: "#404040" }}>
                            Sábado: Cerrado
                        </p>
                    </div>

                    <div>
                        <p
                            style={{
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: 0.4,
                                color: "#a3a3a3",
                                marginBottom: 12,
                            }}
                        >
                            CONTACTO
                        </p>
                        <p style={{ margin: "0 0 6px", fontSize: 13.5, color: "#404040" }}>
                            COBAT 19 Plantel Xaloztoc
                        </p>
                        <p style={{ margin: "0 0 6px", fontSize: 13.5, color: "#404040" }}>
                            plantel19@cobatlaxcala.edu.mx   
                        </p>
                        <p style={{ margin: 0, fontSize: 13.5, color: "#404040" }}>
                            (241) 41-3-02-57
                        </p>
                    </div>
                </div>

                <p
                    style={{
                        textAlign: "center",
                        fontSize: 12.5,
                        color: "#a3a3a3",
                        marginTop: 32,
                        borderTop: "1px solid #f0f0f0",
                        paddingTop: 20,
                        display: "flex",
                        justifyContent: "center",
                        gap: 20,
                        flexWrap: "wrap",
                    }}
                >
                    <span>2026 Biblioteca COBAT 19. Todos los derechos reservados.</span>
                    <a href="/privacidad" style={{ color: "#a3a3a3", textDecoration: "none" }}>
                        Política de privacidad
                    </a>
                    <a href="/terminos" style={{ color: "#a3a3a3", textDecoration: "none" }}>
                        Términos y condiciones
                    </a>
                </p>
            </footer>
        </div>
    );
}