import express from 'express';
import { crearSede } from '../controllers/sede.controller.js';

const router = express.Router();

router.post('/', crearSede);

export default router;