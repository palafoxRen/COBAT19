import { useState, useEffect } from "react";
import { X, Plus, Pencil, Trash2, Folder } from "lucide-react";
import api from "../../../api/axios";
import ConfirmDialog from "../../ConfirmDialog";

export default function GestionCategorias({ onClose }) {
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [saving, setSaving] = useState(false);

    const [confirmDelete, setConfirmDelete] = useState(null);

    const cargarCategorias = () => {
        api.get("/categorias")
            .then((res) => setCategorias(res.data.data || []))
            .catch(() => setError("Error al cargar categorías."))
            .finally(() => setCargando(false));
    };

    useEffect(() => { cargarCategorias(); }, []);

    const openCreate = () => {
        setEditId(null);
        setNombre("");
        setDescripcion("");
        setShowForm(true);
        setError("");
    };

    const openEdit = (cat) => {
        setEditId(cat.categoria_id);
        setNombre(cat.nombre);
        setDescripcion(cat.descripcion || "");
        setShowForm(true);
        setError("");
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!nombre.trim()) {
            setError("El nombre es obligatorio.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            if (editId) {
                await api.put(`/categorias/${editId}`, { nombre: nombre.trim(), descripcion: descripcion.trim() || null });
            } else {
                await api.post("/categorias", { nombre: nombre.trim(), descripcion: descripcion.trim() || null });
            }
            setShowForm(false);
            cargarCategorias();
        } catch (err) {
            setError(err.response?.data?.message || "Error al guardar la categoría.");
        } finally {
            setSaving(false);
        }
    };

    const doDelete = async () => {
        const id = confirmDelete;
        setConfirmDelete(null);
        try {
            await api.delete(`/categorias/${id}`);
            setCategorias((prev) => prev.filter((c) => c.categoria_id !== id));
        } catch (err) {
            setError(err.response?.data?.message || "Error al eliminar la categoría.");
        }
    };

    const inputBase = {
        width: "100%",
        boxSizing: "border-box",
        padding: "10px 12px",
        borderRadius: 9,
        border: "1px solid #e0e0e0",
        fontSize: 14,
        outline: "none",
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, zIndex: 60,
                background: "rgba(0,0,0,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#fff", borderRadius: 14, padding: 28,
                    width: 480, maxWidth: "92%", maxHeight: "85vh",
                    display: "flex", flexDirection: "column",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Gestionar categorías</h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
                        <X size={18} color="#737373" />
                    </button>
                </div>

                <button
                    onClick={openCreate}
                    style={{
                        display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
                        padding: "9px 16px", borderRadius: 9, border: "1px solid #e0e0e0",
                        background: "#fff", color: "#525252", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}
                >
                    <Plus size={15} />
                    Nueva categoría
                </button>

                {showForm && (
                    <form onSubmit={handleSave} style={{ marginBottom: 16, padding: 16, borderRadius: 10, background: "#fafafa", border: "1px solid #ececec" }}>
                        <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#404040", marginBottom: 4 }}>
                            Nombre *
                        </label>
                        <input
                            type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej. Matemáticas"
                            style={{ ...inputBase, marginBottom: 10 }}
                            autoFocus
                        />
                        <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#404040", marginBottom: 4 }}>
                            Descripción <span style={{ color: "#a3a3a3", fontWeight: 400 }}>(opcional)</span>
                        </label>
                        <textarea
                            value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Breve descripción..."
                            rows={2}
                            style={{ ...inputBase, marginBottom: 10, resize: "vertical", fontFamily: "inherit" }}
                        />
                        {error && (
                            <div style={{ background: "#fdeceb", border: "1px solid #f6c2bd", color: "#dc2626", borderRadius: 8, padding: "8px 12px", fontSize: 12.5, marginBottom: 10 }}>
                                {error}
                            </div>
                        )}
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button type="button" onClick={() => { setShowForm(false); setError(""); }}
                                style={{ padding: "8px 16px", borderRadius: 9, border: "1px solid #e0e0e0", background: "#fff", color: "#525252", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                                Cancelar
                            </button>
                            <button type="submit" disabled={saving}
                                style={{ padding: "8px 16px", borderRadius: 9, border: "none", background: "#7a2333", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1 }}>
                                {saving ? "Guardando..." : editId ? "Actualizar" : "Crear"}
                            </button>
                        </div>
                    </form>
                )}

                {error && !showForm && (
                    <div style={{ background: "#fdeceb", border: "1px solid #f6c2bd", color: "#dc2626", borderRadius: 8, padding: "10px 12px", fontSize: 13, marginBottom: 12 }}>
                        {error}
                    </div>
                )}

                <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                    {cargando ? (
                        <p style={{ color: "#a3a3a3", fontSize: 13, textAlign: "center", padding: 20 }}>Cargando...</p>
                    ) : categorias.length === 0 ? (
                        <p style={{ color: "#a3a3a3", fontSize: 13, textAlign: "center", padding: 20 }}>No hay categorías creadas.</p>
                    ) : (
                        categorias.map((cat) => (
                            <div
                                key={cat.categoria_id}
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "10px 0", borderTop: "1px solid #f2f2f2",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <Folder size={14} color="#6d28d9" />
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>{cat.nombre}</p>
                                        <p style={{ margin: 0, fontSize: 12, color: "#a3a3a3" }}>
                                            {cat.total_libros} libro(s){cat.descripcion ? ` — ${cat.descripcion}` : ""}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                    <button onClick={() => openEdit(cat)}
                                        style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #e0e0e0", background: "#fff", color: "#525252", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Pencil size={13} />
                                    </button>
                                    <button onClick={() => setConfirmDelete(cat.categoria_id)}
                                        style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #fca5a5", background: "#fff", color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {confirmDelete && (() => {
                const cat = categorias.find((c) => c.categoria_id === confirmDelete);
                return (
                    <ConfirmDialog
                        titulo="Eliminar categoría"
                        mensaje={cat?.total_libros > 0
                            ? `¿Eliminar "${cat?.nombre}"? Los ${cat.total_libros} libro(s) asociados quedarán sin categoría.`
                            : `¿Estás seguro de eliminar la categoría "${cat?.nombre}"?`
                        }
                        textoConfirmar="Eliminar"
                        colorConfirmar="#dc2626"
                        onConfirmar={doDelete}
                        onCancelar={() => setConfirmDelete(null)}
                    />
                );
            })()}
        </div>
    );
}
