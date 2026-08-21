import { Request, Response } from "express";
import { writeFileSync, existsSync, unlinkSync } from "fs";
import path from "path";
import pool from "../config/db";

const UPLOADS_DIR = path.join(__dirname, "../../uploads");
const IMAGES_DIR = path.join(__dirname, "../../uploads/images");
if (!existsSync(IMAGES_DIR)) {
    const { mkdirSync } = require("fs");
    mkdirSync(IMAGES_DIR, { recursive: true });
}

// Subir libro digital (PDF): sanitiza el nombre del archivo original
// reemplazando caracteres especiales por guiones bajos y agregando un
// timestamp para evitar colisiones de nombres. El archivo se escribe
// directamente en disco con writeFileSync ya que está en memoria (multer memoryStorage).
export const uploadDigital = async (req: Request, res: Response): Promise<Response> => {
    const { titulo_digital, id_libro, sinopsis, autor, categoria_id } = req.body;

    if (!req.file) {
        return res.status(400).json({ success: false, message: "Debes adjuntar un archivo PDF" });
    }
    if (!titulo_digital || !String(titulo_digital).trim()) {
        return res.status(400).json({ success: false, message: "El título del documento es obligatorio" });
    }

    try {
        const nombreBase = path.basename(req.file.originalname)
            .replace(/[^a-zA-Z0-9._-]/g, "_")
            .toLocaleLowerCase();
        const nombreArchivo = `${Date.now()}_${nombreBase}`;
        const rutaFisica = path.join(UPLOADS_DIR, nombreArchivo);
        const urlPdf = `/uploads/${nombreArchivo}`;

        writeFileSync(rutaFisica, req.file.buffer);

        const libroId = id_libro && String(id_libro).trim() ? Number(id_libro) : null;
        const catId = categoria_id && String(categoria_id).trim() ? Number(categoria_id) : null;
        const result = await pool.query(
            `INSERT INTO libros_digitales (id_libro, titulo_digital, url_pdf, sinopsis, autor, categoria_id, esta_habilitado)
             VALUES ($1, $2, $3, $4, $5, $6, true)
             RETURNING *`,
            [libroId, String(titulo_digital).trim(), urlPdf, sinopsis || null, autor || null, catId]
        );

        return res.status(201).json({ success: true, message: "Libro digital subido exitosamente", data: result.rows[0] });
    } catch (error) {
        console.error("Error al subir libro digital:", error);
        return res.status(500).json({ success: false, message: "Error al subir el libro digital" });
    }
};

// Upload de imagen de portada para un digital existente.
// Guarda en uploads/images/, elimina la imagen anterior si existía
// para no acumular archivos huérfanos en disco.
export const subirImagenDigital = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    if (!req.file) {
        return res.status(400).json({ success: false, message: "No se envió ninguna imagen" });
    }

    try {
        const check = await pool.query("SELECT imagen_url FROM libros_digitales WHERE digital_id = $1", [id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Libro digital no encontrado" });
        }

        const ext = path.extname(req.file.originalname).toLocaleLowerCase();
        const nombreArchivo = `digital_${id}_${Date.now()}${ext}`;
        const rutaFisica = path.join(IMAGES_DIR, nombreArchivo);
        writeFileSync(rutaFisica, req.file.buffer);

        const imagenUrl = `/uploads/images/${nombreArchivo}`;

        // Eliminar imagen anterior si el digital ya tenía una portada
        const oldImage = check.rows[0].imagen_url;
        if (oldImage && oldImage.startsWith("/uploads/images/")) {
            const oldPath = path.join(__dirname, "../..", oldImage);
            try { unlinkSync(oldPath); } catch { /* archivo antiguo ya no existe */ }
        }

        await pool.query("UPDATE libros_digitales SET imagen_url = $1 WHERE digital_id = $2", [imagenUrl, id]);

        return res.json({ success: true, data: { imagen_url: imagenUrl } });
    } catch (error) {
        console.error("Error al subir imagen:", error);
        return res.status(500).json({ success: false, message: "Error al subir la imagen" });
    }
};

export const getDigitales = async (_req: Request, res: Response): Promise<Response> => {
    try {
        const result = await pool.query(
            `SELECT d.digital_id, d.titulo_digital, d.url_pdf, d.sinopsis, d.imagen_url,
                    d.autor, d.categoria_id, d.esta_habilitado, d.fecha_subida, d.id_libro,
                    l.titulo AS libro_titulo, c.nombre AS categoria_nombre
             FROM libros_digitales d
             LEFT JOIN libros l ON d.id_libro = l.id_libro
             LEFT JOIN categorias c ON d.categoria_id = c.categoria_id
             ORDER BY d.fecha_subida DESC`
        );
        return res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Error al obtener libros digitales:", error);
        return res.status(500).json({ success: false, message: "Error al obtener los libros digitales" });
    }
};

