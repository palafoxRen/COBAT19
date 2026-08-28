import { Router } from 'express';
import {
  obtenerLibros,
  obtenerLibroPorId,
  registrarLibro,
  actualizarLibro,
  eliminarLibro,
  subirImagenLibro,
} from '../controllers/libroController';
import { verifyToken, requireRole } from '../middlewares/auth';
import { uploadImage } from '../middlewares/upload';

const router = Router();

// GET son públicos (catálogo público + detalle). Escritura requiere token.
router.get('/', obtenerLibros);
router.get('/:id', obtenerLibroPorId);
router.post('/', verifyToken, requireRole('Administrador'), registrarLibro);
router.put('/:id', verifyToken, requireRole('Administrador'), actualizarLibro);
router.delete('/:id', verifyToken, requireRole('Administrador'), eliminarLibro);
router.post('/:id/imagen', verifyToken, requireRole('Administrador'), uploadImage.single('imagen'), subirImagenLibro);

export default router;