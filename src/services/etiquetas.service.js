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
  const existente = await model.findById(id);
  if (!existente) return null;
  return await model.update(id, data);
};

export const deleteEtiquetas = async (id) => {
  const tieneAsociaciones = await model.tienePeliculasAsociadas(id);
    if (tieneAsociaciones) return null; // Bloquea si hay asociaciones
    return await model.remove(id);
};
