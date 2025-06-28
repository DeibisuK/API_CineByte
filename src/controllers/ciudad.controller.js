import CiudadService from '../services/ciudad.service.js';

const CiudadController = {
  listar: async (req, res) => {
    try {
      const ciudades = await CiudadService.obtenerTodas();
      res.json(ciudades);
    } catch (error) {
      console.error('Error al obtener ciudades:', error);
      res.status(500).json({ error: 'Error al obtener ciudades' });
    }
  }
};

export default CiudadController;