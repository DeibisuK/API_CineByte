import express from 'express';
import { crearSede, listarSedes, editarSede, eliminarSede, obtenerSedePorId } from '../controllers/sede.controller.js';

const router = express.Router();

router.get('/', listarSedes);
router.get('/:id', obtenerSedePorId);
router.post('/', crearSede);
router.put('/:id', editarSede);
router.delete('/:id', eliminarSede);

export default router;