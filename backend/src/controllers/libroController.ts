import { Request, Response } from 'express';
import pool from '../config/db';

// OBTENER TODOS (con búsqueda avanzada)
export const obtenerLibros = async (req: Request, res: Response): Promise<Response> => {
  const { titulo, autor, editorial, dewey, isbn, inventario, q } = req.query;

  let whereClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (q && typeof q === 'string') {
    const searchTerm = `%${q}%`;
    whereClauses.push(
      `(l.titulo ILIKE $${paramIndex} OR l.autor ILIKE $${paramIndex} OR l.editorial ILIKE $${paramIndex} OR l.dewey ILIKE $${paramIndex} OR l.isbn ILIKE $${paramIndex})`
    );
    values.push(searchTerm);
    paramIndex++;
  } else {
    if (titulo) { whereClauses.push(`l.titulo ILIKE $${paramIndex}`); values.push(`%${titulo}%`); paramIndex++; }
    if (autor) { whereClauses.push(`l.autor ILIKE $${paramIndex}`); values.push(`%${autor}%`); paramIndex++; }
    if (editorial) { whereClauses.push(`l.editorial ILIKE $${paramIndex}`); values.push(`%${editorial}%`); paramIndex++; }
    if (dewey) { whereClauses.push(`l.dewey ILIKE $${paramIndex}`); values.push(`%${dewey}%`); paramIndex++; }
    if (isbn) { whereClauses.push(`l.isbn ILIKE $${paramIndex}`); values.push(`%${isbn}%`); paramIndex++; }
    if (inventario) {
      whereClauses.push(`EXISTS (SELECT 1 FROM ejemplares e WHERE e.id_libro = l.id_libro AND e.libro_inventario = $${paramIndex})`);
      values.push(inventario);
      paramIndex++;
    }
  }

  const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const query = `
    SELECT 
      l.id_libro, l.titulo, l.autor, l.editorial, l.dewey, l.isbn, l.fecha_registro,
      COUNT(e.libro_inventario) AS total_ejemplares,
      SUM(CASE WHEN e.disponibilidad = true THEN 1 ELSE 0 END) AS disponibles
    FROM libros l
    LEFT JOIN ejemplares e ON l.id_libro = e.id_libro
    ${whereSQL}
    GROUP BY l.id_libro
    ORDER BY l.titulo ASC
  `;

  try {
    const result = await pool.query(query, values);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error al obtener libros' });
  }
};

// OBTENER LIBRO POR ID (con ejemplares)
export const obtenerLibroPorId = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  try {
    const libroResult = await pool.query('SELECT * FROM libros WHERE id_libro = $1', [id]);
    if (libroResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Libro no encontrado' });
    }
    const ejemplaresResult = await pool.query(
      'SELECT libro_inventario, estado_fisico, disponibilidad FROM ejemplares WHERE id_libro = $1',
      [id]
    );
    const libro = libroResult.rows[0];
    libro.ejemplares = ejemplaresResult.rows;
    return res.json({ success: true, data: libro });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error al obtener el libro' });
  }
};

// REGISTRAR LIBRO (con primer ejemplar) - Ya lo tienes, pero ajustado
export const registrarLibro = async (req: Request, res: Response): Promise<void> => {
  const { titulo, autor, editorial, dewey, isbn, libro_inventario } = req.body;

  if (!titulo || !autor || !dewey || !libro_inventario) {
    res.status(400).json({
      success: false,
      message: 'Los campos titulo, autor, clasificacion dewey y codigo de inventario son obligatorios.'
    });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insertLibroQuery = `
      INSERT INTO libros (titulo, autor, editorial, dewey, isbn)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_libro;
    `;
    const libroResultado = await client.query(insertLibroQuery, [
      titulo, autor, editorial || null, dewey, isbn || null
    ]);
    const idLibroNuevo = libroResultado.rows[0].id_libro;

    const insertEjemplarQuery = `
      INSERT INTO ejemplares (libro_inventario, id_libro, estado_fisico, disponibilidad)
      VALUES ($1, $2, 'Buen estado', true);
    `;
    await client.query(insertEjemplarQuery, [libro_inventario, idLibroNuevo]);

    await client.query('COMMIT');
    res.status(201).json({
      success: true,
      message: 'El libro y el ejemplar físico fueron registrados.',
      data: { id_libro: idLibroNuevo, titulo, autor, libro_inventario }
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error en el registro: ', error);
    if (error.code === '23505') {
      if (error.constraint === 'libros_isbn_key') {
        res.status(409).json({ success: false, message: 'El ISBN ya existe' });
      } else {
        res.status(409).json({ success: false, message: 'El código de inventario ya existe' });
      }
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al registrar el material.',
        error: error instanceof Error ? error.message : error
      });
    }
  } finally {
    client.release();
  }
};

// ACTUALIZAR LIBRO
export const actualizarLibro = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const updates = req.body;
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No se enviaron campos para actualizar' });
  }

  // No permitir actualizar id_libro ni fecha_registro
  delete updates.id_libro;
  delete updates.fecha_registro;

  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;
  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }
  values.push(id);
  const query = `
    UPDATE libros
    SET ${fields.join(', ')}
    WHERE id_libro = $${paramIndex}
    RETURNING *
  `;

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Libro no encontrado' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error al actualizar libro' });
  }
};

// ELIMINAR LIBRO (solo si no tiene ejemplares disponibles)
export const eliminarLibro = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const check = await client.query(
      'SELECT COUNT(*) FROM ejemplares WHERE id_libro = $1 AND disponibilidad = true',
      [id]
    );
    if (parseInt(check.rows[0].count) > 0) {
      return res.status(409).json({
        success: false,
        message: 'No se puede eliminar el libro porque tiene ejemplares disponibles'
      });
    }
    // Como la FK tiene ON DELETE CASCADE, se eliminarán los ejemplares automáticamente
    const deleteResult = await client.query('DELETE FROM libros WHERE id_libro = $1 RETURNING id_libro', [id]);
    if (deleteResult.rows.length === 0) {
      throw new Error('Libro no encontrado');
    }
    await client.query('COMMIT');
    return res.json({ success: true, message: 'Libro eliminado' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error(error);
    if (error.message === 'Libro no encontrado') {
      return res.status(404).json({ success: false, message: 'Libro no encontrado' });
    }
    return res.status(500).json({ success: false, message: 'Error al eliminar libro' });
  } finally {
    client.release();
  }
};