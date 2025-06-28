import * as model from '../models/pais.model.js';

export const getAllPais = async () => {
  return await model.findAll();
};

export const getPaisById = async (id) => {
  return await model.findById(id);
};

export const createPais = async (data) => {
  return await model.insert(data);
};

export const updatePais = async (id, data) => {
  const existente = await model.findById(id);
  if (!existente) return null;
  return await model.update(id, data);
};

export const deletePais = async (id) => {
  const tieneAsociaciones = await model.estaAsociado(id);
    if (tieneAsociaciones) return null; // Bloquea si hay asociaciones
    return await model.remove(id);
};
