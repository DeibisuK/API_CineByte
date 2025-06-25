import * as model from '../models/idiomas.model.js';

export const getAllIdiomas = async () => {
  return await model.findAll();
};

export const getIdiomaById = async (id) => {
  return await model.findById(id);
};

export const createIdioma = async (data) => {
  return await model.insert(data);
};

export const updateIdioma = async (id, data) => {
  return await model.update(id, data);
};

export const deleteIdioma = async (id) => {
  return await model.remove(id);
};
