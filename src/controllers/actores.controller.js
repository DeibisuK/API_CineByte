import * as service from '../services/actores.service.js';

export const getAll = async (req, res) => {
    try {
        const data = await service.getAllActores();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getById = async (req, res) => {
  try {
    const data = await service.getActorById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Actor no encontrado' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { nombre, apellidos, fecha_nacimiento, id_nacionalidad } = req.body;
    if (!nombre || !apellidos || !fecha_nacimiento || !id_nacionalidad) {
      return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }
    const data = await service.createActor(req.body);
    res.status(201).json(data);
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Ya existe un actor con esos datos.' });
    }
    if (err.code === '23503') { // Foreign key violation
      return res.status(400).json({ error: 'La nacionalidad seleccionada no existe.' });
    }
    return res.status(500).json({ error: 'Error al crear el actor.' });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID de actor inválido.' });
    }
    const { nombre, apellidos, fecha_nacimiento, id_nacionalidad } = req.body;
    if (!nombre || !apellidos || !fecha_nacimiento || !id_nacionalidad) {
      return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }
    const data = await service.updateActor(id, req.body);
    res.json(data);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un actor con esos datos.' });
    }
    if (err.code === '23503') {
      return res.status(400).json({ error: 'La nacionalidad seleccionada no existe.' });
    }
    return res.status(500).json({ error: 'Error al actualizar el actor.' });
  }
};

export const remove = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID de actor inválido.' });
    }
    await service.deleteActor(id);
    res.json({ message: 'Actor eliminado' });
  } catch (err) {
    const errorMsg = (err.message || err.detail || err.toString() || '').toLowerCase();
    if (errorMsg.includes('violates foreign key constraint')) {
      return res.status(400).json({ error: 'No se puede eliminar el actor porque está siendo utilizado en otra tabla.' });
    }
    if (err.code === '22P02') {
      return res.status(400).json({ error: 'ID de actor inválido.' });
    }
    return res.status(500).json({ error: 'Error al eliminar el actor.' });
  }
};