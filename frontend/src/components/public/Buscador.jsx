import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    BookOpen,
    Search,
    SlidersHorizontal,
    ChevronDown,
    ChevronUp,
    LayoutGrid,
    List,
    ArrowRight,
    CheckCircle2,
    Clock,
} from "lucide-react";
import api from "../../api/axios";

const YEAR_RANGES = [
    { label: "2020 - Actualidad", test: (y) => y >= 2020 },
    { label: "2010 - 2019", test: (y) => y >= 2010 && y <= 2019 },
    { label: "2000 - 2009", test: (y) => y >= 2000 && y <= 2009 },
    { label: "Pre-2000", test: (y) => y < 2000 },
];
const SORT_OPTIONS = ["Mas nuevo", "Mas antiguo", "Titulo A-Z"];
const PAGE_SIZE = 12;

export default function Buscador() {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedAvailability, setSelectedAvailability] = useState([]);
    const [selectedYearRanges, setSelectedYearRanges] = useState([]);
    const [sortBy, setSortBy] = useState("Mas nuevo");
    const [sortOpen, setSortOpen] = useState(false);
    const [viewMode, setViewMode] = useState("grid");
    const [page, setPage] = useState(1);
    const [openSections, setOpenSections] = useState({
        categorias: true,
        disponibilidad: true,
        anio: true,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [booksRes, catsRes] = await Promise.all([
                    api.get("/libros"),
                    api.get("/categorias"),
                ]);
                setBooks(booksRes.data.data || []);
                setCategorias(catsRes.data.data || []);
            } catch {
                console.error("Error al cargar catalogo");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleSection = (key) =>
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

    const toggleValue = (list, setList, value) => {
        setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
        setPage(1);
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedAvailability([]);
        setSelectedYearRanges([]);
        setSearch("");
        setPage(1);
    };

    const filteredBooks = useMemo(() => {
        let list = books;

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (b) =>
                    b.titulo?.toLowerCase().includes(q) ||
                    b.autor?.toLowerCase().includes(q) ||
                    b.categoria_nombre?.toLowerCase().includes(q)
            );
        }

        if (selectedCategories.length > 0) {
            list = list.filter((b) => selectedCategories.includes(b.categoria_nombre));
        }

        if (selectedAvailability.length > 0) {
            list = list.filter((b) =>
                selectedAvailability.includes(
                    (b.disponibles || 0) > 0 ? "Disponibles" : "Prestados"
                )
            );
        }

        if (selectedYearRanges.length > 0) {
            list = list.filter((b) => {
                const year = b.fecha_registro ? new Date(b.fecha_registro).getFullYear() : 0;
                return selectedYearRanges.some((label) => {
                    const range = YEAR_RANGES.find((r) => r.label === label);
                    return range ? range.test(year) : false;
                });
            });
        }

        const sorted = [...list].sort((a, b) => {
            if (sortBy === "Mas nuevo") {
                return new Date(b.fecha_registro || 0) - new Date(a.fecha_registro || 0);
            }
            if (sortBy === "Mas antiguo") {
                return new Date(a.fecha_registro || 0) - new Date(b.fecha_registro || 0);
            }
            if (sortBy === "Titulo A-Z") return (a.titulo || "").localeCompare(b.titulo || "");
            return 0;
        });

        return sorted;
    }, [books, search, selectedCategories, selectedAvailability, selectedYearRanges, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));
    const paginatedBooks = filteredBooks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "100px 20px", fontFamily: "'Inter', sans-serif" }}>
                <p>Cargando catalogo...</p>
            </div>
        );
    }

    return (
        <div
            style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                color: "#171717",
                background: "#ffffff",
                minHeight: "100vh",
            }}
        >
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
                        <span style={{ fontWeight: 700, fontSize: 17 }}>Biblioteca COBAT 19</span>
                    </div>
                    <nav style={{ display: "flex", gap: 24, fontSize: 14.5, color: "#404040" }}>
                        <a
                            href="/"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate("/");
                            }}
                            style={{ color: "#404040", textDecoration: "none", cursor: "pointer" }}
                        >
                            Inicio
                        </a>
                        <span style={{ color: "#171717", fontWeight: 600 }}>Catalogo</span>
                    </nav>
                </div>

                <button
                    onClick={() => navigate("/login")}
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
                    Iniciar sesion
                </button>
            </header>

            <section
                style={{
                    background: "linear-gradient(180deg, #faf0f1 0%, #fbf2f3 100%)",
                    padding: "36px 32px",
                }}
            >
                <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 10px" }}>
                    Catalogo de libros
                </h1>
                <p style={{ margin: 0, fontSize: 14.5, color: "#525252", maxWidth: 640, lineHeight: 1.6 }}>
                    Explora nuestra amplia coleccion de titulos academicos, literatura y mucho
                    mas. Encuentra el complemento perfecto para tu estudio.
                </p>
            </section>

            <section style={{ display: "flex", gap: 32, padding: "28px 32px 56px", maxWidth: 1200, margin: "0 auto" }}>
                <aside style={{ width: 240, flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                        <SlidersHorizontal size={17} />
                        <span style={{ fontWeight: 700, fontSize: 16 }}>Filtros</span>
                    </div>

                    <FilterGroup
                        title="Categorias"
                        open={openSections.categorias}
                        onToggle={() => toggleSection("categorias")}
                    >
                        {categorias.map((cat) => (
                            <CheckboxRow
                                key={cat.categoria_id}
                                label={cat.nombre}
                                checked={selectedCategories.includes(cat.nombre)}
                                onChange={() => toggleValue(selectedCategories, setSelectedCategories, cat.nombre)}
                            />
                        ))}
                    </FilterGroup>

                    <FilterGroup
                        title="Disponibilidad"
                        open={openSections.disponibilidad}
                        onToggle={() => toggleSection("disponibilidad")}
                    >
                        {["Disponibles", "Prestados"].map((opt) => (
                            <CheckboxRow
                                key={opt}
                                label={opt}
                                checked={selectedAvailability.includes(opt)}
                                onChange={() =>
                                    toggleValue(selectedAvailability, setSelectedAvailability, opt)
                                }
                            />
                        ))}
                    </FilterGroup>

                    <FilterGroup
                        title="Ano de publicacion"
                        open={openSections.anio}
                        onToggle={() => toggleSection("anio")}
                        noBorder
                    >
                        {YEAR_RANGES.map((range) => (
                            <CheckboxRow
                                key={range.label}
                                label={range.label}
                                checked={selectedYearRanges.includes(range.label)}
                                onChange={() =>
                                    toggleValue(selectedYearRanges, setSelectedYearRanges, range.label)
                                }
                            />
                        ))}
                    </FilterGroup>

                    <button
                        onClick={clearFilters}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#7a2333",
                            fontWeight: 600,
                            fontSize: 13.5,
                            cursor: "pointer",
                            marginTop: 12,
                            padding: 0,
                        }}
                    >
                        Limpiar filtros
                    </button>
                </aside>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                border: "1px solid #e0e0e0",
                                borderRadius: 9,
                                padding: "10px 14px",
                                flex: 1,
                                minWidth: 240,
                            }}
                        >
                            <Search size={16} color="#a3a3a3" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Busca por titulo, autor, categoria..."
                                style={{ border: "none", outline: "none", fontSize: 14, width: "100%" }}
                            />
                        </div>

                        <div
                            style={{
                                display: "flex",
                                border: "1px solid #e0e0e0",
                                borderRadius: 9,
                                overflow: "hidden",
                            }}
                        >
                            <button
                                onClick={() => setViewMode("grid")}
                                style={{
                                    padding: "10px 12px",
                                    border: "none",
                                    background: viewMode === "grid" ? "#f5e0e3" : "#fff",
                                    cursor: "pointer",
                                    display: "flex",
                                }}
                            >
                                <LayoutGrid size={16} color={viewMode === "grid" ? "#7a2333" : "#737373"} />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                style={{
                                    padding: "10px 12px",
                                    border: "none",
                                    borderLeft: "1px solid #e0e0e0",
                                    background: viewMode === "list" ? "#f5e0e3" : "#fff",
                                    cursor: "pointer",
                                    display: "flex",
                                }}
                            >
                                <List size={16} color={viewMode === "list" ? "#7a2333" : "#737373"} />
                            </button>
                        </div>

                        <div style={{ position: "relative" }}>
                            <button
                                onClick={() => setSortOpen((s) => !s)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    border: "1px solid #e0e0e0",
                                    background: "#fff",
                                    borderRadius: 9,
                                    padding: "10px 16px",
                                    fontSize: 13.5,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                Ordenar por: {sortBy}
                                <ChevronDown size={14} />
                            </button>
                            {sortOpen && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 42,
                                        right: 0,
                                        background: "#fff",
                                        border: "1px solid #ececec",
                                        borderRadius: 9,
                                        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                                        minWidth: 160,
                                        zIndex: 10,
                                    }}
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => {
                                                setSortBy(opt);
                                                setSortOpen(false);
                                            }}
                                            style={{
                                                display: "block",
                                                width: "100%",
                                                textAlign: "left",
                                                padding: "10px 14px",
                                                border: "none",
                                                background: sortBy === opt ? "#f5e0e3" : "#fff",
                                                color: sortBy === opt ? "#7a2333" : "#171717",
                                                fontSize: 13.5,
                                                fontWeight: sortBy === opt ? 600 : 500,
                                                cursor: "pointer",
                                            }}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <p style={{ fontSize: 13.5, color: "#525252", margin: "0 0 20px" }}>
                        Mostrando <strong>{paginatedBooks.length}</strong> de{" "}
                        <strong>{filteredBooks.length}</strong> resultados
                    </p>

                    {paginatedBooks.length === 0 ? (
                        <p style={{ color: "#737373", fontSize: 14.5 }}>
                            No se encontraron libros con estos filtros.
                        </p>
                    ) : viewMode === "grid" ? (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                                gap: 20,
                            }}
                        >
                            {paginatedBooks.map((book) => (
                                <BookCard key={book.id_libro} book={book} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {paginatedBooks.map((book) => (
                                <BookRow key={book.id_libro} book={book} />
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: 8,
                                marginTop: 36,
                                flexWrap: "wrap",
                            }}
                        >
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                style={pagerBtn(false, page === 1)}
                            >
                                Anterior
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (page <= 3) {
                                    pageNum = i + 1;
                                } else if (page >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        style={pagerBtn(page === pageNum, false)}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            {totalPages > 5 && <span style={{ color: "#a3a3a3", fontSize: 13 }}>...</span>}
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                style={{ ...pagerBtn(false, false), border: "1px solid #7a2333", color: "#7a2333" }}
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </div>
            </section>

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
                <span>2026 Biblioteca COBAT. Sistema de Gestion Bibliotecaria para el COBAT 19.</span>
                <span style={{ display: "flex", gap: 20 }}>
                    <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "#a3a3a3", textDecoration: "none" }}>
                        Politicas de privacidad
                    </a>
                    <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "#a3a3a3", textDecoration: "none" }}>
                        Terminos y condiciones
                    </a>
                </span>
            </footer>
        </div>
    );
}

