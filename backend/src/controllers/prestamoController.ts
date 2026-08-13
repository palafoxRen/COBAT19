import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middlewares/auth';

// === REGISTRAR PRÉSTAMO ===
export const createPrestamo = async (req: AuthRequest, res: Response): Promise<Response> => {
    const {
        inventario,
        tipo_usuario,
        usuario_identificador,
        usuario_nombre,
        fecha_limite,
    } = req.body;

    const id_atendio = req.usuario?.id_usuario;
    if (!id_atendio) {
        return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    if (!inventario || !tipo_usuario || !usuario_identificador) {
        return res.status(400).json({
            success: false,
            message: 'Faltan campos obligatorios: inventario, tipo_usuario, usuario_identificador'
        });
    }

    if (!['Alumno', 'Docente'].includes(tipo_usuario)) {
        return res.status(400).json({
            success: false,
            message: 'tipo_usuario debe ser "Alumno" o "Docente"'
        });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const ejemplarCheck = await client.query(
            'SELECT disponibilidad FROM ejemplares WHERE inventario = $1 FOR UPDATE',
            [inventario]
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
                inventario,
                tipo_usuario,
                usuario_identificador,
                usuario_nombre,
                fecha_salida,
                fecha_limite,
                estado_prestamo,
                atendido_por
            ) VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, 'Activo', $6)
            RETURNING *
        `;
        const prestamoResult = await client.query(insertPrestamo, [
            inventario,
            tipo_usuario,
            usuario_identificador,
            usuario_nombre || null,
            limite,
            id_atendio,
        ]);

        await client.query(
            'UPDATE ejemplares SET disponibilidad = false WHERE inventario = $1',
            [inventario]
        );

        await client.query('COMMIT');
        return res.status(201).json({ success: true, data: prestamoResult.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al registrar préstamo:', error);
        return res.status(500).json({ success: false, message: 'Error al registrar préstamo' });
    } finally {
        client.release();
    }
};

// === DEVOLVER PRÉSTAMO ===
export const devolverPrestamo = async (req: AuthRequest, res: Response): Promise<Response> => {
    const { prestamo_id } = req.params;
    const { fecha_devolucion } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const prestamoCheck = await client.query(
            'SELECT inventario, estado_prestamo FROM prestamos WHERE prestamo_id = $1 FOR UPDATE',
            [prestamo_id]
        );
        if (prestamoCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Préstamo no encontrado' });
        }
        if (prestamoCheck.rows[0].estado_prestamo !== 'Activo') {
            return res.status(409).json({ success: false, message: 'El préstamo ya fue devuelto o está vencido' });
        }

        const devolucion = fecha_devolucion || new Date().toISOString().split('T')[0];

        await client.query(
            'UPDATE prestamos SET fecha_devolucion = $1, estado_prestamo = $2 WHERE prestamo_id = $3',
            [devolucion, 'Devuelto', prestamo_id]
        );

        await client.query(
            'UPDATE ejemplares SET disponibilidad = true WHERE inventario = $1',
            [prestamoCheck.rows[0].inventario]
        );

        await client.query('COMMIT');
        return res.json({ success: true, message: 'Devolución registrada exitosamente' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al registrar devolución:', error);
        return res.status(500).json({ success: false, message: 'Error al registrar devolución' });
    } finally {
        client.release();
    }
};

// === LISTAR PRÉSTAMOS (CON FILTROS) ===
export const getPrestamos = async (req: AuthRequest, res: Response): Promise<Response> => {
    const { estado, tipo_usuario, fecha_inicio, fecha_fin } = req.query;
    let whereClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (estado) { whereClauses.push(`p.estado_prestamo = $${paramIndex}`); values.push(estado); paramIndex++; }
    if (tipo_usuario) { whereClauses.push(`p.tipo_usuario = $${paramIndex}`); values.push(tipo_usuario); paramIndex++; }
    if (fecha_inicio) { whereClauses.push(`p.fecha_salida >= $${paramIndex}`); values.push(fecha_inicio); paramIndex++; }
    if (fecha_fin) { whereClauses.push(`p.fecha_salida <= $${paramIndex}`); values.push(fecha_fin); paramIndex++; }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const query = `
        SELECT 
            p.*,
            e.libro_id,
            l.titulo,
            l.autor,
            u.nombre_completo as atendido_por
        FROM prestamos p
        JOIN ejemplares e ON p.inventario = e.inventario
        JOIN libros l ON e.libro_id = l.libro_id
        JOIN usuarios u ON p.atendido_por = u.usuario_id
        ${whereSQL}
        ORDER BY p.fecha_salida DESC
    `;

    try {
        const result = await pool.query(query, values);
        return res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al obtener préstamos:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener préstamos' });
    }
};