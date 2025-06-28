import * as service from '../services/paises.service.js'


export const getAll = async (req, res) => {
  try {
    const data = await service.getAllPais();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const data = await service.getPaisById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Pais no encontrada' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = await service.createPais(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre } = req.body;

  if (isNaN(id) || !nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'ID o nombre inválido' });
  }

  try {
    const actualizado = await service.updatePais(id, { nombre });
    if (!actualizado) {
      return res.status(404).json({ error: 'Pais no encontrada' });
    }

    res.status(200).json({
      mensaje: 'Pais actualizada correctamente',
      etiqueta: actualizado,
    });
  } catch (err) {
    console.error('Error al actualizar el pais:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const remove = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const etiquetaEliminado = await service.deletePais(id);

    if (etiquetaEliminado === null) {
      return res.status(400).json({
        error: 'No se puede eliminar el pais porque tiene actor o distribuidor asociadas.'
      });
    }
    res.status(200).json({
      mensaje: 'Pais eliminada correctamente',
      genero: etiquetaEliminado
    });
  } catch (err) {
    console.error('Error en la eliminación:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};