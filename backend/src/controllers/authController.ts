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
      "SELECT id_usuario, nombre, correo, rol, activo, ultimo_acceso FROM usuarios WHERE id_usuario = $1",
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

export const actualizarPerfil = async (req: AuthRequest, res: Response): Promise<Response> => {
  const id_usuario = req.usuario?.id_usuario;
  if (!id_usuario) {
    return res.status(401).json({ success: false, message: "Usuario no autenticado" });
  }

  const { nombre, correo } = req.body;
  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ success: false, message: "El nombre es obligatorio" });
  }
  if (!correo || !correo.trim()) {
    return res.status(400).json({ success: false, message: "El correo es obligatorio" });
  }

  try {
    const result = await pool.query(
      "UPDATE usuarios SET nombre = $1, correo = $2 WHERE id_usuario = $3 RETURNING id_usuario, nombre, correo, rol, activo, ultimo_acceso",
      [nombre.trim(), correo.trim(), id_usuario]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
    return res.json({ success: true, usuario: result.rows[0] });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "El correo ya está en uso por otra cuenta" });
    }
    console.error("Error al actualizar perfil:", error);
    return res.status(500).json({ success: false, message: "Error al actualizar el perfil" });
  }
};

export const cambiarContrasena = async (req: AuthRequest, res: Response): Promise<Response> => {
  const id_usuario = req.usuario?.id_usuario;
  if (!id_usuario) {
    return res.status(401).json({ success: false, message: "Usuario no autenticado" });
  }

  const { contrasena_actual, contrasena_nueva } = req.body;
  if (!contrasena_actual || !contrasena_nueva) {
    return res.status(400).json({ success: false, message: "Debes ingresar la contraseña actual y la nueva" });
  }
  if (contrasena_nueva.length < 8) {
    return res.status(400).json({ success: false, message: "La nueva contraseña debe tener al menos 8 caracteres" });
  }

  try {
    const check = await pool.query("SELECT password_hash FROM usuarios WHERE id_usuario = $1", [id_usuario]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const match = await bcrypt.compare(contrasena_actual, check.rows[0].password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: "La contraseña actual es incorrecta" });
    }

    const hash = await bcrypt.hash(contrasena_nueva, 10);
    await pool.query("UPDATE usuarios SET password_hash = $1 WHERE id_usuario = $2", [hash, id_usuario]);

    return res.json({ success: true, message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return res.status(500).json({ success: false, message: "Error al cambiar la contraseña" });
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  const { usuario_nombre, correo, contrasena } = req.body;

  const identificador = usuario_nombre || correo;

  if (!identificador || !contrasena) {
    return res.status(400).json({
      success: false,
      message: "Faltan usuario/correo y/o contraseña",
    });
  }

  try {
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
