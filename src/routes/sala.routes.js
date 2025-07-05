import express from 'express';
import {
  getAsientosPorSala,
  getByEstado,
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
router.get('/estado/:estado', getByEstado);


export default router;
