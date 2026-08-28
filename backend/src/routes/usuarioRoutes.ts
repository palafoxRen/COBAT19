import { Router } from "express";
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  toggleActivo,
  resetearContrasena,
} from "../controllers/usuarioController";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.get("/", verifyToken, listarUsuarios);
router.post("/", verifyToken, crearUsuario);
router.put("/:id", verifyToken, actualizarUsuario);
router.put("/:id/activo", verifyToken, toggleActivo);
router.put("/:id/contrasena", verifyToken, resetearContrasena);

export default router;
