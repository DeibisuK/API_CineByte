import db from '../config/db.js';

export const crearSede = async ({
  nombre,
  id_ciudad,
  direccion,
  estado = 'Activo',
  latitud,
  longitud,
  telefono,
  email
}) => {
  const query = `
    INSERT INTO sedes (
      nombre, id_ciudad, direccion, estado,
      latitud, longitud, telefono, email
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *;
  `;
  const values = [nombre, id_ciudad, direccion, estado, latitud, longitud, telefono, email];
  const result = await db.query(query, values);
  return result.rows[0];
};