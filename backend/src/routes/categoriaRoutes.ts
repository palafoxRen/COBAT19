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

router.get('/', obtenerCategorias);
router.get('/:id', obtenerCategoriaPorId);
router.post('/', verifyToken, registrarCategoria);
router.put('/:id', verifyToken, actualizarCategoria);
router.delete('/:id', verifyToken, eliminarCategoria);

export default router;
