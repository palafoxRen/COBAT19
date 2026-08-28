import { Router } from 'express';
import { uploadDigital, subirImagenDigital, getDigitales, getDigitalPorId, descargarDigital, actualizarDigital, toggleHabilitado, eliminarDigital } from '../controllers/digitalController';
import { verifyToken, requireRole } from '../middlewares/auth';
import { uploadPDF, uploadImage } from '../middlewares/upload';

const router = Router();

// Listado requiere token (solo admin ve todos, incluyendo deshabilitados).
// Detalle y descarga son públicos (el catálogo público los necesita).
router.get('/', verifyToken, getDigitales);
router.get('/:id', getDigitalPorId);
router.get('/:digital_id/descargar', verifyToken, descargarDigital);
router.post('/', verifyToken, requireRole('Administrador'), uploadPDF.single('pdf'), uploadDigital);
router.post('/:id/imagen', verifyToken, requireRole('Administrador'), uploadImage.single('imagen'), subirImagenDigital);
router.put('/:id', verifyToken, requireRole('Administrador'), actualizarDigital);
router.patch('/:id/toggle', verifyToken, requireRole('Administrador'), toggleHabilitado);
router.delete('/:id', verifyToken, requireRole('Administrador'), eliminarDigital);

export default router;
