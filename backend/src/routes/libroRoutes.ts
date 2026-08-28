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

const router = Router();

// GET son públicos (catálogo público + detalle). Escritura requiere token.
router.get('/', obtenerLibros);
router.get('/:id', obtenerLibroPorId);
router.post('/', verifyToken, registrarLibro);
router.put('/:id', verifyToken, actualizarLibro);
router.delete('/:id', verifyToken, eliminarLibro);

// La imagen la sube el frontend directo a Supabase Storage; este endpoint
// solo persiste la URL pública (body JSON { imagen_url }).
router.post('/:id/imagen', verifyToken, subirImagenLibro);

export default router;