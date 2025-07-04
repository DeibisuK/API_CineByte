import express from 'express';
import {
  crearSala,
  listarSalas,
  obtenerSalaPorId,
  editarSala,
  eliminarSala
} from '../controllers/sala.controller.js';

const router = express.Router();

router.post('/', crearSala);
router.get('/', listarSalas);
router.get('/:id', obtenerSalaPorId);
router.put('/:id', editarSala);
router.delete('/:id', eliminarSala);

export default router;
