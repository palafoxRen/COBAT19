import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ArrowLeft,
    X,
    Loader2,
    AlertTriangle,
    ImageIcon,
    Eye,
    EyeOff,
    User,
    Folder,
} from "lucide-react";
import api, { getImagenUrl } from "../../../api/axios";
import { getDigitalPorId, actualizarDigital, toggleHabilitado } from "../../../api/digitales";
import { uploadFileToStorage } from "../../../api/storage";
import ConfirmDialog from "../../ConfirmDialog";

export default function EditarDigital() {
    const { id } = useParams();
    const navigate = useNavigate();
    const imageInputRef = useRef(null);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [titulo, setTitulo] = useState("");
    const [autor, setAutor] = useState("");
    const [sinopsis, setSinopsis] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [estaHabilitado, setEstaHabilitado] = useState(true);
    const [libroVinculado, setLibroVinculado] = useState(null);

    const [categorias, setCategorias] = useState([]);
    const [imagenFile, setImagenFile] = useState(null);
    const [imagenPreview, setImagenPreview] = useState(null);

    const [confirmSave, setConfirmSave] = useState(false);
    const [confirmToggle, setConfirmToggle] = useState(false);

    useEffect(() => {
        let active = true;
        Promise.all([
            getDigitalPorId(id),
            api.get("/categorias"),
        ]).then(([digRes, catRes]) => {
            if (!active) return;
            const d = digRes.data;
            setTitulo(d.titulo_digital || "");
            setAutor(d.autor || "");
            setSinopsis(d.sinopsis || "");
            setCategoriaId(d.categoria_id || "");
            setEstaHabilitado(d.esta_habilitado);
            setLibroVinculado(d.libro_titulo || null);
            if (d.imagen_url) setImagenPreview(getImagenUrl(d.imagen_url));
            setCategorias(catRes.data.data || []);
        }).catch(() => {
            if (active) setError("No se pudo cargar la información del libro digital.");
        }).finally(() => {
            if (active) setCargando(false);
        });
        return () => { active = false; };
    }, [id]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Solo se permiten archivos de imagen.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("La imagen no debe superar 5 MB.");
            return;
        }
        setImagenFile(file);
        setImagenPreview(URL.createObjectURL(file));
        setError("");
    };

    const handleRemoveImage = () => {
        setImagenFile(null);
        setImagenPreview(null);
        if (imageInputRef.current) imageInputRef.current.value = "";
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        if (!titulo.trim()) {
            setError("El título es obligatorio.");
            return;
        }
        setConfirmSave(true);
    };

    const doSave = async () => {
        setConfirmSave(false);
        setSubmitting(true);
        try {
            await actualizarDigital(id, {
                titulo_digital: titulo.trim(),
                autor: autor.trim() || null,
                sinopsis: sinopsis.trim() || null,
                categoria_id: categoriaId || null,
            });

            if (imagenFile) {
                const imagenUrl = await uploadFileToStorage(imagenFile, "images");
                await api.post(`/digitales/${id}/imagen`, { imagen_url: imagenUrl });
            }

            navigate("/admin/digitales");
        } catch (err) {
            setError(err.response?.data?.message || "Error al guardar los cambios.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggle = () => setConfirmToggle(true);

    const doToggle = async () => {
        setConfirmToggle(false);
        try {
            const res = await toggleHabilitado(id);
            setEstaHabilitado(res.data.esta_habilitado);
        } catch {
            setError("Error al cambiar la visibilidad.");
        }
    };

    if (cargando) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 16 }}>
                <Loader2 size={36} color="#7a2333" className="animate-spin" />
                <p style={{ color: "#737373", fontSize: 14 }}>Cargando...</p>
            </div>
        );
    }

    if (error && !titulo) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 16 }}>
                <AlertTriangle size={36} color="#dc2626" />
                <p style={{ color: "#dc2626", fontSize: 15, fontWeight: 600 }}>{error}</p>
                <Link to="/admin/digitales" style={{ background: "#7a2333", color: "#fff", padding: "10px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}>
                    Volver
                </Link>
            </div>
        );
    }

    return (
        <>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <Link
                    to="/admin/digitales"
                    style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: "#fff", border: "1px solid #e0e0e0",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "#525252",
                    }}
                >
                    <ArrowLeft size={17} />
                </Link>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Editar libro digital</h1>
                    <p style={{ margin: 0, fontSize: 14, color: "#737373" }}>
                        {libroVinculado ? `Vinculado a: ${libroVinculado}` : "Sin libro físico asociado"}
                    </p>
                </div>
                <button
                    onClick={handleToggle}
                    style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "10px 18px", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
                        border: estaHabilitado ? "1px solid #15803d" : "1px solid #dc2626",
                        background: estaHabilitado ? "#f0fdf4" : "#fef2f2",
                        color: estaHabilitado ? "#15803d" : "#dc2626",
                    }}
                >
                    {estaHabilitado ? <Eye size={16} /> : <EyeOff size={16} />}
                    {estaHabilitado ? "Visible" : "Oculto"}
                </button>
            </div>

            <form
                onSubmit={handleSubmit}
                style={{
                    background: "#fff", border: "1px solid #ececec",
                    borderRadius: 14, padding: 28, maxWidth: 600,
                }}
            >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                            Título del documento *
                        </label>
                        <input
                            type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ej. Matemáticas I"
                            style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: "1px solid #e0e0e0", fontSize: 14, outline: "none" }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                            Autor <span style={{ color: "#a3a3a3", fontWeight: 400 }}>(opcional)</span>
                        </label>
                        <div style={{ position: "relative" }}>
                            <User size={15} color="#a3a3a3" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                            <input
                                type="text" value={autor} onChange={(e) => setAutor(e.target.value)}
                                placeholder="Nombre del autor"
                                style={{ width: "100%", padding: "11px 14px 11px 38px", borderRadius: 9, border: "1px solid #e0e0e0", fontSize: 14, outline: "none" }}
                            />
                        </div>
                    </div>
                </div>

                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Categoría <span style={{ color: "#a3a3a3", fontWeight: 400 }}>(opcional)</span>
                </label>
                <div style={{ position: "relative", marginBottom: 18 }}>
                    <Folder size={15} color="#a3a3a3" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                    <select
                        value={categoriaId}
                        onChange={(e) => setCategoriaId(e.target.value)}
                        style={{ width: "100%", padding: "11px 14px 11px 38px", borderRadius: 9, border: "1px solid #e0e0e0", fontSize: 14, background: "#fff", outline: "none", appearance: "none" }}
                    >
                        <option value="">— Sin categoría —</option>
                        {categorias.map((c) => (
                            <option key={c.categoria_id} value={c.categoria_id}>{c.nombre}</option>
                        ))}
                    </select>
                </div>

                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Sinopsis <span style={{ color: "#a3a3a3", fontWeight: 400 }}>(opcional)</span>
                </label>
                <textarea
                    value={sinopsis} onChange={(e) => setSinopsis(e.target.value)}
                    placeholder="Breve descripción del contenido..."
                    rows={4}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: "1px solid #e0e0e0", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit", marginBottom: 18 }}
                />

                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Imagen de portada <span style={{ color: "#a3a3a3", fontWeight: 400 }}>(opcional)</span>
                </label>
                {imagenPreview ? (
                    <div style={{ position: "relative", marginBottom: 18 }}>
                        <img src={imagenPreview} alt="Vista previa"
                            style={{ width: 120, height: 160, objectFit: "cover", borderRadius: 10, border: "1px solid #e0e0e0" }} />
                        <button type="button" onClick={handleRemoveImage}
                            style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: "50%", background: "#dc2626", color: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                            <X size={12} />
                        </button>
                    </div>
                ) : (
                    <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 9, border: "1.5px dashed #e0e0e0", background: "#fafafa", cursor: "pointer", marginBottom: 18 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f5e0e3", color: "#7a2333", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <ImageIcon size={17} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Selecciona una imagen</p>
                            <p style={{ margin: 0, fontSize: 12.5, color: "#a3a3a3" }}>JPG, PNG o WebP. Máximo 5 MB.</p>
                        </div>
                        <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: "none" }} />
                    </label>
                )}

                {error && (
                    <div style={{ background: "#fdeceb", border: "1px solid #f6c2bd", color: "#dc2626", borderRadius: 8, padding: "11px 14px", fontSize: 13, marginBottom: 16 }}>
                        {error}
                    </div>
                )}

                <button
                    type="submit" disabled={submitting}
                    style={{
                        width: "100%", padding: "13px 20px", borderRadius: 10,
                        background: submitting ? "#a85a68" : "#7a2333", color: "#fff", border: "none",
                        fontSize: 14.5, fontWeight: 700, cursor: submitting ? "default" : "pointer",
                    }}
                >
                    {submitting ? "Guardando..." : "Guardar cambios"}
                </button>
            </form>

            {confirmSave && (
                <ConfirmDialog
                    titulo="Guardar cambios"
                    mensaje="¿Deseas guardar los cambios realizados en este libro digital?"
                    textoConfirmar="Guardar"
                    onConfirmar={doSave}
                    onCancelar={() => setConfirmSave(false)}
                />
            )}

            {confirmToggle && (
                <ConfirmDialog
                    titulo={estaHabilitado ? "Ocultar libro digital" : "Habilitar libro digital"}
                    mensaje={estaHabilitado
                        ? "¿Deseas ocultar este libro digital del catálogo público? Los usuarios no podrán verlo."
                        : "¿Deseas hacer visible este libro digital en el catálogo público?"
                    }
                    textoConfirmar={estaHabilitado ? "Ocultar" : "Habilitar"}
                    colorConfirmar={estaHabilitado ? "#dc2626" : "#15803d"}
                    onConfirmar={doToggle}
                    onCancelar={() => setConfirmToggle(false)}
                />
            )}
        </>
    );
}
