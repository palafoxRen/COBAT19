import { Router } from 'express';
import { login, getPerfil } from '../controllers/authController';
import { verifyToken } from '../middlewares/auth';

const router = Router();
router.post('/login', login);
router.get('/me', verifyToken, getPerfil);

export default router;