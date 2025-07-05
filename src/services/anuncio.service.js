import * as model from '../models/anuncio.model.js';

export const getAllAnuncios = async () => {
    return await model.findAll();
};

export const getAnuncioById = async (id) => {
    return await model.findById(id);
};

export const getAnunciosActivos = async () => {
    return await model.findActive();
};

export const createAnuncio = async (data) => {
    return await model.insert(data);
};

export const updateAnuncio = async (id, data) => {
    return await model.update(id, data);
};

export const updateEstadoAnuncio = async (id, estado) => {
    return await model.updateEstado(id, estado);
};

export const deleteAnuncio = async (id) => {
    return await model.remove(id);
};