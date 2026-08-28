import { Request, Response } from "express";
import pool from "../config/db";

const SUPABASE_PUBLIC_BASE = process.env.SUPABASE_URL
  ? `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET || 'uploads'}`
  : null;

// Devuelve la URL pública de Storage a partir de una url_pdf/imagen_url que
// puede venir con prefijo o como path relativo.
export const toPublicUrl = (url: string): string => {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  if (SUPABASE_PUBLIC_BASE) return `${SUPABASE_PUBLIC_BASE}/${url.replace(/^\/+/, '')}`;
  return url;
};

// Subir libro digital (PDF): el PDF lo sube el frontend directo a Supabase
// Storage (bucket público). Este endpoint solo persiste la URL pública y los
// metadatos del documento.
export const uploadDigital = async (req: Request, res: Response): Promise<Response> => {
    const { titulo_digital, id_libro, sinopsis, autor, categoria_id, url_pdf } = req.body;

    if (!url_pdf || !String(url_pdf).trim()) {
        return res.status(400).json({ success: false, message: "Debes adjuntar la URL del PDF" });
    }
    if (!titulo_digital || !String(titulo_digital).trim()) {
        return res.status(400).json({ success: false, message: "El título del documento es obligatorio" });
    }

    try {
        const libroId = id_libro && String(id_libro).trim() ? Number(id_libro) : null;
        const catId = categoria_id && String(categoria_id).trim() ? Number(categoria_id) : null;
        const result = await pool.query(
            `INSERT INTO libros_digitales (id_libro, titulo_digital, url_pdf, sinopsis, autor, categoria_id, esta_habilitado)
            VALUES ($1, $2, $3, $4, $5, $6, true)
             RETURNING *`,
            [libroId, String(titulo_digital).trim(), url_pdf.trim(), sinopsis || null, autor || null, catId]
        );

        return res.status(201).json({ success: true, message: "Libro digital subido exitosamente", data: result.rows[0] });
    } catch (error) {
        console.error("Error al subir libro digital:", error);
        return res.status(500).json({ success: false, message: "Error al subir el libro digital" });
    }
};

// Actualizar imagen de portada de un digital. La imagen la sube el frontend
// directo a Storage y aquí se persiste la URL pública.
export const subirImagenDigital = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { imagen_url } = req.body;

    if (!imagen_url || !String(imagen_url).trim()) {
        return res.status(400).json({ success: false, message: "No se recibió la URL de la imagen" });
    }

    try {
        const check = await pool.query("SELECT digital_id FROM libros_digitales WHERE digital_id = $1", [id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Libro digital no encontrado" });
        }

        await pool.query("UPDATE libros_digitales SET imagen_url = $1 WHERE digital_id = $2", [imagen_url.trim(), id]);

        return res.json({ success: true, data: { imagen_url: imagen_url.trim() } });
    } catch (error) {
        console.error("Error al actualizar imagen:", error);
        return res.status(500).json({ success: false, message: "Error al actualizar la imagen" });
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

// Descarga/visualización de PDF. El PDF vive en Supabase Storage (bucket
// público), así que este endpoint redirige a la URL pública del objeto para
// que el navegador lo muestre/descargue directamente.
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
        const url = toPublicUrl(result.rows[0].url_pdf);
        res.redirect(url);
    } catch (error) {
        console.error("Error al obtener el PDF:", error);
        res.status(500).json({ success: false, message: "Error al obtener el PDF" });
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

// Eliminar digital: borra el registro de la BD. Los archivos (PDF + imagen)
// viven en Supabase Storage; opcionalmente se pueden borrar desde el frontend
// con el anon key. La URL pública queda huérfana si no se borra, pero no
// bloquea el funcionamiento.
export const eliminarDigital = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    try {
        const check = await pool.query(
            "SELECT digital_id FROM libros_digitales WHERE digital_id = $1",
            [id]
        );
        if (check.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Libro digital no encontrado" });
        }

        await pool.query("DELETE FROM libros_digitales WHERE digital_id = $1", [id]);

        return res.json({ success: true, message: "Libro digital eliminado" });
    } catch (error) {
        console.error("Error al eliminar libro digital:", error);
        return res.status(500).json({ success: false, message: "Error al eliminar el libro digital" });
    }
};
