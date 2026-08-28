import { Router } from 'express';
import { uploadDigital, subirImagenDigital, getDigitales, getDigitalPorId, descargarDigital, actualizarDigital, toggleHabilitado, eliminarDigital } from '../controllers/digitalController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// Listado requiere token (solo admin ve todos, incluyendo deshabilitados).
// Detalle y descarga son públicos (el catálogo público los necesita).
router.get('/', verifyToken, getDigitales);
router.get('/:id', getDigitalPorId);
router.get('/:digital_id/descargar', verifyToken, descargarDigital);

// Los archivos (PDF e imagen) los sube el frontend directo a Supabase Storage;
// estos endpoints solo persisten las URLs públicas (body JSON).
router.post('/', verifyToken, uploadDigital);
router.post('/:id/imagen', verifyToken, subirImagenDigital);
router.put('/:id', verifyToken, actualizarDigital);
router.patch('/:id/toggle', verifyToken, toggleHabilitado);
router.delete('/:id', verifyToken, eliminarDigital);

export default router;
