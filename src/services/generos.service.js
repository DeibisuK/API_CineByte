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
  return await model.update(id, data);
};

export const deleteGenero = async (id) => {
  return await model.remove(id);
};
