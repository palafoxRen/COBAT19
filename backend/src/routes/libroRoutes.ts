import { Router } from 'express';
import { obtenerLibros } from '../controllers/libroController';

const router = Router();

router.get('/', obtenerLibros);

export default router;