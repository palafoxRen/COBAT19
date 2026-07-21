import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db';

export const login = async (req: Request, res: Response): Promise<Response> => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ success: false, message: 'Faltan correo y/o contraseña' });
  }

  try {
    const result = await pool.query(
      'SELECT id_usuario, nombre, correo, password_hash, rol FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Nombre de usuario y/o contraseña incorrectos' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Nombre de usuario y/o contraseña incorrectos' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'Error de configuración'});
    };

    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        rol: user.rol || 'Bibliotecario',
      },
      secret,
      {expiresIn: '8h'}
    );

    // Actualizar último acceso
    await pool.query(
      'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id_usuario = $1',
      [user.id_usuario]
    );

    return res.json({
      success: true,
      token,
      usuario: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};