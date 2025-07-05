import * as service from '../services/salas.service.js';

export const getAll = async (req, res) => {
    try {
        const data = await service.getAllSalas();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getById = async (req, res) => {
    try {
        const data = await service.getSalaById(req.params.id);
        if (!data) return res.status(404).json({ error: 'Sala no encontrada' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const create = async (req, res) => {
    try {
        const { nombre, cantidad_asientos, tipo_sala, estado } = req.body;

        if (!nombre || !cantidad_asientos || !tipo_sala) {
            return res.status(400).json({ error: 'Nombre, cantidad_asientos y tipo de sala son requeridos' });
        }

        const data = await service.createSala({
            nombre,
            cantidad_asientos,
            tipo_sala,
            estado
        });

        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, cantidad_asientos, tipo_sala, estado } = req.body;

        if (!nombre || !cantidad_asientos || !tipo_sala) {
            return res.status(400).json({ error: 'Nombre, cantidad_asientos y tipo de sala son requeridos' });
        }

        const data = await service.updateSala(id, {
            nombre,
            cantidad_asientos,
            tipo_sala,
            estado
        });

        if (!data) {
            return res.status(404).json({ error: 'Sala no encontrada' });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const remove = async (req, res) => {
    try {
        const result = await service.deleteSala(req.params.id);
        if (result === null) {
            return res.status(404).json({ error: 'Sala no encontrada' });
        }
        res.json({ message: 'Sala eliminada correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getByEstado = async (req, res) => {
    try {
        const data = await service.getSalasByEstado(req.params.estado);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
