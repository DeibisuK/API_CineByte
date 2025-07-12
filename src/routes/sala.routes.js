import express from 'express';
import {
  getAsientosPorSala,
  create,
  getAll,
  getById,
  update,
  remove
} from '../controllers/sala.controller.js';

const router = express.Router();

router.post('/', create);
router.get('/', getAll);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', remove);
router.get('/asientos/:id', getAsientosPorSala);

export default router;
