import * as model from '../models/funciones.model.js';

export const getAllFunciones = async () => {
    return await model.findAll();
};

export const getFuncionById = async (id) => {
    return await model.findById(id);
};

export const createFuncion = async (data) => {
    return await model.insert(data);
};

export const updateFuncion = async (id, data) => {
    const existente = await model.findById(id);
    if (!existente) return null;
    return await model.update(id, data);
};

export const deleteFuncion = async (id) => {
    return await model.remove(id);
};

