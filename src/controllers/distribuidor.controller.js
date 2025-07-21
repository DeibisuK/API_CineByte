import * as service from '../services/distribuidor.service.js';

export const getAll = async (req, res) => {
    try {
        const data = await service.getAllDistribuidor();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los distribuidores.' });
    }
};

export const getById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID de distribuidor inválido.' });
    }
    const data = await service.getDistribuidorById(id);
    if (!data) return res.status(404).json({ error: 'Distribuidor no encontrado.' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el distribuidor.' });
  }
};

export const create = async (req, res) => {
  try {
    const { nombre, direccion, telefono } = req.body;
    if (!nombre || !direccion || !telefono) {
      return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }
    const data = await service.createDistribuidor(req.body);
    res.status(201).json(data);
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Ya existe un distribuidor con esos datos.' });
    } else if (err.code === '23503') { // Foreign key violation
      res.status(400).json({ error: 'Algún dato relacionado no existe.' });
    } else {
      res.status(500).json({ error: 'Error al crear el distribuidor.' });
    }
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID de distribuidor inválido.' });
    }
    const { nombre, direccion, telefono } = req.body;
    if (!nombre || !direccion || !telefono) {
      return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }
    const data = await service.updateDistribuidor(id, req.body);
    res.json(data);
  } catch (err) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'Ya existe un distribuidor con esos datos.' });
    } else if (err.code === '23503') {
      res.status(400).json({ error: 'Algún dato relacionado no existe.' });
    } else {
      res.status(500).json({ error: 'Error al actualizar el distribuidor.' });
    }
  }
};

export const remove = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID de distribuidor inválido.' });
    }
    await service.deleteDistribuidor(id);
    res.json({ message: 'Distribuidor eliminado' });
  } catch (err) {
    // Log para depuración
    console.error('Error al eliminar distribuidor:', err);
    const errorMsg = (err.message || err.detail || err.toString() || '').toLowerCase();
    if (errorMsg.includes('violates foreign key constraint')) {
      return res.status(400).json({ error: 'No se puede eliminar el distribuidor porque está siendo utilizado en otra tabla.' });
    }
    if (err.code === '22P02') {
      return res.status(400).json({ error: 'ID de distribuidor inválido.' });
    }
    return res.status(500).json({ error: 'Error al eliminar el distribuidor.' });
  }
};