import express from 'express';
const router = express.Router();
import * as controller from '../controllers/peliculas.controller.js';

router.get('/', controller.getAll);
router.get('/completas', controller.getAllCompletas); // Nueva ruta para obtener todas las películas completas
router.get('/:id', controller.getById);
router.get('/actores/:id', controller.getAllActores);
router.get('/generos/:id', controller.getAllGeneros);
router.get('/etiquetas/:id', controller.getAllEtiquetas);
router.get('/idiomas/:id', controller.getAllIdiomas);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);


export default router;