function FilterGroup({ title, open, onToggle, children, noBorder }) {
    return (
        <div
            style={{
                borderBottom: noBorder ? "none" : "1px solid #ececec",
                paddingBottom: 16,
                marginBottom: 16,
            }}
        >
            <button
                onClick={onToggle}
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    marginBottom: open ? 12 : 0,
                }}
            >
                <span style={{ fontWeight: 600, fontSize: 14.5 }}>{title}</span>
                {open ? <ChevronUp size={16} color="#737373" /> : <ChevronDown size={16} color="#737373" />}
            </button>
            {open && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
            )}
        </div>
    );
}

function CheckboxRow({ label, checked, onChange }) {
    return (
        <label
            style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                fontSize: 13.5,
                color: "#404040",
                cursor: "pointer",
            }}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                style={{ accentColor: "#7a2333", width: 15, height: 15, cursor: "pointer" }}
            />
            {label}
        </label>
    );
}

function BookCard({ book }) {
    const available = (book.disponibles || 0) > 0;
    const year = book.fecha_registro ? new Date(book.fecha_registro).getFullYear() : "";
    return (
        <div style={{ cursor: "pointer" }}>
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
                {book.imagen ? (
                    <img
                        src={book.imagen}
                        alt={book.titulo}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                ) : (
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#f5e0e3",
                            color: "#7a2333",
                            fontSize: 32,
                            fontWeight: 800,
                        }}
                    >
                        {(book.titulo || "?")[0].toUpperCase()}
                    </div>
                )}
                <span
                    style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        background: "rgba(255,255,255,0.92)",
                        color: available ? "#16a34a" : "#7a2333",
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 999,
                    }}
                >
                    {available ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                    {available ? "Disponible" : "Prestado"}
                </span>
            </div>
            {book.categoria_nombre && (
                <p
                    style={{
                        margin: "0 0 4px",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 0.4,
                        color: "#7a2333",
                        textTransform: "uppercase",
                    }}
                >
                    {book.categoria_nombre}
                </p>
            )}
            <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14.5, lineHeight: 1.35 }}>
                {book.titulo}
            </p>
            <p style={{ margin: "0 0 8px", fontSize: 13, color: "#737373" }}>De {book.autor}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#a3a3a3" }}>{year}</span>
                <ArrowRight size={15} color="#7a2333" />
            </div>
        </div>
    );
}

