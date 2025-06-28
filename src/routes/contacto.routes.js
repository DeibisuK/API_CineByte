import { Router } from 'express';
import { enviarContacto } from '../controllers/contacto.controller.js';

const router = Router();

router.post('/', enviarContacto);

export default router;