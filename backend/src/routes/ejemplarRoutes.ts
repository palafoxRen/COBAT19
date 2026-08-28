import { Router } from 'express';
import { addEjemplar, getEjemplar, updateDisponibilidad, deleteEjemplar } from '../controllers/ejemplarController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// GET de un ejemplar es público (catálogo), resto requiere token.
router.post('/', verifyToken, addEjemplar);
router.get('/:inventario', getEjemplar);
router.put('/:inventario/disponibilidad', verifyToken, updateDisponibilidad);
router.delete('/:inventario', verifyToken, deleteEjemplar);

export default router;