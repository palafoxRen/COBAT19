import { Router } from 'express';
import { login, getPerfil, actualizarPerfil, cambiarContrasena } from '../controllers/authController';
import { verifyToken } from '../middlewares/auth';

const router = Router();
router.post('/login', login);
router.get('/me', verifyToken, getPerfil);
router.put('/me', verifyToken, actualizarPerfil);
router.put('/me/password', verifyToken, cambiarContrasena);

export default router;