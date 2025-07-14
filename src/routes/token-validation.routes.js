import { Router } from 'express';
import { validarToken, verificarEstadoSesion } from '../controllers/token-validation.controller.js';

const router = Router();

/**
 * POST /api/auth/validate-token
 * Validar si el token actual es válido
 */
router.post('/validate-token', validarToken);

/**
 * GET /api/auth/session-status  
 * Verificar el estado de la sesión (incluye verificación de revocación)
 */
router.get('/session-status', verificarEstadoSesion);

export default router;
