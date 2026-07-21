import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middlewares/auth';

// Registrar un préstamo (requiere token para obtener id_atendio)
export const createPrestamo = async (req: AuthRequest, res: Response): Promise<Response> => {
  const {
    libro_inventario,
    tipo_usuario,
    usuario_nombre,
    usuario_detalles,
    fecha_limite,
  } = req.body;

  // El usuario que atiende viene del token
  const id_atendio = req.usuario?.id_usuario;
  if (!id_atendio) {
    return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  }

  if (!libro_inventario || !tipo_usuario || !usuario_nombre) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verificar que el ejemplar existe y está disponible
    const ejemplarCheck = await client.query(
      'SELECT disponibilidad FROM ejemplares WHERE libro_inventario = $1 FOR UPDATE',
      [libro_inventario]
    );
    if (ejemplarCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ejemplar no encontrado' });
    }
    if (ejemplarCheck.rows[0].disponibilidad !== true) {
      return res.status(409).json({ success: false, message: 'El ejemplar no está disponible' });
    }

    let limite = fecha_limite;
    if (!limite) {
      const hoy = new Date();
      hoy.setDate(hoy.getDate() + 7);
      limite = hoy.toISOString().split('T')[0];
    }

    const insertPrestamo = `
      INSERT INTO prestamos (
        libro_inventario, tipo_usuario, usuario_nombre, usuario_detalles,
        fecha_salida, fecha_limite, estatus_prestamo, id_atendio
      ) VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, 'Activo', $6)
      RETURNING *
    `;
    const prestamoResult = await client.query(insertPrestamo, [
      libro_inventario,
      tipo_usuario,
      usuario_nombre,
      usuario_detalles || null,
      limite,
      id_atendio,
    ]);

    // Marcar ejemplar como no disponible
    await client.query(
      'UPDATE ejemplares SET disponibilidad = false WHERE libro_inventario = $1',
      [libro_inventario]
    );

    await client.query('COMMIT');
    return res.status(201).json({ success: true, data: prestamoResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error al registrar préstamo' });
  } finally {
    client.release();
  }
};

// Registrar devolución
export const devolverPrestamo = async (req: Request, res: Response): Promise<Response> => {
  const { prestamo_id } = req.params;
  const { fecha_devolucion } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const prestamoCheck = await client.query(
      'SELECT libro_inventario, estatus_prestamo FROM prestamos WHERE id_prestamo = $1 FOR UPDATE',
      [prestamo_id]
    );
    if (prestamoCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Préstamo no encontrado' });
    }
    if (prestamoCheck.rows[0].estatus_prestamo !== 'Activo') {
      return res.status(409).json({ success: false, message: 'El préstamo ya fue devuelto o está vencido' });
    }

    const devolucion = fecha_devolucion || new Date().toISOString().split('T')[0];

    await client.query(
      'UPDATE prestamos SET fecha_devolucion = $1, estatus_prestamo = $2 WHERE id_prestamo = $3',
      [devolucion, 'Devuelto', prestamo_id]
    );

    // Marcar ejemplar como disponible
    await client.query(
      'UPDATE ejemplares SET disponibilidad = true WHERE libro_inventario = $1',
      [prestamoCheck.rows[0].libro_inventario]
    );

    await client.query('COMMIT');
    return res.json({ success: true, message: 'Devolución registrada exitosamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error al registrar devolución' });
  } finally {
    client.release();
  }
};

// Listar préstamos con filtros (incluyendo nombre del atendió)
export const getPrestamos = async (req: Request, res: Response): Promise<Response> => {
  const { estatus, tipo_usuario, fecha_inicio, fecha_fin } = req.query;
  let whereClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (estatus) { whereClauses.push(`p.estatus_prestamo = $${paramIndex}`); values.push(estatus); paramIndex++; }
  if (tipo_usuario) { whereClauses.push(`p.tipo_usuario = $${paramIndex}`); values.push(tipo_usuario); paramIndex++; }
  if (fecha_inicio) { whereClauses.push(`p.fecha_salida >= $${paramIndex}`); values.push(fecha_inicio); paramIndex++; }
  if (fecha_fin) { whereClauses.push(`p.fecha_salida <= $${paramIndex}`); values.push(fecha_fin); paramIndex++; }

  const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const query = `
    SELECT 
      p.*, 
      e.id_libro, 
      l.titulo, l.autor,
      u.nombre AS atendido_por
    FROM prestamos p
    JOIN ejemplares e ON p.libro_inventario = e.libro_inventario
    JOIN libros l ON e.id_libro = l.id_libro
    JOIN usuarios u ON p.id_atendio = u.id_usuario
    ${whereSQL}
    ORDER BY p.fecha_salida DESC
  `;

  try {
    const result = await pool.query(query, values);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error al obtener préstamos' });
  }
};