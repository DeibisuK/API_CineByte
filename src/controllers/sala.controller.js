import * as service from '../services/sala.service.js';

export const create = async (req, res) => {
  try {
    const sala = req.body;

    // Validación: cantidad_asientos debe ser par
    if (sala.cantidad_asientos % 2 !== 0) {
      return res.status(400).json({ mensaje: 'La cantidad de asientos debe ser par' });
    }

    const salaCreada = await service.createSala(sala);
    res.status(201).json(salaCreada);
  } catch (err) {
    console.error('Error al crear sala:', err);
    res.status(500).json({ mensaje: 'Error al crear la sala' });
  }
};

export const getAll = async (req, res) => {
  try {
    const salas = await service.getAllSalas();
    res.json(salas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener salas' });
  }
};

export const getById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const sala = await service.getSalaById(id);
    if (sala) {
      res.json(sala);
    } else {
      res.status(404).json({ mensaje: 'Sala no encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la sala' });
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, cantidad_asientos } = req.body;
    if (!nombre || !cantidad_asientos) {
      return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }
    if (cantidad_asientos % 2 !== 0) {
      return res.status(400).json({ error: 'La cantidad de asientos debe ser par.' });
    }
    const salaEditada = await service.updateSala(id, req.body);
    if (salaEditada) {
      res.json(salaEditada);
    } else {
      res.status(404).json({ error: 'Sala no encontrada.' });
    }
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una sala con ese nombre.' });
    }
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Algún dato relacionado no existe.' });
    }
    return res.status(500).json({ error: 'Error al editar la sala.' });
  }
};

export const remove = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID de sala inválido.' });
    }
    await service.deleteSala(id);
    res.json({ message: 'Sala eliminada' });
  } catch (err) {
    const errorMsg = (err.message || err.detail || err.toString() || '').toLowerCase();
    if (errorMsg.includes('violates foreign key constraint')) {
      return res.status(400).json({ error: 'No se puede eliminar la sala porque está siendo utilizada en otra tabla.' });
    }
    if (err.code === '22P02') {
      return res.status(400).json({ error: 'ID de sala inválido.' });
    }
    return res.status(500).json({ error: 'Error al eliminar la sala.' });
  }
};
export const getAsientosPorSala = async (req, res) => {
  const { id } = req.params;
  try {
    const asientos = await service.getAsientos(id);
    res.json(asientos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los asientos de la sala' });
  }
};