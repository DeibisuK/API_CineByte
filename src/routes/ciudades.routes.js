import express from 'express';
const router = express.Router();
import CiudadController from '../controllers/ciudad.controller.js';

router.get('/', CiudadController.listar);

export default router;