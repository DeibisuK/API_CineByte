import * as model from '../models/actor.model.js';

export const getAllActores = async () => {
  return await model.findAll();
};

export const getActorById = async (id) => {
  return await model.findById(id);
};

export const createActor = async (data) => {
  return await model.insert(data);
};

export const updateActor = async (id, data) => {
  return await model.update(id, data);
};

export const deleteActor = async (id) => {
  return await model.remove(id);
};
