import * as model from '../models/sede_salas.model.js';

export const getAllSedesSalas = async () => {
    return await model.findAll();
};

export const getSedeSalaById = async (id) => {
    return await model.findById(id);
};

export const getSalasBySede = async (id_sede) => {
    return await model.findBySede(id_sede);
};

export const getSedesBySala = async (id_sala) => {
    return await model.findBySala(id_sala);
};

export const createSedeSala = async (data) => {
    // Verificar si ya existe la asignación
    const existingAssignment = await model.checkExistingAssignment(data.id_sede, data.id_sala);
    if (existingAssignment) {
        throw new Error('Esta sala ya está asignada a esta sede');
    }
    return await model.insert(data);
};

export const createMultipleSedesSalas = async (sedes_salas) => {
    // Verificar duplicados antes de insertar
    for (const item of sedes_salas) {
        const existingAssignment = await model.checkExistingAssignment(item.id_sede, item.id_sala);
        if (existingAssignment) {
            throw new Error(`La sala ${item.id_sala} ya está asignada a la sede ${item.id_sede}`);
        }
    }
    return await model.insertMultiple(sedes_salas);
};

export const updateSedeSala = async (id, data) => {
    const existente = await model.findById(id);
    if (!existente) return null;
    
    // Si se están cambiando los IDs, verificar que no exista la nueva combinación
    if (data.id_sede !== existente.id_sede || data.id_sala !== existente.id_sala) {
        const existingAssignment = await model.checkExistingAssignment(data.id_sede, data.id_sala);
        if (existingAssignment && existingAssignment.id_sede_sala !== id) {
            throw new Error('Esta sala ya está asignada a esta sede');
        }
    }
    
    return await model.update(id, data);
};

export const deleteSedeSala = async (id) => {
    const existente = await model.findById(id);
    if (!existente) return null;
    return await model.remove(id);
};

export const deleteMultipleSedesSalas = async (ids) => {
    return await model.removeMultiple(ids);
};

export const getSalasDisponibles = async (id_sede) => {
    return await model.getSalasDisponibles(id_sede);
};

export const getSedesDisponibles = async (id_sala) => {
    return await model.getSedesDisponibles(id_sala);
};