function BookRow({ book }) {
    const available = (book.disponibles || 0) > 0;
    const year = book.fecha_registro ? new Date(book.fecha_registro).getFullYear() : "";
    return (
        <div
            style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                border: "1px solid #ececec",
                borderRadius: 12,
                padding: 14,
                cursor: "pointer",
            }}
        >
            {book.imagen ? (
                <img
                    src={book.imagen}
                    alt={book.titulo}
                    style={{ width: 56, height: 74, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                />
            ) : (
                <div
                    style={{
                        width: 56,
                        height: 74,
                        borderRadius: 8,
                        flexShrink: 0,
                        background: "#f5e0e3",
                        color: "#7a2333",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                        fontWeight: 800,
                    }}
                >
                    {(book.titulo || "?")[0].toUpperCase()}
                </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
                {book.categoria_nombre && (
                    <p
                        style={{
                            margin: "0 0 2px",
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: 0.4,
                            color: "#7a2333",
                            textTransform: "uppercase",
                        }}
                    >
                        {book.categoria_nombre}
                    </p>
                )}
                <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 15 }}>{book.titulo}</p>
                <p style={{ margin: 0, fontSize: 13, color: "#737373" }}>
                    De {book.autor} {year ? ` · ${year}` : ""}
                </p>
            </div>
            <span
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: available ? "#16a34a" : "#7a2333",
                    flexShrink: 0,
                }}
            >
                {available ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                {available ? "Disponible" : "Prestado"}
            </span>
            <ArrowRight size={16} color="#a3a3a3" style={{ flexShrink: 0 }} />
        </div>
    );
}

function pagerBtn(active, disabled) {
    return {
        minWidth: 36,
        height: 36,
        padding: "0 10px",
        borderRadius: 8,
        border: "1px solid #e0e0e0",
        background: active ? "#7a2333" : "#fff",
        color: active ? "#fff" : disabled ? "#c8c8c8" : "#404040",
        fontSize: 13.5,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
    };
}
