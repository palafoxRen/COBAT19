// Helper para subir archivos directo a Supabase Storage (bucket público)
// desde el frontend. El anon key es de uso público por diseño; se puede
// exponer en el bundle del navegador sin riesgo.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || "uploads";

export const getStoragePublicUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path.replace(/^\/+/, "")}`;
};

// Sube un archivo (File/Blob) a la carpeta indicada y devuelve la URL pública.
export async function uploadFileToStorage(file, folder) {
    if (!SUPABASE_URL || !ANON_KEY) {
        throw new Error("Faltan las variables de configuración de Supabase Storage.");
    }

    const baseName = (file.name || "archivo").replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${folder}/${Date.now()}_${baseName}`;

    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${ANON_KEY}`,
            "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
        cache: "no-store",
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Error al subir el archivo a Storage (${res.status}). ${txt}`);
    }

    return getStoragePublicUrl(path);
}
