import * as model from '../models/pelicula.model.js';

export const getAllPeliculas = async () => {
  return await model.findAll();
};

export const getPeliculaById = async (id) => {
  return await model.findById(id);
};

export const createPelicula = async (data) => {
  return await model.insert(data);
};

export const updatePelicula = async (id, data) => {
  return await model.update(id, data);
};

export const deletePelicula = async (id) => {
  return await model.remove(id);
};
