import * as model from '../models/genero.model.js';

export const getAllGeneros = async () => {
  return await model.findAll();
};

export const getGeneroById = async (id) => {
  return await model.findById(id);
};

export const createGenero = async (data) => {
  return await model.insert(data);
};

export const updateGenero = async (id, data) => {
  const existente = await model.findById(id);
  if (!existente) return null;
  return await model.update(id, data);
};

export const deleteGenero = async (id) => {
  const tieneAsociaciones = await model.tienePeliculasAsociadas(id);
  if (tieneAsociaciones) return null; // Bloquea si hay asociaciones
  return await model.remove(id);
};

