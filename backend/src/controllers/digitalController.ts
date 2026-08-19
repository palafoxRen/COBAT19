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

export const uploadDigital = async (req: Request, res: Response): Promise<Response> => {
    const { titulo_digital, id_libro, sinopsis } = req.body;

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
        const result = await pool.query(
            `INSERT INTO libros_digitales (id_libro, titulo_digital, url_pdf, sinopsis, esta_habilitado)
             VALUES ($1, $2, $3, $4, true)
             RETURNING digital_id, id_libro, titulo_digital, url_pdf, sinopsis, imagen_url, esta_habilitado, fecha_subida`,
            [libroId, String(titulo_digital).trim(), urlPdf, sinopsis || null]
        );

        return res.status(201).json({ success: true, message: "Libro digital subido exitosamente", data: result.rows[0] });
    } catch (error) {
        console.error("Error al subir libro digital:", error);
        return res.status(500).json({ success: false, message: "Error al subir el libro digital" });
    }
};

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
                    d.esta_habilitado, d.fecha_subida, d.id_libro, l.titulo AS libro_titulo
             FROM libros_digitales d
             LEFT JOIN libros l ON d.id_libro = l.id_libro
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
                    d.esta_habilitado, d.fecha_subida, d.id_libro,
                    l.titulo AS libro_titulo, l.autor AS libro_autor,
                    l.imagen_url AS libro_imagen_url, l.sinopsis AS libro_sinopsis
             FROM libros_digitales d
             LEFT JOIN libros l ON d.id_libro = l.id_libro
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

export const descargarDigital = async (req: Request, res: Response): Promise<void> => {
    const { digital_id } = req.params;

    try {
        const result = await pool.query(
            "SELECT url_pdf FROM libros_digitales WHERE digital_id = $1",
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

        res.download(rutaFisica, nombreArchivo);
    } catch (error) {
        console.error("Error al descargar libro digital:", error);
        res.status(500).json({ success: false, message: "Error al descargar el libro digital" });
    }
};
