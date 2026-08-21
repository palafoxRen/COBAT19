import { Router } from 'express';
import { uploadDigital, subirImagenDigital, getDigitales, getDigitalPorId, descargarDigital, actualizarDigital, toggleHabilitado, eliminarDigital } from '../controllers/digitalController';
import { verifyToken } from '../middlewares/auth';
import { uploadPDF, uploadImage } from '../middlewares/upload';

const router = Router();

router.get('/', verifyToken, getDigitales);
router.get('/:id', getDigitalPorId);
router.get('/:digital_id/descargar', descargarDigital);
router.post('/', verifyToken, uploadPDF.single('pdf'), uploadDigital);
router.post('/:id/imagen', verifyToken, uploadImage.single('imagen'), subirImagenDigital);
router.put('/:id', verifyToken, actualizarDigital);
router.patch('/:id/toggle', verifyToken, toggleHabilitado);
router.delete('/:id', verifyToken, eliminarDigital);

export default router;
