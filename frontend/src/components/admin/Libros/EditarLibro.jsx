import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    BookOpen,
    User,
    Building2,
    Hash,
    Barcode,
    ArrowLeft,
    Folder,
} from "lucide-react";
import api from "../../../api/axios";

export default function EditarLibro() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [ejemplares, setEjemplares] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const [form, setForm] = useState({
        titulo: "",
        autor: "",
        editorial: "",
        dewey: "",
        isbn: "",
        categoria_id: "",
    });

    useEffect(() => {
        let active = true;

        const cargarTodo = async () => {
            try {
                const [catsRes, libroRes] = await Promise.all([
                    api.get("/categorias"),
                    api.get(`/libros/${id}`),
                ]);
                if (!active) return;
                setCategorias(catsRes.data.data || []);
                const libro = libroRes.data.data;
                setForm({
                    titulo: libro.titulo || "",
                    autor: libro.autor || "",
                    editorial: libro.editorial || "",
                    dewey: libro.dewey || "",
                    isbn: libro.isbn || "",
                    categoria_id: libro.categoria_id || "",
                });
                setEjemplares(libro.ejemplares || []);
            } catch {
                if (active) setErrorMsg("No se pudo cargar la información del libro.");
            } finally {
                if (active) setCargando(false);
            }
        };

        cargarTodo();
        return () => {
            active = false;
        };
    }, [id]);

    const handleChange = (field) => (e) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (!form.titulo.trim() || !form.autor.trim() || !form.dewey.trim()) {
            setErrorMsg("Título, autor y clasificación Dewey son obligatorios.");
            return;
        }

        setSubmitting(true);
        try {
            await api.put(`/libros/${id}`, form);
            alert("Libro actualizado correctamente.");
            navigate("/admin/libros");
        } catch (error) {
            setErrorMsg(
                error.response?.data?.message || "Error al actualizar el libro.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (cargando) {
        return <p style={{ color: "#737373", fontSize: 14 }}>Cargando libro...</p>;
    }

    return (
        <>
            <button
                onClick={() => navigate("/admin/libros")}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "none",
                    border: "none",
                    color: "#737373",
                    fontSize: 13.5,
                    cursor: "pointer",
                    padding: 0,
                    marginBottom: 18,
                }}
            >
                <ArrowLeft size={15} />
                Volver al inventario
            </button>

            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>
                Editar libro
            </h1>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "#737373" }}>
                Actualiza los datos del título. Los ejemplares físicos no se editan
                aquí.
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 300px",
                    gap: 20,
                    alignItems: "start",
                }}
            >
                <div
                    style={{
                        background: "#fff",
                        border: "1px solid #ececec",
                        borderRadius: 14,
                        padding: 28,
                    }}
                >
                    <form onSubmit={handleSubmit}>
                        <FieldLabel>Título</FieldLabel>
                        <IconInput
                            icon={BookOpen}
                            placeholder="Título del libro"
                            value={form.titulo}
                            onChange={handleChange("titulo")}
                        />

                        <FieldLabel>Autor</FieldLabel>
                        <IconInput
                            icon={User}
                            placeholder="Nombre del autor"
                            value={form.autor}
                            onChange={handleChange("autor")}
                        />

                        <FieldLabel>Editorial (opcional)</FieldLabel>
                        <IconInput
                            icon={Building2}
                            placeholder="Editorial"
                            value={form.editorial}
                            onChange={handleChange("editorial")}
                        />

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 14,
                            }}
                        >
                            <div>
                                <FieldLabel>Clasificación Dewey</FieldLabel>
                                <IconInput
                                    icon={Hash}
                                    placeholder="e.g. 813.6"
                                    value={form.dewey}
                                    onChange={handleChange("dewey")}
                                />
                            </div>
                            <div>
                                <FieldLabel>ISBN (opcional)</FieldLabel>
                                <IconInput
                                    icon={Barcode}
                                    placeholder="978-..."
                                    value={form.isbn}
                                    onChange={handleChange("isbn")}
                                />
                            </div>
                        </div>

                        <FieldLabel>Categoría (opcional)</FieldLabel>
                        <div style={{ position: "relative", marginBottom: 16 }}>
                            <Folder
                                size={15}
                                color="#a3a3a3"
                                style={{
                                    position: "absolute",
                                    left: 12,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                }}
                            />
                            <select
                                value={form.categoria_id}
                                onChange={handleChange("categoria_id")}
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "11px 12px 11px 36px",
                                    borderRadius: 10,
                                    border: "1px solid #e0e0e0",
                                    fontSize: 14,
                                    outline: "none",
                                    color: form.categoria_id ? "#171717" : "#9ca3af",
                                    background: "#fff",
                                    appearance: "none",
                                }}
                            >
                                <option value="" disabled>
                                    Selecciona una categoría...
                                </option>
                                <option value="">Sin categoría</option>
                                {categorias.map((c) => (
                                    <option key={c.categoria_id} value={c.categoria_id}>
                                        {c.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {errorMsg && (
                            <div
                                style={{
                                    background: "#fdeceb",
                                    border: "1px solid #f6c2bd",
                                    color: "#dc2626",
                                    borderRadius: 8,
                                    padding: "10px 12px",
                                    fontSize: 13,
                                    marginBottom: 16,
                                }}
                            >
                                {errorMsg}
                            </div>
                        )}

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
                        >
                            {submitting ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </form>
                </div>

                <div
                    style={{
                        background: "#fff",
                        border: "1px solid #ececec",
                        borderRadius: 14,
                        padding: 20,
                    }}
                >
                    <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>
                        Ejemplares ({ejemplares.length})
                    </h3>
                    {ejemplares.length === 0 && (
                        <p style={{ margin: 0, fontSize: 13, color: "#a3a3a3" }}>
                            Sin ejemplares registrados.
                        </p>
                    )}
                    {ejemplares.map((e) => (
                        <div
                            key={e.libro_inventario}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "8px 0",
                                borderTop: "1px solid #f2f2f2",
                                fontSize: 12.5,
                            }}
                        >
                            <div>
                                <p style={{ margin: 0, fontWeight: 600 }}>
                                    {e.libro_inventario}
                                </p>
                                <p style={{ margin: 0, color: "#a3a3a3" }}>{e.estado_fisico}</p>
                            </div>
                            <span
                                style={{
                                    padding: "3px 10px",
                                    borderRadius: 999,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    background: e.disponibilidad ? "#f0fdf4" : "#fdeceb",
                                    color: e.disponibilidad ? "#15803d" : "#dc2626",
                                }}
                            >
                                {e.disponibilidad ? "Disponible" : "Prestado"}
                            </span>
                        </div>
                    ))}
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

function IconInput({
    icon: Icon,
    value,
    onChange,
    placeholder,
    marginBottom = 16,
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
                type="text"
                value={value}
                onChange={onChange}
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