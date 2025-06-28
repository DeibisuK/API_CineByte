import { crearSede as crearSedeService } from '../services/sede.service.js';

export const crearSede = async (req, res) => {
  try {
    const sedeCreada = await crearSedeService(req.body);
    res.status(201).json(sedeCreada);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al crear la sede' });
  }
};