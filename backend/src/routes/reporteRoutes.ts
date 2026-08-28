import { Router } from 'express';
import { reporteMensual } from '../controllers/reporteController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// Reporte mensual: requiere autenticación.
router.get('/mensual', verifyToken, reporteMensual);

export default router;
