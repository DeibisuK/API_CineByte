import * as service from '../services/idiomas.service.js';

export const getAll = async (req, res) => {
    try {
        const data = await service.getAllIdiomas();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getById = async (req, res) => {
  try {
    const data = await service.getIdiomaById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Idioma no encontrado' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = await service.createIdioma(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const data = await service.updateIdioma(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    await service.deleteIdioma(req.params.id);
    res.json({ message: 'Idioma eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};