import {insert,update,remove,findAll,findById,findByEstado,obtenerAsientosPorSala
} from '../models/sala.model.js';

export const createSala = async (datosSala) => {
  return await insert(datosSala);
};

export const getAllSalas = async () => {
  return await findAll();
};

export const getSalaById = async (id_sala) => {
  return await findById(id_sala);
};

export const updateSala = async (id_sala, datos) => {
  return await update(id_sala, datos);
};

export const deleteSala = async (id_sala) => {
  return await remove(id_sala);
};
export const getAsientos = async (id_sala) => {
  return await obtenerAsientosPorSala(id_sala);
};

export const getSalasByEstado = async (estado) => {
    return await findByEstado(estado);
};