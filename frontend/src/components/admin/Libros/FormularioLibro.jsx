import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    BookOpen,
    User,
    Building2,
    Hash,
    Barcode,
    ArrowLeft,
    Folder,
    ImageIcon,
    X,
} from "lucide-react";
import api from "../../../api/axios";

export default function FormularioLibro() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [categorias, setCategorias] = useState([]);
    const [imagenPreview, setImagenPreview] = useState(null);
    const [imagenFile, setImagenFile] = useState(null);

    const [form, setForm] = useState({
        titulo: "",
        autor: "",
        editorial: "",
        dewey: "",
        isbn: "",
        libro_inventario: "",
        categoria_id: "",
        sinopsis: "",
    });

    useEffect(() => {
        let active = true;
        api.get("/categorias")
            .then((res) => {
                if (active) setCategorias(res.data.data || []);
            })
            .catch(() => {});
        return () => { active = false; };
    }, []);

    const handleChange = (field) => (e) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setErrorMsg("Solo se permiten archivos de imagen.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrorMsg("La imagen no debe superar 5 MB.");
            return;
        }
        setImagenFile(file);
        setImagenPreview(URL.createObjectURL(file));
        setErrorMsg("");
    };

    const handleRemoveImage = () => {
        setImagenFile(null);
        setImagenPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (
            !form.titulo.trim() ||
            !form.autor.trim() ||
            !form.dewey.trim() ||
            !form.libro_inventario.trim()
        ) {
            setErrorMsg(
                "Título, autor, clasificación Dewey y código de inventario son obligatorios.",
            );
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.post("/libros", form);
            const nuevoId = res.data.data?.id_libro;

            if (imagenFile && nuevoId) {
                const fd = new FormData();
                fd.append("imagen", imagenFile);
                await api.post(`/libros/${nuevoId}/imagen`, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            alert("Libro registrado correctamente.");
            navigate("/admin/libros");
        } catch (error) {
            setErrorMsg(
                error.response?.data?.message || "Error al registrar el libro.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    const inputBase = {
        width: "100%",
        boxSizing: "border-box",
        borderRadius: 10,
        border: "1px solid #e0e0e0",
        fontSize: 14,
        outline: "none",
        color: "#171717",
        background: "#fff",
    };

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
                Agregar libro
            </h1>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "#737373" }}>
                Registra un nuevo título junto con su primer ejemplar físico.
            </p>

            <div
                style={{
                    background: "#fff",
                    border: "1px solid #ececec",
                    borderRadius: 14,
                    padding: 28,
                    maxWidth: 600,
                }}
            >
                <form onSubmit={handleSubmit}>
                    {/* Imagen de portada */}
                    <FieldLabel>Portada (opcional)</FieldLabel>
                    <div style={{ marginBottom: 16 }}>
                        {imagenPreview ? (
                            <div style={{ position: "relative", display: "inline-block" }}>
                                <img
                                    src={imagenPreview}
                                    alt="Vista previa"
                                    style={{
                                        width: 140,
                                        height: 190,
                                        objectFit: "cover",
                                        borderRadius: 10,
                                        border: "1px solid #e0e0e0",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    style={{
                                        position: "absolute",
                                        top: -8,
                                        right: -8,
                                        width: 24,
                                        height: 24,
                                        borderRadius: "50%",
                                        background: "#dc2626",
                                        color: "#fff",
                                        border: "none",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    width: 140,
                                    height: 190,
                                    borderRadius: 10,
                                    border: "2px dashed #d0d0d0",
                                    background: "#fafafa",
                                    cursor: "pointer",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    color: "#a3a3a3",
                                    fontSize: 12,
                                }}
                            >
                                <ImageIcon size={28} />
                                Seleccionar imagen
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageSelect}
                            style={{ display: "none" }}
                        />
                        <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#a3a3a3" }}>
                            JPG, PNG o WebP. Máximo 5 MB.
                        </p>
                    </div>

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

                    <FieldLabel>Sinopsis (opcional)</FieldLabel>
                    <textarea
                        value={form.sinopsis}
                        onChange={handleChange("sinopsis")}
                        placeholder="Breve descripción del libro..."
                        rows={4}
                        style={{
                            ...inputBase,
                            padding: "10px 12px",
                            marginBottom: 16,
                            resize: "vertical",
                            fontFamily: "inherit",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#7a2333")}
                        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                    />

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
                                ...inputBase,
                                padding: "11px 12px 11px 36px",
                                color: form.categoria_id ? "#171717" : "#9ca3af",
                                appearance: "none",
                            }}
                        >
                            <option value="" disabled>
                                Selecciona una categoría...
                            </option>
                            {categorias.map((c) => (
                                <option key={c.categoria_id} value={c.categoria_id}>
                                    {c.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div
                        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
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

                    <FieldLabel>Código de inventario del ejemplar</FieldLabel>
                    <IconInput
                        icon={Barcode}
                        placeholder="e.g. 16-CB19-00001"
                        value={form.libro_inventario}
                        onChange={handleChange("libro_inventario")}
                        marginBottom={4}
                    />
                    <p style={{ margin: "4px 0 20px", fontSize: 12, color: "#a3a3a3" }}>
                        Este código identifica el ejemplar físico que se agregará
                        automáticamente.
                    </p>

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
                        {submitting ? "Registrando..." : "Registrar libro"}
                    </button>
                </form>
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
