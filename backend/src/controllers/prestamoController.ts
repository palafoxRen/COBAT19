import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middlewares/auth';

export const createPrestamo = async (req: AuthRequest, res: Response): Promise<Response> => {
    const {
        inventario,              // código del ejemplar
        tipo_usuario,            // 'Alumno' o 'Docente'
        usuario_identificador,   // matrícula (alumno) o nombre (docente)
        usuario_nombre,          // solo para docentes (opcional)
        fecha_limite,            // opcional
    } = req.body;

    const atendido_por = req.usuario?.id_usuario;
    if (!atendido_por) {
        return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    if (!inventario || !tipo_usuario || !usuario_identificador) {
        return res.status(400).json({ 
            success: false, 
            message: 'Faltan campos obligatorios: inventario, tipo_usuario, usuario_identificador' 
        });
    }

    // Validar que el tipo de usuario sea válido
    if (!['Alumno', 'Docente'].includes(tipo_usuario)) {
        return res.status(400).json({ 
            success: false, 
            message: 'tipo_usuario debe ser "Alumno" o "Docente"' 
        });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Verificar disponibilidad del ejemplar
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

        // Calcular fecha límite (7 días por defecto)
        let limite = fecha_limite;
        if (!limite) {
            const hoy = new Date();
            hoy.setDate(hoy.getDate() + 7);
            limite = hoy.toISOString().split('T')[0];
        }

        // Insertar préstamo (SIN usuario_grupo)
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
            atendido_por,
        ]);

        // Actualizar disponibilidad del ejemplar
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