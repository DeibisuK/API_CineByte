import express from 'express';
import * as controller from '../controllers/export.controller.js';

const router = express.Router();

// Ruta para exportar datos
router.post('/', controller.exportData);

// Ruta para obtener reportes disponibles
router.get('/', controller.getAvailableReports);

export default router;
