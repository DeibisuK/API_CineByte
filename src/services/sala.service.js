import {
  crearSala as crearSalaModel,
  listarSalas as listarSalasModel,
  editarSala as editarSalaService,
  eliminarSala as eliminarSalaService,
  getSalaById as getSalaByIdModel,
  obtenerAsientosPorSala
} from '../models/salas.model.js';

export const crearSala = async (datosSala) => {
  return await crearSalaModel(datosSala);
};

export const getAllSalas = async () => {
  return await listarSalasModel();
};

export const getSalaById = async (id_sala) => {
  return await getSalaByIdModel(id_sala);
};

export const editarSala = async (id_sala, datos) => {
  return await editarSalaService(id_sala, datos);
};

export const eliminarSala = async (id_sala) => {
  return await eliminarSalaService(id_sala);
};
export const getAsientos = async (id_sala) => {
  return await obtenerAsientosPorSala(id_sala);
};