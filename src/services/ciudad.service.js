import Ciudad from '../models/ciudad.model.js';

const CiudadService = {
  obtenerTodas: async () => {
    return await Ciudad.getTodas();
  }
};

export default CiudadService;
