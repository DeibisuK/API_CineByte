import express from 'express';
import {
  crearSala,
  listarSalas,
  obtenerSalaPorId,
  editarSala,
  eliminarSala,
  getAsientosPorSala,
  getByEstado
} from '../controllers/sala.controller.js';

const router = express.Router();

router.post('/', crearSala);
router.get('/', listarSalas);
router.get('/:id', obtenerSalaPorId);
router.put('/:id', editarSala);
router.delete('/:id', eliminarSala);
router.get('/asientos/:id', getAsientosPorSala);
router.get('/estado/:estado', getByEstado);


export default router;
