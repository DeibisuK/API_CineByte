import db from '../config/db.js';

export const crearSede = async ({
  nombre,
  direccion,
  estado = 'Activo',
  latitud,
  longitud,
  telefono,
  email,ciudad
}) => {
  const query = `
    INSERT INTO sedes (
      nombre, direccion, estado,
      latitud, longitud, telefono, email,ciudad
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *;
  `;
  const values = [nombre, direccion, estado, latitud, longitud, telefono, email,ciudad];
  const result = await db.query(query, values);
  return result.rows[0];
};

export const listarSedes = async () => {
  const query = 'SELECT * FROM sedes ORDER BY id_sede';
  const result = await db.query(query);
  return result.rows;
};

export const getSedeById = async (id_sede) => {
  const query = 'SELECT * FROM sedes WHERE id_sede = $1';
  const result = await db.query(query, [id_sede]);
  return result.rows[0];
};

export const editarSede = async (id_sede, datos) => {
  const { nombre, direccion, estado, latitud, longitud, telefono, email,ciudad } = datos;
  const query = `
    UPDATE sedes SET
      nombre = $1,
      direccion = $2,
      estado = $3,
      latitud = $4,
      longitud = $5,
      telefono = $6,
      email = $7,      
      ciudad = $8,
    WHERE id_sede = $9
    RETURNING *;
  `;
  const values = [nombre, direccion, estado, latitud, longitud, telefono, email,ciudad, id_sede];
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