import express from 'express';
const router = express.Router();
import * as controller from '../controllers/sede_salas.controller.js';

// Rutas principales
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

// Rutas para operaciones múltiples
router.post('/multiple', controller.createMultiple);
router.delete('/multiple', controller.removeMultiple);

// Rutas para consultas específicas
router.get('/sede/:id_sede', controller.getBySede);
router.get('/sala/:id_sala', controller.getBySala);

// Rutas para obtener disponibles
router.get('/disponibles/salas', controller.getSalasDisponibles);
router.get('/disponibles/sedes/:id_sala', controller.getSedesDisponibles);

// Ruta para verificar si una sala está asignada
router.get('/check-sala/:id_sala', controller.checkSalaAssigned);

export default router;
