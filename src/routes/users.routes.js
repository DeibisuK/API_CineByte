import express from 'express';
import { 
  asignarAdmin, 
  listarUsuarios, 
  eliminarUsuario, 
  removerAdmin, 
  crearUsuarioAdmin, 
  editarUsuario, 
  asignarEmpleado, 
  removerEmpleado,
  obtenerUsuario,
  revocarTokens,
  cambiarEstadoUsuario,
  generarCustomToken,
  obtenerUsuarioActual
} from '../controllers/user.controller.js';
import { verificarTokenAdmin, verificarTokenBasico } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rutas que requieren permisos de administrador
router.post('/crear-admin', verificarTokenAdmin, crearUsuarioAdmin);
router.post('/add-admin', verificarTokenAdmin, asignarAdmin);
router.post('/delete-admin', verificarTokenAdmin, removerAdmin);
router.post('/add-employee', verificarTokenAdmin, asignarEmpleado);
router.post('/delete-employee', verificarTokenAdmin, removerEmpleado);
router.get('/', verificarTokenAdmin, listarUsuarios);
router.delete('/:id', verificarTokenAdmin, eliminarUsuario);
router.put('/:uid', verificarTokenAdmin, editarUsuario);
router.post('/:uid/revoke-tokens', verificarTokenAdmin, revocarTokens);
router.patch('/:uid/status', verificarTokenAdmin, cambiarEstadoUsuario);
router.post('/:uid/custom-token', verificarTokenAdmin, generarCustomToken);

// Rutas que requieren autenticación básica
router.get('/me', verificarTokenBasico, obtenerUsuarioActual);
router.get('/:uid', verificarTokenBasico, obtenerUsuario);

export default router;
