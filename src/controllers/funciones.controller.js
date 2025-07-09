import * as service from '../services/funciones.service.js';

export const getAll = async (req, res) => {
    try {
        const data = await service.getAllFunciones();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getById = async (req, res) => {
    try {
        const data = await service.getFuncionById(req.params.id);
        if (!data) return res.status(404).json({ error: 'Funcion no encontrada' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const create = async (req, res) => {
    try {
        const data = await service.createFuncion(req.body);
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const update = async (req, res) => {
    const id = parseInt(req.params.id);
    const { id_pelicula, id_sala, fecha_hora_inicio, precio_funcion, id_idioma, trailer_url, estado, fecha_hora_fin } = req.body;

    if (isNaN(id) || !id_pelicula || !id_sala || !fecha_hora_inicio || !precio_funcion || !id_idioma || !trailer_url || !estado || !fecha_hora_fin) {
        return res.status(400).json({ error: 'ID o datos inválidos' });
    }

    try {
        const actualizado = await service.updateFuncion(id, { id_pelicula, id_sala, fecha_hora_inicio, precio_funcion, id_idioma, trailer_url, estado, fecha_hora_fin });
        if (!actualizado) {
            return res.status(404).json({ error: 'Función no encontrada' });
        }

        res.status(200).json({
            mensaje: 'Función actualizada correctamente',
            funcion: actualizado,
        });
    } catch (err) {
        console.error('Error al actualizar función:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
export const remove = async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const eliminado = await service.deleteFuncion(id);
        if (!eliminado) {
            return res.status(404).json({ error: 'Función no encontrada' });
        }

        res.status(200).json({
            mensaje: 'Función eliminada correctamente',
            funcion: eliminado,
        });
    } catch (err) {
        console.error('Error al eliminar función:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const getByPeliculaId = async (req, res) => {
    try {
        const data = await service.getFuncionesByPeliculaId(req.params.id);
        if (!data || data.length === 0) return res.status(404).json({ error: 'No se encontraron funciones para esta película' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};