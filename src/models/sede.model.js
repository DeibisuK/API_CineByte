import db from '../config/db.js';

export const crearSede = async ({
  nombre,
  ciudad,
  direccion,
  estado = 'Activo',
  latitud,
  longitud,
  telefono,
  email
}) => {
  const query = `
    INSERT INTO sedes (
      nombre, ciudad, direccion, estado,
      latitud, longitud, telefono, email
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *;
  `;
  const values = [nombre, ciudad, direccion, estado, latitud, longitud, telefono, email];
  const result = await db.query(query, values);
  return result.rows[0];
};

export const listarSedes = async () => {
  const query = 'SELECT * FROM sedes ORDER BY ciudad';
  const result = await db.query(query);
  return result.rows;
};

export const getSedeById = async (id_sede) => {
  const query = 'SELECT * FROM sedes WHERE id_sede = $1';
  const result = await db.query(query, [id_sede]);
  return result.rows[0];
};

export const editarSede = async (id_sede, datos) => {
  const { nombre, ciudad, direccion, estado, latitud, longitud, telefono, email } = datos;
  const query = `
    UPDATE sedes SET
      nombre = $1,
      ciudad = $2,
      direccion = $3,
      estado = $4,
      latitud = $5,
      longitud = $6,
      telefono = $7,
      email = $8
    WHERE id_sede = $9
    RETURNING *;
  `;
  const values = [nombre, ciudad, direccion, estado, latitud, longitud, telefono, email, id_sede];
  const result = await db.query(query, values);
  return result.rows[0];
};

export const eliminarSede = async (id_sede) => {
  try {
    const query = 'DELETE FROM sedes WHERE id_sede = $1 RETURNING *;';
    const result = await db.query(query, [id_sede]);
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};