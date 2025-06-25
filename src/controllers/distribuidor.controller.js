import * as service from '../services/distribuidor.service.js';

export const getAll = async (req, res) => {
    try {
        const data = await service.getAllDistribuidor();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getById = async (req, res) => {
  try {
    const data = await service.getDistribuidorById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Distribuidor no encontrado' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = await service.createDistribuidor(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const data = await service.updateDistribuidor(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    await service.deleteDistribuidor(req.params.id);
    res.json({ message: 'Distribuidor eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};