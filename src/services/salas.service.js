import * as model from '../models/salas.model.js';

export const getAllSalas = async () => {
    return await model.findAll();
};

export const getSalaById = async (id) => {
    return await model.findById(id);
};

export const createSala = async (data) => {
    return await model.insert(data);
};

export const updateSala = async (id, data) => {
    const existente = await model.findById(id);
    if (!existente) return null;
    return await model.update(id, data);
};

export const deleteSala = async (id) => {
    const existente = await model.findById(id);
    if (!existente) return null;
    return await model.remove(id);
};

export const getSalasByEstado = async (estado) => {
    return await model.findByEstado(estado);
};
