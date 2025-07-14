import { Router } from 'express';
import { migrarUsuarios, verificarEstadoMigracion } from '../controllers/migration.controller.js';

const router = Router();

/**
 * ENDPOINTS TEMPORALES DE MIGRACIÓN
 * ⚠️ IMPORTANTE: Estos endpoints deben eliminarse después de la migración
 */

// Verificar estado de migración (solo lectura)
router.get('/verificar-estado', verificarEstadoMigracion);

// Ejecutar migración (¡CUIDADO! Modifica datos)
router.post('/migrar-usuarios', migrarUsuarios);

export default router;
