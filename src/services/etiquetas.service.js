import * as model from '../models/etiqueta.model.js';

export const getAllEtiquetas = async () => {
  return await model.findAll();
};

export const getEtiquetasById = async (id) => {
  return await model.findById(id);
};

export const createEtiquetas = async (data) => {
  return await model.insert(data);
};

export const updateEtiquetas = async (id, data) => {
  return await model.update(id, data);
};

export const deleteEtiquetas = async (id) => {
  return await model.remove(id);
};
