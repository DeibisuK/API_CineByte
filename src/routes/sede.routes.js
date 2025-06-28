import express from 'express';
import { crearSede, listarSedes, editarSede, eliminarSede } from '../controllers/sede.controller.js';

const router = express.Router();

router.get('/', listarSedes);
router.post('/', crearSede);
router.put('/:id', editarSede);
router.delete('/:id', eliminarSede);

export default router;