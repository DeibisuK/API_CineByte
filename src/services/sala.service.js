import {insert,update,remove,findAll,findById,obtenerAsientosPorSala
} from '../models/salas.model.js';

export const createSala = async (datosSala) => {
  return await insert(datosSala);
};

export const getAllSalas = async () => {
  return await findAll();
};

export const getSalaById = async (id) => {
  return await findById(id);
};

export const updateSala = async (id, datos) => {
  return await update(id, datos);
};

export const deleteSala = async (id) => {
  return await remove(id);
};
export const getAsientos = async (id) => {
  return await obtenerAsientosPorSala(id);
};