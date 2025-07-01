import express from 'express';
import { asignarAdmin, listarUsuarios, eliminarUsuario, removerAdmin,crearUsuarioAdmin,editarUsuario } from '../controllers/user.controller.js';
import { verificarTokenAdmin } from '../middlewares/auth.middleware.js';


const router = express.Router();

router.post('/crear-admin', verificarTokenAdmin, crearUsuarioAdmin);
router.post('/add-admin', verificarTokenAdmin, asignarAdmin);
router.post('/delete-admin', verificarTokenAdmin, removerAdmin);
router.get('/', verificarTokenAdmin, listarUsuarios);
router.delete('/:id', verificarTokenAdmin, eliminarUsuario);
router.put('/:uid', verificarTokenAdmin, editarUsuario);


export default router;
