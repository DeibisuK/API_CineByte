import { crearSede as crearSedeModel } from '../models/sede.model.js';

export const crearSede = async (datosSede) => {
  return await crearSedeModel(datosSede);
};