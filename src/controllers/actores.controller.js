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
    const data = await service.createActor(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const data = await service.updateActor(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    await service.deleteActor(req.params.id);
    res.json({ message: 'Actor eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};