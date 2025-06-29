import express from 'express';
const router = express.Router();
import * as controller from '../controllers/promocion.controller.js';

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.get('/activas', controller.getActive);
router.get('/validar/:codigo', controller.validateCode);

export default router;