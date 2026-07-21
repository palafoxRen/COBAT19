import { Router } from 'express';
import { login } from '../controllers/authControlller';

const router = Router();
router.post('/login', login);

export default router;