import { Router } from 'express';
import {
  obtenerCategorias,
  obtenerCategoriaPorId,
  registrarCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from '../controllers/categoriaController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// GET es público (lo usa el catálogo y el selector de categorías). Escritura requiere token.
router.get('/', obtenerCategorias);
router.get('/:id', obtenerCategoriaPorId);
router.post('/', verifyToken, registrarCategoria);
router.put('/:id', verifyToken, actualizarCategoria);
router.delete('/:id', verifyToken, eliminarCategoria);

export default router;
