import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Upload, BookOpen, FileText, X, ShieldCheck, ImageIcon } from "lucide-react";
import { uploadDigital } from "../../../api/digitales";
import api from "../../../api/axios";

export default function SubirPDF() {
    const navigate = useNavigate();
    const imageInputRef = useRef(null);
    const [titulo, setTitulo] = useState("");
    const [sinopsis, setSinopsis] = useState("");
    const [idLibro, setIdLibro] = useState("");
    const [archivo, setArchivo] = useState(null);
    const [imagenFile, setImagenFile] = useState(null);
    const [imagenPreview, setImagenPreview] = useState(null);
    const [libros, setLibros] = useState([]);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");
    const [showLicenseModal, setShowLicenseModal] = useState(false);
    const [licenseType, setLicenseType] = useState("");
    const [licenseAccepted, setLicenseAccepted] = useState(false);

    useEffect(() => {
        api.get("/libros")
            .then((res) => setLibros(res.data.data || []))
            .catch(() => setLibros([]));
    }, []);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!titulo.trim()) {
            setError("El título del documento es obligatorio.");
            return;
        }
        if (!archivo) {
            setError("Debes seleccionar un archivo PDF.");
            return;
        }
        if (archivo.type !== "application/pdf" && !archivo.name.toLowerCase().endsWith(".pdf")) {
            setError("Solo se permiten archivos PDF.");
            return;
        }
        if (archivo.size > 20 * 1024 * 1024) {
            setError("El archivo no puede superar los 20 MB.");
            return;
        }

        setShowLicenseModal(true);
    };

    const handleConfirmUpload = async () => {
        if (!licenseType || !licenseAccepted) return;

        setShowLicenseModal(false);
        setEnviando(true);
        try {
            const formData = new FormData();
            formData.append("titulo_digital", titulo.trim());
            if (sinopsis.trim()) formData.append("sinopsis", sinopsis.trim());
            if (idLibro) formData.append("id_libro", idLibro);
            formData.append("pdf", archivo);
            formData.append("licencia_tipo", licenseType);

            const res = await uploadDigital(formData);
            const digitalId = res.data?.digital_id;

            if (imagenFile && digitalId) {
                const fd = new FormData();
                fd.append("imagen", imagenFile);
                await api.post(`/digitales/${digitalId}/imagen`, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            navigate("/admin/digitales");
        } catch (err) {
            setError(err.response?.data?.message || "Error al subir el PDF. Inténtalo de nuevo.");
            setEnviando(false);
        }
    };

    return (
        <>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <Link
                    to="/admin/digitales"
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "#fff",
                        border: "1px solid #e0e0e0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#525252",
                    }}
                >
                    <ArrowLeft size={17} />
                </Link>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>
                        Subir libro digital
                    </h1>
                    <p style={{ margin: 0, fontSize: 14, color: "#737373" }}>
                        Adjunta un PDF y asócialo a un libro del inventario.
                    </p>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                style={{
                    background: "#fff",
                    border: "1px solid #ececec",
                    borderRadius: 14,
                    padding: 28,
                    maxWidth: 560,
                }}
            >
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Título del documento *
                </label>
                <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej. Matemáticas I - Unidad 2"
                    style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: 9,
                        border: "1px solid #e0e0e0",
                        fontSize: 14,
                        marginBottom: 18,
                        outline: "none",
                    }}
                />

                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Libro relacionado <span style={{ color: "#a3a3a3", fontWeight: 400 }}>(opcional)</span>
                </label>
                <div style={{ position: "relative", marginBottom: 18 }}>
                    <BookOpen
                        size={15}
                        color="#a3a3a3"
                        style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}
                    />
                    <select
                        value={idLibro}
                        onChange={(e) => setIdLibro(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "11px 14px 11px 38px",
                            borderRadius: 9,
                            border: "1px solid #e0e0e0",
                            fontSize: 14,
                            background: "#fff",
                            outline: "none",
                            appearance: "none",
                        }}
                    >
                        <option value="">— Sin libro asociado —</option>
                        {libros.map((l) => (
                            <option key={l.id_libro} value={l.id_libro}>
                                {l.titulo} {l.autor ? `· ${l.autor}` : ""}
                            </option>
                        ))}
                    </select>
                </div>

                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Sinopsis <span style={{ color: "#a3a3a3", fontWeight: 400 }}>(opcional)</span>
                </label>
                <textarea
                    value={sinopsis}
                    onChange={(e) => setSinopsis(e.target.value)}
                    placeholder="Breve descripción del documento..."
                    rows={3}
                    style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: 9,
                        border: "1px solid #e0e0e0",
                        fontSize: 14,
                        marginBottom: 18,
                        outline: "none",
                        resize: "vertical",
                        fontFamily: "inherit",
                    }}
                />

                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Imagen de portada <span style={{ color: "#a3a3a3", fontWeight: 400 }}>(opcional)</span>
                </label>
                {imagenPreview ? (
                    <div style={{ position: "relative", marginBottom: 18 }}>
                        <img
                            src={imagenPreview}
                            alt="Vista previa"
                            style={{ width: 120, height: 160, objectFit: "cover", borderRadius: 10, border: "1px solid #e0e0e0" }}
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
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                            }}
                        >
                            <X size={12} />
                        </button>
                    </div>
                ) : (
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "14px 18px",
                            borderRadius: 9,
                            border: "1.5px dashed #e0e0e0",
                            background: "#fafafa",
                            cursor: "pointer",
                            marginBottom: 18,
                        }}
                    >
                        <div
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: 10,
                                background: "#f5e0e3",
                                color: "#7a2333",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <ImageIcon size={17} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Selecciona una imagen</p>
                            <p style={{ margin: 0, fontSize: 12.5, color: "#a3a3a3" }}>JPG, PNG o WebP. Máximo 5 MB.</p>
                        </div>
                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            style={{ display: "none" }}
                        />
                    </label>
                )}

                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Archivo PDF *
                </label>
                <label
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "16px 18px",
                        borderRadius: 9,
                        border: "1.5px dashed #e0e0e0",
                        background: "#fafafa",
                        cursor: "pointer",
                        marginBottom: 22,
                    }}
                >
                    <div
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: "#f5e0e3",
                            color: "#7a2333",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        {archivo ? <FileText size={17} /> : <Upload size={17} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                            {archivo ? archivo.name : "Selecciona un archivo PDF"}
                        </p>
                        <p style={{ margin: 0, fontSize: 12.5, color: "#a3a3a3" }}>
                            {archivo
                                ? `${(archivo.size / 1024 / 1024).toFixed(2)} MB · PDF`
                                : "Máximo 20 MB, solo formato PDF"}
                        </p>
                    </div>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                        style={{ display: "none" }}
                    />
                </label>

                {error && (
                    <div
                        style={{
                            background: "#fdeceb",
                            border: "1px solid #f6c2bd",
                            color: "#dc2626",
                            borderRadius: 8,
                            padding: "11px 14px",
                            fontSize: 13,
                            marginBottom: 16,
                        }}
                    >
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={enviando}
                    style={{
                        width: "100%",
                        padding: "13px 20px",
                        borderRadius: 10,
                        background: "#7a2333",
                        color: "#fff",
                        border: "none",
                        fontSize: 14.5,
                        fontWeight: 700,
                        cursor: enviando ? "not-allowed" : "pointer",
                        opacity: enviando ? 0.6 : 1,
                    }}
                >
                    {enviando ? "Subiendo..." : "Subir PDF"}
                </button>
            </form>

            {showLicenseModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 50,
                    }}
                    onClick={() => {
                        setShowLicenseModal(false);
                        setLicenseType("");
                        setLicenseAccepted(false);
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            borderRadius: 14,
                            padding: 28,
                            width: 420,
                            maxWidth: "90%",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 10,
                                    background: "#f5e0e3",
                                    color: "#7a2333",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                    <ShieldCheck size={18} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                                    Verificación de licencia
                                </h3>
                            </div>
                            <button
                                onClick={() => {
                                    setShowLicenseModal(false);
                                    setLicenseType("");
                                    setLicenseAccepted(false);
                                }}
                                style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
                            >
                                <X size={18} color="#737373" />
                            </button>
                        </div>

                        <p style={{ margin: "0 0 18px", fontSize: 13.5, color: "#525252", lineHeight: 1.5 }}>
                            Antes de subir el archivo <strong>{archivo?.name}</strong>, confirma que el documento cumple con una de las siguientes condiciones:
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                            {[
                                { value: "dominio_publico", label: "Dominio público", desc: "La obra no tiene restricciones de derechos de autor." },
                                { value: "licencia_libre", label: "Licencia libre", desc: "Cuenta con licencia Creative Commons u otra licencia abierta." },
                                { value: "autoria_institucional", label: "Autoría institucional", desc: "Fue creado por personal de la institución educativa." },
                            ].map((opt) => (
                                <label
                                    key={opt.value}
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 10,
                                        padding: "10px 12px",
                                        borderRadius: 8,
                                        border: licenseType === opt.value ? "1.5px solid #7a2333" : "1px solid #e5e5e5",
                                        background: licenseType === opt.value ? "#fdf2f3" : "#fafafa",
                                        cursor: "pointer",
                                        transition: "all 0.15s",
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="licenseType"
                                        value={opt.value}
                                        checked={licenseType === opt.value}
                                        onChange={() => setLicenseType(opt.value)}
                                        style={{ marginTop: 2, accentColor: "#7a2333" }}
                                    />
                                    <div>
                                        <span style={{ fontSize: 13.5, fontWeight: 600, color: "#171717" }}>
                                            {opt.label}
                                        </span>
                                        <p style={{ margin: 0, fontSize: 12, color: "#737373", marginTop: 2 }}>
                                            {opt.desc}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <label
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 8,
                                marginBottom: 20,
                                cursor: "pointer",
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={licenseAccepted}
                                onChange={(e) => setLicenseAccepted(e.target.checked)}
                                style={{ marginTop: 2, accentColor: "#7a2333" }}
                            />
                            <span style={{ fontSize: 13, color: "#525252", lineHeight: 1.45 }}>
                                Acepto que soy responsable de verificar que el archivo cumple con la condición seleccionada y que no infringe derechos de autor de terceros.
                            </span>
                        </label>

                        <div style={{ display: "flex", gap: 10 }}>
                            <button
                                onClick={() => {
                                    setShowLicenseModal(false);
                                    setLicenseType("");
                                    setLicenseAccepted(false);
                                }}
                                style={{
                                    flex: 1,
                                    padding: "11px 0",
                                    borderRadius: 10,
                                    border: "1px solid #e0e0e0",
                                    background: "#fff",
                                    fontSize: 13.5,
                                    fontWeight: 600,
                                    color: "#525252",
                                    cursor: "pointer",
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmUpload}
                                disabled={!licenseType || !licenseAccepted}
                                style={{
                                    flex: 1,
                                    padding: "11px 0",
                                    borderRadius: 10,
                                    border: "none",
                                    background: (!licenseType || !licenseAccepted) ? "#d4a0a8" : "#7a2333",
                                    color: "#fff",
                                    fontSize: 13.5,
                                    fontWeight: 700,
                                    cursor: (!licenseType || !licenseAccepted) ? "not-allowed" : "pointer",
                                }}
                            >
                                Confirmar y subir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
