import express from 'express';
const router = express.Router();
import * as controller from '../controllers/peliculas.controller.js';

router.get('/', controller.getAll);
router.get('/mas-vendidas', controller.getPeliculasMasVendidas); 
router.get('/anios', controller.getAnioFromPeliculas); // Nueva ruta para obtener años de películas
router.get('/completas', controller.getAllCompletas); // Nueva ruta para obtener todas las películas completas
router.get('/completas/:id', controller.getByIdComplete); // Nueva ruta para obtener una película completa por ID
router.get('/actores/:id', controller.getAllActores);
router.get('/generos/:id', controller.getAllGeneros);
router.get('/etiquetas/:id', controller.getAllEtiquetas);
router.get('/idiomas/:id', controller.getAllIdiomas);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);


export default router;
