import db from '../config/db.js';

const Ciudad = {
  getTodas: async () => {
    const query = 'SELECT id_ciudad, nombre FROM ciudades ORDER BY nombre';
    const result = await db.query(query);
    return result.rows;
  }
};

export default Ciudad;