import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middlewares/auth';

// === REGISTRAR PRÉSTAMO ===
// Usa una transacción con SELECT FOR UPDATE para evitar doble préstamo
// del mismo ejemplar en caso de concurrencia (dos peticiones simultáneas
// intentando prestar el mismo libro). El flag `committed` controla el
// ROLLBACK en el catch: solo revierte si COMMIT aún no se ejecutó.
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
    let committed = false;
    try {
        await client.query('BEGIN');

        // Bloquea la fila del ejemplar con FOR UPDATE — si otra transacción
    // intenta modificarla, espera a que esta termine. Evita race conditions.
    const ejemplarCheck = await client.query(
            'SELECT disponibilidad FROM ejemplares WHERE libro_inventario = $1 FOR UPDATE',
            [inventario]
        );
        if (ejemplarCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Ejemplar no encontrado' });
        }
        if (ejemplarCheck.rows[0].disponibilidad !== true) {
            await client.query('ROLLBACK');
            return res.status(409).json({ success: false, message: 'El ejemplar no está disponible' });
        }

        // Si no se proporciona fecha_limite, default 3 días desde hoy
        let limite = fecha_limite;
        if (!limite) {
            const hoy = new Date();
            hoy.setDate(hoy.getDate() + 3);
            limite = hoy.toISOString().split('T')[0];
        }

        const insertPrestamo = `
            INSERT INTO prestamos (
                libro_inventario,
                tipo_usuario,
                usuario_nombre,
                usuario_detalles,
                fecha_salida,
                fecha_limite,
                estatus_prestamo,
                id_atendio
            ) VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, 'Activo', $6)
            RETURNING *
        `;
        const prestamoResult = await client.query(insertPrestamo, [
            inventario,
            tipo_usuario,
            usuario_nombre || usuario_identificador,
            usuario_identificador || null,
            limite,
            id_atendio,
        ]);

        await client.query(
            'UPDATE ejemplares SET disponibilidad = false WHERE libro_inventario = $1',
            [inventario]
        );

        await client.query('COMMIT');
        committed = true;
        return res.status(201).json({ success: true, data: prestamoResult.rows[0] });
    } catch (error) {
        // Solo revierte si el COMMIT no se ejecutó — si ya se hizo, el ROLLBACK
        // lanzaría un error y perderíamos la información real del problema
        if (!committed) await client.query('ROLLBACK');
        console.error('Error al registrar préstamo:', error);
        return res.status(500).json({ success: false, message: 'Error al registrar préstamo' });
    } finally {
        client.release();
    }
};

// === DEVOLVER PRÉSTAMO ===
// Misma transacción que createPrestamo: bloquea el préstamo con FOR UPDATE,
// verifica que esté en estado 'Activo', actualiza estatus y libera el ejemplar.
export const devolverPrestamo = async (req: AuthRequest, res: Response): Promise<Response> => {
    const { prestamo_id } = req.params;
    const { fecha_devolucion } = req.body || {};

    const client = await pool.connect();
    let committed = false;
    try {
        await client.query('BEGIN');

        const prestamoCheck = await client.query(
            'SELECT libro_inventario, estatus_prestamo FROM prestamos WHERE id_prestamo = $1 FOR UPDATE',
            [prestamo_id]
        );
        if (prestamoCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Préstamo no encontrado' });
        }
        if (prestamoCheck.rows[0].estatus_prestamo !== 'Activo') {
            await client.query('ROLLBACK');
            return res.status(409).json({ success: false, message: 'El préstamo ya fue devuelto o está vencido' });
        }

        const devolucion = fecha_devolucion || new Date().toISOString().split('T')[0];  

        await client.query(
            'UPDATE prestamos SET fecha_devolucion = $1, estatus_prestamo = $2 WHERE id_prestamo = $3',
            [devolucion, 'Devuelto', prestamo_id]
        );

        await client.query(
            'UPDATE ejemplares SET disponibilidad = true WHERE libro_inventario = $1',
            [prestamoCheck.rows[0].libro_inventario]
        );

        await client.query('COMMIT');
        committed = true;
        return res.json({ success: true, message: 'Devolución registrada exitosamente' });
    } catch (error) {
        if (!committed) await client.query('ROLLBACK');
        console.error('Error al registrar devolución:', error);
        return res.status(500).json({ success: false, message: 'Error al registrar devolución' });
    } finally {
        client.release();
    }
};

// === LISTAR PRÉSTAMOS (CON FILTROS) ===
// Construye WHERE dinámico con parámetros numerados ($1, $2...)
// para prevenir SQL injection. Los filtros son opcionales.
export const getPrestamos = async (req: AuthRequest, res: Response): Promise<Response> => {
    const { estado, tipo_usuario, fecha_inicio, fecha_fin } = req.query;
    let whereClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (estado) { whereClauses.push(`p.estatus_prestamo = $${paramIndex}`); values.push(estado); paramIndex++; }
    if (tipo_usuario) { whereClauses.push(`p.tipo_usuario = $${paramIndex}`); values.push(tipo_usuario); paramIndex++; }
    if (fecha_inicio) { whereClauses.push(`p.fecha_salida >= $${paramIndex}`); values.push(fecha_inicio); paramIndex++; }
    if (fecha_fin) { whereClauses.push(`p.fecha_salida <= $${paramIndex}`); values.push(fecha_fin); paramIndex++; }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const query = `
        SELECT 
            p.*,
            l.titulo,
            l.autor,
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
        console.error('Error al obtener préstamos:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener préstamos' });
    }
};
