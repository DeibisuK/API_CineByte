import express from 'express';
const router = express.Router();
import * as controller from '../controllers/promocion.controller.js';

router.get('/', controller.getAll);
router.get('/activas', controller.getActive);
router.get('/validar/:codigo', controller.validateCode);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;