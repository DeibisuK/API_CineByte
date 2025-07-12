import * as service from '../services/sede_salas.service.js';

export const getAll = async (req, res) => {
    try {
        const data = await service.getAllSedesSalas();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getById = async (req, res) => {
    try {
        const data = await service.getSedeSalaById(req.params.id);
        if (!data) return res.status(404).json({ error: 'Asignación sede-sala no encontrada' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getBySede = async (req, res) => {
    try {
        const data = await service.getSalasBySede(req.params.id_sede);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getBySala = async (req, res) => {
    try {
        const data = await service.getSedesBySala(req.params.id_sala);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const create = async (req, res) => {
    try {
        const { id_sede, id_sala, nombre, estado } = req.body;

        if (!id_sede || !id_sala) {
            return res.status(400).json({ error: 'ID de sede e ID de sala son requeridos' });
        }

        const data = await service.createSedeSala({
            id_sede,
            id_sala,
            nombre,
            estado
        });

        res.status(201).json(data);
    } catch (err) {
        if (err.message.includes('ya está asignada')) {
            return res.status(409).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

export const createMultiple = async (req, res) => {
    try {
        const { sedes_salas } = req.body;

        if (!Array.isArray(sedes_salas) || sedes_salas.length === 0) {
            return res.status(400).json({ error: 'Se requiere un array de asignaciones sede-sala' });
        }

        // Validar que cada elemento tenga los campos requeridos
        for (const item of sedes_salas) {
            if (!item.id_sede || !item.id_sala) {
                return res.status(400).json({ error: 'Cada asignación debe tener ID de sede e ID de sala' });
            }
        }

        const data = await service.createMultipleSedesSalas(sedes_salas);
        res.status(201).json(data);
    } catch (err) {
        if (err.message.includes('ya está asignada')) {
            return res.status(409).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_sede, id_sala, nombre, estado } = req.body;

        if (!id_sede || !id_sala) {
            return res.status(400).json({ error: 'ID de sede e ID de sala son requeridos' });
        }

        const data = await service.updateSedeSala(id, {
            id_sede,
            id_sala,
            nombre,
            estado
        });

        if (!data) {
            return res.status(404).json({ error: 'Asignación sede-sala no encontrada' });
        }

        res.json(data);
    } catch (err) {
        if (err.message.includes('ya está asignada')) {
            return res.status(409).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

export const remove = async (req, res) => {
    try {
        const result = await service.deleteSedeSala(req.params.id);
        if (result === null) {
            return res.status(404).json({ error: 'Asignación sede-sala no encontrada' });
        }
        res.json({ message: 'Asignación sede-sala eliminada correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const removeMultiple = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Se requiere un array de IDs' });
        }

        await service.deleteMultipleSedesSalas(ids);
        res.json({ message: 'Asignaciones sede-sala eliminadas correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getSalasDisponibles = async (req, res) => {
    try {
        const data = await service.getSalasDisponibles();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getSedesDisponibles = async (req, res) => {
    try {
        const data = await service.getSedesDisponibles(req.params.id_sala);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const checkSalaAssigned = async (req, res) => {
    try {
        const data = await service.checkSalaAssigned(req.params.id_sala);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
