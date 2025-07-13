import * as service from '../services/peliculas.service.js';

export const getAll = async (req, res) => {
  try {
    const data = await service.getAllPeliculas();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllCompletas = async (req, res) => {
  try {
    const data = await service.getAllPeliculasCompletas();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const getById = async (req, res) => {
  try {
    const data = await service.getPeliculaById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Pelicula no encontrada' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getByIdComplete = async (req, res) => {
  try {
    const data = await service.getPeliculaByIdComplete(req.params.id);
    if (!data) return res.status(404).json({ error: 'Pelicula no encontrada' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      duracion_minutos,
      fecha_estreno,
      estado,
      clasificacion,
      imagen,
      id_distribuidor,
      idiomas,
      generos,
      actores,
      etiquetas,
      img_carrusel
    } = req.body;

    const data = await service.createPelicula({
      titulo,
      descripcion,
      duracion_minutos,
      fecha_estreno,
      estado,
      clasificacion,
      imagen,
      id_distribuidor,
      idiomas,
      generos,
      actores,
      etiquetas,
      img_carrusel
    });

    res.status(201).json(data);
  } catch (err) {
    console.error('Error al crear película:', err);
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
 try {
    const {
      titulo,
      descripcion,
      duracion_minutos,
      fecha_estreno,
      estado,
      clasificacion,
      imagen,
      id_distribuidor,
      idiomas,
      generos,
      actores,
      etiquetas,
      img_carrusel
    } = req.body;

    const data = await service.updatePelicula(req.params.id,{
      titulo,
      descripcion,
      duracion_minutos,
      fecha_estreno,
      estado,
      clasificacion,
      imagen,
      id_distribuidor,
      idiomas,
      generos,
      actores,
      etiquetas,
      img_carrusel
    });

    res.status(201).json(data);
  } catch (err) {
    console.error('Error al crear película:', err);
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

export const getAllActores = async (req, res) => {
  try {
    const data = await service.getAllActoresByPeliculaId(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllGeneros = async (req, res) => {
  try {
    const data = await service.getAllGenerosByPeliculaId(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllEtiquetas = async (req, res) => {
  try {
    const data = await service.getAllEtiquetasByPeliculaId(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllIdiomas = async (req, res) => {
  try {
    const data = await service.getAllIdiomasByPeliculaId(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAnioFromPeliculas = async (req, res) => {
  try {
    const data = await service.getAnioFromPeliculas();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};