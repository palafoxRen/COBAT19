import { Request, Response } from 'express';
import pool from '../config/db';

export const obtenerLibros = async (req: Request, res: Response): Promise<void> => {
    try {
        const queryText = `
        SELECT
        l.id_libro, 
        l.titulo, 
        l.autor, 
        l.editorial, 
        l.dewey, 
        l.isbn,
        COUNT(e.libro_inventario) AS total_copias,
        COUNT(CASE WHEN e.disponibilidad = true THEN 1 END) AS copias_disponibles
        FROM libros l
        LEFT JOIN ejemplares e ON l.id_libro = e.id_libro
        GROUP BY l.id_libro
        ORDER BY l.titulo ASC;
        `;

        const resultado = await pool.query(queryText);

        res.json({
            succes: true,
            data: resultado.rows
        });
    } catch (error) {
        console.error('Error al obtener Libros:', error);
        res.status(500).json({
            succes: false,
            message: 'Error interno del servidor al consultar el catálogo',
            error: error instanceof Error ? error.message : error
        });
    }

    export const registrarLibro = async (req: Response): Promise<void> => { const { titulo, autor, editorial, dewey, isbn, libro_inventario } = req.body;

    if (!titulo || !autor || !dewey || !libro_inventario) {
        res.status(400).json({
            succes:false,
            message: 'Los campos titulo, autor, clasificacion dewey y codigo de inventario son obligatorios.'
        });
        return;
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const insertEjemplarQuery = `
        INSERT INTO ejemplares (libro_inventario, id_libro, estado_fisico, disponibilidad) VALUES ($1, $2, 'Buen estado' true);
        `;

        await client.query(insertEjemplarQuery, [libro_inventario, idLibroNuevo]);

        
    }
}
};