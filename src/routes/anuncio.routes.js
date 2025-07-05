import express from 'express';
const router = express.Router();
import * as controller from '../controllers/anuncio.controller.js';

router.get('/', controller.getAll);
router.get('/activos', controller.getActivos);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id/estado', controller.updateEstado);
router.delete('/:id', controller.remove);

export default router;