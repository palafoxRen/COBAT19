import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Upload, BookOpen, FileText } from "lucide-react";
import { uploadDigital } from "../../../api/digitales";
import api from "../../../api/axios";

export default function SubirPDF() {
    const navigate = useNavigate();
    const [titulo, setTitulo] = useState("");
    const [idLibro, setIdLibro] = useState("");
    const [archivo, setArchivo] = useState(null);
    const [libros, setLibros] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/libros")
            .then((res) => setLibros(res.data.data || []))
            .catch(() => setLibros([]));
    }, []);

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

        setEnviando(true);
        try {
            const formData = new FormData();
            formData.append("titulo_digital", titulo.trim());
            if (idLibro) formData.append("id_libro", idLibro);
            formData.append("pdf", archivo);

            await uploadDigital(formData);
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
        </>
    );
}
