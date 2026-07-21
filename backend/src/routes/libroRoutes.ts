import { Router } from 'express';
import {
  obtenerLibros,
  obtenerLibroPorId,
  registrarLibro,
  actualizarLibro,
  eliminarLibro,
} from '../controllers/libroController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.get('/', obtenerLibros);
router.get('/:id', obtenerLibroPorId);
router.post('/', verifyToken, registrarLibro);
router.put('/:id', verifyToken, actualizarLibro);
router.delete('/:id', verifyToken, eliminarLibro);

export default router;