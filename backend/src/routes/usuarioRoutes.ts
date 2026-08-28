import { Router } from "express";
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  toggleActivo,
  resetearContrasena,
} from "../controllers/usuarioController";
import { verifyToken, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/", verifyToken, requireRole("Administrador"), listarUsuarios);
router.post("/", verifyToken, requireRole("Administrador"), crearUsuario);
router.put("/:id", verifyToken, requireRole("Administrador"), actualizarUsuario);
router.put("/:id/activo", verifyToken, requireRole("Administrador"), toggleActivo);
router.put("/:id/contrasena", verifyToken, requireRole("Administrador"), resetearContrasena);

export default router;