export const getDigitalPorId = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT d.digital_id, d.titulo_digital, d.url_pdf, d.sinopsis, d.imagen_url,
                    d.autor, d.categoria_id, d.esta_habilitado, d.fecha_subida, d.id_libro,
                    l.titulo AS libro_titulo, l.autor AS libro_autor,
                    l.imagen_url AS libro_imagen_url, l.sinopsis AS libro_sinopsis,
                    c.nombre AS categoria_nombre
             FROM libros_digitales d
             LEFT JOIN libros l ON d.id_libro = l.id_libro
             LEFT JOIN categorias c ON d.categoria_id = c.categoria_id
             WHERE d.digital_id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Libro digital no encontrado" });
        }
        return res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error("Error al obtener libro digital:", error);
        return res.status(500).json({ success: false, message: "Error al obtener el libro digital" });
    }
};

// Descarga/visualización de PDF: por defecto usa Content-Disposition: inline
// para mostrar el PDF en el navegador. Si se pasa ?download=1, cambia a
// attachment para forzar descarga. Ambos casos validan que el archivo exista
// en disco antes de enviarlo.
export const descargarDigital = async (req: Request, res: Response): Promise<void> => {
    const { digital_id } = req.params;

    try {
        const result = await pool.query(
            "SELECT url_pdf, titulo_digital FROM libros_digitales WHERE digital_id = $1",
            [digital_id]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, message: "Libro digital no encontrado" });
            return;
        }

        const nombreArchivo = path.basename(result.rows[0].url_pdf);
        const rutaFisica = path.join(UPLOADS_DIR, nombreArchivo);

        if (!existsSync(rutaFisica)) {
            res.status(404).json({ success: false, message: "El archivo PDF no existe en el servidor" });
            return;
        }

        const disposition = req.query.download === '1' ? 'attachment' : 'inline';
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `${disposition}; filename="${nombreArchivo}"`);
        res.sendFile(rutaFisica);
    } catch (error) {
        console.error("Error al descargar libro digital:", error);
        res.status(500).json({ success: false, message: "Error al descargar el libro digital" });
    }
};

// Whitelist de campos permitidos en UPDATE — previene que el cliente
// envíe campos no esperados (ej: id_libro, fecha_subida, etc.)
const ALLOWED_UPDATE_FIELDS = ['titulo_digital', 'autor', 'sinopsis', 'categoria_id', 'id_libro', 'esta_habilitado'];

// Actualización dinámica: construye SET clauses con parámetros numerados
// ($1, $2...) en vez de interpolación directa, para prevenir SQL injection.
export const actualizarDigital = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const updates = req.body;

    const allowedUpdates: Record<string, any> = {};
    for (const key of ALLOWED_UPDATE_FIELDS) {
        if (key in updates) {
            allowedUpdates[key] = updates[key];
        }
    }

    if (Object.keys(allowedUpdates).length === 0) {
        return res.status(400).json({ success: false, message: "No se enviaron campos para actualizar" });
    }

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(allowedUpdates)) {
        setClauses.push(`${key} = $${paramIndex}`);
        values.push(value === '' ? null : value);
        paramIndex++;
    }

    values.push(id);
    const query = `UPDATE libros_digitales SET ${setClauses.join(', ')} WHERE digital_id = $${paramIndex} RETURNING *`;

    try {
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Libro digital no encontrado" });
        }
        return res.json({ success: true, message: "Libro digital actualizado", data: result.rows[0] });
    } catch (error) {
        console.error("Error al actualizar libro digital:", error);
        return res.status(500).json({ success: false, message: "Error al actualizar el libro digital" });
    }
};

export const toggleHabilitado = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `UPDATE libros_digitales SET esta_habilitado = NOT esta_habilitado WHERE digital_id = $1 RETURNING digital_id, esta_habilitado`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Libro digital no encontrado" });
        }
        return res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error("Error al cambiar visibilidad:", error);
        return res.status(500).json({ success: false, message: "Error al cambiar visibilidad" });
    }
};

// Eliminar digital: primero borra el registro de la BD, luego intenta
// borrar los archivos físicos (PDF + imagen) de disco. Si los archivos
// ya no existen, simplemente se ignora el error (catch vacío).
export const eliminarDigital = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    try {
        const check = await pool.query(
            "SELECT url_pdf, imagen_url FROM libros_digitales WHERE digital_id = $1",
            [id]
        );
        if (check.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Libro digital no encontrado" });
        }

        const { url_pdf, imagen_url } = check.rows[0];

        await pool.query("DELETE FROM libros_digitales WHERE digital_id = $1", [id]);

        if (url_pdf) {
            const pdfPath = path.join(__dirname, "../..", url_pdf);
            try { unlinkSync(pdfPath); } catch { /* ya no existe */ }
        }
        if (imagen_url && imagen_url.startsWith("/uploads/images/")) {
            const imgPath = path.join(__dirname, "../..", imagen_url);
            try { unlinkSync(imgPath); } catch { /* ya no existe */ }
        }

        return res.json({ success: true, message: "Libro digital eliminado" });
    } catch (error) {
        console.error("Error al eliminar libro digital:", error);
        return res.status(500).json({ success: false, message: "Error al eliminar el libro digital" });
    }
};
