import { Request, Response } from 'express';
import pool from '../config/db';
import { writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import path from 'path';

const IMAGES_DIR = path.join(__dirname, '../../uploads/images');
if (!existsSync(IMAGES_DIR)) {
  mkdirSync(IMAGES_DIR, { recursive: true });
}

// OBTENER TODOS (con búsqueda avanzada)
export const obtenerLibros = async (req: Request, res: Response): Promise<Response> => {
  const { titulo, autor, editorial, dewey, isbn, inventario, categoria, q } = req.query;

  let whereClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (q && typeof q === 'string') {
    const searchTerm = `%${q}%`;
    whereClauses.push(
      `(l.titulo ILIKE $${paramIndex} OR l.autor ILIKE $${paramIndex} OR l.editorial ILIKE $${paramIndex} OR l.dewey ILIKE $${paramIndex} OR l.isbn ILIKE $${paramIndex} OR EXISTS (SELECT 1 FROM libros_digitales ld WHERE ld.id_libro = l.id_libro AND ld.titulo_digital ILIKE $${paramIndex}))`
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
    if (categoria) { whereClauses.push(`l.categoria_id = $${paramIndex}`); values.push(categoria); paramIndex++; }
  }

  const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  let digitalWhereSQL = '';
  const digitalValues: any[] = [];
  if (q && typeof q === 'string') {
    digitalWhereSQL = `WHERE d.id_libro IS NULL AND d.titulo_digital ILIKE $1`;
    digitalValues.push(`%${q}%`);
  }

  const query = `
    (
      SELECT 
        l.id_libro, l.titulo, l.autor, l.editorial, l.dewey, l.isbn, l.fecha_registro,
        l.categoria_id, l.imagen_url, l.sinopsis,
        c.nombre AS categoria_nombre,
        COUNT(e.libro_inventario)::INTEGER AS total_ejemplares,
        COALESCE(SUM(CASE WHEN e.disponibilidad = true THEN 1 ELSE 0 END), 0)::INTEGER AS disponibles,
        MIN(dg.digital_id)::INTEGER AS digital_id
      FROM libros l
      LEFT JOIN categorias c ON l.categoria_id = c.categoria_id
      LEFT JOIN ejemplares e ON l.id_libro = e.id_libro
      LEFT JOIN libros_digitales dg ON dg.id_libro = l.id_libro
      ${whereSQL}
      GROUP BY l.id_libro, c.nombre
    )
    UNION ALL
    (
      SELECT 
        NULL::INTEGER AS id_libro,
        d.titulo_digital AS titulo,
        NULL AS autor,
        NULL AS editorial,
        NULL AS dewey,
        NULL AS isbn,
        d.fecha_subida AS fecha_registro,
        NULL::INTEGER AS categoria_id,
        NULL AS imagen_url,
        NULL AS sinopsis,
        'Digital' AS categoria_nombre,
        0 AS total_ejemplares,
        0 AS disponibles,
        d.digital_id::INTEGER
      FROM libros_digitales d
      ${digitalWhereSQL}
    )
    ORDER BY titulo ASC NULLS LAST
  `;

  try {
    const result = await pool.query(query, [...values, ...digitalValues]);
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
    const libroResult = await pool.query(
      `SELECT l.*, c.nombre AS categoria_nombre,
              d.digital_id, d.titulo_digital, d.url_pdf, d.esta_habilitado
       FROM libros l
       LEFT JOIN categorias c ON l.categoria_id = c.categoria_id
       LEFT JOIN libros_digitales d ON d.id_libro = l.id_libro
       WHERE l.id_libro = $1`,
      [id]
    );
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

// REGISTRAR LIBRO (con primer ejemplar)
export const registrarLibro = async (req: Request, res: Response): Promise<void> => {
  const { titulo, autor, editorial, dewey, isbn, libro_inventario, categoria_id, sinopsis } = req.body;

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
      INSERT INTO libros (titulo, autor, editorial, dewey, isbn, categoria_id, sinopsis)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id_libro;
    `;
    const libroResultado = await client.query(insertLibroQuery, [
      titulo, autor, editorial || null, dewey, isbn || null, categoria_id || null, sinopsis || null
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
      console.error('Error al registrar material:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar el material.',
      });
    }
  } finally {
    client.release();
  }
};

// SUBIR IMAGEN DE PORTADA
export const subirImagenLibro = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No se envió ninguna imagen' });
  }

  try {
    const check = await pool.query('SELECT imagen_url FROM libros WHERE id_libro = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Libro no encontrado' });
    }

    const ext = path.extname(req.file.originalname).toLocaleLowerCase();
    const nombreArchivo = `libro_${id}_${Date.now()}${ext}`;
    const rutaFisica = path.join(IMAGES_DIR, nombreArchivo);
    writeFileSync(rutaFisica, req.file.buffer);

    const imagenUrl = `/uploads/images/${nombreArchivo}`;

    const oldImage = check.rows[0].imagen_url;
    if (oldImage && oldImage.startsWith('/uploads/images/')) {
      const oldPath = path.join(__dirname, '../..', oldImage);
      try { unlinkSync(oldPath); } catch { /* archivo antiguo ya no existe */ }
    }

    await pool.query('UPDATE libros SET imagen_url = $1 WHERE id_libro = $2', [imagenUrl, id]);

    return res.json({ success: true, data: { imagen_url: imagenUrl } });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return res.status(500).json({ success: false, message: 'Error al subir la imagen' });
  }
};

// ACTUALIZAR LIBRO (whitelist de campos permitidos)
const ALLOWED_UPDATE_FIELDS = ['titulo', 'autor', 'editorial', 'dewey', 'isbn', 'categoria_id', 'sinopsis', 'imagen_url'];

export const actualizarLibro = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const updates = req.body;

  const allowedUpdates: Record<string, any> = {};
  for (const key of ALLOWED_UPDATE_FIELDS) {
    if (key in updates) {
      allowedUpdates[key] = updates[key];
    }
  }

  if (Object.keys(allowedUpdates).length === 0) {
    return res.status(400).json({ success: false, message: 'No se enviaron campos validos para actualizar' });
  }

  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;
  for (const [key, value] of Object.entries(allowedUpdates)) {
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