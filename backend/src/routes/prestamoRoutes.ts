import { Router } from 'express';
import { createPrestamo, devolverPrestamo, getPrestamos } from '../controllers/prestamoController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// Todas las operaciones de préstamos requieren autenticación.
router.get('/', verifyToken, getPrestamos);
router.post('/', verifyToken, createPrestamo);
router.put('/:prestamo_id/devolver', verifyToken, devolverPrestamo);

export default router;