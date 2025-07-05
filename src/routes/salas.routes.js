import express from 'express';
const router = express.Router();
import * as controller from '../controllers/salas.controller.js';

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.get('/estado/:estado', controller.getByEstado);

export default router;
