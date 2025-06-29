import express from 'express';
import { asignarAdmin } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/asignar-admin', asignarAdmin);

export default router; // ✅ exportación por defecto
