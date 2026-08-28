import { Router } from 'express';
import {
  obtenerLibros,
  obtenerLibroPorId,
  registrarLibro,
  actualizarLibro,
  eliminarLibro,
  subirImagenLibro,
} from '../controllers/libroController';
import { verifyToken } from '../middlewares/auth';
import { uploadImage } from '../middlewares/upload';

const router = Router();

// GET son públicos (catálogo público + detalle). Escritura requiere token.
router.get('/', obtenerLibros);
router.get('/:id', obtenerLibroPorId);
router.post('/', verifyToken, registrarLibro);
router.put('/:id', verifyToken, actualizarLibro);
router.delete('/:id', verifyToken, eliminarLibro);
router.post('/:id/imagen', verifyToken, uploadImage.single('imagen'), subirImagenLibro);

export default router;