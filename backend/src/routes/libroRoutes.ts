import { Router } from 'express';
import { obtenerLibros, registrarLibro } from '../controllers/libroController';

const router = Router();

router.get('/', obtenerLibros);
router.post('/', registrarLibro);

export default router;