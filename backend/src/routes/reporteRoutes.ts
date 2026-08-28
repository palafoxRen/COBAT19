import { Router } from 'express';
import { reporteMensual } from '../controllers/reporteController';
import { verifyToken, requireRole } from '../middlewares/auth';

const router = Router();

// Reporte mensual: requiere autenticación y rol de Administrador.
router.get('/mensual', verifyToken, requireRole('Administrador'), reporteMensual);

export default router;
