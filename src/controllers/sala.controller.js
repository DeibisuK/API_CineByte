import {
  crearSala as crearSalaService,
  getAllSalas,
  editarSala as editarSalaService,
  eliminarSala as eliminarSalaService,
  getSalaById as getSalaByIdService,
  getAsientos
} from '../services/sala.service.js';

export const crearSala = async (req, res) => {
  try {
    const sala = req.body;

    // Validación: cantidad_asientos debe ser par
    if (sala.cantidad_asientos % 2 !== 0) {
      return res.status(400).json({ mensaje: 'La cantidad de asientos debe ser par' });
    }

    const salaCreada = await crearSalaService(sala);
    res.status(201).json(salaCreada);
  } catch (err) {
    console.error('Error al crear sala:', err);
    res.status(500).json({ mensaje: 'Error al crear la sala' });
  }
};

export const listarSalas = async (req, res) => {
  try {
    const salas = await getAllSalas();
    res.json(salas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener salas' });
  }
};

export const obtenerSalaPorId = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const sala = await getSalaByIdService(id);
    if (sala) {
      res.json(sala);
    } else {
      res.status(404).json({ mensaje: 'Sala no encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la sala' });
  }
};

export const editarSala = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const salaEditada = await editarSalaService(id, req.body);
    if (salaEditada) {
      res.json(salaEditada);
    } else {
      res.status(404).json({ mensaje: 'Sala no encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al editar la sala' });
  }
};

export const eliminarSala = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const salaEliminada = await eliminarSalaService(id);
    if (salaEliminada) {
      res.json({ mensaje: 'Sala eliminada', sala: salaEliminada });
    } else {
      res.status(404).json({ mensaje: 'Sala no encontrada' });
    }
  } catch (err) {
    console.error('Error al eliminar sala:', err);
    res.status(500).json({ error: 'Error al eliminar la sala' });
  }
};
export const getAsientosPorSala = async (req, res) => {
  const { id } = req.params;
  try {
    const asientos = await getAsientos(id);
    res.json(asientos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los asientos de la sala' });
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