import { Router } from 'express';
import {
  obtenerCategorias,
  obtenerCategoriaPorId,
  registrarCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from '../controllers/categoriaController';
import { verifyToken, requireRole } from '../middlewares/auth';

const router = Router();

// GET es público (lo usa el catálogo y el selector de categorías). Escritura requiere token.
router.get('/', obtenerCategorias);
router.get('/:id', obtenerCategoriaPorId);
router.post('/', verifyToken, requireRole('Administrador'), registrarCategoria);
router.put('/:id', verifyToken, requireRole('Administrador'), actualizarCategoria);
router.delete('/:id', verifyToken, requireRole('Administrador'), eliminarCategoria);

export default router;
