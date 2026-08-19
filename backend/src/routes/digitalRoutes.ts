import { Router } from 'express';
import { uploadDigital, subirImagenDigital, getDigitales, getDigitalPorId, descargarDigital } from '../controllers/digitalController';
import { verifyToken } from '../middlewares/auth';
import { uploadPDF, uploadImage } from '../middlewares/upload';

const router = Router();

router.get('/', verifyToken, getDigitales);
router.get('/:id', getDigitalPorId);
router.get('/:digital_id/descargar', descargarDigital);
router.post('/', verifyToken, uploadPDF.single('pdf'), uploadDigital);
router.post('/:id/imagen', verifyToken, uploadImage.single('imagen'), subirImagenDigital);

export default router;
