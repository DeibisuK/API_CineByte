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
  const id = parseInt(req.params.id);
  const { nombre } = req.body;

  if (isNaN(id) || !nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'ID o nombre inválido' });
  }

  try {
    const actualizado = await service.updateEtiquetas(id, { nombre });
    if (!actualizado) {
      return res.status(404).json({ error: 'Etiqueta no encontrada' });
    }

    res.status(200).json({
      mensaje: 'Etiqueta actualizada correctamente',
      etiqueta: actualizado,
    });
  } catch (err) {
    console.error('Error al actualizar la etiqueta:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const remove = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const etiquetaEliminado = await service.deleteEtiquetas(id);

    if (etiquetaEliminado === null) {
      return res.status(400).json({
        error: 'No se puede eliminar la etiqueta porque tiene películas asociadas.'
      });
    }
    res.status(200).json({
      mensaje: 'Etiqueta eliminada correctamente',
      genero: etiquetaEliminado
    });
  } catch (err) {
    console.error('Error en la eliminación:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};