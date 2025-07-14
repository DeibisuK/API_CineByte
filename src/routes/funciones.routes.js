import express from 'express';
const router = express.Router();
import * as controller from '../controllers/funciones.controller.js';

router.get('/', controller.getAll);
router.get('/asientos', controller.getAsientos); // Nueva ruta para obtener asientos
router.get('/pelicula/:id', controller.getByPeliculaId); // Nueva ruta para obtener funciones por ID de película
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.put('/:id/estado', controller.updateEstadoFuncion); // Nueva ruta para actualizar el estado de una función

export default router;
