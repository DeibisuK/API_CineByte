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
  const id = parseInt(req.params.id);
  const { nombre } = req.body;

  if (isNaN(id) || !nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'ID o nombre inválido' });
  }

  try {
    const actualizado = await service.updateGenero(id, { nombre });

    if (!actualizado) {
      return res.status(404).json({ error: 'Género no encontrado' });
    }

    res.status(200).json({
      mensaje: 'Género actualizado correctamente',
      genero: actualizado,
    });
  } catch (err) {
    console.error('Error al actualizar género:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const remove = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const generoEliminado = await service.deleteGenero(id);

    if (generoEliminado === null) {
      return res.status(400).json({
        error: 'No se puede eliminar el género porque tiene películas asociadas.'
      });
    }

    res.status(200).json({
      mensaje: 'Género eliminado correctamente',
      genero: generoEliminado
    });
  } catch (err) {
    console.error('Error en la eliminación:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getFilms = async (req, res) => {
  try {
    const generoId = parseInt(req.params.id);
    if (isNaN(generoId)) {
      return res.status(400).json({ error: 'ID de género inválido' });
    }

    const total = await service.getFilmsByGen(generoId);
    res.json({ id_genero: generoId, total_peliculas: total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};