import {
  crearSede as crearSedeService,
  getAllSedes,
  editarSede as editarSedeService,
  eliminarSede as eliminarSedeService,
  getSedeById as getSedeByIdService
} from '../services/sede.service.js';

export const crearSede = async (req, res) => {
  try {
    const sedeCreada = await crearSedeService(req.body);
    res.status(201).json(sedeCreada);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al crear la sede' });
  }
};

export const listarSedes = async (req, res) => {
  try {
    const sedes = await getAllSedes();
    res.json(sedes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener sedes' });
  }
};

export const obtenerSedePorId = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const sede = await getSedeByIdService(id);
    if (sede) {
      res.json(sede);
    } else {
      res.status(404).json({ mensaje: 'Sede no encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la sede' });
  }
};

export const editarSede = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const sedeEditada = await editarSedeService(id, req.body);
    if (sedeEditada) {
      res.json(sedeEditada);
    } else {
      res.status(404).json({ mensaje: 'Sede no encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al editar la sede' });
  }
};

export const eliminarSede = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const sedeEliminada = await eliminarSedeService(id);
    if (sedeEliminada) {
      res.json({ mensaje: 'Sede eliminada', sede: sedeEliminada });
    } else {
      res.status(404).json({ mensaje: 'Sede no encontrada' });
    }
  } catch (err) {
    console.error('Error en eliminarSede:', err);
    res.status(500).json({ error: 'Error al eliminar la sede' });
  }
};