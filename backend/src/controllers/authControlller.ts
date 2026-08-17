import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db";
import { AuthRequest } from "../middlewares/auth";

export const getPerfil = async (req: AuthRequest, res: Response): Promise<Response> => {
  const id_usuario = req.usuario?.id_usuario;
  if (!id_usuario) {
    return res.status(401).json({ success: false, message: "Usuario no autenticado" });
  }

  try {
    const result = await pool.query(
      "SELECT id_usuario, nombre, correo, rol, activo FROM usuarios WHERE id_usuario = $1",
      [id_usuario]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Usuario no encontrado" });
    }
    return res.json({ success: true, usuario: result.rows[0] });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  // Tu frontend envía "usuario_nombre" o "correo" (según lo que hayas puesto)
  // Pero tu tabla usa "nombre" y "correo". Vamos a aceptar ambos.
  const { usuario_nombre, correo, contrasena } = req.body;

  // El identificador puede ser el nombre de usuario O el correo
  const identificador = usuario_nombre || correo;

  if (!identificador || !contrasena) {
    return res.status(400).json({
      success: false,
      message: "Faltan usuario/correo y/o contraseña",
    });
  }

  try {
    //  CAMBIO IMPORTANTE: uso "nombre" (no "usuario_nombre")
    const result = await pool.query(
      `SELECT id_usuario, nombre, correo, password_hash, rol, activo 
        FROM usuarios 
        WHERE nombre = $1 OR correo = $1`,
      [identificador],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }

    const user = result.rows[0];

    if (user.activo === false) {
      return res.status(401).json({
        success: false,
        message: "Cuenta desactivada",
      });
    }

    // 🔥 CAMBIO IMPORTANTE: uso "password_hash" (no "contrasena_hash")
    const match = await bcrypt.compare(contrasena, user.password_hash);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Error de configuración",
      });
    }

    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        rol: user.rol || "Bibliotecario",
      },
      secret,
      { expiresIn: "8h" },
    );

    await pool.query(
      "UPDATE usuarios SET ultimo_acceso = NOW() WHERE id_usuario = $1",
      [user.id_usuario],
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
    console.error("Error en login:", error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor",
    });
  }
};
