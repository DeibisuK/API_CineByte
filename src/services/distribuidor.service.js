import * as model from '../models/distribuidora.model.js';

export const getAllDistribuidor = async () => {
  return await model.findAll();
};

export const getDistribuidorById = async (id) => {
  return await model.findById(id);
};

export const createDistribuidor = async (data) => {
  return await model.insert(data);
};

export const updateDistribuidor = async (id, data) => {
  return await model.update(id, data);
};

export const deleteDistribuidor = async (id) => {
  return await model.remove(id);
};
