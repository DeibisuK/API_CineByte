import * as service from '../services/peliculas.service.js';

export const getAll = async (req, res) => {
    try {
        const data = await service.getAllPeliculas();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getById = async (req, res) => {
  try {
    const data = await service.getPeliculaById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Pelicula no encontrada' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = await service.createPelicula(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const data = await service.updatePelicula(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    await service.deletePelicula(req.params.id);
    res.json({ message: 'Pelicula eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};