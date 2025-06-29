import * as service from '../services/promocion.service.js';

export const getAll = async (req, res) => {
    try {
        const data = await service.getAllPromociones();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getById = async (req, res) => {
    try {
        const data = await service.getPromocionById(req.params.id);
        if (!data) return res.status(404).json({ error: 'Promoción no encontrada' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const create = async (req, res) => {
    try {
        const {
            imagen_url,
            titulo,
            descripcion,
            tipo_promocion,
            fecha_inicio,
            fecha_fin,
            url_link,
            estado,
            porcentaje_descuento,
            nro_boletos,
            codigo_cupon,
            dia_valido
        } = req.body;

        const data = await service.createPromocion({
            imagen_url,
            titulo,
            descripcion,
            tipo_promocion,
            fecha_inicio,
            fecha_fin,
            url_link,
            estado,
            porcentaje_descuento,
            nro_boletos,
            codigo_cupon,
            dia_valido
        });

        res.status(201).json(data);
    } catch (err) {
        console.error('Error al crear promoción:', err);
        res.status(500).json({ error: err.message });
    }
};

export const update = async (req, res) => {
    try {
        const data = await service.updatePromocion(req.params.id, req.body);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const remove = async (req, res) => {
    try {
        await service.deletePromocion(req.params.id);
        res.json({ message: 'Promoción eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getActive = async (req, res) => {
    try {
        const data = await service.getActivePromociones();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const validateCode = async (req, res) => {
    try {
        const data = await service.validatePromoCode(req.params.codigo);
        if (!data) return res.status(404).json({ valid: false, message: 'Cupón no válido' });
        res.json({ valid: true, promocion: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};