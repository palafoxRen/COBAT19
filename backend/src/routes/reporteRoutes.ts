import { Router } from 'express';
import { reporteMensual } from '../controllers/reporteController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// Reporte mensual: requiere autenticación (solo admin ve reportes).
router.get('/mensual', verifyToken, reporteMensual);

export default router;
