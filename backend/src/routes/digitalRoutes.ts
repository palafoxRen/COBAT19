import { Router } from 'express';
import { uploadDigital, getDigitales, descargarDigital } from '../controllers/digitalController';
import { verifyToken } from '../middlewares/auth';
import { uploadPDF } from '../middlewares/upload';

const router = Router();

router.get('/', getDigitales);
router.get('/:digital_id/decargar', descargarDigital);
router.post('/', verifyToken, uploadPDF.single('pdf'), uploadDigital);

export default router;