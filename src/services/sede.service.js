import { crearSede as crearSedeModel, listarSedes as listarSedesModel,
  editarSede as editarSedeService,
  eliminarSede as eliminarSedeService 
 } from '../models/sede.model.js';

export const crearSede = async (datosSede) => {
  return await crearSedeModel(datosSede);
};

export const getAllSedes = async () => {
  return await listarSedesModel();
};

export const editarSede = async (id_sede, datos) => {
  return await editarSedeService(id_sede, datos);
};

export const eliminarSede = async (id_sede) => {
  return await eliminarSedeService(id_sede);
};