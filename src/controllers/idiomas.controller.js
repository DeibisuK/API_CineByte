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


  const id = parseInt(req.params.id);
  const { nombre } = req.body;

  if (isNaN(id) || !nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'ID o nombre inválido' });
  }

  try {
    const actualizado = await service.updateIdioma(id, { nombre });
    if (!actualizado) {
      return res.status(404).json({ error: 'Idioma no encontrado' });
    }

    res.status(200).json({
      mensaje: 'Idioma actualizado correctamente',
      genero: actualizado,
    });
  } catch (err) {
    console.error('Error al actualizar idioma:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const remove = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const idiomaEliminado = await service.deleteIdioma(id);

    if (idiomaEliminado === null) {
      return res.status(400).json({
        error: 'No se puede eliminar el idioma porque tiene películas asociadas.'
      });
    }

    res.status(200).json({
      mensaje: 'Idioma eliminado correctamente',
      genero: idiomaEliminado
    });
  } catch (err) {
    console.error('Error en la eliminación:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};