import { Request, Response } from 'express';
import pool from '../config/db';

// REPORTE MENSUAL DE PRÉSTAMOS
export const reporteMensual = async (req: Request, res: Response): Promise<Response> => {
  const hoy = new Date();
  const anio = Number(req.query.anio) || hoy.getFullYear();
  const mes = Number(req.query.mes) || hoy.getMonth() + 1;

  if (mes < 1 || mes > 12) {
    return res.status(400).json({ success: false, message: 'El mes debe estar entre 1 y 12' });
  }

  try {
    const resumenResult = await pool.query(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE estatus_prestamo = 'Activo') AS activos,
         COUNT(*) FILTER (WHERE estatus_prestamo = 'Devuelto') AS devueltos,
         COUNT(*) FILTER (WHERE estatus_prestamo = 'Activo' AND fecha_limite < CURRENT_DATE) AS retrasados
       FROM prestamos
       WHERE EXTRACT(YEAR FROM fecha_salida) = $1 AND EXTRACT(MONTH FROM fecha_salida) = $2`,
      [anio, mes]
    );

    const listaResult = await pool.query(
      `SELECT p.*, l.titulo, l.autor
       FROM prestamos p
       JOIN ejemplares e ON p.libro_inventario = e.libro_inventario
       JOIN libros l ON e.id_libro = l.id_libro
       WHERE EXTRACT(YEAR FROM p.fecha_salida) = $1 AND EXTRACT(MONTH FROM p.fecha_salida) = $2
       ORDER BY p.fecha_salida DESC`,
      [anio, mes]
    );

    const topResult = await pool.query(
      `SELECT l.titulo, COUNT(*) AS prestamos
       FROM prestamos p
       JOIN ejemplares e ON p.libro_inventario = e.libro_inventario
       JOIN libros l ON e.id_libro = l.id_libro
       WHERE EXTRACT(YEAR FROM p.fecha_salida) = $1 AND EXTRACT(MONTH FROM p.fecha_salida) = $2
       GROUP BY l.id_libro
       ORDER BY prestamos DESC
       LIMIT 5`,
      [anio, mes]
    );

    return res.json({
      success: true,
      data: {
        anio,
        mes,
        resumen: resumenResult.rows[0],
        prestamos: listaResult.rows,
        topLibros: topResult.rows,
      },
    });
  } catch (error) {
    console.error('Error al generar reporte mensual:', error);
    return res.status(500).json({ success: false, message: 'Error al generar el reporte mensual' });
  }
};
