import * as service from '../services/anuncio.service.js';

export const getAll = async (req, res) => {
    try {
        const data = await service.getAllAnuncios();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getById = async (req, res) => {
    try {
        const data = await service.getAnuncioById(req.params.id);
        if (!data) return res.status(404).json({ error: 'Anuncio no encontrado' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getActivos = async (req, res) => {
    try {
        const data = await service.getAnunciosActivos();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const create = async (req, res) => {
    try {
        const data = await service.createAnuncio(req.body);
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const update = async (req, res) => {
    try {
        const data = await service.updateAnuncio(req.params.id, req.body);
        if (!data) return res.status(404).json({ error: 'Anuncio no encontrado' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateEstado = async (req, res) => {
    try {
        const data = await service.updateEstadoAnuncio(req.params.id, req.body.estado);
        if (!data) return res.status(404).json({ error: 'Anuncio no encontrado' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const remove = async (req, res) => {
    try {
        await service.deleteAnuncio(req.params.id);
        res.json({ message: 'Anuncio eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};