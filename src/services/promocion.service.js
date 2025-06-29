import * as model from '../models/promocion.model.js';

export const getAllPromociones = async () => {
    return await model.findAll();
};

export const getPromocionById = async (id) => {
    return await model.findById(id);
};

export const createPromocion = async (data) => {
    return await model.insert(data);
};

export const updatePromocion = async (id, data) => {
    return await model.update(id, data);
};

export const deletePromocion = async (id) => {
    return await model.remove(id);
};

export const getActivePromociones = async () => {
    return await model.findActive();
};

export const validatePromoCode = async (codigo) => {
    return await model.validateCoupon(codigo);
};