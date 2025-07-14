import express from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { verificarTokenAdmin, verificarTokenBasico } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rutas que requieren permisos de administrador
router.post('/users/:uid/make-admin', verificarTokenAdmin, AuthController.makeAdmin);
router.post('/users/:uid/make-employee', verificarTokenAdmin, AuthController.makeEmployee);
router.delete('/users/:uid/roles', verificarTokenAdmin, AuthController.removeRoles);
router.get('/users', verificarTokenAdmin, AuthController.listUsers);
router.post('/users/:uid/revoke-tokens', verificarTokenAdmin, AuthController.revokeTokens);
router.post('/users/:uid/custom-token', verificarTokenAdmin, AuthController.generateCustomToken);
router.patch('/users/:uid/status', verificarTokenAdmin, AuthController.toggleUserStatus);
router.delete('/users/:uid', verificarTokenAdmin, AuthController.deleteUser);

// Rutas que requieren autenticación básica
router.get('/users/:uid', verificarTokenBasico, AuthController.getUserInfo);
router.get('/me', verificarTokenBasico, AuthController.getCurrentUser);

export default router;
