import * as service from '../services/generos.service.js';

export const getAll = async (req, res) => {
    try {
        const data = await service.getAllGeneros();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getById = async (req, res) => {
  try {
    const data = await service.getGeneroById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Genero no encontrado' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = await service.createGenero(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const data = await service.updateGenero(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    await service.deleteGenero(req.params.id);
    res.json({ message: 'Genero eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};