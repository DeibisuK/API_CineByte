import { crearSede as crearSedeModel, listarSedes as listarSedesModel,
  editarSede as editarSedeService,
  eliminarSede as eliminarSedeService,
  getSedeById as getSedeByIdModel
 } from '../models/sede.model.js';

export const crearSede = async (datosSede) => {
  return await crearSedeModel(datosSede);
};

export const getAllSedes = async () => {
  return await listarSedesModel();
};

export const getSedeById = async (id_sede) => {
  return await getSedeByIdModel(id_sede);
};

export const editarSede = async (id_sede, datos) => {
  return await editarSedeService(id_sede, datos);
};

export const eliminarSede = async (id_sede) => {
  return await eliminarSedeService(id_sede);
};