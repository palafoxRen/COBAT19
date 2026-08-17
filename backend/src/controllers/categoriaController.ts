import { Request, Response } from 'express';
import pool from '../config/db';

// OBTENER TODAS LAS CATEGORÍAS (con conteo de libros)
export const obtenerCategorias = async (_req: Request, res: Response): Promise<Response> => {
  const query = `
    SELECT
      c.categoria_id, c.nombre, c.descripcion,
      COUNT(l.id_libro) AS total_libros
    FROM categorias c
    LEFT JOIN libros l ON c.categoria_id = l.categoria_id
    GROUP BY c.categoria_id
    ORDER BY c.nombre ASC
  `;

  try {
    const result = await pool.query(query);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error al obtener categorías' });
  }
};

// OBTENER CATEGORÍA POR ID
export const obtenerCategoriaPorId = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM categorias WHERE categoria_id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error al obtener la categoría' });
  }
};

// REGISTRAR CATEGORÍA
export const registrarCategoria = async (req: Request, res: Response): Promise<Response> => {
  const { nombre, descripcion } = req.body;

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({
      success: false,
      message: 'El campo nombre es obligatorio.'
    });
  }

  try {
    const result = await pool.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre.trim(), descripcion || null]
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error(error);
    if (error.code === '23505' && error.constraint === 'categorias_nombre_key') {
      return res.status(409).json({ success: false, message: 'Ya existe una categoría con ese nombre' });
    }
    return res.status(500).json({ success: false, message: 'Error al registrar la categoría' });
  }
};

// ACTUALIZAR CATEGORÍA
export const actualizarCategoria = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({
      success: false,
      message: 'El campo nombre es obligatorio.'
    });
  }

  try {
    const result = await pool.query(
      'UPDATE categorias SET nombre = $1, descripcion = $2 WHERE categoria_id = $3 RETURNING *',
      [nombre.trim(), descripcion || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error(error);
    if (error.code === '23505' && error.constraint === 'categorias_nombre_key') {
      return res.status(409).json({ success: false, message: 'Ya existe una categoría con ese nombre' });
    }
    return res.status(500).json({ success: false, message: 'Error al actualizar la categoría' });
  }
};

// ELIMINAR CATEGORÍA (los libros quedan sin categoría por ON DELETE SET NULL)
export const eliminarCategoria = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM categorias WHERE categoria_id = $1 RETURNING categoria_id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }
    return res.json({ success: true, message: 'Categoría eliminada' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error al eliminar la categoría' });
  }
};
