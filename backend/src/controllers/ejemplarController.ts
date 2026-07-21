import { Request, Response } from 'express';
import pool from '../config/db';

export const addEjemplar = async (req: Request, res: Response): Promise<Response> => {
  const { id_libro, libro_inventario, estado_fisico } = req.body;
  if (!id_libro || !libro_inventario) {
    return res.status(400).json({ success: false, message: 'Faltan id_libro o libro_inventario' });
  }

  try {
    const libroCheck = await pool.query('SELECT id_libro FROM libros WHERE id_libro = $1', [id_libro]);
    if (libroCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Libro no encontrado' });
    }

    const insert = `
      INSERT INTO ejemplares (libro_inventario, id_libro, estado_fisico, disponibilidad)
      VALUES ($1, $2, $3, true)
      RETURNING *
    `;
    const result = await pool.query(insert, [libro_inventario, id_libro, estado_fisico || 'Buen estado']);
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'El código de inventario ya existe' });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error al agregar ejemplar' });
  }
};

export const getEjemplar = async (req: Request, res: Response): Promise<Response> => {
  const { inventario } = req.params;
  try {
    const result = await pool.query(
        `SELECT e.*, l.titulo, l.autor 
        FROM ejemplares e 
        JOIN libros l ON e.id_libro = l.id_libro 
        WHERE e.libro_inventario = $1`,
      [inventario]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ejemplar no encontrado' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error al obtener ejemplar' });
  }
};

export const updateDisponibilidad = async (req: Request, res: Response): Promise<Response> => {
  const { inventario } = req.params;
  const { disponibilidad } = req.body;
  if (disponibilidad === undefined || typeof disponibilidad !== 'boolean') {
    return res.status(400).json({ success: false, message: 'Se requiere un booleano para disponibilidad' });
  }

  try {
    const result = await pool.query(
      'UPDATE ejemplares SET disponibilidad = $1 WHERE libro_inventario = $2 RETURNING *',
      [disponibilidad, inventario]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ejemplar no encontrado' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error al actualizar disponibilidad' });
  }
};  