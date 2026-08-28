import { Request, Response } from "express";
import * as bcrypt from "bcrypt";
import pool from "../config/db";
import { AuthRequest } from "../middlewares/auth";

export const listarUsuarios = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const result = await pool.query(
      `SELECT id_usuario, nombre, correo, rol, activo, ultimo_acceso
       FROM usuarios ORDER BY id_usuario ASC`
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    return res.status(500).json({ success: false, message: "Error al obtener usuarios" });
  }
};

export const crearUsuario = async (req: AuthRequest, res: Response): Promise<Response> => {
  const { nombre, correo, contrasena } = req.body;

  if (!nombre?.trim()) {
    return res.status(400).json({ success: false, message: "El nombre es obligatorio" });
  }
  if (!correo?.trim()) {
    return res.status(400).json({ success: false, message: "El correo es obligatorio" });
  }
  if (!contrasena || contrasena.length < 8) {
    return res.status(400).json({ success: false, message: "La contraseña debe tener al menos 8 caracteres" });
  }

  const rolFinal = "Bibliotecario";

  try {
    const hash = await bcrypt.hash(contrasena, 10);
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, correo, password_hash, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id_usuario, nombre, correo, rol, activo, ultimo_acceso`,
      [nombre.trim(), correo.trim(), hash, rolFinal]
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "El correo ya está registrado" });
    }
    console.error("Error al crear usuario:", error);
    return res.status(500).json({ success: false, message: "Error al crear el usuario" });
  }
};

export const actualizarUsuario = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { nombre, correo } = req.body;

  if (!nombre?.trim()) {
    return res.status(400).json({ success: false, message: "El nombre es obligatorio" });
  }
  if (!correo?.trim()) {
    return res.status(400).json({ success: false, message: "El correo es obligatorio" });
  }

  const rolFinal = "Bibliotecario";

  try {
    const result = await pool.query(
      `UPDATE usuarios SET nombre = $1, correo = $2, rol = $3
       WHERE id_usuario = $4
       RETURNING id_usuario, nombre, correo, rol, activo, ultimo_acceso`,
      [nombre.trim(), correo.trim(), rolFinal, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "El correo ya está en uso por otra cuenta" });
    }
    console.error("Error al actualizar usuario:", error);
    return res.status(500).json({ success: false, message: "Error al actualizar el usuario" });
  }
};

export const toggleActivo = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { activo } = req.body;

  if (typeof activo !== "boolean") {
    return res.status(400).json({ success: false, message: "El campo 'activo' debe ser booleano" });
  }

  try {
    const result = await pool.query(
      `UPDATE usuarios SET activo = $1
       WHERE id_usuario = $2
       RETURNING id_usuario, nombre, correo, rol, activo, ultimo_acceso`,
      [activo, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    return res.status(500).json({ success: false, message: "Error al actualizar el estado" });
  }
};

export const resetearContrasena = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { contrasena } = req.body;

  if (!contrasena || contrasena.length < 8) {
    return res.status(400).json({ success: false, message: "La contraseña debe tener al menos 8 caracteres" });
  }

  try {
    const check = await pool.query("SELECT id_usuario FROM usuarios WHERE id_usuario = $1", [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const hash = await bcrypt.hash(contrasena, 10);
    await pool.query("UPDATE usuarios SET password_hash = $1 WHERE id_usuario = $2", [hash, id]);
    return res.json({ success: true, message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al resetear contraseña:", error);
    return res.status(500).json({ success: false, message: "Error al actualizar la contraseña" });
  }
};
