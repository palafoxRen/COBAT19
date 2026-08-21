import { Router } from 'express';
import { addEjemplar, getEjemplar, updateDisponibilidad, deleteEjemplar } from '../controllers/ejemplarController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.post('/', verifyToken, addEjemplar);
router.get('/:inventario', getEjemplar);
router.put('/:inventario/disponibilidad', verifyToken, updateDisponibilidad);
router.delete('/:inventario', verifyToken, deleteEjemplar);

export default router;