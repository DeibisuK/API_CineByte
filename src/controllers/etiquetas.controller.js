import * as service from '../services/etiquetas.service.js'


export const getAll = async (req, res) => {
    try {
        const data = await service.getAllEtiquetas();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getById = async (req, res) => {
  try {
    const data = await service.getEtiquetasById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Etiqueta no encontrada' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = await service.createEtiquetas(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const data = await service.updateEtiquetas(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    await service.deleteEtiquetas(req.params.id);
    res.json({ message: 'Etiquetas eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};