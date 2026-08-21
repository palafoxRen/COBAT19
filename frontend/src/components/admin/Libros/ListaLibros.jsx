import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Pencil, BookOpen, Trash2, Tags } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../../api/axios";
import ConfirmDialog from "../../ConfirmDialog";
import GestionCategorias from "./GestionCategorias";

export default function ListaLibros() {
    const [libros, setLibros] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [search, setSearch] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [error, setError] = useState("");
    const [showCategorias, setShowCategorias] = useState(false);

    useEffect(() => {
        let cancelled = false;
        api.get("/libros")
            .then((res) => { if (!cancelled) setLibros(res.data.data || []); })
            .catch((e) => { if (!cancelled) setError(e.response?.data?.message || "Error al cargar libros."); })
            .finally(() => { if (!cancelled) setCargando(false); });
        return () => { cancelled = true; };
    }, []);

    const filtrados = useMemo(() => {
        if (!search.trim()) return libros;
        const q = search.toLowerCase();
        return libros.filter(
            (l) =>
                l.titulo?.toLowerCase().includes(q) ||
                l.autor?.toLowerCase().includes(q) ||
                l.dewey?.toLowerCase().includes(q) ||
                l.isbn?.toLowerCase().includes(q),
        );
    }, [libros, search]);

    const doDelete = async () => {
        const id = confirmDelete;
        setConfirmDelete(null);
        try {
            await api.delete(`/libros/${id}`);
            setLibros((prev) => prev.filter((l) => l.id_libro !== id));
        } catch (e) {
            setError(e.response?.data?.message || "Error al eliminar el libro.");
        }
    };

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
                        Inventario
                    </h1>
                    <p style={{ margin: 0, fontSize: 14, color: "#737373" }}>
                        Consulta y administra los libros y ejemplares de la biblioteca.
                    </p>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                        onClick={() => setShowCategorias(true)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            background: "#fff",
                            color: "#525252",
                            border: "1px solid #e0e0e0",
                            borderRadius: 10,
                            padding: "11px 18px",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        <Tags size={16} />
                        Categorías
                    </button>
                    <Link
                        to="/admin/libros/nuevo"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            background: "#7a2333",
                            color: "#fff",
                            border: "none",
                            borderRadius: 10,
                            padding: "11px 18px",
                            fontSize: 14,
                            fontWeight: 700,
                            textDecoration: "none",
                        }}
                    >
                        <Plus size={16} />
                        Agregar libro
                    </Link>
                </div>
            </div>

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
                        alignItems: "center",
                        gap: 8,
                        border: "1px solid #e0e0e0",
                        borderRadius: 9,
                        padding: "9px 14px",
                        maxWidth: 360,
                        marginBottom: 20,
                    }}
                >
                    <Search size={15} color="#a3a3a3" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por título, autor, dewey o ISBN..."
                        style={{
                            border: "none",
                            outline: "none",
                            fontSize: 13.5,
                            width: "100%",
                        }}
                    />
                </div>

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
                                <th style={{ padding: "8px 10px", fontWeight: 600 }}>Título</th>
                                <th style={{ padding: "8px 10px", fontWeight: 600 }}>Autor</th>
                                <th style={{ padding: "8px 10px", fontWeight: 600 }}>Categoría</th>
                                <th style={{ padding: "8px 10px", fontWeight: 600 }}>Dewey</th>
                                <th style={{ padding: "8px 10px", fontWeight: 600 }}>
                                    Ejemplares
                                </th>
                                <th style={{ padding: "8px 10px", fontWeight: 600 }}>
                                    Disponibles
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
                                        colSpan={7}
                                        style={{
                                            padding: "24px 10px",
                                            textAlign: "center",
                                            color: "#a3a3a3",
                                        }}
                                    >
                                        Cargando libros...
                                    </td>
                                </tr>
                            )}
                            {!cargando && filtrados.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        style={{
                                            padding: "24px 10px",
                                            textAlign: "center",
                                            color: "#a3a3a3",
                                        }}
                                    >
                                        No hay libros que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}
                            {!cargando &&
                                filtrados.map((libro) => (
                                    <tr
                                        key={libro.id_libro}
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
                                                    <BookOpen size={15} color="#7a2333" />
                                                </div>
                                                <p style={{ margin: 0, fontWeight: 600 }}>
                                                    {libro.titulo}
                                                </p>
                                            </div>
                                        </td>
                                        <td style={{ padding: "14px 10px", color: "#525252" }}>
                                            {libro.autor}
                                        </td>
                                        <td style={{ padding: "14px 10px" }}>
                                            {libro.categoria_nombre ? (
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        padding: "4px 12px",
                                                        borderRadius: 999,
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        background: "#f5f3ff",
                                                        color: "#6d28d9",
                                                    }}
                                                >
                                                    {libro.categoria_nombre}
                                                </span>
                                            ) : (
                                                <span style={{ color: "#a3a3a3" }}>—</span>
                                            )}
                                        </td>
                                        <td style={{ padding: "14px 10px", color: "#525252" }}>
                                            {libro.dewey}
                                        </td>
                                        <td style={{ padding: "14px 10px", color: "#525252" }}>
                                            {libro.total_ejemplares}
                                        </td>
                                        <td style={{ padding: "14px 10px" }}>
                                            <span
                                                style={{
                                                    padding: "4px 12px",
                                                    borderRadius: 999,
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    background:
                                                        Number(libro.disponibles) > 0
                                                            ? "#f0fdf4"
                                                            : "#fdeceb",
                                                    color:
                                                        Number(libro.disponibles) > 0
                                                            ? "#15803d"
                                                            : "#dc2626",
                                                }}
                                            >
                                                {libro.disponibles} disponible(s)
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 10px" }}>
                                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                <Link
                                                    to={`/admin/libros/${libro.id_libro}/editar`}
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                        border: "1px solid #7a2333",
                                                        color: "#7a2333",
                                                        background: "#fff",
                                                        borderRadius: 8,
                                                        padding: "7px 14px",
                                                        fontSize: 12.5,
                                                        fontWeight: 600,
                                                        textDecoration: "none",
                                                    }}
                                                >
                                                    <Pencil size={13} />
                                                    Editar
                                                </Link>
                                                <button
                                                    onClick={() => setConfirmDelete(libro.id_libro)}
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                        border: "1px solid #fca5a5",
                                                        color: "#dc2626",
                                                        background: "#fff",
                                                        borderRadius: 8,
                                                        padding: "7px 14px",
                                                        fontSize: 12.5,
                                                        fontWeight: 600,
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <Trash2 size={13} />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                <p style={{ margin: "16px 0 0", fontSize: 13, color: "#737373" }}>
                    Mostrando {filtrados.length} de {libros.length} libro(s)
                </p>
            </div>

            {confirmDelete && (() => {
                const item = libros.find((l) => l.id_libro === confirmDelete);
                return (
                    <ConfirmDialog
                        titulo="Eliminar libro"
                        mensaje={item?.total_ejemplares > 0
                            ? `No se puede eliminar "${item?.titulo}" porque tiene ${item.total_ejemplares} ejemplar(es) registrado(s). Primero elimina o transfiere los ejemplares.`
                            : `¿Estás seguro de eliminar "${item?.titulo}"? Esta acción no se puede deshacer.`
                        }
                        textoConfirmar="Eliminar"
                        colorConfirmar="#dc2626"
                        onConfirmar={doDelete}
                        onCancelar={() => setConfirmDelete(null)}
                    />
                );
            })()}

            {showCategorias && (
                <GestionCategorias onClose={() => setShowCategorias(false)} />
            )}
        </>
    );
}
