import express from 'express';
const router = express.Router();
import * as controller from '../controllers/funciones.controller.js';

router.get('/', controller.getAll);
router.get('/pelicula/:id', controller.getByPeliculaId); // Nueva ruta para obtener funciones por ID de película
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;
